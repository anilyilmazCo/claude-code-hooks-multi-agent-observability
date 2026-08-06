<template>
  <section class="panel">
    <div v-if="!kampanya" class="yukleniyor">Kampanya verisi yükleniyor…</div>
    <template v-else-if="!secilenAday">
      <BosDurum :gerekce="BOS_GEREKCE[aktifLevel]" :planlar="BOS_PLANLAR[aktifLevel]" />
    </template>
    <template v-else>
      <div class="secici-satir">
        <span class="etiket">ŞANS BANDI KARŞILAŞTIRMASI</span>
        <select v-model="seciliId" class="secici">
          <option v-for="a in adaylar" :key="a.id" :value="a.id">{{ stratejiAdi(a) }}</option>
        </select>
        <AyarDamgasi :durum="damgaHesapla(secilenAday)" />
      </div>

      <div v-if="!secilenAday.mc?.yuzdelikler" class="olculemedi">
        Bu aday için şans bandı ölçülemedi (aday/tutma süresi yetersiz).
      </div>
      <template v-else>
        <svg class="bant-svg" viewBox="0 0 1000 90" preserveAspectRatio="none">
          <defs>
            <linearGradient id="sansBandi" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#8A7E71" stop-opacity="0" />
              <stop :offset="`${pOffset('p05')}%`" stop-color="#8A7E71" stop-opacity="0.28" />
              <stop :offset="`${pOffset('p50')}%`" stop-color="#8A7E71" stop-opacity="0.28" />
              <stop :offset="`${pOffset('p95')}%`" stop-color="#8A7E71" stop-opacity="0.28" />
              <stop offset="100%" stop-color="#8A7E71" stop-opacity="0" />
            </linearGradient>
          </defs>
          <rect x="0" y="17" width="1000" height="56" fill="url(#sansBandi)" />
          <line
            v-if="gozlenenX != null"
            :x1="gozlenenX" :x2="gozlenenX" y1="7" y2="83"
            class="gercek-cubuk"
          />
        </svg>
        <div class="eksen">
          <span>{{ fmtSayi(yuzdelikler!.p05) }}</span>
          <span>0</span>
          <span>{{ fmtSayi(yuzdelikler!.p95) }}</span>
        </div>
        <p class="gercek-etiket" v-if="secilenAday.mc?.gozlenen != null">
          gerçek sonuç: <strong class="tabular">{{ fmtSayi(secilenAday.mc.gozlenen) }}</strong> (Sharpe)
        </p>

        <p class="sonuc-cumlesi">{{ sonucCumlesi }}</p>
        <p class="ne-demek">
          <strong>Bu ne demek?</strong> {{ neDemekMetni }}
        </p>
      </template>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AyarDamgasi from './AyarDamgasi.vue'
import BosDurum from './BosDurum.vue'
import { damgaHesapla } from '../composables/damga'
import { aktifLevel, BOS_GEREKCE, BOS_PLANLAR } from '../composables/durum'
import type { KampanyaAday, KampanyaSonuc } from '../composables/useVeri'

const props = defineProps<{ kampanya: KampanyaSonuc | null }>()

const adaylar = computed(() =>
  (props.kampanya?.adaylar ?? [])
    .filter((a) => a.lig === aktifLevel.value && a.mc?.yuzdelikler)
    .sort((a, b) => (b.defterler.gercek_maliyet.deflated_sharpe ?? -1) - (a.defterler.gercek_maliyet.deflated_sharpe ?? -1)),
)

const seciliId = ref<string | null>(null)
watch(
  adaylar,
  (yeni) => {
    if (!yeni.find((a) => a.id === seciliId.value)) seciliId.value = yeni[0]?.id ?? null
  },
  { immediate: true },
)
const secilenAday = computed<KampanyaAday | null>(
  () => adaylar.value.find((a) => a.id === seciliId.value) ?? null,
)

function stratejiAdi(aday: KampanyaAday): string {
  const parametreMetni = Object.entries(aday.parametreler).map(([k, v]) => `${k}=${v}`).join(', ')
  return `${aday.aile} (${parametreMetni})`
}

const yuzdelikler = computed(() => secilenAday.value?.mc?.yuzdelikler ?? null)

