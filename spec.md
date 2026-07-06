# spec.md — 八字命盤專案全面改善

## 專案概覽

- **專案路徑**: `D:\baziai`
- **專案類型**: 前端靜態網頁應用（八字命理排算、論命、格局分析）
- **技術棧**: 原生 JavaScript + CSS3 + HTML5
- **任務依據**: `改善建議報告.md` 中的所有 19 項建議

## 目標

全面改善此專案的程式碼品質、可維護性、可擴充性、效能與安全性，涵蓋：

1. **高優先級**（5 項）：模組系統、資料去重、單元測試、狀態管理、變數統一
2. **中優先級**（8 項）：package.json、Git、CSS 拆分、config 提取、ESLint/Prettier、函數拆分、節氣快取、錯誤處理
3. **低優先級**（6 項）：DOM 優化、納音公式、節氣精度、GPU 加速、Service Worker、PWA/meta

## 範圍

### 在範圍內

- 所有 JavaScript 源碼（bazi.js, lunming.js, lunming2.js, geju.js, geju-ref.js, app.js）
- CSS 樣式表（style.css）
- HTML 主頁（index.html）
- 專案根目錄配置檔（package.json, .gitignore, .eslintrc 等）
- 建立 data.js, config.js, store.js, error.js 等新檔案
- 加入單元測試
- 加入 PWA manifest 與 Service Worker（基本版本）

### 不在範圍內

- 改變核心八字計算邏輯的正確性
- 改變 UI 視覺設計風格
- 引入外部框架或重大相依性（如 React, Vue, Webpack）
- 改變使用者操作流程
- 後端或資料庫相關功能

## 驗收條件

1. **功能正確性**: 開啟 index.html 後，排盤、論命、格局分頁功能正常運作
2. **無全域變數污染**: 所有模組使用 ES Module 方式載入
3. **資料一致性**: 核心資料（天干地支五行藏干等）僅定義一次
4. **測試覆蓋**: 核心函數有單元測試（至少 5 個測試案例）
5. **建置流程**: `npm run test` 可執行測試，`npm run lint` 可執行程式碼檢查
6. **CSS 拆分**: style.css 拆分為至少 3 個 CSS 檔案
7. **無 `var` 關鍵字**: 所有 JS 檔案使用 const/let

## 非目標

- 改進節氣計算到天文精度（使用近似公式即可，加上免責提示）
- 完整的 PWA 離線策略（僅基本 cache-first SW）
- 重構全部長函數（只拆分最長的幾個：determineGeju, calculateDayMasterStrength）

## 假設

- 此專案為靜態頁面，無後端依賴
- 所有瀏覽器支援 ES Module（現代瀏覽器）
- 使用者接受小幅度載入方式改變（從 `<script>` 改為 `<script type="module">`）
