<template>
  <span
    class="terim"
    tabindex="0"
    role="button"
    :aria-describedby="acikMi ? kartId : undefined"
    @mouseenter="ac"
    @mouseleave="kapat"
    @focus="ac"
    @blur="kapat"
    @click="ac"
  >
    <slot />
    <span v-if="acikMi" :id="kartId" class="kart" role="tooltip">
      <span class="kart__baslik">{{ girdi.baslik }}</span>
      <span class="kart__tanim">{{ girdi.tanim }}</span>
      <span class="kart__onem">Neden önemli: {{ girdi.onemi }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { sozluk } from '../composables/sozluk'

// Sözlük katmanı: terim geçen her yerde noktalı altçizgi + hover/focus'ta
// kenar-notu kartı (ok/caret yok, ⓘ ikonu yok - bkz. rapor §5.7).
const props = defineProps<{ anahtar: keyof typeof sozluk }>()

const girdi = computed(() => sozluk[props.anahtar])
const acikMi = ref(false)
const kartId = `sozluk-${props.anahtar}`

function ac() {
  acikMi.value = true
}
function kapat() {
  acikMi.value = false
}
</script>

<style scoped>
.terim {
  position: relative;
  display: inline;
  text-decoration: underline dotted color-mix(in srgb, var(--altin) 35%, transparent);
  text-underline-offset: 3px;
  cursor: help;
}

.kart {
  position: absolute;
  z-index: 40;
  top: calc(100% + 8px);
  left: 0;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
  width: 300px;
  padding: var(--sp-4);
  background: var(--yuzey-2);
  border: 1px solid var(--cizgi);
  border-left: 2px solid var(--altin);
  border-radius: var(--r-m);
  box-shadow: var(--golge-2);
  white-space: normal;
  text-decoration: none;
  cursor: auto;
}

.kart__baslik {
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--altin);
}

.kart__tanim {
  font-family: var(--f-govde);
  font-size: 14px;
  line-height: 1.55;
  color: var(--metin);
}

.kart__onem {
  font-family: var(--f-display);
  font-weight: 300;
  font-size: 14px;
  color: var(--metin-2);
}
</style>
