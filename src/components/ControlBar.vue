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
      <button class="btn btn-png" @click="$emit('export-png')">导出图片</button>
      <button class="btn btn-reset" @click="$emit('reset')">清空表格</button>
      <div class="upload-group">
        <input
          ref="csvFileInput"
          class="csv-file-input"
          type="file"
          accept=".csv"
          @change="onFileChange"
        />
        <button
          class="btn btn-upload"
          :disabled="uploading || !selectedFile"
          @click="handleUpload"
        >{{ uploading ? '上传中...' : '上传CSV' }}</button>
      </div>
      <div class="zoom-bar">
        <button class="btn zoom-btn" @click="$emit('zoom-out')" :disabled="zoom <= 0.4">-</button>
        <span class="zoom-label">{{ Math.round(zoom * 100) }}%</span>
        <button class="btn zoom-btn" @click="$emit('zoom-in')" :disabled="zoom >= 2">+</button>
      </div>
    </div>
    <div v-if="uploadMsg" class="upload-msg" :class="uploadMsgType">{{ uploadMsg }}</div>
  </div>
</template>

<script>
export default {
  name: 'ControlBar',
  props: {
    fillerName: { type: String, default: '' },
    zoom: { type: Number, default: 1 },
    mode: { type: String, default: '' }
  },
  data() {
    return {
      selectedFile: null,
      uploading: false,
      uploadMsg: '',
      uploadMsgType: ''
    };
  },
  methods: {
    onFileChange(e) {
      const f = e.target.files && e.target.files[0];
      this.selectedFile = f || null;
      this.uploadMsg = '';
    },
    async handleUpload() {
      if (!this.selectedFile || this.uploading) return;
      const folder = this.mode === '288' ? 'shiwen-288' : 'shiwen-64';
      this.uploading = true;
      this.uploadMsg = '';
      try {
        const res = await fetch(`/api/upload?fileName=${encodeURIComponent(this.selectedFile.name)}&folder=${folder}`);
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || '获取上传地址失败');
        }
        const data = await res.json();
        const putRes = await fetch(data.signedUrl, {
          method: 'PUT',
          body: this.selectedFile
        });
        if (!putRes.ok) throw new Error('上传至云端失败 (HTTP ' + putRes.status + ')');
        this.uploadMsg = '上传成功';
        this.uploadMsgType = 'success';
        this.selectedFile = null;
        if (this.$refs.csvFileInput) this.$refs.csvFileInput.value = '';
      } catch (err) {
        this.uploadMsg = '上传失败：' + (err.message || err);
        this.uploadMsgType = 'error';
      } finally {
        this.uploading = false;
      }
    }
  }
};
</script>
