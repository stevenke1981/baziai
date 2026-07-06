/**
 * geju.js — 八字格局判定引擎
 * 
 * 根據袁樹珊《命理探源》與傳統子平法：
 *   有透先看透，無透看本氣
 *   月令為樞紐定格局
 * 
 * 三步法：
 *   第一優先：月令「本氣」透干（年/月/時干）
 *   第二優先：月令「中氣」或「餘氣」透干
 *   第三優先：皆無透干，直接取「本氣」
 * 
 * 分類：
 *   普通格局（正格）：正官、七殺、正財、偏財、正印、偏印、食神、傷官
 *   特別格局（變格）：從格、專旺格、化氣格等
 * 
 * 四正（子午卯酉）→ 氣專，僅藏本氣（午藏丁己）
 * 四生（寅申巳亥）→ 氣雜，藏本+中+餘
 * 四庫（辰戌丑未）→ 墓庫，藏本+中+餘
 */

// ============================================================
// 資料庫
// ============================================================

/** 地支分類 */
export const BRANCH_CATEGORY = {
    '子': '四正', '午': '四正', '卯': '四正', '酉': '四正',
    '寅': '四生', '申': '四生', '巳': '四生', '亥': '四生',
    '辰': '四庫', '戌': '四庫', '丑': '四庫', '未': '四庫'
};

/** 地支藏干（本氣/中氣/餘氣）含類別 */
export const HIDDEN_STEMS_DETAILED = {
    '子': [
        { stem: '癸', type: '本氣', desc: '純水之地，癸水之精', power: 100 }
    ],
    '丑': [
        { stem: '己', type: '本氣', desc: '土之本氣', power: 60 },
        { stem: '癸', type: '中氣', desc: '水之餘氣（水庫）', power: 30 },
        { stem: '辛', type: '餘氣', desc: '金之餘氣（金庫）', power: 10 }
    ],
    '寅': [
        { stem: '甲', type: '本氣', desc: '木之本氣', power: 60 },
        { stem: '丙', type: '中氣', desc: '火之長生', power: 30 },
        { stem: '戊', type: '餘氣', desc: '土隨母寄藏', power: 10 }
    ],
    '卯': [
        { stem: '乙', type: '本氣', desc: '純木之地，乙木之精', power: 100 }
    ],
    '辰': [
        { stem: '戊', type: '本氣', desc: '土之本氣', power: 60 },
        { stem: '乙', type: '中氣', desc: '木之餘氣', power: 30 },
        { stem: '癸', type: '餘氣', desc: '水之庫', power: 10 }
    ],
    '巳': [
        { stem: '丙', type: '本氣', desc: '火之本氣', power: 60 },
        { stem: '庚', type: '中氣', desc: '金之長生', power: 30 },
        { stem: '戊', type: '餘氣', desc: '土隨母寄藏', power: 10 }
    ],
    '午': [
        { stem: '丁', type: '本氣', desc: '純火之地，丁火之精', power: 70 },
        { stem: '己', type: '中氣', desc: '土隨母寄藏', power: 30 }
    ],
    '未': [
        { stem: '己', type: '本氣', desc: '土之本氣', power: 60 },
        { stem: '丁', type: '中氣', desc: '火之餘氣（火庫）', power: 30 },
        { stem: '乙', type: '餘氣', desc: '木之餘氣（木庫）', power: 10 }
    ],
    '申': [
        { stem: '庚', type: '本氣', desc: '金之本氣', power: 60 },
        { stem: '壬', type: '中氣', desc: '水之長生', power: 30 },
        { stem: '戊', type: '餘氣', desc: '土隨母寄藏', power: 10 }
    ],
    '酉': [
        { stem: '辛', type: '本氣', desc: '純金之地，辛金之精', power: 100 }
    ],
    '戌': [
        { stem: '戊', type: '本氣', desc: '土之本氣', power: 60 },
        { stem: '辛', type: '中氣', desc: '金之餘氣（金庫）', power: 30 },
        { stem: '丁', type: '餘氣', desc: '火之庫', power: 10 }
    ],
    '亥': [
        { stem: '壬', type: '本氣', desc: '水之本氣', power: 70 },
        { stem: '甲', type: '中氣', desc: '木之長生', power: 30 }
    ]
};

