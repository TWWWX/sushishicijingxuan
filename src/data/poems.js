export const MODES = {
  M64: '64',
  M288: '288',
  POEM64: 'poem64',
  WORD64: 'word64'
};

export const MODE_META = {
  [MODES.M64]: {
    name: '64选1',
    n: 64,
    title: '苏轼诗文作品64选1',
    dataFile: '苏轼诗词精选64版1.txt',
    dlcFile: '苏轼诗词精选64选1dlc.txt',
    firstColLabel: '64篇苏轼诗文',
    columnConfig: [
      { count: 64, rowSpan: 1 },
      { count: 32, rowSpan: 2 },
      { count: 16, rowSpan: 4 },
      { count: 8,  rowSpan: 8 },
      { count: 4,  rowSpan: 16 },
      { count: 2,  rowSpan: 32 },
      { count: 1,  rowSpan: 64 }
    ],
    headerLabels: [
      '64篇苏轼诗文',
      '前32',
      '前16',
      '前8',
      '前4',
      '前2',
      '冠军'
    ]
  },
  [MODES.M288]: {
    name: '288选1',
    n: 288,
    title: '苏轼诗文作品288选1',
    dataFile: '苏轼诗词精选288选1.txt',
    dlcFile: '苏轼诗词精选288选1dlc.txt',
    firstColLabel: '288篇苏轼诗文',
    columnConfig: [
      { count: 288, rowSpan: 1 },
      { count: 72,  rowSpan: 4 },
      { count: 24,  rowSpan: 12 },
      { count: 8,   rowSpan: 36 },
      { count: 4,   rowSpan: 72 },
      { count: 2,   rowSpan: 144 },
      { count: 1,   rowSpan: 288 }
    ],
    headerLabels: [
      '288篇苏轼诗文',
      '前72',
      '前24',
      '前8',
      '前4',
      '前2',
      '冠军'
    ]
  },
  [MODES.POEM64]: {
    name: '诗64选1',
    n: 64,
    title: '苏轼诗作品64选1',
    dataFile: '苏轼诗精选64选1.txt',
    dlcFile: '苏轼诗精选64选1dlc.txt',
    firstColLabel: '64篇苏轼诗',
    columnConfig: [
      { count: 64, rowSpan: 1 },
      { count: 32, rowSpan: 2 },
      { count: 16, rowSpan: 4 },
      { count: 8,  rowSpan: 8 },
      { count: 4,  rowSpan: 16 },
      { count: 2,  rowSpan: 32 },
      { count: 1,  rowSpan: 64 }
    ],
    headerLabels: [
      '64篇苏轼诗',
      '前32',
      '前16',
      '前8',
      '前4',
      '前2',
      '冠军'
    ]
  },
  [MODES.WORD64]: {
    name: '词64选1',
    n: 64,
    title: '苏轼词作品64选1',
    dataFile: '苏轼词精选64选1.txt',
    dlcFile: '苏轼词精选64选1dlc.txt',
    firstColLabel: '64篇苏轼词',
    columnConfig: [
      { count: 64, rowSpan: 1 },
      { count: 32, rowSpan: 2 },
      { count: 16, rowSpan: 4 },
      { count: 8,  rowSpan: 8 },
      { count: 4,  rowSpan: 16 },
      { count: 2,  rowSpan: 32 },
      { count: 1,  rowSpan: 64 }
    ],
    headerLabels: [
      '64篇苏轼词',
      '前32',
      '前16',
      '前8',
      '前4',
      '前2',
      '冠军'
    ]
  }
};

export const DLC_COLS = 6;

