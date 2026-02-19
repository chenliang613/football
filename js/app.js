// ============================================================
// app.js — 主应用（Tab 路由 + DataService 接入 + 实时面板）
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
  // 顶部状态栏（navbar 右侧小指示器）
  // -------------------------------------------------------
  const navStatusEl = document.getElementById('data-status');
  const navRefreshBtn = document.getElementById('refresh-btn');

  function setNavStatus(state, text) {
    if (!navStatusEl) return;
    navStatusEl.className = `data-status status-${state}`;
    navStatusEl.innerHTML = `<span class="status-dot">●</span> ${text}`;
  }

  // -------------------------------------------------------
  // 时间工具
  // -------------------------------------------------------
  function fmtTime(date) {
    if (!date) return '—';
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }

  function relativeTime(date) {
    if (!date) return '—';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff <  5)  return '刚刚';
    if (diff < 60)  return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    return fmtTime(date);
  }

  // -------------------------------------------------------
  // 实时数据浮动面板
  // -------------------------------------------------------
  const panel         = document.getElementById('live-panel');
  const toggleBtn     = document.getElementById('live-toggle-btn');
  const toggleDot     = document.getElementById('live-toggle-dot');
  const closeBtn      = document.getElementById('live-panel-close');
  const panelDot      = document.getElementById('panel-status-dot');
  const panelText     = document.getElementById('panel-status-text');
  const panelTime     = document.getElementById('panel-update-time');
  const panelRefresh  = document.getElementById('panel-refresh-btn');
  const panelRefreshIcon = document.getElementById('panel-refresh-icon');
  const panelApiHint  = document.getElementById('panel-api-hint');
  const panelAutoToggle = document.getElementById('panel-auto-toggle');
  const panelInterval = document.getElementById('panel-interval-text');

  let _timeTimer = null;   // 相对时间更新定时器

  // 面板状态映射
  const STATE_MAP = {
    loading: { dot: 'loading', text: '数据更新中…',                nav: '数据更新中…' },
    ready:   { dot: 'ready',   text: '已同步实时数据',              nav: null /* 动态 */ },
    error:   { dot: 'error',   text: 'API 错误，显示静态数据',       nav: 'API 错误 · 使用静态数据' },
    offline: { dot: 'offline', text: '离线模式，显示静态数据',       nav: '离线模式 · 配置 API Key 可启用实时数据' },
  };

  function applyPanelState(state) {
    const cfg = STATE_MAP[state] || STATE_MAP.offline;

    // 浮动按钮上的小圆点
    if (toggleDot) {
      toggleDot.className = `live-toggle-dot ${cfg.dot}`;
    }

    // 面板内状态行
    if (panelDot)  { panelDot.className = `panel-dot ${cfg.dot}`; }
    if (panelText) { panelText.textContent = cfg.text; }

    // 刷新按钮状态
    if (panelRefresh) {
      const isLoading = state === 'loading';
      panelRefresh.disabled = isLoading || state === 'offline';
      panelRefresh.classList.toggle('loading', isLoading);
    }

    // 无 API Key 时显示提示
    if (panelApiHint) {
      panelApiHint.style.display = (state === 'offline') ? 'block' : 'none';
    }

    // 导航栏状态
    if (navRefreshBtn) {
      navRefreshBtn.disabled = state === 'loading' || state === 'offline';
    }
  }

  function updatePanelTime() {
    if (!panelTime) return;
    const t = DataService.lastUpdate;
    panelTime.textContent = t ? relativeTime(t) : '—';
  }

  function startTimeTimer() {
    stopTimeTimer();
    _timeTimer = setInterval(updatePanelTime, 30_000);
  }

  function stopTimeTimer() {
    if (_timeTimer) { clearInterval(_timeTimer); _timeTimer = null; }
  }

  // 刷新间隔文字
  function updateIntervalText() {
    if (!panelInterval || !CONFIG) return;
    const mins = Math.round(CONFIG.REFRESH_INTERVAL / 60_000);
    panelInterval.textContent = mins >= 60
      ? `每${Math.round(mins / 60)}小时`
      : `每${mins}分钟`;
  }

  // 面板展开 / 收起
  function togglePanel() {
    if (panel) panel.classList.toggle('collapsed');
  }

  function closePanel() {
    if (panel) panel.classList.add('collapsed');
  }

  function setupLivePanel() {
    if (!panel) return;

    updateIntervalText();

    // 展开/收起
    if (toggleBtn) toggleBtn.addEventListener('click', togglePanel);
    if (closeBtn)  closeBtn.addEventListener('click', closePanel);

    // 立即更新
    if (panelRefresh) {
      panelRefresh.addEventListener('click', () => {
        if (DataService.status !== 'loading') {
          DataService.refresh().catch(() => {});
        }
      });
    }

    // 导航栏小刷新按钮（同步）
    if (navRefreshBtn) {
      navRefreshBtn.addEventListener('click', () => {
        if (DataService.status !== 'loading') {
          DataService.refresh().catch(() => {});
        }
      });
    }

    // 自动刷新开关
    if (panelAutoToggle) {
      panelAutoToggle.addEventListener('change', () => {
        if (panelAutoToggle.checked) {
          DataService.startAutoRefresh();
        } else {
          DataService.stopAutoRefresh();
        }
      });
    }

    // 初始状态
    applyPanelState(DataService.status || 'offline');
  }

  // -------------------------------------------------------
  // Tab 切换
  // -------------------------------------------------------
  function showTab(tabName) {
    if (!TABS.includes(tabName)) return;

    document.querySelectorAll('.tab-panel').forEach(p => {
      p.classList.toggle('active', p.id === `tab-${tabName}`);
    });
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tab === tabName);
    });

    activeTab = tabName;

    if (!initialised[tabName]) {
      initialised[tabName] = true;
      initModule(tabName);
    }
  }

  function initModule(tabName) {
    switch (tabName) {
      case 'standings':   StandingsModule.init();   break;
      case 'matches':     MatchesModule.init();     break;
      case 'players':     PlayersModule.init();     break;
      case 'predictions': PredictionsModule.init(); break;
      case 'injuries':    InjuriesModule.init();    break;
    }
  }

  function refreshModule(tabName) {
    switch (tabName) {
      case 'standings':   StandingsModule.refresh();   break;
      case 'matches':     MatchesModule.refresh();     break;
      case 'players':     PlayersModule.refresh();     break;
      case 'predictions': PredictionsModule.refresh(); break;
      case 'injuries':    InjuriesModule.refresh();    break;
    }
  }

  function bindTabs() {
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });
  }

  // -------------------------------------------------------
  // DataService 事件订阅
  // -------------------------------------------------------
  function setupDataService() {
    DataService.subscribe((event, payload) => {
      switch (event) {

        case 'status': {
          applyPanelState(payload);

          // 导航栏状态文字
          switch (payload) {
            case 'loading':
              setNavStatus('loading', '数据更新中…');
              break;
            case 'ready':
              setNavStatus('ready', `实时数据 · ${fmtTime(DataService.lastUpdate)}`);
              updatePanelTime();
              startTimeTimer();
              break;
            case 'error':
              setNavStatus('error', 'API 错误 · 使用静态数据');
              break;
            case 'offline':
              setNavStatus('offline', '离线模式 · 配置 API Key 可启用实时数据');
              break;
          }
          break;
        }

        case 'updated': {
          // 刷新当前激活 Tab；其余 Tab 重置，下次切换时以新数据重新初始化
          if (initialised[activeTab]) {
            Object.keys(initialised).forEach(tab => {
              if (tab !== activeTab) delete initialised[tab];
            });
            refreshModule(activeTab);
          }
          break;
        }

        case 'error': {
          console.warn('[App] DataService error:', payload);
          // 根据 HTTP 状态码细化导航栏提示
          let errMsg = 'API 错误 · 使用静态数据';
          if (payload && typeof payload === 'object') {
            const code = payload.httpStatus;
            if (code === 401 || code === 403) errMsg = 'API Key 无效 · 请检查 config.js';
            else if (code === 429)            errMsg = 'API 请求过于频繁 · 稍后重试';
          }
          setNavStatus('error', errMsg);
          break;
        }
      }
    });
  }

  // -------------------------------------------------------
  // 入口
  // -------------------------------------------------------
  function main() {
    bindTabs();
    setupLivePanel();
    setupDataService();

    // 先用静态数据渲染首屏
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
