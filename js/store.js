/**
 * store.js — 八字命盤集中式狀態管理
 * 
 * 取代 window._lastResult 與 window._lastGejuResult 等全域變數
 * 提供單一資料來源（Single Source of Truth）
 */

class Store {
    constructor() {
        this._state = {
            /** 當前八字計算結果 */
            baziResult: null,
            /** 當前格局判定結果 */
            gejuResult: null,
            /** 當前的曆法模式 */
            calendar: 'western',
            /** 是否顯示進階資訊 */
            showAdvanced: false
        };
        this._listeners = {};
    }

    /** 取得完整狀態 */
    getState() {
        return this._state;
    }

    /** 設定八字結果 */
    setBaziResult(result) {
        this._state.baziResult = result;
        this._emit('baziResult', result);
    }

    /** 取得八字結果 */
    getBaziResult() {
        return this._state.baziResult;
    }

    /** 設定格局結果 */
    setGejuResult(result) {
        this._state.gejuResult = result;
        this._emit('gejuResult', result);
    }

    /** 取得格局結果 */
    getGejuResult() {
        return this._state.gejuResult;
    }

    /** 設定曆法模式 */
    setCalendar(cal) {
        this._state.calendar = cal;
        this._emit('calendar', cal);
    }

    /** 取得曆法模式 */
    getCalendar() {
        return this._state.calendar;
    }

    /** 設定進階顯示 */
    setShowAdvanced(val) {
        this._state.showAdvanced = val;
    }

    /** 是否顯示進階 */
    getShowAdvanced() {
        return this._state.showAdvanced;
    }

    /** 清除所有結果 */
    clearResults() {
        this._state.baziResult = null;
        this._state.gejuResult = null;
    }

    /**
     * 訂閱狀態變更
     * @param {string} key 狀態 key
     * @param {Function} callback 回調
     */
    subscribe(key, callback) {
        if (!this._listeners[key]) {
            this._listeners[key] = [];
        }
        this._listeners[key].push(callback);
        return () => {
            this._listeners[key] = this._listeners[key].filter(cb => cb !== callback);
        };
    }

    /** 內部：發送事件 */
    _emit(key, value) {
        const listeners = this._listeners[key];
        if (listeners) {
            listeners.forEach(cb => {
                try { cb(value); } catch (e) { console.warn('Store listener error:', e); }
            });
        }
    }
}

/** 全域單一實例 */
const appStore = new Store();

// 向後相容：保留 window._lastResult / _lastGejuResult getter/setter
if (typeof window !== 'undefined') {
    Object.defineProperty(window, '_lastResult', {
        get() { return appStore.getBaziResult(); },
        set(val) { appStore.setBaziResult(val); },
        configurable: true
    });
    Object.defineProperty(window, '_lastGejuResult', {
        get() { return appStore.getGejuResult(); },
        set(val) { appStore.setGejuResult(val); },
        configurable: true
    });
    window.appStore = appStore;
}

export { appStore, Store };
