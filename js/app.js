// ============================================================
// app.js — 主应用（Tab 路由 + DataService 接入）
// ============================================================

(function () {
  'use strict';

  // -------------------------------------------------------
  // Chart.js 全局默认值
  // -------------------------------------------------------
  Chart.defaults.color = '#a0a8c0';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family = "'Segoe UI', system-ui, -apple-system, sans-serif";

  // -------------------------------------------------------
  // Tab 状态
  // -------------------------------------------------------
  const TABS = ['standings', 'matches', 'players', 'predictions', 'injuries'];
  const initialised = {};
  let activeTab = 'standings';

  // -------------------------------------------------------
  // 状态栏
  // -------------------------------------------------------
  const statusEl    = document.getElementById('data-status');
  const refreshBtn  = document.getElementById('refresh-btn');

  function setStatus(state, text) {
    if (!statusEl) return;
    statusEl.className = `data-status status-${state}`;
    statusEl.innerHTML = `<span class="status-dot">●</span> ${text}`;
  }

  function fmt(date) {
    if (!date) return '';
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  // -------------------------------------------------------
  // Tab 切换
  // -------------------------------------------------------
  function showTab(tabName) {
    if (!TABS.includes(tabName)) return;

    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    activeTab = tabName;

    if (!initialised[tabName]) {
      initialised[tabName] = true;
      initModule(tabName);
    }
  }

  // -------------------------------------------------------
  // 模块初始化（首次进入 Tab）
  // -------------------------------------------------------
  function initModule(tabName) {
    switch (tabName) {
      case 'standings':   StandingsModule.init();   break;
      case 'matches':     MatchesModule.init();     break;
      case 'players':     PlayersModule.init();     break;
      case 'predictions': PredictionsModule.init(); break;
      case 'injuries':    InjuriesModule.init();    break;
    }
  }

  // -------------------------------------------------------
  // 模块刷新（数据更新后重新渲染，不重绑事件）
  // -------------------------------------------------------
  function refreshModule(tabName) {
    switch (tabName) {
      case 'standings':   StandingsModule.refresh();   break;
      case 'matches':     MatchesModule.refresh();     break;
      case 'players':     PlayersModule.refresh();     break;
      case 'predictions': PredictionsModule.refresh(); break;
      case 'injuries':    InjuriesModule.refresh();    break;
    }
  }

  // -------------------------------------------------------
  // 绑定 Tab 导航按钮
  // -------------------------------------------------------
  function bindTabs() {
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });
  }

  // -------------------------------------------------------
  // DataService 订阅
  // -------------------------------------------------------
  function setupDataService() {
    DataService.subscribe((event, payload) => {
      switch (event) {

        case 'status':
          switch (payload) {
            case 'loading':
              setStatus('loading', '数据更新中…');
              if (refreshBtn) refreshBtn.disabled = true;
              break;
            case 'ready':
              setStatus('ready', `实时数据 · ${fmt(DataService.lastUpdate)}`);
              if (refreshBtn) refreshBtn.disabled = false;
              break;
            case 'error':
              setStatus('error', 'API 错误 · 使用静态数据');
              if (refreshBtn) refreshBtn.disabled = false;
              break;
            case 'offline':
              setStatus('offline', '离线模式 · 配置 API Key 可启用实时数据');
              if (refreshBtn) refreshBtn.disabled = false;
              break;
          }
          break;

        case 'updated':
          // 刷新当前激活的 Tab；其余 Tab 重置 initialised 标记，
          // 下次切换时会以新数据重新初始化
          if (initialised[activeTab]) {
            Object.keys(initialised).forEach(tab => {
              if (tab !== activeTab) delete initialised[tab];
            });
            refreshModule(activeTab);
          }
          break;

        case 'error':
          console.warn('[App] DataService error:', payload);
          break;
      }
    });

    // 手动刷新按钮
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        if (DataService.status !== 'loading') {
          DataService.refresh().catch(() => {});
        }
      });
    }
  }

  // -------------------------------------------------------
  // 入口
  // -------------------------------------------------------
  function main() {
    bindTabs();
    setupDataService();

    // 先用静态数据渲染首屏，不阻塞 UI
    showTab('standings');

    // 再异步拉取实时数据（若已配置 API Key）
    DataService.init().catch(err => console.warn('[App] DataService.init:', err));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }

})();
