import { describe, it, expect, vi } from 'vitest';
import {
    AppError,
    ErrorType,
    safeExecute,
    isValidDate,
    inputError,
    requireBaziResult
} from './error.js';

describe('AppError / safeExecute', () => {
    it('AppError 對應使用者友善訊息', () => {
        const e = new AppError(ErrorType.INVALID_INPUT, '技術錯誤');
        expect(e.type).toBe(ErrorType.INVALID_INPUT);
        expect(e.userMessage).toContain('輸入');
        expect(e.getUserMessage()).toBe(e.userMessage);
    });

    it('safeExecute 成功時回傳結果', () => {
        expect(safeExecute(() => 42)).toBe(42);
    });

    it('safeExecute 捕獲錯誤並自動包裝為 AppError，呼叫 onError', () => {
        const onError = vi.fn();
        const r = safeExecute(
            () => { throw new Error('boom'); },
            { errorType: ErrorType.CALCULATION, onError }
        );
        expect(r).toBeNull();
        expect(onError).toHaveBeenCalledTimes(1);
        const arg = onError.mock.calls[0][0];
        expect(arg instanceof AppError).toBe(true);
        expect(arg.type).toBe(ErrorType.CALCULATION);
    });

    it('inputError 產生 INVALID_INPUT 類型錯誤', () => {
        const e = inputError('year', '必填');
        expect(e.type).toBe(ErrorType.INVALID_INPUT);
        expect(e.message).toContain('year');
    });
});

describe('isValidDate 邊界', () => {
    it('閏年 2/29 合法', () => expect(isValidDate(2024, 2, 29)).toBe(true));
    it('非閏年 2/29 不合法', () => expect(isValidDate(2023, 2, 29)).toBe(false));
    it('無效月份', () => expect(isValidDate(2024, 13, 1)).toBe(false));
    it('無效日期（2/30）', () => expect(isValidDate(2024, 2, 30)).toBe(false));
    it('非數值輸入', () => expect(isValidDate('x', 1, 1)).toBe(false));
    it('一般合法日期', () => expect(isValidDate(2000, 12, 31)).toBe(true));
});

describe('requireBaziResult', () => {
    it('null 拋錯', () => {
        expect(() => requireBaziResult(null)).toThrow(AppError);
    });
    it('pillars 不足拋錯', () => {
        expect(() => requireBaziResult({ pillars: [{ a: 1 }] })).toThrow(AppError);
    });
    it('完整結果通過', () => {
        expect(requireBaziResult({ pillars: [1, 2, 3, 4] })).toBe(true);
    });
});
