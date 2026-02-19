// ============================================================
// dataService.js — 数据服务层
//
// 职责：
//   1. 调用 API 获取实时数据
//   2. 将 API 响应转换为 PL_DATA 所用的数据格式
//   3. 将结果写入 PL_DATA（就地替换）
//   4. 向订阅者广播 'status' / 'updated' / 'error' 事件
//   5. 内存缓存 + 定时自动刷新
// ============================================================

const DataService = (() => {
  'use strict';

  // -------------------------------------------------------
  // 运行时状态
  // -------------------------------------------------------
  let _status     = 'idle';  // idle | loading | ready | error | offline
  let _lastUpdate = null;
  let _timer      = null;
  let _callbacks  = [];

  const _cache = Object.create(null);

  // 保存初始静态快照，用于补充 API 没有的详细字段（比赛统计、进球时间线等）
  const STATIC_MATCHES = PL_DATA.matches.map(m => ({ ...m }));
  const STATIC_PLAYERS = PL_DATA.players.map(p => ({ ...p }));

  // -------------------------------------------------------
  // 事件系统
  // -------------------------------------------------------
  function notify(event, payload) {
    _callbacks.forEach(cb => {
      try { cb(event, payload); } catch (_) { /* 忽略订阅者内部错误 */ }
    });
  }

  // -------------------------------------------------------
  // 内存缓存
  // -------------------------------------------------------
  function setCache(key, data) {
    _cache[key] = { data, ts: Date.now() };
  }

  function getCache(key) {
    const c = _cache[key];
    if (!c) return null;
    if (Date.now() - c.ts > CONFIG.CACHE_TTL) return null;
    return c.data;
  }

  // -------------------------------------------------------
  // 工具：API 球队 TLA → PL_DATA 本地 id
  // football-data.org 使用 3 字母缩写（tla），与 PL_DATA.teams[].short 一致
  // -------------------------------------------------------
  function localIdByTla(tla) {
    if (!tla) return null;
    const t = PL_DATA.teams.find(x => x.short === tla);
    return t ? t.id : null;
  }

  // -------------------------------------------------------
  // 国籍 → 旗帜 emoji
  // -------------------------------------------------------
  const FLAG_MAP = {
    'Norway':'🇳🇴','Brazil':'🇧🇷','England':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','France':'🇫🇷',
    'Argentina':'🇦🇷','Belgium':'🇧🇪','Germany':'🇩🇪','Spain':'🇪🇸',
    'Portugal':'🇵🇹','Netherlands':'🇳🇱','Italy':'🇮🇹','Ghana':'🇬🇭',
    'Cameroon':'🇨🇲','Nigeria':'🇳🇬','Senegal':'🇸🇳','Morocco':'🇲🇦',
    'Jamaica':'🇯🇲','Scotland':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Wales':'🏴󠁧󠁢󠁷󠁬󠁳󠁿','Australia':'🇦🇺',
    'South Korea':'🇰🇷','Japan':'🇯🇵','Sweden':'🇸🇪','Denmark':'🇩🇰',
    'Croatia':'🇭🇷','Serbia':'🇷🇸','Poland':'🇵🇱','Algeria':'🇩🇿',
    "Côte d'Ivoire":'🇨🇮','Ivory Coast':'🇨🇮','Ecuador':'🇪🇨',
    'Colombia':'🇨🇴','Uruguay':'🇺🇾','Greece':'🇬🇷','Austria':'🇦🇹',
    'Switzerland':'🇨🇭','Ireland':'🇮🇪','Hungary':'🇭🇺','Slovakia':'🇸🇰',
    'Slovenia':'🇸🇮','Finland':'🇫🇮','Turkey':'🇹🇷','Egypt':'🇪🇬',
    'Tunisia':'🇹🇳','Guinea':'🇬🇳','Congo':'🇨🇩','DR Congo':'🇨🇩',
    'Mali':'🇲🇱','Gabon':'🇬🇦','Burkina Faso':'🇧🇫','Zambia':'🇿🇲',
    'United States':'🇺🇸','Canada':'🇨🇦','Mexico':'🇲🇽','Venezuela':'🇻🇪',
    'Chile':'🇨🇱','Peru':'🇵🇪','Bolivia':'🇧🇴','Paraguay':'🇵🇾',
    'Albania':'🇦🇱','Kosovo':'🇽🇰','Luxembourg':'🇱🇺','Romania':'🇷🇴',
    'Bulgaria':'🇧🇬','Czech Republic':'🇨🇿','Ukraine':'🇺🇦','Russia':'🇷🇺',
  };

  function flagOf(nationality) {
    return FLAG_MAP[nationality] || '🌍';
  }

  // -------------------------------------------------------
  // 近 5 场表现字母（W / D / L）
  // apiTeamId: football-data.org 的数字 team id
  // -------------------------------------------------------
  function buildForm(apiTeamId, allMatches) {
    return allMatches
      .filter(m =>
        m.status === 'FINISHED' &&
        (m.homeTeam.id === apiTeamId || m.awayTeam.id === apiTeamId)
      )
      .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
      .slice(0, 5)
      .map(m => {
        const isHome = m.homeTeam.id === apiTeamId;
        const hg = m.score.fullTime.home;
        const ag = m.score.fullTime.away;
        if (hg === null || ag === null) return 'D';
        const mine = isHome ? hg : ag;
        const opp  = isHome ? ag : hg;
        return mine > opp ? 'W' : mine < opp ? 'L' : 'D';
      });
  }

  // 近 6 场积分累积数组（newest-first，末尾补 0，用于趋势图）
  function buildRecent(apiTeamId, allMatches) {
    const games = allMatches
      .filter(m =>
        m.status === 'FINISHED' &&
        (m.homeTeam.id === apiTeamId || m.awayTeam.id === apiTeamId)
      )
      .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
      .slice(0, 5);

    let cum = 0;
    const pts = [0];
    for (const m of games) {
      const isHome = m.homeTeam.id === apiTeamId;
      const hg = m.score.fullTime.home;
      const ag = m.score.fullTime.away;
      if (hg !== null && ag !== null) {
        const mine = isHome ? hg : ag;
        const opp  = isHome ? ag : hg;
        cum += mine > opp ? 3 : mine === opp ? 1 : 0;
      }
      pts.unshift(cum);
    }
    while (pts.length < 6) pts.unshift(cum);
    return pts.slice(0, 6);
  }

  // -------------------------------------------------------
  // 转换：积分榜
  // API doc: /competitions/{competition}/standings
  // -------------------------------------------------------
  function transformStandings(raw, allMatches) {
    const total = (raw.standings || []).find(s => s.type === 'TOTAL');
    if (!total) return [];

    return total.table.map(row => {
      const localId = localIdByTla(row.team.tla);
      if (!localId) return null;

      const staticRow = PL_DATA.standings.find(s => s.teamId === localId);
      const form      = buildForm(row.team.id, allMatches);
      const recent    = buildRecent(row.team.id, allMatches);

      return {
        teamId: localId,
        played: row.playedGames,
        won:    row.won,
        drawn:  row.draw,          // API 字段名是 draw，不是 drawn
        lost:   row.lost,
        gf:     row.goalsFor,
        ga:     row.goalsAgainst,
        pts:    row.points,
        // 优先使用 API 构建的 form/recent，不足时回退静态数据
        form:   form.length   >= 1 ? form   : (staticRow?.form   || ['D','D','D','D','D']),
        recent: recent.length >= 2 ? recent : (staticRow?.recent || [0,0,0,0,0,0]),
      };
    }).filter(Boolean);
  }

  // -------------------------------------------------------
  // 转换：比赛列表
  // API doc: /competitions/{competition}/matches
  // -------------------------------------------------------
  function transformMatches(raw) {
    const DONE = new Set(['FINISHED', 'IN_PLAY', 'PAUSED', 'SUSPENDED']);

    return (raw.matches || []).map(m => {
      const homeLocal = localIdByTla(m.homeTeam.tla);
      const awayLocal = localIdByTla(m.awayTeam.tla);
      if (!homeLocal || !awayLocal) return null;

      const done = DONE.has(m.status);

      // 从初始静态数据中保留详细比赛统计和进球时间线
      // （API 免费档不提供逐场详细技术统计）
      const existing = STATIC_MATCHES.find(
        x => x.homeId === homeLocal && x.awayId === awayLocal && x.round === m.matchday
      );

      return {
        id:        m.id,
        homeId:    homeLocal,
        awayId:    awayLocal,
        homeScore: done ? (m.score.fullTime.home ?? null) : null,
        awayScore: done ? (m.score.fullTime.away ?? null) : null,
        date:      m.utcDate.slice(0, 10),
        status:    done ? 'completed' : 'upcoming',
        round:     m.matchday,
        stats:     existing?.stats  ?? null,
        goals:     existing?.goals  ?? [],
      };
    }).filter(Boolean);
  }

  // -------------------------------------------------------
  // 转换：射手榜 → 球员列表
  // API doc: /competitions/{competition}/scorers
  // -------------------------------------------------------
  function transformScorers(raw) {
    return (raw.scorers || []).map(s => {
      const localTeamId = localIdByTla(s.team.tla);

      // 尝试按姓名末字段匹配静态球员，补充 API 缺失的详细字段
      const lastName = s.player.name.split(' ').slice(-1)[0].toLowerCase();
      const existing = STATIC_PLAYERS.find(p =>
        p.name.toLowerCase().includes(lastName)
      );

      const goals   = s.goals        ?? 0;
      const assists = s.assists       ?? 0;
      const apps    = s.playedMatches ?? 0;

      return {
        id:               s.player.id,
        name:             s.player.name,
        team:             localTeamId ?? (existing?.team ?? 1),
        teamName:         s.team.shortName || s.team.name,
        pos:              existing?.pos             || 'ST',
        age:              existing?.age             || 25,
        nationality:      s.player.nationality      || '',
        nationality_flag: flagOf(s.player.nationality) || existing?.nationality_flag || '🌍',
        goals,
        assists,
        apps,
        mins:           existing?.mins          || apps * 82,
        shots:          existing?.shots         || Math.round(goals * 5.0),
        shotsOnTarget:  existing?.shotsOnTarget || Math.round(goals * 3.1),
        passAcc:        existing?.passAcc       || 78,
        keyPasses:      existing?.keyPasses     || Math.max(1, Math.round(assists * 4)),
        tackles:        existing?.tackles       || 10,
        interceptions:  existing?.interceptions || 6,
        rating:         existing?.rating        || +Math.min(9.5, 6.5 + goals * 0.08 + assists * 0.05).toFixed(1),
        heatmap:        existing?.heatmap       || [7,7,7,7,7,7,7,7,7,7,7,7],
      };
    });
  }

  // -------------------------------------------------------
  // 写入 PL_DATA（直接替换属性，保留对象引用）
  // -------------------------------------------------------
  function applyToPLData({ standings, matches, players }) {
    if (standings?.length) PL_DATA.standings = standings;
    if (matches?.length)   PL_DATA.matches   = matches;
    if (players?.length)   PL_DATA.players   = players;
  }

  // -------------------------------------------------------
  // 核心：拉取 → 转换 → 写入 → 通知
  // -------------------------------------------------------
  async function fetchAll() {
    _status = 'loading';
    notify('status', 'loading');

    try {
      const [standingsRaw, matchesRaw, scorersRaw] = await Promise.all([
        API.fetchStandings(),
        API.fetchMatches(),
        API.fetchScorers(20),
      ]);

      setCache('standings', standingsRaw);
      setCache('matches',   matchesRaw);
      setCache('scorers',   scorersRaw);

      const newData = {
        standings: transformStandings(standingsRaw, matchesRaw.matches || []),
        matches:   transformMatches(matchesRaw),
        players:   transformScorers(scorersRaw),
      };

      applyToPLData(newData);
      _status     = 'ready';
      _lastUpdate = new Date();
      notify('updated', newData);
      notify('status', 'ready');
      return newData;

    } catch (err) {
      console.error('[DataService]', err);
      _status = 'error';
      notify('status', 'error');
      notify('error', err);   // 传递完整 Error 对象，含 httpStatus
      throw err;
    }
  }

  // -------------------------------------------------------
  // 自动刷新定时器
  // -------------------------------------------------------
  function startAutoRefresh() {
    stopAutoRefresh();
    _timer = setInterval(() => fetchAll().catch(() => {}), CONFIG.REFRESH_INTERVAL);
  }

  function stopAutoRefresh() {
    if (_timer) { clearInterval(_timer); _timer = null; }
  }

  // -------------------------------------------------------
  // 对外接口
  // -------------------------------------------------------
  return {
    /** 当前状态：idle | loading | ready | error | offline */
    get status()     { return _status; },
    /** 最近一次成功更新的时间（Date 对象），未更新时为 null */
    get lastUpdate() { return _lastUpdate; },

    /**
     * 订阅事件
     * @param {function} cb  - 回调：(event: string, payload: any) => void
     *   事件类型：
     *     'status'  — payload: 'loading' | 'ready' | 'error' | 'offline'
     *     'updated' — payload: { standings, matches, players }
     *     'error'   — payload: 错误信息字符串
     */
    subscribe(cb)   { _callbacks.push(cb); },
    unsubscribe(cb) { _callbacks = _callbacks.filter(x => x !== cb); },

    /** 手动触发一次数据刷新 */
    refresh() {
      if (!CONFIG.API_KEY) {
        _status = 'offline';
        notify('status', 'offline');
        return Promise.resolve(null);
      }
      return fetchAll();
    },

    startAutoRefresh,
    stopAutoRefresh,

    /**
     * 应用启动时调用
     * - 若未配置 API Key → 发出 'offline' 状态，使用静态数据
     * - 若已配置 → 立即拉取数据并启动自动刷新
     */
    async init() {
      if (!CONFIG.API_KEY) {
        _status = 'offline';
        notify('status', 'offline');
        return;
      }
      await fetchAll();
      startAutoRefresh();
    },
  };
})();
