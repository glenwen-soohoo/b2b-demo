// 產生 EAN-13 條碼 PNG（Canvas 繪製，回傳 base64 dataURL / ArrayBuffer）
// 與 components/Barcode.jsx 使用相同編碼表

const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
const G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111']
const R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100']
const PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']

function calcCheckDigit(d12) {
  let s = 0
  for (let i = 0; i < 12; i++) s += Number(d12[i]) * (i % 2 === 0 ? 1 : 3)
  return (10 - (s % 10)) % 10
}

function buildBits(c13) {
  const first = Number(c13[0])
  const par = PARITY[first]
  let bits = '101'
  for (let i = 0; i < 6; i++) {
    const d = Number(c13[1 + i])
    bits += par[i] === 'L' ? L[d] : G[d]
  }
  bits += '01010'
  for (let i = 0; i < 6; i++) bits += R[Number(c13[7 + i])]
  bits += '101'
  return bits
}

// 回傳 EAN-13 條碼 PNG 的 ArrayBuffer；若輸入不合法回傳 null
export function makeEan13PngBuffer(value, opt = {}) {
  const raw = String(value ?? '').replace(/\D/g, '')
  let code13 = null
  if (raw.length === 13) code13 = raw
  else if (raw.length === 12) code13 = raw + calcCheckDigit(raw)
  if (!code13) return null

  const moduleWidth = opt.moduleWidth ?? 2
  const height      = opt.height ?? 56
  const pad         = opt.pad ?? 6
  const fontSize    = opt.fontSize ?? 12
  const textGap     = 2

  const bits = buildBits(code13) // 95 bits
  const w = bits.length * moduleWidth + pad * 2
  const h = height + fontSize + textGap + pad

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#000'

  // Guard bars 稍微加高
  for (let i = 0; i < bits.length; i++) {
    if (bits[i] === '1') {
      const isGuard = (i < 3) || (i >= 45 && i < 50) || (i >= 92)
      const barH = isGuard ? height + 4 : height
      ctx.fillRect(pad + i * moduleWidth, pad, moduleWidth, barH)
    }
  }

  // 底部文字（三段：首碼 / 左 6 / 右 6）
  ctx.fillStyle = '#000'
  ctx.font = `${fontSize}px monospace`
  ctx.textBaseline = 'top'
  const textY = pad + height + textGap
  ctx.textAlign = 'left'
  ctx.fillText(code13[0], 0, textY)
  ctx.textAlign = 'center'
  ctx.fillText(code13.slice(1, 7), pad + 3 * moduleWidth + 21 * moduleWidth, textY)
  ctx.fillText(code13.slice(7),    pad + 50 * moduleWidth + 21 * moduleWidth, textY)

  // 轉 PNG ArrayBuffer
  const dataUrl = canvas.toDataURL('image/png')
  const base64 = dataUrl.split(',')[1]
  const bin = atob(base64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return { buffer: bytes.buffer, width: w, height: h }
}
