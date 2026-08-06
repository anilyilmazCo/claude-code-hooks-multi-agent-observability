<template>
  <span class="damga" :class="`damga--${durum}`" :title="`Kanıt Ayarı: ${etiket}`">
    <span v-if="durum !== 'bos'" class="damga__rakam">{{ rakam }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DamgaDurum } from '../composables/damga'

// İmza öğesi: kuyumcu ayar damgası. Stratejiyi DEĞİL, kanıtın gücünü
// derecelendirir (bkz. rapor, Opus tasarım turu §3). 4 durum, kod
// karşılığı `code/arena/kampanya/motor.py::sag_kaldi_mi` ile birebir.
const props = defineProps<{ durum: DamgaDurum }>()

const rakam = computed(() => (props.durum === 'bos' ? '' : props.durum))
const etiket = computed(() =>
  ({
    '999': 'dört kapının dördü de geçildi',
    '916': 'ölçüldü, en az bir kapıda düştü',
    '585': 'ölçülemedi',
    bos: 'henüz denenmedi',
  })[props.durum],
)
</script>

<style scoped>
.damga {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 20px;
  padding: 0 6px;
  border-radius: var(--r-s);
  border: 1px solid var(--cizgi);
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 10.5px;
  letter-spacing: 0.1em;
  line-height: 1;
}

.damga--999 {
  border-color: var(--altin);
  color: var(--altin);
  background: rgba(230, 180, 80, 0.07);
}

.damga--916 {
  border-color: color-mix(in srgb, var(--altin) 45%, transparent);
  color: var(--metin-2);
}

.damga--585 {
  border-color: var(--cizgi);
  color: var(--metin-3);
}

.damga--bos {
  border-style: dashed;
  border-color: var(--cizgi);
  min-width: 24px;
}
</style>
