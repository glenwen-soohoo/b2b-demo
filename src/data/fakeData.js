import dayjs from 'dayjs';

// ─────────────────────────────────────────────
// 商品資料（含成本、B2B採購價、產品規格 ID）
// ─────────────────────────────────────────────
export const products = [
  // ── 冷凍 / 4-6 個月（小寶）
  { id:'p101', fruitProductDetailId:'158178', name:'小寶-玉米米糊',             spec:'',       unit:'包', cost:16, b2bPrice:33, retailPrice:49, minRetailPrice:43, validityPeriod:'六個月', category:'frozen', subCategory:'4-6個月-小寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710101101017', frontend_product_id:'200101' },
  { id:'p102', fruitProductDetailId:'158208', name:'小寶-南瓜米糊',             spec:'',       unit:'包', cost:16, b2bPrice:33, category:'frozen', subCategory:'4-6個月-小寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p103', fruitProductDetailId:'158268', name:'小寶-南瓜紅蘿蔔米糊',       spec:'',       unit:'包', cost:16, b2bPrice:33, category:'frozen', subCategory:'4-6個月-小寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p104', fruitProductDetailId:'158298', name:'小寶-甜菜玉米米糊',         spec:'',       unit:'包', cost:16, b2bPrice:33, category:'frozen', subCategory:'4-6個月-小寶', isListed:true, stockMode:'limited',   stockLimit:80,   thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p105', fruitProductDetailId:'158769', name:'小寶-釋迦鳳梨米糊',         spec:'季節限定',unit:'包', cost:48, b2bPrice:37, category:'frozen', subCategory:'4-6個月-小寶', isListed:true, stockMode:'out_of_stock', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 冷凍 / 7-9 個月（中寶）
  { id:'p201', fruitProductDetailId:'159476', name:'中寶-玉米雞肉粥',           spec:'',       unit:'包', cost:14, b2bPrice:45, retailPrice:65, minRetailPrice:58, validityPeriod:'六個月', category:'frozen', subCategory:'7-9個月-中寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710201201010', frontend_product_id:'200201' },
  { id:'p202', fruitProductDetailId:'159501', name:'中寶-蔥時蔬牛肉粥PLUS+',   spec:'',       unit:'包', cost:19, b2bPrice:55, category:'frozen', subCategory:'7-9個月-中寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p203', fruitProductDetailId:'159527', name:'中寶-蜆蔬菜魚柳粥PLUS+',   spec:'',       unit:'包', cost:19, b2bPrice:55, category:'frozen', subCategory:'7-9個月-中寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p204', fruitProductDetailId:'159553', name:'中寶-藕紅薯豬肉粥PLUS+',   spec:'',       unit:'包', cost:19, b2bPrice:55, category:'frozen', subCategory:'7-9個月-中寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p205', fruitProductDetailId:'162969', name:'大富翁-中寶-干貝菇菇香蛋粥',spec:'新品',   unit:'包', cost:27, b2bPrice:60, retailPrice:85, minRetailPrice:75, validityPeriod:'六個月', category:'frozen', subCategory:'7-9個月-中寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710205205012', frontend_product_id:'200205' },
  // ── 冷凍 / 10-12 個月（大寶）
  { id:'p301', fruitProductDetailId:'',       name:'大寶-芋頭姑姑豬肉粥',       spec:'200g',   unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'10-12個月-大寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p302', fruitProductDetailId:'',       name:'大寶-番茄蘑菇牛肉粥',       spec:'200g',   unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'10-12個月-大寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p303', fruitProductDetailId:'',       name:'大寶-玉米翡翠虱目魚粥',     spec:'200g',   unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'10-12個月-大寶', isListed:true, stockMode:'limited',   stockLimit:55,   thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 冷凍 / 一歲以上（燉飯）
  { id:'p401', fruitProductDetailId:'163521', name:'大富翁-大寶-干貝菇菇翡翠雞蛋粥', spec:'新品', unit:'包', cost:27, b2bPrice:80, validityPeriod:'六個月', category:'frozen', subCategory:'一歲以上-燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710401401015', frontend_product_id:'200401' },
  { id:'p402', fruitProductDetailId:'163522', name:'大富翁-一歲-干貝金玉翡翠蛋燉飯', spec:'新品', unit:'包', cost:45, b2bPrice:80, category:'frozen', subCategory:'一歲以上-燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p403', fruitProductDetailId:'162234', name:'黑寶蕈菇豬肉燉飯PLUS+',    spec:'',       unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'一歲以上-燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p404', fruitProductDetailId:'',       name:'鮮茄時蔬牛肉燉飯PLUS+',    spec:'',       unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'一歲以上-燉飯', isListed:false, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 冷凍 / 高湯
  { id:'p501', fruitProductDetailId:'',       name:'雞高湯',                    spec:'',       unit:'包', cost:12, b2bPrice:22, category:'frozen', subCategory:'高湯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p502', fruitProductDetailId:'',       name:'蔬菜高湯',                  spec:'',       unit:'包', cost:12, b2bPrice:22, category:'frozen', subCategory:'高湯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p503', fruitProductDetailId:'',       name:'龍骨高湯',                  spec:'',       unit:'包', cost:12, b2bPrice:22, category:'frozen', subCategory:'高湯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 冷凍 / 魚塊&海鮮
  { id:'p601', fruitProductDetailId:'',       name:'寶寶魚塊(10入/包)',         spec:'',       unit:'包', cost:180,b2bPrice:290,validityPeriod:'六個月', category:'frozen', subCategory:'魚塊海鮮', isListed:true, stockMode:'limited',   stockLimit:50,   thumbnailUrl:'', barcode_ean13:'4710601601018', frontend_product_id:'200601' },
  { id:'p602', fruitProductDetailId:'',       name:'龍膽石斑寶寶魚片(6~8入)',   spec:'',       unit:'包', cost:200,b2bPrice:330,category:'frozen', subCategory:'魚塊海鮮', isListed:true, stockMode:'limited',   stockLimit:30,   thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p603', fruitProductDetailId:'',       name:'寶寶綜合海鮮包(12入/包)',   spec:'',       unit:'包', cost:280,b2bPrice:460,category:'frozen', subCategory:'魚塊海鮮', isListed:true, stockMode:'out_of_stock', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 冷凍 / 烏龍麵
  { id:'p701', fruitProductDetailId:'',       name:'無鹽寶寶烏龍麵-菠菜',       spec:'',       unit:'包', cost:20, b2bPrice:31, category:'frozen', subCategory:'烏龍麵', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p702', fruitProductDetailId:'',       name:'無鹽寶寶烏龍麵-南瓜',       spec:'',       unit:'包', cost:20, b2bPrice:31, category:'frozen', subCategory:'烏龍麵', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },

  // ── 常溫 / 常溫粥（單入）
  { id:'p801', fruitProductDetailId:'159862', name:'常溫粥-鮮茄綜合菇菇粥',     spec:'',       unit:'包', cost:16, b2bPrice:70, retailPrice:99, minRetailPrice:88, validityPeriod:'六個月', category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710801801013', frontend_product_id:'200801' },
  { id:'p802', fruitProductDetailId:'159880', name:'常溫粥-蘋果蔬菜豬寶粥',     spec:'新版',   unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p803', fruitProductDetailId:'159889', name:'常溫粥-玉米紅蘿蔔鮭魚粥',   spec:'新版',   unit:'包', cost:16, b2bPrice:70, retailPrice:99, minRetailPrice:88, validityPeriod:'六個月', category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710803803011', frontend_product_id:'200803' },
  { id:'p804', fruitProductDetailId:'159898', name:'常溫粥-農翠平埔豬寶粥',     spec:'',       unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p805', fruitProductDetailId:'159907', name:'常溫粥-玉拌虱目魚寶粥',     spec:'',       unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p806', fruitProductDetailId:'159916', name:'常溫粥-金瓜山藥雞肉粥',     spec:'新版',   unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 常溫 / 常溫粥（組合）
  { id:'p811', fruitProductDetailId:'159796', name:'常溫粥-海陸組(2包/盒)',     spec:'牛+虱目魚', unit:'盒', cost:0, b2bPrice:140, category:'ambient', subCategory:'常溫粥-組合', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p812', fruitProductDetailId:'159802', name:'常溫粥-茄汁紅蘿蔔牛(4包/盒)',spec:'',     unit:'盒', cost:0, b2bPrice:280, category:'ambient', subCategory:'常溫粥-組合', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 常溫 / 常溫燉飯
  { id:'p901', fruitProductDetailId:'',       name:'常溫燉飯-金瓜玉米雞肉',     spec:'',       unit:'包', cost:50, b2bPrice:75, category:'ambient', subCategory:'常溫燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p902', fruitProductDetailId:'',       name:'常溫燉飯-蒜香甘藍豬肉',     spec:'',       unit:'包', cost:50, b2bPrice:75, category:'ambient', subCategory:'常溫燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p903', fruitProductDetailId:'',       name:'常溫燉飯-茄汁時蔬牛肉',     spec:'',       unit:'包', cost:50, b2bPrice:75, category:'ambient', subCategory:'常溫燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 常溫 / 拌醬
  { id:'pa01', fruitProductDetailId:'159736', name:'拌醬-田園南瓜鮮嫩雞',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pa02', fruitProductDetailId:'159739', name:'拌醬-青蔬總匯吻仔魚',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pa03', fruitProductDetailId:'159742', name:'拌醬-茄汁高湯燉牛肉',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pa04', fruitProductDetailId:'159745', name:'拌醬-香濃蘋果薑黃雞',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 常溫 / 細麵
  { id:'pb01', fruitProductDetailId:'',       name:'無鹽寶寶細麵-南瓜(罐裝)',   spec:'',       unit:'罐', cost:120,b2bPrice:190,category:'ambient', subCategory:'細麵米餅', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pb02', fruitProductDetailId:'',       name:'無鹽寶寶細麵-甜菜根(罐裝)', spec:'',       unit:'罐', cost:120,b2bPrice:190,category:'ambient', subCategory:'細麵米餅', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pb03', fruitProductDetailId:'',       name:'粥寶寶乖乖米餅-蜜蘋果',     spec:'',       unit:'袋', cost:75, b2bPrice:120,category:'ambient', subCategory:'細麵米餅', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 常溫 / 凍乾
  { id:'pc01', fruitProductDetailId:'',       name:'蜜蘋果凍乾',                spec:'',       unit:'包', cost:80, b2bPrice:127,category:'ambient', subCategory:'凍乾', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pc02', fruitProductDetailId:'',       name:'草莓凍乾',                  spec:'',       unit:'包', cost:80, b2bPrice:127,category:'ambient', subCategory:'凍乾', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
];

export const productMap = Object.fromEntries(products.map(p => [p.id, p]));

// ─────────────────────────────────────────────
// 前台大分類（含子分類）
// temperature: 'frozen' | 'ambient'
// ─────────────────────────────────────────────
export const categories = [
  {
    id: 'cat_frozen',
    name: '冷凍',
    temperature: 'frozen',
    subCategories: [
      { id: 'sc_f01', name: '4-6個月-小寶' },
      { id: 'sc_f02', name: '7-9個月-中寶' },
      { id: 'sc_f03', name: '10-12個月-大寶' },
      { id: 'sc_f04', name: '一歲以上-燉飯' },
      { id: 'sc_f05', name: '魚塊海鮮' },
      { id: 'sc_f07', name: '烏龍麵' },
    ],
  },
  {
    id: 'cat_ambient',
    name: '常溫',
    temperature: 'ambient',
    subCategories: [
      { id: 'sc_a01', name: '常溫粥-單入' },
      { id: 'sc_a02', name: '常溫粥-組合' },
      { id: 'sc_a03', name: '常溫燉飯' },
      { id: 'sc_a04', name: '常溫拌醬' },
      { id: 'sc_a05', name: '細麵米餅' },
      { id: 'sc_a06', name: '凍乾' },
    ],
  },
  {
    id: 'cat_adult',
    name: '大人系',
    temperature: 'frozen',
    subCategories: [
      { id: 'sc_ad01', name: '高湯' },
    ],
  },
  {
    id: 'cat_smoothie',
    name: '綠拿鐵',
    temperature: 'frozen',
    subCategories: [],
  },
];

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
// Demo 假會員資料（僅供原型展示）。
// ⚠️ 正式版：B2B 通路帳號存在 B2B 自有 B2BAccount 表，不綁主站 Volunteers、不每通路建假人。
//    匯單到主站時，訂購人一律固定掛單一既有會員「無毒農」(手機 0900000000)，走既有「企業訂單匯入」邏輯。
// ─────────────────────────────────────────────
export const members = [
  { id: 'v8001', account: 'lin.boss@babeboss.com.tw', name: '黃宥榕',     phone: '0956-950725' },
  { id: 'v8002', account: 'sara@greenfarm.com.tw',    name: '林采璇',     phone: '02-2781-5566' },
  { id: 'v8003', account: 'amy.chen@haoran.com.tw',   name: '陳雅婷',     phone: '04-2328-8899' },
  { id: 'v8004', account: 'demo.buyer@example.com',   name: 'Demo 採購員', phone: '0900-000-001' },
]

// ─────────────────────────────────────────────
// 通路資料
// ─────────────────────────────────────────────
export const channels = [
  {
    id: 'c001',
    memberId: 'v8001',
    memberAccount: 'lin.boss@babeboss.com.tw',
    memberName: '黃宥榕',
    name: '貝比波士有限公司',
    taxId: '90453215',
    title: '貝比波士有限公司',
    contactEmail: 'injoin83563069@gmail.com',
    contactName: '黃宥榕',
    contactPhone: '0956-950725',
    settlementDay: 25,
    invoicePeriod: 'monthly',      // 月結
    invoiceTaxScope: 'per_store',  // 依門市分別統編（統編範圍選項已移除，一律 per_store）
    invoiceMode: 'three_copy',
    deliveryType: 'third_party',
    default_bank_last5: null,
    discount_note: '1.【冷凍商品-小雞腿】採購價降為62元\n2.【常溫粥-裸包】每月採購量達450包，採購價降為65元\n3.【常溫燉飯】每月採購量達400包，採購價降為70元\n4.【常溫拌醬】每月採購量達200包，採購價降為70元',
    internal_note: '結帳聯絡窗口為黃宥榕，請勿直接聯絡門市。',
    cs_note_default: '感謝採購，如有問題請聯繫業務窗口黃宥榕。',
    default_vendor_note: '通路合作貝比波士，月結30天，次月25號付款。',
    templateId: 't001',
    addresses: [
      {
        storeId: 's001',
        label: '林口店',
        recipient: 'BABEBOSS媽寶超市',
        phone: '02-26069160',
        address: '新北市林口區仁愛路一段346號1樓',
      },
      {
        storeId: 's002',
        label: '中壢店',
        recipient: 'BABEBOSS媽寶超市（中壢）',
        phone: '03-4528-8866',
        address: '桃園市中壢區中山路188號1樓',
      },
    ],
    volumeDiscount: '1. 每月冷凍採購金額達5萬，冷凍總金額93折\n   每月冷凍採購金額達10萬，冷凍總金額9折\n2. 每月常溫&冷凍採購金額達15萬，送高湯200包\n   每月常溫&冷凍採購金額達20萬，送高湯300包',
  },
  {
    id: 'c002',
    memberId: 'v8002',
    memberAccount: 'sara@greenfarm.com.tw',
    memberName: '林采璇',
    name: '綠色小農超市',
    taxId: '54321678',
    title: '綠色小農超市股份有限公司',
    contactEmail: 'order@greenfarm.com.tw',
    contactName: '林采璇',
    contactPhone: '02-2781-5566',
    settlementDay: 25,
    invoicePeriod: 'monthly',      // 月結
    invoiceTaxScope: 'per_store',  // 依門市分別統編（門市月結）
    invoiceMode: 'three_copy',
    deliveryType: 'own_logistics',
    default_bank_last5: '34521',
    discount_note: null,
    internal_note: '有兩個門市，結算單需分開，發票各開各的。',
    cs_note_default: null,
    templateId: 't001',
    addresses: [
      {
        storeId: 's003',
        label: '信義旗艦店',
        recipient: '綠色小農超市',
        phone: '02-2781-5566',
        address: '台北市信義區松仁路100號1樓',
        buyerName: '綠色小農超市股份有限公司',
        buyerTaxId: '54321678',
      },
      {
        storeId: 's004',
        label: '大安分店（加盟主）',
        recipient: '綠色小農超市（大安）',
        phone: '02-2700-1234',
        address: '台北市大安區仁愛路四段1號',
        buyerName: '綠農加盟商行',
        buyerTaxId: '12345678',
      },
    ],
    volumeDiscount: '每月總採購金額達8萬，常溫商品95折',
  },
  {
    id: 'c003',
    memberId: 'v8003',
    memberAccount: 'amy.chen@haoran.com.tw',
    memberName: '陳雅婷',
    name: '好自然健康館',
    taxId: '87654321',
    title: '好自然有機生活股份有限公司',
    contactEmail: 'purchase@haoran.com.tw',
    contactName: '陳雅婷',
    contactPhone: '04-2328-8899',
    settlementDay: 'last',         // 每月最後一日（次月 1 日跑結算排程）
    invoicePeriod: 'per_order',    // 單筆開票
    invoiceTaxScope: 'per_store',  // 依門市分別統編（單筆開票）
    invoiceMode: 'three_copy',
    deliveryType: 'outsource',
    default_bank_last5: '88156',
    discount_note: '常溫商品固定採購價，數量>200包另議',
    internal_note: null,
    cs_note_default: '感謝採購！如有問題請洽陳雅婷 04-2328-8899。',
    templateId: 't002',
    addresses: [
      {
        storeId: 's005',
        label: '台中總倉',
        recipient: '好自然物流中心',
        phone: '04-2328-8899',
        address: '台中市西屯區工業區一路100號',
        buyerName: '好自然有機生活股份有限公司',
        buyerTaxId: '87654321',
      },
      {
        storeId: 's006',
        label: '台中七期店',
        recipient: '好自然七期店',
        phone: '04-2253-7766',
        address: '台中市西屯區市政路100號',
        buyerName: '好自然有機生活股份有限公司',
        buyerTaxId: '87654321',
      },
      {
        storeId: 's007',
        label: '台北信義店（加盟主）',
        recipient: '好自然信義店',
        phone: '02-8780-5588',
        address: '台北市信義區松壽路50號',
        buyerName: '健新生活商行',
        buyerTaxId: '23456789',
      },
      {
        storeId: 's008',
        label: '高雄左營店（加盟主）',
        recipient: '好自然左營店',
        phone: '07-345-6622',
        address: '高雄市左營區博愛二路100號',
        buyerName: '南方健康企業社',
        buyerTaxId: '34567890',
      },
    ],
    volumeDiscount: '無',
  },
];

export const channelMap = Object.fromEntries(channels.map(c => [c.id, c]));

// ─────────────────────────────────────────────
// 訂單狀態定義
// ─────────────────────────────────────────────

// B2B訂單狀態（preOrders 使用）
export const PRE_ORDER_STATUS = {
  pending_sales: { label: '待業務確認',   color: 'blue',   step: 0 },
  ordered:       { label: '已成立訂單',   color: 'cyan',   step: 1 },
  arrived:       { label: '到貨等待結算', color: 'orange', step: 2 },
  settling:      { label: '結算中',       color: 'gold',   step: 3 },
  settled_done:  { label: '結算完畢',     color: 'purple', step: 4 },
  voided:        { label: '作廢',         color: 'red',    step: -1 },
};

// 結算單狀態（formalOrders / settlements 使用）
export const SETTLEMENT_STATUS = {
  pending_settlement: { label: '尚未結算', color: 'purple', step: -1 },  // 方案 B：發票比結算早開，先呈現本月未結算單
  awaiting_payment:   { label: '待匯款', color: 'gold',  step: 0 },
  paid:               { label: '已匯款', color: 'green', step: 1 },  // 與「完成」區隔：已匯款=綠
  completed:          { label: '完成',   color: 'blue',  step: 2 },  // 完成=藍
};

// 向後相容（合併，供 StatusTag 使用）
export const ORDER_STATUS = { ...PRE_ORDER_STATUS, ...SETTLEMENT_STATUS };

// ─────────────────────────────────────────────
// B2B訂單（廠商提交，等待業務/倉庫確認）
// ─────────────────────────────────────────────
export const preOrders = [
  // 好自然健康館 — 待業務確認
  {
    id: 'b2b-00001',
    channelId: 'c003',
    channelName: '好自然健康館',
    items: [
      { productId:'p901', productName:'常溫燉飯-金瓜玉米雞肉', unit:'包', qty:20, price:75, cost:50 },
      { productId:'p902', productName:'常溫燉飯-蒜香甘藍豬肉', unit:'包', qty:15, price:75, cost:50 },
      { productId:'pa03', productName:'拌醬-茄汁高湯燉牛肉',   unit:'包', qty:10, price:75, cost:41 },
    ],
    status: 'pending_sales',
    salesAdjustedItems: null,
    adjustedItems: null,
    vendorNote: '請於3/28前出貨，配合門市促銷活動，謝謝。',
    warehouse_note: null, shipping_note: null,
    backendOrderId: null,
    settlementId: null,
    b2b_order_no: 'B2B-202603-0001',
    discount_amount: 0,
    discount_note: null,
    cs_note: null, b2b_note: null,
    invoicePeriodSnapshot: 'per_order',
    invoiceTaxScopeSnapshot: 'per_store',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-05').format('YYYY-MM-DD'),
    shippingAddress: '台中市西屯區工業區一路100號',
    store_label: '台中總倉',
    storeId: 's005',
    buyerNameSnapshot: '好自然有機生活股份有限公司',
    buyerTaxIdSnapshot: '87654321',
    invoiceTypeSnapshot: '三聯式',
    logs: [
      { time: '2026-03-05 11:30', action: '廠商送出B2B訂單' },
    ],
  },
  // 綠色小農超市 — 待倉庫確認（業務已確認，有微調）
  {
    id: 'b2b-00002',
    channelId: 'c002',
    channelName: '綠色小農超市',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',            unit:'包', qty:50, price:45, cost:14 },
      { productId:'p202', productName:'中寶-蔥時蔬牛肉粥PLUS+',    unit:'包', qty:30, price:55, cost:19 },
      { productId:'p205', productName:'大富翁-中寶-干貝菇菇香蛋粥', unit:'包', qty:20, price:60, cost:27 },
      { productId:'p501', productName:'雞高湯',                     unit:'包', qty:80, price:22, cost:12 },
    ],
    salesAdjustedItems: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',            unit:'包', qty:50, price:45, cost:14 },
      { productId:'p202', productName:'中寶-蔥時蔬牛肉粥PLUS+',    unit:'包', qty:25, price:55, cost:19 },
      { productId:'p205', productName:'大富翁-中寶-干貝菇菇香蛋粥', unit:'包', qty:20, price:60, cost:27 },
      { productId:'p501', productName:'雞高湯',                     unit:'包', qty:80, price:22, cost:12 },
    ],
    adjustedItems: null,
    vendorNote: '信義店週二、四下午有促銷活動，請於上午前送達。',
    warehouse_note: null,
    shipping_note: '信義店週二、四下午有促銷活動，請於上午前送達。',
    backendOrderId: '260302009003',
    settlementId: 'FO-20260315-C002',
    b2b_order_no: 'B2B-202603-0002',
    invoiceNumber: '發票月結',
    discount_amount: 150,
    discount_note: '配合春季新品上架，本次訂單折讓150元作為陳列費。',
    cs_note: '綠色小農為長期合作通路，出貨時段可彈性安排。',
    b2b_note: '業務已告知中寶牛肉粥庫存情況，通路接受調整；春季新品折扣已套用。',
    invoicePeriodSnapshot: 'monthly',
    invoiceTaxScopeSnapshot: 'per_store',
    status: 'settled_done',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-01').format('YYYY-MM-DD'),
    shippingAddress: '台北市信義區松仁路100號1樓',
    store_label: '信義旗艦店',
    storeId: 's003',
    blackCatNum: '9012345672',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-03-05 14:00',
    logs: [
      { time: '2026-03-01 09:30', action: '廠商送出B2B訂單' },
      { time: '2026-03-02 10:15', action: '[手動操作] 業務確認完成，建立正式訂單（中寶-蔥時蔬牛肉粥PLUS+: 30→25）' },
      { time: '2026-03-05 14:00', action: '物流回報已到貨' },
      { time: '2026-03-15 09:00', action: '已納入結算單 FO-20260315-C002' },
    ],
  },
  // 綠色小農超市 — 已成立訂單（倉庫已確認，進入後台）
  {
    id: 'b2b-00003',
    channelId: 'c002',
    channelName: '綠色小農超市',
    items: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥',        unit:'包', qty:60,  price:70,  cost:16 },
      { productId:'p802', productName:'常溫粥-蘋果蔬菜豬寶粥',        unit:'包', qty:60,  price:70,  cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥',        unit:'包', qty:40,  price:70,  cost:16 },
      { productId:'pa04', productName:'拌醬-香濃蘋果薑黃雞',          unit:'包', qty:20,  price:75,  cost:41 },
      { productId:'p812', productName:'常溫粥-茄汁紅蘿蔔牛(4包/盒)', unit:'盒', qty:10,  price:280, cost:0  },
    ],
    salesAdjustedItems: null,
    adjustedItems: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥',        unit:'包', qty:60,  price:70,  cost:16 },
      { productId:'p802', productName:'常溫粥-蘋果蔬菜豬寶粥',        unit:'包', qty:55,  price:70,  cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥',        unit:'包', qty:40,  price:70,  cost:16 },
      { productId:'pa04', productName:'拌醬-香濃蘋果薑黃雞',          unit:'包', qty:20,  price:75,  cost:41 },
      { productId:'p812', productName:'常溫粥-茄汁紅蘿蔔牛(4包/盒)', unit:'盒', qty:10,  price:280, cost:0  },
    ],
    vendorNote: '煩請提前確認出貨時段，大安店收貨需事先預約，謝謝。',
    warehouse_note: '蘋果豬寶粥庫存確認後僅55包，已調整', shipping_note: null,
    backendOrderId: '260308008835',
    settlementId: 'FO-20260315-C002',
    b2b_order_no: 'B2B-202603-0003',
    invoiceNumber: '發票月結',
    discount_amount: 0,
    discount_note: null,
    cs_note: '蘋果豬寶粥本次數量略減，下月補足，已與門市確認。',
    b2b_note: null,
    invoicePeriodSnapshot: 'monthly',
    invoiceTaxScopeSnapshot: 'per_store',
    status: 'settled_done',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-06').format('YYYY-MM-DD'),
    shippingAddress: '台北市大安區仁愛路四段1號',
    store_label: '大安分店',
    storeId: 's004',
    blackCatNum: '9012345673',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-03-09 14:30',
    logs: [
      { time: '2026-03-06 14:20', action: '廠商送出B2B訂單' },
      { time: '2026-03-07 09:00', action: '[手動操作] 業務確認完成，送倉庫確認（數量無變動）' },
      { time: '2026-03-08 11:30', action: '[倉庫操作] 確認並轉入後台（常溫粥-蘋果蔬菜豬寶粥: 60→55），後台建單 260308008835' },
      { time: '2026-03-09 14:30', action: '物流回報已到貨' },
      { time: '2026-03-15 09:00', action: '已納入結算單 FO-20260315-C002' },
    ],
  },
  // 貝比波士 林口店 — 已到貨，待結算
  {
    id: 'b2b-00013',
    channelId: 'c001', channelName: '貝比波士有限公司',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',     unit:'包', qty:60,  price:45,  cost:14 },
      { productId:'p403', productName:'黑寶蕈菇豬肉燉飯PLUS+', unit:'包', qty:30, price:70,  cost:45 },
      { productId:'p501', productName:'雞高湯',               unit:'包', qty:80,  price:22,  cost:12 },
    ],
    salesAdjustedItems: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',     unit:'包', qty:60,  price:45,  cost:14 },
      { productId:'p403', productName:'黑寶蕈菇豬肉燉飯PLUS+', unit:'包', qty:30, price:70,  cost:45 },
      { productId:'p501', productName:'雞高湯',               unit:'包', qty:80,  price:22,  cost:12 },
    ],
    adjustedItems: null,
    vendorNote: '林口店倉管為阿明（0912-345-678），送達請先致電。',
    warehouse_note: null,
    shipping_note: '林口店倉管為阿明（0912-345-678），送達請先致電。',
    backendOrderId: '260318009010',
    settlementId: null,
    b2b_order_no: 'B2B-202603-0010',
    invoiceNumber: '發票月結',
    discount_amount: 300,
    discount_note: '貝比波士為長期合作，本月額外折讓300元感謝支持。',
    cs_note: '林口店新倉管習慣於早上收貨，下午可能無人簽收。',
    b2b_note: '下月將上架新款一歲燉飯系列，歡迎提前詢問進貨。',
    invoicePeriodSnapshot: 'monthly',
    invoiceTaxScopeSnapshot: 'channel',
    status: 'arrived',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-15').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    store_label: '林口店',
    blackCatNum: '9012345683',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-03-18 14:30',
    logs: [
      { time: '2026-03-15 09:20', action: '廠商送出B2B訂單' },
      { time: '2026-03-16 10:00', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
      { time: '2026-03-17 14:30', action: '[倉庫操作] 確認並轉入後台，後台建單 260318009010' },
      { time: '2026-03-18 11:00', action: '物流回報已到貨' },
    ],
  },
  // 貝比波士 中壢店 — 已到貨，待結算
  {
    id: 'b2b-00014',
    channelId: 'c001', channelName: '貝比波士有限公司',
    items: [
      { productId:'p101', productName:'小寶-玉米米糊',           unit:'包', qty:50, price:33, cost:16 },
      { productId:'p202', productName:'中寶-蔥時蔬牛肉粥PLUS+', unit:'包', qty:40, price:55, cost:19 },
      { productId:'p301', productName:'大寶-芋頭姑姑豬肉粥',     unit:'包', qty:20, price:70, cost:45 },
    ],
    salesAdjustedItems: [
      { productId:'p101', productName:'小寶-玉米米糊',           unit:'包', qty:50, price:33, cost:16 },
      { productId:'p202', productName:'中寶-蔥時蔬牛肉粥PLUS+', unit:'包', qty:40, price:55, cost:19 },
      { productId:'p301', productName:'大寶-芋頭姑姑豬肉粥',     unit:'包', qty:20, price:70, cost:45 },
    ],
    adjustedItems: null,
    vendorNote: '中壢店位於地下停車場，請走貨物電梯送貨。',
    warehouse_note: null,
    shipping_note: '中壢店位於地下停車場，請走貨物電梯送貨。',
    backendOrderId: '260320009015',
    settlementId: null,
    b2b_order_no: 'B2B-202603-0011',
    invoiceNumber: '發票月結',
    discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null,
    invoicePeriodSnapshot: 'monthly',
    invoiceTaxScopeSnapshot: 'channel',
    status: 'arrived',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-18').format('YYYY-MM-DD'),
    shippingAddress: '桃園市中壢區中山路188號1樓',
    store_label: '中壢店',
    blackCatNum: '9012345684',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-03-21 14:30',
    logs: [
      { time: '2026-03-18 10:00', action: '廠商送出B2B訂單' },
      { time: '2026-03-19 09:30', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
      { time: '2026-03-20 13:00', action: '[倉庫操作] 確認並轉入後台，後台建單 260320009015' },
      { time: '2026-03-21 10:30', action: '物流回報已到貨' },
    ],
  },
  // 綠色小農超市 信義旗艦店 — 已到貨，待結算
  {
    id: 'b2b-00015',
    channelId: 'c002', channelName: '綠色小農超市',
    items: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥', unit:'包', qty:40, price:70, cost:16 },
      { productId:'p804', productName:'常溫粥-農翠平埔豬寶粥', unit:'包', qty:30, price:70, cost:16 },
      { productId:'pb03', productName:'粥寶寶乖乖米餅-蜜蘋果', unit:'袋', qty:20, price:120, cost:75 },
    ],
    salesAdjustedItems: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥', unit:'包', qty:40, price:70, cost:16 },
      { productId:'p804', productName:'常溫粥-農翠平埔豬寶粥', unit:'包', qty:30, price:70, cost:16 },
      { productId:'pb03', productName:'粥寶寶乖乖米餅-蜜蘋果', unit:'袋', qty:20, price:120, cost:75 },
    ],
    adjustedItems: null,
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260316009012',
    settlementId: null,
    b2b_order_no: 'B2B-202603-0012',
    invoiceNumber: '發票月結',
    discount_amount: 500,
    discount_note: '米餅新品首次進貨折讓500元鼓勵陳列。',
    cs_note: null,
    b2b_note: '米餅新品試賣價已套用，如有銷售數據歡迎回饋。',
    invoicePeriodSnapshot: 'monthly',
    invoiceTaxScopeSnapshot: 'per_store',
    status: 'arrived',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-13').format('YYYY-MM-DD'),
    shippingAddress: '台北市信義區松仁路100號1樓',
    store_label: '信義旗艦店',
    storeId: 's003',
    blackCatNum: '9012345685',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-03-16 14:30',
    logs: [
      { time: '2026-03-13 14:00', action: '廠商送出B2B訂單' },
      { time: '2026-03-14 10:00', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
      { time: '2026-03-15 11:30', action: '[倉庫操作] 確認並轉入後台，後台建單 260316009012' },
      { time: '2026-03-16 09:00', action: '物流回報已到貨' },
    ],
  },
  // ── 歷史資料（已結算，對應現有結算單）──────────────────────
  // 貝比波士 2026-02 冷凍單 → FO-20260225-C001
  {
    id: 'b2b-00007',
    channelId: 'c001', channelName: '貝比波士有限公司',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥', unit:'包', qty:60, price:45, cost:14 },
    ],
    salesAdjustedItems: null, adjustedItems: null,
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260212008815', settlementId: 'FO-20260225-C001',
    b2b_order_no: 'B2B-202602-0007', discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null, invoicePeriodSnapshot: 'monthly', invoiceTaxScopeSnapshot: 'channel',
    status: 'settled_done', settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-10').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    store_label: '林口店',
    blackCatNum: '9012345677',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-02-13 14:30',
    logs: [
      { time: '2026-02-10 10:00', action: '廠商送出B2B訂單（冷凍）' },
      { time: '2026-02-11 09:00', action: '[手動操作] 業務確認完成，送倉庫確認（數量無變動）' },
      { time: '2026-02-12 11:00', action: '[倉庫操作] 確認並轉入後台（數量無變動），後台建單 260212008815' },
      { time: '2026-02-25 09:00', action: '已納入結算單 FO-20260225-C001，狀態鎖定' },
    ],
  },
  // 貝比波士 2026-02 常溫單 → FO-20260225-C001
  {
    id: 'b2b-00007b',
    channelId: 'c001', channelName: '貝比波士有限公司',
    items: [
      { productId:'p802', productName:'常溫粥-蘋果蔬菜豬寶粥', unit:'包', qty:50, price:70, cost:16 },
      { productId:'pa01', productName:'拌醬-田園南瓜鮮嫩雞',   unit:'包', qty:30, price:75, cost:41 },
    ],
    salesAdjustedItems: null, adjustedItems: null,
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260212008815b', settlementId: 'FO-20260225-C001',
    b2b_order_no: 'B2B-202602-0008', discount_amount: 200, discount_note: '本月常溫量大，折讓200元。',
    cs_note: null, b2b_note: null, invoicePeriodSnapshot: 'monthly', invoiceTaxScopeSnapshot: 'channel',
    status: 'settled_done', settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-10').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    store_label: '林口店',
    logs: [
      { time: '2026-02-10 10:00', action: '廠商送出B2B訂單（常溫）' },
      { time: '2026-02-11 09:00', action: '[手動操作] 業務確認完成，送倉庫確認（數量無變動）' },
      { time: '2026-02-12 11:00', action: '[倉庫操作] 確認並轉入後台（數量無變動），後台建單 260212008815b' },
      { time: '2026-02-25 09:00', action: '已納入結算單 FO-20260225-C001，狀態鎖定' },
    ],
  },
  // 貝比波士 2026-02 第2筆 → FO-20260225-C001
  {
    id: 'b2b-00008',
    channelId: 'c001', channelName: '貝比波士有限公司',
    items: [
      { productId:'p501', productName:'雞高湯', unit:'包', qty:100, price:22, cost:12 },
    ],
    salesAdjustedItems: null, adjustedItems: null,
    vendorNote: '此筆為補單，請勿與主單合併出貨。',
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260217008816', settlementId: 'FO-20260225-C001',
    b2b_order_no: 'B2B-202602-0009', discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null, invoicePeriodSnapshot: 'monthly', invoiceTaxScopeSnapshot: 'channel',
    status: 'settled_done', settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-15').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    store_label: '林口店',
    blackCatNum: '9012345678',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-02-18 14:30',
    logs: [
      { time: '2026-02-15 14:00', action: '廠商送出B2B訂單' },
      { time: '2026-02-16 09:30', action: '[手動操作] 業務確認完成，送倉庫確認（數量無變動）' },
      { time: '2026-02-17 10:00', action: '[倉庫操作] 確認並轉入後台（數量無變動），後台建單 260217008816' },
      { time: '2026-02-25 09:00', action: '已納入結算單 FO-20260225-C001，狀態鎖定' },
    ],
  },
  // 貝比波士 2026-01 → FO-20260125-C001
  {
    id: 'b2b-00009',
    channelId: 'c001', channelName: '貝比波士有限公司',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',                 unit:'包', qty:80, price:45,  cost:14 },
      { productId:'p402', productName:'大富翁-一歲-干貝金玉翡翠蛋燉飯', unit:'包', qty:20, price:80,  cost:45 },
      { productId:'p601', productName:'寶寶魚塊(10入/包)',               unit:'包', qty:5,  price:290, cost:180 },
    ],
    salesAdjustedItems: null, adjustedItems: null,
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260114008790', settlementId: 'FO-20260125-C001',
    b2b_order_no: 'B2B-202601-0001', discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null, invoicePeriodSnapshot: 'monthly', invoiceTaxScopeSnapshot: 'channel',
    status: 'settled_done', settlementMonth: '2026-01',
    createdAt: dayjs('2026-01-12').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    store_label: '林口店',
    blackCatNum: '9012345679',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-01-15 14:30',
    logs: [
      { time: '2026-01-12 09:00', action: '廠商送出B2B訂單' },
      { time: '2026-01-13 10:00', action: '[手動操作] 業務確認完成，送倉庫確認（數量無變動）' },
      { time: '2026-01-14 11:00', action: '[倉庫操作] 確認並轉入後台（數量無變動），後台建單 260114008790' },
      { time: '2026-01-25 09:00', action: '已納入結算單 FO-20260125-C001，狀態鎖定' },
    ],
  },
  // 綠色小農 2026-01 → FO-20260115-C002
  {
    id: 'b2b-00010',
    channelId: 'c002', channelName: '綠色小農超市',
    items: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥', unit:'包', qty:30, price:70,  cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥', unit:'包', qty:30, price:70,  cost:16 },
      { productId:'pc01', productName:'蜜蘋果凍乾',            unit:'包', qty:10, price:127, cost:80 },
    ],
    salesAdjustedItems: null, adjustedItems: null,
    vendorNote: '1月份例行補貨，常溫商品請走常溫配送，勿混裝冷凍箱。',
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260110008756', settlementId: 'FO-20260115-C002',
    b2b_order_no: 'B2B-202601-0002', discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null, invoicePeriodSnapshot: 'monthly', invoiceTaxScopeSnapshot: 'per_store',
    status: 'settled_done', settlementMonth: '2026-01',
    createdAt: dayjs('2026-01-08').format('YYYY-MM-DD'),
    shippingAddress: '台北市大安區仁愛路四段1號',
    store_label: '大安分店',
    storeId: 's004',
    blackCatNum: '9012345680',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-01-11 14:30',
    logs: [
      { time: '2026-01-08 11:00', action: '廠商送出B2B訂單' },
      { time: '2026-01-09 09:00', action: '[手動操作] 業務確認完成，送倉庫確認（數量無變動）' },
      { time: '2026-01-10 10:00', action: '[倉庫操作] 確認並轉入後台（數量無變動），後台建單 260110008756' },
      { time: '2026-01-15 09:00', action: '已納入結算單 FO-20260115-C002，狀態鎖定' },
    ],
  },
  // 好自然健康館 2026-02 → FO-20260220-C003（paid 狀態展示）
  {
    id: 'b2b-00011',
    channelId: 'c003', channelName: '好自然健康館',
    items: [
      { productId:'p901', productName:'常溫燉飯-金瓜玉米雞肉', unit:'包', qty:30, price:75, cost:50 },
      { productId:'pa02', productName:'拌醬-青蔬總匯吻仔魚',   unit:'包', qty:20, price:75, cost:41 },
      { productId:'pb03', productName:'粥寶寶乖乖米餅-蜜蘋果', unit:'袋', qty:12, price:120, cost:75 },
    ],
    salesAdjustedItems: null,
    adjustedItems: [
      { productId:'p901', productName:'常溫燉飯-金瓜玉米雞肉', unit:'包', qty:30, price:75, cost:50 },
      { productId:'pa02', productName:'拌醬-青蔬總匯吻仔魚',   unit:'包', qty:20, price:75, cost:41 },
      { productId:'pb03', productName:'粥寶寶乖乖米餅-蜜蘋果', unit:'袋', qty:12, price:120, cost:75 },
    ],
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260211008822', settlementId: 'FO-20260220-C003',
    b2b_order_no: 'B2B-202602-0001', discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null, invoicePeriodSnapshot: 'per_order', invoiceTaxScopeSnapshot: 'per_store',
    status: 'settled_done', settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-08').format('YYYY-MM-DD'),
    shippingAddress: '台中市西屯區工業區一路100號',
    store_label: '台中總倉',
    storeId: 's005',
    buyerNameSnapshot: '好自然有機生活股份有限公司',
    buyerTaxIdSnapshot: '87654321',
    invoiceTypeSnapshot: '三聯式',
    blackCatNum: '9012345681',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-02-11 14:30',
    logs: [
      { time: '2026-02-08 09:00', action: '廠商送出B2B訂單' },
      { time: '2026-02-10 10:00', action: '[手動操作] 業務確認完成，送倉庫確認（數量無變動）' },
      { time: '2026-02-11 11:00', action: '[倉庫操作] 確認並轉入後台（數量無變動），後台建單 260211008822' },
      { time: '2026-02-20 09:00', action: '已納入結算單 FO-20260220-C003，狀態鎖定' },
    ],
  },
  // ── 當月 (2026-03) 一般B2B訂單 ─────────────────────────────
  // 貝比波士 — 待倉庫確認（業務已調整數量）
  {
    id: 'b2b-00005',
    channelId: 'c001',
    channelName: '貝比波士有限公司',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',            unit:'包', qty:80,  price:45,  cost:14 },
      { productId:'p301', productName:'大寶-芋頭姑姑豬肉粥',        unit:'包', qty:40,  price:70,  cost:45 },
      { productId:'p501', productName:'雞高湯',                     unit:'包', qty:100, price:22,  cost:12 },
      { productId:'p601', productName:'寶寶魚塊(10入/包)',           unit:'包', qty:10,  price:290, cost:180 },
    ],
    salesAdjustedItems: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',            unit:'包', qty:80,  price:45,  cost:14 },
      { productId:'p301', productName:'大寶-芋頭姑姑豬肉粥',        unit:'包', qty:35,  price:70,  cost:45 },
      { productId:'p501', productName:'雞高湯',                     unit:'包', qty:100, price:22,  cost:12 },
      { productId:'p601', productName:'寶寶魚塊(10入/包)',           unit:'包', qty:10,  price:290, cost:180 },
    ],
    adjustedItems: null,
    vendorNote: '本次加訂魚塊，請確認冷鏈全程配送，謝謝。',
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260304009001',
    settlementId: null,
    b2b_order_no: 'B2B-202603-0005',
    invoiceNumber: '發票月結',
    discount_amount: 0,
    discount_note: null,
    cs_note: null, b2b_note: null,
    invoicePeriodSnapshot: 'monthly',
    invoiceTaxScopeSnapshot: 'channel',
    status: 'ordered',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-03').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    store_label: '林口店',
    blackCatNum: '9012345675',
    blackCatStatus: '已出貨',
    logs: [
      { time: '2026-03-03 09:10', action: '廠商送出B2B訂單' },
      { time: '2026-03-04 10:00', action: '[手動操作] 業務確認完成，建立正式訂單（大寶-芋頭姑姑豬肉粥: 40→35）' },
    ],
  },
  // 好自然健康館 — 待倉庫確認（業務數量無變動）
  {
    id: 'b2b-00006',
    channelId: 'c003',
    channelName: '好自然健康館',
    items: [
      { productId:'p901', productName:'常溫燉飯-金瓜玉米雞肉', unit:'包', qty:25,  price:75,  cost:50 },
      { productId:'p903', productName:'常溫燉飯-茄汁時蔬牛肉', unit:'包', qty:20,  price:75,  cost:50 },
      { productId:'pa02', productName:'拌醬-青蔬總匯吻仔魚',   unit:'包', qty:15,  price:75,  cost:41 },
      { productId:'pb01', productName:'無鹽寶寶細麵-南瓜(罐裝)',unit:'罐', qty:8,   price:190, cost:120 },
    ],
    salesAdjustedItems: [
      { productId:'p901', productName:'常溫燉飯-金瓜玉米雞肉', unit:'包', qty:25,  price:75,  cost:50 },
      { productId:'p903', productName:'常溫燉飯-茄汁時蔬牛肉', unit:'包', qty:20,  price:75,  cost:50 },
      { productId:'pa02', productName:'拌醬-青蔬總匯吻仔魚',   unit:'包', qty:15,  price:75,  cost:41 },
      { productId:'pb01', productName:'無鹽寶寶細麵-南瓜(罐裝)',unit:'罐', qty:8,   price:190, cost:120 },
    ],
    adjustedItems: null,
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260308009002',
    settlementId: null,
    b2b_order_no: 'B2B-202603-0006',
    discount_amount: 0,
    discount_note: null,
    cs_note: null, b2b_note: null,
    invoicePeriodSnapshot: 'per_order',
    invoiceTaxScopeSnapshot: 'per_store',
    status: 'ordered',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-07').format('YYYY-MM-DD'),
    shippingAddress: '台中市西屯區工業區一路100號',
    store_label: '台中總倉',
    storeId: 's005',
    buyerNameSnapshot: '好自然有機生活股份有限公司',
    buyerTaxIdSnapshot: '87654321',
    invoiceTypeSnapshot: '三聯式',
    blackCatNum: '9012345676',
    blackCatStatus: '配送中',
    logs: [
      { time: '2026-03-07 14:20', action: '廠商送出B2B訂單' },
      { time: '2026-03-08 09:30', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
    ],
  },
  // 貝比波士 中壢店 — 待業務確認
  {
    id: 'b2b-00012',
    channelId: 'c001',
    channelName: '貝比波士有限公司',
    items: [
      { productId:'p101', productName:'小寶-玉米米糊',   unit:'包', qty:30, price:33, cost:16 },
      { productId:'p201', productName:'中寶-玉米雞肉粥', unit:'包', qty:40, price:45, cost:14 },
      { productId:'p301', productName:'大寶-芋頭姑姑豬肉粥', unit:'包', qty:20, price:70, cost:45 },
    ],
    salesAdjustedItems: null,
    adjustedItems: null,
    vendorNote: '中壢店本月首次下單，請注意配送路線。',
    cs_note: null, b2b_note: null,
    warehouse_note: null, shipping_note: null,
    backendOrderId: null,
    settlementId: null,
    b2b_order_no: 'B2B-202603-0012',
    invoiceNumber: '發票月結',
    discount_amount: 0,
    discount_note: null,
    invoicePeriodSnapshot: 'monthly',
    invoiceTaxScopeSnapshot: 'channel',
    status: 'pending_sales',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-10').format('YYYY-MM-DD'),
    shippingAddress: '桃園市中壢區中山路188號1樓',
    store_label: '中壢店',
    logs: [
      { time: '2026-03-10 11:00', action: '廠商送出B2B訂單' },
    ],
  },
  // 綠色小農超市 — 待業務確認
  {
    id: 'b2b-00004',
    channelId: 'c002',
    channelName: '綠色小農超市',
    items: [
      { productId:'p901', productName:'常溫燉飯-金瓜玉米雞肉', unit:'包', qty:30,  price:75,  cost:50 },
      { productId:'p902', productName:'常溫燉飯-蒜香甘藍豬肉', unit:'包', qty:25,  price:75,  cost:50 },
      { productId:'pb03', productName:'粥寶寶乖乖米餅-蜜蘋果', unit:'袋', qty:15,  price:120, cost:75 },
      { productId:'pc01', productName:'蜜蘋果凍乾',            unit:'包', qty:8,   price:127, cost:80 },
      { productId:'pc02', productName:'草莓凍乾',              unit:'包', qty:8,   price:127, cost:80 },
    ],
    salesAdjustedItems: null,
    adjustedItems: null,
    vendorNote: '凍乾品項若無現貨可替換為米餅，請事先告知。',
    warehouse_note: null, shipping_note: null,
    backendOrderId: null,
    settlementId: null,
    b2b_order_no: 'B2B-202603-0004',
    invoiceNumber: '發票月結',
    discount_amount: 0,
    discount_note: null,
    cs_note: null, b2b_note: null,
    invoicePeriodSnapshot: 'monthly',
    invoiceTaxScopeSnapshot: 'per_store',
    status: 'pending_sales',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-08').format('YYYY-MM-DD'),
    shippingAddress: '台北市信義區松仁路100號1樓',
    store_label: '信義旗艦店',
    storeId: 's003',
    logs: [
      { time: '2026-03-08 10:45', action: '廠商送出B2B訂單' },
    ],
  },
  // 好自然健康館 — 七期店（同總公司統編）
  {
    id: 'b2b-00020',
    channelId: 'c003', channelName: '好自然健康館',
    items: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥', unit:'包', qty:30, price:70, cost:16 },
      { productId:'p804', productName:'常溫粥-農翠平埔豬寶粥', unit:'包', qty:25, price:70, cost:16 },
    ],
    salesAdjustedItems: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥', unit:'包', qty:30, price:70, cost:16 },
      { productId:'p804', productName:'常溫粥-農翠平埔豬寶粥', unit:'包', qty:25, price:70, cost:16 },
    ],
    adjustedItems: null,
    vendorNote: '七期店週末活動需求量增加。',
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260322009030',
    settlementId: null,
    b2b_order_no: 'B2B-202603-0020',
    discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null,
    invoicePeriodSnapshot: 'per_order',
    invoiceTaxScopeSnapshot: 'per_store',
    status: 'ordered',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-20').format('YYYY-MM-DD'),
    shippingAddress: '台中市西屯區市政路100號',
    store_label: '台中七期店',
    buyerNameSnapshot: '好自然有機生活股份有限公司',
    buyerTaxIdSnapshot: '87654321',
    invoiceTypeSnapshot: '三聯式',
    storeId: 's006',
    blackCatNum: '9012345690',
    blackCatStatus: '配送中',
    logs: [
      { time: '2026-03-20 09:30', action: '廠商送出B2B訂單' },
      { time: '2026-03-21 10:00', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
    ],
  },
  // 好自然健康館 — 信義店（加盟主，不同統編）
  {
    id: 'b2b-00021',
    channelId: 'c003', channelName: '好自然健康館',
    items: [
      { productId:'p101', productName:'小寶-玉米米糊',     unit:'包', qty:40, price:33, cost:16 },
      { productId:'p202', productName:'中寶-蔥時蔬牛肉粥PLUS+', unit:'包', qty:30, price:55, cost:19 },
      { productId:'p501', productName:'雞高湯',           unit:'包', qty:60, price:22, cost:12 },
    ],
    salesAdjustedItems: [
      { productId:'p101', productName:'小寶-玉米米糊',     unit:'包', qty:40, price:33, cost:16 },
      { productId:'p202', productName:'中寶-蔥時蔬牛肉粥PLUS+', unit:'包', qty:30, price:55, cost:19 },
      { productId:'p501', productName:'雞高湯',           unit:'包', qty:60, price:22, cost:12 },
    ],
    adjustedItems: null,
    vendorNote: '信義店為加盟主經營，發票需開立健新生活商行統編。',
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260318009025',
    settlementId: null,
    b2b_order_no: 'B2B-202603-0021',
    invoiceNumber: 'IV-202603-0021',
    discount_amount: 0, discount_note: null,
    cs_note: '加盟主訂單，注意統編對應。',
    b2b_note: null,
    invoicePeriodSnapshot: 'per_order',
    invoiceTaxScopeSnapshot: 'per_store',
    status: 'arrived',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-15').format('YYYY-MM-DD'),
    shippingAddress: '台北市信義區松壽路50號',
    store_label: '台北信義店（加盟主）',
    buyerNameSnapshot: '健新生活商行',
    buyerTaxIdSnapshot: '23456789',
    invoiceTypeSnapshot: '三聯式',
    storeId: 's007',
    blackCatNum: '9012345691',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-03-18 14:30',
    logs: [
      { time: '2026-03-15 14:00', action: '廠商送出B2B訂單' },
      { time: '2026-03-16 09:30', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
      { time: '2026-03-18 14:30', action: '物流回報已到貨' },
    ],
  },
  // 好自然健康館 — 左營店（加盟主，不同統編）
  {
    id: 'b2b-00022',
    channelId: 'c003', channelName: '好自然健康館',
    items: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥', unit:'包', qty:50, price:70, cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥', unit:'包', qty:35, price:70, cost:16 },
    ],
    salesAdjustedItems: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥', unit:'包', qty:50, price:70, cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥', unit:'包', qty:35, price:70, cost:16 },
    ],
    adjustedItems: null,
    vendorNote: '左營店倉庫工作時間 08:00-17:00。',
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260221008989',
    settlementId: 'FO-20260228-C003',
    b2b_order_no: 'B2B-202602-0030',
    invoiceNumber: 'IV-202602-0030',
    discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null,
    invoicePeriodSnapshot: 'per_order',
    invoiceTaxScopeSnapshot: 'per_store',
    status: 'settled_done',
    settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-18').format('YYYY-MM-DD'),
    shippingAddress: '高雄市左營區博愛二路100號',
    store_label: '高雄左營店（加盟主）',
    buyerNameSnapshot: '南方健康企業社',
    buyerTaxIdSnapshot: '34567890',
    invoiceTypeSnapshot: '三聯式',
    storeId: 's008',
    blackCatNum: '9012345692',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-02-21 11:00',
    logs: [
      { time: '2026-02-18 10:00', action: '廠商送出B2B訂單' },
      { time: '2026-02-19 09:00', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
      { time: '2026-02-21 11:00', action: '物流回報已到貨' },
      { time: '2026-02-28 16:00', action: '結算完成' },
    ],
  },
  // 好自然健康館 — 七期店第二筆（已結算）
  {
    id: 'b2b-00023',
    channelId: 'c003', channelName: '好自然健康館',
    items: [
      { productId:'p403', productName:'黑寶蕈菇豬肉燉飯PLUS+', unit:'包', qty:25, price:70, cost:45 },
      { productId:'pa04', productName:'拌醬-香濃蘋果薑黃雞',  unit:'包', qty:15, price:75, cost:41 },
    ],
    salesAdjustedItems: [
      { productId:'p403', productName:'黑寶蕈菇豬肉燉飯PLUS+', unit:'包', qty:25, price:70, cost:45 },
      { productId:'pa04', productName:'拌醬-香濃蘋果薑黃雞',  unit:'包', qty:15, price:75, cost:41 },
    ],
    adjustedItems: null,
    vendorNote: null,
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260205008870',
    settlementId: 'FO-20260228-C003',
    b2b_order_no: 'B2B-202602-0015',
    invoiceNumber: 'IV-202602-0015',
    discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null,
    invoicePeriodSnapshot: 'per_order',
    invoiceTaxScopeSnapshot: 'per_store',
    status: 'settled_done',
    settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-02').format('YYYY-MM-DD'),
    shippingAddress: '台中市西屯區市政路100號',
    store_label: '台中七期店',
    buyerNameSnapshot: '好自然有機生活股份有限公司',
    buyerTaxIdSnapshot: '87654321',
    invoiceTypeSnapshot: '三聯式',
    storeId: 's006',
    blackCatNum: '9012345693',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-02-05 10:00',
    logs: [
      { time: '2026-02-02 11:00', action: '廠商送出B2B訂單' },
      { time: '2026-02-03 09:00', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
      { time: '2026-02-05 10:00', action: '物流回報已到貨' },
      { time: '2026-02-28 16:00', action: '結算完成' },
    ],
  },
  // ── 綠色小農 多門市結算 demo ──────────────────────────────
  // 綠色小農 信義旗艦店 2026-02 → FO-20260225-C002
  {
    id: 'b2b-00050',
    channelId: 'c002', channelName: '綠色小農超市',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',            unit:'包', qty:50, price:45, cost:14 },
      { productId:'p205', productName:'大富翁-中寶-干貝菇菇香蛋粥', unit:'包', qty:20, price:60, cost:27 },
    ],
    salesAdjustedItems: null, adjustedItems: null,
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260208008900', settlementId: 'FO-20260225-C002',
    b2b_order_no: 'B2B-202602-0050',
    invoiceNumber: '發票月結',
    discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null, invoicePeriodSnapshot: 'monthly', invoiceTaxScopeSnapshot: 'per_store',
    status: 'settled_done', settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-05').format('YYYY-MM-DD'),
    shippingAddress: '台北市信義區松仁路100號1樓',
    store_label: '信義旗艦店',
    storeId: 's003',
    blackCatNum: '9012345700',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-02-08 14:30',
    logs: [
      { time: '2026-02-05 10:00', action: '廠商送出B2B訂單' },
      { time: '2026-02-06 09:00', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
      { time: '2026-02-07 11:00', action: '[倉庫操作] 確認並轉入後台，後台建單 260208008900' },
      { time: '2026-02-08 14:30', action: '物流回報已到貨' },
      { time: '2026-02-25 09:00', action: '已納入結算單 FO-20260225-C002' },
    ],
  },
  // 綠色小農 信義旗艦店 2026-02 第二筆 → FO-20260225-C002
  {
    id: 'b2b-00051',
    channelId: 'c002', channelName: '綠色小農超市',
    items: [
      { productId:'p501', productName:'雞高湯',                     unit:'包', qty:80, price:22, cost:12 },
    ],
    salesAdjustedItems: null, adjustedItems: null,
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260218008910', settlementId: 'FO-20260225-C002',
    b2b_order_no: 'B2B-202602-0051',
    invoiceNumber: '發票月結',
    discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null, invoicePeriodSnapshot: 'monthly', invoiceTaxScopeSnapshot: 'per_store',
    status: 'settled_done', settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-15').format('YYYY-MM-DD'),
    shippingAddress: '台北市信義區松仁路100號1樓',
    store_label: '信義旗艦店',
    storeId: 's003',
    blackCatNum: '9012345701',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-02-18 10:00',
    logs: [
      { time: '2026-02-15 14:00', action: '廠商送出B2B訂單（補單高湯）' },
      { time: '2026-02-16 09:00', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
      { time: '2026-02-17 11:00', action: '[倉庫操作] 確認並轉入後台，後台建單 260218008910' },
      { time: '2026-02-18 10:00', action: '物流回報已到貨' },
      { time: '2026-02-25 09:00', action: '已納入結算單 FO-20260225-C002' },
    ],
  },
  // 綠色小農 大安分店 2026-02 → FO-20260225-C002
  {
    id: 'b2b-00052',
    channelId: 'c002', channelName: '綠色小農超市',
    items: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥', unit:'包', qty:50, price:70, cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥', unit:'包', qty:30, price:70, cost:16 },
      { productId:'pa04', productName:'拌醬-香濃蘋果薑黃雞',    unit:'包', qty:15, price:75, cost:41 },
    ],
    salesAdjustedItems: null, adjustedItems: null,
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260212008905', settlementId: 'FO-20260225-C002',
    b2b_order_no: 'B2B-202602-0052',
    invoiceNumber: '發票月結',
    discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null, invoicePeriodSnapshot: 'monthly', invoiceTaxScopeSnapshot: 'per_store',
    status: 'settled_done', settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-09').format('YYYY-MM-DD'),
    shippingAddress: '台北市大安區仁愛路四段1號',
    store_label: '大安分店',
    storeId: 's004',
    blackCatNum: '9012345702',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-02-12 14:30',
    logs: [
      { time: '2026-02-09 11:00', action: '廠商送出B2B訂單' },
      { time: '2026-02-10 09:00', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
      { time: '2026-02-11 13:00', action: '[倉庫操作] 確認並轉入後台，後台建單 260212008905' },
      { time: '2026-02-12 14:30', action: '物流回報已到貨' },
      { time: '2026-02-25 09:00', action: '已納入結算單 FO-20260225-C002' },
    ],
  },
  // 綠色小農 大安分店 2026-03 — 已到貨，待結算（配合 b2b-00015 信義旗艦 demo per_store 下次結算）
  {
    id: 'b2b-00053',
    channelId: 'c002', channelName: '綠色小農超市',
    items: [
      { productId:'p802', productName:'常溫粥-蘋果蔬菜豬寶粥', unit:'包', qty:40, price:70, cost:16 },
      { productId:'pa01', productName:'拌醬-田園南瓜鮮嫩雞',    unit:'包', qty:20, price:75, cost:41 },
      { productId:'pc02', productName:'草莓凍乾',              unit:'包', qty:8,  price:127, cost:80 },
    ],
    salesAdjustedItems: [
      { productId:'p802', productName:'常溫粥-蘋果蔬菜豬寶粥', unit:'包', qty:40, price:70, cost:16 },
      { productId:'pa01', productName:'拌醬-田園南瓜鮮嫩雞',    unit:'包', qty:20, price:75, cost:41 },
      { productId:'pc02', productName:'草莓凍乾',              unit:'包', qty:8,  price:127, cost:80 },
    ],
    adjustedItems: null,
    vendorNote: '大安分店週末活動補貨。',
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260322009040',
    settlementId: null,
    b2b_order_no: 'B2B-202603-0053',
    invoiceNumber: '發票月結',
    discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null,
    invoicePeriodSnapshot: 'monthly',
    invoiceTaxScopeSnapshot: 'per_store',
    status: 'arrived',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-19').format('YYYY-MM-DD'),
    shippingAddress: '台北市大安區仁愛路四段1號',
    store_label: '大安分店',
    storeId: 's004',
    blackCatNum: '9012345703',
    blackCatStatus: '順利送達',
    arrivedAt: '2026-03-22 11:00',
    logs: [
      { time: '2026-03-19 10:00', action: '廠商送出B2B訂單' },
      { time: '2026-03-20 09:30', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
      { time: '2026-03-21 11:00', action: '[倉庫操作] 確認並轉入後台，後台建單 260322009040' },
      { time: '2026-03-22 11:00', action: '物流回報已到貨' },
    ],
  },
  // 綠色小農 大安分店 2026-03 — 進行中（業務剛確認）
  {
    id: 'b2b-00054',
    channelId: 'c002', channelName: '綠色小農超市',
    items: [
      { productId:'p811', productName:'常溫粥-海陸組(2包/盒)', unit:'盒', qty:8,  price:140, cost:0 },
      { productId:'pb03', productName:'粥寶寶乖乖米餅-蜜蘋果', unit:'袋', qty:15, price:120, cost:75 },
    ],
    salesAdjustedItems: [
      { productId:'p811', productName:'常溫粥-海陸組(2包/盒)', unit:'盒', qty:8,  price:140, cost:0 },
      { productId:'pb03', productName:'粥寶寶乖乖米餅-蜜蘋果', unit:'袋', qty:15, price:120, cost:75 },
    ],
    adjustedItems: null,
    vendorNote: null,
    warehouse_note: null, shipping_note: null,
    backendOrderId: '260326009041',
    settlementId: null,
    b2b_order_no: 'B2B-202603-0054',
    invoiceNumber: '發票月結',
    discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null,
    invoicePeriodSnapshot: 'monthly',
    invoiceTaxScopeSnapshot: 'per_store',
    status: 'ordered',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-23').format('YYYY-MM-DD'),
    shippingAddress: '台北市大安區仁愛路四段1號',
    store_label: '大安分店',
    storeId: 's004',
    blackCatNum: '9012345704',
    blackCatStatus: '配送中',
    logs: [
      { time: '2026-03-23 14:00', action: '廠商送出B2B訂單' },
      { time: '2026-03-24 09:30', action: '[手動操作] 業務確認完成，建立正式訂單（數量無變動）' },
      { time: '2026-03-25 11:00', action: '[倉庫操作] 確認並轉入後台，後台建單 260326009041' },
    ],
  },
];

// ─────────────────────────────────────────────
// 結算單（管理員手動生成，對應當月已成立訂單）
// ─────────────────────────────────────────────
export const formalOrders = [
  // 好健康生活館 2026-02（per_order_with_store_tax 範例：分門市對帳）
  {
    id: 'FO-20260228-C003',
    channelId: 'c003',
    channelName: '好自然健康館',
    preOrderIds: ['b2b-00022', 'b2b-00023'],
    items: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥',     unit:'包', qty:50, price:70, cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥',     unit:'包', qty:35, price:70, cost:16 },
      { productId:'p403', productName:'黑寶蕈菇豬肉燉飯PLUS+',    unit:'包', qty:25, price:70, cost:45 },
      { productId:'pa04', productName:'拌醬-香濃蘋果薑黃雞',       unit:'包', qty:15, price:75, cost:41 },
    ],
    totalAmount: 50*70 + 35*70 + 25*70 + 15*75,
    discount: false,
    status: 'completed',
    settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-28').format('YYYY-MM-DD'),
    paymentReportedAt: '2026-03-03 14:00', paymentReportedVia: 'line', reminderSentAt: null,
    shippingAddress: '台中市西屯區市政路100號 / 高雄市左營區博愛二路100號',
    logs: [
      { time: '2026-02-28 09:00', action: '手動生成結算單，涵蓋 2 筆B2B訂單（b2b-00022 左營店、b2b-00023 七期店）' },
      { time: '2026-02-28 09:01', action: '發結算匯款通知給廠商' },
      { time: '2026-03-03 14:00', action: '[手動操作] 廠商已匯款' },
      { time: '2026-03-03 16:00', action: '[手動操作] 財務確認已匯款' },
    ],
  },
  // 貝比波士 2026-02（待匯款）
  {
    id: 'FO-20260225-C001',
    channelId: 'c001',
    channelName: '貝比波士有限公司',
    preOrderIds: ['b2b-00007', 'b2b-00007b', 'b2b-00008'],
    store_label: '林口店',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',       unit:'包', qty:60,  price:45, cost:14 },
      { productId:'p802', productName:'常溫粥-蘋果蔬菜豬寶粥', unit:'包', qty:50,  price:70, cost:16 },
      { productId:'pa01', productName:'拌醬-田園南瓜鮮嫩雞',   unit:'包', qty:30,  price:75, cost:41 },
      { productId:'p501', productName:'雞高湯',                unit:'包', qty:100, price:22, cost:12 },
    ],
    totalAmount: 60*45 + 50*70 + 30*75 + 100*22,
    discount: false,
    status: 'awaiting_payment',
    settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-25').format('YYYY-MM-DD'),
    paymentReportedAt: null, paymentReportedVia: null, reminderSentAt: null,
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    logs: [
      { time: '2026-02-25 09:00', action: '手動生成結算單，涵蓋 3 筆B2B訂單（b2b-00007、b2b-00007b、b2b-00008）' },
      { time: '2026-02-25 09:01', action: '發結算匯款通知給廠商' },
    ],
  },
  // 好自然健康館 2026-02（已匯款，等待財務確認）
  {
    id: 'FO-20260220-C003',
    channelId: 'c003',
    channelName: '好自然健康館',
    preOrderIds: ['b2b-00011'],
    store_label: '台中總倉',
    storeId: 's005',
    buyerNameSnapshot: '好自然有機生活股份有限公司',
    buyerTaxIdSnapshot: '87654321',
    invoiceTypeSnapshot: '三聯式',
    items: [
      { productId:'p901', productName:'常溫燉飯-金瓜玉米雞肉', unit:'包', qty:30, price:75, cost:50 },
      { productId:'pa02', productName:'拌醬-青蔬總匯吻仔魚',   unit:'包', qty:20, price:75, cost:41 },
      { productId:'pb03', productName:'粥寶寶乖乖米餅-蜜蘋果', unit:'袋', qty:12, price:120, cost:75 },
    ],
    totalAmount: 30*75 + 20*75 + 12*120,
    discount: false,
    status: 'paid',
    settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-20').format('YYYY-MM-DD'),
    paymentReportedAt: '2026-02-22 15:30', paymentReportedVia: 'line', reminderSentAt: null,
    shippingAddress: '台中市西屯區工業區一路100號',
    logs: [
      { time: '2026-02-20 09:00', action: '手動生成結算單，涵蓋 1 筆B2B訂單（b2b-00011）' },
      { time: '2026-02-20 09:01', action: '發結算匯款通知給廠商' },
      { time: '2026-02-22 15:30', action: '[手動操作] 廠商已匯款（$3,690）' },
      { time: '2026-02-22 15:31', action: '發匯款確認通知給廠商' },
    ],
  },
  // 貝比波士 2026-01（完成）
  {
    id: 'FO-20260125-C001',
    channelId: 'c001',
    channelName: '貝比波士有限公司',
    preOrderIds: ['b2b-00009'],
    store_label: '林口店',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',                    unit:'包', qty:80, price:45,  cost:14  },
      { productId:'p402', productName:'大富翁-一歲-干貝金玉翡翠蛋燉飯',    unit:'包', qty:20, price:80,  cost:45  },
      { productId:'p601', productName:'寶寶魚塊(10入/包)',                  unit:'包', qty:5,  price:290, cost:180 },
    ],
    totalAmount: 80*45 + 20*80 + 5*290,
    discount: false,
    status: 'completed',
    settlementMonth: '2026-01',
    createdAt: dayjs('2026-01-25').format('YYYY-MM-DD'),
    paymentReportedAt: '2026-01-27 16:44', paymentReportedVia: 'line', reminderSentAt: null,
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    logs: [
      { time: '2026-01-25 09:00', action: '手動生成結算單，涵蓋 1 筆B2B訂單（b2b-00009）' },
      { time: '2026-01-25 09:03', action: '發結算匯款通知給廠商' },
      { time: '2026-01-27 16:44', action: '廠商回報已匯款 $6,750' },
      { time: '2026-01-28 10:00', action: '財務確認收款，結算完成' },
    ],
  },
  // 綠色小農 2026-01（完成）只涵蓋大安分店一筆訂單
  {
    id: 'FO-20260115-C002',
    channelId: 'c002',
    channelName: '綠色小農超市',
    preOrderIds: ['b2b-00010'],
    store_label: '大安分店',
    items: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥', unit:'包', qty:30, price:70,  cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥', unit:'包', qty:30, price:70,  cost:16 },
      { productId:'pc01', productName:'蜜蘋果凍乾',            unit:'包', qty:10, price:127, cost:80 },
    ],
    totalAmount: 30*70 + 30*70 + 10*127,
    discount: false,
    status: 'completed',
    settlementMonth: '2026-01',
    createdAt: dayjs('2026-01-15').format('YYYY-MM-DD'),
    paymentReportedAt: '2026-01-17 14:00', paymentReportedVia: 'line', reminderSentAt: null,
    shippingAddress: '台北市大安區仁愛路四段1號',
    logs: [
      { time: '2026-01-15 09:00', action: '手動生成結算單，涵蓋 1 筆B2B訂單（b2b-00010）' },
      { time: '2026-01-17 14:00', action: '廠商回報已匯款' },
      { time: '2026-01-18 11:00', action: '財務確認收款，結算完成' },
    ],
  },
  // 綠色小農 2026-02（per_store 多門市彙整 demo：一張結算單對應信義 + 大安兩門市）
  {
    id: 'FO-20260225-C002',
    channelId: 'c002',
    channelName: '綠色小農超市',
    preOrderIds: ['b2b-00050', 'b2b-00051', 'b2b-00052'],
    items: [
      // 信義部分
      { productId:'p201', productName:'中寶-玉米雞肉粥',            unit:'包', qty:50, price:45, cost:14 },
      { productId:'p205', productName:'大富翁-中寶-干貝菇菇香蛋粥', unit:'包', qty:20, price:60, cost:27 },
      { productId:'p501', productName:'雞高湯',                     unit:'包', qty:80, price:22, cost:12 },
      // 大安部分
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥',     unit:'包', qty:50, price:70, cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥',     unit:'包', qty:30, price:70, cost:16 },
      { productId:'pa04', productName:'拌醬-香濃蘋果薑黃雞',        unit:'包', qty:15, price:75, cost:41 },
    ],
    totalAmount: 50*45 + 20*60 + 80*22 + 50*70 + 30*70 + 15*75,
    discount: false,
    status: 'completed',
    settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-25').format('YYYY-MM-DD'),
    paymentReportedAt: '2026-02-27 14:00', paymentReportedVia: 'line', reminderSentAt: null,
    shippingAddress: '台北市信義區松仁路100號1樓 / 台北市大安區仁愛路四段1號',
    logs: [
      { time: '2026-02-25 09:00', action: '手動生成結算單，涵蓋 3 筆B2B訂單（b2b-00050、b2b-00051、b2b-00052）' },
      { time: '2026-02-25 09:01', action: '發結算匯款通知給廠商' },
      { time: '2026-02-27 14:00', action: '廠商回報已匯款' },
      { time: '2026-02-28 09:00', action: '系統自動開立發票（結算日後 3 天，先開後收）：信義 IV-202602-0080 / 大安 IV-202602-0081' },
      { time: '2026-02-28 10:00', action: '財務確認收款，結算完成' },
    ],
  },
  // 綠色小農 2026-03（per_store demo：一張結算單對應信義 + 大安兩門市，待匯款）
  {
    id: 'FO-20260315-C002',
    channelId: 'c002',
    channelName: '綠色小農超市',
    preOrderIds: ['b2b-00002', 'b2b-00003'],
    items: [
      // 信義（b2b-00002）
      { productId:'p201', productName:'中寶-玉米雞肉粥',            unit:'包', qty:50, price:45, cost:14 },
      { productId:'p202', productName:'中寶-蔥時蔬牛肉粥PLUS+',    unit:'包', qty:25, price:55, cost:19 },
      { productId:'p205', productName:'大富翁-中寶-干貝菇菇香蛋粥', unit:'包', qty:20, price:60, cost:27 },
      { productId:'p501', productName:'雞高湯',                     unit:'包', qty:80, price:22, cost:12 },
      // 大安（b2b-00003）
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥',        unit:'包', qty:60,  price:70,  cost:16 },
      { productId:'p802', productName:'常溫粥-蘋果蔬菜豬寶粥',        unit:'包', qty:55,  price:70,  cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥',        unit:'包', qty:40,  price:70,  cost:16 },
      { productId:'pa04', productName:'拌醬-香濃蘋果薑黃雞',          unit:'包', qty:20,  price:75,  cost:41 },
      { productId:'p812', productName:'常溫粥-茄汁紅蘿蔔牛(4包/盒)', unit:'盒', qty:10,  price:280, cost:0  },
    ],
    totalAmount: 50*45 + 25*55 + 20*60 + 80*22 + 60*70 + 55*70 + 40*70 + 20*75 + 10*280,
    discount: false,
    status: 'awaiting_payment',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-15').format('YYYY-MM-DD'),
    paymentReportedAt: null, paymentReportedVia: null, reminderSentAt: null,
    shippingAddress: '台北市信義區松仁路100號1樓 / 台北市大安區仁愛路四段1號',
    logs: [
      { time: '2026-03-15 09:00', action: '手動生成結算單，涵蓋 2 筆B2B訂單（b2b-00002 信義 / b2b-00003 大安）' },
      { time: '2026-03-15 09:01', action: '發結算匯款通知給廠商' },
    ],
  },
  // 貝比波士 林口店 2026-03（待匯款）
  {
    id: 'FO-20260325-C001',
    channelId: 'c001',
    channelName: '貝比波士有限公司',
    preOrderIds: ['b2b-00005'],
    store_label: '林口店',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',    unit:'包', qty:80,  price:45,  cost:14 },
      { productId:'p301', productName:'大寶-芋頭姑姑豬肉粥',unit:'包', qty:35,  price:70,  cost:45 },
      { productId:'p501', productName:'雞高湯',             unit:'包', qty:100, price:22,  cost:12 },
      { productId:'p601', productName:'寶寶魚塊(10入/包)',  unit:'包', qty:10,  price:290, cost:180 },
    ],
    totalAmount: 80*45 + 35*70 + 100*22 + 10*290,
    discount: false,
    status: 'awaiting_payment',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-25').format('YYYY-MM-DD'),
    paymentReportedAt: null, paymentReportedVia: null, reminderSentAt: null,
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    logs: [
      { time: '2026-03-25 09:00', action: '手動生成結算單，涵蓋 1 筆B2B訂單（b2b-00005）' },
      { time: '2026-03-25 09:01', action: '發結算匯款通知給廠商' },
    ],
  },
];

