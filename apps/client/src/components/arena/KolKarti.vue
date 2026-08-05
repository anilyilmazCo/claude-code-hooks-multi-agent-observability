<template>
  <div
    class="flex flex-col gap-2.5 rounded-lg border border-[var(--cizgi)] bg-[var(--panel)] p-3.5 mobile:p-3 cursor-pointer hover:border-[var(--metin-soluk)] transition-colors"
    @click="emit('sec', kol)"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="km-mono text-sm font-semibold text-[var(--metin)] truncate">{{ kol.ad ?? 'isimsiz kol' }}</span>
      <div class="flex items-center gap-1.5 shrink-0">
        <LigRozeti :lig="kol.lig" />
        <ArenaRozeti :durum="kol.durum" />
      </div>
    </div>

    <p class="text-xs text-[var(--metin-soluk)] truncate" :title="kol.kural_ozeti ?? undefined">
      {{ kol.kural_ozeti ?? 'kural özeti yok' }}
    </p>

    <p v-if="kol.kunye" class="text-[11px] text-[var(--metin-soluk)] truncate" :title="kunyeMetni ?? undefined">
      künye: {{ kunyeMetni ?? 'eksik' }}
    </p>
    <p v-else-if="kunyeZorunluMu" class="text-[11px] text-[var(--durdu)]">
      KÜNYE EKSİK — ÖLÇÜM GİZLENDİ
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

    <DsrRozeti :deger="kol.defterler?.gercek_maliyet?.deflated_sharpe ?? null" :n-trials="terazi?.n_trials ?? null" />
    <WfSerit :pencereler="kol.walk_forward" />
    <McGosterge :mc="kol.mc" />

    <div class="border-t border-[var(--cizgi)] pt-2.5">
      <CiftDefterSeridi v-if="kol.defterler" :defterler="kol.defterler" />
      <p v-else class="text-[11px] text-[var(--metin-soluk)]">Bu kol için defter açılmadı.</p>
      <BaselineKarsilastirmaSatiri :bk="kol.baseline_karsilastirma" />
    </div>

    <div
      v-if="kol.kanit_vitrini && kol.bulgu"
      class="rounded border border-[var(--hakem)] bg-[rgba(167,139,250,0.08)] px-2 py-1.5"
    >
      <span class="km-mono text-[10px] font-bold text-[var(--hakem)]">{{ kol.bulgu.karar_sikki ?? 'BULGU BEKLENİYOR' }}</span>
      <p v-if="kol.bulgu.dayaniklilik" class="text-[10px] text-[var(--metin-soluk)] mt-0.5">
        {{ kol.bulgu.dayaniklilik }}{{ kol.bulgu.rapor_referansi ? ` · rapor: ${kol.bulgu.rapor_referansi}` : '' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Kol, TeraziKunyesi } from '../../composables/useArenaDurum';
import ArenaRozeti from './ArenaRozeti.vue';
import HatIstasyonlari from './HatIstasyonlari.vue';
import CiftDefterSeridi from './CiftDefterSeridi.vue';
import LigRozeti from './LigRozeti.vue';
import DsrRozeti from './DsrRozeti.vue';
import WfSerit from './WfSerit.vue';
import McGosterge from './McGosterge.vue';
import BaselineKarsilastirmaSatiri from './BaselineKarsilastirmaSatiri.vue';

const props = defineProps<{ kol: Kol; terazi?: TeraziKunyesi | null }>();
const emit = defineEmits<{ sec: [kol: Kol] }>();

// H2: kurumsal + retail(kanit_vitrini) + baseline kolunda künye zorunlu
// (spec §4 tablosu); yari_retail'de opsiyonel.
const kunyeZorunluMu = computed(() =>
  props.kol.lig === 'kurumsal' || props.kol.lig === 'baseline' || props.kol.kanit_vitrini === true
);

const kunyeMetni = computed(() => {
  const k = props.kol.kunye;
  if (!k) return null;
  const parcalar = [k.yazar, k.yil ? String(k.yil) : null, k.baslik].filter(Boolean);
  return parcalar.length ? parcalar.join(' ') : null;
});
</script>
