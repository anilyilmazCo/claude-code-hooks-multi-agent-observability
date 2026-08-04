import { ref, onMounted, onUnmounted } from 'vue';

// arena-durum.json semasi. Tum alanlar nullable: filo henuz baglanmadiysa
// panel "veri yok" gosterir, sahte/varsayilan sayi UYDURMAZ.
// Not: "makas" alani kasitli olarak YOK - Delta UI tarafinda iki defterden
// turetilir, tek dogruluk kaynagi bozulmasin diye.

export type KolDurum = 'calisiyor' | 'bekliyor' | 'hata' | 'donduruldu';
export type IstasyonAdi = 'veri' | 'sinyal' | 'karar' | 'defter';
export type IstasyonDurum = 'akiyor' | 'bekliyor' | 'hata' | 'yok';
export type OneriDurum = 'hakem_bekliyor' | 'dusuruldu' | 'reddedildi' | 'onaylandi';

export interface Istasyon {
  ad: IstasyonAdi | null;
  durum: IstasyonDurum | null;
  son_damga: string | null; // ISO 8601
  not: string | null;
}

export interface Defter {
  net_getiri_yuzde: number | null;
  max_dd_yuzde: number | null;
  sharpe: number | null;
  islem_sayisi: number | null;
  toplam_maliyet_bp: number | null; // yalnizca gercek_maliyet defterinde anlamli
}

export interface Karar {
  damga: string | null;
  ozet: string | null;
  gerekce: string | null;
}

export interface Kol {
  id: string | null;
  ad: string | null;
  kural_ozeti: string | null;
  durum: KolDurum | null;
  donduruldu_mu: boolean | null;
  dondurma_gerekcesi: string | null;
  istasyonlar: Istasyon[] | null;
  son_karar: Karar | null;
  defterler: {
    surtunmesiz: Defter | null;
    gercek_maliyet: Defter | null;
  } | null;
  guncellendi: string | null;
}

export interface RejimInanc {
  etiket: string | null;
  olasilik: number | null;
}

export interface Rejim {
  guncellendi: string | null;
  yontem: string | null;
  dagilim: RejimInanc[] | null;
}

export interface BeslemeSagligi {
  kaynak: string | null;
  sembol: string | null;
  mod: 'ws' | 'polling' | null;
  bagli_mi: boolean | null;
  son_tick: string | null; // ISO 8601
  gecikme_ms: number | null;
  kusur_olumcul: number | null; // CLAUDE.md Kural 7: yazma iptal sinifi
  kusur_bilgi: number | null; // borsa gercekligi sinifi
}

export interface Oneri {
  id: string | null;
  damga: string | null;
  kol_id: string | null;
  parametre: string | null;
  mevcut_deger: string | number | null;
  onerilen_deger: string | number | null;
  gerekce: string | null;
  guven: number | null; // 0-1
  durum: OneriDurum | null;
  dusme_nedeni: string | null;
  model: string | null;
}

export interface ReviewerDurumu {
  acik_mi: boolean | null; // v0'da false
  guven_esigi: number | null;
  kuyruk: Oneri[] | null;
}

export interface ArenaDurum {
  guncellendi: string | null;
  sezon: { ad: string | null; baslangic: string | null; bitis: string | null } | null;
  besleme: BeslemeSagligi | null;
  rejim: Rejim | null;
  kollar: Kol[] | null;
  reviewer: ReviewerDurumu | null;
}

const BOS_DURUM: ArenaDurum = {
  guncellendi: null,
  sezon: null,
  besleme: null,
  rejim: null,
  kollar: null,
  reviewer: null
};

const CEKME_ARALIGI_MS = 10_000;

export function useArenaDurum() {
  const durum = ref<ArenaDurum>({ ...BOS_DURUM });
  let zamanlayici: number | null = null;

  const cek = async () => {
    try {
      const yanit = await fetch('/arena-durum.json', { cache: 'no-store' });
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
