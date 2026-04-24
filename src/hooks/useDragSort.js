import { useState } from 'react'

/**
 * 管理大分類卡片 + 子分類列的拖曳排序狀態與 drop 行為。
 * 僅在排序模式（sortMode=true）期間作用。
 *
 * @param {{ sortMode: boolean, setDraft: function }} params
 */
export function useDragSort({ sortMode, setDraft }) {
  const [dragCatIdx,          setDragCatIdx]          = useState(null)
  const [insertAtIdx,         setInsertAtIdx]         = useState(null)
  const [dragSubId,           setDragSubId]           = useState(null)
  const [insertBeforeSubIdx,  setInsertBeforeSubIdx]  = useState(null)

  const clearCatDrag = () => { setDragCatIdx(null); setInsertAtIdx(null) }
  const clearSubDrag = () => { setDragSubId(null); setInsertBeforeSubIdx(null) }

  const handleCatDrop = (insertIdx) => {
    if (!sortMode || dragCatIdx === null) return
    setDraft(prev => {
      const next = [...prev]
      const [item] = next.splice(dragCatIdx, 1)
      const adjusted = insertIdx > dragCatIdx ? insertIdx - 1 : insertIdx
      next.splice(adjusted, 0, item)
      return next
    })
    clearCatDrag()
  }

  const handleSubDrop = (catId, insertBeforeIdx) => {
    if (!sortMode || !dragSubId) return
    setDraft(prev => prev.map(c => {
      if (c.id !== catId) return c
      const subs    = [...c.subCategories]
      const fromIdx = subs.findIndex(s => s.id === dragSubId)
      if (fromIdx === -1) return c
      const [item]  = subs.splice(fromIdx, 1)
      const toIdx   = insertBeforeIdx > fromIdx ? insertBeforeIdx - 1 : insertBeforeIdx
      subs.splice(toIdx, 0, item)
      return { ...c, subCategories: subs }
    }))
    clearSubDrag()
  }

  return {
    dragCatIdx,   setDragCatIdx,
    insertAtIdx,  setInsertAtIdx,
    dragSubId,    setDragSubId,
    insertBeforeSubIdx, setInsertBeforeSubIdx,
    clearCatDrag, clearSubDrag,
    handleCatDrop, handleSubDrop,
  }
}
