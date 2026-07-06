/**
 * error.js — 八字命盤統一錯誤處理層
 * 
 * 提供一致的錯誤處理、使用者友善錯誤訊息
 */

/** 錯誤類型列舉 */
export const ErrorType = {
    INVALID_INPUT: 'INVALID_INPUT',
    CALCULATION: 'CALCULATION',
    MISSING_DATA: 'MISSING_DATA',
    MODULE_NOT_LOADED: 'MODULE_NOT_LOADED',
    UNKNOWN: 'UNKNOWN'
};

/** 使用者友善的錯誤訊息對照 */
const USER_MESSAGES = {
    [ErrorType.INVALID_INPUT]: '請確認輸入資料正確（年份、月份、日期需為有效數值）',
    [ErrorType.CALCULATION]: '計算過程中發生錯誤，請確認輸入資料正確',
    [ErrorType.MISSING_DATA]: '八字資料不完整，請先排盤',
    [ErrorType.MODULE_NOT_LOADED]: '功能模組尚未載入，請重新整理頁面',
    [ErrorType.UNKNOWN]: '發生未知錯誤，請重新整理頁面後重試'
};

/**
 * 自訂應用程式錯誤
 */
export class AppError extends Error {
    /**
     * @param {string} type - ErrorType 中的類型
     * @param {string} message - 技術錯誤訊息
     * @param {Object} [details] - 額外除錯資訊
     */
    constructor(type, message, details) {
        super(message);
        this.name = 'AppError';
        this.type = type || ErrorType.UNKNOWN;
        this.userMessage = USER_MESSAGES[this.type] || USER_MESSAGES[ErrorType.UNKNOWN];
        this.details = details;
        this.timestamp = new Date().toISOString();
    }

    /** 取得使用者友善訊息 */
    getUserMessage() {
        return this.userMessage;
    }

    /** 取得完整錯誤資訊（除錯用） */
    getDebugInfo() {
        return {
            type: this.type,
            message: this.message,
            userMessage: this.userMessage,
            details: this.details,
            timestamp: this.timestamp,
            stack: this.stack
        };
    }
}

/**
 * 安全執行函數，自動捕獲錯誤
 * @param {Function} fn - 要執行的函數
 * @param {Object} options
 * @param {string} options.errorType - 錯誤類型
 * @param {string} options.errorMessage - 技術錯誤訊息
 * @param {Function} options.onError - 自訂錯誤處理
 * @returns {*} 函數執行結果或 null（發生錯誤時）
 */
export function safeExecute(fn, options = {}) {
    try {
        return fn();
    } catch (err) {
        const appErr = err instanceof AppError
            ? err
            : new AppError(
                options.errorType || ErrorType.UNKNOWN,
                options.errorMessage || err.message,
                { originalError: err }
            );

        console.error(`[${appErr.type}]`, appErr.message, appErr.details || '');

        if (typeof options.onError === 'function') {
            options.onError(appErr);
        }

        return null;
    }
}

/**
 * 建立輸入驗證錯誤
 * @param {string} field - 欄位名稱
 * @param {string} message - 錯誤描述
 */
export function inputError(field, message) {
    return new AppError(ErrorType.INVALID_INPUT, `${field}: ${message}`, { field });
}

/**
 * 檢查必要的八字結果是否存在
 * @param {Object} baziResult
 * @throws {AppError} 若結果為 null 或無 pillars
 */
export function requireBaziResult(baziResult) {
    if (!baziResult) {
        throw new AppError(
            ErrorType.MISSING_DATA,
            '八字結果不存在',
            { hint: '請先排盤' }
        );
    }
    if (!baziResult.pillars || baziResult.pillars.length < 3) {
        throw new AppError(
            ErrorType.MISSING_DATA,
            '八字結果不完整',
            { pillarsCount: baziResult.pillars ? baziResult.pillars.length : 0 }
        );
    }
    return true;
}

/**
 * 驗證輸入日期
 * @param {number} year 
 * @param {number} month 
 * @param {number} day 
 * @returns {boolean}
 */
export function isValidDate(year, month, day) {
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1) return false;
    const maxDay = new Date(year, month, 0).getDate();
    if (day > maxDay) return false;
    return true;
}

/**
 * 安全 parseInt
 * @param {*} val
 * @param {number} radix 
 * @returns {number|null}
 */
export function safeParseInt(val, radix = 10) {
    const parsed = parseInt(val, radix);
    if (isNaN(parsed)) return null;
    return parsed;
}