/** 正八格定義與說明 */
export const NORMAL_PATTERNS = {
    '正官格': {
        name: '正官格',
        aliases: ['官格'],
        category: '吉神（善神）',
        treatment: '順用 — 喜財生、印護',
        desc: '正官代表權威、紀律、責任。正官格者行事端正，重視名譽，適宜公職、管理、法律等行業。官星宜透乾通根，最怕傷官剋破。',
        analysis: '官者管也，萬物惟官最貴。正官格以月令正官為體，喜財星以生官，印綬以護官。忌傷官剋官、食神合官、七殺混雜。',
        advice: '正官格以官為用，宜循規蹈矩、腳踏實地。適合公務員、主管、法律、教育等職業。',
        fav: '財星（生官）、印星（護官）',
        unfav: '傷官（剋官）、七殺（混官）',
        classicQuote: '《淵海子平》：「正官為貴氣之神，得之者多享福壽。」'
    },
    '七殺格': {
        name: '七殺格',
        aliases: ['偏官格', '殺格'],
        category: '凶神（不善神）',
        treatment: '逆用 — 喜食神制、印綬化',
        desc: '七殺代表權威、魄力、競爭與壓力。七殺格者果斷剛強，有大將之風，宜軍警、創業、競爭性行業。制化得宜則可成大業。',
        analysis: '七殺者，攻我之賊也。有殺先論殺。七殺喜食神制之、印綬化之，謂之「殺印相生」、「食神制殺」。若無制化，殺重身輕則多災厄。',
        advice: '七殺格以食神制殺或印綬化殺為用。宜培養專業能力，以柔克剛。適合軍警、醫護、工程、創業等。',
        fav: '食神（制殺）、印星（化殺）',
        unfav: '財星（生殺）、比劫（抗殺而力不從心）',
        classicQuote: '《淵海子平》：「七殺如虎，制之則貴，縱之則凶。」'
    },
    '正財格': {
        name: '正財格',
        aliases: ['財格'],
        category: '吉神（善神）',
        treatment: '順用 — 喜食神生、官星護',
        desc: '正財代表穩定收入、勤儉持家。正財格者務實守信，善於理財，宜金融、會計、貿易、穩定行業。財喜透乾通根。',
        analysis: '財為養命之源。正財格喜食神生財、官星護財，最忌比劫奪財。身旺勝財者富，身弱財旺者財多身弱。',
        advice: '正財格宜勤懇積累，不宜投機冒險。適合財務、會計、貿易、房地產等行業。',
        fav: '食神（生財）、官星（護財）',
        unfav: '比肩劫財（奪財）',
        classicQuote: '《子平真詮》：「財喜食神以相生，生官以護財。」'
    },
    '偏財格': {
        name: '偏財格',
        aliases: ['財格'],
        category: '吉神（善神）',
        treatment: '順用 — 喜食神生、官星護',
        desc: '偏財代表橫財、機遇、交際能力。偏財格者慷慨大方，善於抓住機會，宜經商、投資、業務等靈活性行業。',
        analysis: '偏財者，眾人之財也。偏財格喜食神生財，忌比劫分財。偏財透乾通根，身旺勝財者尤利經商創業。',
        advice: '偏財格宜善用人脈與機遇，適合業務、投資、貿易、自營事業等。注意理財規劃。',
        fav: '食神（生財）、官星（護財）',
        unfav: '比肩劫財（奪財）',
        classicQuote: '《淵海子平》：「偏財為眾人之財，得之者慷慨好施。」'
    },
    '正印格': {
        name: '正印格',
        aliases: ['印格'],
        category: '吉神（善神）',
        treatment: '順用 — 喜官星生、比劫護',
        desc: '正印代表學識、貴人、慈愛。正印格者溫和好學，有長輩緣，宜教育、文化、醫療、研究等行業。',
        analysis: '印綬為生我之神，如母之護子。正印格喜官星生印（官印雙全），忌財星壞印。印星太重時喜食傷洩秀。',
        advice: '正印格宜發揮學術、文化方面的才能。適合教育、研究、醫療、出版、文職等。',
        fav: '官星（生印）、比劫（護印）',
        unfav: '財星（壞印）',
        classicQuote: '《子平真詮》：「印綬得官而貴，逢財而破。」'
    },
    '偏印格': {
        name: '偏印格',
        aliases: ['梟神格', '印格'],
        category: '凶神（不善神）',
        treatment: '逆用 — 喜財星制、食神洩',
        desc: '偏印代表特殊才能、創意思維、偏門學問。偏印格者思維獨特，直覺敏銳，宜科研、命理、藝術、發明等獨創性行業。',
        analysis: '偏印又稱梟神，性孤僻而機敏。偏印喜財星以制之，食神以洩之。忌比劫生梟，反成梟神奪食之局。',
        advice: '偏印格宜走專業技術路線，適合科研、命理、哲學、藝術創作等。注意人際關係。',
        fav: '財星（制梟）、食神（洩秀）',
        unfav: '比劫（生梟）、正印（混雜）',
        classicQuote: '《淵海子平》：「梟神見食，奪人之食；得財制服，反為奇格。」'
    },
    '食神格': {
        name: '食神格',
        aliases: ['食格'],
        category: '吉神（善神）',
        treatment: '順用 — 喜財星生、比劫助',
        desc: '食神代表才華、享受、溫和。食神格者聰明溫和，樂天知命，宜教育、演藝、餐飲、設計等行業。食神制殺則有權。',
        analysis: '食神者，我生之精華也。食神格喜財星生財（食神生財），身弱喜比劫助。食神制殺則權威自顯。忌偏印奪食。',
        advice: '食神格宜發揮才藝與創意。適合教育、演藝、設計、餐飲、諮詢等行業。',
        fav: '財星（食神生財）、比劫（助身）',
        unfav: '偏印（奪食）、正印（混雜）',
        classicQuote: '《淵海子平》：「食神制殺，英雄獨壓萬人。」'
    },
    '傷官格': {
        name: '傷官格',
        aliases: ['傷格'],
        category: '凶神（不善神）',
        treatment: '逆用 — 喜印星制、財星化',
        desc: '傷官代表才氣、叛逆、創造力。傷官格者聰慧過人，不喜受拘束，宜藝術、創作、科技、自由業。傷官佩印則文貴。',
        analysis: '傷官者，盜我之氣而傷我之官也。傷官格喜印星制之（傷官佩印），或財星化之（傷官生財）。最忌傷官見官。',
        advice: '傷官格宜走專業技術或藝術路線，適合設計、寫作、研發、顧問等自由度高的工作。注意言行低調。',
        fav: '印星（制傷）、財星（化傷）',
        unfav: '正官（傷官見官）、比劫（生傷）',
        classicQuote: '《淵海子平》：「傷官見官，為禍百端；傷官佩印，貴不可言。」'
    }
};

