<template>
  <section class="panel">
    <div class="ust-satir">
      <span class="etiket">XAUUSD · 4 SAATLİK KAPANIŞ</span>
      <div class="donem-secici">
        <button
          v-for="d in donemler"
          :key="d"
          class="donem-buton"
          :class="{ 'donem-buton--aktif': donem === d }"
          @click="donem = d"
        >
          {{ d }}
        </button>
      </div>
    </div>

    <p class="hero tabular">{{ gosterilenFiyat }}</p>
    <p class="alt-satir">{{ altSatir }}</p>

    <div v-if="!veri" class="yukleniyor">Veri yükleniyor…</div>
    <svg
      v-else
      class="grafik"
      viewBox="0 0 1000 320"
      preserveAspectRatio="none"
      @mousemove="fareHareket"
      @mouseleave="fareCik"
    >
      <defs>
        <linearGradient id="altinDolgu" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#E6B450" stop-opacity="0.18" />
          <stop offset="55%" stop-color="#E6B450" stop-opacity="0.04" />
          <stop offset="100%" stop-color="#E6B450" stop-opacity="0" />
        </linearGradient>
      </defs>

      <line v-for="y in izgaraY" :key="y" x1="0" x2="1000" :y1="y" :y2="y" class="izgara" />

      <path :d="alanYolu" fill="url(#altinDolgu)" />
      <path :d="cizgiYolu" class="fiyat-cizgisi" />

      <g v-if="hoverNokta">
        <line :x1="hoverNokta.x" :x2="hoverNokta.x" y1="0" y2="320" class="hover-cizgi" />
        <circle :cx="hoverNokta.x" :cy="hoverNokta.y" r="4" class="hover-nokta" />
      </g>
    </svg>

    <div v-if="veri" class="eksen">
      <span>{{ ilkTarihEtiketi }}</span>
      <span>{{ sonTarihEtiketi }}</span>
    </div>

    <p class="kaynak">Kaynak: Dukascopy/MT5 · 4 saatlik · canlı besleme ayrı fazda, bu ekran arşivden okur.</p>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useXauusdSerisi } from '../composables/useVeri'
import { lttb, type Nokta } from '../composables/lttb'

const { veri } = useXauusdSerisi()

const donemler = ['1Y', '5Y', 'MAX'] as const
const donem = ref<(typeof donemler)[number]>('MAX')

const filtreliVeri = computed<Nokta[]>(() => {
  if (!veri.value) return []
  if (donem.value === 'MAX') return veri.value
  const yil = donem.value === '1Y' ? 1 : 5
  const sinir = Date.now() - yil * 365 * 24 * 60 * 60 * 1000
  return veri.value.filter(([t]) => t >= sinir)
})

const goruntulenenNoktalar = computed<Nokta[]>(() => lttb(filtreliVeri.value, 700))

const yMinMax = computed(() => {
  const degerler = goruntulenenNoktalar.value.map((n) => n[1])
  return { min: Math.min(...degerler), maks: Math.max(...degerler) }
})

function xKoordinat(t: number): number {
  const noktalar = goruntulenenNoktalar.value
  if (noktalar.length < 2) return 0
  const [ilkT] = noktalar[0]
  const [sonT] = noktalar[noktalar.length - 1]
  return ((t - ilkT) / (sonT - ilkT)) * 1000
}
function yKoordinat(v: number): number {
  const { min, maks } = yMinMax.value
  const aralik = maks - min || 1
  return 300 - ((v - min) / aralik) * 280 - 10
}

const cizgiYolu = computed(() =>
  goruntulenenNoktalar.value
    .map(([t, v], i) => `${i === 0 ? 'M' : 'L'} ${xKoordinat(t).toFixed(2)},${yKoordinat(v).toFixed(2)}`)
    .join(' '),
)
const alanYolu = computed(() => {
  const n = goruntulenenNoktalar.value
  if (!n.length) return ''
  const ilkX = xKoordinat(n[0][0]).toFixed(2)
  const sonX = xKoordinat(n[n.length - 1][0]).toFixed(2)
  return `${cizgiYolu.value} L ${sonX},320 L ${ilkX},320 Z`
})

const izgaraY = [10, 155, 300]