// AnalyticsPage 向後相容
export const fakeOrders = formalOrders;

// ─────────────────────────────────────────────
// 系統設定
// ─────────────────────────────────────────────
// 運費設定（依溫層分開計算）
export const shippingSettings = {
  frozen:  { freeShippingThreshold: 3000, shippingFee: 200 },
  ambient: { freeShippingThreshold: 2000, shippingFee: 150 },
};

// 保留 systemSettings 作為全域參數容器（目前放冷凍預設供 fallback）
export const systemSettings = {
  freeShippingThreshold: shippingSettings.frozen.freeShippingThreshold,
  shippingFee:           shippingSettings.frozen.shippingFee,
};

// ─────────────────────────────────────────────
// B2B 預留庫存（Phase 3.5）
// ─────────────────────────────────────────────
// 與產品層 stockMode/stockLimit 完全分開，兩邊獨立計算。
// 未來對應 fruit_web B2BReservedStock 表。
// 沒有記錄的產品視為「B2B 不限量」。
//
// TODO_FRUIT_WEB: 搬到後端後以下對應欄位：
//   B2BReservedStock.ProductId      → productId
//   B2BReservedStock.TotalStock     → b2bStock
//   B2BReservedStock.AllocatedQty   → b2bAllocated（由訂單狀態自動計算）
//   B2BReservedStock.LastUpdated    → lastUpdated
export const b2bReservedInventory = [
  // 冷凍品——有庫存壓力的品項優先納管
  { productId: 'p104', b2bStock: 200, b2bAllocated:  80, lastUpdated: '2026-04-18' }, // 小寶-甜菜玉米米糊（限量）
  { productId: 'p105', b2bStock:   0, b2bAllocated:   0, lastUpdated: '2026-04-01' }, // 小寶-釋迦鳳梨米糊（下季前缺貨）
  { productId: 'p303', b2bStock: 120, b2bAllocated:  45, lastUpdated: '2026-04-20' }, // 大寶-玉米翡翠虱目魚粥（限量）
  { productId: 'p601', b2bStock: 150, b2bAllocated:  90, lastUpdated: '2026-04-22' }, // 寶寶魚塊（限量）
  { productId: 'p602', b2bStock:  60, b2bAllocated:  30, lastUpdated: '2026-04-22' }, // 龍膽石斑寶寶魚片（限量）
  { productId: 'p603', b2bStock:   0, b2bAllocated:   0, lastUpdated: '2026-03-15' }, // 寶寶綜合海鮮包（缺貨）
  // 常溫品——組合箱有批次管控
  { productId: 'p811', b2bStock: 300, b2bAllocated: 120, lastUpdated: '2026-04-15' }, // 海陸組
  { productId: 'p812', b2bStock: 250, b2bAllocated:  85, lastUpdated: '2026-04-15' }, // 茄汁紅蘿蔔牛（4包/盒）
];

