<template>
  <div class="flex-1 overflow-y-auto px-5 py-4 mobile:px-3 mobile:py-3 space-y-4 bg-[var(--zemin)]">
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
      <div v-else class="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <KolKarti v-for="(kol, i) in durum.kollar" :key="kol.id ?? i" :kol="kol" />
      </div>
    </section>

    <section>
      <h2 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)] mb-1.5 border-l-2 border-[var(--arena)] pl-2">
        MAKAS TABLOSU
      </h2>
      <MakasTablosu :kollar="durum.kollar" />
    </section>

    <section>
      <h2 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)] mb-1.5 border-l-2 border-[var(--arena)] pl-2">
        REVIEWER KUYRUĞU
      </h2>
      <OneriKuyrugu :reviewer="durum.reviewer" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useArenaDurum } from '../../composables/useArenaDurum';
import BosSekme from '../BosSekme.vue';
import BeslemeSagligi from './BeslemeSagligi.vue';
import RejimInanci from './RejimInanci.vue';
import KolKarti from './KolKarti.vue';
import MakasTablosu from './MakasTablosu.vue';
import OneriKuyrugu from './OneriKuyrugu.vue';

const { durum } = useArenaDurum();
</script>
