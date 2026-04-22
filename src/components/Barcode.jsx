// EAN-13 條碼 SVG 產生器（純前端、無第三方套件）
// 用法：<Barcode value="4711234567890" /> 或 <Barcode value="471123456789" />（12 碼會自動補檢查碼）

const L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
const G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111']
const R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100']
// 第一位決定左側 6 碼的 L/G 模式
const PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']

function calcCheckDigit(digits12) {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += Number(digits12[i]) * (i % 2 === 0 ? 1 : 3)
  }
  return (10 - (sum % 10)) % 10
}

function buildBits(code13) {
  const first = Number(code13[0])
  const parity = PARITY[first]
  let bits = '101' // start
  for (let i = 0; i < 6; i++) {
    const d = Number(code13[1 + i])
    bits += parity[i] === 'L' ? L[d] : G[d]
  }
  bits += '01010' // middle
  for (let i = 0; i < 6; i++) {
    const d = Number(code13[7 + i])
    bits += R[d]
  }
  bits += '101' // end
  return bits // 共 95 bits
}

export default function Barcode({ value, height = 56, moduleWidth = 2, showText = true }) {
  const raw = String(value ?? '').replace(/\D/g, '')
  let code13 = null
  if (raw.length === 13) code13 = raw
  else if (raw.length === 12) code13 = raw + calcCheckDigit(raw)

  if (!code13) {
    return (
      <div style={{
        height: height + (showText ? 16 : 0),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#fafafa', border: '1px dashed #d9d9d9', borderRadius: 4,
        color: '#bfbfbf', fontSize: 12,
      }}>
        {raw ? `EAN-13 需 12 或 13 碼（目前 ${raw.length} 碼）` : '輸入 12 或 13 碼 EAN 後顯示條碼'}
      </div>
    )
  }

  const bits = buildBits(code13)
  const totalW = bits.length * moduleWidth + moduleWidth * 10 // 左右留白
  const barX0 = moduleWidth * 5

  // 合併連續的黑色 bit 成一個矩形，減少節點數
  const rects = []
  let i = 0
  while (i < bits.length) {
    if (bits[i] === '1') {
      let j = i
      while (j < bits.length && bits[j] === '1') j++
      // 中間 guard 區段（3~5, 45~49, 92~94）高一點做視覺差
      const isGuard = (i < 3) || (i >= 45 && i < 50) || (i >= 92)
      const h = isGuard ? height + 6 : height
      rects.push({ x: barX0 + i * moduleWidth, w: (j - i) * moduleWidth, h })
      i = j
    } else i++
  }

  const textY = height + 14
  // EAN-13 數字分三段：首碼、左 6、右 6
  const digitSize = Math.max(10, moduleWidth * 5)

  return (
    <svg xmlns="http://www.w3.org/2000/svg"
      width={totalW}
      height={height + (showText ? 18 : 0)}
      style={{ background: '#fff', display: 'block' }}>
      {rects.map((r, idx) => (
        <rect key={idx} x={r.x} y={0} width={r.w} height={r.h} fill="#000" />
      ))}
      {showText && (
        <g fill="#000" fontFamily="monospace" fontSize={digitSize}>
          <text x={0} y={textY} textAnchor="start">{code13[0]}</text>
          <text x={barX0 + 3 * moduleWidth + 21 * moduleWidth} y={textY} textAnchor="middle">
            {code13.slice(1, 7)}
          </text>
          <text x={barX0 + 50 * moduleWidth + 21 * moduleWidth} y={textY} textAnchor="middle">
            {code13.slice(7)}
          </text>
        </g>
      )}
    </svg>
  )
}
