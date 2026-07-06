/**
 * lunming2.js — 量化日主強弱評分系統（論命二）
 * 
 * 基於 得令（月令40%）、得地（通根30%）、得勢（黨眾20%）、得助（生扶10%）
 * 四大面向量化計分，客觀判斷身強/身弱，進而推論喜用神與忌神
 * 
 * 方法論源自子平命理量化派，參考多位現代命理師的評分模型
 */

// ============================================================
// 核心常數
// ============================================================

const ELEMENTS = ['木', '火', '土', '金', '水'];
const STEMS = '甲乙丙丁戊己庚辛壬癸';
const BRANCHES = '子丑寅卯辰巳午未申酉戌亥';

    // 天干五行
    const STEM_ELEMENT = {
        '甲': '木', '乙': '木',
        '丙': '火', '丁': '火',
        '戊': '土', '己': '土',
        '庚': '金', '辛': '金',
        '壬': '水', '癸': '水'
    };

    // 地支五行
    const BRANCH_ELEMENT = {
        '子': '水', '丑': '土', '寅': '木', '卯': '木',
        '辰': '土', '巳': '火', '午': '火', '未': '土',
        '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };

    // 地支藏干（本氣/中氣/餘氣）
    const HIDDEN_STEMS = {
        '子': [{stem:'癸', type:'main'}],
        '丑': [{stem:'己', type:'main'}, {stem:'癸', type:'mid'}, {stem:'辛', type:'residual'}],
        '寅': [{stem:'甲', type:'main'}, {stem:'丙', type:'mid'}, {stem:'戊', type:'residual'}],
        '卯': [{stem:'乙', type:'main'}],
        '辰': [{stem:'戊', type:'main'}, {stem:'乙', type:'mid'}, {stem:'癸', type:'residual'}],
        '巳': [{stem:'丙', type:'main'}, {stem:'戊', type:'mid'}, {stem:'庚', type:'residual'}],
        '午': [{stem:'丁', type:'main'}, {stem:'己', type:'mid'}],
        '未': [{stem:'己', type:'main'}, {stem:'丁', type:'mid'}, {stem:'乙', type:'residual'}],
        '申': [{stem:'庚', type:'main'}, {stem:'壬', type:'mid'}, {stem:'戊', type:'residual'}],
        '酉': [{stem:'辛', type:'main'}],
        '戌': [{stem:'戊', type:'main'}, {stem:'辛', type:'mid'}, {stem:'丁', type:'residual'}],
        '亥': [{stem:'壬', type:'main'}, {stem:'甲', type:'mid'}]
    };

    // ============================================================
    // 月令強度表（旺相休囚死）
    // 五行 → {spring:寅卯, summer:巳午, season:辰戌丑未, autumn:申酉, winter:亥子}
    // ============================================================

    const MONTH_STRENGTH = {
        '木': { spring: 40, summer: 16, season: 8,  autumn: 0,  winter: 32 },
        '火': { spring: 32, summer: 40, season: 16, autumn: 8,  winter: 0  },
        '土': { spring: 0,  summer: 32, season: 40, autumn: 16, winter: 8  },
        '金': { spring: 8,  summer: 0,  season: 32, autumn: 40, winter: 16 },
        '水': { spring: 16, summer: 8,  season: 0,  autumn: 32, winter: 40 }
    };

    // 四季標籤
    const SEASON_LABELS = {
        'spring': '春（寅卯月）',
        'summer': '夏（巳午月）',
        'season': '四季（辰戌丑未月）',
        'autumn': '秋（申酉月）',
        'winter': '冬（亥子月）'
    };

    // ============================================================
    // 特殊格局資料庫（供查詢與檢測比對）
    // ============================================================

    const SPECIAL_PATTERN_DB = {
        // ────── 專旺格（一行得氣） ──────
        quzhi: {
            id: 'quzhi',
            name: '曲直格',
            aliases: ['專旺格·木', '一行得氣格·木'],
            category: '專旺格',
            element: '木',
            condition: '甲乙日主生寅卯月，四柱地支寅卯亥全或會木局，無金（庚辛申酉）剋破',
            description: '木氣專旺，日主極強，屬於特殊格局中的專旺格。此格局最喜火（食傷）洩秀、土（財）為用，忌金來破格。',
            analysis: '春木騰騰，生氣蓬勃。格局純粹，氣勢不可逆。順其旺勢而洩之，以火（食傷）為用神，以土（財）為喜神。',
            advice: '最忌金（官殺）來破格，歲運逢金則易有失。宜火土行業。',
            judgment: '身強（專旺）',
            defaultFav: ['火', '土'],
            defaultUnfav: ['金']
        },
        yanshang: {
            id: 'yanshang',
            name: '炎上格',
            aliases: ['專旺格·火', '一行得氣格·火'],
            category: '專旺格',
            element: '火',
            condition: '丙丁日主生巳午月，四柱地支巳午未全或會火局，無水（壬癸亥子）剋破',
            description: '火氣專旺，日主極強。炎上格最喜土（食傷）洩秀、金（財）為用，忌水來破格。',
            analysis: '火炎土燥，氣勢衝天。順其炎上之勢，以土（食傷）洩其秀氣，以金（財）為喜。',
            advice: '最忌水（官殺）來破格，歲運逢水則易有災。宜土金行業。',
            judgment: '身強（專旺）',
            defaultFav: ['土', '金'],
            defaultUnfav: ['水']
        },
        jiase: {
            id: 'jiase',
            name: '稼穡格',
            aliases: ['專旺格·土', '一行得氣格·土'],
            category: '專旺格',
            element: '土',
            condition: '戊己日主生辰戌丑未月，四柱地支辰戌丑未全或會土局，無木（甲乙寅卯）剋破',
            description: '土氣專旺，日主極強。稼穡格最喜金（食傷）洩秀、水（財）為用，忌木來破格。',
            analysis: '土旺稼穡，厚德載物。順其旺勢，以金（食傷）洩之、以水（財）為喜。',
            advice: '最忌木（官殺）來破格，歲運逢木則易動盪。宜金水行業。',
            judgment: '身強（專旺）',
            defaultFav: ['金', '水'],
            defaultUnfav: ['木']
        },
        congge: {
            id: 'congge',
            name: '從革格',
            aliases: ['專旺格·金', '一行得氣格·金'],
            category: '專旺格',
            element: '金',
            condition: '庚辛日主生申酉月，四柱地支申酉戌全或會金局，無火（丙丁巳午）剋破',
            description: '金氣專旺，日主極強。從革格最喜水（食傷）洩秀、木（財）為用，忌火來破格。',
            analysis: '金曰從革，鋒芒畢露。順其剛銳之勢，以水（食傷）洩之、以木（財）為喜。',
            advice: '最忌火（官殺）來破格，歲運逢火則易有傷。宜水木行業。',
            judgment: '身強（專旺）',
            defaultFav: ['水', '木'],
            defaultUnfav: ['火']
        },
        runxia: {
            id: 'runxia',
            name: '潤下格',
            aliases: ['專旺格·水', '一行得氣格·水'],
            category: '專旺格',
            element: '水',
            condition: '壬癸日主生亥子月，四柱地支亥子丑全或會水局，無土（戊己辰戌丑未）剋破',
            description: '水氣專旺，日主極強。潤下格最喜木（食傷）洩秀、火（財）為用，忌土來破格。',
            analysis: '水曰潤下，汪洋浩瀚。順其奔流之勢，以木（食傷）洩之、以火（財）為喜。',
            advice: '最忌土（官殺）來破格，歲運逢土則易有阻。宜木火行業。',
            judgment: '身強（專旺）',
            defaultFav: ['木', '火'],
            defaultUnfav: ['土']
        },

        // ────── 從格（棄命相從） ──────
        congwang: {
            id: 'congwang',
            name: '從旺格',
            aliases: ['棄命從旺'],
            category: '從格',
            element: null,
            condition: '日主極強（總分≥85），四柱皆生扶日主，無剋洩耗之星（官殺、財、食傷）',
            description: '日主極旺，命局全局皆為生扶日主之五行，毫無剋洩。順其旺勢，反以比劫印星為喜。',
            analysis: '滿盤生扶，氣勢歸於日主。不能逆勢，宜順其旺氣。喜比劫、印星，忌官殺、財星來逆勢。',
            advice: '歲運宜行比劫、印星之地，最忌官殺來破格。',
            judgment: '身強（從旺）',
            defaultFav: null,
            defaultUnfav: null
        },
        congruo: {
            id: 'congruo',
            name: '從弱格',
            aliases: ['棄命從弱'],
            category: '從格',
            element: null,
            condition: '日主極弱（總分≤10），四柱無生扶，滿盤剋洩耗',
            description: '日主極弱，滿盤皆為剋洩耗，毫無幫扶。只能從其弱勢，喜財官食傷，忌印比幫扶。',
            analysis: '滿盤剋洩，日主孤立無援。不能扶之，宜順其弱勢。喜財、官殺、食傷，忌印星、比劫。',
            advice: '歲運宜行財官食傷之地，最忌印比來逆勢。',
            judgment: '身弱（從弱）',
            defaultFav: null,
            defaultUnfav: null
        },
        congguan: {
            id: 'congguan',
            name: '從官殺格',
            aliases: ['棄命從官'],
            category: '從格',
            element: null,
            condition: '日主極弱，四柱官殺（剋日主者）強旺且無印星轉化',
            description: '日主衰弱，官殺滿盤。無印星化官殺，亦無比劫幫扶。只能從官殺之勢。',
            analysis: '官殺攻身，毫無化解。宜順其官殺之氣，喜財（生官殺）、官殺，忌印（洩官殺）比（抗官殺）。',
            advice: '歲運宜行官殺財星之地，最忌印比幫扶日主而招致官殺剋身。',
            judgment: '身弱（從官殺）',
            defaultFav: null,
            defaultUnfav: null
        },
        congcai: {
            id: 'congcai',
            name: '從財格',
            aliases: ['棄命從財'],
            category: '從格',
            element: null,
            condition: '日主極弱，四柱財星（日主所剋者）強旺，日主無根',
            description: '日主衰弱，財星滿盤。日主無力剋財，反被財耗盡。只能從財之勢。',
            analysis: '財星滿盤，日主衰弱無力。宜順其財勢，喜官殺（洩財氣）、食傷（生財），忌比劫（剋財）。',
            advice: '歲運宜行官殺食傷之地，最忌比劫爭財。',
            judgment: '身弱（從財）',
            defaultFav: null,
            defaultUnfav: null
        },

        // ────── 一氣格 ──────
        tiangan_yiqi: {
            id: 'tiangan_yiqi',
            name: '天干一氣格',
            aliases: ['天元一氣', '四柱同干'],
            category: '一氣格',
            element: null,
            condition: '四柱天干全部相同（如甲甲甲甲、庚庚庚庚）',
            description: '四柱天干完全相同，氣勢極為純粹，為特殊格局之一。不論日主強弱，氣勢集中於該天干五行。',
            analysis: '天干一氣，氣勢專一。宜順其氣勢，不可逆之。比劫雖旺，但亦需配合地支來看。',
            advice: '因人而異，需結合地支與大運綜合判斷。通常不宜再見比劫幫扶。',
            judgment: '特殊格局',
            defaultFav: null,
            defaultUnfav: null
        },
        dizhi_yiqi: {
            id: 'dizhi_yiqi',
            name: '地支一氣格',
            aliases: ['地元一氣', '四柱同支'],
            category: '一氣格',
            element: null,
            condition: '四柱地支全部相同（如子子子子、午午午午）',
            description: '四柱地支完全相同，氣勢深固，為特殊格局之一。該地支五行力量極強。',
            analysis: '地支一氣，根基深厚。宜順其氣勢，不可衝破。',
            advice: '歲運最忌逢沖（如子午沖、卯酉沖）。',
            judgment: '特殊格局',
            defaultFav: null,
            defaultUnfav: null
        },

        // ────── 魁罡格 ──────
        kuigang: {
            id: 'kuigang',
            name: '魁罡格',
            aliases: ['魁罡入命'],
            category: '神煞格',
            element: null,
            condition: '日柱為庚辰、庚戌、壬辰、戊戌之一',
            description: '魁罡乃天罡地魁之星，膽識過人、聰明果斷。庚辰為天罡，庚戌為地魁，壬辰、戊戌亦屬之。',
            analysis: '魁罡入命，性剛果決，不耐欺辱。宜慈悲為懷，培養仁德之心。女命魁罡尤須注意婚姻。',
            advice: '魁罡最怕刑沖，歲運逢刑沖則易生波折。宜修身養性，以柔克剛。',
            judgment: '特殊神煞',
            defaultFav: null,
            defaultUnfav: null
        },

        // ────── 日貴格 ──────
        rigui: {
            id: 'rigui',
            name: '日貴格',
            aliases: ['日坐貴人'],
            category: '神煞格',
            element: null,
            condition: '日柱為丁酉、丁亥、癸巳、癸卯之一',
            description: '日坐天乙貴人，為人聰慧、氣質文雅、可得貴人相助。丁酉日最貴，癸卯日次之。',
            analysis: '日坐貴人，一生人緣佳，易得長輩或上級提攜。具有文采氣質。',
            advice: '貴人雖多，亦需自身努力方能成就。宜多行善事以增福慧。',
            judgment: '特殊神煞',
            defaultFav: null,
            defaultUnfav: null
        }
    };

    // ============================================================
    // 工具函數
    // ============================================================

    function getSeason(branch) {
        if ('寅卯'.indexOf(branch) !== -1) return 'spring';
        if ('巳午'.indexOf(branch) !== -1) return 'summer';
        if ('辰戌丑未'.indexOf(branch) !== -1) return 'season';
        if ('申酉'.indexOf(branch) !== -1) return 'autumn';
        if ('亥子'.indexOf(branch) !== -1) return 'winter';
        return 'season';
    }

    /**
     * 五行關係
     * @param {string} dm  日主五行
     * @param {string} other 其他五行
     * @returns {string} 'same' | 'birth' | 'born' | 'restrict' | 'restricted'
     */
    function getRelation(dm, other) {
        let i1 = ELEMENTS.indexOf(dm);
        let i2 = ELEMENTS.indexOf(other);
        if (i1 === -1 || i2 === -1) return 'unknown';
        if (i1 === i2) return 'same';
        // 相生: 木→火→土→金→水→木
        if ((i1 + 1) % 5 === i2) return 'born';      // 我生
        if ((i2 + 1) % 5 === i1) return 'birth';     // 生我
        // 相剋: 木→土→水→火→金→木
        if ((i1 + 2) % 5 === i2) return 'restrict';  // 我剋
        if ((i2 + 2) % 5 === i1) return 'restricted';// 剋我
        return 'neutral';
    }

    function getElementColorClass(el) {
        let map = { '木': 'element-wood', '火': 'element-fire', '土': 'element-earth', '金': 'element-metal', '水': 'element-water' };
        return map[el] || '';
    }

    function getScoreLevel(score, max) {
        let pct = score / max;
        if (pct >= 0.8) return 'very-high';
        if (pct >= 0.5) return 'high';
        if (pct >= 0.25) return 'mid';
        return 'low';
    }

    // ============================================================
    // 核心評分引擎
    // ============================================================

    function calculateDayMasterStrength(baziResult) {
        if (!baziResult || !baziResult.pillars || baziResult.pillars.length < 3) return null;

        let dm = baziResult.dayMaster;
        let dmElement = dm.element;
        let pillars = baziResult.pillars;
        let hasHour = pillars.length === 4;
        let pillarLabels = ['年', '月', '日'];
        if (hasHour) pillarLabels.push('時');

        let scores = {
            monthScore: 0,    // 月令得分 (max 40)
            rootScore: 0,     // 通根得分 (max 30)
            peerScore: 0,     // 黨眾得分 (max 20)
            supportScore: 0,  // 生扶得分 (max 10)
            totalScore: 0,
            judgment: '',
            details: {}
        };

        // ========================================
        // 1. 月令評分 (40分)
        // ========================================
        let monthBranch = pillars[1].branch;
        let season = getSeason(monthBranch);
        scores.monthScore = MONTH_STRENGTH[dmElement][season];
        scores.details.monthBranch = monthBranch;
        scores.details.monthSeason = season;

        // ========================================
        // 2. 地支通根評分 (30分)
        // ========================================
        let rootScore = 0;
        let rootDetails = [];

        pillars.forEach(function(pillar, idx) {
            let branch = pillar.branch;
            let hidden = HIDDEN_STEMS[branch] || [];

            hidden.forEach(function(h) {
                if (STEM_ELEMENT[h.stem] === dmElement) {
                    let points = 0;
                    if (h.type === 'main') points = 10;
                    else if (h.type === 'mid') points = 5;
                    else if (h.type === 'residual') points = 2;

                    // 日支坐根 ×1.5 加成
                    if (idx === 2) points = Math.round(points * 1.5);

                    rootScore += points;
                    rootDetails.push({
                        pillar: pillarLabels[idx],
                        branch: branch,
                        stem: h.stem,
                        type: h.type,
                        points: points
                    });
                }
            });
        });

        scores.rootScore = Math.min(rootScore, 30);
        scores.details.rootDetails = rootDetails;

        // ========================================
        // 3. 天干黨眾評分 (20分)
        // ========================================
        let peerScore = 0;
        let peerDetails = [];

        pillars.forEach(function(pillar, idx) {
            // 不計日主自身
            if (idx === 2) return;

            let stem = pillar.stem;
            let sEl = STEM_ELEMENT[stem];
            if (!sEl) return;

            let rel = getRelation(dmElement, sEl);
            if (rel === 'same') {
                // 比肩/劫財
                peerScore += 7;
                peerDetails.push({ pillar: pillarLabels[idx], stem: stem, type: '比劫', element: sEl });
            } else if (rel === 'birth') {
                // 正印/偏印 — 生我者
                peerScore += 5;
                peerDetails.push({ pillar: pillarLabels[idx], stem: stem, type: '印星', element: sEl });
            }
        });

        scores.peerScore = Math.min(peerScore, 20);
        scores.details.peerDetails = peerDetails;

        // ========================================
        // 4. 生扶助益評分 (10分)
        // ========================================
        let supportScore = 0;
        let supportDetails = [];

        // 月干助益 (+5)
        let monthStemEl = STEM_ELEMENT[pillars[1].stem];
        if (monthStemEl) {
            let mRel = getRelation(dmElement, monthStemEl);
            if (mRel === 'same' || mRel === 'birth') {
                supportScore += 5;
                supportDetails.push({ position: '月干', stem: pillars[1].stem, element: monthStemEl, points: 5 });
            }
        }

        // 時干助益 (+3)，僅在有時柱時計算
        if (hasHour) {
            let hourStemEl = STEM_ELEMENT[pillars[3].stem];
            if (hourStemEl) {
                let hRel = getRelation(dmElement, hourStemEl);
                if (hRel === 'same' || hRel === 'birth') {
                    supportScore += 3;
                    supportDetails.push({ position: '時干', stem: pillars[3].stem, element: hourStemEl, points: 3 });
                }
            }
        }

        // 日支助益 (+2)
        let dayBranchEl = BRANCH_ELEMENT[pillars[2].branch];
        if (dayBranchEl) {
            let dBRel = getRelation(dmElement, dayBranchEl);
            if (dBRel === 'same' || dBRel === 'birth') {
                supportScore += 2;
                supportDetails.push({ position: '日支', stem: pillars[2].branch, element: dayBranchEl, points: 2 });
            }
        }

        scores.supportScore = Math.min(supportScore, 10);
        scores.details.supportDetails = supportDetails;

        // ========================================
        // 總分計算
        // ========================================
        scores.totalScore = scores.monthScore + scores.rootScore + scores.peerScore + scores.supportScore;

        // ========================================
        // 格局判定
        // ========================================
        if (scores.totalScore >= 70) {
            scores.judgment = '身強';
        } else if (scores.totalScore >= 50) {
            scores.judgment = '偏強';
        } else if (scores.totalScore >= 30) {
            scores.judgment = '偏弱';
        } else {
            scores.judgment = '身弱';
        }

        // ========================================
        // 喜忌推論
        // ========================================
        let favResult = getFavorableUnfavorable(dmElement, scores.judgment);
        scores.favoriteElements = favResult.favorite;
        scores.unfavoriteElements = favResult.unfavorite;
        scores.favAnalysis = favResult.analysis;
        scores.favAdvice = favResult.advice;

        // ========================================
        // 特殊格局檢測（須在 scores 完整後執行）
        // ========================================
        scores.specialPatterns = detectSpecialPatterns(baziResult, scores);

        return scores;
    }

    /**
     * 依據格局推論喜用神與忌神
     */
    function getFavorableUnfavorable(dmElement, judgment) {
        let idx = ELEMENTS.indexOf(dmElement);
        if (idx === -1) return { favorite: [], unfavorite: [], analysis: '', advice: '' };

        let birthMe  = ELEMENTS[(idx + 4) % 5]; // 印（生我）
        let sameMe   = ELEMENTS[idx];            // 比劫（同我）
        let iBorn    = ELEMENTS[(idx + 1) % 5];  // 食傷（我生）
        let iRestrict = ELEMENTS[(idx + 2) % 5]; // 財（我剋）
        let restrictMe = ELEMENTS[(idx + 3) % 5];// 官殺（剋我）

        let favorite, unfavorite, analysis, advice;

        if (judgment === '身強' || judgment === '偏強') {
            // 身強宜剋洩耗：喜(官殺、財、食傷)，忌(印、比劫)
            favorite = [restrictMe, iRestrict, iBorn];
            unfavorite = [birthMe, sameMe];
            analysis = '日主' + dmElement + judgment + '，命局' + dmElement +
                       '元素過旺，宜以「官殺（' + restrictMe + '）」剋制、以「財（' + iRestrict +
                       '）」消耗、以「食傷（' + iBorn + '）」宣洩，使五行流通平衡。';
            advice = '宜補強「' + favorite.join('、') + '」五行；忌過多「' + unfavorite.join('、') + '」。';
        } else if (judgment === '身弱' || judgment === '偏弱') {
            // 身弱宜生扶：喜(印、比劫)，忌(官殺、財、食傷)
            favorite = [birthMe, sameMe];
            unfavorite = [restrictMe, iRestrict, iBorn];
            analysis = '日主' + dmElement + judgment + '，命局' + dmElement +
                       '元素衰弱，宜以「印（' + birthMe + '）」生扶、以「比劫（' + sameMe +
                       '）」幫助，增強日主力量。';
            advice = '宜補強「' + favorite.join('、') + '」五行；忌過多「' + unfavorite.join('、') + '」。';
        } else {
            favorite = [];
            unfavorite = [];
            analysis = '日主' + dmElement + '中和，命局五行能量相對平衡，宜根據大運流年五行變化適時調整，維持平衡為上。';
            advice = '中和格局，無特定喜忌，宜順勢而為。';
        }

        return { favorite: favorite, unfavorite: unfavorite, analysis: analysis, advice: advice };
    }

    // ============================================================
    // 特殊格局檢測
    // ============================================================

    /**
     * 檢測特殊格局
     * @param {Object} baziResult  原始八字結果
     * @param {Object} scores      量化評分結果
     * @returns {Array} 檢測到的格局列表 [{id, name, category, ...}]
     */
    function detectSpecialPatterns(baziResult, scores) {
        if (!baziResult || !scores) return [];

        let patterns = [];
        let dm = baziResult.dayMaster;
        let dmElement = dm.element;
        let pillars = baziResult.pillars;
        let totalScore = scores.totalScore;

        // 收集所有天干地支及其五行（相容3柱/4柱）
        const stems = pillars.map(function(p) { return p.stem; });
        const branches = pillars.map(function(p) { return p.branch; });
        let pillarLabels = ['年', '月', '日'];
        if (pillars.length === 4) pillarLabels.push('時');
        let stemElements = stems.map(function(s) { return STEM_ELEMENT[s]; });
        let branchElements = branches.map(function(b) { return BRANCH_ELEMENT[b]; });

        // 各元素計數 (stems 中排除日主自身)
        let stemCount = {};
        let branchCount = {};
        let allCount = {};
        ELEMENTS.forEach(function(e) {
            stemCount[e] = 0;
            branchCount[e] = 0;
            allCount[e] = 0;
        });

        stemElements.forEach(function(e, idx) {
            if (!e) return;
            stemCount[e]++;
            allCount[e]++;
        });

        branchElements.forEach(function(e) {
            if (!e) return;
            branchCount[e]++;
            allCount[e]++;
        });

        let monthBranch = branches[1];
        let monthSeason = getSeason(monthBranch);
        let dayStem = stems[2];
        let dayBranch = branches[2];

        // ────── 1. 專旺格檢測 ──────
        // 條件：月令旺(40) + 通根高 + 無剋星出現

        if (scores.monthScore === 40 && scores.rootScore >= 15) {
            // 曲直格：木日主，寅卯月，無金剋
            if (dmElement === '木' && (monthSeason === 'spring')) {
                if (stemCount['金'] === 0 && branchCount['金'] === 0) {
                    patterns.push(makePattern('quzhi', '曲直格（專旺·木）'));
                }
            }
            // 炎上格：火日主，巳午月，無水剋
            if (dmElement === '火' && (monthSeason === 'summer')) {
                if (stemCount['水'] === 0 && branchCount['水'] === 0) {
                    patterns.push(makePattern('yanshang', '炎上格（專旺·火）'));
                }
            }
            // 稼穡格：土日主，四季月，無木剋
            if (dmElement === '土' && (monthSeason === 'season')) {
                if (stemCount['木'] === 0 && branchCount['木'] === 0) {
                    patterns.push(makePattern('jiase', '稼穡格（專旺·土）'));
                }
            }
            // 從革格：金日主，申酉月，無火剋
            if (dmElement === '金' && (monthSeason === 'autumn')) {
                if (stemCount['火'] === 0 && branchCount['火'] === 0) {
                    patterns.push(makePattern('congge', '從革格（專旺·金）'));
                }
            }
            // 潤下格：水日主，亥子月，無土剋
            if (dmElement === '水' && (monthSeason === 'winter')) {
                if (stemCount['土'] === 0 && branchCount['土'] === 0) {
                    patterns.push(makePattern('runxia', '潤下格（專旺·水）'));
                }
            }
        }

        // ────── 2. 從格檢測 ──────
        // 從旺格：極強(≥85)
        if (totalScore >= 85) {
            patterns.push(makePattern('congwang', '從旺格'));
        }

        // 從弱格：極弱(≤10)
        if (totalScore <= 10) {
            patterns.push(makePattern('congruo', '從弱格'));
        }

        // 從官殺格：官殺(剋日主)元素占天干主導，且無印星轉化
        let dmIdx = ELEMENTS.indexOf(dmElement);
        let restrictEl = ELEMENTS[(dmIdx + 3) % 5]; // 剋日主者
        let restrictCount = (stemCount[restrictEl] || 0) + (branchCount[restrictEl] || 0);
        let birthEl = ELEMENTS[(dmIdx + 4) % 5]; // 生日主者
        let birthCount = (stemCount[birthEl] || 0) + (branchCount[birthEl] || 0);

        if (totalScore <= 20 && restrictCount >= 5 && birthCount <= 1) {
            patterns.push(makePattern('congguan', '從官殺格'));
        }

        // 從財格：財(日主所剋)元素主導
        let restrictEl2 = ELEMENTS[(dmIdx + 2) % 5]; // 日主所剋者
        let restrictCount2 = (stemCount[restrictEl2] || 0) + (branchCount[restrictEl2] || 0);
        let sameCount2 = (stemCount[dmElement] || 0) + (branchCount[dmElement] || 0);

        if (totalScore <= 20 && restrictCount2 >= 5 && sameCount2 <= 2 && restrictCount <= 1) {
            patterns.push(makePattern('congcai', '從財格'));
        }

        // ────── 3. 一氣格檢測 ──────
        // 天干一氣：四柱天干皆同
        if (stems[0] === stems[1] && stems[1] === stems[2] && stems[2] === stems[3]) {
            patterns.push(makePattern('tiangan_yiqi', '天干一氣格'));
        }

        // 地支一氣：四柱地支皆同
        if (branches[0] === branches[1] && branches[1] === branches[2] && branches[2] === branches[3]) {
            patterns.push(makePattern('dizhi_yiqi', '地支一氣格'));
        }

        // ────── 4. 魁罡格 ──────
        let KUI_GANG = { '庚辰': 1, '庚戌': 1, '壬辰': 1, '戊戌': 1 };
        if (KUI_GANG[dayStem + dayBranch]) {
            patterns.push(makePattern('kuigang', '魁罡格'));
        }

        // ────── 5. 日貴格 ──────
        let RI_GUI = { '丁酉': 1, '丁亥': 1, '癸巳': 1, '癸卯': 1 };
        if (RI_GUI[dayStem + dayBranch]) {
            patterns.push(makePattern('rigui', '日貴格'));
        }

        return patterns;
    }

    function makePattern(id, displayName) {
        let ref = SPECIAL_PATTERN_DB[id];
        if (!ref) return { id: id, name: displayName, category: '特殊' };
        return {
            id: id,
            name: ref.name,
            displayName: displayName,
            category: ref.category,
            element: ref.element,
            description: ref.description,
            analysis: ref.analysis,
            advice: ref.advice,
            condition: ref.condition,
            judgment: ref.judgment,
            defaultFav: ref.defaultFav,
            defaultUnfav: ref.defaultUnfav
        };
    }

    /** 依關鍵字查詢特殊格局 */
    function querySpecialPattern(keyword) {
        if (!keyword) return null;
        let kw = keyword.trim();
        let results = [];
        for (let id in SPECIAL_PATTERN_DB) {
            let p = SPECIAL_PATTERN_DB[id];
            if (p.name.indexOf(kw) !== -1 ||
                p.category.indexOf(kw) !== -1 ||
                (p.element && p.element.indexOf(kw) !== -1) ||
                (kw === id) ||
                (p.aliases && p.aliases.some(function(a) { return a.indexOf(kw) !== -1; }))
            ) {
                results.push(p);
            }
        }
        return results.length > 0 ? results : null;
    }

    /** 取得所有格局分類列表 */
    function getAllPatternCategories() {
        let cats = {};
        for (let id in SPECIAL_PATTERN_DB) {
            let p = SPECIAL_PATTERN_DB[id];
            if (!cats[p.category]) cats[p.category] = [];
            cats[p.category].push({ id: id, name: p.name, element: p.element });
        }
        return cats;
    }

    // ============================================================
    // 渲染 — 描述文字
    // ============================================================

    function getMonthDesc(scores) {
        let s = scores.monthScore;
        let branch = scores.details.monthBranch;
        let season = scores.details.monthSeason;
        let seasonLabel = SEASON_LABELS[season] || season;

        let status;
        if (s >= 32) status = '得令，旺相得力';
        else if (s >= 16) status = '平和不旺';
        else if (s >= 8) status = '失令，氣勢偏衰';
        else status = '失令，氣勢極衰';

        return '月支「' + branch + '」' + seasonLabel + ' — ' + status;
    }

    function getRootDesc(scores) {
        let details = scores.details.rootDetails;
        if (!details || details.length === 0) return '四柱地支無通根，日主無根';
        let descs = details.map(function(d) {
            let typeLabel = d.type === 'main' ? '本氣' : (d.type === 'mid' ? '中氣' : '餘氣');
            return d.pillar + '柱「' + d.branch + '」藏' + d.stem + '（' + typeLabel + ' +' + d.points + '分）';
        });
        return descs.join('；');
    }

    function getPeerDesc(scores) {
        let details = scores.details.peerDetails;
        if (!details || details.length === 0) return '天干無比劫、印星幫扶';
        let descs = details.map(function(d) {
            return d.pillar + '干「' + d.stem + '」（' + d.type + '）';
        });
        return descs.join('、');
    }

    function getSupportDesc(scores) {
        let details = scores.details.supportDetails;
        if (!details || details.length === 0) return '月干、時干、日支無明顯生扶';
        let descs = details.map(function(d) {
            return d.position + '「' + d.stem + '」（+' + d.points + '分）';
        });
        return descs.join('、');
    }

    // ============================================================
    // 渲染 — UI
    // ============================================================

    function renderLunming2(baziResult) {
        let root = document.getElementById('lunming2Root');
        if (!root) return;

        if (!baziResult) {
            root.innerHTML = '<div class="loading">請先於「排盤」頁籤輸入出生資料並排盤</div>';
            return;
        }

        let scores = calculateDayMasterStrength(baziResult);
        if (!scores) {
            root.innerHTML = '<div class="loading">評分計算失敗</div>';
            return;
        }

        let dm = baziResult.dayMaster;
        let dmElement = dm.element;
        let elClass = getElementColorClass(dmElement);

        // 判定 class
        let judgmentClass = (scores.judgment === '身強' || scores.judgment === '偏強') ? 'lm2-strong' : 'lm2-weak';

        let html = '';

        // ---- 評分總覽 ----
        html += '<div class="lm2-overview">';
        html += '<div class="lm2-dm-header">';
        html += '日主 <span class="' + elClass + ' lm2-dm-stem">' + dm.stem + dm.branch + '</span>';
        html += ' · 五行屬 <span class="' + elClass + '">' + dmElement + '</span>';
        html += ' · 格局 <span class="lm2-judgment ' + judgmentClass + '">' + scores.judgment + '</span>';
        html += '</div>';
        html += '<div class="lm2-total-score">';
        html += '日主強弱總評分：<span class="lm2-score-num">' + scores.totalScore + '</span> / 100';
        html += '</div>';
        html += '</div>';

        // ---- 四大面向評分 ----
        html += '<div class="lm2-four-aspects">';
        html += renderAspect('得令·月令', '月令為判斷日主強弱最重要因素，占40%權重', scores.monthScore, 40, getMonthDesc(scores));
        html += renderAspect('得地·通根', '地支藏干中是否有日主同五行之根氣，占30%權重', scores.rootScore, 30, getRootDesc(scores));
        html += renderAspect('得勢·黨眾', '天干比劫、印星幫扶之力，占20%權重', scores.peerScore, 20, getPeerDesc(scores));
        html += renderAspect('得助·生扶', '月干、時干、日支之生扶助力，占10%權重', scores.supportScore, 10, getSupportDesc(scores));
        html += '</div>';

        // ---- 詳細評分明細 ----
        html += '<div class="card">';
        html += '<div class="card-title">詳細評分明細</div>';
        html += renderDetailGrid(scores, dmElement);
        html += '</div>';

        // ---- 喜用神 / 忌神 ----
        html += '<div class="card">';
        html += '<div class="card-title">喜用神 · 忌神（量化評分法）</div>';
        html += renderFavoriteSection(scores);
        html += '</div>';

        // ---- 特殊格局顯示 ----
        html += renderSpecialPatternsCard(scores.specialPatterns || []);

        // ---- 對比原始喜忌 ----
        html += '<div class="card">';
        html += '<div class="card-title">對比 · 原有喜忌判斷</div>';
        html += renderComparison(baziResult, scores);
        html += '</div>';

        // ---- 特殊格局查詢 ----
        html += renderPatternQueryUI(scores);

        root.innerHTML = html;

        // 綁定查詢事件
        bindPatternQuery();
    }

    /** 單一面向進度條 */
    function renderAspect(title, note, score, max, desc) {
        let pct = Math.round((score / max) * 100);
        let level = getScoreLevel(score, max);
        return '<div class="lm2-aspect">'
            + '<div class="lm2-aspect-header">'
                + '<span class="lm2-aspect-title">' + title + '</span>'
                + '<span class="lm2-aspect-score lm2-score-' + level + '">' + score + '/' + max + '</span>'
            + '</div>'
            + '<div class="lm2-aspect-bar">'
                + '<div class="lm2-aspect-fill lm2-fill-' + level + '" style="width:' + pct + '%"></div>'
            + '</div>'
            + '<div class="lm2-aspect-desc">' + desc + '</div>'
            + '<div class="lm2-aspect-note">' + note + '</div>'
        + '</div>';
    }

    /** 詳細分數網格 */
    function renderDetailGrid(scores, dmElement) {
        let details = scores.details;
        let elClass = getElementColorClass(dmElement);
        let jClass = (scores.judgment === '身強' || scores.judgment === '偏強') ? 'lm2-strong' : 'lm2-weak';

        return '<div class="lm2-detail-grid">'
            + '<div class="lm2-detail-item"><div class="lm2-detail-label">日主五行</div><div class="lm2-detail-value ' + elClass + '">' + dmElement + '</div></div>'
            + '<div class="lm2-detail-item"><div class="lm2-detail-label">月令地支</div><div class="lm2-detail-value">' + details.monthBranch + '（' + (SEASON_LABELS[details.monthSeason] || details.monthSeason) + '）</div></div>'
            + '<div class="lm2-detail-item"><div class="lm2-detail-label">月令分數</div><div class="lm2-detail-value">' + scores.monthScore + '/40</div></div>'
            + '<div class="lm2-detail-item"><div class="lm2-detail-label">通根分數</div><div class="lm2-detail-value">' + scores.rootScore + '/30</div></div>'
            + '<div class="lm2-detail-item"><div class="lm2-detail-label">黨眾分數</div><div class="lm2-detail-value">' + scores.peerScore + '/20</div></div>'
            + '<div class="lm2-detail-item"><div class="lm2-detail-label">生扶分數</div><div class="lm2-detail-value">' + scores.supportScore + '/10</div></div>'
            + '<div class="lm2-detail-item lm2-total"><div class="lm2-detail-label">總分</div><div class="lm2-detail-value">' + scores.totalScore + '/100</div></div>'
            + '<div class="lm2-detail-item lm2-total"><div class="lm2-detail-label">格局</div><div class="lm2-detail-value ' + jClass + '">' + scores.judgment + '</div></div>'
        + '</div>';
    }

    /** 喜忌區 */
    function renderFavoriteSection(scores) {
        let fav = scores.favoriteElements || [];
        let unfav = scores.unfavoriteElements || [];

        let favHTML = fav.map(function(el) {
            return '<span class="' + getElementColorClass(el) + '" style="font-size:1.8rem;font-weight:700;">' + el + '</span>';
        }).join(' ') || '<span style="color:let(--text-muted);">—</span>';

        let unfavHTML = unfav.map(function(el) {
            return '<span class="' + getElementColorClass(el) + '" style="font-size:1.8rem;font-weight:700;opacity:0.6;">' + el + '</span>';
        }).join(' ') || '<span style="color:let(--text-muted);">—</span>';

        return '<div class="favorite-box">'
            + '<div class="favorite-item favorite"><div class="label">✓ 喜用神</div><div class="elements">' + favHTML + '</div><div class="desc">宜補強這些五行能量</div></div>'
            + '<div class="favorite-item unfavorite"><div class="label">✗ 忌神</div><div class="elements">' + unfavHTML + '</div><div class="desc">宜避免過多這些五行能量</div></div>'
            + '</div>'
            + '<div class="analysis-text">' + (scores.favAnalysis || '') + '</div>'
            + '<div style="margin-top:8px;font-size:0.9rem;color:let(--text-muted);">💡 ' + (scores.favAdvice || '') + '</div>';
    }

    /** 對比原始喜忌 */
    function renderComparison(baziResult, scores) {
        let original = baziResult.favoriteElement;
        if (!original) return '<div class="loading">無原始喜忌資料可比較</div>';

        let m1Fav = (original.favorite || []).join('、') || '—';
        let m1Unf = (original.unfavorite || []).join('、') || '—';
        let m2Fav = (scores.favoriteElements || []).join('、') || '—';
        let m2Unf = (scores.unfavoriteElements || []).join('、') || '—';

        let same = (m1Fav === m2Fav && m1Unf === m2Unf);
        let rowClass = same ? 'lm2-match' : 'lm2-diff';

        return '<div class="lm2-compare-box">'
            + '<div class="lm2-compare-row ' + rowClass + '">'
                + '<div class="lm2-compare-method"><div class="lm2-method-name">原有平衡法</div><div class="lm2-method-desc">基於五行強度加權</div></div>'
                + '<div class="lm2-compare-result"><span class="lm2-compare-label">喜用神</span><span class="lm2-compare-value">' + m1Fav + '</span><span class="lm2-compare-label">忌神</span><span class="lm2-compare-value">' + m1Unf + '</span></div>'
            + '</div>'
            + '<div class="lm2-compare-row ' + rowClass + '">'
                + '<div class="lm2-compare-method"><div class="lm2-method-name">量化評分法</div><div class="lm2-method-desc">得令·得地·得勢·得助</div></div>'
                + '<div class="lm2-compare-result"><span class="lm2-compare-label">喜用神</span><span class="lm2-compare-value">' + m2Fav + '</span><span class="lm2-compare-label">忌神</span><span class="lm2-compare-value">' + m2Unf + '</span></div>'
            + '</div>'
            + '<div class="lm2-compare-verdict">'
                + (same
                    ? '✅ 兩種判斷方法結果一致，論斷可靠度較高。'
                    : '⚠️ 兩種判斷方法結果不同，需綜合分析。量化評分法著重客觀權重，原有平衡法考量五行整體流通。建議以大運流年驗證。')
            + '</div>'
        + '</div>';
    }

    /** 渲染特殊格局卡片 */
    function renderSpecialPatternsCard(detected) {
        if (!detected || detected.length === 0) {
            return '<div class="card">'
                + '<div class="card-title">特殊格局</div>'
                + '<div style="padding:12px 0;color:let(--text-muted);font-size:0.9rem;">'
                + '未檢測到明顯特殊格局。命局屬一般正格。'
                + '</div>'
                + '</div>';
        }

        let html = '<div class="card lm2-pattern-card">';
        html += '<div class="card-title">✦ 特殊格局檢測</div>';

        detected.forEach(function(p, idx) {
            let catColors = {
                '專旺格': 'let(--fire)',
                '從格': 'let(--water)',
                '一氣格': 'let(--secondary-light)',
                '神煞格': 'let(--wood)'
            };
            let catColor = catColors[p.category] || 'let(--text-muted)';

            html += '<div class="lm2-pattern-item" style="border-left-color:' + catColor + ';">';
            html += '<div class="lm2-pattern-header">';
            html += '<span class="lm2-pattern-badge" style="background:' + catColor + ';">' + p.category + '</span>';
            html += '<span class="lm2-pattern-name">' + (p.displayName || p.name) + '</span>';
            html += '<span class="lm2-pattern-judgment ' + ((p.judgment && p.judgment.indexOf('弱') !== -1) ? 'lm2-weak' : 'lm2-strong') + '">' + (p.judgment || '') + '</span>';
            html += '</div>';

            if (p.description) {
                html += '<div class="lm2-pattern-desc">' + p.description + '</div>';
            }
            if (p.analysis) {
                html += '<div class="lm2-pattern-analysis">' + p.analysis + '</div>';
            }
            if (p.advice) {
                html += '<div class="lm2-pattern-advice">💡 ' + p.advice + '</div>';
            }

            // 格局喜忌
            if (p.defaultFav && p.defaultFav.length > 0) {
                let favEls = p.defaultFav.map(function(e) {
                    return '<span class="' + getElementColorClass(e) + '" style="font-weight:700;">' + e + '</span>';
                }).join(' ');
                html += '<div class="lm2-pattern-fav">✓ 喜：' + favEls + '</div>';
            }
            if (p.defaultUnfav && p.defaultUnfav.length > 0) {
                let unfEls = p.defaultUnfav.map(function(e) {
                    return '<span class="' + getElementColorClass(e) + '" style="font-weight:700;opacity:0.6;">' + e + '</span>';
                }).join(' ');
                html += '<div class="lm2-pattern-unfav">✗ 忌：' + unfEls + '</div>';
            }

            html += '<div class="lm2-pattern-condition">條件：' + (p.condition || '—') + '</div>';

            html += '</div>';
        });

        html += '</div>';
        return html;
    }

    /** 渲染特殊格局查詢UI */
    function renderPatternQueryUI(scores) {
        let cats = getAllPatternCategories();
        let catKeys = Object.keys(cats);

        let html = '<div class="card">';
        html += '<div class="card-title">📖 特殊格局查詢</div>';

        // 搜尋框
        html += '<div class="lm2-query-bar">';
        html += '<input type="text" id="patternQuery" class="lm2-query-input" placeholder="輸入格局名稱查詢（如：曲直格、從旺、魁罡）" />';
        html += '<button id="patternQueryBtn" class="lm2-query-btn">查詢</button>';
        html += '</div>';

        // 查詢結果區
        html += '<div id="patternQueryResult" class="lm2-query-result"></div>';

        // 格局分類列表（折疊式）
        html += '<div class="lm2-pattern-browser">';
        html += '<div class="lm2-browser-title" onclick="togglePatternBrowser()">📂 格局分類一覽 <span class="lm2-browser-arrow">▼</span></div>';
        html += '<div id="patternBrowserBody" class="lm2-browser-body" style="display:none;">';

        catKeys.forEach(function(cat) {
            html += '<div class="lm2-browser-cat">';
            html += '<div class="lm2-browser-cat-title">' + cat + '</div>';
            html += '<div class="lm2-browser-items">';
            cats[cat].forEach(function(p) {
                let elDot = p.element
                    ? '<span class="' + getElementColorClass(p.element) + '" style="font-weight:700;">●</span> '
                    : '';
                html += '<div class="lm2-browser-item" onclick="showPatternDetail(\'' + p.id + '\')">'
                    + elDot + p.name
                    + '</div>';
            });
            html += '</div></div>';
        });

        html += '</div></div>'; // browser body + browser

        // 詳細顯示區
        html += '<div id="patternDetailArea" class="lm2-detail-area"></div>';

        html += '</div>';
        return html;
    }

    /** 綁定查詢事件 */
    function bindPatternQuery() {
        let input = document.getElementById('patternQuery');
        let btn = document.getElementById('patternQueryBtn');
        let result = document.getElementById('patternQueryResult');
        if (!input || !btn || !result) return;

        function doQuery() {
            let kw = input.value.trim();
            if (!kw) {
                result.innerHTML = '<div class="lm2-query-hint">請輸入格局名稱</div>';
                return;
            }
            let matches = querySpecialPattern(kw);
            if (!matches || matches.length === 0) {
                result.innerHTML = '<div class="lm2-query-empty">❌ 未找到「' + kw + '」相關格局</div>';
                return;
            }
            let html = '<div class="lm2-query-count">找到 ' + matches.length + ' 個相關格局：</div>';
            matches.forEach(function(p) {
                html += renderPatternDetail(p);
            });
            result.innerHTML = html;
        }

        btn.addEventListener('click', doQuery);
        input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') doQuery();
        });
    }

    /** 渲染單個格局詳細 */
    function renderPatternDetail(p) {
        let catColors = {
            '專旺格': 'let(--fire)',
            '從格': 'let(--water)',
            '一氣格': 'let(--secondary-light)',
            '神煞格': 'let(--wood)'
        };
        let catColor = catColors[p.category] || 'let(--text-muted)';

        let html = '<div class="lm2-pattern-detail-card" id="detail-' + p.id + '">';
        html += '<div class="lm2-pattern-detail-header">';
        html += '<span class="lm2-pattern-badge" style="background:' + catColor + ';">' + p.category + '</span>';
        html += '<span class="lm2-pattern-detail-name">' + p.name + '</span>';
        if (p.element) {
            html += '<span class="' + getElementColorClass(p.element) + '" style="font-size:0.85rem;font-weight:600;">【' + p.element + '】</span>';
        }
        html += '</div>';

        if (p.aliases && p.aliases.length > 0) {
            html += '<div class="lm2-pattern-detail-aliases">別名：' + p.aliases.join('、') + '</div>';
        }
        html += '<div class="lm2-pattern-detail-body">' + (p.description || '') + '</div>';
        html += '<div class="lm2-pattern-detail-analysis">『 ' + (p.analysis || '') + ' 』</div>';
        html += '<div class="lm2-pattern-detail-advice">💡 ' + (p.advice || '') + '</div>';

        if (p.defaultFav && p.defaultFav.length > 0) {
            let favEls = p.defaultFav.map(function(e) {
                return '<span class="' + getElementColorClass(e) + '" style="font-weight:700;">' + e + '</span>';
            }).join(' ');
            html += '<div class="lm2-pattern-detail-fav">✓ 喜用：' + favEls + '</div>';
        }
        if (p.defaultUnfav && p.defaultUnfav.length > 0) {
            let unfEls = p.defaultUnfav.map(function(e) {
                return '<span class="' + getElementColorClass(e) + '" style="font-weight:700;opacity:0.6;">' + e + '</span>';
            }).join(' ');
            html += '<div class="lm2-pattern-detail-unfav">✗ 忌：' + unfEls + '</div>';
        }

        html += '</div>';
        return html;
    }

    // ============================================================
    // 全局查詢輔助（供 onclick 呼叫）
    // ============================================================

    globalThis.togglePatternBrowser = function() {
        let body = document.getElementById('patternBrowserBody');
        let arrow = document.querySelector('.lm2-browser-arrow');
        if (!body || !arrow) return;
        let isHidden = body.style.display === 'none';
        body.style.display = isHidden ? 'block' : 'none';
        arrow.textContent = isHidden ? '▲' : '▼';
    };

    globalThis.showPatternDetail = function(id) {
        let area = document.getElementById('patternDetailArea');
        if (!area) return;
        let ref = SPECIAL_PATTERN_DB[id];
        if (!ref) {
            area.innerHTML = '<div class="lm2-query-empty">未找到該格局資訊</div>';
            return;
        }
        area.innerHTML = renderPatternDetail(ref);
        area.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

// 向後相容：暴露全局
if (typeof window !== 'undefined') {
    window.renderLunming2 = renderLunming2;
    window.calculateDayMasterStrength = calculateDayMasterStrength;
    window.detectSpecialPatterns = detectSpecialPatterns;
    window.querySpecialPattern = querySpecialPattern;
    window.SPECIAL_PATTERN_DB = SPECIAL_PATTERN_DB;
    window.getAllPatternCategories = getAllPatternCategories;
    window.getSeason = getSeason;
    window.getRelation = getRelation;
    window.getElementColorClass = getElementColorClass;
    window.getScoreLevel = getScoreLevel;
    window.getFavorableUnfavorable = getFavorableUnfavorable;
}