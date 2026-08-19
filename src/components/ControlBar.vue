<template>
  <div class="btn-bar">
    <label class="filler-field">
      填表人：
      <input
        type="text"
        :value="fillerName"
        maxlength="20"
        placeholder="请输入姓名"
        @input="$emit('update:fillerName', $event.target.value)"
      />
    </label>
    <div class="toolbar-right">
      <button class="btn btn-csv" @click="$emit('export-csv')">导出CSV</button>
      <button class="btn btn-png" @click="$emit('export-png')">导出图片</button>
      <button class="btn btn-reset" @click="$emit('reset')">清空表格</button>
      <div class="zoom-bar">
        <button class="btn zoom-btn" @click="$emit('zoom-out')" :disabled="zoom <= 0.4">-</button>
        <span class="zoom-label">{{ Math.round(zoom * 100) }}%</span>
        <button class="btn zoom-btn" @click="$emit('zoom-in')" :disabled="zoom >= 2">+</button>
        <button class="btn zoom-btn zoom-reset" @click="$emit('zoom-reset')">100%</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ControlBar',
  props: {
    fillerName: { type: String, default: '' },
    zoom: { type: Number, default: 1 }
  }
};
</script>