/** 特殊格局定義（含建祿格、月刃格） */
export const SPECIAL_PATTERNS = {
    '建祿格': {
        name: '建祿格',
        condition: '月令為日主之祿（本氣與日主相同，即比肩）',
        desc: '月令為日主之祿位，如甲日寅月、乙日卯月等。日主得月令之氣，身旺。建祿格喜財官透出，忌比劫爭奪。',
        analysis: '建祿者，月令為日主之臨官祿位也。如人得祿，自然豐足。喜財官食傷洩秀，忌比劫印綬再助旺。',
        advice: '建祿格身旺，宜發揮才華，謀求發展。適合創業、管理、競爭性行業。注意不要過於自負。',
        fav: '財星、官星、食傷（洩旺氣）',
        unfav: '比肩劫財（爭奪）、印星（再生扶）',
        classicQuote: '《子平真詮》：「建祿格，體堅則用神貴乎得宜。」'
    },
    '月刃格': {
        name: '月刃格',
        condition: '月令為日主之劫財（如甲日卯月、丙日午月等）',
        desc: '月令為日主之刃（劫財），如甲日卯月、丙日午月、庚日酉月、壬日子月。月刃格身極旺，喜官殺制伏，忌財星滋刃。',
        analysis: '月刃者，極旺之謂也。刃旺最喜七殺制伏，如羊刃駕殺，權貴之命。忌財星生官殺攻身。',
        advice: '月刃格身極旺，須有官殺制刃方貴。適合軍警、執法、外科醫療等行業。注意衝動個性。',
        fav: '七殺（制刃）、食傷（洩秀）',
        unfav: '財星（滋刃）、印星（助刃）',
        classicQuote: '《淵海子平》：「羊刃見殺，官職可誇；羊刃逢沖，災禍不輕。」'
    },
    '從財格': {
        name: '從財格',
        condition: '日主極弱，四柱財星強旺，無印比生扶',
        desc: '日主衰弱至極，滿盤財星，不得不從其財勢。行運喜財官，忌比劫印。',
        advice: '宜從商、投資、靠人脈謀財。注意逢比劫運時有破敗。'
    },
    '從殺格': {
        name: '從殺格',
        condition: '日主極弱，四柱七殺強旺，無印比生扶',
        desc: '日主衰弱至極，滿盤官殺，不得不從其殺勢。行運喜官殺，忌印比抵抗。',
        advice: '宜軍警、管理、權威領域。注意逢印比運時易有衝突。'
    },
    '從兒格': {
        name: '從兒格（從食傷）',
        condition: '日主極弱，四柱食傷強旺，無印比生扶',
        desc: '日主衰弱，滿盤食傷，順其洩秀之勢。行運喜食傷財，忌印比。',
        advice: '宜藝術、創作、演藝、自由業。才華出眾但需注意健康。'
    },
    '專旺格（一行得氣）': {
        name: '專旺格（一行得氣）',
        condition: '日主極旺，全局同一五行或會合成一局',
        desc: '某一五行特別純粹專旺，日主強旺至極，順其旺勢不宜逆犯。如木曰曲直、火曰炎上等。',
        advice: '專旺格宜發揮該五行對應領域的專長，不宜逆勢而行。'
    }
};

/** 十神與格局對照（月令本氣定十神 → 格局名） */
export const TEN_GOD_TO_PATTERN = {
    '正官': '正官格',
    '七殺': '七殺格',
    '正財': '正財格',
    '偏財': '偏財格',
    '正印': '正印格',
    '偏印': '偏印格',
    '食神': '食神格',
    '傷官': '傷官格'
};

// ============================================================
// 核心邏輯
// ============================================================

/**
 * 完整格局判定
 * @param {Object} baziResult - calculateBazi() 的結果
 * @returns {Object} 格局分析結果
 */
/**
 * 擷取格局判定所需的基本輸入參數
 * @param {Object} baziResult
 * @returns {Object|null} null 表示參數不足
 */
function extractGejuInputs(baziResult) {
    if (!baziResult || !baziResult.pillars || baziResult.pillars.length < 2) {
        return null;
    }
    const dayMaster = baziResult.dayMaster;
    if (!dayMaster || dayMaster.stemIndex === undefined) {
        return null;
    }
    const monthPillar = baziResult.pillars[1];
    if (!monthPillar) {
        return null;
    }
    const otherStems = [];
    baziResult.pillars.forEach(p => {
        if (p.name !== '日柱') {
            otherStems.push({ stem: p.stem, stemIndex: p.stemIndex, position: p.name });
        }
    });
    const dayStemInfo = baziResult.pillars[2];
    const hiddenDetails = (monthPillar.branch && HIDDEN_STEMS_DETAILED[monthPillar.branch]) || [];
    const allQi = hiddenDetails.map(h => ({ ...h, tenGod: getTenGod(dayMaster.stemIndex, getStemIndex(h.stem)) }));
    return {
        dayMaster,
        dayStemIndex: dayMaster.stemIndex,
        dayStem: dayMaster.stem,
        dayElement: dayMaster.element,
        monthPillar,
        monthBranch: monthPillar.branch,
        monthBranchIndex: monthPillar.branchIndex,
        monthStem: monthPillar.stem,
        branchCat: (monthPillar.branch && BRANCH_CATEGORY[monthPillar.branch]) || '',
        hiddenDetails,
        allQi,
        otherStems,
        dayBranch: dayStemInfo ? dayStemInfo.branch : '',
        mainQi: hiddenDetails.length > 0 ? hiddenDetails[0] : null,
        midQi: hiddenDetails.length > 1 ? hiddenDetails[1] : null,
        resQi: hiddenDetails.length > 2 ? hiddenDetails[2] : null
    };
}

/**
 * 判定透干情況（第一/二/三優先）
 * @param {Object} inputs - extractGejuInputs 回傳
 * @returns {Object} { tenGodUsed, stemUsed, finalGeju, method, stepDetail, transparentPositions, stepResults }
 */
