export function measureCellTextWidth(cell, titleOnly) {
  const clone = cell.cloneNode(true);
  const titleEl = clone.querySelector('.poem-title');
  const contentEl = clone.querySelector('.poem-content');
  if (titleOnly) {
    if (contentEl) contentEl.style.display = 'none';
  }
  clone.style.position = 'absolute';
  clone.style.visibility = 'hidden';
  clone.style.left = '-99999px';
  clone.style.top = '-99999px';
  clone.style.width = 'auto';
  clone.style.minWidth = '0';
  clone.style.maxWidth = 'none';
  clone.style.whiteSpace = 'nowrap';
  const cs = getComputedStyle(cell);
  clone.style.padding = '0';
  clone.style.border = '0';
  clone.style.boxSizing = 'content-box';
  clone.style.font = cs.font;
  clone.style.fontSize = cs.fontSize;
  clone.style.lineHeight = cs.lineHeight;
  if (titleEl) {
    titleEl.style.display = '';
    titleEl.style.whiteSpace = 'nowrap';
  }
  if (!titleOnly && contentEl) {
    contentEl.style.display = '';
    contentEl.style.whiteSpace = 'nowrap';
  }
  document.body.appendChild(clone);
  const w = clone.offsetWidth;
  document.body.removeChild(clone);
  return w;
}

export function autoFitColumnWidths(tableId, hideContentArr) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const headerRow = table.querySelector('thead tr');
  const allRows = table.querySelectorAll('tbody tr');
  if (!headerRow || allRows.length === 0) return;

  const thCells = headerRow.children;
  const colCount = thCells.length;
  const maxWidths = new Array(colCount).fill(0);
  const hasTdContent = new Array(colCount).fill(false);

  for (let r = 0; r < allRows.length; r++) {
    const tr = allRows[r];
    const tds = tr.children;
    for (let c = 0; c < tds.length; c++) {
      const td = tds[c];
      let colIdx = c;
      const colAttr = td.getAttribute('data-col');
      if (colAttr !== null) {
        colIdx = parseInt(colAttr);
        if (isNaN(colIdx)) colIdx = c;
      }
      if (!td || td.innerHTML.trim() === '' || td.innerHTML === '&nbsp;') continue;
      if (colIdx >= 0 && colIdx < colCount) hasTdContent[colIdx] = true;
      const titleOnly = hideContentArr && hideContentArr[colIdx] === true;
      const w = measureCellTextWidth(td, titleOnly);
      if (w > maxWidths[colIdx]) maxWidths[colIdx] = w;
    }
  }

  for (let c = 0; c < colCount; c++) {
    if (!hasTdContent[c]) {
      maxWidths[c] = 40;
      continue;
    }
    const th = thCells[c];
    if (th) {
      const w = measureCellTextWidth(th, false);
      if (w > maxWidths[c]) maxWidths[c] = w;
    }
    maxWidths[c] = Math.ceil(maxWidths[c]) + 2;
  }

  for (let c = 0; c < colCount; c++) {
    if (thCells[c]) {
      thCells[c].style.width = maxWidths[c] + 'px';
      thCells[c].style.minWidth = maxWidths[c] + 'px';
      thCells[c].style.maxWidth = maxWidths[c] + 'px';
    }
  }

  for (let r = 0; r < allRows.length; r++) {
    const tr = allRows[r];
    const tds = tr.children;
    let curCol = 0;
    for (let i = 0; i < tds.length; i++) {
      const td = tds[i];
      const rs = parseInt(td.getAttribute('rowspan')) || 1;
      let colIdx = curCol;
      const colAttr = td.getAttribute('data-col');
      if (colAttr !== null) colIdx = parseInt(colAttr);
      const w = (colIdx >= 0 && colIdx < maxWidths.length) ? maxWidths[colIdx] : maxWidths[Math.min(curCol, maxWidths.length - 1)];
      td.style.width = w + 'px';
      td.style.minWidth = w + 'px';
      td.style.maxWidth = w + 'px';
      curCol += rs;
    }
  }
}

export function scheduleAutoFit(tableId, hideContentArr) {
  requestAnimationFrame(() => {
    setTimeout(() => autoFitColumnWidths(tableId, hideContentArr), 0);
  });
}
