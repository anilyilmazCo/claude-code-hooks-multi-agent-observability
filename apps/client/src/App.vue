<template>
  <div class="h-screen flex flex-col bg-[var(--zemin)] text-[var(--metin)]">
    <!-- Üst şerit: her zaman görünür enstrüman kadranı -->
    <UstSerit :events="events" />

    <!-- Sekmeler -->
    <nav class="shrink-0 flex overflow-x-auto border-b border-[var(--cizgi)] bg-[var(--panel)]" role="tablist" aria-label="Panel sekmeleri">
      <button
        v-for="sekme in sekmeler"
        :key="sekme.id"
        role="tab"
        :aria-selected="aktifSekme === sekme.id"
        :tabindex="aktifSekme === sekme.id ? 0 : -1"
        @click="sekmeSec(sekme.id)"
        class="px-4 py-2.5 mobile:px-3 mobile:py-2 text-xs tracking-[0.1em] uppercase font-semibold shrink-0 border-b-2 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--akis)] focus-visible:-outline-offset-2"
        :class="aktifSekme === sekme.id
          ? 'border-[var(--akis)] text-[var(--metin)]'
          : 'border-transparent text-[var(--metin-soluk)] hover:text-[var(--metin)]'"
      >
        {{ sekme.etiket }}
      </button>
    </nav>

    <!-- KOMUTA: mevcut olay akışı ekranı, olduğu gibi -->
    <template v-if="aktifSekme === 'komuta'">
      <!-- Araç çubuğu: bağlantı durumu + olay sayısı + eylemler (eski başlığın yerini alır) -->
      <div class="short:hidden flex items-center justify-between px-3 py-2 mobile:px-2 mobile:py-1.5 gap-2 bg-[var(--theme-bg-primary)] border-b border-[var(--theme-border-primary)]">
        <div class="flex items-center mobile:space-x-1 space-x-1.5">
          <div v-if="isConnected" class="flex items-center mobile:space-x-0.5 space-x-1.5">
            <span class="relative flex mobile:h-2 mobile:w-2 h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full mobile:h-2 mobile:w-2 h-3 w-3 bg-green-500"></span>
            </span>
            <span class="text-sm mobile:text-xs text-[var(--theme-text-primary)] font-semibold mobile:hidden">BAĞLI</span>
          </div>
          <div v-else class="flex items-center mobile:space-x-0.5 space-x-1.5">
            <span class="relative flex mobile:h-2 mobile:w-2 h-3 w-3">
              <span class="relative inline-flex rounded-full mobile:h-2 mobile:w-2 h-3 w-3 bg-red-500"></span>
            </span>
            <span class="text-sm mobile:text-xs text-[var(--theme-text-primary)] font-semibold mobile:hidden">KOPUK</span>
          </div>
          <span class="text-sm mobile:text-xs text-[var(--theme-text-primary)] font-semibold bg-[var(--theme-bg-tertiary)] mobile:px-2 mobile:py-0.5 px-2.5 py-1 rounded-full border border-[var(--theme-border-primary)]">
            {{ events.length }}
          </span>
        </div>

        <div class="flex items-center mobile:space-x-1 space-x-2">
          <button
            @click="handleClearClick"
            class="p-2 mobile:p-1 rounded-lg bg-[var(--theme-bg-tertiary)] hover:bg-[var(--theme-bg-quaternary)] transition-all duration-200 border border-[var(--theme-border-primary)]"
            title="Olayları temizle"
          >
            <span class="text-lg mobile:text-base">🗑️</span>
          </button>
          <button
            @click="showFilters = !showFilters"
            class="p-2 mobile:p-1 rounded-lg bg-[var(--theme-bg-tertiary)] hover:bg-[var(--theme-bg-quaternary)] transition-all duration-200 border border-[var(--theme-border-primary)]"
            :title="showFilters ? 'Filtreleri gizle' : 'Filtreleri göster'"
          >
            <span class="text-lg mobile:text-base">📊</span>
          </button>
          <button
            @click="handleThemeManagerClick"
            class="p-2 mobile:p-1 rounded-lg bg-[var(--theme-bg-tertiary)] hover:bg-[var(--theme-bg-quaternary)] transition-all duration-200 border border-[var(--theme-border-primary)]"
            title="Tema yöneticisini aç"
          >
            <span class="text-lg mobile:text-base">🎨</span>
          </button>
        </div>
      </div>

      <!-- Filtreler -->
      <FilterPanel
        v-if="showFilters"
        class="short:hidden"
        :filters="filters"
        @update:filters="filters = $event"
      />

      <!-- Canlı Nabız Grafiği -->
      <LivePulseChart
        :events="events"
        :filters="filters"
        @update-unique-apps="uniqueAppNames = $event"
        @update-all-apps="allAppNames = $event"
        @update-time-range="currentTimeRange = $event"
      />

      <!-- Ajan Şerit Karşılaştırma (nabız grafiğinin altında, boşken gizli) -->
      <div v-if="selectedAgentLanes.length > 0" class="w-full bg-[var(--theme-bg-secondary)] px-3 py-4 mobile:px-2 mobile:py-2 overflow-hidden">
        <AgentSwimLaneContainer
          :selected-agents="selectedAgentLanes"
          :events="events"
          :time-range="currentTimeRange"
          @update:selected-agents="selectedAgentLanes = $event"
        />
      </div>

      <!-- Zaman Akışı -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <EventTimeline
          :events="events"
          :filters="filters"
          :unique-app-names="uniqueAppNames"
          :all-app-names="allAppNames"
          v-model:stick-to-bottom="stickToBottom"
          @select-agent="toggleAgentLane"
        />
      </div>

      <!-- Alta yapış düğmesi -->
      <StickScrollButton
        class="short:hidden"
        :stick-to-bottom="stickToBottom"
        @toggle="stickToBottom = !stickToBottom"
      />

      <!-- Hata mesajı -->
      <div
        v-if="error"
        class="fixed bottom-4 left-4 mobile:bottom-3 mobile:left-3 mobile:right-3 bg-red-100 border border-red-400 text-red-700 px-3 py-2 mobile:px-2 mobile:py-1.5 rounded mobile:text-xs"
      >
        {{ error }}
      </div>

      <!-- Tema Yöneticisi -->
      <ThemeManager
        :is-open="showThemeManager"
        @close="showThemeManager = false"
      />

      <!-- Bildirimler -->
      <ToastNotification
        v-for="(toast, index) in toasts"
        :key="toast.id"
        :index="index"
        :agent-name="toast.agentName"
        :agent-color="toast.agentColor"
        @dismiss="dismissToast(toast.id)"
      />
    </template>

    <!-- ARENA -->
    <ArenaPaneli v-else-if="aktifSekme === 'arena'" />

    <!-- BANT: v0 boş iskelet -->
    <BosSekme
      v-else-if="aktifSekme === 'bant'"
      mesaj="Şerit ilerlemesi henüz bağlanmadı — L0/L1 durumu `lanes/` dosyalarından okunacak."
    />

    <!-- KÜTÜPHANE: v0 boş iskelet -->
    <BosSekme
      v-else-if="aktifSekme === 'kutuphane'"
      mesaj="Kütüphane henüz bağlanmadı — doğrulanmış prompt/md arşivi (prompt-vault) buradan taranabilir olacak."
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import type { TimeRange } from './types';
import { useWebSocket } from './composables/useWebSocket';
import { useThemes } from './composables/useThemes';
import { useEventColors } from './composables/useEventColors';
import EventTimeline from './components/EventTimeline.vue';
import FilterPanel from './components/FilterPanel.vue';
import StickScrollButton from './components/StickScrollButton.vue';
import LivePulseChart from './components/LivePulseChart.vue';
import ThemeManager from './components/ThemeManager.vue';
import ToastNotification from './components/ToastNotification.vue';
import AgentSwimLaneContainer from './components/AgentSwimLaneContainer.vue';
import UstSerit from './components/UstSerit.vue';
import BosSekme from './components/BosSekme.vue';
import ArenaPaneli from './components/arena/ArenaPaneli.vue';
import { WS_URL } from './config';

