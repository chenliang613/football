/**
 * 2026世界杯冠军预测 - 图表管理
 * 使用 Chart.js v4.4.4
 */
const WCCharts = (() => {
    'use strict';

    let doughnutChart = null;
    let stackedChart = null;
    let radarChart = null;

    // Chart.js 全局配置
    Chart.defaults.color = '#a0a8c0';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
    Chart.defaults.font.family = "'Segoe UI', system-ui, -apple-system, sans-serif";

    const DIM_COLORS = WCAnalysis.DIMENSION_COLORS;
    const DIM_LABELS = WCAnalysis.DIMENSION_LABELS;

    // ===== 环形图：Top6概率分布 =====
    function updateDoughnut(rankings) {
        const ctx = document.getElementById('chart-doughnut');
        if (!ctx) return;

        const top6 = rankings.slice(0, 5);
        const othersProb = rankings.slice(5).reduce((s, r) => s + r.probability, 0);

        const labels = top6.map(r => `${r.team.flag} ${r.team.name}`).concat(['其他']);
        const data = top6.map(r => +(r.probability * 100).toFixed(1)).concat([+(othersProb * 100).toFixed(1)]);
        const colors = top6.map(r => r.team.color || '#666').concat(['#444']);

        if (doughnutChart) {
            doughnutChart.data.labels = labels;
            doughnutChart.data.datasets[0].data = data;
            doughnutChart.data.datasets[0].backgroundColor = colors;
            doughnutChart.update('none');
            return;
        }

        doughnutChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: colors,
                    borderColor: '#0d0d1a',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '55%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { padding: 12, font: { size: 11, weight: 600 }, usePointStyle: true, pointStyleWidth: 10 }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.label}: ${ctx.raw}%`
                        }
                    }
                }
            }
        });
    }

    // ===== 堆叠柱状图：四维分数对比 =====
    function updateStacked(rankings) {
        const ctx = document.getElementById('chart-stacked');
        if (!ctx) return;

        const labels = rankings.map(r => r.team.name);
        const dims = ['history', 'squadValue', 'keyPlayers', 'homeAdvantage'];

        const datasets = dims.map(dim => ({
            label: DIM_LABELS[dim],
            data: rankings.map(r => +r.scores[dim].toFixed(1)),
            backgroundColor: DIM_COLORS[dim] + 'cc',
            borderColor: DIM_COLORS[dim],
            borderWidth: 1,
            borderRadius: 2
        }));

        if (stackedChart) {
            stackedChart.data.labels = labels;
            stackedChart.data.datasets = datasets;
            stackedChart.update('none');
            return;
        }

        stackedChart = new Chart(ctx, {
            type: 'bar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        ticks: { font: { size: 10, weight: 600 }, maxRotation: 45 },
                        grid: { display: false }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: { font: { size: 10 } },
                        grid: { color: 'rgba(255,255,255,0.04)' }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { padding: 14, font: { size: 11, weight: 600 }, usePointStyle: true, pointStyleWidth: 10 }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            footer: items => {
                                const total = items.reduce((s, i) => s + i.raw, 0);
                                return `综合: ${total.toFixed(1)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // ===== 雷达图：球队四维画像 =====
    function updateRadar(teamDataArray) {
        const ctx = document.getElementById('chart-radar');
        if (!ctx) return;

        const labels = Object.values(DIM_LABELS);
        const dims = Object.keys(DIM_LABELS);

        const datasets = teamDataArray.map((td, i) => ({
            label: `${td.team.flag} ${td.team.name}`,
            data: dims.map(d => +td.scores[d].toFixed(1)),
            backgroundColor: (i === 0 ? 'rgba(233,0,82,0.2)' : 'rgba(0,191,255,0.2)'),
            borderColor: (i === 0 ? '#e90052' : '#00bfff'),
            borderWidth: 2,
            pointBackgroundColor: (i === 0 ? '#e90052' : '#00bfff'),
            pointRadius: 4
        }));

        if (radarChart) {
            radarChart.data.datasets = datasets;
            radarChart.update('none');
            return;
        }

        radarChart = new Chart(ctx, {
            type: 'radar',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { stepSize: 20, font: { size: 10 }, backdropColor: 'transparent' },
                        grid: { color: 'rgba(255,255,255,0.08)' },
                        angleLines: { color: 'rgba(255,255,255,0.08)' },
                        pointLabels: { font: { size: 12, weight: 700 } }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { padding: 14, font: { size: 12, weight: 600 } }
                    }
                }
            }
        });
    }

    // 销毁所有图表
    function destroyAll() {
        if (doughnutChart) { doughnutChart.destroy(); doughnutChart = null; }
        if (stackedChart) { stackedChart.destroy(); stackedChart = null; }
        if (radarChart) { radarChart.destroy(); radarChart = null; }
    }

    return {
        updateDoughnut,
        updateStacked,
        updateRadar,
        destroyAll
    };
})();
