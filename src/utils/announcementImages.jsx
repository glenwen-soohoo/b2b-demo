// 公告圖片呈現方式（後台預覽與廠商前台共用）。預設滿版大圖。
export const IMAGE_LAYOUT_OPTIONS = [
  { value: 'full',    label: '滿版大圖' },
  { value: 'inline',  label: '並排縮圖' },
  { value: 'natural', label: '原始尺寸' },
]

const IMG_BORDER = { borderRadius: 6, border: '1px solid #f0f0f0' }

// 依呈現方式渲染公告圖片。
//   full（預設）：每張滿版、直向堆疊
//   inline：固定縮圖、一行多張並排
//   natural：圖片原始尺寸（超出容器才縮）
export function renderAnnouncementImages(images, layout = 'full') {
  if (!images?.length) return null
  if (layout === 'inline') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {images.map((im, i) => (
          <img key={im.uid ?? i} src={im.url} alt={im.name}
            style={{ width: 130, height: 130, objectFit: 'cover', ...IMG_BORDER }} />
        ))}
      </div>
    )
  }
  if (layout === 'natural') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
        {images.map((im, i) => (
          <img key={im.uid ?? i} src={im.url} alt={im.name}
            style={{ maxWidth: '100%', ...IMG_BORDER }} />
        ))}
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {images.map((im, i) => (
        <img key={im.uid ?? i} src={im.url} alt={im.name}
          style={{ width: '100%', ...IMG_BORDER }} />
      ))}
    </div>
  )
}
