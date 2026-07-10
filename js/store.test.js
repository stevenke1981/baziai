import { describe, it, expect, beforeEach } from 'vitest';
import { appStore, Store } from './store.js';

describe('Store 集中式狀態', () => {
    beforeEach(() => {
        appStore.clearResults();
    });

    it('setBaziResult / getBaziResult', () => {
        const r = { pillars: [{ stem: '甲' }] };
        appStore.setBaziResult(r);
        expect(appStore.getBaziResult()).toBe(r);
    });

    it('setGejuResult / getGejuResult', () => {
        const g = { name: '正官格' };
        appStore.setGejuResult(g);
        expect(appStore.getGejuResult()).toBe(g);
    });

    it('subscribe 在 set 時觸發，unsubscribe 後不再觸發', () => {
        let called = 0;
        const unsub = appStore.subscribe('baziResult', () => { called++; });
        appStore.setBaziResult({ a: 1 });
        expect(called).toBe(1);
        unsub();
        appStore.setBaziResult({ a: 2 });
        expect(called).toBe(1);
    });

    it('clearResults 清除八字與格局', () => {
        appStore.setBaziResult({ a: 1 });
        appStore.setGejuResult({ b: 2 });
        appStore.clearResults();
        expect(appStore.getBaziResult()).toBeNull();
        expect(appStore.getGejuResult()).toBeNull();
    });

    it('calendar / showAdvanced 設定', () => {
        appStore.setCalendar('roc');
        expect(appStore.getCalendar()).toBe('roc');
        appStore.setShowAdvanced(true);
        expect(appStore.getShowAdvanced()).toBe(true);
    });

    it('Store 類別可獨立實例化', () => {
        const s = new Store();
        s.setBaziResult({ x: 1 });
        expect(s.getBaziResult().x).toBe(1);
    });
});
