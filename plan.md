# plan.md — 八字命盤全面改善計畫

## 總體策略

採用**由內而外、由基礎到上層**的策略：
1. 先建基礎設施（Git, package.json, lint）
2. 再整資料層（data.js, config.js, 變數統一）
3. 再整架構（狀態管理, 錯誤處理, ES Module）
4. 再補測試（單元測試）
5. 再重構長函數與效能優化
6. 最後處理 CSS 與 PWA

每個步驟都是可驗證、可回滾的小步修改。

---

## Phase 1: 基礎建設（對應建議 #6, #7, #10）

| 步驟 | 內容 | 驗證方式 |
|------|------|---------|
| 1.1 | 初始化 Git 倉庫 + `.gitignore` | `git log` 有初始 commit |
| 1.2 | 建立 `package.json` + 基本 scripts | `npm test` 可執行 |
| 1.3 | 加入 ESLint + Prettier 設定 | `npm run lint` 可執行 |

**風險**: 無（不影響功能）

---

## Phase 2: 資料層改善（對應建議 #2, #5, #9）

| 步驟 | 內容 | 驗證方式 |
|------|------|---------|
| 2.1 | 建立 `data.js` — 共用天干/地支/五行/藏干/納音資料 | 所有檔案仍可存取相同資料 |
| 2.2 | 建立 `config.js` — 魔術數字、權重、閾值集中管理 | 配置值可正確讀取 |
| 2.3 | 統一 `var` → `const`/`let`（lunming.js, lunming2.js） | lint 不報 var 錯誤 |

**風險**: 需確保所有檔案引用正確的資料來源，避免 undefined

---

## Phase 3: 狀態管理與錯誤處理（對應建議 #4, #13）

| 步驟 | 內容 | 驗證方式 |
|------|------|---------|
| 3.1 | 建立 `store.js` — 集中式狀態管理（取代 `window._lastResult`） | 所有模組讀寫狀態正常 |
| 3.2 | 建立 `error.js` — 統一錯誤處理層 | try-catch 覆蓋核心 API |

**風險**: 需要改動 app.js 中所有引用 `window._lastResult` 的地方

---

## Phase 4: ES Module 模組系統（對應建議 #1）

| 步驟 | 內容 | 驗證方式 |
|------|------|---------|
| 4.1 | 在各 JS 檔案加入 `export` | 瀏覽器 console 無錯誤 |
| 4.2 | 建立 `app.js` 作為入口，用 `import` 載入所有模組 | 所有分頁功能正常 |
| 4.3 | 修改 `index.html` 改用 `<script type="module">` | 頁面正常載入 |

**風險**: 最高風險步驟。載入順序依賴需重新設計，可能導致部分功能暫時失效

---

## Phase 5: 單元測試（對應建議 #3）

| 步驟 | 內容 | 驗證方式 |
|------|------|---------|
| 5.1 | 安裝 Vitest，建立測試配置 | `npx vitest run` 可執行 |
| 5.2 | 為 `calculateBazi` 加入測試 | 測試通過 |
| 5.3 | 為 `getYearPillar` / `getDayPillar` 加入測試 | 測試通過 |
| 5.4 | 為 `getFavoriteElement` 加入測試 | 測試通過 |

**風險**: ES Module 轉換後測試配置需相容

---

## Phase 6: 重構與優化（對應建議 #11, #12, #15）

| 步驟 | 內容 | 驗證方式 |
|------|------|---------|
| 6.1 | 拆分 `determineGeju` 長函數（geju.js） | 格局功能正常 |
| 6.2 | 拆分 `calculateDayMasterStrength`（lunming2.js） | 量化評分功能正常 |
| 6.3 | 加入節氣日期快取（memoization） | 節氣計算結果一致 |
| 6.4 | 優化納音計算（數學公式取代迴圈） | 納音結果一致 |

**風險**: 重構可能改變行為，需仔細比對前後輸出

---

## Phase 7: CSS 與 UI 優化（對應建議 #8, #14）

| 步驟 | 內容 | 驗證方式 |
|------|------|---------|
| 7.1 | 拆分 `style.css` 為 3+ 檔案 | 頁面樣式無異 |
| 7.2 | DOM 參考快取優化（app.js） | 功能正常 |
| 7.3 | 移除 JS 中的硬編碼顏色（改用 CSS 變數） | 顏色顯示正確 |

**風險**: CSS 拆分可能導致樣式遺漏

---

## Phase 8: 效能與 Polish（對應建議 #17, #18, #19）

| 步驟 | 內容 | 驗證方式 |
|------|------|---------|
| 8.1 | 加入 GPU 加速提示（`transform: translateZ(0)`） | 動畫流暢 |
| 8.2 | 加入 PWA manifest + meta theme-color | DevTools 可偵測 manifest |
| 8.3 | 加入基本 Service Worker（cache-first 靜態資源） | SW 註冊成功 |

**風險**: Service Worker 需 HTTPS 或 localhost 才能完整測試

---

## 不執行項目（含說明）

- **建議 #16（改進節氣精度）**: 需要引入天文計算庫，超出輕量級改善範疇。僅加上免責提示。
- **Service Worker 進階策略**: 僅提供基本版本，不實作完整離線策略。