function judgeTransparentGeju(inputs) {
    const { dayStemIndex, monthBranch, branchCat, mainQi, midQi, resQi, allQi, otherStems, dayStem } = inputs;

    const mainTransparent = mainQi ? otherStems.filter(s => s.stemIndex === getStemIndex(mainQi.stem)) : [];
    const midTransparent = midQi ? otherStems.filter(s => s.stemIndex === getStemIndex(midQi.stem)) : [];
    const resTransparent = resQi ? otherStems.filter(s => s.stemIndex === getStemIndex(resQi.stem)) : [];

    let finalGeju = '';
    let method = '';
    let stepDetail = '';
    let tenGodUsed = '';
    let stemUsed = '';
    let transparentPositions = [];
    const stepResults = [];

    stepResults.push({
        step: 1, title: '查明月令藏干',
        desc: `月支為「${monthBranch}（${branchCat}）」，所藏天干如下：`,
        details: allQi.map(q => ({ stem: q.stem, type: q.type, desc: q.desc, power: q.power, tenGod: q.tenGod })),
        isInfo: true
    });

    if (mainTransparent.length > 0) {
        transparentPositions = mainTransparent.map(t => t.position);
        tenGodUsed = getTenGod(dayStemIndex, getStemIndex(mainQi.stem));
        stemUsed = mainQi.stem;
        finalGeju = tenGodUsed + '格';
        method = '第一優先：月令「本氣」透干';
        stepDetail = `月令「${monthBranch}」之本氣「${mainQi.stem}（${mainQi.desc}）」透出於「${transparentPositions.join('、')}」> 以透出之十神「${tenGodUsed}」定為「${finalGeju}」`;
        stepResults.push({ step: 2, title: '✓ 本氣透干（第一優先）', desc: `月支${monthBranch}的本氣「${mainQi.stem}」出現在${transparentPositions.join('、')}上。`, result: `本氣「${mainQi.stem}」→ ${tenGodUsed} → ${finalGeju}`, isMatch: true });
    } else if (midTransparent.length > 0) {
        transparentPositions = midTransparent.map(t => t.position);
        tenGodUsed = getTenGod(dayStemIndex, getStemIndex(midQi.stem));
        stemUsed = midQi.stem;
        finalGeju = tenGodUsed + '格';
        method = '第二優先：月令「中氣」透干';
        stepDetail = `月令「${monthBranch}」之本氣未透，中氣「${midQi.stem}（${midQi.desc}）」透出於「${transparentPositions.join('、')}」> 以透出之十神「${tenGodUsed}」定為「${finalGeju}」`;
        stepResults.push({ step: 2, title: '✗ 本氣未透干', desc: `月支${monthBranch}的本氣「${mainQi.stem}」未出現在年/月/時干上。`, isMatch: false });
        stepResults.push({ step: 3, title: '✓ 中氣透干（第二優先）', desc: `月支${monthBranch}的中氣「${midQi.stem}」出現在${transparentPositions.join('、')}上。`, result: `中氣「${midQi.stem}」→ ${tenGodUsed} → ${finalGeju}`, isMatch: true });
    } else if (resTransparent.length > 0) {
        transparentPositions = resTransparent.map(t => t.position);
        tenGodUsed = getTenGod(dayStemIndex, getStemIndex(resQi.stem));
        stemUsed = resQi.stem;
        finalGeju = tenGodUsed + '格';
        method = '第二優先：月令「餘氣」透干';
        stepDetail = `月令「${monthBranch}」之本氣與中氣未透，餘氣「${resQi.stem}（${resQi.desc}）」透出於「${transparentPositions.join('、')}」> 以透出之十神「${tenGodUsed}」定為「${finalGeju}」`;
        stepResults.push({ step: 2, title: '✗ 本氣未透干', desc: `月支${monthBranch}的本氣「${mainQi.stem}」未出現在年/月/時干上。`, isMatch: false });
        stepResults.push({ step: 3, title: '✗ 中氣未透干', desc: `月支${monthBranch}的中氣「${midQi.stem}」也未出現在天干上。`, isMatch: false });
        stepResults.push({ step: 4, title: '✓ 餘氣透干（第二優先）', desc: `月支${monthBranch}的餘氣「${resQi.stem}」出現在${transparentPositions.join('、')}上。`, result: `餘氣「${resQi.stem}」→ ${tenGodUsed} → ${finalGeju}`, isMatch: true });
    } else {
        tenGodUsed = getTenGod(dayStemIndex, getStemIndex(mainQi.stem));
        stemUsed = mainQi.stem;
        finalGeju = tenGodUsed + '格';
        method = '第三優先：皆無透干，直接取「本氣」';
        stepDetail = `月令「${monthBranch}」所藏之天干（${allQi.map(q => q.stem).join('、')}）完全沒有透出到天干。> 直接以月支「${monthBranch}」的本氣「${mainQi.stem}」對日主${dayStem}的十神「${tenGodUsed}」定為「${finalGeju}」`;
        stepResults.push({ step: 2, title: '✗ 本氣未透干', desc: `月支${monthBranch}的本氣「${mainQi.stem}」未出現在年/月/時干上。`, isMatch: false });
        if (midQi) { stepResults.push({ step: 3, title: '✗ 中氣未透干', desc: `月支${monthBranch}的中氣「${midQi.stem}」也未出現在天干上。`, isMatch: false }); }
        if (resQi) { stepResults.push({ step: 4, title: '✗ 餘氣未透干', desc: `月支${monthBranch}的餘氣「${resQi.stem}」同樣未出現在天干上。`, isMatch: false }); }
        stepResults.push({ step: stepResults.length + 1, title: '✓ 皆無透干，取本氣（第三優先）', desc: `月支${monthBranch}所有藏干皆未透出，直接以本氣「${mainQi.stem}」對日主${dayStem}定格局。`, result: `本氣「${mainQi.stem}」→ ${tenGodUsed} → ${finalGeju}`, isMatch: true });
    }

    return { tenGodUsed, stemUsed, finalGeju, method, stepDetail, transparentPositions, stepResults };
}

