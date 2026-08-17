<template>
  <div id="app-root">
    <div class="header">
      <h1 class="page-title">苏轼诗文作品64选1</h1>
      <p class="hint">单击单元格 &rarr; 快速向右填充 &nbsp;&nbsp;|&nbsp;&nbsp; 双击单元格 &rarr; 编辑内容，第一列也可修改 &nbsp;&nbsp;|&nbsp;&nbsp; 双击表头列 &harr; 隐藏/显示该列诗文内容</p>
      <p class="hint">DLC操作：先单击选中DLC库中某格，再单击主表第一列任意格即可交换二者内容</p>
      <p class="hint">网页制作：蟋蟀 诗文筛汇：嫻菜无敌 蟋蟀 欢迎关注公众号【东坡墙】 QQ【3301590656】</p>
      <ControlBar
        :filler-name.sync="fillerName"
        @export-csv="handleExportCSV"
        @export-png="handleExportPNG"
        @reset="handleReset"
      />
    </div>

    <TournamentTable
      :cell-data="cellData"
      :fill-target-map="fillTargetMap"
      :col-hide-content="colHideContent"
      :selected-dlc-idx="selectedDlcIdx"
      @header-dblclick="handleHeaderDblClick"
      @cell-click="handleCellClick"
      @cell-edit="handleCellEdit"
    />

    <DlcPanel
      :dlc-data="dlcData"
      :selected-dlc-idx="selectedDlcIdx"
      @dlc-select="handleDlcSelect"
    />

    <LoadingMask :visible="loadingVisible" :text="loadingText" />
  </div>
</template>

