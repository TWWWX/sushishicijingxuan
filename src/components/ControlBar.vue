<template>
  <div class="btn-bar">
    <input
      class="filler-input"
      type="text"
      :value="fillerName"
      maxlength="20"
      placeholder="填表人"
      @input="$emit('update:fillerName', $event.target.value)"
    />
    <div class="toolbar-right">
      <button class="btn btn-csv" @click="$emit('export-csv')">导出CSV</button>
      <button
        class="btn btn-upload"
        :disabled="uploading"
        @click="$emit('upload-csv')"
      >{{ uploading ? '上传中...' : '上传' }}</button>
      <button class="btn btn-png" @click="$emit('export-png')">导出图片</button>
      <button class="btn btn-reset" @click="$emit('reset')">清空表格</button>
      <div class="zoom-bar">
        <button class="btn zoom-btn" @click="$emit('zoom-out')" :disabled="zoom <= 0.4">-</button>
        <span class="zoom-label">{{ Math.round(zoom * 100) }}%</span>
        <button class="btn zoom-btn" @click="$emit('zoom-in')" :disabled="zoom >= 2">+</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ControlBar',
  props: {
    fillerName: { type: String, default: '' },
    zoom: { type: Number, default: 1 },
    uploading: { type: Boolean, default: false }
  }
};
</script>