const bantDomain = computed(() => {
  const y = yuzdelikler.value
  const gozlenen = secilenAday.value?.mc?.gozlenen ?? null
  if (!y) return { min: -1, maks: 1 }
  const degerler = [y.p05, y.p95, ...(gozlenen != null ? [gozlenen] : [])]
  const tabanMin = Math.min(...degerler)
  const tabanMaks = Math.max(...degerler)
  const dolgu = (tabanMaks - tabanMin) * 0.15 || 0.05
  return { min: tabanMin - dolgu, maks: tabanMaks + dolgu }
})

function oranaCevir(deger: number): number {
  const { min, maks } = bantDomain.value
  return ((deger - min) / (maks - min)) * 100
}
function pOffset(anahtar: 'p05' | 'p50' | 'p95'): number {
  const y = yuzdelikler.value
  if (!y) return 50
  return oranaCevir(y[anahtar])
}
const gozlenenX = computed(() => {
  const g = secilenAday.value?.mc?.gozlenen
  if (g == null) return null
  return (oranaCevir(g) / 100) * 1000
})

function fmtSayi(v: number | null | undefined): string {
  return v == null ? '—' : v.toFixed(3)
}

const yelpazeDisindaMi = computed(() => secilenAday.value?.baseline_karsilastirma?.ayrilabildi_mi)

const sonucCumlesi = computed(() => {
  const n = props.kampanya?.n_trials ?? 0
  if (yelpazeDisindaMi.value === true) {
    return `Gerçek performans, rastgele denemelerin oluşturduğu şans bandının dışında kaldı — ${n} deneme dürüstçe sayıldı, hiçbiri gizlenmedi.`
  }
  if (yelpazeDisindaMi.value === false) {
    return `Gerçek performans şans bandının içinde kaldı — bu sonuç şansla açıklanabilir.`
  }
  return 'Bu aday için ayrışma ölçülemedi (simetri denetimi geçilmedi ya da veri yetersiz).'
})

const neDemekMetni = computed(() => {
  if (yelpazeDisindaMi.value === true) {
    return 'Bu strateji sonucunun yalnızca şansla ortaya çıkma ihtimali düşük. Kesin demek değil; "şansla açıklanamıyor" demek.'
  }
  if (yelpazeDisindaMi.value === false) {
    return 'Aynı kurallarla üretilmiş rastgele denemelerin çoğu, bu stratejiye benzer ya da daha iyi sonuç verebiliyor.'
  }
  return 'Bu adayda simetri denetimi ya da örneklem büyüklüğü yetersiz kaldığı için bir yargı verilmiyor.'
})

</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-4);
  max-width: 760px;
}

.yukleniyor {
  color: var(--metin-3);
  font-size: 14px;
}

.secici-satir {
  display: flex;
  align-items: center;
  gap: var(--sp-4);
}

.etiket {
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--metin-2);
}

.secici {
  flex: 1;
  background: var(--yuzey);
  border: 1px solid var(--cizgi);
  border-radius: var(--r-s);
  color: var(--metin);
  font-family: var(--f-govde);
  font-size: 14px;
  padding: var(--sp-2) var(--sp-3);
}

.olculemedi {
  color: var(--metin-3);
  font-size: 14px;
  padding: var(--sp-6) 0;
}

.bant-svg {
  width: 100%;
  height: 90px;
}

.gercek-cubuk {
  stroke: var(--altin);
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
}

.eksen {
  display: flex;
  justify-content: space-between;
  font-family: var(--f-dar);
  font-size: 11px;
  color: var(--metin-3);
}

.gercek-etiket {
  font-family: var(--f-govde);
  font-size: 13px;
  color: var(--metin-2);
}
.gercek-etiket strong {
  color: var(--altin);
}

.sonuc-cumlesi {
  font-family: var(--f-display);
  font-weight: 300;
  font-size: 20px;
  line-height: 1.5;
  border-left: 2px solid var(--altin);
  padding-left: var(--sp-4);
  color: var(--metin);
  margin-top: var(--sp-3);
}

.ne-demek {
  font-family: var(--f-govde);
  font-size: 15px;
  color: var(--metin-2);
}
.ne-demek strong {
  color: var(--metin);
  font-weight: 600;
}
</style>
