import dayjs from 'dayjs';

// ─────────────────────────────────────────────
// 商品資料（含成本、B2B採購價、產品規格 ID）
// 來源：2026業務部記事本 - 商品ID / 採購表
// ─────────────────────────────────────────────
export const products = [
  // ── 冷凍 / 4-6 個月（小寶）
  { id:'p101', ezposId:'158178', name:'小寶-玉米米糊',             spec:'',       unit:'包', cost:16, b2bPrice:33, category:'frozen', subCategory:'4-6個月-小寶', stock:210 },
  { id:'p102', ezposId:'158208', name:'小寶-南瓜米糊',             spec:'',       unit:'包', cost:16, b2bPrice:33, category:'frozen', subCategory:'4-6個月-小寶', stock:97  },
  { id:'p103', ezposId:'158268', name:'小寶-南瓜紅蘿蔔米糊',       spec:'',       unit:'包', cost:16, b2bPrice:33, category:'frozen', subCategory:'4-6個月-小寶', stock:130 },
  { id:'p104', ezposId:'158298', name:'小寶-甜菜玉米米糊',         spec:'',       unit:'包', cost:16, b2bPrice:33, category:'frozen', subCategory:'4-6個月-小寶', stock:100 },
  { id:'p105', ezposId:'158769', name:'小寶-釋迦鳳梨米糊',         spec:'季節限定',unit:'包', cost:48, b2bPrice:37, category:'frozen', subCategory:'4-6個月-小寶', stock:75  },
  // ── 冷凍 / 7-9 個月（中寶）
  { id:'p201', ezposId:'159476', name:'中寶-玉米雞肉粥',           spec:'',       unit:'包', cost:14, b2bPrice:45, category:'frozen', subCategory:'7-9個月-中寶', stock:130 },
  { id:'p202', ezposId:'159501', name:'中寶-蔥時蔬牛肉粥PLUS+',   spec:'',       unit:'包', cost:19, b2bPrice:55, category:'frozen', subCategory:'7-9個月-中寶', stock:125 },
  { id:'p203', ezposId:'159527', name:'中寶-蜆蔬菜魚柳粥PLUS+',   spec:'',       unit:'包', cost:19, b2bPrice:55, category:'frozen', subCategory:'7-9個月-中寶', stock:119 },
  { id:'p204', ezposId:'159553', name:'中寶-藕紅薯豬肉粥PLUS+',   spec:'',       unit:'包', cost:19, b2bPrice:55, category:'frozen', subCategory:'7-9個月-中寶', stock:97  },
  { id:'p205', ezposId:'162969', name:'大富翁-中寶-干貝菇菇香蛋粥',spec:'新品',   unit:'包', cost:27, b2bPrice:60, category:'frozen', subCategory:'7-9個月-中寶', stock:187 },
  // ── 冷凍 / 10-12 個月（大寶）
  { id:'p301', ezposId:'',       name:'大寶-芋頭姑姑豬肉粥',       spec:'200g',   unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'10-12個月-大寶', stock:80  },
  { id:'p302', ezposId:'',       name:'大寶-番茄蘑菇牛肉粥',       spec:'200g',   unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'10-12個月-大寶', stock:60  },
  { id:'p303', ezposId:'',       name:'大寶-玉米翡翠虱目魚粥',     spec:'200g',   unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'10-12個月-大寶', stock:55  },
  // ── 冷凍 / 一歲以上（燉飯）
  { id:'p401', ezposId:'163521', name:'大富翁-大寶-干貝菇菇翡翠雞蛋粥', spec:'新品', unit:'包', cost:27, b2bPrice:80, category:'frozen', subCategory:'一歲以上-燉飯', stock:66  },
  { id:'p402', ezposId:'163522', name:'大富翁-一歲-干貝金玉翡翠蛋燉飯', spec:'新品', unit:'包', cost:45, b2bPrice:80, category:'frozen', subCategory:'一歲以上-燉飯', stock:150 },
  { id:'p403', ezposId:'162234', name:'黑寶蕈菇豬肉燉飯PLUS+',    spec:'',       unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'一歲以上-燉飯', stock:181 },
  { id:'p404', ezposId:'',       name:'鮮茄時蔬牛肉燉飯PLUS+',    spec:'',       unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'一歲以上-燉飯', stock:120 },
  // ── 冷凍 / 高湯
  { id:'p501', ezposId:'',       name:'雞高湯',                    spec:'',       unit:'包', cost:12, b2bPrice:22, category:'frozen', subCategory:'高湯',           stock:400 },
  { id:'p502', ezposId:'',       name:'蔬菜高湯',                  spec:'',       unit:'包', cost:12, b2bPrice:22, category:'frozen', subCategory:'高湯',           stock:350 },
  { id:'p503', ezposId:'',       name:'龍骨高湯',                  spec:'',       unit:'包', cost:12, b2bPrice:22, category:'frozen', subCategory:'高湯',           stock:300 },
  // ── 冷凍 / 魚塊&海鮮
  { id:'p601', ezposId:'',       name:'寶寶魚塊(10入/包)',         spec:'',       unit:'包', cost:180,b2bPrice:290,category:'frozen', subCategory:'魚塊海鮮',       stock:50  },
  { id:'p602', ezposId:'',       name:'龍膽石斑寶寶魚片(6~8入)',   spec:'',       unit:'包', cost:200,b2bPrice:330,category:'frozen', subCategory:'魚塊海鮮',       stock:30  },
  { id:'p603', ezposId:'',       name:'寶寶綜合海鮮包(12入/包)',   spec:'',       unit:'包', cost:280,b2bPrice:460,category:'frozen', subCategory:'魚塊海鮮',       stock:20  },
  // ── 冷凍 / 烏龍麵
  { id:'p701', ezposId:'',       name:'無鹽寶寶烏龍麵-菠菜',       spec:'',       unit:'包', cost:20, b2bPrice:31, category:'frozen', subCategory:'烏龍麵',         stock:150 },
  { id:'p702', ezposId:'',       name:'無鹽寶寶烏龍麵-南瓜',       spec:'',       unit:'包', cost:20, b2bPrice:31, category:'frozen', subCategory:'烏龍麵',         stock:120 },

  // ── 常溫 / 常溫粥（單入）
  { id:'p801', ezposId:'159862', name:'常溫粥-鮮茄綜合菇菇粥',     spec:'',       unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入',   stock:243 },
  { id:'p802', ezposId:'159880', name:'常溫粥-蘋果蔬菜豬寶粥',     spec:'新版',   unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入',   stock:219 },
  { id:'p803', ezposId:'159889', name:'常溫粥-玉米紅蘿蔔鮭魚粥',   spec:'新版',   unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入',   stock:57  },
  { id:'p804', ezposId:'159898', name:'常溫粥-農翠平埔豬寶粥',     spec:'',       unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入',   stock:51  },
  { id:'p805', ezposId:'159907', name:'常溫粥-玉拌虱目魚寶粥',     spec:'',       unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入',   stock:58  },
  { id:'p806', ezposId:'159916', name:'常溫粥-金瓜山藥雞肉粥',     spec:'新版',   unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入',   stock:194 },
  // ── 常溫 / 常溫粥（組合）
  { id:'p811', ezposId:'159796', name:'常溫粥-海陸組(2包/盒)',     spec:'牛+虱目魚', unit:'盒', cost:0, b2bPrice:140, category:'ambient', subCategory:'常溫粥-組合', stock:99  },
  { id:'p812', ezposId:'159802', name:'常溫粥-茄汁紅蘿蔔牛(4包/盒)',spec:'',     unit:'盒', cost:0, b2bPrice:280, category:'ambient', subCategory:'常溫粥-組合', stock:386 },
  // ── 常溫 / 常溫燉飯
  { id:'p901', ezposId:'',       name:'常溫燉飯-金瓜玉米雞肉',     spec:'',       unit:'包', cost:50, b2bPrice:75, category:'ambient', subCategory:'常溫燉飯',      stock:100 },
  { id:'p902', ezposId:'',       name:'常溫燉飯-蒜香甘藍豬肉',     spec:'',       unit:'包', cost:50, b2bPrice:75, category:'ambient', subCategory:'常溫燉飯',      stock:80  },
  { id:'p903', ezposId:'',       name:'常溫燉飯-茄汁時蔬牛肉',     spec:'',       unit:'包', cost:50, b2bPrice:75, category:'ambient', subCategory:'常溫燉飯',      stock:90  },
  // ── 常溫 / 拌醬
  { id:'pa01', ezposId:'159736', name:'拌醬-田園南瓜鮮嫩雞',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬',      stock:134 },
  { id:'pa02', ezposId:'159739', name:'拌醬-青蔬總匯吻仔魚',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬',      stock:111 },
  { id:'pa03', ezposId:'159742', name:'拌醬-茄汁高湯燉牛肉',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬',      stock:100 },
  { id:'pa04', ezposId:'159745', name:'拌醬-香濃蘋果薑黃雞',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬',      stock:191 },
  // ── 常溫 / 細麵
  { id:'pb01', ezposId:'',       name:'無鹽寶寶細麵-南瓜(罐裝)',   spec:'',       unit:'罐', cost:120,b2bPrice:190,category:'ambient', subCategory:'細麵米餅',      stock:80  },
  { id:'pb02', ezposId:'',       name:'無鹽寶寶細麵-甜菜根(罐裝)', spec:'',       unit:'罐', cost:120,b2bPrice:190,category:'ambient', subCategory:'細麵米餅',      stock:70  },
  { id:'pb03', ezposId:'',       name:'粥寶寶乖乖米餅-蜜蘋果',     spec:'',       unit:'袋', cost:75, b2bPrice:120,category:'ambient', subCategory:'細麵米餅',      stock:60  },
  // ── 常溫 / 凍乾
  { id:'pc01', ezposId:'',       name:'蜜蘋果凍乾',                spec:'',       unit:'包', cost:80, b2bPrice:127,category:'ambient', subCategory:'凍乾',           stock:50  },
  { id:'pc02', ezposId:'',       name:'草莓凍乾',                  spec:'',       unit:'包', cost:80, b2bPrice:127,category:'ambient', subCategory:'凍乾',           stock:40  },
];

export const productMap = Object.fromEntries(products.map(p => [p.id, p]));

// ─────────────────────────────────────────────
// 品項表模板
// ─────────────────────────────────────────────
export const templates = [
  {
    id: 't001',
    name: '標準通路模板（冷凍+常溫）',
    productIds: products.map(p => p.id),
  },
  {
    id: 't002',
    name: '常溫專賣模板',
    productIds: products.filter(p => p.category === 'ambient').map(p => p.id),
  },
];

// ─────────────────────────────────────────────
// 通路資料（來源：通路資料表）
// ─────────────────────────────────────────────
export const channels = [
  {
    id: 'c001',
    name: '貝比波士有限公司',
    taxId: '90453215',
    title: '貝比波士有限公司',
    email: 'injoin83563069@gmail.com',
    contact: '黃宥榕',
    contactPhone: '0956-950725',
    settlementDay: 25,
    settlementMethod: '由會計手開發票',
    templateId: 't001',
    addresses: [
      {
        label: '林口店',
        recipient: 'BABEBOSS媽寶超市',
        phone: '02-26069160',
        address: '新北市林口區仁愛路一段346號1樓',
        hours: '週一至週五 9:30-17:30（週六日及國定假日公休）',
      },
    ],
    pricingNote: '1.【冷凍商品-小雞腿】採購價降為62元\n2.【常溫粥-裸包】每月採購量達450包，採購價降為65元\n3.【常溫燉飯】每月採購量達400包，採購價降為70元\n4.【常溫拌醬】每月採購量達200包，採購價降為70元',
    volumeDiscount: '1. 每月冷凍採購金額達5萬，冷凍總金額93折\n   每月冷凍採購金額達10萬，冷凍總金額9折\n2. 每月常溫&冷凍採購金額達15萬，送高湯200包\n   每月常溫&冷凍採購金額達20萬，送高湯300包',
  },
  {
    id: 'c002',
    name: '綠色小農超市',
    taxId: '54321678',
    title: '綠色小農超市股份有限公司',
    email: 'order@greenfarm.com.tw',
    contact: '林采璇',
    contactPhone: '02-2781-5566',
    settlementDay: 15,
    settlementMethod: '公司發票，月結30天',
    templateId: 't001',
    addresses: [
      {
        label: '信義旗艦店',
        recipient: '綠色小農超市',
        phone: '02-2781-5566',
        address: '台北市信義區松仁路100號1樓',
        hours: '週一至週日 10:00-21:00',
      },
      {
        label: '大安分店',
        recipient: '綠色小農超市（大安）',
        phone: '02-2700-1234',
        address: '台北市大安區仁愛路四段1號',
        hours: '週一至週日 10:00-22:00',
      },
    ],
    pricingNote: '無特殊議價，依標準採購價',
    volumeDiscount: '每月總採購金額達8萬，常溫商品95折',
  },
  {
    id: 'c003',
    name: '好自然健康館',
    taxId: '87654321',
    title: '好自然有機生活股份有限公司',
    email: 'purchase@haoran.com.tw',
    contact: '陳雅婷',
    contactPhone: '04-2328-8899',
    settlementDay: 20,
    settlementMethod: '電子發票，月結45天',
    templateId: 't002',
    addresses: [
      {
        label: '台中總倉',
        recipient: '好自然物流中心',
        phone: '04-2328-8899',
        address: '台中市西屯區工業區一路100號',
        hours: '週一至週五 09:00-17:00',
      },
    ],
    pricingNote: '常溫商品固定採購價，數量>200包另議',
    volumeDiscount: '無',
  },
];

export const channelMap = Object.fromEntries(channels.map(c => [c.id, c]));

// ─────────────────────────────────────────────
// 訂單狀態定義
// ─────────────────────────────────────────────
export const ORDER_STATUS = {
  pending:              { label: '預訂中',   color: 'blue',       step: 0 },
  awaiting_settlement:  { label: '待結算',   color: 'gold',       step: 1 },
  settling:             { label: '結算中',   color: 'processing', step: 2 },
  insufficient_stock:   { label: '庫存不足', color: 'red',        step: 2 },
  awaiting_order:       { label: '待建單',   color: 'purple',     step: 3 },
  ordered:              { label: '已建單',   color: 'cyan',       step: 4 },
  awaiting_payment:     { label: '待匯款',   color: 'orange',     step: 5 },
  paid:                 { label: '已匯款',   color: 'lime',       step: 6 },
  completed:            { label: '完成',     color: 'green',      step: 7 },
};

// ─────────────────────────────────────────────
// 假訂單資料（含 cost 欄位供損益計算）
// ─────────────────────────────────────────────
export const fakeOrders = [
  {
    id: 'ORD-2026030001',
    channelId: 'c001',
    channelName: '貝比波士有限公司',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',         unit:'包', qty:60,  price:45, cost:14 },
      { productId:'p802', productName:'常溫粥-蘋果蔬菜豬寶粥',   unit:'包', qty:50,  price:70, cost:16 },
      { productId:'pa01', productName:'拌醬-田園南瓜鮮嫩雞',     unit:'包', qty:30,  price:75, cost:41 },
      { productId:'p501', productName:'雞高湯',                  unit:'包', qty:100, price:22, cost:12 },
    ],
    status: 'awaiting_payment',
    settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-03').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    logs: [
      { time: '2026-02-03 10:22', action: '廠商送出預訂，庫存鎖定成功' },
      { time: '2026-02-25 09:00', action: '系統自動月結，生成結清訂單' },
      { time: '2026-02-25 09:01', action: '庫存確認通過（全數足夠）' },
      { time: '2026-02-25 09:02', action: '後台自動建單完成（EZPOS #8821）' },
      { time: '2026-02-25 09:03', action: '發結算匯款通知信給廠商' },
    ],
  },
  {
    id: 'ORD-2026030002',
    channelId: 'c002',
    channelName: '綠色小農超市',
    items: [
      { productId:'p804', productName:'常溫粥-農翠平埔豬寶粥',  unit:'包', qty:40,  price:70, cost:16 },
      { productId:'p805', productName:'常溫粥-玉拌虱目魚寶粥',  unit:'包', qty:20,  price:70, cost:16 },
      { productId:'pb01', productName:'無鹽寶寶細麵-南瓜(罐裝)',unit:'罐', qty:5,   price:190,cost:120 },
    ],
    status: 'insufficient_stock',
    settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-10').format('YYYY-MM-DD'),
    shippingAddress: '台北市信義區松仁路100號1樓',
    logs: [
      { time: '2026-02-10 14:05', action: '廠商送出預訂，庫存鎖定成功' },
      { time: '2026-02-15 09:00', action: '系統自動月結，生成結清訂單' },
      { time: '2026-02-15 09:01', action: '⚠️ 庫存不足（常溫粥-農翠平埔豬寶粥 剩餘 51 包，訂購 40 包目前勉強足夠，但無鹽細麵南瓜罐裝僅剩 2 罐），發通知信給管理者' },
    ],
  },
  {
    id: 'ORD-2026030003',
    channelId: 'c003',
    channelName: '好自然健康館',
    items: [
      { productId:'p901', productName:'常溫燉飯-金瓜玉米雞肉', unit:'包', qty:20, price:75, cost:50 },
      { productId:'p902', productName:'常溫燉飯-蒜香甘藍豬肉', unit:'包', qty:15, price:75, cost:50 },
      { productId:'pa03', productName:'拌醬-茄汁高湯燉牛肉',   unit:'包', qty:10, price:75, cost:41 },
    ],
    status: 'pending',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-05').format('YYYY-MM-DD'),
    shippingAddress: '台中市西屯區工業區一路100號',
    logs: [
      { time: '2026-03-05 11:30', action: '廠商送出預訂，庫存鎖定成功' },
    ],
  },
  {
    id: 'ORD-2026020001',
    channelId: 'c001',
    channelName: '貝比波士有限公司',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',       unit:'包', qty:80,  price:45, cost:14 },
      { productId:'p402', productName:'大富翁-一歲-干貝金玉翡翠蛋燉飯', unit:'包', qty:20, price:80, cost:45 },
      { productId:'p601', productName:'寶寶魚塊(10入/包)',     unit:'包', qty:5,   price:290,cost:180 },
    ],
    status: 'completed',
    settlementMonth: '2026-01',
    createdAt: dayjs('2026-01-08').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    logs: [
      { time: '2026-01-08 09:15', action: '廠商送出預訂，庫存鎖定成功' },
      { time: '2026-01-25 09:00', action: '系統自動月結' },
      { time: '2026-01-25 09:02', action: '後台自動建單（EZPOS #8790）' },
      { time: '2026-01-25 09:03', action: '發結算匯款通知信' },
      { time: '2026-01-27 16:44', action: '廠商回報已匯款 $6,750' },
      { time: '2026-01-28 10:00', action: '財務確認收款，訂單完成' },
    ],
  },
  {
    id: 'ORD-2026010001',
    channelId: 'c002',
    channelName: '綠色小農超市',
    items: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥', unit:'包', qty:30, price:70, cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥', unit:'包', qty:30, price:70, cost:16 },
      { productId:'pc01', productName:'蜜蘋果凍乾',            unit:'包', qty:10, price:127,cost:80 },
    ],
    status: 'completed',
    settlementMonth: '2026-01',
    createdAt: dayjs('2026-01-12').format('YYYY-MM-DD'),
    shippingAddress: '台北市大安區仁愛路四段1號',
    logs: [
      { time: '2026-01-12 10:00', action: '廠商送出預訂' },
      { time: '2026-01-15 09:00', action: '手動結算' },
      { time: '2026-01-15 09:01', action: '後台自動建單（EZPOS #8756）' },
      { time: '2026-01-17 14:00', action: '廠商回報已匯款' },
      { time: '2026-01-18 11:00', action: '財務確認，完成' },
    ],
  },
];
