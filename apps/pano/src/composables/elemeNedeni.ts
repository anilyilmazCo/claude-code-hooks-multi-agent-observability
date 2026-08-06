// code/arena/kampanya/motor.py::sag_kaldi_mi'nin ham eleme_nedeni dizesini
// sade Türkçeye çevirir (bkz. tasarım şartnamesi §5.3 çeviri tablosu).
export function sadeNeden(hamNeden: string | null): string {
  if (!hamNeden) return 'Bilinmiyor'
  if (hamNeden.startsWith('DSR')) return 'Şansla açıklanabilir kadar zayıf'
  if (hamNeden.startsWith('simetri_sonucu=uygulanamaz')) return 'Ölçüm bu ayarda yapısal olarak koşulamadı'
  if (hamNeden.startsWith('simetri_sonucu=yetersiz')) return 'İşlem sayısı ölçüm için yetersiz'
  if (hamNeden.startsWith('simetri_sonucu')) return 'Al ve sat tarafı dengesiz'
  if (hamNeden.startsWith('MC yelpaze')) return 'Rastgele şans bandından ayrışamadı'
  if (hamNeden.startsWith('KIRILGAN')) return 'Komşu ayarlarda çöküyor'
  return hamNeden
}
