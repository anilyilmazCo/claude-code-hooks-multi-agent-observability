<template>
  <div class="flex items-baseline justify-between gap-2 pl-2">
    <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">Δ baseline (eşleştirilmiş-rastgele)</span>
    <span class="km-mono text-xs font-bold" :class="renkSinifi">{{ metin }}</span>
  </div>
  <p v-if="bk?.simetri_sonucu === 'basarisiz'" class="text-[10px] text-[var(--durdu)] pl-2">
    SİMETRİ DENETİMİ BAŞARISIZ — sayı yayımlanamaz
  </p>
  <p v-else-if="bk?.simetri_sonucu === 'yetersiz'" class="text-[10px] text-[var(--metin-soluk)] pl-2">
    {{ bk.simetri_notu ?? 'YETERSİZ — devam (taban altında)' }}
  </p>
  <p v-else-if="bk?.simetri_sonucu === 'sari'" class="text-[10px] text-[var(--bekleyen)] pl-2">
    ⚠ {{ bk.simetri_notu ?? 'simetri sınırda, tek ölçüt aşıldı' }}
  </p>
  <p v-else-if="bk?.simetri_sonucu === 'hesaplanamadi'" class="text-[10px] text-[var(--metin-soluk)] pl-2">
    simetri denetimi hesaplanamadı (payda sıfır)
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BaselineKarsilastirma } from '../../composables/useArenaDurum';

const props = defineProps<{ bk: BaselineKarsilastirma | null }>();

const metin = computed(() => {
  if (props.bk?.simetri_sonucu === 'basarisiz') return 'BLOKLANDI';
  if (props.bk?.simetri_sonucu === 'yetersiz') return 'YETERSİZ — devam';
  if (props.bk?.ayrilabildi_mi === false) return 'AYRILAMADI';
  if (props.bk?.delta_sharpe === null || props.bk?.delta_sharpe === undefined) return 'veri yok';
  const isaret = props.bk.delta_sharpe > 0 ? '+' : '';
  return `${isaret}${props.bk.delta_sharpe.toFixed(2)} Sharpe`;
});

// AYRILAMADI/BLOKLANDI/YETERSİZ nötr renkte - yeşil/kırmızı boyanmış bir
// "ayrılamadı" hükmü yanlış okumaya davettir (spec §3.1).
const renkSinifi = computed(() => {
  if (props.bk?.simetri_sonucu === 'basarisiz' || props.bk?.simetri_sonucu === 'yetersiz' || props.bk?.ayrilabildi_mi === false || props.bk?.delta_sharpe == null) {
    return 'text-[var(--metin-soluk)]';
  }
  return 'text-[var(--metin)]';
});
</script>