export const poemsData64 = [
  {title:"《赤壁赋》", content:"寄蜉蝣于天地，渺浮海之一粟"},
  {title:"《点绛唇·闲倚胡床》", content:"与谁同坐，明月清风我"},
  {title:"《定风波·莫听穿林打叶声》", content:"竹杖芒鞋轻胜马，谁怕，一蓑烟雨任平生"},
  {title:"《定风波·南海归赠王定国侍人寓娘》", content:"试问岭南应不好，却道，此心安处是吾乡"},
  {title:"《和子由渑池怀旧》", content:"人生到处知何似，应似飞鸿踏雪泥"},
  {title:"《记游松风亭》", content:"此间有甚么歇不得处？"},
  {title:"《老饕赋》", content:"先生一笑而起，渺海阔而天高"},
  {title:"《临江仙·送钱穆父》", content:"人生如逆旅，我亦是行人"},
  {title:"《临江仙·夜饮东坡醒复醉》", content:"小舟从此逝，江海寄余生"},
  {title:"《六月二十日夜渡海》", content:"云散月明谁点缀，天容海色本澄清"},
  {title:"《沁园春·孤馆灯青》", content:"用舍由时，行藏在我，袖手何妨闲处看"},
  {title:"《水调歌头·黄州快哉亭赠张偓佺》", content:"一点浩然气，千里快哉风"},
  {title:"《望江南·超然台作》", content:"且将新火试新茶，诗酒趁年华"},
  {title:"《西江月·照野弥弥浅浪》", content:"障泥未解玉骢骄，我欲醉眠芳草"},
  {title:"《行香子·过七里濑》", content:"但远山长，云山乱，晓山青"},
  {title:"《行香子·述怀》", content:"对一张琴，一壶酒，一溪云"},
  {title:"《答谢民师推官书》", content:"大略如行云流水，初无定质"},
  {title:"《东坡》", content:"雨洗东坡月色清，市人行尽野人行"},
  {title:"《海棠》", content:"东风袅袅泛崇光，香雾空蒙月转廊"},
  {title:"《和董传留别》", content:"粗缯大布裹生涯，腹有诗书气自华"},
  {title:"《后赤壁赋》", content:"山高月小，水落石出"},
  {title:"《浣溪沙·山下兰芽短浸溪》", content:"门前流水尚能西，休将白发唱黄鸡"},
  {title:"《浣溪沙·细雨斜风作晓寒》", content:"雪沫乳花浮午盏，蓼茸蒿笋试春盘，人间有味是清欢"},
  {title:"《惠崇春江晚景二首·其一》", content:"竹外桃花三两枝，春江水暖鸭先知"},
  {title:"《记承天寺夜游》", content:"但少闲人如吾两人者尔"},
  {title:"《江城子·乙卯正月二十夜记梦》", content:"十年生死两茫茫，不思量、自难忘"},
  {title:"《临皋闲题》", content:"江山风月，本无常主，闲者便是主人"},
  {title:"《如梦令·有寄》", content:"归去，归去，江上一犁春雨"},
  {title:"《阮郎归·初夏》", content:"绿槐高柳咽新蝉，熏风初入弦"},
  {title:"《石钟山记》", content:"事不目见耳闻，而臆断其有无，可乎？"},
  {title:"《水调歌头·明月几时有》", content:"但愿人长久，千里共婵娟"},
  {title:"《水龙吟·次韵章质夫杨花词》", content:"似花还似非花，也无人惜从教坠"},
  {title:"《西江月·平山堂》", content:"休言万事转头空，未转头时皆梦"},
  {title:"《西江月·世事一场大梦》", content:"世事一场大梦，人生几度秋凉"},
  {title:"《雪堂记》", content:"作堂焉，号其正曰\"雪堂\""},
  {title:"《赠刘景文》", content:"一年好景君须记，正是橙黄橘绿时"},
  {title:"《鹧鸪天·林断山明竹隐墙》", content:"殷勤昨夜三更雨，又得浮生一日凉"},
  {title:"《自题金山画像》", content:"问汝平生功业，黄州惠州儋州"},
  {title:"《蝶恋花·春景》", content:"枝上柳绵吹又少，天下何处无芳草"},
  {title:"《卜算子·黄州定慧院寓居作》", content:"拣尽寒枝不肯栖，寂寞沙洲冷"},
  {title:"《东栏梨花》", content:"惆怅东栏一株雪，人生看得几清明"},
  {title:"《惠州一绝》", content:"日啖荔枝三百颗，不辞长作岭南人"},
  {title:"《稼说送张琥》", content:"博观而约取，厚积而薄发，吾告子止于此矣"},
  {title:"《江城子·密州出猎》", content:"老夫聊发少年狂，左牵黄、右擎苍"},
  {title:"《六月二十七日望湖楼醉书五首·其一》", content:"黑云翻墨未遮山，白雨跳珠乱入船"},
  {title:"《念奴娇·赤壁怀古》", content:"大江东去，浪淘尽、千古风流人物"},
  {title:"《题西林壁》", content:"不识庐山真面目，只缘身在此山中"},
  {title:"《饮湖上初晴后雨二首·其二》", content:"欲把西湖比西子，淡妆浓抹总相宜"},
  {title:"《春宵》", content:"春宵一刻值千金，花有清香月有阴"},
  {title:"《於潜僧绿筠轩》", content:"宁可食无肉，不可居无竹"},
  {title:"《寒食帖》", content:"自我来黄州，已过三寒食。年年欲惜春，春去不容惜"},
  {title:"《狱中寄子由二首·其一》", content:"与君世世为兄弟，更结来生未了因"},
  {title:"《正月二十日与潘郭二生……》", content:"人似秋鸿来有信，事如春梦了无痕"},
  {title:"《猪肉颂》", content:"黄州好猪肉，价贱如泥土"},
  {title:"《洞仙歌·冰肌玉骨》", content:"但屈指、西风几时来，又不道流年暗中偷换"},
  {title:"《出狱次前韵二首·其二》", content:"平生文字为吾累，此去声名不厌低"},
  {title:"《减字木兰花·立春》", content:"春牛春杖，无限春风来海上"},
  {title:"《满庭芳·仲览自江东来别》", content:"仍传语，江南父老，时与晒渔蓑"},
  {title:"《南乡子·自述》", content:"占得人间一味愚"},
  {title:"《千秋岁·次韵少游》", content:"声摇苍玉佩，色重黄金带"},
  {title:"《水调歌头·安石在东海》", content:"我醉歌时君和，醉倒须君扶我"},
  {title:"《文说》", content:"吾文如万斛泉源，不择地而出"},
  {title:"《与二郎侄》", content:"凡文字，少小时须令气象峥嵘，彩色绚烂，渐老渐熟"},
  {title:"《纵笔》", content:"报道先生春睡美，道人轻打五更钟"}
];

