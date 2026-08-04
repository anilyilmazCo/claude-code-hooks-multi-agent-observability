<template>
  <div class="flex flex-col gap-1.5">
    <!-- Surtunmesiz: hayalet defter, sonuk -->
    <div class="flex items-baseline justify-between gap-2 opacity-60 border-l border-dashed border-[var(--metin-soluk)] pl-2">
      <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">sürtünmesiz</span>
      <span class="km-mono text-xs text-[var(--metin)]">{{ fmt(surtunmesiz?.net_getiri_yuzde) }}</span>
    </div>
    <!-- Gercek maliyet: gercek defter, tam agirlik -->
    <div class="flex items-baseline justify-between gap-2 border-l-2 border-[var(--metin)] pl-2">
      <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">gerçek-maliyet</span>
      <span class="km-mono text-xs font-semibold text-[var(--metin)]">{{ fmt(gercekMaliyet?.net_getiri_yuzde) }}</span>
    </div>

    <template v-if="makasHesaplanabilirMi">
      <div class="flex items-baseline justify-between gap-2 pl-2">
        <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">Δ makas</span>
        <span class="km-mono text-xs font-bold text-[var(--arena)]">{{ makasMetni }}</span>
      </div>
      <div v-if="barOrani !== null" class="h-1 rounded-full pl-2 ml-2 overflow-hidden" style="background: var(--arena-dolgu)">
        <div class="h-full rounded-full" style="background: var(--arena)" :style="{ width: barOrani + '%' }"></div>
      </div>
    </template>
    <p v-else class="text-[10px] text-[var(--metin-soluk)] pl-2">makas hesaplanamıyor — iki defterden biri eksik.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Defter } from '../../composables/useArenaDurum';

const props = defineProps<{
  defterler: { surtunmesiz: Defter | null; gercek_maliyet: Defter | null } | null;
}>();

const surtunmesiz = computed(() => props.defterler?.surtunmesiz ?? null);
const gercekMaliyet = computed(() => props.defterler?.gercek_maliyet ?? null);

function fmt(v: number | null | undefined): string {
  if (v === null || v === undefined) return 'veri yok';
  const isaret = v > 0 ? '+' : '';
  return `${isaret}${v.toFixed(2)}%`;
}

const makasHesaplanabilirMi = computed(() => {
  const s = surtunmesiz.value?.net_getiri_yuzde;
  const g = gercekMaliyet.value?.net_getiri_yuzde;
  return s !== null && s !== undefined && g !== null && g !== undefined;
});

const makas = computed(() => {
  if (!makasHesaplanabilirMi.value) return null;
  return (surtunmesiz.value!.net_getiri_yuzde as number) - (gercekMaliyet.value!.net_getiri_yuzde as number);
});

const makasMetni = computed(() => {
  if (makas.value === null) return 'veri yok';
  const isaret = makas.value > 0 ? '+' : '';
  return `${isaret}${makas.value.toFixed(2)} puan`;
});

// Guard: sifira bolme = sahte gorsel. |surtunmesiz| < 0.01 ise bar cizilmez.
const barOrani = computed<number | null>(() => {
  if (makas.value === null) return null;
  const taban = Math.abs(surtunmesiz.value?.net_getiri_yuzde ?? 0);
  if (taban < 0.01) return null;
  return Math.min(100, Math.abs(makas.value) / taban * 100);
});
</script>
