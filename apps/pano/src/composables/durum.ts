// PANO-geneli paylaşılan durum (aktif bölüm + aktif level) - Pinia/vuex
// gerekmeyecek kadar küçük, tek modül-seviyeli ref singleton'ı yeterli.
import { ref } from 'vue'

export type Bolum = 'altin' | 'tarama' | 'adaylar' | 'monte-carlo' | 'divan'
export type Level = 'retail' | 'yari_retail' | 'kurumsal'

export const aktifBolum = ref<Bolum>('altin')
export const aktifLevel = ref<Level>('yari_retail')

export const LEVEL_ETIKET: Record<Level, string> = {
  retail: 'RETAIL',
  yari_retail: 'YARI-RETAIL',
  kurumsal: 'KURUMSAL',
}

export const LEVEL_ARASTIRMA_ALANI: Record<Level, string> = {
  retail: 'Bu bantta ICT/SMC kavramları (Order Block, Fair Value Gap, likidite avı) araştırılacak — henüz dört kapıyı geçen bir kural yok.',
  yari_retail: 'Klasik teknik göstergeler (hareketli ortalama kesişimi, RSI, Donchian kanalı) — popüler pratikten türeyen kurallar.',
  kurumsal: 'Akademik/CTA kaynaklı sistemler (Donchian, trend-takip literatürü) — künye zorunlu, kaynak izlenebilir olmalı.',
}

// Retail (L1) bantında henüz dört kapıyı geçen bir kural yok - dürüst boş
// (bkz. tasarım şartnamesi §5.6). Plan satırları TARİH değil KOŞUL taşır.
export const BOS_GEREKCE: Record<Level, string> = {
  retail: 'Retail ligi için araştırma henüz kanıt üretmedi.',
  yari_retail: 'Bu ligde henüz sağ kalan bir aday yok.',
  kurumsal: 'Bu ligde henüz sağ kalan bir aday yok.',
}
export const BOS_PLANLAR: Record<Level, { ad: string; kosul: string }[]> = {
  retail: [
    { ad: 'FVG (Fair Value Gap) zaman-dilimi genellemesi', kosul: 'üç öldürücü itiraz kapanınca (bead d4a)' },
    { ad: 'Order Block / likidite avı kural seti', kosul: 'FVG turu tamamlanınca' },
  ],
  yari_retail: [],
  kurumsal: [],
}
