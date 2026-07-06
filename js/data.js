/**
 * data.js — 八字命盤共用資料庫
 * 集中管理所有核心資料，避免重複定義
 */

// ============================================================
// 天干地支基礎
// ============================================================

/** 天干 */
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

/** 地支 */
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/** 天干五行：index → element */
export const STEM_ELEMENT_ARRAY = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水'];

/** 天干五行（name → element） */
export const STEM_ELEMENT_MAP = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
};

/** 天干陰陽：0=陽, 1=陰 */
export const STEM_YIN_YANG = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1];

/** 地支五行：index → element */
export const BRANCH_ELEMENT_ARRAY = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水'];

/** 地支五行（name → element） */
export const BRANCH_ELEMENT_MAP = {
    '子': '水', '丑': '土', '寅': '木', '卯': '木',
    '辰': '土', '巳': '火', '午': '火', '未': '土',
    '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

/** 地支陰陽：0=陽, 1=陰 */
export const BRANCH_YIN_YANG = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1];

/** 地支分類 */
export const BRANCH_CATEGORY = {
    '子': '四正', '午': '四正', '卯': '四正', '酉': '四正',
    '寅': '四生', '申': '四生', '巳': '四生', '亥': '四生',
    '辰': '四庫', '戌': '四庫', '丑': '四庫', '未': '四庫'
};

// ============================================================
// 五行系統
// ============================================================

/** 五行生剋順序 */
export const ELEMENT_CYCLE = ['木', '火', '土', '金', '水'];

/** 五行對應顏色 (CSS class) */
export const ELEMENT_COLORS = {
    '木': 'element-wood',
    '火': 'element-fire',
    '土': 'element-earth',
    '金': 'element-metal',
    '水': 'element-water'
};

/** 五行顏色值（用於 JS 內嵌樣式） */
export const ELEMENT_COLOR_VALUES = {
    '木': '#2e7d32',
    '火': '#d32f2f',
    '土': '#8d6e3f',
    '金': '#bdbdbd',
    '水': '#1565c0'
};

// ============================================================
// 藏干資料
// ============================================================

/** 簡易版藏干（字串陣列，bazi.js 使用） */
export const HIDDEN_STEMS_SIMPLE = {
    '子': ['癸'],
    '丑': ['己', '癸', '辛'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['戊', '乙', '癸'],
    '巳': ['丙', '庚', '戊'],
    '午': ['丁', '己'],
    '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'],
    '酉': ['辛'],
    '戌': ['戊', '辛', '丁'],
    '亥': ['壬', '甲']
};

/** 詳細版藏干（含類型、說明、力量，geju.js 使用） */
export const HIDDEN_STEMS_DETAILED = {
    '子': [
        { stem: '癸', type: '本氣', desc: '純水之地，癸水之精', power: 100 }
    ],
    '丑': [
        { stem: '己', type: '本氣', desc: '土之本氣', power: 60 },
        { stem: '癸', type: '中氣', desc: '水之餘氣（水庫）', power: 30 },
        { stem: '辛', type: '餘氣', desc: '金之餘氣（金庫）', power: 10 }
    ],
    '寅': [
        { stem: '甲', type: '本氣', desc: '木之本氣', power: 60 },
        { stem: '丙', type: '中氣', desc: '火之長生', power: 30 },
        { stem: '戊', type: '餘氣', desc: '土隨母寄藏', power: 10 }
    ],
    '卯': [
        { stem: '乙', type: '本氣', desc: '純木之地，乙木之精', power: 100 }
    ],
    '辰': [
        { stem: '戊', type: '本氣', desc: '土之本氣', power: 60 },
        { stem: '乙', type: '中氣', desc: '木之餘氣', power: 30 },
        { stem: '癸', type: '餘氣', desc: '水之庫', power: 10 }
    ],
    '巳': [
        { stem: '丙', type: '本氣', desc: '火之本氣', power: 60 },
        { stem: '庚', type: '中氣', desc: '金之長生', power: 30 },
        { stem: '戊', type: '餘氣', desc: '土隨母寄藏', power: 10 }
    ],
    '午': [
        { stem: '丁', type: '本氣', desc: '純火之地，丁火之精', power: 70 },
        { stem: '己', type: '中氣', desc: '土隨母寄藏', power: 30 }
    ],
    '未': [
        { stem: '己', type: '本氣', desc: '土之本氣', power: 60 },
        { stem: '丁', type: '中氣', desc: '火之餘氣（火庫）', power: 30 },
        { stem: '乙', type: '餘氣', desc: '木之餘氣（木庫）', power: 10 }
    ],
    '申': [
        { stem: '庚', type: '本氣', desc: '金之本氣', power: 60 },
        { stem: '壬', type: '中氣', desc: '水之長生', power: 30 },
        { stem: '戊', type: '餘氣', desc: '土隨母寄藏', power: 10 }
    ],
    '酉': [
        { stem: '辛', type: '本氣', desc: '純金之地，辛金之精', power: 100 }
    ],
    '戌': [
        { stem: '戊', type: '本氣', desc: '土之本氣', power: 60 },
        { stem: '辛', type: '中氣', desc: '金之餘氣（金庫）', power: 30 },
        { stem: '丁', type: '餘氣', desc: '火之庫', power: 10 }
    ],
    '亥': [
        { stem: '壬', type: '本氣', desc: '水之本氣', power: 70 },
        { stem: '甲', type: '中氣', desc: '木之長生', power: 30 }
    ]
};

