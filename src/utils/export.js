import html2canvas from 'html2canvas';
import { getCellKey } from '../data/poems';

export function formatDate() {
  const d = new Date();
  return d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') + '_' +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0');
}

export function exportCSV(options) {
  const { cellData, columnConfig, headerLabels, totalRows, title } = options || {};
  const rows = [];
  const colCount = headerLabels.length;
  if (title) {
    const titleRow = [title];
    for (let i = 1; i < colCount; i++) titleRow.push('');
    rows.push(titleRow);
  }
  rows.push([...headerLabels]);
  for (let r = 0; r < totalRows; r++) {
    const row = [];
    for (let c = 0; c < colCount; c++) {
      const cfg = columnConfig[c];
      const rowInCol = Math.floor(r / cfg.rowSpan);
      const key = getCellKey(c, rowInCol);
      const isFirst = (r % cfg.rowSpan) === 0;
      if (isFirst && cellData[key] !== undefined) {
        const data = cellData[key];
        if (typeof data === 'string') {
          row.push(data.replace(/\n/g, ' '));
        } else {
          row.push(data.title + ' ' + data.content);
        }
      } else {
        row.push('');
      }
    }
    rows.push(row);
  }
  const csvContent = '\uFEFF' + rows.map(row =>
    row.map(cell => {
      if (cell === null || cell === undefined) return '""';
      const s = String(cell);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(',')
  ).join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = (title || '苏轼诗文作品') + '_' + formatDate() + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function exportPNG(options) {
  const { fillerName, loadingCallbacks, title } = options || {};
  const { show, hide } = loadingCallbacks || {};
  if (show) show('正在生成长图，请稍候...');
  try {
    const tableWrapper = document.getElementById('tableWrapper');
    const safeName = (fillerName || '').trim() || '——';
    const prevOverflow = tableWrapper.style.overflow;
    const prevMaxHeight = tableWrapper.style.maxHeight;
    tableWrapper.style.overflow = 'visible';
    tableWrapper.style.maxHeight = 'none';
    await new Promise(r => setTimeout(r, 100));

    const exportContainer = document.createElement('div');
    exportContainer.style.background = '#eef3ed';
    exportContainer.style.padding = '16px';
    exportContainer.style.width = 'max-content';

    const titleDiv = document.createElement('div');
    titleDiv.style.textAlign = 'center';
    titleDiv.style.color = '#4a7a52';
    titleDiv.style.fontSize = '26px';
    titleDiv.style.fontWeight = '700';
    titleDiv.style.letterSpacing = '4px';
    titleDiv.style.padding = '16px 10px 8px';
    titleDiv.style.borderBottom = '1px solid #b8cdb8';
    titleDiv.style.background = '#f5f8f4';
    titleDiv.textContent = title || '苏轼诗文作品';
    exportContainer.appendChild(titleDiv);

    const subDiv = document.createElement('div');
    subDiv.style.display = 'flex';
    subDiv.style.justifyContent = 'space-between';
    subDiv.style.alignItems = 'center';
    subDiv.style.color = '#6b866b';
    subDiv.style.padding = '6px 10px';
    subDiv.style.fontWeight = '400';
    subDiv.style.background = '#f5f8f4';
    subDiv.style.borderBottom = '1px solid #cfdccd';
    subDiv.style.fontSize = '14px';

    const leftSpan = document.createElement('span');
    leftSpan.style.textAlign = 'left';
    leftSpan.style.flex = '1';
    leftSpan.textContent = '网页制作：蟋蟀 诗文筛汇：嫻菜无敌 蟋蟀';
    subDiv.appendChild(leftSpan);

    const middleSpan = document.createElement('span');
    middleSpan.style.textAlign = 'center';
    middleSpan.style.flex = '1';
    middleSpan.style.fontSize = '11px';
    middleSpan.textContent = '欢迎关注公众号【东坡墙】、QQ【3301590656】';
    subDiv.appendChild(middleSpan);

    const rightSpan = document.createElement('span');
    rightSpan.style.textAlign = 'right';
    rightSpan.style.flex = '1';
    rightSpan.textContent = '填表人：' + safeName;
    subDiv.appendChild(rightSpan);

    exportContainer.appendChild(subDiv);

    const mainClone = document.getElementById('tournamentTable').cloneNode(true);
    mainClone.querySelectorAll('th').forEach(th => { th.style.position = 'static'; });
    mainClone.querySelectorAll('th').forEach(th => { th.style.borderRadius = '0'; });
    exportContainer.appendChild(mainClone);

    document.body.appendChild(exportContainer);
    await new Promise(r => setTimeout(r, 50));

    const canvas = await html2canvas(exportContainer, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      logging: false,
      windowWidth: exportContainer.scrollWidth + 40,
      windowHeight: exportContainer.scrollHeight + 40
    });

    document.body.removeChild(exportContainer);
    tableWrapper.style.overflow = prevOverflow;
    tableWrapper.style.maxHeight = prevMaxHeight;

    canvas.toBlob((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = (title || '苏轼诗文作品_东坡墙出品') + '_' + formatDate() + '.png';
      link.click();
      URL.revokeObjectURL(link.href);
      if (hide) hide();
    }, 'image/png');
  } catch (err) {
    console.error(err);
    if (hide) hide();
    alert('导出图片失败：' + err.message);
  }
}
