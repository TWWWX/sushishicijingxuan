<template>
  <div id="app-root">
    <!-- 主页 -->
    <div v-if="!mode" class="homepage">
      <!-- 竹子装饰：仅首页渲染，位于背景之上、内容之下 -->
      <img class="bamboo" src="/竹.png" alt="">
      <div class="home-header">
        <div class="home-title-row">
          <span class="title-line"></span>
          <h1 class="home-title">苏轼相关n选1</h1>
          <span class="title-line"></span>
        </div>
        <p class="home-subtitle">— 填表游戏 —</p>
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
            <div class="card-title">苏轼作品</div>
            <div class="card-subtitle">64选1</div>
          </div>
        </div>
        <div class="entry-card" @click="switchMode('320')">
          <div class="card-deco-bar"></div>
          <div class="card-body">
            <div class="card-title">苏轼作品</div>
            <div class="card-subtitle">320选1</div>
          </div>
        </div>
        <div class="entry-card" @click="switchMode('poem64')">
          <div class="card-deco-bar"></div>
          <div class="card-body">
            <div class="card-title">苏轼诗作</div>
            <div class="card-subtitle">64选1</div>
          </div>
        </div>
        <div class="entry-card" @click="switchMode('word64')">
          <div class="card-deco-bar"></div>
          <div class="card-body">
            <div class="card-title">苏轼词作</div>
            <div class="card-subtitle">64选1</div>
          </div>
        </div>
        <div class="entry-card" @click="switchMode('eat64')">
          <div class="card-deco-bar"></div>
          <div class="card-body">
            <div class="card-title">苏轼吃吃吃</div>
            <div class="card-subtitle">64选1</div>
          </div>
        </div>
        <div class="entry-card" @click="switchMode('drink64')">
          <div class="card-deco-bar"></div>
          <div class="card-body">
            <div class="card-title">苏轼喝喝喝</div>
            <div class="card-subtitle">64选1</div>
          </div>
        </div>
        <div class="entry-card" @click="switchMode('ersu64')">
          <div class="card-deco-bar"></div>
          <div class="card-body">
            <div class="card-title">二苏诗文</div>
            <div class="card-subtitle">64选1</div>
          </div>
        </div>
        <div class="entry-card" @click="switchMode('song')">
          <div class="card-deco-bar"></div>
          <div class="card-body">
            <div class="card-title">宋代人物</div>
            <div class="card-subtitle">n选1</div>
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
          <div class="tab" :class="{ active: mode === '64' }" @click="switchMode('64')">苏轼作品64选1</div>
          <div class="tab" :class="{ active: mode === '320' }" @click="switchMode('320')">苏轼作品320选1</div>
          <div class="tab" :class="{ active: mode === 'poem64' }" @click="switchMode('poem64')">苏轼诗作64选1</div>
          <div class="tab" :class="{ active: mode === 'word64' }" @click="switchMode('word64')">苏轼词作64选1</div>
          <div class="tab" :class="{ active: mode === 'eat64' }" @click="switchMode('eat64')">苏轼吃吃吃64选1</div>
          <div class="tab" :class="{ active: mode === 'drink64' }" @click="switchMode('drink64')">苏轼喝喝喝64选1</div>
          <div class="tab" :class="{ active: mode === 'ersu64' }" @click="switchMode('ersu64')">二苏诗文64选1</div>
          <div class="tab" :class="{ active: mode === 'song' }" @click="switchMode('song')">宋代人物n选1</div>
        </div>
      </div>

      <!-- 宋代人物聚合页（上下两个 n 选1 表格 + 致谢栏） -->
      <template v-if="isAggregate(mode)">
        <div class="table-title-row">
          <div class="title-deco-bar"></div>
          <h2 class="table-page-title">{{ meta.title }}</h2>
          <p class="hint">单击单元格 → 快速向右填充 &nbsp;&nbsp;|&nbsp;&nbsp; 双击单元格 → 编辑内容 &nbsp;&nbsp;|&nbsp;&nbsp; 双击表头列 ↔ 隐藏/显示该列内容</p>
        </div>

        <div class="acknowledge-box">该部分表格由表格原作者：xhs「LinkeArisu」QQ「2310829476」制作，感谢老师搬运授权。</div>

        <div v-for="subMode in subModesOf(mode)" :key="'sub-' + subMode" class="figure-sub-section">
          <div class="table-sub-title-row">
            <div class="title-deco-bar"></div>
            <h3 class="table-page-subtitle">{{ metaOf(subMode).title }}</h3>
          </div>

          <ControlBar
            :filler-name.sync="fillerNameMap[subMode]"
            :zoom="zoomOf(subMode)"
            :uploading="uploadingOf(subMode)"
            @zoom-in="zoomIn(subMode)"
            @zoom-out="zoomOut(subMode)"
            @zoom-reset="zoomReset(subMode)"
            @export-csv="handleExportCSV(subMode)"
            @upload-csv="handleUploadCSV(subMode)"
            @export-png="handleExportPNG(subMode)"
            @reset="handleReset(subMode)"
          />

          <TournamentTable
            :key="'t-' + subMode"
            :cell-data="stateOf(subMode).cellData"
            :fill-target-map="stateOf(subMode).fillTargetMap"
            :col-hide-content="stateOf(subMode).colHideContent"
            :column-config="metaOf(subMode).columnConfig"
            :header-labels="metaOf(subMode).headerLabels"
            :total-rows="totalRowsOf(subMode)"
            :text-mode="metaOf(subMode).textMode || 'default'"
            :wrapper-id="wrapperIdOf(subMode)"
            :table-id="tableIdOf(subMode)"
            @header-dblclick="(col) => handleHeaderDblClick(subMode, col)"
            @cell-click="(p) => handleCellClick(subMode, p)"
            @cell-edit="(p) => handleCellEdit(subMode, p)"
          />
        </div>
      </template>

      <!-- 普通单表格页 -->
      <template v-else>
        <div class="table-title-row">
          <div class="title-deco-bar"></div>
          <h2 class="table-page-title">{{ meta.title }}</h2>
          <p class="hint">单击单元格 → 快速向右填充 &nbsp;&nbsp;|&nbsp;&nbsp; 双击单元格 → 编辑内容 &nbsp;&nbsp;|&nbsp;&nbsp; 双击表头列 ↔ 隐藏/显示该列诗文内容</p>
        </div>

        <ControlBar
          :filler-name.sync="fillerNameMap[mode]"
          :zoom="zoomOf(mode)"
          :uploading="uploadingOf(mode)"
          @zoom-in="zoomIn(mode)"
          @zoom-out="zoomOut(mode)"
          @zoom-reset="zoomReset(mode)"
          @export-csv="handleExportCSV(mode)"
          @upload-csv="handleUploadCSV(mode)"
          @export-png="handleExportPNG(mode)"
          @reset="handleReset(mode)"
        />

        <TournamentTable
          :key="'t-' + mode"
          :cell-data="stateOf(mode).cellData"
          :fill-target-map="stateOf(mode).fillTargetMap"
          :col-hide-content="stateOf(mode).colHideContent"
          :column-config="meta.columnConfig"
          :header-labels="meta.headerLabels"
          :total-rows="totalRows"
          :text-mode="meta.textMode || 'default'"
          @header-dblclick="(col) => handleHeaderDblClick(mode, col)"
          @cell-click="(p) => handleCellClick(mode, p)"
          @cell-edit="(p) => handleCellEdit(mode, p)"
        />
        <DlcPanel
          v-if="!meta.noDlc"
          :key="'d-' + mode"
          :dlc-data="stateOf(mode).dlcData"
          :selected-dlc-idx="stateOf(mode).selectedDlcIdx"
          :dlc-label="meta.dlcLabel"
          @dlc-select="(idx) => handleDlcSelect(mode, idx)"
        />
      </template>
    </div>

    <LoadingMask :visible="loadingVisible" :text="loadingText" />

    <!-- 轻反馈 Toast -->
    <transition name="toast-fade">
      <div v-if="toast.show" class="toast-wrap" :class="['toast-' + toast.type]">
        <span class="toast-text">{{ toast.text }}</span>
      </div>
    </transition>
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
  FIGURE_SUBMODES,
  getCellKey,
  buildInitialCellData,
  defaultDlcByMode
} from './data/poems';
import {
  cloneData,
  dataEqual,
  parsePlainToPoem,
  loadDlcFile,
  parseDlcText,
  parseNameText
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

async function loadMainFile(url, fallback, parser) {
  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (resp.ok) {
      const text = await resp.text();
      const fn = parser || parseDlcText;
      const parsed = fn(text);
      if (parsed && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return fallback ? [...fallback] : [];
}

const DEFAULT_FILLER = '';
const DEFAULT_ZOOM = 1;

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
      mode: null,
      loadingVisible: false,
      loadingText: '正在处理...',
      toast: { show: false, text: '', type: 'info' },
      _toastTimer: null,
      randomPoemContent: '',
      randomPoemTitle: '',
      fillerNameMap: {},
      zoomMap: {},
      uploadingMap: {},
      perMode: {
        [MODES.M64]: freshState(),
        [MODES.M320]: freshState(),
        [MODES.POEM64]: freshState(),
        [MODES.WORD64]: freshState(),
        [MODES.EAT64]: freshState(),
        [MODES.DRINK64]: freshState(),
        [MODES.ERSU64]: freshState(),
        [MODES.FIGURE64]: freshState(),
        [MODES.FIGURE256]: freshState()
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
      return this.totalRowsOf(this.mode);
    }
  },
  mounted() {
    this.fetchRandomPoem();
    const initialMode = this.parseHash();
    window.addEventListener('hashchange', this.onHashChange);
    if (initialMode !== this.mode) {
      this.switchMode(initialMode, false);
    }
  },
  beforeDestroy() {
    window.removeEventListener('hashchange', this.onHashChange);
  },
  watch: {
    mode() {
      this.$nextTick(() => {
        if (this.isAggregate(this.mode)) {
          for (const sm of this.subModesOf(this.mode)) {
            this.applyZoom(sm, this.zoomOf(sm));
          }
        } else if (this.mode) {
          this.applyZoom(this.mode, this.zoomOf(this.mode));
        }
      });
    }
  },
  methods: {
    metaOf(key) { return MODE_META[key]; },
    stateOf(key) {
      return this.perMode[key] || freshState();
    },
    totalRowsOf(key) {
      const cfg = MODE_META[key]?.columnConfig;
      if (!cfg || cfg.length === 0) return 0;
      return cfg[0].count * cfg[0].rowSpan;
    },
    subModesOf(key) {
      if (key === MODES.FIGURE) return FIGURE_SUBMODES;
      return [];
    },
    isAggregate(key) {
      return !!MODE_META[key]?.aggregate && !!MODE_META[key]?.subModes?.length;
    },
    zoomOf(key) {
      const v = this.zoomMap[key];
      return (typeof v === 'number' && v > 0) ? v : DEFAULT_ZOOM;
    },
    uploadingOf(key) {
      return !!this.uploadingMap[key];
    },
    wrapperIdOf(key) {
      if (key === MODES.FIGURE64 || key === MODES.FIGURE256) return 'tableWrapper_' + key;
      return 'tableWrapper';
    },
    tableIdOf(key) {
      if (key === MODES.FIGURE64 || key === MODES.FIGURE256) return 'tournamentTable_' + key;
      return 'tournamentTable';
    },
    dlcTableIdOf(key) {
      if (key === MODES.FIGURE64 || key === MODES.FIGURE256) return 'dlcTable_' + key;
      return 'dlcTable';
    },
    async fetchRandomPoem() {
      const files = [
        '苏轼诗词精选320选1.txt',
        '苏轼诗词精选320选1dlc.txt',
        '苏轼诗词精选64版1.txt',
        '苏轼诗词精选64选1dlc.txt',
        '苏轼诗精选64选1.txt',
        '苏轼诗精选64选1dlc.txt',
        '苏轼词精选64选1.txt',
        '苏轼词精选64选1dlc.txt',
        '苏轼吃吃吃精选64选1.txt',
        '苏轼吃吃吃精选64选1dlc.txt',
        '苏轼喝喝喝精选64选1.txt',
        '苏轼喝喝喝精选64选1dlc.txt',
        '二苏精选64选1.txt',
        '二苏精选64选1dlc.txt',
        '宋代人物64选1.txt',
        '宋代人物256选1.txt'
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
    applyZoom(key, z) {
      const v = (typeof z === 'number' && z > 0) ? z : 1;
      const t1 = document.getElementById(this.tableIdOf(key));
      if (t1) t1.style.zoom = v;
      const t2 = document.getElementById(this.dlcTableIdOf(key));
      if (t2) t2.style.zoom = v;
    },
    zoomIn(key) {
      const cur = this.zoomOf(key);
      const next = Math.min(2, Math.round((cur + 0.1) * 10) / 10);
      this.$set(this.zoomMap, key, next);
      this.$nextTick(() => this.applyZoom(key, next));
    },
    zoomOut(key) {
      const cur = this.zoomOf(key);
      const next = Math.max(0.4, Math.round((cur - 0.1) * 10) / 10);
      this.$set(this.zoomMap, key, next);
      this.$nextTick(() => this.applyZoom(key, next));
    },
    zoomReset(key) {
      this.$set(this.zoomMap, key, DEFAULT_ZOOM);
      this.$nextTick(() => this.applyZoom(key, DEFAULT_ZOOM));
    },
    showLoading(text) {
      this.loadingText = text || '正在处理...';
      this.loadingVisible = true;
    },
    hideLoading() {
      this.loadingVisible = false;
    },
    // 轻反馈 Toast：success / warn / error / info
    showToast(text, type = 'info', duration) {
      if (!text) return;
      if (this._toastTimer) {
        clearTimeout(this._toastTimer);
        this._toastTimer = null;
      }
      const t = (type && typeof type === 'string') ? type : 'info';
      const durationMap = { success: 2000, warn: 2000, error: 3000, info: 2000 };
      const dur = typeof duration === 'number' ? duration : (durationMap[t] || 2000);
      // 先触发 leave 动画再切入，避免同帧复用 transition 不生效
      this.toast = { show: false, text: '', type: 'info' };
      this.$nextTick(() => {
        this.toast = { show: true, text, type: t };
        this._toastTimer = setTimeout(() => {
          this.toast = { show: false, text: this.toast.text, type: this.toast.type };
          this._toastTimer = null;
        }, dur);
      });
    },
    scheduleAutoFitFor(key) {
      this.$nextTick(() => {
        scheduleAutoFit(this.tableIdOf(key), this.stateOf(key).colHideContent);
      });
    },
    scheduleAutoFitAll() {
      this.$nextTick(() => {
        if (this.isAggregate(this.mode)) {
          for (const sm of this.subModesOf(this.mode)) {
            scheduleAutoFit(this.tableIdOf(sm), this.stateOf(sm).colHideContent);
          }
        } else if (this.mode) {
          scheduleAutoFit(this.tableIdOf(this.mode), this.stateOf(this.mode).colHideContent);
          const dlcId = this.dlcTableIdOf(this.mode);
          if (document.getElementById(dlcId)) scheduleAutoFit(dlcId, null);
        }
      });
    },
    refreshSourceStyle(key, cellKey) {
      const s = this.stateOf(key);
      this.$set(s.fillTargetMap, cellKey, s.fillTargetMap[cellKey] || {});
    },
    detachFromSource(modeKey, targetKey) {
      const s = this.stateOf(modeKey);
      const oldSourceKey = s.fillSourceMap[targetKey];
      if (oldSourceKey && s.fillTargetMap[oldSourceKey]) {
        this.$delete(s.fillTargetMap[oldSourceKey], targetKey);
        this.refreshSourceStyle(modeKey, oldSourceKey);
        this.propagateDown(modeKey, oldSourceKey);
      }
      this.$delete(s.fillSourceMap, targetKey);
    },
    attachToSource(modeKey, sourceKey, targetKey) {
      this.detachFromSource(modeKey, targetKey);
      const s = this.stateOf(modeKey);
      this.$set(s.fillSourceMap, targetKey, sourceKey);
      if (!s.fillTargetMap[sourceKey]) {
        this.$set(s.fillTargetMap, sourceKey, {});
      }
      this.$set(s.fillTargetMap[sourceKey], targetKey, true);
      this.refreshSourceStyle(modeKey, sourceKey);
    },
    propagateDown(modeKey, sourceKey) {
      const s = this.stateOf(modeKey);
      const targets = s.fillTargetMap[sourceKey];
      if (!targets) return;
      Object.keys(targets).forEach((targetKey) => {
        if (s.cellData[sourceKey] !== undefined) {
          const oldVal = s.cellData[targetKey];
          const newVal = cloneData(s.cellData[sourceKey]);
          if (!dataEqual(oldVal, newVal)) {
            this.$set(s.cellData, targetKey, newVal);
            this.propagateDown(modeKey, targetKey);
          }
        }
      });
    },
    handleHeaderDblClick(modeKey, col) {
      if (!modeKey) return;
      if (col < 0 || col > 6) return;
      const s = this.stateOf(modeKey);
      this.$set(s.colHideContent, col, !s.colHideContent[col]);
      this.scheduleAutoFitFor(modeKey);
    },
    handleCellClick(modeKey, { col, rowInCol, key }) {
      if (!modeKey) return;
      const s = this.stateOf(modeKey);
      const m = this.metaOf(modeKey);
      if (!m) return;

      if (!m.noDlc && col === 0 && s.selectedDlcIdx !== null && s.selectedDlcIdx >= 0 && s.selectedDlcIdx < s.dlcData.length) {
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
        this.detachFromSource(modeKey, key);
        this.propagateDown(modeKey, key);

        s.selectedDlcIdx = null;
        this.scheduleAutoFitAll();
        return;
      }

      if (s.cellData[key] === undefined) return;
      if (col >= m.columnConfig.length - 1) return;

      const nextCol = col + 1;
      const curRowSpan = m.columnConfig[col].rowSpan;
      const nextRowSpan = m.columnConfig[nextCol].rowSpan;
      const ratio = Math.max(1, Math.floor(nextRowSpan / curRowSpan));
      const nextRowInCol = Math.floor(rowInCol / ratio);
      const targetKey = getCellKey(nextCol, nextRowInCol);

      this.attachToSource(modeKey, key, targetKey);
      this.$set(s.cellData, targetKey, cloneData(s.cellData[key]));
      this.propagateDown(modeKey, targetKey);

      this.scheduleAutoFitFor(modeKey);
    },
    handleCellEdit(modeKey, { key, oldVal, newVal, trigger }) {
      if (!modeKey) return;
      const s = this.stateOf(modeKey);
      let changed;
      if (newVal === undefined) {
        changed = oldVal !== undefined;
        this.$delete(s.cellData, key);
      } else {
        this.$set(s.cellData, key, newVal);
        changed = !dataEqual(oldVal, newVal);
      }
      if (changed) {
        this.detachFromSource(modeKey, key);
        this.propagateDown(modeKey, key);
      }
      this.scheduleAutoFitFor(modeKey);
    },
    handleDlcSelect(modeKey, idx) {
      if (!modeKey) return;
      const s = this.stateOf(modeKey);
      if (idx < 0 || idx >= s.dlcData.length) return;
      s.selectedDlcIdx = (s.selectedDlcIdx === idx) ? null : idx;
    },
    handleExportCSV(modeKey) {
      if (!modeKey) return;
      const s = this.stateOf(modeKey);
      const m = this.metaOf(modeKey);
      exportCSVUtil({
        cellData: s.cellData,
        columnConfig: m.columnConfig,
        headerLabels: m.headerLabels,
        totalRows: this.totalRowsOf(modeKey),
        title: m.title,
        fillerName: this.fillerNameMap[modeKey] || DEFAULT_FILLER,
        mode: modeKey
      });
    },
    // 返回指定表格下所有必填单元格（每个 columnConfig 的每一项行首）的未填总数；0 即已填满
    countEmptyCells(modeKey) {
      const s = this.stateOf(modeKey);
      const m = this.metaOf(modeKey);
      if (!s || !m || !m.columnConfig) return 0;
      let empty = 0;
      for (let c = 0; c < m.columnConfig.length; c++) {
        const count = m.columnConfig[c].count || 0;
        for (let i = 0; i < count; i++) {
          const key = getCellKey(c, i);
          const v = s.cellData[key];
          if (v === undefined || v === null || v === '') {
            empty += 1;
            continue;
          }
          if (typeof v === 'string') {
            if (v.trim() === '') empty += 1;
          } else if (typeof v === 'object') {
            const t = (v.title === undefined || v.title === null) ? '' : String(v.title);
            const cc = (v.content === undefined || v.content === null) ? '' : String(v.content);
            if (t.trim() === '' && cc.trim() === '') empty += 1;
          }
        }
      }
      return empty;
    },
    async handleUploadCSV(modeKey) {
      if (!modeKey) return;
      if (this.uploadingOf(modeKey)) return;
      const fn = this.fillerNameMap[modeKey];
      if (!fn || !fn.trim()) {
        this.showToast('请填写填表人', 'warn');
        return;
      }
      const empty = this.countEmptyCells(modeKey);
      if (empty > 0) {
        this.showToast(`出于数据收集考虑，上传前请填满表中 ${empty} 个空白单元格`, 'warn', 3000);
        return;
      }
      this.$set(this.uploadingMap, modeKey, true);
      try {
        const folderMap = {
          '320': 'shiwen-320',
          '64': 'shiwen-64',
          'poem64': 'shiwen-poem64',
          'word64': 'shiwen-word64',
          'eat64': 'shiwen-eat64',
          'drink64': 'shiwen-drink64',
          'ersu64': 'shiwen-ersu64',
          'figure64': 'shiwen-figure64',
          'figure256': 'shiwen-figure256'
        };
        const folder = folderMap[modeKey] || 'shiwen-64';
        const m = this.metaOf(modeKey);
        await uploadCSVUtil({
          cellData: this.stateOf(modeKey).cellData,
          columnConfig: m.columnConfig,
          headerLabels: m.headerLabels,
          totalRows: this.totalRowsOf(modeKey),
          title: m.title,
          folder,
          fillerName: fn,
          mode: modeKey,
          onStatus: (status, errMsg) => {
            if (status === 'success') {
              this.showToast('上传成功，感谢您的投稿！', 'success');
            } else if (status === 'error') {
              this.showToast('上传失败：' + (errMsg || '未知错误'), 'error', 3000);
            }
          }
        });
      } catch (err) {
        this.showToast('上传失败：' + (err.message || '未知错误'), 'error', 3000);
      } finally {
        this.$set(this.uploadingMap, modeKey, false);
      }
    },
    handleExportPNG(modeKey) {
      if (!modeKey) return;
      const m = this.metaOf(modeKey);
      const isFigure = m.textMode === 'nameOnly';
      const opts = {
        fillerName: this.fillerNameMap[modeKey] || DEFAULT_FILLER,
        loadingCallbacks: {
          show: (t) => this.showLoading(t),
          hide: () => this.hideLoading()
        },
        title: m.title,
        mode: modeKey,
        wrapperId: this.wrapperIdOf(modeKey),
        tableId: this.tableIdOf(modeKey),
        onError: (msg) => this.showToast(msg, 'error', 3000)
      };
      if (isFigure) {
        opts.leftSubText = '网页制作：蟋蟀 表格原作者：xhs「LinkeArisu」QQ「2310829476」';
      }
      exportPNGUtil(opts);
    },
    handleReset(modeKey) {
      if (!modeKey) return;
      if (!confirm('确定要清空表格并恢复初始状态吗？当前表格第一列将恢复原文，其他列将全部清空。')) return;
      this.resetModeState(modeKey, false);
      this.$nextTick(() => {
        this.ensureLoaded(modeKey);
        this.scheduleAutoFitFor(modeKey);
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
      if (!s) return;
      const meta = MODE_META[modeKey];
      if (!s.dataLoaded) {
        s.cellData = buildInitialCellData(modeKey);
        const count = meta.columnConfig[0].count;
        const parser = meta.textMode === 'nameOnly' ? parseNameText : parseDlcText;
        const fromFile = await loadMainFile(meta.dataFile, null, parser);
        if (fromFile && fromFile.length > 0) {
          for (let i = 0; i < count; i++) {
            const key = getCellKey(0, i);
            const poem = fromFile[i];
            if (poem) {
              this.$set(s.cellData, key, { title: poem.title, content: poem.content || '' });
            }
          }
        }
        s.dataLoaded = true;
      }
    },
    async ensureDlc(modeKey) {
      const s = this.perMode[modeKey];
      if (!s) return;
      const meta = MODE_META[modeKey];
      if (meta.noDlc) {
        s.dlcLoaded = true;
        return;
      }
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
    parseHash() {
      const raw = (window.location.hash || '').replace(/^#\/?/, '');
      if (!raw) return null;
      if (MODE_META[raw]) return raw;
      return null;
    },
    onHashChange() {
      const m = this.parseHash();
      if (m !== this.mode) {
        this.switchMode(m, false);
      }
    },
    applyHash(newMode) {
      const target = newMode ? '#/' + newMode : '';
      if ((window.location.hash || '') !== target) {
        if (target) {
          window.location.hash = target;
        } else {
          history.pushState('', document.title, window.location.pathname + window.location.search);
        }
      }
    },
    async switchMode(newMode, updateHash = true) {
      if (this.mode === newMode) {
        if (updateHash) this.applyHash(newMode);
        return;
      }
      if (updateHash) this.applyHash(newMode);
      this.mode = newMode;
      if (newMode != null) {
        if (this.isAggregate(newMode)) {
          const tasks = [];
          for (const sm of this.subModesOf(newMode)) {
            tasks.push(this.ensureLoaded(sm));
            if (this.zoomMap[sm] == null) this.$set(this.zoomMap, sm, DEFAULT_ZOOM);
            if (this.fillerNameMap[sm] == null) this.$set(this.fillerNameMap, sm, DEFAULT_FILLER);
          }
          await Promise.all(tasks);
        } else if (MODE_META[newMode]) {
          if (this.zoomMap[newMode] == null) this.$set(this.zoomMap, newMode, DEFAULT_ZOOM);
          if (this.fillerNameMap[newMode] == null) this.$set(this.fillerNameMap, newMode, DEFAULT_FILLER);
          await this.ensureLoaded(newMode);
        }
      }
      this.scheduleAutoFitAll();
    }
  }
};
</script>

<style>
/* 轻反馈 Toast */
.toast-wrap {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10000;
  min-width: 160px;
  max-width: 80vw;
  padding: 12px 24px;
  border-radius: 0;
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 1px;
  text-align: center;
  color: #fff;
  background: rgba(44, 62, 44, 0.88);
  border: 1px solid rgba(184, 205, 184, 0.5);
  box-shadow: 0 8px 24px rgba(44, 62, 44, 0.25);
  user-select: none;
}
.toast-wrap.toast-success {
  background: rgba(74, 122, 82, 0.92);
  border-color: #8fae93;
}
.toast-wrap.toast-error {
  background: rgba(139, 115, 115, 0.95);
  border-color: #a88f8f;
}
.toast-wrap.toast-warn {
  background: rgba(102, 128, 106, 0.95);
  border-color: #b8cdb8;
}
@media (max-width: 700px) {
  .toast-wrap { font-size: 13px; padding: 10px 20px; min-width: 140px; }
}
.toast-fade-enter-from, .toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%);
}
.toast-fade-enter-active, .toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
</style>
