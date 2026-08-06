<template>
  <div
    ref="kartEl"
    class="relative overflow-hidden flex flex-col gap-2 rounded-lg border border-[var(--cizgi)] bg-[var(--panel)] km-derinlik pl-3.5 pr-2.5 py-2.5 mobile:pl-2 mobile:pr-2 mobile:pb-2 mobile:pt-3 cursor-pointer hover:border-[var(--metin-soluk)] transition-colors"
    :class="{ 'km-parilti': parilti, 'km-durgun': !gorunur }"
    @click="emit('sec', kol)"
  >
    <!-- Faz D.2: dar sistem şeridi - masaüstünde SOL kenar (asimetrik
         kompozisyonun "dar kolonu"), mobilde ÜST şerit (grid tek kolona
         düşünce sol kenar anlamını yitirir). -->
    <div
      v-if="kol.lig"
      class="absolute pointer-events-none left-0 top-0 bottom-0 w-[4px] rounded-l-lg mobile:w-auto mobile:right-0 mobile:bottom-auto mobile:h-[3px] mobile:rounded-l-none mobile:rounded-t-lg"
      :style="ligSeritStili ?? undefined"
    ></div>

    <!-- Asimetrik gövde: geniş merkez kolonu (başlık→pipeline→grafik→karar) +
         dar dikey imza-sayı kolonu sağda. Mobilde tek kolona çöker, imza
         kutucukları yatay çifte döner (Faz D.1 davranışı korunur). -->
    <div class="grid grid-cols-[1fr_96px] gap-3 mobile:grid-cols-1 mobile:gap-2">
      <div class="flex flex-col gap-1.5 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <span class="km-mono text-sm font-semibold text-[var(--metin)] truncate">{{ kol.ad ?? 'isimsiz kol' }}</span>
          <div class="flex items-center gap-1.5 shrink-0">
            <LigRozeti :lig="kol.lig" />
            <ArenaRozeti :durum="kol.durum" />
          </div>
        </div>

        <p class="text-xs text-[var(--metin-soluk)] truncate" :title="kol.kural_ozeti ?? undefined">
          {{ kol.kural_ozeti ?? 'kural özeti yok' }}
        </p>

        <p v-if="kol.kunye" class="text-[11px] text-[var(--metin-soluk)] truncate" :title="kunyeMetni ?? undefined">
          künye: {{ kunyeMetni ?? 'eksik' }}
        </p>
        <p v-else-if="kunyeZorunluMu" class="text-[11px] text-[var(--durdu)]">
          KÜNYE EKSİK — ÖLÇÜM GİZLENDİ
        </p>

        <p v-if="kol.donduruldu_mu" class="text-[11px] text-[var(--hakem)]">
          {{ kol.dondurma_gerekcesi ?? 'Bu kol dondurulmuş; parametreleri değiştirilemez.' }}
        </p>

        <HatIstasyonlari :istasyonlar="kol.istasyonlar" :donduruldu="kol.donduruldu_mu" />

        <MiniIsinDemeti :kol="kol" />

        <div class="text-xs">
          <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)] block mb-0.5">son karar</span>
          <p v-if="kol.son_karar?.ozet" class="text-[var(--metin)] line-clamp-2" :title="kol.son_karar.gerekce ?? undefined">
            {{ kol.son_karar.ozet }}
          </p>
          <p v-else class="text-[var(--metin-soluk)]">Bu kol henüz karar üretmedi.</p>
        </div>
      </div>

      <!-- İmza sayılar (Faz D karar #3, D.2'de kutucuk): Δ makas --arena
           (kimlik rengi, DEĞERE göre değişmez) ile enerjik; DSR yargı
           taşıdığı için sabit --metin-parlak, eşik icat edilmez. -->
      <div class="flex flex-col gap-2 h-full mobile:flex-row mobile:h-auto">
        <div class="rounded border border-[var(--cizgi)] km-katman km-derinlik px-2 py-1.5 flex-1 flex flex-col justify-center min-w-0">
          <span class="block text-[8px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">Δ makas</span>
          <span class="km-mono text-[16px] font-bold leading-tight whitespace-nowrap" style="font-variant-numeric: tabular-nums; color: var(--arena); text-shadow: 0 0 14px rgba(138,226,52,0.4)">{{ makasMetni }}</span>
        </div>
        <div class="rounded border border-[var(--cizgi)] km-katman km-derinlik px-2 py-1.5 flex-1 flex flex-col justify-center min-w-0">
          <span class="block text-[8px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">DSR</span>
          <span v-if="dsrDeger !== null && kolNTrials != null" class="km-mono text-[16px] font-bold leading-tight" style="font-variant-numeric: tabular-nums; color: var(--metin-parlak)">{{ dsrDeger.toFixed(2) }}</span>
          <span v-else class="text-[10px] text-[var(--metin-soluk)] leading-tight">n_trials YOK</span>
        </div>
      </div>
    </div>

    <DsrRozeti :deger="dsrDeger" :n-trials="kolNTrials" />
    <WfSerit :pencereler="kol.walk_forward" />
    <McGosterge :mc="kol.mc" />

    <div class="rounded-md border border-[var(--cizgi)] km-katman km-derinlik p-2.5 mobile:p-2">
      <CiftDefterSeridi v-if="kol.defterler" :defterler="kol.defterler" />
      <p v-else class="text-[11px] text-[var(--metin-soluk)]">Bu kol için defter açılmadı.</p>
      <BaselineKarsilastirmaSatiri :bk="kol.baseline_karsilastirma" />
    </div>

    <!-- Bulgu bloğu kanit_vitrini'ye KİLİTLİ DEĞİL: mekanizma notları (§4.2
         gibi) kanıt-vitrini olmayan kollarda da görünebilir; kanit_vitrini
         yalnız zorunluluğu belirler (spec §4 tablosu), varlığı değil. -->
    <div
      v-if="kol.bulgu"
      class="rounded border border-[var(--hakem)] bg-[rgba(167,139,250,0.08)] px-2 py-1.5"
    >
      <span class="km-mono text-[10px] font-bold text-[var(--hakem)]">{{ kol.bulgu.karar_sikki ?? 'BULGU BEKLENİYOR' }}</span>
      <p v-if="kol.bulgu.dayaniklilik" class="text-[10px] text-[var(--metin-soluk)] mt-0.5">
        {{ kol.bulgu.dayaniklilik }}{{ kol.bulgu.rapor_referansi ? ` · rapor: ${kol.bulgu.rapor_referansi}` : '' }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { Kol, Lig, TeraziKunyesi } from '../../composables/useArenaDurum';
import ArenaRozeti from './ArenaRozeti.vue';
import HatIstasyonlari from './HatIstasyonlari.vue';
import MiniIsinDemeti from './MiniIsinDemeti.vue';
import CiftDefterSeridi from './CiftDefterSeridi.vue';
import LigRozeti from './LigRozeti.vue';
import DsrRozeti from './DsrRozeti.vue';
import WfSerit from './WfSerit.vue';
import McGosterge from './McGosterge.vue';
import BaselineKarsilastirmaSatiri from './BaselineKarsilastirmaSatiri.vue';

const props = defineProps<{ kol: Kol; terazi?: TeraziKunyesi | null }>();
const emit = defineEmits<{ sec: [kol: Kol] }>();

const dsrDeger = computed(() => props.kol.defterler?.gercek_maliyet?.deflated_sharpe ?? null);
// Kol-başına okunur (dhr-2 sonrası): kampanya kolları terazi'den FARKLI bir
// n_trials taşır; terazi.n_trials yalnız eski/eksik veride yedek.
const kolNTrials = computed(() => props.kol.n_trials ?? props.terazi?.n_trials ?? null);

const makasMetni = computed(() => {
  const g = props.kol.defterler?.gercek_maliyet?.net_getiri_yuzde;
  const s = props.kol.defterler?.surtunmesiz?.net_getiri_yuzde;
  if (g == null || s == null) return 'veri yok';
  const makas = s - g;
  const isaret = makas > 0 ? '+' : '';
  return `${isaret}${makas.toFixed(2)}pp`;
});

// Lig kimlik rengi kart üst şeridinde - şiddet SABİT, kol.durum'a göre
// değişmez (Faz D karar #4: değişseydi lig rengi durum taşımaya başlardı).
const LIG_RENK_ADI: Record<Lig, string> = { retail: 'retail', yari_retail: 'yari', kurumsal: 'kurumsal', baseline: 'baseline' };
const ligSeritStili = computed(() => {
  if (!props.kol.lig) return null;
  const ad = LIG_RENK_ADI[props.kol.lig];
  return {
    background: `var(--lig-${ad})`,
    boxShadow: `0 0 10px 0 var(--lig-${ad}-parilti), 0 1px 6px -2px var(--lig-${ad}-parilti)`
  };
});

// Faz D karar #7/#9: ekran dışı kartta animasyon duraklatılır (bütçe), veri
// gerçekten güncellenince (kol.guncellendi damgası değişince) TEK SEFERLİK
// kenar parıltısı - sahte/döngüsel animasyon değil.
const kartEl = ref<HTMLElement | null>(null);
const gorunur = ref(true);
const parilti = ref(false);
let gozlemci: IntersectionObserver | null = null;
let parlamaZamanlayici: ReturnType<typeof setTimeout> | null = null;

onMounted(() => {
  if (kartEl.value && 'IntersectionObserver' in window) {
    gozlemci = new IntersectionObserver(
      (girisler) => { for (const g of girisler) gorunur.value = g.isIntersecting; },
      { rootMargin: '200px' }
    );
    gozlemci.observe(kartEl.value);
  }
});
onUnmounted(() => {
  gozlemci?.disconnect();
  if (parlamaZamanlayici) clearTimeout(parlamaZamanlayici);
});

watch(() => props.kol.guncellendi, (yeni, eski) => {
  if (!eski || !yeni || yeni === eski || !gorunur.value) return;
  parilti.value = false;
  requestAnimationFrame(() => { parilti.value = true; });
  if (parlamaZamanlayici) clearTimeout(parlamaZamanlayici);
  parlamaZamanlayici = setTimeout(() => { parilti.value = false; }, 640);
});

// H2: kurumsal + retail(kanit_vitrini) + baseline kolunda künye zorunlu
// (spec §4 tablosu); yari_retail'de opsiyonel.
const kunyeZorunluMu = computed(() =>
  props.kol.lig === 'kurumsal' || props.kol.lig === 'baseline' || props.kol.kanit_vitrini === true
);

const kunyeMetni = computed(() => {
  const k = props.kol.kunye;
  if (!k) return null;
  const parcalar = [k.yazar, k.yil ? String(k.yil) : null, k.baslik].filter(Boolean);
  return parcalar.length ? parcalar.join(' ') : null;
});
</script>
