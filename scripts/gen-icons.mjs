// scripts/gen-icons.mjs
// 零相依 PWA 圖示產生器（使用 Node 內建 zlib 編碼 PNG）
// 設計：紅底（theme-color #8B0000）+ 金色外環 + 五行五色點
import zlib from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const RED = [139, 0, 0];
const GOLD = [232, 200, 122];
const ELEMENT_COLORS = {
    '木': [46, 125, 50],
    '火': [211, 47, 47],
    '土': [141, 110, 63],
    '金': [189, 189, 189],
    '水': [21, 101, 192]
};

function crc32(buf) {
    let c = ~0;
    for (let i = 0; i < buf.length; i++) {
        c ^= buf[i];
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (c >>> 1) ^ 0xedb88320 : (c >>> 1);
        }
    }
    return (~c) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type, 'ascii');
    const body = Buffer.concat([t, data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
}

function encodePNG(width, height, rgba) {
    const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
    const raw = Buffer.alloc((width * 4 + 1) * height);
    for (let y = 0; y < height; y++) {
        const off = y * (width * 4 + 1);
        raw[off] = 0;
        rgba.copy(raw, off + 1, y * width * 4, (y + 1) * width * 4);
    }
    const idat = zlib.deflateSync(raw, { level: 9 });
    return Buffer.concat([
        sig,
        chunk('IHDR', ihdr),
        chunk('IDAT', idat),
        chunk('IEND', Buffer.alloc(0))
    ]);
}

function makeIcon(size, rounded, ringInset) {
    const buf = Buffer.alloc(size * size * 4); // RGBA, transparent
    const set = (x, y, rgb, a = 255) => {
        if (x < 0 || y < 0 || x >= size || y >= size) return;
        const i = (y * size + x) * 4;
        // alpha blend over existing
        const sa = a / 255;
        const da = buf[i + 3] / 255;
        const outA = sa + da * (1 - sa);
        if (outA <= 0) return;
        for (let c = 0; c < 3; c++) {
            buf[i + c] = Math.round((rgb[c] * sa + buf[i + c] * da * (1 - sa)) / outA);
        }
        buf[i + 3] = Math.round(outA * 255);
    };
    const fillCircle = (cx, cy, r, rgb, a = 255) => {
        for (let y = Math.floor(cy - r); y <= cy + r; y++) {
            for (let x = Math.floor(cx - r); x <= cx + r; x++) {
                const dx = x - cx, dy = y - cy;
                if (dx * dx + dy * dy <= r * r) set(x, y, rgb, a);
            }
        }
    };
    // 背景：紅底
    const radius = rounded ? Math.round(size * 0.18) : 0;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            let inside = true;
            if (rounded) {
                const cx = Math.min(Math.max(x, radius), size - 1 - radius);
                const cy = Math.min(Math.max(y, radius), size - 1 - radius);
                const dx = x - cx, dy = y - cy;
                inside = dx * dx + dy * dy <= radius * radius;
            }
            if (inside) set(x, y, RED, 255);
        }
    }
    // 金色外環
    const cx = size / 2, cy = size / 2;
    const outerR = size / 2 - ringInset;
    const ringW = Math.max(2, Math.round(size * 0.03));
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const dx = x - cx, dy = y - cy;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d <= outerR && d >= outerR - ringW) set(x, y, GOLD, 255);
        }
    }
    // 五行五色點（中央水平排列）
    const colors = ['木', '火', '土', '金', '水'];
    const dotR = Math.max(3, Math.round(size * 0.045));
    const gap = size * 0.11;
    const startX = cx - gap * 2;
    colors.forEach((el, idx) => {
        fillCircle(startX + gap * idx, cy, dotR, ELEMENT_COLORS[el], 255);
    });
    return encodePNG(size, size, buf);
}

const targets = [
    { file: 'icon-192.png', size: 192, rounded: true, ringInset: 10 },
    { file: 'icon-512.png', size: 512, rounded: true, ringInset: 26 },
    { file: 'icon-maskable-192.png', size: 192, rounded: false, ringInset: 10 },
    { file: 'icon-maskable-512.png', size: 512, rounded: false, ringInset: 26 }
];

for (const t of targets) {
    const png = makeIcon(t.size, t.rounded, t.ringInset);
    const out = resolve(root, t.file);
    writeFileSync(out, png);
    console.log(`wrote ${t.file} (${png.length} bytes)`);
}
