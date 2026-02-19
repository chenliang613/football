// ============================================================
// api.js — football-data.org REST API v4 客户端
// 文档：https://www.football-data.org/documentation/quickstart
// ============================================================

const API = (() => {
  'use strict';

  // -------------------------------------------------------
  // 通用 fetch 封装
  // -------------------------------------------------------
  async function request(path, params = {}) {
    const url = new URL(CONFIG.DATA_URL + path);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const resp = await fetch(url.toString(), {
      headers: { 'X-Auth-Token': CONFIG.API_KEY },
    });

    if (!resp.ok) {
      const body = await resp.json().catch(() => ({}));
      const err  = new Error(body.message || `HTTP ${resp.status} — ${path}`);
      err.httpStatus = resp.status;
      throw err;
    }

    return resp.json();
  }

  // -------------------------------------------------------
  // 对外暴露的 API 接口
  // -------------------------------------------------------
  return {

    /**
     * 积分榜
     * GET /v4/competitions/{competition}/standings?season={season}
     */
    fetchStandings() {
      return request(`/competitions/${CONFIG.COMPETITION_ID}/standings`, {
        season: CONFIG.SEASON,
      });
    },

    /**
     * 赛季比赛列表（可组合多种过滤条件）
     * GET /v4/competitions/{competition}/matches
     *
     * @param {object} opts
     * @param {number}  [opts.matchday]  - 轮次
     * @param {string}  [opts.dateFrom]  - ISO 日期，如 '2026-02-01'
     * @param {string}  [opts.dateTo]    - ISO 日期
     * @param {string}  [opts.status]    - SCHEDULED | FINISHED | IN_PLAY …
     */
    fetchMatches({ matchday, dateFrom, dateTo, status } = {}) {
      const p = { season: CONFIG.SEASON };
      if (matchday !== undefined) p.matchday = matchday;
      if (dateFrom)               p.dateFrom = dateFrom;
      if (dateTo)                 p.dateTo   = dateTo;
      if (status)                 p.status   = status;
      return request(`/competitions/${CONFIG.COMPETITION_ID}/matches`, p);
    },

    /**
     * 射手榜
     * GET /v4/competitions/{competition}/scorers?season={season}&limit={limit}
     *
     * @param {number} limit - 最多返回多少名球员（默认 20）
     */
    fetchScorers(limit = 20) {
      return request(`/competitions/${CONFIG.COMPETITION_ID}/scorers`, {
        season: CONFIG.SEASON,
        limit,
      });
    },

  };
})();