// ─────────────────────────────────────────────
// 公告白板（同時只有一則，業務直接改內容即可）
// id: 每次儲存後更新為新 timestamp，讓廠商端已讀狀態重置
// priority: 'normal' | 'important'（important 會強制彈窗一次）
// isVisible: true = 廠商端看得到；false = 隱藏
// audience: 'all' | channelId[]
// ─────────────────────────────────────────────
// ─────────────────────────────────────────────
// 公告（多則布告欄）
//   - type:     'general'    = 業務手動發布的公告（預設）
//               'settlement' = 結算通知（業務產生結算單時自動 insert，audience 限定該通路）
//   - priority: 'important' = 廠商首次看到時強制彈窗一次（後續只會在通知中心列出）
//               'normal'    = 不強制彈窗，靜靜列在通知中心
//   - audience: 'all' | string[] (channelIds)
//   - isVisible: false 代表後台暫時隱藏
//   - relatedId: type='settlement' 時對應 formalOrders.id（結算單編號）
// ─────────────────────────────────────────────
export const announcements = [
  // ── 結算通知（系統自動產生，audience 限定該通路）──
  {
    id: 'ann-settlement-FO-20260325-C001',
    type: 'settlement',
    relatedId: 'FO-20260325-C001',
    title: '【結算通知】2026-03 結算單已產生（FO-20260325-C001）',
    content: `## 結算單已產生

您本月份（2026-03）的結算單已產生，請至「結算紀錄」頁查看明細並完成匯款。

- **結算單號**：FO-20260325-C001
- **結算金額**：NT$ 10,800
- **匯款期限**：請於收到通知後 10 個工作天內完成匯款

如有對帳疑義，請聯繫業務窗口。`,
    priority: 'important',
    isVisible: true,
    audience: ['c001'],
    publishedAt: '2026-03-25 09:01',
    readBy: [],
  },
  {
    id: 'ann-settlement-FO-20260315-C002',
    type: 'settlement',
    relatedId: 'FO-20260315-C002',
    title: '【結算通知】2026-03 結算單已產生（FO-20260315-C002）',
    content: `## 結算單已產生

您本月份（2026-03）的結算單已產生（涵蓋信義旗艦店 + 大安分店兩個門市），請至「結算紀錄」頁查看明細並完成匯款。

- **結算單號**：FO-20260315-C002
- **結算金額**：NT$ 17,335
- **匯款期限**：請於收到通知後 10 個工作天內完成匯款`,
    priority: 'important',
    isVisible: true,
    audience: ['c002'],
    publishedAt: '2026-03-15 09:01',
    readBy: [],
  },
  // ── 一般公告 ──
  {
    id: 'ann-20260430-001',
    type: 'general',
    title: '母親節限時優惠：寶寶魚塊系列 85 折',
    content: `## 活動辦法

限時 **5/1（四）– 5/18（日）**，寶寶魚塊系列全線 85 折。

**適用品項：**
- 寶寶魚塊（10入/包）
- 龍膽石斑寶寶魚片（6~8入）
- 寶寶綜合海鮮包（12入/包，缺貨恢復後適用）

**折扣方式：**
每月結算時自動計算，本通路無需另行申請。

活動期間若有異動，業務將另行通知。`,
    priority: 'important',
    isVisible: true,
    audience: 'all',
    publishedAt: '2026-04-30 14:00',
    expiresAt: '2026-05-18',
    readBy: [],
  },
  {
    id: 'ann-20260420-001',
    title: '【系統公告】5/3 凌晨 02:00–04:00 系統維護',
    content: `## 維護時段
**5/3（六）凌晨 02:00 – 04:00**

維護期間 B2B 採購系統將暫停服務，已成立的訂單與結算單不受影響。

如有緊急訂單需求，請於 5/2（五）下班前送出。造成不便，敬請見諒。`,
    priority: 'important',
    isVisible: true,
    audience: 'all',
    publishedAt: '2026-04-20 10:00',
    expiresAt: '2026-05-03',
    readBy: [],
  },
  {
    id: 'ann-20260415-001',
    title: '常溫粥系列新增「茄汁紅蘿蔔牛」口味（4 包/盒）',
    content: `## 新品上架

常溫粥系列新增 **茄汁紅蘿蔔牛**，採 4 包/盒包裝販售。

- 採購價：每盒 280 元
- 建議售價：每盒 360 元
- 即日起可在「商品採購」頁面下單

歡迎優先採購搭配既有常溫粥系列銷售。`,
    priority: 'normal',
    isVisible: true,
    audience: 'all',
    publishedAt: '2026-04-15 11:00',
    readBy: [],
  },
  {
    id: 'ann-20260410-001',
    title: '貝比波士林口店：4/12 起入庫時段調整為下午',
    content: `## 入庫時段調整

林口店因前場動線調整，**4/12（一）起入庫時段一律改為下午 14:00–17:00**。

請物流配合此時段送達，造成不便敬請見諒。`,
    priority: 'normal',
    isVisible: true,
    audience: ['c001'],
    publishedAt: '2026-04-10 16:30',
    readBy: [],
  },
  {
    id: 'ann-20260328-001',
    title: '2026 年度結算流程說明（已過期，僅保留紀錄）',
    content: `## 結算流程

每月結算單於月底自動產生，請於收到通知後 10 個工作天內完成匯款。

詳細流程請參考廠商手冊。`,
    priority: 'normal',
    isVisible: false,    // 後台已隱藏
    audience: 'all',
    publishedAt: '2026-03-28 09:00',
    readBy: [],
  },
];

