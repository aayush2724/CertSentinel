'use strict';

const dropZone    = document.getElementById('drop-zone');
const fileInput   = document.getElementById('file-input');
const fileNameEl  = document.getElementById('file-name');
const verifyBtn   = document.getElementById('verify-btn');
const resultSec   = document.getElementById('result-section');
const loading     = document.getElementById('loading');
const progressWrap = document.getElementById('upload-progress-wrapper');
const progressFill = document.getElementById('upload-progress-fill');
const progressVal  = document.getElementById('upload-progress-value');

let selectedFile = null;

// --- Drag & Drop ---
dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) setFile(file);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) setFile(fileInput.files[0]);
});

function setFile(file) {
  selectedFile = file;
  fileNameEl.textContent = `Selected: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  verifyBtn.disabled = false;
  resultSec.classList.add('hidden');
}

// --- Verify (XHR for upload progress support) ---
verifyBtn.addEventListener('click', () => {
  if (!selectedFile) return;

  resultSec.classList.add('hidden');
  loading.classList.remove('hidden');
  progressWrap.classList.remove('hidden');
  verifyBtn.disabled = true;
  setProgress(0);

  const formData = new FormData();
  formData.append('certificate', selectedFile);

  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener('progress', e => {
    if (e.lengthComputable) {
      setProgress(Math.round((e.loaded / e.total) * 100));
    }
  });

  xhr.addEventListener('load', () => {
    progressWrap.classList.add('hidden');
    loading.classList.add('hidden');
    let data;
    try {
      data = JSON.parse(xhr.responseText);
    } catch {
      alert('Server returned an invalid response.');
      verifyBtn.disabled = false;
      return;
    }

    if (data.error) {
      alert('Error: ' + data.error);
      verifyBtn.disabled = false;
      return;
    }

    renderResult(data);
    resultSec.classList.remove('hidden');
    verifyBtn.disabled = false;
  });

  xhr.addEventListener('error', () => {
    progressWrap.classList.add('hidden');
    loading.classList.add('hidden');
    alert('Network error. Please try again.');
    verifyBtn.disabled = false;
  });

  xhr.open('POST', '/verify');
  xhr.send(formData);
});

function setProgress(pct) {
  progressFill.style.width = pct + '%';
  progressVal.textContent = pct + '%';
}

function renderResult(data) {
  // Status badge
  const badge = document.getElementById('status-badge');
  badge.textContent = data.status;
  badge.className = 'status-badge badge-' + data.status.toLowerCase();

  // Confidence bar
  const pct = Math.round(data.confidence_score * 100);
  document.getElementById('confidence-fill').style.width = pct + '%';
  document.getElementById('confidence-value').textContent = pct + '%';

  // Reasons
  const list = document.getElementById('reasons-list');
  list.innerHTML = '';
  (data.reasons || []).forEach(r => {
    const li = document.createElement('li');
    li.textContent = r;
    list.appendChild(li);
  });

  // Extracted info table
  const tbody = document.getElementById('info-tbody');
  tbody.innerHTML = '';
  const info = data.extracted_info || {};
  Object.entries(info).forEach(([k, v]) => {
    if (!v || (Array.isArray(v) && v.length === 0)) return;
    const tr = document.createElement('tr');
    const displayVal = Array.isArray(v) ? v.join(', ') : String(v);
    // textContent used intentionally to prevent XSS
    const th = document.createElement('th');
    th.textContent = formatKey(k);
    const td = document.createElement('td');
    td.textContent = displayVal;
    tr.appendChild(th);
    tr.appendChild(td);
    tbody.appendChild(tr);
  });

  if (!tbody.children.length) {
    tbody.innerHTML = '<tr><td colspan="2" style="color:#94a3b8">No structured fields extracted.</td></tr>';
  }
}

function formatKey(k) {
  return k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
