<template>
  <div class="flex flex-col items-center justify-center gap-1 px-4 mobile:px-3 py-2 shrink-0">
    <span class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">self-healing</span>
    <span
      class="km-rozet km-mono text-sm mobile:text-xs font-bold px-3 py-1 rounded-full border-2 whitespace-nowrap"
      :class="rozetSinif"
    >{{ etiket }}</span>
    <span class="text-[10px] text-[var(--metin-soluk)] whitespace-nowrap">{{ altYazi }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  // null: hq-durum.json henuz gelmedi / alan bos -> durum bilinmiyor.
  durum: boolean | null;
}>();

const etiket = computed(() => {
  if (props.durum === true) return 'SİLAHLI';
  if (props.durum === false) return 'SİLAHSIZ';
  return 'VERİ YOK';
});

const altYazi = computed(() => {
  if (props.durum === true) return 'tamir turu açık';
  if (props.durum === false) return 'yalnız bead açar';
  return 'durum bilinmiyor';
});

const rozetSinif = computed(() => {
  if (props.durum === true) {
    return 'km-rozet--silahli border-[var(--akis)] text-[var(--akis)]';
  }
  return 'border-dashed border-[var(--metin-soluk)] text-[var(--metin-soluk)]';
});
</script>
