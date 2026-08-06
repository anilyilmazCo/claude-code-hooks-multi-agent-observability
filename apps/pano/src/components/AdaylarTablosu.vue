<template>
  <section class="panel">
    <div v-if="yukleniyor" class="yukleniyor">Kampanya verisi yükleniyor…</div>
    <BosDurum
      v-else-if="kampanya && filtreliAdaylar.length === 0"
      :gerekce="BOS_GEREKCE[aktifLevel]"
      :planlar="BOS_PLANLAR[aktifLevel]"
    />
    <template v-else-if="kampanya">
      <table class="tablo">
        <caption class="gizli-baslik">Kampanya adayları — parametre karşılaştırma</caption>
        <thead>
          <tr>
            <th class="th-sol"></th>
            <th class="th-sol">Strateji</th>
            <th>Getiri %</th>
            <th>Kazanma %</th>
            <th>Maks Düşüş %</th>
            <th><SozlukTerimi anahtar="pf">PF</SozlukTerimi></th>
            <th><SozlukTerimi anahtar="sharpe">Sharpe</SozlukTerimi></th>
            <th>İşlem</th>
            <th class="th-sol">Durum</th>
            <th><SozlukTerimi anahtar="ayar_damgasi">Ayar</SozlukTerimi></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="aday in filtreliAdaylar" :key="aday.id">
            <tr class="satir" @click="detayAc(aday)">
              <td class="td-onay" @click.stop>
                <input
                  type="checkbox"
                  :checked="secililer.has(aday.id)"
                  :disabled="!secililer.has(aday.id) && secililer.size >= 3"
                  @change="secimDegistir(aday.id)"
                />
              </td>
              <td class="td-strateji">{{ stratejiAdi(aday) }}</td>
              <td class="tabular" :class="isaretSinifi(aday.defterler.gercek_maliyet.net_getiri_yuzde)">
                {{ fmtYuzde(aday.defterler.gercek_maliyet.net_getiri_yuzde) }}
              </td>
              <td class="tabular">{{ fmtYuzde(aday.defterler.gercek_maliyet.kazanma_orani_yuzde) }}</td>
              <td class="tabular durdu">{{ fmtYuzde(aday.defterler.gercek_maliyet.max_dd_yuzde) }}</td>
              <td class="tabular">{{ fmtSayi(aday.defterler.gercek_maliyet.profit_factor) }}</td>
              <td class="tabular">{{ fmtSayi(aday.defterler.gercek_maliyet.sharpe) }}</td>
              <td class="tabular">{{ aday.defterler.gercek_maliyet.islem_sayisi }}</td>
              <td>
                <span class="cip" :class="aday.sag_kaldi_mi ? 'cip--gecti' : 'cip--elendi'">
                  {{ aday.sag_kaldi_mi ? 'GEÇTİ' : 'ELENDİ' }}
                </span>
              </td>
              <td class="td-damga"><AyarDamgasi :durum="damgaHesapla(aday)" /></td>
            </tr>
            <tr v-if="!aday.sag_kaldi_mi" class="satir-neden">
              <td></td>
              <td colspan="9">└ {{ sadeNeden(aday.eleme_nedeni) }}</td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>

    <!-- Karşılaştırma dock -->
    <div v-if="secililer.size > 0" class="dock">
      <span>{{ secililer.size }} aday seçildi</span>
      <button class="dock__buton" :disabled="secililer.size < 2" @click="karsilastirAc = true">
        Yan yana karşılaştır
      </button>
    </div>

    <!-- Detay çekmecesi -->
    <Teleport to="body">
      <div v-if="detayliAday" class="ortu" @click="detayKapat">
        <aside class="cekmece" @click.stop>
          <button class="cekmece__kapat" @click="detayKapat" aria-label="Kapat">✕</button>
          <div class="cekmece__ust">
            <AyarDamgasi :durum="damgaHesapla(detayliAday)" />
            <span class="cekmece__eyebrow">KANIT AYARI</span>
          </div>
          <h3 class="cekmece__baslik">{{ stratejiAdi(detayliAday) }}</h3>

          <dl class="cekmece__liste">
            <div>
              <dt><SozlukTerimi anahtar="sharpe">Sharpe</SozlukTerimi></dt>
              <dd class="tabular">{{ fmtSayi(detayliAday.defterler.gercek_maliyet.sharpe) }}</dd>
            </div>
            <div>
              <dt><SozlukTerimi anahtar="dsr">Deflated Sharpe</SozlukTerimi></dt>
              <dd class="tabular">{{ fmtSayi(detayliAday.defterler.gercek_maliyet.deflated_sharpe) }}</dd>
            </div>
            <div>
              <dt><SozlukTerimi anahtar="pf">Profit Factor</SozlukTerimi></dt>
              <dd class="tabular">{{ fmtSayi(detayliAday.defterler.gercek_maliyet.profit_factor) }}</dd>
            </div>
            <div>
              <dt><SozlukTerimi anahtar="n_trials">n_trials</SozlukTerimi></dt>
              <dd class="tabular">{{ detayliAday.n_trials ?? kampanya?.n_trials }}</dd>
            </div>
            <div>
              <dt><SozlukTerimi anahtar="walk_forward">Kalıcılık (WF)</SozlukTerimi></dt>
              <dd class="tabular">{{ fmtOran(detayliAday.defterler.gercek_maliyet.kalicilik) }}</dd>
            </div>
            <div>
              <dt><SozlukTerimi anahtar="kirilgan">Komşuluk korelasyonu</SozlukTerimi></dt>
              <dd class="tabular">{{ fmtSayi(detayliAday.komsuluk_korelasyonu) }}</dd>
            </div>
          </dl>

          <p v-if="!detayliAday.sag_kaldi_mi" class="cekmece__neden">
            Hangi kapıda düştü: {{ sadeNeden(detayliAday.eleme_nedeni) }}
          </p>
        </aside>
      </div>
    </Teleport>

    <!-- Yan yana karşılaştırma -->
    <Teleport to="body">
      <div v-if="karsilastirAc" class="ortu" @click="karsilastirAc = false">
        <div class="karsilastirma" @click.stop>
          <button class="cekmece__kapat" @click="karsilastirAc = false" aria-label="Kapat">✕</button>
          <table class="karsilastirma__tablo">
            <thead>
              <tr>
                <th>Ölçüt</th>
                <th v-for="a in secilenAdaylar" :key="a.id">{{ stratejiAdi(a) }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="satir in karsilastirmaSatirlari" :key="satir.etiket">
                <td>{{ satir.etiket }}</td>
                <td
                  v-for="(deger, i) in satir.degerler"
                  :key="i"
                  class="tabular"
                  :class="{ 'en-iyi': satir.enIyiIndeks === i }"
                >
                  {{ deger }}
                </td>
              </tr>
            </tbody>
          </table>
          <p class="karsilastirma__not">~ küçük farklar önemsiz olabilir, tek metriğe göre karar verilmez.</p>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AyarDamgasi from './AyarDamgasi.vue'
import BosDurum from './BosDurum.vue'
import SozlukTerimi from './SozlukTerimi.vue'
import { damgaHesapla } from '../composables/damga'
import { sadeNeden } from '../composables/elemeNedeni'
import { aktifLevel, BOS_GEREKCE, BOS_PLANLAR } from '../composables/durum'
import type { KampanyaAday, KampanyaSonuc } from '../composables/useVeri'

const props = defineProps<{ kampanya: KampanyaSonuc | null; yukleniyor: boolean }>()

const filtreliAdaylar = computed(() => {
  const adaylar = props.kampanya?.adaylar ?? []
  return adaylar.filter((a) => a.lig === aktifLevel.value)
})

function stratejiAdi(aday: KampanyaAday): string {
  const parametreMetni = Object.entries(aday.parametreler)
    .map(([k, v]) => `${k}=${v}`)
    .join(', ')
  return `${aday.aile} (${parametreMetni})`
}

function fmtYuzde(v: number | null): string {
  return v == null ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(1)}`
}
function fmtSayi(v: number | null): string {
  return v == null ? '—' : v.toFixed(2)
}
function fmtOran(v: number | null): string {
  return v == null ? '—' : `${(v * 100).toFixed(0)}%`
}
function isaretSinifi(v: number | null): string {
  return v == null ? '' : v >= 0 ? '' : 'durdu'
}

// --- Detay çekmecesi ---
const detayliAday = ref<KampanyaAday | null>(null)
function detayAc(aday: KampanyaAday) {
  detayliAday.value = aday
}
function detayKapat() {
  detayliAday.value = null
}

// --- Seçim + karşılaştırma ---
const secililer = ref<Set<string>>(new Set())
function secimDegistir(id: string) {
  if (secililer.value.has(id)) secililer.value.delete(id)
  else if (secililer.value.size < 3) secililer.value.add(id)
  secililer.value = new Set(secililer.value)
}
const karsilastirAc = ref(false)
const secilenAdaylar = computed(() =>
  filtreliAdaylar.value.filter((a) => secililer.value.has(a.id)),
)

interface KarsilastirmaOlcusu {
  etiket: string
  al: (a: KampanyaAday) => number | null
  fmt: (v: number | null) => string
  yuksekIyi: boolean
}
const OLCULER: KarsilastirmaOlcusu[] = [
  { etiket: 'Getiri %', al: (a) => a.defterler.gercek_maliyet.net_getiri_yuzde, fmt: fmtYuzde, yuksekIyi: true },
  { etiket: 'Kazanma %', al: (a) => a.defterler.gercek_maliyet.kazanma_orani_yuzde, fmt: fmtYuzde, yuksekIyi: true },
  { etiket: 'Maks Düşüş %', al: (a) => a.defterler.gercek_maliyet.max_dd_yuzde, fmt: fmtYuzde, yuksekIyi: false },
  { etiket: 'İşlem', al: (a) => a.defterler.gercek_maliyet.islem_sayisi, fmt: (v) => (v == null ? '—' : String(v)), yuksekIyi: true },
  { etiket: 'Sharpe', al: (a) => a.defterler.gercek_maliyet.sharpe, fmt: fmtSayi, yuksekIyi: true },
  { etiket: 'Deflated Sharpe', al: (a) => a.defterler.gercek_maliyet.deflated_sharpe, fmt: fmtSayi, yuksekIyi: true },
]
const karsilastirmaSatirlari = computed(() =>
  OLCULER.map((olcu) => {
    const hamDegerler = secilenAdaylar.value.map((a) => olcu.al(a))
    let enIyiIndeks: number | null = null
    let enIyiDeger: number | null = null
    hamDegerler.forEach((v, i) => {
      if (v == null) return
      if (enIyiDeger == null || (olcu.yuksekIyi ? v > enIyiDeger : v < enIyiDeger)) {
        enIyiDeger = v
        enIyiIndeks = i
      }
    })
    return {
      etiket: olcu.etiket,
      degerler: hamDegerler.map(olcu.fmt),
      enIyiIndeks,
    }
  }),
)
</script>

<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.yukleniyor {
  color: var(--metin-3);
  font-size: 14px;
}

.gizli-baslik {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.tablo {
  font-size: 14px;
}

.tablo th {
  text-align: right;
  padding: var(--sp-2) var(--sp-3);
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--metin-3);
  border-bottom: 1px solid var(--cizgi);
}
.tablo th.th-sol {
  text-align: left;
}

.satir {
  cursor: pointer;
}
.satir:hover {
  background: var(--yuzey);
}
.satir td {
  padding: var(--sp-3);
  border-top: 1px solid color-mix(in srgb, var(--cizgi) 50%, transparent);
  text-align: right;
  color: var(--metin);
  height: 56px;
}
.td-onay,
.td-strateji {
  text-align: left;
}
.td-strateji {
  font-family: var(--f-govde);
  font-weight: 500;
}
.td-damga {
  text-align: center;
}

.durdu {
  color: var(--elendi);
}

.satir-neden td {
  padding: 0 var(--sp-3) var(--sp-3);
  color: var(--metin-3);
  font-family: var(--f-dar);
  font-size: 12.5px;
  text-align: left;
}

.cip {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--r-s);
  border: 1px solid;
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.08em;
}
.cip--gecti {
  color: var(--gecti);
  border-color: var(--gecti);
}
.cip--elendi {
  color: var(--elendi);
  border-color: var(--elendi);
}

.dock {
  position: sticky;
  bottom: var(--sp-5);
  align-self: center;
  display: flex;
  align-items: center;
  gap: var(--sp-4);
  padding: var(--sp-3) var(--sp-5);
  background: var(--yuzey-2);
  border: 1px solid var(--cizgi);
  border-radius: var(--r-l);
  box-shadow: var(--golge-3);
  font-size: 14px;
}
.dock__buton {
  padding: var(--sp-2) var(--sp-4);
  border: 1px solid var(--altin);
  border-radius: var(--r-s);
  color: var(--altin);
  font-weight: 500;
  font-size: 13px;
}
.dock__buton:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.ortu {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 50;
  display: flex;
  justify-content: flex-end;
}

.cekmece {
  position: relative;
  width: 480px;
  max-width: 90vw;
  height: 100%;
  background: var(--yuzey-2);
  box-shadow: var(--golge-3);
  border-top-left-radius: var(--r-l);
  border-bottom-left-radius: var(--r-l);
  padding: var(--sp-6);
  overflow-y: auto;
}

.karsilastirma {
  position: relative;
  margin: auto;
  max-width: 90vw;
  background: var(--yuzey-2);
  box-shadow: var(--golge-3);
  border-radius: var(--r-l);
  padding: var(--sp-6);
}

.cekmece__kapat {
  position: absolute;
  top: var(--sp-4);
  right: var(--sp-4);
  color: var(--metin-3);
  font-size: 16px;
}

.cekmece__ust {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  margin-bottom: var(--sp-4);
}
.cekmece__eyebrow {
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--altin);
}
.cekmece__baslik {
  font-family: var(--f-display);
  font-weight: 400;
  font-size: 22px;
  margin-bottom: var(--sp-5);
}

.cekmece__liste {
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
}
.cekmece__liste > div {
  display: flex;
  justify-content: space-between;
  padding-bottom: var(--sp-2);
  border-bottom: 1px solid var(--cizgi);
  font-size: 14px;
}

.cekmece__neden {
  margin-top: var(--sp-5);
  font-family: var(--f-display);
  font-weight: 300;
  font-size: 16px;
  color: var(--metin-2);
  border-left: 2px solid var(--elendi);
  padding-left: var(--sp-3);
}

.karsilastirma__tablo {
  font-size: 14px;
}
.karsilastirma__tablo th,
.karsilastirma__tablo td {
  padding: var(--sp-2) var(--sp-4);
  text-align: right;
  border-bottom: 1px solid var(--cizgi);
}
.karsilastirma__tablo th:first-child,
.karsilastirma__tablo td:first-child {
  text-align: left;
  color: var(--metin-3);
}
.en-iyi {
  color: var(--metin);
  font-weight: 500;
}
.karsilastirma__not {
  margin-top: var(--sp-4);
  font-family: var(--f-dar);
  font-size: 12.5px;
  color: var(--metin-3);
}
</style>