// WebSocket connection
const { events, isConnected, error, clearEvents } = useWebSocket(WS_URL);

// Theme management (sets up theme system for the KOMUTA content)
useThemes();

// Event colors
const { getHexColorForApp } = useEventColors();

// Filters
const filters = ref({
  sourceApp: '',
  sessionId: '',
  eventType: ''
});

// UI state
const stickToBottom = ref(true);
const showThemeManager = ref(false);
const showFilters = ref(false);
const uniqueAppNames = ref<string[]>([]); // Apps active in current time window
const allAppNames = ref<string[]>([]); // All apps ever seen in session
const selectedAgentLanes = ref<string[]>([]);
const currentTimeRange = ref<TimeRange>('1m'); // Current time range from LivePulseChart

// --- Sekmeler: durum URL hash'inde tutulur (#komuta), yenilemede kaybolmaz ---
type SekmeId = 'komuta' | 'arena' | 'bant' | 'kutuphane';
const sekmeler: { id: SekmeId; etiket: string }[] = [
  { id: 'komuta', etiket: 'KOMUTA' },
  { id: 'arena', etiket: 'ARENA' },
  { id: 'bant', etiket: 'BANT' },
  { id: 'kutuphane', etiket: 'KÜTÜPHANE' }
];
const GECERLI_SEKMELER = sekmeler.map(s => s.id);

