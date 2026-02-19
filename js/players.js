// ============================================================
// players.js — 球员数据统计模块
// ============================================================

const PlayersModule = (() => {

  let radarChart   = null;
  let compareChart = null;
  let selectedA    = null;
  let selectedB    = null;
  let currentPos   = 'all';
  let currentTeam  = 'all';
  let currentSort  = 'goals';

  // -------------------------------------------------------
  // Init team filter dropdown
  // -------------------------------------------------------
  function initTeamFilter() {
    const sel = document.getElementById('team-filter');
    const teams = [...new Set(PL_DATA.players.map(p => p.teamName))].sort();
    teams.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      sel.appendChild(opt);
    });
  }

  // -------------------------------------------------------
  // Filtered & sorted player list
  // -------------------------------------------------------
  function getFiltered() {
    return PL_DATA.players
      .filter(p => currentPos  === 'all' || p.pos === currentPos)
      .filter(p => currentTeam === 'all' || p.teamName === currentTeam)
      .sort((a,b) => b[currentSort] - a[currentSort]);
  }

  // -------------------------------------------------------
  // Scorers Table
  // -------------------------------------------------------
  function renderScorers() {
    const list = getFiltered();
    const tbody = document.getElementById('scorers-tbody');

    tbody.innerHTML = list.map((p, i) => {
      const per90 = p.mins > 0 ? (p.goals / p.mins * 90).toFixed(2) : '0.00';
      const ratingBar = `<div class="rating-display">
        <span class="rating-num">${p.rating}</span>
        <div class="rating-bar"><div class="rating-fill" style="width:${p.rating/10*100}%"></div></div>
      </div>`;

      return `
        <tr>
          <td><span class="team-rank">${i+1}</span></td>
          <td>
            <div class="team-cell">
              <div style="font-size:20px">${p.nationality_flag}</div>
              <span class="team-name">${p.name}</span>
            </div>
          </td>
          <td>
            <div class="team-cell">
              <div class="team-badge" style="font-size:9px;background:${PL_DATA.getTeam(p.team).color}">${PL_DATA.getTeam(p.team).short}</div>
              <span style="font-size:12px">${p.teamName}</span>
            </div>
          </td>
          <td class="center">${p.apps}</td>
          <td class="center fw-800" style="color:#fff;font-size:16px">${p.goals}</td>
          <td class="center text-blue fw-700">${p.assists}</td>
          <td class="center text-muted">${p.shots}</td>
          <td class="center text-muted">${p.shotsOnTarget}</td>
          <td class="center text-yellow fw-700">${per90}</td>
          <td>${ratingBar}</td>
        </tr>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  // Player Cards
  // -------------------------------------------------------
  function renderCards() {
    const list = getFiltered();
    const grid = document.getElementById('player-cards');

    grid.innerHTML = list.map(p => {
      const posClass = `pos-${p.pos}`;
      const isA = selectedA === p.id;
      const isB = selectedB === p.id;
      const selStyle = isA ? 'border-color:var(--accent)' : isB ? 'border-color:var(--pl-blue)' : '';

      return `
        <div class="player-card ${isA || isB ? 'selected' : ''}"
             data-player-id="${p.id}"
             onclick="PlayersModule.selectPlayer(${p.id})"
             style="${selStyle}">
          <div class="player-avatar" style="${isA?'border-color:var(--accent)':isB?'border-color:var(--pl-blue)':''}">
            ${p.nationality_flag}
          </div>
          <div class="player-name">${p.name}</div>
          <div class="player-team">${p.teamName}</div>
          <div class="player-pos ${posClass}">${p.pos}</div>
          <div class="player-stats-mini">
            <div class="player-stat-mini">
              <span class="val">${p.goals}</span>
              <span class="lbl">进球</span>
            </div>
            <div class="player-stat-mini">
              <span class="val">${p.assists}</span>
              <span class="lbl">助攻</span>
            </div>
            <div class="player-stat-mini">
              <span class="val">${p.rating}</span>
              <span class="lbl">评分</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  // Select player (A then B for comparison)
  // -------------------------------------------------------
  function selectPlayer(id) {
    if (!selectedA) {
      selectedA = id;
    } else if (selectedA === id) {
      selectedA = selectedB;
      selectedB = null;
    } else if (!selectedB) {
      selectedB = id;
    } else {
      // rotate
      selectedA = selectedB;
      selectedB = id;
    }

    renderScorers();
    renderCards();
    renderDetailPanel();
  }

  // -------------------------------------------------------
  // Detail / Comparison Panel
  // -------------------------------------------------------
  function renderDetailPanel() {
    const panel = document.getElementById('player-detail-panel');
    if (!selectedA) { panel.style.display = 'none'; return; }
    panel.style.display = 'block';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const pA = PL_DATA.getPlayer(selectedA);
    const pB = selectedB ? PL_DATA.getPlayer(selectedB) : null;

    const titleEl = document.getElementById('player-detail-name');
    titleEl.textContent = pB
      ? `⚔️ ${pA.name} vs ${pB.name}`
      : `📊 ${pA.name} 数据雷达`;

    renderPlayerRadar(pA, pB);
    renderCompareBars(pA, pB);
  }

  // -------------------------------------------------------
  // Radar Chart
  // -------------------------------------------------------
  function renderPlayerRadar(pA, pB) {
    const ctx = document.getElementById('chart-player-radar');
    if (!ctx) return;
    if (radarChart) radarChart.destroy();

    const labels = ['进球','助攻','射正率','传球精度','关键传球','防守贡献'];

    function normalize(p) {
      return [
        Math.min(p.goals * 2.5, 100),
        Math.min(p.assists * 3.5, 100),
        p.shots > 0 ? p.shotsOnTarget / p.shots * 100 : 0,
        p.passAcc,
        Math.min(p.keyPasses * 0.8, 100),
        Math.min((p.tackles + p.interceptions) * 1.2, 100),
      ];
    }

    const datasets = [
      {
        label: pA.name,
        data: normalize(pA),
        borderColor: '#e90052',
        backgroundColor: 'rgba(233,0,82,0.2)',
        pointBackgroundColor: '#e90052',
        borderWidth: 2,
      },
    ];

    if (pB) {
      datasets.push({
        label: pB.name,
        data: normalize(pB),
        borderColor: '#00bfff',
        backgroundColor: 'rgba(0,191,255,0.2)',
        pointBackgroundColor: '#00bfff',
        borderWidth: 2,
      });
    }

    radarChart = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets },
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
            pointLabels: { color: '#a0a8c0', font: { size: 11 } },
            ticks: { display: false },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      },
    });
  }

  // -------------------------------------------------------
  // Compare bars
  // -------------------------------------------------------
  function renderCompareBars(pA, pB) {
    const container = document.getElementById('player-compare-bars');
    if (!pB) {
      container.innerHTML = `
        <div class="empty-state" style="padding:20px 0">
          <div class="empty-state-icon">👆</div>
          <div class="empty-state-text">再点击一位球员进行对比</div>
        </div>`;
      renderCompareChart(pA, null);
      return;
    }

    const metrics = [
      { label:'进球',     a: pA.goals,          b: pB.goals,          max: Math.max(pA.goals,pB.goals)*1.2 || 1 },
      { label:'助攻',     a: pA.assists,         b: pB.assists,         max: Math.max(pA.assists,pB.assists)*1.5 || 1 },
      { label:'射门',     a: pA.shots,           b: pB.shots,           max: Math.max(pA.shots,pB.shots)*1.2 || 1 },
      { label:'射正',     a: pA.shotsOnTarget,   b: pB.shotsOnTarget,   max: Math.max(pA.shotsOnTarget,pB.shotsOnTarget)*1.5 || 1 },
      { label:'关键传球', a: pA.keyPasses,       b: pB.keyPasses,       max: Math.max(pA.keyPasses,pB.keyPasses)*1.2 || 1 },
      { label:'抢断+截断',a: pA.tackles+pA.interceptions, b: pB.tackles+pB.interceptions, max: null },
    ];

    metrics[5].max = Math.max(metrics[5].a, metrics[5].b) * 1.5 || 1;

    container.innerHTML = `
      <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:700;margin-bottom:12px">
        <span style="color:var(--accent)">${pA.name}</span>
        <span style="color:var(--pl-blue)">${pB.name}</span>
      </div>
    ` + metrics.map(m => {
      const aW = (m.a / m.max * 50).toFixed(1);
      const bW = (m.b / m.max * 50).toFixed(1);
      return `
        <div class="compare-bar-row">
          <div class="compare-left-val">${m.a}</div>
          <div class="compare-track">
            <div class="compare-fill-left" style="width:${aW}%"></div>
            <div class="compare-fill-right" style="width:${bW}%"></div>
          </div>
          <div class="compare-right-val">${m.b}</div>
          <div class="compare-label">${m.label}</div>
        </div>
      `;
    }).join('');

    renderCompareChart(pA, pB);
  }

  // -------------------------------------------------------
  // Compare bar chart (Chart.js)
  // -------------------------------------------------------
  function renderCompareChart(pA, pB) {
    const ctx = document.getElementById('chart-player-compare');
    if (!ctx) return;
    if (compareChart) compareChart.destroy();

    const labels = ['进球','助攻','射正','关键传球'];
    const aData  = [pA.goals, pA.assists, pA.shotsOnTarget, pA.keyPasses];

    const datasets = [
      {
        label: pA.name,
        data: aData,
        backgroundColor: 'rgba(233,0,82,0.75)',
        borderColor: '#e90052',
        borderWidth: 1,
        borderRadius: 4,
      },
    ];

    if (pB) {
      datasets.push({
        label: pB.name,
        data: [pB.goals, pB.assists, pB.shotsOnTarget, pB.keyPasses],
        backgroundColor: 'rgba(0,191,255,0.5)',
        borderColor: '#00bfff',
        borderWidth: 1,
        borderRadius: 4,
      });
    }

    compareChart = new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#a0a8c0', font: { size: 11 } } },
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#606880' } },
          y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#606880' } },
        },
      },
    });
  }

  // -------------------------------------------------------
  // Filter event listeners
  // -------------------------------------------------------
  function initFilters() {
    // Position filters
    document.querySelectorAll('#tab-players .filter-btn[data-pos]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#tab-players .filter-btn[data-pos]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPos = btn.dataset.pos;
        renderScorers();
        renderCards();
      });
    });

    // Team filter
    document.getElementById('team-filter').addEventListener('change', e => {
      currentTeam = e.target.value;
      renderScorers();
      renderCards();
    });

    // Sort filter
    document.getElementById('sort-filter').addEventListener('change', e => {
      currentSort = e.target.value;
      renderScorers();
      renderCards();
    });
  }

  // -------------------------------------------------------
  // Init
  // -------------------------------------------------------
  function init() {
    initTeamFilter();
    renderScorers();
    renderCards();
    initFilters();
  }

  function refresh() {
    renderScorers();
    renderCards();
    if (selectedA) renderDetailPanel();
  }

  return { init, selectPlayer, refresh };
})();