/** 中氣/餘氣版藏干（lunming2.js 使用：type 為 main/mid/residual） */
export const HIDDEN_STEMS_MID = {};
for (const [branch, stems] of Object.entries(HIDDEN_STEMS_DETAILED)) {
    HIDDEN_STEMS_MID[branch] = stems.map(s => {
        const typeMap = { '本氣': 'main', '中氣': 'mid', '餘氣': 'residual' };
        return { stem: s.stem, type: typeMap[s.type] || 'main' };
    });
}

// ============================================================
// 生肖與納音
// ============================================================

/** 生肖 */
export const ZODIAC = ['鼠', '牛', '虎', '兔', '龍', '蛇', '馬', '羊', '猴', '雞', '狗', '豬'];

/** 納音 (60甲子納音表) */
export const NAYIN = [
    '海中金', '爐中火', '大林木', '路旁土', '劍鋒金', '山頭火',
    '澗下水', '城頭土', '白蠟金', '楊柳木', '泉中水', '屋上土',
    '霹靂火', '松柏木', '長流水', '砂石金', '山下火', '平地木',
    '壁上土', '金箔金', '覆燈火', '天河水', '大驛土', '釵釧金',
    '桑柘木', '大溪水', '沙中土', '天上火', '石榴木', '大海水'
];

// ============================================================
// 時辰對照
// ============================================================

/** 時辰對照表 */
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

// ============================================================
// 常用轉換函數
// ============================================================

/** 取天干索引 */
export function getStemIndex(stem) {
    return STEMS.indexOf(stem);
}

/** 取地支索引 */
export function getBranchIndex(branch) {
    return BRANCHES.indexOf(branch);
}

/** 取天干五行 */
export function getStemElement(stem) {
    return STEM_ELEMENT_MAP[stem] || '';
}

/** 取地支五行 */
export function getBranchElement(branch) {
    return BRANCH_ELEMENT_MAP[branch] || '';
}

/** 取天干陰陽字串 */
export function getStemYinYang(stemIndex) {
    return STEM_YIN_YANG[stemIndex] === 0 ? '陽' : '陰';
}

/** 取地支陰陽字串 */
export function getBranchYinYang(branchIndex) {
    return BRANCH_YIN_YANG[branchIndex] === 0 ? '陽' : '陰';
}

/** 六十甲子索引計算（從天干地支索引） */
export function getSexagenaryIndex(stemIndex, branchIndex) {
    for (let i = 0; i < 60; i++) {
        if (i % 10 === stemIndex && i % 12 === branchIndex) {
            return i;
        }
    }
    return -1;
}

/** 更高效的六十甲子索引計算（數學公式） */
export function getSexagenaryIndexFast(stemIndex, branchIndex) {
    // 60 = lcm(10,12)，使用中國剩餘定理概念
    // 干支對應的六十甲子索引
    const stemMod = stemIndex % 10;
    const branchMod = branchIndex % 12;
    // 因 10 和 12 互質（最大公因數 2），用公式計算
    let idx = stemMod;
    while (idx % 12 !== branchMod) {
        idx += 10;
    }
    return idx % 60;
}

/** 從六十甲子索引取納音 */
export function getNayin(sexagenaryIndex) {
    return NAYIN[Math.floor(sexagenaryIndex / 2)];
}
