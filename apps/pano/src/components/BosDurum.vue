<template>
  <div class="bos">
    <AyarDamgasi durum="bos" />
    <p class="bos__baslik">HENÜZ YOK</p>
    <p class="bos__gerekce">{{ gerekce }}</p>

    <div v-if="planlar?.length" class="bos__plan">
      <p class="bos__plan-baslik">PLANLANAN</p>
      <div v-for="p in planlar" :key="p.ad" class="bos__plan-satir">
        <span>{{ p.ad }}</span>
        <span class="bos__plan-kosul">{{ p.kosul }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AyarDamgasi from './AyarDamgasi.vue'

// Boş durum tipografiktir - kesikli çerçeve/ikon/"çok yakında" YOK (bkz.
// rapor §5.6). Plan satırları TARİH değil KOŞUL taşır - tarih uydurmak da
// bir tür boş doluluktur.
defineProps<{
  gerekce: string
  planlar?: { ad: string; kosul: string }[]
}>()
</script>

<style scoped>
.bos {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--sp-4);
  padding: var(--sp-7) 0;
  max-width: 520px;
}

.bos__baslik {
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--metin-3);
}

.bos__gerekce {
  font-family: var(--f-display);
  font-weight: 300;
  font-size: 20px;
  line-height: 1.5;
  color: var(--metin);
}

.bos__plan {
  width: 100%;
  margin-top: var(--sp-4);
}

.bos__plan-baslik {
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--metin-3);
  margin-bottom: var(--sp-2);
}

.bos__plan-satir {
  display: flex;
  justify-content: space-between;
  padding: var(--sp-3) 0;
  border-top: 1px solid var(--cizgi);
  font-family: var(--f-govde);
  font-size: 14px;
  color: var(--metin);
}

.bos__plan-kosul {
  color: var(--metin-3);
  font-family: var(--f-dar);
  font-size: 12.5px;
}
</style>
