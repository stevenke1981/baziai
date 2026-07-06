/**
 * geju-ref.js — 格局資料庫（靜態參考百科）
 * 提供完整的格局分類、定義、處理方法、喜忌、經典引文
 * 獨立於格局引擎，可供任何頁面載入使用
 */

// ============================================================
// 格局總論資料
// ============================================================

export const GEJU_REF = {

    // ===== 判定總則 =====
    principles: {
        title: '格局判定總則',
        intro: '格局是八字命理的核心分析框架。以日主為中心，審視其與月令（出生月份地支）及全局干支的十神關係，確立命局的主導模型。格局如同建築的骨架，決定了人生的主要舞台與角色類型。',
        content: [
            {
                title: '一、月令為樞紐',
                desc: '月令（月支）是八字力量的源頭，如同季節決定萬物的榮枯。格局之取，必以月令為先。',
                detail: '《淵海子平》：「子平一法，專以日干為主，而取提綱所用之物為令。凡格用月令提綱，勿於旁求年日時為格。」',
                key: '月令原則'
            },
            {
                title: '二、天透地藏（有透先看透）',
                desc: '月支中所藏的某一天干，若又透出於年、月、時的天干，此透出之干即為月令的用神，並以此定格局。',
                detail: '如甲木日主生於酉月，酉中藏辛金，若天干又見辛，則辛金「天透地藏」，力量最強，即為正官格。',
                key: '透干原則'
            },
            {
                title: '三、本氣為主（無透看本氣）',
                desc: '若月支所藏人元有多個且皆不透干，則以本氣（月支五行屬性最強的藏干）來定格。',
                detail: '如寅月藏甲（本氣60%）、丙（中氣30%）、戊（餘氣10%），若三者皆不透干，則取甲木本氣定格。',
                key: '本氣原則'
            },
            {
                title: '四、吉神順用，凶神逆用',
                desc: '正官、正財、偏財、正印、食神為吉神（善神），宜順用（相生為喜、不可剋破）；七殺、偏印（梟神）、傷官為凶神（不善神），宜逆用（制化為喜）。',
                detail: '吉神順用：如正官格喜財生印護，忌傷官剋破。凶神逆用：如七殺格喜食神制、印綬化。',
                key: '順逆原則'
            },
            {
                title: '五、格局清濁成敗',
                desc: '格局以清純為貴，雜濁為賤。用神得力且有相神保護生助即為成格；用神被剋損即為破格。',
                detail: '格局之氣「清」者富貴層次高，用神喜神力量充足且不受忌神干擾。「濁」者喜忌之神相互混戰，格局不清。',
                key: '成敗原則'
            }
        ]
    },

    // ===== 正八格分類 =====
    normalPatterns: {
        title: '正八格分類（普通格局）',
        intro: '正八格以月令為核心，分析日主與財、官、印、食傷等十神的平衡關係。正格適用於絕大多數命局，核心思想為「扶抑」——身強者宜剋洩，身弱者宜生扶。',
        categories: [
            {
                name: '吉神類（順用）',
                color: 'var(--wood)',
                desc: '吉神為善神，破壞力弱而創造力強，宜順其性以相生為用。須呵護增強或保護其創造力，不可使其受剋傷。',
                patterns: ['正官格', '正財格', '偏財格', '正印格', '食神格']
            },
            {
                name: '凶神類（逆用）',
                color: 'var(--fire)',
                desc: '凶神為不善神，具破壞性與攻擊性，宜逆其性以制化為用。須加以適當的制伏或引導，化凶為權。',
                patterns: ['七殺格', '偏印格', '傷官格']
            }
        ],
        detail: {
            '正官格': {
                name: '正官格',
                aliases: ['官格', '正官'],
                category: '吉神（善神）',
                treatment: '順用 — 喜財生印護',
                methodDesc: '正官為貴氣之神，順用之法：以財星生官（官星得財則貴氣有源），以印星護官（印綬護官則官星不傷）。最忌傷官剋官、食神合官、七殺混雜。',
                desc: '正官代表權威、紀律、責任。正官格者行事端正，重視名譽，適宜公職、管理、法律等行業。官星宜透干通根，最怕傷官剋破。',
                analysis: '官者管也，萬物惟官最貴。正官格以月令正官為體，喜財星以生官，印綬以護官。忌傷官剋官、食神合官、七殺混雜。正官只宜一位，多則雜濁。',
                advice: '正官格以官為用，宜循規蹈矩、腳踏實地。適合公務員、主管、法律、教育等職業。',
                fav: '財星（生官）、印星（護官）',
                unfav: '傷官（剋官）、七殺（混官）、食神（合官）',
                classicQuote: '《淵海子平》：「正官為貴氣之神，得之者多享福壽。」《子平真詮》：「官喜財生印護，最忌傷官來剋。」',
                tenGod: '正官',
                condition: '月令本氣或中餘氣透出為正官',
                examples: '甲木生酉月、乙木生申月'
            },
            '七殺格': {
                name: '七殺格',
                aliases: ['偏官格', '殺格'],
                category: '凶神（不善神）',
                treatment: '逆用 — 喜食神制、印綬化',
                methodDesc: '七殺如猛虎，逆用之法：以食神制殺（食神制殺，英雄獨壓萬人），以印綬化殺（殺印相生，化殺為權）。若無制化，殺重身輕則多災厄。',
                desc: '七殺代表權威、魄力、競爭與壓力。七殺格者果斷剛強，有大將之風，宜軍警、創業、競爭性行業。制化得宜則可成大業。',
                analysis: '有殺先論殺。七殺喜食神制之、印綬化之，謂之「殺印相生」、「食神制殺」。七殺得制則為權柄，無制則為壓力。殺印相生者貴，食神制殺者權。',
                advice: '七殺格以食神制殺或印綬化殺為用。宜培養專業能力，以柔克剛。適合軍警、醫護、工程、創業等。',
                fav: '食神（制殺）、印星（化殺）',
                unfav: '財星（生殺）、比劫（抗殺而力不從心）',
                classicQuote: '《淵海子平》：「七殺如虎，制之則貴，縱之則凶。」《子平真詮》：「煞以攻身，似非美物，然大貴之格，多存七殺。」',
                tenGod: '七殺',
                condition: '月令本氣或中餘氣透出為七殺',
                examples: '乙木生酉月、甲木生申月'
            },
            '正財格': {
                name: '正財格',
                aliases: ['財格'],
                category: '吉神（善神）',
                treatment: '順用 — 喜食神生、官星護',
                methodDesc: '正財為養命之源，順用之法：以食神生財（食神生財，財源滾滾），以官星護財（官星護財，財不為劫）。最忌比劫奪財。',
                desc: '正財代表穩定收入、勤儉持家。正財格者務實守信，善於理財，宜金融、會計、貿易、穩定行業。財喜透干通根。',
                analysis: '財為養命之源。正財格喜食神生財、官星護財，最忌比劫奪財。身旺勝財者富，身弱財旺者財多身弱（富屋貧人）。',
                advice: '正財格宜勤懇積累，不宜投機冒險。適合財務、會計、貿易、房地產等行業。',
                fav: '食神（生財）、官星（護財）',
                unfav: '比肩劫財（奪財）',
                classicQuote: '《子平真詮》：「財喜食神以相生，生官以護財。」《淵海子平》：「正財者，勤儉之人，守財之奴。」',
                tenGod: '正財',
                condition: '月令本氣或中餘氣透出為正財',
                examples: '戊土生子月、己土生亥月'
            },
            '偏財格': {
                name: '偏財格',
                aliases: ['財格'],
                category: '吉神（善神）',
                treatment: '順用 — 喜食神生、官星護',
                methodDesc: '偏財為眾人之財，順用之法亦喜食神生財、官星護財。偏財性活，透干通根者尤利經商創業。',
                desc: '偏財代表橫財、機遇、交際能力。偏財格者慷慨大方，善於抓住機會，宜經商、投資、業務等靈活性行業。',
                analysis: '偏財者，眾人之財也。偏財格喜食神生財，忌比劫分財。偏財透干通根，身旺勝財者尤利經商創業。偏財多者多機遇但亦多風險。',
                advice: '偏財格宜善用人脈與機遇，適合業務、投資、貿易、自營事業等。注意理財規劃。',
                fav: '食神（生財）、官星（護財）',
                unfav: '比肩劫財（奪財）',
                classicQuote: '《淵海子平》：「偏財為眾人之財，得之者慷慨好施。」《滴天髓》：「偏財乃眾人之財，宜劫不宜奪。」',
                tenGod: '偏財',
                condition: '月令本氣或中餘氣透出為偏財',
                examples: '己土生子月、戊土生亥月'
            },
            '正印格': {
                name: '正印格',
                aliases: ['印格'],
                category: '吉神（善神）',
                treatment: '順用 — 喜官星生、比劫護',
                methodDesc: '印綬為生我之神，如母之護子。順用之法：喜官星生印（官印雙全）、比劫護印（比劫助身，印不為財破）。最忌財星壞印。',
                desc: '正印代表學識、貴人、慈愛。正印格者溫和好學，有長輩緣，宜教育、文化、醫療、研究等行業。',
                analysis: '印綬為生我之神，如母之護子。正印格喜官星生印（官印雙全），忌財星壞印。印星太重時喜食傷洩秀。印格配官則貴，配食傷則文秀。',
                advice: '正印格宜發揮學術、文化方面的才能。適合教育、研究、醫療、出版、文職等。',
                fav: '官星（生印）、比劫（護印）',
                unfav: '財星（壞印）',
                classicQuote: '《子平真詮》：「印綬得官而貴，逢財而破。」《淵海子平》：「印綬者，生我之氣，得之者聰明慈慧。」',
                tenGod: '正印',
                condition: '月令本氣或中餘氣透出為正印',
                examples: '丙火生卯月、丁火生寅月'
            },
            '偏印格': {
                name: '偏印格',
                aliases: ['梟神格', '印格'],
                category: '凶神（不善神）',
                treatment: '逆用 — 喜財星制、食神洩',
                methodDesc: '偏印又稱梟神，性孤僻而機敏。逆用之法：以財星制梟（財星剋印，梟神得制），以食神洩之（食神洩身，梟神不奪食）。忌比劫生梟，反成梟神奪食之局。',
                desc: '偏印代表特殊才能、創意思維、偏門學問。偏印格者思維獨特，直覺敏銳，宜科研、命理、藝術、發明等獨創性行業。',
                analysis: '偏印又稱梟神，性孤僻而機敏。偏印喜財星以制之，食神以洩之。忌比劫生梟，反成梟神奪食之局。梟神奪食主災禍。',
                advice: '偏印格宜走專業技術路線，適合科研、命理、哲學、藝術創作等。注意人際關係。',
                fav: '財星（制梟）、食神（洩秀）',
                unfav: '比劫（生梟）、正印（混雜）',
                classicQuote: '《淵海子平》：「梟神見食，奪人之食；得財制服，反為奇格。」《子平真詮》：「偏印者，梟也，奪食之神。」',
                tenGod: '偏印',
                condition: '月令本氣或中餘氣透出為偏印',
                examples: '丁火生卯月、丙火生寅月'
            },
            '食神格': {
                name: '食神格',
                aliases: ['食格'],
                category: '吉神（善神）',
                treatment: '順用 — 喜財星生、比劫助',
                methodDesc: '食神者，我生之精華也。順用之法：喜財星生財（食神生財，富貴雙全）、比劫助身（身旺方能任食神洩秀）。最忌偏印奪食。',
                desc: '食神代表才華、享受、溫和。食神格者聰明溫和，樂天知命，宜教育、演藝、餐飲、設計等行業。食神制殺則有權。',
                analysis: '食神者，我生之精華也。食神格喜財星生財（食神生財），身弱喜比劫助。食神制殺則權威自顯。忌偏印奪食。食神多作傷官論。',
                advice: '食神格宜發揮才藝與創意。適合教育、演藝、設計、餐飲、諮詢等行業。',
                fav: '財星（食神生財）、比劫（助身）',
                unfav: '偏印（奪食）、正印（混雜）',
                classicQuote: '《淵海子平》：「食神制殺，英雄獨壓萬人。」《子平真詮》：「食神生財，富貴自天來。」',
                tenGod: '食神',
                condition: '月令本氣或中餘氣透出為食神',
                examples: '庚金生子月、辛金生亥月'
            },
            '傷官格': {
                name: '傷官格',
                aliases: ['傷格'],
                category: '凶神（不善神）',
                treatment: '逆用 — 喜印星制、財星化',
                methodDesc: '傷官者，盜我之氣而傷我之官也。逆用之法：以印星制傷（傷官佩印，貴不可言），以財星化傷（傷官生財，富貴可期）。最忌傷官見官。',
                desc: '傷官代表才氣、叛逆、創造力。傷官格者聰慧過人，不喜受拘束，宜藝術、創作、科技、自由業。傷官佩印則文貴。',
                analysis: '傷官者，盜我之氣而傷我之官也。傷官格喜印星制之（傷官佩印），或財星化之（傷官生財）。最忌傷官見官。傷官配印主文貴，傷官生財主富足。',
                advice: '傷官格宜走專業技術或藝術路線，適合設計、寫作、研發、顧問等自由度高的工作。注意言行低調。',
                fav: '印星（制傷）、財星（化傷）',
                unfav: '正官（傷官見官）、比劫（生傷）',
                classicQuote: '《淵海子平》：「傷官見官，為禍百端；傷官佩印，貴不可言。」《子平真詮》：「傷官生財，勝於食神生財。」',
                tenGod: '傷官',
                condition: '月令本氣或中餘氣透出為傷官',
                examples: '辛金生子月、庚金生亥月'
            }
        }
    },

    // ===== 特殊格局 =====
    specialPatterns: {
        title: '特殊格局（變格）',
        intro: '特殊格局的論命邏輯與正格「扶抑平衡」不同，多講「順勢而為」或「從某一行之旺氣」。若符合特殊格局條件，優先以特殊格局論斷。',
        categories: [
            {
                name: '祿刃格',
                color: 'var(--gold)',
                desc: '月令為日主之比肩或劫財，不入正八格，另立專名。日主得月令之氣而身旺。',
                patterns: ['建祿格', '月刃格']
            },
            {
                name: '從格',
                color: 'var(--water)',
                desc: '日主極弱，全局無生扶之力，順從旺神為用。從格若真從，格局清貴；假從則不穩，多波折。',
                patterns: ['從財格', '從殺格', '從兒格']
            },
            {
                name: '專旺格（一行得氣）',
                color: 'var(--fire)',
                desc: '全局同一五行或會合成一局，日主強旺至極，不可逆犯，只能順其旺勢或引其秀氣。',
                patterns: ['曲直格（木）', '炎上格（火）', '稼穡格（土）', '從革格（金）', '潤下格（水）']
            },
            {
                name: '化氣格',
                color: 'var(--metal)',
                desc: '日干與月干或時干天干五合化氣，且化神有力無制。化氣格格局高貴，但判斷極嚴格。真化者格局清奇。',
                patterns: ['甲己化土格', '乙庚化金格', '丙辛化水格', '丁壬化木格', '戊癸化火格']
            }
        ],
        detail: {
            '建祿格': {
                name: '建祿格',
                condition: '月令為日主之祿（比肩），如甲日寅月、乙日卯月、庚日申月、辛日酉月等',
                desc: '月令為日主之祿位，日主得月令之氣而身旺。建祿格喜財官透出洩秀，忌比劫印綬再助旺。',
                analysis: '建祿者，月令為日主之臨官祿位也。如人得祿，自然豐足。喜財官食傷洩秀，忌比劫印綬再助旺。建祿格身旺，宜發揮才華謀求發展。',
                advice: '適合創業、管理、競爭性行業。注意不要過於自負，以免群比爭財。',
                fav: '財星、官星、食傷（洩旺氣）',
                unfav: '比肩劫財（爭奪）、印星（再生扶）',
                classicQuote: '《子平真詮》：「建祿格，體堅則用神貴乎得宜。」《淵海子平》：「建祿者，月令與日主同氣，得祿之謂。」'
            },
            '月刃格': {
                name: '月刃格',
                condition: '月令為日主之帝旺（劫財），如甲日卯月、丙日午月、庚日酉月、壬日子月',
                desc: '月令為日主之刃（羊刃），日主極旺。月刃格最喜七殺制伏（羊刃駕殺，權貴之命），忌財星滋刃。',
                analysis: '月刃者，極旺之謂也。刃旺最喜七殺制伏，如羊刃駕殺，權貴之命。忌財星生官殺攻身。羊刃有二位以上而財官少者，男剋妻，女剋夫。',
                advice: '月刃格身極旺，須有官殺制刃方貴。適合軍警、執法、外科醫療等行業。注意衝動暴戾的個性。',
                fav: '七殺（制刃）、食傷（洩秀）',
                unfav: '財星（滋刃）、印星（助刃）',
                classicQuote: '《淵海子平》：「羊刃見殺，官職可誇；羊刃逢沖，災禍不輕。」《子平真詮》：「羊刃者，極旺之位，須殺以制之。」'
            },
            '從財格': {
                name: '從財格',
                condition: '日主極弱，四柱財星強旺，無比劫印星生扶',
                desc: '日主衰弱至極，滿盤財星，不得不從其財勢。行運喜財官，忌比劫印。',
                analysis: '棄命從財之格。日主衰弱無倚，滿局財星成勢，只能順從財勢。行運喜財官食傷，最忌比劫奪財、印星生身抵抗。真從者富貴。',
                advice: '宜從商、投資、靠人脈謀財。注意逢比劫運時有破敗。',
                fav: '財星、官星、食傷',
                unfav: '比劫（奪財）、印星（逆勢）',
                classicQuote: '《滴天髓》：「從財之格，富貴不替。」'
            },
            '從殺格': {
                name: '從殺格',
                condition: '日主極弱，四柱官殺強旺，無印比生扶',
                desc: '日主衰弱至極，滿盤官殺，不得不從其殺勢。行運喜官殺，忌印比抵抗。',
                analysis: '棄命從殺之格。日主孤弱，滿局官殺成勢，只能順從官殺。行運喜官殺財星，最忌食傷制殺、印星化殺。從殺真者權威顯赫。',
                advice: '宜軍警、管理、權威領域。注意逢印比運時易有衝突。',
                fav: '官殺、財星',
                unfav: '食傷（制殺）、印星（化殺）、比劫（抗殺）',
                classicQuote: '《淵海子平》：「從殺之格，致身於權貴之間。」'
            },
            '從兒格': {
                name: '從兒格（從食傷）',
                condition: '日主極弱，四柱食傷強旺，無印星剋制',
                desc: '日主衰弱，滿盤食傷，順其洩秀之勢。行運喜食傷財，忌印比。',
                analysis: '從兒格者，從我生之食傷也。日主衰弱，滿局食傷生財，順其洩秀之勢。行運喜食傷財鄉，最忌印星奪食破格。從兒格者才華出眾。',
                advice: '宜藝術、創作、演藝、自由業。才華出眾但需注意健康。',
                fav: '食傷、財星',
                unfav: '印星（奪食）、比劫（生身抵抗）',
                classicQuote: '《子平真詮》：「從兒格，順氣之局也。」'
            },
            '曲直格（木）': {
                name: '曲直格（木）',
                condition: '甲乙日主，地支三會三合木局或木勢強旺，無金剋破',
                desc: '木曰曲直，仁壽之格。全局木勢專旺，順其旺勢喜火洩秀（木火通明），忌金來剋伐。',
                analysis: '曲直仁壽格，木之專旺也。全局木勢純粹專旺，宜順勢用火洩其菁英（食傷洩秀），或見水順其勢。最忌金來剋破。入格者仁厚慈祥。',
                advice: '宜教育、文化、慈善、環保等行業。發揮仁愛之心。',
                fav: '火（洩秀）、水（順勢）',
                unfav: '金（剋木）、土（耗氣）',
                classicQuote: '《淵海子平》：「曲直格者，木之專旺也。春木得令，仁壽之徵。」'
            },
            '炎上格（火）': {
                name: '炎上格（火）',
                condition: '丙丁日主，地支三會三合火局或火勢強旺，無水剋破',
                desc: '火曰炎上，率性之格。全局火勢專旺，順其旺勢喜土洩秀（火土相生），忌水來剋制。',
                analysis: '炎上格，火之專旺也。全局火勢純粹專旺，宜順勢用土洩其菁英，或見木順其勢。最忌水來剋破。入格者爽朗豪邁。',
                advice: '宜文化、傳媒、演藝、科技等行業。發揮熱情創造力。',
                fav: '土（洩秀）、木（順勢）',
                unfav: '水（剋火）、金（耗氣）',
                classicQuote: '《淵海子平》：「炎上格者，火之專旺也。盛夏天成，文明之象。」'
            },
            '稼穡格（土）': {
                name: '稼穡格（土）',
                condition: '戊己日主，地支辰戌丑未全或土勢強旺，無木剋破',
                desc: '土曰稼穡，篤實之格。全局土勢專旺，順其旺勢喜金洩秀（土金相生），忌木來剋制。',
                analysis: '稼穡格，土之專旺也。全局土勢純粹專旺，宜順勢用金洩其菁英，或見火順其勢。最忌木來剋破。入格者誠實穩重。',
                advice: '宜房地產、建築、農業、管理等行業。發揮務實特質。',
                fav: '金（洩秀）、火（順勢）',
                unfav: '木（剋土）、水（耗氣）',
                classicQuote: '《淵海子平》：「稼穡格者，土之專旺也。四庫全備，厚重之德。」'
            },
            '從革格（金）': {
                name: '從革格（金）',
                condition: '庚辛日主，地支三會三合金局或金勢強旺，無火剋破',
                desc: '金曰從革，剛毅之格。全局金勢專旺，順其旺勢喜水洩秀（金水相生），忌火來剋制。',
                analysis: '從革格，金之專旺也。全局金勢純粹專旺，宜順勢用水洩其菁英，或見土順其勢。最忌火來剋破。入格者剛毅果決。',
                advice: '宜金融、法律、軍警、工程等行業。發揮果斷剛毅特質。',
                fav: '水（洩秀）、土（順勢）',
                unfav: '火（剋金）、木（耗氣）',
                classicQuote: '《淵海子平》：「從革格者，金之專旺也。秋金得令，剛毅之質。」'
            },
            '潤下格（水）': {
                name: '潤下格（水）',
                condition: '壬癸日主，地支三會三合水局或水勢強旺，無土剋破',
                desc: '水曰潤下，靈秀之格。全局水勢專旺，順其旺勢喜木洩秀（水木相生），忌土來剋制。',
                analysis: '潤下格，水之專旺也。全局水勢純粹專旺，宜順勢用木洩其菁英，或見金順其勢。最忌土來剋破。入格者聰明靈秀。',
                advice: '宜貿易、物流、旅遊、智慧產業等行業。發揮靈活應變能力。',
                fav: '木（洩秀）、金（順勢）',
                unfav: '土（剋水）、火（耗氣）',
                classicQuote: '《淵海子平》：「潤下格者，水之專旺也。冬水得令，靈秀之資。」'
            }
        }
    },

    // ===== 格局喜忌速查表 =====
    quickReference: {
        title: '格局喜忌速查表',
        intro: '以下為常見格局的喜用神與忌神速查，可快速一覽各格局的喜忌概要。',
        columns: ['格局', '類型', '處理', '喜神', '忌神', '關鍵原則'],
        data: [
            ['正官格', '吉神', '順用', '財星、印星', '傷官、七殺', '官喜財生印護，忌傷官來剋'],
            ['七殺格', '凶神', '逆用', '食神、印星', '財星', '有殺先論殺，食神制殺為貴'],
            ['正財格', '吉神', '順用', '食神、官星', '比肩、劫財', '身旺勝財，食神生財'],
            ['偏財格', '吉神', '順用', '食神、官星', '比肩、劫財', '偏財慷慨，宜食神生'],
            ['正印格', '吉神', '順用', '官星、比劫', '財星', '官印雙全，財星壞印'],
            ['偏印格', '凶神', '逆用', '財星、食神', '比劫', '梟神奪食，得財制服'],
            ['食神格', '吉神', '順用', '財星、比劫', '偏印', '食神生財，偏印奪食'],
            ['傷官格', '凶神', '逆用', '印星、財星', '正官', '傷官佩印貴，傷官生財富'],
            ['建祿格', '特殊', '順勢', '財星、官星、食傷', '比劫、印星', '建祿身旺，喜財官洩秀'],
            ['月刃格', '特殊', '順勢', '七殺、食傷', '財星、印星', '羊刃駕殺貴，忌財印助刃'],
            ['從財格', '從格', '順勢', '財星、官星、食傷', '比劫、印星', '棄命從財，忌比劫逆勢'],
            ['從殺格', '從格', '順勢', '官殺、財星', '食傷、印星、比劫', '棄命從殺，忌制化抗殺'],
            ['從兒格', '從格', '順勢', '食傷、財星', '印星、比劫', '從食傷勢，忌印奪食'],
            ['專旺格', '專旺', '順勢', '洩神（食傷）、順神', '剋神、逆神', '順勢而為，不可逆犯']
        ]
    },

    // ===== 三審步驟 =====
    stepMethod: {
        title: '格局判定三步法',
        intro: '根據袁樹珊《命理探源》和傳統子平法，格局判定以月令為樞紐，依三步法執行：',
        steps: [
            {
                step: 1,
                title: '查明月令藏干',
                desc: '先查明出生月份地支（月令）所藏的天干。月令為八字力量的源頭，藏干分本氣、中氣、餘氣三類。',
                detail: '四正（子午卯酉）：氣專，僅藏本氣（午藏丁己）\n四生（寅申巳亥）：氣雜，藏本+中+餘\n四庫（辰戌丑未）：墓庫，藏本+中+餘',
                icon: '🔍'
            },
            {
                step: 2,
                title: '有透先看透（第一優先）',
                desc: '月令之「本氣」透干（出現在年/月/時任一干上）→ 以此透出之十神定格局。',
                detail: '若本氣未透，次看「中氣」是否透干。若中氣亦未透，再看「餘氣」是否透干。',
                icon: '✨'
            },
            {
                step: 3,
                title: '無透看本氣（第三優先）',
                desc: '若月令所藏全部未透干 → 直接以月令之本氣對日主之十神定格局。',
                detail: '比肩→建祿格，劫財→月刃格。其他十神依正八格判定。',
                icon: '🎯'
            }
        ],
        note: '注意：判定格局前，應先檢查是否為特殊格局（從格、專旺格等）。特殊格局優先於正格。'
    }
};