function hashtenSekmeOku(): SekmeId {
  const h = window.location.hash.replace('#', '');
  return (GECERLI_SEKMELER as string[]).includes(h) ? (h as SekmeId) : 'komuta';
}

const aktifSekme = ref<SekmeId>(hashtenSekmeOku());

function sekmeSec(id: SekmeId) {
  aktifSekme.value = id;
  window.location.hash = id;
}

function hashDegisti() {
  aktifSekme.value = hashtenSekmeOku();
}

onMounted(() => {
  if (!window.location.hash) {
    history.replaceState(null, '', `#${aktifSekme.value}`);
  }
  window.addEventListener('hashchange', hashDegisti);
});
onUnmounted(() => {
  window.removeEventListener('hashchange', hashDegisti);
});

// Toast notifications
interface Toast {
  id: number;
  agentName: string;
  agentColor: string;
}
const toasts = ref<Toast[]>([]);
let toastIdCounter = 0;
const seenAgents = new Set<string>();

// Watch for new agents and show toast
watch(uniqueAppNames, (newAppNames) => {
  // Find agents that are new (not in seenAgents set)
  newAppNames.forEach(appName => {
    if (!seenAgents.has(appName)) {
      seenAgents.add(appName);
      // Show toast for new agent
      const toast: Toast = {
        id: toastIdCounter++,
        agentName: appName,
        agentColor: getHexColorForApp(appName)
      };
      toasts.value.push(toast);
    }
  });
}, { deep: true });

const dismissToast = (id: number) => {
  const index = toasts.value.findIndex(t => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

// Handle agent tag clicks for swim lanes
const toggleAgentLane = (agentName: string) => {
  const index = selectedAgentLanes.value.indexOf(agentName);
  if (index >= 0) {
    // Remove from comparison
    selectedAgentLanes.value.splice(index, 1);
  } else {
    // Add to comparison
    selectedAgentLanes.value.push(agentName);
  }
};

// Handle clear button click
const handleClearClick = () => {
  clearEvents();
  selectedAgentLanes.value = [];
};

// Debug handler for theme manager
const handleThemeManagerClick = () => {
  console.log('Theme manager button clicked!');
  showThemeManager.value = true;
};
</script>
