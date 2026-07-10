import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const p = (f) => resolve(root, f);

describe('PWA 靜態檢查（D8 / D9）', () => {
    it('manifest.json 存在且參照 icon 檔案，檔案實際存在且有合理大小', () => {
        const m = JSON.parse(readFileSync(p('manifest.json'), 'utf-8'));
        expect(Array.isArray(m.icons)).toBe(true);
        const srcs = m.icons.map((i) => i.src);
        expect(srcs).toContain('icon-192.png');
        expect(srcs).toContain('icon-512.png');
        // 至少含一個 maskable
        expect(m.icons.some((i) => i.purpose === 'maskable')).toBe(true);
        for (const s of srcs) {
            expect(existsSync(p(s)), `${s} 應存在`).toBe(true);
            expect(statSync(p(s)).size, `${s} 大小`).toBeGreaterThan(100);
        }
    });

    it('sw.js 存在', () => {
        expect(existsSync(p('sw.js'))).toBe(true);
        const sw = readFileSync(p('sw.js'), 'utf-8');
        expect(sw).toContain("self.addEventListener('fetch'");
        expect(sw).toContain('caches');
    });

    it('index.html 註冊 sw.js', () => {
        const html = readFileSync(p('index.html'), 'utf-8');
        expect(html).toContain("navigator.serviceWorker.register('sw.js')");
        expect(html).toContain('rel="manifest" href="manifest.json"');
    });
});
