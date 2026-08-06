// PANO'nun gerçek veri katmanı — arena-durum.json / kampanya-sonuc.json /
// divan.json / xauusd-serisi.json okur. HİÇBİR SAHTE SAYI YOK: veri
// gelmezse alanlar null kalır, uydurulmaz.
import { ref } from 'vue'

export interface Defter {
  net_getiri_yuzde: number | null
  max_dd_yuzde: number | null
  sharpe: number | null
  islem_sayisi: number
  toplam_maliyet_bp: number | null
  deflated_sharpe: number | null
  profit_factor: number | null
  kazanma_orani_yuzde: number | null
  kalicilik: number | null
  equity_serisi: { damga: string; deger: number }[] | null
}

export interface McOzeti {
  yontem: string | null
  replikasyon: number | null
  yuzdelikler: { p05: number; p25: number; p50: number; p75: number; p95: number } | null
  metrik: string | null
  gozlenen: number | null
}

export interface BaselineKarsilastirma {
  delta_sharpe: number | null
  yelpaze_icinde_mi: boolean | null
  belirsizlik_araligi: [number, number] | null
  ayrilabildi_mi: boolean | null
  simetri_sonucu: string | null
  simetri_notu: string | null
}

export interface KampanyaAday {
  id: string
  aile: string
  parametreler: Record<string, number>
  defterler: { surtunmesiz: Defter; gercek_maliyet: Defter }
  walk_forward: unknown[] | null
  mc: McOzeti | null
  baseline_karsilastirma: BaselineKarsilastirma
  komsuluk_korelasyonu: number | null
  kirilgan_mi: boolean | null
  lig: 'retail' | 'yari_retail' | 'kurumsal' | 'baseline' | null
  kaynak_turu: string | null
  sag_kaldi_mi: boolean
  eleme_nedeni: string | null
  n_trials?: number
}

export interface KampanyaSonuc {
  uretilen_toplam: number
  aileler: Record<string, number>
  n_trials: number
  adaylar: KampanyaAday[]
  sag_kalanlar: string[]
  sag_kalan_sayisi: number
  mezarlik_sayisi: number
}

export interface DivanKaydi {
  dosya: string
  tarih: string | null
  baslik: string
  durum_ham: string
  durum: 'acik' | 'karara_baglandi'
  hukum: string | null
}

export type XauusdNokta = [number, number] // [epoch_ms, kapanis]

async function getirJson<T>(yol: string): Promise<T | null> {
  try {
    const yanit = await fetch(yol, { cache: 'no-store' })
    if (!yanit.ok) return null
    return (await yanit.json()) as T
  } catch {
    return null
  }
}

export function useKampanyaSonuc() {
  const veri = ref<KampanyaSonuc | null>(null)
  const yukleniyor = ref(true)
  getirJson<KampanyaSonuc>('/kampanya-sonuc.json').then((v) => {
    veri.value = v
    yukleniyor.value = false
  })
  return { veri, yukleniyor }
}

export function useDivanKayitlari() {
  const veri = ref<DivanKaydi[] | null>(null)
  getirJson<DivanKaydi[]>('/divan.json').then((v) => {
    veri.value = v
  })
  return { veri }
}

export function useXauusdSerisi() {
  const veri = ref<XauusdNokta[] | null>(null)
  getirJson<XauusdNokta[]>('/xauusd-serisi.json').then((v) => {
    veri.value = v
  })
  return { veri }
}
