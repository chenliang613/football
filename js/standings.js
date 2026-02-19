// ============================================================
// standings.js — 联赛积分榜模块
// ============================================================

const StandingsModule = (() => {

  let trendChart = null;
  let goalsChart = null;

  // -------------------------------------------------------
  // Colour helper
  // -------------------------------------------------------
  function teamColor(teamId) {
    const t = PL_DATA.getTeam(teamId);
    return t ? t.color : '#888';
  }

  // Zone classification
  function getZoneClass(rank) {
    if (rank <= 4)  return 'zone-cl';
    if (rank === 5) return 'zone-el';
    if (rank === 6) return 'zone-conf';
    if (rank >= 18) return 'zone-rel';
    return '';
  }

  // -------------------------------------------------------
  // KPI Cards
  // -------------------------------------------------------
  function renderKPI() {
    const leader  = PL_DATA.standings[0];
    const leaderT = PL_DATA.getTeam(leader.teamId);
    const topGoals = [...PL_DATA.standings].sort((a,b) => b.gf - a.gf)[0];
    const topGoalsT = PL_DATA.getTeam(topGoals.teamId);
    const bestDef  = [...PL_DATA.standings].sort((a,b) => a.ga - b.ga)[0];
    const bestDefT = PL_DATA.getTeam(bestDef.teamId);

    const el = document.getElementById('standings-kpi');
    el.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon red">🥇</div>
        <div class="stat-info">
          <div class="stat-label">积分榜首</div>
          <div class="stat-value">${leaderT.short}</div>
          <div class="stat-sub">${leader.pts} 积分 · ${leader.won}胜${leader.drawn}平${leader.lost}负</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">⚽</div>
        <div class="stat-info">
          <div class="stat-label">进攻最强</div>
          <div class="stat-value">${topGoalsT.short}</div>
          <div class="stat-sub">${topGoals.gf} 进球 · 场均 ${(topGoals.gf/topGoals.played).toFixed(1)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">🛡</div>
        <div class="stat-info">
          <div class="stat-label">防守最强</div>
          <div class="stat-value">${bestDefT.short}</div>
          <div class="stat-sub">${bestDef.ga} 失球 · 场均 ${(bestDef.ga/bestDef.played).toFixed(1)}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow">📅</div>
        <div class="stat-info">
          <div class="stat-label">本赛季</div>
          <div class="stat-value">第26轮</div>
          <div class="stat-sub">还剩 12 轮 · 2025/26</div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------
  // Table
  // -------------------------------------------------------
  function renderTable() {
    const tbody = document.getElementById('standings-tbody');
    const rows = PL_DATA.standings.map((s, i) => {
      const rank = i + 1;
      const team = PL_DATA.getTeam(s.teamId);
      const gd = s.gf - s.ga;
      const gdStr = gd > 0 ? `+${gd}` : `${gd}`;
      const zone = getZoneClass(rank);

      const formBadges = s.form.map(r =>
        `<span class="form-badge ${r}">${r}</span>`
      ).join('');

      const rowHighlight = rank === 1 ? 'row-highlight' : '';

      return `
        <tr class="${rowHighlight}">
          <td class="${zone}">
            <span class="team-rank">${rank}</span>
          </td>
          <td>
            <div class="team-cell">
              <div class="team-badge" style="background:${team.color}">${team.short}</div>
              <span class="team-name">${team.name}</span>
            </div>
          </td>
          <td class="center">${s.played}</td>
          <td class="center text-green fw-700">${s.won}</td>
          <td class="center text-yellow">${s.drawn}</td>
          <td class="center text-red">${s.lost}</td>
          <td class="center">${s.gf}</td>
          <td class="center">${s.ga}</td>
          <td class="center fw-700 ${gd >= 0 ? 'text-green' : 'text-red'}">${gdStr}</td>
          <td class="center fw-800" style="font-size:15px;color:#fff">${s.pts}</td>
          <td><div class="form-badges">${formBadges}</div></td>
        </tr>
      `;
    });

    tbody.innerHTML = rows.join('');
  }

  // -------------------------------------------------------
  // Points Trend Chart
  // -------------------------------------------------------
  function renderTrendChart() {
    const top6 = PL_DATA.standings.slice(0, 6);
    const labels = ['GW21','GW22','GW23','GW24','GW25','GW26'];

    // Reconstruct cumulative points from `recent` (reversed diffs)
    const datasets = top6.map(s => {
      const team = PL_DATA.getTeam(s.teamId);
      // recent[i] = pts gained in last (6-i) rounds before this round
      const cumulativePts = s.recent.slice().reverse();
      return {
        label: team.short,
        data: cumulativePts,
        borderColor: team.color,
        backgroundColor: team.color + '22',
        fill: false,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
      };
    });

    const ctx = document.getElementById('chart-standings-trend');
    if (!ctx) return;

    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#a0a8c0', font: { size: 11 }, usePointStyle: true },
          },
          tooltip: { mode: 'index', intersect: false },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#606880', font: { size: 11 } },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#606880', font: { size: 11 } },
            title: { display: true, text: '轮次积分', color: '#606880', font: { size: 11 } },
          },
        },
      },
    });
  }

  // -------------------------------------------------------
  // Goals Distribution Chart
  // -------------------------------------------------------
  function renderGoalsChart() {
    const top8 = PL_DATA.standings.slice(0, 8);
    const labels = top8.map(s => PL_DATA.getTeam(s.teamId).short);

    const ctx = document.getElementById('chart-goals-dist');
    if (!ctx) return;

    if (goalsChart) goalsChart.destroy();
    goalsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: '进球',
            data: top8.map(s => s.gf),
            backgroundColor: 'rgba(233,0,82,0.75)',
            borderColor: '#e90052',
            borderWidth: 1,
            borderRadius: 4,
          },
          {
            label: '失球',
            data: top8.map(s => s.ga),
            backgroundColor: 'rgba(0,191,255,0.5)',
            borderColor: '#00bfff',
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#a0a8c0', font: { size: 11 }, usePointStyle: true },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#606880', font: { size: 11 } },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#606880', font: { size: 11 } },
          },
        },
      },
    });
  }

  // -------------------------------------------------------
  // Public init
  // -------------------------------------------------------
  function init() {
    renderKPI();
    renderTable();
    renderTrendChart();
    renderGoalsChart();
  }

  return { init };
})();
