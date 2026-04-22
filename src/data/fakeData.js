import dayjs from 'dayjs';

// ─────────────────────────────────────────────
// 商品資料（含成本、B2B採購價、產品規格 ID）
// ─────────────────────────────────────────────
export const products = [
  // ── 冷凍 / 4-6 個月（小寶）
  { id:'p101', ezposId:'158178', name:'小寶-玉米米糊',             spec:'',       unit:'包', cost:16, b2bPrice:33, category:'frozen', subCategory:'4-6個月-小寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710101101017', frontend_product_id:'200101' },
  { id:'p102', ezposId:'158208', name:'小寶-南瓜米糊',             spec:'',       unit:'包', cost:16, b2bPrice:33, category:'frozen', subCategory:'4-6個月-小寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p103', ezposId:'158268', name:'小寶-南瓜紅蘿蔔米糊',       spec:'',       unit:'包', cost:16, b2bPrice:33, category:'frozen', subCategory:'4-6個月-小寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p104', ezposId:'158298', name:'小寶-甜菜玉米米糊',         spec:'',       unit:'包', cost:16, b2bPrice:33, category:'frozen', subCategory:'4-6個月-小寶', isListed:true, stockMode:'limited',   stockLimit:80,   thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p105', ezposId:'158769', name:'小寶-釋迦鳳梨米糊',         spec:'季節限定',unit:'包', cost:48, b2bPrice:37, category:'frozen', subCategory:'4-6個月-小寶', isListed:true, stockMode:'out_of_stock', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 冷凍 / 7-9 個月（中寶）
  { id:'p201', ezposId:'159476', name:'中寶-玉米雞肉粥',           spec:'',       unit:'包', cost:14, b2bPrice:45, category:'frozen', subCategory:'7-9個月-中寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710201201010', frontend_product_id:'200201' },
  { id:'p202', ezposId:'159501', name:'中寶-蔥時蔬牛肉粥PLUS+',   spec:'',       unit:'包', cost:19, b2bPrice:55, category:'frozen', subCategory:'7-9個月-中寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p203', ezposId:'159527', name:'中寶-蜆蔬菜魚柳粥PLUS+',   spec:'',       unit:'包', cost:19, b2bPrice:55, category:'frozen', subCategory:'7-9個月-中寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p204', ezposId:'159553', name:'中寶-藕紅薯豬肉粥PLUS+',   spec:'',       unit:'包', cost:19, b2bPrice:55, category:'frozen', subCategory:'7-9個月-中寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p205', ezposId:'162969', name:'大富翁-中寶-干貝菇菇香蛋粥',spec:'新品',   unit:'包', cost:27, b2bPrice:60, category:'frozen', subCategory:'7-9個月-中寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710205205012', frontend_product_id:'200205' },
  // ── 冷凍 / 10-12 個月（大寶）
  { id:'p301', ezposId:'',       name:'大寶-芋頭姑姑豬肉粥',       spec:'200g',   unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'10-12個月-大寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p302', ezposId:'',       name:'大寶-番茄蘑菇牛肉粥',       spec:'200g',   unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'10-12個月-大寶', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p303', ezposId:'',       name:'大寶-玉米翡翠虱目魚粥',     spec:'200g',   unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'10-12個月-大寶', isListed:true, stockMode:'limited',   stockLimit:55,   thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 冷凍 / 一歲以上（燉飯）
  { id:'p401', ezposId:'163521', name:'大富翁-大寶-干貝菇菇翡翠雞蛋粥', spec:'新品', unit:'包', cost:27, b2bPrice:80, category:'frozen', subCategory:'一歲以上-燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710401401015', frontend_product_id:'200401' },
  { id:'p402', ezposId:'163522', name:'大富翁-一歲-干貝金玉翡翠蛋燉飯', spec:'新品', unit:'包', cost:45, b2bPrice:80, category:'frozen', subCategory:'一歲以上-燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p403', ezposId:'162234', name:'黑寶蕈菇豬肉燉飯PLUS+',    spec:'',       unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'一歲以上-燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p404', ezposId:'',       name:'鮮茄時蔬牛肉燉飯PLUS+',    spec:'',       unit:'包', cost:45, b2bPrice:70, category:'frozen', subCategory:'一歲以上-燉飯', isListed:false, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 冷凍 / 高湯
  { id:'p501', ezposId:'',       name:'雞高湯',                    spec:'',       unit:'包', cost:12, b2bPrice:22, category:'frozen', subCategory:'高湯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p502', ezposId:'',       name:'蔬菜高湯',                  spec:'',       unit:'包', cost:12, b2bPrice:22, category:'frozen', subCategory:'高湯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p503', ezposId:'',       name:'龍骨高湯',                  spec:'',       unit:'包', cost:12, b2bPrice:22, category:'frozen', subCategory:'高湯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 冷凍 / 魚塊&海鮮
  { id:'p601', ezposId:'',       name:'寶寶魚塊(10入/包)',         spec:'',       unit:'包', cost:180,b2bPrice:290,category:'frozen', subCategory:'魚塊海鮮', isListed:true, stockMode:'limited',   stockLimit:50,   thumbnailUrl:'', barcode_ean13:'4710601601018', frontend_product_id:'200601' },
  { id:'p602', ezposId:'',       name:'龍膽石斑寶寶魚片(6~8入)',   spec:'',       unit:'包', cost:200,b2bPrice:330,category:'frozen', subCategory:'魚塊海鮮', isListed:true, stockMode:'limited',   stockLimit:30,   thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p603', ezposId:'',       name:'寶寶綜合海鮮包(12入/包)',   spec:'',       unit:'包', cost:280,b2bPrice:460,category:'frozen', subCategory:'魚塊海鮮', isListed:true, stockMode:'out_of_stock', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 冷凍 / 烏龍麵
  { id:'p701', ezposId:'',       name:'無鹽寶寶烏龍麵-菠菜',       spec:'',       unit:'包', cost:20, b2bPrice:31, category:'frozen', subCategory:'烏龍麵', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p702', ezposId:'',       name:'無鹽寶寶烏龍麵-南瓜',       spec:'',       unit:'包', cost:20, b2bPrice:31, category:'frozen', subCategory:'烏龍麵', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },

  // ── 常溫 / 常溫粥（單入）
  { id:'p801', ezposId:'159862', name:'常溫粥-鮮茄綜合菇菇粥',     spec:'',       unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710801801013', frontend_product_id:'200801' },
  { id:'p802', ezposId:'159880', name:'常溫粥-蘋果蔬菜豬寶粥',     spec:'新版',   unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p803', ezposId:'159889', name:'常溫粥-玉米紅蘿蔔鮭魚粥',   spec:'新版',   unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:'4710803803011', frontend_product_id:'200803' },
  { id:'p804', ezposId:'159898', name:'常溫粥-農翠平埔豬寶粥',     spec:'',       unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p805', ezposId:'159907', name:'常溫粥-玉拌虱目魚寶粥',     spec:'',       unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p806', ezposId:'159916', name:'常溫粥-金瓜山藥雞肉粥',     spec:'新版',   unit:'包', cost:16, b2bPrice:70, category:'ambient', subCategory:'常溫粥-單入', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 常溫 / 常溫粥（組合）
  { id:'p811', ezposId:'159796', name:'常溫粥-海陸組(2包/盒)',     spec:'牛+虱目魚', unit:'盒', cost:0, b2bPrice:140, category:'ambient', subCategory:'常溫粥-組合', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p812', ezposId:'159802', name:'常溫粥-茄汁紅蘿蔔牛(4包/盒)',spec:'',     unit:'盒', cost:0, b2bPrice:280, category:'ambient', subCategory:'常溫粥-組合', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 常溫 / 常溫燉飯
  { id:'p901', ezposId:'',       name:'常溫燉飯-金瓜玉米雞肉',     spec:'',       unit:'包', cost:50, b2bPrice:75, category:'ambient', subCategory:'常溫燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p902', ezposId:'',       name:'常溫燉飯-蒜香甘藍豬肉',     spec:'',       unit:'包', cost:50, b2bPrice:75, category:'ambient', subCategory:'常溫燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'p903', ezposId:'',       name:'常溫燉飯-茄汁時蔬牛肉',     spec:'',       unit:'包', cost:50, b2bPrice:75, category:'ambient', subCategory:'常溫燉飯', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 常溫 / 拌醬
  { id:'pa01', ezposId:'159736', name:'拌醬-田園南瓜鮮嫩雞',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pa02', ezposId:'159739', name:'拌醬-青蔬總匯吻仔魚',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pa03', ezposId:'159742', name:'拌醬-茄汁高湯燉牛肉',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pa04', ezposId:'159745', name:'拌醬-香濃蘋果薑黃雞',       spec:'',       unit:'包', cost:41, b2bPrice:75, category:'ambient', subCategory:'常溫拌醬', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 常溫 / 細麵
  { id:'pb01', ezposId:'',       name:'無鹽寶寶細麵-南瓜(罐裝)',   spec:'',       unit:'罐', cost:120,b2bPrice:190,category:'ambient', subCategory:'細麵米餅', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pb02', ezposId:'',       name:'無鹽寶寶細麵-甜菜根(罐裝)', spec:'',       unit:'罐', cost:120,b2bPrice:190,category:'ambient', subCategory:'細麵米餅', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pb03', ezposId:'',       name:'粥寶寶乖乖米餅-蜜蘋果',     spec:'',       unit:'袋', cost:75, b2bPrice:120,category:'ambient', subCategory:'細麵米餅', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  // ── 常溫 / 凍乾
  { id:'pc01', ezposId:'',       name:'蜜蘋果凍乾',                spec:'',       unit:'包', cost:80, b2bPrice:127,category:'ambient', subCategory:'凍乾', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
  { id:'pc02', ezposId:'',       name:'草莓凍乾',                  spec:'',       unit:'包', cost:80, b2bPrice:127,category:'ambient', subCategory:'凍乾', isListed:true, stockMode:'unlimited', stockLimit:null, thumbnailUrl:'', barcode_ean13:null, frontend_product_id:null },
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
// 通路資料
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
    invoice_mode: 'monthly_combined',
    default_bank_last5: null,
    discount_note: '1.【冷凍商品-小雞腿】採購價降為62元\n2.【常溫粥-裸包】每月採購量達450包，採購價降為65元\n3.【常溫燉飯】每月採購量達400包，採購價降為70元\n4.【常溫拌醬】每月採購量達200包，採購價降為70元',
    internal_note: '結帳聯絡窗口為黃宥榕，請勿直接聯絡門市。',
    cs_note_default: '感謝採購，如有問題請聯繫業務窗口黃宥榕。',
    default_vendor_note: '通路合作貝比波士，月結30天，次月25號付款。',
    templateId: 't001',
    addresses: [
      {
        label: '林口店',
        recipient: 'BABEBOSS媽寶超市',
        phone: '02-26069160',
        address: '新北市林口區仁愛路一段346號1樓',
      },
      {
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
    name: '綠色小農超市',
    taxId: '54321678',
    title: '綠色小農超市股份有限公司',
    email: 'order@greenfarm.com.tw',
    contact: '林采璇',
    contactPhone: '02-2781-5566',
    settlementDay: 15,
    invoice_mode: 'monthly_per_store',
    default_bank_last5: '34521',
    discount_note: null,
    internal_note: '有兩個門市，結算單需分開，發票各開各的。',
    cs_note_default: null,
    templateId: 't001',
    addresses: [
      {
        label: '信義旗艦店',
        recipient: '綠色小農超市',
        phone: '02-2781-5566',
        address: '台北市信義區松仁路100號1樓',
      },
      {
        label: '大安分店',
        recipient: '綠色小農超市（大安）',
        phone: '02-2700-1234',
        address: '台北市大安區仁愛路四段1號',
      },
    ],
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
    invoice_mode: 'per_order',
    default_bank_last5: '88156',
    discount_note: '常溫商品固定採購價，數量>200包另議',
    internal_note: null,
    cs_note_default: '感謝採購！如有問題請洽陳雅婷 04-2328-8899。',
    templateId: 't002',
    addresses: [
      {
        label: '台中總倉',
        recipient: '好自然物流中心',
        phone: '04-2328-8899',
        address: '台中市西屯區工業區一路100號',
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
};

// 結算單狀態（formalOrders / settlements 使用）
export const SETTLEMENT_STATUS = {
  awaiting_payment: { label: '待匯款', color: 'gold',  step: 0 },
  paid:             { label: '已匯款', color: 'lime',  step: 1 },
  completed:        { label: '完成',   color: 'green', step: 2 },
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
    b2b_order_no: null,
    discount_amount: 0,
    discount_note: null,
    cs_note: null, b2b_note: null,
    invoice_mode_snapshot: 'per_order',
    fruit_order_id: null,
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-05').format('YYYY-MM-DD'),
    shippingAddress: '台中市西屯區工業區一路100號',
    store_label: '台中總倉',
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
    settlementId: null,
    b2b_order_no: 'B2B-202603-0002',
    discount_amount: 150,
    discount_note: '配合春季新品上架，本次訂單折讓150元作為陳列費。',
    cs_note: '綠色小農為長期合作通路，出貨時段可彈性安排。',
    b2b_note: '業務已告知中寶牛肉粥庫存情況，通路接受調整；春季新品折扣已套用。',
    invoice_mode_snapshot: 'monthly_per_store',
    fruit_order_id: null,
    status: 'ordered',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-01').format('YYYY-MM-DD'),
    shippingAddress: '台北市信義區松仁路100號1樓',
    store_label: '信義旗艦店',
    logs: [
      { time: '2026-03-01 09:30', action: '廠商送出B2B訂單' },
      { time: '2026-03-02 10:15', action: '[手動操作] 業務確認完成，建立正式訂單（中寶-蔥時蔬牛肉粥PLUS+: 30→25）' },
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
    settlementId: null,
    b2b_order_no: 'B2B-202603-0003',
    discount_amount: 0,
    discount_note: null,
    cs_note: '蘋果豬寶粥本次數量略減，下月補足，已與門市確認。',
    b2b_note: null,
    invoice_mode_snapshot: 'monthly_per_store',
    fruit_order_id: 260308008835,
    status: 'arrived',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-06').format('YYYY-MM-DD'),
    shippingAddress: '台北市大安區仁愛路四段1號',
    store_label: '大安分店',
    logs: [
      { time: '2026-03-06 14:20', action: '廠商送出B2B訂單' },
      { time: '2026-03-07 09:00', action: '[手動操作] 業務確認完成，送倉庫確認（數量無變動）' },
      { time: '2026-03-08 11:30', action: '[倉庫操作] 確認並轉入後台（常溫粥-蘋果蔬菜豬寶粥: 60→55），後台建單 260308008835' },
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
    discount_amount: 300,
    discount_note: '貝比波士為長期合作，本月額外折讓300元感謝支持。',
    cs_note: '林口店新倉管習慣於早上收貨，下午可能無人簽收。',
    b2b_note: '下月將上架新款一歲燉飯系列，歡迎提前詢問進貨。',
    invoice_mode_snapshot: 'monthly_combined',
    fruit_order_id: null,
    status: 'arrived',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-15').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    store_label: '林口店',
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
    discount_amount: 0, discount_note: null,
    cs_note: null, b2b_note: null,
    invoice_mode_snapshot: 'monthly_combined',
    fruit_order_id: null,
    status: 'arrived',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-18').format('YYYY-MM-DD'),
    shippingAddress: '桃園市中壢區中山路188號1樓',
    store_label: '中壢店',
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
    discount_amount: 500,
    discount_note: '米餅新品首次進貨折讓500元鼓勵陳列。',
    cs_note: null,
    b2b_note: '米餅新品試賣價已套用，如有銷售數據歡迎回饋。',
    invoice_mode_snapshot: 'monthly_per_store',
    fruit_order_id: null,
    status: 'arrived',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-13').format('YYYY-MM-DD'),
    shippingAddress: '台北市信義區松仁路100號1樓',
    store_label: '信義旗艦店',
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
    cs_note: null, b2b_note: null, invoice_mode_snapshot: 'monthly_combined', fruit_order_id: 260212008815,
    status: 'settled_done', settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-10').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    store_label: '林口店',
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
    cs_note: null, b2b_note: null, invoice_mode_snapshot: 'monthly_combined', fruit_order_id: 260212008815,
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
    cs_note: null, b2b_note: null, invoice_mode_snapshot: 'monthly_combined', fruit_order_id: 260217008816,
    status: 'settled_done', settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-15').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    store_label: '林口店',
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
    cs_note: null, b2b_note: null, invoice_mode_snapshot: 'monthly_combined', fruit_order_id: 260114008790,
    status: 'settled_done', settlementMonth: '2026-01',
    createdAt: dayjs('2026-01-12').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    store_label: '林口店',
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
    cs_note: null, b2b_note: null, invoice_mode_snapshot: 'monthly_per_store', fruit_order_id: 260110008756,
    status: 'settled_done', settlementMonth: '2026-01',
    createdAt: dayjs('2026-01-08').format('YYYY-MM-DD'),
    shippingAddress: '台北市大安區仁愛路四段1號',
    store_label: '大安分店',
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
    cs_note: null, b2b_note: null, invoice_mode_snapshot: 'per_order', fruit_order_id: 260211008822,
    status: 'settled_done', settlementMonth: '2026-02',
    createdAt: dayjs('2026-02-08').format('YYYY-MM-DD'),
    shippingAddress: '台中市西屯區工業區一路100號',
    store_label: '台中總倉',
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
    discount_amount: 0,
    discount_note: null,
    cs_note: null, b2b_note: null,
    invoice_mode_snapshot: 'monthly_combined',
    fruit_order_id: null,
    status: 'ordered',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-03').format('YYYY-MM-DD'),
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    store_label: '林口店',
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
    invoice_mode_snapshot: 'per_order',
    fruit_order_id: null,
    status: 'ordered',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-07').format('YYYY-MM-DD'),
    shippingAddress: '台中市西屯區工業區一路100號',
    store_label: '台中總倉',
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
    b2b_order_no: null,
    discount_amount: 0,
    discount_note: null,
    invoice_mode_snapshot: 'monthly_combined',
    fruit_order_id: null,
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
    b2b_order_no: null,
    discount_amount: 0,
    discount_note: null,
    cs_note: null, b2b_note: null,
    invoice_mode_snapshot: 'monthly_per_store',
    fruit_order_id: null,
    status: 'pending_sales',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-08').format('YYYY-MM-DD'),
    shippingAddress: '台北市信義區松仁路100號1樓',
    store_label: '信義旗艦店',
    logs: [
      { time: '2026-03-08 10:45', action: '廠商送出B2B訂單' },
    ],
  },
];

// ─────────────────────────────────────────────
// 結算單（管理員手動生成，對應當月已成立訂單）
// ─────────────────────────────────────────────
export const formalOrders = [
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
    shippingAddress: '新北市林口區仁愛路一段346號1樓',
    logs: [
      { time: '2026-01-25 09:00', action: '手動生成結算單，涵蓋 1 筆B2B訂單（b2b-00009）' },
      { time: '2026-01-25 09:03', action: '發結算匯款通知給廠商' },
      { time: '2026-01-27 16:44', action: '廠商回報已匯款 $6,750' },
      { time: '2026-01-28 10:00', action: '財務確認收款，結算完成' },
    ],
  },
  // 綠色小農 2026-01（完成）
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
    shippingAddress: '台北市大安區仁愛路四段1號',
    logs: [
      { time: '2026-01-15 09:00', action: '手動生成結算單，涵蓋 1 筆B2B訂單（b2b-00010）' },
      { time: '2026-01-17 14:00', action: '廠商回報已匯款' },
      { time: '2026-01-18 11:00', action: '財務確認收款，結算完成' },
    ],
  },
  // 綠色小農 信義旗艦店 2026-02（待匯款）
  {
    id: 'FO-20260315-C002-XY',
    channelId: 'c002',
    channelName: '綠色小農超市',
    preOrderIds: ['b2b-00002'],
    store_label: '信義旗艦店',
    items: [
      { productId:'p201', productName:'中寶-玉米雞肉粥',            unit:'包', qty:50, price:45, cost:14 },
      { productId:'p202', productName:'中寶-蔥時蔬牛肉粥PLUS+',    unit:'包', qty:25, price:55, cost:19 },
      { productId:'p205', productName:'大富翁-中寶-干貝菇菇香蛋粥', unit:'包', qty:20, price:60, cost:27 },
      { productId:'p501', productName:'雞高湯',                     unit:'包', qty:80, price:22, cost:12 },
    ],
    totalAmount: 50*45 + 25*55 + 20*60 + 80*22,
    discount: false,
    status: 'awaiting_payment',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-15').format('YYYY-MM-DD'),
    shippingAddress: '台北市信義區松仁路100號1樓',
    logs: [
      { time: '2026-03-15 09:00', action: '手動生成結算單，涵蓋 1 筆B2B訂單（b2b-00002）' },
      { time: '2026-03-15 09:01', action: '發結算匯款通知給廠商' },
    ],
  },
  // 綠色小農 大安分店 2026-02（已匯款，等待財務確認）
  {
    id: 'FO-20260315-C002-DA',
    channelId: 'c002',
    channelName: '綠色小農超市',
    preOrderIds: ['b2b-00003'],
    store_label: '大安分店',
    items: [
      { productId:'p801', productName:'常溫粥-鮮茄綜合菇菇粥',        unit:'包', qty:60,  price:70,  cost:16 },
      { productId:'p802', productName:'常溫粥-蘋果蔬菜豬寶粥',        unit:'包', qty:55,  price:70,  cost:16 },
      { productId:'p806', productName:'常溫粥-金瓜山藥雞肉粥',        unit:'包', qty:40,  price:70,  cost:16 },
      { productId:'pa04', productName:'拌醬-香濃蘋果薑黃雞',          unit:'包', qty:20,  price:75,  cost:41 },
      { productId:'p812', productName:'常溫粥-茄汁紅蘿蔔牛(4包/盒)', unit:'盒', qty:10,  price:280, cost:0  },
    ],
    totalAmount: 60*70 + 55*70 + 40*70 + 20*75 + 10*280,
    discount: false,
    status: 'paid',
    settlementMonth: '2026-03',
    createdAt: dayjs('2026-03-15').format('YYYY-MM-DD'),
    shippingAddress: '台北市大安區仁愛路四段1號',
    logs: [
      { time: '2026-03-15 09:05', action: '手動生成結算單，涵蓋 1 筆B2B訂單（b2b-00003）' },
      { time: '2026-03-15 09:06', action: '發結算匯款通知給廠商' },
      { time: '2026-03-17 15:00', action: '[手動操作] 廠商已匯款' },
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
export const systemSettings = {
  freeShippingThreshold: 3000,
  shippingFee: 200,
};
