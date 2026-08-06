<template>
  <div class="rounded-lg border border-[var(--cizgi)] bg-[var(--panel)] p-2 mobile:p-1.5 overflow-x-auto">
    <table v-if="satirlar.length > 0" class="w-full text-[11px] km-mono min-w-[52rem]">
      <thead>
        <tr class="text-[9px] tracking-[0.1em] uppercase text-[var(--metin-soluk)] text-left border-b border-[var(--cizgi)] sticky top-0 bg-[var(--panel)] z-10">
          <th class="py-1 pr-1.5 font-normal">kol</th>
          <th class="py-1 pr-1.5 font-normal">lig</th>
          <th class="py-1 pr-1.5 font-normal text-right">trades</th>
          <th class="py-1 pr-1.5 font-normal text-right">return</th>
          <th class="py-1 pr-1.5 font-normal text-right">maxdd</th>
          <th class="py-1 pr-1.5 font-normal text-right">pf</th>
          <th class="py-1 pr-1.5 font-normal text-right">sharpe</th>
          <th class="py-1 pr-1.5 font-normal text-right">dsr</th>
          <th class="py-1 pr-1.5 font-normal text-right">n</th>
          <th class="py-1 pr-1.5 font-normal text-right">persistence</th>
          <th class="py-1 pr-1.5 font-normal text-right">Δ baseline</th>
          <th class="py-1 font-normal text-right">makas</th>
        </tr>
      </thead>
      <!-- >200 satır: content-visibility ile boya maliyeti kısılır (spec §6.3
           kapısı). >1000 VE ölçülmüş >16ms olursa kütüphanesiz pencereleme
           gerekir — bu depoda henüz o ölçek yok, o yüzden yazılmadı
           (ponytail: skipped, add when row count crosses 1000). -->
      <tbody :style="satirlar.length > 200 ? { contentVisibility: 'auto', containIntrinsicSize: '0 24px' } : {}">
        <tr
          v-for="s in satirlar" :key="s.id"
          class="km-satir border-b border-[var(--cizgi)] cursor-pointer"
          style="height: 24px"
          :style="ligKenarStili(s.kol.lig)"
          @click="emit('sec', s.kol)"
        >
          <td class="pr-1.5 text-[var(--metin)] truncate max-w-[10rem]">{{ s.ad }}</td>
          <td class="pr-1.5 border-r border-[rgba(28,38,53,0.6)]"><LigRozeti :lig="s.kol.lig" /></td>
          <td class="pr-1.5 text-right text-[var(--metin)]" style="font-variant-numeric: tabular-nums">{{ s.trades }}</td>
          <td class="pr-1.5 text-right" style="font-variant-numeric: tabular-nums" :class="isaretRengi(s.return)">{{ fmtYuzde(s.return) }}</td>
          <td class="pr-1.5 text-right text-[var(--durdu)]" style="font-variant-numeric: tabular-nums">{{ fmtYuzde(s.maxdd) }}</td>
          <td class="pr-1.5 text-right text-[var(--metin)]" style="font-variant-numeric: tabular-nums">{{ fmtSayi(s.pf) }}</td>
          <td class="pr-1.5 text-right text-[var(--metin)] border-r border-[rgba(28,38,53,0.6)]" style="font-variant-numeric: tabular-nums">{{ fmtSayi(s.sharpe) }}</td>
          <td class="pr-1.5 text-right" style="font-variant-numeric: tabular-nums">
            <span
              class="px-1 rounded border"
              :class="(satirNTrials(s) === null || s.dsr === null) ? 'border-dashed border-[var(--metin-soluk)] text-[var(--metin-soluk)]' : 'border-transparent text-[var(--metin)]'"
            >{{ (satirNTrials(s) === null || s.dsr === null) ? 'DSR YOK' : fmtSayi(s.dsr) }}</span>
          </td>
          <td class="pr-1.5 text-right text-[var(--metin)]" style="font-variant-numeric: tabular-nums">{{ satirNTrials(s) ?? '—' }}</td>
          <td class="pr-1.5 text-right text-[var(--metin)]" style="font-variant-numeric: tabular-nums">{{ fmtOran(s.persistence) }}</td>
          <td class="pr-1.5 text-right" style="font-variant-numeric: tabular-nums" :class="deltaBaselineRengi(s)">{{ deltaBaselineMetni(s) }}</td>
          <td class="text-right font-bold text-[var(--arena)]" style="font-variant-numeric: tabular-nums">{{ s.makas === null ? 'veri yok' : fmtPuan(s.makas) }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else class="text-xs text-[var(--metin-soluk)]">Kampanya tablosu boş — henüz kol yok.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Kol, Lig, TeraziKunyesi } from '../../composables/useArenaDurum';
import LigRozeti from './LigRozeti.vue';

// Faz D.2 mikro-doku: satır sol kenarında sabit-şiddette lig rengi (kart
// şeridiyle aynı ilke - kimlik, duruma göre değişmez, spec §5.1).
const LIG_RENK_ADI: Record<Lig, string> = { retail: 'retail', yari_retail: 'yari', kurumsal: 'kurumsal', baseline: 'baseline' };
function ligKenarStili(lig: Lig | null): Record<string, string> {
  if (!lig) return {};
  const ad = LIG_RENK_ADI[lig];
  return { '--satir-lig': `var(--lig-${ad})` };
}