/**
 * 格局分類（建祿格、月刃格、正格、特殊格等）
 * @param {string} tenGodUsed
 * @param {string} finalGeju
 * @returns {Object} { finalGeju, isNormalPattern, category, patternType, gejuInfo }
 */
function classifyPattern(tenGodUsed, finalGeju) {
    let updatedGeju = finalGeju;
    if (tenGodUsed === '比肩') { updatedGeju = '建祿格'; }
    else if (tenGodUsed === '劫財') { updatedGeju = '月刃格'; }

    const isNormal = NORMAL_PATTERNS.hasOwnProperty(updatedGeju);
    let info, cat, ptype;

    if (isNormal) {
        info = NORMAL_PATTERNS[updatedGeju];
        cat = '普通格局（正格）';
        ptype = '正格';
    } else if (SPECIAL_PATTERNS.hasOwnProperty(updatedGeju)) {
        info = SPECIAL_PATTERNS[updatedGeju];
        cat = '特殊格局';
        ptype = '特殊格';
    } else if (updatedGeju.includes('從') || updatedGeju.includes('專旺') || updatedGeju.includes('化氣')) {
        cat = '特別格局（變格）';
        ptype = '變格';
    } else {
        cat = '普通格局（正格）';
        ptype = '正格';
    }
    return { finalGeju: updatedGeju, isNormalPattern: isNormal, category: cat, patternType: ptype, gejuInfo: info };
}

/**
 * 完整格局判定
 * @param {Object} baziResult - calculateBazi() 的結果
 * @returns {Object} 格局分析結果
 */
export function determineGeju(baziResult) {
    const inputs = extractGejuInputs(baziResult);
    if (!inputs) {
        return { error: '八字資料不足，無法判定格局' };
    }

    const { dayStemIndex, dayStem, dayElement, monthBranch, monthStem, branchCat, allQi, otherStems, dayMaster } = inputs;

    // 判定透干
    const judgment = judgeTransparentGeju(inputs);
    const { tenGodUsed, stemUsed, transparentPositions, stepResults, method, stepDetail } = judgment;
    let { finalGeju } = judgment;

    // 格局分類
    const patternInfo = classifyPattern(tenGodUsed, finalGeju);
    finalGeju = patternInfo.finalGeju;
    const { isNormalPattern, category, gejuInfo } = patternInfo;

    // 特殊檢驗
    const specialCheck = checkSpecialPattern(baziResult);
    const sameTenGodPositions = otherStems
        .filter(s => getTenGod(dayStemIndex, s.stemIndex) === tenGodUsed)
        .map(s => s.position);
    const branchPowerCheck = analyzeBranchPower(baziResult, monthBranch);
    const comprehensiveAnalysis = generateComprehensiveAnalysis(
        finalGeju, dayMaster, monthBranch, monthStem,
        tenGodUsed, stemUsed, transparentPositions, gejuInfo,
        sameTenGodPositions, branchPowerCheck, specialCheck
    );

    return {
        dayMaster: dayStem, dayElement, monthBranch, monthBranchCategory: branchCat, monthStem,
        hiddenDetails: allQi,
        stepResults, method, stepDetail,
        finalGeju, tenGodUsed, stemUsed, transparentPositions,
        category, isNormalPattern, gejuInfo,
        sameTenGodPositions, branchPowerCheck, specialCheck, comprehensiveAnalysis
    };
}

/**
 * 分析地支對月令的強化情況
 */
function analyzeBranchPower(baziResult, monthBranch) {
    if (!baziResult || !baziResult.pillars) {
        return { foundSanHe: false, foundSanHui: false, powerBonus: 0, detail: '無資料' };
    }
    const branches = baziResult.pillars.map(p => p.branch).filter(Boolean);
    const monthIdx = getBranchIndex(monthBranch);
    const monthElement = monthIdx >= 0 ? getBranchElement(monthIdx) : '';
    
    // 三合局
    const sanHe = {
        '申子辰': '水', '亥卯未': '木', '寅午戌': '火', '巳酉丑': '金'
    };
    
    // 三會方
    const sanHui = {
        '寅卯辰': '木', '巳午未': '火', '申酉戌': '金', '亥子丑': '水'
    };
    
    let foundSanHe = false;
    let foundSanHui = false;
    let detail = '';
    let powerBonus = 0;
    
    // 檢查三合（任三字）
    for (const [combo, el] of Object.entries(sanHe)) {
        const chars = combo.split('');
        const matchCount = chars.filter(c => branches.includes(c)).length;
        if (matchCount >= 2) {
            foundSanHe = true;
            powerBonus += 20;
            detail += `地支含「${combo}」三合${el}局，`;
        }
    }
    
    // 檢查三會
    for (const [combo, el] of Object.entries(sanHui)) {
        const chars = combo.split('');
        if (chars.every(c => branches.includes(c))) {
            foundSanHui = true;
            powerBonus += 15;
            detail += `地支成「${combo}」三會${el}方，`;
        }
    }
    
    if (!detail) {
        detail = '地支無特殊會合強化月令';
    }
    
    return {
        foundSanHe: foundSanHe,
        foundSanHui: foundSanHui,
        powerBonus: powerBonus,
        detail: detail || '無'
    };
}

/**
 * 檢查是否可能為特殊格局
 */
