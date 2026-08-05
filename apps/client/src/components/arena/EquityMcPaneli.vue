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
      <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)] block mb-2">
        MC yelpazesi{{ kol.mc?.metrik ? ` — ${kol.mc.metrik}` : '' }}
      </span>
      <div class="h-40 flex flex-col justify-center gap-2">
        <McGosterge :mc="kol.mc" />
        <p class="text-[10px] text-[var(--metin-soluk)]">
          Y ekseni equity paneliyle ORTAK ÖLÇEKTE DEĞİLDİR (farklı birimler).
        </p>
      </div>
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

const grafikKapsayici = ref<HTMLDivElement | null>(null);
let grafik: uPlot | null = null;

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

onMounted(ciz);
onUnmounted(() => grafik?.destroy());
watch(() => [props.kol.defterler?.surtunmesiz?.equity_serisi, props.kol.defterler?.gercek_maliyet?.equity_serisi], ciz);
</script>
