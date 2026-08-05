import { ref, onMounted, onUnmounted } from 'vue';

// arena-durum.json semasi. Tum alanlar nullable: filo henuz baglanmadiysa
// panel "veri yok" gosterir, sahte/varsayilan sayi UYDURMAZ.
// Not: "makas" alani kasitli olarak YOK - Delta UI tarafinda iki defterden
// turetilir, tek dogruluk kaynagi bozulmasin diye.

export type KolDurum = 'calisiyor' | 'bekliyor' | 'hata' | 'donduruldu';
export type IstasyonAdi = 'veri' | 'sinyal' | 'karar' | 'defter';
// v2: 'bayat' (veri akıyor ama son_damga eskimiş) + 'karantina' (hakem
// denetiminde, sayı yayımlanamaz) eklendi - HatIstasyonlari.vue sözlüğünün
// devamı (ARENA-SPEC-v2.md §5.5).
export type IstasyonDurum = 'akiyor' | 'bekliyor' | 'hata' | 'yok' | 'bayat' | 'karantina';
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
  // --- v2 ---
  deflated_sharpe: number | null;
  profit_factor: number | null;
  kalicilik: number | null; // WF pencerelerinin kaçında işaret korundu (0-1)
  equity_serisi: EquityNoktasi[] | null; // §5.4 equity eğrisi paneli için
}

export interface Karar {
  damga: string | null;
  ozet: string | null;
  gerekce: string | null;
}

export interface Kol {
  // --- v0: aynen korunur ---
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

  // --- v2 ---
  lig: Lig | null;
  kaynak_turu: KaynakTuru | null;
  kunye: Kunye | null;
  kanit_vitrini: boolean | null;
  bulgu: Bulgu | null;
  walk_forward: WalkForwardPencere[] | null;
  mc: MonteCarloOzeti | null;
  baseline_karsilastirma: BaselineKarsilastirma | null;
  varlik_id: string | null;
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

// --- v2 (ARENA-SPEC-v2.md, Divan oturum-03 H1-H6 ile karara bağlandı) ---
// Tüm v2 alanları nullable: v0 üreticisi (code/arena/calistir.py) bunları
// henüz yazmıyor, panel "veri yok" gösterir - uydurma yok (Kural 8).

export type Lig = 'retail' | 'yari_retail' | 'kurumsal' | 'baseline';
export type KaynakTuru = 'populer_pratik' | 'teknik_gosterge' | 'akademik_makale' | 'referans_olcut';

export interface Kunye {
  yazar: string | null;
  yil: number | null;
  baslik: string | null;
  doi: string | null;
  replikasyon_sapmasi: string | null; // makaleden bilerek ayrıldığımız noktalar
}

// H5: yalnız GA/sıfır-dışlama - esdegerlik_kanitlandi v2.0'da hiç üretilmez
// (TOST yok), tip olarak tanımlı kalır.
export type SonucSinifi = 'olculmedi' | 'devam' | 'ayrilamadi' | 'esdegerlik_kanitlandi' | 'fark_olculdu';

export interface Bulgu {
  sonuc_sinifi: SonucSinifi | null;
  karar_sikki: string | null;
  dayaniklilik: string | null;
  geri_cekilen_iddialar: string[] | null;
  rapor_referansi: string | null;
  on_kayit_dondu_mu: boolean | null;
}

export interface EsikKaydi {
  ad: string | null;
  deger: number | null;
  baglama_bolgesi: string | null; // Kural 12: kapalı-form ifade, null ise eşik renk üretemez
  kaynak: string | null;
}

export interface TeraziKunyesi {
  harness_surumu: string | null;
  maliyet_modeli: string | null;
  maliyet_dahil_mi: boolean | null;
  walk_forward_pencere_sayisi: number | null;
  n_trials: number | null;
  mc_yontem: 'bootstrap' | 'permutasyon' | 'blok_bootstrap' | null;
  mc_replikasyon: number | null;
  rejim_etiketi: string | null;
  esikler: EsikKaydi[] | null;
  kosum_damgasi: string | null;
  artefakt_sha256: string | null;
}

export interface WalkForwardPencere {
  sira: number | null;
  baslangic: string | null;
  bitis: string | null;
  egitim_mi: boolean | null;
  sharpe: number | null;
  net_getiri_yuzde: number | null;
  islem_sayisi: number | null;
}

export interface MonteCarloOzeti {
  yontem: 'bootstrap' | 'permutasyon' | 'blok_bootstrap' | null;
  replikasyon: number | null;
  yuzdelikler: { p05: number; p25: number; p50: number; p75: number; p95: number } | null;
  gozlenen: number | null;
  metrik: string | null;
}

// H4: simetri denetimi - fark>5pp VE oran>1.5x -> basarisiz, tek biri -> sari
// 'yetersiz': H4 eki (Faz B.6) - her iki tarafta >=30 işlem birikmeden
// hüküm verilmez (gri, sayı yayımlanmaz, BAŞARISIZ denmez).
export type SimetriSonucu = 'simetrik' | 'sari' | 'basarisiz' | 'hesaplanamadi' | 'yetersiz';

export interface BaselineKarsilastirma {
  baseline_id: string | null;
  delta_sharpe: number | null; // kol - baseline, GERÇEK-MALİYET defterinden
  delta_maxdd: number | null;
  yelpaze_icinde_mi: boolean | null;
  belirsizlik_araligi: [number, number] | null;
  ayrilabildi_mi: boolean | null;
  simetri_sonucu: SimetriSonucu | null;
  simetri_notu: string | null; // SARI/HESAPLANAMADI iken zorunlu bulgu notu
}

export interface EquityNoktasi {
  damga: string | null; // ISO 8601
  deger: number | null; // kümülatif getiri, 1.0 = başlangıç
}

export interface Varlik {
  id: string | null;
  sembol: string | null;
  sinif: 'kripto' | 'forex' | 'emtia' | 'hisse' | 'endeks' | null;
  borsa: string | null;
  seanslar: { ad: string | null; baslangic_utc: string | null; bitis_utc: string | null }[] | null;
  fiyat_ondalik: number | null;
  veri_statusu: 'gecici_kanit' | 'onaylanmis' | null;
  veri_notu: string | null;
}

export interface ArenaDurum {
  // --- v0: aynen korunur ---
  guncellendi: string | null;
  sezon: { ad: string | null; baslangic: string | null; bitis: string | null } | null;
  besleme: BeslemeSagligi | null;
  rejim: Rejim | null;
  kollar: Kol[] | null;
  reviewer: ReviewerDurumu | null;