function checkSpecialPattern(baziResult) {
    const elements = baziResult.elementStrength;
    if (!elements || !elements.weighted) return null;
    
    const dayElement = (baziResult.dayMaster && baziResult.dayMaster.element) || '';
    if (!dayElement) return null;
    
    const selfStrength = elements.weighted[dayElement] || 0;
    const totalStrength = Object.values(elements.weighted).reduce((a, b) => a + b, 0);
    const selfRatio = totalStrength > 0 ? selfStrength / totalStrength : 0;
    
    const results = [];
    
    // 從財格：日主極弱，財星（日主所剋）極強
    const controlElement = ELEMENT_CYCLE[(ELEMENT_CYCLE.indexOf(dayElement) + 2) % 5];
    const controlRatio = totalStrength > 0 ? (elements.weighted[controlElement] || 0) / totalStrength : 0;
    
    if (selfRatio < 0.15 && controlRatio > 0.4) {
        results.push({
            name: '從財格',
            match: true,
            desc: `日主${dayElement}占比僅${(selfRatio*100).toFixed(0)}%，${controlElement}（財）占比${(controlRatio*100).toFixed(0)}%，傾向從財。`
        });
    }
    
    // 從殺格：日主極弱，剋日主的五行極強
    const controlMeElement = ELEMENT_CYCLE[(ELEMENT_CYCLE.indexOf(dayElement) + 3) % 5];
    const controlMeRatio = totalStrength > 0 ? (elements.weighted[controlMeElement] || 0) / totalStrength : 0;
    
    if (selfRatio < 0.15 && controlMeRatio > 0.4) {
        results.push({
            name: '從殺格',
            match: true,
            desc: `日主${dayElement}占比僅${(selfRatio*100).toFixed(0)}%，${controlMeElement}（官殺）占比${(controlMeRatio*100).toFixed(0)}%，傾向從殺。`
        });
    }
    
    // 專旺格：某五行占比極高（>60%）
    const sorted = Object.entries(elements.weighted).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0 && sorted[0][1] / totalStrength > 0.55 && sorted[0][0] === dayElement) {
        results.push({
            name: '專旺格（一行得氣）',
            match: true,
            desc: `「${sorted[0][0]}」五行占比${((sorted[0][1]/totalStrength)*100).toFixed(0)}%，且為日主所屬，傾向專旺。`
        });
    }
    
    return results.length > 0 ? results : null;
}

/**
 * 生成綜合分析文字
 */
function generateComprehensiveAnalysis(
    finalGeju, dayMaster, monthBranch, monthStem,
    tenGodUsed, stemUsed, transparentPositions, gejuInfo,
    sameTenGodPositions, branchPowerCheck, specialCheck
) {
    let lines = [];
    
    lines.push(`【${finalGeju}】`);
    lines.push('');
    
    if (gejuInfo) {
        lines.push(`分類：${gejuInfo.category}`);
        lines.push(`處理方法：${gejuInfo.treatment}`);
        lines.push('');
        lines.push(gejuInfo.desc);
        lines.push('');
        lines.push(gejuInfo.analysis);
        lines.push('');
        if (gejuInfo.advice) {
            lines.push(`💡 ${gejuInfo.advice}`);
        }
        if (gejuInfo.classicQuote) {
            lines.push('');
            lines.push(`📖 ${gejuInfo.classicQuote}`);
        }
    }
    
    // 格局助力
    if (sameTenGodPositions.length > 0) {
        lines.push('');
        lines.push(`🔹 格局加強：${sameTenGodPositions.join('、')}也出現${tenGodUsed}，格局力量更為純粹。`);
    }
    
    // 地支助力
    if (branchPowerCheck && branchPowerCheck.powerBonus > 0) {
        lines.push('');
        lines.push(`🔹 地支強化：${branchPowerCheck.detail}月令力量得到增強。`);
    }
    
    // 特殊格局提醒
    if (specialCheck && specialCheck.length > 0) {
        lines.push('');
        lines.push('⚠️ 注意：以下特殊格局傾向值得關注：');
        specialCheck.forEach(s => {
            lines.push(`  · ${s.name}：${s.desc}`);
        });
    }
    
    return lines.join('\n');
}

// ============================================================
// 工具函數（參考 bazi.js 的全局變數，不重複宣告 const）
// ============================================================

// 注意：ELEMENT_CYCLE, STEMS_LIST(STEMS), BRANCHES_LIST(BRANCHES),
// STEM_ELEMENT_MAP(STEM_ELEMENT), STEM_YIN_YANG_MAP(STEM_YIN_YANG),
// BRANCH_ELEMENT_MAP(BRANCH_ELEMENT) 已在 bazi.js 中以不同名稱定義。
// 此處使用相容映射以避免 const 重複宣告錯誤。

/** 天干索引查詢（映射到 bazi.js 的 STEMS） */
export function getStemIndex(stem) {
    if (typeof STEMS !== 'undefined') return STEMS.indexOf(stem);
    return ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'].indexOf(stem);
}

/** 地支索引查詢 */
function getBranchIndex(branch) {
    if (typeof BRANCHES !== 'undefined') return BRANCHES.indexOf(branch);
    return ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'].indexOf(branch);
}

/** 五行元素循環 */
function getElementCycle() {
    if (typeof ELEMENT_CYCLE !== 'undefined') return ELEMENT_CYCLE;
    return ['木', '火', '土', '金', '水'];
}

/** 天干五行 */
function getStemElement(stemIdx) {
    if (typeof STEM_ELEMENT !== 'undefined') return STEM_ELEMENT[stemIdx];
    return ['木','木','火','火','土','土','金','金','水','水'][stemIdx];
}

