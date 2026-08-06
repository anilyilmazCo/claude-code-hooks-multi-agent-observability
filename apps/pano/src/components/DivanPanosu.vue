<template>
  <section class="panel">
    <div v-if="!kayitlar" class="yukleniyor">Karar kayıtları yükleniyor…</div>
    <div v-else class="liste">
      <article v-for="k in siraliKayitlar" :key="k.dosya" class="kart">
        <div class="kart__ust">
          <span class="kart__tarih">{{ tarihEtiketle(k.tarih) }}</span>
          <span class="cip" :class="k.durum === 'karara_baglandi' ? 'cip--gecti' : 'cip--altin'">
            {{ k.durum === 'karara_baglandi' ? 'KARARA BAĞLANDI' : 'AÇIK' }}
          </span>
        </div>
        <h3 class="kart__baslik">{{ k.baslik }}</h3>
        <p v-if="k.hukum" class="kart__hukum">{{ k.hukum }}</p>
        <p v-else class="kart__hukum kart__hukum--yok">Henüz bir hüküm kaydedilmedi — karar dosyası açık.</p>
        <p class="kart__kaynak">{{ k.dosya }}</p>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DivanKaydi } from '../composables/useVeri'

const props = defineProps<{ kayitlar: DivanKaydi[] | null }>()

const siraliKayitlar = computed(() => {
  if (!props.kayitlar) return []
  return [...props.kayitlar].sort((a, b) => {
    if (a.durum !== b.durum) return a.durum === 'acik' ? -1 : 1
    return (b.tarih ?? '').localeCompare(a.tarih ?? '')
  })
})

function tarihEtiketle(tarih: string | null): string {
  if (!tarih) return 'tarih yok'
  const d = new Date(tarih + 'T00:00:00Z')
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).toUpperCase()
}
</script>

<style scoped>
.panel {
  max-width: 760px;
}

.yukleniyor {
  color: var(--metin-3);
  font-size: 14px;
}

.liste {
  display: flex;
  flex-direction: column;
  gap: var(--sp-5);
}

.kart {
  background: var(--yuzey);
  border-radius: var(--r-m);
  box-shadow: var(--golge-1), var(--ic-kenar);
  padding: var(--sp-6);
}

.kart__ust {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--sp-2);
}

.kart__tarih {
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--metin-3);
}

.cip {
  padding: 2px 8px;
  border-radius: var(--r-s);
  border: 1px solid;
  font-family: var(--f-dar);
  font-weight: 600;
  font-size: 10.5px;
  letter-spacing: 0.08em;
}
.cip--gecti {
  color: var(--gecti);
  border-color: var(--gecti);
}
.cip--altin {
  color: var(--altin);
  border-color: var(--altin);
}

.kart__baslik {
  font-family: var(--f-display);
  font-weight: 400;
  font-size: 22px;
  margin-bottom: var(--sp-4);
  color: var(--metin);
}

.kart__hukum {
  font-family: var(--f-display);
  font-weight: 300;
  font-size: 19px;
  line-height: 1.5;
  max-width: 68ch;
  border-left: 2px solid var(--altin);
  padding-left: var(--sp-4);
  color: var(--metin);
  margin-bottom: var(--sp-4);
}
.kart__hukum--yok {
  color: var(--metin-3);
  border-left-color: var(--cizgi);
  font-style: normal;
}

.kart__kaynak {
  font-family: var(--f-dar);
  font-size: 12.5px;
  color: var(--metin-3);
}
</style>
