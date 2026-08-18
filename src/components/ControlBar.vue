<template>
  <div>
    <div class="mode-bar">
      <button
        class="btn-mode"
        :class="{ disabled: currentMode === null }"
        :disabled="currentMode === null"
        @click="$emit('switch-mode', null)"
      >东坡墙的话</button>
      <button
        class="btn-mode"
        :class="{ disabled: currentMode === '288' }"
        :disabled="currentMode === '288'"
        @click="$emit('switch-mode', '288')"
      >288选1表格</button>
      <button
        class="btn-mode"
        :class="{ disabled: currentMode === '64' }"
        :disabled="currentMode === '64'"
        @click="$emit('switch-mode', '64')"
      >64选1表格</button>
      <div class="zoom-bar">
        <button class="btn zoom-btn" @click="$emit('zoom-out')" :disabled="zoom <= 0.4">-</button>
        <span class="zoom-label">{{ Math.round(zoom * 100) }}%</span>
        <button class="btn zoom-btn" @click="$emit('zoom-in')" :disabled="zoom >= 2">+</button>
        <button class="btn zoom-btn zoom-reset" @click="$emit('zoom-reset')">100%</button>
      </div>
    </div>
    <div class="btn-bar">
      <label class="filler-field">
        填表人：
        <input
          type="text"
          :value="fillerName"
          maxlength="20"
          placeholder=" "
          @input="$emit('update:fillerName', $event.target.value)"
        />
      </label>
      <button class="btn btn-csv" @click="$emit('export-csv')">导出CSV</button>
      <button class="btn btn-png" @click="$emit('export-png')">导出图片</button>
      <button class="btn btn-reset" @click="$emit('reset')">清空表格</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ControlBar',
  props: {
    fillerName: { type: String, default: '' },
    currentMode: { type: String, default: null },
    zoom: { type: Number, default: 1 }
  }
};
</script>

<style>
.zoom-bar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 16px;
  background: #fff;
  border: 1px solid #cfdccd;
  border-radius: 2px;
  padding: 3px 8px;
}
.zoom-btn {
  padding: 2px 10px !important;
  font-size: 13px !important;
  min-width: 28px;
  background: #f5f8f4 !important;
  color: #3e6b45 !important;
  border-color: #b8cdb8 !important;
  font-weight: 600;
  line-height: 1.4;
}
.zoom-btn:hover:not(:disabled) {
  background: #e3f1e5 !important;
  border-color: #6a9d72 !important;
}
.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.zoom-label {
  font-size: 12px;
  color: #4a7a52;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
  letter-spacing: 0;
}
.zoom-reset {
  font-size: 11px !important;
  padding: 2px 6px !important;
}
</style>
