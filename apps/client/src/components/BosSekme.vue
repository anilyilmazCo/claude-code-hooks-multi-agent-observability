<template>
  <div class="flex-1 flex items-center justify-center px-6 py-16 mobile:px-4 mobile:py-10">
    <p class="text-sm mobile:text-xs text-[var(--metin-soluk)] max-w-md text-center leading-relaxed">
      {{ mesaj }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ mesaj: string }>();
</script>
