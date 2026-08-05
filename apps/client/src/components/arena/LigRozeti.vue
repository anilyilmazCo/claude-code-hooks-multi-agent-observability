<template>
  <span
    v-if="lig"
    class="km-mono text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
    :class="stil.kenarlik"
    :style="{ color: stil.renk, background: stil.dolgu, borderColor: stil.renk }"
    :title="stil.ad"
  >{{ stil.kod }}</span>
  <span v-else class="km-mono text-[10px] px-1.5 py-0.5 rounded border border-dashed border-[var(--metin-soluk)] text-[var(--metin-soluk)]">
    lig yok
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Lig } from '../../composables/useArenaDurum';

const props = defineProps<{ lig: Lig | null }>();

// Üç kanallı kodlama (ARENA-SPEC-v2.md §5.1): renk + 2 harfli kod + kenarlık
// deseni. Renk KİMLİKTİR, hüküm değildir - kalite bilgisi yalnız durum
// renklerinden (akis/bekleyen/durdu/hakem) gelir, buradan değil.
const TANIM: Record<Lig, { kod: string; ad: string; renk: string; dolgu: string; kenarlik: string }> = {
  retail: { kod: 'RT', ad: 'RETAIL', renk: 'var(--lig-retail)', dolgu: 'var(--lig-retail-dolgu)', kenarlik: 'border' },
  yari_retail: { kod: 'YR', ad: 'YARI-RETAİL', renk: 'var(--lig-yari)', dolgu: 'var(--lig-yari-dolgu)', kenarlik: 'border' },
  kurumsal: { kod: 'KR', ad: 'KURUMSAL', renk: 'var(--lig-kurumsal)', dolgu: 'var(--lig-kurumsal-dolgu)', kenarlik: 'border-double border-2' },
  baseline: { kod: 'BL', ad: 'BASELINE', renk: 'var(--lig-baseline)', dolgu: 'var(--lig-baseline-dolgu)', kenarlik: 'border-dashed border' }
};

const stil = computed(() => (props.lig ? TANIM[props.lig] : null) as { kod: string; ad: string; renk: string; dolgu: string; kenarlik: string });
</script>
