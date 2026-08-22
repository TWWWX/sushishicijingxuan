<template>
  <div class="table-wrapper" :id="wrapperId">
    <table :id="tableId" :class="{ 'name-only-table': textMode === 'nameOnly'}">
      <thead>
        <tr id="headerRow">
          <th
            v-for="(label, c) in headerLabels"
            :key="c"
            :class="['col-' + c, { 'hide-col': colHideContent[c] }]"
            :data-col="c"
            @dblclick="$emit('header-dblclick', c)"
          >{{ label }}</th>
        </tr>
      </thead>
      <tbody id="tableBody">
        <tr v-for="row in totalRows" :key="'row-' + row">
          <template v-for="col in columnCount" :key="'cell-' + (row - 1) + '-' + col">
            <td
              v-if="isFirstRowOfCell(row - 1, col - 1)"
              :class="cellClasses(col - 1, row - 1)"
              :data-key="cellKey(col - 1, firstRowIndex(row - 1, col - 1))"
              :data-col="col - 1"
              :data-row-in-col="firstRowIndex(row - 1, col - 1)"
              :rowspan="columnConfig[col - 1].rowSpan"
              :contenteditable="isEditing(cellKey(col - 1, firstRowIndex(row - 1, col - 1))) ? 'true' : undefined"
              v-html="renderCellHtml(col - 1, firstRowIndex(row - 1, col - 1))"
              @click="handleClick($event, col - 1, firstRowIndex(row - 1, col - 1), cellKey(col - 1, firstRowIndex(row - 1, col - 1)))"
              @dblclick.stop="handleDblClick($event, col - 1, firstRowIndex(row - 1, col - 1), cellKey(col - 1, firstRowIndex(row - 1, col - 1)))"
              @blur="handleBlur($event, col - 1, firstRowIndex(row - 1, col - 1), cellKey(col - 1, firstRowIndex(row - 1, col - 1)))"
              @keydown="handleKeydown($event, col - 1, firstRowIndex(row - 1, col - 1), cellKey(col - 1, firstRowIndex(row - 1, col - 1)))"
            ></td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { getCellKey } from '../data/poems';
import { formatPoemCell } from '../utils/poem';
import { scheduleAutoFit } from '../utils/columnWidth';

export default {
  name: 'TournamentTable',
  props: {
    cellData: { type: Object, required: true },
    fillTargetMap: { type: Object, required: true },
    colHideContent: { type: Array, required: true },
    columnConfig: { type: Array, required: true },
    headerLabels: { type: Array, required: true },
    totalRows: { type: Number, required: true },
    textMode: { type: String, default: 'default' },
    wrapperId: { type: String, default: 'tableWrapper' },
    tableId: { type: String, default: 'tournamentTable' }
  },
  data() {
    return {
      editingKeys: {},
      justFinishedEdit: 0
    };
  },
  computed: {
    columnCount() { return this.columnConfig.length; }
  },
  methods: {
    cellKey(col, rowInCol) {
      return getCellKey(col, rowInCol);
    },
    firstRowIndex(row, col) {
      return Math.floor(row / this.columnConfig[col].rowSpan);
    },
    isFirstRowOfCell(row, col) {
      return (row % this.columnConfig[col].rowSpan) === 0;
    },
    isEditing(key) {
      return !!this.editingKeys[key];
    },
    renderCellHtml(col, rowInCol) {
      const key = this.cellKey(col, rowInCol);
      if (this.isEditing(key)) return '';
      const data = this.cellData[key];
      if (data === undefined) return '&nbsp;';
      return formatPoemCell(data, this.textMode);
    },
    cellClasses(col, row) {
      const key = this.cellKey(col, this.firstRowIndex(row, col));
      const cls = [];
      if (col === 0) cls.push('col-0');
      if (col === 1) cls.push('col-1');
      if (col === this.columnCount - 1) cls.push('champion-cell');
      if (this.cellData[key] === undefined && !this.isEditing(key)) cls.push('empty');
      if (this.fillTargetMap[key] && Object.keys(this.fillTargetMap[key]).length > 0) {
        cls.push('source-cell');
      }
      if (this.colHideContent[col]) {
        cls.push('hide-poem-content');
      }
      if (this.textMode === 'nameOnly') {
        cls.push('name-only-cell');
      }
      return cls;
    },
    handleClick(e, col, rowInCol, key) {
      if (this.justFinishedEdit > 0) {
        this.justFinishedEdit--;
        return;
      }
      if (this.isEditing(key)) return;
      this.$emit('cell-click', { col, rowInCol, key, td: e.currentTarget });
    },
    handleDblClick(e, col, rowInCol, key) {
      e.preventDefault();
      const td = e.currentTarget;
      this.$set(this.editingKeys, key, true);
      this.$nextTick(() => {
        td.setAttribute('contenteditable', 'true');
        const cur = this.cellData[key];
        if (cur) {
          if (typeof cur === 'string') {
            td.textContent = cur;
          } else {
            td.textContent = cur.title + '\n' + (cur.content || '');
          }
        } else {
          td.textContent = '';
        }
        td.focus();
        try { document.execCommand('selectAll', false, null); } catch (err) {}
      });
    },
    handleBlur(e, col, rowInCol, key) {
      this.finishEdit(e, col, rowInCol, key, 'blur');
    },
    handleKeydown(e, col, rowInCol, key) {
      if (!this.isEditing(key)) return;
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.finishEdit(e, col, rowInCol, key, 'enter');
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.finishEdit(e, col, rowInCol, key, 'escape');
      }
    },
    finishEdit(e, col, rowInCol, key, trigger) {
      if (!this.isEditing(key)) return;
      const td = e.currentTarget;
      td.removeAttribute('contenteditable');
      const text = (td.innerText || '').trim();
      const oldVal = this.cellData[key];
      let newVal;
      if (text) {
        newVal = text;
      } else {
        newVal = undefined;
      }
      this.$delete(this.editingKeys, key);
      this.$emit('cell-edit', { key, oldVal, newVal, trigger });
      if (trigger === 'blur') {
        this.justFinishedEdit = 1;
        setTimeout(() => { this.justFinishedEdit = 0; }, 0);
      }
      this.$nextTick(() => {
        scheduleAutoFit('tournamentTable', this.colHideContent);
      });
    }
  }
};
</script>
