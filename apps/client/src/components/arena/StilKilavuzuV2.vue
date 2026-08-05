<template>
  <div class="flex flex-col gap-5 p-4 mobile:p-3 max-w-[1400px] mx-auto">
    <div class="flex flex-col gap-1 rounded-lg border border-[var(--durdu)] bg-[rgba(255,77,90,0.08)] px-4 py-3">
      <span class="km-mono text-xs font-bold tracking-[0.14em] uppercase text-[var(--durdu)]">
        ÖRNEK DOKU — GERÇEK VERİ DEĞİL
      </span>
      <p class="text-xs text-[var(--metin-soluk)]">
        Bu sekme <code class="km-mono text-[var(--metin)]">specs/ARENA-SPEC-v2.md</code>'nin görsel
        tokenlerini gösterir. Aşağıdaki tüm sayılar/rozetler DOKU örneğidir; hiçbiri gerçek işlem,
        gerçek ölçüm ya da al-sat yönlendirmesi değildir. Arena paper modda çalışır, gerçek para yoktur.
      </p>
    </div>

    <!-- 1. Lig kimlik renkleri -->
    <section class="flex flex-col gap-2.5">
      <h3 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">1 · lig kimlik renkleri</h3>
      <div class="flex flex-wrap gap-3">
        <span
          v-for="l in LIGLER" :key="l.kod"
          class="km-mono text-xs font-semibold px-2.5 py-1 rounded"
          :class="l.kenarlikSinifi"
          :style="{ color: l.renk, background: l.dolgu, borderColor: l.renk }"
        >
          {{ l.kod }} · {{ l.ad }}
        </span>
      </div>
      <p class="text-[11px] text-[var(--metin-soluk)]">
        Üç kanallı kodlama: renk + 2 harfli kod + kenarlık deseni (retail düz · yarı-retail ince ·
        kurumsal çift çizgi · baseline kesikli). Renk kimliktir, hüküm değildir.
      </p>
    </section>

    <!-- 2. Tipografi -->
    <section class="flex flex-col gap-2 rounded-lg border border-[var(--cizgi)] bg-[var(--panel)] p-3.5">
      <h3 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">2 · tipografi</h3>
      <span class="km-mono text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">başlık 10px/0.14em uppercase</span>
      <span class="km-mono text-xs text-[var(--metin)]">gövde 11-12px — kural özeti, açıklama metni</span>
      <span class="km-mono text-[13px] font-semibold text-[var(--metin)]" style="font-variant-numeric: tabular-nums">sayı 12-13px semibold — 1 234,56</span>
      <span class="km-mono text-sm font-bold text-[var(--arena)]" style="font-variant-numeric: tabular-nums">imza sayısı 14px bold — Δ +2,14 puan</span>
    </section>

    <!-- 3. LED sözlüğü -->
    <section class="flex flex-col gap-2.5">
      <h3 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">3 · durum LED sözlüğü</h3>
      <div class="flex flex-wrap gap-4">
        <div v-for="d in LED_DURUMLARI" :key="d.etiket" class="flex flex-col items-center gap-1" :class="d.dis ?? ''">
          <div class="w-9 h-9 rounded-md border flex items-center justify-center" :class="d.kutu">
            <span class="w-2 h-2 rounded-full" :class="d.nokta"></span>
          </div>
          <span class="text-[9px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">{{ d.etiket }}</span>
        </div>
      </div>
    </section>

    <!-- 4. Örnek kol kartı (v2) -->
    <section class="flex flex-col gap-2">
      <h3 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">4 · örnek kol kartı</h3>
      <div class="flex flex-col gap-2.5 rounded-lg border border-[var(--cizgi)] bg-[var(--panel)] p-3.5 max-w-sm">
        <div class="flex items-center justify-between gap-2">
          <span class="km-mono text-sm font-semibold text-[var(--metin)] truncate">FVG Kanıt Vitrini</span>
          <span
            class="km-mono text-[10px] font-semibold px-1.5 py-0.5 rounded border-double border-2"
            :style="{ color: LIG_RETAIL.renk, background: LIG_RETAIL.dolgu, borderColor: LIG_RETAIL.renk }"
          >RT</span>
        </div>
        <p class="text-xs text-[var(--metin-soluk)]">künye: Deney-1 HQ-2026-001 · Fair Value Gap edge testi</p>

        <div class="flex items-center gap-2">
          <span class="km-mono text-[11px] font-bold px-1.5 py-0.5 rounded border" :class="ledSinifi('bekliyor').kutu" :style="{ color: 'var(--bekleyen)' }">DSR 0,58 · N=12</span>
          <span class="text-[10px] text-[var(--metin-soluk)]">deflated sharpe rozeti — n_trials her zaman görünür</span>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">walk-forward mini-şerit</span>
          <div class="flex gap-0.5 h-4 items-end">
            <div v-for="(h, i) in WF_ORNEK" :key="i" class="flex-1 rounded-sm" :style="{ height: h.yukseklik + '%', background: h.renk }"></div>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">MC sağlamlık</span>
          <div class="relative h-3 rounded-full overflow-hidden" style="background: var(--arena-dolgu)">
            <div class="absolute inset-y-0 rounded-full" style="left: 15%; right: 15%; background: rgba(216,224,234,0.18)"></div>
            <div class="absolute inset-y-0 rounded-full" style="left: 32%; right: 32%; background: rgba(216,224,234,0.32)"></div>
            <div class="absolute top-0 bottom-0 w-0.5" style="left: 61%; background: var(--bekleyen)"></div>
          </div>
          <span class="text-[10px] text-[var(--bekleyen)]">YELPAZE İÇİNDE — kural ölçülebilir katkı üretmedi</span>
        </div>

        <div class="border-t border-[var(--cizgi)] pt-2 flex flex-col gap-1.5">
          <div class="flex items-baseline justify-between gap-2 opacity-60 border-l border-dashed border-[var(--metin-soluk)] pl-2">
            <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">sürtünmesiz</span>
            <span class="km-mono text-xs text-[var(--metin)]">+1,84%</span>
          </div>
          <div class="flex items-baseline justify-between gap-2 border-l-2 border-[var(--metin)] pl-2">
            <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">gerçek-maliyet</span>
            <span class="km-mono text-xs font-semibold text-[var(--metin)]">+0,61%</span>
          </div>
          <div class="flex items-baseline justify-between gap-2 pl-2">
            <span class="text-[10px] tracking-[0.1em] uppercase text-[var(--metin-soluk)]">Δ baseline (eşleştirilmiş-rastgele)</span>
            <span class="km-mono text-xs font-bold text-[var(--metin-soluk)]">AYRILAMADI</span>
          </div>
        </div>

        <div class="rounded border border-[var(--hakem)] bg-[rgba(167,139,250,0.08)] px-2 py-1.5">
          <span class="km-mono text-[10px] font-bold text-[var(--hakem)]">ŞIK 3 — BELİRSİZ</span>
          <p class="text-[10px] text-[var(--metin-soluk)] mt-0.5">ablasyonun her iki kolunda da aynı şık · rapor: HQ-2026-001</p>
        </div>
      </div>
    </section>

    <!-- 5. Örnek kampanya tablosu satırı -->
    <section class="flex flex-col gap-2">
      <h3 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">5 · örnek kampanya tablosu satırı</h3>
      <div class="overflow-x-auto rounded-lg border border-[var(--cizgi)]">
        <table class="km-mono text-[11px] w-full min-w-[820px]">
          <thead>
            <tr class="text-[9px] tracking-[0.1em] uppercase text-[var(--metin-soluk)] border-b border-[var(--cizgi)]">
              <th class="text-left px-2 py-1.5">kol</th>
              <th class="text-left px-2 py-1.5">lig</th>
              <th class="text-right px-2 py-1.5">trades</th>
              <th class="text-right px-2 py-1.5">return</th>
              <th class="text-right px-2 py-1.5">maxdd</th>
              <th class="text-right px-2 py-1.5">pf</th>
              <th class="text-right px-2 py-1.5">sharpe</th>
              <th class="text-right px-2 py-1.5">dsr</th>
              <th class="text-right px-2 py-1.5">n</th>
              <th class="text-right px-2 py-1.5">persistence</th>
              <th class="text-right px-2 py-1.5">Δ baseline</th>
              <th class="text-right px-2 py-1.5">makas</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b border-[var(--cizgi)] text-[var(--metin)]" style="height: 28px">
              <td class="px-2">momentum-12m</td>
              <td class="px-2" :style="{ color: LIG_KURUMSAL.renk }">KR</td>
              <td class="text-right px-2">184</td>
              <td class="text-right px-2">+6,20%</td>
              <td class="text-right px-2 text-[var(--durdu)]">-3,10%</td>
              <td class="text-right px-2">1,42</td>
              <td class="text-right px-2">0,91</td>
              <td class="text-right px-2">0,77</td>
              <td class="text-right px-2">36</td>
              <td class="text-right px-2">0,67</td>
              <td class="text-right px-2 text-[var(--arena)]">+0,34</td>
              <td class="text-right px-2">1,12pp</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 6. MC yelpaze dokusu -->
    <section class="flex flex-col gap-2 max-w-md">
      <h3 class="text-[10px] tracking-[0.14em] uppercase text-[var(--metin-soluk)]">6 · MC yelpaze dokusu</h3>
      <div class="relative h-6 rounded-md overflow-hidden border border-[var(--cizgi)]">
        <div class="absolute inset-y-0" style="left: 4%; right: 4%; background: rgba(216,224,234,0.10)"></div>
        <div class="absolute inset-y-0" style="left: 24%; right: 24%; background: rgba(216,224,234,0.22)"></div>
        <div class="absolute top-0 bottom-0 w-px" style="left: 50%; background: var(--metin-soluk)"></div>
        <div class="absolute top-0 bottom-0 w-0.5" style="left: 71%; background: var(--akis)"></div>
      </div>
      <div class="flex justify-between text-[9px] text-[var(--metin-soluk)]">
        <span>p05</span><span>p25</span><span>p50 (medyan)</span><span>p75</span><span>p95</span>
      </div>
      <p class="text-[10px] text-[var(--metin-soluk)]">koyu çizgi = gözlenen değer; yelpaze dışında → <span style="color: var(--akis)">--akis</span> rengi.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