<script>
import ControlBar from './components/ControlBar.vue';
import TournamentTable from './components/TournamentTable.vue';
import DlcPanel from './components/DlcPanel.vue';
import LoadingMask from './components/LoadingMask.vue';
import {
  poemsData,
  columnConfig,
  getCellKey,
  defaultDlcFallback
} from './data/poems';
import {
  cloneData,
  dataEqual,
  parsePlainToPoem,
  loadDlcFile
} from './utils/poem';
import { scheduleAutoFit } from './utils/columnWidth';
import { exportCSV as exportCSVUtil, exportPNG as exportPNGUtil } from './utils/export';

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
      cellData: {},
      fillSourceMap: {},
      fillTargetMap: {},
      colHideContent: [false, false, false, false, false, false, false],
      selectedDlcIdx: null,
      dlcData: [],
      loadingVisible: false,
      loadingText: '正在处理...'
    };
  },
  mounted() {
    this.resetStateData();
    this.$nextTick(() => {
      this.initLoadDlc();
      scheduleAutoFit('tournamentTable', this.colHideContent);
    });
  },
  methods: {
    resetStateData() {
      this.cellData = {};
      this.fillSourceMap = {};
      this.fillTargetMap = {};
      this.colHideContent = [false, false, false, false, false, false, false];
      for (let i = 0; i < 64; i++) {
        const key = getCellKey(0, i);
        const poem = poemsData[i];
        this.$set(this.cellData, key, { title: poem.title, content: poem.content });
      }
    },
    async initLoadDlc() {
      const loaded = await loadDlcFile('苏轼诗词精选64选1dlc.txt', defaultDlcFallback);
      this.dlcData = loaded;
      this.$nextTick(() => {
        scheduleAutoFit('dlcTable', null);
      });
    },
    showLoading(text) {
      this.loadingText = text || '正在处理...';
      this.loadingVisible = true;
    },
    hideLoading() {
      this.loadingVisible = false;
    },
    scheduleAutoFitAll() {
      this.$nextTick(() => {
        scheduleAutoFit('tournamentTable', this.colHideContent);
        scheduleAutoFit('dlcTable', null);
      });
    },
    refreshSourceStyle(key) {
      this.$set(this.fillTargetMap, key, this.fillTargetMap[key] || {});
    },
    detachFromSource(targetKey) {
      const oldSourceKey = this.fillSourceMap[targetKey];
      if (oldSourceKey && this.fillTargetMap[oldSourceKey]) {
        this.$delete(this.fillTargetMap[oldSourceKey], targetKey);
        this.refreshSourceStyle(oldSourceKey);
        this.propagateDown(oldSourceKey);
      }
      this.$delete(this.fillSourceMap, targetKey);
    },
    attachToSource(sourceKey, targetKey) {
      this.detachFromSource(targetKey);
      this.$set(this.fillSourceMap, targetKey, sourceKey);
      if (!this.fillTargetMap[sourceKey]) {
        this.$set(this.fillTargetMap, sourceKey, {});
      }
      this.$set(this.fillTargetMap[sourceKey], targetKey, true);
      this.refreshSourceStyle(sourceKey);
    },
    propagateDown(sourceKey) {
      const targets = this.fillTargetMap[sourceKey];
      if (!targets) return;
      Object.keys(targets).forEach((targetKey) => {
        if (this.cellData[sourceKey] !== undefined) {
          const oldVal = this.cellData[targetKey];
          const newVal = cloneData(this.cellData[sourceKey]);
          if (!dataEqual(oldVal, newVal)) {
            this.$set(this.cellData, targetKey, newVal);
            this.propagateDown(targetKey);
          }
        }
      });
    },
    handleHeaderDblClick(col) {
      if (col < 0 || col > 6) return;
      this.$set(this.colHideContent, col, !this.colHideContent[col]);
      this.$nextTick(() => {
        scheduleAutoFit('tournamentTable', this.colHideContent);
      });
    },
    handleCellClick({ col, rowInCol, key }) {
      if (col === 0 && this.selectedDlcIdx !== null && this.selectedDlcIdx >= 0 && this.selectedDlcIdx < this.dlcData.length) {
        const mainCurrent = this.cellData[key] ? cloneData(this.cellData[key]) : null;
        const dlcCurrent = cloneData(this.dlcData[this.selectedDlcIdx]);

        if (mainCurrent && typeof mainCurrent === 'object' && mainCurrent.title !== undefined) {
          this.$set(this.dlcData, this.selectedDlcIdx, {
            title: mainCurrent.title,
            content: mainCurrent.content || ''
          });
        } else if (typeof mainCurrent === 'string') {
          const parsed = parsePlainToPoem(mainCurrent);
          this.$set(this.dlcData, this.selectedDlcIdx, parsed);
        } else {
          this.$set(this.dlcData, this.selectedDlcIdx, { title: '', content: '' });
        }

        this.$set(this.cellData, key, { title: dlcCurrent.title, content: dlcCurrent.content });
        this.detachFromSource(key);
        this.propagateDown(key);

        this.selectedDlcIdx = null;
        this.scheduleAutoFitAll();
        return;
      }

      if (this.cellData[key] === undefined) return;
      if (col >= 6) return;

      const nextCol = col + 1;
      const nextRowInCol = Math.floor(rowInCol / 2);
      const targetKey = getCellKey(nextCol, nextRowInCol);

      this.attachToSource(key, targetKey);
      this.$set(this.cellData, targetKey, cloneData(this.cellData[key]));
      this.propagateDown(targetKey);

      this.$nextTick(() => {
        scheduleAutoFit('tournamentTable', this.colHideContent);
      });
    },
    handleCellEdit({ key, oldVal, newVal, trigger }) {
      let changed;
      if (newVal === undefined) {
        changed = oldVal !== undefined;
        this.$delete(this.cellData, key);
      } else {
        this.$set(this.cellData, key, newVal);
        changed = !dataEqual(oldVal, newVal);
      }

      if (changed) {
        this.detachFromSource(key);
        this.propagateDown(key);
      }
      this.$nextTick(() => {
        scheduleAutoFit('tournamentTable', this.colHideContent);
      });
    },
    handleDlcSelect(idx) {
      if (idx < 0 || idx >= this.dlcData.length) return;
      this.selectedDlcIdx = (this.selectedDlcIdx === idx) ? null : idx;
    },
    handleExportCSV() {
      exportCSVUtil(this.cellData);
    },
    handleExportPNG() {
      exportPNGUtil(this.fillerName, {
        show: (t) => this.showLoading(t),
        hide: () => this.hideLoading()
      });
    },
    handleReset() {
      if (!confirm('确定要清空表格并恢复初始状态吗？第一列的64篇诗文将恢复原文，其他列将全部清空。')) return;
      this.resetStateData();
      this.selectedDlcIdx = null;
      this.fillerName = '';
      this.scheduleAutoFitAll();
    }
  },
  watch: {
    dlcData: {
      deep: true,
      handler() {
        this.$nextTick(() => scheduleAutoFit('dlcTable', null));
      }
    }
  }
};
</script>
