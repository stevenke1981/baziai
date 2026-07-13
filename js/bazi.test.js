/**
 * bazi.test.js — 八字核心計算引擎單元測試
 */
import { describe, it, expect } from 'vitest';

// 引入被測試的函數
import {
    getYearPillar,
    getDayPillar,
    getMonthBranchIndex,
    getMonthPillar,
    getHourPillar,
    getNayin,
    calculateElementStrength,
    getFavoriteElement,
    calculateBazi,
    isValidDate,
    STEMS,
    BRANCHES,
    ELEMENT_CYCLE,
    NAYIN,
    STEM_ELEMENT,
    BRANCH_ELEMENT
} from './bazi.js';

import { getSexagenaryIndexFast } from './data.js';

// ============================================================
// 立春測試
// ============================================================
describe('getYearPillar', () => {
    it('2024年2月4日（立春當日）應為甲辰年', () => {
        const result = getYearPillar(2024, 2, 4);
        expect(result.stem).toBe('甲');
        expect(result.branch).toBe('辰');
    });

    it('2024年2月3日（立春前一日）應為癸卯年', () => {
        const result = getYearPillar(2024, 2, 3);
        expect(result.stem).toBe('癸');
        expect(result.branch).toBe('卯');
    });

    it('2023年1月15日（立春前）應為壬寅年', () => {
        const result = getYearPillar(2023, 1, 15);
        expect(result.stem).toBe('壬');
        expect(result.branch).toBe('寅');
    });

    it('2023年2月5日（立春後）應為癸卯年', () => {
        const result = getYearPillar(2023, 2, 5);
        expect(result.stem).toBe('癸');
        expect(result.branch).toBe('卯');
    });
});

// ============================================================
// 日柱測試
// ============================================================
describe('getDayPillar', () => {
    it('1900年1月1日應為甲戌日（參考點）', () => {
        const result = getDayPillar(1900, 1, 1);
        expect(result.stem).toBe('甲');
        expect(result.branch).toBe('戌');
        expect(result.sexagenaryIndex).toBe(10);
    });

    it('2024年1月1日應有正確干支', () => {
        const result = getDayPillar(2024, 1, 1);
        // 甲子(0) + daysFrom19000101(2024,1,1) % 60
        expect(result.stemIndex).toBeGreaterThanOrEqual(0);
        expect(result.stemIndex).toBeLessThan(10);
        expect(result.branchIndex).toBeGreaterThanOrEqual(0);
        expect(result.branchIndex).toBeLessThan(12);
    });

    it('2024年2月29日（閏年）應正常計算', () => {
        const result = getDayPillar(2024, 2, 29);
        expect(result.stem).toBeTruthy();
        expect(result.branch).toBeTruthy();
    });

    it('2000年1月1日（跨世紀）應正常計算', () => {
        const result = getDayPillar(2000, 1, 1);
        expect(result.stem).toBeTruthy();
        expect(result.branch).toBeTruthy();
    });
});

// ============================================================
// 月柱測試
// ============================================================
describe('getMonthPillar', () => {
    it('甲年(0)寅月(2)應為丙寅月', () => {
        const result = getMonthPillar(0, 2);
        expect(result.stem).toBe('丙');
        expect(result.branch).toBe('寅');
    });

    it('甲年(0)卯月(3)應為丁卯月', () => {
        const result = getMonthPillar(0, 3);
        expect(result.stem).toBe('丁');
        expect(result.branch).toBe('卯');
    });

    it('乙年(1)寅月(2)應為戊寅月', () => {
        const result = getMonthPillar(1, 2);
        expect(result.stem).toBe('戊');
        expect(result.branch).toBe('寅');
    });
});

// ============================================================
// 時柱測試
// ============================================================
describe('getHourPillar', () => {
    it('甲日(0)子時(23)應為甲子時', () => {
        const result = getHourPillar(0, 23);
        expect(result.stem).toBe('甲');
        expect(result.branch).toBe('子');
    });

    it('甲日(0)午時(12)應為庚午時', () => {
        const result = getHourPillar(0, 12);
        expect(result.stem).toBe('庚');
        expect(result.branch).toBe('午');
    });

    it('乙日(1)子時(0)應為丙子時', () => {
        const result = getHourPillar(1, 0);
        expect(result.stem).toBe('丙');
        expect(result.branch).toBe('子');
    });
});

// ============================================================
// 納音測試
// ============================================================
describe('getNayin', () => {
    it('甲子(0,0)應為海中金', () => {
        expect(getNayin(0, 0)).toBe('海中金');
    });

    it('乙丑(1,1)應為海中金', () => {
        expect(getNayin(1, 1)).toBe('海中金');
    });

    it('丙寅(2,2)應為爐中火', () => {
        expect(getNayin(2, 2)).toBe('爐中火');
    });

    it('癸亥(9,11)應為大海水', () => {
        expect(getNayin(9, 11)).toBe('大海水');
    });
});

// ============================================================
// 六十甲子索引測試
// ============================================================
describe('getSexagenaryIndexFast', () => {
    it('甲子應為0', () => {
        expect(getSexagenaryIndexFast(0, 0)).toBe(0);
    });

    it('乙丑應為1', () => {
        expect(getSexagenaryIndexFast(1, 1)).toBe(1);
    });

    it('癸亥應為59', () => {
        expect(getSexagenaryIndexFast(9, 11)).toBe(59);
    });
});

