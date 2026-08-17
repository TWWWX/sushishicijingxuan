export function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatPoemString(str) {
  str = str.replace(/\r/g, '');
  const lines = str.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let title = null;
  let content = '';

  if (lines.length >= 2) {
    const first = lines[0];
    if (/《.+》/.test(first)) {
      title = first;
      content = lines.slice(1).join('');
    } else {
      const m = lines[0].match(/^(《[^》]+》)[\s:：]*(.*)$/);
      if (m) {
        title = m[1];
        content = (m[2] ? m[2] + ' ' : '') + lines.slice(1).join('');
      } else {
        content = lines.join('');
      }
    }
  } else if (lines.length === 1) {
    const s = lines[0];
    const m = s.match(/^(《[^》]+》)[\s:：]*(.*)$/);
    if (m) {
      title = m[1];
      content = m[2] || '';
    } else {
      const m2 = s.match(/^(.*?)(《[^》]+》)(.*)$/);
      if (m2) {
        title = m2[2];
        content = (m2[1] + m2[3]).replace(/^[\s，,。.:：；;]+/, '');
      } else {
        content = s;
      }
    }
  }

  if (title) {
    return `<span class="poem-title">${escapeHtml(title)}</span>` + (content ? `<span class="poem-content">${escapeHtml(content)}</span>` : '');
  }
  return `<span class="poem-content">${escapeHtml(str)}</span>`;
}

export function formatPoemCell(data) {
  if (!data) return '';
  if (typeof data === 'string') {
    return formatPoemString(data);
  }
  return `<span class="poem-title">${escapeHtml(data.title)}</span><span class="poem-content">${escapeHtml(data.content)}</span>`;
}

export function parsePlainToPoem(str) {
  if (!str) return { title: '', content: '' };
  str = str.replace(/\r/g, '').trim();
  const lines = str.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  let title = null, content = '';
  if (lines.length >= 2 && /《.+》/.test(lines[0])) {
    title = lines[0]; content = lines.slice(1).join('');
  } else if (lines.length === 1) {
    const m = lines[0].match(/^(《[^》]+》)[\s:：]*(.*)$/);
    if (m) { title = m[1]; content = m[2] || ''; }
    else { content = lines[0]; }
  } else {
    content = lines.join(' ');
  }
  return { title: title || '', content: content };
}

export function cloneData(data) {
  if (typeof data === 'string') return data;
  return { ...data };
}

export function dataEqual(a, b) {
  if (typeof a === 'string' && typeof b === 'string') return a === b;
  if (typeof a === 'object' && typeof b === 'object') {
    return a && b && a.title === b.title && a.content === b.content;
  }
  return false;
}

export function parseDlcText(raw) {
  raw = raw.replace(/\r/g, '').replace(/\u200c/g, '').replace(/\u200b/g, '').replace(/\ufeff/g, '');
  const result = [];
  const blocks = raw.split(/"/).filter(s => s.trim().length > 0);
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim();
    if (!block) continue;
    const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) continue;
    let title = '';
    let content = '';
    if (/^《.+》/.test(lines[0])) {
      title = lines[0];
      content = lines.slice(1).join(' ');
    } else {
      const m = lines[0].match(/^(《[^》]+》)[\s:：]*(.*)$/);
      if (m) {
        title = m[1];
        content = (m[2] ? m[2] + ' ' : '') + lines.slice(1).join(' ');
      } else {
        content = lines.join(' ');
      }
    }
    if (title || content) {
      result.push({ title: title, content: content });
    }
  }
  return result;
}

export async function loadDlcFile(url, fallback) {
  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (resp.ok) {
      const text = await resp.text();
      const parsed = parseDlcText(text);
      if (parsed && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}
  return fallback ? [...fallback] : [];
}
