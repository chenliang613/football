// ============================================================
// predictions.js — 预测与分析模块
// ============================================================

const PredictionsModule = (() => {

  let champChart = null;

  // -------------------------------------------------------
  // Prediction engine (simplified ELO-like)
  // -------------------------------------------------------
  function predictMatch(homeId, awayId) {
    const hS = PL_DATA.getStanding(homeId);
    const aS = PL_DATA.getStanding(awayId);
    const hF = PL_DATA.teamForm[homeId];
    const aF = PL_DATA.teamForm[awayId];

    // Base strength from points per game
    const hPPG = hS ? hS.pts / hS.played : 1;
    const aPPG = aS ? aS.pts / aS.played : 1;

    // Form modifier (avg of last 5 match scores, scale 0-10)
    const hForm = hF ? hF.avg : 6;
    const aForm = aF ? aF.avg : 6;

    // Home advantage
    const homeAdv = 0.15;

    // Strength score
    const hStrength = hPPG * 0.5 + hForm * 0.05 + homeAdv;
    const aStrength = aPPG * 0.5 + aForm * 0.05;

    const total = hStrength + aStrength;

    let homeWin = hStrength / total;
    let awayWin = aStrength / total;
    let draw = 0.28; // league average draw rate

    // Normalize
    const base = homeWin + awayWin;
    homeWin = (homeWin / base) * (1 - draw);
    awayWin = (awayWin / base) * (1 - draw);

    // H2H adjustment (if available)
    const h2hKey = `${homeId}-${awayId}`;
    const h2h = PL_DATA.h2h[h2hKey];
    if (h2h) {
      const h2hTotal = h2h.homeWins + h2h.draws + h2h.awayWins;
      const h2hHomeWin = h2h.homeWins / h2hTotal * 0.2;
      const h2hDraw    = h2h.draws    / h2hTotal * 0.2;
      const h2hAwayWin = h2h.awayWins / h2hTotal * 0.2;
      homeWin = homeWin * 0.8 + h2hHomeWin;
      draw    = draw    * 0.8 + h2hDraw;
      awayWin = awayWin * 0.8 + h2hAwayWin;
    }

    // Predicted goals (Poisson approximation)
    const hGoals = (hS ? hS.gf / hS.played : 1.4) * 0.6 + (aS ? aS.ga / aS.played : 1.2) * 0.4;
    const aGoals = (aS ? aS.gf / aS.played : 1.2) * 0.6 + (hS ? hS.ga / hS.played : 1.4) * 0.4;

    return {
      homeWin:  Math.round(homeWin * 100),
      draw:     Math.round(draw * 100),
      awayWin:  Math.round(awayWin * 100),
      hGoals:   Math.max(0, hGoals).toFixed(1),
      aGoals:   Math.max(0, aGoals).toFixed(1),
    };
  }

  // -------------------------------------------------------
  // Render match prediction cards
  // -------------------------------------------------------
  function renderPredictions() {
    const upcoming = PL_DATA.matches.filter(m => m.status === 'upcoming');
    const grid = document.getElementById('predictions-grid');

    grid.innerHTML = upcoming.map(m => {
      const pred = predictMatch(m.homeId, m.awayId);
      const hTeam = PL_DATA.getTeam(m.homeId);
      const aTeam = PL_DATA.getTeam(m.awayId);

      const scoreLabel = `${pred.hGoals} – ${pred.aGoals}`;

      // Determine favourite
      let favText = '势均力敌';
      let favColor = 'var(--yellow)';
      if (pred.homeWin > pred.awayWin + 10) {
        favText = `${hTeam.short} 主场优势`;
        favColor = hTeam.color;
      } else if (pred.awayWin > pred.homeWin + 10) {
        favText = `${aTeam.short} 客场强队`;
        favColor = aTeam.color;
      }

      return `
        <div class="prediction-card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
            <span style="font-size:11px;font-weight:700;color:var(--text-muted)">第${m.round}轮 · ${m.date}</span>
            <span style="font-size:11px;font-weight:700;color:${favColor}">${favText}</span>
          </div>
          <div class="prediction-teams">
            <div class="prediction-team">
              <div class="team-badge" style="background:${hTeam.color};width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;margin:0 auto 6px">${hTeam.short}</div>
              <div class="prediction-team-name">${hTeam.name}</div>
              <div style="font-size:11px;color:var(--text-muted)">主场</div>
            </div>
            <div class="prediction-vs">VS</div>
            <div class="prediction-team">
              <div class="team-badge" style="background:${aTeam.color};width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;margin:0 auto 6px">${aTeam.short}</div>
              <div class="prediction-team-name">${aTeam.name}</div>
              <div style="font-size:11px;color:var(--text-muted)">客场</div>
            </div>
          </div>

          <!-- Prob bar -->
          <div class="prob-bars mt-16">
            <div class="prob-bar win"  style="width:${pred.homeWin}%"></div>
            <div class="prob-bar draw" style="width:${pred.draw}%"></div>
            <div class="prob-bar lose" style="width:${pred.awayWin}%"></div>
          </div>
          <div class="prob-labels mt-8">
            <div class="prob-label">
              <span class="pct text-green">${pred.homeWin}%</span>
              <span class="lbl">主胜</span>
            </div>
            <div class="prob-label">
              <span class="pct text-yellow">${pred.draw}%</span>
              <span class="lbl">平局</span>
            </div>
            <div class="prob-label">
              <span class="pct text-red">${pred.awayWin}%</span>
              <span class="lbl">客胜</span>
            </div>
          </div>

          <div class="score-prediction mt-16">
            <span class="score-pred-label">预测比分</span>
            <span class="score-pred-val">${scoreLabel}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  // Championship Probability
  // -------------------------------------------------------
  function renderChampionship() {
    // Simple simulation: pts remaining = 12 rounds * 3 = 36 pts max
    const remaining = 12;
    const top8 = PL_DATA.standings.slice(0, 8);
    const leader = top8[0];

    const champData = top8.map(s => {
      const team = PL_DATA.getTeam(s.teamId);
      const gap = leader.pts - s.pts;
      const maxPossible = s.pts + remaining * 3;
      // Probability based on current pts and form
      const formScore = PL_DATA.teamForm[s.teamId] ? PL_DATA.teamForm[s.teamId].avg : 5;
      const rawScore = (s.pts * 0.6 + formScore * 3 + (50 - gap) * 0.3);
      return { team, s, rawScore, gap };
    });

    // Normalize to 100%
    const totalRaw = champData.reduce((acc, d) => acc + Math.max(d.rawScore, 0), 0);
    const withProb = champData.map(d => ({
      ...d,
      prob: Math.round(Math.max(d.rawScore, 0) / totalRaw * 100),
    }));

    // Adjust so sum = 100
    const sum = withProb.reduce((a,b) => a+b.prob, 0);
    if (sum !== 100) withProb[0].prob += (100 - sum);

    // Render list
    const list = document.getElementById('champ-list');
    list.innerHTML = withProb.map((d, i) => `
      <div class="champ-row">
        <div class="champ-rank">${i+1}</div>
        <div class="champ-name">
          <span style="color:${d.team.color}">${d.team.name}</span>
        </div>
        <div class="champ-track">
          <div class="champ-fill" style="width:${d.prob}%;background:${d.team.color}88"></div>
        </div>
        <div class="champ-pct">${d.prob}%</div>
      </div>
    `).join('');

    // Chart
    const ctx = document.getElementById('chart-champ-prob');
    if (!ctx) return;
    if (champChart) champChart.destroy();

    champChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: withProb.map(d => d.team.short),
        datasets: [{
          data: withProb.map(d => d.prob),
          backgroundColor: withProb.map(d => d.team.color + 'cc'),
          borderColor: withProb.map(d => d.team.color),
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '55%',
        plugins: {
          legend: { labels: { color: '#a0a8c0', font: { size: 11 } }, position: 'right' },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed}%` } },
        },
      },
    });
  }

  // -------------------------------------------------------
  // Relegation Danger
  // -------------------------------------------------------
  function renderRelegation() {
    const bottom6 = PL_DATA.standings.slice(-6).reverse();
    const safeZone = PL_DATA.standings[17].pts; // 18th place pts
    const remaining = 12;
    const container = document.getElementById('relegation-list');

    container.innerHTML = bottom6.map((s, i) => {
      const team = PL_DATA.getTeam(s.teamId);
      const rank = PL_DATA.standings.indexOf(s) + 1;
      const isRel = rank >= 18;
      // Danger: how far from 17th
      const safe17 = PL_DATA.standings[16].pts;
      const gap = safe17 - s.pts;
      const dangerPct = Math.min(Math.round((gap / (remaining * 3)) * 100 + (isRel ? 30 : 0)), 100);

      let cls = 'danger-low';
      let emoji = '🟢';
      if (dangerPct >= 70) { cls = 'danger-high'; emoji = '🔴'; }
      else if (dangerPct >= 40) { cls = 'danger-medium'; emoji = '🟡'; }

      const formScore = PL_DATA.teamForm[s.teamId] ? PL_DATA.teamForm[s.teamId].avg : 5;

      return `
        <div class="danger-card">
          <div class="danger-index ${cls}">${dangerPct}</div>
          <div class="danger-info">
            <div class="danger-name">
              ${emoji} <span style="color:${team.color}">${team.name}</span>
              <span style="font-size:11px;color:var(--text-muted);margin-left:8px">#${rank}</span>
            </div>
            <div class="danger-pts">${s.pts}分 · 距安全区 ${Math.max(safe17 - s.pts, 0)} 分</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:10px;color:var(--text-muted)">近期状态</div>
            <div style="font-size:14px;font-weight:700;color:${formScore>=6?'var(--green)':'var(--red)'}">${formScore.toFixed(1)}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  // Init
  // -------------------------------------------------------
  function init() {
    renderPredictions();
    renderChampionship();
    renderRelegation();
  }

  function refresh() {
    renderPredictions();
    renderChampionship();
    renderRelegation();
  }

  return { init, refresh };
})();
