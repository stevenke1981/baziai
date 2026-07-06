/**
 * lunming.js — 論命引擎
 * 基於《刻京臺增補淵海子平大全》(子平淵海大全)
 * 明 · 李欽 增補 · 萬曆庚子年刊本
 * 
 * 提供：
 * 1. 經典原文結構化資料
 * 2. 分類瀏覽
 * 3. 與八字排盤結果連結的論命分析
 */

// ============================================================
// 經典資料庫 — 子平淵海大全
// ============================================================

export const LUNMING = {

    // ==================== 1. 書籍資訊 ====================
    info: {
        title: '刻京臺增補淵海子平大全',
        altTitle: '子平淵海大全',
        author: '明 · 李欽 增補',
        dynasty: '明萬曆庚子（二十八年）閩書林劉龍田喬山堂刊本',
        description: '李氏承宋徐子平《淵海》《淵源》二書，參合遺佚，總歸一帙，加之詩訣起例，增解字義，而子平之法粲然大備。',
        volumes: 6
    },

    // ==================== 2. 天干地支暗藏總訣 ====================
    hiddenStems: {
        title: '論天干地支暗藏總訣',
        content: '子宮癸水在其中，丑癸辛金己土同；寅宮甲木兼丙戊，卯宮乙木獨相逢。\n' +
                 '辰藏乙戊三分癸，巳中庚金丙戊叢；午宮丁火併己土，未宮乙己丁共宗。\n' +
                 '申位庚金壬水戊，酉宮辛金獨豐隆；戌宮辛金及丁戊，亥藏壬甲是真蹤。'
    },

    // ==================== 3. 十干喜忌 ====================
    tenStemPreference: {
        title: '五干屬陽喜合 · 五干屬陰喜沖',
        yang: [
            { stem: '甲', desc: '見甲：為比肩、兄弟。見乙：為劫財、敗財，剋父及妻。見丙：為食神、天廚、壽星，為男。見丁：為傷官、退財、耗氣，子甥。見戊：為偏財、偏妻、偏妾，剋子。見己：為正財、正妻，剋母，為合神。見庚：為偏官、七殺、官鬼、將星。見辛：為正官、祿馬、榮神，父母。見壬：為倒食、偏印、梟神，剋女。見癸：為印綬、正人、君子，產業。' },
            { stem: '丙', desc: '見甲：為偏印、梟神。見乙：為正印、產業。見丙：為比肩、兄弟。見丁：為劫財、敗財。見戊：為食神、天廚。見己：為傷官。見庚：為偏財。見辛：為正財。見壬：為七殺。見癸：為正官。' },
            { stem: '戊', desc: '見甲：為七殺。見乙：為正官。見丙：為偏印。見丁：為正印。見戊：為比肩。見己：為劫財。見庚：為食神。見辛：為傷官。見壬：為偏財。見癸：為正財。' },
            { stem: '庚', desc: '見甲：為偏財。見乙：為正財。見丙：為七殺。見丁：為正官。見戊：為偏印。見己：為正印。見庚：為比肩。見辛：為劫財。見壬：為食神。見癸：為傷官。' },
            { stem: '壬', desc: '見甲：為食神。見乙：為傷官。見丙：為偏財。見丁：為正財。見戊：為七殺。見己：為正官。見庚：為偏印。見辛：為正印。見壬：為比肩。見癸：為劫財。' }
        ],
        yin: [
            { stem: '乙', desc: '見甲：為劫財、逐馬，剋妻。見乙：為比肩、兄弟、朋友。見丙：為傷官、小人、盜氣，為姪。見丁：為食神、天廚、壽星，子孫。見戊：為正財、正妻，剋母。見己：為偏財、偏妻、偏妾，剋子。見庚：為正官、祿馬，剋父母。見辛：為偏官、七殺、官鬼，媒人。見壬：為印綬、正人、君子，忌殺。見癸：為倒食、偏印、梟神，剋母。' },
            { stem: '丁', desc: '見甲：為正印。見乙：為偏印。見丙：為劫財。見丁：為比肩。見戊：為傷官。見己：為食神。見庚：為正財。見辛：為偏財。見壬：為正官。見癸：為七殺。' },
            { stem: '己', desc: '見甲：為正官。見乙：為七殺。見丙：為正印。見丁：為偏印。見戊：為劫財。見己：為比肩。見庚：為傷官。見辛：為食神。見壬：為正財。見癸：為偏財。' },
            { stem: '辛', desc: '見甲：為正財。見乙：為偏財。見丙：為正官。見丁：為七殺。見戊：為正印。見己：為偏印。見庚：為劫財。見辛：為比肩。見壬：為傷官。見癸：為食神。' },
            { stem: '癸', desc: '見甲：為傷官。見乙：為食神。見丙：為正財。見丁：為偏財。見戊：為正官。見己：為七殺。見庚：為正印。見辛：為偏印。見壬：為劫財。見癸：為比肩。' }
        ]
    },

    // ==================== 4. 干支體象 — 天干 ====================
    stemImages: [
        { stem: '甲', title: '甲木', poem: '甲木天干作首排，原無枝葉與根荄；欲存天地千年久，直向沙泥萬丈埋。斷就棟樑金得用，化成灰炭火為災；蠢然塊物無機事，一任春秋自往來。', meaning: '甲木為參天大木，性直質樸。喜金(庚辛)雕琢成器，忌火(丙丁)焚化。' },
        { stem: '乙', title: '乙木', poem: '乙木根荄種得深，只宜陽地不宜陰；漂浮最怕多逢水，刻斷何當苦用金。南去火炎災不淺，西行土重禍尤侵；棟樑不是連根木，辨別工夫好用心。', meaning: '乙木為花草之木，根深而柔。忌水多漂蕩、金多傷剋，喜陽暖之地。' },
        { stem: '丙', title: '丙火', poem: '丙火明明一太陽，原從正大立綱常；洪光不獨窺千里，巨焰猶能遍八荒。出世肯為浮木子，傳生不作濕泥娘；江湖死水安能剋，惟怕成林木作殃。', meaning: '丙火為太陽之火，光明正大。不畏水剋，惟忌木盛(木多火塞)。' },
        { stem: '丁', title: '丁火', poem: '丁火其形一燭燈，太陽相見奪光明；得時能鑄千金鐵，失令難鎔一寸金。雖少乾柴猶可引，縱多濕木不能生；其間衰旺當分曉，旺比一爐衰一檠。', meaning: '丁火為燈燭之火，柔和而亮。需乾柴(甲木)生助，濕木(乙木)反礙。' },
        { stem: '戊', title: '戊土', poem: '戊土城牆堤岸同，振江河海要根重；柱中帶合形還壯，日下乘虛勢必崩。力薄不勝金漏洩，功成安用木疏通；平生最要東南健，身旺東南健失中。', meaning: '戊土為城牆之土，厚重穩固。喜木疏土、金洩秀，忌水多土盪。' },
        { stem: '己', title: '己土', poem: '己土田園屬四維，坤深能為萬物基；水金旺處身還弱，火土功成局最奇。失令豈能埋劍戟，得時方可用鎡基；漫夸印旺兼多合，不遇刑沖總不宜。', meaning: '己土為田園之土，柔和養物。喜火土相助，忌水多土盪、金洩氣。' },
        { stem: '庚', title: '庚金', poem: '庚金頑鈍性偏剛，火制功成怕水鄉；夏產東南過煆煉，秋生西北亦光芒。水深反是他相剋，木旺能令我自傷；戊己干支重遇土，不逢衝破即埋藏。', meaning: '庚金為頑鐵剛金，喜火(丙丁)鍛煉成器，忌水多金寒、土多金埋。' },
        { stem: '辛', title: '辛金', poem: '辛金珠玉性通靈，最愛陽和沙水清；成就不勞炎火煆，資扶偏愛濕泥生。水多火旺宜西北，水冷金寒要丙丁；坐祿通根身旺地，何愁厚土沒其形。', meaning: '辛金為珠玉之金，性靈秀。喜水淘洗、土生扶，忌火多鎔化、土多埋沒。' },
        { stem: '壬', title: '壬水', poem: '壬水汪洋併百川，漫流天下總無邊；干支多聚成漂蕩，火土重逢涸本源。養性結胎須未午，長生歸祿屬乾坤；身強原自無財祿，西北行程厄少年。', meaning: '壬水為汪洋大水，奔流不息。喜火土制約成堤岸，忌水多泛濫。' },
        { stem: '癸', title: '癸水', poem: '癸水應非雨露麼，根通亥子即江河；柱無坤坎還身弱，局有財官不尚多。申子辰全成上格，寅午戌備要中和；假饒火土生深夏，西北行程豈太過。', meaning: '癸水為雨露之水，至陰至柔。喜金生水、火土調候，忌水多泛濫。' }
    ],

    // ==================== 5. 干支體象 — 地支 ====================
    branchImages: [
        { branch: '子', title: '子水', poem: '月支子水占魁名，溪澗汪洋不盡清；天道陽回行土旺，人間水暖寄金生。若逢午破應無定，縱遇卯刑還有情；柱內申辰來合局，即成江海發濤聲。' },
        { branch: '丑', title: '丑土', poem: '隆冬建丑怯冰霜，誰識天時轉二陽；暖土誠能生萬物，寒金難道只深藏。刑沖戌未非無用，類聚雞蛇信有方；若在日時多水木，直須行入巽離鄉。' },
        { branch: '寅', title: '寅木', poem: '艮宮之木建於春，氣聚三陽火在寅；志合蛇猴三貴客，類同卯未一家人。超凡入聖惟逢午，破祿傷提獨慮申；四柱火多嫌火地，從來燥木不南奔。' },
        { branch: '卯', title: '卯木', poem: '卯木繁華稟氣深，仲春難道不嫌金；庚辛疊見愁申酉，亥子重來忌癸壬。禍見六衝應落葉，喜逢三合便成林；若歸時日秋金重，更向西行患不禁。' },
        { branch: '辰', title: '辰土', poem: '辰當三月水泥溫，長養堪培萬木根；雖是甲衰乙餘氣，縱然入墓癸還魂。直須一鑰能開庫，若遇三沖即破門；水木重逢西北運，只愁原土不能存。' },
        { branch: '巳', title: '巳火', poem: '巳當初夏火增光，造化流行正六陽；失令庚金生賴母，得時戊土祿隨娘。三形傳送翻無害，一撞登明便有傷；行到東南生發地，燒天烈火豈尋常。' },
        { branch: '午', title: '午火', poem: '午月炎炎火正升，六陽氣續一陰生；庚金失位身無用，己土歸垣祿有成。申子齊來能戰剋，戌寅同見越光明；東南正是身強地，西北休囚已喪形。' },
        { branch: '未', title: '未土', poem: '未月陰深火漸衰，藏官藏印不藏財；近無亥卯形難變，遠帶刑沖庫亦開。無火怕行金水去，多寒偏愛丙丁來；用神喜忌當分曉，莫把圭璋作石猜。' },
        { branch: '申', title: '申金', poem: '申金剛健月支逢，水土長生在此宮；巳午爐中成劍戟，子辰局裡得光鋒。木多無火終能勝，土重埋金卻有凶；欲識斯神何所似，溫柔珠玉不相同。' },
        { branch: '酉', title: '酉金', poem: '八月從魁已得名，羨他金白水流清；火多東去愁寅卯，木旺南行怕丙丁。柱見水泥應有用，運臨西北豈無情；假能三合能堅銳，不比頑金未煉成。' },
        { branch: '戌', title: '戌土', poem: '九月河魁性最剛，漫雲於此物收藏；洪爐巨火能成就，鈍鐵頑金賴主張。海窟沖龍生雨露，山頭合虎動文章；天羅雖是迷魂陣，火命逢之獨有傷。' },
        { branch: '亥', title: '亥水', poem: '登明之位水源深，雨雪生寒值六陰；必待勝光方用土，不逢傳送浪多金。五湖歸聚原成象，三合羈留正有心；欲識乾坤和煖處，即從艮震巽離尋。' }
    ],

    // ==================== 6. 五行生剋制化 ====================
    fiveElements: {
        title: '論五行生剋制化',
        sections: [
            { title: '五行相濟', content: '金旺得火，方成器皿；火旺得水，方成相濟；水旺得土，方成池沼；土旺得木，方能疏通；木旺得金，方成棟樑。' },
            { title: '五行相生之過', content: '金賴土生，土多金埋；土賴火生，火多土焦；火賴木生，木多火熾；木賴水生，水多木漂；水賴金生，金多水濁。' },
            { title: '相生反剋', content: '金能生水，水多金沉；水能生木，木盛水縮；木能生火，火多木焚；火能生土，土多火埋；土能生金，金多土變。' },
            { title: '相剋反侮', content: '金能剋木，木堅金缺；木能剋土，土重木折；土能剋水，水多土流；水能剋火，火多水熱；火能剋金，金多火熄。' },
            { title: '衰弱逢剋', content: '金衰遇火，必見銷鎔；火弱逢水，必為熄滅；水弱逢土，必為淤塞；土衰遇木，必遭傾陷；木弱逢金，必為砍折。' },
            { title: '強旺宜洩', content: '強金得水，方挫其鋒；強水得木，方泄其勢；強木得火，方化其頑；強火得土，方止其燄；強土得金，方制其害。' }
        ]
    },

    // ==================== 7. 十神論 ====================
    tenGodTheory: {
        title: '淵海子平十神',
        general: '一曰官，分之陰陽，曰官、曰殺；二曰財，分之陰陽，曰正財、偏財；三曰生氣之陰陽，曰印綬、曰倒食；四曰竊氣之陰陽，曰食神、曰傷官；五曰同類之陰陽，曰劫財、曰陽刃。大抵貴賤壽夭死生，皆不出於五者。',
        keyPoints: [
            { god: '正官', content: '正官乃貴氣之星，主人仁慈正直、尊嚴端莊。官星宜旺不宜衰，宜透不宜藏。官星被傷則主災禍。' },
            { god: '七殺', content: '七殺乃凶暴之神，有制則為偏官、為權柄，無制則為七殺、為禍害。殺旺有制主武職權威，殺旺無制主貧賤夭折。' },
            { god: '正財', content: '正財乃誠實之財，主人勤儉守成、量力而為。財星宜旺，但身弱財旺則富屋貧人。' },
            { god: '偏財', content: '偏財乃眾人之財，主人慷慨大方、善於理財。偏財旺者多為經商之人，來往四方。' },
            { god: '正印', content: '正印乃生氣之母，主人仁慈聰慧、知書達禮。印星宜旺，旺則富貴福壽，為人厚道。' },
            { god: '偏印', content: '偏印（梟神）乃偏激之神，主人孤獨乖僻、心機深沉。偏印旺而無制，主心術不正。' },
            { god: '食神', content: '食神乃福壽之神，主人溫和敦厚、享福安閒。食神旺相，主衣食豐足、兒孫滿堂。' },
            { god: '傷官', content: '傷官乃盜氣之神，主人聰明傲物、多才多藝。傷官見官為禍百端，傷官傷盡最為奇。' },
            { god: '比肩', content: '比肩乃同類之助，主人堅毅果斷、獨立自強。比肩多者主剋父剋妻，多為人勞碌。' },
            { god: '劫財', content: '劫財乃敗財之星，主人好爭好鬥、衝動冒險。劫財旺者主破財、剋妻、爭奪之事。' }
        ]
    },

    // ==================== 8. 疾病論 ====================
    diseaseTheory: {
        title: '論疾病',
        content: '夫疾病者，乃精神氣血之所主，各有感傷；內曰臟腑，外曰肢體。八字干支，五行生剋之義，取傷重者而斷之；五行干支太旺、不及俱病。',
        organMap: [
            { element: '木', stemOrgan: '甲肝，乙膽', branchOrgan: '寅臂肢，卯目手，辰背胸', 
              disease: '木命見庚辛申酉多者，肝膽病。內則驚精虛怯、癆瘵嘔血、頭眩目暗、痰喘頭風腳氣、左癱右瘓。外則皮膚乾燥、眼目之疾。',
              quote: '筋骨疼痛，蓋因木被金傷。' },
            { element: '火', stemOrgan: '丙小腸，丁心', branchOrgan: '巳面齒，午心腹，未脾胸',
              disease: '火命見水及亥子旺地，主小腸、心經之患。內則顛啞、口心疼痛、急緩驚風、禿舌口咽啞、潮熱發狂。外則眼暗失明、瘡毒膿血。',
              quote: '眼暗目昏，多是火遭水剋。' },
            { element: '土', stemOrgan: '戊胃，己脾', branchOrgan: '丑肚腹，辰背胸，戌背肺',
              disease: '土命見木及寅卯旺鄉，主脾、胃經受傷。內主膈食翻胃氣噎、蠱脹泄瀉黃腫。外則左手口腹有疾、皮膚燥澀。',
              quote: '土虛乘木旺之鄉，脾傷定論。' },
            { element: '金', stemOrgan: '庚大腸，辛肺', branchOrgan: '申咳疾，酉肝肺，戌背肺',
              disease: '金命見火及巳午旺處，主大腸、肺經受病。咳嗽喘吐、腸風痔漏、勞怯之症。外則皮膚枯燥、瘋鼻赤疽癰。',
              quote: '金弱遇火炎之地，血疾無疑。' },
            { element: '水', stemOrgan: '壬膀胱，癸腎臟', branchOrgan: '子疝氣，亥頭肝',
              disease: '水命見土及四季旺月，主膀胱、腎經受病。內則遺精白濁、盜汗鬼交、虛損耳聾。外則牙痛疝氣、偏墜腰疼。',
              quote: '下元冷疾，只緣水值土傷。' }
        ]
    },

    // ==================== 9. 性情論 ====================
    characterTheory: {
        title: '論性情',
        content: '性情者，乃喜怒哀樂愛惡欲之所發，仁義禮智信之所布，父精母血而成形；皆金木水火土之關係也。',
        items: [
            { element: '木', title: '木曰曲直', taste: '酸', virtue: '仁',
              good: '惻隱之心、慈祥愷悌、濟物利民、恤孤念寡、恬靜清高、人物清秀、體長面色青白。木盛多仁。',
              excess: '太過則折，執物性偏。',
              lack: '不及少仁、心生妒意。' },
            { element: '火', title: '火曰炎上', taste: '苦', virtue: '禮',
              good: '辭讓之心、恭敬威儀、質重淳樸、人物面上尖下圓、精神閃爍、言語辭急。',
              excess: '太過則足恭聰明、性燥鬚赤。',
              lack: '不及則黃瘦、尖巧妒毒、有始無終。' },
            { element: '金', title: '金曰從革', taste: '辛辣', virtue: '義',
              good: '羞惡之心、仗義疏財、敢勇豪傑、知廉恥、主人中庸、骨肉相應、方面白色、聲音清響、剛毅有決。',
              excess: '太過則自無仁心、好鬥貪慾。',
              lack: '不及則多三思、少果決慳吝、作事挫志。' },
            { element: '水', title: '水曰潤下', taste: '咸', virtue: '智',
              good: '是非之心、志足多謀、機關深遠、文學聰明。',
              excess: '太過則孤介硬吝、不得眾情、沉毒狠戾、失信顛倒。',
              lack: '不及則膽小無謀，反主人物瘦小。' },
            { element: '土', title: '土曰稼穡', taste: '甘', virtue: '信',
              good: '誠實之心、敦厚至誠、言行相顧、好敬神佛、主人背圓腰闊、鼻大口方、眉目清秀、面如牆壁而色黃、度量寬厚。',
              excess: '太過則愚朴、古執如痴。',
              lack: '不及則顏色似憂、鼻低面偏、聲重濁、樸實執拗。' }
        ]
    },

    // ==================== 10. 論命要訣 ====================
    essence: {
        title: '論命要訣',
        items: [
            { title: '以日為主', content: '以日為主，年為本，月為提綱，時為輔佐。大要看日加臨於甚度，或身旺？或身弱？又看地支有何格局，金木水火土之數，後看月令中何者旺，又看歲運有何旺，卻次日下消詳。此非拘之一隅之說也。' },
            { title: '四柱輕重', content: '年為本，帶官星印綬，則早年有官出自祖宗。月為提綱，帶官星印綬，則慷慨聰明、見識高人。時為輔佐，平生操履。若年月日有吉神，則時歸生旺之處；若凶神，則要歸時制伏之鄉。' },
            { title: '太歲', content: '太歲乃年中天子，故不可犯，犯之則凶。日犯歲君，災殃必重；五行有救，其年反必招財。大抵太歲不可傷之，相生者吉。' },
            { title: '大運', content: '子平之法，大運看支，歲君看干。干旺宜行衰運，干弱宜旺運。正乃干弱求氣旺之藉，有餘則不足之營，須要通變。' },
            { title: '傷官', content: '傷官務要傷盡；傷之不盡，官來乘旺，其禍不可勝言。傷官見官，為禍百端。傷官主人多才藝、傲物氣高。運一逢官，禍不可言。' },
            { title: '月令', content: '月令者，天元也，今運就月上起，譬之樹苗，樹之見苗，則知名；月之用神，則知其格，故謂交運如同接木。' }
        ]
    },

    // ==================== 11. 詩訣精選 ====================
    poems: {
        title: '詩訣精選',
        items: [
            { type: '傷官', content: '傷官傷盡最為奇，尤恐傷多返不宜；此格局中千變化，推尋須要用心機。' },
            { type: '傷官', content: '傷官不可例言凶，有制還他衣祿豐；幹上食神支帶合，兒孫滿眼壽如松。' },
            { type: '傷官', content: '火土傷官宜傷盡；金水傷官要見官；木火見官官有旺；土金官去返成官；惟有水木傷官格，財官兩見始為歡。' },
            { type: '日主', content: '日主柔弱無生理，用神不來主便死。日主剛強一自主，用神不雜方為貴。' },
            { type: '官殺', content: '官殺混雜主多厄，去殺留官方為奇；殺官重重身不旺，一生名利總成虛。' },
            { type: '財星', content: '財多身弱主貧寒，財星入墓主慳貪；財氣通門主大富，財星得祿福千般。' },
            { type: '印綬', content: '印綬多根身旺必貧，印綬被傷剋父母；印綬比肩不忌財鄉，印綬生身福自來。' },
            { type: '格局', content: '格局者，天透地藏為正格，會合刑沖為變格；正格富貴多平穩，變格富貴多險中。' },
            { type: '體用', content: '以日為主，以月為提；以年為根，以時為果；以生旺死絕休囚制化，決人生休咎。' }
        ]
    }
};

