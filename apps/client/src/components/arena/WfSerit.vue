<template>
  <div class="flex flex-col gap-1">
    <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">walk-forward</span>
    <div v-if="!pencereler || pencereler.length === 0" class="text-[10px] text-[var(--metin-soluk)]">
      veri yok
    </div>
    <div v-else-if="pencereler.length === 1" class="text-[10px] text-[var(--bekleyen)]">
      TEK PENCERE — şerit anlamlı değil
    </div>
    <div v-else class="flex gap-0.5 h-4 items-end">
      <div
        v-for="(p, i) in pencereler" :key="i"
        class="flex-1 rounded-sm min-h-[2px]"
        :style="{ height: yukseklik(p) + '%', background: renk(p) }"
        :title="p.sira !== null ? `pencere ${p.sira}: ${fmt(p.sharpe)}` : undefined"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WalkForwardPencere } from '../../composables/useArenaDurum';

const props = defineProps<{ pencereler: WalkForwardPencere[] | null }>();

const maxMutlak = computed(() => {
  const degerler = (props.pencereler ?? []).map(p => Math.abs(p.sharpe ?? 0));
  return Math.max(...degerler, 0.01);
});

function yukseklik(p: WalkForwardPencere): number {
  if (p.sharpe === null) return 15;
  return Math.max(15, Math.min(100, (Math.abs(p.sharpe) / maxMutlak.value) * 100));
}

// İşaret (sign) rengi - literal, bir anlamlılık eşiği DEĞİL (§2.3 bunu
// yasaklamıyor çünkü bu bir eşik değil, yayımlanmış sayının kendi işareti).
function renk(p: WalkForwardPencere): string {
  if (p.sharpe === null) return 'var(--metin-soluk)';
  if (p.sharpe > 0) return 'var(--akis)';
  if (p.sharpe < 0) return 'var(--durdu)';
  return 'var(--metin-soluk)';
}

function fmt(v: number | null): string {
  return v === null ? 'veri yok' : v.toFixed(2);
}
</script>
