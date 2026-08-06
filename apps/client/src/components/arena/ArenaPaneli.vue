<template>
  <div class="relative flex-1 flex flex-col overflow-hidden bg-[var(--zemin)]">
    <!-- Boot sekansı verinin üstüne biner, veriyi BEKLEMEZ (spec §5.8) -
         içerik altta zaten render olur, sekans yalnız görsel olarak örter. -->
    <BootSekansi :terazi="durum.terazi" />
    <GeciciKanitBandi :aktif-varlik="aktifVarlik" />
    <div class="flex-1 overflow-y-auto px-3 py-3 mobile:px-2 mobile:py-2 space-y-3">
    <!-- Kunye + hukuk satiri -->
    <div>
      <div class="flex items-baseline justify-between gap-2 flex-wrap">
        <h1 class="km-mono text-sm font-bold tracking-[0.1em] uppercase text-[var(--metin)] border-l-2 border-[var(--arena)] pl-2">
          ARENA
        </h1>
        <span class="text-xs text-[var(--metin-soluk)] km-mono">
          {{ durum.sezon?.ad ?? 'sezon tanımlanmadı' }}
          <template v-if="durum.kollar?.length"> · {{ durum.kollar.length }} kol</template>
        </span>
      </div>
      <p class="text-[11px] text-[var(--metin-soluk)] mt-1.5 leading-relaxed">
        Arena paper modda çalışır, gerçek para yoktur. Buradaki sayılar kural setlerinin karşılaştırmalı ölçümüdür;
        yatırım tavsiyesi, hedef fiyat veya alım-satım yönlendirmesi değildir. Eğitim ve araştırma amaçlıdır.
      </p>
    </div>

    <section>
      <h2 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)] mb-1.5 border-l-2 border-[var(--arena)] pl-2">
        BESLEME SAĞLIĞI
      </h2>
      <BeslemeSagligi :besleme="durum.besleme" />
    </section>

    <section>
      <h2 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)] mb-1.5 border-l-2 border-[var(--arena)] pl-2">
        REJİM İNANÇ DURUMU
      </h2>
      <RejimInanci :rejim="durum.rejim" />
    </section>

    <section>
      <h2 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)] mb-1.5 border-l-2 border-[var(--arena)] pl-2">
        FİLO
      </h2>
      <BosSekme
        v-if="!durum.kollar || durum.kollar.length === 0"
        mesaj="Arena filosu henüz kurulmadı — kollar bağlandığında her biri burada kendi üretim hattıyla görünecek."
      />
      <div v-else class="grid gap-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        <KolKarti
          v-for="(kol, i) in durum.kollar" :key="kol.id ?? i"
          :kol="kol" :terazi="durum.terazi"
          @sec="secilenKol = $event"
        />
      </div>
    </section>

    <section>
      <h2 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)] mb-1.5 border-l-2 border-[var(--arena)] pl-2">
        KAMPANYA TABLOSU
      </h2>
      <p v-if="durum.terazi?.kampanya" class="text-[10px] text-[var(--metin-soluk)] mb-1.5 pl-2">
        kampanya motoru: {{ durum.terazi.kampanya.uretilen }} üretildi ·
        {{ durum.terazi.kampanya.sag_kalan }} sağ kaldı ·
        mezarlık: {{ durum.terazi.kampanya.mezarlik }}
      </p>
      <MakasTablosu :kollar="tumKollar" :terazi="durum.terazi" @sec="secilenKol = $event" />
    </section>

    <section>
      <h2 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)] mb-1.5 border-l-2 border-[var(--arena)] pl-2">
        REVIEWER KUYRUĞU
      </h2>
      <OneriKuyrugu :reviewer="durum.reviewer" />
    </section>
    </div>

    <KolDetay :kol="secilenKol" @kapat="secilenKol = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useArenaDurum } from '../../composables/useArenaDurum';
import type { Kol } from '../../composables/useArenaDurum';
import BosSekme from '../BosSekme.vue';
import BeslemeSagligi from './BeslemeSagligi.vue';
import RejimInanci from './RejimInanci.vue';
import KolKarti from './KolKarti.vue';
import MakasTablosu from './MakasTablosu.vue';
import OneriKuyrugu from './OneriKuyrugu.vue';
import BootSekansi from './BootSekansi.vue';
import GeciciKanitBandi from './GeciciKanitBandi.vue';
import KolDetay from './KolDetay.vue';

const { durum } = useArenaDurum();

const secilenKol = ref<Kol | null>(null);

const aktifVarlik = computed(() =>
  durum.value.varliklar?.find(v => v.id === durum.value.aktif_varlik_id) ?? null
);

// Kampanya tablosu filo + baseline rafını birlikte gösterir (spec §3: baseline
// lig-üstü bir raftır ama karşılaştırma için aynı terazide okunur).
const tumKollar = computed(() => [...(durum.value.kollar ?? []), ...(durum.value.baseline_rafi ?? [])]);
</script>
