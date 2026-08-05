# ARENA-SPEC-v2 — Kule Gözlem Paneli, ARENA Sekmesi Mimari Tasarımı

> **Statü:** tasarım dokümanı (spec). Kod değildir, implementasyon değildir.
> **Kapsam:** `apps/client/src/components/arena/*` + `composables/useArenaDurum.ts` v2 hedefi.
> **Yasal çerçeve:** ARENA paper modda çalışır, **gerçek para yoktur**. Buradaki hiçbir alan,
> rozet, sütun veya görsel öğe alım-satım yönlendirmesi, hedef fiyat veya kişiye özel öneri
> taşımaz ve taşıyamaz. Panel, kural setlerinin **karşılaştırmalı ölçümünü** gösteren bir
> araştırma ve eğitim aracıdır (CLAUDE.md Kural 2).

---

## Giriş — v0 nedir, v2 neyi değiştirir

**v0 (bugün çalışan):** `arena-durum.json` → `useArenaDurum()` → tek düzlemde bir kol listesi;
durum, dört istasyonlu hat, çift defter, makas. Bir kolun "nereden geldiği" veri modelinde yoktur
ve ölçüm tarafında yalnız `net_getiri_yuzde / max_dd_yuzde / sharpe / islem_sayisi` yayınlanır —
walk-forward, deflated Sharpe ve Monte Carlo panelde **hiç görünmez**.

**v2'nin tek cümlelik iddiası:** ARENA'nın değeri "hangi kol kazandı" değil,
**"üç farklı kaynaktan gelen kural ailesi aynı teraziden geçirildiğinde ne oluyor"**dur.

v2'de değişen dört şey:

| # | v0 | v2 |
|---|---|---|
| 1 | Kol = düz liste | Kol = **lig**e ait (retail / yarı-retail / kurumsal) + lig-üstü **baseline rafı** |
| 2 | Defter = 4 sayı | Defter + **terazi künyesi**: walk-forward şeridi, deflated Sharpe (`n_trials` görünür), MC yelpazesi, rejim etiketi |
| 3 | Karşılaştırma = makas tablosu | **Lig karşılaştırma görünümü** birinci sınıf ekran; her kolda zorunlu "baseline'a karşı" göstergesi |
| 4 | Kaynak bilgisi yok | **Künye** alanı: akademik atıf / deney raporu referansı / kural tanımı |

**v2 sözleşmeyi kırmaz, genişletir.** v0'daki tüm alanlar aynı adla ve aynı `null`-anlamıyla
yerinde kalır; yeni alanlar eklenir ve hepsi nullable'dır. v0'ın imza kuralı da korunur:
**panel sahte sayı uydurmaz** — veri yoksa "veri yok" yazar.