// ============================================================
// 論命介面渲染
// ============================================================

/**
 * 主渲染函數（由 app.js 分頁切換時呼叫）
 * @param {Object} baziResult 八字計算結果（可選）
 */
export function renderLunming(baziResult) {
    const root = document.getElementById('lunmingRoot');
    if (!root) return;
    
    let html = '';
    
    // 如果已排盤，顯示當前命盤連結的論命
    if (baziResult && baziResult.pillars) {
        html += renderCurrentBaziAnalysis(baziResult);
    }
    
    // 經典分類瀏覽
    html += renderClassicalContent(baziResult);
    
    root.innerHTML = html;
    
    // 綁定分類折疊事件
    root.querySelectorAll('.lm-section-header').forEach(header => {
        header.addEventListener('click', () => {
            const section = header.closest('.lm-section');
            if (section) {
                section.classList.toggle('lm-collapsed');
            }
        });
    });
    
    // 綁定經典引用按鈕事件
    root.querySelectorAll('.btn-quote').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            if (target) {
                const el = document.getElementById(target);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('lm-highlight');
                    setTimeout(() => el.classList.remove('lm-highlight'), 2000);
                }
            }
        });
    });
}

// ============================================================
// 當前命盤論命分析
// ============================================================

export function renderCurrentBaziAnalysis(result) {
    const dm = result.dayMaster;
    const fe = result.favoriteElement;
    const element = dm.element;
    const stem = dm.stem;
    const elementIndex = ELEMENT_CYCLE.indexOf(element);
    
    // 找到對應的天干詩
    const stemImage = LUNMING.stemImages.find(s => s.stem === stem);
    // 找到性情論
    const character = LUNMING.characterTheory.items.find(c => c.element === element);
    // 找到疾病論
    const disease = LUNMING.diseaseTheory.organMap.find(d => d.element === element);
    // 找到五行生剋
    const elementSection = LUNMING.fiveElements.sections;
    
    // 日主強弱分析
    const strengthText = fe.isStrong ? '日主旺盛，精力充沛' : (fe.isWeak ? '日主衰弱，宜養精蓄銳' : '日主中和，五行平穩');
    
    let html = `
        <div class="card lm-analysis-card">
            <div class="card-title">📜 當前命盤論命 — ${dm.stem}${dm.branch} ${dm.element}${dm.yinyang}日主</div>
            <div class="lm-analysis-grid">
                <div class="lm-analysis-item">
                    <div class="lm-label">格局</div>
                    <div class="lm-value">${fe.isStrong ? '身強' : fe.isWeak ? '身弱' : '中和'}</div>
                </div>
                <div class="lm-analysis-item">
                    <div class="lm-label">日主五行</div>
                    <div class="lm-value ${ELEMENT_COLORS[element]}">${element}</div>
                </div>
                <div class="lm-analysis-item">
                    <div class="lm-label">喜用神</div>
                    <div class="lm-value">${fe.favorite.join('、')}</div>
                </div>
                <div class="lm-analysis-item">
                    <div class="lm-label">忌神</div>
                    <div class="lm-value">${fe.unfavorite.join('、')}</div>
                </div>
                <div class="lm-analysis-item">
                    <div class="lm-label">${element}日主特質</div>
                    <div class="lm-value" style="font-size:0.85rem;line-height:1.6;">${strengthText}。${character ? character.good : ''}</div>
                </div>
                <div class="lm-analysis-item">
                    <div class="lm-label">古籍參考</div>
                    <div class="lm-value" style="font-size:0.85rem;">
                        <span class="btn-quote" data-target="lm-stem-${stem}" style="cursor:pointer;color:var(--secondary-light);text-decoration:underline;">📖《干體象·${stem}》</span>
                        ${character ? `<span class="btn-quote" data-target="lm-char-${element}" style="cursor:pointer;color:var(--secondary-light);text-decoration:underline;margin-left:10px;">📖《性情·${element}》</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// ============================================================
// 經典分類瀏覽
// ============================================================

export function renderClassicalContent(baziResult) {
    const dm = baziResult ? baziResult.dayMaster : null;
    const element = dm ? dm.element : null;
    const stem = dm ? dm.stem : null;
    
    let html = `
        <div class="lm-sections">
            <div class="card">
                <div class="card-title">📚 《子平淵海大全》分類論命</div>
                <div style="margin-bottom:16px;font-size:0.85rem;color:var(--text-muted);line-height:1.6;">
                    ${LUNMING.info.description} —— 明 · 李欽 增補，六卷共計。
                </div>
    
                <!-- 1. 天干體象 -->
                <div class="lm-section ${stem ? 'lm-expanded' : 'lm-collapsed'}" id="lm-stem-${stem || ''}">
                    <div class="lm-section-header">
                        <span class="lm-section-icon">🌳</span>
                        <span>干體象 — 十天干詩訣</span>
                        <span class="lm-arrow">▼</span>
                    </div>
                    <div class="lm-section-body">
                        ${renderStemImages(stem)}
                    </div>
                </div>
                
                <!-- 2. 地支體象 -->
                <div class="lm-section lm-collapsed">
                    <div class="lm-section-header">
                        <span class="lm-section-icon">⛰️</span>
                        <span>支體象 — 十二地支詩訣</span>
                        <span class="lm-arrow">▼</span>
                    </div>
                    <div class="lm-section-body">
                        ${renderBranchImages()}
                    </div>
                </div>
                
                <!-- 3. 五行生剋制化 -->
                <div class="lm-section lm-collapsed">
                    <div class="lm-section-header">
                        <span class="lm-section-icon">♻️</span>
                        <span>五行生剋制化</span>
                        <span class="lm-arrow">▼</span>
                    </div>
                    <div class="lm-section-body">
                        ${renderFiveElements(element)}
                    </div>
                </div>
                
                <!-- 4. 十神論 -->
                <div class="lm-section lm-collapsed">
                    <div class="lm-section-header">
                        <span class="lm-section-icon">🔮</span>
                        <span>淵海子平十神論</span>
                        <span class="lm-arrow">▼</span>
                    </div>
                    <div class="lm-section-body">
                        ${renderTenGods(dm)}
                    </div>
                </div>
                
                <!-- 5. 性情論 -->
                <div class="lm-section lm-collapsed" id="lm-char-${element || ''}">
                    <div class="lm-section-header">
                        <span class="lm-section-icon">🧠</span>
                        <span>論性情 — 五行人格</span>
                        <span class="lm-arrow">▼</span>
                    </div>
                    <div class="lm-section-body">
                        ${renderCharacter(element)}
                    </div>
                </div>
                
                <!-- 6. 疾病論 -->
                <div class="lm-section lm-collapsed">
                    <div class="lm-section-header">
                        <span class="lm-section-icon">🏥</span>
                        <span>論疾病 — 五行對應</span>
                        <span class="lm-arrow">▼</span>
                    </div>
                    <div class="lm-section-body">
                        ${renderDisease(element)}
                    </div>
                </div>
                
                <!-- 7. 藏干總訣 -->
                <div class="lm-section lm-collapsed">
                    <div class="lm-section-header">
                        <span class="lm-section-icon">🔍</span>
                        <span>天干地支暗藏總訣</span>
                        <span class="lm-arrow">▼</span>
                    </div>
                    <div class="lm-section-body">
                        ${renderHiddenStems()}
                    </div>
                </div>
                
                <!-- 8. 論命要訣 -->
                <div class="lm-section lm-collapsed">
                    <div class="lm-section-header">
                        <span class="lm-section-icon">📜</span>
                        <span>論命要訣</span>
                        <span class="lm-arrow">▼</span>
                    </div>
                    <div class="lm-section-body">
                        ${renderEssence()}
                    </div>
                </div>
                
                <!-- 9. 詩訣精選 -->
                <div class="lm-section lm-collapsed">
                    <div class="lm-section-header">
                        <span class="lm-section-icon">📝</span>
                        <span>詩訣精選</span>
                        <span class="lm-arrow">▼</span>
                    </div>
                    <div class="lm-section-body">
                        ${renderPoems()}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return html;
}

// ============================================================
// 各區塊渲染函數
// ============================================================

export function renderStemImages(activeStem) {
    return LUNMING.stemImages.map(s => `
        <div class="lm-stem-block ${s.stem === activeStem ? 'lm-active' : ''}" id="lm-stem-detail-${s.stem}">
            <div class="lm-stem-title ${ELEMENT_COLORS[LUNMING.stemImages.find(x => x.stem === s.stem) ? 'fire' : '']}">
                ${s.stem} · ${s.title}
            </div>
            <div class="lm-poem">${s.poem}</div>
            <div class="lm-meaning">📖 ${s.meaning}</div>
        </div>
    `).join('');
}

export function renderBranchImages() {
    return LUNMING.branchImages.map(b => `
        <div class="lm-stem-block">
            <div class="lm-stem-title">${b.branch} · ${b.title}</div>
            <div class="lm-poem">${b.poem}</div>
        </div>
    `).join('');
}

export function renderFiveElements(activeElement) {
    let html = '<div style="margin-bottom:12px;font-size:0.9rem;color:var(--text-muted);line-height:1.8;">金旺得火，方成器皿；火旺得水，方成相濟；水旺得土，方成池沼；土旺得木，方能疏通；木旺得金，方成棟樑。</div>';
    
    html += LUNMING.fiveElements.sections.map(sec => `
        <div class="lm-subsection ${sec.title.includes('五行') ? '' : ''}">
            <div class="lm-subsection-title">▸ ${sec.title}</div>
            <div class="lm-subsection-content">${sec.content}</div>
        </div>
    `).join('');
    
    return html;
}

export function renderTenGods(dayMaster) {
    let html = `
        <div style="margin-bottom:12px;font-size:0.9rem;color:var(--text-muted);line-height:1.8;">
            ${LUNMING.tenGodTheory.general}
        </div>
    `;
    
    html += LUNMING.tenGodTheory.keyPoints.map(g => `
        <div class="lm-subsection">
            <div class="lm-subsection-title" style="color:var(--secondary-light);">▸ ${g.god}</div>
            <div class="lm-subsection-content">${g.content}</div>
        </div>
    `).join('');
    
    return html;
}

export function renderCharacter(activeElement) {
    let html = `
        <div style="margin-bottom:12px;font-size:0.9rem;color:var(--text-muted);line-height:1.8;">
            ${LUNMING.characterTheory.content}
        </div>
    `;
    
    html += LUNMING.characterTheory.items.map(c => `
        <div class="lm-subsection ${c.element === activeElement ? 'lm-active' : ''}">
            <div class="lm-subsection-title ${ELEMENT_COLORS[c.element]}">
                ${c.title} · 味${c.taste} · 主${c.virtue}
            </div>
            <div class="lm-subsection-content" style="margin-top:4px;">
                <div><strong>得中：</strong>${c.good}</div>
                <div style="margin-top:4px;"><strong>太過：</strong>${c.excess}</div>
                <div style="margin-top:4px;"><strong>不及：</strong>${c.lack}</div>
            </div>
        </div>
    `).join('');
    
    return html;
}

export function renderDisease(activeElement) {
    let html = `
        <div style="margin-bottom:12px;font-size:0.9rem;color:var(--text-muted);line-height:1.8;">
            ${LUNMING.diseaseTheory.content}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.8rem;color:var(--text-muted);margin-bottom:12px;padding:10px;background:var(--bg);border-radius:6px;">
            <div><strong>天干內府：</strong>甲肝，乙膽，丙小腸，丁心，戊胃，己脾，庚大腸，辛肺，壬膀胱，癸腎臟</div>
            <div><strong>天干外體：</strong>甲頭，乙項，丙肩，丁心，戊脅，己腹，庚臍，辛股，壬脛，癸足</div>
        </div>
    `;
    
    html += LUNMING.diseaseTheory.organMap.map(d => `
        <div class="lm-subsection ${d.element === activeElement ? 'lm-active' : ''}">
            <div class="lm-subsection-title ${ELEMENT_COLORS[d.element]}">${d.element} · ${d.stemOrgan}</div>
            <div class="lm-subsection-content" style="margin-top:4px;">
                <div>${d.disease}</div>
                <div style="margin-top:6px;font-style:italic;color:var(--secondary-light);">「${d.quote}」</div>
            </div>
        </div>
    `).join('');
    
    return html;
}

export function renderHiddenStems() {
    return `
        <div style="font-size:1rem;line-height:2.2;padding:12px;background:var(--bg);border-radius:6px;text-align:center;letter-spacing:1px;">
            ${LUNMING.hiddenStems.content.replace(/\n/g, '<br>')}
        </div>
        <div style="margin-top:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px;font-size:0.85rem;">
            ${Object.entries(HIDDEN_STEMS).map(([branch, stems]) => `
                <div style="padding:6px;background:var(--bg);border-radius:4px;text-align:center;">
                    <strong style="color:var(--secondary-light);">${branch}</strong>：${stems.join('、')}
                </div>
            `).join('')}
        </div>
    `;
}

export function renderEssence() {
    return LUNMING.essence.items.map(e => `
        <div class="lm-subsection">
            <div class="lm-subsection-title">▸ ${e.title}</div>
            <div class="lm-subsection-content">${e.content}</div>
        </div>
    `).join('');
}

export function renderPoems() {
    const types = [...new Set(LUNMING.poems.items.map(p => p.type))];
    
    return types.map(type => `
        <div class="lm-subsection">
            <div class="lm-subsection-title" style="color:var(--secondary-light);">▸ ${type}</div>
            <div class="lm-subsection-content">
                ${LUNMING.poems.items.filter(p => p.type === type).map(p => 
                    `<div style="padding:4px 0;">「${p.content}」</div>`
                ).join('')}
            </div>
        </div>
    `).join('');
}

// 確保全局可訪問（向後相容）
if (typeof window !== 'undefined') {
    window.LUNMING = LUNMING;
    window.renderLunming = renderLunming;
    window.renderCurrentBaziAnalysis = renderCurrentBaziAnalysis;
    window.renderClassicalContent = renderClassicalContent;
    window.renderStemImages = renderStemImages;
    window.renderBranchImages = renderBranchImages;
    window.renderFiveElements = renderFiveElements;
    window.renderTenGods = renderTenGods;
    window.renderCharacter = renderCharacter;
    window.renderDisease = renderDisease;
    window.renderHiddenStems = renderHiddenStems;
    window.renderEssence = renderEssence;
    window.renderPoems = renderPoems;
}
