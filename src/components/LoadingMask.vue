<template>
  <div class="loading-mask" :class="{ active: visible }">
    <div class="loading-box">
      <div class="spinner"></div>
      <div>{{ text }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingMask',
  props: {
    visible: { type: Boolean, default: false },
    text: { type: String, default: '正在处理...' }
  }
};
</script>
