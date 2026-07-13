/**
 * bazi.js — 八字計算引擎
 * Eight Characters (Bazi) Calculation Engine
 *
 * 功能：
 * - 四柱八字（年、月、日、時柱）計算
 * - 天干地支、五行、生肖、納音
 * - 十神系統
 * - 藏干提取
 * - 五行強度分析
 * - 喜用神 / 忌神 推薦
 * - 大運起運
 */

import {
    getSexagenaryIndexFast,
    STEM_ELEMENT_ARRAY as STEM_ELEMENT,
    BRANCH_ELEMENT_ARRAY as BRANCH_ELEMENT,
    STEM_YIN_YANG,
    BRANCH_YIN_YANG,
    ELEMENT_COLORS
} from './data.js';
import { analyzeGanZhiInteractions } from './interactions.js';

// 五大常數改由 data.js 單一定義（消除重複），此處 re-export 維持相容
export { STEM_ELEMENT, BRANCH_ELEMENT, STEM_YIN_YANG, BRANCH_YIN_YANG, ELEMENT_COLORS };

// ============================================================
// 基礎資料庫
// ============================================================

/** 天干 */
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** 地支 */
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 以下常數已改由檔首從 data.js import（見上方 import/re-export）

/** 地支藏干：每个地支包含的本气、中气、余气 */
export const HIDDEN_STEMS = {
    子: ['癸'],
    丑: ['己', '癸', '辛'],
    寅: ['甲', '丙', '戊'],
    卯: ['乙'],
    辰: ['戊', '乙', '癸'],
    巳: ['丙', '庚', '戊'],
    午: ['丁', '己'],
    未: ['己', '丁', '乙'],
    申: ['庚', '壬', '戊'],
    酉: ['辛'],
    戌: ['戊', '辛', '丁'],
    亥: ['壬', '甲']
};

/** 生肖 */
export const ZODIAC = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];

/** 納音 (60甲子納音表) */
export const NAYIN = [
    '海中金',
    '爐中火',
    '大林木',
    '路旁土',
    '劍鋒金',
    '山頭火',
    '澗下水',
    '城頭土',
    '白蠟金',
    '楊柳木',
    '泉中水',
    '屋上土',
    '霹靂火',
    '松柏木',
    '長流水',
    '砂石金',
    '山下火',
    '平地木',
    '壁上土',
    '金箔金',
    '覆燈火',
    '天河水',
    '大驛土',
    '釵釧金',
    '桑柘木',
    '大溪水',
    '沙中土',
    '天上火',
    '石榴木',
    '大海水'
];

// ELEMENT_COLORS 已改由檔首從 data.js import（見上方 import/re-export）

/** 五行生剋關係 */
export const ELEMENT_CYCLE = ['木', '火', '土', '金', '水']; // 木生火, 火生土, ...

// ============================================================
// 核心計算函數
// ============================================================

/**
 * 取得該年立春的日期（精確到浮點數天）
 * 立春通常在 2/3~2/5 之間
 * 使用改良的天文近似公式
 */
export function getLichunDate(year) {
    // 立春的太陽黃經為 315°
    // 參考點：2000年立春在2月4日 20:03 (UT+8) → 2月4.835日
    // 使用回歸年 365.2422 天計算
    // 但公曆年的平均長度為 365.2425 天（考慮閏年規則）
    // 所以立春日期的漂移非常小（每年約 0.0003 天）

    // 主要修正來自地球軌道離心率（±1天）和閏年循環
    // 使用正弦修正模擬軌道效應
    const baseDay = 4.0;

    // 地球軌道離心率造成的週期性偏移
    // 近日點在1月初，遠日點在7月初
    // 這使得冬季節氣稍微偏移
    const angle = ((year - 2000) * 0.0172) % (Math.PI * 2); // 約一年0.9856度(弧度)
    const eccentricity = 0.0334; // 地球軌道離心率
    const correction = eccentricity * Math.sin(angle) * 2;

    // 4年閏年週期微調
    const leapCycle = Math.sin(((year - 2000) * Math.PI) / 2) * 0.15;

    return baseDay + correction + leapCycle;
}

/**
 * 取得年柱（以立春為界）
 * 八字年柱以立春（約2月4日）為分界，非元旦
 *
 * @param {number} year 西元年份
 * @param {number} month 月份 (1-12)
 * @param {number} day 日期 (1-31)
 * @returns {{ stem: string, branch: string, stemIndex: number, branchIndex: number }}
 */
export function getYearPillar(year, month, day) {
    // 判斷是否在立春之前
    const lichunDay = getLichunDate(year);
    let effectiveYear = year;

    if (month < 2 || (month === 2 && day < Math.floor(lichunDay))) {
        // 在立春之前，年柱仍用前一年
        effectiveYear = year - 1;
    }
    // 2月且日期>=立春日，或在2月之後，使用該年

    const stemIndex = (effectiveYear - 4) % 10;
    const branchIndex = (effectiveYear - 4) % 12;
    return {
        stem: STEMS[stemIndex >= 0 ? stemIndex : stemIndex + 10],
        branch: BRANCHES[branchIndex >= 0 ? branchIndex : branchIndex + 12],
        stemIndex: stemIndex >= 0 ? stemIndex : stemIndex + 10,
        branchIndex: branchIndex >= 0 ? branchIndex : branchIndex + 12,
        effectiveYear: effectiveYear
    };
}