// 向後相容：個別 import announcement 的舊程式碼可暫時繼續用最新一則
export const announcement = announcements[0];

// ─────────────────────────────────────────────
// B2B 一次性動作 Token（對應正式版 B2BActionTokens 表）
// 寄出的 email 嵌入一次性連結，讓廠商不用登入就能完成特定動作
// 詳見《B2B 通知系統設計》第 6 節
// ─────────────────────────────────────────────
export const b2bActionTokens = [
  // 已使用：好自然 b2b-00001 訂單確認連結
  { token: 'a8f3c92e1d4b7689f0e2a5c8d1b4e7f3', action: 'confirm_order',  relatedId: 'b2b-00001',         channelId: 'c003', expiresAt: '2026-03-19 23:59:59', usedAt: '2026-03-06 10:15:22', createdAt: '2026-03-05 11:31:00' },
  // 未使用 / 未過期：FO-20260315-C002 待匯款的回報連結
  { token: '5c1e9b73a2f8d04e1a9c3b6e8f2d7a1b', action: 'report_payment', relatedId: 'FO-20260315-C002',  channelId: 'c002', expiresAt: '2026-03-29 23:59:59', usedAt: null,                  createdAt: '2026-03-15 09:01:30' },
  // 未使用 / 未過期：FO-20260225-C001 催繳款連結
  { token: '3d8f4a1c6e9b2d7f0a4c8e1b5d9f2a6e', action: 'report_payment', relatedId: 'FO-20260225-C001',  channelId: 'c001', expiresAt: '2026-03-11 23:59:59', usedAt: null,                  createdAt: '2026-02-25 09:01:45' },
  // 已過期未使用：示範過期 token 樣態
  { token: '7b2a5c8e1d4f9a3c6b8e2d5f1a4c7e9b', action: 'confirm_order',  relatedId: 'b2b-00007',         channelId: 'c001', expiresAt: '2026-02-24 23:59:59', usedAt: null,                  createdAt: '2026-02-10 10:01:15' },
];

