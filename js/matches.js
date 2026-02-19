// ============================================================
// matches.js — 比赛数据分析模块
// ============================================================

const MatchesModule = (() => {

  let radarChart    = null;
  let timelineChart = null;
  let possChart     = null;
  let currentFilter = 'all';
  let selectedMatch = null;

  // -------------------------------------------------------
  // Helpers
  // -------------------------------------------------------
  function teamName(id) { return PL_DATA.getTeam(id).name; }
  function teamShort(id) { return PL_DATA.getTeam(id).short; }
  function teamColor(id) { return PL_DATA.getTeam(id).color; }

  // -------------------------------------------------------
  // Match Cards
  // -------------------------------------------------------
  function renderMatches(filter) {
    currentFilter = filter;
    const grid = document.getElementById('matches-grid');
    const list = filter === 'all'
      ? PL_DATA.matches
      : PL_DATA.matches.filter(m => m.status === filter);

    // Sort: upcoming first then by date desc
    const sorted = [...list].sort((a,b) => {
      if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
      if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
      return new Date(b.date) - new Date(a.date);
    });

    grid.innerHTML = sorted.map(m => {
      const isUpcoming = m.status === 'upcoming';
      const scoreHtml = isUpcoming
        ? `<div class="match-score"><span class="match-score-upcoming">vs</span></div>`
        : `<div class="match-score">
             <span>${m.homeScore}</span>
             <span class="match-score-sep">–</span>
             <span>${m.awayScore}</span>
           </div>`;

      return `
        <div class="match-card ${selectedMatch === m.id ? 'selected' : ''}"
             data-match-id="${m.id}" onclick="MatchesModule.selectMatch(${m.id})">
          <div class="match-meta">
            <span>第${m.round}轮 · ${m.date}</span>
            <span class="match-status ${m.status}">${m.status === 'completed' ? '已完成' : '即将进行'}</span>
          </div>
          <div class="match-teams">
            <div class="match-team">
              <div class="match-team-badge" style="background:${teamColor(m.homeId)}">${teamShort(m.homeId)}</div>
              <div class="match-team-name">${teamName(m.homeId)}</div>
            </div>
            ${scoreHtml}
            <div class="match-team">
              <div class="match-team-badge" style="background:${teamColor(m.awayId)}">${teamShort(m.awayId)}</div>
              <div class="match-team-name">${teamName(m.awayId)}</div>
            </div>
          </div>
          ${!isUpcoming ? `<div style="text-align:center;margin-top:10px;font-size:11px;color:var(--text-muted)">
            ${m.goals.map(g => `${g.min}' ${g.scorer}`).join(' · ')}
          </div>` : ''}
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  // Match Detail
  // -------------------------------------------------------
  function selectMatch(id) {
    selectedMatch = id;
    const m = PL_DATA.matches.find(x => x.id === id);
    if (!m) return;

    // Highlight selected card
    document.querySelectorAll('.match-card').forEach(c => c.classList.remove('selected'));
    const card = document.querySelector(`[data-match-id="${id}"]`);
    if (card) card.classList.add('selected');

    const detail = document.getElementById('match-detail');

    if (m.status === 'upcoming') {
      detail.classList.remove('visible');
      return;
    }

    detail.classList.add('visible');
    detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Title
    document.getElementById('detail-title').textContent =
      `${teamName(m.homeId)} ${m.homeScore} – ${m.awayScore} ${teamName(m.awayId)}`;
    document.getElementById('detail-date').textContent =
      `第${m.round}轮 · ${m.date}`;

    renderStatsBars(m);
    renderGoalsTimeline(m);
    renderRadarChart(m);
    renderPossessionChart(m);
    renderGoalsTimelineChart(m);
  }

  // -------------------------------------------------------
  // Stats Bars
  // -------------------------------------------------------
  function renderStatsBars(m) {
    const s = m.stats;
    const container = document.getElementById('detail-stats-bars');

    const rows = [
      { label:'控球率 %', home: s.homePoss, away: s.awayPoss, max: 100 },
      { label:'射门',     home: s.homeShots, away: s.awayShots, max: Math.max(s.homeShots,s.awayShots)*1.2 },
      { label:'射正',     home: s.homeShotsOT, away: s.awayShotsOT, max: Math.max(s.homeShotsOT,s.awayShotsOT)*1.5 },
      { label:'角球',     home: s.homeCorners, away: s.awayCorners, max: Math.max(s.homeCorners,s.awayCorners)*1.5 },
      { label:'犯规',     home: s.homeFouls, away: s.awayFouls, max: Math.max(s.homeFouls,s.awayFouls)*1.3 },
      { label:'传球精度%',home: s.homePassAcc, away: s.awayPassAcc, max: 100 },
    ];

    const homeTeam = teamShort(m.homeId);
    const awayTeam = teamShort(m.awayId);
    const hColor   = teamColor(m.homeId);
    const aColor   = teamColor(m.awayId);

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:11px;font-weight:700">
        <span style="color:${hColor}">${teamName(m.homeId)}</span>
        <span style="color:${aColor}">${teamName(m.awayId)}</span>
      </div>
    ` + rows.map(r => {
      const total = r.home + r.away;
      const homeW = total > 0 ? (r.home / total * 50) : 25;
      const awayW = total > 0 ? (r.away / total * 50) : 25;

      return `
        <div class="stat-bar-row">
          <div class="stat-bar-val" style="color:${hColor}">${r.home}</div>
          <div style="flex:1;position:relative;height:6px;background:var(--bg-secondary);border-radius:3px;overflow:hidden">
            <div style="position:absolute;right:50%;top:0;height:100%;width:${homeW}%;background:${hColor};border-radius:3px 0 0 3px;transition:width .6s"></div>
            <div style="position:absolute;left:50%;top:0;height:100%;width:${awayW}%;background:${aColor};border-radius:0 3px 3px 0;transition:width .6s"></div>
          </div>
          <div class="stat-bar-val" style="color:${aColor}">${r.away}</div>
          <div style="width:70px;text-align:center;font-size:10px;color:var(--text-muted)">${r.label}</div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  // Goals Timeline list
  // -------------------------------------------------------
  function renderGoalsTimeline(m) {
    const el = document.getElementById('detail-goals-timeline');
    if (!m.goals.length) {
      el.innerHTML = '<div style="color:var(--text-muted);font-size:12px">暂无进球数据</div>';
      return;
    }

    el.innerHTML = '<div class="goals-timeline">' +
      m.goals.map(g => `
        <div class="goal-event">
          <div class="goal-min">${g.min}'</div>
          <div class="goal-icon">⚽</div>
          <div class="goal-info goal-side-${g.team}">
            <div class="goal-scorer">${g.scorer}</div>
            <div class="goal-assist">${g.assist ? '助攻: ' + g.assist : ''}</div>
          </div>
          <div style="font-size:11px;font-weight:700;color:${g.team==='home'?teamColor(m.homeId):teamColor(m.awayId)}">
            ${g.team === 'home' ? teamShort(m.homeId) : teamShort(m.awayId)}
          </div>
        </div>
      `).join('') +
    '</div>';
  }

  // -------------------------------------------------------
  // Radar Chart
  // -------------------------------------------------------
  function renderRadarChart(m) {
    const s = m.stats;
    const ctx = document.getElementById('chart-match-radar');
    if (!ctx) return;

    if (radarChart) radarChart.destroy();

    const hColor = teamColor(m.homeId);
    const aColor = teamColor(m.awayId);

    radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['控球率','射门','射正','传球精度','角球','犯规(逆)'],
        datasets: [
          {
            label: teamShort(m.homeId),
            data: [
              s.homePoss,
              s.homeShots * 4,
              s.homeShotsOT * 8,
              s.homePassAcc,
              s.homeCorners * 7,
              (20 - s.homeFouls) * 4,
            ],
            borderColor: hColor,
            backgroundColor: hColor + '33',
            pointBackgroundColor: hColor,
            borderWidth: 2,
          },
          {
            label: teamShort(m.awayId),
            data: [
              s.awayPoss,
              s.awayShots * 4,
              s.awayShotsOT * 8,
              s.awayPassAcc,
              s.awayCorners * 7,
              (20 - s.awayFouls) * 4,
            ],
            borderColor: aColor,
            backgroundColor: aColor + '33',
            pointBackgroundColor: aColor,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#a0a8c0', font: { size: 11 } } },
        },
        scales: {
          r: {
            grid: { color: 'rgba(255,255,255,0.08)' },
            angleLines: { color: 'rgba(255,255,255,0.08)' },
            pointLabels: { color: '#a0a8c0', font: { size: 10 } },
            ticks: { display: false },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      },
    });
  }

  // -------------------------------------------------------
  // Possession Donut Chart
  // -------------------------------------------------------
  function renderPossessionChart(m) {
    const s = m.stats;
    const ctx = document.getElementById('chart-possession');
    if (!ctx) return;

    if (possChart) possChart.destroy();

    possChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [teamShort(m.homeId), teamShort(m.awayId)],
        datasets: [{
          data: [s.homePoss, s.awayPoss],
          backgroundColor: [teamColor(m.homeId) + 'cc', teamColor(m.awayId) + 'cc'],
          borderColor: [teamColor(m.homeId), teamColor(m.awayId)],
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { labels: { color: '#a0a8c0', font: { size: 12 } } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed}%`,
            },
          },
        },
      },
    });
  }

  // -------------------------------------------------------
  // Goals Timeline Bar Chart
  // -------------------------------------------------------
  function renderGoalsTimelineChart(m) {
    const ctx = document.getElementById('chart-goals-timeline');
    if (!ctx) return;

    if (timelineChart) timelineChart.destroy();

    const bins = ['1-15','16-30','31-45','46-60','61-75','76-90'];
    const homeData = [0,0,0,0,0,0];
    const awayData = [0,0,0,0,0,0];

    m.goals.forEach(g => {
      const bin = Math.min(Math.floor((g.min - 1) / 15), 5);
      if (g.team === 'home') homeData[bin]++;
      else awayData[bin]++;
    });

    const hColor = teamColor(m.homeId);
    const aColor = teamColor(m.awayId);

    timelineChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: bins,
        datasets: [
          {
            label: teamShort(m.homeId),
            data: homeData,
            backgroundColor: hColor + 'cc',
            borderColor: hColor,
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: teamShort(m.awayId),
            data: awayData,
            backgroundColor: aColor + 'cc',
            borderColor: aColor,
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#a0a8c0', font: { size: 11 } } },
          title: { display: true, text: '进球时间分布', color: '#a0a8c0', font: { size: 11 } },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#606880', font: { size: 10 } },
            stacked: false,
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#606880', font: { size: 10 }, stepSize: 1 },
            suggestedMax: 3,
          },
        },
      },
    });
  }

  // -------------------------------------------------------
  // Close detail
  // -------------------------------------------------------
  function closeDetail() {
    document.getElementById('match-detail').classList.remove('visible');
    document.querySelectorAll('.match-card').forEach(c => c.classList.remove('selected'));
    selectedMatch = null;
  }

  // -------------------------------------------------------
  // Filter buttons
  // -------------------------------------------------------
  function initFilters() {
    document.querySelectorAll('#tab-matches .filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#tab-matches .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMatches(btn.dataset.filter);
      });
    });

    document.getElementById('detail-close').addEventListener('click', closeDetail);
  }

  // -------------------------------------------------------
  // Init
  // -------------------------------------------------------
  function init() {
    renderMatches('all');
    initFilters();
  }

  return { init, selectMatch };
})();