/** 天干陰陽 */
function getStemYinYang(stemIdx) {
    if (typeof STEM_YIN_YANG !== 'undefined') return STEM_YIN_YANG[stemIdx];
    return [0,1,0,1,0,1,0,1,0,1][stemIdx];
}

/** 地支五行 */
function getBranchElement(branchIdx) {
    if (typeof BRANCH_ELEMENT !== 'undefined') return BRANCH_ELEMENT[branchIdx];
    return ['水','土','木','木','土','火','火','土','金','金','土','水'][branchIdx];
}

function getElementRelation(dayElement, otherElement) {
    if (dayElement === otherElement) return 'same';
    const cycle = getElementCycle();
    const dayIdx = cycle.indexOf(dayElement);
    const otherIdx = cycle.indexOf(otherElement);
    if ((dayIdx + 1) % 5 === otherIdx) return 'generate';
    if ((otherIdx + 1) % 5 === dayIdx) return 'generatedBy';
    if ((dayIdx + 2) % 5 === otherIdx) return 'control';
    if ((otherIdx + 2) % 5 === dayIdx) return 'controlledBy';
    return 'unknown';
}

export function getTenGod(dayStemIndex, otherStemIndex) {
    if (otherStemIndex < 0 || otherStemIndex > 9) return '';
    const dayElement = getStemElement(dayStemIndex);
    const otherElement = getStemElement(otherStemIndex);
    const dayYin = getStemYinYang(dayStemIndex);
    const otherYin = getStemYinYang(otherStemIndex);
    const relation = getElementRelation(dayElement, otherElement);
    const sameYinYang = (dayYin === otherYin);
    switch (relation) {
        case 'same': return sameYinYang ? '比肩' : '劫財';
        case 'generate': return sameYinYang ? '食神' : '傷官';
        case 'control': return sameYinYang ? '偏財' : '正財';
        case 'controlledBy': return sameYinYang ? '七殺' : '正官';
        case 'generatedBy': return sameYinYang ? '偏印' : '正印';
        default: return '';
    }
}

// ============================================================
// 渲染函數
// ============================================================

/**
 * 渲染格局分析結果到指定 DOM 容器
 * @param {Object} gejuResult - determineGeju() 的結果
 * @param {HTMLElement} container - 要渲染到的容器
 */