**Veri statüsü uyarısı (Bölüm 7'de detaylı):** panelin bugün beslendiği BTC verisi
**geçici kanıt verisidir** (proof-of-concept). Hedef varlık kararı Vites B'de, onay
beklemektedir. Bu spec varlık-bağımsız yazılmıştır.

---

## 1. MİMARİ = ÜÇ KAVRAM LİGİ

Lig, bir **sekme** değildir. Arayüzde üç ayrı ekran yoktur; lig **veri modeli seviyesinde bir
sınıflandırmadır** ve panelin her yerinde (kart, tablo, karşılaştırma, filtre) aynı alandan
okunur. Bir kol tek bir lige aittir ve ligi **kendi kaynağı belirler**, performansı değil.

### 1.1 Atama kuralı — lig kaynağa göre türetilir, elle seçilmez

Lig alanı doğrudan yazılmaz; kolun **kaynak türünden** türetilir. Böylece "bu kol iyi çalıştı,
kurumsal ligine alalım" gibi bir kayma yapısal olarak imkânsız olur.

| `kaynak_turu` | Anlamı | → `lig` |
|---|---|---|
| `populer_pratik` | Kaynağı perakende eğitim içeriği / topluluk pratiği; formel tanımı yok, biz yazdık | `retail` |
| `teknik_gosterge` | Kaynağı kamuya açık, kapalı-formda tanımlı bir gösterge/istatistik | `yari_retail` |
| `akademik_makale` | Kaynağı yayımlanmış bir makale; kol o makalenin replikasyonu | `kurumsal` |
| `referans_olcut` | Kural değil **ölçüt**; karşılaştırma tabanı olmak için var | `baseline` (Bölüm 3) |

Sınır durumu kuralı: bir kural **hem** popüler pratikte **hem** literatürde varsa (ör. hareketli
ortalama kesişimi), kolu hangi tanımın **birebir** uygulandığı belirler. Makalenin tanımı
uygulanıyorsa `akademik_makale`; popüler videodaki gevşek tarif uygulanıyorsa `populer_pratik`.
İki tanım aynı kolda karıştırılamaz — karıştırıldığı anda kol **iki kola bölünür**.

### 1.2 RETAIL LİGİ — "kanıt vitrini"

**Ne var:** ICT/SMC ailesi (FVG — Fair Value Gap, displacement, market structure), arz-talep
bölgesi kolları, popüler formasyon kuralları.

**Neden var:** bu kolların ARENA'da bulunma amacı bir üstünlük iddiası **değildir**; amaç
şeffaflıktır — *bu popüler kurallar gerçekten, ön-kayıtlı ve maliyetli bir hatta test edildi ve
sonuç şu çıktı.* Bu lig panelin **kanıt vitrinidir**. Deney-1 zincirinin
(`b8y` → `yv8` → `q7m`) sonucu ligin ilk içeriğidir ve **olduğu gibi** sunulur:

- Karar **ŞIK 3 — BELİRSİZ**: güven aralığı genişliği MDE'yi aştığı için etki ne gösterilebildi
  ne dışlanabildi. Bu **"eşdeğerlik kanıtlandı" değildir**; "bu ölçüm gücüyle baseline'dan
  ayrılamadı"dır. Panel bu iki şıkkı **asla** aynı rozetle göstermez.
- Nokta tahmini **geri çekilmiştir** (hakem turu: çapa tekilleştirme ablasyonu 4,77 pp salınım
  üretti, raporlanan etkiden büyük). Panelde bu kolun kontrast sayısı **gösterilmez**;
  gösterilen şey **karar şıkkı** ve onun dayanıklılığıdır.
- Deney-2 ön-kayıtı **dondurulmamıştır**; o aileden hiçbir kol `sonuc_sinifi: 'olculmedi'`
  dışında bir değerle yayınlanamaz.

**Veri modeli karşılığı:** `kanit_vitrini: true` olan kolda `bulgu` bloğu **zorunludur**
(Bölüm 4). Bu bloğu olmayan retail kolu panelde ölçüm sayısı gösteremez.

### 1.3 YARI-RETAİL LİGİ

**Ne var:** volume profile (POC / VAH / VAL), VWAP ve sapma bantları, MA/EMA aileleri,
seçilmiş osilatörler (RSI, MACD, Stochastic). v0'daki basit gösterge kolları doğal olarak buraya
oturur. Dikkat: Donchian'ın kendisi kurumsal ligdedir (§1.4).

**Neden ayrı lig:** tanımları kapalı-form, tekrar üretilebilir ve tartışmasızdır; ama **hangi
eşiğin neden seçildiğinin** akademik bir gerekçesi yoktur. Retail ile fark tanımın netliği,
kurumsal ile fark gerekçenin kaynağıdır.

### 1.4 KURUMSAL LİG — künye zorunlu

**Ne var:** makale replikasyon kolları. Her kolun bir **künyesi** olmak zorundadır: yazar, yıl,
makale adı, (varsa) DOI, ve **replikasyon sapması** — makaleden bilerek ayrıldığımız noktalar.

Başlangıç ailesi: **momentum** (Jegadeesh & Titman 1993; zaman-serisi varyantı
Moskowitz–Ooi–Pedersen 2012) · **kısa vadeli reversal** (Lehmann 1990 / Lo–MacKinlay 1990) ·
**CTA / trend takip** · **faktör-optimizasyon** (risk paritesi, minimum varyans).

**Donchian kanal kırılımı buraya taşınır**, retail'e değil: kaynağı yayımlanmış CTA
literatürüdür, popüler pratik değil. v0'daki Donchian kolunun `kaynak_turu` alanı
`akademik_makale` yapılır ve künyesi doldurulur; künye doldurulamıyorsa kol `yari_retail`'e
**düşer** (yükselmez).

**Kritik sınır:** kurumsal lig "daha iyi" lig değildir. Makale replikasyonu bir **kalite iddiası
değil, izlenebilirlik iddiasıdır**: sonuç kötü çıkarsa da künyesiyle birlikte durur. Panel bu
ligi diğerlerinden görsel olarak "üstün" gösteremez (Bölüm 5, renk kuralı).

### 1.5 Tip taslağı

```ts
export type Lig = 'retail' | 'yari_retail' | 'kurumsal' | 'baseline';
export type KaynakTuru = 'populer_pratik' | 'teknik_gosterge' | 'akademik_makale' | 'referans_olcut';

export interface Kunye {
  kaynak_turu: KaynakTuru | null;
  baslik: string | null;          // makale adı / video-kural adı / ölçüt adı
  yazar: string | null;           // kurumsal: zorunlu
  yil: number | null;             // kurumsal: zorunlu
  tanimlayici: string | null;     // DOI / URL / deney raporu yolu
  replikasyon_sapmasi: string | null; // makaleden bilerek ayrıldığımız noktalar
}
```

---

## 2. TEK TERAZİ İLKESİ — bu spec'in imzası

> **Üç lig aynı harness'ten geçer. Hiçbir ligin kendine özel veya gevşetilmiş test standardı
> yoktur. Bir kol teraziden geçmediyse panelde sayı göstermez — "ÖLÇÜLMEDİ" gösterir.**

Retail kolunu "zaten çalışmaz" diye baştan eleyen panel de, kurumsal kolu "makale, demek ki
doğru" diye kayıran panel de aynı hatayı yapar: **sonucu ölçmeden bilmek.**

### 2.1 Zorunlu ortak metrik seti

Her kol, ligi ne olursa olsun, aşağıdakilerin **hepsini** üretmiş olmak zorundadır:

| Bileşen | Kaynak | Panelde görünürlük |
|---|---|---|
| Maliyet modeli (komisyon + kayma) | `code/l0_maliyet/` (`mlt` şeridi) | model sürümü + toplam maliyet bp |
| Walk-forward pencereleri | `code/l0_maliyet/yururken_ileri.py` | pencere pencere mini-şerit (Bölüm 4) |
| Sharpe + maxDD | `metrikler.py` | kampanya tablosu sütunları |
| **Deflated Sharpe + `n_trials`** | `metrikler.deflated_sharpe_orani` | rozet — **`n_trials` her zaman görünür** |
| Monte Carlo yelpazesi | bootstrap / permütasyon aralığı | dağılım aralığı + sağlamlık göstergesi |
| Rejim etiketi | rejim inanç dağılımı | kol başına rejim kırılımı |

### 2.2 `n_trials` görünürlük kuralı — pazarlık dışı

`deflated_sharpe_orani(getiriler, n_trials, ...)` fonksiyonu `n_trials`'ı **zorunlu pozisyonel
parametre** olarak alır; **varsayılanı yoktur**. Gerekçe kodun kendi docstring'inde yazılıdır:
*"Sayılamayan deneme sayısıyla hesaplanan deflated Sharpe bir güvence değil sustur."*

Bu kısıt panelde **birebir** karşılık bulur:

1. Deflated Sharpe rozeti `n_trials` değeri **olmadan render edilemez**. Değer yoksa rozet
   `DSR — n_trials YOK` biçiminde, ölçüm rengiyle değil **eksik-veri kesikli çerçevesiyle**
   çizilir ve sayı gösterilmez.
2. `n_trials` rozetin **içinde**dir, tooltip'inde değil. Hover gerektiren bilgi, mobilde ve
   ekran görüntüsünde kaybolur; kaybolabilen bir güvence güvence değildir.
3. `n_trials` **daraltılamaz, yuvarlanamaz, "~" ile gösterilemez.** Tam tamsayı yazılır.
4. Kampanya tablosunda DSR sütunu varsa, yanında ayrı bir `N` sütunu **zorunludur**.

### 2.3 Eşik kaydı — CLAUDE.md Kural 12'nin panele çıkmış hâli

Panelde bir sayıyı renklendiren, rozet veren veya sıralamayı değiştiren **her eşik** veri
modelinde açıkça kayıtlıdır ve **bağlama bölgesi** ile birlikte taşınır. Eşiği panele gömmek
(`if (sharpe > 1) yesil`) yasaktır: gömülü eşik, hangi parametre bölgesinde fiilen bağladığı
hesaplanamayan eşiktir.

```ts
export interface EsikKaydi {
  ad: string | null;              // 'dsr_yeterli', 'mc_saglam', ...
  deger: number | null;
  baglama_bolgesi: string | null; // "yalnız n_eff < 349 iken bağlar" gibi kapalı-form ifade
  kaynak: string | null;          // ön-kayıt/rapor referansı
}
```

Bağlama bölgesi `null` olan eşik panelde **renk üretemez** — nötr çizilir. Böylece "eşik var
sanılırken atıl" durumu görsel olarak da imkânsızlaşır.

### 2.4 Terazi künyesi

```ts
export interface TeraziKunyesi {
  harness_surumu: string | null;      // tüm ligler için AYNI olmalı
  maliyet_modeli: string | null;
  maliyet_dahil_mi: boolean | null;   // false ise kol "ÖLÇÜLMEDİ" sayılır
  walk_forward_pencere_sayisi: number | null;
  n_trials: number | null;            // deflated Sharpe girdisi
  mc_yontem: 'bootstrap' | 'permutasyon' | 'blok_bootstrap' | null;
  mc_replikasyon: number | null;
  rejim_etiketi: string | null;
  esikler: EsikKaydi[] | null;
  kosum_damgasi: string | null;
  artefakt_sha256: string | null;     // Kural 8: artefakt repodaki modülle üretildi
}
```

**Uyum denetimi panelde yapılır ve görünür:** iki kolun `harness_surumu` farklıysa, o iki kol
karşılaştırma görünümünde **yan yana çizilmez**; aralarına "farklı terazi — karşılaştırılamaz"
şeridi girer. Tek terazi ilkesi bir slogan değil, render koşuludur.

### 2.5 Lig karşılaştırma görünümü — BİRİNCİL SINIF ÖZELLİK

Bu ekran ARENA'nın ana değer önerisidir; yan özellik değildir ve ARENA açıldığında **ilk
görünen bölümdür** (filo kartlarından önce).

**Sorduğu soru:** "ICT ailesi ile akademik momentum ailesi, aynı maliyet modeli ve aynı
walk-forward bölünmesi altında, aynı baseline'a göre nerede duruyor?"

**Veri modeli:**

```ts
export interface LigOzeti {
  lig: Lig | null;
  kol_sayisi: number | null;
  olculen_kol_sayisi: number | null;       // terazi künyesi TAM olanlar
  medyan_sharpe: number | null;            // ortalama DEĞİL - aykırı kol tek başına ligi taşımasın
  medyan_dsr: number | null;
  n_trials_toplam: number | null;          // lig genelinde denenen kombinasyon sayısı
  medyan_baseline_delta_sharpe: number | null;
  dagilim_ceyrekler: [number, number, number] | null; // Q1, medyan, Q3
  rejim_kirilimi: { etiket: string; medyan_sharpe: number }[] | null;
}

export interface LigKarsilastirma {
  harness_surumu: string | null;
  ligler: LigOzeti[] | null;
  baseline_referansi: string | null;       // hangi baseline'a göre
  uyari: string | null;                    // ör. "kurumsal ligde 2 kol ölçülmedi"
}
```

**Arayüz iskeleti (üç katman, yukarıdan aşağı):**

1. **Terazi şeridi** — tek satır: harness sürümü · maliyet modeli · WF pencere sayısı ·
   `Σ n_trials` · MC yöntemi. Ekranın sözleşmesidir: aşağıdaki her şey **bu** teraziden geçti.
   Uyuşmazlık varsa şerit `--durdu` rengine döner, alt katmanlar gri çizilir.
2. **Lig dağılım şeridi** — dört yatay şerit (retail / yarı-retail / kurumsal / baseline), her
   birinde Q1–medyan–Q3 aralığı ve tek tek kollar nokta olarak. Baseline şeridi **dikey referans
   çizgisi** olarak diğer üçünün üstüne bindirilir. Ortalama değil medyan: tek aşırı kol ligin
   hükmünü taşıyamaz.
3. **Eşleştirilmiş karşılaştırma tablosu** — satır = lig çifti, sütun = Δmedyan Sharpe,
   Δmedyan DSR, Δ maxDD, örtüşen rejim sayısı. Her hücre işaretli ve **belirsizlik aralığıyla**
   yazılır; aralık sıfırı içeriyorsa hücre nötr kalır ve `AYRILAMADI` etiketi alır. Panelin en
   önemli tek davranışı: **fark yokluğu da bir sonuçtur ve öyle gösterilir.**

---

## 3. BASELINE RAFI

Baseline rafı üç ligin **üzerinde/dışındadır**. Rafın kolları yarışmaz; **cetveldir**.

| Baseline | Tanım | Neden var |
|---|---|---|
| `sma_kesisim` | Hareketli ortalama kesişimi, tek sabit parametre seti | En bilinen "sıradan" kural — v0'daki basit kol buraya **rol değiştirerek** taşınır |
| `al_tut` | Dönem boyunca pozisyon sabit (buy & hold), maliyet dahil | Yön etkisini ayırır: kolun getirisi kuraldan mı, dönemin kendisinden mi |
| `eslestirilmis_rastgele` | **Eşleştirilmiş rastgele giriş** — kolun *kendi* işlem sayısı ve tutma süresi dağılımıyla, rastgele zamanlarda giriş | Karşılaştırmayı adil yapan taban: aynı maruziyet bütçesi, sıfır kural |

**`eslestirilmis_rastgele` özeldir:** kol başına ayrı üretilir (her kolun kendi işlem sayısı /
tutma süresi dağılımına eşleştirilir) ve **MC yelpazesi olarak** yayınlanır, tek sayı olarak
değil. Bir kolun Sharpe'ı kendi eşleştirilmiş-rastgele yelpazesinin içinde kalıyorsa, o kolun
kural kısmı ölçülebilir bir katkı üretmemiştir — panel bunu `YELPAZE İÇİNDE` etiketiyle söyler.

**Simetri denetimi (CLAUDE.md Kural 10):** eşleştirilmiş rastgele üretiminde uygulanan her seçim
kuralı için **kol başına düşme oranı** yayınlanır. Oranlar mertebe olarak ayrışıyorsa (ör. tedavi
%15 vs kontrol %86) eşleştirme simetrik ilan **edilemez** ve panel karşılaştırmayı
`SİMETRİ DENETİMİ BAŞARISIZ` şeridiyle bloklar. Bu denetim veri üreticisinde koşar; panel
sonucunu **gösterir**, kendisi hesaplamaz.

### 3.1 Zorunlu "baseline'a karşı" göstergesi

Her kol kartında, istisnasız:

```ts
export interface BaselineKarsilastirma {
  baseline_id: string | null;
  delta_sharpe: number | null;        // kol - baseline, GERÇEK-MALİYET defterinden
  delta_maxdd: number | null;
  yelpaze_icinde_mi: boolean | null;  // eşleştirilmiş rastgele yelpazesine göre
  belirsizlik_araligi: [number, number] | null;
  ayrilabildi_mi: boolean | null;     // aralık sıfırı dışlıyor mu
}
```

**Kurallar:**
- Karşılaştırma **her zaman gerçek-maliyet defterinden** yapılır. Sürtünmesiz defterden yapılan
  karşılaştırma paneldeki hiçbir yerde gösterilmez.
- "En yakın baseline" seçimi keyfi olamaz: **varsayılan karşılaştırma her zaman
  `eslestirilmis_rastgele`**dir, çünkü tek maruziyet-eşleştirilmiş olan odur. Diğer iki baseline
  ek sütun/ikincil satır olarak gösterilir, birincil göstergenin yerini almaz.
- `ayrilabildi_mi === false` ise gösterge **nötr renkte** çizilir ve `Δ` sayısının yanına
  `AYRILAMADI` yazılır. Yeşil/kırmızı boyanmış bir "ayrılamadı" hükmü yanlış okumaya davettir.

---

## 4. KOL KARTI ZORUNLU ALANLARI

`KolKarti.vue`'nun v2 hâli. v0'daki her şey yerinde kalır (ad, durum rozeti, kural özeti,
`HatIstasyonlari`, son karar, `CiftDefterSeridi`); üstüne şunlar eklenir.

| Alan | Zorunluluk | Not |
|---|---|---|
| **Lig rozeti** | Tüm kollar | Renk + 2 harfli kod (RT/YR/KR/BL) + kenarlık deseni — üç kanallı kodlama |
| **Künye** | `kurumsal`: **zorunlu** (yazar+yıl+başlık). `retail` + `kanit_vitrini`: **zorunlu** (deney/rapor referansı). `yari_retail`: opsiyonel ama tavsiye edilir (formül tanımı kendini belgeler). `baseline`: zorunlu (ölçüt tanımı) | Zorunlu künyesi eksik kol karta **çizilir** ama sayı göstermez: `KÜNYE EKSİK — ÖLÇÜM GİZLENDİ` |
| **Deflated Sharpe rozeti** | Tüm kollar | `DSR 0,73 · N=48` — `n_trials` **rozetin içinde**, gizlenemez (§2.2) |
| **Walk-forward mini-şerit** | Tüm kollar | Pencere başına bir hücre; renk = o penceredeki işaret, yükseklik = büyüklük. Tek pencere = şerit yok, `TEK PENCERE` uyarısı |
| **MC sağlamlık göstergesi** | Tüm kollar | Yelpaze genişliği + kolun yelpaze içindeki konumu; `yelpaze_icinde_mi` true ise vurgulanır |
| **Çift defter Δ** | Tüm kollar | `CiftDefterSeridi.vue`'nun devamı; v0 mantığı korunur (sıfıra bölme guard'ı dahil) |
| **Baseline karşılaştırma** | Tüm kollar | §3.1 |
| **Bulgu bloğu** | `kanit_vitrini: true` olan kollar | Karar şıkkı + dayanıklılık + geri çekilmiş iddialar |

