// ============================================================
// injuries.js — 关键球员伤情与近期状态模块
// ============================================================

const InjuriesModule = (() => {

  let formChart    = null;
  let severityChart = null;
  let radarChart   = null;

  // -------------------------------------------------------
  // KPI Cards
  // -------------------------------------------------------
  function renderKPI() {
    const injuries = PL_DATA.injuries;
    const out      = injuries.filter(i => i.status === 'Out').length;
    const doubtful = injuries.filter(i => i.status === 'Doubtful').length;
    const longTerm = injuries.filter(i => i.status === 'Long-term').length;
    const teamsAff = [...new Set(injuries.map(i => i.teamId))].length;

    const el = document.getElementById('injury-kpi');
    el.innerHTML = `
      <div class="stat-card">
        <div class="stat-icon red">🏥</div>
        <div class="stat-info">
          <div class="stat-label">缺阵球员</div>
          <div class="stat-value">${out}</div>
          <div class="stat-sub">Out 状态</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon yellow">⚠️</div>
        <div class="stat-info">
          <div class="stat-label">存疑球员</div>
          <div class="stat-value">${doubtful}</div>
          <div class="stat-sub">Doubtful 状态</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple">🔴</div>
        <div class="stat-info">
          <div class="stat-label">长期伤缺</div>
          <div class="stat-value">${longTerm}</div>
          <div class="stat-sub">Long-term</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue">⚽</div>
        <div class="stat-info">
          <div class="stat-label">受影响球队</div>
          <div class="stat-value">${teamsAff}</div>
          <div class="stat-sub">共 ${injuries.length} 名球员</div>
        </div>
      </div>
    `;
  }

  // -------------------------------------------------------
  // Injuries Table
  // -------------------------------------------------------
  function renderTable() {
    const tbody = document.getElementById('injuries-tbody');
    tbody.innerHTML = PL_DATA.injuries.map(inj => {
      const team = PL_DATA.getTeam(inj.teamId);
      return `
        <tr>
          <td>
            <div class="team-cell">
              <div style="font-size:18px">🤕</div>
              <span class="team-name">${inj.name}</span>
            </div>
          </td>
          <td>
            <div class="team-cell">
              <div class="team-badge" style="font-size:9px;background:${team.color}">${team.short}</div>
              <span style="font-size:12px">${inj.teamName}</span>
            </div>
          </td>
          <td>
            <span class="player-pos pos-${inj.pos.replace(' ','')} severity-badge"
                  style="font-size:10px;padding:2px 8px">${inj.pos}</span>
          </td>
          <td style="font-size:12px">${inj.injury}</td>
          <td class="center">
            <span class="severity-badge sev-${inj.severity}">${inj.severity}</span>
          </td>
          <td class="center">
            <span class="status-badge status-${inj.status.replace(' ','-')}">${inj.status}</span>
          </td>
          <td style="font-size:12px;color:var(--text-muted)">${inj.since}</td>
          <td style="font-size:12px;color:var(--text-secondary)">${inj.returnEst}</td>
          <td>
            <div class="impact-bar">
              <div class="impact-track">
                <div class="impact-fill" style="width:${inj.impact * 10}%"></div>
              </div>
              <div class="impact-val">${inj.impact}/10</div>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  // Team Form Chart (recent 5 matches avg)
  // -------------------------------------------------------
  function renderFormChart() {
    const ctx = document.getElementById('chart-team-form');
    if (!ctx) return;
    if (formChart) formChart.destroy();

    const top10 = Object.entries(PL_DATA.teamForm).slice(0, 10);
    const labels = top10.map(([,v]) => v.name.replace('Manchester ','Man ').replace('Nottm ',''));
    const avgs   = top10.map(([,v]) => v.avg);
    const colors = top10.map(([id]) => PL_DATA.getTeam(parseInt(id)).color + 'cc');

    formChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: '近期状态均分',
          data: avgs,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('cc','ff')),
          borderWidth: 1,
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y.toFixed(1)} 分` } },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#606880', font: { size: 10 }, maxRotation: 30 },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.06)' },
            ticks: { color: '#606880', font: { size: 11 } },
            min: 5,
            max: 10,
          },
        },
      },
    });
  }

  // -------------------------------------------------------
  // Severity Distribution (Donut)
  // -------------------------------------------------------
  function renderSeverityChart() {
    const ctx = document.getElementById('chart-injury-severity');
    if (!ctx) return;
    if (severityChart) severityChart.destroy();

    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    PL_DATA.injuries.forEach(i => counts[i.severity]++);

    severityChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['轻微', '中等', '严重', '危急'],
        datasets: [{
          data: [counts.Low, counts.Medium, counts.High, counts.Critical],
          backgroundColor: [
            'rgba(0,230,118,0.75)',
            'rgba(255,214,0,0.75)',
            'rgba(255,23,68,0.75)',
            'rgba(233,0,82,0.9)',
          ],
          borderColor: ['#00e676','#ffd600','#ff1744','#e90052'],
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { labels: { color: '#a0a8c0', font: { size: 12 } } },
          tooltip: { callbacks: { label: ctx => ` ${ctx.parsed} 人` } },
        },
      },
    });
  }

  // -------------------------------------------------------
  // Form Radar (top 5 teams)
  // -------------------------------------------------------
  function renderFormRadar() {
    const ctx = document.getElementById('chart-form-radar');
    if (!ctx) return;
    if (radarChart) radarChart.destroy();

    const top5 = Object.entries(PL_DATA.teamForm).slice(0, 5);
    const labels = ['场次1','场次2','场次3','场次4','场次5'];

    const datasets = top5.map(([id, f]) => {
      const team = PL_DATA.getTeam(parseInt(id));
      return {
        label: team.short,
        data: f.scores,
        borderColor: team.color,
        backgroundColor: team.color + '22',
        pointBackgroundColor: team.color,
        borderWidth: 2,
        pointRadius: 3,
      };
    });

    radarChart = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color: '#a0a8c0', font: { size: 11 }, usePointStyle: true } },
        },
        scales: {
          r: {
            grid: { color: 'rgba(255,255,255,0.08)' },
            angleLines: { color: 'rgba(255,255,255,0.08)' },
            pointLabels: { color: '#a0a8c0', font: { size: 11 } },
            ticks: { display: false },
            suggestedMin: 5,
            suggestedMax: 10,
          },
        },
      },
    });
  }

  // -------------------------------------------------------
  // Injury Impact Analysis
  // -------------------------------------------------------
  function renderImpactAnalysis() {
    const container = document.getElementById('injury-impact-list');

    // Group by team
    const byTeam = {};
    PL_DATA.injuries.forEach(inj => {
      if (!byTeam[inj.teamId]) byTeam[inj.teamId] = [];
      byTeam[inj.teamId].push(inj);
    });

    const teamImpacts = Object.entries(byTeam).map(([teamId, injuries]) => {
      const team = PL_DATA.getTeam(parseInt(teamId));
      const totalImpact = injuries.reduce((a,b) => a + b.impact, 0);
      const avgImpact   = totalImpact / injuries.length;
      return { team, injuries, totalImpact, avgImpact };
    }).sort((a,b) => b.totalImpact - a.totalImpact);

    container.innerHTML = teamImpacts.map(ti => {
      const impactPct = Math.min(ti.totalImpact * 3, 100);
      const level = impactPct >= 70 ? '高' : impactPct >= 40 ? '中' : '低';
      const levelColor = impactPct >= 70 ? 'var(--red)' : impactPct >= 40 ? 'var(--yellow)' : 'var(--green)';

      return `
        <div class="danger-card">
          <div class="team-badge" style="background:${ti.team.color};width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;color:#fff;flex-shrink:0">
            ${ti.team.short}
          </div>
          <div class="danger-info">
            <div class="danger-name">${ti.team.name}</div>
            <div class="danger-pts" style="color:var(--text-muted)">
              ${ti.injuries.length} 名球员受伤 · 影响评分: ${ti.totalImpact}
            </div>
            <div style="margin-top:6px">
              <div style="height:4px;background:var(--bg-secondary);border-radius:2px;overflow:hidden;max-width:120px">
                <div style="height:100%;width:${impactPct}%;background:linear-gradient(90deg,var(--yellow),var(--red));border-radius:2px"></div>
              </div>
            </div>
          </div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:10px;color:var(--text-muted)">战力影响</div>
            <div style="font-size:18px;font-weight:800;color:${levelColor}">${level}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // -------------------------------------------------------
  // Init
  // -------------------------------------------------------
  function init() {
    renderKPI();
    renderTable();
    renderFormChart();
    renderSeverityChart();
    renderFormRadar();
    renderImpactAnalysis();
  }

  return { init };
})();
