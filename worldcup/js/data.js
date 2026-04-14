/**
 * 2026世界杯冠军预测 - 球队数据
 * 重点分析10强：法国、葡萄牙、西班牙、巴西、阿根廷、德国、英格兰、荷兰、比利时、日本
 * 数据范围：近10年（2016-2026）
 * 数据截止：2026年初
 */
const WC_DATA = {
    teams: [
        {
            id: 'FRA',
            name: '法国',
            nameEn: 'France',
            flag: '\u{1F1EB}\u{1F1F7}',
            confederation: 'UEFA',
            color: '#002395',
            bg: 'rgba(0,35,149,0.15)',
            history: {
                titles: 2,
                finals: 4,
                semiFinals: 7,
                recentResults: {
                    '2022WC': 'F',      // 世界杯亚军（决赛负阿根廷）
                    '2018WC': 'W',      // 世界杯冠军
                    '2024EU': 'SF',     // 欧洲杯四强
                    '2020EU': 'R16',    // 欧洲杯16强
                    '2023NL': 'QF',     // 欧国联八强
                    '2021NL': 'W'       // 欧国联冠军
                },
                recentWinRate: 0.64,
                totalAppearances: 16
            },
            squadValue: {
                totalMillionEUR: 1350,
                top5PlayersValue: 620,
                averageAge: 26.2,
                squadDepth: 30
            },
            keyPlayers: [
                { name: 'Kylian Mbappe', club: 'Real Madrid', position: 'LW', clubGoals2526: 22, clubAssists2526: 8, avgRating: 8.4, minutesPlayed: 2600, fitness: 'fit' },
                { name: 'Antoine Griezmann', club: 'Atletico Madrid', position: 'SS', clubGoals2526: 10, clubAssists2526: 9, avgRating: 7.5, minutesPlayed: 2200, fitness: 'fit' },
                { name: 'Aurelien Tchouameni', club: 'Real Madrid', position: 'DM', clubGoals2526: 3, clubAssists2526: 4, avgRating: 7.4, minutesPlayed: 2400, fitness: 'fit' },
                { name: 'William Saliba', club: 'Arsenal', position: 'CB', clubGoals2526: 2, clubAssists2526: 1, avgRating: 7.6, minutesPlayed: 2500, fitness: 'fit' },
                { name: 'Ousmane Dembele', club: 'PSG', position: 'RW', clubGoals2526: 11, clubAssists2526: 10, avgRating: 7.5, minutesPlayed: 2100, fitness: 'fit' }
            ],
            homeAdvantage: {
                hostCountry: false,
                geographicProximity: 0.3,
                diasporaFanBase: 0.4,
                climateAdaptation: 0.6,
                travelDistance: 0.3
            }
        },
        {
            id: 'POR',
            name: '葡萄牙',
            nameEn: 'Portugal',
            flag: '\u{1F1F5}\u{1F1F9}',
            confederation: 'UEFA',
            color: '#006600',
            bg: 'rgba(0,102,0,0.15)',
            history: {
                titles: 0,
                finals: 0,
                semiFinals: 2,
                recentResults: {
                    '2022WC': 'QF',     // 世界杯八强
                    '2018WC': 'R16',    // 世界杯16强
                    '2024EU': 'QF',     // 欧洲杯八强
                    '2020EU': 'R16',    // 欧洲杯16强
                    '2019NL': 'W',      // 欧国联冠军
                    '2016EU': 'W'       // 欧洲杯冠军!
                },
                recentWinRate: 0.58,
                totalAppearances: 8
            },
            squadValue: {
                totalMillionEUR: 850,
                top5PlayersValue: 400,
                averageAge: 27.5,
                squadDepth: 25
            },
            keyPlayers: [
                { name: 'Cristiano Ronaldo', club: 'Al-Nassr', position: 'CF', clubGoals2526: 28, clubAssists2526: 6, avgRating: 7.4, minutesPlayed: 2500, fitness: 'fit' },
                { name: 'Bernardo Silva', club: 'Man City', position: 'AM', clubGoals2526: 8, clubAssists2526: 12, avgRating: 7.7, minutesPlayed: 2300, fitness: 'fit' },
                { name: 'Rafael Leao', club: 'AC Milan', position: 'LW', clubGoals2526: 12, clubAssists2526: 9, avgRating: 7.5, minutesPlayed: 2200, fitness: 'fit' },
                { name: 'Bruno Fernandes', club: 'Man United', position: 'AM', clubGoals2526: 9, clubAssists2526: 11, avgRating: 7.4, minutesPlayed: 2400, fitness: 'fit' },
                { name: 'Ruben Dias', club: 'Man City', position: 'CB', clubGoals2526: 2, clubAssists2526: 1, avgRating: 7.3, minutesPlayed: 2200, fitness: 'fit' }
            ],
            homeAdvantage: {
                hostCountry: false,
                geographicProximity: 0.3,
                diasporaFanBase: 0.45,
                climateAdaptation: 0.6,
                travelDistance: 0.3
            }
        },
        {
            id: 'ESP',
            name: '西班牙',
            nameEn: 'Spain',
            flag: '\u{1F1EA}\u{1F1F8}',
            confederation: 'UEFA',
            color: '#FF4B44',
            bg: 'rgba(255,75,68,0.15)',
            history: {
                titles: 1,
                finals: 1,
                semiFinals: 4,
                recentResults: {
                    '2022WC': 'R16',    // 世界杯16强
                    '2018WC': 'R16',    // 世界杯16强
                    '2024EU': 'W',      // 欧洲杯冠军!
                    '2020EU': 'SF',     // 欧洲杯四强
                    '2023NL': 'F',      // 欧国联亚军
                    '2019NL': 'F'       // 欧国联决赛圈
                },
                recentWinRate: 0.60,
                totalAppearances: 16
            },
            squadValue: {
                totalMillionEUR: 1050,
                top5PlayersValue: 520,
                averageAge: 25.2,
                squadDepth: 28
            },
            keyPlayers: [
                { name: 'Lamine Yamal', club: 'Barcelona', position: 'RW', clubGoals2526: 14, clubAssists2526: 15, avgRating: 8.2, minutesPlayed: 2400, fitness: 'fit' },
                { name: 'Pedri', club: 'Barcelona', position: 'CM', clubGoals2526: 8, clubAssists2526: 11, avgRating: 7.8, minutesPlayed: 2200, fitness: 'fit' },
                { name: 'Rodri', club: 'Man City', position: 'DM', clubGoals2526: 4, clubAssists2526: 5, avgRating: 7.7, minutesPlayed: 1800, fitness: 'minor_concern' },
                { name: 'Gavi', club: 'Barcelona', position: 'CM', clubGoals2526: 6, clubAssists2526: 7, avgRating: 7.5, minutesPlayed: 2000, fitness: 'fit' },
                { name: 'Nico Williams', club: 'Athletic Bilbao', position: 'LW', clubGoals2526: 10, clubAssists2526: 9, avgRating: 7.6, minutesPlayed: 2300, fitness: 'fit' }
            ],
            homeAdvantage: {
                hostCountry: false,
                geographicProximity: 0.35,
                diasporaFanBase: 0.65,
                climateAdaptation: 0.7,
                travelDistance: 0.3
            }
        },
        {
            id: 'BRA',
            name: '巴西',
            nameEn: 'Brazil',
            flag: '\u{1F1E7}\u{1F1F7}',
            confederation: 'CONMEBOL',
            color: '#FFDF00',
            bg: 'rgba(255,223,0,0.15)',
            history: {
                titles: 5,
                finals: 7,
                semiFinals: 11,
                recentResults: {
                    '2022WC': 'QF',     // 世界杯八强（点球负克罗地亚）
                    '2018WC': 'QF',     // 世界杯八强（负比利时）
                    '2014WC': 'SF',     // 世界杯四强（东道主，1-7负德国）
                    '2024CA': 'QF',     // 美洲杯八强
                    '2021CA': 'F',      // 美洲杯亚军
                    '2019CA': 'W'       // 美洲杯冠军
                },
                recentWinRate: 0.62,
                totalAppearances: 22
            },
            squadValue: {
                totalMillionEUR: 1180,
                top5PlayersValue: 580,
                averageAge: 26.4,
                squadDepth: 28
            },
            keyPlayers: [
                { name: 'Vinicius Jr.', club: 'Real Madrid', position: 'LW', clubGoals2526: 19, clubAssists2526: 12, avgRating: 8.3, minutesPlayed: 2500, fitness: 'fit' },
                { name: 'Rodrygo', club: 'Real Madrid', position: 'RW', clubGoals2526: 12, clubAssists2526: 8, avgRating: 7.6, minutesPlayed: 2200, fitness: 'fit' },
                { name: 'Endrick', club: 'Real Madrid', position: 'CF', clubGoals2526: 8, clubAssists2526: 3, avgRating: 7.1, minutesPlayed: 1400, fitness: 'fit' },
                { name: 'Bruno Guimaraes', club: 'Newcastle', position: 'CM', clubGoals2526: 5, clubAssists2526: 7, avgRating: 7.5, minutesPlayed: 2400, fitness: 'fit' },
                { name: 'Marquinhos', club: 'PSG', position: 'CB', clubGoals2526: 2, clubAssists2526: 1, avgRating: 7.3, minutesPlayed: 2300, fitness: 'fit' }
            ],
            homeAdvantage: {
                hostCountry: false,
                geographicProximity: 0.55,
                diasporaFanBase: 0.8,
                climateAdaptation: 0.8,
                travelDistance: 0.5
            }
        },
        {
            id: 'ARG',
            name: '阿根廷',
            nameEn: 'Argentina',
            flag: '\u{1F1E6}\u{1F1F7}',
            confederation: 'CONMEBOL',
            color: '#75AADB',
            bg: 'rgba(117,170,219,0.15)',
            history: {
                titles: 3,
                finals: 6,
                semiFinals: 8,
                recentResults: {
                    '2022WC': 'W',      // 世界杯冠军
                    '2018WC': 'R16',    // 世界杯16强
                    '2014WC': 'F',      // 世界杯亚军
                    '2024CA': 'W',      // 美洲杯冠军
                    '2021CA': 'W',      // 美洲杯冠军
                    '2024FIN': 'W'      // FIFA排名第1
                },
                recentWinRate: 0.68,
                totalAppearances: 18
            },
            squadValue: {
                totalMillionEUR: 950,
                top5PlayersValue: 450,
                averageAge: 27.8,
                squadDepth: 26
            },
            keyPlayers: [
                { name: 'Lionel Messi', club: 'Inter Miami', position: 'RW', clubGoals2526: 14, clubAssists2526: 16, avgRating: 8.0, minutesPlayed: 1800, fitness: 'minor_concern' },
                { name: 'Julian Alvarez', club: 'Atletico Madrid', position: 'CF', clubGoals2526: 16, clubAssists2526: 7, avgRating: 7.8, minutesPlayed: 2400, fitness: 'fit' },
                { name: 'Enzo Fernandez', club: 'Chelsea', position: 'CM', clubGoals2526: 6, clubAssists2526: 9, avgRating: 7.6, minutesPlayed: 2300, fitness: 'fit' },
                { name: 'Alexis Mac Allister', club: 'Liverpool', position: 'CM', clubGoals2526: 7, clubAssists2526: 10, avgRating: 7.7, minutesPlayed: 2500, fitness: 'fit' },
                { name: 'Lautaro Martinez', club: 'Inter Milan', position: 'CF', clubGoals2526: 18, clubAssists2526: 5, avgRating: 7.9, minutesPlayed: 2300, fitness: 'fit' }
            ],
            homeAdvantage: {
                hostCountry: false,
                geographicProximity: 0.5,
                diasporaFanBase: 0.75,
                climateAdaptation: 0.7,
                travelDistance: 0.45
            }
        },
        {
            id: 'GER',
            name: '德国',
            nameEn: 'Germany',
            flag: '\u{1F1E9}\u{1F1EA}',
            confederation: 'UEFA',
            color: '#DDDDDD',
            bg: 'rgba(255,255,255,0.08)',
            history: {
                titles: 4,
                finals: 8,
                semiFinals: 13,
                recentResults: {
                    '2022WC': 'GS',     // 世界杯小组赛出局
                    '2018WC': 'GS',     // 世界杯小组赛出局
                    '2014WC': 'W',      // 世界杯冠军
                    '2024EU': 'QF',     // 欧洲杯八强（东道主）
                    '2020EU': 'R16',    // 欧洲杯16强
                    '2023NL': 'GS'      // 欧国联小组赛
                },
                recentWinRate: 0.52,
                totalAppearances: 20
            },
            squadValue: {
                totalMillionEUR: 980,
                top5PlayersValue: 480,
                averageAge: 25.8,
                squadDepth: 27
            },
            keyPlayers: [
                { name: 'Jamal Musiala', club: 'Bayern Munich', position: 'AM', clubGoals2526: 15, clubAssists2526: 13, avgRating: 8.1, minutesPlayed: 2500, fitness: 'fit' },
                { name: 'Florian Wirtz', club: 'Bayer Leverkusen', position: 'AM', clubGoals2526: 14, clubAssists2526: 11, avgRating: 8.0, minutesPlayed: 2400, fitness: 'fit' },
                { name: 'Leroy Sane', club: 'Bayern Munich', position: 'RW', clubGoals2526: 9, clubAssists2526: 8, avgRating: 7.3, minutesPlayed: 2000, fitness: 'minor_concern' },
                { name: 'Kai Havertz', club: 'Arsenal', position: 'CF', clubGoals2526: 12, clubAssists2526: 6, avgRating: 7.4, minutesPlayed: 2300, fitness: 'fit' },
                { name: 'Antonio Rudiger', club: 'Real Madrid', position: 'CB', clubGoals2526: 3, clubAssists2526: 1, avgRating: 7.3, minutesPlayed: 2400, fitness: 'fit' }
            ],
            homeAdvantage: {
                hostCountry: false,
                geographicProximity: 0.3,
                diasporaFanBase: 0.35,
                climateAdaptation: 0.55,
                travelDistance: 0.3
            }
        },
        {
            id: 'ENG',
            name: '英格兰',
            nameEn: 'England',
            flag: '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}',
            confederation: 'UEFA',
            color: '#FFFFFF',
            bg: 'rgba(255,255,255,0.1)',
            history: {
                titles: 1,
                finals: 2,
                semiFinals: 4,
                recentResults: {
                    '2022WC': 'QF',     // 世界杯八强
                    '2018WC': 'SF',     // 世界杯四强
                    '2024EU': 'F',      // 欧洲杯亚军
                    '2020EU': 'F',      // 欧洲杯亚军
                    '2023NL': 'QF',     // 欧国联八强
                    '2019NL': 'SF'      // 欧国联四强
                },
                recentWinRate: 0.61,
                totalAppearances: 16
            },
            squadValue: {
                totalMillionEUR: 1400,
                top5PlayersValue: 650,
                averageAge: 26.0,
                squadDepth: 29
            },
            keyPlayers: [
                { name: 'Jude Bellingham', club: 'Real Madrid', position: 'AM', clubGoals2526: 16, clubAssists2526: 10, avgRating: 8.2, minutesPlayed: 2500, fitness: 'fit' },
                { name: 'Bukayo Saka', club: 'Arsenal', position: 'RW', clubGoals2526: 15, clubAssists2526: 11, avgRating: 8.0, minutesPlayed: 2400, fitness: 'fit' },
                { name: 'Declan Rice', club: 'Arsenal', position: 'DM', clubGoals2526: 5, clubAssists2526: 7, avgRating: 7.6, minutesPlayed: 2500, fitness: 'fit' },
                { name: 'Phil Foden', club: 'Man City', position: 'LW', clubGoals2526: 13, clubAssists2526: 9, avgRating: 7.8, minutesPlayed: 2200, fitness: 'fit' },
                { name: 'Harry Kane', club: 'Bayern Munich', position: 'CF', clubGoals2526: 24, clubAssists2526: 8, avgRating: 8.1, minutesPlayed: 2600, fitness: 'fit' }
            ],
            homeAdvantage: {
                hostCountry: false,
                geographicProximity: 0.3,
                diasporaFanBase: 0.4,
                climateAdaptation: 0.55,
                travelDistance: 0.3
            }
        },
        {
            id: 'NED',
            name: '荷兰',
            nameEn: 'Netherlands',
            flag: '\u{1F1F3}\u{1F1F1}',
            confederation: 'UEFA',
            color: '#FF6600',
            bg: 'rgba(255,102,0,0.15)',
            history: {
                titles: 0,
                finals: 3,
                semiFinals: 5,
                recentResults: {
                    '2022WC': 'QF',     // 世界杯八强
                    '2018WC': 'DNQ',    // 未出线
                    '2014WC': 'SF',     // 世界杯四强
                    '2024EU': 'SF',     // 欧洲杯四强
                    '2020EU': 'R16',    // 欧洲杯16强
                    '2019NL': 'F'       // 欧国联亚军
                },
                recentWinRate: 0.55,
                totalAppearances: 11
            },
            squadValue: {
                totalMillionEUR: 750,
                top5PlayersValue: 370,
                averageAge: 26.5,
                squadDepth: 24
            },
            keyPlayers: [
                { name: 'Cody Gakpo', club: 'Liverpool', position: 'LW', clubGoals2526: 14, clubAssists2526: 8, avgRating: 7.6, minutesPlayed: 2300, fitness: 'fit' },
                { name: 'Frenkie de Jong', club: 'Barcelona', position: 'CM', clubGoals2526: 4, clubAssists2526: 8, avgRating: 7.4, minutesPlayed: 1900, fitness: 'minor_concern' },
                { name: 'Denzel Dumfries', club: 'Inter Milan', position: 'RB', clubGoals2526: 5, clubAssists2526: 7, avgRating: 7.2, minutesPlayed: 2200, fitness: 'fit' },
                { name: 'Virgil van Dijk', club: 'Liverpool', position: 'CB', clubGoals2526: 3, clubAssists2526: 1, avgRating: 7.5, minutesPlayed: 2400, fitness: 'fit' },
                { name: 'Xavi Simons', club: 'RB Leipzig', position: 'AM', clubGoals2526: 11, clubAssists2526: 10, avgRating: 7.7, minutesPlayed: 2300, fitness: 'fit' }
            ],
            homeAdvantage: {
                hostCountry: false,
                geographicProximity: 0.3,
                diasporaFanBase: 0.3,
                climateAdaptation: 0.55,
                travelDistance: 0.3
            }
        },
        {
            id: 'BEL',
            name: '比利时',
            nameEn: 'Belgium',
            flag: '\u{1F1E7}\u{1F1EA}',
            confederation: 'UEFA',
            color: '#ED2939',
            bg: 'rgba(237,41,57,0.15)',
            history: {
                titles: 0,
                finals: 0,
                semiFinals: 2,
                recentResults: {
                    '2022WC': 'GS',     // 世界杯小组赛出局
                    '2018WC': 'SF',     // 世界杯四强
                    '2024EU': 'R16',    // 欧洲杯16强
                    '2020EU': 'QF',     // 欧洲杯八强
                    '2023NL': 'GS',     // 欧国联降级
                    '2021NL': 'SF'      // 欧国联四强
                },
                recentWinRate: 0.52,
                totalAppearances: 14
            },
            squadValue: {
                totalMillionEUR: 550,
                top5PlayersValue: 280,
                averageAge: 27.2,
                squadDepth: 22
            },
            keyPlayers: [
                { name: 'Kevin De Bruyne', club: 'Man City', position: 'AM', clubGoals2526: 6, clubAssists2526: 14, avgRating: 7.8, minutesPlayed: 1800, fitness: 'minor_concern' },
                { name: 'Jeremy Doku', club: 'Man City', position: 'LW', clubGoals2526: 8, clubAssists2526: 10, avgRating: 7.3, minutesPlayed: 2000, fitness: 'fit' },
                { name: 'Lois Openda', club: 'RB Leipzig', position: 'CF', clubGoals2526: 16, clubAssists2526: 5, avgRating: 7.5, minutesPlayed: 2400, fitness: 'fit' },
                { name: 'Amadou Onana', club: 'Aston Villa', position: 'DM', clubGoals2526: 4, clubAssists2526: 3, avgRating: 7.2, minutesPlayed: 2300, fitness: 'fit' }
            ],
            homeAdvantage: {
                hostCountry: false,
                geographicProximity: 0.25,
                diasporaFanBase: 0.25,
                climateAdaptation: 0.55,
                travelDistance: 0.3
            }
        },
        {
            id: 'JPN',
            name: '日本',
            nameEn: 'Japan',
            flag: '\u{1F1EF}\u{1F1F5}',
            confederation: 'AFC',
            color: '#BC002D',
            bg: 'rgba(188,0,45,0.15)',
            history: {
                titles: 0,
                finals: 0,
                semiFinals: 0,
                recentResults: {
                    '2022WC': 'R16',    // 世界杯16强（击败德国、西班牙!）
                    '2018WC': 'R16',    // 世界杯16强
                    '2024AC': 'QF',     // 亚洲杯八强
                    '2023AC': 'QF',     // 亚洲杯八强
                    '2019AC': 'F'       // 亚洲杯亚军
                },
                recentWinRate: 0.54,
                totalAppearances: 7
            },
            squadValue: {
                totalMillionEUR: 320,
                top5PlayersValue: 180,
                averageAge: 26.5,
                squadDepth: 25
            },
            keyPlayers: [
                { name: 'Takefusa Kubo', club: 'Real Sociedad', position: 'RW', clubGoals2526: 10, clubAssists2526: 8, avgRating: 7.4, minutesPlayed: 2300, fitness: 'fit' },
                { name: 'Kaoru Mitoma', club: 'Brighton', position: 'LW', clubGoals2526: 9, clubAssists2526: 7, avgRating: 7.3, minutesPlayed: 2100, fitness: 'fit' },
                { name: 'Wataru Endo', club: 'Liverpool', position: 'DM', clubGoals2526: 2, clubAssists2526: 3, avgRating: 7.1, minutesPlayed: 1800, fitness: 'fit' },
                { name: 'Daichi Kamada', club: 'Crystal Palace', position: 'AM', clubGoals2526: 7, clubAssists2526: 6, avgRating: 7.2, minutesPlayed: 2000, fitness: 'fit' },
                { name: 'Takehiro Tomiyasu', club: 'Arsenal', position: 'CB', clubGoals2526: 1, clubAssists2526: 2, avgRating: 7.1, minutesPlayed: 1900, fitness: 'minor_concern' }
            ],
            homeAdvantage: {
                hostCountry: false,
                geographicProximity: 0.15,
                diasporaFanBase: 0.2,
                climateAdaptation: 0.5,
                travelDistance: 0.15
            }
        }
    ],

    getTeam(id) {
        return this.teams.find(t => t.id === id);
    },

    getTeamIndex(id) {
        return this.teams.findIndex(t => t.id === id);
    }
};
