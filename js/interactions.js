/**
 * interactions.js — 天干地支互動規則與共用判讀
 *
 * 規則用於命盤、大運與流年頁。只描述傳統命理中的結構傾向，
 * 不把單一「合、沖、刑、害」直接等同吉凶。
 */

import { STEM_ELEMENT_MAP, ELEMENT_CYCLE } from './data.js';

export const STEM_COMBINES = {
    甲: { pair: '己', result: '土' },
    己: { pair: '甲', result: '土' },
    乙: { pair: '庚', result: '金' },
    庚: { pair: '乙', result: '金' },
    丙: { pair: '辛', result: '水' },
    辛: { pair: '丙', result: '水' },
    丁: { pair: '壬', result: '木' },
    壬: { pair: '丁', result: '木' },
    戊: { pair: '癸', result: '火' },
    癸: { pair: '戊', result: '火' }
};

export const BRANCH_CLASHES = {
    子: '午',
    午: '子',
    丑: '未',
    未: '丑',
    寅: '申',
    申: '寅',
    卯: '酉',
    酉: '卯',
    辰: '戌',
    戌: '辰',
    巳: '亥',
    亥: '巳'
};

export const BRANCH_COMBINES = {
    子: { pair: '丑', result: '土' },
    丑: { pair: '子', result: '土' },
    寅: { pair: '亥', result: '木' },
    亥: { pair: '寅', result: '木' },
    卯: { pair: '戌', result: '火' },
    戌: { pair: '卯', result: '火' },
    辰: { pair: '酉', result: '金' },
    酉: { pair: '辰', result: '金' },
    巳: { pair: '申', result: '水' },
    申: { pair: '巳', result: '水' },
    午: { pair: '未', result: '土' },
    未: { pair: '午', result: '土' }
};

export const BRANCH_HARMS = {
    子: '未',
    未: '子',
    丑: '午',
    午: '丑',
    寅: '巳',
    巳: '寅',
    卯: '辰',
    辰: '卯',
    申: '亥',
    亥: '申',
    酉: '戌',
    戌: '酉'
};

export const BRANCH_BREAKS = {
    子: '酉',
    酉: '子',
    丑: '辰',
    辰: '丑',
    寅: '亥',
    亥: '寅',
    卯: '午',
    午: '卯',
    巳: '申',
    申: '巳',
    未: '戌',
    戌: '未'
};

export const THREE_HARMONIES = [
    { branches: ['申', '子', '辰'], result: '水' },
    { branches: ['亥', '卯', '未'], result: '木' },
    { branches: ['寅', '午', '戌'], result: '火' },
    { branches: ['巳', '酉', '丑'], result: '金' }
];

export const THREE_MEETINGS = [
    { branches: ['亥', '子', '丑'], result: '水' },
    { branches: ['寅', '卯', '辰'], result: '木' },
    { branches: ['巳', '午', '未'], result: '火' },
    { branches: ['申', '酉', '戌'], result: '金' }
];

const PUNISH_GROUPS = [
    { branches: ['寅', '巳', '申'], name: '恃勢之刑' },
    { branches: ['丑', '戌', '未'], name: '無恩之刑' }
];
const SELF_PUNISH = new Set(['辰', '午', '酉', '亥']);

export function getElementRelation(source, target) {
    const sourceIndex = ELEMENT_CYCLE.indexOf(source);
    const targetIndex = ELEMENT_CYCLE.indexOf(target);
    if (sourceIndex < 0 || targetIndex < 0) return 'unknown';
    if (sourceIndex === targetIndex) return 'same';
    if ((sourceIndex + 1) % 5 === targetIndex) return 'generate';
    if ((targetIndex + 1) % 5 === sourceIndex) return 'generatedBy';
    if ((sourceIndex + 2) % 5 === targetIndex) return 'control';
    if ((targetIndex + 2) % 5 === sourceIndex) return 'controlledBy';
    return 'unknown';
}

export function getStemInteractions(transitStem, natalPillars, transitLabel = '流年') {
    if (!transitStem || !Array.isArray(natalPillars)) return [];
    const transitElement = STEM_ELEMENT_MAP[transitStem];

    return natalPillars.flatMap(pillar => {
        const natalStem = pillar.stem;
        const pillarName = pillar.name || '命盤';
        if (!natalStem || natalStem === transitStem) return [];
        const items = [];
        const combine = STEM_COMBINES[transitStem];
        if (combine?.pair === natalStem) {
            items.push({
                type: 'stem-combine',
                label: '干合',
                withPillar: pillarName,
                natalStem,
                desc: `${transitLabel}${transitStem}與${pillarName}${natalStem}五合，合化${combine.result}須視月令、通根與助力；未成化時多作牽絆、協作與關係連結看。`
            });
        }

        const natalElement = STEM_ELEMENT_MAP[natalStem];
        const relation = getElementRelation(transitElement, natalElement);
        if (relation === 'control' || relation === 'controlledBy') {
            const direction =
                relation === 'control'
                    ? `${transitStem}${transitElement}剋${natalStem}${natalElement}`
                    : `${natalStem}${natalElement}剋${transitStem}${transitElement}`;
            items.push({
                type: 'stem-control',
                label: '干剋',
                withPillar: pillarName,
                natalStem,
                desc: `${direction}，象徵責任、制約與資源拉扯；強弱、喜忌與是否有通關五行，決定壓力能否轉為推動力。`
            });
        }
        return items;
    });
}

