<template>
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
</template>

<script>
export default {
  name: 'ControlBar',
  props: {
    fillerName: { type: String, default: '' }
  }
};
</script>
