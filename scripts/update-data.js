#!/usr/bin/env node
'use strict';

/**
 * update-data.js — 英超数据自动更新脚本
 *
 * 用法:  node scripts/update-data.js
 *        node scripts/update-data.js --round 29   (强制更新指定轮次)
 *        node scripts/update-data.js --dry-run    (只打印，不写文件)
 *
 * 逻辑:
 *   1. 读取 js/data.js，找到最新已全部完赛的轮次 N
 *   2. 向 football-data.org 查询第 N+1 轮比赛 + 当前积分榜
 *   3a. 若该轮在 data.js 中不存在 → 追加新轮次条目
 *   3b. 若该轮已存在（upcoming）且 API 显示已完赛 → 替换为 completed
 *   4. 同步更新积分榜，写回 data.js（写前自动备份）
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');
const vm    = require('vm');

// ── 配置 ──────────────────────────────────────────────────────────
const API_KEY = '19f66d53113b48f1b16fe0b16caf4d02';
const SEASON  = 2025;
const DATA_JS = path.resolve(__dirname, '../js/data.js');

// TLA 别名：football-data.org 与本地 short 不一致时的映射
const TLA_ALIASES = {
  NCL:  'NEW',   // Newcastle United
  THFC: 'TOT',   // Tottenham Hotspur (备用)
  MUFC: 'MUN',   // Manchester United (备用)
  NFFC: 'NFO',   // Nottingham Forest (备用)
  NOT:  'NFO',   // Nottingham Forest (API 实际使用 NOT)
  LUFC: 'LEE',   // Leeds United
  SAFC: 'SUN',   // Sunderland AFC
  SFC:  'SUN',   // Sunderland (备用)
  BFC:  'BUR',   // Burnley FC (备用)
  WOL:  'WOL',   // Wolves (直通，防止变形)
};

// ── 命令行参数 ────────────────────────────────────────────────────
const args    = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const FORCE_ROUND = (() => {
  const idx = args.indexOf('--round');
  return idx !== -1 ? Number(args[idx + 1]) : null;
})();

// ── API ───────────────────────────────────────────────────────────
function apiFetch(endpoint) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      {
        hostname: 'api.football-data.org',
        path:     `/v4${endpoint}`,
        headers:  { 'X-Auth-Token': API_KEY },
      },
      res => {
        let buf = '';
        res.on('data', c => buf += c);
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(buf));
          } else {
            reject(new Error(`HTTP ${res.statusCode} ${endpoint}: ${buf.slice(0, 200)}`));
          }
        });
      }
    );
    req.on('error', reject);
  });
}

// ── 读取并解析 data.js ────────────────────────────────────────────
function loadDataJs() {
  const src = fs.readFileSync(DATA_JS, 'utf8');
  // vm.runInNewContext 中 const/let 不会暴露到沙箱，改为全局赋值
  const modifiedSrc = src.replace(/^\s*const\s+PL_DATA\s*=/m, 'PL_DATA =');
  const ctx = {};
  try {
    vm.runInNewContext(modifiedSrc, ctx);
  } catch (e) {
    throw new Error(`data.js 解析失败: ${e.message}`);
  }
  if (!ctx.PL_DATA) throw new Error('data.js 中未找到 PL_DATA');
  return { src, data: ctx.PL_DATA };
}

// ── 已全部完赛的最大轮次 ──────────────────────────────────────────
function latestCompleteRound(matches) {
  const rounds = {};
  for (const m of matches) {
    if (!rounds[m.round]) rounds[m.round] = { total: 0, done: 0 };
    rounds[m.round].total++;
    if (m.status === 'completed') rounds[m.round].done++;
  }
  return Object.entries(rounds)
    .filter(([, v]) => v.total > 0 && v.done === v.total)
    .map(([k]) => Number(k))
    .reduce((max, r) => Math.max(max, r), 0);
}

// ── TLA → 本地 id 映射 ────────────────────────────────────────────
function buildTlaMap(localTeams) {
  const map = {};
  for (const t of localTeams) map[t.short] = t.id;
  for (const [alias, short] of Object.entries(TLA_ALIASES)) {
    if (map[short] !== undefined) map[alias] = map[short];
  }
  return map;
}

// ── API teamId → 本地 id 映射（从积分榜建立）────────────────────
function buildApiIdMap(apiStandings, tlaMap) {
  const total = (apiStandings.standings || []).find(s => s.type === 'TOTAL');
  if (!total) return {};
  const map = {};
  for (const row of total.table) {
    const tla = TLA_ALIASES[row.team.tla] || row.team.tla;
    const localId = tlaMap[tla];
    if (localId != null) map[row.team.id] = localId;
  }
  return map;
}

// ── 计算 form / recent（与 dataService.js 逻辑一致）──────────────
function computeFormRecent(apiTeamId, allApiMatches) {
  const games = allApiMatches
    .filter(m =>
      m.status === 'FINISHED' &&
      (m.homeTeam.id === apiTeamId || m.awayTeam.id === apiTeamId)
    )
    .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate))
    .slice(0, 5);

  // form: newest first (W/D/L)
  const form = games.map(m => {
    const isHome = m.homeTeam.id === apiTeamId;
    const hg = m.score.fullTime.home, ag = m.score.fullTime.away;
    if (hg == null || ag == null) return 'D';
    const mine = isHome ? hg : ag, opp = isHome ? ag : hg;
    return mine > opp ? 'W' : mine < opp ? 'L' : 'D';
  });

  // recent: suffix-sum array, recent[0]=total 5场积分, recent[5]=0
  let cum = 0;
  const recent = [0];
  for (const m of games) {
    const isHome = m.homeTeam.id === apiTeamId;
    const hg = m.score.fullTime.home, ag = m.score.fullTime.away;
    if (hg != null && ag != null) {
      const mine = isHome ? hg : ag, opp = isHome ? ag : hg;
      cum += mine > opp ? 3 : mine === opp ? 1 : 0;
    }
    recent.unshift(cum);
  }
  while (recent.length < 6) recent.unshift(cum);
  return { form, recent: recent.slice(0, 6) };
}

// ── 生成 standings 区块内容 ───────────────────────────────────────
function genStandingsContent(apiStandings, allApiMatches, tlaMap) {
  const total = (apiStandings.standings || []).find(s => s.type === 'TOTAL');
  if (!total) throw new Error('API 积分榜无 TOTAL 类型');

  // 找到最大 playedGames 值
  const maxPlayed = Math.max(...total.table.map(r => r.playedGames));

  const lines = [];
  lines.push(`  // Standings — GW${maxPlayed} 数据（football-data.org 实时）`);
  lines.push(`  // recent: 近5场后缀积分和，form[]最新在前，recent[0]=5场总分，recent[5]=0基线`);

  for (const row of total.table) {
    const tla     = TLA_ALIASES[row.team.tla] || row.team.tla;
    const localId = tlaMap[tla];
    if (localId == null) {
      console.warn(`  [warn] 未知球队 TLA: "${row.team.tla}"，已跳过`);
      continue;
    }

    const { form, recent } = computeFormRecent(row.team.id, allApiMatches);
    const formStr   = JSON.stringify(form.length   >= 1 ? form   : ['D','D','D','D','D']);
    const recentStr = JSON.stringify(recent.length >= 2 ? recent : [0,0,0,0,0,0]);
    const name      = row.team.shortName || row.team.name;

    lines.push(`    // ${name}: P${row.playedGames} W${row.won} D${row.draw} L${row.lost} Pts${row.points}`);
    lines.push(
      `    { teamId:${String(localId).padEnd(2)}, played:${row.playedGames}, ` +
      `won:${row.won}, drawn:${row.draw}, lost:${row.lost}, ` +
      `gf:${row.goalsFor}, ga:${row.goalsAgainst}, pts:${row.points}, ` +
      `form:${formStr}, recent:${recentStr} },`
    );
  }

  return lines.join('\n');
}

// ── 生成单场比赛条目代码 ──────────────────────────────────────────
function genMatchEntry(apiMatch, tlaMap, localId) {
  const homeTla   = TLA_ALIASES[apiMatch.homeTeam.tla] || apiMatch.homeTeam.tla;
  const awayTla   = TLA_ALIASES[apiMatch.awayTeam.tla] || apiMatch.awayTeam.tla;
  const homeLocal = tlaMap[homeTla];
  const awayLocal = tlaMap[awayTla];
  if (homeLocal == null || awayLocal == null) return null;

  const done   = apiMatch.status === 'FINISHED';
  const hScore = done ? (apiMatch.score.fullTime.home ?? 'null') : 'null';
  const aScore = done ? (apiMatch.score.fullTime.away ?? 'null') : 'null';
  const status = done ? 'completed' : 'upcoming';
  const date   = apiMatch.utcDate.slice(0, 10);
  const round  = apiMatch.matchday;

  const homeName = apiMatch.homeTeam.shortName || apiMatch.homeTeam.name;
  const awayName = apiMatch.awayTeam.shortName || apiMatch.awayTeam.name;

  if (done) {
    return (
      `    // ${homeName} ${hScore}-${aScore} ${awayName}\n` +
      `    {\n` +
      `      id:${localId}, homeId:${homeLocal}, awayId:${awayLocal}, ` +
      `homeScore:${hScore}, awayScore:${aScore}, date:"${date}",\n` +
      `      status:"completed", round:${round},\n` +
      `      stats:null,\n` +
      `      goals:[]\n` +
      `    }`
    );
  } else {
    return (
      `    // ${homeName} vs ${awayName} (${date})\n` +
      `    { id:${localId}, homeId:${homeLocal}, awayId:${awayLocal}, ` +
      `homeScore:null, awayScore:null, date:"${date}", ` +
      `status:"upcoming", round:${round}, stats:null, goals:[] }`
    );
  }
}

// ── 用括号深度计数找 section 边界 ────────────────────────────────
// 返回 { open: 开括号位置, close: 闭括号位置 }
function findSectionBounds(src, sectionMarker) {
  const markerIdx = src.indexOf(sectionMarker);
  if (markerIdx === -1) throw new Error(`区块标记未找到: "${sectionMarker}"`);
  const open = src.indexOf('[', markerIdx);
  if (open === -1) throw new Error(`区块后未找到 [: "${sectionMarker}"`);

  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) return { open, close: i };
    }
  }
  throw new Error(`未找到匹配的 ]: "${sectionMarker}"`);
}

// ── 替换整个 section 内容 ─────────────────────────────────────────
function replaceSection(src, sectionMarker, newContent) {
  const { open, close } = findSectionBounds(src, sectionMarker);
  return src.slice(0, open + 1) + '\n' + newContent + '\n  ' + src.slice(close);
}

// ── 在 matches 数组末尾（最后 ],  之前）追加内容 ─────────────────
function appendToMatches(src, newBlock) {
  const { close } = findSectionBounds(src, '  matches: [');
  // close 指向 matches 数组的 ] 字符
  // 在它之前找最后一个非空白字符，确保 trailing comma
  const before = src.slice(0, close).trimEnd();
  const needsComma = before.endsWith('}') || before.endsWith(']');
  return (
    src.slice(0, close) +
    (needsComma ? '' : '') +          // already ends with , inside match entry
    '\n' + newBlock + '\n  ' +
    src.slice(close)
  );
}

// ── 查找 matches 数组中某轮次的代码范围 ──────────────────────────
// 返回 { start: 注释行开始位置, end: 该轮最后一个 }, 之后位置 } 或 null
function findRoundBlock(src, round) {
  // 寻找形如 "// ---- GW${round}" 的注释
  const commentRe = new RegExp(`// -{2,} GW${round}[^\\n]*\\n`);
  const commentMatch = src.match(commentRe);
  if (!commentMatch) return null;

  const blockStart = commentMatch.index;

  // 找下一个轮次注释或 matches 数组结束
  const nextRoundRe = new RegExp(`// -{2,} GW${round + 1}`);
  const nextMatch   = src.slice(blockStart + 1).match(nextRoundRe);

  let blockEnd;
  if (nextMatch) {
    blockEnd = blockStart + 1 + nextMatch.index;
  } else {
    // 找 matches 数组的闭合 ]
    const { close } = findSectionBounds(src, '  matches: [');
    // blockEnd 是 matches 结束前的位置
    blockEnd = close;
  }

  return { start: blockStart, end: blockEnd };
}

// ── 更新 header 注释（第1-4行）───────────────────────────────────
function updateHeader(src, completedRound, nextRound) {
  return src.replace(
    /\/\/ Last updated:[^\n]*\n\/\/ GW\d+[^\n]*/,
    `// Last updated: GW${completedRound} fully completed\n// GW${nextRound} upcoming`
  );
}

