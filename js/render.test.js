// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// 從 index.html 抽取 <body> 內容（移除 script 標籤）作為測試 DOM
const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf-8');
const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
const bodyHtml = (bodyMatch ? bodyMatch[1] : '').replace(/<script[\s\S]*?<\/script>/g, '');

beforeEach(() => {
    try { localStorage.clear(); } catch (e) { /* ignore */ }
});

async function bootApp() {
    vi.resetModules();
    document.body.innerHTML = bodyHtml;
    const mod = await import('./app.js');
    if (typeof mod.init === 'function') mod.init();
    return mod;
}

describe('app.js 模組載入與排盤渲染', () => {
    it('模組載入後年份下拉有選項，且能顯示已選西元年', async () => {
        await bootApp();

        const yearSel = document.getElementById('birthYear');
        expect(yearSel).toBeTruthy();
        // 至少含 placeholder + 1900..now+10
        expect(yearSel.options.length).toBeGreaterThan(100);
        expect(yearSel.value).toBeTruthy(); // init 預填今天

        yearSel.value = '1990';
        expect(yearSel.value).toBe('1990');
        const selected = yearSel.selectedOptions[0];
        expect(selected).toBeTruthy();
        expect(selected.textContent).toMatch(/1990/);
        // 關閉狀態應能讀取顯示文字（非空白）
        expect((selected.textContent || '').trim().length).toBeGreaterThan(0);
    });

    it('載入整個模組圖不拋錯，且能完成排盤並渲染四柱', async () => {
        await bootApp();

        document.getElementById('birthYear').value = '2024';
        document.getElementById('birthMonth').value = '2';
        document.getElementById('birthDay').value = '10';
        document.getElementById('birthHour').value = '12';
        document.getElementById('gender').value = 'male';

        const form = document.getElementById('baziForm');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

        // handleSubmit 內部使用 setTimeout(100) 進行計算
        await new Promise((r) => setTimeout(r, 250));

        const pillars = document.getElementById('pillarsContent').textContent || '';
        // 四柱八字至少應含天干地支字元
        expect(pillars.length).toBeGreaterThan(0);
        expect(pillars).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
        // 結果區已顯示
        expect(document.getElementById('resultArea').classList.contains('hidden')).toBe(false);
        // 錯誤條隱藏
        expect(document.getElementById('errorBanner').classList.contains('hidden')).toBe(true);
    });

    it('輸入無效日期時顯示頁內錯誤條，且不呼叫 alert', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        await bootApp();

        // 選完整年月日但日期不存在於該月（2 月 30 日）
        document.getElementById('birthYear').value = '2024';
        document.getElementById('birthMonth').value = '2';
        document.getElementById('birthDay').value = '30';

        const form = document.getElementById('baziForm');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

        await new Promise((r) => setTimeout(r, 50));

        const banner = document.getElementById('errorBanner');
        expect(banner.classList.contains('hidden')).toBe(false);
        expect(banner.textContent || '').toContain('有效');
        expect(alertSpy).not.toHaveBeenCalled();
        alertSpy.mockRestore();
    });

    it('F4 localStorage 還原：寫入後重啟 app 自動還原輸入並重算', async () => {
        localStorage.setItem('baziai:last-input', JSON.stringify({
            year: 2024, month: 2, day: 10, hour: 15, gender: 'male',
            calendar: 'western', advanced: false, lateZi: false
        }));
        await bootApp();

        expect(document.getElementById('birthYear').value).toBe('2024');
        expect(document.getElementById('birthMonth').value).toBe('2');
        expect(document.getElementById('birthDay').value).toBe('10');

        // init 自動重算
        await new Promise((r) => setTimeout(r, 250));
        expect(document.getElementById('pillarsContent').textContent).toMatch(/[甲乙丙丁戊己庚辛壬癸]/);
    });

    it('F3 分享連結：點擊複製鈕取得含出生參數的 URL', async () => {
        await bootApp();
        document.getElementById('birthYear').value = '2024';
        document.getElementById('birthMonth').value = '2';
        document.getElementById('birthDay').value = '10';
        document.getElementById('birthHour').value = '15';
        document.getElementById('gender').value = 'male';

        const clip = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
            value: { writeText: clip }, configurable: true
        });

        document.getElementById('copyShare').dispatchEvent(new Event('click', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 20));

        expect(clip).toHaveBeenCalled();
        const url = clip.mock.calls[0][0];
        expect(url).toContain('y=2024');
        expect(url).toContain('m=2');
        expect(url).toContain('d=10');
        expect(url).toContain('h=15');
        expect(url).toContain('g=male');
    });

    it('未選日期提交時顯示「請選擇完整」錯誤條（不呼叫 alert）', async () => {
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
        await bootApp();

        // 清空 init 預填的今天日期後直接提交
        document.getElementById('birthYear').value = '';
        document.getElementById('birthMonth').value = '';
        document.getElementById('birthDay').value = '';
        const form = document.getElementById('baziForm');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

        await new Promise((r) => setTimeout(r, 50));

        const banner = document.getElementById('errorBanner');
        expect(banner.classList.contains('hidden')).toBe(false);
        expect(banner.textContent || '').toContain('完整');
        expect(alertSpy).not.toHaveBeenCalled();
        alertSpy.mockRestore();
    });

    it('曆法切換保留已選西元年，且民國模式 option.value 仍為西元年', async () => {
        await bootApp();

        document.getElementById('birthYear').value = '1990';
        expect(document.getElementById('birthYear').value).toBe('1990');

        document.getElementById('btnRoc').dispatchEvent(new Event('click', { bubbles: true }));

        // 切換後選項重建，不得清空已選年份
        expect(document.getElementById('birthYear').value).toBe('1990');

        const selected = document.getElementById('birthYear').selectedOptions[0];
        expect(selected).toBeTruthy();
        expect(selected.value).toBe('1990');
        // 民國顯示：民國 79 年（1990）
        expect(selected.textContent).toMatch(/民國\s*79/);
        expect(selected.textContent).toMatch(/1990/);

        // 切回西元仍保留
        document.getElementById('btnWestern').dispatchEvent(new Event('click', { bubbles: true }));
        expect(document.getElementById('birthYear').value).toBe('1990');
    });

    it('民國曆模式下排盤不應把西元年再 +1911（與西元模式同一年結果一致）', async () => {
        await bootApp();

        document.getElementById('birthYear').value = '1990';
        document.getElementById('birthMonth').value = '5';
        document.getElementById('birthDay').value = '15';
        document.getElementById('birthHour').value = '12';
        document.getElementById('gender').value = 'male';

        const form = document.getElementById('baziForm');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await new Promise((r) => setTimeout(r, 250));
        const westernPillars = document.getElementById('pillarsContent').textContent || '';

        // 切民國再排同一西元年
        document.getElementById('btnRoc').dispatchEvent(new Event('click', { bubbles: true }));
        expect(document.getElementById('birthYear').value).toBe('1990');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        await new Promise((r) => setTimeout(r, 250));
        const rocPillars = document.getElementById('pillarsContent').textContent || '';

        expect(rocPillars).toBe(westernPillars);
        expect(document.getElementById('errorBanner').classList.contains('hidden')).toBe(true);
    });

    it('F4 localStorage 民國曆還原：保留西元年份且顯示民國標籤', async () => {
        localStorage.setItem('baziai:last-input', JSON.stringify({
            year: 1988, month: 8, day: 8, hour: 10, gender: 'female',
            calendar: 'roc', advanced: false, lateZi: false
        }));
        await bootApp();

        expect(document.getElementById('birthYear').value).toBe('1988');
        expect(document.getElementById('btnRoc').classList.contains('active')).toBe(true);
        const selected = document.getElementById('birthYear').selectedOptions[0];
        expect(selected.textContent).toMatch(/民國\s*77/);
    });
});
