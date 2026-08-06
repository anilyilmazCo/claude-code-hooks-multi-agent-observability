<template>
  <div class="govde">
    <SolRay :kampanya="kampanya" :divan-acik-sayisi="divanAcikSayisi" />

    <div class="icerik">
      <header class="ust">
        <h1 class="ust__baslik">{{ BOLUM_BASLIK[aktifBolum] }}</h1>
        <LevelAnahtari />
      </header>

      <main class="sutun">
        <p class="arastirma-alani">{{ LEVEL_ARASTIRMA_ALANI[aktifLevel] }}</p>

        <AltinPanosu v-if="aktifBolum === 'altin'" />

        <TaramaPanosu v-else-if="aktifBolum === 'tarama'" :kampanya="kampanya" :yukleniyor="yukleniyor" />

        <AdaylarTablosu
          v-else-if="aktifBolum === 'adaylar'"
          :kampanya="kampanya"
          :yukleniyor="yukleniyor"
        />

        <MonteCarloPanosu v-else-if="aktifBolum === 'monte-carlo'" :kampanya="kampanya" />

        <DivanPanosu v-else-if="aktifBolum === 'divan'" :kayitlar="divanKayitlari" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SolRay from './components/SolRay.vue'
import LevelAnahtari from './components/LevelAnahtari.vue'
import AltinPanosu from './components/AltinPanosu.vue'
import TaramaPanosu from './components/TaramaPanosu.vue'
import AdaylarTablosu from './components/AdaylarTablosu.vue'
import MonteCarloPanosu from './components/MonteCarloPanosu.vue'
import DivanPanosu from './components/DivanPanosu.vue'
import { aktifBolum, aktifLevel, LEVEL_ARASTIRMA_ALANI, type Bolum } from './composables/durum'
import { useKampanyaSonuc, useDivanKayitlari } from './composables/useVeri'

const { veri: kampanya, yukleniyor } = useKampanyaSonuc()
const { veri: divanKayitlari } = useDivanKayitlari()

const divanAcikSayisi = computed(
  () => divanKayitlari.value?.filter((k) => k.durum === 'acik').length ?? null,
)

const BOLUM_BASLIK: Record<Bolum, string> = {
  altin: 'Altın Panosu',
  tarama: 'Tarama Panosu',
  adaylar: 'Parametre Karşılaştırma',
  'monte-carlo': 'Monte Carlo Panosu',
  divan: 'Divan Panosu',
}
</script>

<style scoped>
.govde {
  display: flex;
  min-height: 100vh;
}

.icerik {
  flex: 1;
  min-width: 0;
}

.ust {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: var(--sp-5) var(--sp-7);
  border-bottom: 1px solid var(--cizgi);
}

.ust__baslik {
  font-family: var(--f-display);
  font-weight: 400;
  font-size: 30px;
  letter-spacing: -0.01em;
}

.sutun {
  max-width: 1160px;
  padding: var(--sp-7);
  display: flex;
  flex-direction: column;
  gap: var(--sp-7);
}

.arastirma-alani {
  font-family: var(--f-govde);
  font-size: 14px;
  color: var(--metin-3);
}

@media (max-width: 900px) {
  .govde {
    flex-direction: column;
  }
}
</style>