// ============================================================
// 渲染函數
// ============================================================

/**
 * 渲染格局參考百科到指定容器
 */
export function renderGejuRef(container) {
    if (!container) return;

    let html = '';

    // ===== 頁面標題 =====
    html += `
        <div class="geju-ref-header">
            <div class="geju-ref-icon">📚</div>
            <h2>格局資料庫</h2>
            <p>八字格局大全 — 正八格·特殊格局·順用逆用·喜忌速查</p>
        </div>
    `;

    // ===== 1. 判定總則 =====
    html += renderPrinciples(GEJU_REF.principles);

    // ===== 2. 三步法 =====
    html += renderStepMethod(GEJU_REF.stepMethod);

    // ===== 3. 正八格 =====
    html += renderNormalPatterns(GEJU_REF.normalPatterns);

    // ===== 4. 特殊格局 =====
    html += renderSpecialPatterns(GEJU_REF.specialPatterns);

    // ===== 5. 喜忌速查表 =====
    html += renderQuickTable(GEJU_REF.quickReference);

    container.innerHTML = html;
}

/** 渲染判定總則 */
export function renderPrinciples(data) {
    let html = `
        <div class="geju-ref-section">
            <div class="geju-ref-section-title">${data.title}</div>
            <p class="geju-ref-intro">${data.intro}</p>
            <div class="geju-principles-grid">
    `;
    data.content.forEach(p => {
        html += `
            <div class="geju-principle-card">
                <div class="geju-principle-key">${p.key}</div>
                <div class="geju-principle-title">${p.title}</div>
                <div class="geju-principle-desc">${p.desc}</div>
                <div class="geju-principle-detail">${p.detail}</div>
            </div>
        `;
    });
    html += `</div></div>`;
    return html;
}