/**
 * 節氣近似日期（用於月柱計算）
 * 每個節氣對應的月份地支起始日（月份從寅開始）
 * @returns {Array<{month: number, solarTermDay: number, branch: string}>}
 */
export function getSolarTerms(year) {
    // 回傳該年各月份節氣的大約日期（立春、驚蟄、清明...）
    // 精確到小數點後1天，使用天文學近似公式
    // 參考：https://en.wikipedia.org/wiki/Solar_term

    // 二十四節氣日期近似計算 (1月~12月)
    // 每個節氣的日期的近似值，精確度約±1天
    const solarTerms = {
        // 立春使用更精確的獨立計算
        立春: getLichunDate(year), // 寅月開始 約2/4
        驚蟄: getApproximateSolarTermDate(year, 3, 5.5), // 卯月開始 約3/6
        清明: getApproximateSolarTermDate(year, 4, 4.5), // 辰月開始 約4/5
        立夏: getApproximateSolarTermDate(year, 5, 5.5), // 巳月開始 約5/6
        芒種: getApproximateSolarTermDate(year, 6, 5.5), // 午月開始 約6/6
        小暑: getApproximateSolarTermDate(year, 7, 7.0), // 未月開始 約7/7
        立秋: getApproximateSolarTermDate(year, 8, 7.5), // 申月開始 約8/7
        白露: getApproximateSolarTermDate(year, 9, 7.5), // 酉月開始 約9/8
        寒露: getApproximateSolarTermDate(year, 10, 8.0), // 戌月開始 約10/8
        立冬: getApproximateSolarTermDate(year, 11, 7.0), // 亥月開始 約11/7
        大雪: getApproximateSolarTermDate(year, 12, 7.0), // 子月開始 約12/7
        小寒: getApproximateSolarTermDate(year + 1, 1, 5.5) // 丑月開始 約1/6 (下一年)
    };

    return solarTerms;
}

/**
 * 節氣日期近似計算（使用改進的公式）
 * @param {number} year
 * @param {number} month
 * @param {number} baseDay 基準日（浮點數）
 * @returns {number} 該節氣在該月的日期（浮點數）
 */
const _solarTermDateCache = new Map();

export function getApproximateSolarTermDate(year, month, baseDay) {
    // 基於天文學計算的簡化版
    // 由於地球軌道離心率，各節氣日期略有偏移
    // 使用正弦修正來提高精確度

    const cacheKey = `${year}_${month}_${baseDay.toFixed(1)}`;
    if (_solarTermDateCache.has(cacheKey)) {
        return _solarTermDateCache.get(cacheKey);
    }

    // 各節氣對應的角度 (0度 = 春分)
    const termAngles = {
        立春: 315,
        驚蟄: 345,
        清明: 15,
        立夏: 45,
        芒種: 75,
        小暑: 105,
        立秋: 135,
        白露: 165,
        寒露: 195,
        立冬: 225,
        大雪: 255,
        小寒: 285
    };

    // 使用更精確的公式
    // 地球在近日點(1月初)移動較快，在遠日點(7月初)移動較慢
    // 這會導致節氣日期有±1-2天的變化

    // 對於這個應用，我們使用經校準的近似值
    // 核心公式來自天文計算
    const angle = (month - 1) * 30 + (baseDay - 1) * 0.9856;
    const correction = -2 * Math.sin(((angle - 80) * Math.PI) / 180);

    const result = baseDay + correction;
    _solarTermDateCache.set(cacheKey, result);
    return result;
}

const _solarTermDatesCache = new Map();

export function getSolarTermDates(year) {
    if (_solarTermDatesCache.has(year)) {
        return _solarTermDatesCache.get(year);
    }

    const baseTerms = [
        { name: '立春', month: 2, yearOff: 0 },
        { name: '驚蟄', month: 3, yearOff: 0 },
        { name: '清明', month: 4, yearOff: 0 },
        { name: '立夏', month: 5, yearOff: 0 },
        { name: '芒種', month: 6, yearOff: 0 },
        { name: '小暑', month: 7, yearOff: 0 },
        { name: '立秋', month: 8, yearOff: 0 },
        { name: '白露', month: 9, yearOff: 0 },
        { name: '寒露', month: 10, yearOff: 0 },
        { name: '立冬', month: 11, yearOff: 0 },
        { name: '大雪', month: 12, yearOff: 0 },
        { name: '小寒', month: 1, yearOff: 1 } // 下一年的1月
    ];

    const result = {};
    for (const t of baseTerms) {
        const ty = year + t.yearOff;
        let day;
        if (t.name === '立春') {
            day = getLichunDate(ty);
        } else {
            const baseDays = {
                驚蟄: 5.5,
                清明: 4.5,
                立夏: 5.5,
                芒種: 5.5,
                小暑: 7.0,
                立秋: 7.5,
                白露: 7.5,
                寒露: 8.0,
                立冬: 7.0,
                大雪: 7.0,
                小寒: 5.5
            };
            day = getApproximateSolarTermDate(ty, t.month, baseDays[t.name] || 4.0);
        }
        const dayInt = Math.floor(day);
        // 小時近似：取整日的正午(12:00) 以便比較
        result[t.name] = new Date(ty, t.month - 1, dayInt, 12, 0, 0);
    }

    _solarTermDatesCache.set(year, result);
    return result;
}