// ── 主流程 ────────────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('⚽  英超数据自动更新脚本');
  if (DRY_RUN) console.log('   [--dry-run 模式：只预览，不写文件]');
  console.log('');

  // 1. 读取 data.js
  console.log('📂 读取 data.js...');
  const { src, data } = loadDataJs();
  const tlaMap = buildTlaMap(data.teams);

  const currentRound = FORCE_ROUND
    ? FORCE_ROUND - 1
    : latestCompleteRound(data.matches);
  const nextRound = currentRound + 1;

  console.log(`   当前已全部完赛: GW${currentRound}`);
  console.log(`   目标更新轮次:   GW${nextRound}`);

  // 2. 拉取 API 数据
  console.log('\n📡 请求 football-data.org API...');
  const [standingsRaw, roundMatchesRaw, allMatchesRaw] = await Promise.all([
    apiFetch(`/competitions/PL/standings?season=${SEASON}`),
    apiFetch(`/competitions/PL/matches?season=${SEASON}&matchday=${nextRound}`),
    apiFetch(`/competitions/PL/matches?season=${SEASON}`),
  ]);

  const apiRoundMatches = (roundMatchesRaw.matches || [])
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  const allApiMatches   = allMatchesRaw.matches || [];

  if (apiRoundMatches.length === 0) {
    console.log(`⚠️  GW${nextRound} 暂无比赛数据（可能尚未排期）`);
    return;
  }

  const finishedCount = apiRoundMatches.filter(m => m.status === 'FINISHED').length;
  const totalCount    = apiRoundMatches.length;
  const allDone       = finishedCount === totalCount;

  console.log(`   GW${nextRound}: ${totalCount} 场，已完赛 ${finishedCount} 场`);

  // 3. 检查 data.js 中 GW${nextRound} 的现状
  const existingRound = data.matches.filter(m => m.round === nextRound);
  const existingKeys  = new Set(existingRound.map(m => `${m.homeId}-${m.awayId}`));
  const roundBlock    = findRoundBlock(src, nextRound);

  const apiIdToLocal = buildApiIdMap(standingsRaw, tlaMap);

  // 4. 生成新的比赛条目
  const maxId = Math.max(0, ...data.matches.map(m => m.id));
  let nextId  = maxId + 1;

  const newMatchEntries = [];
  const skipped = [];

  for (const apiMatch of apiRoundMatches) {
    const homeTla   = TLA_ALIASES[apiMatch.homeTeam.tla] || apiMatch.homeTeam.tla;
    const awayTla   = TLA_ALIASES[apiMatch.awayTeam.tla] || apiMatch.awayTeam.tla;
    const homeLocal = tlaMap[homeTla];
    const awayLocal = tlaMap[awayTla];

    if (homeLocal == null || awayLocal == null) {
      console.warn(`  [warn] 未知球队 TLA: ${apiMatch.homeTeam.tla} / ${apiMatch.awayTeam.tla}`);
      continue;
    }

    const key = `${homeLocal}-${awayLocal}`;
    if (existingKeys.has(key) && !roundBlock) {
      skipped.push(key);
      continue;
    }

    // 找 existing id（若已有则复用）
    const existing = existingRound.find(m => m.homeId === homeLocal && m.awayId === awayLocal);
    const id = existing ? existing.id : nextId++;

    const code = genMatchEntry(apiMatch, tlaMap, id);
    if (code) newMatchEntries.push(code);
  }

  if (skipped.length) {
    console.log(`   跳过已存在条目: ${skipped.length} 场（使用 --round 强制重建）`);
  }

  // 5. 汇总决策
  const needsMatchUpdate = roundBlock
    ? (finishedCount > 0)          // 已有 block → 如果有完赛场次就替换
    : (newMatchEntries.length > 0); // 无 block → 需要追加

  console.log('');
  console.log('📝 更新计划:');
  console.log(`   积分榜: 重新生成（API 实时数据）`);
  if (roundBlock) {
    console.log(`   GW${nextRound} 比赛: 替换已有条目（${newMatchEntries.length} 场）`);
  } else if (needsMatchUpdate) {
    console.log(`   GW${nextRound} 比赛: 追加新条目（${newMatchEntries.length} 场）`);
  } else {
    console.log(`   GW${nextRound} 比赛: 无需更改`);
  }

  if (!allDone) {
    console.log(`   ⚠️  GW${nextRound} 尚未全部完赛，部分场次将标记为 upcoming`);
  }

  // 6. 生成积分榜内容
  const standingsContent = genStandingsContent(standingsRaw, allApiMatches, tlaMap);

  // 7. 拼装 data.js
  const dates    = [...new Set(apiRoundMatches.map(m => m.utcDate.slice(0, 10)))].sort();
  const dateDesc = dates.length <= 3
    ? dates.join(', ')
    : `${dates[0]} – ${dates[dates.length - 1]}`;

  const statusDesc = allDone ? 'completed' : `${finishedCount}/${totalCount} done`;
  const roundComment =
    `\n    // ---- GW${nextRound} (${dateDesc}) [${statusDesc}] ----\n` +
    newMatchEntries.join(',\n') + ',';

  let newSrc = src;

  // 7a. 更新 header
  newSrc = updateHeader(newSrc, allDone ? nextRound : currentRound, allDone ? nextRound + 1 : nextRound);

  // 7b. 替换积分榜
  newSrc = replaceSection(newSrc, '  standings: [', standingsContent);

  // 7c. 更新/追加比赛
  if (newMatchEntries.length > 0) {
    if (roundBlock) {
      // 替换已有 GW block
      const updatedBounds = findRoundBlock(newSrc, nextRound);
      if (updatedBounds) {
        newSrc =
          newSrc.slice(0, updatedBounds.start) +
          roundComment + '\n  ' +
          (updatedBounds.end < newSrc.length && newSrc[updatedBounds.end] !== ']'
            ? newSrc.slice(updatedBounds.end)
            : newSrc.slice(updatedBounds.end));
      }
    } else {
      // 追加到 matches 数组末尾
      newSrc = appendToMatches(newSrc, roundComment);
    }
  }

  // 8. 输出结果
  if (DRY_RUN) {
    console.log('\n── 积分榜预览（前 5 行）─────────────────────────────────────');
    console.log(standingsContent.split('\n').slice(0, 10).join('\n'));
    console.log('\n── 比赛条目预览 ─────────────────────────────────────────────');
    console.log(roundComment.slice(0, 1000));
    console.log('\n[dry-run] 不写文件');
    return;
  }

  // 9. 写文件（先备份）
  const backupPath = DATA_JS + '.bak';
  fs.copyFileSync(DATA_JS, backupPath);
  fs.writeFileSync(DATA_JS, newSrc, 'utf8');

  console.log('');
  console.log('✅ data.js 已更新');
  console.log(`   备份: ${path.relative(process.cwd(), backupPath)}`);
  console.log(`   积分榜: GW${Math.max(...(standingsRaw.standings?.[0]?.table || []).map(r => r.playedGames) ?? [nextRound])}`);
  console.log(`   GW${nextRound}: ${newMatchEntries.length} 场已写入`);
  if (!allDone) {
    console.log(`\n💡 GW${nextRound} 尚未全部完赛，轮次结束后再次运行即可更新`);
  }
  console.log('');
}

main().catch(err => {
  console.error('\n❌ 错误:', err.message);
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
});
