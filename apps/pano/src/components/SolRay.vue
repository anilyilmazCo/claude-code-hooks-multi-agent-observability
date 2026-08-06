<template>
  <nav class="ray" aria-label="Bölümler">
    <div class="ray__marka">P A N O</div>

    <ul class="ray__liste">
      <li v-for="ogeler in ogeler" :key="ogeler.id">
        <button
          class="ray__oge"
          :class="{ 'ray__oge--aktif': aktifBolum === ogeler.id }"
          @click="aktifBolum = ogeler.id"
        >
          <span class="ray__etiket">{{ ogeler.etiket }}</span>
          <AyarDamgasi v-if="ogeler.damga" :durum="ogeler.damga" />
          <span v-else-if="ogeler.sayi != null" class="ray__sayi tabular">{{ ogeler.sayi }}</span>
          <span v-else class="ray__nokta">·</span>
        </button>
      </li>
    </ul>

    <div class="ray__alt">
      <span class="ray__ayirici" />
      <p class="ray__paper">
        PAPER MOD · gerçek para yok<br />
        araştırma ve eğitim amaçlıdır
      </p>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AyarDamgasi from './AyarDamgasi.vue'
import { damgaHesapla } from '../composables/damga'
import { aktifBolum, aktifLevel } from '../composables/durum'
import type { KampanyaSonuc } from '../composables/useVeri'

const props = defineProps<{ kampanya: KampanyaSonuc | null; divanAcikSayisi: number | null }>()

// En iyi sağ-kalan adayın damgası, AKTİF LEVEL'e göre (her zaman 999 uydurmaz -
// Retail'de sağ kalan yoksa damga hiç gösterilmez, "·" kalır - ray "üniform
// görünsün diye" anlamsız damga uydurmaz, bkz. tasarım şartnamesi §4).
const enIyiDamga = computed(() => {
  const adaylar = props.kampanya?.adaylar?.filter((a) => a.lig === aktifLevel.value)
  if (!adaylar?.length) return undefined
  const sagKalan = adaylar.find((a) => a.sag_kaldi_mi)
  return sagKalan ? damgaHesapla(sagKalan) : damgaHesapla(adaylar[0])
})

const ogeler = computed(() => [
  { id: 'altin' as const, etiket: 'Altın', damga: undefined, sayi: null },
  { id: 'tarama' as const, etiket: 'Tarama', damga: undefined, sayi: props.kampanya?.uretilen_toplam ?? null },
  { id: 'adaylar' as const, etiket: 'Adaylar', damga: enIyiDamga.value, sayi: null },
  { id: 'monte-carlo' as const, etiket: 'Monte Carlo', damga: enIyiDamga.value, sayi: null },
  { id: 'divan' as const, etiket: 'Divan', damga: undefined, sayi: props.divanAcikSayisi },
])
</script>

<style scoped>
.ray {
  display: flex;
  flex-direction: column;
  width: 240px;
  flex-shrink: 0;
  min-height: 100vh;
  background: var(--zemin);
  border-right: 1px solid var(--cizgi);
  padding: var(--sp-5) 0;
}

.ray__marka {
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.3em;
  color: var(--metin-2);
  padding: 0 var(--sp-5);
  margin-bottom: var(--sp-6);
}

.ray__liste {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  flex: 1;
}

.ray__oge {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px var(--sp-5);
  border-left: 2px solid transparent;
  font-family: var(--f-govde);
  font-weight: 500;
  font-size: 15px;
  color: var(--metin-2);
  text-align: left;
  transition: color var(--gecis-suresi, 200ms) ease;
}

.ray__oge:hover {
  color: var(--metin);
}

.ray__oge--aktif {
  color: var(--metin);
  border-left-color: var(--altin);
  background: rgba(230, 180, 80, 0.05);
}

.ray__sayi {
  font-family: var(--f-dar);
  font-size: 13px;
  color: var(--metin-3);
}

.ray__nokta {
  color: var(--metin-3);
}

.ray__alt {
  margin-top: auto;
  padding: 0 var(--sp-5);
}

.ray__ayirici {
  display: block;
  height: 1px;
  background: var(--cizgi);
  margin-bottom: var(--sp-4);
}

.ray__paper {
  font-family: var(--f-dar);
  font-size: 12.5px;
  line-height: 1.5;
  letter-spacing: 0.02em;
  color: var(--metin-3);
}
</style>
