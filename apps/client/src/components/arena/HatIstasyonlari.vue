<template>
  <div class="flex items-center gap-2" :class="donduruldu ? 'opacity-50' : ''">
    <template v-for="(ad, i) in SIRA" :key="ad">
      <div class="flex flex-col items-center gap-1 shrink-0">
        <div
          class="w-10 h-10 mobile:w-9 mobile:h-9 rounded-md border flex items-center justify-center km-led"
          :class="istasyonSinifi(bul(ad)?.durum ?? null).kutu"
          :title="bul(ad)?.not ?? undefined"
        >
          <span
            class="w-2 h-2 rounded-full km-led"
            :class="istasyonSinifi(bul(ad)?.durum ?? null).nokta"
            :style="istasyonGlow(bul(ad)?.durum ?? null)"
          ></span>
        </div>
        <span class="text-[9px] mobile:text-[8px] tracking-[0.12em] uppercase text-[var(--metin-soluk)]">{{ ETIKET[ad] }}</span>
      </div>
      <div
        v-if="i < SIRA.length - 1"
        class="flex-1 min-w-[8px] h-0 border-t-2 border-dashed"
        :class="baglayiciAkiyorMu(i) ? 'border-[var(--akis)] km-hat-akis' : 'border-[var(--cizgi)]'"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Istasyon, IstasyonAdi, IstasyonDurum } from '../../composables/useArenaDurum';

const props = defineProps<{
  istasyonlar: Istasyon[] | null;
  donduruldu: boolean | null;
}>();

const SIRA: IstasyonAdi[] = ['veri', 'sinyal', 'karar', 'defter'];
const ETIKET: Record<IstasyonAdi, string> = {
  veri: 'VERİ',
  sinyal: 'SİNYAL',
  karar: 'KARAR',
  defter: 'DEFTER'
};

function bul(ad: IstasyonAdi): Istasyon | undefined {
  return (props.istasyonlar ?? []).find(i => i.ad === ad);
}

function baglayiciAkiyorMu(i: number): boolean {
  if (props.donduruldu) return false;
  const sonraki = bul(SIRA[i + 1]);
  return sonraki?.durum === 'akiyor';
}

// Faz D karar #5: LED canlılığı animasyonSUZ - sabit statik glow, döngüsel
// animasyon bütçesine hiçbir maliyet eklemez (§5.7 kart başına 2 tavanı).
function istasyonGlow(durum: IstasyonDurum | null): Record<string, string> {
  switch (durum) {
    case 'akiyor': return { boxShadow: '0 0 6px 1px var(--akis)' };
    case 'bekliyor': case 'bayat': return { boxShadow: '0 0 6px 1px var(--bekleyen)' };
    case 'hata': return { boxShadow: '0 0 6px 1px var(--durdu)' };
    case 'karantina': return { boxShadow: '0 0 6px 1px var(--hakem)' };
    default: return {};
  }
}

function istasyonSinifi(durum: IstasyonDurum | null): { kutu: string; nokta: string } {
  switch (durum) {
    case 'akiyor':
      return { kutu: 'border-[var(--akis)]', nokta: 'bg-[var(--akis)]' };
    case 'bekliyor':
      return { kutu: 'border-[var(--bekleyen)]', nokta: 'bg-[var(--bekleyen)]' };
    case 'hata':
      return { kutu: 'border-[var(--durdu)]', nokta: 'bg-[var(--durdu)]' };
    // v2: veri akıyor ama son_damga eskimiş - "akıyor" göstermek yalan olur.
    case 'bayat':
      return { kutu: 'border-[var(--bekleyen)]', nokta: 'border border-[var(--bekleyen)]' };
    // v2: hakem denetiminde, sayı yayımlanamaz.
    case 'karantina':
      return { kutu: 'border-double border-2 border-[var(--hakem)]', nokta: 'bg-[var(--hakem)]' };
    default:
      return { kutu: 'border-dashed border-[var(--metin-soluk)]', nokta: 'bg-[var(--metin-soluk)]' };
  }
}
</script>
