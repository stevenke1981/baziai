# test.md — 測試策略與驗證記錄

## 測試策略

由於此專案為前端靜態頁面，測試策略包含：

1. **單元測試**: 使用 Vitest 測試核心計算函數
2. **Lint 檢查**: ESLint 統一程式碼風格
3. **手動功能測試**: 瀏覽器開啟確認 5 個分頁功能正常
4. **視覺回歸檢查**: 確認 CSS 拆分後樣式一致

## 單元測試計劃

### 測試目標函數

| 函數 | 來源檔案 | 測試案例數 | 邊界案例 |
|------|---------|-----------|---------|
| `calculateBazi` | bazi.js | 5+ | 立春日前後、閏年、跨世紀 |
| `getYearPillar` | bazi.js | 3+ | 春分前/後、西元前 |
| `getDayPillar` | bazi.js | 3+ | 跨月、閏年2月 |
| `getFavoriteElement` | bazi.js | 3+ | 身強/身弱/中和 |
| `calculateGreatLuck` | bazi.js | 2+ | 男/女、陽年/陰年 |

### 驗收門檻

- 所有測試案例通過
- 測試覆蓋核心計算路徑
- 邊界值案例包含在測試中

## 指令記錄

| 指令 | 用途 | 預期結果 |
|------|------|---------|
| `npx vitest run` | 執行所有測試 | PASS |
| `npx vitest run --reporter=verbose` | 詳細測試輸出 | 每個案例名稱顯示 |
| `npm run lint` | ESLint 檢查 | 無 error |
| `npm run check` | lint + test | 全部通過 |

## 手動測試檢查清單

- [ ] index.html 可正確載入
- [ ] 西元曆/民國曆切換正常
- [ ] 填入生日後排盤功能正常
- [ ] 身強/身弱判斷正常
- [ ] 喜用神/忌神顯示正常
- [ ] 大運表格顯示正常
- [ ] 論命分頁內容正常
- [ ] 論命二分頁量化評分正常
- [ ] 格局分頁判定正常
- [ ] 格局百科分頁正常
- [ ] 進階資訊（藏干、十神表）切換正常
- [ ] 響應式設計正常（手機版）

## 實際測試結果

### Phase 5 — 單元測試 (2026-07-06)

| 測試套件 | 測試案例 | 通過 | 失敗 | 結果 |
|---------|---------|------|------|------|
| getYearPillar | 4 | 4 | 0 | ✅ |
| getDayPillar | 4 | 4 | 0 | ✅ |
| getMonthPillar | 3 | 3 | 0 | ✅ |
| getHourPillar | 3 | 3 | 0 | ✅ |
| getNayin | 4 | 4 | 0 | ✅ |
| getSexagenaryIndexFast | 3 | 3 | 0 | ✅ |
| calculateElementStrength | 3 | 3 | 0 | ✅ |
| getFavoriteElement | 3 | 3 | 0 | ✅ |
| calculateBazi | 4 | 4 | 0 | ✅ |
| isValidDate | 5 | 5 | 0 | ✅ |
| **Total** | **36** | **36** | **0** | **✅** |

### Phase 9 — Lint 檢查 (2026-07-06)

| 類別 | 數量 | 狀態 |
|------|------|------|
| Errors | 0 | ✅ |
| Warnings | 131 | ⚠️ (prefer-const/no-unused-vars) |

### Git 提交記錄

```
789ef82 Fix lint errors (hasOwnProperty → Object.hasOwn)
51250ab Phase 8: PWA manifest + meta tags + GPU 提示
06d215c Phase 7: CSS 拆分 + DOM 快取優化
a9cab58 Phase 6: 長函數拆分 + 節氣快取 + 納音優化
74e2c8b Phase 5: 單元測試 (Vitest)
044cba9 Phase 2-4: ES Module + data/store/error modules
fbbc843 Phase 1: 基礎建設初始化
```
