<template>
  <!-- Panel ilk açıldığında ~900ms kalibrasyon sekansı (ARENA-SPEC-v2.md §5.8).
       Süs değil: ilk gösterilen şey sayılar değil, "hangi teraziden geçtiği". -->
  <div
    v-if="gorunur"
    class="absolute inset-0 z-30 flex flex-col items-start justify-center gap-2 bg-[var(--zemin)] px-4 cursor-pointer"
    @click="bitir"
  >
    <p class="km-mono text-xs text-[var(--metin)] km-boot-satir">ARENA · PAPER MOD · GERÇEK PARA YOK</p>
    <div v-if="asama >= 1" class="flex flex-col gap-1">
      <p v-for="(k, i) in kalemler" :key="k.ad" class="km-mono text-[11px] km-boot-satir" :style="{ animationDelay: (i * 110) + 'ms' }">
        <span :class="k.tamam ? 'text-[var(--akis)]' : 'text-[var(--metin-soluk)]'">{{ k.ad }} {{ k.tamam ? '✓' : '—' }}</span>
      </p>
    </div>
    <p v-if="asama >= 2" class="km-mono text-[11px] font-bold km-boot-satir" style="color: var(--arena)">
      TERAZİ HAZIR{{ terazi?.harness_surumu ? ` · ${terazi.harness_surumu}` : '' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import type { TeraziKunyesi } from '../../composables/useArenaDurum';

const props = defineProps<{ terazi?: TeraziKunyesi | null }>();
const emit = defineEmits<{ tamam: [] }>();

const ANAHTAR = 'arena-boot-tamam';
const gorunur = ref(false);
const asama = ref(0);

const kalemler = computed(() => [
  { ad: 'maliyet modeli', tamam: props.terazi?.maliyet_dahil_mi === true },
  { ad: 'walk-forward', tamam: (props.terazi?.walk_forward_pencere_sayisi ?? 0) > 0 },
  { ad: `deflated sharpe (N=${props.terazi?.n_trials ?? '?'})`, tamam: props.terazi?.n_trials != null },
  { ad: 'monte carlo', tamam: props.terazi?.mc_yontem != null }
]);

function bitir() {
  gorunur.value = false;
  sessionStorage.setItem(ANAHTAR, '1');
  emit('tamam');
}

onMounted(() => {
  const azaltilmisHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (azaltilmisHareket || sessionStorage.getItem(ANAHTAR) === '1') {
    sessionStorage.setItem(ANAHTAR, '1');
    emit('tamam');
    return;
  }
  gorunur.value = true;
  window.setTimeout(() => { asama.value = 1; }, 200);
  window.setTimeout(() => { asama.value = 2; }, 900);
  window.setTimeout(bitir, 1400);
});
</script>
