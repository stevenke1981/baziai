/**
 * liunian.js — 流年對命主影響分析
 *
 * 依日主推算每一年流年干支、十神、地支刑冲合害，
 * 並結合喜用神給出影響說明（僅供參考娛樂）。
 */

import {
    STEMS,
    BRANCHES,
    STEM_ELEMENT_ARRAY,
    BRANCH_ELEMENT_ARRAY,
    ELEMENT_COLORS,
    ELEMENT_COLOR_VALUES
} from './data.js';
import { getTenGod, getNayin } from './bazi.js';
import { analyzeGanZhiInteractions, getBranchInteractions as getSharedBranchInteractions } from './interactions.js';

// ============================================================
// 十神流年說明
// ============================================================

/** 十神 → 流年影響說明 */
export const TEN_GOD_LIUNIAN = {
    比肩: {
        level: '中',
        tone: 'neutral',
        summary: '比肩年：競爭與自立並存',
        detail: '流年天干與日主同性同氣，易遇同輩競爭、合夥或手足事務。利於自立開創，亦須防資源被分、意見不合。人際上宜明定界線、量力而為。'
    },
    劫財: {
        level: '慎',
        tone: 'caution',
        summary: '劫財年：破耗與爭奪較明顯',
        detail: '流年與日主異性同氣，財氣易被分、消費衝動或突發支出較多。亦利於爭取機會、拓展人脈，但須謹慎借貸、合夥與投機。感情上易有爭風吃醋。'
    },
    食神: {
        level: '吉',
        tone: 'good',
        summary: '食神年：才藝發揮、生活較從容',
        detail: '流年洩秀有情，利於學習、創作、口才與飲食享受。思緒較開朗，適合展現專業與品味。注意勿過於安逸或口腹之欲過甚而影響健康。'
    },
    傷官: {
        level: '慎',
        tone: 'caution',
        summary: '傷官年：創意強、口舌與叛逆亦強',
        detail: '流年才華外露、求新求變，利於技術突破與表達，但易言語傷人、頂撞權威或官司是非。宜低調務實，少公開批評，避免衝動決策。'
    },
    正財: {
        level: '吉',
        tone: 'good',
        summary: '正財年：穩定進財、務實經營',
        detail: '流年主正當收入、勤奮得財，利於正職加薪、穩健投資與置產規劃。感情上已婚者較顧家。忌過度吝嗇或為小利失大義。'
    },
    偏財: {
        level: '吉',
        tone: 'good',
        summary: '偏財年：橫財機會與人緣財',
        detail: '流年主流動之財、商業機會與交際應酬，利於業務、投資與貴人牽線。但財來財去快，宜控風險、勿貪高報酬承諾。感情上桃花較旺。'
    },
    正官: {
        level: '吉',
        tone: 'good',
        summary: '正官年：責任、名位與規範',
        detail: '流年主升遷考核、職位責任與社會名聲，利於考試、公職與制度內發展。行事須守規矩，忌違法與背信。壓力感可能上升，宜規律作息。'
    },
    七殺: {
        level: '慎',
        tone: 'caution',
        summary: '七殺年：壓力挑戰與突破並存',
        detail: '流年主競爭、壓迫與非常之事，利於突破困境、軍警醫護或創業衝刺，但身心負荷較大。宜化壓力為動力，避免硬碰硬與無謂爭執。'
    },
    正印: {
        level: '吉',
        tone: 'good',
        summary: '正印年：貴人學習與守護',
        detail: '流年主學業進修、文書證書與長輩貴人提攜，利於進修、考照與療養。身心較得滋養，亦須防懶散依賴、思慮過多而延誤行動。'
    },
    偏印: {
        level: '中',
        tone: 'neutral',
        summary: '偏印年：偏門智慧與孤獨感',
        detail: '流年利於研究、術數、技術鑽研與另類思維，靈感多但情緒易孤僻。適合深造與幕後工作，忌多疑、自我封閉或旁門左道誘惑。'
    }
};

