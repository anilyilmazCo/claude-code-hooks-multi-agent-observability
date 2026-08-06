// Ayar damgası durumu türetici — tek yer, AyarDamgasi.vue + tablo/kart bileşenleri paylaşır.
export type DamgaDurum = '999' | '916' | '585' | 'bos'

export function damgaHesapla(aday: {
  sag_kaldi_mi?: boolean | null
  eleme_nedeni?: string | null
  baseline_karsilastirma?: { ayrilabildi_mi?: boolean | null } | null
  defterler?: { gercek_maliyet?: { deflated_sharpe?: number | null } } | null
}): DamgaDurum {
  if (aday.sag_kaldi_mi === true) return '999'
  if (aday.eleme_nedeni) return '916'
  const dsr = aday.defterler?.gercek_maliyet?.deflated_sharpe
  const ayrilabildi = aday.baseline_karsilastirma?.ayrilabildi_mi
  if (dsr == null || ayrilabildi == null) return '585'
  return '916'
}
