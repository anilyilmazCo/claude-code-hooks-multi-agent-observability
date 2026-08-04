<template>
  <div
    class="km-serit flex items-stretch divide-x divide-[var(--cizgi)] overflow-x-auto rounded-lg border bg-[var(--panel)]"
    :class="besleme ? 'border-[var(--cizgi)]' : 'border-dashed border-[var(--cizgi)]'"
  >
    <div class="flex flex-col justify-center gap-0.5 px-3.5 py-2.5 mobile:px-3 mobile:py-2 shrink-0 min-w-[8rem]">
      <span class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">kaynak</span>
      <span class="km-mono text-sm font-semibold" :class="kaynakMetni ? 'text-[var(--metin)]' : 'text-[var(--metin-soluk)]'">
        {{ kaynakMetni ?? 'veri yok' }}
      </span>
    </div>
    <div class="flex flex-col justify-center gap-0.5 px-3.5 py-2.5 mobile:px-3 mobile:py-2 shrink-0 min-w-[6rem]">
      <span class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">mod</span>
      <span class="km-mono text-sm font-semibold" :class="besleme?.mod ? 'text-[var(--metin)]' : 'text-[var(--metin-soluk)]'">
        {{ besleme?.mod ?? 'veri yok' }}
      </span>
    </div>
    <div class="flex flex-col justify-center gap-0.5 px-3.5 py-2.5 mobile:px-3 mobile:py-2 shrink-0 min-w-[7rem]">
      <span class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">gecikme</span>
      <span class="km-mono text-sm font-semibold" :class="besleme?.gecikme_ms != null ? 'text-[var(--metin)]' : 'text-[var(--metin-soluk)]'">
        {{ besleme?.gecikme_ms != null ? besleme.gecikme_ms + ' ms' : 'veri yok' }}
      </span>
    </div>
    <div class="flex flex-col justify-center gap-0.5 px-3.5 py-2.5 mobile:px-3 mobile:py-2 shrink-0 min-w-[7rem]">
      <span class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">ölümcül kusur</span>
      <span class="km-mono text-sm font-semibold" :class="besleme?.kusur_olumcul != null ? 'text-[var(--durdu)]' : 'text-[var(--metin-soluk)]'">
        {{ besleme?.kusur_olumcul ?? 'kusur sayacı yok' }}
      </span>
    </div>
    <div class="flex flex-col justify-center gap-0.5 px-3.5 py-2.5 mobile:px-3 mobile:py-2 shrink-0 min-w-[7rem]">
      <span class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">bilgi kusuru</span>
      <span class="km-mono text-sm font-semibold" :class="besleme?.kusur_bilgi != null ? 'text-[var(--bekleyen)]' : 'text-[var(--metin-soluk)]'">
        {{ besleme?.kusur_bilgi ?? 'kusur sayacı yok' }}
      </span>
    </div>
    <div class="flex items-center px-3.5 mobile:px-3 shrink-0 ml-auto">
      <ArenaRozeti :durum="besleme?.bagli_mi === true ? 'calisiyor' : besleme?.bagli_mi === false ? 'hata' : null" />
    </div>
  </div>
  <p v-if="besleme && besleme.bagli_mi === false" class="text-[11px] text-[var(--durdu)] mt-1.5">
    Besleme kopuk. Aşağıdaki defterler son bağlantı anında dondurulmuş değerlerdir, canlı değildir.
  </p>
  <p v-if="!besleme" class="text-[11px] text-[var(--metin-soluk)] mt-1.5">
    L0 feed'inden henüz kayıt gelmedi — besleme sağlığı ölçülemiyor.
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BeslemeSagligi } from '../../composables/useArenaDurum';
import ArenaRozeti from './ArenaRozeti.vue';

const props = defineProps<{ besleme: BeslemeSagligi | null }>();

const kaynakMetni = computed(() => {
  if (!props.besleme?.kaynak && !props.besleme?.sembol) return null;
  return [props.besleme?.kaynak, props.besleme?.sembol].filter(Boolean).join(' · ') || null;
});
</script>