### 4.1 Bulgu bloğu — kanıt vitrininin taşıyıcısı

```ts
export type SonucSinifi =
  | 'olculmedi'            // terazi künyesi eksik/ön-kayıt donmamış
  | 'devam'                // ölçüm sürüyor
  | 'ayrilamadi'           // GA genişliği MDE'yi aşıyor: ne gösterildi ne dışlandı
  | 'esdegerlik_kanitlandi'// eşdeğerlik testi geçti - 'ayrilamadi'dan FARKLI
  | 'fark_olculdu';        // aralık sıfırı dışlıyor

export interface Bulgu {
  sonuc_sinifi: SonucSinifi | null;
  karar_sikki: string | null;         // ör. "ŞIK 3 — BELİRSİZ"
  dayaniklilik: string | null;        // ör. "ablasyonun her iki kolunda da aynı şık"
  geri_cekilen_iddialar: string[] | null; // silinmez, GERİ ÇEKİLDİ etiketiyle taşınır
  rapor_referansi: string | null;     // papers/HQ-YYYY-NNN
  on_kayit_dondu_mu: boolean | null;  // false ise sonuç sınıfı 'olculmedi'ye ZORLANIR
}
```

**`ayrilamadi` ile `esdegerlik_kanitlandi` asla aynı rozeti almaz.** Birincisi "ölçemedik",
ikincisi "yokluğunu gösterdik". Bu ayrımı silmek kanıt vitrinini reklam panosuna çevirir.