export function getBranchInteractions(transitBranch, natalPillars, transitLabel = '流年') {
    if (!transitBranch || !Array.isArray(natalPillars)) return [];
    const interactions = [];
    const natalBranches = natalPillars.map(p => p.branch).filter(Boolean);

    for (const pillar of natalPillars) {
        const natalBranch = pillar.branch;
        if (!natalBranch) continue;
        const pillarName = pillar.name || '命盤';
        const base = { withPillar: pillarName, natalBranch };

        if (BRANCH_CLASHES[transitBranch] === natalBranch) {
            interactions.push({
                ...base,
                type: 'clash',
                label: '沖',
                desc: `${transitLabel}${transitBranch}沖${pillarName}${natalBranch}：原有結構被推動，常見調整、移動、分合或計畫改期；是否有利仍看喜忌與承受力。`
            });
        }
        if (BRANCH_COMBINES[transitBranch]?.pair === natalBranch) {
            const result = BRANCH_COMBINES[transitBranch].result;
            interactions.push({
                ...base,
                type: 'combine',
                label: '六合',
                desc: `${transitLabel}${transitBranch}與${pillarName}${natalBranch}六合${result}：合作、牽絆與資源整合增加；合化仍須得令、得地並有助化條件。`
            });
        }
        if (BRANCH_HARMS[transitBranch] === natalBranch) {
            interactions.push({
                ...base,
                type: 'harm',
                label: '害',
                desc: `${transitLabel}${transitBranch}害${pillarName}${natalBranch}：表面不一定激烈，宜留意誤會、隱性阻力與承諾落差，重要事項多做確認。`
            });
        }
        if (BRANCH_BREAKS[transitBranch] === natalBranch) {
            interactions.push({
                ...base,
                type: 'break',
                label: '破',
                desc: `${transitLabel}${transitBranch}破${pillarName}${natalBranch}：結構有鬆動、重組之象，適合檢修舊制，忌在資訊不足時倉促拆解。`
            });
        }
        if ((transitBranch === '子' && natalBranch === '卯') || (transitBranch === '卯' && natalBranch === '子')) {
            interactions.push({
                ...base,
                type: 'punish',
                label: '刑',
                desc: `${transitLabel}${transitBranch}與${pillarName}${natalBranch}為子卯刑：界線、禮法與溝通方式容易磨擦，宜先釐清規則再表態。`
            });
        }
        if (SELF_PUNISH.has(transitBranch) && transitBranch === natalBranch) {
            interactions.push({
                ...base,
                type: 'punish',
                label: '自刑',
                desc: `${transitLabel}${transitBranch}與${pillarName}${natalBranch}自刑：易反覆思量或自我施壓，宜用明確期限與外部回饋中止內耗。`
            });
        }
        for (const group of PUNISH_GROUPS) {
            if (
                transitBranch !== natalBranch &&
                group.branches.includes(transitBranch) &&
                group.branches.includes(natalBranch)
            ) {
                interactions.push({
                    ...base,
                    type: 'punish',
                    label: '刑',
                    desc: `${transitLabel}${transitBranch}與${pillarName}${natalBranch}進入${group.name}結構；若其餘一支亦齊，壓力與制度摩擦更明顯，宜守程序、留紀錄。`
                });
            }
        }
    }

    const allBranches = new Set([...natalBranches, transitBranch]);
    for (const group of THREE_HARMONIES) {
        if (group.branches.includes(transitBranch) && group.branches.every(b => allBranches.has(b))) {
            interactions.push({
                type: 'three-harmony',
                label: '三合',
                natalBranch: group.branches.join(''),
                withPillar: '全局',
                desc: `${group.branches.join('')}三合${group.result}局條件齊備，${group.result}氣匯聚；能否成化與吉凶仍須看月令、透干及是否為命局喜用。`
            });
        }
    }
    for (const group of THREE_MEETINGS) {
        if (group.branches.includes(transitBranch) && group.branches.every(b => allBranches.has(b))) {
            interactions.push({
                type: 'three-meeting',
                label: '三會',
                natalBranch: group.branches.join(''),
                withPillar: '全局',
                desc: `${group.branches.join('')}三會${group.result}方，季節之氣集中；宜檢視${group.result}是否過旺，以及有無制化與通關。`
            });
        }
    }

    const seen = new Set();
    return interactions.filter(item => {
        const key = `${item.type}|${item.withPillar}|${item.natalBranch}|${item.label}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export function analyzeGanZhiInteractions(stem, branch, natalPillars, transitLabel = '流年') {
    return [
        ...getStemInteractions(stem, natalPillars, transitLabel),
        ...getBranchInteractions(branch, natalPillars, transitLabel)
    ];
}
