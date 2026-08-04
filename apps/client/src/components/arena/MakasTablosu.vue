<template>
  <div class="rounded-lg border border-[var(--cizgi)] bg-[var(--panel)] p-3.5 mobile:p-3 overflow-x-auto">
    <table v-if="siraliKollar.length > 0" class="w-full text-xs km-mono min-w-[28rem]">
      <thead>
        <tr class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)] text-left">
          <th class="pb-2 pr-3 font-normal">kol</th>
          <th class="pb-2 pr-3 font-normal text-right">sürtünmesiz net</th>
          <th class="pb-2 pr-3 font-normal text-right">gerçek-maliyet net</th>
          <th class="pb-2 font-normal text-right">Δ makas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in siraliKollar" :key="r.id" class="border-t border-[var(--cizgi)]">
          <td class="py-2 pr-3 text-[var(--metin)] truncate max-w-[10rem]">{{ r.ad }}</td>
          <td class="py-2 pr-3 text-right text-[var(--metin-soluk)]">{{ fmt(r.surtunmesiz) }}</td>
          <td class="py-2 pr-3 text-right text-[var(--metin)] font-semibold">{{ fmt(r.gercekMaliyet) }}</td>
          <td class="py-2 text-right font-bold text-[var(--arena)]">{{ fmt(r.makas, true) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="text-xs text-[var(--metin-soluk)]">
      Karşılaştırılacak tam defter yok — makas için bir kolun her iki defterinin de dolu olması gerekir.
    </p>
    <p v-if="eksikSayisi > 0" class="text-[11px] text-[var(--metin-soluk)] mt-2">
      {{ eksikSayisi }} kolun defteri eksik olduğu için tabloda yok.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Kol } from '../../composables/useArenaDurum';

const props = defineProps<{ kollar: Kol[] | null }>();

interface Satir { id: string; ad: string; surtunmesiz: number; gercekMaliyet: number; makas: number }

const hesaplananlar = computed(() => {
  return (props.kollar ?? []).map(k => {
    const s = k.defterler?.surtunmesiz?.net_getiri_yuzde;
    const g = k.defterler?.gercek_maliyet?.net_getiri_yuzde;
    const tam = s !== null && s !== undefined && g !== null && g !== undefined;
    return { kol: k, tam, satir: tam ? { id: k.id ?? k.ad ?? '?', ad: k.ad ?? 'isimsiz kol', surtunmesiz: s as number, gercekMaliyet: g as number, makas: (s as number) - (g as number) } as Satir : null };
  });
});

const siraliKollar = computed(() =>
  hesaplananlar.value
    .filter(h => h.tam)
    .map(h => h.satir as Satir)
    .sort((a, b) => Math.abs(b.makas) - Math.abs(a.makas))
);

const eksikSayisi = computed(() => hesaplananlar.value.filter(h => !h.tam).length);

function fmt(v: number, isaretli = false): string {
  const isaret = isaretli && v > 0 ? '+' : '';
  return `${isaret}${v.toFixed(2)}${isaretli ? ' puan' : '%'}`;
}
</script>
