<template>
  <div class="rounded-lg border border-[var(--cizgi)] bg-[var(--panel)] p-3.5 mobile:p-3">
    <template v-if="rejim?.dagilim && rejim.dagilim.length > 0">
      <div class="flex h-4 rounded-full overflow-hidden border border-[var(--cizgi)]">
        <div
          v-for="(inanc, i) in rejim.dagilim"
          :key="inanc.etiket ?? i"
          class="h-full"
          :style="{ width: (inanc.olasilik ?? 0) * 100 + '%', background: RENKLER[i % RENKLER.length] }"
          :title="`${inanc.etiket ?? 'etiketsiz'}: ${fmtYuzde(inanc.olasilik)}`"
        ></div>
      </div>
      <div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
        <span v-for="(inanc, i) in rejim.dagilim" :key="'etiket-' + (inanc.etiket ?? i)" class="flex items-center gap-1.5 km-mono">
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: RENKLER[i % RENKLER.length] }"></span>
          <span class="text-[var(--metin)]">{{ inanc.etiket ?? 'etiketsiz' }}</span>
          <span class="text-[var(--metin-soluk)]">{{ fmtYuzde(inanc.olasilik) }}</span>
        </span>
      </div>
      <p v-if="!toplamBirmi" class="text-[11px] text-[var(--bekleyen)] mt-1.5">
        dağılım toplamı %{{ toplamYuzde }} — eksik olasılık kütlesi tamamlanmadı
      </p>
      <p v-if="rejim.yontem" class="text-[10px] text-[var(--metin-soluk)] mt-1.5">{{ rejim.yontem }}</p>
    </template>
    <p v-else class="text-xs text-[var(--metin-soluk)]">
      Rejim inanç dağılımı henüz yayınlanmadı — tek etiketli tahmin göstermiyoruz.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Rejim } from '../../composables/useArenaDurum';

const props = defineProps<{ rejim: Rejim | null }>();

const RENKLER = ['var(--akis)', 'var(--bekleyen)', 'var(--hakem)', 'var(--durdu)', 'var(--arena)'];

function fmtYuzde(v: number | null | undefined): string {
  if (v === null || v === undefined) return 'veri yok';
  return `${(v * 100).toFixed(0)}%`;
}

const toplam = computed(() => (props.rejim?.dagilim ?? []).reduce((t, d) => t + (d.olasilik ?? 0), 0));
const toplamYuzde = computed(() => (toplam.value * 100).toFixed(0));
const toplamBirmi = computed(() => Math.abs(toplam.value - 1) < 0.02);
</script>
