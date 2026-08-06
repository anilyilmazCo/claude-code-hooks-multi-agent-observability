<template>
  <div class="anahtar" role="tablist" aria-label="Seviye seçimi">
    <button
      v-for="lvl in seviyeler"
      :key="lvl"
      role="tab"
      :aria-selected="aktifLevel === lvl"
      class="anahtar__segment"
      :class="{ 'anahtar__segment--aktif': aktifLevel === lvl }"
      @click="aktifLevel = lvl"
    >
      {{ LEVEL_ETIKET[lvl] }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { aktifLevel, LEVEL_ETIKET, type Level } from '../composables/durum'

const seviyeler: Level[] = ['retail', 'yari_retail', 'kurumsal']
</script>

<style scoped>
.anahtar {
  display: flex;
  gap: var(--sp-5);
}

.anahtar__segment {
  padding: var(--sp-2) 0;
  border-bottom: 2px solid transparent;
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.12em;
  color: var(--metin-3);
}

.anahtar__segment:hover {
  color: var(--metin-2);
}

.anahtar__segment--aktif {
  color: var(--metin);
  border-bottom-color: var(--altin);
}
</style>
