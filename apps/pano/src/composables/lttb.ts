// Largest-Triangle-Three-Buckets downsampling — 48k noktalık XAUUSD serisini
// grafiğin piksel genişliğine indirir. Ham seri asla çizilmez (spec §6).
// Kaynak: Sveinn Steinarsson (2013), yaygın stdlib-benzeri bilinen algoritma.

export type Nokta = [number, number] // [epoch_ms, deger]

export function lttb(veri: Nokta[], hedefNoktaSayisi: number): Nokta[] {
  const n = veri.length
  if (hedefNoktaSayisi >= n || hedefNoktaSayisi <= 2) return veri

  const sonuc: Nokta[] = [veri[0]]
  const bucketBoyu = (n - 2) / (hedefNoktaSayisi - 2)
  let a = 0

  for (let i = 0; i < hedefNoktaSayisi - 2; i++) {
    const bucketBaslangic = Math.floor((i + 1) * bucketBoyu) + 1
    const bucketBitis = Math.min(Math.floor((i + 2) * bucketBoyu) + 1, n)

    let sonrakiBaslangic = bucketBitis
    let sonrakiBitis = Math.min(Math.floor((i + 3) * bucketBoyu) + 1, n)
    if (sonrakiBitis <= sonrakiBaslangic) sonrakiBitis = Math.min(sonrakiBaslangic + 1, n)
    let ortX = 0
    let ortY = 0
    let sayac = 0
    for (let j = sonrakiBaslangic; j < sonrakiBitis; j++) {
      ortX += veri[j][0]
      ortY += veri[j][1]
      sayac++
    }
    if (sayac > 0) {
      ortX /= sayac
      ortY /= sayac
    } else {
      ortX = veri[n - 1][0]
      ortY = veri[n - 1][1]
    }

    let enBuyukAlan = -1
    let enIyiIndeks = bucketBaslangic
    const [ax, ay] = veri[a]
    for (let j = bucketBaslangic; j < bucketBitis; j++) {
      const [bx, by] = veri[j]
      const alan = Math.abs((ax - ortX) * (by - ay) - (ax - bx) * (ortY - ay)) * 0.5
      if (alan > enBuyukAlan) {
        enBuyukAlan = alan
        enIyiIndeks = j
      }
    }
    sonuc.push(veri[enIyiIndeks])
    a = enIyiIndeks
  }

  sonuc.push(veri[n - 1])
  return sonuc
}
