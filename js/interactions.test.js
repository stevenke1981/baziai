import { describe, expect, it } from 'vitest';
import { analyzeGanZhiInteractions, getBranchInteractions, getStemInteractions } from './interactions.js';

describe('干支互動共用引擎', () => {
    it('辨識天干五合與五行相剋', () => {
        const pillars = [
            { name: '年柱', stem: '己', branch: '丑' },
            { name: '日柱', stem: '庚', branch: '午' }
        ];
        const list = getStemInteractions('甲', pillars, '流年');
        expect(list.some(item => item.label === '干合' && item.natalStem === '己')).toBe(true);
        expect(list.some(item => item.label === '干剋' && item.natalStem === '庚')).toBe(true);
    });

    it('辨識沖、害、破與自刑', () => {
        const pillars = [
            { name: '年柱', branch: '午' },
            { name: '月柱', branch: '未' },
            { name: '日柱', branch: '酉' },
            { name: '時柱', branch: '子' }
        ];
        const labels = getBranchInteractions('子', pillars).map(item => item.label);
        expect(labels).toContain('沖');
        expect(labels).toContain('害');
        expect(labels).toContain('破');
    });

    it('命局加流年三支齊全時辨識三合與三會', () => {
        const harmony = analyzeGanZhiInteractions('甲', '辰', [
            { name: '年柱', stem: '丙', branch: '申' },
            { name: '月柱', stem: '丁', branch: '子' }
        ]);
        const meeting = getBranchInteractions('辰', [
            { name: '年柱', branch: '寅' },
            { name: '月柱', branch: '卯' }
        ]);
        expect(harmony.some(item => item.label === '三合')).toBe(true);
        expect(meeting.some(item => item.label === '三會')).toBe(true);
    });
});
