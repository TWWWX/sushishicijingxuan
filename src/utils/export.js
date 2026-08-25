import html2canvas from 'html2canvas';
import { getCellKey } from '../data/poems';

const USER_STORAGE_KEY = 'ss_user_id';
const USER_COOKIE_KEY = 'ss_user_cookie';
const ID_LEN = 16;

function randomId(len) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function setCookie(name, value, days) {
  try {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const secure = location.protocol === 'https:' ? ';Secure' : '';
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;SameSite=Lax${secure}`;
  } catch (e) {}
}

function getCookie(name) {
  try {
    const key = name + '=';
    const parts = document.cookie ? document.cookie.split(';') : [];
    for (let i = 0; i < parts.length; i++) {
      let c = parts[i];
      while (c.charAt(0) === ' ') c = c.substring(1);
      if (c.indexOf(key) === 0) return c.substring(key.length);
    }
  } catch (e) {}
  return '';
}

// 首次访问页面就确保生成并写入 LocalStorage；Cookie 作为独立的第二重标识
export function ensureUserId() {
  // LocalStorage：第一次访问就生成并持久化；一旦存在永不覆盖
  let storageId = '';
  try {
    storageId = localStorage.getItem(USER_STORAGE_KEY) || '';
  } catch (e) { storageId = ''; }
  if (!storageId) {
    storageId = randomId(ID_LEN);
    try { localStorage.setItem(USER_STORAGE_KEY, storageId); } catch (e) {}
  }

  // Cookie：独立生成的备份标识；不存在时补齐，不污染 localStorage
  let cookieId = getCookie(USER_COOKIE_KEY);
  if (!cookieId) {
    cookieId = randomId(ID_LEN);
    setCookie(USER_COOKIE_KEY, cookieId, 365);
  }

  return { storageId, cookieId };
}

// 上传时读取已在首次访问时生成好的双重标识
export function getStableUserId() {
  return ensureUserId();
}

function safeSegment(s) {
  return String(s || '').replace(/[\\/:*?"<>|\s]/g, '_').substring(0, 64);
}

export function formatDate() {
  const d = new Date();
  return d.getFullYear() +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0') + '_' +
    String(d.getHours()).padStart(2, '0') +
    String(d.getMinutes()).padStart(2, '0');
}

export function getCSVString(options) {
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
  return '\uFEFF' + rows.map(row =>
    row.map(cell => {
      if (cell === null || cell === undefined) return '""';
      const s = String(cell);
      if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(',')
  ).join('\r\n');
}

export function exportCSV(options) {
  const { fillerName, mode } = options || {};
  const csvContent = getCSVString(options);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const name = (fillerName || '未署名') + '_sushishiwen_' + (mode || '') + '_' + formatDate();
  link.href = URL.createObjectURL(blob);
  link.download = name + '.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function uploadCSV(options) {
  const { cellData, columnConfig, headerLabels, totalRows, title, folder, fillerName, mode, onStatus } = options || {};
  if (onStatus) onStatus('uploading');
  try {
    const csvContent = getCSVString({ cellData, columnConfig, headerLabels, totalRows, title });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const { storageId, cookieId } = getStableUserId();
    // 文件名仅使用 Cookie + LocalStorage 双重用户标识与模式标识，不含填表人，同用户同表格多次上传自动覆盖
    const fileName = `${safeSegment(cookieId || 'none')}_${safeSegment(storageId || 'none')}_${safeSegment(mode || '')}.csv`;
    const apiUrl = `/api/upload?fileName=${encodeURIComponent(fileName)}&folder=${encodeURIComponent(folder)}`;
    const resp = await fetch(apiUrl);
    if (!resp.ok) {
      const errText = await resp.text();
      throw new Error(`获取上传地址失败(${resp.status}): ${errText}`);
    }
    const { signedUrl, fileKey } = await resp.json();
    if (!signedUrl) throw new Error('未获取到上传地址');
    const putResp = await fetch(signedUrl, {
      method: 'PUT',
      body: blob,
      headers: { 'Content-Type': 'text/csv;charset=utf-8' }
    });
    if (!putResp.ok) {
      throw new Error(`上传失败(${putResp.status}): ${putResp.statusText}`);
    }
    if (onStatus) onStatus('success');
    return { success: true, fileKey };
  } catch (err) {
    if (onStatus) onStatus('error', err.message);
    throw err;
  }
}

export async function exportPNG(options) {
  const { fillerName, loadingCallbacks, title, mode, wrapperId, tableId, leftSubText, middleSubText } = options || {};
  const { show, hide } = loadingCallbacks || {};
  if (show) show('正在生成长图，请稍候...');
  try {
    const wId = wrapperId || 'tableWrapper';
    const tId = tableId || 'tournamentTable';
    const tableWrapper = document.getElementById(wId);
    const safeName = (fillerName || '').trim() || '——';
    const prevOverflow = tableWrapper.style.overflow;
    const prevMaxHeight = tableWrapper.style.maxHeight;
    tableWrapper.style.overflow = 'visible';
    tableWrapper.style.maxHeight = 'none';
    await new Promise(r => setTimeout(r, 100));

    const exportContainer = document.createElement('div');
    exportContainer.style.background = '#f5f3ef';
    exportContainer.style.padding = '16px';
    exportContainer.style.width = 'max-content';

    const titleDiv = document.createElement('div');
    titleDiv.style.textAlign = 'center';
    titleDiv.style.color = '#2c3e2c';
    titleDiv.style.fontSize = '26px';
    titleDiv.style.fontWeight = '700';
    titleDiv.style.letterSpacing = '4px';
    titleDiv.style.padding = '16px 10px 8px';
    titleDiv.style.borderBottom = '1px solid #b8cdb8';
    titleDiv.style.background = '#faf9f6';
    titleDiv.style.fontFamily = '"Noto Serif SC", "Songti SC", "SimSun", "STSong", serif';
    titleDiv.textContent = title || '苏轼作品';
    exportContainer.appendChild(titleDiv);

    const subDiv = document.createElement('div');
    subDiv.style.display = 'flex';
    subDiv.style.justifyContent = 'space-between';
    subDiv.style.alignItems = 'center';
    subDiv.style.color = '#6b866b';
    subDiv.style.padding = '6px 10px';
    subDiv.style.fontWeight = '400';
    subDiv.style.background = '#faf9f6';
    subDiv.style.borderBottom = '1px solid #b8cdb8';
    subDiv.style.fontSize = '14px';
    subDiv.style.fontFamily = '"Noto Serif SC", "Songti SC", "SimSun", "STSong", serif';

    const leftSpan = document.createElement('span');
    leftSpan.style.textAlign = 'left';
    leftSpan.style.flex = '1';
    leftSpan.textContent = leftSubText || '网页制作：蟋蟀 诗文筛汇：嫻菜无敌 蟋蟀';
    subDiv.appendChild(leftSpan);

    const middleSpan = document.createElement('span');
    middleSpan.style.textAlign = 'center';
    middleSpan.style.flex = '1';
    middleSpan.style.fontSize = '11px';
    middleSpan.textContent = middleSubText || '欢迎关注公众号【东坡墙】、QQ【3301590656】';
    subDiv.appendChild(middleSpan);

    const rightSpan = document.createElement('span');
    rightSpan.style.textAlign = 'right';
    rightSpan.style.flex = '1';
    rightSpan.textContent = '填表人：' + safeName;
    subDiv.appendChild(rightSpan);

    exportContainer.appendChild(subDiv);

    const mainClone = document.getElementById(tId).cloneNode(true);
    mainClone.style.zoom = '1';
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
      link.download = (fillerName || '未署名') + '_sushishiwen_' + (mode || '') + '_' + formatDate() + '.png';
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
