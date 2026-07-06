# todos.md — 任務清單

## Phase 1: 基礎建設

- [ ] **1.1** 初始化 Git 倉庫 + `.gitignore`
- [ ] **1.2** 建立 `package.json`（含 test/lint/check scripts）
- [ ] **1.3** 加入 ESLint + Prettier 設定檔

## Phase 2: 資料層改善

- [ ] **2.1** 建立 `js/data.js` — 共用天干/地支/五行/藏干/納音/生肖資料
- [ ] **2.2** 建立 `js/config.js` — 權重/閾值/月令分數等配置常數
- [ ] **2.3** 修改所有 JS 檔案從 data.js/config.js 匯入資料（移除重複定義）
- [ ] **2.4** 統一 `var` → `const`/`let`（lunming.js, lunming2.js）

## Phase 3: 狀態管理與錯誤處理

- [ ] **3.1** 建立 `js/store.js` — 集中式狀態管理（取代 `window._lastResult`）
- [ ] **3.2** 建立 `js/error.js` — 統一錯誤處理層
- [ ] **3.3** 修改 app.js 使用 store.js 取代全域變數

## Phase 4: ES Module 模組系統

- [ ] **4.1** 為所有 JS 檔案加入 `export` 語句
- [ ] **4.2** app.js 改為使用 `import` 載入所有模組
- [ ] **4.3** index.html 改為 `<script type="module">` 載入 app.js
- [ ] **4.4** 跨模組資料流驗證（所有分頁功能正常）

## Phase 5: 單元測試

- [ ] **5.1** 安裝 Vitest，建立 `vitest.config.js`
- [ ] **5.2** 為 `calculateBazi` 加入測試案例（含邊界值）
- [ ] **5.3** 為 `getYearPillar` / `getDayPillar` 加入測試
- [ ] **5.4** 為 `getFavoriteElement` 加入測試
- [ ] **5.5** `npm run test` 全部通過

## Phase 6: 長函數拆分與優化

- [ ] **6.1** 拆分 `determineGeju`（geju.js ~285 行 → 3-4 個小函數）
- [ ] **6.2** 拆分 `calculateDayMasterStrength`（lunming2.js ~168 行）
- [ ] **6.3** 加入節氣日期 memoization 快取
- [ ] **6.4** 優化納音計算（數學公式取代迴圈）

## Phase 7: CSS 與 UI 優化

- [ ] **7.1** 拆分 `style.css` 為 4 個檔案（base, paipan, lunming, geju）
- [ ] **7.2** 合併 CSS 檔案到 index.html
- [ ] **7.3** DOM 參考快取優化（app.js 避免重複查詢）
- [ ] **7.4** JS 硬編碼五行顏色改為讀取 CSS 變數

## Phase 8: 效能與 Polish

- [ ] **8.1** GPU 加速提示（`transform: translateZ(0)` 加到動畫元素）
- [ ] **8.2** 加入 PWA manifest (`site.webmanifest`)
- [ ] **8.3** 加入 meta theme-color 與 apple-mobile-web-app
- [ ] **8.4** 加入基本 Service Worker (sw.js)
- [ ] **8.5** 加入節氣精度免責提示

## Phase 9: 驗證與報告

- [ ] **9.1** 完整功能手動測試（5 個分頁）
- [ ] **9.2** `npm run test` 驗證
- [ ] **9.3** `npm run lint` 驗證
- [ ] **9.4** 撰寫 final.md
