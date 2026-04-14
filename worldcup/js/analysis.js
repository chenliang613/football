/**
 * 2026世界杯冠军预测 - 评分引擎
 * 四维评分模型 + Softmax概率转换
 * 权重：德转身价40% + 球员状态20% + 历史战绩20% + 其他20%
 */
const WCAnalysis = (() => {
    'use strict';

    const DEFAULT_WEIGHTS = {
        squadValue: 0.40,
        keyPlayers: 0.20,
        history: 0.20,
        other: 0.20
    };

    const DIMENSION_LABELS = {
        squadValue: '德转身价',
        keyPlayers: '球员状态',
        history: '历史战绩',
        other: '其他'
    };

    const DIMENSION_COLORS = {
        squadValue: '#00bfff',
        keyPlayers: '#00e676',
        history: '#ff6b35',
        other: '#ffd600'
    };

    // 大赛成绩映射分值
    const RESULT_SCORE = { W: 15, F: 12, SF: 9, QF: 6, R16: 3, GS: 0, DNQ: -2 };

    // 赛事权重
    const TOURNAMENT_WEIGHT = {
        WC: 1.0, EU: 0.6, CA: 0.5, AC: 0.35, GC: 0.25, NL: 0.3, FIN: 0.1
    };

    // 时间衰减
    function yearWeight(yearStr) {
        const y = parseInt(yearStr);
        if (y >= 2024) return 1.0;
        if (y >= 2022) return 0.85;
        if (y >= 2020) return 0.6;
        if (y >= 2018) return 0.45;
        if (y >= 2016) return 0.3;
        return 0.2;
    }

    // "其他"维度 - 用户指定的固定评分（10分制 → 转换为0-100）
    const OTHER_SCORES = {
        FRA: 10, ENG: 9, ESP: 9, POR: 9,
        GER: 8, BRA: 8, ARG: 8, NED: 8, BEL: 8,
        JPN: 6
    };

    // 维度1: 德转身价 (0-100)
    function calcSquadValueScore(team) {
        const sv = team.squadValue;
        const allValues = WC_DATA.teams.map(t => t.squadValue.totalMillionEUR);
        const maxVal = Math.max(...allValues);

        let score = (sv.totalMillionEUR / maxVal) * 70;
        score += Math.min(sv.squadDepth / 30, 1) * 15;

        const agePenalty = Math.abs(sv.averageAge - 26.5);
        score += Math.max(0, 15 - agePenalty * 5);

        return Math.min(Math.max(score, 0), 100);
    }

    // 维度2: 球员状态 (0-100)
    function calcKeyPlayersScore(team) {
        const players = team.keyPlayers;
        if (!players.length) return 0;

        let totalScore = 0;
        players.forEach(p => {
            let pScore = 0;
            pScore += p.avgRating * 8;
            pScore += Math.min(p.clubGoals2526, 30) * 0.4;
            pScore += Math.min(p.clubAssists2526, 20) * 0.3;

            if (p.fitness === 'minor_concern') pScore *= 0.85;
            if (p.fitness === 'injured') pScore *= 0.3;

            pScore += Math.min(p.minutesPlayed / 2500, 1) * 5;
            totalScore += pScore;
        });

        const avg = totalScore / players.length;
        return Math.min(Math.max(avg, 0), 100);
    }

    // 维度3: 历史战绩 (0-100)
    function calcHistoryScore(team) {
        const h = team.history;
        let score = 0;

        // 历史底蕴（占30分）
        score += Math.min(h.titles * 5, 25);
        score += Math.min(h.finals * 1.5, 12);

        // 近10年大赛成绩（占55分）
        let recentScore = 0;
        const entries = Object.entries(h.recentResults);
        entries.forEach(([key, result]) => {
            const yearPart = key.substring(0, 4);
            const typePart = key.substring(4);
            const resultPts = RESULT_SCORE[result] || 0;
            const tWeight = TOURNAMENT_WEIGHT[typePart] || 0.2;
            const yWeight = yearWeight(yearPart);
            recentScore += resultPts * tWeight * yWeight;
        });
        score += Math.min(Math.max(recentScore, 0), 55);

        // 近期胜率（占15分）
        score += (h.recentWinRate || 0) * 15;

        return Math.min(Math.max(score, 0), 100);
    }

    // 维度4: 其他 (0-100) — 用户指定的固定评分
    function calcOtherScore(team) {
        const raw = OTHER_SCORES[team.id] || 5;
        return raw * 10; // 10分制 → 100分制
    }

    // 综合评分
    function calcCompositeScore(team, weights) {
        const w = weights || DEFAULT_WEIGHTS;
        const scores = {
            squadValue: calcSquadValueScore(team),
            keyPlayers: calcKeyPlayersScore(team),
            history: calcHistoryScore(team),
            other: calcOtherScore(team)
        };
        const composite = scores.squadValue * w.squadValue
            + scores.keyPlayers * w.keyPlayers
            + scores.history * w.history
            + scores.other * w.other;
        return { scores, composite };
    }

    // 全部球队排名
    function calcAllTeams(weights) {
        return WC_DATA.teams.map(team => {
            const { scores, composite } = calcCompositeScore(team, weights);
            return { team, scores, composite };
        }).sort((a, b) => b.composite - a.composite);
    }

    // Softmax概率转换
    function calcProbabilities(rankings, temperature) {
        temperature = temperature || 0.06;
        const exps = rankings.map(r => Math.exp(r.composite * temperature));
        const sumExp = exps.reduce((a, b) => a + b, 0);
        return rankings.map((r, i) => ({
            ...r,
            probability: exps[i] / sumExp
        }));
    }

    return {
        DEFAULT_WEIGHTS,
        DIMENSION_LABELS,
        DIMENSION_COLORS,
        OTHER_SCORES,
        RESULT_SCORE,
        TOURNAMENT_WEIGHT,
        calcSquadValueScore,
        calcKeyPlayersScore,
        calcHistoryScore,
        calcOtherScore,
        calcCompositeScore,
        calcAllTeams,
        calcProbabilities
    };
})();
