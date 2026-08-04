<template>
  <div
    class="rounded-md border-l-2 bg-[var(--zemin)] p-3 flex flex-col gap-1.5"
    :class="[esikAlti ? 'opacity-50' : '', 'border-[var(--hakem)]']"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="text-xs font-semibold text-[var(--metin)]" :class="esikAlti ? 'line-through' : ''">
        {{ oneri.parametre ?? 'parametre belirtilmedi' }}
      </span>
      <ArenaRozeti :durum="oneri.durum" />
    </div>
    <p class="text-[11px] text-[var(--metin-soluk)] km-mono">
      {{ oneri.mevcut_deger ?? 'veri yok' }} → {{ oneri.onerilen_deger ?? 'veri yok' }}
    </p>
    <p v-if="oneri.gerekce" class="text-xs text-[var(--metin)] line-clamp-2">{{ oneri.gerekce }}</p>
    <div class="flex items-center gap-2">
      <div class="flex-1 h-1 rounded-full overflow-hidden bg-[rgba(167,139,250,0.15)]">
        <div class="h-full rounded-full bg-[var(--hakem)]" :style="{ width: (oneri.guven ?? 0) * 100 + '%' }"></div>
      </div>
      <span class="text-[10px] km-mono text-[var(--metin-soluk)]">{{ guvenMetni }}</span>
    </div>
    <p v-if="esikAlti" class="text-[10px] text-[var(--bekleyen)]">
      {{ oneri.dusme_nedeni ?? `Güven skoru eşiğin (${esik ?? '—'}) altında kaldığı için öneri otomatik düştü.` }}
    </p>
    <p class="text-[10px] text-[var(--metin-soluk)]">kol: {{ oneri.kol_id ?? 'veri yok' }} · model: {{ oneri.model ?? 'veri yok' }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Oneri } from '../../composables/useArenaDurum';
import ArenaRozeti from './ArenaRozeti.vue';

const props = defineProps<{ oneri: Oneri; esik: number | null }>();

const esikAlti = computed(() => props.oneri.durum === 'dusuruldu');
const guvenMetni = computed(() => (props.oneri.guven != null ? `${(props.oneri.guven * 100).toFixed(0)}%` : 'veri yok'));
</script>
