<template>
  <!-- n_trials olmadan render EDİLEMEZ (§2.2 pazarlık dışı): deger varsa ama
       n_trials yoksa da "DSR — n_trials YOK" gösterilir, sayı gizlenir. -->
  <span
    v-if="deger !== null && nTrials !== null"
    class="km-mono text-[11px] font-bold px-1.5 py-0.5 rounded border border-[var(--metin-soluk)] text-[var(--metin)]"
  >DSR {{ deger.toFixed(2) }} · N={{ nTrials }}</span>
  <span
    v-else
    class="km-mono text-[11px] font-bold px-1.5 py-0.5 rounded border border-dashed border-[var(--metin-soluk)] text-[var(--metin-soluk)]"
  >DSR — n_trials YOK</span>
</template>

<script setup lang="ts">
defineProps<{ deger: number | null; nTrials: number | null }>();

// Rozet kasıtlı olarak NÖTR renkte: bir "yeterli DSR" eşiği icat etmek
// (ör. >0.5 yeşil) §2.3'ün yasakladığı gömülü eşiktir - bağlama bölgesi
// hesaplanmış bir EsikKaydi olmadan panel bu sayıyı renklendiremez.
</script>