const TEN_GOD_FOCUS = {
    比肩: [
        '職涯：適合獨立承擔、建立個人品牌；合作先分清權責。',
        '財務：同儕競爭增加，避免人情支出與重複投資。',
        '關係：尊重彼此自主，少用輸贏心處理親密議題。'
    ],
    劫財: [
        '職涯：搶機會要快，但合夥條款與分潤務必白紙黑字。',
        '財務：保留緊急預備金，借貸、擔保與高槓桿宜審慎。',
        '關係：社交活躍，注意第三方意見與比較心干擾。'
    ],
    食神: [
        '職涯：利作品輸出、教學、提案與長期能力變現。',
        '財務：可從專業與興趣開源，避免過度享樂侵蝕結餘。',
        '關係：溝通柔和，適合安排共同體驗與修復氣氛。'
    ],
    傷官: [
        '職涯：改革與表達力強，挑戰制度前先準備替代方案。',
        '財務：創新收入有機會，但稅務、合約與法規不能省略。',
        '關係：直言易傷人，先確認對方需要建議還是傾聽。'
    ],
    正財: [
        '職涯：重流程、績效與穩定交付，累積可信任的成果。',
        '財務：適合預算、儲蓄與穩健配置，勿因短利犧牲品質。',
        '關係：以實際承諾表達在乎，也要保留情感交流。'
    ],
    偏財: [
        '職涯：利業務、跨界與資源媒合，機會多時更要篩選。',
        '財務：現金流速度快，先訂停利停損與單筆風險上限。',
        '關係：人緣提升，清楚界定曖昧、應酬與承諾。'
    ],
    正官: [
        '職涯：考核、升遷與制度責任突出，守規範可累積名望。',
        '財務：收入重穩定，契約、保險與法遵宜完整。',
        '關係：重承諾也易嚴肅，避免把工作標準套在家人身上。'
    ],
    七殺: [
        '職涯：高壓任務可帶來突破，先設優先序與退出條件。',
        '財務：不為證明能力而冒險，重大決策至少留一晚覆核。',
        '關係：壓力可能轉成控制感，用具體需求取代命令。'
    ],
    正印: [
        '職涯：利進修、證照、研究與獲得前輩支持。',
        '財務：投資自己可行，但要把學習轉為可驗收成果。',
        '關係：易獲照顧，也要主動承擔而非過度依賴。'
    ],
    偏印: [
        '職涯：利深度研究、技術與非典型解法，避免閉門造車。',
        '財務：冷門機會需以資料驗證，不只憑直覺。',
        '關係：需要獨處時說明界線，勿用沉默代替溝通。'
    ]
};

// ============================================================
// 核心計算
// ============================================================

/**
 * 取得西元年對應流年干支（以該年立春後之年柱為準的常用近似：year-4）
 * @param {number} year 西元年
 * @returns {{ year: number, stem: string, branch: string, stemIndex: number, branchIndex: number, nayin: string, element: string }}
 */
export function getLiunianGanZhi(year) {
    const y = Number(year);
    let stemIndex = (y - 4) % 10;
    let branchIndex = (y - 4) % 12;
    if (stemIndex < 0) stemIndex += 10;
    if (branchIndex < 0) branchIndex += 12;
    const stem = STEMS[stemIndex];
    const branch = BRANCHES[branchIndex];
    return {
        year: y,
        stem,
        branch,
        stemIndex,
        branchIndex,
        ganZhi: `${stem}${branch}`,
        nayin: getNayin(stemIndex, branchIndex),
        element: STEM_ELEMENT_ARRAY[stemIndex],
        branchElement: BRANCH_ELEMENT_ARRAY[branchIndex]
    };
}

/**
 * 流年地支與命盤地支之刑冲合害
 * @param {string} annualBranch
 * @param {Array<{ name?: string, branch: string }>} natalPillars
 * @returns {Array<{ type: string, label: string, withPillar: string, natalBranch: string, desc: string }>}
 */
export function getBranchInteractions(annualBranch, natalPillars) {
    return getSharedBranchInteractions(annualBranch, natalPillars, '流年');
}

/**
 * 依喜用神評估流年五行對命主的助益
 * @param {string} yearElement
 * @param {{ favorite?: string[], unfavorite?: string[] }|null} favoriteElement
 * @returns {{ favor: '喜'|'忌'|'中', note: string }}
 */
export function assessElementFavor(yearElement, favoriteElement) {
    if (!favoriteElement) {
        return { favor: '中', note: '尚未判定喜用神，僅依十神論斷。' };
    }
    const fav = favoriteElement.favorite || [];
    const unf = favoriteElement.unfavorite || [];
    if (fav.includes(yearElement)) {
        return { favor: '喜', note: `流年天干五行「${yearElement}」為喜用，整體較為有利。` };
    }
    if (unf.includes(yearElement)) {
        return { favor: '忌', note: `流年天干五行「${yearElement}」為忌神，宜守不宜攻。` };
    }
    return { favor: '中', note: `流年天干五行「${yearElement}」非明顯喜忌，平穩看待。` };
}

