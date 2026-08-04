<template>
  <div class="flex flex-col gap-2.5 rounded-lg border border-[var(--cizgi)] bg-[var(--panel)] p-3.5 mobile:p-3">
    <div class="flex items-center justify-between gap-2">
      <span class="km-mono text-sm font-semibold text-[var(--metin)] truncate">{{ kol.ad ?? 'isimsiz kol' }}</span>
      <ArenaRozeti :durum="kol.durum" />
    </div>

    <p class="text-xs text-[var(--metin-soluk)] truncate" :title="kol.kural_ozeti ?? undefined">
      {{ kol.kural_ozeti ?? 'kural özeti yok' }}
    </p>

    <p v-if="kol.donduruldu_mu" class="text-[11px] text-[var(--hakem)]">
      {{ kol.dondurma_gerekcesi ?? 'Bu kol dondurulmuş; parametreleri değiştirilemez.' }}
    </p>

    <HatIstasyonlari :istasyonlar="kol.istasyonlar" :donduruldu="kol.donduruldu_mu" />

    <div class="text-xs">
      <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)] block mb-0.5">son karar</span>
      <p v-if="kol.son_karar?.ozet" class="text-[var(--metin)] line-clamp-2" :title="kol.son_karar.gerekce ?? undefined">
        {{ kol.son_karar.ozet }}
      </p>
      <p v-else class="text-[var(--metin-soluk)]">Bu kol henüz karar üretmedi.</p>
    </div>

    <div class="border-t border-[var(--cizgi)] pt-2.5">
      <CiftDefterSeridi v-if="kol.defterler" :defterler="kol.defterler" />
      <p v-else class="text-[11px] text-[var(--metin-soluk)]">Bu kol için defter açılmadı.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Kol } from '../../composables/useArenaDurum';
import ArenaRozeti from './ArenaRozeti.vue';
import HatIstasyonlari from './HatIstasyonlari.vue';
import CiftDefterSeridi from './CiftDefterSeridi.vue';

defineProps<{ kol: Kol }>();
</script>
