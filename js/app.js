/**
 * app.js — 八字排盤 UI 互動邏輯（模組入口）
 * 處理表單輸入、曆法切換、結果渲染
 */

// 顯式 import 所需模組與常數（消除隱式全域依賴）
import {
    ELEMENT_COLORS,
    STEM_ELEMENT_ARRAY as STEM_ELEMENT,
    BRANCH_ELEMENT_ARRAY as BRANCH_ELEMENT,
    STEM_YIN_YANG,
    BRANCH_YIN_YANG,
    ELEMENT_CYCLE,
    ELEMENT_COLOR_VALUES
} from './data.js';
import { YEAR_SELECT_START, YEAR_SELECT_END_OFFSET } from './config.js';
import { appStore } from './store.js';
import { safeExecute, isValidDate, ErrorType } from './error.js';
import { calculateBazi } from './bazi.js';
import { renderLunming } from './lunming.js';
import { renderLunming2 } from './lunming2.js';
import { determineGeju, renderGeju } from './geju.js';
import { renderGejuRef } from './geju-ref.js';
import { renderLiunian } from './liunian.js';

// ============================================================
// DOM 引用與狀態
// ============================================================
    
    const el = {
        // 曆法切換
        btnWestern: document.getElementById('btnWestern'),
        btnRoc: document.getElementById('btnRoc'),
        
        // 表單
        form: document.getElementById('baziForm'),
        birthYear: document.getElementById('birthYear'),
        birthMonth: document.getElementById('birthMonth'),
        birthDay: document.getElementById('birthDay'),
        birthHour: document.getElementById('birthHour'),
        lateZi: document.getElementById('lateZi'),
        gender: document.getElementById('gender'),
        showAdvanced: document.getElementById('showAdvanced'),
        copyBtn: document.getElementById('copyShare'),
        printBtn: document.getElementById('printBtn'),
        copyToast: document.getElementById('copyToast'),
        
        // 結果區
        resultArea: document.getElementById('resultArea'),
        errorBanner: document.getElementById('errorBanner'),
        dayMasterContent: document.getElementById('dayMasterContent'),
        pillarsContent: document.getElementById('pillarsContent'),
        elementContent: document.getElementById('elementContent'),
        favoriteContent: document.getElementById('favoriteContent'),
        hiddenStemContent: document.getElementById('hiddenStemContent'),
        tenGodTableContent: document.getElementById('tenGodTableContent'),
        luckContent: document.getElementById('luckContent'),
        summaryContent: document.getElementById('summaryContent'),
        
        // 進階區
        advancedArea: document.getElementById('advancedArea'),
        
        // 分頁
        tabBtns: document.querySelectorAll('.tab-btn'),
        tabContents: document.querySelectorAll('.tab-content'),
        tabGeju: document.getElementById('tabGeju'),
        gejuRoot: document.getElementById('gejuRoot'),
        lunmingRoot: document.getElementById('lunmingRoot'),
        lunming2Root: document.getElementById('lunming2Root'),
        liunianRoot: document.getElementById('liunianRoot'),
        gejuRefRoot: document.getElementById('gejuRefRoot'),
    };

    let currentCalendar = 'western'; // 'western' | 'roc'

    // ============================================================
    // 初始化
    // ============================================================
    
    function init() {
        populateYears();
        populateDays();
        updateDayOptions();
        bindEvents();
        initTabs();

        // 預設填今天日期（value 一律字串，確保與 option.value 比對成功並正確顯示）
        const today = new Date();
        el.birthYear.value = String(today.getFullYear());
        el.birthMonth.value = String(today.getMonth() + 1);
        updateDayOptions();
        el.birthDay.value = String(today.getDate());

        // 分享連結（URL 參數）優先；否則還原 localStorage（F3 / F4）
        let autoCalc = false;
        if (applyShareParams()) {
            autoCalc = true;
        } else {
            autoCalc = restoreState();
        }

        // 若有有效輸入則自動重算並顯示（刷新不丟失）
        if (autoCalc) {
            const y = parseInt(el.birthYear.value);
            const m = parseInt(el.birthMonth.value);
            const d = parseInt(el.birthDay.value);
            if (y && m && d) {
                handleSubmit();
            }
        }
    }

    // ============================================================
    // 日期下拉選單
    // ============================================================

    /** 年份範圍（取自 config.js） */
    const YEAR_END = new Date().getFullYear() + YEAR_SELECT_END_OFFSET;

    /**
     * 填入年份選項。
     * option.value 一律為西元年；民國曆僅改變顯示文字，不改 value。
     * @param {number|string|null} [preserveYear] 重建後要還原的西元年
     */
    function populateYears(preserveYear) {
        const prev = preserveYear != null && preserveYear !== ''
            ? String(preserveYear)
            : (el.birthYear.value || '');

        el.birthYear.innerHTML = '<option value="">— 年 —</option>';
        for (let y = YEAR_END; y >= YEAR_SELECT_START; y--) {
            const opt = document.createElement('option');
            opt.value = String(y);
            // 民國年僅改顯示：value 仍是西元年，避免切換後 +1911 誤算
            const roc = y - 1911;
            if (currentCalendar === 'western') {
                opt.textContent = `${y} 年`;
            } else {
                opt.textContent = roc > 0
                    ? `民國 ${roc} 年（${y}）`
                    : `${y} 年`;
            }
            el.birthYear.appendChild(opt);
        }

        if (prev && el.birthYear.querySelector(`option[value="${prev}"]`)) {
            el.birthYear.value = prev;
        }
    }

    function populateDays() {
        el.birthDay.innerHTML = '<option value="">— 日 —</option>';
        for (let d = 1; d <= 31; d++) {
            const opt = document.createElement('option');
            opt.value = String(d);
            opt.textContent = `${d} 日`;
            el.birthDay.appendChild(opt);
        }
    }

    function updateDayOptions() {
        const year = parseInt(el.birthYear.value);
        const month = parseInt(el.birthMonth.value);
        
        if (!year || !month) return;
        
        // 取得該月天數
        const daysInMonth = new Date(year, month, 0).getDate();
        const currentDay = parseInt(el.birthDay.value);
        
        // 顯示/隱藏選項
        const options = el.birthDay.querySelectorAll('option');
        options.forEach(opt => {
            if (!opt.value) return;
            const day = parseInt(opt.value);
            opt.hidden = day > daysInMonth;
        });
        
        // 如果目前選的日期超過最大天數，自動調整
        if (currentDay > daysInMonth) {
            el.birthDay.value = String(daysInMonth);
        }
    }

    // ============================================================
    // 曆法切換
    // ============================================================
    
    function switchCalendar(cal) {
        // 切換前記住西元年（value 始終是西元），避免 rebuild 後選項被清空
        const selectedWestern = el.birthYear.value;
        currentCalendar = cal;

        // 更新按鈕狀態
        el.btnWestern.classList.toggle('active', cal === 'western');
        el.btnRoc.classList.toggle('active', cal === 'roc');
        el.btnWestern.setAttribute('aria-selected', cal === 'western');
        el.btnRoc.setAttribute('aria-selected', cal === 'roc');

        // 重新填入年份（僅顯示格式不同；還原已選西元年）
        populateYears(selectedWestern);
        updateDayOptions();
    }

    /**
     * 取得表單選定的西元年。
     * birthYear option.value 一律存西元年，與目前曆法顯示模式無關。
     */
    function getWesternYear() {
        const yearVal = el.birthYear.value;
        if (!yearVal) return null;
        const year = parseInt(yearVal, 10);
        return Number.isFinite(year) ? year : null;
    }

    // ============================================================
    // 事件綁定
    // ============================================================
    
    function bindEvents() {
        // 曆法切換
        el.btnWestern.addEventListener('click', () => switchCalendar('western'));
        el.btnRoc.addEventListener('click', () => switchCalendar('roc'));
        
        // 年月變更 → 更新日期選項
        el.birthYear.addEventListener('change', updateDayOptions);
        el.birthMonth.addEventListener('change', updateDayOptions);
        
        // 進階資訊切換
        el.showAdvanced.addEventListener('change', () => {
            el.advancedArea.classList.toggle('hidden', !el.showAdvanced.checked);
            // 如果有資料則重新渲染進階資訊
            const last = appStore.getBaziResult();
            if (el.showAdvanced.checked && last) {
                renderAdvanced(last);
            }
        });
        
        // 分頁切換
        el.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });
        
        // 表單提交
        el.form.addEventListener('submit', handleSubmit);

        // 複製分享連結（F3）
        if (el.copyBtn) {
            el.copyBtn.addEventListener('click', copyShareLink);
        }

        // 列印命盤（F5）
        if (el.printBtn) {
            el.printBtn.addEventListener('click', () => window.print());
        }

        // 分頁鍵盤無障礙：左右方向鍵導覽（F6）
        const nav = document.querySelector('.tab-nav');
        if (nav) {
            nav.addEventListener('keydown', (e) => {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                const tabs = Array.from(el.tabBtns);
                const idx = tabs.findIndex((b) => b.classList.contains('active'));
                if (idx < 0) return;
                const next = e.key === 'ArrowRight'
                    ? (idx + 1) % tabs.length
                    : (idx - 1 + tabs.length) % tabs.length;
                tabs[next].focus();
                tabs[next].click();
                e.preventDefault();
            });
        }

        // 年份/月份雙擊快速回到今天
        el.birthYear.addEventListener('dblclick', () => {
            const today = new Date();
            el.birthYear.value = String(today.getFullYear());
            updateDayOptions();
        });
    }

    /** 初始化分頁 */
    function initTabs() {
        // 預設顯示排盤
        switchTab('paipan');
    }

    /** 切換分頁 */
    function switchTab(tabId) {
        // 更新按鈕狀態
        el.tabBtns.forEach(btn => {
            const isActive = btn.dataset.tab === tabId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-selected', isActive);
        });
        
        // 更新內容區（tabId → content ID 對照）
        const contentIdMap = {
            'paipan': 'tabPaipan',
            'lunming': 'tabLunming',
            'lunming2': 'tabLunming2',
            'liunian': 'tabLiunian',
            'geju': 'tabGeju',
            'gejuref': 'tabGejuRef'
        };
        const targetContentId = contentIdMap[tabId] || 'tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1);
        el.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === targetContentId);
        });
        
        // 由 store 取得最新八字結果，直接呼叫已 import 的渲染函數（移除 setTimeout hack）
        const last = appStore.getBaziResult();

        if (tabId === 'lunming') {
            renderLunming(last);
        }

        if (tabId === 'lunming2') {
            renderLunming2(last);
        }

        if (tabId === 'liunian') {
            renderLiunian(last, el.liunianRoot);
        }

        if (tabId === 'geju') {
            renderGejuTab(last);
        }

        if (tabId === 'gejuref') {
            renderGejuRef(el.gejuRefRoot);
        }
    }

    // ============================================================
    // 表單提交處理
    // ============================================================
    
    function handleSubmit(e) {
        if (e) e.preventDefault();
        clearError();

        const westernYear = getWesternYear();
        const month = parseInt(el.birthMonth.value, 10);
        const day = parseInt(el.birthDay.value, 10);

        if (!westernYear || !month || !day) {
            showError('請選擇完整的出生年月日');
            return;
        }

        if (!isValidDate(westernYear, month, day)) {
            showError('請輸入有效的日期');
            return;
        }

        // 時辰（晚子時：23:00-23:59 計入次日）
        const hourVal = el.birthHour.value;
        const hour = hourVal ? parseInt(hourVal) : null;
        const gender = el.gender.value || null;

        // 計算實際西元年月日（含晚子時跨日）
        let y = westernYear, m = month, d = day;
        if (el.lateZi && el.lateZi.checked && hour === 23) {
            const dt = new Date(westernYear, month - 1, day + 1);
            y = dt.getFullYear();
            m = dt.getMonth() + 1;
            d = dt.getDate();
        }

        // 暫存輸入（localStorage），重新整理自動還原
        saveState({
            year: westernYear, month, day, hour, gender,
            calendar: currentCalendar, advanced: el.showAdvanced.checked,
            lateZi: !!(el.lateZi && el.lateZi.checked)
        });

        showLoading();
        runCalculation(y, m, d, hour, gender);
    }

    /** 實際計算 + 渲染 + 集中式狀態更新（分享連結 / localStorage 還原共用） */
    function runCalculation(westernYear, month, day, hour, gender) {
        // 使用 setTimeout 讓載入狀態先繪製
        setTimeout(() => {
            const result = safeExecute(
                () => calculateBazi(westernYear, month, day, hour, gender),
                {
                    errorType: ErrorType.CALCULATION,
                    errorMessage: '八字計算失敗',
                    onError: (appErr) => showError(appErr.getUserMessage())
                }
            );
            if (!result) return;

            // 集中式狀態（取代 window._lastResult）
            appStore.setBaziResult(result);

            // 渲染結果
            renderResults(result);
            if (el.showAdvanced.checked) renderAdvanced(result);
            el.resultArea.classList.remove('hidden');

            // 預先運算格局，供快速切換（失敗僅記錄）
            safeExecute(
                () => appStore.setGejuResult(determineGeju(result)),
                { onError: (err) => console.warn('格局預算略過:', err.message) }
            );

            if (el.tabGeju && el.tabGeju.classList.contains('active')) {
                renderGejuTab(result);
            }
            el.resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }

    function showLoading() {
        el.resultArea.classList.remove('hidden');
        const loadingHTML = '<div class="loading">命盤計算中</div>';
        el.dayMasterContent.innerHTML = loadingHTML;
        el.pillarsContent.innerHTML = '';
        el.elementContent.innerHTML = '';
        el.favoriteContent.innerHTML = '';
        el.hiddenStemContent.innerHTML = '';
        el.tenGodTableContent.innerHTML = '';
        el.luckContent.innerHTML = '';
        el.summaryContent.innerHTML = '';
    }

    // ============================================================
    // 結果渲染
    // ============================================================
    
    function renderResults(result) {
        renderDayMaster(result);
        renderPillars(result);
        renderElementStrength(result);
        renderFavoriteElement(result);
        renderLuck(result);
        renderSummary(result);
    }

    /** 日主 */
    function renderDayMaster(result) {
        const dm = result.dayMaster;
        const elClass = ELEMENT_COLORS[dm.element];
        
        el.dayMasterContent.innerHTML = `
            <div class="day-master-box">
                <div class="day-master-stem ${elClass}">${dm.stem}${dm.branch}</div>
                <div class="day-master-info">
                    <span class="label">日主五行</span>
                    <span class="value ${elClass}">${dm.element}（${dm.yinyang}${dm.element}）</span>
                    <span class="label" style="margin-top:6px;">生肖</span>
                    <span class="value">${result.zodiac}</span>
                    ${result.hourPeriod ? `<span class="label" style="margin-top:6px;">出生時辰</span><span class="value">${result.hourPeriod}</span>` : ''}
                </div>
            </div>
        `;
    }

    /** 四柱八字 */
    function renderPillars(result) {
        const pillarNames = ['年柱', '月柱', '日柱', '時柱'];
        
        let html = '<div class="bazi-display">';
        
        result.pillars.forEach((pillar, i) => {
            const stemElClass = ELEMENT_COLORS[STEM_ELEMENT[pillar.stemIndex]];
            const branchElClass = ELEMENT_COLORS[BRANCH_ELEMENT[pillar.branchIndex]];
            
            html += `
                <div class="pillar-card">
                    <div class="pillar-name">${pillar.name}</div>
                    <div class="pillar-stem ${stemElClass}">${pillar.stem}</div>
                    <div class="pillar-branch ${branchElClass}">${pillar.branch}</div>
                    <div class="pillar-element bg-element-${STEM_ELEMENT[pillar.stemIndex]}">
                        ${STEM_ELEMENT[pillar.stemIndex]}
                    </div>
                    <div class="pillar-ten-god">${pillar.tenGod || ''}</div>
                    <div class="pillar-nayin">${pillar.nayin || ''}</div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // 八字總覽字串
        const pillarStr = result.pillars.map(p => `${p.stem}${p.branch}`).join(' ');
        html += `<div style="text-align:center;margin-top:8px;padding:10px;background:var(--bg);border-radius:6px;font-size:1.1rem;letter-spacing:4px;font-weight:600;color:var(--secondary-light);">${pillarStr}</div>`;
        
        el.pillarsContent.innerHTML = html;
    }

    /** 五行強度 */
    function renderElementStrength(result) {
        const es = result.elementStrength;
        const maxVal = Math.max(...Object.values(es.weighted), 1);
        
        let html = '<div class="element-bars">';
        
        ELEMENT_CYCLE.forEach(elName => {
            const val = es.weighted[elName] || 0;
            const pct = Math.round((val / maxVal) * 100);
            const colorVar = getElementColorVar(elName);
            
            html += `
                <div class="element-bar-row">
                    <div class="element-bar-label ${ELEMENT_COLORS[elName]}">${elName}</div>
                    <div class="element-bar-track">
                        <div class="element-bar-fill" style="width:${pct}%;background:${colorVar};">
                            <span class="element-bar-value">${val.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        
        // 身強身弱判斷
        const fe = result.favoriteElement;
        let statusHTML = '';
        if (fe.isStrong) {
            statusHTML = `<span style="color:var(--fire);font-weight:600;">身強格局</span> — 日主${fe.dayElement}旺盛，宜剋洩耗`;
        } else if (fe.isWeak) {
            statusHTML = `<span style="color:var(--water);font-weight:600;">身弱格局</span> — 日主${fe.dayElement}衰弱，宜生扶`;
        } else {
            statusHTML = `<span style="color:var(--secondary-light);font-weight:600;">中和格局</span> — 五行相對平衡`;
        }
        
        html += `<div style="margin-top:12px;padding:10px;background:var(--bg);border-radius:6px;font-size:0.9rem;">格局判斷：${statusHTML}</div>`;
        
        el.elementContent.innerHTML = html;
    }

    /** 喜用神/忌神 */
    function renderFavoriteElement(result) {
        const fe = result.favoriteElement;
        
        const favHTML = fe.favorite.map(el => 
            `<span class="${ELEMENT_COLORS[el]}" style="font-size:1.8rem;font-weight:700;">${el}</span>`
        ).join(' ');
        
        const unfavHTML = fe.unfavorite.map(el => 
            `<span class="${ELEMENT_COLORS[el]}" style="font-size:1.8rem;font-weight:700;opacity:0.6;">${el}</span>`
        ).join(' ');
        
        el.favoriteContent.innerHTML = `
            <div class="favorite-box">
                <div class="favorite-item favorite">
                    <div class="label">✓ 喜用神</div>
                    <div class="elements">${favHTML}</div>
                    <div class="desc">宜補強這些五行能量</div>
                </div>
                <div class="favorite-item unfavorite">
                    <div class="label">✗ 忌神</div>
                    <div class="elements">${unfavHTML}</div>
                    <div class="desc">宜避免過多這些五行能量</div>
                </div>
            </div>
            <div class="analysis-text">${fe.analysis}</div>
            <div style="margin-top:8px;font-size:0.9rem;color:var(--text-muted);">
                💡 ${fe.advice}
            </div>
        `;
    }

    /** 大運 */
    function renderLuck(result) {
        if (!result.greatLuck) {
            el.luckContent.innerHTML = `
                <div style="padding:12px 0;color:var(--text-muted);font-size:0.9rem;">
                    請選擇性別以顯示大運資訊。
                </div>
            `;
            return;
        }
        
        const gl = result.greatLuck;
        
        if (gl.error) {
            el.luckContent.innerHTML = `<div style="padding:12px 0;color:var(--text-muted);">${gl.error}</div>`;
            return;
        }
        
        let html = `
            <div style="margin-bottom:12px;font-size:0.9rem;color:var(--text-muted);">
                起運：<strong style="color:var(--text);">${gl.startAge} 歲</strong> 
                （約 ${gl.startYear} 年起運）
                · 排運方向：${gl.isForward ? '順行' : '逆行'}
                · ${gl.isYangYear ? '陽' : '陰'}年
            </div>
            <table class="luck-table">
                <thead>
                    <tr>
                        <th>大運</th>
                        <th>年齡</th>
                        <th>年份</th>
                        <th>運勢特質</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        gl.luckCycles.forEach((luck, i) => {
            const years = `${luck.ageStart}~${luck.ageEnd}歲`;
            const startYear = result.input.year + luck.ageStart;
            const endYear = result.input.year + luck.ageEnd;
            html += `
                <tr>
                    <td style="font-weight:600;color:var(--secondary-light);">第${luck.index}運</td>
                    <td>${years}</td>
                    <td>${startYear}~${endYear}</td>
                    <td style="font-size:0.8rem;color:var(--text-muted);">${luck.name}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        
        el.luckContent.innerHTML = html;
    }

    /** 進階資訊（藏干、十神表） */
    function renderAdvanced(result) {
        // 藏干
        renderHiddenStems(result);
        // 十神表
        renderTenGodTable(result);
    }

    /** 藏干 */
    function renderHiddenStems(result) {
        const pillarNames = ['年柱', '月柱', '日柱', '時柱'];
        
        let html = '';
        
        result.pillars.forEach((pillar, i) => {
            const branch = pillar.branch;
            const hidden = pillar.hiddenStems || [];
            
            html += `
                <div style="margin-bottom:16px;">
                    <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:6px;">
                        ${pillar.name} · 地支 <strong style="color:var(--text);font-size:1.1rem;">${branch}</strong> 藏干
                    </div>
                    <div class="hidden-stems">
            `;
            
            if (hidden.length === 0) {
                html += `<span style="color:var(--text-muted);font-size:0.85rem;">無藏干</span>`;
            } else {
                hidden.forEach(h => {
                    const elClass = ELEMENT_COLORS[STEM_ELEMENT[h.stemIndex]];
                    html += `
                        <div class="hidden-stem-item">
                            <span class="hidden-stem-char ${elClass}">${h.stem}</span>
                            <span class="hidden-stem-ten-god">${h.tenGod}</span>
                            <span class="hidden-stem-badge">${h.isMain ? '本氣' : '餘氣'}</span>
                        </div>
                    `;
                });
            }
            
            html += `
                    </div>
                </div>
            `;
        });
        
        el.hiddenStemContent.innerHTML = html;
    }

    /** 十神總表 */
    function renderTenGodTable(result) {
        const dm = result.dayMaster;
        const pillarNames = ['年柱', '月柱', '日柱', '時柱'];
        
        let html = `
            <div style="margin-bottom:10px;font-size:0.85rem;color:var(--text-muted);">
                以 <strong style="color:var(--secondary-light);font-size:1rem;">${dm.stem}${dm.branch}（${dm.element}）</strong> 為日主，對各柱天干的十神關係
            </div>
            <table class="ten-god-table">
                <thead>
                    <tr>
                        <th>四柱</th>
                        <th>天干</th>
                        <th>五行</th>
                        <th>陰陽</th>
                        <th>十神</th>
                        <th>納音</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        result.pillars.forEach((pillar, i) => {
            const elClass = ELEMENT_COLORS[STEM_ELEMENT[pillar.stemIndex]];
            const yinYang = STEM_YIN_YANG[pillar.stemIndex] === 0 ? '陽' : '陰';
            html += `
                <tr>
                    <td style="font-weight:600;">${pillar.name}</td>
                    <td style="font-size:1.3rem;font-weight:600;" class="${elClass}">${pillar.stem}</td>
                    <td>${STEM_ELEMENT[pillar.stemIndex]}</td>
                    <td>${yinYang}</td>
                    <td style="font-weight:600;color:var(--secondary-light);">${pillar.tenGod || '—'}</td>
                    <td style="font-size:0.85rem;color:var(--text-muted);">${pillar.nayin || '—'}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        
        // 地支五行
        html += `
            <div style="margin-top:14px;font-size:0.85rem;color:var(--text-muted);margin-bottom:6px;">
                四柱地支五行
            </div>
            <table class="ten-god-table">
                <thead>
                    <tr>
                        <th>四柱</th>
                        <th>地支</th>
                        <th>五行</th>
                        <th>陰陽</th>
                        <th>藏干本氣</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        result.pillars.forEach((pillar, i) => {
            const elClass = ELEMENT_COLORS[BRANCH_ELEMENT[pillar.branchIndex]];
            const yinYang = BRANCH_YIN_YANG[pillar.branchIndex] === 0 ? '陽' : '陰';
            const hidden = pillar.hiddenStems || [];
            const mainStem = hidden.length > 0 ? hidden[0].stem : '—';
            
            html += `
                <tr>
                    <td style="font-weight:600;">${pillar.name}</td>
                    <td style="font-size:1.3rem;font-weight:600;" class="${elClass}">${pillar.branch}</td>
                    <td>${BRANCH_ELEMENT[pillar.branchIndex]}</td>
                    <td>${yinYang}</td>
                    <td style="font-size:1rem;">${mainStem}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        
        el.tenGodTableContent.innerHTML = html;
    }

    /** 綜合摘要 */
    function renderSummary(result) {
        el.summaryContent.innerHTML = `<div class="summary-box">${result.summary}</div>`;
    }

    // ============================================================
    // 工具函數
    // ============================================================
    
    /** 取得五行顏色值（改讀 data.js.ELEMENT_COLOR_VALUES，消除重複色表） */
    function getElementColorVar(element) {
        return ELEMENT_COLOR_VALUES[element] || '#666';
    }

    /** 顯示頁內錯誤條（取代 alert） */
    function showError(message) {
        if (!el.errorBanner) return;
        el.errorBanner.textContent = message;
        el.errorBanner.classList.remove('hidden');
        el.errorBanner.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /** 清除頁內錯誤條 */
    function clearError() {
        if (!el.errorBanner) return;
        el.errorBanner.textContent = '';
        el.errorBanner.classList.add('hidden');
    }

    // ===========================================================
    // 分享連結 / localStorage 還原 / 列印（F3 / F4 / F5）
    // ===========================================================

    const STORAGE_KEY = 'baziai:last-input';

    /** 暫存最後一次輸入（F4） */
    function saveState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) {
            // localStorage 不可用例外忽略（隱私模式等）
        }
    }

    /** 從 localStorage 還原輸入；成功回傳 true（F4） */
    function restoreState() {
        let saved;
        try {
            saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        } catch (e) {
            saved = null;
        }
        if (!saved) return false;
        // 先切曆法再寫年份，避免 rebuild 選項時丟失（saved.year 為西元年）
        if (saved.calendar === 'roc') switchCalendar('roc');
        if (typeof saved.year === 'number') el.birthYear.value = String(saved.year);
        if (typeof saved.month === 'number') el.birthMonth.value = String(saved.month);
        if (typeof saved.day === 'number') el.birthDay.value = String(saved.day);
        if (typeof saved.hour === 'number') el.birthHour.value = String(saved.hour);
        if (typeof saved.gender === 'string') el.gender.value = saved.gender;
        if (el.showAdvanced) el.showAdvanced.checked = !!saved.advanced;
        if (el.lateZi) el.lateZi.checked = !!saved.lateZi;
        updateDayOptions();
        return !!(saved.year && saved.month && saved.day);
    }

    /** 由 URL query 解碼分享參數並自動填入；成功回傳 true（F3） */
    function applyShareParams() {
        const params = new URLSearchParams(window.location.search);
        if (!params.has('y') || !params.has('m') || !params.has('d')) return false;
        const y = parseInt(params.get('y'), 10);
        const m = parseInt(params.get('m'), 10);
        const d = parseInt(params.get('d'), 10);
        if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return false;

        // 先切曆法再寫年份（y 為西元年）
        if (params.get('cal') === 'roc') switchCalendar('roc');
        el.birthYear.value = String(y);
        el.birthMonth.value = String(m);
        el.birthDay.value = String(d);
        const h = params.get('h');
        if (h !== null) el.birthHour.value = h;
        const g = params.get('g');
        if (g === 'male' || g === 'female') el.gender.value = g;
        if (params.get('adv') === '1' && el.showAdvanced) el.showAdvanced.checked = true;
        if (params.get('lz') === '1' && el.lateZi) el.lateZi.checked = true;
        updateDayOptions();
        return true;
    }

    /** 由目前表單建立分享連結（F3） */
    function buildShareUrl() {
        const year = getWesternYear();
        const month = parseInt(el.birthMonth.value, 10);
        const day = parseInt(el.birthDay.value, 10);
        if (!year || !month || !day) return null;
        const p = new URLSearchParams();
        p.set('y', year);
        p.set('m', month);
        p.set('d', day);
        const h = el.birthHour.value;
        if (h) p.set('h', h);
        const g = el.gender.value;
        if (g) p.set('g', g);
        p.set('cal', currentCalendar);
        if (el.showAdvanced && el.showAdvanced.checked) p.set('adv', '1');
        if (el.lateZi && el.lateZi.checked) p.set('lz', '1');
        const base = window.location.origin + window.location.pathname;
        return `${base}?${p.toString()}`;
    }

    /** 複製分享連結到剪貼簿（F3） */
    function copyShareLink() {
        const url = buildShareUrl();
        if (!url) {
            showError('請先填入出生年月日再產生分享連結');
            return;
        }
        const done = () => showToast('分享連結已複製到剪貼簿');
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done).catch(() => fallbackCopy(url, done));
        } else {
            fallbackCopy(url, done);
        }
    }

    function fallbackCopy(text, done) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { showError('無法複製，請手動複製網址'); }
        document.body.removeChild(ta);
    }

    /** 暫時提示（複製成功等） */
    let toastTimer = null;
    function showToast(message) {
        if (!el.copyToast) return;
        el.copyToast.textContent = message;
        el.copyToast.classList.remove('hidden');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.copyToast.classList.add('hidden'), 2200);
    }

    // ============================================================
    // 格局分頁（Geju）渲染
    // ============================================================
    
    /** 渲染格局分析 */
    function renderGejuTab(baziResult) {
        const root = el.gejuRoot;
        if (!root) return;
        
        if (!baziResult || !baziResult.pillars || baziResult.pillars.length < 3) {
            root.innerHTML = `
                <div class="card">
                    <div class="card-title">格 局 判 定</div>
                    <div style="text-align:center;padding:30px;color:var(--text-muted);">
                        尚無八字資料。請先於「排盤」頁籤輸入出生資料並計算八字。
                    </div>
                </div>
            `;
            return;
        }
        
        // 使用已 import 的格局引擎（不再依賴 window 全域）
        // 若 store 已有該結果則直接複用，否則運算
        const cachedGeju = appStore.getGejuResult();
        try {
            const gejuResult = cachedGeju || determineGeju(baziResult);
            if (!cachedGeju) {
                appStore.setGejuResult(gejuResult);
            }
            renderGeju(gejuResult, root);
        } catch (err) {
            console.error('格局分析錯誤:', err);
            root.innerHTML = `
                <div class="card">
                    <div class="card-title">格 局 判 定</div>
                    <div style="text-align:center;padding:30px;color:var(--fire);">
                        格局分析發生錯誤：${err.message}<br>
                        <span style="font-size:0.8rem;color:var(--text-muted);">請確認已正確排盤後再試</span>
                    </div>
                </div>
            `;
        }
    }

    // ============================================================
    // 啟動
    // ============================================================
    
    document.addEventListener('DOMContentLoaded', init);

// 匯出公開介面供除錯用
export { init, switchTab, handleSubmit };
export default { init, switchTab, handleSubmit, renderResults, el };
