// 商品目錄「標準排序」單一來源。
// 排序規則：大分類（categories 的順序）→ 子分類（cat.subCategories 的順序）→ 商品（products 陣列原序）。
// 分類管理頁即依此顯示與拖曳；商品管理、品項表模板、廠商前台等都應沿用此排序，全站才一致。
//
// TODO_FRUIT_WEB: 正式版此排序應來自後端（大分類/子分類 sortOrder + 商品 sortOrder），
//   此處以 fakeData 的靜態順序模擬「唯一來源」。
import { categories, products } from '../data/fakeData'

// 依「大分類 → 子分類」展開的子分類清單；並補上 products 有、但 categories 未列到的子分類（排最後）
export const ORDERED_SUBCATS = (() => {
  const result = []
  for (const cat of categories) {
    for (const sub of cat.subCategories) {
      result.push({ subCatName: sub.name, catId: cat.id, catName: cat.name, temperature: cat.temperature })
    }
  }
  const known = new Set(result.map(r => r.subCatName))
  for (const p of products) {
    if (!known.has(p.subCategory)) {
      result.push({ subCatName: p.subCategory, catId: null, catName: '', temperature: p.category })
      known.add(p.subCategory)
    }
  }
  return result
})()

// 子分類名稱 → 排序序位（未知者排最後，供 Array.sort 使用）
const RANK = new Map(ORDERED_SUBCATS.map((s, i) => [s.subCatName, i]))
export const subCatRank = (name) => (RANK.has(name) ? RANK.get(name) : Number.MAX_SAFE_INTEGER)

// 把一批商品依標準順序分組。
// 子分類照 ORDERED_SUBCATS；同一子分類內維持「傳入陣列的順序」——
// 呼叫端請傳 products.filter(...) 這類保留原序的子集，組內即為標準商品順序。
export function groupByOrderedSubCat(prods) {
  const map = {}
  prods.forEach(p => { (map[p.subCategory] ||= []).push(p) })
  return ORDERED_SUBCATS
    .filter(s => map[s.subCatName]?.length)
    .map(s => ({ ...s, items: map[s.subCatName] }))
}
