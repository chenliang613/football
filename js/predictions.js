// ============================================================
// predictions.js — 交互式预测与深度分析模块
// ============================================================

const PredictionsModule = (() => {

  let champChart   = null;
  let predRadar    = null;
  let selectedId   = null;   // 当前展开的 match id

  // 可调节预测权重（由滑块实时修改）
  const W = { ppg: 0.5, form: 0.05, homeAdv: 0.15 };

  // -------------------------------------------------------
  // 泊松分布（用于比分概率）
  // -------------------------------------------------------
  function poisson(lambda, k) {
    if (k < 0 || lambda <= 0) return 0;
    let p = Math.exp(-lambda);
    for (let i = 1; i <= k; i++) p *= lambda / i;
    return p;
  }

  // -------------------------------------------------------
  // 核心预测引擎（支持可调权重）
  // -------------------------------------------------------
  function predictFull(homeId, awayId, w) {
    w = w || W;
    const hS = PL_DATA.getStanding(homeId);
    const aS = PL_DATA.getStanding(awayId);
    const hF = PL_DATA.teamForm[homeId];
    const aF = PL_DATA.teamForm[awayId];

    const hPPG   = hS ? hS.pts / hS.played : 1.0;
    const aPPG   = aS ? aS.pts / aS.played : 1.0;
    const hForm  = hF ? hF.avg : 6;
    const aForm  = aF ? aF.avg : 6;

    let hStr = hPPG * w.ppg + hForm * w.form + w.homeAdv;
    let aStr = aPPG * w.ppg + aForm * w.form;

    const base = hStr + aStr;
    let draw    = 0.27;
    let homeWin = (hStr / base) * (1 - draw);
    let awayWin = (aStr / base) * (1 - draw);

    // H2H 修正
    const h2h = PL_DATA.h2h[`${homeId}-${awayId}`];
    if (h2h) {
      const tot = h2h.homeWins + h2h.draws + h2h.awayWins;
      homeWin = homeWin * 0.8 + (h2h.homeWins / tot) * 0.2;
      draw    = draw    * 0.8 + (h2h.draws    / tot) * 0.2;
      awayWin = awayWin * 0.8 + (h2h.awayWins / tot) * 0.2;
    }

    // 归一化
    const sum = homeWin + draw + awayWin;
    homeWin /= sum; draw /= sum; awayWin /= sum;

    // 预测进球（基于攻防数据）
    const hG = (hS ? hS.gf / hS.played : 1.4) * 0.6 + (aS ? aS.ga / aS.played : 1.2) * 0.4;
    const aG = (aS ? aS.gf / aS.played : 1.2) * 0.6 + (hS ? hS.ga / hS.played : 1.4) * 0.4;

    // 泊松比分分布
    const scores = [];
    for (let h = 0; h <= 5; h++) {
      for (let a = 0; a <= 5; a++) {
        scores.push({ h, a, p: poisson(hG, h) * poisson(aG, a) });
      }
    }
    scores.sort((a, b) => b.p - a.p);

    return {
      homeWin: Math.round(homeWin * 100),
      draw:    Math.round(draw    * 100),
      awayWin: Math.round(awayWin * 100),
      hGoals:  +hG.toFixed(2),
      aGoals:  +aG.toFixed(2),
      topScores: scores.slice(0, 6),
    };
  }

  // -------------------------------------------------------
  // 预测卡片列表
  // -------------------------------------------------------
  function renderPredictions() {
    const upcoming = PL_DATA.matches.filter(m => m.status === 'upcoming');
    const grid = document.getElementById('predictions-grid');

    grid.innerHTML = upcoming.map(m => {
      const pred   = predictFull(m.homeId, m.awayId);
      const hTeam  = PL_DATA.getTeam(m.homeId);
      const aTeam  = PL_DATA.getTeam(m.awayId);

      let favText = '势均力敌', favColor = 'var(--yellow)';
      if (pred.homeWin > pred.awayWin + 10) { favText = `${hTeam.short} 主场优势`; favColor = hTeam.color; }
      else if (pred.awayWin > pred.homeWin + 10) { favText = `${aTeam.short} 客场强队`; favColor = aTeam.color; }

      const isSelected = selectedId === m.id;

      return `
        <div class="prediction-card ${isSelected ? 'pred-selected' : ''}"
             data-mid="${m.id}"
             onclick="PredictionsModule.selectMatch(${m.id})">
          <div class="pred-card-header">
            <span style="font-size:11px;color:var(--text-muted)">第${m.round}轮 · ${m.date}</span>
            <span style="font-size:11px;font-weight:700;color:${favColor}">${favText}</span>
          </div>
          <div class="prediction-teams">
            <div class="prediction-team">
              <div class="pred-badge" style="background:${hTeam.color}">${hTeam.short}</div>
              <div class="prediction-team-name">${hTeam.name}</div>
              <div style="font-size:10px;color:var(--text-muted)">主场</div>
            </div>
            <div class="prediction-vs">
              <div style="font-size:18px;font-weight:800;color:var(--text-muted)">VS</div>
              <div style="font-size:11px;color:var(--accent);margin-top:4px">${pred.hGoals} – ${pred.aGoals}</div>
            </div>
            <div class="prediction-team">
              <div class="pred-badge" style="background:${aTeam.color}">${aTeam.short}</div>
              <div class="prediction-team-name">${aTeam.name}</div>
              <div style="font-size:10px;color:var(--text-muted)">客场</div>
            </div>
          </div>
          <div class="prob-bars mt-12">
            <div class="prob-bar win"  style="width:${pred.homeWin}%"></div>
            <div class="prob-bar draw" style="width:${pred.draw}%"></div>
            <div class="prob-bar lose" style="width:${pred.awayWin}%"></div>
          </div>
          <div class="prob-labels mt-6">
            <div class="prob-label"><span class="pct text-green">${pred.homeWin}%</span><span class="lbl">主胜</span></div>
            <div class="prob-label"><span class="pct text-yellow">${pred.draw}%</span><span class="lbl">平局</span></div>
            <div class="prob-label"><span class="pct text-red">${pred.awayWin}%</span><span class="lbl">客胜</span></div>
          </div>
          <div style="text-align:center;margin-top:10px;font-size:11px;color:var(--text-muted)">
            点击查看深度分析 ↓
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  // 选中比赛 → 渲染详情面板
  // -------------------------------------------------------
  function selectMatch(matchId) {
    const m = PL_DATA.matches.find(x => x.id === matchId);
    if (!m || m.status !== 'upcoming') return;

    selectedId = matchId;
    renderPredictions();   // 刷新选中高亮

    const panel = document.getElementById('prediction-detail');
    panel.classList.add('visible');
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const hTeam = PL_DATA.getTeam(m.homeId);
    const aTeam = PL_DATA.getTeam(m.awayId);
    document.getElementById('pred-detail-title').textContent =
      `${hTeam.name}  vs  ${aTeam.name}`;
    document.getElementById('pred-detail-meta').textContent =
      `第${m.round}轮 · ${m.date} · 主场：${hTeam.name}`;

    const pred = predictFull(m.homeId, m.awayId);
    renderProbDisplay(m, pred);
    renderSliders(m);
    renderScoreProbs(m, pred);
    renderTeamCompare(m);
    renderPredRadar(m);
    renderFormStrips(m);
    renderH2H(m);
    renderKeyPlayers(m);
    renderInjuryImpact(m);
    renderAnalysisText(m, pred);
  }

  function closeDetail() {
    selectedId = null;
    document.getElementById('prediction-detail').classList.remove('visible');
    renderPredictions();
  }

  // -------------------------------------------------------
  // ① 概率显示（3段动画条 + 大字百分比）
  // -------------------------------------------------------
  function renderProbDisplay(m, pred) {
    const hTeam = PL_DATA.getTeam(m.homeId);
    const aTeam = PL_DATA.getTeam(m.awayId);
    const el = document.getElementById('pred-prob-display');

    el.innerHTML = `
      <div class="pred-prob-numbers">
        <div class="pred-prob-item">
          <div class="pred-prob-pct" style="color:${hTeam.color}" id="prob-home">${pred.homeWin}%</div>
          <div class="pred-prob-lbl">${hTeam.short} 主胜</div>
        </div>
        <div class="pred-prob-item">
          <div class="pred-prob-pct" style="color:var(--yellow)" id="prob-draw">${pred.draw}%</div>
          <div class="pred-prob-lbl">平局</div>
        </div>
        <div class="pred-prob-item">
          <div class="pred-prob-pct" style="color:${aTeam.color}" id="prob-away">${pred.awayWin}%</div>
          <div class="pred-prob-lbl">${aTeam.short} 客胜</div>
        </div>
      </div>
      <div class="pred-prob-bar-wrap">
        <div class="pred-prob-seg" id="pseg-home"
             style="width:${pred.homeWin}%;background:${hTeam.color}cc"
             title="${hTeam.name} 主胜 ${pred.homeWin}%"></div>
        <div class="pred-prob-seg" id="pseg-draw"
             style="width:${pred.draw}%;background:rgba(255,214,0,0.7)"
             title="平局 ${pred.draw}%"></div>
        <div class="pred-prob-seg" id="pseg-away"
             style="width:${pred.awayWin}%;background:${aTeam.color}cc"
             title="${aTeam.name} 客胜 ${pred.awayWin}%"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text-muted);margin-top:4px">
        <span style="color:${hTeam.color}">预测进球 ${pred.hGoals}</span>
        <span style="color:${aTeam.color}">预测进球 ${pred.aGoals}</span>
      </div>
    `;
  }

  // 局部更新概率（滑块触发）
  function updateProbDisplay(m, pred) {
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val + '%'; };
    const seg = (id, val) => { const el = document.getElementById(id); if (el) el.style.width = val + '%'; };
    set('prob-home', pred.homeWin); seg('pseg-home', pred.homeWin);
    set('prob-draw', pred.draw);    seg('pseg-draw', pred.draw);
    set('prob-away', pred.awayWin); seg('pseg-away', pred.awayWin);
    // 同步更新比分分布
    renderScoreProbs(m, pred);
    renderAnalysisText(m, pred);
  }

  // -------------------------------------------------------
  // ② 交互滑块
  // -------------------------------------------------------
  function renderSliders(m) {
    const el = document.getElementById('pred-sliders');
    el.innerHTML = `
      <div class="pred-sliders-box">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);margin-bottom:10px">⚙️ 调整预测参数</div>
        ${sliderHTML('sl-ppg',  '积分权重',   Math.round(W.ppg * 100),    10, 90)}
        ${sliderHTML('sl-form', '状态权重',   Math.round(W.form * 1000),   1, 50)}
        ${sliderHTML('sl-hadv', '主场加成 %', Math.round(W.homeAdv * 100), 0, 30)}
        <button onclick="PredictionsModule.resetWeights()" class="pred-reset-btn">↺ 重置</button>
      </div>
    `;

    ['sl-ppg','sl-form','sl-hadv'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => onSliderChange(m));
    });
  }

  function sliderHTML(id, label, val, min, max) {
    return `
      <div class="pred-slider-row">
        <span class="pred-slider-label">${label}</span>
        <input type="range" id="${id}" min="${min}" max="${max}" value="${val}" class="pred-slider">
        <span class="pred-slider-val" id="${id}-val">${val}</span>
      </div>
    `;
  }

  function onSliderChange(m) {
    const ppgEl  = document.getElementById('sl-ppg');
    const formEl = document.getElementById('sl-form');
    const hadvEl = document.getElementById('sl-hadv');
    if (!ppgEl || !formEl || !hadvEl) return;

    W.ppg     = ppgEl.value  / 100;
    W.form    = formEl.value / 1000;
    W.homeAdv = hadvEl.value / 100;

    document.getElementById('sl-ppg-val').textContent  = ppgEl.value;
    document.getElementById('sl-form-val').textContent = formEl.value;
    document.getElementById('sl-hadv-val').textContent = hadvEl.value;

    const pred = predictFull(m.homeId, m.awayId);
    updateProbDisplay(m, pred);
  }

  function resetWeights() {
    W.ppg = 0.5; W.form = 0.05; W.homeAdv = 0.15;
    const m = PL_DATA.matches.find(x => x.id === selectedId);
    if (m) renderSliders(m);
    const pred = predictFull(m.homeId, m.awayId);
    updateProbDisplay(m, pred);
  }

  // -------------------------------------------------------
  // ③ 泊松比分概率热力表
  // -------------------------------------------------------
  function renderScoreProbs(m, pred) {
    const el = document.getElementById('pred-score-probs');
    if (!el) return;
    const hTeam = PL_DATA.getTeam(m.homeId);
    const aTeam = PL_DATA.getTeam(m.awayId);
    const top = pred.topScores;
    const maxP = top[0].p;

    el.innerHTML = `
      <div class="score-dist-grid">
        ${top.map((s, i) => {
          const pct  = Math.round(s.p * 100);
          const bar  = Math.round(s.p / maxP * 100);
          const cls  = i === 0 ? 'score-top1' : i < 3 ? 'score-top3' : '';
          return `
            <div class="score-dist-row ${cls}">
              <div class="score-dist-score">
                <span style="color:${hTeam.color}">${s.h}</span>
                <span style="color:var(--text-muted)"> – </span>
                <span style="color:${aTeam.color}">${s.a}</span>
              </div>
              <div class="score-dist-bar-wrap">
                <div class="score-dist-bar" style="width:${bar}%;background:${i===0?'var(--accent)':'rgba(255,255,255,0.15)'}"></div>
              </div>
              <div class="score-dist-pct">${pct}%</div>
            </div>
          `;
        }).join('')}
      </div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:8px;text-align:right">
        基于 λ=${pred.hGoals} / ${pred.aGoals} 的泊松分布
      </div>
    `;
  }

  // -------------------------------------------------------
  // ④ 球队实力横向对比条
  // -------------------------------------------------------
  function renderTeamCompare(m) {
    const el = document.getElementById('pred-team-compare');
    if (!el) return;
    const hS = PL_DATA.getStanding(m.homeId);
    const aS = PL_DATA.getStanding(m.awayId);
    const hF = PL_DATA.teamForm[m.homeId];
    const aF = PL_DATA.teamForm[m.awayId];
    const hTeam = PL_DATA.getTeam(m.homeId);
    const aTeam = PL_DATA.getTeam(m.awayId);
    if (!hS || !aS) { el.innerHTML = '<div style="color:var(--text-muted)">暂无数据</div>'; return; }

    const hPPG  = +(hS.pts / hS.played).toFixed(2);
    const aPPG  = +(aS.pts / aS.played).toFixed(2);
    const hAtk  = +(hS.gf / hS.played).toFixed(2);
    const aAtk  = +(aS.gf / aS.played).toFixed(2);
    const hDef  = +(hS.ga / hS.played).toFixed(2);  // lower is better
    const aDef  = +(aS.ga / aS.played).toFixed(2);
    const hForm = hF ? hF.avg : 5;
    const aForm = aF ? aF.avg : 5;

    const rows = [
      { label:'积分/场', hv: hPPG, av: aPPG, max: 3,   fmt: v => v.toFixed(2) },
      { label:'进球/场', hv: hAtk, av: aAtk, max: 3,   fmt: v => v.toFixed(2) },
      { label:'失球/场', hv: hDef, av: aDef, max: 3,   fmt: v => v.toFixed(2), invert: true },
      { label:'近期状态', hv: hForm, av: aForm, max: 10, fmt: v => v.toFixed(1) },
    ];

    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:11px;font-weight:700">
        <span style="color:${hTeam.color}">${hTeam.short}</span>
        <span style="color:${aTeam.color}">${aTeam.short}</span>
      </div>
    ` + rows.map(r => {
      const total = r.hv + r.av || 1;
      const hPct  = r.invert
        ? ((1 - r.hv / (r.hv + r.av)) * 50)
        : (r.hv / total * 50);
      const aPct  = r.invert
        ? ((1 - r.av / (r.hv + r.av)) * 50)
        : (r.av / total * 50);
      const hBetter = r.invert ? r.hv <= r.av : r.hv >= r.av;
      const aBetter = r.invert ? r.av <= r.hv : r.av >= r.hv;
      return `
        <div class="cmp-row">
          <div class="cmp-val" style="color:${hBetter ? hTeam.color : 'var(--text-secondary)'}">${r.fmt(r.hv)}</div>
          <div class="cmp-bars">
            <div style="width:${hPct}%;background:${hTeam.color}99;height:100%;border-radius:2px 0 0 2px;margin-left:auto"></div>
            <div style="width:${aPct}%;background:${aTeam.color}99;height:100%;border-radius:0 2px 2px 0"></div>
          </div>
          <div class="cmp-val" style="color:${aBetter ? aTeam.color : 'var(--text-secondary)'}">${r.fmt(r.av)}</div>
          <div class="cmp-label">${r.label}</div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  // ⑤ 综合实力雷达图
  // -------------------------------------------------------
  function renderPredRadar(m) {
    const ctx = document.getElementById('chart-pred-radar');
    if (!ctx) return;
    if (predRadar) { predRadar.destroy(); predRadar = null; }

    const hS = PL_DATA.getStanding(m.homeId);
    const aS = PL_DATA.getStanding(m.awayId);
    const hF = PL_DATA.teamForm[m.homeId];
    const aF = PL_DATA.teamForm[m.awayId];
    const hTeam = PL_DATA.getTeam(m.homeId);
    const aTeam = PL_DATA.getTeam(m.awayId);
    if (!hS || !aS) return;

    // 标准化函数（以20支球队最大值为基准）
    const allS = PL_DATA.standings;
    const maxPPG  = Math.max(...allS.map(s => s.pts / s.played));
    const maxAtk  = Math.max(...allS.map(s => s.gf  / s.played));
    const maxForm = 10;

    function norm(val, max) { return Math.round(val / max * 100); }

    const hPPG  = hS.pts / hS.played;
    const aPPG  = aS.pts / aS.played;
    const hAtk  = hS.gf  / hS.played;
    const aAtk  = aS.gf  / aS.played;
    const hDef  = 1 - hS.ga / hS.played / 3;  // 越高越好
    const aDef  = 1 - aS.ga / aS.played / 3;
    const hFrm  = (hF ? hF.avg : 5) / maxForm;
    const aFrm  = (aF ? aF.avg : 5) / maxForm;
    // 近5场胜点率
    const formPts = { W:3, D:1, L:0 };
    const h5 = hS.form.slice(0,5).reduce((a,r) => a + (formPts[r]||0), 0) / 15;
    const a5 = aS.form.slice(0,5).reduce((a,r) => a + (formPts[r]||0), 0) / 15;

    predRadar = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['积分率','进攻力','防守力','近期状态','近5场胜点'],
        datasets: [
          {
            label: hTeam.short,
            data: [norm(hPPG, maxPPG), norm(hAtk, maxAtk), Math.round(Math.max(hDef,0)*100),
                   Math.round(hFrm*100), Math.round(h5*100)],
            borderColor: hTeam.color, backgroundColor: hTeam.color + '33',
            pointBackgroundColor: hTeam.color, borderWidth: 2,
          },
          {
            label: aTeam.short,
            data: [norm(aPPG, maxPPG), norm(aAtk, maxAtk), Math.round(Math.max(aDef,0)*100),
                   Math.round(aFrm*100), Math.round(a5*100)],
            borderColor: aTeam.color, backgroundColor: aTeam.color + '33',
            pointBackgroundColor: aTeam.color, borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color:'#a0a8c0', font:{ size:11 } } } },
        scales: {
          r: {
            grid: { color:'rgba(255,255,255,0.08)' },
            angleLines: { color:'rgba(255,255,255,0.08)' },
            pointLabels: { color:'#a0a8c0', font:{ size:10 } },
            ticks: { display: false },
            suggestedMin: 0, suggestedMax: 100,
          },
        },
      },
    });
  }

  // -------------------------------------------------------
  // ⑥ 近5场状态条
  // -------------------------------------------------------
  function renderFormStrips(m) {
    const el = document.getElementById('pred-form-strips');
    if (!el) return;
    const hS = PL_DATA.getStanding(m.homeId);
    const aS = PL_DATA.getStanding(m.awayId);
    const hTeam = PL_DATA.getTeam(m.homeId);
    const aTeam = PL_DATA.getTeam(m.awayId);

    function strip(s, team) {
      const badges = s.form.slice(0, 5).map(r =>
        `<span class="form-badge ${r}">${r}</span>`
      ).join('');
      const won = s.form.slice(0,5).filter(r=>r==='W').length;
      const pts = s.form.slice(0,5).reduce((a,r) => a + (r==='W'?3:r==='D'?1:0), 0);
      return `
        <div class="form-strip-row">
          <div class="form-strip-team" style="color:${team.color}">${team.short}</div>
          <div class="form-badges" style="gap:4px">${badges}</div>
          <div style="font-size:11px;color:var(--text-muted)">${pts}分 / 5场</div>
        </div>
      `;
    }

    el.innerHTML = `
      <div style="margin-bottom:12px">${strip(hS, hTeam)}</div>
      <div>${strip(aS, aTeam)}</div>
      <div style="margin-top:14px;font-size:11px;color:var(--text-muted)">积分榜位置</div>
      <div style="margin-top:6px">
        ${rankBadge(m.homeId, hTeam)}
        ${rankBadge(m.awayId, aTeam)}
      </div>
    `;
  }

  function rankBadge(teamId, team) {
    const rank = PL_DATA.standings.findIndex(s => s.teamId === teamId) + 1;
    const s    = PL_DATA.getStanding(teamId);
    return `
      <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
        <span style="width:24px;text-align:center;font-weight:800;color:var(--text-muted)">#${rank}</span>
        <span style="color:${team.color};font-weight:700">${team.name}</span>
        <span style="margin-left:auto;font-size:12px;color:var(--text-secondary)">${s ? s.pts + '分' : '—'}</span>
      </div>
    `;
  }

  // -------------------------------------------------------
  // ⑦ 历史交锋
  // -------------------------------------------------------
  function renderH2H(m) {
    const el = document.getElementById('pred-h2h');
    if (!el) return;
    const h2h = PL_DATA.h2h[`${m.homeId}-${m.awayId}`];
    const hTeam = PL_DATA.getTeam(m.homeId);
    const aTeam = PL_DATA.getTeam(m.awayId);

    if (!h2h) {
      el.innerHTML = '<div style="color:var(--text-muted);font-size:12px">暂无历史交锋数据</div>';
      return;
    }

    const total = h2h.homeWins + h2h.draws + h2h.awayWins;
    const hPct  = Math.round(h2h.homeWins / total * 100);
    const dPct  = Math.round(h2h.draws    / total * 100);
    const aPct  = Math.round(h2h.awayWins / total * 100);
    const hGPG  = (h2h.homeGoals / total).toFixed(1);
    const aGPG  = (h2h.awayGoals / total).toFixed(1);

    el.innerHTML = `
      <div class="h2h-total">共 ${total} 场历史交锋</div>
      <div class="h2h-bar-wrap">
        <div style="width:${hPct}%;background:${hTeam.color}cc"></div>
        <div style="width:${dPct}%;background:rgba(255,214,0,0.6)"></div>
        <div style="width:${aPct}%;background:${aTeam.color}cc"></div>
      </div>
      <div class="h2h-labels">
        <span style="color:${hTeam.color}">${h2h.homeWins}胜 (${hPct}%)</span>
        <span style="color:var(--yellow)">${h2h.draws}平</span>
        <span style="color:${aTeam.color}">${h2h.awayWins}胜 (${aPct}%)</span>
      </div>
      <div class="h2h-goals">
        <div class="h2h-goal-item">
          <span style="color:${hTeam.color};font-size:20px;font-weight:800">${h2h.homeGoals}</span>
          <span style="font-size:10px;color:var(--text-muted)">${hTeam.short} 总进球</span>
          <span style="font-size:11px;color:var(--text-secondary)">场均 ${hGPG}</span>
        </div>
        <div style="font-size:18px;color:var(--text-muted)">:</div>
        <div class="h2h-goal-item">
          <span style="color:${aTeam.color};font-size:20px;font-weight:800">${h2h.awayGoals}</span>
          <span style="font-size:10px;color:var(--text-muted)">${aTeam.short} 总进球</span>
          <span style="font-size:11px;color:var(--text-secondary)">场均 ${aGPG}</span>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------
  // ⑧ 关键球员
  // -------------------------------------------------------
  function renderKeyPlayers(m) {
    const el = document.getElementById('pred-key-players');
    if (!el) return;
    const hTeam = PL_DATA.getTeam(m.homeId);
    const aTeam = PL_DATA.getTeam(m.awayId);

    const hPlayers = PL_DATA.players.filter(p => p.team === m.homeId).sort((a,b) => b.rating - a.rating).slice(0, 2);
    const aPlayers = PL_DATA.players.filter(p => p.team === m.awayId).sort((a,b) => b.rating - a.rating).slice(0, 2);

    function playerCard(p, team) {
      return `
        <div class="kp-card">
          <div class="kp-badge" style="background:${team.color}">${p.pos}</div>
          <div class="kp-info">
            <div class="kp-name">${p.name}</div>
            <div class="kp-stats">${p.goals}球 ${p.assists}助 · 评分 ${p.rating}</div>
          </div>
        </div>
      `;
    }

    const noPlayer = `<div style="color:var(--text-muted);font-size:11px;padding:8px 0">暂无数据</div>`;

    el.innerHTML = `
      <div class="kp-section">
        <div style="font-size:10px;font-weight:700;color:${hTeam.color};margin-bottom:6px">${hTeam.name}</div>
        ${hPlayers.length ? hPlayers.map(p => playerCard(p, hTeam)).join('') : noPlayer}
      </div>
      <div class="kp-section" style="margin-top:10px">
        <div style="font-size:10px;font-weight:700;color:${aTeam.color};margin-bottom:6px">${aTeam.name}</div>
        ${aPlayers.length ? aPlayers.map(p => playerCard(p, aTeam)).join('') : noPlayer}
      </div>
    `;
  }

  // -------------------------------------------------------
  // ⑨ 伤情影响
  // -------------------------------------------------------
  function renderInjuryImpact(m) {
    const el = document.getElementById('pred-injuries');
    if (!el) return;
    const hTeam = PL_DATA.getTeam(m.homeId);
    const aTeam = PL_DATA.getTeam(m.awayId);

    const hInj = PL_DATA.injuries.filter(i => i.teamId === m.homeId);
    const aInj = PL_DATA.injuries.filter(i => i.teamId === m.awayId);

    function injCard(inj, team) {
      const cls = inj.status === 'Long-term' ? 'inj-critical' : inj.status === 'Out' ? 'inj-out' : 'inj-doubt';
      const icon = inj.severity === 'Critical' ? '🔴' : inj.severity === 'High' ? '🟠' : '🟡';
      return `
        <div class="inj-mini">
          <span class="inj-badge ${cls}">${inj.status}</span>
          <div class="inj-mini-info">
            <div style="font-size:12px;font-weight:600;color:var(--text-primary)">${icon} ${inj.name}</div>
            <div style="font-size:10px;color:var(--text-muted)">${inj.pos} · ${inj.injury}</div>
            <div style="font-size:10px;color:var(--text-muted)">预计复出：${inj.returnEst}</div>
          </div>
        </div>
      `;
    }

    const none = `<div style="color:var(--green);font-size:11px;padding:6px 0">✅ 全员可用</div>`;

    el.innerHTML = `
      <div style="font-size:10px;font-weight:700;color:${hTeam.color};margin-bottom:6px">${hTeam.name}</div>
      ${hInj.length ? hInj.map(i => injCard(i, hTeam)).join('') : none}
      <div style="font-size:10px;font-weight:700;color:${aTeam.color};margin-top:10px;margin-bottom:6px">${aTeam.name}</div>
      ${aInj.length ? aInj.map(i => injCard(i, aTeam)).join('') : none}
    `;
  }

  // -------------------------------------------------------
  // ⑩ 生成分析文字
  // -------------------------------------------------------
  function renderAnalysisText(m, pred) {
    const el = document.getElementById('pred-analysis-text');
    if (!el) return;

    const hTeam = PL_DATA.getTeam(m.homeId);
    const aTeam = PL_DATA.getTeam(m.awayId);
    const hS = PL_DATA.getStanding(m.homeId);
    const aS = PL_DATA.getStanding(m.awayId);
    const hF = PL_DATA.teamForm[m.homeId];
    const aF = PL_DATA.teamForm[m.awayId];
    const h2h = PL_DATA.h2h[`${m.homeId}-${m.awayId}`];
    const hRank = PL_DATA.standings.findIndex(s => s.teamId === m.homeId) + 1;
    const aRank = PL_DATA.standings.findIndex(s => s.teamId === m.awayId) + 1;

    const hPPG   = hS ? (hS.pts / hS.played).toFixed(2) : '?';
    const aPPG   = aS ? (aS.pts / aS.played).toFixed(2) : '?';
    const hFormStr = hS ? hS.form.slice(0,5).join('') : '---';
    const aFormStr = aS ? aS.form.slice(0,5).join('') : '---';
    const hFormAvg = hF ? hF.avg.toFixed(1) : '?';
    const aFormAvg = aF ? aF.avg.toFixed(1) : '?';

    const hInj = PL_DATA.injuries.filter(i => i.teamId === m.homeId && (i.status==='Out'||i.status==='Long-term'));
    const aInj = PL_DATA.injuries.filter(i => i.teamId === m.awayId && (i.status==='Out'||i.status==='Long-term'));

    const topScore = pred.topScores[0];
    const topScoreStr = `${topScore.h}-${topScore.a}`;
    const topScorePct = Math.round(topScore.p * 100);

    // 确定最强方
    const favourite = pred.homeWin > pred.awayWin + 8
      ? `${hTeam.name}（主场）`
      : pred.awayWin > pred.homeWin + 8
        ? `${aTeam.name}（客场）`
        : '双方旗鼓相当';

    // 伤情文字
    const hInjText = hInj.length
      ? `${hTeam.name}需缺少 ${hInj.map(i=>i.name).join('、')} 等 ${hInj.length} 名球员`
      : `${hTeam.name}全员可用`;
    const aInjText = aInj.length
      ? `${aTeam.name}的 ${aInj.map(i=>i.name).join('、')} 亦无法出战`
      : `${aTeam.name}伤情较轻`;

    // H2H 文字
    const h2hText = h2h
      ? `历史交锋中${hTeam.name}主场${h2h.homeWins}胜${h2h.draws}平${h2h.awayWins}负，主队历史胜率 ${Math.round(h2h.homeWins/(h2h.homeWins+h2h.draws+h2h.awayWins)*100)}%。`
      : '双方历史交锋数据有限。';

    // 构建分析段落
    const paras = [
      `<strong>综合实力：</strong>${hTeam.name}（积分榜第${hRank}，场均 ${hPPG} 分）迎战 ${aTeam.name}（第${aRank}，场均 ${aPPG} 分）。本场形势预判倾向于${favourite}，主胜概率 ${pred.homeWin}%、平局 ${pred.draw}%、客胜 ${pred.awayWin}%。`,

      `<strong>近期状态：</strong>${hTeam.name}近5场 ${hFormStr}，综合状态评分 ${hFormAvg}/10；${aTeam.name}近5场 ${aFormStr}，评分 ${aFormAvg}/10。${hF && aF ? (hF.avg > aF.avg ? `${hTeam.name}近期状态更佳，主场优势显著。` : aF.avg > hF.avg ? `${aTeam.name}势头更猛，不容小觑。` : '双方近期状态相近，比赛走向难以预判。') : ''}`,

      `<strong>历史交锋：</strong>${h2hText}`,

      `<strong>进攻与防守：</strong>${hTeam.name}预测进球 ${pred.hGoals}，${aTeam.name}预测进球 ${pred.aGoals}。泊松模型显示最可能比分为 ${topScoreStr}（概率约 ${topScorePct}%）。${pred.hGoals > pred.aGoals ? `${hTeam.name}进攻端略占优势。` : pred.aGoals > pred.hGoals ? `${aTeam.name}攻击力或更具威胁。` : '双方得分效率相当。'}`,

      `<strong>伤情与阵容：</strong>${hInjText}；${aInjText}。伤情状况将对临场阵容产生重要影响，关注赛前官方首发名单。`,
    ];

    el.innerHTML = paras.map(p => `<p class="analysis-para">${p}</p>`).join('');
  }

  // -------------------------------------------------------
  // 夺冠概率
  // -------------------------------------------------------
  function renderChampionship() {
    const remaining = 11;
    const top8 = PL_DATA.standings.slice(0, 8);
    const leader = top8[0];

    const data = top8.map(s => {
      const team = PL_DATA.getTeam(s.teamId);
      const gap  = leader.pts - s.pts;
      const fs   = PL_DATA.teamForm[s.teamId] ? PL_DATA.teamForm[s.teamId].avg : 5;
      const raw  = s.pts * 0.6 + fs * 3 + (50 - gap) * 0.3;
      return { team, s, raw, gap };
    });

    const totalRaw = data.reduce((a,d) => a + Math.max(d.raw, 0), 0);
    const withProb = data.map(d => ({ ...d, prob: Math.round(Math.max(d.raw,0)/totalRaw*100) }));
    const sum = withProb.reduce((a,b) => a+b.prob, 0);
    if (sum !== 100) withProb[0].prob += (100 - sum);

    const list = document.getElementById('champ-list');
    list.innerHTML = withProb.map((d, i) => `
      <div class="champ-row">
        <div class="champ-rank">${i+1}</div>
        <div class="champ-name"><span style="color:${d.team.color}">${d.team.name}</span></div>
        <div class="champ-track"><div class="champ-fill" style="width:${d.prob}%;background:${d.team.color}88"></div></div>
        <div class="champ-pct">${d.prob}%</div>
      </div>
    `).join('');

    const ctx = document.getElementById('chart-champ-prob');
    if (!ctx) return;
    if (champChart) champChart.destroy();
    champChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: withProb.map(d => d.team.short),
        datasets: [{ data: withProb.map(d => d.prob),
          backgroundColor: withProb.map(d => d.team.color + 'cc'),
          borderColor:     withProb.map(d => d.team.color),
          borderWidth: 2 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '55%',
        plugins: {
          legend: { labels: { color:'#a0a8c0', font:{ size:11 } }, position:'right' },
          tooltip: { callbacks: { label: c => ` ${c.parsed}%` } },
        },
      },
    });
  }

  // -------------------------------------------------------
  // 降级危险指数
  // -------------------------------------------------------
  function renderRelegation() {
    const bottom6  = PL_DATA.standings.slice(-6).reverse();
    const remaining = 11;
    const safe17pts = PL_DATA.standings[16].pts;
    const container = document.getElementById('relegation-list');

    container.innerHTML = bottom6.map(s => {
      const team  = PL_DATA.getTeam(s.teamId);
      const rank  = PL_DATA.standings.indexOf(s) + 1;
      const isRel = rank >= 18;
      const gap   = safe17pts - s.pts;
      const dangerPct = Math.min(Math.round((gap / (remaining * 3)) * 100 + (isRel ? 30 : 0)), 100);

      let cls = 'danger-low', emoji = '🟢';
      if (dangerPct >= 70) { cls = 'danger-high'; emoji = '🔴'; }
      else if (dangerPct >= 40) { cls = 'danger-medium'; emoji = '🟡'; }

      const fs = PL_DATA.teamForm[s.teamId] ? PL_DATA.teamForm[s.teamId].avg : 5;

      return `
        <div class="danger-card">
          <div class="danger-index ${cls}">${dangerPct}</div>
          <div class="danger-info">
            <div class="danger-name">
              ${emoji} <span style="color:${team.color}">${team.name}</span>
              <span style="font-size:11px;color:var(--text-muted);margin-left:8px">#${rank}</span>
            </div>
            <div class="danger-pts">${s.pts}分 · 距安全区 ${Math.max(safe17pts - s.pts, 0)} 分</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:10px;color:var(--text-muted)">近期状态</div>
            <div style="font-size:14px;font-weight:700;color:${fs>=6?'var(--green)':'var(--red)'}">${fs.toFixed(1)}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  // Init / Refresh
  // -------------------------------------------------------
  function init() {
    renderPredictions();
    renderChampionship();
    renderRelegation();

    document.getElementById('pred-detail-close')
      ?.addEventListener('click', closeDetail);
  }

  function refresh() {
    renderPredictions();
    renderChampionship();
    renderRelegation();
    if (selectedId) {
      const m = PL_DATA.matches.find(x => x.id === selectedId);
      if (m) selectMatch(selectedId);
    }
  }

  return { init, refresh, selectMatch, closeDetail, resetWeights };
})();
