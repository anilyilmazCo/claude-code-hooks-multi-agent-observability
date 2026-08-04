<template>
  <div class="rounded-lg border border-[var(--hakem)] bg-[rgba(167,139,250,0.06)] p-3.5 mobile:p-3 flex flex-col gap-3">
    <p class="text-xs text-[var(--metin)] leading-relaxed">
      <strong>Bu öneriler otomatik uygulanmaz.</strong> Hiçbir öneri hakem onayından geçmeden bir kola yazılmaz;
      bu ekranda uygulama düğmesi bulunmaz ve bulunmayacaktır. Dondurulmuş kollara reviewer dokunamaz.
      Öneriler yalnızca kayıt ve inceleme amacıyla listelenir.
    </p>

    <p v-if="reviewer?.acik_mi !== true" class="text-[11px] text-[var(--metin-soluk)]">
      Reviewer öneri modu kapalıdır. Kuyruk yalnızca görüntüleme amacıyla buradadır; modun açılması ayrı bir karar satırıyla yapılır.
    </p>

    <div v-if="reviewer?.kuyruk && reviewer.kuyruk.length > 0" class="grid gap-2.5 grid-cols-1 md:grid-cols-2">
      <OneriKarti v-for="(oneri, i) in reviewer.kuyruk" :key="oneri.id ?? i" :oneri="oneri" :esik="reviewer?.guven_esigi ?? null" />
    </div>
    <p v-else class="text-xs text-[var(--metin-soluk)]">
      Kuyrukta öneri yok. Öneri üretmemek reviewer'ın normal çıktısıdır (no_change).
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ReviewerDurumu } from '../../composables/useArenaDurum';
import OneriKarti from './OneriKarti.vue';

defineProps<{ reviewer: ReviewerDurumu | null }>();
</script>