/** 渲染三步法 */
export function renderStepMethod(data) {
    let html = `
        <div class="geju-ref-section">
            <div class="geju-ref-section-title">${data.title}</div>
            <p class="geju-ref-intro">${data.intro}</p>
            <div class="geju-steps-flow">
    `;
    data.steps.forEach(s => {
        html += `
            <div class="geju-step-card">
                <div class="geju-step-num">步驟 ${s.step}</div>
                <div class="geju-step-icon">${s.icon}</div>
                <div class="geju-step-title-ref">${s.title}</div>
                <div class="geju-step-desc-ref">${s.desc}</div>
                <div class="geju-step-detail-ref">${s.detail.replace(/\n/g, '<br>')}</div>
            </div>
        `;
    });
    html += `</div>`;
    if (data.note) {
        html += `<div class="geju-ref-note">${data.note}</div>`;
    }
    html += `</div>`;
    return html;
}

/** 渲染正八格 */
export function renderNormalPatterns(data) {
    let html = `
        <div class="geju-ref-section">
            <div class="geju-ref-section-title">${data.title}</div>
            <p class="geju-ref-intro">${data.intro}</p>
            <div class="geju-category-tabs">
    `;
    
    data.categories.forEach(cat => {
        html += `
            <div class="geju-cat-block">
                <div class="geju-cat-header" style="border-left:4px solid ${cat.color};">
                    <div class="geju-cat-name">${cat.name}</div>
                    <div class="geju-cat-desc">${cat.desc}</div>
                </div>
                <div class="geju-pattern-grid">
        `;
        cat.patterns.forEach(pName => {
            const p = data.detail[pName];
            if (p) {
                html += renderPatternCard(p);
            }
        });
        html += `</div></div>`;
    });
    
    html += `</div></div>`;
    return html;
}