/**
 * 綜合影響等級
 * @param {string} tenGod
 * @param {'喜'|'忌'|'中'} favor
 * @param {Array} interactions
 * @returns {{ score: number, level: string, tone: string }}
 */
export function computeImpactLevel(tenGod, favor, interactions) {
    const base = TEN_GOD_LIUNIAN[tenGod] || { level: '中', tone: 'neutral' };
    let score = 50;
    if (base.tone === 'good') score += 15;
    if (base.tone === 'caution') score -= 10;
    if (favor === '喜') score += 15;
    if (favor === '忌') score -= 15;

    const hasClash = interactions.some(i => i.type === 'clash' || i.type === 'punish');
    const hasHarm = interactions.some(i => i.type === 'harm' || i.type === 'break');
    const hasCombine = interactions.some(i => ['combine', 'three-harmony', 'three-meeting'].includes(i.type));
    if (hasClash) score -= 12;
    if (hasHarm) score -= 8;
    if (hasCombine) score += 6;

    score = Math.max(0, Math.min(100, score));

    let level = '平穩';
    let tone = 'neutral';
    if (score >= 70) {
        level = '較有利';
        tone = 'good';
    } else if (score >= 55) {
        level = '小吉';
        tone = 'good';
    } else if (score >= 45) {
        level = '平穩';
        tone = 'neutral';
    } else if (score >= 30) {
        level = '需謹慎';
        tone = 'caution';
    } else {
        level = '挑戰較大';
        tone = 'bad';
    }

    // 冲刑時升一級警示（不低於需謹慎）
    if (hasClash && score < 55 && tone === 'neutral') {
        level = '需謹慎';
        tone = 'caution';
    }

    return { score, level, tone };
}

/**
 * 分析單一年度流年
 * @param {Object} baziResult
 * @param {number} year
 * @returns {Object|null}
 */
export function analyzeLiunianYear(baziResult, year) {
    if (!baziResult || !baziResult.dayMaster) return null;
    const dm = baziResult.dayMaster;
    const gz = getLiunianGanZhi(year);
    const tenGod = getTenGod(dm.stemIndex, gz.stemIndex);
    const godInfo = TEN_GOD_LIUNIAN[tenGod] || {
        level: '中',
        tone: 'neutral',
        summary: `${tenGod || '未知'}年`,
        detail: '資料不足，暫無詳細說明。'
    };
    const interactions = analyzeGanZhiInteractions(gz.stem, gz.branch, baziResult.pillars || [], '流年');
    const favorInfo = assessElementFavor(gz.element, baziResult.favoriteElement);
    const impact = computeImpactLevel(tenGod, favorInfo.favor, interactions);
    const age = year - baziResult.input.year;

    // 對應大運（若有；greatLuck.luckCycles）
    let luckPeriod = null;
    const cycles = baziResult.greatLuck?.luckCycles || baziResult.greatLuck?.cycles;
    if (Array.isArray(cycles) && age >= 0) {
        luckPeriod = cycles.find(c => age >= c.ageStart && age <= c.ageEnd) || null;
    }

    return {
        ...gz,
        age: age >= 0 ? age : null,
        tenGod,
        godInfo,
        interactions,
        favor: favorInfo.favor,
        favorNote: favorInfo.note,
        impact,
        luckPeriod,
        dayMaster: { stem: dm.stem, branch: dm.branch, element: dm.element }
    };
}

/**
 * 建立流年表
 * @param {Object} baziResult
 * @param {{ startYear?: number, endYear?: number }|undefined} options
 * @returns {Array<Object>}
 */
export function buildLiunianTable(baziResult, options = {}) {
    if (!baziResult || !baziResult.input) return [];
    const birthYear = baziResult.input.year;
    const current = new Date().getFullYear();
    const startYear = options.startYear ?? birthYear;
    const endYear = options.endYear ?? Math.max(current + 10, birthYear + 80);
    const rows = [];
    for (let y = startYear; y <= endYear; y++) {
        const row = analyzeLiunianYear(baziResult, y);
        if (row) rows.push(row);
    }
    return rows;
}

// ============================================================
// 渲染
// ============================================================

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function elColor(element) {
    return ELEMENT_COLOR_VALUES[element] || 'var(--text)';
}

function elClass(element) {
    return ELEMENT_COLORS[element] || '';
}

function toneClass(tone) {
    if (tone === 'good') return 'ln-tone-good';
    if (tone === 'caution') return 'ln-tone-caution';
    if (tone === 'bad') return 'ln-tone-bad';
    return 'ln-tone-neutral';
}