/**
 * 根據節氣判斷月份地支
 * 將年分成12個節氣月，每個月從一個節氣開始
 * 節氣順序：立春(2/4)→驚蟄(3/6)→清明(4/5)→立夏(5/6)→芒種(6/6)→小暑(7/7)→
 *           立秋(8/7)→白露(9/8)→寒露(10/8)→立冬(11/7)→大雪(12/7)→小寒(1/6)→立春
 * 地支對應：寅→卯→辰→巳→午→未→申→酉→戌→亥→子→丑
 *
 * @param {number} year 西元年
 * @param {number} month 月 (1-12)
 * @param {number} day 日
 * @returns {number} 地支索引 (0=子, 1=丑, 2=寅, ..., 11=亥)
 */
export function getMonthBranchIndex(year, month, day) {
    // 節氣定義：名稱、月份、年份偏移、對應地支
    // yearOff: 節氣所在的年份相對於查詢年的偏移
    const termDefs = [
        { month: 2, yearOff: 0, branch: 2, name: '立春' }, // 寅
        { month: 3, yearOff: 0, branch: 3, name: '驚蟄' }, // 卯
        { month: 4, yearOff: 0, branch: 4, name: '清明' }, // 辰
        { month: 5, yearOff: 0, branch: 5, name: '立夏' }, // 巳
        { month: 6, yearOff: 0, branch: 6, name: '芒種' }, // 午
        { month: 7, yearOff: 0, branch: 7, name: '小暑' }, // 未
        { month: 8, yearOff: 0, branch: 8, name: '立秋' }, // 申
        { month: 9, yearOff: 0, branch: 9, name: '白露' }, // 酉
        { month: 10, yearOff: 0, branch: 10, name: '寒露' }, // 戌
        { month: 11, yearOff: 0, branch: 11, name: '立冬' }, // 亥
        { month: 12, yearOff: 0, branch: 0, name: '大雪' }, // 子
        { month: 1, yearOff: 1, branch: 1, name: '小寒' }, // 丑（下一年1月）
        // 下一年立春用於邊界判斷
        { month: 2, yearOff: 1, branch: 2, name: '立春_next' }
    ];

    function getTermDay(term, baseYear) {
        const ty = baseYear + term.yearOff;
        if (term.name === '立春' || term.name === '立春_next') {
            return getLichunDate(ty);
        }
        const baseDays = {
            驚蟄: 5.5,
            清明: 4.5,
            立夏: 5.5,
            芒種: 5.5,
            小暑: 7.0,
            立秋: 7.5,
            白露: 7.5,
            寒露: 8.0,
            立冬: 7.0,
            大雪: 7.0,
            小寒: 5.5
        };
        return getApproximateSolarTermDate(ty, term.month, baseDays[term.name] || 4.0);
    }

    // 找到最後一個在給定日期之前的節氣
    // 從前一年的大雪開始檢查（確保年初的邊界正確）
    const extendedTerms = [
        // 前一年的大雪和小寒
        { month: 12, yearOff: -1, branch: 0, name: '大雪' },
        { month: 1, yearOff: 0, branch: 1, name: '小寒' },
        ...termDefs
    ];

    let foundBranch = 1; // 預設丑月（若都找不到，取小寒後、立春前）

    for (const term of extendedTerms) {
        const termDay = getTermDay(term, year);
        const termMonth = term.month;
        const termYear = year + term.yearOff;

        // 計算這個節氣的絕對「年月日」值以比大小
        // 轉換為 days since year-01-01 的近似值做比較
        const termTotalDays = termYear * 365 + termMonth * 30 + Math.floor(termDay);
        const dateTotalDays = year * 365 + month * 30 + day;

        if (termTotalDays <= dateTotalDays) {
            foundBranch = term.branch;
        }
    }

    return foundBranch;
}

/**
 * 取得月柱（使用五虎遁法）
 * 年上起月法：甲己之年丙作首，乙庚之歲戊為頭，丙辛之歲尋庚上，丁壬壬寅順水流，若問戊癸何處起，甲寅之上好追求
 *
 * @param {number} yearStemIndex 年干索引
 * @param {number} monthBranchIndex 月支索引 (0-11, 從寅=2開始的循環)
 * @returns {{ stem: string, branch: string, stemIndex: number, branchIndex: number }}
 */
export function getMonthPillar(yearStemIndex, monthBranchIndex) {
    // 五虎遁：年干 → 寅月(monthBranchIndex=2)的天干
    // monthBranchIndex: 0=子, 1=丑, 2=寅, ...
    // 但地支順序是 寅=2, 卯=3, ..., 丑=1
    // 所以從寅月開始的偏移量 = (branchIndex - 2 + 12) % 12

    const monthOffset = (monthBranchIndex - 2 + 12) % 12;

    // 年干 0,5 → 月干始於 2(丙)
    // 年干 1,6 → 月干始於 4(戊)
    // 年干 2,7 → 月干始於 6(庚)
    // 年干 3,8 → 月干始於 8(壬)
    // 年干 4,9 → 月干始於 0(甲)
    const monthStemBase = ((yearStemIndex % 5) * 2 + 2) % 10;
    const stemIndex = (monthStemBase + monthOffset) % 10;

    return {
        stem: STEMS[stemIndex],
        branch: BRANCHES[monthBranchIndex],
        stemIndex: stemIndex,
        branchIndex: monthBranchIndex
    };
}