const props = defineProps<{ kollar: Kol[] | null; terazi?: TeraziKunyesi | null }>();
const emit = defineEmits<{ sec: [kol: Kol] }>();

// n_trials KOL-BAŞINA okunur (dhr-2 sonrası): kampanya kolları farklı
// (kampanya-geneli) bir n_trials taşır, terazi.n_trials yalnız elle tanımlı
// harness kolları için doğrudur. terazi'ninki yalnız kol kendi n_trials'ını
// taşımıyorsa (eski/eksik veri) yedek olarak kullanılır.
function satirNTrials(s: Satir): number | null {
  return s.kol.n_trials ?? props.terazi?.n_trials ?? null;
}

interface Satir {
  id: string; ad: string; kol: Kol;
  trades: number | null; return: number | null; maxdd: number | null;
  pf: number | null; sharpe: number | null; dsr: number | null;
  persistence: number | null; makas: number | null;
}

// RETURN/MAXDD/SHARPE gerçek-maliyet defterinden (spec §5.3); sürtünmesiz
// yalnız MAKAS için kullanılır.
const satirlar = computed<Satir[]>(() => {
  const liste = (props.kollar ?? []).map(k => {
    const g = k.defterler?.gercek_maliyet ?? null;
    const s = k.defterler?.surtunmesiz ?? null;
    const makas = (s?.net_getiri_yuzde != null && g?.net_getiri_yuzde != null)
      ? s.net_getiri_yuzde - g.net_getiri_yuzde
      : null;
    return {
      id: k.id ?? k.ad ?? '?',
      ad: k.ad ?? 'isimsiz kol',
      kol: k,
      trades: g?.islem_sayisi ?? null,
      return: g?.net_getiri_yuzde ?? null,
      maxdd: g?.max_dd_yuzde ?? null,
      pf: g?.profit_factor ?? null,
      sharpe: g?.sharpe ?? null,
      dsr: g?.deflated_sharpe ?? null,
      persistence: g?.kalicilik ?? null,
      makas
    } as Satir;
  });
  // Varsayılan sıralama: lig, sonra Δ baseline mutlak değeri (spec §5.3) —
  // "en yüksek Sharpe" DEĞİL, panel bir liderlik tablosu değildir.
  const ligSirasi: Record<string, number> = { retail: 0, yari_retail: 1, kurumsal: 2, baseline: 3 };
  return liste.sort((a, b) => {
    const la = ligSirasi[a.kol.lig ?? ''] ?? 9;
    const lb = ligSirasi[b.kol.lig ?? ''] ?? 9;
    if (la !== lb) return la - lb;
    const da = Math.abs(a.kol.baseline_karsilastirma?.delta_sharpe ?? 0);
    const db = Math.abs(b.kol.baseline_karsilastirma?.delta_sharpe ?? 0);
    return db - da;
  });
});

function fmtYuzde(v: number | null): string {
  if (v === null) return 'veri yok';
  const isaret = v > 0 ? '+' : '';
  return `${isaret}${v.toFixed(2)}%`;
}
function fmtPuan(v: number): string {
  const isaret = v > 0 ? '+' : '';
  return `${isaret}${v.toFixed(2)}pp`;
}
function fmtSayi(v: number | null): string {
  return v === null ? '—' : v.toFixed(2);
}
function fmtOran(v: number | null): string {
  return v === null ? '—' : v.toFixed(2);
}
function isaretRengi(v: number | null): string {
  if (v === null) return 'text-[var(--metin-soluk)]';
  return v >= 0 ? 'text-[var(--akis)]' : 'text-[var(--durdu)]';
}
function deltaBaselineMetni(s: Satir): string {
  const bk = s.kol.baseline_karsilastirma;
  if (bk?.simetri_sonucu === 'basarisiz') return 'BLOKLANDI';
  if (bk?.simetri_sonucu === 'uygulanamaz') return 'UYGULANAMAZ';
  if (bk?.simetri_sonucu === 'yetersiz') return 'YETERSİZ';
  if (bk?.ayrilabildi_mi === false) return 'AYRILAMADI';
  if (bk?.delta_sharpe == null) return 'veri yok';
  const isaret = bk.delta_sharpe > 0 ? '+' : '';
  return `${isaret}${bk.delta_sharpe.toFixed(2)}`;
}
function deltaBaselineRengi(s: Satir): string {
  const bk = s.kol.baseline_karsilastirma;
  if (
    bk?.simetri_sonucu === 'basarisiz' ||
    bk?.simetri_sonucu === 'uygulanamaz' ||
    bk?.simetri_sonucu === 'yetersiz' ||
    bk?.ayrilabildi_mi === false ||
    bk?.delta_sharpe == null
  ) {
    return 'text-[var(--metin-soluk)]';
  }
  return 'text-[var(--metin)]';
}
</script>