**Nokta tahmini kuralı:** `geri_cekilen_iddialar` içinde bir nokta tahmini varsa, o kolun
kartında **hiçbir yerde** o sayı gösterilmez — kampanya tablosunda hücre boş kalır ve
`GERİ ÇEKİLDİ` etiketi taşır. Sayıyı "referans olsun diye" küçük puntoda göstermek geri çekmeyi
iptal eder.

### 4.2 Genişletilmiş `Kol` taslağı

```ts
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
  defterler: { surtunmesiz: Defter | null; gercek_maliyet: Defter | null } | null;
  guncellendi: string | null;

  // --- v2: yeni ---
  lig: Lig | null;
  kunye: Kunye | null;
  kanit_vitrini: boolean | null;
  bulgu: Bulgu | null;
  terazi: TeraziKunyesi | null;
  walk_forward: WalkForwardPencere[] | null;
  mc: MonteCarloOzeti | null;
  baseline_karsilastirma: BaselineKarsilastirma | null;
  varlik_id: string | null;            // Bölüm 7
}

export interface WalkForwardPencere {
  sira: number | null;
  baslangic: string | null;            // ISO 8601
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
  gozlenen: number | null;             // kolun gerçek değeri - yelpazenin neresinde
  metrik: string | null;               // yelpazenin hangi metrik üzerinde olduğu
}

export interface Defter {
  // v0 alanları + v2 eklemeleri
  net_getiri_yuzde: number | null;
  max_dd_yuzde: number | null;
  sharpe: number | null;
  islem_sayisi: number | null;
  toplam_maliyet_bp: number | null;
  deflated_sharpe: number | null;      // v2
  profit_factor: number | null;        // v2 - kampanya tablosu sütunu
  kalicilik: number | null;            // v2 - WF pencerelerinin kaçında işaret korundu (0-1)
}
```

**Türetme sınırı (v0 notunun genişletilmişi):** UI yalnızca **yayınlanmış iki sayının farkını**
türetebilir (makas, Δ Sharpe). Getiri serisi gerektiren hiçbir şey — Sharpe, deflated Sharpe,
maxDD, MC yüzdelikleri — panelde hesaplanmaz; hepsi `code/l0_maliyet/` modülünden gelir
(CLAUDE.md Kural 8: teslim edilen her sayı repodaki modülün kendisiyle üretilmiş olmalı).

---

## 5. GÖRSEL SİSTEM

