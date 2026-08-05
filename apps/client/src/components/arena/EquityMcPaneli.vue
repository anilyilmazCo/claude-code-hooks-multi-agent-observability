<template>
  <!-- Equity eğrisi + MC yelpazesi, yan yana yerleşim (ARENA-SPEC-v2.md §5.4).
       ≥1024px: 1fr 1fr yan yana. <1024px: alt alta (spec §6.4 mobil tablosu). -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
    <div class="rounded-lg border border-[var(--cizgi)] bg-[var(--panel)] p-3">
      <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)] block mb-2">equity eğrisi</span>
      <div v-if="!veriVar" class="h-40 flex items-center justify-center text-[11px] text-[var(--metin-soluk)]">
        veri yok — equity serisi henüz üretilmiyor
      </div>
      <div v-else ref="grafikKapsayici" class="h-40"></div>
    </div>
    <div class="rounded-lg border border-[var(--cizgi)] bg-[var(--panel)] p-3">
      <div class="flex items-baseline justify-between gap-2 mb-2">
        <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">
          MC yelpazesi — ışın demeti{{ kol.mc?.metrik ? ` (${kol.mc.metrik})` : '' }}
        </span>
        <span v-if="kol.mc?.replikasyon" class="km-mono text-[10px] text-[var(--metin-soluk)]">
          {{ kol.mc.replikasyon }} replikasyon
        </span>
      </div>
      <div v-if="!yollarVar" class="h-40 flex items-center justify-center text-[11px] text-[var(--metin-soluk)]">
        veri yok — eşleştirilmiş-rastgele üretilemedi
      </div>
      <div v-else ref="isinKapsayici" class="h-28"></div>
      <McGosterge :mc="kol.mc" class="mt-2" />
      <p class="text-[10px] text-[var(--metin-soluk)] mt-1">
        Işın demeti = her replikasyonun GERÇEK kümülatif getiri yolu (işlem
        indeksine göre, takvim zamanına göre değil). Y ekseni equity
        paneliyle ORTAK ÖLÇEKTE DEĞİLDİR.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';
import type { Kol } from '../../composables/useArenaDurum';
import McGosterge from './McGosterge.vue';

const props = defineProps<{ kol: Kol }>();

const surtunmesiz = computed(() => props.kol.defterler?.surtunmesiz?.equity_serisi ?? null);
const gercekMaliyet = computed(() => props.kol.defterler?.gercek_maliyet?.equity_serisi ?? null);
const veriVar = computed(() => (surtunmesiz.value?.length ?? 0) > 0 || (gercekMaliyet.value?.length ?? 0) > 0);
const yollarVar = computed(() => (props.kol.mc?.yollar?.length ?? 0) > 0);

const grafikKapsayici = ref<HTMLDivElement | null>(null);
const isinKapsayici = ref<HTMLDivElement | null>(null);
let grafik: uPlot | null = null;
let isinGrafik: uPlot | null = null;

function seriDonustur(seri: { damga: string | null; deger: number | null }[] | null): [number[], (number | null)[]] {
  const damgalar: number[] = [];
  const degerler: (number | null)[] = [];
  for (const n of seri ?? []) {
    if (n.damga === null) continue;
    const zaman = Date.parse(n.damga) / 1000;
    if (Number.isNaN(zaman)) continue;
    damgalar.push(zaman);
    degerler.push(n.deger);
  }
  return [damgalar, degerler];
}

function ciz() {
  if (!grafikKapsayici.value || !veriVar.value) return;
  grafik?.destroy();

  const [xS, yS] = seriDonustur(surtunmesiz.value);
  const [xG, yG] = seriDonustur(gercekMaliyet.value);
  // uPlot tek x-ekseni bekler; iki seri farklı damgalanmışsa gerçek-maliyet
  // eksen kaynağı alınır (ana defter), sürtünmesiz ona hizalanamıyorsa boş bırakılır.
  const x = xG.length >= xS.length ? xG : xS;
  const dizi: uPlot.AlignedData = [x, xG.length === x.length ? yG : x.map(() => null), xS.length === x.length ? yS : x.map(() => null)];

  const genislik = grafikKapsayici.value.clientWidth || 320;
  grafik = new uPlot({
    width: genislik,
    height: 160,
    legend: { show: false },
    cursor: { show: true },
    axes: [
      { stroke: 'var(--metin-soluk)', grid: { stroke: 'var(--cizgi)' } },
      { stroke: 'var(--metin-soluk)', grid: { stroke: 'var(--cizgi)' } }
    ],
    series: [
      {},
      { label: 'gerçek-maliyet', stroke: '#D8E0EA', width: 1.5 },
      { label: 'sürtünmesiz', stroke: 'rgba(216,224,234,0.6)', width: 1 }
    ]
  }, dizi, grafikKapsayici.value);
}

// Işın demeti: her replikasyonun GERÇEK yolu ince/soluk bir çizgi olarak
// çizilir - dekoratif fan DEĞİL, gerçek simülasyon çıktısı üst üste.
function isinCiz() {
  if (!isinKapsayici.value || !yollarVar.value) return;
  isinGrafik?.destroy();

  const yollar = props.kol.mc!.yollar!;
  const x = yollar[0].map((_, i) => i); // işlem indeksi, takvim zamanı değil
  const dizi: uPlot.AlignedData = [x, ...yollar];

  const genislik = isinKapsayici.value.clientWidth || 320;
  isinGrafik = new uPlot({
    width: genislik,
    height: 112,
    legend: { show: false },
    cursor: { show: false },
    // x ekseni İŞLEM İNDEKSİ (0,1,2,...), takvim zamanı DEĞİL - uPlot
    // varsayılanı x'i unix zaman damgası sanıp saat etiketi basar, kapatılır.
    scales: { x: { time: false } },
    axes: [
      { stroke: 'var(--metin-soluk)', grid: { show: false }, label: 'işlem indeksi' },
      { stroke: 'var(--metin-soluk)', grid: { stroke: 'var(--cizgi)' } }
    ],
    series: [
      {},
      ...yollar.map(() => ({ stroke: 'rgba(138,226,52,0.22)', width: 1, points: { show: false } }))
    ]
  }, dizi, isinKapsayici.value);
}

onMounted(() => { ciz(); isinCiz(); });
onUnmounted(() => { grafik?.destroy(); isinGrafik?.destroy(); });
watch(() => [props.kol.defterler?.surtunmesiz?.equity_serisi, props.kol.defterler?.gercek_maliyet?.equity_serisi], ciz);
watch(() => props.kol.mc?.yollar, isinCiz);
</script>
