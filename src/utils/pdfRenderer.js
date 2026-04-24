// Shared PDF rendering helpers used by all export*Pdf.js files
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export function todayYmd() {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export function makeOffscreenContainer() {
  const c = document.createElement('div')
  c.style.cssText = 'position:fixed;left:-99999px;top:0;z-index:-1'
  document.body.appendChild(c)
  return c
}

export async function waitForImages(div) {
  const imgs = div.querySelectorAll('img')
  await Promise.all(Array.from(imgs).map(img =>
    img.complete ? Promise.resolve() : new Promise(res => { img.onload = img.onerror = res })
  ))
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))
}

// Renders the first child element of pageDiv into the PDF.
// Pass isFirst=true for the first page (no addPage call).
export async function renderDivToPdfPage(pdf, pageDiv, isFirst) {
  await waitForImages(pageDiv)
  const canvas = await html2canvas(pageDiv.firstElementChild, {
    scale: 2, useCORS: true, backgroundColor: '#ffffff',
  })
  const pageW = pdf.internal.pageSize.getWidth()
  const pageH = pdf.internal.pageSize.getHeight()
  const imgW  = pageW
  const imgH  = (canvas.height * imgW) / canvas.width

  if (!isFirst) pdf.addPage()

  if (imgH <= pageH) {
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, imgH, undefined, 'FAST')
  } else {
    const pxPerPage = (pageH / imgW) * canvas.width
    let remaining = canvas.height
    let y = 0
    let firstSlice = true
    while (remaining > 0) {
      const sliceH = Math.min(pxPerPage, remaining)
      const sc = document.createElement('canvas')
      sc.width = canvas.width
      sc.height = sliceH
      sc.getContext('2d').drawImage(canvas, 0, -y)
      const sliceHPt = (sliceH * imgW) / canvas.width
      if (!firstSlice) pdf.addPage()
      pdf.addImage(sc.toDataURL('image/png'), 'PNG', 0, 0, imgW, sliceHPt, undefined, 'FAST')
      firstSlice = false
      y += sliceH
      remaining -= sliceH
    }
  }
}

export function newA4Pdf() {
  return new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' })
}
