<template>
  <section class="panel">
    <div v-if="yukleniyor" class="yukleniyor">Kampanya verisi yükleniyor…</div>
    <template v-else-if="kampanya">
      <div class="buyuk-sayilar">
        <div class="sayi-blok">
          <p class="sayi tabular">{{ kampanya.uretilen_toplam }}</p>
          <p class="sayi-etiket">ÜRETİLEN</p>
        </div>
        <div class="sayi-blok">
          <p class="sayi sayi--altin tabular">{{ kampanya.sag_kalan_sayisi }}</p>
          <p class="sayi-etiket">GEÇEN</p>
        </div>
        <div class="sayi-blok">
          <p class="sayi tabular">{{ kampanya.mezarlik_sayisi }}</p>
          <p class="sayi-etiket">ELENDİ</p>
        </div>
      </div>

      <div class="nedenler">
        <p class="nedenler__baslik">NEDEN ELENDİLER</p>
        <div v-for="n in nedenSayilari" :key="n.etiket" class="neden-satir">
          <span class="neden-etiket">{{ n.etiket }}</span>
          <div class="neden-bar-alan">
            <div class="neden-bar" :style="{ width: `${(n.sayi / maksNeden) * 100}%` }" />
          </div>
          <span class="neden-sayi tabular">{{ n.sayi }}</span>
        </div>
      </div>

      <p class="durustluk">
        <SozlukTerimi anahtar="n_trials">{{ kampanya.uretilen_toplam }} adayın hepsi</SozlukTerimi>
        aynı deneme sayısıyla hesaplandı. Denemeler gizlenmedi; hayatta kalan
        tek bir aday bile tüm mezarlığın hesabını taşır.
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SozlukTerimi from './SozlukTerimi.vue'
import { sadeNeden } from '../composables/elemeNedeni'
import type { KampanyaSonuc } from '../composables/useVeri'

const props = defineProps<{ kampanya: KampanyaSonuc | null; yukleniyor: boolean }>()

const nedenSayilari = computed(() => {
  if (!props.kampanya) return []
  const sayac = new Map<string, number>()
  for (const aday of props.kampanya.adaylar) {
    if (aday.sag_kaldi_mi) continue
    const etiket = sadeNeden(aday.eleme_nedeni)
    sayac.set(etiket, (sayac.get(etiket) ?? 0) + 1)
  }
  return [...sayac.entries()].map(([etiket, sayi]) => ({ etiket, sayi })).sort((a, b) => b.sayi - a.sayi)
})

const maksNeden = computed(() => Math.max(1, ...nedenSayilari.value.map((n) => n.sayi)))
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-8);
}

.yukleniyor {
  color: var(--metin-3);
  font-size: 14px;
}

.buyuk-sayilar {
  display: flex;
  gap: var(--sp-8);
}

.sayi-blok {
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}

.sayi {
  font-family: var(--f-display);
  font-weight: 200;
  font-size: 64px;
  line-height: 1;
  letter-spacing: -0.015em;
  color: var(--metin);
}

.sayi--altin {
  color: var(--altin);
}

.sayi-etiket {
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--metin-3);
}

.nedenler__baslik {
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--metin-3);
  margin-bottom: var(--sp-4);
}

.neden-satir {
  display: grid;
  grid-template-columns: 260px 1fr 48px;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-2) 0;
}

.neden-etiket {
  font-family: var(--f-govde);
  font-size: 14px;
  color: var(--metin);
}

.neden-bar-alan {
  height: 8px;
  background: transparent;
}

.neden-bar {
  height: 8px;
  border-radius: var(--r-s);
  background: color-mix(in srgb, var(--elendi) 45%, transparent);
}

.neden-sayi {
  font-family: var(--f-govde);
  font-weight: 500;
  font-size: 14px;
  text-align: right;
  color: var(--metin);
}

.durustluk {
  max-width: 68ch;
  font-family: var(--f-display);
  font-weight: 300;
  font-size: 20px;
  line-height: 1.5;
  border-left: 2px solid var(--altin);
  padding-left: var(--sp-4);
  color: var(--metin);
}
</style>
