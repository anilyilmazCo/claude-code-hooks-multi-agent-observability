<template>
  <div
    class="km-serit shrink-0 flex items-stretch divide-x divide-[var(--cizgi)] overflow-x-auto overflow-y-hidden border-b border-[var(--cizgi)] bg-[var(--panel)]"
    role="region"
    aria-label="Durum şeridi"
  >
    <!-- Aktif oturum -->
    <div class="flex flex-col justify-center gap-0.5 px-4 mobile:px-3 py-2.5 mobile:py-2 shrink-0 min-w-[9rem] mobile:min-w-[7.5rem]">
      <span class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">aktif oturum</span>
      <span class="km-mono text-base mobile:text-sm font-semibold truncate" :class="aktifOturum ? 'text-[var(--metin)]' : 'text-[var(--metin-soluk)]'">
        {{ aktifOturum ?? 'veri yok' }}
      </span>
    </div>

    <!-- Son olay -->
    <div class="flex flex-col justify-center gap-0.5 px-4 mobile:px-3 py-2.5 mobile:py-2 shrink-0 min-w-[9rem] mobile:min-w-[7.5rem]">
      <span class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">son olay</span>
      <span class="km-mono text-base mobile:text-sm font-semibold truncate" :class="sonOlay ? 'text-[var(--metin)]' : 'text-[var(--metin-soluk)]'">
        {{ sonOlay ?? 'veri yok' }}
      </span>
    </div>

    <!-- Bugün kapanan (bd) -->
    <div class="flex flex-col justify-center gap-0.5 px-4 mobile:px-3 py-2.5 mobile:py-2 shrink-0 min-w-[8rem] mobile:min-w-[6.5rem]">
      <span class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">bugün kapanan</span>
      <span class="km-mono text-base mobile:text-sm font-semibold truncate" :class="durum.bd ? 'text-[var(--metin)]' : 'text-[var(--metin-soluk)]'">
        {{ durum.bd?.bugun_kapanan ?? 'veri yok' }}
      </span>
      <span v-if="durum.bd?.acik != null" class="text-[10px] text-[var(--metin-soluk)] km-mono">{{ durum.bd.acik }} açık</span>
    </div>

    <!-- Son commit -->
    <div class="flex flex-col justify-center gap-0.5 px-4 mobile:px-3 py-2.5 mobile:py-2 shrink-0 min-w-[9rem] mobile:min-w-[7.5rem]" :title="durum.commit?.baslik ?? undefined">
      <span class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">son commit</span>
      <span class="km-mono text-base mobile:text-sm font-semibold truncate" :class="durum.commit?.hash ? 'text-[var(--metin)]' : 'text-[var(--metin-soluk)]'">
        {{ durum.commit?.hash ?? 'veri yok' }}
      </span>
      <span v-if="durum.commit?.baslik" class="text-[10px] text-[var(--metin-soluk)] truncate max-w-[10rem]">{{ durum.commit.baslik }}</span>
    </div>

    <!-- Deney-1 aşaması -->
    <div class="flex flex-col justify-center gap-0.5 px-4 mobile:px-3 py-2.5 mobile:py-2 shrink-0 min-w-[9rem] mobile:min-w-[7.5rem]" :title="durum.deney1?.aciklama ?? undefined">
      <span class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">deney-1 aşaması</span>
      <span class="km-mono text-base mobile:text-sm font-semibold truncate" :class="durum.deney1?.asama ? 'text-[var(--metin)]' : 'text-[var(--metin-soluk)]'">
        {{ durum.deney1?.asama ?? 'veri yok' }}
      </span>
      <span v-if="durum.deney1?.aciklama" class="text-[10px] text-[var(--metin-soluk)] truncate max-w-[10rem]">{{ durum.deney1.aciklama }}</span>
    </div>

    <!-- Ortadaki bosluk: self-healing rozetini ve damgayı sağa yaslar -->
    <div class="hidden lg:block flex-1 min-w-0 border-none"></div>

    <!-- İmza öge: self-healing rozeti -->
    <SelfHealingRozeti :durum="durum.self_healing?.silahli ?? null" />

    <!-- Güncellendi damgası -->
    <div class="flex items-center px-4 mobile:px-3 shrink-0">
      <span
        class="km-mono text-[11px] mobile:text-[10px] text-[var(--metin-soluk)] whitespace-nowrap transition-opacity duration-300"
        :class="bayatMi ? 'opacity-40' : 'opacity-90'"
        :title="bayatMi ? 'Veri 10 dakikadan eski' : 'Veri güncel'"
      >
        güncellendi {{ guncellendiSaat ?? '—' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { HookEvent } from '../types';
import { useHqDurum } from '../composables/useHqDurum';
import SelfHealingRozeti from './SelfHealingRozeti.vue';

const props = defineProps<{
  events: HookEvent[];
}>();

const { durum } = useHqDurum();

// Canli sayan saat: "son olay" icin "N sn once" ve bayatlik kontrolu bunun uzerinden gunceller.
const simdi = ref(Date.now());
let tikTimer: number | null = null;
onMounted(() => {
  tikTimer = window.setInterval(() => {
    simdi.value = Date.now();
  }, 1000);
});
onUnmounted(() => {
  if (tikTimer !== null) clearInterval(tikTimer);
});

const sonOlayNesnesi = computed<HookEvent | undefined>(() => props.events[props.events.length - 1]);

const aktifOturum = computed(() => {
  const olay = sonOlayNesnesi.value;
  if (!olay) return null;
  return `${olay.session_id.slice(0, 8)} · ${olay.source_app}`;
});

function gecenSure(ts: number): string {
  const farkSn = Math.max(0, Math.floor((simdi.value - ts) / 1000));
  if (farkSn < 60) return `${farkSn} sn önce`;
  const farkDk = Math.floor(farkSn / 60);
  if (farkDk < 60) return `${farkDk} dk önce`;
  return `${Math.floor(farkDk / 60)} sa önce`;
}

const sonOlay = computed(() => {
  const olay = sonOlayNesnesi.value;
  if (!olay || !olay.timestamp) return null;
  return `${olay.hook_event_type} · ${gecenSure(olay.timestamp)}`;
});

const guncellendiSaat = computed(() => {
  if (!durum.value.guncellendi) return null;
  const tarih = new Date(durum.value.guncellendi);
  if (isNaN(tarih.getTime())) return null;
  return tarih.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
});

const BAYATLIK_ESIGI_MS = 10 * 60 * 1000;
const bayatMi = computed(() => {
  if (!durum.value.guncellendi) return true;
  const tarih = new Date(durum.value.guncellendi).getTime();
  if (isNaN(tarih)) return true;
  return simdi.value - tarih > BAYATLIK_ESIGI_MS;
});
</script>
