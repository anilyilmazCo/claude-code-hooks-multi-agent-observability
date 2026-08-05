<template>
  <!-- Faz D.2: tek katmanlı bindirme - MC yolları arkada ince/soluk doku,
       equity önde kalın+parlak+gradyan dolgulu, uçta parlayan son-değer
       noktası (referans1/2.png atmosferi: dominant vurgu + derinlik).
       ÖNEMLİ: aynı SVG içinde aynı görsel bantta çizilirler ama ORTAK EKSEN
       DEĞİLDİR - biri işlem indeksine (MC), biri takvim zamanına (equity)
       göre bağımsız normalize edilir. Üst üste binme yalnız atmosfer için,
       konum karşılığı taşımaz (EquityMcPaneli.vue'daki dipnotla aynı ilke). -->
  <div
    class="relative rounded-md border border-[var(--cizgi)] overflow-hidden km-derinlik"
    style="background: radial-gradient(ellipse 90% 65% at 50% 22%, rgba(138,226,52,0.07), transparent 65%), rgba(255,255,255,0.015)"
  >
    <span class="absolute top-1 left-1.5 z-10 text-[8px] km-mono uppercase tracking-[0.16em] text-[var(--metin-soluk)]">equity · ışın</span>
    <span v-if="kol.mc?.replikasyon" class="absolute top-1 right-1.5 z-10 text-[8px] km-mono text-[var(--metin-soluk)]">{{ kol.mc.replikasyon }}×</span>

    <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="w-full h-[180px] mobile:h-[128px] block" style="pointer-events: none">
      <defs>
        <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--metin-parlak)" stop-opacity="0.22" />
          <stop offset="100%" stop-color="var(--metin-parlak)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <g v-if="isinNoktalari.length">
        <polyline
          v-for="(p, i) in isinNoktalari" :key="i"
          :points="p" fill="none" :stroke="isinRengi(i)" stroke-width="0.8"
          vector-effect="non-scaling-stroke"
        />
      </g>
      <text v-else x="50" y="50" text-anchor="middle" font-size="6" fill="var(--metin-soluk)">ışın yok</text>

      <g v-if="equityVar">
        <path v-if="alanYolu" :d="alanYolu" :fill="`url(#${gradId})`" stroke="none" />
        <polyline v-if="surtunmesizNoktalar" :points="surtunmesizNoktalar" fill="none" stroke="rgba(216,224,234,0.32)" stroke-width="1" stroke-dasharray="2.5 2" vector-effect="non-scaling-stroke" />
        <polyline v-if="gercekNoktalar" :points="gercekNoktalar" fill="none" stroke="var(--metin-parlak)" stroke-width="2" vector-effect="non-scaling-stroke" />
        <template v-if="sonNokta">
          <circle :cx="sonNokta.x" :cy="sonNokta.y" r="4.5" fill="var(--metin-parlak)" opacity="0.25" />
          <circle :cx="sonNokta.x" :cy="sonNokta.y" r="1.8" fill="var(--metin-parlak)" />
        </template>
      </g>
      <text v-else x="50" y="80" text-anchor="middle" font-size="6" fill="var(--metin-soluk)">equity yok</text>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Kol } from '../../composables/useArenaDurum';

const props = defineProps<{ kol: Kol }>();

// url(#id) belge-genelinde İLK eşleşen id'yi çözer - kartlar arası çakışmayı
// önlemek için her instance kendi gradyan id'sini taşır.
let sayac = 0;
const gradId = `mid-grad-${sayac++}-${Math.random().toString(36).slice(2, 7)}`;

const ISIN_YOL_LIMIT = 30;
const Y_UST = 8;
const Y_ALT = 92;

function isinRengi(i: number): string {
  const alfa = 0.16 + (i % 5) * 0.03;
  return `rgba(138,226,52,${alfa.toFixed(3)})`;
}

function noktalarDiz(degerDizisi: (number | null)[][], yAlt: number, yUst: number): string[] {
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

interface Nokta { x: number; y: number }

function tekSeriNoktalari(seri: { deger: number | null }[] | null, yAlt: number, yUst: number, ortakMin: number | null, ortakMaks: number | null): Nokta[] {
  if (!seri) return [];
  const gecerliDegerler = seri.map(n => n.deger).filter((v): v is number => v !== null);
  if (gecerliDegerler.length < 2) return [];
  const min = ortakMin ?? Math.min(...gecerliDegerler);
  const maks = ortakMaks ?? Math.max(...gecerliDegerler);
  const aralik = maks - min || 1;
  const n = seri.length;
  const noktalar: Nokta[] = [];
  seri.forEach((nokta, i) => {
    if (nokta.deger === null) return;
    const x = (i / (n - 1)) * 100;
    const y = yUst - ((nokta.deger - min) / aralik) * (yUst - yAlt);
    noktalar.push({ x, y });
  });
  return noktalar;
}

function noktalarMetni(noktalar: Nokta[]): string | null {
  return noktalar.length ? noktalar.map(n => `${n.x.toFixed(2)},${n.y.toFixed(2)}`).join(' ') : null;
}

const isinNoktalari = computed(() => {
  const yollar = props.kol.mc?.yollar ?? null;
  if (!yollar || yollar.length === 0) return [];
  return noktalarDiz(yollar.slice(0, ISIN_YOL_LIMIT), Y_ALT, Y_UST);
});

const gercekSeri = computed(() => props.kol.defterler?.gercek_maliyet?.equity_serisi ?? null);
const surtunmesizSeri = computed(() => props.kol.defterler?.surtunmesiz?.equity_serisi ?? null);
const equityVar = computed(() => (gercekSeri.value?.length ?? 0) >= 2 || (surtunmesizSeri.value?.length ?? 0) >= 2);

const ortakEquityAralik = computed(() => {
  const tum = [...(gercekSeri.value ?? []), ...(surtunmesizSeri.value ?? [])]
    .map(n => n.deger).filter((v): v is number => v !== null);
  if (tum.length < 2) return { min: null, maks: null };
  return { min: Math.min(...tum), maks: Math.max(...tum) };
});

const gercekNoktaListesi = computed(() => tekSeriNoktalari(gercekSeri.value, Y_ALT, Y_UST, ortakEquityAralik.value.min, ortakEquityAralik.value.maks));
const gercekNoktalar = computed(() => noktalarMetni(gercekNoktaListesi.value));
const surtunmesizNoktalar = computed(() => noktalarMetni(tekSeriNoktalari(surtunmesizSeri.value, Y_ALT, Y_UST, ortakEquityAralik.value.min, ortakEquityAralik.value.maks)));

const alanYolu = computed(() => {
  const noktalar = gercekNoktaListesi.value;
  if (noktalar.length < 2) return null;
  const ilk = noktalar[0];
  const son = noktalar[noktalar.length - 1];
  const gövde = noktalar.map(n => `L ${n.x.toFixed(2)},${n.y.toFixed(2)}`).join(' ');
  return `M ${ilk.x.toFixed(2)},${Y_ALT} ${gövde} L ${son.x.toFixed(2)},${Y_ALT} Z`;
});

const sonNokta = computed(() => {
  const noktalar = gercekNoktaListesi.value;
  return noktalar.length ? noktalar[noktalar.length - 1] : null;
});
</script>