  // --- v2 ---
  varliklar: Varlik[] | null;
  aktif_varlik_id: string | null;
  baseline_rafi: Kol[] | null;
  terazi: TeraziKunyesi | null;
}

const BOS_DURUM: ArenaDurum = {
  guncellendi: null,
  sezon: null,
  besleme: null,
  rejim: null,
  kollar: null,
  reviewer: null,
  varliklar: null,
  aktif_varlik_id: null,
  baseline_rafi: null,
  terazi: null
};

const CEKME_ARALIGI_MS = 10_000;

const BOS_KOL_V2_ALANLARI = {
  lig: null, kaynak_turu: null, kunye: null, kanit_vitrini: null, bulgu: null,
  walk_forward: null, mc: null, baseline_karsilastirma: null, varlik_id: null
};
const BOS_DEFTER_V2_ALANLARI = { deflated_sharpe: null, profit_factor: null, kalicilik: null, equity_serisi: null };

// v0 üreticisi (code/arena/calistir.py) v2 alanlarını hiç YAZMIYOR - JSON'da
// anahtar bile yok, `undefined` gelir. Tip sözleşmesi `| null` vaat ediyor;
// burada tek noktada normalize edilir ki her bileşen ayrı ayrı `?? null`
// yazmak zorunda kalmasın.
function kolNormalizeEt(kol: Partial<Kol>): Kol {
  return {
    ...BOS_KOL_V2_ALANLARI,
    ...kol,
    defterler: kol.defterler
      ? {
          surtunmesiz: kol.defterler.surtunmesiz ? { ...BOS_DEFTER_V2_ALANLARI, ...kol.defterler.surtunmesiz } : null,
          gercek_maliyet: kol.defterler.gercek_maliyet ? { ...BOS_DEFTER_V2_ALANLARI, ...kol.defterler.gercek_maliyet } : null
        }
      : null
  } as Kol;
}

export function useArenaDurum() {
  const durum = ref<ArenaDurum>({ ...BOS_DURUM });
  let zamanlayici: number | null = null;

  const cek = async () => {
    try {
      const yanit = await fetch('/arena-durum.json', { cache: 'no-store' });
      if (!yanit.ok) return; // fail-open: eski deger korunur
      const veri = await yanit.json();
      const birlesik: ArenaDurum = { ...BOS_DURUM, ...veri };
      birlesik.kollar = birlesik.kollar?.map(kolNormalizeEt) ?? null;
      birlesik.baseline_rafi = birlesik.baseline_rafi?.map(kolNormalizeEt) ?? null;
      durum.value = birlesik;
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
