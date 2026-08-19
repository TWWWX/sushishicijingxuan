<template>
  <div id="app-root">
    <!-- 主页 -->
    <div v-if="!mode" class="homepage">
      <div class="home-header">
        <div class="home-title-row">
          <span class="title-line"></span>
          <h1 class="home-title">苏轼诗文作品 n 选 1</h1>
          <span class="title-line"></span>
        </div>
        <p class="home-subtitle">— 东坡墙 —</p>
      </div>

      <div class="author-note-wrapper">
        <div class="author-note-bar"></div>
        <div class="author-note-box">网页制作 - 蟋蟀丨诗文筛汇 - 嫻菜无敌 蟋蟀
欢迎关注公众号「东坡墙」QQ「3301590656」</div>
      </div>

      <div class="entry-cards">
        <div class="entry-card" @click="switchMode('64')">
          <div class="card-deco-bar"></div>
          <div class="card-body">
            <div class="card-title">苏轼诗文作品</div>
            <div class="card-subtitle">64选1</div>
          </div>
        </div>
        <div class="entry-card" @click="switchMode('288')">
          <div class="card-deco-bar"></div>
          <div class="card-body">
            <div class="card-title">苏轼诗文作品</div>
            <div class="card-subtitle">288选1</div>
          </div>
        </div>
      </div>

      <div class="random-poem">
        <div>「{{ randomPoemContent }}」</div>
        <div class="random-poem-title">{{ randomPoemTitle }}</div>
      </div>
    </div>

    <!-- 表格页 -->
    <div v-else class="table-page">
      <div class="table-page-header">
        <a class="back-link" @click="switchMode(null)">← 返回主页</a>
        <div class="tabs">
          <div class="tab" :class="{ active: mode === '64' }" @click="switchMode('64')">苏轼诗文作品64选1</div>
          <div class="tab" :class="{ active: mode === '288' }" @click="switchMode('288')">苏轼诗文作品288选1</div>
        </div>
      </div>

      <div class="table-title-row">
        <div class="title-deco-bar"></div>
        <h2 class="table-page-title">{{ meta.title }}</h2>
        <p class="hint">单击单元格 → 快速向右填充 &nbsp;&nbsp;|&nbsp;&nbsp; 双击单元格 → 编辑内容 &nbsp;&nbsp;|&nbsp;&nbsp; 双击表头列 ↔ 隐藏/显示该列诗文内容</p>
      </div>

      <ControlBar
        :filler-name.sync="fillerName"
        :zoom="zoom"
        :uploading="uploading"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @zoom-reset="zoomReset"
        @export-csv="handleExportCSV"
        @upload-csv="handleUploadCSV"
        @export-png="handleExportPNG"
        @reset="handleReset"
      />

      <TournamentTable
        :key="'t-' + mode"
        :cell-data="currentState.cellData"
        :fill-target-map="currentState.fillTargetMap"
        :col-hide-content="currentState.colHideContent"
        :column-config="meta.columnConfig"
        :header-labels="meta.headerLabels"
        :total-rows="totalRows"
        @header-dblclick="handleHeaderDblClick"
        @cell-click="handleCellClick"
        @cell-edit="handleCellEdit"
      />
      <DlcPanel
        :key="'d-' + mode"
        :dlc-data="currentState.dlcData"
        :selected-dlc-idx="currentState.selectedDlcIdx"
        @dlc-select="handleDlcSelect"
      />
    </div>

    <LoadingMask :visible="loadingVisible" :text="loadingText" />
  </div>
</template>

<script>
import ControlBar from './components/ControlBar.vue';
import TournamentTable from './components/TournamentTable.vue';
import DlcPanel from './components/DlcPanel.vue';
import LoadingMask from './components/LoadingMask.vue';
import {
  MODES,
  MODE_META,
  getCellKey,
  buildInitialCellData,
  defaultDlcByMode
} from './data/poems';
import {
  cloneData,
  dataEqual,
  parsePlainToPoem,
  loadDlcFile,
  parseDlcText
} from './utils/poem';
import { scheduleAutoFit } from './utils/columnWidth';
import { exportCSV as exportCSVUtil, exportPNG as exportPNGUtil, uploadCSV as uploadCSVUtil } from './utils/export';

