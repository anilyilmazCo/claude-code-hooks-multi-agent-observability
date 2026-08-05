<template>
  <div class="flex flex-col gap-1">
    <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">MC sağlamlık</span>
    <div v-if="!yuzdelikler" class="text-[10px] text-[var(--metin-soluk)]">veri yok</div>
    <template v-else>
      <div class="relative h-3 rounded-full overflow-hidden" style="background: var(--arena-dolgu)">
        <div class="absolute inset-y-0 rounded-full" style="left: 0; right: 0; background: rgba(216,224,234,0.14)"></div>
        <div class="absolute inset-y-0 rounded-full" :style="ceyrekAraligiStil"></div>
        <div v-if="gozlenenKonum !== null" class="absolute top-0 bottom-0 w-0.5" :style="{ left: gozlenenKonum + '%', background: gozlenenRenk }"></div>
      </div>
      <span v-if="yelpazeIcindeMi !== null" class="text-[10px]" :style="{ color: yelpazeIcindeMi ? 'var(--bekleyen)' : 'var(--akis)' }">
        {{ yelpazeIcindeMi ? 'YELPAZE İÇİNDE — kural ölçülebilir katkı üretmedi' : 'YELPAZE DIŞINDA' }}
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { MonteCarloOzeti } from '../../composables/useArenaDurum';

const props = defineProps<{ mc: MonteCarloOzeti | null }>();

const yuzdelikler = computed(() => props.mc?.yuzdelikler ?? null);

function konum(deger: number): number {
  const y = yuzdelikler.value!;
  const genislik = y.p95 - y.p05;
  if (genislik <= 0) return 50;
  return Math.max(0, Math.min(100, ((deger - y.p05) / genislik) * 100));
}

const ceyrekAraligiStil = computed(() => {
  if (!yuzdelikler.value) return {};
  const sol = konum(yuzdelikler.value.p25);
  const sag = konum(yuzdelikler.value.p75);
  return { left: sol + '%', right: (100 - sag) + '%', background: 'rgba(216,224,234,0.28)' };
});

const gozlenenKonum = computed(() => {
  if (!yuzdelikler.value || props.mc?.gozlenen === null || props.mc?.gozlenen === undefined) return null;
  return konum(props.mc.gozlenen);
});

const yelpazeIcindeMi = computed(() => {
  if (!yuzdelikler.value || props.mc?.gozlenen === null || props.mc?.gozlenen === undefined) return null;
  return props.mc.gozlenen >= yuzdelikler.value.p05 && props.mc.gozlenen <= yuzdelikler.value.p95;
});

const gozlenenRenk = computed(() => (yelpazeIcindeMi.value ? 'var(--bekleyen)' : 'var(--akis)'));
</script>
