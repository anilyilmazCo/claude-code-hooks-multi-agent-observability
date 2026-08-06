// Sözlük katmanı — her teknik terim için Türkçe etiket + 1 cümle açıklama +
// "neden önemli". SozlukTerimi.vue bu sözlükten okuyup kenar-notu kartı gösterir.

export interface SozlukGirdisi {
  baslik: string
  tanim: string
  onemi: string
}

export const sozluk: Record<string, SozlukGirdisi> = {
  dsr: {
    baslik: 'Deflated Sharpe',
    tanim: 'Bir stratejinin getirisini, kaç farklı deneme yapıldığını hesaba katarak düzelten ölçü.',
    onemi: '100 denemeden en iyisi zaten iyi görünür — bu ölçü o yanılgıyı düzeltir.',
  },
  sharpe: {
    baslik: 'Sharpe Oranı',
    tanim: 'Getiriyi, o getiriyi elde etmek için katlanılan dalgalanmaya (riske) bölen klasik ölçü.',
    onemi: 'Yüksek getiri tek başına yeterli değil — ne kadar risk alındığı da sayılmalı.',
  },
  pf: {
    baslik: 'Profit Factor',
    tanim: 'Kazanılan toplam paranın, kaybedilen toplam paraya oranı.',
    onemi: "1'in üstü kazandırdı demek, altı kaybettirdi demek — ama tek başına örneklem büyüklüğünü göstermez.",
  },
  n_trials: {
    baslik: 'Deneme Sayısı (n_trials)',
    tanim: 'Bu sonuca ulaşmak için kaç farklı parametre kombinasyonunun denendiği.',
    onemi: 'Çok deneme arasından seçilen "en iyi" şansla da çıkabilir — bu sayı gizlenmez, DSR hesabına girer.',
  },
  walk_forward: {
    baslik: 'Walk-Forward',
    tanim: 'Stratejinin geçmişin farklı dilimlerinde tek seferlik değil, tekrar tekrar sınanması.',
    onemi: 'Tek bir dönemde iyi çıkmak tesadüf olabilir — birçok dönemde tutarlılık daha güçlü kanıttır.',
  },
  maxdd: {
    baslik: 'Maks Düşüş (Maximum Drawdown)',
    tanim: 'Stratejinin zirve değerinden en fazla ne kadar gerilediği.',
    onemi: 'Ortalama getiri iyi görünse de, arada büyük bir düşüş yaşanmış olabilir — bu ölçü onu gösterir.',
  },
  kazanma_orani: {
    baslik: 'Kazanma Oranı',
    tanim: 'Açılan işlemlerin yüzde kaçının kârla kapandığı.',
    onemi: 'Yüksek kazanma oranı tek başına iyi strateji demek değil — kayıpların büyüklüğü de önemli.',
  },
  simetri: {
    baslik: 'Simetri Denetimi',
    tanim: "Stratejinin alım ve satım tarafının, ölçüm yönteminin kendisi tarafından kayırılmadığının kontrolü.",
    onemi: 'Ölçüm yöntemi taraf tutarsa, strateji gerçekte iyi olmasa da iyi görünebilir.',
  },
  mc_yelpaze: {
    baslik: 'Monte Carlo Şans Bandı',
    tanim: 'Binlerce rastgele deneme sonucunda ortaya çıkabilecek getiri aralığı.',
    onemi: 'Gerçek sonuç bu bandın dışındaysa, sonucun salt şansla açıklanma ihtimali düşüktür.',
  },
  ayar_damgasi: {
    baslik: 'Kanıt Ayarı',
    tanim: 'Bir stratejinin dört denetim kapısından kaçını geçtiğini gösteren damga (999/916/585/boş).',
    onemi: 'Damga stratejinin iyiliğini değil, kanıtın ne kadar sağlam ölçüldüğünü gösterir.',
  },
  lig: {
    baslik: 'Lig (Seviye)',
    tanim: 'Bir kuralın nereden geldiğine göre sınıflandırılması: popüler pratik, teknik gösterge veya akademik kaynak.',
    onemi: 'Kaynağı daha güçlü kurallar, daha sıkı bir kanıt standardına (künye zorunluluğu) tabidir.',
  },
  kirilgan: {
    baslik: 'Kırılgan',
    tanim: 'Parametreleri bir adım değiştirince sonucun büyük ölçüde değişmesi.',
    onemi: 'Sağlam bir strateji, komşu ayarlarda da benzer sonuç vermelidir — çökme aşırı-uyumun işaretidir.',
  },
}

export type SozlukAnahtari = keyof typeof sozluk
