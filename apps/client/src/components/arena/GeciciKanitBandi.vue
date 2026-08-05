<template>
  <!-- ARENA-SPEC-v2.md §7.2: kapatılamaz, 375px'te de kalır. Varsayılan
       GECICI_KANIT (fail-safe) - varlık verisi 'onaylanmis' olduğu AÇIKÇA
       belirtilmedikçe bant gösterilir. -->
  <div v-if="gosterilsin" class="w-full px-3 py-1.5 border-b border-[var(--bekleyen)] bg-[rgba(255,182,39,0.08)]">
    <p class="km-mono text-[11px] text-[var(--bekleyen)]">
      GEÇİCİ KANIT VERİSİ — varlık kararı onay bekliyor. Buradaki sayılar boru
      hattı doğrulamasıdır, varlık hakkında bir bulgu değildir.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Varlik } from '../../composables/useArenaDurum';

const props = defineProps<{ aktifVarlik: Varlik | null }>();

const gosterilsin = computed(() => props.aktifVarlik?.veri_statusu !== 'onaylanmis');
</script>
