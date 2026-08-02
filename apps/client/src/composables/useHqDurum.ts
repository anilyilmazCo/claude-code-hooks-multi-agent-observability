import { ref, onMounted, onUnmounted } from 'vue';

// hq-durum.json semasi. Her alan null olabilir; dosya uretilmemis/bozuksa
// da panel calismaya devam eder (fail-open) - kartlar "veri yok" gosterir.
export interface HqDurum {
  guncellendi: string | null;
  bd: { bugun_kapanan: number | null; acik: number | null } | null;
  commit: { hash: string | null; baslik: string | null } | null;
  deney1: { asama: string | null; aciklama: string | null } | null;
  self_healing: { silahli: boolean | null } | null;
}

const BOS_DURUM: HqDurum = {
  guncellendi: null,
  bd: null,
  commit: null,
  deney1: null,
  self_healing: null
};

const CEKME_ARALIGI_MS = 30_000;

export function useHqDurum() {
  const durum = ref<HqDurum>({ ...BOS_DURUM });
  let zamanlayici: number | null = null;

  const cek = async () => {
    try {
      const yanit = await fetch('/hq-durum.json', { cache: 'no-store' });
      if (!yanit.ok) return; // fail-open: eski deger korunur
      const veri = await yanit.json();
      durum.value = { ...BOS_DURUM, ...veri };
    } catch {
      // Dosya yok / agdan dusuk / bozuk JSON - sessizce yut, akisi durdurma.
    }
  };

  onMounted(() => {
    cek();
    zamanlayici = window.setInterval(cek, CEKME_ARALIGI_MS);
  });

  onUnmounted(() => {
    if (zamanlayici !== null) clearInterval(zamanlayici);
  });

  return { durum };
}