const sonNokta = computed(() => {
  const f = filtreliVeri.value
  if (f.length) return f[f.length - 1]
  const v = veri.value
  return v && v.length ? v[v.length - 1] : null
})
const oncekiNokta = computed(() => {
  const v = veri.value
  if (!v || v.length < 2) return null
  return v[v.length - 2]
})

const hoverIndex = ref<number | null>(null)
const hoverNokta = computed(() => {
  if (hoverIndex.value == null) return null
  const n = goruntulenenNoktalar.value[hoverIndex.value]
  if (!n) return null
  return { x: xKoordinat(n[0]), y: yKoordinat(n[1]) }
})

function fareHareket(e: MouseEvent) {
  const hedef = e.currentTarget as SVGSVGElement
  const kutu = hedef.getBoundingClientRect()
  const oran = (e.clientX - kutu.left) / kutu.width
  const idx = Math.round(oran * (goruntulenenNoktalar.value.length - 1))
  hoverIndex.value = Math.max(0, Math.min(goruntulenenNoktalar.value.length - 1, idx))
}
function fareCik() {
  hoverIndex.value = null
}

const gosterilenFiyat = computed(() => {
  const aktif = hoverIndex.value != null ? goruntulenenNoktalar.value[hoverIndex.value] : sonNokta.value
  if (!aktif) return '—'
  return aktif[1].toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const altSatir = computed(() => {
  const aktif = hoverIndex.value != null ? goruntulenenNoktalar.value[hoverIndex.value] : sonNokta.value
  if (!aktif) return ''
  const tarih = new Date(aktif[0]).toLocaleString('tr-TR', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC',
  })
  if (hoverIndex.value != null || !oncekiNokta.value) return `${tarih} UTC`
  const fark = aktif[1] - oncekiNokta.value[1]
  const yuzde = (fark / oncekiNokta.value[1]) * 100
  const isaret = fark >= 0 ? '▲' : '▼'
  return `${isaret} ${Math.abs(fark).toFixed(2)} (${yuzde.toFixed(2)}%) · ${tarih} UTC`
})

function tarihEtiketle(t: number): string {
  return new Date(t).toLocaleDateString('tr-TR', { year: 'numeric', month: donem.value === 'MAX' ? undefined : 'short', timeZone: 'UTC' })
}
const ilkTarihEtiketi = computed(() => {
  const n = goruntulenenNoktalar.value[0]
  return n ? tarihEtiketle(n[0]) : ''
})
const sonTarihEtiketi = computed(() => {
  const noktalar = goruntulenenNoktalar.value
  const n = noktalar.length ? noktalar[noktalar.length - 1] : null
  return n ? tarihEtiketle(n[0]) : ''
})
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.ust-satir {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.etiket {
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--metin-2);
}

.donem-secici {
  display: flex;
  gap: var(--sp-4);
}

.donem-buton {
  font-family: var(--f-govde);
  font-weight: 500;
  font-size: 13px;
  color: var(--metin-3);
  padding-bottom: 2px;
  border-bottom: 2px solid transparent;
}
.donem-buton:hover {
  color: var(--metin-2);
}
.donem-buton--aktif {
  color: var(--metin);
  border-bottom-color: var(--altin);
}

.hero {
  font-family: var(--f-display);
  font-weight: 200;
  font-size: 84px;
  line-height: 0.95;
  letter-spacing: -0.02em;
  margin-top: var(--sp-3);
}

.alt-satir {
  font-family: var(--f-govde);
  font-size: 14px;
  color: var(--metin-2);
  min-height: 20px;
}

.yukleniyor {
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--metin-3);
  font-size: 14px;
}

.grafik {
  width: 100%;
  height: 320px;
  margin-top: var(--sp-4);
}

.izgara {
  stroke: var(--cizgi);
  stroke-opacity: 0.4;
  stroke-width: 1;
}

.fiyat-cizgisi {
  fill: none;
  stroke: var(--altin-parlak);
  stroke-width: 1.25;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.hover-cizgi {
  stroke: var(--metin-2);
  stroke-opacity: 0.3;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.hover-nokta {
  fill: var(--altin);
}

.eksen {
  display: flex;
  justify-content: space-between;
  font-family: var(--f-dar);
  font-weight: 500;
  font-size: 11px;
  color: var(--metin-3);
}

.kaynak {
  font-family: var(--f-dar);
  font-size: 12.5px;
  letter-spacing: 0.02em;
  color: var(--metin-3);
  margin-top: var(--sp-2);
}
</style>
