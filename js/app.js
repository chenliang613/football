// ============================================================
// app.js — Main application logic (Tab routing + module init)
// ============================================================

(function () {
  'use strict';

  // -------------------------------------------------------
  // Chart.js global defaults
  // -------------------------------------------------------
  Chart.defaults.color = '#a0a8c0';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.06)';
  Chart.defaults.font.family = "'Segoe UI', system-ui, -apple-system, sans-serif";

  // -------------------------------------------------------
  // Tab state
  // -------------------------------------------------------
  const TABS = ['standings', 'matches', 'players', 'predictions', 'injuries'];
  const initialised = {};
  let activeTab = 'standings';

  // -------------------------------------------------------
  // Tab switching
  // -------------------------------------------------------
  function showTab(tabName) {
    if (!TABS.includes(tabName)) return;

    // Update panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabName}`);
    });

    // Update nav buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    activeTab = tabName;

    // Lazy-init modules (only once per tab)
    if (!initialised[tabName]) {
      initialised[tabName] = true;
      initModule(tabName);
    }
  }

  // -------------------------------------------------------
  // Module init dispatch
  // -------------------------------------------------------
  function initModule(tabName) {
    switch (tabName) {
      case 'standings':
        StandingsModule.init();
        break;
      case 'matches':
        MatchesModule.init();
        break;
      case 'players':
        PlayersModule.init();
        break;
      case 'predictions':
        PredictionsModule.init();
        break;
      case 'injuries':
        InjuriesModule.init();
        break;
    }
  }

  // -------------------------------------------------------
  // Bind nav button clicks
  // -------------------------------------------------------
  function bindTabs() {
    document.querySelectorAll('.tab-btn[data-tab]').forEach(btn => {
      btn.addEventListener('click', () => showTab(btn.dataset.tab));
    });
  }

  // -------------------------------------------------------
  // Entry point
  // -------------------------------------------------------
  function main() {
    bindTabs();
    showTab('standings'); // load first tab immediately
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
  } else {
    main();
  }

})();
