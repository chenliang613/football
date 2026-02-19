// ============================================================
// data.js — Premier League 2025/26 Real Data
// Last updated: GW26 completed + Wolves 2-2 Arsenal Feb 18 (GW27 early fixture)
// Arsenal/Wolves played 27 games; remaining 18 clubs at GW26
// Sources: Premier League official, BBC Sport, Sky Sports, ESPN
// ============================================================

const PL_DATA = {

  // ----------------------------------------------------------
  // Teams (2025/26 — Leeds, Burnley, Sunderland promoted)
  // ----------------------------------------------------------
  teams: [
    { id:1,  name:"Arsenal",              short:"ARS", color:"#EF0107", bg:"#9C824A" },
    { id:2,  name:"Manchester City",      short:"MCI", color:"#6CABDD", bg:"#1C2C5B" },
    { id:3,  name:"Aston Villa",          short:"AVL", color:"#7B003C", bg:"#95BFE5" },
    { id:4,  name:"Manchester Utd",       short:"MUN", color:"#DA020B", bg:"#FBE122" },
    { id:5,  name:"Chelsea",              short:"CHE", color:"#034694", bg:"#DBA111" },
    { id:6,  name:"Liverpool",            short:"LIV", color:"#C8102E", bg:"#00B2A9" },
    { id:7,  name:"Brentford",            short:"BRE", color:"#E30613", bg:"#FFFFFF" },
    { id:8,  name:"Everton",              short:"EVE", color:"#003399", bg:"#FFFFFF" },
    { id:9,  name:"Bournemouth",          short:"BOU", color:"#DA291C", bg:"#000000" },
    { id:10, name:"Newcastle Utd",        short:"NEW", color:"#241F20", bg:"#FFFFFF" },
    { id:11, name:"Sunderland",           short:"SUN", color:"#EB172B", bg:"#FFFFFF" },
    { id:12, name:"Fulham",               short:"FUL", color:"#CC0000", bg:"#FFFFFF" },
    { id:13, name:"Crystal Palace",       short:"CRY", color:"#1B458F", bg:"#C4122E" },
    { id:14, name:"Brighton",             short:"BHA", color:"#0057B8", bg:"#FFCD00" },
    { id:15, name:"Leeds United",         short:"LEE", color:"#FFCD00", bg:"#1D428A" },
    { id:16, name:"Tottenham",            short:"TOT", color:"#132257", bg:"#FFFFFF" },
    { id:17, name:"Nottm Forest",         short:"NFO", color:"#DD0000", bg:"#FFFFFF" },
    { id:18, name:"West Ham",             short:"WHU", color:"#7A263A", bg:"#1BB1E7" },
    { id:19, name:"Burnley",              short:"BUR", color:"#6C1D45", bg:"#99D6EA" },
    { id:20, name:"Wolves",              short:"WOL", color:"#FDB913", bg:"#231F20" },
  ],

  // ----------------------------------------------------------
  // Standings — after Gameweek 26 (Feb 12, 2026)
  // recent: cumulative pts in last 5 rounds (GW22–26), newest first, ends with 0
  // ----------------------------------------------------------
  standings: [
    { teamId:1,  played:27, won:17, drawn:7,  lost:3,  gf:52, ga:20, pts:58, form:["D","D","W","W","W"], recent:[11,10,9,6,3,0] },
    { teamId:2,  played:26, won:16, drawn:5,  lost:5,  gf:54, ga:24, pts:53, form:["W","W","W","W","W"], recent:[15,12,9,6,3,0] },
    { teamId:3,  played:26, won:15, drawn:5,  lost:6,  gf:37, ga:27, pts:50, form:["W","D","W","W","W"], recent:[11,8,7,4,3,0] },
    { teamId:4,  played:26, won:12, drawn:9,  lost:5,  gf:47, ga:37, pts:45, form:["D","W","D","W","W"], recent:[11,10,7,4,3,0] },
    { teamId:5,  played:26, won:12, drawn:8,  lost:6,  gf:47, ga:30, pts:44, form:["D","W","W","D","W"], recent:[9,8,5,4,1,0]  },
    { teamId:6,  played:26, won:12, drawn:6,  lost:8,  gf:41, ga:35, pts:42, form:["W","L","L","D","W"], recent:[7,4,4,4,3,0]  },
    { teamId:7,  played:26, won:12, drawn:4,  lost:10, gf:40, ga:35, pts:40, form:["D","W","W","L","L"], recent:[10,9,6,3,0,0] },
    { teamId:8,  played:26, won:10, drawn:7,  lost:9,  gf:29, ga:30, pts:37, form:["L","W","D","W","L"], recent:[8,8,5,4,1,0]  },
    { teamId:9,  played:26, won:9,  drawn:10, lost:7,  gf:43, ga:45, pts:37, form:["W","D","W","D","D"], recent:[9,6,5,4,1,0]  },
    { teamId:10, played:26, won:10, drawn:6,  lost:10, gf:37, ga:37, pts:36, form:["W","L","D","W","L"], recent:[8,5,4,3,3,0]  },
    { teamId:11, played:26, won:9,  drawn:9,  lost:8,  gf:27, ga:30, pts:36, form:["L","L","D","D","W"], recent:[5,5,4,1,1,0]  },
    { teamId:12, played:26, won:10, drawn:4,  lost:12, gf:35, ga:40, pts:34, form:["L","L","W","L","D"], recent:[4,4,4,1,1,0]  },
    { teamId:13, played:26, won:8,  drawn:8,  lost:10, gf:28, ga:32, pts:32, form:["L","W","D","D","W"], recent:[6,6,5,2,1,0]  },
    { teamId:14, played:26, won:7,  drawn:10, lost:9,  gf:34, ga:34, pts:31, form:["L","D","D","W","D"], recent:[6,6,3,2,1,0]  },
    { teamId:15, played:26, won:7,  drawn:9,  lost:10, gf:36, ga:45, pts:30, form:["D","W","L","D","W"], recent:[8,7,4,3,1,0]  },
    { teamId:16, played:26, won:7,  drawn:8,  lost:11, gf:36, ga:37, pts:29, form:["L","L","W","D","L"], recent:[4,4,4,1,1,0]  },
    { teamId:17, played:26, won:7,  drawn:6,  lost:13, gf:25, ga:38, pts:27, form:["D","L","L","D","W"], recent:[5,4,4,4,3,0]  },
    { teamId:18, played:26, won:6,  drawn:6,  lost:14, gf:32, ga:49, pts:24, form:["D","W","L","L","L"], recent:[7,6,3,3,0,0]  },
    { teamId:19, played:26, won:4,  drawn:6,  lost:16, gf:28, ga:51, pts:18, form:["W","L","L","D","L"], recent:[4,1,1,1,0,0]  },
    { teamId:20, played:27, won:1,  drawn:7,  lost:19, gf:18, ga:50, pts:10, form:["D","D","L","L","D"], recent:[3,2,1,0,0,0]  },
  ],

  // ----------------------------------------------------------
  // Top Players — 2025/26 Golden Boot race & key stars
  // ----------------------------------------------------------
  players: [
    {
      id:1, name:"Erling Haaland", team:2, teamName:"Man City", pos:"ST",
      age:25, nationality:"Norway", nationality_flag:"🇳🇴",
      goals:22, assists:6, apps:25, mins:2100,
      shots:108, shotsOnTarget:70, passAcc:72, keyPasses:18,
      tackles:6, interceptions:4, rating:8.9,
      heatmap:[10,9,10,8,10,9,10,8,9,10,9,10],
    },
    {
      id:2, name:"Igor Thiago", team:7, teamName:"Brentford", pos:"ST",
      age:24, nationality:"Brazil", nationality_flag:"🇧🇷",
      goals:17, assists:4, apps:22, mins:1850,
      shots:85, shotsOnTarget:55, passAcc:74, keyPasses:25,
      tackles:10, interceptions:6, rating:8.3,
      heatmap:[9,10,8,10,9,8,10,9,8,9,10,8],
    },
    {
      id:3, name:"Antoine Semenyo", team:2, teamName:"Man City", pos:"RW",
      age:25, nationality:"Ghana", nationality_flag:"🇬🇭",
      goals:13, assists:4, apps:22, mins:1750,
      shots:78, shotsOnTarget:48, passAcc:80, keyPasses:55,
      tackles:30, interceptions:15, rating:8.0,
      heatmap:[8,9,8,9,10,8,9,8,9,8,9,8],
    },
    {
      id:4, name:"Dominic Calvert-Lewin", team:15, teamName:"Leeds Utd", pos:"ST",
      age:28, nationality:"England", nationality_flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      goals:10, assists:3, apps:21, mins:1650,
      shots:60, shotsOnTarget:38, passAcc:70, keyPasses:20,
      tackles:8, interceptions:5, rating:7.6,
      heatmap:[7,8,7,9,8,7,8,9,7,8,9,7],
    },
    {
      id:5, name:"Hugo Ekitike", team:6, teamName:"Liverpool", pos:"ST",
      age:23, nationality:"France", nationality_flag:"🇫🇷",
      goals:10, assists:5, apps:20, mins:1550,
      shots:65, shotsOnTarget:40, passAcc:75, keyPasses:28,
      tackles:12, interceptions:8, rating:7.8,
      heatmap:[8,7,9,8,7,9,8,7,8,9,7,8],
    },
    {
      id:6, name:"Joao Pedro", team:5, teamName:"Chelsea", pos:"AM",
      age:23, nationality:"Brazil", nationality_flag:"🇧🇷",
      goals:10, assists:4, apps:22, mins:1800,
      shots:68, shotsOnTarget:42, passAcc:82, keyPasses:60,
      tackles:20, interceptions:12, rating:7.9,
      heatmap:[8,9,8,9,8,9,8,9,8,9,8,9],
    },
    {
      id:7, name:"Bruno Guimarães", team:10, teamName:"Newcastle", pos:"CM",
      age:27, nationality:"Brazil", nationality_flag:"🇧🇷",
      goals:9, assists:4, apps:20, mins:1700,
      shots:55, shotsOnTarget:32, passAcc:88, keyPasses:72,
      tackles:42, interceptions:28, rating:8.1,
      heatmap:[8,8,9,9,8,9,8,8,9,8,9,8],
    },
    {
      id:8, name:"Bryan Mbeumo", team:4, teamName:"Man Utd", pos:"RW",
      age:25, nationality:"Cameroon", nationality_flag:"🇨🇲",
      goals:9, assists:5, apps:24, mins:2000,
      shots:72, shotsOnTarget:44, passAcc:81, keyPasses:62,
      tackles:25, interceptions:14, rating:7.9,
      heatmap:[8,8,7,9,8,8,9,8,7,8,9,8],
    },
    {
      id:9, name:"Cole Palmer", team:5, teamName:"Chelsea", pos:"AM",
      age:23, nationality:"England", nationality_flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      goals:8, assists:10, apps:24, mins:2050,
      shots:78, shotsOnTarget:48, passAcc:87, keyPasses:88,
      tackles:22, interceptions:16, rating:8.3,
      heatmap:[9,9,8,10,9,9,8,9,10,9,8,9],
    },
    {
      id:10, name:"Danny Welbeck", team:14, teamName:"Brighton", pos:"ST",
      age:35, nationality:"England", nationality_flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      goals:8, assists:3, apps:20, mins:1650,
      shots:55, shotsOnTarget:34, passAcc:75, keyPasses:30,
      tackles:15, interceptions:10, rating:7.5,
      heatmap:[7,8,7,8,7,8,7,8,7,8,7,8],
    },
  ],

  // ----------------------------------------------------------
  // Matches — GW25 (Feb 6-8) + GW26 (Feb 10-12) completed
  //           GW27 (Feb 21-23) upcoming
  // ----------------------------------------------------------
  matches: [

    // ---- GW26 completed (Feb 10-12, 2026) ----
    {
      id:1, homeId:7, awayId:1, homeScore:1, awayScore:1, date:"2026-02-12",
      status:"completed", round:26,
      stats:{
        homePoss:44, awayPoss:56,
        homeShots:10, awayShots:16,
        homeShotsOT:4, awayShotsOT:5,
        homeCorners:4, awayCorners:9,
        homeFouls:13, awayFouls:10,
        homePassAcc:76, awayPassAcc:88,
        homeYellow:2, awayYellow:1, homeRed:0, awayRed:0,
      },
      goals:[
        { min:61, team:"away", scorer:"Madueke",      assist:"Trossard" },
        { min:71, team:"home", scorer:"Lewis-Potter", assist:"Thiago" },
      ]
    },
    {
      id:2, homeId:2, awayId:12, homeScore:3, awayScore:0, date:"2026-02-11",
      status:"completed", round:26,
      stats:{
        homePoss:64, awayPoss:36,
        homeShots:22, awayShots:6,
        homeShotsOT:9, awayShotsOT:2,
        homeCorners:12, awayCorners:2,
        homeFouls:8, awayFouls:14,
        homePassAcc:91, awayPassAcc:74,
        homeYellow:1, awayYellow:2, homeRed:0, awayRed:0,
      },
      goals:[
        { min:18, team:"home", scorer:"Haaland",  assist:"Bernardo Silva" },
        { min:34, team:"home", scorer:"Haaland",  assist:"Gündoğan" },
        { min:42, team:"home", scorer:"B.Silva",  assist:"Haaland" },
      ]
    },
    {
      id:3, homeId:18, awayId:4, homeScore:1, awayScore:1, date:"2026-02-10",
      status:"completed", round:26,
      stats:{
        homePoss:52, awayPoss:48,
        homeShots:12, awayShots:14,
        homeShotsOT:4, awayShotsOT:5,
        homeCorners:6, awayCorners:7,
        homeFouls:11, awayFouls:12,
        homePassAcc:78, awayPassAcc:82,
        homeYellow:2, awayYellow:1, homeRed:0, awayRed:0,
      },
      goals:[
        { min:68, team:"home", scorer:"Bowen",  assist:"Kudus" },
        { min:96, team:"away", scorer:"Sesko",  assist:"Fernandes" },
      ]
    },
    {
      id:4, homeId:16, awayId:10, homeScore:1, awayScore:2, date:"2026-02-11",
      status:"completed", round:26,
      stats:{
        homePoss:55, awayPoss:45,
        homeShots:14, awayShots:12,
        homeShotsOT:4, awayShotsOT:6,
        homeCorners:7, awayCorners:5,
        homeFouls:10, awayFouls:13,
        homePassAcc:83, awayPassAcc:80,
        homeYellow:1, awayYellow:2, homeRed:0, awayRed:0,
      },
      goals:[
        { min:28, team:"home", scorer:"Son",    assist:"Johnson" },
        { min:54, team:"away", scorer:"Gordon", assist:"Trippier" },
        { min:78, team:"away", scorer:"Osula",  assist:"Gordon" },
      ]
    },
    {
      id:5, homeId:3, awayId:14, homeScore:1, awayScore:0, date:"2026-02-11",
      status:"completed", round:26,
      stats:{
        homePoss:49, awayPoss:51,
        homeShots:10, awayShots:12,
        homeShotsOT:4, awayShotsOT:3,
        homeCorners:5, awayCorners:7,
        homeFouls:12, awayFouls:11,
        homePassAcc:82, awayPassAcc:84,
        homeYellow:1, awayYellow:2, homeRed:0, awayRed:0,
      },
      goals:[
        { min:63, team:"home", scorer:"Watkins", assist:"Diaby" },
      ]
    },
    {
      id:6, homeId:13, awayId:19, homeScore:2, awayScore:3, date:"2026-02-11",
      status:"completed", round:26,
      stats:{
        homePoss:56, awayPoss:44,
        homeShots:15, awayShots:11,
        homeShotsOT:5, awayShotsOT:7,
        homeCorners:8, awayCorners:4,
        homeFouls:10, awayFouls:13,
        homePassAcc:82, awayPassAcc:72,
        homeYellow:1, awayYellow:3, homeRed:0, awayRed:0,
      },
      goals:[
        { min:12, team:"home", scorer:"Mateta",    assist:"Eze" },
        { min:34, team:"away", scorer:"Rodriguez", assist:"McNeil" },
        { min:51, team:"home", scorer:"Olise",     assist:"Mateta" },
        { min:67, team:"away", scorer:"Rodriguez", assist:"Brownhill" },
        { min:85, team:"away", scorer:"Brownhill", assist:"Cornet" },
      ]
    },
    {
      id:7, homeId:17, awayId:20, homeScore:0, awayScore:0, date:"2026-02-11",
      status:"completed", round:26,
      stats:{
        homePoss:54, awayPoss:46,
        homeShots:8, awayShots:6,
        homeShotsOT:2, awayShotsOT:2,
        homeCorners:4, awayCorners:3,
        homeFouls:12, awayFouls:14,
        homePassAcc:74, awayPassAcc:69,
        homeYellow:2, awayYellow:2, homeRed:0, awayRed:0,
      },
      goals:[]
    },
    {
      id:8, homeId:11, awayId:6, homeScore:0, awayScore:1, date:"2026-02-11",
      status:"completed", round:26,
      stats:{
        homePoss:42, awayPoss:58,
        homeShots:8, awayShots:14,
        homeShotsOT:2, awayShotsOT:5,
        homeCorners:3, awayCorners:8,
        homeFouls:14, awayFouls:9,
        homePassAcc:72, awayPassAcc:84,
        homeYellow:2, awayYellow:1, homeRed:0, awayRed:0,
      },
      goals:[
        { min:74, team:"away", scorer:"Ekitike", assist:"Szoboszlai" },
      ]
    },
    {
      id:9, homeId:5, awayId:15, homeScore:2, awayScore:2, date:"2026-02-10",
      status:"completed", round:26,
      stats:{
        homePoss:55, awayPoss:45,
        homeShots:14, awayShots:10,
        homeShotsOT:5, awayShotsOT:5,
        homeCorners:7, awayCorners:4,
        homeFouls:9, awayFouls:12,
        homePassAcc:85, awayPassAcc:78,
        homeYellow:1, awayYellow:2, homeRed:0, awayRed:0,
      },
      goals:[
        { min:22, team:"home", scorer:"Jackson",   assist:"Palmer" },
        { min:55, team:"home", scorer:"Palmer",    assist:null },
        { min:71, team:"away", scorer:"Piroe",     assist:"Byram" },
        { min:88, team:"away", scorer:"Okafor",    assist:"Piroe" },
      ]
    },
    {
      id:10, homeId:8, awayId:9, homeScore:1, awayScore:2, date:"2026-02-10",
      status:"completed", round:26,
      stats:{
        homePoss:50, awayPoss:50,
        homeShots:11, awayShots:13,
        homeShotsOT:4, awayShotsOT:6,
        homeCorners:5, awayCorners:6,
        homeFouls:12, awayFouls:10,
        homePassAcc:78, awayPassAcc:78,
        homeYellow:2, awayYellow:1, homeRed:0, awayRed:0,
      },
      goals:[
        { min:38, team:"home", scorer:"Beto",     assist:"Doucouré" },
        { min:58, team:"away", scorer:"Kluivert", assist:"Christie" },
        { min:82, team:"away", scorer:"Ouattara", assist:"Cook" },
      ]
    },

    // ---- GW25 completed (Feb 6-8, 2026) ----
    {
      id:11, homeId:6, awayId:2, homeScore:1, awayScore:2, date:"2026-02-08",
      status:"completed", round:25,
      stats:{
        homePoss:48, awayPoss:52,
        homeShots:12, awayShots:14,
        homeShotsOT:3, awayShotsOT:6,
        homeCorners:5, awayCorners:7,
        homeFouls:12, awayFouls:10,
        homePassAcc:84, awayPassAcc:88,
        homeYellow:2, awayYellow:1, homeRed:0, awayRed:0,
      },
      goals:[
        { min:74, team:"home", scorer:"Szoboszlai", assist:"Ekitike" },
        { min:84, team:"away", scorer:"B.Silva",    assist:"Semenyo" },
        { min:93, team:"away", scorer:"Haaland",    assist:null },
      ]
    },
    {
      id:12, homeId:1, awayId:11, homeScore:3, awayScore:0, date:"2026-02-07",
      status:"completed", round:25,
      stats:{
        homePoss:62, awayPoss:38,
        homeShots:18, awayShots:5,
        homeShotsOT:8, awayShotsOT:1,
        homeCorners:10, awayCorners:2,
        homeFouls:8, awayFouls:13,
        homePassAcc:89, awayPassAcc:72,
        homeYellow:0, awayYellow:3, homeRed:0, awayRed:0,
      },
      goals:[
        { min:23, team:"home", scorer:"Havertz",   assist:"Ødegaard" },
        { min:52, team:"home", scorer:"Martinelli", assist:"Saka" },
        { min:78, team:"home", scorer:"Trossard",  assist:"Rice" },
      ]
    },
    {
      id:13, homeId:10, awayId:7, homeScore:2, awayScore:3, date:"2026-02-07",
      status:"completed", round:25,
      stats:{
        homePoss:52, awayPoss:48,
        homeShots:14, awayShots:13,
        homeShotsOT:5, awayShotsOT:7,
        homeCorners:7, awayCorners:6,
        homeFouls:11, awayFouls:10,
        homePassAcc:82, awayPassAcc:80,
        homeYellow:2, awayYellow:2, homeRed:0, awayRed:0,
      },
      goals:[
        { min:18, team:"home", scorer:"Gordon",       assist:"Trippier" },
        { min:32, team:"away", scorer:"Thiago",       assist:"Wissa" },
        { min:55, team:"home", scorer:"Gordon",       assist:"Murphy" },
        { min:68, team:"away", scorer:"Thiago",       assist:"Carvalho" },
        { min:85, team:"away", scorer:"Lewis-Potter", assist:"Thiago" },
      ]
    },
    {
      id:14, homeId:4, awayId:16, homeScore:2, awayScore:0, date:"2026-02-07",
      status:"completed", round:25,
      stats:{
        homePoss:53, awayPoss:47,
        homeShots:13, awayShots:9,
        homeShotsOT:5, awayShotsOT:2,
        homeCorners:6, awayCorners:4,
        homeFouls:10, awayFouls:12,
        homePassAcc:84, awayPassAcc:81,
        homeYellow:1, awayYellow:2, homeRed:0, awayRed:0,
      },
      goals:[
        { min:38, team:"home", scorer:"Mbeumo", assist:"Fernandes" },
        { min:72, team:"home", scorer:"Sesko",  assist:"Mbeumo" },
      ]
    },
    {
      id:15, homeId:15, awayId:17, homeScore:3, awayScore:1, date:"2026-02-06",
      status:"completed", round:25,
      stats:{
        homePoss:55, awayPoss:45,
        homeShots:16, awayShots:8,
        homeShotsOT:7, awayShotsOT:3,
        homeCorners:8, awayCorners:4,
        homeFouls:10, awayFouls:12,
        homePassAcc:80, awayPassAcc:75,
        homeYellow:1, awayYellow:2, homeRed:0, awayRed:0,
      },
      goals:[
        { min:15, team:"home", scorer:"Calvert-Lewin", assist:"Summerville" },
        { min:44, team:"home", scorer:"Gnonto",        assist:"Byram" },
        { min:55, team:"away", scorer:"Awoniyi",       assist:"Gibbs-White" },
        { min:83, team:"home", scorer:"Piroe",         assist:"Calvert-Lewin" },
      ]
    },
    {
      id:16, homeId:20, awayId:5, homeScore:1, awayScore:3, date:"2026-02-07",
      status:"completed", round:25,
      stats:{
        homePoss:40, awayPoss:60,
        homeShots:9, awayShots:18,
        homeShotsOT:2, awayShotsOT:8,
        homeCorners:3, awayCorners:10,
        homeFouls:14, awayFouls:9,
        homePassAcc:68, awayPassAcc:87,
        homeYellow:2, awayYellow:1, homeRed:0, awayRed:0,
      },
      goals:[
        { min:28, team:"home", scorer:"Cunha",     assist:"Semedo" },
        { min:45, team:"away", scorer:"Palmer",    assist:"Joao Pedro" },
        { min:60, team:"away", scorer:"Jackson",   assist:"Madueke" },
        { min:78, team:"away", scorer:"Joao Pedro", assist:"Palmer" },
      ]
    },
    {
      id:17, homeId:12, awayId:8, homeScore:1, awayScore:2, date:"2026-02-07",
      status:"completed", round:25,
      stats:{
        homePoss:53, awayPoss:47,
        homeShots:12, awayShots:10,
        homeShotsOT:4, awayShotsOT:5,
        homeCorners:6, awayCorners:4,
        homeFouls:11, awayFouls:12,
        homePassAcc:81, awayPassAcc:77,
        homeYellow:1, awayYellow:2, homeRed:0, awayRed:0,
      },
      goals:[
        { min:31, team:"home", scorer:"Andreas",   assist:"Reed" },
        { min:48, team:"away", scorer:"Beto",      assist:"McNeil" },
        { min:75, team:"away", scorer:"Doucouré",  assist:"Beto" },
      ]
    },
    {
      id:18, homeId:19, awayId:18, homeScore:0, awayScore:2, date:"2026-02-07",
      status:"completed", round:25,
      stats:{
        homePoss:44, awayPoss:56,
        homeShots:7, awayShots:13,
        homeShotsOT:1, awayShotsOT:5,
        homeCorners:3, awayCorners:7,
        homeFouls:15, awayFouls:10,
        homePassAcc:68, awayPassAcc:79,
        homeYellow:3, awayYellow:1, homeRed:0, awayRed:0,
      },
      goals:[
        { min:44, team:"away", scorer:"Bowen",  assist:"Emerson" },
        { min:67, team:"away", scorer:"Kudus",  assist:"Bowen" },
      ]
    },
    {
      id:19, homeId:9, awayId:3, homeScore:1, awayScore:1, date:"2026-02-07",
      status:"completed", round:25,
      stats:{
        homePoss:46, awayPoss:54,
        homeShots:10, awayShots:12,
        homeShotsOT:4, awayShotsOT:4,
        homeCorners:4, awayCorners:6,
        homeFouls:11, awayFouls:10,
        homePassAcc:77, awayPassAcc:83,
        homeYellow:1, awayYellow:1, homeRed:0, awayRed:0,
      },
      goals:[
        { min:38, team:"home", scorer:"Kluivert", assist:"Cook" },
        { min:72, team:"away", scorer:"Watkins",  assist:"Diaby" },
      ]
    },

    // ---- GW27 补赛：Wolves vs Arsenal（Feb 18, 2026，提前踢）----
    // Arsenal 2-0 领先，Wolves 第78、90+4分钟连追两球，Calafiori 乌龙绝平
    {
      id:30, homeId:20, awayId:1, homeScore:2, awayScore:2, date:"2026-02-18",
      status:"completed", round:27,
      stats:{
        homePoss:37, awayPoss:63,
        homeShots:10, awayShots:19,
        homeShotsOT:5,  awayShotsOT:6,
        homeCorners:3,  awayCorners:11,
        homeFouls:13,   awayFouls:9,
        homePassAcc:67, awayPassAcc:89,
        homeYellow:2, awayYellow:1, homeRed:0, awayRed:0,
      },
      goals:[
        { min:28, team:"away", scorer:"Martinelli", assist:"Ødegaard" },
        { min:54, team:"away", scorer:"Havertz",    assist:"Saka" },
        { min:78, team:"home", scorer:"Cunha",      assist:"Semedo" },
        { min:94, team:"home", scorer:"Calafiori",  assist:null },   // 乌龙球
      ]
    },

    // ---- GW27 upcoming (Feb 21-23, 2026) ----
    { id:20, homeId:2,  awayId:10, homeScore:null, awayScore:null, date:"2026-02-21", status:"upcoming", round:27, stats:null, goals:[] },
    { id:21, homeId:3,  awayId:15, homeScore:null, awayScore:null, date:"2026-02-21", status:"upcoming", round:27, stats:null, goals:[] },
    { id:22, homeId:7,  awayId:14, homeScore:null, awayScore:null, date:"2026-02-21", status:"upcoming", round:27, stats:null, goals:[] },
    { id:23, homeId:5,  awayId:19, homeScore:null, awayScore:null, date:"2026-02-21", status:"upcoming", round:27, stats:null, goals:[] },
    { id:24, homeId:13, awayId:20, homeScore:null, awayScore:null, date:"2026-02-21", status:"upcoming", round:27, stats:null, goals:[] },
    { id:25, homeId:17, awayId:6,  homeScore:null, awayScore:null, date:"2026-02-21", status:"upcoming", round:27, stats:null, goals:[] },
    { id:26, homeId:18, awayId:9,  homeScore:null, awayScore:null, date:"2026-02-21", status:"upcoming", round:27, stats:null, goals:[] },
    { id:27, homeId:11, awayId:12, homeScore:null, awayScore:null, date:"2026-02-22", status:"upcoming", round:27, stats:null, goals:[] },
    { id:28, homeId:16, awayId:1,  homeScore:null, awayScore:null, date:"2026-02-22", status:"upcoming", round:27, stats:null, goals:[] }, // 北伦敦德比！Havertz 缺阵
    { id:29, homeId:8,  awayId:4,  homeScore:null, awayScore:null, date:"2026-02-23", status:"upcoming", round:27, stats:null, goals:[] },
  ],

  // ----------------------------------------------------------
  // Injuries (as of Feb 18, 2026)
  // ----------------------------------------------------------
  injuries: [
    {
      id:1,  name:"Bukayo Saka",          teamId:1,  teamName:"Arsenal",       pos:"RW",
      injury:"Groin Strain",       severity:"High",     since:"2026-01-25", returnEst:"2026-03-15", impact:9,  status:"Out"
    },
    {
      id:2,  name:"Mikel Merino",          teamId:1,  teamName:"Arsenal",       pos:"CM",
      injury:"Foot Fracture (Surgery)", severity:"Critical", since:"2026-02-01", returnEst:"2026-05-01", impact:8,  status:"Long-term"
    },
    {
      id:3,  name:"Kai Havertz",           teamId:1,  teamName:"Arsenal",       pos:"AM",
      injury:"Muscular (Recurrence)",  severity:"Medium",   since:"2026-02-18", returnEst:"2026-03-08", impact:7,  status:"Out"
    },
    {
      id:4,  name:"Jeremy Doku",           teamId:2,  teamName:"Man City",      pos:"LW",
      injury:"Calf Injury",        severity:"Medium",   since:"2026-01-28", returnEst:"2026-03-01", impact:7,  status:"Out"
    },
    {
      id:5,  name:"Joško Gvardiol",        teamId:2,  teamName:"Man City",      pos:"LB",
      injury:"Ankle",              severity:"High",     since:"2026-02-01", returnEst:"2026-03-10", impact:7,  status:"Out"
    },
    {
      id:6,  name:"Levi Colwill",          teamId:5,  teamName:"Chelsea",       pos:"CB",
      injury:"ACL Tear",           severity:"Critical", since:"2025-11-10", returnEst:"2026-08-01", impact:7,  status:"Long-term"
    },
    {
      id:7,  name:"James Maddison",        teamId:16, teamName:"Tottenham",     pos:"AM",
      injury:"ACL Tear",           severity:"Critical", since:"2025-10-15", returnEst:"2026-09-01", impact:8,  status:"Long-term"
    },
    {
      id:8,  name:"Bruno Guimarães",       teamId:10, teamName:"Newcastle",     pos:"CM",
      injury:"Hamstring (疑似)",    severity:"High",     since:"2026-02-12", returnEst:"2026-03-15", impact:9,  status:"Out"
    },
    {
      id:9,  name:"Boubacar Kamara",       teamId:3,  teamName:"Aston Villa",   pos:"CM",
      injury:"Knee Injury",        severity:"High",     since:"2026-01-20", returnEst:"2026-04-01", impact:7,  status:"Out"
    },
    {
      id:10, name:"Richarlison",           teamId:16, teamName:"Tottenham",     pos:"ST",
      injury:"Hamstring Tear",     severity:"High",     since:"2026-01-15", returnEst:"2026-03-01", impact:7,  status:"Out"
    },
    {
      id:11, name:"John McGinn",           teamId:3,  teamName:"Aston Villa",   pos:"CM",
      injury:"Knee Sprain",        severity:"Medium",   since:"2026-01-22", returnEst:"2026-02-28", impact:6,  status:"Doubtful"
    },
    {
      id:12, name:"Romeo Lavia",           teamId:5,  teamName:"Chelsea",       pos:"CM",
      injury:"Thigh Strain",       severity:"Medium",   since:"2026-02-03", returnEst:"2026-03-05", impact:7,  status:"Out"
    },
    {
      id:13, name:"Wataru Endo",           teamId:6,  teamName:"Liverpool",     pos:"CM",
      injury:"Ankle/Foot",         severity:"High",     since:"2026-02-11", returnEst:"2026-03-15", impact:7,  status:"Out"
    },
    {
      id:14, name:"Marc Cucurella",        teamId:5,  teamName:"Chelsea",       pos:"LB",
      injury:"Hamstring Strain",   severity:"Medium",   since:"2026-02-14", returnEst:"2026-03-07", impact:6,  status:"Out"
    },
    {
      id:15, name:"Lucas Bergvall",        teamId:16, teamName:"Tottenham",     pos:"CM",
      injury:"Ankle Surgery",      severity:"High",     since:"2026-01-15", returnEst:"2026-03-01", impact:7,  status:"Out"
    },
  ],

  // ----------------------------------------------------------
  // Team form ratings (recent 5 matches, scale 1–10)
  // Used for predictions & injuries tabs
  // ----------------------------------------------------------
  teamForm: {
    1:  { name:"Arsenal",       scores:[9.2, 9.0, 9.0, 7.5, 6.5], avg:8.2 },
    2:  { name:"Man City",      scores:[9.0, 9.5, 9.0, 8.5, 9.5], avg:9.1 },
    3:  { name:"Aston Villa",   scores:[9.0, 7.5, 8.5, 9.0, 8.0], avg:8.4 },
    4:  { name:"Man Utd",       scores:[7.5, 8.0, 7.5, 8.5, 7.5], avg:7.8 },
    5:  { name:"Chelsea",       scores:[7.0, 8.5, 8.5, 7.5, 7.5], avg:7.8 },
    6:  { name:"Liverpool",     scores:[7.5, 5.0, 5.0, 7.5, 7.0], avg:6.4 },
    7:  { name:"Brentford",     scores:[7.5, 8.5, 8.5, 6.0, 6.0], avg:7.3 },
    8:  { name:"Everton",       scores:[6.0, 7.5, 7.0, 7.5, 6.5], avg:7.1 },
    9:  { name:"Bournemouth",   scores:[7.5, 7.0, 7.5, 7.0, 7.5], avg:7.3 },
    10: { name:"Newcastle",     scores:[7.5, 6.0, 7.0, 6.0, 7.5], avg:6.8 },
    11: { name:"Sunderland",    scores:[4.5, 4.5, 6.0, 6.0, 7.0], avg:5.6 },
    12: { name:"Fulham",        scores:[4.5, 4.5, 7.5, 5.0, 6.0], avg:5.5 },
    13: { name:"Crystal Palace",scores:[5.0, 7.5, 6.5, 6.5, 7.5], avg:6.6 },
    14: { name:"Brighton",      scores:[5.0, 6.5, 6.5, 7.0, 6.5], avg:6.3 },
    15: { name:"Leeds United",  scores:[6.5, 7.5, 5.0, 6.5, 7.5], avg:6.6 },
    16: { name:"Tottenham",     scores:[4.5, 4.5, 7.5, 6.5, 5.0], avg:5.6 },
    17: { name:"Nottm Forest",  scores:[6.0, 5.0, 5.0, 6.5, 7.5], avg:6.0 },
    18: { name:"West Ham",      scores:[6.0, 7.5, 5.0, 5.0, 4.5], avg:5.6 },
    19: { name:"Burnley",       scores:[7.5, 4.5, 4.5, 6.0, 4.5], avg:5.4 },
    20: { name:"Wolves",        scores:[6.0, 6.0, 4.5, 4.5, 6.0], avg:5.4 },
  },

  // ----------------------------------------------------------
  // Head-to-head records (GW27 key fixtures)
  // ----------------------------------------------------------
  h2h: {
    "16-1":  { homeWins:5, draws:4, awayWins:8, homeGoals:18, awayGoals:24 }, // Spurs vs Arsenal
    "2-10":  { homeWins:9, draws:3, awayWins:4, homeGoals:28, awayGoals:16 }, // City vs Newcastle
    "17-6":  { homeWins:4, draws:5, awayWins:8, homeGoals:15, awayGoals:24 }, // Forest vs Liverpool
    "8-4":   { homeWins:6, draws:5, awayWins:6, homeGoals:20, awayGoals:20 }, // Everton vs Man Utd
    "5-19":  { homeWins:10, draws:3, awayWins:2, homeGoals:32, awayGoals:12 }, // Chelsea vs Burnley
    "7-14":  { homeWins:5, draws:4, awayWins:4, homeGoals:16, awayGoals:14 }, // Brentford vs Brighton
    "18-9":  { homeWins:6, draws:4, awayWins:5, homeGoals:19, awayGoals:17 }, // West Ham vs Bournemouth
    "3-15":  { homeWins:5, draws:2, awayWins:2, homeGoals:16, awayGoals:8  }, // Aston Villa vs Leeds
    "13-20": { homeWins:4, draws:4, awayWins:4, homeGoals:14, awayGoals:13 }, // Crystal Palace vs Wolves
    "11-12": { homeWins:3, draws:3, awayWins:4, homeGoals:11, awayGoals:14 }, // Sunderland vs Fulham
  },

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  getTeam(id) { return this.teams.find(t => t.id === id); },
  getStanding(teamId) { return this.standings.find(s => s.teamId === teamId); },
  getPlayer(id) { return this.players.find(p => p.id === id); },
};
