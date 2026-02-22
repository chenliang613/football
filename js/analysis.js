// ============================================================
// analysis.js — 比赛深度分析数据
//
// 数据结构（每场比赛 key = match id）：
//   xg          { home, away }        — 预期进球（Expected Goals）
//   bigChances  { home, away }        — 大好机会次数
//   offsides    { home, away }        — 越位次数
//   tackles     { home, away }        — 铲球次数
//   events      Array                 — 黄牌 / 红牌 / 换人事件
//                 type: 'yellow'|'red'|'sub'
//                 team: 'home'|'away'
//                 player  (yellow/red)
//                 playerOff / playerOn  (sub)
//   ratings     Array { player, team, rating, highlight }
//   narrative   string                — 赛后文字总结
//   momentum    [6 numbers]           — 各15分钟段主队主导度 %
// ============================================================

const MATCH_ANALYSIS = {

  // ── GW26 ────────────────────────────────────────────────────

  // id:1  Brentford 1-1 Arsenal  (Feb 12)
  1: {
    xg:         { home: 0.82, away: 1.93 },
    bigChances: { home: 1, away: 3 },
    offsides:   { home: 2, away: 1 },
    tackles:    { home: 26, away: 22 },
    events: [
      { min: 28, type: 'yellow', team: 'home', player: 'Collins' },
      { min: 52, type: 'sub',    team: 'away', playerOff: 'Tomiyasu',   playerOn: 'Kiwior' },
      { min: 58, type: 'yellow', team: 'home', player: 'Janelt' },
      { min: 63, type: 'yellow', team: 'away', player: 'Rice' },
      { min: 68, type: 'sub',    team: 'home', playerOff: 'Mbeumo',     playerOn: 'Wissa' },
      { min: 75, type: 'sub',    team: 'away', playerOff: 'Ødegaard',   playerOn: 'Smith Rowe' },
      { min: 83, type: 'sub',    team: 'away', playerOff: 'Martinelli', playerOn: 'Nketiah' },
      { min: 85, type: 'sub',    team: 'home', playerOff: 'Toney',      playerOn: 'Schade' },
    ],
    ratings: [
      { player: 'Madueke',      team: 'away', rating: 8.5, highlight: '破门并多次制造威胁' },
      { player: 'Lewis-Potter', team: 'home', rating: 8.0, highlight: '头球扳平，跑动积极' },
      { player: 'Flekken',      team: 'home', rating: 7.9, highlight: '多次扑救化解进攻' },
      { player: 'Trossard',     team: 'away', rating: 7.8, highlight: '传出助攻，控球出色' },
    ],
    narrative: '阿森纳凭借56%的控球和16次射门主导全场，但布伦特福德防线坚固。Madueke第61分钟打破僵局，Lewis-Potter随即第71分钟头球扳平，双方各取一分，阿森纳追赶曼城步伐受阻。',
    momentum: [45, 42, 40, 62, 58, 50],
  },

  // id:2  Man City 3-0 Fulham  (Feb 11)
  2: {
    xg:         { home: 3.18, away: 0.31 },
    bigChances: { home: 5, away: 1 },
    offsides:   { home: 1, away: 2 },
    tackles:    { home: 16, away: 30 },
    events: [
      { min: 32, type: 'yellow', team: 'away', player: 'Reed' },
      { min: 55, type: 'yellow', team: 'home', player: 'Gündoğan' },
      { min: 63, type: 'sub',    team: 'away', playerOff: 'Wilson',    playerOn: 'Iwobi' },
      { min: 68, type: 'sub',    team: 'home', playerOff: 'De Bruyne', playerOn: 'Doku' },
      { min: 72, type: 'yellow', team: 'away', player: 'Andreas' },
      { min: 75, type: 'sub',    team: 'home', playerOff: 'B.Silva',   playerOn: 'Nunes' },
      { min: 80, type: 'sub',    team: 'away', playerOff: 'Lukic',     playerOn: 'Harrison' },
    ],
    ratings: [
      { player: 'Haaland',  team: 'home', rating: 9.5, highlight: '双响，主宰禁区全场' },
      { player: 'B.Silva',  team: 'home', rating: 8.5, highlight: '传射俱佳，进攻核心' },
      { player: 'Bernardo', team: 'home', rating: 8.0, highlight: '控球精准，穿透力强' },
      { player: 'Leno',     team: 'away', rating: 7.0, highlight: '多次扑救阻止更大分差' },
    ],
    narrative: '曼城展现统治级表现，哈兰德连下两城，伯纳多·席尔瓦第42分钟锦上添花。富勒姆全场仅6次射门，完全无法应对曼城的高位压迫，赛季积分差距进一步拉大。',
    momentum: [55, 62, 68, 65, 70, 72],
  },

  // id:3  West Ham 1-1 Man Utd  (Feb 10)
  3: {
    xg:         { home: 1.08, away: 0.91 },
    bigChances: { home: 2, away: 1 },
    offsides:   { home: 1, away: 3 },
    tackles:    { home: 24, away: 22 },
    events: [
      { min: 38, type: 'yellow', team: 'home', player: 'Bowen' },
      { min: 55, type: 'sub',    team: 'away', playerOff: 'Rashford',  playerOn: 'Amad' },
      { min: 67, type: 'yellow', team: 'home', player: 'Kudus' },
      { min: 72, type: 'yellow', team: 'away', player: 'Casemiro' },
      { min: 74, type: 'sub',    team: 'home', playerOff: 'Paquetá',   playerOn: 'Ward-Prowse' },
      { min: 78, type: 'sub',    team: 'away', playerOff: 'Fernandes', playerOn: 'Eriksen' },
      { min: 85, type: 'sub',    team: 'away', playerOff: 'Højlund',   playerOn: 'Sesko' },
    ],
    ratings: [
      { player: 'Sesko',    team: 'away', rating: 8.5, highlight: '替补登场，补时绝平' },
      { player: 'Bowen',    team: 'home', rating: 8.0, highlight: '进球，持续威胁右路' },
      { player: 'Lukáš',    team: 'away', rating: 7.8, highlight: '稳健表现，后防指挥' },
      { player: 'Areola',   team: 'home', rating: 7.5, highlight: '关键时刻扑出险球' },
    ],
    narrative: '博文第68分钟射门令西汉姆看似稳操胜券，但曼联主帅赌博式换上塞斯科奏效，后者在第96分钟补时头球绝平，令主队功亏一篑，两队各得一分。',
    momentum: [52, 48, 55, 58, 55, 48],
  },

  // id:4  Tottenham 1-2 Newcastle  (Feb 11)
  4: {
    xg:         { home: 1.28, away: 1.71 },
    bigChances: { home: 2, away: 3 },
    offsides:   { home: 3, away: 1 },
    tackles:    { home: 20, away: 26 },
    events: [
      { min: 18, type: 'sub',    team: 'away', playerOff: 'Murphy',    playerOn: 'Almiron' },
      { min: 35, type: 'yellow', team: 'away', player: 'Trippier' },
      { min: 52, type: 'yellow', team: 'away', player: 'Tonali' },
      { min: 65, type: 'sub',    team: 'home', playerOff: 'Kulusevski', playerOn: 'Dejan' },
      { min: 72, type: 'yellow', team: 'home', player: 'Davies' },
      { min: 75, type: 'sub',    team: 'home', playerOff: 'Lo Celso',  playerOn: 'Bissouma' },
      { min: 82, type: 'sub',    team: 'away', playerOff: 'Isak',      playerOn: 'Osula' },
    ],
    ratings: [
      { player: 'Gordon', team: 'away', rating: 9.0, highlight: '双响逆转，速度与创造力并存' },
      { player: 'Osula',  team: 'away', rating: 8.0, highlight: '替补助攻，冲劲十足' },
      { player: 'Son',    team: 'home', rating: 7.5, highlight: '进球，但整体影响力受限' },
      { player: 'Pope',   team: 'away', rating: 7.8, highlight: '关键扑救保住领先优势' },
    ],
    narrative: '索恩第28分钟先拔头筹，但热刺下半场被纽卡斯尔反制。戈登的两粒进球彻底改变比赛走向，主队换人未能扭转颓势，纽卡斯尔收获宝贵客场三分。',
    momentum: [55, 52, 50, 48, 42, 38],
  },

  // id:5  Aston Villa 1-0 Brighton  (Feb 11)
  5: {
    xg:         { home: 0.88, away: 1.12 },
    bigChances: { home: 1, away: 2 },
    offsides:   { home: 2, away: 1 },
    tackles:    { home: 22, away: 20 },
    events: [
      { min: 35, type: 'yellow', team: 'away', player: 'Estupinan' },
      { min: 43, type: 'yellow', team: 'home', player: 'Tielemans' },
      { min: 60, type: 'sub',    team: 'away', playerOff: 'Mitoma',   playerOn: 'Rutter' },
      { min: 72, type: 'sub',    team: 'home', playerOff: 'Bailey',   playerOn: 'Ramsey' },
      { min: 75, type: 'sub',    team: 'home', playerOff: 'Diaby',    playerOn: 'Tielemans' },
      { min: 78, type: 'yellow', team: 'away', player: 'Baleba' },
      { min: 82, type: 'sub',    team: 'away', playerOff: 'Welbeck',  playerOn: 'João Pedro(B)' },
    ],
    ratings: [
      { player: 'Watkins', team: 'home', rating: 8.0, highlight: '进球，带球突破多次' },
      { player: 'Flekken', team: 'away', rating: 7.8, highlight: '多次阻止维拉扩大比分' },
      { player: 'Diaby',   team: 'home', rating: 7.5, highlight: '传出助攻，左路活跃' },
      { player: 'Dunk',    team: 'away', rating: 7.2, highlight: '防守稳健，组织后防' },
    ],
    narrative: '布莱顿掌控控球率但缺乏最后一击，维拉在阵地战中更具效率。沃特金斯第63分钟头球是全场唯一进球，弗莱肯多次出击也难改败局，维拉欧冠资格争夺再添三分。',
    momentum: [48, 50, 55, 60, 55, 52],
  },

  // id:6  Crystal Palace 2-3 Burnley  (Feb 11)
  6: {
    xg:         { home: 2.08, away: 2.35 },
    bigChances: { home: 3, away: 4 },
    offsides:   { home: 1, away: 2 },
    tackles:    { home: 18, away: 22 },
    events: [
      { min: 22, type: 'yellow', team: 'away', player: 'Brownhill' },
      { min: 38, type: 'yellow', team: 'home', player: 'Ward' },
      { min: 55, type: 'sub',    team: 'home', playerOff: 'Ayew',      playerOn: 'Edouard' },
      { min: 58, type: 'yellow', team: 'away', player: 'McNeil' },
      { min: 65, type: 'sub',    team: 'away', playerOff: 'Gudmundsson', playerOn: 'Cornet' },
      { min: 75, type: 'sub',    team: 'home', playerOff: 'Mitchell',  playerOn: 'Lerma' },
      { min: 82, type: 'yellow', team: 'away', player: 'Cornet' },
      { min: 88, type: 'sub',    team: 'away', playerOff: 'Rodriguez', playerOn: 'Benson' },
    ],
    ratings: [
      { player: 'Rodriguez', team: 'away', rating: 9.5, highlight: '双响并助攻，全场最佳' },
      { player: 'Brownhill', team: 'away', rating: 8.5, highlight: '绝杀进球，关键时刻挺身而出' },
      { player: 'Mateta',    team: 'home', rating: 8.0, highlight: '进球，带球能力强' },
      { player: 'Eze',       team: 'home', rating: 7.8, highlight: '助攻两次，但最终失利' },
    ],
    narrative: '全场最刺激对决！马特塔和奥利塞两次为水晶宫领先，但伯恩利的罗德里格斯双响加上替补科内传中助攻布朗希尔第85分钟绝杀，完成惊天逆转，降级区球队收获宝贵三分。',
    momentum: [55, 60, 48, 50, 45, 42],
  },

  // id:7  Nott'm Forest 0-0 Wolves  (Feb 11)
  7: {
    xg:         { home: 0.41, away: 0.28 },
    bigChances: { home: 0, away: 0 },
    offsides:   { home: 1, away: 2 },
    tackles:    { home: 28, away: 32 },
    events: [
      { min: 32, type: 'yellow', team: 'home', player: 'Gibbs-White' },
      { min: 44, type: 'yellow', team: 'away', player: 'Cunha' },
      { min: 58, type: 'sub',    team: 'home', playerOff: 'Awoniyi',   playerOn: 'Elanga' },
      { min: 62, type: 'sub',    team: 'away', playerOff: 'Hwang',     playerOn: 'Podence' },
      { min: 67, type: 'yellow', team: 'home', player: 'Anderson' },
      { min: 72, type: 'sub',    team: 'away', playerOff: 'Sarabia',   playerOn: 'Strand Larsen' },
      { min: 78, type: 'yellow', team: 'away', player: 'Semedo' },
    ],
    ratings: [
      { player: 'Turner',  team: 'home', rating: 7.5, highlight: '零封，几乎无险可守' },
      { player: 'José Sá', team: 'away', rating: 7.5, highlight: '零封，阻止为数不多的射门' },
      { player: 'Awoniyi', team: 'home', rating: 7.0, highlight: '上下翻飞但机会难觅' },
      { player: 'Cunha',   team: 'away', rating: 7.0, highlight: '个人突破出彩，结果欠佳' },
    ],
    narrative: '双方在降级压力下均显保守，Forest控球率略高但大好机会寥寥无几。两队门将近乎闲置，0-0平局令双方都感失望，积分榜末位争夺愈发胶着。',
    momentum: [52, 54, 50, 48, 52, 50],
  },

  // id:8  Sunderland 0-1 Liverpool  (Feb 11)
  8: {
    xg:         { home: 0.51, away: 1.58 },
    bigChances: { home: 1, away: 2 },
    offsides:   { home: 2, away: 1 },
    tackles:    { home: 32, away: 20 },
    events: [
      { min: 36, type: 'yellow', team: 'home', player: 'Roberts' },
      { min: 55, type: 'sub',    team: 'away', playerOff: 'Diaz',        playerOn: 'Salah' },
      { min: 58, type: 'yellow', team: 'home', player: 'Clarke' },
      { min: 70, type: 'sub',    team: 'home', playerOff: 'Mayenda',     playerOn: 'Bellingham_J' },
      { min: 72, type: 'yellow', team: 'away', player: 'Gravenberch' },
      { min: 80, type: 'sub',    team: 'away', playerOff: 'Szoboszlai',  playerOn: 'Jones' },
      { min: 83, type: 'sub',    team: 'home', playerOff: 'Stewart',     playerOn: 'Mundle' },
    ],
    ratings: [
      { player: 'Ekitike',    team: 'away', rating: 8.0, highlight: '精准射门锁定胜局' },
      { player: 'Szoboszlai', team: 'away', rating: 7.8, highlight: '助攻，中场掌控全局' },
      { player: 'Joelinton',  team: 'home', rating: 7.5, highlight: '全场最努力的球员' },
      { player: 'Kelleher',   team: 'away', rating: 7.5, highlight: '稳健应对主队反击' },
    ],
    narrative: '利物浦凭借58%的控球和14次射门全面压制桑德兰。埃基蒂克第74分钟斜角劲射破门，主队虽然奋力反扑但机会寥寥，利物浦锁定宝贵客场三分，重新进入争四行列。',
    momentum: [42, 40, 38, 45, 42, 40],
  },

  // id:9  Chelsea 2-2 Leeds  (Feb 10)
  9: {
    xg:         { home: 2.04, away: 1.18 },
    bigChances: { home: 3, away: 2 },
    offsides:   { home: 2, away: 3 },
    tackles:    { home: 18, away: 28 },
    events: [
      { min: 38, type: 'yellow', team: 'home', player: 'Gusto' },
      { min: 60, type: 'sub',    team: 'home', playerOff: 'Madueke',   playerOn: 'Mudryk' },
      { min: 65, type: 'yellow', team: 'away', player: 'Byram' },
      { min: 70, type: 'sub',    team: 'away', playerOff: 'Summerville', playerOn: 'Piroe' },
      { min: 75, type: 'sub',    team: 'home', playerOff: 'Jackson',   playerOn: 'Nkunku' },
      { min: 80, type: 'sub',    team: 'away', playerOff: 'Gnonto',    playerOn: 'Okafor' },
      { min: 83, type: 'yellow', team: 'away', player: 'Struijk' },
    ],
    ratings: [
      { player: 'Palmer',  team: 'home', rating: 8.5, highlight: '进球，助攻，全场创造力核心' },
      { player: 'Okafor',  team: 'away', rating: 8.5, highlight: '替补出场扳平，改变比赛走势' },
      { player: 'Piroe',   team: 'away', rating: 8.0, highlight: '助攻首粒扳平球' },
      { player: 'Jackson', team: 'home', rating: 7.5, highlight: '开场进球，带动进攻' },
    ],
    narrative: '切尔西上半场双球领先，看似胜券在握。但利兹凭借顽强意志下半场双次扳平，奥卡福和皮罗的替补冲击完全改变局面，切尔西再度在家门口丢掉领先优势，欧冠席位出现危机。',
    momentum: [58, 62, 55, 48, 45, 42],
  },

  // id:10  Everton 1-2 Bournemouth  (Feb 10)
  10: {
    xg:         { home: 1.12, away: 1.84 },
    bigChances: { home: 2, away: 3 },
    offsides:   { home: 1, away: 2 },
    tackles:    { home: 22, away: 20 },
    events: [
      { min: 34, type: 'yellow', team: 'home', player: 'Gueye' },
      { min: 52, type: 'yellow', team: 'away', player: 'Christie' },
      { min: 60, type: 'sub',    team: 'home', playerOff: 'Calvert-Lewin', playerOn: 'Branthwaite' },
      { min: 65, type: 'sub',    team: 'away', playerOff: 'Cook',       playerOn: 'Zemura' },
      { min: 67, type: 'yellow', team: 'home', player: 'Patterson' },
      { min: 72, type: 'sub',    team: 'home', playerOff: 'McNeil',     playerOn: 'Young' },
      { min: 78, type: 'sub',    team: 'away', playerOff: 'Kluivert',   playerOn: 'Ouattara' },
    ],
    ratings: [
      { player: 'Kluivert',  team: 'away', rating: 8.5, highlight: '进球并持续威胁，全场最佳' },
      { player: 'Ouattara',  team: 'away', rating: 8.0, highlight: '替补制胜一击，逃离降级区' },
      { player: 'Beto',      team: 'home', rating: 7.5, highlight: '先开纪录，顽强拼搏' },
      { player: 'Flekken',   team: 'away', rating: 7.5, highlight: '关键时刻扑救封死主队机会' },
    ],
    narrative: '贝托第38分钟先开纪录，但伯恩茅斯展现出强大的反弹力。克鲁弗特第58分钟扳平，替补乌亚塔拉在第82分钟打入制胜一球，伯恩茅斯爬出降级区，埃弗顿越陷越深。',
    momentum: [52, 55, 48, 45, 42, 38],
  },

  // ── GW25 ────────────────────────────────────────────────────

  // id:11  Liverpool 1-2 Man City  (Feb 8)
  11: {
    xg:         { home: 1.72, away: 2.08 },
    bigChances: { home: 2, away: 3 },
    offsides:   { home: 2, away: 1 },
    tackles:    { home: 22, away: 20 },
    events: [
      { min: 28, type: 'sub',    team: 'away', playerOff: 'Doku',       playerOn: 'Semenyo' },
      { min: 42, type: 'yellow', team: 'home', player: 'Gravenberch' },
      { min: 60, type: 'sub',    team: 'home', playerOff: 'Diaz',       playerOn: 'Salah' },
      { min: 65, type: 'sub',    team: 'away', playerOff: 'De Bruyne',  playerOn: 'Kovacic' },
      { min: 70, type: 'sub',    team: 'home', playerOff: 'Ekitike',    playerOn: 'Firmino' },
      { min: 74, type: 'yellow', team: 'home', player: 'Quansah' },
      { min: 78, type: 'yellow', team: 'away', player: 'Kovacic' },
    ],
    ratings: [
      { player: 'Haaland',    team: 'away', rating: 9.0, highlight: '补时绝杀，全场高价值跑位' },
      { player: 'B.Silva',    team: 'away', rating: 8.5, highlight: '进球，全场压迫核心' },
      { player: 'Szoboszlai', team: 'home', rating: 8.0, highlight: '破门领先，斗志昂扬' },
      { player: 'Kelleher',   team: 'home', rating: 7.8, highlight: '多次扑救拖住曼城进攻' },
    ],
    narrative: '安菲尔德顶级碰撞！萨博斯拉伊第74分钟射门领先，但伯纳多·席尔瓦84分钟扳平，哈兰德在第93分钟补时用头球终结战斗，令安菲尔德一片寂静，曼城追分步伐加快。',
    momentum: [48, 55, 52, 48, 45, 40],
  },

  // id:12  Arsenal 3-0 Sunderland  (Feb 7)
  12: {
    xg:         { home: 3.41, away: 0.19 },
    bigChances: { home: 6, away: 0 },
    offsides:   { home: 1, away: 3 },
    tackles:    { home: 14, away: 30 },
    events: [
      { min: 28, type: 'yellow', team: 'away', player: 'Roberts' },
      { min: 50, type: 'sub',    team: 'away', playerOff: 'Mayenda',    playerOn: 'Mundle' },
      { min: 55, type: 'yellow', team: 'away', player: 'Stewart' },
      { min: 65, type: 'sub',    team: 'home', playerOff: 'Havertz',    playerOn: 'Nketiah' },
      { min: 70, type: 'sub',    team: 'home', playerOff: 'Martinelli', playerOn: 'Smith Rowe' },
      { min: 75, type: 'sub',    team: 'away', playerOff: 'Clarke',     playerOn: 'Bellingham_J' },
      { min: 78, type: 'yellow', team: 'away', player: 'Bellingham_J' },
    ],
    ratings: [
      { player: 'Martinelli', team: 'home', rating: 9.0, highlight: '精准射门，持续威胁左路' },
      { player: 'Havertz',    team: 'home', rating: 8.8, highlight: '开场进球，跑位聪明' },
      { player: 'Ødegaard',   team: 'home', rating: 8.5, highlight: '传球大师，组织进攻' },
      { player: 'Rice',       team: 'home', rating: 8.0, highlight: '中场保障，防守进攻兼顾' },
    ],
    narrative: '完美的主场表现！哈弗茨第23分钟率先破门，马丁内利第52分钟精准斜射，特罗萨尔第78分钟锁定比分，阿森纳62%的控球和18次射门令桑德兰毫无招架之力。',
    momentum: [62, 65, 68, 70, 65, 62],
  },

  // id:13  Newcastle 2-3 Brentford  (Feb 7)
  13: {
    xg:         { home: 2.24, away: 1.98 },
    bigChances: { home: 3, away: 3 },
    offsides:   { home: 2, away: 2 },
    tackles:    { home: 22, away: 24 },
    events: [
      { min: 30, type: 'yellow', team: 'home', player: 'Trippier' },
      { min: 45, type: 'yellow', team: 'away', player: 'Pinnock' },
      { min: 58, type: 'sub',    team: 'home', playerOff: 'Almiron',   playerOn: 'Barnes' },
      { min: 68, type: 'yellow', team: 'home', player: 'Tonali' },
      { min: 70, type: 'sub',    team: 'away', playerOff: 'Roerslev',  playerOn: 'Hickey' },
      { min: 72, type: 'yellow', team: 'away', player: 'Roerslev' },
      { min: 78, type: 'sub',    team: 'home', playerOff: 'Murphy',    playerOn: 'Osula' },
      { min: 82, type: 'sub',    team: 'away', playerOff: 'Carvalho',  playerOn: 'Mee' },
    ],
    ratings: [
      { player: 'Thiago',       team: 'away', rating: 9.0, highlight: '双响，全场爆炸级表现' },
      { player: 'Lewis-Potter', team: 'away', rating: 8.5, highlight: '绝杀进球，关键抉择时刻' },
      { player: 'Gordon',       team: 'home', rating: 8.0, highlight: '两度领先，难掩失落' },
      { player: 'Wissa',        team: 'away', rating: 7.8, highlight: '持续冲击，搅乱防线' },
    ],
    narrative: '圣詹姆斯公园激战！戈登两度帮助纽卡斯尔领先，但蒂亚戈两次扳平，刘易斯-波特在第85分钟绝杀完成惊天逆转，布伦特福德凭借不屈精神抢走三分。',
    momentum: [55, 52, 48, 45, 42, 38],
  },

  // id:14  Man Utd 2-0 Tottenham  (Feb 7)
  14: {
    xg:         { home: 1.92, away: 0.58 },
    bigChances: { home: 3, away: 1 },
    offsides:   { home: 1, away: 3 },
    tackles:    { home: 20, away: 26 },
    events: [
      { min: 32, type: 'yellow', team: 'away', player: 'Sarr' },
      { min: 38, type: 'yellow', team: 'home', player: 'Casemiro' },
      { min: 55, type: 'sub',    team: 'away', playerOff: 'Johnson',   playerOn: 'Spence' },
      { min: 58, type: 'sub',    team: 'home', playerOff: 'Højlund',   playerOn: 'Sesko' },
      { min: 65, type: 'sub',    team: 'away', playerOff: 'Kulusevski', playerOn: 'Lo Celso' },
      { min: 75, type: 'yellow', team: 'away', player: 'Davies' },
      { min: 78, type: 'sub',    team: 'home', playerOff: 'Mbeumo',    playerOn: 'Rashford' },
    ],
    ratings: [
      { player: 'Mbeumo',    team: 'home', rating: 8.8, highlight: '进球并助攻，双向压迫核心' },
      { player: 'Fernandes', team: 'home', rating: 8.5, highlight: '传出助攻，节奏控制大师' },
      { player: 'Sesko',     team: 'home', rating: 8.0, highlight: '替补进球，改变比赛' },
      { player: 'Forster',   team: 'away', rating: 7.2, highlight: '扑救阻止分差扩大' },
    ],
    narrative: '曼联在主场完全压制热刺，姆邦和第38分钟精准射门，塞斯科第72分钟替补进球终结悬念。热刺全场被动，有效射门极少，降级威胁逐渐浮现。',
    momentum: [55, 58, 60, 62, 65, 60],
  },

  // id:15  Leeds 3-1 Nott'm Forest  (Feb 6)
  15: {
    xg:         { home: 2.78, away: 0.82 },
    bigChances: { home: 4, away: 1 },
    offsides:   { home: 1, away: 2 },
    tackles:    { home: 20, away: 28 },
    events: [
      { min: 30, type: 'yellow', team: 'away', player: 'Anderson' },
      { min: 55, type: 'sub',    team: 'away', playerOff: 'Awoniyi',   playerOn: 'Elanga' },
      { min: 58, type: 'yellow', team: 'home', player: 'Struijk' },
      { min: 60, type: 'sub',    team: 'away', playerOff: 'Hudson-Odoi', playerOn: 'Montiel' },
      { min: 65, type: 'sub',    team: 'home', playerOff: 'Byram',     playerOn: 'Bamford' },
      { min: 68, type: 'yellow', team: 'away', player: 'Gibbs-White' },
      { min: 75, type: 'sub',    team: 'away', playerOff: 'Wood',      playerOn: 'Brereton' },
    ],
    ratings: [
      { player: 'Calvert-Lewin', team: 'home', rating: 9.0, highlight: '进球并助攻，带动全队' },
      { player: 'Gnonto',        team: 'home', rating: 8.5, highlight: '进球，突破能力出众' },
      { player: 'Piroe',         team: 'home', rating: 8.0, highlight: '锁定比分，高效完成任务' },
      { player: 'Summerville',   team: 'home', rating: 7.8, highlight: '传球创造机会，全场活跃' },
    ],
    narrative: '利兹联在主场发挥出色！卡尔弗特-卢因头球破门，诺托第44分钟精准射门奠定胜局，阿沃尼伊减分但皮罗第83分钟终结悬念，升班马展现保级决心。',
    momentum: [58, 62, 60, 55, 60, 62],
  },

  // id:16  Wolves 1-3 Chelsea  (Feb 7)
  16: {
    xg:         { home: 0.62, away: 3.08 },
    bigChances: { home: 1, away: 5 },
    offsides:   { home: 1, away: 2 },
    tackles:    { home: 28, away: 18 },
    events: [
      { min: 38, type: 'yellow', team: 'home', player: 'Semedo' },
      { min: 48, type: 'sub',    team: 'home', playerOff: 'Hwang',     playerOn: 'Strand Larsen' },
      { min: 55, type: 'yellow', team: 'away', player: 'Caicedo' },
      { min: 62, type: 'sub',    team: 'away', playerOff: 'Madueke',   playerOn: 'Mudryk' },
      { min: 65, type: 'yellow', team: 'home', player: 'Cunha' },
      { min: 72, type: 'sub',    team: 'home', playerOff: 'Sarabia',   playerOn: 'Podence' },
      { min: 78, type: 'sub',    team: 'away', playerOff: 'Palmer',    playerOn: 'Nkunku' },
    ],
    ratings: [
      { player: 'Palmer',    team: 'away', rating: 9.0, highlight: '进球并双助攻，赛季最佳表现' },
      { player: 'Joao Pedro', team: 'away', rating: 8.8, highlight: '进球并助攻，禁区内无可阻挡' },
      { player: 'Jackson',   team: 'away', rating: 8.0, highlight: '进球，跑位聪明' },
      { player: 'Cunha',     team: 'home', rating: 7.5, highlight: '一球减分，独木难支' },
    ],
    narrative: '切尔西三线压迫令狼队毫无喘息之机，帕尔默传球犀利辅助两球并亲自进账。坎哈第28分钟的减分球如昙花一现，此后切尔西完全统治比赛，60%的控球和18次射门碾压式胜利。',
    momentum: [40, 38, 35, 30, 32, 35],
  },

  // id:17  Fulham 1-2 Everton  (Feb 7)
  17: {
    xg:         { home: 1.02, away: 1.58 },
    bigChances: { home: 1, away: 2 },
    offsides:   { home: 2, away: 1 },
    tackles:    { home: 22, away: 24 },
    events: [
      { min: 28, type: 'yellow', team: 'away', player: 'Patterson' },
      { min: 45, type: 'yellow', team: 'home', player: 'Reed' },
      { min: 55, type: 'sub',    team: 'home', playerOff: 'Wilson',    playerOn: 'Iwobi' },
      { min: 60, type: 'sub',    team: 'away', playerOff: 'McNeil',    playerOn: 'Young' },
      { min: 65, type: 'sub',    team: 'home', playerOff: 'Lukic',     playerOn: 'Vinicius' },
      { min: 68, type: 'yellow', team: 'away', player: 'Doucoure' },
      { min: 78, type: 'sub',    team: 'away', playerOff: 'Beto',      playerOn: 'Calvert-Lewin' },
    ],
    ratings: [
      { player: 'Doucouré', team: 'away', rating: 8.5, highlight: '制胜远射，中场统治全场' },
      { player: 'Beto',     team: 'away', rating: 8.0, highlight: '进球，身体对抗强势' },
      { player: 'Andreas',  team: 'home', rating: 7.5, highlight: '先拔头筹，努力托起球队' },
      { player: 'Flekken',  team: 'home', rating: 7.2, highlight: '扑救阻止分差扩大' },
    ],
    narrative: '安德烈亚斯第31分钟先开纪录，富勒姆上半场防线稳固。但埃弗顿贝托第48分钟扳平，杜库雷第75分钟的远射穿越人墙抢得三分，富勒姆主场受挫，欧联资格岌岌可危。',
    momentum: [55, 52, 45, 42, 38, 38],
  },

  // id:18  Burnley 0-2 West Ham  (Feb 7)
  18: {
    xg:         { home: 0.38, away: 1.92 },
    bigChances: { home: 0, away: 3 },
    offsides:   { home: 1, away: 1 },
    tackles:    { home: 32, away: 20 },
    events: [
      { min: 28, type: 'yellow', team: 'home', player: 'Cullen' },
      { min: 38, type: 'sub',    team: 'away', playerOff: 'Paquetá',   playerOn: 'Ward-Prowse' },
      { min: 48, type: 'sub',    team: 'home', playerOff: 'Egan-Riley', playerOn: 'Roberts' },
      { min: 55, type: 'yellow', team: 'home', player: 'Brownhill' },
      { min: 65, type: 'yellow', team: 'away', player: 'Ward-Prowse' },
      { min: 70, type: 'sub',    team: 'home', playerOff: 'Gudmundsson', playerOn: 'Benson' },
      { min: 78, type: 'yellow', team: 'home', player: 'McNeil' },
      { min: 82, type: 'sub',    team: 'away', playerOff: 'Kudus',     playerOn: 'Coufal' },
    ],
    ratings: [
      { player: 'Bowen',  team: 'away', rating: 8.5, highlight: '进球并助攻，右路难以阻挡' },
      { player: 'Kudus',  team: 'away', rating: 8.5, highlight: '进球，多次突破创造机会' },
      { player: 'Emerson', team: 'away', rating: 7.8, highlight: '传出助攻，积极插上' },
      { player: 'Muric',  team: 'home', rating: 7.0, highlight: '多次扑救避免更大失分' },
    ],
    narrative: '伯恩利在降级区挣扎，主场压力下进攻缺乏信心，全场仅7次射门1次射正。博文和库杜斯联袂进球，西汉姆轻松3分，伯恩利降级危机进一步加深。',
    momentum: [42, 38, 40, 38, 35, 38],
  },

  // id:19  Bournemouth 1-1 Aston Villa  (Feb 7)
  19: {
    xg:         { home: 1.12, away: 1.28 },
    bigChances: { home: 2, away: 2 },
    offsides:   { home: 1, away: 2 },
    tackles:    { home: 20, away: 22 },
    events: [
      { min: 32, type: 'yellow', team: 'away', player: 'Tielemans' },
      { min: 55, type: 'sub',    team: 'away', playerOff: 'Bailey',    playerOn: 'Ramsey' },
      { min: 52, type: 'yellow', team: 'home', player: 'Cook' },
      { min: 65, type: 'sub',    team: 'home', playerOff: 'Cook',      playerOn: 'Zemura' },
      { min: 70, type: 'sub',    team: 'away', playerOff: 'Diaby',     playerOn: 'Duran' },
      { min: 78, type: 'sub',    team: 'home', playerOff: 'Kluivert',  playerOn: 'Brooks' },
      { min: 82, type: 'sub',    team: 'away', playerOff: 'Watkins',   playerOn: 'Tielemans' },
    ],
    ratings: [
      { player: 'Watkins',  team: 'away', rating: 8.0, highlight: '扳平进球，持续威胁' },
      { player: 'Kluivert', team: 'home', rating: 7.8, highlight: '进球，带球能力强' },
      { player: 'Diaby',    team: 'away', rating: 7.5, highlight: '持续冲击右路，创造机会' },
      { player: 'Cook',     team: 'home', rating: 7.2, highlight: '中场全力拼抢' },
    ],
    narrative: '克鲁弗特第38分钟先开纪录，但沃特金斯第72分钟扳平，双方最终分享一分。维拉有机会赢得欧冠席位关键胜利却未能把握，积分榜排名争夺愈发激烈。',
    momentum: [48, 52, 48, 52, 50, 48],
  },

  // ── GW27 Feb 21 ─────────────────────────────────────────────

  // id:20  Man City 2-0 Newcastle  (Feb 21)
  20: {
    xg:         { home: 2.68, away: 0.42 },
    bigChances: { home: 5, away: 1 },
    offsides:   { home: 2, away: 3 },
    tackles:    { home: 18, away: 28 },
    events: [
      { min: 38, type: 'yellow', team: 'away', player: 'Tonali' },
      { min: 55, type: 'sub',    team: 'away', playerOff: 'Murphy',    playerOn: 'Almiron' },
      { min: 60, type: 'yellow', team: 'away', player: 'Almiron' },
      { min: 68, type: 'sub',    team: 'home', playerOff: 'De Bruyne', playerOn: 'Kovacic' },
      { min: 75, type: 'sub',    team: 'away', playerOff: 'Isak',      playerOn: 'Osula' },
      { min: 78, type: 'sub',    team: 'home', playerOff: 'Semenyo',   playerOn: 'Doku' },
      { min: 80, type: 'yellow', team: 'home', player: 'Gündoğan' },
    ],
    ratings: [
      { player: 'Haaland',  team: 'home', rating: 9.0, highlight: '进球并助攻，主宰禁区' },
      { player: 'B.Silva',  team: 'home', rating: 8.5, highlight: '传出助攻，节奏控制核心' },
      { player: 'Semenyo',  team: 'home', rating: 8.0, highlight: '第二球终结比赛' },
      { player: 'Dubravka', team: 'away', rating: 7.0, highlight: '多次关键扑救阻止更大分差' },
    ],
    narrative: '曼城主场展现统治力，哈兰德第23分钟头球破门，塞梅尼约第67分钟反击补刀锁定胜局。纽卡斯尔无Bruno Guimarães镇守中场，几乎无法建立有效进攻，曼城零封对手，与领榜阿森纳积分差缩小至5分。',
    momentum: [58, 62, 65, 68, 65, 60],
  },

  // id:21  Aston Villa 2-1 Leeds  (Feb 21)
  21: {
    xg:         { home: 1.78, away: 0.88 },
    bigChances: { home: 3, away: 1 },
    offsides:   { home: 1, away: 3 },
    tackles:    { home: 20, away: 26 },
    events: [
      { min: 42, type: 'yellow', team: 'away', player: 'Byram' },
      { min: 50, type: 'yellow', team: 'home', player: 'Tielemans' },
      { min: 62, type: 'sub',    team: 'away', playerOff: 'Piroe',    playerOn: 'Gnonto' },
      { min: 70, type: 'sub',    team: 'home', playerOff: 'Diaby',    playerOn: 'Ramsey' },
      { min: 78, type: 'yellow', team: 'away', player: 'Struijk' },
      { min: 82, type: 'sub',    team: 'away', playerOff: 'Gnonto',   playerOn: 'Okafor' },
    ],
    ratings: [
      { player: 'Watkins',       team: 'home', rating: 8.5, highlight: '进球，持续冲击禁区' },
      { player: 'Tielemans',     team: 'home', rating: 8.0, highlight: '制胜进球，中场组织核心' },
      { player: 'Calvert-Lewin', team: 'away', rating: 7.8, highlight: '扳平一球，带动进攻' },
      { player: 'Diaby',         team: 'home', rating: 7.5, highlight: '传出助攻，左路威胁' },
    ],
    narrative: '维拉主场凭借效率取得三分，沃特金斯头球率先破门，利兹卡尔弗特-卢因禁区抢点扳平，但蒂勒曼斯远射一锤定音。利兹尽力反扑终究功亏一篑，维拉牢牢守住欧冠席位。',
    momentum: [52, 55, 52, 55, 58, 55],
  },

  // id:22  Brentford 1-1 Brighton  (Feb 21)
  22: {
    xg:         { home: 1.12, away: 1.34 },
    bigChances: { home: 2, away: 2 },
    offsides:   { home: 2, away: 1 },
    tackles:    { home: 24, away: 22 },
    events: [
      { min: 35, type: 'yellow', team: 'home', player: 'Pinnock' },
      { min: 52, type: 'yellow', team: 'away', player: 'Estupinan' },
      { min: 62, type: 'sub',    team: 'away', playerOff: 'Mitoma',    playerOn: 'Rutter' },
      { min: 68, type: 'yellow', team: 'home', player: 'Janelt' },
      { min: 72, type: 'sub',    team: 'home', playerOff: 'Mbeumo',    playerOn: 'Wissa' },
      { min: 78, type: 'sub',    team: 'away', playerOff: 'Welbeck',   playerOn: 'Ferguson' },
    ],
    ratings: [
      { player: 'Igor Thiago',   team: 'home', rating: 8.0, highlight: '半场进球，持续冲击禁区' },
      { player: 'João Pedro(B)', team: 'away', rating: 7.8, highlight: '扳平进球，持续威胁' },
      { player: 'Lewis-Potter',  team: 'home', rating: 7.5, highlight: '传出助攻，右路活跃' },
      { player: 'Flekken',       team: 'away', rating: 7.5, highlight: '关键时刻扑救' },
    ],
    narrative: '主客双方激烈拼杀后战成1-1。布伦特福德伊戈尔-蒂亚戈补时破门率先领先，布莱顿若昂-佩德罗下半场扳平，双方各取一分。战术对抗激烈，双方机会转化率均偏低。',
    momentum: [52, 55, 48, 52, 48, 50],
  },

  // id:23  Chelsea 2-0 Burnley  (Feb 21)
  23: {
    xg:         { home: 2.84, away: 0.28 },
    bigChances: { home: 5, away: 0 },
    offsides:   { home: 2, away: 1 },
    tackles:    { home: 14, away: 32 },
    events: [
      { min: 28, type: 'yellow', team: 'away', player: 'Brownhill' },
      { min: 45, type: 'yellow', team: 'away', player: 'Cullen' },
      { min: 55, type: 'sub',    team: 'away', playerOff: 'Rodriguez', playerOn: 'Benson' },
      { min: 62, type: 'yellow', team: 'away', player: 'McNeil' },
      { min: 65, type: 'sub',    team: 'home', playerOff: 'Jackson',   playerOn: 'Nkunku' },
      { min: 78, type: 'sub',    team: 'home', playerOff: 'Palmer',    playerOn: 'Mudryk' },
    ],
    ratings: [
      { player: 'Palmer',     team: 'home', rating: 9.0, highlight: '进球+助攻，斯坦福桥统治全场' },
      { player: 'Joao Pedro', team: 'home', rating: 8.5, highlight: '精准跑位破门，锁定胜局' },
      { player: 'Jackson',    team: 'home', rating: 7.8, highlight: '持续参与进攻，制造压力' },
      { player: 'Muric',      team: 'away', rating: 7.0, highlight: '多次扑救阻止更大失分' },
    ],
    narrative: '切尔西主场轻取降级区伯恩利，帕尔默第38分钟传出助攻，若昂-佩德罗第74分钟精准破门锁定胜局。伯恩利完全陷入防守，出现3张黄牌，降级形势持续恶化，与安全区差距进一步拉大。',
    momentum: [60, 62, 65, 68, 62, 60],
  },

  // id:24  Crystal Palace 2-1 Wolves  (Feb 21)
  24: {
    xg:         { home: 1.94, away: 0.82 },
    bigChances: { home: 3, away: 1 },
    offsides:   { home: 1, away: 2 },
    tackles:    { home: 18, away: 28 },
    events: [
      { min: 42, type: 'yellow', team: 'away', player: 'Cunha' },
      { min: 52, type: 'yellow', team: 'home', player: 'Ward' },
      { min: 60, type: 'sub',    team: 'away', playerOff: 'Hwang',     playerOn: 'Strand Larsen' },
      { min: 68, type: 'yellow', team: 'away', player: 'Semedo' },
      { min: 72, type: 'sub',    team: 'home', playerOff: 'Mateta',    playerOn: 'Edouard' },
      { min: 78, type: 'sub',    team: 'away', playerOff: 'Sarabia',   playerOn: 'Fraser' },
    ],
    ratings: [
      { player: 'Mateta', team: 'home', rating: 8.5, highlight: '开场进球并创造第二球机会' },
      { player: 'Olise',  team: 'home', rating: 8.5, highlight: '制胜进球，右路爆发力惊人' },
      { player: 'Cunha',  team: 'away', rating: 7.5, highlight: '扳平，为降级区球队独力撑场' },
      { player: 'Eze',    team: 'home', rating: 7.5, highlight: '助攻首球，中场组织核心' },
    ],
    narrative: '马泰塔头球率先破门，坎哈射门追平，但奥利塞第82分钟奉献制胜一击。狼队积分仍垫底，与安全区差距拉大，降级形势几近绝望。水晶宫完成保级自救，远离危险区域。',
    momentum: [55, 58, 50, 48, 45, 45],
  },

  // id:25  Nottm Forest 1-1 Liverpool  (Feb 21)
  25: {
    xg:         { home: 0.82, away: 1.58 },
    bigChances: { home: 1, away: 2 },
    offsides:   { home: 1, away: 3 },
    tackles:    { home: 28, away: 18 },
    events: [
      { min: 32, type: 'yellow', team: 'home', player: 'Gibbs-White' },
      { min: 55, type: 'sub',    team: 'away', playerOff: 'Diaz',       playerOn: 'Salah' },
      { min: 60, type: 'yellow', team: 'home', player: 'Anderson' },
      { min: 68, type: 'sub',    team: 'home', playerOff: 'Awoniyi',    playerOn: 'Wood' },
      { min: 72, type: 'yellow', team: 'away', player: 'Gravenberch' },
      { min: 80, type: 'sub',    team: 'away', playerOff: 'Szoboszlai', playerOn: 'Jones' },
    ],
    ratings: [
      { player: 'Gibbs-White', team: 'home', rating: 8.5, highlight: '进球，中场发动机，组织防守兼顾' },
      { player: 'Ekitike',     team: 'away', rating: 8.0, highlight: '替补后即刻补时扳平，嗅觉极准' },
      { player: 'Turner',      team: 'home', rating: 7.8, highlight: '多次关键扑救阻止利物浦' },
      { player: 'Hudson-Odoi', team: 'home', rating: 7.5, highlight: '传出助攻，右路持续威胁' },
    ],
    narrative: '诺森汉姆森林主场凭借严密防守率先破门，吉布斯-怀特第37分钟精准射门，利物浦持续压迫下埃基蒂克第88分钟补时追平。两队各取一分，利物浦第四名争夺持续告急，近期状态令人担忧。',
    momentum: [42, 40, 42, 45, 48, 44],
  },

  // id:26  West Ham 0-2 Bournemouth  (Feb 21)
  26: {
    xg:         { home: 0.68, away: 1.84 },
    bigChances: { home: 1, away: 3 },
    offsides:   { home: 2, away: 1 },
    tackles:    { home: 26, away: 20 },
    events: [
      { min: 32, type: 'yellow', team: 'home', player: 'Bowen' },
      { min: 55, type: 'yellow', team: 'away', player: 'Christie' },
      { min: 62, type: 'sub',    team: 'home', playerOff: 'Paquetá',   playerOn: 'Ward-Prowse' },
      { min: 65, type: 'sub',    team: 'away', playerOff: 'Cook',      playerOn: 'Zemura' },
      { min: 72, type: 'yellow', team: 'home', player: 'Emerson' },
      { min: 78, type: 'sub',    team: 'away', playerOff: 'Kluivert',  playerOn: 'Ouattara' },
      { min: 82, type: 'sub',    team: 'home', playerOff: 'Bowen',     playerOn: 'Coufal' },
    ],
    ratings: [
      { player: 'Kluivert',  team: 'away', rating: 8.5, highlight: '进球，全场最活跃进攻球员' },
      { player: 'Ouattara',  team: 'away', rating: 8.0, highlight: '替补后即刻制胜，左路突破无法阻挡' },
      { player: 'Christie',  team: 'away', rating: 7.5, highlight: '传出助攻，防守积极参与' },
      { player: 'Fabianski', team: 'home', rating: 7.0, highlight: '多次扑救减少失分' },
    ],
    narrative: '西汉姆主场保级战再度失利，伯恩茅斯克鲁弗特第52分钟打破僵局，替补乌亚塔拉第79分钟扩大优势。西汉姆整场进攻乏力，仅制造1次大好机会，降级危机持续加深，落后安全区已达3分。',
    momentum: [45, 42, 38, 40, 38, 36],
  },

  // ── GW27 早开赛 ──────────────────────────────────────────────

  // id:30  Wolves 2-2 Arsenal  (Feb 18, GW27 早赛)
  30: {
    xg:         { home: 0.91, away: 2.84 },
    bigChances: { home: 2, away: 5 },
    offsides:   { home: 1, away: 4 },
    tackles:    { home: 30, away: 18 },
    events: [
      { min: 35, type: 'yellow', team: 'home', player: 'Semedo' },
      { min: 45, type: 'sub',    team: 'away', playerOff: 'Tomiyasu',   playerOn: 'Kiwior' },
      { min: 55, type: 'sub',    team: 'home', playerOff: 'Hwang',      playerOn: 'Strand Larsen' },
      { min: 58, type: 'yellow', team: 'home', player: 'Cunha' },
      { min: 68, type: 'sub',    team: 'away', playerOff: 'Trossard',   playerOn: 'Nketiah' },
      { min: 72, type: 'yellow', team: 'away', player: 'White' },
      { min: 78, type: 'sub',    team: 'away', playerOff: 'Ødegaard',   playerOn: 'Smith Rowe' },
      { min: 85, type: 'sub',    team: 'home', playerOff: 'Podence',    playerOn: 'Fraser' },
    ],
    ratings: [
      { player: 'Cunha',      team: 'home', rating: 8.5, highlight: '进球，独力支撑进攻线' },
      { player: 'Martinelli', team: 'away', rating: 8.5, highlight: '先开球，持续威胁左路' },
      { player: 'Raya',       team: 'away', rating: 8.0, highlight: '多次扑救阻止更多失球' },
      { player: 'José Sá',    team: 'home', rating: 8.0, highlight: '多次神扑阻止阿森纳' },
      { player: 'Calafiori',  team: 'away', rating: 5.0, highlight: '乌龙球断送两分，令人扼腕' },
    ],
    narrative: '阿森纳上半场主导，马丁内利第28分钟和哈弗茨第54分钟连下两城，2-0领先看似稳如磐石。但狼队下半场绝地反击：坎哈第78分钟突破得分，卡拉菲奥里竟在第94分钟乌龙球送给对手，阿森纳痛失两分，曼城距榜首差距不变。',
    momentum: [38, 35, 30, 38, 45, 50],
  },
};
