<template>
  <div class="dlc-section">
    <div class="dlc-title-row">
      <div class="dlc-title-left">
        <div class="title-deco-bar"></div>
        <h2 class="dlc-title">补充诗文库</h2>
      </div>
      <p class="dlc-hint">单击选中补充诗文条目，再点主表第一列任意格进行交换；支持内容联动同步</p>
    </div>
    <div class="dlc-wrapper">
      <table id="dlcTable">
        <thead>
          <tr id="dlcHeaderRow">
            <th v-for="c in dlcCols" :key="'dlc-th-' + c">补充诗文第{{ c }}列</th>
          </tr>
        </thead>
        <tbody id="dlcBody">
          <tr v-for="r in rowCount" :key="'dlc-row-' + r">
            <td
              v-for="c in dlcCols"
              :key="'dlc-cell-' + (r - 1) + '-' + (c - 1)"
              :data-dlc-idx="dlcIdx(r - 1, c - 1)"
              :class="{ selected: isSelected(dlcIdx(r - 1, c - 1)) }"
              :style="cellStyle(r - 1, c - 1)"
              v-html="renderCell(r - 1, c - 1)"
              @click="handleClick(r - 1, c - 1)"
            ></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { DLC_COLS } from '../data/poems';
import { formatPoemCell } from '../utils/poem';

export default {
  name: 'DlcPanel',
  props: {
    dlcData: { type: Array, default: () => [] },
    selectedDlcIdx: { type: Number, default: null }
  },
  computed: {
    dlcCols() { return DLC_COLS; },
    rowCount() {
      const total = (this.dlcData || []).length;
      return Math.max(1, Math.ceil(total / DLC_COLS));
    }
  },
  methods: {
    dlcIdx(r, c) {
      return r * DLC_COLS + c;
    },
    isSelected(idx) {
      return this.selectedDlcIdx === idx;
    },
    cellStyle(r, c) {
      const idx = this.dlcIdx(r, c);
      if (idx >= (this.dlcData || []).length) {
        return { background: '#faf9f6', cursor: 'default' };
      }
      return {};
    },
    renderCell(r, c) {
      const idx = this.dlcIdx(r, c);
      if (idx >= (this.dlcData || []).length) return '&nbsp;';
      return formatPoemCell(this.dlcData[idx]);
    },
    handleClick(r, c) {
      const idx = this.dlcIdx(r, c);
      if (idx >= (this.dlcData || []).length) return;
      this.$emit('dlc-select', idx);
    }
  }
};
</script>
