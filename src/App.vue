<template>
  <div id="app-root">
    <div class="header">
      <h1 class="page-title">{{ pageTitle }}</h1>
      <p class="hint">单击单元格 &rarr; 快速向右填充 &nbsp;&nbsp;|&nbsp;&nbsp; 双击单元格 &rarr; 编辑内容，第一列也可修改 &nbsp;&nbsp;|&nbsp;&nbsp; 双击表头列 &harr; 隐藏/显示该列诗文内容</p>
      <p class="hint">网页制作：蟋蟀 诗文筛汇：嫻菜无敌 蟋蟀 欢迎关注公众号【东坡墙】 QQ【3301590656】</p>
      <ControlBar
        :current-mode="mode"
        :filler-name.sync="fillerName"
        @switch-mode="switchMode"
        @export-csv="handleExportCSV"
        @export-png="handleExportPNG"
        @reset="handleReset"
      />
    </div>

    <div v-if="!mode" class="author-note">作者的话：……</div>

    <template v-else>
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
    </template>

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
import { exportCSV as exportCSVUtil, exportPNG as exportPNGUtil } from './utils/export';

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
      loadingVisible: false,
      loadingText: '正在处理...',
      perMode: {
        [MODES.M64]: freshState(),
        [MODES.M256]: freshState()
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
    },
    pageTitle() {
      if (this.meta) return this.meta.title;
      return '苏轼诗文作品n选1';
    }
  },
  methods: {
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
      if (!newMode || this.mode === newMode) return;
      if (!MODE_META[newMode]) return;
      this.mode = newMode;
      await this.ensureLoaded(newMode);
      this.scheduleAutoFitAll();
    }
  }
};
</script>