export function renderGeju(gejuResult, container) {
    if (!container) return;
    
    if (!gejuResult || gejuResult.error) {
        container.innerHTML = `
            <div class="card">
                <div class="card-title">格 局</div>
                <div style="text-align:center;padding:30px;color:var(--text-muted);">
                    ${gejuResult ? gejuResult.error : '請先排盤以獲取八字資料'}
                </div>
            </div>
        `;
        return;
    }

    const gi = gejuResult.gejuInfo;

    let html = '';

    // ===== 格局結果總覽 =====
    html += `
        <div class="geju-overview">
            <div class="geju-badge ${gejuResult.isNormalPattern ? 'geju-normal' : 'geju-special'}">
                ${gejuResult.category}
            </div>
            <div class="geju-main-title">${gejuResult.finalGeju}</div>
            <div class="geju-method">${gejuResult.method}</div>
            <div class="geju-daymaster">
                日主 <span class="geju-dm-stem">${gejuResult.dayMaster}${gejuResult.dayElement}</span>
                · 月令 <span class="geju-month">${gejuResult.monthBranch}（${gejuResult.monthBranchCategory}）</span>
                · 月干 ${gejuResult.monthStem}
            </div>
        </div>
    `;

    // ===== 步驟面板（摺疊式） =====
    html += `<div class="geju-steps">`;
    html += `<div class="card-title">判定步驟</div>`;
    
    gejuResult.stepResults.forEach((step, idx) => {
        const isInfo = step.isInfo;
        const isMatch = step.isMatch;
        const icon = isInfo ? '📋' : (isMatch ? '✅' : '❌');
        const statusClass = isInfo ? '' : (isMatch ? 'geju-step-match' : 'geju-step-skip');
        
        html += `
            <div class="geju-step ${statusClass}">
                <div class="geju-step-header" onclick="this.parentElement.classList.toggle('geju-step-open')">
                    <span class="geju-step-icon">${icon}</span>
                    <span class="geju-step-title">${step.title}</span>
                    <span class="geju-step-arrow">▼</span>
                </div>
                <div class="geju-step-body">
                    <div class="geju-step-desc">${step.desc}</div>
                    ${step.details ? renderHiddenStemsTable(step.details) : ''}
                    ${step.result ? `<div class="geju-step-result">${step.result}</div>` : ''}
                </div>
            </div>
        `;
    });
    
    html += `</div>`;

    // ===== 判定詳情 =====
    html += `
        <div class="card">
            <div class="card-title">判定依據</div>
            <div class="geju-detail-text">${gejuResult.stepDetail}</div>
        </div>
    `;

    // ===== 格局資訊 =====
    if (gi) {
        const treatmentClass = gi.category === '吉神（善神）' ? 'geju-good' : 'geju-bad';
        
        html += `
            <div class="card">
                <div class="card-title">格局解析</div>
                <div class="geju-info-grid">
                    <div class="geju-info-item">
                        <span class="geju-info-label">格局類別</span>
                        <span class="geju-info-value ${treatmentClass}">${gi.category}</span>
                    </div>
                    <div class="geju-info-item">
                        <span class="geju-info-label">處理方法</span>
                        <span class="geju-info-value">${gi.treatment}</span>
                    </div>
                    ${gi.fav ? `
                    <div class="geju-info-item">
                        <span class="geju-info-label">喜神</span>
                        <span class="geju-info-value" style="color:var(--wood);">${gi.fav}</span>
                    </div>
                    ` : ''}
                    ${gi.unfav ? `
                    <div class="geju-info-item">
                        <span class="geju-info-label">忌神</span>
                        <span class="geju-info-value" style="color:var(--fire);">${gi.unfav}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="geju-desc-box">
                    <div class="geju-desc-text">${gi.desc}</div>
                    <div class="geju-analysis-text">${gi.analysis}</div>
                    ${gi.classicQuote ? `<div class="geju-quote">${gi.classicQuote}</div>` : ''}
                    <div class="geju-advice-text">💡 ${gi.advice}</div>
                </div>
            </div>
        `;
    }

    // ===== 格局助力 =====
    const hasBonus = (gejuResult.sameTenGodPositions && gejuResult.sameTenGodPositions.length > 0) 
        || (gejuResult.branchPowerCheck && gejuResult.branchPowerCheck.powerBonus > 0);
    
    if (hasBonus) {
        html += `<div class="card"><div class="card-title">格局助力分析</div>`;
        
        if (gejuResult.sameTenGodPositions && gejuResult.sameTenGodPositions.length > 0) {
            html += `
                <div class="geju-bonus-item">
                    <span class="geju-bonus-icon">🔹</span>
                    <span><strong>天干呼應：</strong>${gejuResult.sameTenGodPositions.join('、')}也出現${gejuResult.tenGodUsed}，格局力量更為純粹。</span>
                </div>
            `;
        }
        
        if (gejuResult.branchPowerCheck && gejuResult.branchPowerCheck.powerBonus > 0) {
            html += `
                <div class="geju-bonus-item">
                    <span class="geju-bonus-icon">🔹</span>
                    <span><strong>地支強化：</strong>${gejuResult.branchPowerCheck.detail}月令力量得到增強。</span>
                </div>
            `;
        }
        
        html += `</div>`;
    }

    // ===== 特殊格局提示 =====
    if (gejuResult.specialCheck && gejuResult.specialCheck.length > 0) {
        html += `
            <div class="card">
                <div class="card-title">⚠️ 特殊格局傾向</div>
        `;
        gejuResult.specialCheck.forEach(s => {
            html += `
                <div class="geju-special-item">
                    <div class="geju-special-name">${s.name}</div>
                    <div class="geju-special-desc">${s.desc}</div>
                </div>
            `;
        });
        html += `<div style="margin-top:10px;font-size:0.8rem;color:var(--text-muted);">以上僅為傾向判斷，若與主格局衝突，應以月令格局為主。</div>`;
        html += `</div>`;
    }

    // ===== 綜合分析 =====
    html += `
        <div class="card lm2-pattern-card">
            <div class="card-title">綜合命理分析</div>
            <div class="summary-box">${gejuResult.comprehensiveAnalysis}</div>
        </div>
    `;

    // ===== 格局速查表 =====
    html += `
        <div class="card">
            <div class="card-title" style="cursor:pointer;" onclick="const body=this.parentElement.querySelector('.geju-ref-body');body.classList.toggle('hidden');this.querySelector('.geju-ref-arrow').textContent=body.classList.contains('hidden')?'▶':'▼';">
                <span>📖 正八格速查表</span>
                <span class="geju-ref-arrow" style="margin-left:auto;font-size:0.7rem;">▶</span>
            </div>
            <div class="geju-ref-body hidden">
                ${renderPatternReference()}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

/**
 * 渲染藏干表格
 */
function renderHiddenStemsTable(details) {
    if (!details || details.length === 0) return '';
    
    let html = `<div class="geju-hidden-grid">`;
    details.forEach(d => {
        const powerBar = d.power !== undefined ? `<div class="geju-power-bar"><div class="geju-power-fill" style="width:${d.power}%"></div></div>` : '';
        html += `
            <div class="geju-hidden-item">
                <div class="geju-hidden-stem ${d.type === '本氣' ? 'geju-main-stem' : ''}">${d.stem}</div>
                <div class="geju-hidden-type">${d.type}</div>
                <div class="geju-hidden-ten">${d.tenGod || ''}</div>
                ${powerBar}
                <div class="geju-hidden-desc">${d.desc || ''}</div>
            </div>
        `;
    });
    html += `</div>`;
    return html;
}

/**
 * 渲染正八格速查表
 */
function renderPatternReference() {
    let html = '';
    const categories = {
        '吉神（順用）': ['正官格', '正財格', '偏財格', '正印格', '食神格'],
        '凶神（逆用）': ['七殺格', '偏印格', '傷官格']
    };
    
    for (const [cat, patterns] of Object.entries(categories)) {
        html += `<div class="geju-ref-cat"><span class="geju-ref-cat-label">${cat}</span></div>`;
        html += `<div class="geju-ref-grid">`;
        patterns.forEach(pName => {
            const p = NORMAL_PATTERNS[pName];
            if (p) {
                html += `
                    <div class="geju-ref-card">
                        <div class="geju-ref-name">${pName}</div>
                        <div class="geju-ref-treat">${p.treatment}</div>
                        <div class="geju-ref-desc">${p.desc.substring(0, 30)}…</div>
                        <div class="geju-ref-fav">喜：${p.fav}</div>
                        <div class="geju-ref-unfav">忌：${p.unfav}</div>
                    </div>
                `;
            }
        });
        html += `</div>`;
    }
    
    return html;
}

// ============================================================
// 匯出（供 app.js 使用）
// ============================================================

if (typeof window !== 'undefined') {
    window.determineGeju = determineGeju;
    window.renderGeju = renderGeju;
    window.NORMAL_PATTERNS = NORMAL_PATTERNS;
    window.SPECIAL_PATTERNS = SPECIAL_PATTERNS;
    window.HIDDEN_STEMS_DETAILED = HIDDEN_STEMS_DETAILED;
}