function freshState() {
  return {
    cellData: {},
    fillSourceMap: {},
    fillTargetMap: {},
    colHideContent: [false, false, false, false, false, false, false],
    selectedDlcIdx: null,
    dlcData: [],
    dataLoaded: false,
    dlcLoaded: false
  };
}

async function loadMainFile(url, fallback) {
  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (resp.ok) {
      const text = await resp.text();
      const parsed = parseDlcText(text);
      if (parsed && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return fallback ? [...fallback] : [];
}

export default {
  name: 'App',
  components: {
    ControlBar,
    TournamentTable,
    DlcPanel,
    LoadingMask
  },
  data() {
    return {
      fillerName: '',
      mode: null,
      zoom: 1,
      uploading: false,
      loadingVisible: false,
      loadingText: '正在处理...',
      randomPoemContent: '',
      randomPoemTitle: '',
      perMode: {
        [MODES.M64]: freshState(),
        [MODES.M288]: freshState()
      }
    };
  },
  computed: {
    meta() {
      if (!this.mode) return null;
      return MODE_META[this.mode];
    },
    totalRows() {
      if (!this.mode) return 0;
      const cfg = MODE_META[this.mode]?.columnConfig;
      if (!cfg || cfg.length === 0) return 0;
      return cfg[0].count * cfg[0].rowSpan;
    },
    currentState() {
      if (!this.mode) return freshState();
      return this.perMode[this.mode];
    }
  },
  mounted() {
    this.fetchRandomPoem();
  },
  watch: {
    zoom: {
      immediate: true,
      handler(v) {
        this.$nextTick(() => this.applyZoom(v));
      }
    },
    mode() {
      this.$nextTick(() => this.applyZoom(this.zoom));
    }
  },
  methods: {
    async fetchRandomPoem() {
      const files = [
        '苏轼诗词精选288选1.txt',
        '苏轼诗词精选288选1dlc.txt',
        '苏轼诗词精选64版1.txt',
        '苏轼诗词精选64选1dlc.txt'
      ];
      const all = [];
      for (const f of files) {
        try {
          const resp = await fetch(f, { cache: 'no-store' });
          if (resp.ok) {
            const text = await resp.text();
            const parsed = parseDlcText(text);
            if (parsed && parsed.length > 0) all.push(...parsed);
          }
        } catch (e) {}
      }
      if (all.length > 0) {
        const p = all[Math.floor(Math.random() * all.length)];
        this.randomPoemContent = p.content || '';
        this.randomPoemTitle = p.title || '';
      }
    },
    applyZoom(z) {
      const v = (typeof z === 'number' && z > 0) ? z : 1;
      const t1 = document.getElementById('tournamentTable');
      if (t1) t1.style.zoom = v;
      const t2 = document.getElementById('dlcTable');
      if (t2) t2.style.zoom = v;
    },
    zoomIn() { this.zoom = Math.min(2, Math.round((this.zoom + 0.1) * 10) / 10); },
    zoomOut() { this.zoom = Math.max(0.4, Math.round((this.zoom - 0.1) * 10) / 10); },
    zoomReset() { this.zoom = 1; },
    showLoading(text) {
      this.loadingText = text || '正在处理...';
      this.loadingVisible = true;
    },
    hideLoading() {
      this.loadingVisible = false;
    },
    scheduleAutoFitAll() {
      this.$nextTick(() => {
        if (this.mode) {
          scheduleAutoFit('tournamentTable', this.currentState.colHideContent);
          scheduleAutoFit('dlcTable', null);
        }
      });
    },
    refreshSourceStyle(key) {
      const s = this.currentState;
      this.$set(s.fillTargetMap, key, s.fillTargetMap[key] || {});
    },
    detachFromSource(targetKey) {
      const s = this.currentState;
      const oldSourceKey = s.fillSourceMap[targetKey];
      if (oldSourceKey && s.fillTargetMap[oldSourceKey]) {
        this.$delete(s.fillTargetMap[oldSourceKey], targetKey);
        this.refreshSourceStyle(oldSourceKey);
        this.propagateDown(oldSourceKey);
      }
      this.$delete(s.fillSourceMap, targetKey);
    },
    attachToSource(sourceKey, targetKey) {
      const s = this.currentState;
      this.detachFromSource(targetKey);
      this.$set(s.fillSourceMap, targetKey, sourceKey);
      if (!s.fillTargetMap[sourceKey]) {
        this.$set(s.fillTargetMap, sourceKey, {});
      }
      this.$set(s.fillTargetMap[sourceKey], targetKey, true);
      this.refreshSourceStyle(sourceKey);
    },
    propagateDown(sourceKey) {
      const s = this.currentState;
      const targets = s.fillTargetMap[sourceKey];
      if (!targets) return;
      Object.keys(targets).forEach((targetKey) => {
        if (s.cellData[sourceKey] !== undefined) {
          const oldVal = s.cellData[targetKey];
          const newVal = cloneData(s.cellData[sourceKey]);
          if (!dataEqual(oldVal, newVal)) {
            this.$set(s.cellData, targetKey, newVal);
            this.propagateDown(targetKey);
          }
        }
      });
    },
    handleHeaderDblClick(col) {
      if (!this.mode) return;
      if (col < 0 || col > 6) return;
      const s = this.currentState;
      this.$set(s.colHideContent, col, !s.colHideContent[col]);
      this.$nextTick(() => {
        scheduleAutoFit('tournamentTable', s.colHideContent);
      });
    },
    handleCellClick({ col, rowInCol, key }) {
      if (!this.mode) return;
      const s = this.currentState;

      if (col === 0 && s.selectedDlcIdx !== null && s.selectedDlcIdx >= 0 && s.selectedDlcIdx < s.dlcData.length) {
        const mainCurrent = s.cellData[key] ? cloneData(s.cellData[key]) : null;
        const dlcCurrent = cloneData(s.dlcData[s.selectedDlcIdx]);

        if (mainCurrent && typeof mainCurrent === 'object' && mainCurrent.title !== undefined) {
          this.$set(s.dlcData, s.selectedDlcIdx, {
            title: mainCurrent.title,
            content: mainCurrent.content || ''
          });
        } else if (typeof mainCurrent === 'string') {
          const parsed = parsePlainToPoem(mainCurrent);
          this.$set(s.dlcData, s.selectedDlcIdx, parsed);
        } else {
          this.$set(s.dlcData, s.selectedDlcIdx, { title: '', content: '' });
        }

        this.$set(s.cellData, key, { title: dlcCurrent.title, content: dlcCurrent.content });
        this.detachFromSource(key);
        this.propagateDown(key);

        s.selectedDlcIdx = null;
        this.scheduleAutoFitAll();
        return;
      }

      if (s.cellData[key] === undefined) return;
      if (col >= this.meta.columnConfig.length - 1) return;

      const nextCol = col + 1;
      const curRowSpan = this.meta.columnConfig[col].rowSpan;
      const nextRowSpan = this.meta.columnConfig[nextCol].rowSpan;
      const ratio = Math.max(1, Math.floor(nextRowSpan / curRowSpan));
      const nextRowInCol = Math.floor(rowInCol / ratio);
      const targetKey = getCellKey(nextCol, nextRowInCol);

      this.attachToSource(key, targetKey);
      this.$set(s.cellData, targetKey, cloneData(s.cellData[key]));
      this.propagateDown(targetKey);

      this.$nextTick(() => {
        scheduleAutoFit('tournamentTable', s.colHideContent);
      });
    },
    handleCellEdit({ key, oldVal, newVal, trigger }) {
      if (!this.mode) return;
      const s = this.currentState;
      let changed;
      if (newVal === undefined) {
        changed = oldVal !== undefined;
        this.$delete(s.cellData, key);
      } else {
        this.$set(s.cellData, key, newVal);
        changed = !dataEqual(oldVal, newVal);
      }
      if (changed) {
        this.detachFromSource(key);
        this.propagateDown(key);
      }
      this.$nextTick(() => {
        scheduleAutoFit('tournamentTable', s.colHideContent);
      });
    },
    handleDlcSelect(idx) {
      if (!this.mode) return;
      const s = this.currentState;
      if (idx < 0 || idx >= s.dlcData.length) return;
      s.selectedDlcIdx = (s.selectedDlcIdx === idx) ? null : idx;
    },
    handleExportCSV() {
      if (!this.mode) return;
      const s = this.currentState;
      exportCSVUtil({
        cellData: s.cellData,
        columnConfig: this.meta.columnConfig,
        headerLabels: this.meta.headerLabels,
        totalRows: this.totalRows,
        title: this.meta.title
      });
    },
    async handleUploadCSV() {
      if (!this.mode) return;
      if (this.uploading) return;
      this.uploading = true;
      try {
        const folder = this.mode === '288' ? 'shiwen-288' : 'shiwen-64';
        await uploadCSVUtil({
          cellData: this.currentState.cellData,
          columnConfig: this.meta.columnConfig,
          headerLabels: this.meta.headerLabels,
          totalRows: this.totalRows,
          title: this.meta.title,
          folder,
          onStatus: (status, errMsg) => {
            if (status === 'success') {
              alert('上传成功');
            } else if (status === 'error') {
              alert('上传失败：' + (errMsg || '未知错误'));
            }
          }
        });
      } catch (err) {
        alert('上传失败：' + (err.message || '未知错误'));
      } finally {
        this.uploading = false;
      }
    },
    handleExportPNG() {
      if (!this.mode) return;
      exportPNGUtil({
        fillerName: this.fillerName,
        loadingCallbacks: {
          show: (t) => this.showLoading(t),
          hide: () => this.hideLoading()
        },
        title: this.meta.title
      });
    },
    handleReset() {
      if (!this.mode) return;
      if (!confirm('确定要清空表格并恢复初始状态吗？当前表格第一列诗文将恢复原文，其他列将全部清空。')) return;
      const m = this.mode;
      this.resetModeState(m, false);
      this.$nextTick(() => {
        this.ensureLoaded(m);
        this.scheduleAutoFitAll();
      });
    },
    resetModeState(m, keepLoadFlags) {
      const prev = this.perMode[m];
      const fresh = freshState();
      if (keepLoadFlags && prev) {
        fresh.dataLoaded = prev.dataLoaded;
        fresh.dlcLoaded = prev.dlcLoaded;
      }
      this.$set(this.perMode, m, fresh);
    },
    async ensureMainData(modeKey) {
      const s = this.perMode[modeKey];
      const meta = MODE_META[modeKey];
      if (!s.dataLoaded) {
        s.cellData = buildInitialCellData(modeKey);
        const count = meta.columnConfig[0].count;
        const fromFile = await loadMainFile(meta.dataFile, null);
        if (fromFile && fromFile.length > 0) {
          for (let i = 0; i < count; i++) {
            const key = getCellKey(0, i);
            const poem = fromFile[i];
            if (poem) {
              this.$set(s.cellData, key, { title: poem.title, content: poem.content });
            }
          }
        }
        s.dataLoaded = true;
      }
    },
    async ensureDlc(modeKey) {
      const s = this.perMode[modeKey];
      const meta = MODE_META[modeKey];
      if (!s.dlcLoaded) {
        const fb = defaultDlcByMode(modeKey);
        s.dlcData = await loadDlcFile(meta.dlcFile, fb);
        s.dlcLoaded = true;
      }
    },
    ensureLoaded(modeKey) {
      return Promise.all([
        this.ensureMainData(modeKey),
        this.ensureDlc(modeKey)
      ]);
    },
    async switchMode(newMode) {
      if (this.mode === newMode) return;
      this.mode = newMode;
      if (newMode != null && MODE_META[newMode]) {
        await this.ensureLoaded(newMode);
      }
      this.scheduleAutoFitAll();
    }
  }
};
</script>