Hedef: **koyu quant-terminal**. Referans his: gece vardiyasındaki bir kontrol odası ekranı —
yoğun, mono, sessiz; parlayan tek şey ölçüm. Mevcut `komuta.css` paleti **yeniden icat
edilmez**, üzerine kurulur.

### 5.1 Token sistemi — mevcut palet + dört lig rengi

Mevcut (`komuta.css`, dokunulmaz): `--zemin #080B12` · `--panel #0E141F` · `--cizgi #1C2635` ·
`--metin #D8E0EA` · `--metin-soluk #6E7C90` · `--akis #35E0D8` · `--bekleyen #FFB627` ·
`--durdu #FF4D5A` · `--hakem #A78BFA` · `--arena #8AE234` + `--arena-dolgu`.

**Eklenecek (aynı `:root` bloğuna, `--arena` deseniyle):**

```css
/* LİG KİMLİK RENKLERİ. Durum rengi DEĞİL - yalnız lig aidiyeti.
   Hiçbiri mevcut durum renklerinin (akis/bekleyen/durdu/hakem) hue ailesinde değil. */
--lig-retail:        #E85D9E;  /* magenta-gül  · --zemin üzerinde ~5,9:1 */
--lig-yari:          #4C9AFF;  /* çelik mavi   · ~6,8:1 */
--lig-kurumsal:      #D9C89A;  /* parşömen     · ~11,6:1 */
--lig-baseline:      #8494AB;  /* nötr çelik   · ~6,2:1 — KASTEN sönük */

--lig-retail-dolgu:   rgba(232,  93, 158, 0.12);
--lig-yari-dolgu:     rgba( 76, 154, 255, 0.12);
--lig-kurumsal-dolgu: rgba(217, 200, 154, 0.12);
--lig-baseline-dolgu: rgba(132, 148, 171, 0.12);
```

**Renk kuralları:**
1. Lig rengi **kimliktir, hüküm değildir.** Hiçbir lig rengi "iyi/kötü" çağrışımı taşımaz;
   kurumsal parşömen tonu diğerlerinden daha "onaylı" görünmemelidir. Kalite bilgisi yalnız
   ölçüm renklerinden (`--akis`/`--bekleyen`/`--durdu`) gelir.
2. Baseline kasten sönüktür — cetvel dikkat çekmez.
3. **Üç kanallı kodlama zorunlu:** renk + 2 harfli kod (`RT`/`YR`/`KR`/`BL`) + kenarlık deseni
   (retail: düz · yarı-retail: düz ince · kurumsal: çift çizgi · baseline: kesikli). Renk körlüğü
   ve gri-tonlu ekran görüntüsünde bilgi kaybolmaz.
4. `ArenaRozeti.vue`'nun durum sözlüğü **değişmez**; lig rozeti **ayrı bir bileşendir**
   (`LigRozeti.vue`). Durum ile kimliği aynı rozette birleştirmek v0'ın en temiz kararını bozar.

### 5.2 Tipografi

`.km-mono` (`Cascadia Code / Cascadia Mono / Consolas / ui-monospace`) **tüm sayısal içerikte
zorunlu** kalır. Gerekçe teknik, estetik değil: rakam genişliği sabit olduğu için dikey hizalanan
sütunlarda göz karşılaştırmayı **okumadan** yapar — 1000 satırlık tabloda bu okunabilirlik
şartıdır. Sayısal hücrelere ayrıca `font-variant-numeric: tabular-nums`.

Ölçek (mevcut kullanımla uyumlu): başlık `10px/0.14em uppercase` · gövde `11-12px` ·
sayı `12-13px semibold` · imza sayısı (Δ, DSR) `14px bold`. Mobilde bir kademe düşer.

### 5.3 Kampanya tablosu

Sütunlar (soldan): `KOL` · `LİG` · `TRADES` · `RETURN` · `MAXDD` · `PF` · `SHARPE` · `DSR` ·
`N` (n_trials) · `PERSISTENCE` · `Δ BASELINE` · `MAKAS`.

