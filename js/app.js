/**
 * app.js — 八字排盤 UI 互動邏輯（模組入口）
 * 處理表單輸入、曆法切換、結果渲染
 */

// 引入所有模組（觸發 window 向後相容賦值）
import './bazi.js';
import './lunming.js';
import './lunming2.js';
import './geju.js';
import './geju-ref.js';
import './data.js';
import './config.js';
import './store.js';
import './error.js';

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
        gender: document.getElementById('gender'),
        showAdvanced: document.getElementById('showAdvanced'),
        
        // 結果區
        resultArea: document.getElementById('resultArea'),
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
        
        // 預設填今天日期
        const today = new Date();
        el.birthYear.value = today.getFullYear();
        el.birthMonth.value = String(today.getMonth() + 1);
        updateDayOptions();
        el.birthDay.value = String(today.getDate());
    }

    // ============================================================
    // 日期下拉選單
    // ============================================================

    /** 年份範圍 */
    const YEAR_START = 1900;
    const YEAR_END = new Date().getFullYear() + 10; // 到未來10年

    function populateYears() {
        el.birthYear.innerHTML = '<option value="">— 年 —</option>';
        for (let y = YEAR_END; y >= YEAR_START; y--) {
            const opt = document.createElement('option');
            opt.value = y;
            // 民國年顯示
            const roc = y - 1911;
            opt.textContent = currentCalendar === 'western' 
                ? `${y} 年` 
                : `${y} 年 (民國 ${roc} 年)`;
            el.birthYear.appendChild(opt);
        }
    }

    function populateDays() {
        el.birthDay.innerHTML = '<option value="">— 日 —</option>';
        for (let d = 1; d <= 31; d++) {
            const opt = document.createElement('option');
            opt.value = d;
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
        currentCalendar = cal;
        
        // 更新按鈕狀態
        el.btnWestern.classList.toggle('active', cal === 'western');
        el.btnRoc.classList.toggle('active', cal === 'roc');
        el.btnWestern.setAttribute('aria-selected', cal === 'western');
        el.btnRoc.setAttribute('aria-selected', cal === 'roc');
        
        // 重新填入年份（顯示格式不同）
        populateYears();
    }

    function getWesternYear() {
        const yearVal = el.birthYear.value;
        if (!yearVal) return null;
        
        const year = parseInt(yearVal);
        if (currentCalendar === 'roc') {
            return year + 1911;
        }
        return year;
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
            if (el.showAdvanced.checked && window._lastResult) {
                renderAdvanced(window._lastResult);
            }
        });
        
        // 分頁切換
        el.tabBtns.forEach(btn => {
            btn.addEventListener('click', () => switchTab(btn.dataset.tab));
        });
        
        // 表單提交
        el.form.addEventListener('submit', handleSubmit);
        
        // 年份/月份雙擊快速回到今天
        el.birthYear.addEventListener('dblclick', () => {
            const today = new Date();
            el.birthYear.value = today.getFullYear();
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
            'geju': 'tabGeju',
            'gejuref': 'tabGejuRef'
        };
        const targetContentId = contentIdMap[tabId] || 'tab' + tabId.charAt(0).toUpperCase() + tabId.slice(1);
        el.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === targetContentId);
        });
        
        // 如果切換到論命頁，初始化論命內容
        if (tabId === 'lunming' && typeof renderLunming === 'function') {
            // 延遲一點讓過渡動畫執行
            setTimeout(() => renderLunming(window._lastResult), 100);
        }
        
        // 如果切換到論命二頁，渲染量化評分
        if (tabId === 'lunming2' && typeof renderLunming2 === 'function') {
            setTimeout(() => renderLunming2(window._lastResult), 100);
        }
        
        // 如果切換到格局頁，渲染格局分析
        if (tabId === 'geju') {
            setTimeout(() => {
                if (typeof renderGejuTab === 'function') {
                    renderGejuTab(window._lastResult);
                }
            }, 100);
        }
        
        // 如果切換到格局參考頁
        if (tabId === 'gejuref' && typeof window.renderGejuRef === 'function') {
            setTimeout(() => {
                window.renderGejuRef(el.gejuRefRoot);
            }, 50);
        }
    }

    // ============================================================
    // 表單提交處理
    // ============================================================
    
    function handleSubmit(e) {
        e.preventDefault();
        
        // 驗證
        const year = parseInt(el.birthYear.value);
        const month = parseInt(el.birthMonth.value);
        const day = parseInt(el.birthDay.value);
        
        if (!year || !month || !day) {
            alert('請選擇完整的出生年月日');
            return;
        }
        
        const westernYear = currentCalendar === 'roc' ? year + 1911 : year;
        
        if (!isValidDate(westernYear, month, day)) {
            alert('請輸入有效的日期');
            return;
        }
        
        // 顯示載入狀態
        showLoading();
        
        // 收集資料
        const hourVal = el.birthHour.value;
        const hour = hourVal ? parseInt(hourVal) : null;
        const gender = el.gender.value || null;
        
        // 使用 setTimeout 讓 UI 更新
        setTimeout(() => {
            try {
                // 計算八字
                const result = calculateBazi(westernYear, month, day, hour, gender);
                
                // 儲存結果供其他分頁使用
                window._lastResult = result;
                
                // 渲染結果
                renderResults(result);
                
                // 如果進階已勾選就渲染
                if (el.showAdvanced.checked) {
                    renderAdvanced(result);
                }
                
                // 顯示結果區
                el.resultArea.classList.remove('hidden');
                
                // 如果格局分頁有載入，預先運算格局供快速切換
                if (typeof window.determineGeju === 'function') {
                    try {
                        window._lastGejuResult = determineGeju(result);
                    } catch(e) {
                        console.warn('格局預算略過:', e.message);
                    }
                }
                
                // 若目前顯示的是格局分頁，自動更新
                if (el.tabGeju && el.tabGeju.classList.contains('active') && typeof renderGejuTab === 'function') {
                    renderGejuTab(result);
                }
                
                // 滾動到結果
                el.resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
            } catch (err) {
                console.error('八字計算錯誤:', err);
                alert('計算過程中發生錯誤，請確認輸入資料正確');
            }
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
    
    function getElementColorVar(element) {
        const map = {
            '木': '#2e7d32',
            '火': '#d32f2f',
            '土': '#8d6e3f',
            '金': '#bdbdbd',
            '水': '#1565c0'
        };
        return map[element] || '#666';
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
        
        // 確認格局引擎已載入
        const gejuFunc = (typeof window.determineGeju === 'function') ? window.determineGeju : null;
        const renderFunc = (typeof window.renderGeju === 'function') ? window.renderGeju : null;
        
        if (!gejuFunc) {
            root.innerHTML = `
                <div class="card">
                    <div class="card-title">格 局 判 定</div>
                    <div style="text-align:center;padding:30px;color:var(--fire);">
                        格局引擎尚未載入（geju.js），請重新整理頁面。
                    </div>
                </div>
            `;
            return;
        }
        
        // 嘗試使用已快取的格局結果
        if (window._lastGejuResult && window._lastResult === baziResult) {
            if (renderFunc) {
                renderFunc(window._lastGejuResult, root);
                return;
            }
        }
        
        // 使用格局引擎分析（含錯誤處理）
        try {
            const gejuResult = gejuFunc(baziResult);
            window._lastGejuResult = gejuResult;
            
            if (renderFunc) {
                renderFunc(gejuResult, root);
            } else {
                root.innerHTML = `
                    <div class="card">
                        <div class="card-title">格 局 判 定</div>
                        <div style="text-align:center;padding:30px;color:var(--fire);">
                            渲染函數未定義（renderGeju），請重新整理頁面。
                        </div>
                    </div>
                `;
            }
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
