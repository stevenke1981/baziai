import { describe, it, expect } from 'vitest';
import * as data from './data.js';
import * as bazi from './bazi.js';

describe('常數單一定義（去重回歸）', () => {
    it('ELEMENT_COLORS 僅由 data.js 定義一處（bazi.js 為同一參考 re-export）', () => {
        expect(typeof data.ELEMENT_COLORS).toBe('object');
        if ('ELEMENT_COLORS' in bazi) {
            expect(bazi.ELEMENT_COLORS).toBe(data.ELEMENT_COLORS);
        }
    });

    it('STEM_ELEMENT / BRANCH_ELEMENT 來源為 data.js 陣列', () => {
        expect(bazi.STEM_ELEMENT).toBe(data.STEM_ELEMENT_ARRAY);
        expect(bazi.BRANCH_ELEMENT).toBe(data.BRANCH_ELEMENT_ARRAY);
    });

    it('STEM_YIN_YANG / BRANCH_YIN_YANG / ELEMENT_COLOR_VALUES 來自 data.js', () => {
        expect(bazi.STEM_YIN_YANG).toBe(data.STEM_YIN_YANG);
        expect(bazi.BRANCH_YIN_YANG).toBe(data.BRANCH_YIN_YANG);
        expect(data.ELEMENT_COLOR_VALUES).toBeDefined();
    });
});
