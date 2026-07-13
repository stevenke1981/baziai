/** 命理學堂 — 傳統規則速查與判讀次序。 */

const sections = [
    {
        key: 'wuxing',
        title: '五行生剋：不是單看「有生就是吉」',
        mark: '生剋',
        lead: '木、火、土、金、水構成生、洩、剋、耗、助的動態。八字重點在氣勢能否流通與中和，而非某一元素越多越好。',
        rows: [
            ['相生', '木生火 · 火生土 · 土生金 · 金生水 · 水生木', '資源轉化與扶助；生得太過也可能使被生者壅滯。'],
            [
                '相剋',
                '木剋土 · 土剋水 · 水剋火 · 火剋金 · 金剋木',
                '規範、責任與制衡；有力且適度可成管理，失衡才成壓迫。'
            ],
            ['通關', '兩行交戰時引入中介五行', '例如金木相戰可視水是否通關；仍須看季節與全局。']
        ]
    },
    {
        key: 'stems',
        title: '天干：五合、相生與相剋',
        mark: '天干',
        lead: '天干偏向外顯、主動與容易被看見的作用。五合只表示產生合意或牽絆；「合化」需另外檢查月令、通根、助化與是否受破壞。',
        rows: [
            ['五合', '甲己合土 · 乙庚合金 · 丙辛合水 · 丁壬合木 · 戊癸合火', '先論合絆，再查是否具備化神條件。'],
            ['生剋', '依天干所屬五行判斷', '剋不必然凶：喜用得制可去病，忌神受制反可能有利。'],
            ['近遠', '相鄰作用通常較直接', '隔柱、被合、被制或無根時，作用力須降級判讀。']
        ]
    },
    {
        key: 'branches',
        title: '地支：合、會、沖、刑、害、破',
        mark: '地支',
        lead: '地支藏干且承載季節之氣，互動比天干更需看完整結構。網站會標出成立的關係，但不以單一標籤直接定吉凶。',
        rows: [
            ['六合', '子丑 · 寅亥 · 卯戌 · 辰酉 · 巳申 · 午未', '牽絆、連結、整合；合而不化仍可能限制原本功能。'],
            ['六沖', '子午 · 丑未 · 寅申 · 卯酉 · 辰戌 · 巳亥', '對向之氣相激，常應在變動、移位、分合與重新安排。'],
            ['三合', '申子辰水 · 亥卯未木 · 寅午戌火 · 巳酉丑金', '生旺墓三支匯局；齊全不代表必然化局。'],
            ['三會', '亥子丑水 · 寅卯辰木 · 巳午未火 · 申酉戌金', '一季方氣聚集，力量集中，尤其須防過旺失衡。'],
            ['相刑', '寅巳申 · 丑戌未 · 子卯 · 辰午酉亥自刑', '規則、界線、壓力與內在反覆；需辨兩支引動或三支成局。'],
            ['六害', '子未 · 丑午 · 寅巳 · 卯辰 · 申亥 · 酉戌', '偏向隱性摩擦、誤解與合作落差。'],
            ['六破', '子酉 · 丑辰 · 寅亥 · 卯午 · 巳申 · 未戌', '原結構鬆動、拆分或重組；與六合並見時更要看主次。']
        ]
    },
    {
        key: 'luck',
        title: '大運與流年：先定底盤，再看時間',
        mark: '歲運',
        lead: '原局像底盤，大運是約十年的環境主題，流年是當年的觸發。實務判讀不能只看生肖，也不能見沖就斷災、見合就斷喜。',
        rows: [
            ['第一步', '看原局日主、月令、格局與喜忌', '先知道命局需要什麼，歲運五行才有方向。'],
            ['第二步', '看大運干支與原局作用', '辨十年主題、資源與壓力落在哪些柱位。'],
            ['第三步', '看流年引動大運與原局', '同一流年在不同大運背景下，呈現方式可能相反。'],
            ['第四步', '落到可行策略', '把傳統象意轉為風險控管、溝通、學習與資源配置，不作宿命式斷言。']
        ]
    }
];

function renderSection(section) {
    return `<section class="kb-section" id="kb-${section.key}">
        <div class="kb-section-head"><span>${section.mark}</span><h3>${section.title}</h3></div>
        <p class="kb-lead">${section.lead}</p>
        <div class="kb-rule-grid">${section.rows
            .map(
                ([name, formula, meaning]) => `
            <article class="kb-rule-card"><h4>${name}</h4><p class="kb-formula">${formula}</p><p>${meaning}</p></article>`
            )
            .join('')}</div>
    </section>`;
}

export function renderKnowledge(container) {
    const root = container || document.getElementById('knowledgeRoot');
    if (!root) return;
    root.innerHTML = `
        <div class="kb-hero">
            <p class="kb-eyebrow">子平法入門 · 先懂規則再讀命盤</p>
            <h2>天干地支互動學堂</h2>
            <p>把生剋制化、會合刑沖拆成可查、可理解的判讀順序。關係是「作用方式」，不是單獨的吉凶標籤。</p>
            <nav class="kb-jump" aria-label="命理學堂章節">${sections.map(s => `<a href="#kb-${s.key}">${s.mark}</a>`).join('')}</nav>
        </div>
        ${sections.map(renderSection).join('')}
        <section class="kb-sources">
            <h3>典籍脈絡與延伸閱讀</h3>
            <p>本頁以傳統子平命理的通行規則整理；判讀原則參考《滴天髓》強調氣勢、強弱與喜忌，不把刑沖一概定凶。網站內容屬文化與娛樂用途，不是科學預測，也不能代替醫療、法律或財務專業意見。</p>
            <div class="kb-source-links">
                <a href="https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93%E9%97%A1%E5%BE%AE" target="_blank" rel="noopener noreferrer">《滴天髓闡微》原文</a>
                <a href="https://zh.wikisource.org/zh-hant/%E6%BB%B4%E5%A4%A9%E9%AB%93" target="_blank" rel="noopener noreferrer">《滴天髓》天干地支篇</a>
                <a href="https://zh.wikipedia.org/wiki/%E5%9C%B0%E6%94%AF" target="_blank" rel="noopener noreferrer">地支關係資料索引</a>
            </div>
        </section>`;
}