// ============================================================
// 五行強度測試
// ============================================================
describe('calculateElementStrength', () => {
    const mockPillars = [
        { stemIndex: 3, branchIndex: 2, stem: '丁', branch: '寅' }, // 年柱
        { stemIndex: 5, branchIndex: 4, stem: '己', branch: '辰' }, // 月柱
        { stemIndex: 3, branchIndex: 6, stem: '丁', branch: '午' }, // 日柱
        { stemIndex: 1, branchIndex: 0, stem: '乙', branch: '子' } // 時柱
    ];

    it('應回傳所有五行的加權分數', () => {
        const result = calculateElementStrength(mockPillars);
        expect(result.weighted).toBeDefined();
        expect(Object.keys(result.weighted).length).toBe(5);
    });

    it('應包含詳細明細', () => {
        const result = calculateElementStrength(mockPillars);
        expect(Array.isArray(result.details)).toBe(true);
        expect(result.details.length).toBeGreaterThan(0);
    });

    it('should have sorted results', () => {
        const result = calculateElementStrength(mockPillars);
        expect(result.sorted.length).toBe(5);
    });
});

// ============================================================
// 喜用神測試
// ============================================================
describe('getFavoriteElement', () => {
    it('身弱應喜生扶（印、比劫）', () => {
        // 極弱的水：全部 0
        const weakStrength = {
            weighted: { 木: 1, 火: 1, 土: 10, 金: 1, 水: 1 }
        };
        const result = getFavoriteElement(8, weakStrength); // 壬水
        expect(result.isWeak).toBe(true);
        expect(result.favorite).toContain('金'); // 生水
        expect(result.favorite).toContain('水'); // 比劫
    });

    it('身強應喜剋洩（官殺、財、食傷）', () => {
        const strongStrength = {
            weighted: { 木: 10, 火: 1, 土: 1, 金: 1, 水: 1 }
        };
        const result = getFavoriteElement(0, strongStrength); // 甲木
        expect(result.isStrong).toBe(true);
        expect(result.favorite).toContain('土'); // 財
        expect(result.favorite).toContain('火'); // 食傷
    });

    it('中和應有適當喜用', () => {
        const balancedStrength = {
            weighted: { 木: 5, 火: 5, 土: 5, 金: 5, 水: 5 }
        };
        const result = getFavoriteElement(4, balancedStrength); // 戊土
        expect(result.isBalanced).toBe(true);
        expect(result.favorite.length).toBeGreaterThan(0);
    });
});

// ============================================================
// 完整八字計算測試
// ============================================================
describe('calculateBazi', () => {
    it('2024年2月10日正月初一應有完整結果', () => {
        const result = calculateBazi(2024, 2, 10, 12, 'male');
        expect(result).toBeDefined();
        expect(result.pillars.length).toBe(4); // 有提供時辰
        expect(result.dayMaster).toBeDefined();
        expect(result.dayMaster.stem).toBeTruthy();
        expect(result.elementStrength).toBeDefined();
        expect(result.favoriteElement).toBeDefined();
        expect(result.zodiac).toBeDefined();
        expect(result.summary).toBeTruthy();
    });

    it('無時辰時應為3柱', () => {
        const result = calculateBazi(2024, 2, 10);
        expect(result.pillars.length).toBe(3);
    });

    it('無性別時不應有大運', () => {
        const result = calculateBazi(2024, 2, 10, 12);
        expect(result.greatLuck).toBeNull();
    });

    it('有性別時應有大運', () => {
        const result = calculateBazi(2024, 2, 10, 12, 'male');
        expect(result.greatLuck).toBeDefined();
        if (result.greatLuck && !result.greatLuck.error) {
            expect(result.greatLuck.luckCycles.length).toBe(8);
            expect(result.greatLuck.luckCycles[0].ganZhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
            expect(result.greatLuck.luckCycles[0].tenGod).toBeTruthy();
            expect(result.greatLuck.luckCycles[0].analysis.length).toBeGreaterThan(20);
        }
    });

    it('大運應由月柱依順逆逐柱排列，而非固定十神輪播', () => {
        const male = calculateBazi(2024, 2, 10, 12, 'male');
        const female = calculateBazi(2024, 2, 10, 12, 'female');
        const month = male.pillars.find(p => p.name === '月柱');
        const forward = male.greatLuck.isForward ? male : female;
        const backward = male.greatLuck.isForward ? female : male;

        expect(forward.greatLuck.luckCycles[0].stemIndex).toBe((month.stemIndex + 1) % 10);
        expect(forward.greatLuck.luckCycles[0].branchIndex).toBe((month.branchIndex + 1) % 12);
        expect(backward.greatLuck.luckCycles[0].stemIndex).toBe((month.stemIndex + 9) % 10);
        expect(backward.greatLuck.luckCycles[0].branchIndex).toBe((month.branchIndex + 11) % 12);
    });
});

// ============================================================
// 輸入驗證測試
// ============================================================
describe('isValidDate', () => {
    it('有效日期應回傳 true', () => {
        expect(isValidDate(2024, 1, 15)).toBe(true);
    });

    it('無效月份應回傳 false', () => {
        expect(isValidDate(2024, 13, 1)).toBe(false);
    });

    it('無效日期（如2月30日）應回傳 false', () => {
        expect(isValidDate(2024, 2, 30)).toBe(false);
    });

    it('閏年2月29日應回傳 true', () => {
        expect(isValidDate(2024, 2, 29)).toBe(true);
    });

    it('非閏年2月29日應回傳 false', () => {
        expect(isValidDate(2023, 2, 29)).toBe(false);
    });
});