- Sayısal sütunlar sağa hizalı, tabular-nums, işaretli.
- `RETURN`/`MAXDD`/`SHARPE` **gerçek-maliyet defterinden**; sürtünmesiz değerler yalnız `MAKAS`
  sütununu üretmek için kullanılır (v0'ın makas mantığı korunur).
- `N` sütunu **gizlenemez** — sütun gizleme menüsünde bile kapatılamaz (§2.2).
- `PERSISTENCE` = WF pencerelerinin kaçında işaret korundu (0-1). Tek pencerede `—`.
- Satır yüksekliği 28px, zebra yok; ayrım `--cizgi` 1px alt kenarlık ile (zebra 1000 satırda
  gürültü üretir).
- Sıralama varsayılanı: **lig, sonra `Δ BASELINE` mutlak değeri**. "En yüksek Sharpe" varsayılan
  sıralama **değildir** — panel bir liderlik tablosu değil, karşılaştırma aracıdır.

### 5.4 Equity eğrisi + MC yelpazesi — yan yana yerleşim

Detay görünümünde tek satırda iki panel, `grid-template-columns: 1fr 1fr` (≥1024px):

- **Sol — equity eğrisi:** iki çizgi, sürtünmesiz (`--metin-soluk`, 1px, %60 opaklık) ve
  gerçek-maliyet (`--metin`, 1.5px). Aradaki alan `--arena-dolgu` ile taranır — makas **görsel
  olarak** okunur. WF pencere sınırları dikey `--cizgi` işaretleriyle, eğitim pencereleri koyu bant.
- **Sağ — MC yelpazesi:** p05–p95 bandı en açık, p25–p75 daha koyu, medyan çizgi; kolun gözlenen
  değeri **tek dikey işaret**. Yelpaze içindeyse `--bekleyen`, dışındaysa `--akis`. İki panelin Y
  ekseni **ortak ölçekte değildir** ve bu açıkça etiketlenir (farklı birimler).
- <1024px: alt alta, MC yelpazesi ikinci.

### 5.5 Durum LED'leri — `HatIstasyonlari.vue` sözlüğünün devamı

v0 sözlüğü korunur ve genişletilir:

| Durum | Renk | Nokta | Kenarlık | Animasyon |
|---|---|---|---|---|
| `akiyor` | `--akis` | dolu | düz | bağlayıcıda `km-hat-akis` |
| `bekliyor` | `--bekleyen` | dolu | düz | yok |
| `hata` | `--durdu` | dolu | düz | yok (kırmızı zaten dikkat çeker) |
| `yok` / `null` | `--metin-soluk` | dolu | **kesikli** | yok |
| `donduruldu` (kol) | tüm hat `opacity: 0.5` | — | — | tüm animasyonlar durur |
| **`bayat`** (v2) | `--bekleyen` | **boş halka** | düz | yok |
| **`karantina`** (v2) | `--hakem` | dolu | çift çizgi | yok |

`bayat`: veri akıyor ama `son_damga` eşiğin ötesinde eskimiş — "akıyor" göstermek yalan olur.
`karantina`: hakem denetiminde, sayıları yayınlanamaz.

### 5.6 Seans filtreleri (Tokyo / Londra / New York)

Üst şeritte üç toggle. Seçili seans(lar) tüm ölçümleri o zaman bantlarına daraltır.

- Zaman bantları **UTC olarak veri modelinde tanımlanır**, panelde hardcode edilmez
  (`SeansTanimi { ad, baslangic_utc, bitis_utc }`). Yaz saati kayması veri üreticisinin işidir.
- Örtüşme bölgeleri (Londra∩NY) görsel olarak taranmış bantla gösterilir; iki seans birden
  seçiliyse örtüşme **tek kez** sayılır.
- **Filtre uygulandığında `n_trials` ve MDE değişir.** Panel bunu sessizce yapamaz: filtre aktifken
  terazi şeridi `SEANS FİLTRESİ AKTİF — n_eff düştü` uyarısı gösterir ve DSR rozetleri
  filtrelenmiş `n_trials` ile yeniden okunur. Filtreli sayıyı filtresiz `n_trials` ile göstermek
  çoklu-deneme düzeltmesini bozar.
  **Karar bağlandı (Divan oturum-03, Vites A — yeni eşik değil, mevcut `Z8`/
  `metrikler.py` doktrininin zorunlu sonucu):** `n_trials`, filtre-öncesi değere
  kullanıcıya açık filtre-durumu sayısı kadar **çarpan** olarak yazılır (ör.
  Tokyo/Londra/NY/Tümü = 4 durum → ×4). Filtreli görünüm filtre-öncesi
  `n_trials` ile okunamaz; bkz. `05_strateji_lab/divan/2026-08-05-oturum-03-arena-v2-metodoloji.md` §0.
- Varlık sınıfı seans kavramını taşımıyorsa (7/24 piyasa), filtre **görünmez** — boş toggle
  göstermek yerine bölüm hiç render edilmez (Bölüm 7).

### 5.7 Animasyon bütçesi

**Bütçe:** aynı anda **en fazla 2 döngüsel animasyon** ekranda. Toplam animasyon kaynaklı
kare maliyeti hedefi < 4ms/kare. Ana thread'de layout tetikleyen animasyon **yasak** —
yalnız `transform` ve `opacity`.

| Animasyon var | Animasyon YOK |
|---|---|
| Self-healing rozeti nabzı (mevcut `km-nabiz`, imza öğe) | Sayı değişimleri (counting/rolling rakam yok) |
| Hat bağlayıcısı akış çizgisi (mevcut `km-hat-akis`) | Kampanya tablosu satırları (giriş/çıkış/hover animasyonu yok) |
| LED durum geçişi (≤150ms renk crossfade) | Equity eğrisi çizim animasyonu (path draw-in yok) |
| Boot sekansı (§5.8, tek sefer) | MC yelpazesi (statik çizilir) |
| Detay çekmecesi açılışı (≤180ms transform) | Lig rozetleri, künye, DSR rozeti (statik) |

**`prefers-reduced-motion: reduce`:** mevcut iki `@media` bloğu korunur ve genişletilir —
tüm döngüsel animasyonlar `animation: none`, geçişler `transition: none`, boot sekansı **son
kareye anında atlar**. Bilgi kaybı olmaz: her animasyonun taşıdığı bilgi statik hâlde de
okunabilir (nabız = rozet metni, akış çizgisi = LED durumu).

### 5.8 Boot sekansı

Panel ilk açıldığında ~900ms'lik bir **kalibrasyon sekansı**. Amaç süs değil: kullanıcının ilk
gördüğü şey sayılar değil, **sayıların hangi teraziden geçtiği** olsun.

Kaba akış:
1. `0-200ms` — tek satır: `ARENA · PAPER MOD · GERÇEK PARA YOK`.
2. `200-500ms` — terazi kalemleri sırayla onay alır: `maliyet modeli ✓` · `walk-forward ✓` ·
   `deflated sharpe (N=…) ✓` · `monte carlo ✓`. Eksik kalem **onay yerine `—` alır, sekans
   durmaz**; eksiklik ekranda kalır.
3. `500-750ms` — lig şeritleri 60ms arayla belirir (yalnız `opacity` + `translateY(4px)`).
4. `750-900ms` — filo kartları grid'e yerleşir (stagger yok, tek geçiş).

Kurallar: oturum başına **bir kez** (`sessionStorage`); veri gecikirse sekans veriyi
**beklemez** (iskelet üstünde koşar, `content-visibility` ile); `prefers-reduced-motion`'da
tamamen atlanır; herhangi bir tıklama sekansı anında sonlandırır.

---

## 6. TEKNİK

### 6.1 Temel ilke — mevcut taban üzerine, yeniden yazma yok

Vue 3 + Vite + TS + Tailwind mevcut kurulum korunur. `useArenaDurum()`'un çekme mantığı
(10s polling, fail-open, `BOS_DURUM` spread'i) **değişmez** — v2 alanları nullable olduğu için
eski `arena-durum.json` yeni panelde sorunsuz açılır ve eksik alanlar "veri yok" gösterir.
Yeni bileşenler `components/arena/` altına eklenir; mevcut 9 bileşenden **hiçbiri silinmez**,
`KolKarti.vue` ve `MakasTablosu.vue` genişletilir.

### 6.2 Grafik kütüphanesi — **uPlot** önerilir

| Ölçüt | uPlot | lightweight-charts |
|---|---|---|
| Bundle (gzip) | ~15 KB | ~45 KB |
| Bağımlılık | yok | yok |
| Çoklu seri (MC yelpazesi: 5+ bant) | doğal — seri sayısı serbest, band dolgusu `drawHooks` ile | zorlanır; API finansal seri tiplerine bağlı |
| Walk-forward pencere işaretleri | `hooks.draw` ile serbest çizim | plugin yüzeyi daha dar |
| Zaman ekseni esnekliği (varlık-bağımsız, 7/24 vs seanslı) | serbest — eksen tamamen bizim | takvim/seans varsayımları gömülü |
| Tema entegrasyonu | CSS değişkeni okunup `stroke`/`fill`'e verilir | kendi tema objesi, `--theme-*` ile çift kaynak riski |

**Karar: uPlot.** Belirleyici olan bundle değil, **MC yelpazesi ve WF pencere işaretleri**:
ikisi de finansal grafik kütüphanelerinin birinci sınıf vatandaşı değil, uPlot'un `drawHooks`
yüzeyinde ise birkaç satır. lightweight-charts mum/hacim odaklıdır; bizim çizdiğimiz fiyat değil
**ölçüm dağılımıdır**. uPlot'ta candlestick olmaması bir kayıp değil: ARENA fiyat grafiği çizmez
ve çizmemeli — fiyat grafiği yön ima etmeye en yatkın öğedir (Kural 2).

**Kart içi mini-şeritler uPlot kullanmaz.** 60 kartta 60 uPlot örneği = 60 canvas + 60 resize
observer. WF mini-şeridi ve sparkline'lar **inline SVG veya saf CSS grid** ile çizilir
(≤20 hücre, statik). uPlot yalnız iki büyük grafikte ve detay çekmecesinde kullanılır.

### 6.3 1000+ satırlık kampanya tablosunun performans planı

**Önce soru: bu satırlar var mı?** Gerçek filo 20-60 koldur. 1000+ satır ancak tablo
kol × WF-penceresi × rejim kırılımına açıldığında oluşur. Yani virtualization **koşullu bir
ihtiyaçtır**, baştan kurulacak bir altyapı değil.

Kademeli plan (her kademe ölçümle tetiklenir):

1. **≤200 satır — hiçbir şey yapma.** Düz `v-for`, `:key` sabit `kol.id`.
2. **200-1000 satır — CSS ile çöz, sıfır bağımlılık.** Satır konteynerine
   `content-visibility: auto` + `contain-intrinsic-size: 0 28px`. Tarayıcı görünmeyen satırları
   layout/paint dışında bırakır; değişiklik tek CSS satırı, scroll/Ctrl+F bozulmaz.
3. **>1000 satır *ve* ölçülen kare süresi >16ms — pencereleme.** Satır yüksekliği sabit (28px)
   olduğu için pencereleme ~30 satırlık bir `computed` dilim + iki spacer div'dir; kütüphane
   gerekmez ve eklenmez.

**Kapı:** virtualization ancak Performance panelinde **ölçülmüş** >16ms kare süresiyle
gerekçelendirilir. Ölçülmemiş optimizasyon eklenmez.

Ek önlemler (ucuz, koşulsuz): sıralama/filtreleme tek `computed` geçişte; formatlayıcılar render
dışında memoize; `Kol` nesneleri `shallowRef` (derin reaktivite 1000 nesnede pahalı ve gereksiz —
veri 10s'de bir tümüyle değişir).

### 6.4 375px mobil desteği

Mevcut `mobile:` breakpoint kullanımı korunur. Bozulma sırası (yukarıdan aşağı önce ne gider):

| Öğe | ≥1280px | 768-1279px | **375-767px** |
|---|---|---|---|
| Terazi şeridi | tek satır | tek satır, yatay kaydırma | **2 satıra sarılır, `n_trials` ve maliyet modeli kalır** |
| Lig dağılım şeridi | 4 şerit yan yana | 2×2 | **alt alta, dikey; nokta bulutu yerine Q1/medyan/Q3 sayıları** |
| Kampanya tablosu | 12 sütun | 8 sütun | **kart listesine dönüşür**: kol adı + LİG + SHARPE + DSR·N + Δ BASELINE. Diğer sütunlar satır açılınca |
| Filo grid | 3 kolon | 2 kolon | **1 kolon** (v0 zaten böyle) |
| Equity + MC | yan yana | yan yana | **alt alta**, yükseklik 160px |
| WF mini-şerit | 20 hücre | 20 hücre | **10 hücre + "…+10"** |
| Seans filtreleri | 3 toggle + örtüşme bandı | 3 toggle | **açılır menü** |
| Boot sekansı | tam | tam | **kısaltılmış (400ms, yalnız adım 1-2)** |

**Asla gitmeyenler (375px'te bile):** hukuk/paper-mod uyarı satırı · lig rozeti · `n_trials` ·
`ayrilabildi_mi === false` durumundaki `AYRILAMADI` etiketi · geçici-kanıt-verisi bandı.
Bunlar "yer yok" gerekçesiyle kaldırılamaz; kaldırıldıklarında panel yanlış bir şey söylemiş olur.

Dokunma hedefleri ≥44px; yatay sayfa kaydırması yok (yalnız tablo kendi konteynerinde kayar).

---

## 7. VERİ NOTU — varlık-bağımsızlık ve geçici kanıt verisi

### 7.1 Durum

Hedef varlık kararı (forex / XAUUSD / kripto) **Vites B**'dedir ve proje sahibinin onayını
beklemektedir (CLAUDE.md, Üç Vites tablosu: ölçüm tanımı ve örneklem seçimi metodoloji kararıdır).
Karar verilmeden panelin herhangi bir yerine sembol veya varlık sınıfı gömülemez.

### 7.2 Bugünkü BTC verisi = GEÇİCİ KANIT VERİSİ

Panelin şu an beslendiği BTC akışı **proof-of-concept** amaçlıdır: boru hattının uçtan uca
çalıştığını göstermek için vardır, bir varlık seçimi değildir. Bu, veri modelinde **etiketlidir**
ve panelde **kalıcı olarak görünür**:

- `ArenaDurum.varlik.veri_statusu === 'gecici_kanit'` iken panelin üstünde, kapatılamayan,
  `--bekleyen` renkli bir bant: **`GEÇİCİ KANIT VERİSİ — varlık kararı onay bekliyor.
  Buradaki sayılar boru hattı doğrulamasıdır, varlık hakkında bir bulgu değildir.`**
- Bu bant 375px'te de kaldırılmaz (§6.4).
- `gecici_kanit` statüsündeki verilerden üretilen hiçbir kol `bulgu.sonuc_sinifi`'nda
  `fark_olculdu` veya `esdegerlik_kanitlandi` **değeri alamaz** — en fazla `devam` olur.

### 7.3 Varlık-bağımsız veri modeli

```ts
export type VarlikSinifi = 'kripto' | 'forex' | 'emtia' | 'hisse' | 'endeks';
export type VeriStatusu = 'gecici_kanit' | 'onaylanmis';

export interface Varlik {
  id: string | null;                 // panel içi anahtar; kollar buna referans verir
  sembol: string | null;             // GÖRÜNTÜLEME için; mantık buna dallanmaz
  sinif: VarlikSinifi | null;
  borsa: string | null;
  seanslar: SeansTanimi[] | null;    // boş/null => seans filtresi RENDER EDİLMEZ
  fiyat_ondalik: number | null;      // biçimlendirme veriden gelir, koddan değil
  veri_statusu: VeriStatusu | null;
  veri_notu: string | null;          // kaynak + lisans + kusur notu referansı
}

export interface SeansTanimi {
  ad: string | null;
  baslangic_utc: string | null;      // "00:00"
  bitis_utc: string | null;
}
```

**Bağlayıcı kurallar:**
1. Panel kodunda sembol sabiti **yoktur**. `'BTCUSDT'`, `'XAUUSD'` gibi hiçbir dize koşulda
   kullanılamaz; tüm davranış `Varlik` alanlarından türetilir.
2. Biçimlendirme (ondalık basamak, birim) `fiyat_ondalik`'ten gelir.
3. Seans filtresi `seanslar` boşsa **hiç render edilmez** — 7/24 piyasada boş toggle göstermek
   yanlış bilgi verir.
4. Karşılaştırma **yalnız aynı `varlik_id` içinde** yapılır. Farklı varlıkların kolları aynı lig
   dağılım şeridinde yan yana çizilemez; çizilmeye çalışılırsa `FARKLI VARLIK — KARŞILAŞTIRILAMAZ`
   şeridi girer (terazi uyuşmazlığıyla aynı mekanizma, §2.4).
5. Çoklu varlık gelecekte destekleneceği için `ArenaDurum.varliklar` bir **dizidir**; v2'de
   tek elemanlı olması beklenir ama model tekile kilitlenmez.

```ts
export interface ArenaDurum {
  // --- v0 korunur ---
  guncellendi: string | null;
  sezon: { ad: string | null; baslangic: string | null; bitis: string | null } | null;
  besleme: BeslemeSagligi | null;
  rejim: Rejim | null;
  kollar: Kol[] | null;
  reviewer: ReviewerDurumu | null;

  // --- v2 ---
  varliklar: Varlik[] | null;
  aktif_varlik_id: string | null;
  baseline_rafi: Kol[] | null;          // lig === 'baseline' olan kollar
  lig_karsilastirma: LigKarsilastirma | null;
  terazi: TeraziKunyesi | null;         // panel geneli sözleşme
}
```

---

## Sonraki Adımlar

### Vites A — Divan kendi karar verir, doğrudan uygulanabilir

Teknik ve geri alınabilir; ölçüm tanımına dokunmaz.

1. `useArenaDurum.ts` tip genişletmesi (tüm yeni alanlar nullable; eski JSON çalışmaya devam eder).
2. `komuta.css`'e dört lig rengi + dolgu değişkeni eklenmesi; `LigRozeti.vue` bileşeni.
3. `KolKarti.vue` genişletmesi: lig rozeti, künye satırı, DSR rozeti (`n_trials` gömülü),
   WF mini-şerit (inline SVG), MC sağlamlık göstergesi, baseline karşılaştırma satırı.
4. `MakasTablosu.vue` → kampanya tablosu (12 sütun, tabular-nums, `content-visibility`).
5. uPlot bağımlılığının eklenmesi + equity/MC panel bileşeni.
6. Boot sekansı, `prefers-reduced-motion` genişletmesi, mobil bozulma sırası.
7. `HatIstasyonlari.vue` durum sözlüğüne `bayat` + `karantina` eklenmesi.
8. Geçici-kanıt-verisi bandı ve varlık-bağımsızlık denetimi (sembol sabiti taraması).
9. **(Divan oturum-03'te A'ya bağlandı)** Seans filtresi aktifken `n_trials`'ın filtre-durumu
   sayısıyla çarpılması — §5.6'daki bağlanmış karara bkz., yeni ön-kayıt gerekmez.

### Vites B — Eren onayı şart (metodoloji)

Bunlar ölçüm tanımını, kabul kapısını veya örneklem seçimini değiştirir; onaysız uygulanmaz.
Konsolide karar ekranı: `05_strateji_lab/divan/2026-08-05-oturum-03-arena-v2-metodoloji.md`.

1. **Hedef varlık kararı** — forex / XAUUSD / kripto. Panel hazır, veri kararı bekliyor.
   *(Zaten açık olan Vites B kaydı, `bd ox1`.)*
2. **Lig atama kuralının dondurulması** — özellikle Donchian'ın `kurumsal`'a taşınması ve
   sınır-durum kuralı ("makalenin tanımı mı, popüler tarif mi"). Bu bir örneklem sınıflandırma
   kuralıdır.
3. **Varsayılan baseline'ın `eslestirilmis_rastgele` olması** — karşılaştırmanın referans
   noktasıdır, dolayısıyla ölçüm tanımıdır.
4. **`eslestirilmis_rastgele` üretim şartnamesi** — eşleştirmenin hangi momentlere yapılacağı
   (işlem sayısı + tutma süresi dağılımı) ve simetri denetiminin kabul eşiği (kol başına düşme
   oranı ayrışma sınırı, CLAUDE.md Kural 10).
5. **`SonucSinifi` eşikleri** — `ayrilamadi` ↔ `esdegerlik_kanitlandi` ↔ `fark_olculdu` ayrımının
   sayısal ölçütleri ve **her eşiğin bağlama bölgesi** (Kural 12: hangi `n_eff` aralığında fiilen
   bağladığı kapalı formda yazılmadan eşik yazılmamış sayılır).
6. **Kanıt vitrini metinleri** — Deney-1 sonucunun panelde nasıl ifade edileceği. Hukuk dil
   filtresinden geçmeli; "edge yok" ile "ayrılamadı" farkı korunmalı. (~~Seans filtresinin
   `n_trials`'a etkisi~~ Divan oturum-03'te Vites A'ya bağlandı, bkz. §5.6 ve madde 9 yukarıda.)

### Vites C — her zaman Eren, istisnasız

- Panelin dışarıya açılması / yayın (ARENA ekranının topluluk erişimine sunulması).
- Kanıt vitrini içeriğinin içerik üretimine (video/yazı) girmesi.

### Kapsam dışı (bilerek)

Reviewer öneri-modu v0'daki gibi **kapalı** kalır ve v2'de açılmaz; `OneriKuyrugu.vue`'nun
"uygulama düğmesi yoktur ve olmayacaktır" metni aynen korunur. Canlı işlem yüzeyi yoktur,
tasarlanmaz, planlanmaz (CLAUDE.md Kural 1).

---

**HÜKÜM:** ARENA v2 mimarisi üç kavram ligini tek teraziye bağlayan, `n_trials`'ı gizlenemez
kılan ve varlık kararını bekletmeden inşa edilebilir bir sözleşme olarak tanımlanmıştır; Vites A
kalemleri (seans-filtresi `n_trials` çarpanı dahil, Divan oturum-03) bugün uygulanabilir, Vites
B'de kalan altı metodoloji kararı onaylanmadan hiçbir kol `fark_olculdu` hükmü taşıyamaz.