const LIG_RETAIL = { kod: 'RT', ad: 'RETAIL', renk: 'var(--lig-retail)', dolgu: 'var(--lig-retail-dolgu)', kenarlikSinifi: 'border' };
const LIG_YARI = { kod: 'YR', ad: 'YARI-RETAİL', renk: 'var(--lig-yari)', dolgu: 'var(--lig-yari-dolgu)', kenarlikSinifi: 'border' };
const LIG_KURUMSAL = { kod: 'KR', ad: 'KURUMSAL', renk: 'var(--lig-kurumsal)', dolgu: 'var(--lig-kurumsal-dolgu)', kenarlikSinifi: 'border-double border-2' };
const LIG_BASELINE = { kod: 'BL', ad: 'BASELINE', renk: 'var(--lig-baseline)', dolgu: 'var(--lig-baseline-dolgu)', kenarlikSinifi: 'border-dashed border' };
const LIGLER = [LIG_RETAIL, LIG_YARI, LIG_KURUMSAL, LIG_BASELINE];

function ledSinifi(durum: 'akiyor' | 'bekliyor' | 'hata' | null) {
  switch (durum) {
    case 'akiyor': return { kutu: 'border-[var(--akis)]', nokta: 'bg-[var(--akis)]' };
    case 'bekliyor': return { kutu: 'border-[var(--bekleyen)]', nokta: 'bg-[var(--bekleyen)]' };
    case 'hata': return { kutu: 'border-[var(--durdu)]', nokta: 'bg-[var(--durdu)]' };
    default: return { kutu: 'border-dashed border-[var(--metin-soluk)]', nokta: 'bg-[var(--metin-soluk)]' };
  }
}