/**
 * 計算日期差距 (從 1900-01-01 到目標日期的天數)
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @returns {number}
 */
export function daysFrom19000101(year, month, day) {
    const date = new Date(year, month - 1, day);
    const ref = new Date(1900, 0, 1);
    const diffTime = date.getTime() - ref.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 取得日柱
 * 參考點：1900年1月1日 = 甲戌日（60甲子循環索引=10）
 *
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @returns {{ stem: string, branch: string, stemIndex: number, branchIndex: number, sexagenaryIndex: number }}
 */
export function getDayPillar(year, month, day) {
    const daysDiff = daysFrom19000101(year, month, day);
    // 1900-01-01 = 甲戌=10
    // 注意：必須確保數值為正數再 mod
    let sexagenaryIndex = (daysDiff + 10) % 60;
    if (sexagenaryIndex < 0) sexagenaryIndex += 60;

    const stemIndex = sexagenaryIndex % 10;
    const branchIndex = sexagenaryIndex % 12;

    return {
        stem: STEMS[stemIndex],
        branch: BRANCHES[branchIndex],
        stemIndex: stemIndex,
        branchIndex: branchIndex,
        sexagenaryIndex: sexagenaryIndex
    };
}

/**
 * 時辰對照表
 */
export const HOUR_PERIODS = [
    { name: '子時', start: 23, end: 1, branchIndex: 0 },
    { name: '丑時', start: 1, end: 3, branchIndex: 1 },
    { name: '寅時', start: 3, end: 5, branchIndex: 2 },
    { name: '卯時', start: 5, end: 7, branchIndex: 3 },
    { name: '辰時', start: 7, end: 9, branchIndex: 4 },
    { name: '巳時', start: 9, end: 11, branchIndex: 5 },
    { name: '午時', start: 11, end: 13, branchIndex: 6 },
    { name: '未時', start: 13, end: 15, branchIndex: 7 },
    { name: '申時', start: 15, end: 17, branchIndex: 8 },
    { name: '酉時', start: 17, end: 19, branchIndex: 9 },
    { name: '戌時', start: 19, end: 21, branchIndex: 10 },
    { name: '亥時', start: 21, end: 23, branchIndex: 11 }
];

/**
 * 取得時辰地支索引
 * @param {number} hour 小時 (0-23)
 * @returns {{ name: string, branchIndex: number }}
 */
export function getHourBranch(hour) {
    for (const period of HOUR_PERIODS) {
        if (period.name === '子時') {
            // 子時特殊：23:00-00:59
            if (hour >= 23 || hour < 1) return period;
        } else if (hour >= period.start && hour < period.end) {
            return period;
        }
    }
    return HOUR_PERIODS[0]; // 預設子時
}

/**
 * 取得時柱（使用五鼠遁法）
 * 日上起時法：甲己還加甲，乙庚丙作初，丙辛從戊起，丁壬庚子居，戊癸何方發，壬子是真途
 *
 * @param {number} dayStemIndex 日干索引
 * @param {number} hour 出生小時 (0-23)
 * @returns {{ stem: string, branch: string, stemIndex: number, branchIndex: number, periodName: string }}
 */
export function getHourPillar(dayStemIndex, hour) {
    const hourInfo = getHourBranch(hour);
    const branchIndex = hourInfo.branchIndex;

    // 五鼠遁
    // 日干 0,5 → 子時干=0(甲)
    // 日干 1,6 → 子時干=2(丙)
    // 日干 2,7 → 子時干=4(戊)
    // 日干 3,8 → 子時干=6(庚)
    // 日干 4,9 → 子時干=8(壬)
    const hourStemBase = ((dayStemIndex % 5) * 2) % 10;
    const stemIndex = (hourStemBase + branchIndex) % 10;

    return {
        stem: STEMS[stemIndex],
        branch: BRANCHES[branchIndex],
        stemIndex: stemIndex,
        branchIndex: branchIndex,
        periodName: hourInfo.name
    };
}

// ============================================================
// 十神系統
// ============================================================

/**
 * 計算五行關係
 * @param {string} dayElement 日主五行
 * @param {string} otherElement 其他天干五行
 * @returns {string} 關係：same, generate, control, controlledBy, generatedBy
 */
export function getElementRelation(dayElement, otherElement) {
    if (dayElement === otherElement) return 'same';

    const cycle = ELEMENT_CYCLE;
    const dayIdx = cycle.indexOf(dayElement);
    const otherIdx = cycle.indexOf(otherElement);

    // 相生：木→火→土→金→水→木
    if ((dayIdx + 1) % 5 === otherIdx) return 'generate'; // 日主生其他
    if ((otherIdx + 1) % 5 === dayIdx) return 'generatedBy'; // 其他生日主

    // 相剋：木→土→水→火→金→木
    if ((dayIdx + 2) % 5 === otherIdx) return 'control'; // 日主剋其他
    if ((otherIdx + 2) % 5 === dayIdx) return 'controlledBy'; // 其他剋日主

    return 'unknown';
}

/**
 * 取得十神
 * @param {number} dayStemIndex 日主天干索引
 * @param {number} otherStemIndex 其他天干索引
 * @returns {string} 十神名稱
 */
export function getTenGod(dayStemIndex, otherStemIndex) {
    const dayElement = STEM_ELEMENT[dayStemIndex];
    const otherElement = STEM_ELEMENT[otherStemIndex];
    const dayYin = STEM_YIN_YANG[dayStemIndex];
    const otherYin = STEM_YIN_YANG[otherStemIndex];

    const relation = getElementRelation(dayElement, otherElement);
    const sameYinYang = dayYin === otherYin;

    switch (relation) {
        case 'same':
            return sameYinYang ? '比肩' : '劫財';
        case 'generate':
            return sameYinYang ? '食神' : '傷官';
        case 'control':
            return sameYinYang ? '偏財' : '正財';
        case 'controlledBy':
            return sameYinYang ? '七殺' : '正官';
        case 'generatedBy':
            return sameYinYang ? '偏印' : '正印';
        default:
            return '';
    }
}

/**
 * 從地支取得藏干列表（含十神）
 * @param {number} dayStemIndex
 * @param {number} branchIndex
 * @returns {Array<{stem: string, stemIndex: number, tenGod: string, isMain: boolean}>}
 */
export function getHiddenStemsWithTenGod(dayStemIndex, branchIndex) {
    const branch = BRANCHES[branchIndex];
    const hidden = HIDDEN_STEMS[branch] || [];

    return hidden.map((stem, i) => {
        const stemIndex = STEMS.indexOf(stem);
        return {
            stem: stem,
            stemIndex: stemIndex,
            tenGod: getTenGod(dayStemIndex, stemIndex),
            isMain: i === 0 // 第一個是本氣
        };
    });
}

// ============================================================
// 納音計算
// ============================================================

/**
 * 取得納音
 * @param {number} stemIndex
 * @param {number} branchIndex
 * @returns {string}
 */
export function getNayin(stemIndex, branchIndex) {
    // 使用高效的六十甲子索引計算（數學公式取代迴圈）
    const idx = getSexagenaryIndexFast(stemIndex, branchIndex);
    // 納音以兩個一組
    const nayinIndex = Math.floor(idx / 2);
    return NAYIN[nayinIndex] || '';
}

// ============================================================
// 五行強度分析
// ============================================================

/**
 * 計算四柱五行強度
 * @param {Array} pillars 四柱陣列
 * @returns {Object} 五行強度統計
 */
export function calculateElementStrength(pillars) {
    const elementCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    const details = [];

    const pillarNames = ['年柱', '月柱', '日柱', '時柱'];

    pillars.forEach((pillar, pIdx) => {
        const pillarName = pillarNames[pIdx] || `第${pIdx + 1}柱`;

        // 天干五行
        const stemElement = STEM_ELEMENT[pillar.stemIndex];
        elementCount[stemElement]++;
        details.push({
            pillar: pillarName,
            type: '天干',
            element: stemElement,
            value: pillar.stem,
            weight: 2 // 天干權重較高
        });

        // 地支五行（權重與天干相同）
        const branchElement = BRANCH_ELEMENT[pillar.branchIndex];
        elementCount[branchElement]++;
        details.push({
            pillar: pillarName,
            type: '地支',
            element: branchElement,
            value: pillar.branch,
            weight: 1.5
        });

        // 藏干五行
        const hidden = HIDDEN_STEMS[pillar.branch] || [];
        hidden.forEach((stem, i) => {
            const stemIdx = STEMS.indexOf(stem);
            const stemEl = STEM_ELEMENT[stemIdx];
            const weight = i === 0 ? 0.8 : i === 1 ? 0.5 : 0.3;
            elementCount[stemEl] = (elementCount[stemEl] || 0) + weight;
            details.push({
                pillar: pillarName,
                type: '藏干',
                element: stemEl,
                value: stem,
                weight: weight,
                isMain: i === 0
            });
        });
    });

    // 加權總分
    const weightedCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    details.forEach(d => {
        if (weightedCount[d.element] !== undefined) {
            weightedCount[d.element] += d.weight;
        }
    });

    return {
        raw: elementCount,
        weighted: weightedCount,
        details: details,
        // 排序從強到弱
        sorted: Object.keys(weightedCount).sort((a, b) => weightedCount[b] - weightedCount[a])
    };
}

// ============================================================
// 喜用神 / 忌神
// ============================================================

/**
 * 取得日主的宜忌五行
 * 判斷原則：
 * 1. 身強（日主五行強旺）→ 喜剝削、耗洩（官殺、財、食傷）
 * 2. 身弱（日主五行衰弱）→ 喜生扶（印、比劫）
 * 3. 特殊格局另論
 *
 * @param {string} dayStem 日干
 * @param {number} dayStemIndex 日干索引
 * @param {Object} elementStrength 五行強度
 * @returns {Object}
 */
export function getFavoriteElement(dayStemIndex, elementStrength) {
    const dayElement = STEM_ELEMENT[dayStemIndex];
    const dayYin = STEM_YIN_YANG[dayStemIndex];

    // 日主強度 = 日主五行總加權分
    const selfStrength = elementStrength.weighted[dayElement] || 0;

    // 其他五行平均
    const otherElements = ELEMENT_CYCLE.filter(e => e !== dayElement);
    const otherTotal = otherElements.reduce((sum, e) => sum + (elementStrength.weighted[e] || 0), 0);
    const otherAvg = otherTotal / 4;

    // 判斷身強/身弱
    const isStrong = selfStrength > otherAvg * 1.3;
    const isWeak = selfStrength < otherAvg * 0.7;
    const isBalanced = !isStrong && !isWeak;

    // 五行的生剋關係
    const cycle = ELEMENT_CYCLE;
    const dayIdx = cycle.indexOf(dayElement);

    const generatesMe = cycle[(dayIdx + 4) % 5]; // 生我者（印）
    const iGenerate = cycle[(dayIdx + 1) % 5]; // 我生者（食傷）
    const controlsMe = cycle[(dayIdx + 3) % 5]; // 剋我者（官殺）
    const iControl = cycle[(dayIdx + 2) % 5]; // 我剋者（財）

    let favorite = [];
    let unfavorite = [];
    let analysis = '';

    if (isStrong) {
        // 身強：喜剋、耗、洩（官殺、財、食傷）
        favorite = [iControl, iGenerate, controlsMe];
        unfavorite = [generatesMe, dayElement];
        analysis = `日主${dayElement}元素強旺，為身強格局。宜用「${iControl}」(財)、「${iGenerate}」(食傷)來耗洩旺氣，以「${controlsMe}」(官殺)來制約。忌「${generatesMe}」(印)生扶和「${dayElement}」(比劫)幫身。`;
    } else if (isWeak) {
        // 身弱：喜生扶（印、比劫）
        favorite = [generatesMe, dayElement];
        unfavorite = [iControl, iGenerate, controlsMe];
        analysis = `日主${dayElement}元素衰弱，為身弱格局。宜用「${generatesMe}」(印)來生扶日主，用「${dayElement}」(比劫)來幫身。忌「${iControl}」(財)、「${iGenerate}」(食傷)、「${controlsMe}」(官殺)進一步削弱日主。`;
    } else {
        // 中和：視大運和流年而定，一般喜用當令之五行
        favorite = [generatesMe, iControl];
        unfavorite = [iGenerate, controlsMe];
        analysis = `日主${dayElement}元素強度中和，五行相對平衡。宜以「${generatesMe}」(印)滋養、「${iControl}」(財)調候。具體喜忌需結合大運流年判斷，建議諮詢專業命理師。`;
    }

    return {
        dayElement: dayElement,
        dayYin: dayYin,
        selfStrength: selfStrength,
        otherAvg: otherAvg,
        isStrong: isStrong,
        isWeak: isWeak,
        isBalanced: isBalanced,
        favorite: favorite,
        unfavorite: unfavorite,
        analysis: analysis,
        // 用神建議
        advice: isStrong
            ? `建議喜用${favorite.join('、')}五行，行事宜進取、發揮才華，注意不要過於固執。`
            : isWeak
              ? `建議喜用${favorite.join('、')}五行，宜多充實內在、累積實力，等待時機。`
              : `五行較平衡，可依大運流年調整，${favorite.join('、')}可酌量使用。`
    };
}

// ============================================================
// 大運計算
// ============================================================

/**
 * 計算起運歲數與大運
 *
 * @param {number} birthYear 出生年
 * @param {number} birthMonth 出生月
 * @param {number} birthDay 出生日
 * @param {number} hour 出生時
 * @param {string} gender 性別 'male'|'female'
 * @param {number} yearStemIndex 年干索引 (用於定陰陽年)
 * @returns {Object}
 */
export function calculateGreatLuck(
    birthYear,
    birthMonth,
    birthDay,
    hour,
    gender,
    yearStemIndex,
    monthStemIndex = null,
    monthBranchIndex = null,
    dayStemIndex = null,
    favoriteElement = null,
    natalPillars = []
) {
    // 陽年：甲(0)、丙(2)、戊(4)、庚(6)、壬(8)
    // 陰年：乙(1)、丁(3)、己(5)、辛(7)、癸(9)
    const isYangYear = yearStemIndex % 2 === 0;

    // 陽男陰女順行，陰男陽女逆行
    const isForward = (isYangYear && gender === 'male') || (!isYangYear && gender === 'female');

    // 取得關鍵節氣日期
    // 對於大運計算，我們需要從出生時間到下一個（或上一個）節氣的天數
    // 大運使用的節氣是「節」：立春、驚蟄、清明、立夏、芒種、小暑、立秋、白露、寒露、立冬、大雪、小寒
    // 與月柱使用相同的節氣

    // 收集從前一年到後一年的所有節氣
    const allTerms = [];
    for (let y = birthYear - 1; y <= birthYear + 1; y++) {
        const dates = getSolarTermDates(y);
        for (const [name, date] of Object.entries(dates)) {
            allTerms.push({ name, date });
        }
    }

    // 按時間排序
    allTerms.sort((a, b) => a.date.getTime() - b.date.getTime());

    const birthDate = new Date(birthYear, birthMonth - 1, birthDay, hour || 12, 0, 0);
    const birthTime = birthDate.getTime();

    let targetTerm = null;
    let targetDate = null;

    if (isForward) {
        // 順行：找出生後第一個節氣
        for (const term of allTerms) {
            if (term.date.getTime() > birthTime) {
                targetTerm = term;
                targetDate = term.date;
                break;
            }
        }
    } else {
        // 逆行：找出生前最後一個節氣
        for (let i = allTerms.length - 1; i >= 0; i--) {
            if (allTerms[i].date.getTime() < birthTime) {
                targetTerm = allTerms[i];
                targetDate = allTerms[i].date;
                break;
            }
        }
    }

    if (!targetTerm || !targetDate) {
        return { error: '無法計算起運時間', luckCycles: [] };
    }

    const diffTime = Math.abs(targetDate.getTime() - birthTime);
    const diffDaysExact = diffTime / (1000 * 60 * 60 * 24);

    // 三天為一歲，一天為四個月，一個時辰(2小時)為十天
    // 更精細的計算：diffDays + (diffTime % 86400000) / (86400000/3)
    const startAgeExact = Math.round((diffDaysExact / 3) * 10) / 10;
    const startAge = Math.floor(startAgeExact);

    // 大運每十年一柱，最多排8柱（80年）
    const luckCycles = [];
    const hasMonthPillar = Number.isInteger(monthStemIndex) && Number.isInteger(monthBranchIndex);

    for (let i = 0; i < 8; i++) {
        const ageStart = startAge + i * 10;
        const ageEnd = ageStart + 9;

        const step = (isForward ? 1 : -1) * (i + 1);
        const stemIndex = hasMonthPillar ? (monthStemIndex + step + 100) % 10 : null;
        const branchIndex = hasMonthPillar ? (monthBranchIndex + step + 120) % 12 : null;
        const stem = stemIndex == null ? '' : STEMS[stemIndex];
        const branch = branchIndex == null ? '' : BRANCHES[branchIndex];
        const stemElement = stemIndex == null ? '' : STEM_ELEMENT[stemIndex];
        const branchElement = branchIndex == null ? '' : BRANCH_ELEMENT[branchIndex];
        const tenGod = Number.isInteger(dayStemIndex) && stemIndex != null ? getTenGod(dayStemIndex, stemIndex) : '';
        const favored = favoriteElement?.favorite || [];
        const unfavored = favoriteElement?.unfavorite || [];
        const elementTone =
            favored.includes(stemElement) || favored.includes(branchElement)
                ? '喜'
                : unfavored.includes(stemElement) && unfavored.includes(branchElement)
                  ? '忌'
                  : '中';
        const interactions =
            stem && branch ? analyzeGanZhiInteractions(stem, branch, natalPillars, `大運${stem}${branch}`) : [];
        const interactionSummary = interactions.length
            ? interactions
                  .slice(0, 3)
                  .map(item => item.label)
                  .join('、')
            : '與原局無強烈合沖';
        const analysis = `${tenGod || '十神未定'}主題，天干${stemElement || '—'}、地支${branchElement || '—'}，對命局喜忌屬${elementTone}。${interactionSummary}；宜把此十年視為環境主題，再配合各年流年判斷。`;

        luckCycles.push({
            index: i + 1,
            ageStart: ageStart,
            ageEnd: ageEnd,
            years: ageStart + '~' + ageEnd + '歲',
            startYear: birthYear + ageStart,
            endYear: birthYear + ageEnd,
            stem,
            branch,
            stemIndex,
            branchIndex,
            ganZhi: `${stem}${branch}`,
            stemElement,
            branchElement,
            tenGod,
            name: tenGod || `${stem}${branch}`,
            favor: elementTone,
            interactions,
            analysis
        });
    }

    const direction = isForward ? '順行' : '逆行';

    return {
        startAge: startAge,
        startAgeExact: startAgeExact,
        startYear: birthYear + startAge,
        targetTerm: targetTerm.name,
        isForward: isForward,
        isYangYear: isYangYear,
        direction: direction,
        luckCycles: luckCycles
    };
}

// ============================================================
// 主計算函數
// ============================================================

/**
 * 計算完整八字
 * @param {number} year 西元年
 * @param {number} month 月 (1-12)
 * @param {number} day 日 (1-31)
 * @param {number|null} hour 時 (0-23, 可選)
 * @param {string} gender 性別 'male'|'female' (可選, 用於大運)
 * @returns {Object}
 */
export function calculateBazi(year, month, day, hour = null, gender = null) {
    const result = {
        input: { year, month, day, hour, gender },
        pillars: [],
        dayMaster: null,
        tenGods: {},
        hiddenStems: [],
        nayin: [],
        elementStrength: null,
        favoriteElement: null,
        greatLuck: null,
        zodiac: null,
        summary: ''
    };

    // 1. 年柱（以立春為界）
    const yearPillar = getYearPillar(year, month, day);
    result.pillars.push({
        name: '年柱',
        ...yearPillar,
        nayin: getNayin(yearPillar.stemIndex, yearPillar.branchIndex),
        element: STEM_ELEMENT[yearPillar.stemIndex]
    });

    // 2. 月柱
    const monthBranchIndex = getMonthBranchIndex(year, month, day);
    const monthPillar = getMonthPillar(yearPillar.stemIndex, monthBranchIndex);
    result.pillars.push({
        name: '月柱',
        ...monthPillar,
        nayin: getNayin(monthPillar.stemIndex, monthPillar.branchIndex),
        element: STEM_ELEMENT[monthPillar.stemIndex]
    });

    // 3. 日柱
    const dayPillar = getDayPillar(year, month, day);
    result.pillars.push({
        name: '日柱',
        ...dayPillar,
        nayin: getNayin(dayPillar.stemIndex, dayPillar.branchIndex),
        element: STEM_ELEMENT[dayPillar.stemIndex]
    });

    // 日主
    result.dayMaster = {
        stem: dayPillar.stem,
        branch: dayPillar.branch,
        stemIndex: dayPillar.stemIndex,
        branchIndex: dayPillar.branchIndex,
        element: STEM_ELEMENT[dayPillar.stemIndex],
        yinyang: STEM_YIN_YANG[dayPillar.stemIndex] === 0 ? '陽' : '陰'
    };

    // 4. 時柱 (如有提供小時)
    if (hour !== null && hour !== undefined) {
        const hourPillar = getHourPillar(dayPillar.stemIndex, hour);
        result.pillars.push({
            name: '時柱',
            ...hourPillar,
            nayin: getNayin(hourPillar.stemIndex, hourPillar.branchIndex),
            element: STEM_ELEMENT[hourPillar.stemIndex]
        });
        result.hourPeriod = hourPillar.periodName;
    }

    // 5. 十神 (針對四柱天干)
    result.pillars.forEach(pillar => {
        pillar.tenGod = getTenGod(dayPillar.stemIndex, pillar.stemIndex);
    });

    // 6. 藏干
    result.pillars.forEach(pillar => {
        pillar.hiddenStems = getHiddenStemsWithTenGod(dayPillar.stemIndex, pillar.branchIndex);
    });

    // 7. 生肖
    result.zodiac = ZODIAC[yearPillar.branchIndex];

    // 8. 五行強度
    result.elementStrength = calculateElementStrength(result.pillars);

    // 9. 喜用神
    result.favoriteElement = getFavoriteElement(dayPillar.stemIndex, result.elementStrength);

    // 10. 大運
    if (gender) {
        result.greatLuck = calculateGreatLuck(
            year,
            month,
            day,
            hour || 12,
            gender,
            yearPillar.stemIndex,
            monthPillar.stemIndex,
            monthPillar.branchIndex,
            dayPillar.stemIndex,
            result.favoriteElement,
            result.pillars
        );
    }

    // 11. 綜合摘要
    result.summary = generateSummary(result);

    return result;
}

/**
 * 生成綜合摘要
 * @param {Object} baziResult
 * @returns {string}
 */
export function generateSummary(baziResult) {
    const dm = baziResult.dayMaster;
    const fe = baziResult.favoriteElement;
    const el = baziResult.elementStrength;

    let lines = [];

    lines.push(`【${dm.stem}${dm.branch}日主】`);
    lines.push(
        `出生：${baziResult.input.year}年${baziResult.input.month}月${baziResult.input.day}日` +
            (baziResult.input.hour !== null ? ` ${baziResult.hourPeriod || ''}` : '') +
            `，生肖${baziResult.zodiac}`
    );
    lines.push(`日主五行：${dm.element}（${dm.yinyang}${dm.element}）`);

    // 四柱
    const pillarStr = baziResult.pillars.map(p => `${p.stem}${p.branch}`).join(' ');
    lines.push(`八字：${pillarStr}`);

    // 五行統計
    const wCount = el.weighted;
    const elStr = ELEMENT_CYCLE.map(e => `${e}:${wCount[e].toFixed(1)}`).join('  ');
    lines.push(`五行強度：${elStr}`);

    // 身強身弱
    if (fe.isStrong) lines.push('格局：身強（日主旺盛）');
    else if (fe.isWeak) lines.push('格局：身弱（日主衰弱）');
    else lines.push('格局：中和（五行平衡）');

    // 喜用
    lines.push(`喜用神：${fe.favorite.join('、')}  忌神：${fe.unfavorite.join('、')}`);
    lines.push(fe.analysis);

    return lines.join('\n');
}

// ============================================================
// 工具函數
// ============================================================

/**
 * 民國年轉西元年
 * @param {number} rocYear 民國年
 * @returns {number}
 */
export function rocToWestern(rocYear) {
    return rocYear + 1911;
}

/**
 * 西元年轉民國年
 * @param {number} westernYear
 * @returns {number}
 */
export function westernToRoc(westernYear) {
    return westernYear - 1911;
}

/**
 * 檢查是否為有效日期
 * @param {number} year
 * @param {number} month
 * @param {number} day
 * @returns {boolean}
 */
export function isValidDate(year, month, day) {
    const d = new Date(year, month - 1, day);
    return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

// ============================================================
// 向後相容：確保 globals 在非 module 環境也可用
// ============================================================
if (typeof window !== 'undefined') {
    const exports = {
        STEMS,
        BRANCHES,
        STEM_ELEMENT,
        STEM_YIN_YANG,
        BRANCH_ELEMENT,
        BRANCH_YIN_YANG,
        HIDDEN_STEMS,
        ZODIAC,
        NAYIN,
        ELEMENT_COLORS,
        ELEMENT_CYCLE,
        HOUR_PERIODS,
        getLichunDate,
        getYearPillar,
        getSolarTerms,
        getApproximateSolarTermDate,
        getMonthBranchIndex,
        getMonthPillar,
        daysFrom19000101,
        getDayPillar,
        getHourBranch,
        getHourPillar,
        getElementRelation,
        getTenGod,
        getHiddenStemsWithTenGod,
        getNayin,
        calculateElementStrength,
        getFavoriteElement,
        getSolarTermDates,
        calculateGreatLuck,
        calculateBazi,
        generateSummary,
        rocToWestern,
        westernToRoc,
        isValidDate
    };
    Object.assign(window, exports);
}