/** 渲染單個格局卡片 */
export function renderPatternCard(p) {
    const isGood = p.category === '吉神（善神）';
    const badgeClass = isGood ? 'geju-badge-good' : 'geju-badge-bad';
    
    return `
        <div class="geju-pattern-card" onclick="this.classList.toggle('geju-pattern-expanded')">
            <div class="geju-pattern-head">
                <div class="geju-pattern-name">${p.name}</div>
                <div class="geju-pattern-badge ${badgeClass}">${p.category}</div>
                <div class="geju-pattern-treat">${p.treatment}</div>
                <span class="geju-pattern-expand-icon">▼</span>
            </div>
            <div class="geju-pattern-body">
                <div class="geju-pattern-section">
                    <span class="geju-label">十神：</span>${p.tenGod}
                    <span class="geju-label" style="margin-left:15px;">條件：</span>${p.condition}
                </div>
                ${p.examples ? `<div class="geju-pattern-section"><span class="geju-label">舉例：</span>${p.examples}</div>` : ''}
                <div class="geju-pattern-section">
                    <span class="geju-label">說明：</span>${p.desc}
                </div>
                <div class="geju-pattern-section">
                    <span class="geju-label">處理原則：</span>${p.methodDesc}
                </div>
                <div class="geju-pattern-section">
                    <span class="geju-label">喜神：</span><span style="color:var(--wood);">${p.fav}</span>
                    <span style="margin-left:15px;"><span class="geju-label">忌神：</span><span style="color:var(--fire);">${p.unfav}</span></span>
                </div>
                <div class="geju-pattern-section">
                    <span class="geju-label">建議：</span>${p.advice}
                </div>
                <div class="geju-pattern-analysis">${p.analysis}</div>
                <div class="geju-pattern-quote">📖 ${p.classicQuote}</div>
            </div>
        </div>
    `;
}

