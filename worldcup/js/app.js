/**
 * 2026世界杯冠军预测 - 主控制器
 */
const WorldCupApp = (() => {
    'use strict';

    let currentWeights = { ...WCAnalysis.DEFAULT_WEIGHTS };
    let currentRankings = [];
    let selectedTeamIds = [];
    let sortCol = 'composite';
    let sortAsc = false;
    let suppressSlider = false;

    // ===== 初始化 =====
    function init() {
        bindSliders();
        bindResetBtn();
        bindTableSort();
        bindTeamGrid();
        recalculate();
    }

    // ===== 重新计算 =====
    function recalculate() {
        const ranked = WCAnalysis.calcAllTeams(currentWeights);
        currentRankings = WCAnalysis.calcProbabilities(ranked);
        renderAll();
    }

    function renderAll() {
        renderKPI();
        renderPodium();
        renderChampList();
        WCCharts.updateDoughnut(currentRankings);
        WCCharts.updateStacked(currentRankings);
        renderDimTable();
        renderTeamGrid();
        if (selectedTeamIds.length) {
            renderDetail(selectedTeamIds);
        }
    }

    // ===== KPI卡片 =====
    function renderKPI() {
        const totalTitles = WC_DATA.teams.reduce((s, t) => s + t.history.titles, 0);
        const totalValue = WC_DATA.teams.reduce((s, t) => s + t.squadValue.totalMillionEUR, 0);
        const champion = currentRankings[0];

        document.getElementById('kpi-teams').textContent = WC_DATA.teams.length;
        document.getElementById('kpi-titles').textContent = totalTitles;
        document.getElementById('kpi-value').textContent = (totalValue / 100).toFixed(1);
        document.getElementById('kpi-champion').textContent = champion
            ? `${champion.team.flag} ${champion.team.name}`
            : '--';
    }

    // ===== Top3 领奖台 =====
    function renderPodium() {
        const container = document.getElementById('podium-grid');
        const top3 = currentRankings.slice(0, 3);
        const classes = ['gold', 'silver', 'bronze'];
        const rankLabels = ['&#x1F947; 第1名', '&#x1F948; 第2名', '&#x1F949; 第3名'];
        // 显示顺序: 第2、第1、第3
        const order = [1, 0, 2];

        container.innerHTML = order.map(idx => {
            const r = top3[idx];
            if (!r) return '';
            const dims = Object.keys(WCAnalysis.DIMENSION_LABELS);
            const dimTags = dims.map(d =>
                `<span class="podium-dim-tag" style="background:${WCAnalysis.DIMENSION_COLORS[d]}40;color:${WCAnalysis.DIMENSION_COLORS[d]}">${WCAnalysis.DIMENSION_LABELS[d]} ${r.scores[d].toFixed(0)}</span>`
            ).join('');

            return `
                <div class="podium-card ${classes[idx]}">
                    <div class="podium-rank">${rankLabels[idx]}</div>
                    <div class="podium-flag">${r.team.flag}</div>
                    <div class="podium-name">${r.team.name}</div>
                    <div class="podium-probability">${(r.probability * 100).toFixed(1)}%</div>
                    <div class="podium-score">综合评分 ${r.composite.toFixed(1)}</div>
                    <div class="podium-dims">${dimTags}</div>
                </div>
            `;
        }).join('');
    }

    // ===== 概率排行列表 =====
    function renderChampList() {
        const container = document.getElementById('champ-list');
        const maxProb = currentRankings[0] ? currentRankings[0].probability : 1;

        container.innerHTML = currentRankings.map((r, i) => {
            const pct = (r.probability * 100).toFixed(1);
            const width = (r.probability / maxProb * 100).toFixed(1);
            const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
            const activeClass = selectedTeamIds.includes(r.team.id) ? ' active' : '';

            return `
                <div class="champ-row${activeClass}" data-team-id="${r.team.id}">
                    <span class="champ-rank ${rankClass}">${i + 1}</span>
                    <span class="champ-flag">${r.team.flag}</span>
                    <span class="champ-name">${r.team.name}</span>
                    <span class="champ-track"><span class="champ-fill" style="width:${width}%"></span></span>
                    <span class="champ-pct">${pct}%</span>
                </div>
            `;
        }).join('');

        // 点击行选择球队
        container.querySelectorAll('.champ-row').forEach(row => {
            row.addEventListener('click', () => {
                toggleTeam(row.dataset.teamId);
            });
        });
    }

    // ===== 四维评分表格 =====
    function renderDimTable() {
        const tbody = document.getElementById('dim-table-body');
        let sorted = [...currentRankings];

        if (sortCol === 'name') {
            sorted.sort((a, b) => sortAsc
                ? a.team.name.localeCompare(b.team.name)
                : b.team.name.localeCompare(a.team.name));
        } else if (sortCol === 'rank') {
            // default order is by composite desc
            if (sortAsc) sorted.reverse();
        } else if (['squadValue', 'keyPlayers', 'history', 'other'].includes(sortCol)) {
            sorted.sort((a, b) => sortAsc
                ? a.scores[sortCol] - b.scores[sortCol]
                : b.scores[sortCol] - a.scores[sortCol]);
        } else {
            sorted.sort((a, b) => sortAsc
                ? a.composite - b.composite
                : b.composite - a.composite);
        }

        const dims = ['squadValue', 'keyPlayers', 'history', 'other'];

        tbody.innerHTML = sorted.map((r, i) => {
            const dimCells = dims.map(d => {
                const val = r.scores[d].toFixed(1);
                const w = r.scores[d];
                return `<td>${val} <span class="score-bar" style="width:${w * 0.6}px;background:${WCAnalysis.DIMENSION_COLORS[d]}"></span></td>`;
            }).join('');

            return `
                <tr>
                    <td>${i + 1}</td>
                    <td><span class="team-cell">${r.team.flag} ${r.team.name}</span></td>
                    ${dimCells}
                    <td style="font-weight:800;color:var(--accent)">${r.composite.toFixed(1)}</td>
                </tr>
            `;
        }).join('');
    }

    // ===== 球队卡片网格 =====
    function renderTeamGrid() {
        const container = document.getElementById('team-grid');
        container.innerHTML = currentRankings.map(r => {
            const sel = selectedTeamIds.includes(r.team.id) ? ' selected' : '';
            return `
                <div class="team-card${sel}" data-team-id="${r.team.id}">
                    <div class="team-flag">${r.team.flag}</div>
                    <div class="team-name">${r.team.name}</div>
                    <div class="team-name-en">${r.team.nameEn}</div>
                    <div class="team-prob">${(r.probability * 100).toFixed(1)}%</div>
                </div>
            `;
        }).join('');
    }

    // ===== 球队详情面板 =====
    function renderDetail(teamIds) {
        const panel = document.getElementById('detail-panel');
        const content = document.getElementById('detail-content');
        const playerList = document.getElementById('player-list');

        if (!teamIds.length) {
            panel.classList.remove('active');
            return;
        }

        panel.classList.add('active');

        // 获取选中球队的排名数据
        const teamData = teamIds.map(id =>
            currentRankings.find(r => r.team.id === id)
        ).filter(Boolean);

        // 头部信息
        content.innerHTML = teamData.map(td => {
            const t = td.team;
            const h = t.history;
            const resultLabels = { W: '冠军', F: '亚军', SF: '四强', QF: '八强', R16: '16强', GS: '小组赛', DNQ: '未参赛' };
            const resultClasses = { W: 'win', F: 'final', SF: 'semi', QF: 'quarter', R16: 'r16', GS: 'out', DNQ: 'out' };

            const tournNames = { WC: '世界杯', EU: '欧洲杯', CA: '美洲杯', AC: '亚洲杯', NL: '国联', GC: '金杯', FIN: 'FIFA' };
            const badges = Object.entries(h.recentResults).map(([key, res]) => {
                const yr = key.substring(0, 4);
                const type = key.substring(4);
                const tName = tournNames[type] || type;
                return `<span class="history-badge ${resultClasses[res] || 'r16'}">${yr} ${tName} ${resultLabels[res] || res}</span>`;
            }).join('');

            return `
                <div class="detail-header">
                    <span class="detail-flag">${t.flag}</span>
                    <div>
                        <div class="detail-team-name">${t.name}</div>
                        <div class="detail-team-en">${t.nameEn} | ${t.confederation} | 身价 ${t.squadValue.totalMillionEUR}M&euro;</div>
                        <div class="history-badges">
                            <span class="history-badge win">&#127942; ${h.titles}冠</span>
                            <span class="history-badge final">${h.finals}决赛</span>
                            ${badges}
                        </div>
                    </div>
                    <div style="margin-left:auto;text-align:right">
                        <div style="font-size:28px;font-weight:900;color:var(--accent)">${(td.probability * 100).toFixed(1)}%</div>
                        <div style="font-size:11px;color:var(--text-muted)">夺冠概率</div>
                    </div>
                </div>
            `;
        }).join('');

        // 关键球员
        const mainTeam = teamData[0];
        playerList.innerHTML = mainTeam.team.keyPlayers.map(p => {
            const fitClass = p.fitness === 'fit' ? 'fitness-fit' : p.fitness === 'minor_concern' ? 'fitness-minor' : 'fitness-injured';
            const fitLabel = p.fitness === 'fit' ? '健康' : p.fitness === 'minor_concern' ? '轻伤' : '伤停';
            return `
                <div class="player-card">
                    <div>
                        <div class="player-name"><span class="fitness-dot ${fitClass}"></span>${p.name}</div>
                        <div class="player-club">${p.club} | ${p.position} | ${fitLabel}</div>
                    </div>
                    <div class="player-stats">
                        <span><span class="player-stat-val">${p.clubGoals2526}</span><span class="player-stat-label">球</span></span>
                        <span><span class="player-stat-val">${p.clubAssists2526}</span><span class="player-stat-label">助</span></span>
                        <span><span class="player-stat-val">${p.avgRating}</span><span class="player-stat-label">评</span></span>
                    </div>
                </div>
            `;
        }).join('');

        // 雷达图
        WCCharts.updateRadar(teamData);
    }

    // ===== 球队选择切换 =====
    function toggleTeam(teamId) {
        const idx = selectedTeamIds.indexOf(teamId);
        if (idx >= 0) {
            selectedTeamIds.splice(idx, 1);
        } else {
            if (selectedTeamIds.length >= 2) selectedTeamIds.shift();
            selectedTeamIds.push(teamId);
        }
        renderTeamGrid();
        renderChampList();
        renderDetail(selectedTeamIds);
    }

    // ===== 滑块绑定 =====
    function bindSliders() {
        const dims = ['squadValue', 'keyPlayers', 'history', 'other'];
        dims.forEach(dim => {
            const slider = document.getElementById(`slider-${dim}`);
            if (!slider) return;
            slider.addEventListener('input', () => {
                if (suppressSlider) return;
                currentWeights[dim] = parseInt(slider.value) / 100;
                normalizeWeights(dim);
                recalculate();
            });
        });
    }

    function normalizeWeights(changedDim) {
        const total = Object.values(currentWeights).reduce((a, b) => a + b, 0);
        if (Math.abs(total - 1.0) < 0.001) { syncSliders(); return; }

        const otherDims = Object.keys(currentWeights).filter(d => d !== changedDim);
        const otherTotal = otherDims.reduce((s, d) => s + currentWeights[d], 0);
        const target = 1.0 - currentWeights[changedDim];

        if (otherTotal > 0) {
            otherDims.forEach(d => {
                currentWeights[d] = currentWeights[d] / otherTotal * target;
            });
        } else {
            const each = target / otherDims.length;
            otherDims.forEach(d => { currentWeights[d] = each; });
        }
        syncSliders();
    }

    function syncSliders() {
        suppressSlider = true;
        Object.keys(currentWeights).forEach(dim => {
            const slider = document.getElementById(`slider-${dim}`);
            const valSpan = document.getElementById(`val-${dim}`);
            if (slider) {
                slider.value = Math.round(currentWeights[dim] * 100);
                valSpan.textContent = Math.round(currentWeights[dim] * 100) + '%';
            }
        });
        suppressSlider = false;
    }

    // ===== 重置按钮 =====
    function bindResetBtn() {
        document.getElementById('btn-reset-weights').addEventListener('click', () => {
            currentWeights = { ...WCAnalysis.DEFAULT_WEIGHTS };
            syncSliders();
            recalculate();
        });
    }

    // ===== 表格排序 =====
    function bindTableSort() {
        document.querySelectorAll('#dim-table thead th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const col = th.dataset.sort;
                if (sortCol === col) {
                    sortAsc = !sortAsc;
                } else {
                    sortCol = col;
                    sortAsc = false;
                }
                // 更新排序指示
                document.querySelectorAll('#dim-table thead th').forEach(h => h.classList.remove('sorted'));
                th.classList.add('sorted');
                renderDimTable();
            });
        });
    }

    // ===== 球队网格点击 =====
    function bindTeamGrid() {
        document.getElementById('team-grid').addEventListener('click', e => {
            const card = e.target.closest('[data-team-id]');
            if (!card) return;
            toggleTeam(card.dataset.teamId);
        });
    }

    // ===== 启动 =====
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return { recalculate };
})();
