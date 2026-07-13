import { describe, it, expect } from 'vitest';
import { calculateBazi } from './bazi.js';
import {
    getLiunianGanZhi,
    getBranchInteractions,
    assessElementFavor,
    analyzeLiunianYear,
    buildLiunianTable,
    computeImpactLevel,
    TEN_GOD_LIUNIAN
} from './liunian.js';

describe('liunian 流年分析', () => {
    it('getLiunianGanZhi：1984 為甲子年', () => {
        const gz = getLiunianGanZhi(1984);
        expect(gz.stem).toBe('甲');
        expect(gz.branch).toBe('子');
        expect(gz.ganZhi).toBe('甲子');
        expect(gz.element).toBe('木');
    });

    it('getLiunianGanZhi：2024 為甲辰年', () => {
        const gz = getLiunianGanZhi(2024);
        expect(gz.ganZhi).toBe('甲辰');
    });

    it('十神說明表涵蓋十神', () => {
        const names = ['比肩', '劫財', '食神', '傷官', '正財', '偏財', '正官', '七殺', '正印', '偏印'];
        for (const n of names) {
            expect(TEN_GOD_LIUNIAN[n]).toBeTruthy();
            expect(TEN_GOD_LIUNIAN[n].summary.length).toBeGreaterThan(0);
            expect(TEN_GOD_LIUNIAN[n].detail.length).toBeGreaterThan(0);
        }
    });

    it('子午冲、子丑合可正確偵測', () => {
        const pillars = [
            { name: '年柱', branch: '午' },
            { name: '日柱', branch: '丑' }
        ];
        const list = getBranchInteractions('子', pillars);
        const types = list.map(x => x.type);
        expect(types).toContain('clash');
        expect(types).toContain('combine');
        expect(list.some(x => x.label === '沖' && x.natalBranch === '午')).toBe(true);
        expect(list.some(x => x.label === '六合' && x.natalBranch === '丑')).toBe(true);
    });

    it('喜用神評估：喜 / 忌 / 中', () => {
        const fav = { favorite: ['水', '木'], unfavorite: ['火'] };
        expect(assessElementFavor('水', fav).favor).toBe('喜');
        expect(assessElementFavor('火', fav).favor).toBe('忌');
        expect(assessElementFavor('土', fav).favor).toBe('中');
    });

    it('computeImpactLevel：喜用 + 吉神分數較高', () => {
        const good = computeImpactLevel('正財', '喜', []);
        const bad = computeImpactLevel('劫財', '忌', [{ type: 'clash', label: '冲' }]);
        expect(good.score).toBeGreaterThan(bad.score);
        expect(good.tone).toBe('good');
    });

    it('analyzeLiunianYear：依日主產出十神與說明', () => {
        const bazi = calculateBazi(1990, 5, 15, 12, 'male');
        const row = analyzeLiunianYear(bazi, 2024);
        expect(row).toBeTruthy();
        expect(row.year).toBe(2024);
        expect(row.ganZhi).toBe('甲辰');
        expect(row.tenGod).toBeTruthy();
        expect(TEN_GOD_LIUNIAN[row.tenGod] || row.godInfo).toBeTruthy();
        expect(row.godInfo.detail.length).toBeGreaterThan(10);
        expect(row.impact.level).toBeTruthy();
        expect(row.age).toBe(2024 - 1990);
        expect(row.interactions.every(item => item.desc.length > 12)).toBe(true);
    });

    it('buildLiunianTable：範圍內每年一列', () => {
        const bazi = calculateBazi(2000, 1, 1, 10, 'female');
        const table = buildLiunianTable(bazi, { startYear: 2000, endYear: 2010 });
        expect(table).toHaveLength(11);
        expect(table[0].year).toBe(2000);
        expect(table[10].year).toBe(2010);
        // 干支連續甲子週期：2000 庚辰、2001 辛巳
        expect(table[0].ganZhi).toBe('庚辰');
        expect(table[1].ganZhi).toBe('辛巳');
    });
});
