<template>
  <Teleport to="body">
    <div v-if="kol" class="fixed inset-0 z-40 flex justify-end">
      <div class="absolute inset-0 bg-black/50" @click="emit('kapat')"></div>
      <div class="relative w-full max-w-2xl h-full bg-[var(--panel)] border-l border-[var(--cizgi)] overflow-y-auto p-4 mobile:p-3 km-cekmece">
        <div class="flex items-center justify-between gap-2 mb-4">
          <div class="flex items-center gap-2 min-w-0">
            <LigRozeti :lig="kol.lig" />
            <span class="km-mono text-base font-semibold text-[var(--metin)] truncate">{{ kol.ad ?? 'isimsiz kol' }}</span>
          </div>
          <button class="km-mono text-xs text-[var(--metin-soluk)] hover:text-[var(--metin)] px-2 py-1" @click="emit('kapat')">
            KAPAT ✕
          </button>
        </div>

        <p class="text-xs text-[var(--metin-soluk)] mb-3">{{ kol.kural_ozeti ?? 'kural özeti yok' }}</p>

        <EquityMcPaneli :kol="kol" class="mb-4" />

        <div class="mb-4">
          <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)] block mb-1">walk-forward pencereleri</span>
          <div v-if="!kol.walk_forward || kol.walk_forward.length === 0" class="text-[11px] text-[var(--metin-soluk)]">veri yok</div>
          <table v-else class="w-full text-[11px] km-mono">
            <thead>
              <tr class="text-[9px] tracking-[0.1em] uppercase text-[var(--metin-soluk)] text-left border-b border-[var(--cizgi)]">
                <th class="py-1 pr-2 font-normal">#</th>
                <th class="py-1 pr-2 font-normal">dönem</th>
                <th class="py-1 pr-2 font-normal">tip</th>
                <th class="py-1 pr-2 font-normal text-right">sharpe</th>
                <th class="py-1 font-normal text-right">işlem</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in kol.walk_forward" :key="p.sira ?? Math.random()" class="border-b border-[var(--cizgi)]">
                <td class="py-1 pr-2 text-[var(--metin-soluk)]">{{ p.sira ?? '—' }}</td>
                <td class="py-1 pr-2 text-[var(--metin-soluk)]">{{ p.baslangic ?? '?' }} → {{ p.bitis ?? '?' }}</td>
                <td class="py-1 pr-2 text-[var(--metin-soluk)]">{{ p.egitim_mi ? 'eğitim' : 'test' }}</td>
                <td class="py-1 pr-2 text-right" :class="p.sharpe && p.sharpe > 0 ? 'text-[var(--akis)]' : 'text-[var(--durdu)]'">{{ p.sharpe?.toFixed(2) ?? '—' }}</td>
                <td class="py-1 text-right text-[var(--metin)]">{{ p.islem_sayisi ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="kol.kunye" class="mb-4">
          <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)] block mb-1">künye</span>
          <p class="text-xs text-[var(--metin)]">
            {{ [kol.kunye.yazar, kol.kunye.yil, kol.kunye.baslik].filter(Boolean).join(' · ') || 'eksik' }}
          </p>
          <p v-if="kol.kunye.replikasyon_sapmasi" class="text-[11px] text-[var(--metin-soluk)] mt-0.5">
            sapma: {{ kol.kunye.replikasyon_sapmasi }}
          </p>
        </div>

        <div v-if="kol.kanit_vitrini && kol.bulgu" class="rounded border border-[var(--hakem)] bg-[rgba(167,139,250,0.08)] px-3 py-2">
          <span class="km-mono text-xs font-bold text-[var(--hakem)]">{{ kol.bulgu.karar_sikki ?? 'BULGU BEKLENİYOR' }}</span>
          <p v-if="kol.bulgu.dayaniklilik" class="text-[11px] text-[var(--metin-soluk)] mt-1">{{ kol.bulgu.dayaniklilik }}</p>
          <p v-if="kol.bulgu.geri_cekilen_iddialar?.length" class="text-[11px] text-[var(--durdu)] mt-1">
            GERİ ÇEKİLDİ: {{ kol.bulgu.geri_cekilen_iddialar.join(', ') }}
          </p>
          <p v-if="kol.bulgu.rapor_referansi" class="text-[10px] text-[var(--metin-soluk)] mt-1">rapor: {{ kol.bulgu.rapor_referansi }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { Kol } from '../../composables/useArenaDurum';
import LigRozeti from './LigRozeti.vue';
import EquityMcPaneli from './EquityMcPaneli.vue';

defineProps<{ kol: Kol | null }>();
const emit = defineEmits<{ kapat: [] }>();
</script>
