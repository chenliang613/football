// ============================================================
// config.js — API 配置
// 使用步骤：
//   1. 前往 https://www.football-data.org/client/register 免费注册
//   2. 将获得的 API Key 填入下方 API_KEY
//   3. 建议将本文件加入 .gitignore，避免 Key 泄露
// ============================================================

const CONFIG = {
  // ← 填入你的 API Key，留空则使用内置静态数据（离线模式）
  API_KEY: '',

  API_BASE:        'https://api.football-data.org/v4',
  COMPETITION_ID:  'PL',   // Premier League
  SEASON:          2025,   // 2025/26 赛季（以开始年份为准）

  // 自动刷新间隔（毫秒）：比赛日建议 60_000，平时 300_000
  REFRESH_INTERVAL: 5 * 60 * 1000,

  // 本地内存缓存有效期（毫秒）
  CACHE_TTL: 3 * 60 * 1000,
};