export const defaultDlcFallback64 = [
  {title:"《八声甘州·寄参寥子》", content:"西州路，不应回首，为我沾衣"},
  {title:"《八月七日初入赣过惶恐滩》", content:"七千里外二毛人，十八滩头一叶身"},
  {title:"《薄薄酒》", content:"薄薄酒，胜茶汤；粗粗布，胜无裳"},
  {title:"《宝绘堂记》", content:"君子可以寓意于物，而不可以留意于物"},
  {title:"《保母杨氏墓志铭》", content:"先夫人之妾杨氏，名金蝉，眉山人"},
  {title:"《别海南黎民表》", content:"我本儋耳人，寄生西蜀州"},
  {title:"《卜算子·黄州定慧院寓居作》", content:"拣尽寒枝不肯栖，寂寞沙洲冷"},
  {title:"《补子瞻赠姜唐佐秀才》", content:"沧海何曾断地脉，白袍端合破天荒"},
  {title:"《采桑子·润州多景楼与孙巨源相遇》", content:"多情多感仍多病，多景楼中，尊酒相逢"},
  {title:"《超然台记》", content:"以见予之无所往而不乐者，盖游于物之外也"},
  {title:"《晁错论》", content:"古之立大事者，不惟有超世之才，亦必有坚韧不拔之志"},
  {title:"《朝云诗》", content:"予家有数妾，四五年相继辞去，独朝云者随予南迁"},
  {title:"《潮州韩文公庙碑》", content:"文起八代之衰，而道济天下之溺"},
  {title:"《澄迈驿通潮阁二首·其二》", content:"杳杳天低鹘没处，青山一发是中原"},
  {title:"《赤壁赋》", content:"寄蜉蝣于天地，渺浮海之一粟"},
  {title:"《出局偶书》", content:"倾杯不能饮，待得卯君来"}
];

export const DEFAULT_POEMS_BY_MODE = {
  [MODES.M64]: poemsData64
};

export const DEFAULT_DLC_BY_MODE = {
  [MODES.M64]: defaultDlcFallback64
};

export function getCellKey(col, rowInCol) {
  return `${col}_${rowInCol}`;
}

export function totalRowsForMode(mode) {
  const cfg = MODE_META[mode]?.columnConfig;
  if (!cfg || cfg.length === 0) return 0;
  let total = 0;
  for (let i = 0; i < cfg.length; i++) {
    const rs = cfg[i].rowSpan;
    if (rs === 1) { total = cfg[i].count; break; }
  }
  if (total === 0) total = cfg[0].count;
  return total;
}

export function defaultPoemsByMode(mode) {
  return DEFAULT_POEMS_BY_MODE[mode] || [];
}

export function defaultDlcByMode(mode) {
  return DEFAULT_DLC_BY_MODE[mode] || [];
}

export function buildInitialCellData(mode) {
  const cellData = {};
  const cfg = MODE_META[mode];
  if (!cfg) return cellData;
  const firstColCount = cfg.columnConfig[0].count;
  const poems = defaultPoemsByMode(mode);
  for (let i = 0; i < firstColCount; i++) {
    const key = getCellKey(0, i);
    const poem = poems[i];
    if (poem) {
      cellData[key] = { title: poem.title, content: poem.content };
    }
  }
  return cellData;
}