/** 渲染特殊格局 */
export function renderSpecialPatterns(data) {
    let html = `
        <div class="geju-ref-section">
            <div class="geju-ref-section-title">${data.title}</div>
            <p class="geju-ref-intro">${data.intro}</p>
    `;
    
    data.categories.forEach(cat => {
        html += `
            <div class="geju-cat-block">
                <div class="geju-cat-header" style="border-left:4px solid ${cat.color};">
                    <div class="geju-cat-name">${cat.name}</div>
                    <div class="geju-cat-desc">${cat.desc}</div>
                </div>
                <div class="geju-pattern-grid">
        `;
        cat.patterns.forEach(pName => {
            const p = data.detail[pName];
            if (p) {
                html += renderSpecialPatternCard(p);
            }
        });
        html += `</div></div>`;
    });
    
    html += `</div>`;
    return html;
}

/** 渲染特殊格局卡片 */
export function renderSpecialPatternCard(p) {
    return `
        <div class="geju-pattern-card geju-special-card" onclick="this.classList.toggle('geju-pattern-expanded')">
            <div class="geju-pattern-head">
                <div class="geju-pattern-name">${p.name}</div>
                <span class="geju-pattern-expand-icon">▼</span>
            </div>
            <div class="geju-pattern-body">
                <div class="geju-pattern-section">
                    <span class="geju-label">成格條件：</span>${p.condition}
                </div>
                <div class="geju-pattern-section">
                    <span class="geju-label">說明：</span>${p.desc}
                </div>
                <div class="geju-pattern-section">
                    <span class="geju-label">命理分析：</span>${p.analysis}
                </div>
                <div class="geju-pattern-section">
                    <span class="geju-label">喜神：</span><span style="color:var(--wood);">${p.fav}</span>
                    <span style="margin-left:15px;"><span class="geju-label">忌神：</span><span style="color:var(--fire);">${p.unfav}</span></span>
                </div>
                <div class="geju-pattern-section">
                    <span class="geju-label">建議：</span>${p.advice}
                </div>
                ${p.classicQuote ? `<div class="geju-pattern-quote">📖 ${p.classicQuote}</div>` : ''}
            </div>
        </div>
    `;
}

/** 渲染喜忌速查表 */
export function renderQuickTable(data) {
    let html = `
        <div class="geju-ref-section">
            <div class="geju-ref-section-title">${data.title}</div>
            <p class="geju-ref-intro">${data.intro}</p>
            <div class="geju-table-wrap">
                <table class="geju-ref-table">
                    <thead>
                        <tr>
    `;
    data.columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += `</tr></thead><tbody>`;
    data.data.forEach(row => {
        html += `<tr>`;
        row.forEach((cell, idx) => {
            if (idx === 4) { // 忌神用紅色
                html += `<td style="color:var(--fire);">${cell}</td>`;
            } else if (idx === 3) { // 喜神用綠色
                html += `<td style="color:var(--wood);">${cell}</td>`;
            } else {
                html += `<td>${cell}</td>`;
            }
        });
        html += `</tr>`;
    });
    html += `</tbody></table></div></div>`;
    return html;
}

// ============================================================
// 匯出
// ============================================================
if (typeof window !== 'undefined') {
    window.renderGejuRef = renderGejuRef;
    window.GEJU_REF = GEJU_REF;
}