// ─────────────────────────────────────────────
// B2B 通知歷史紀錄
//
// 正式版規劃：每寄出一封通知信都記錄一筆，存放於主站 MongoDB 的 log 集合
// （沿用主站既有的 log 機制，不另建 B2B 專屬後台頁面）。
// 這份 demo 假資料保留作為設計參考、欄位結構說明用。
// ─────────────────────────────────────────────
export const b2bNotificationLog = [
  { id: 'log-00021', sentAt: '2026-03-25 09:01:30', type: 'settlement_created',     channelId: 'c001', toEmail: 'injoin83563069@gmail.com', subject: '【無毒農 B2B】2026-03 結算單已產生（FO-20260325-C001）',     status: 'delivered', relatedId: 'FO-20260325-C001', errorMessage: null },
  { id: 'log-00020', sentAt: '2026-03-15 09:01:45', type: 'settlement_created',     channelId: 'c002', toEmail: 'order@greenfarm.com.tw',    subject: '【無毒農 B2B】2026-03 結算單已產生（FO-20260315-C002）',     status: 'delivered', relatedId: 'FO-20260315-C002', errorMessage: null },
  { id: 'log-00019', sentAt: '2026-03-09 14:35:12', type: 'order_confirmed',        channelId: 'c002', toEmail: 'order@greenfarm.com.tw',    subject: '【無毒農 B2B】您的訂單已成立（B2B-202603-0003）',                  status: 'delivered', relatedId: 'b2b-00003',        errorMessage: null },
  { id: 'log-00018', sentAt: '2026-03-08 11:32:00', type: 'order_confirmed',        channelId: 'c002', toEmail: 'order@greenfarm.com.tw',    subject: '【無毒農 B2B】您的訂單已成立（B2B-202603-0003）',                  status: 'delivered', relatedId: 'b2b-00003',        errorMessage: null },
  { id: 'log-00017', sentAt: '2026-03-05 11:31:15', type: 'order_received',         channelId: 'c003', toEmail: 'purchase@haoran.com.tw',    subject: '【無毒農 B2B】我們收到您的採購單（B2B-202603-0001）',              status: 'delivered', relatedId: 'b2b-00001',        errorMessage: null },
  { id: 'log-00016', sentAt: '2026-02-28 16:00:30', type: 'invoice_issued',         channelId: 'c003', toEmail: 'purchase@haoran.com.tw',    subject: '【無毒農 B2B】2026-02 發票已開立（共 2 張）',                       status: 'delivered', relatedId: 'FO-20260228-C003', errorMessage: null },
  { id: 'log-00015', sentAt: '2026-02-27 14:00:15', type: 'payment_confirmed',      channelId: 'c002', toEmail: 'order@greenfarm.com.tw',    subject: '【無毒農 B2B】2026-02 匯款已確認',                                 status: 'delivered', relatedId: 'FO-20260225-C002', errorMessage: null },
  { id: 'log-00014', sentAt: '2026-02-25 09:01:30', type: 'settlement_created',     channelId: 'c002', toEmail: 'order@greenfarm.com.tw',    subject: '【無毒農 B2B】2026-02 結算單已產生（FO-20260225-C002）',     status: 'delivered', relatedId: 'FO-20260225-C002', errorMessage: null },
  { id: 'log-00013', sentAt: '2026-02-25 09:01:00', type: 'settlement_created',     channelId: 'c001', toEmail: 'injoin83563069@gmail.com', subject: '【無毒農 B2B】2026-02 結算單已產生（FO-20260225-C001）',     status: 'delivered', relatedId: 'FO-20260225-C001', errorMessage: null },
  { id: 'log-00012', sentAt: '2026-02-22 15:31:30', type: 'payment_confirmed',      channelId: 'c003', toEmail: 'purchase@haoran.com.tw',    subject: '【無毒農 B2B】2026-02 匯款已確認',                                 status: 'delivered', relatedId: 'FO-20260220-C003', errorMessage: null },
  { id: 'log-00011', sentAt: '2026-02-20 09:01:30', type: 'settlement_created',     channelId: 'c003', toEmail: 'purchase@haoran.com.tw',    subject: '【無毒農 B2B】2026-02 結算單已產生（FO-20260220-C003）',     status: 'delivered', relatedId: 'FO-20260220-C003', errorMessage: null },
  // 失敗範例：信箱拼錯導致退信
  { id: 'log-00010', sentAt: '2026-02-15 10:30:00', type: 'order_received',         channelId: 'c001', toEmail: 'wrong-email@invalid.tw',    subject: '【無毒農 B2B】我們收到您的採購單（B2B-202602-0009）',              status: 'failed',    relatedId: 'b2b-00008',        errorMessage: 'SMTP 550 5.1.1 The email account does not exist' },
  { id: 'log-00009', sentAt: '2026-01-28 10:00:30', type: 'invoice_issued',         channelId: 'c001', toEmail: 'injoin83563069@gmail.com', subject: '【無毒農 B2B】2026-01 發票已開立（IV-202601-0050）',               status: 'delivered', relatedId: 'FO-20260125-C001', errorMessage: null },
  { id: 'log-00008', sentAt: '2026-01-27 16:44:30', type: 'payment_confirmed',      channelId: 'c001', toEmail: 'injoin83563069@gmail.com', subject: '【無毒農 B2B】2026-01 匯款已確認',                                 status: 'delivered', relatedId: 'FO-20260125-C001', errorMessage: null },
  { id: 'log-00007', sentAt: '2026-01-25 09:03:15', type: 'settlement_created',     channelId: 'c001', toEmail: 'injoin83563069@gmail.com', subject: '【無毒農 B2B】2026-01 結算單已產生（FO-20260125-C001）',     status: 'delivered', relatedId: 'FO-20260125-C001', errorMessage: null },
];
