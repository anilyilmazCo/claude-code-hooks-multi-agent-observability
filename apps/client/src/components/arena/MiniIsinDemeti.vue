<template>
  <!-- Kart-içi mini ışın demeti + equity, uPlot DEĞİL (Faz D karar #1): eksensiz
       sparkline için inline SVG yeter, çekmecedeki EquityMcPaneli.vue tam
       (eksenli/cursor'lı) sürümü taşımaya devam eder. Tıklama karta devrediliyor
       (pointer-events:none), açan yer zaten KolKarti'nin @click'i. -->
  <svg viewBox="0 0 100 136" preserveAspectRatio="none" class="w-full h-[136px] mobile:h-[104px] block" style="pointer-events: none">
    <g v-if="isinNoktalari.length">
      <polyline
        v-for="(p, i) in isinNoktalari" :key="i"
        :points="p" fill="none" stroke="rgba(138,226,52,0.18)" stroke-width="1"
        vector-effect="non-scaling-stroke"
      />
    </g>
    <text v-else x="50" y="44" text-anchor="middle" font-size="6" fill="var(--metin-soluk)">ışın yok</text>

    <line x1="0" y1="84" x2="100" y2="84" stroke="var(--cizgi)" stroke-width="1" vector-effect="non-scaling-stroke" />

    <g v-if="equityVar">
      <polyline v-if="surtunmesizNoktalar" :points="surtunmesizNoktalar" fill="none" stroke="rgba(216,224,234,0.35)" stroke-width="1" vector-effect="non-scaling-stroke" />
      <polyline v-if="gercekNoktalar" :points="gercekNoktalar" fill="none" stroke="var(--metin)" stroke-width="1.5" vector-effect="non-scaling-stroke" />
    </g>
    <text v-else x="50" y="112" text-anchor="middle" font-size="6" fill="var(--metin-soluk)">equity yok</text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Kol } from '../../composables/useArenaDurum';

const props = defineProps<{ kol: Kol }>();

const ISIN_YOL_LIMIT = 30;
const ISIN_ALT = 2;
const ISIN_UST = 78;
const EQ_ALT = 90;
const EQ_UST = 134;

function noktalarDiz(degerDizisi: (number | null)[][], yAlt: number, yUst: number): string[] {
  // Bant-genelinde ORTAK min/max: ışın demetinin göreli açılımı (spread) korunsun
  // diye her yol kendi başına değil, tüm bant birlikte normalize edilir.
  const tumDegerler: number[] = [];
  for (const d of degerDizisi) for (const v of d) if (v !== null) tumDegerler.push(v);
  if (tumDegerler.length < 2) return [];
  const min = Math.min(...tumDegerler);
  const max = Math.max(...tumDegerler);
  const aralik = max - min || 1;
  return degerDizisi.map(d => {
    const n = d.length;
    if (n < 2) return '';
    const noktalar: string[] = [];
    d.forEach((v, i) => {
      if (v === null) return;
      const x = (i / (n - 1)) * 100;
      const y = yUst - ((v - min) / aralik) * (yUst - yAlt);
      noktalar.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    });
    return noktalar.join(' ');
  }).filter(p => p.length > 0);
}

function tekSeriNoktalar(seri: { deger: number | null }[] | null, yAlt: number, yUst: number, ortakMin: number | null, ortakMaks: number | null): string | null {
  if (!seri) return null;
  const gecerli = seri.filter(n => n.deger !== null).length;
  if (gecerli < 2) return null;
  const min = ortakMin ?? Math.min(...(seri.map(n => n.deger).filter((v): v is number => v !== null)));
  const maks = ortakMaks ?? Math.max(...(seri.map(n => n.deger).filter((v): v is number => v !== null)));
  const aralik = maks - min || 1;
  const n = seri.length;
  const noktalar: string[] = [];
  seri.forEach((nokta, i) => {
    if (nokta.deger === null) return;
    const x = (i / (n - 1)) * 100;
    const y = yUst - ((nokta.deger - min) / aralik) * (yUst - yAlt);
    noktalar.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  });
  return noktalar.join(' ');
}

const isinNoktalari = computed(() => {
  const yollar = props.kol.mc?.yollar ?? null;
  if (!yollar || yollar.length === 0) return [];
  return noktalarDiz(yollar.slice(0, ISIN_YOL_LIMIT), ISIN_ALT, ISIN_UST);
});

const gercekSeri = computed(() => props.kol.defterler?.gercek_maliyet?.equity_serisi ?? null);
const surtunmesizSeri = computed(() => props.kol.defterler?.surtunmesiz?.equity_serisi ?? null);
const equityVar = computed(() => (gercekSeri.value?.length ?? 0) >= 2 || (surtunmesizSeri.value?.length ?? 0) >= 2);

// Equity bandı: iki seri ORTAK ölçekte (makas = iki çizgi arasındaki alan
// görsel olarak okunabilsin diye), ışın bandıyla PAYLAŞILMAZ (EquityMcPaneli.vue
// dipnotundaki kural burada da geçerli: iki bant ortak y-ölçekte değildir).
const ortakEquityAralik = computed(() => {
  const tum = [...(gercekSeri.value ?? []), ...(surtunmesizSeri.value ?? [])]
    .map(n => n.deger).filter((v): v is number => v !== null);
  if (tum.length < 2) return { min: null, maks: null };
  return { min: Math.min(...tum), maks: Math.max(...tum) };
});

const gercekNoktalar = computed(() => tekSeriNoktalar(gercekSeri.value, EQ_ALT, EQ_UST, ortakEquityAralik.value.min, ortakEquityAralik.value.maks));
const surtunmesizNoktalar = computed(() => tekSeriNoktalar(surtunmesizSeri.value, EQ_ALT, EQ_UST, ortakEquityAralik.value.min, ortakEquityAralik.value.maks));
</script>