/**
 * 渲染流年分析分頁
 * @param {Object|null} baziResult
 * @param {HTMLElement|null} [container]
 */
export function renderLiunian(baziResult, container) {
    const root = container || document.getElementById('liunianRoot');
    if (!root) return;

    if (!baziResult || !baziResult.dayMaster) {
        root.innerHTML = `
            <div class="card">
                <div class="card-title">流 年 分 析</div>
                <div style="text-align:center;padding:30px;color:var(--text-muted);">
                    請先於「排盤」頁籤輸入出生資料並計算八字，再切換至此頁查看流年影響分析。
                </div>
            </div>`;
        return;
    }

    const dm = baziResult.dayMaster;
    const currentYear = new Date().getFullYear();
    const birthYear = baziResult.input.year;
    const startYear = birthYear;
    const endYear = Math.max(currentYear + 15, birthYear + 80);
    const table = buildLiunianTable(baziResult, { startYear, endYear });
    const thisYear = analyzeLiunianYear(baziResult, currentYear);

    let html = '';

    // 標題 / 日主摘要
    html += `<div class="card ln-header-card">
        <div class="card-title">流 年 影 響 分 析</div>
        <p class="ln-intro">
            以日主
            <strong class="${elClass(dm.element)}" style="color:${elColor(dm.element)}">${escapeHtml(dm.stem)}${escapeHtml(dm.branch)}</strong>
            （${escapeHtml(dm.element)}）為中心，逐一檢視每一年流年干支的
            <strong>十神</strong>、<strong>喜忌</strong>與<strong>天干地支生剋、刑沖合害破</strong>，
            說明該年對命主大致傾向。範圍：${startYear}–${endYear}（出生起約至 ${endYear - birthYear} 歲）。
        </p>
        <p class="ln-disclaimer">※ 流年以立春為年界之近似干支；未含真太陽時與細盤，僅供參考娛樂。</p>
    </div>`;

    // 今年重點
    if (thisYear) {
        html += renderYearDetailCard(thisYear, true);
    }

    // 總表
    html += `<div class="card">
        <div class="card-title">流年表（點選年份查看詳情）</div>
        <div class="ln-table-wrap">
            <table class="ln-table" id="lnTable">
                <thead>
                    <tr>
                        <th>年份</th>
                        <th>歲</th>
                        <th>干支</th>
                        <th>十神</th>
                        <th>喜忌</th>
                        <th>影響</th>
                        <th>干支互動</th>
                    </tr>
                </thead>
                <tbody>
                    ${table.map(row => renderTableRow(row, currentYear)).join('')}
                </tbody>
            </table>
        </div>
    </div>`;

    // 詳情區（點選列更新）
    html += `<div class="card" id="lnDetailCard">
        <div class="card-title">選定流年詳解</div>
        <div id="lnDetailBody">${renderYearDetailBody(thisYear || table[0])}</div>
    </div>`;

    // 十神速查
    html += `<div class="card">
        <div class="card-title">十神流年速查</div>
        <div class="ln-god-grid">
            ${Object.entries(TEN_GOD_LIUNIAN)
                .map(
                    ([name, info]) => `
                <div class="ln-god-card ${toneClass(info.tone)}">
                    <div class="ln-god-name">${escapeHtml(name)}</div>
                    <div class="ln-god-sum">${escapeHtml(info.summary)}</div>
                    <div class="ln-god-detail">${escapeHtml(info.detail)}</div>
                </div>
            `
                )
                .join('')}
        </div>
    </div>`;

    root.innerHTML = html;

    // 綁定列點選
    const tbody = root.querySelector('#lnTable tbody');
    const detailBody = root.querySelector('#lnDetailBody');
    if (tbody && detailBody) {
        tbody.addEventListener('click', e => {
            const tr = e.target.closest('tr[data-year]');
            if (!tr) return;
            const y = parseInt(tr.dataset.year, 10);
            const row = analyzeLiunianYear(baziResult, y);
            if (!row) return;
            tbody.querySelectorAll('tr').forEach(r => r.classList.remove('ln-row-active'));
            tr.classList.add('ln-row-active');
            detailBody.innerHTML = renderYearDetailBody(row);
            detailBody.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    // 預設捲到今年列
    const curRow = root.querySelector(`tr[data-year="${currentYear}"]`);
    if (curRow) {
        curRow.classList.add('ln-row-active');
        // 延遲一點讓 layout 完成
        setTimeout(() => {
            curRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 50);
    }
}

function renderTableRow(row, currentYear) {
    const isCurrent = row.year === currentYear;
    const tags = row.interactions.map(i => i.label).join('、') || '—';
    return `<tr data-year="${row.year}" class="${isCurrent ? 'ln-row-current' : ''}">
        <td>${row.year}${isCurrent ? ' <span class="ln-badge-now">今</span>' : ''}</td>
        <td>${row.age != null ? row.age : '—'}</td>
        <td>
            <span style="color:${elColor(row.element)};font-weight:700;">${escapeHtml(row.stem)}</span><span style="color:${elColor(row.branchElement)};font-weight:700;">${escapeHtml(row.branch)}</span>
        </td>
        <td>${escapeHtml(row.tenGod)}</td>
        <td><span class="ln-favor ln-favor-${row.favor}">${escapeHtml(row.favor)}</span></td>
        <td><span class="ln-level ${toneClass(row.impact.tone)}">${escapeHtml(row.impact.level)}</span></td>
        <td class="ln-tags">${escapeHtml(tags)}</td>
    </tr>`;
}

function renderYearDetailCard(row, isCurrent) {
    return `<div class="card ln-focus-card ${toneClass(row.impact.tone)}">
        <div class="card-title">${isCurrent ? '今 年 流 年' : '流 年 重 點'} · ${row.year}</div>
        ${renderYearDetailBody(row)}
    </div>`;
}

function renderYearDetailBody(row) {
    if (!row) {
        return '<p style="color:var(--text-muted);">無資料</p>';
    }
    const interHtml = row.interactions.length
        ? `<ul class="ln-inter-list">${row.interactions
              .map(
                  i =>
                      `<li><span class="ln-inter-label ln-inter-${i.type}">${escapeHtml(i.label)}</span> ${escapeHtml(i.desc)}</li>`
              )
              .join('')}</ul>`
        : '<p class="ln-muted">本年干支與四柱未形成明顯合沖刑害破；仍須看五行旺衰與大運背景。</p>';

    const luckHtml = row.luckPeriod
        ? `<div class="ln-luck-context"><span>所處大運</span><strong>${escapeHtml(row.luckPeriod.ganZhi || row.luckPeriod.name || '—')} · ${escapeHtml(row.luckPeriod.tenGod || row.luckPeriod.name || '')}</strong>
            <small>${row.luckPeriod.ageStart}–${row.luckPeriod.ageEnd} 歲｜${escapeHtml(row.luckPeriod.analysis || '以大運為十年背景，再看本年觸發。')}</small></div>`
        : '';
    const focusItems = TEN_GOD_FOCUS[row.tenGod] || ['把握可控事項，重大決策以資料與專業意見覆核。'];

    return `
        <div class="ln-detail">
            <div class="ln-detail-head">
                <div class="ln-year-big">${row.year}</div>
                <div class="ln-gz-big">
                    <span style="color:${elColor(row.element)}">${escapeHtml(row.stem)}</span><span style="color:${elColor(row.branchElement)}">${escapeHtml(row.branch)}</span>
                </div>
                <div class="ln-meta">
                    <span>十神：<strong>${escapeHtml(row.tenGod)}</strong></span>
                    <span>納音：${escapeHtml(row.nayin)}</span>
                    <span>虛歲約：${row.age != null ? row.age + ' 歲' : '—'}</span>
                    <span class="ln-level ${toneClass(row.impact.tone)}">${escapeHtml(row.impact.level)}</span>
                    <span class="ln-favor ln-favor-${row.favor}">喜忌：${escapeHtml(row.favor)}</span>
                </div>
            </div>
            <h4 class="ln-section-title">${escapeHtml(row.godInfo.summary)}</h4>
            <p class="ln-detail-text">${escapeHtml(row.godInfo.detail)}</p>
            <p class="ln-favor-note">${escapeHtml(row.favorNote)}</p>
            ${luckHtml}
            <h4 class="ln-section-title">年度行動重點</h4>
            <div class="ln-focus-grid">${focusItems.map(item => `<p>${escapeHtml(item)}</p>`).join('')}</div>
            <h4 class="ln-section-title">天干地支互動</h4>
            ${interHtml}
            <p class="ln-score-line">綜合傾向分數：<strong>${row.impact.score}</strong> / 100（用於排序提醒，不是事件預測或絕對吉凶）</p>
        </div>`;
}

// 向後相容
if (typeof window !== 'undefined') {
    window.renderLiunian = renderLiunian;
    window.buildLiunianTable = buildLiunianTable;
    window.analyzeLiunianYear = analyzeLiunianYear;
}