const LED_DURUMLARI = [
  { etiket: 'akiyor', kutu: 'border-[var(--akis)]', nokta: 'bg-[var(--akis)]' },
  { etiket: 'bekliyor', kutu: 'border-[var(--bekleyen)]', nokta: 'bg-[var(--bekleyen)]' },
  { etiket: 'hata', kutu: 'border-[var(--durdu)]', nokta: 'bg-[var(--durdu)]' },
  { etiket: 'yok / null', kutu: 'border-dashed border-[var(--metin-soluk)]', nokta: 'bg-[var(--metin-soluk)]' },
  { etiket: 'donduruldu', kutu: 'border-[var(--metin-soluk)]', nokta: 'bg-[var(--metin-soluk)]', dis: 'opacity-50' },
  { etiket: 'bayat (v2)', kutu: 'border-[var(--bekleyen)]', nokta: 'border border-[var(--bekleyen)]' },
  { etiket: 'karantina (v2)', kutu: 'border-double border-2 border-[var(--hakem)]', nokta: 'bg-[var(--hakem)]' },
];

const WF_ORNEK = [
  { yukseklik: 40, renk: 'var(--bekleyen)' },
  { yukseklik: 70, renk: 'var(--akis)' },
  { yukseklik: 25, renk: 'var(--durdu)' },
  { yukseklik: 55, renk: 'var(--akis)' },
  { yukseklik: 45, renk: 'var(--bekleyen)' },
];
</script>
