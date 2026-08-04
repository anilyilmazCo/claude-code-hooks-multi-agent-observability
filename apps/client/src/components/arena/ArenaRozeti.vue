<template>
  <span
    class="km-rozet km-mono text-[11px] mobile:text-[10px] font-bold px-2.5 py-0.5 rounded-full border-2 whitespace-nowrap uppercase tracking-[0.08em]"
    :class="rozetSinif"
  >{{ etiket }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { KolDurum, OneriDurum } from '../../composables/useArenaDurum';

const props = defineProps<{
  durum: KolDurum | OneriDurum | null;
}>();

const ETIKETLER: Record<string, string> = {
  calisiyor: 'ÇALIŞIYOR',
  bekliyor: 'BEKLİYOR',
  hata: 'HATA',
  donduruldu: 'DONDURULDU',
  hakem_bekliyor: 'HAKEM BEKLİYOR',
  dusuruldu: 'EŞİK ALTI — DÜŞTÜ',
  reddedildi: 'REDDEDİLDİ',
  onaylandi: 'ONAYLANDI'
};

const etiket = computed(() => (props.durum ? ETIKETLER[props.durum] ?? props.durum.toUpperCase() : 'VERİ YOK'));

const rozetSinif = computed(() => {
  switch (props.durum) {
    case 'calisiyor':
      return 'km-rozet--silahli border-[var(--akis)] text-[var(--akis)]';
    case 'bekliyor':
    case 'dusuruldu':
      return 'border-[var(--bekleyen)] text-[var(--bekleyen)]';
    case 'hata':
    case 'reddedildi':
      return 'border-[var(--durdu)] text-[var(--durdu)]';
    case 'donduruldu':
    case 'hakem_bekliyor':
      return 'border-dashed border-[var(--hakem)] text-[var(--hakem)]';
    case 'onaylandi':
      return 'border-[var(--akis)] text-[var(--akis)]';
    default:
      return 'border-dashed border-[var(--metin-soluk)] text-[var(--metin-soluk)]';
  }
});
</script>
