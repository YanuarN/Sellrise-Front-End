/**
 * Sellrise Widget – Embeddable Chat Bubble
 * Local development build — served via Vite public/ directory
 *
 * Exposes: window.sellrise(command, config)
 *   command: 'init'
 *   config:  { workspace, displayMode, position, apiBaseUrl, sessionId, scenario, branding }
 */
(function (w) {
  'use strict';

  /* ── Guard: prevent double-init ─────────────────────────────────────── */
  if (w.__sellriseLoaded) return;
  w.__sellriseLoaded = true;

  /* ── CSS injected into the page ──────────────────────────────────────── */
  var CSS = [
    '#sr-widget-root * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
    '#sr-bubble {',
    '  position: fixed; bottom: 20px; right: 20px; z-index: 2147483647;',
    '  width: 56px; height: 56px; border-radius: 50%;',
    '  background: #2563eb; color: #fff; border: none; cursor: pointer;',
    '  display: flex; align-items: center; justify-content: center;',
    '  box-shadow: 0 4px 16px rgba(37,99,235,.45);',
    '  transition: transform .2s, box-shadow .2s;',
    '}',
    '#sr-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(37,99,235,.55); }',
    '#sr-badge {',
    '  position: absolute; top: -4px; right: -4px; background: #ef4444;',
    '  color: #fff; font-size: 10px; font-weight: 700; border-radius: 999px;',
    '  min-width: 18px; height: 18px; padding: 0 4px;',
    '  display: none; align-items: center; justify-content: center;',
    '}',
    '#sr-panel {',
    '  position: fixed; bottom: 88px; right: 20px; z-index: 2147483646;',
    '  width: 360px; max-width: calc(100vw - 40px); height: 520px; max-height: calc(100vh - 120px);',
    '  background: #fff; border-radius: 16px;',
    '  box-shadow: 0 12px 40px rgba(0,0,0,.18); border: 1px solid #e5e7eb;',
    '  display: flex; flex-direction: column; overflow: hidden;',
    '  transform: scale(.92) translateY(16px); opacity: 0;',
    '  transition: transform .22s cubic-bezier(.34,1.36,.64,1), opacity .18s;',
    '  pointer-events: none;',
    '}',
    '#sr-panel.sr-open { transform: scale(1) translateY(0); opacity: 1; pointer-events: all; }',
    '#sr-panel-header {',
    '  padding: 14px 16px; background: #2563eb; color: #fff;',
    '  display: flex; align-items: center; gap: 10px; flex-shrink: 0;',
    '}',
    '#sr-panel-header .sr-avatar {',
    '  width: 34px; height: 34px; border-radius: 50%; background: rgba(255,255,255,.25);',
    '  display: flex; align-items: center; justify-content: center; flex-shrink: 0;',
    '}',
    '#sr-panel-header .sr-title { font-size: 14px; font-weight: 600; line-height: 1.2; }',
    '#sr-panel-header .sr-subtitle { font-size: 11px; opacity: .8; margin-top: 1px; }',
    '#sr-panel-header .sr-close {',
    '  margin-left: auto; background: none; border: none; color: rgba(255,255,255,.8);',
    '  cursor: pointer; padding: 4px; border-radius: 6px; font-size: 18px; line-height: 1;',
    '  transition: color .15s;',
    '}',
    '#sr-panel-header .sr-close:hover { color: #fff; }',
    '#sr-messages {',
    '  flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px;',
    '}',
    '#sr-messages::-webkit-scrollbar { width: 4px; }',
    '#sr-messages::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }',
    '.sr-msg { max-width: 80%; display: flex; flex-direction: column; gap: 2px; }',
    '.sr-msg.bot { align-self: flex-start; }',
    '.sr-msg.user { align-self: flex-end; }',
    '.sr-msg img { max-width: 100%; border-radius: 8px; margin-bottom: 4px; border: 1px solid #e5e7eb; }',
    '.sr-msg .sr-bubble-msg {',
    '  padding: 9px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.45;',
    '}',
    '.sr-msg.bot .sr-bubble-msg {',
    '  background: #f3f4f6; color: #111827; border-bottom-left-radius: 4px;',
    '}',
    '.sr-msg.user .sr-bubble-msg {',
    '  background: #2563eb; color: #fff; border-bottom-right-radius: 4px;',
    '}',
    '.sr-msg .sr-ts { font-size: 10px; color: #9ca3af; padding: 0 2px; }',
    '.sr-msg.user .sr-ts { text-align: right; }',
    '#sr-typing { display: flex; gap: 4px; align-items: center; padding: 10px 14px; }',
    '#sr-typing span {',
    '  width: 7px; height: 7px; border-radius: 50%; background: #9ca3af;',
    '  animation: sr-bounce .9s infinite;',
    '}',
    '#sr-typing span:nth-child(2) { animation-delay: .15s; }',
    '#sr-typing span:nth-child(3) { animation-delay: .3s; }',
    '@keyframes sr-bounce { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }',
    '#sr-lead-form {',
    '  padding: 16px; background: #f9fafb; border-top: 1px solid #e5e7eb;',
    '  display: flex; flex-direction: column; gap: 8px; flex-shrink: 0;',
    '}',
    '#sr-lead-form p { font-size: 13px; color: #374151; margin: 0; }',
    '#sr-lead-form input {',
    '  padding: 9px 12px; border: 1px solid #d1d5db; border-radius: 8px;',
    '  font-size: 13px; outline: none; transition: border-color .15s;',
    '}',
    '#sr-lead-form input:focus { border-color: #2563eb; }',
    '#sr-lead-form button {',
    '  padding: 10px; background: #2563eb; color: #fff; border: none;',
    '  border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;',
    '  transition: background .15s;',
    '}',
    '#sr-lead-form button:hover { background: #1d4ed8; }',
    '#sr-lead-form button:disabled { background: #93c5fd; cursor: not-allowed; }',
    '#sr-input-row {',
    '  padding: 12px; border-top: 1px solid #e5e7eb;',
    '  display: flex; gap: 8px; align-items: flex-end; flex-shrink: 0;',
    '}',
    '#sr-input {',
    '  flex: 1; resize: none; border: 1px solid #d1d5db; border-radius: 10px;',
    '  padding: 9px 12px; font-size: 13px; line-height: 1.4; max-height: 96px;',
    '  outline: none; transition: border-color .15s;',
    '}',
    '#sr-input:focus { border-color: #2563eb; }',
    '#sr-attach, #sr-send {',
    '  width: 36px; height: 36px; border-radius: 50%; background: #2563eb; color: #fff;',
    '  border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;',
    '  flex-shrink: 0; transition: background .15s;',
    '}',
    '#sr-attach { background: #f3f4f6; color: #6b7280; border: 1px solid #d1d5db; }',
    '#sr-attach:hover { background: #e5e7eb; color: #374151; }',
    '#sr-send:hover { background: #1d4ed8; }',
    '#sr-send:disabled, #sr-attach:disabled { opacity: 0.5; cursor: not-allowed; }',
    '.sr-status-msg { font-size: 12px; color: #6b7280; text-align: center; padding: 4px; }',
    '#sr-preview-row {',
    '  padding: 8px 12px; background: #f9fafb; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;',
    '  display: none; flex-direction: column; gap: 8px;',
    '}',
    '.sr-preview-summary { display:flex; align-items:center; justify-content:space-between; gap:8px; width:100%; }',
    '.sr-preview-summary strong { font-size: 11px; color: #374151; }',
    '.sr-preview-summary span { font-size: 10px; color: #6b7280; }',
    '.sr-preview-list { display:grid; grid-template-columns:repeat(3, minmax(0, 1fr)); gap:8px; width:100%; }',
    '.sr-preview-item { position:relative; overflow:hidden; border-radius:8px; border:1px solid #d1d5db; background:#fff; }',
    '.sr-preview-thumb { width:100%; height:64px; object-fit:cover; display:block; background: #fff; }',
    '.sr-preview-remove-item {',
    '  position:absolute; top:4px; right:4px; background:rgba(17,24,39,.72); border:none; border-radius:999px; width:20px; height:20px;',
    '  display:flex; align-items:center; justify-content:center; cursor:pointer; color:#fff; font-size:12px;',
    '}',
    '.sr-preview-remove-item:hover { background: rgba(17,24,39,.9); }',
    '#sr-preview-clear {',
    '  background: #e5e7eb; border: none; border-radius: 50%; width: 22px; height: 22px;',
    '  display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4b5563;',
    '}',
    '#sr-preview-clear:hover { background: #d1d5db; color: #111827; }',
    /* ── Photo Upload Step (PRD 3) ─────────────────────────────────────── */
    '.sr-photo-step { padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; margin: 4px 0; }',
    '.sr-photo-step .sr-photo-prompt { font-size: 13px; color: #374151; margin: 0 0 12px 0; line-height: 1.45; }',
    '.sr-photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }',
    '.sr-photo-slot { position: relative; aspect-ratio: 1; border: 2px dashed #d1d5db; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; background: #fff; transition: border-color .15s, background .15s; overflow: hidden; }',
    '.sr-photo-slot:hover { border-color: #2563eb; background: #eff6ff; }',
    '.sr-photo-slot.has-photo { border-style: solid; border-color: #d1d5db; cursor: default; }',
    '.sr-photo-slot .sr-slot-icon { font-size: 20px; color: #9ca3af; margin-bottom: 2px; }',
    '.sr-photo-slot .sr-slot-label { font-size: 10px; color: #9ca3af; }',
    '.sr-photo-slot img { width: 100%; height: 100%; object-fit: cover; position: absolute; top: 0; left: 0; }',
    '.sr-photo-slot .sr-slot-remove { position: absolute; top: 3px; right: 3px; background: rgba(0,0,0,.6); color: #fff; border: none; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 2; }',
    '.sr-photo-slot .sr-slot-status { position: absolute; bottom: 3px; right: 3px; font-size: 14px; z-index: 2; }',
    '.sr-photo-slot .sr-slot-progress { position: absolute; bottom: 0; left: 0; height: 3px; background: #2563eb; transition: width .2s; z-index: 2; }',
    '.sr-photo-type-row { margin-bottom: 10px; }',
    '.sr-photo-type-row label { font-size: 11px; color: #6b7280; display: block; margin-bottom: 3px; }',
    '.sr-photo-type-row select { width: 100%; padding: 6px 8px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; background: #fff; }',
    '.sr-consent-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 12px; }',
    '.sr-consent-row input[type=checkbox] { margin-top: 2px; flex-shrink: 0; width: 16px; height: 16px; accent-color: #2563eb; }',
    '.sr-consent-row label { font-size: 11px; color: #374151; line-height: 1.4; cursor: pointer; }',
    '.sr-photo-actions { display: flex; gap: 8px; }',
    '.sr-photo-actions button { flex: 1; padding: 9px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: background .15s, opacity .15s; }',
    '.sr-photo-btn-upload { background: #2563eb; color: #fff; }',
    '.sr-photo-btn-upload:hover { background: #1d4ed8; }',
    '.sr-photo-btn-upload:disabled { opacity: 0.5; cursor: not-allowed; }',
    '.sr-photo-btn-skip { background: #e5e7eb; color: #374151; }',
    '.sr-photo-btn-skip:hover { background: #d1d5db; }',
    '.sr-photo-retry-btn { background: none; border: 1px solid #ef4444; color: #ef4444; border-radius: 4px; font-size: 10px; padding: 2px 6px; cursor: pointer; margin-top: 2px; }',
  ].join('\n');

  /* ── Helpers ─────────────────────────────────────────────────────────── */
  function injectCSS() {
    var s = document.createElement('style');
    s.id = 'sr-widget-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function ts() {
    var d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  }

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html) e.innerHTML = html;
    return e;
  }

  /* ── Main init ───────────────────────────────────────────────────────── */
  function init(config) {
    var apiBase        = config.apiBaseUrl   || 'http://localhost:8000';
    var workspace      = config.workspace    || '';
    var sessionId      = config.sessionId    || ('sr_' + Date.now());
    var branding       = config.branding     || {};
    var scenario       = config.scenario     || null;
    var brandName      = branding.brand_name || 'Plashic';
    var brandColor     = branding.brand_primary_color || '#2563eb';
    var bubbleColor    = branding.bubble_color || brandColor;
    var bubbleIcon     = branding.bubble_icon || null;
    var position       = branding.position || config.position || 'bottom-right';
    var borderRadius   = branding.border_radius ? branding.border_radius + 'px' : '16px';
    var bubbleSize     = branding.bubble_size || 'large';
    var bubblePx       = bubbleSize === 'small' ? '44px' : bubbleSize === 'medium' ? '50px' : '56px';

    /* Apply brand colours to injected CSS */
    var root = document.querySelector('#sr-widget-css');
    if (root) {
      root.textContent = CSS
        .replace(/#2563eb/g, brandColor)
        .replace(/#1d4ed8/g, shadeColor(brandColor, -15));
    }

    /* Adjust position */
    var side   = (position === 'bottom-left') ? 'left' : 'right';
    var oppSide= (position === 'bottom-left') ? 'right' : 'left';

    /* ── State ─────────────────────────────────────────────────────────── */
    var isOpen    = false;
    var leadId    = null;
    var isSending = false;
    var isUploading = false;
    var pendingAttachments = [];
    var hasShownGreeting = false;
    var patientServiceConfig = null;    // { enabled, base_url, auth_token }
    var patientId = null;               // Phlastic patient_id from external_identities

    /* Accept patient_service from config (typically injected after /session call) */
    if (config.patient_service && config.patient_service.enabled) {
      patientServiceConfig = config.patient_service;
    }

    /* ── DOM ───────────────────────────────────────────────────────────── */
    var container = el('div', { id: 'sr-widget-root' });

    /* Bubble button */
    var bubble = el('button', { id: 'sr-bubble' });
    bubble.style[side] = '20px';
    bubble.style[oppSide] = 'auto';
    bubble.style.width = bubblePx;
    bubble.style.height = bubblePx;
    bubble.style.background = bubbleColor;
    bubble.innerHTML = bubbleIcon
      ? '<span style="font-size:22px;line-height:1">' + escHtml(bubbleIcon) + '</span>'
      : SVG_CHAT;
    var badge = el('span', { id: 'sr-badge' });
    bubble.appendChild(badge);

    /* Panel */
    var panel = el('div', { id: 'sr-panel' });
    panel.style[side] = '20px';
    panel.style[oppSide] = 'auto';
    panel.style.borderRadius = borderRadius;

    /* Header */
    var header = el('div', { id: 'sr-panel-header' });
    header.style.background = brandColor;
    header.innerHTML =
      '<div class="sr-avatar">' + SVG_BOT + '</div>' +
      '<div>' +
        '<div class="sr-title">' + escHtml(brandName) + '</div>' +
        '<div class="sr-subtitle">Typically replies instantly</div>' +
      '</div>' +
      '<button class="sr-close" id="sr-close-btn" aria-label="Close chat">&times;</button>';

    /* Messages area */
    var messagesEl = el('div', { id: 'sr-messages' });

    /* Lead capture form (hidden – contact info collected via chatbot scenario) */
    var leadFormEl = el('div', { id: 'sr-lead-form' });
    leadFormEl.style.display = 'none';
    leadFormEl.innerHTML =
      '<p id="sr-lead-err" class="sr-status-msg" style="color:#ef4444;display:none"></p>';

    /* Preview row */
    var previewRow = el('div', { id: 'sr-preview-row' });
    previewRow.innerHTML = '';

    /* Input row */
    var inputRow = el('div', { id: 'sr-input-row' });
    inputRow.innerHTML =
      '<button id="sr-attach" aria-label="Attach photo" type="button">' + SVG_ATTACH + '</button>' +
      '<input type="file" id="sr-file-input" accept="image/jpeg, image/png, image/webp" multiple style="display:none" />' +
      '<textarea id="sr-input" rows="1" placeholder="Type a message…"></textarea>' +
      '<button id="sr-send" aria-label="Send">' + SVG_SEND + '</button>';

    panel.appendChild(header);
    panel.appendChild(messagesEl);
    panel.appendChild(leadFormEl);
    panel.appendChild(previewRow);
    panel.appendChild(inputRow);

    container.appendChild(bubble);
    container.appendChild(panel);
    document.body.appendChild(container);

    /* ── Interaction helpers ───────────────────────────────────────────── */
    function normalizeUploadedFiles(response) {
      if (response && Array.isArray(response.files)) return response.files;
      if (response && response.url) return [response];
      return [];
    }

    function resolveAttachmentUrl(url) {
      var host = apiBase === '/' ? '' : apiBase;
      return url && url.charAt(0) === '/' ? host + url : (url || '');
    }

    function updateInputPlaceholder() {
      var input = document.getElementById('sr-input');
      if (!input) return;
      input.placeholder = pendingAttachments.length
        ? 'Add a note... (' + pendingAttachments.length + '/3 photos attached)'
        : 'Type a message…';
    }

    function renderPendingAttachments() {
      if (!pendingAttachments.length) {
        previewRow.style.display = 'none';
        previewRow.innerHTML = '';
        updateInputPlaceholder();
        return;
      }

      var itemsHtml = pendingAttachments.map(function (attachmentUrl, index) {
        return '' +
          '<div class="sr-preview-item">' +
            '<img class="sr-preview-thumb" src="' + escHtml(resolveAttachmentUrl(attachmentUrl)) + '" alt="Preview ' + (index + 1) + '" />' +
            '<button class="sr-preview-remove-item" data-index="' + index + '" title="Remove">&times;</button>' +
          '</div>';
      }).join('');

      previewRow.innerHTML = '' +
        '<div class="sr-preview-summary">' +
          '<div><strong>' + pendingAttachments.length + ' photo' + (pendingAttachments.length === 1 ? '' : 's') + ' attached</strong><br/><span>Ready to send</span></div>' +
          '<button id="sr-preview-clear" title="Remove all">&times;</button>' +
        '</div>' +
        '<div class="sr-preview-list">' + itemsHtml + '</div>';
      previewRow.style.display = 'flex';
      updateInputPlaceholder();
    }

    function addMessage(role, text, attachmentUrls) {
      var msg = el('div', { class: 'sr-msg ' + role });
      var parts = [];
      var images = Array.isArray(attachmentUrls)
        ? attachmentUrls
        : (attachmentUrls ? [attachmentUrls] : []);
      if (images.length) {
        for (var imageIndex = 0; imageIndex < images.length; imageIndex += 1) {
          parts.push('<img src="' + escHtml(resolveAttachmentUrl(images[imageIndex])) + '" alt="Attachment" />');
        }
      }
      if (text) {
        parts.push('<div class="sr-bubble-msg">' + escHtml(text) + '</div>');
      }
      msg.innerHTML = parts.join('') +
        '<span class="sr-ts">' + ts() + '</span>';
      messagesEl.appendChild(msg);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    /* ── Photo Upload Step (PRD 3) ─────────────────────────────────────── */
    var PHOTO_TYPES = ['face_front', 'face_side', 'face_45', 'body', 'other'];
    var PHOTO_TYPE_LABELS = {
      face_front: 'Front face', face_side: 'Side profile',
      face_45: '45° angle', body: 'Body / area', other: 'Other'
    };
    var PHOTO_MAX_FILES = 5;
    var PHOTO_MAX_SIZE_MB = 10;
    var PHOTO_ACCEPTED = ['image/jpeg', 'image/png', 'image/heic'];

    function fetchPatientId(callback) {
      if (patientId) { callback(); return; }
      if (!leadId) { callback(); return; }
      var host = apiBase === '/' ? '' : apiBase;
      fetch(host + '/v1/widget/lead-identity?lead_id=' + leadId + '&workspace_id=' + workspace)
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(data) {
          if (data && data.patient_id) {
            patientId = data.patient_id;
          }
          callback();
        })
        .catch(function() { callback(); });
    }

    function renderPhotoUploadStep(stepConfig, onComplete) {
      var cfg = stepConfig.config || stepConfig || {};
      var promptText = cfg.prompt || 'Please upload photos for your consultation.';
      var consentText = cfg.consent_text || 'I consent to sharing these photos with the medical team for consultation purposes.';
      var maxFiles = cfg.max_files || PHOTO_MAX_FILES;
      var isRequired = cfg.required !== false;
      var photoTypes = cfg.photo_types || PHOTO_TYPES;

      var photoSlots = []; // { file, type, status: 'pending'|'uploading'|'success'|'failed', progress, photoId }
      var consentChecked = false;

      var wrapper = el('div', { class: 'sr-msg bot' });
      var stepEl = el('div', { class: 'sr-photo-step' });

      function rebuildUI() {
        var slotsHtml = '';
        var filledCount = photoSlots.length;
        var showAddSlots = Math.min(maxFiles - filledCount, 3 - filledCount);
        if (showAddSlots < 0) showAddSlots = 0;
        var totalVisible = filledCount + (filledCount < maxFiles ? 1 : 0);
        if (totalVisible > maxFiles) totalVisible = maxFiles;

        for (var i = 0; i < photoSlots.length; i++) {
          var ps = photoSlots[i];
          var statusIcon = '';
          var progressBar = '';
          var removeBtn = '<button class="sr-slot-remove" data-rm="' + i + '">&times;</button>';
          if (ps.status === 'uploading') {
            progressBar = '<div class="sr-slot-progress" style="width:' + (ps.progress || 0) + '%"></div>';
            removeBtn = '';
          } else if (ps.status === 'success') {
            statusIcon = '<span class="sr-slot-status">\u2705</span>';
          } else if (ps.status === 'failed') {
            statusIcon = '<span class="sr-slot-status">\u274c</span>';
          }
          var thumbUrl = ps.file ? URL.createObjectURL(ps.file) : '';
          slotsHtml += '<div class="sr-photo-slot has-photo">' +
            '<img src="' + escHtml(thumbUrl) + '" alt="Photo ' + (i+1) + '" />' +
            removeBtn + statusIcon + progressBar +
          '</div>';
        }
        if (filledCount < maxFiles) {
          slotsHtml += '<div class="sr-photo-slot" data-add="true"><span class="sr-slot-icon">+</span><span class="sr-slot-label">Add Photo</span></div>';
        }

        var typeOptionsHtml = photoTypes.map(function(t) {
          return '<option value="' + t + '">' + (PHOTO_TYPE_LABELS[t] || t) + '</option>';
        }).join('');

        var allDone = photoSlots.length > 0 && photoSlots.every(function(s) { return s.status === 'success'; });
        var anyUploading = photoSlots.some(function(s) { return s.status === 'uploading'; });
        var anyPending = photoSlots.some(function(s) { return s.status === 'pending' || s.status === 'failed'; });
        var uploadDisabled = !consentChecked || photoSlots.length === 0 || anyUploading || allDone;
        var skipVisible = !isRequired && !anyUploading;

        stepEl.innerHTML =
          '<p class="sr-photo-prompt">' + escHtml(promptText) + '</p>' +
          '<div class="sr-photo-grid">' + slotsHtml + '</div>' +
          (photoSlots.length > 0 ? '<div class="sr-photo-type-row"><label>Photo type</label><select id="sr-photo-type-select">' + typeOptionsHtml + '</select></div>' : '') +
          '<div class="sr-consent-row">' +
            '<input type="checkbox" id="sr-photo-consent" ' + (consentChecked ? 'checked' : '') + ' />' +
            '<label for="sr-photo-consent">' + escHtml(consentText) + '</label>' +
          '</div>' +
          '<div class="sr-photo-actions">' +
            '<button class="sr-photo-btn-upload" id="sr-photo-upload-btn" ' + (uploadDisabled ? 'disabled' : '') + '>' +
              (allDone ? '\u2705 Done' : (anyUploading ? 'Uploading...' : 'Upload & Continue')) +
            '</button>' +
            (skipVisible ? '<button class="sr-photo-btn-skip" id="sr-photo-skip-btn">Skip</button>' : '') +
          '</div>';

        // Bind events
        var addSlot = stepEl.querySelector('[data-add]');
        if (addSlot) {
          addSlot.addEventListener('click', function() {
            var inp = document.createElement('input');
            inp.type = 'file';
            inp.accept = PHOTO_ACCEPTED.join(',');
            inp.multiple = true;
            inp.addEventListener('change', function(e) {
              var files = Array.prototype.slice.call(e.target.files || []);
              for (var fi = 0; fi < files.length && photoSlots.length < maxFiles; fi++) {
                var f = files[fi];
                if (f.size > PHOTO_MAX_SIZE_MB * 1024 * 1024) {
                  alert('File too large (max ' + PHOTO_MAX_SIZE_MB + 'MB): ' + f.name);
                  continue;
                }
                if (PHOTO_ACCEPTED.indexOf(f.type) === -1 && f.type !== '') {
                  alert('Unsupported file type: ' + f.name + '. Accepted: JPEG, PNG, HEIC');
                  continue;
                }
                photoSlots.push({ file: f, type: photoTypes[0], status: 'pending', progress: 0, photoId: null });
              }
              rebuildUI();
            });
            inp.click();
          });
        }

        // Remove buttons
        var rmBtns = stepEl.querySelectorAll('[data-rm]');
        for (var ri = 0; ri < rmBtns.length; ri++) {
          (function(btn) {
            btn.addEventListener('click', function() {
              var idx = parseInt(btn.getAttribute('data-rm'), 10);
              photoSlots.splice(idx, 1);
              rebuildUI();
            });
          })(rmBtns[ri]);
        }

        // Consent checkbox
        var consentCb = document.getElementById('sr-photo-consent');
        if (consentCb) {
          consentCb.addEventListener('change', function() {
            consentChecked = this.checked;
            rebuildUI();
          });
        }

        // Type select — applies to all pending photos
        var typeSelect = document.getElementById('sr-photo-type-select');
        if (typeSelect) {
          typeSelect.addEventListener('change', function() {
            var val = this.value;
            for (var ti = 0; ti < photoSlots.length; ti++) {
              if (photoSlots[ti].status === 'pending') {
                photoSlots[ti].type = val;
              }
            }
          });
        }

        // Upload button
        var uploadBtn = document.getElementById('sr-photo-upload-btn');
        if (uploadBtn && allDone) {
          uploadBtn.addEventListener('click', function() { onComplete(photoSlots); });
        } else if (uploadBtn) {
          uploadBtn.addEventListener('click', function() {
            if (!consentChecked || photoSlots.length === 0) return;
            startPhotoUploads();
          });
        }

        // Skip button
        var skipBtn = document.getElementById('sr-photo-skip-btn');
        if (skipBtn) {
          skipBtn.addEventListener('click', function() { onComplete([]); });
        }

        messagesEl.scrollTop = messagesEl.scrollHeight;
      }

      function startPhotoUploads() {
        if (!patientServiceConfig || !patientServiceConfig.base_url) {
          alert('Photo upload service is not configured.');
          return;
        }
        if (!patientId) {
          alert('Patient record not found. Please complete the contact form first.');
          return;
        }

        var pendingSlots = photoSlots.filter(function(s) { return s.status === 'pending' || s.status === 'failed'; });
        pendingSlots.forEach(function(slot) {
          slot.status = 'uploading';
          slot.progress = 0;
        });
        rebuildUI();

        pendingSlots.forEach(function(slot, idx) {
          uploadSinglePhoto(slot);
        });
      }

      function uploadSinglePhoto(slot) {
        var fd = new FormData();
        fd.append('file', slot.file);
        fd.append('type', slot.type);
        fd.append('uploaded_via', 'chatbot');
        fd.append('consent_given', 'true');

        var xhr = new XMLHttpRequest();
        xhr.open('POST', patientServiceConfig.base_url + '/patients/' + patientId + '/photos');
        xhr.setRequestHeader('Authorization', 'Bearer ' + patientServiceConfig.auth_token);

        xhr.upload.addEventListener('progress', function(e) {
          if (e.lengthComputable) {
            slot.progress = Math.round((e.loaded / e.total) * 100);
            rebuildUI();
          }
        });

        xhr.addEventListener('load', function() {
          if (xhr.status === 201 || xhr.status === 200) {
            slot.status = 'success';
            try {
              var resp = JSON.parse(xhr.responseText);
              slot.photoId = resp.id || null;
            } catch(e) { /* ignore parse error */ }
            rebuildUI();
            logPhotoEvent(slot);
            checkAllComplete();
          } else {
            slot.status = 'failed';
            slot.progress = 0;
            rebuildUI();
          }
        });

        xhr.addEventListener('error', function() {
          slot.status = 'failed';
          slot.progress = 0;
          rebuildUI();
        });

        xhr.send(fd);
      }

      function logPhotoEvent(slot) {
        if (!slot.photoId || !leadId) return;
        var host = apiBase === '/' ? '' : apiBase;
        fetch(host + '/v1/widget/photo-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspace_id: workspace,
            lead_id: leadId,
            photo_id: slot.photoId,
            photo_type: slot.type,
            patient_id: patientId,
          }),
        }).catch(function() { /* best-effort logging */ });
      }

      function checkAllComplete() {
        var allDone = photoSlots.every(function(s) { return s.status === 'success'; });
        if (allDone) { rebuildUI(); }
      }

      rebuildUI();
      wrapper.appendChild(stepEl);
      messagesEl.appendChild(wrapper);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    var typingEl = null;
    function showTyping() {
      typingEl = el('div', { class: 'sr-msg bot' });
      typingEl.innerHTML = '<div id="sr-typing"><span></span><span></span><span></span></div>';
      messagesEl.appendChild(typingEl);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    function hideTyping() {
      if (typingEl) { typingEl.remove(); typingEl = null; }
    }

    function showError(msg) {
      var p = el('p', { class: 'sr-status-msg', style: 'color:#ef4444' });
      p.textContent = msg;
      messagesEl.appendChild(p);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function postJSON(url, body) {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then(function (r) {
        if (!r.ok) return r.json().then(function (e) { throw new Error(e.detail || 'Request failed'); });
        return r.json();
      });
    }

    /* ── Anonymous lead auto-creation ────────────────────────────────────── */
    function autoCreateLead() {
      postJSON(apiBase + '/v1/widget/lead', {
        workspace_id: workspace,
        session_id: sessionId,
        email: 'visitor-' + sessionId + '@widget.local',
        consent_given: true,
      })
        .then(function (res) {
          leadId = res.lead_id;
          hasShownGreeting = false;
          /* Show initial greeting from the scenario */
          var greeting = getGreetingFromScenario('there');
          addMessage('bot', greeting);
          hasShownGreeting = true;
          document.getElementById('sr-input') && document.getElementById('sr-input').focus();
        })
        .catch(function (err) {
          console.warn('[Sellrise] Could not initialize chat session:', err.message);
        });
    }

    /* ── Lead creation ─────────────────────────────────────────────────── */
    function getGreetingFromScenario(name) {
      /* Try to extract the first approved phrase from the scenario's first stage/task */
      if (scenario && scenario.stages) {
        var stages = scenario.stages;
        /* stages may be an array (frontend format) or object (backend dict format) */
        var firstStage = null;
        if (Array.isArray(stages)) {
          /* Sort by priority desc, find "first_message" or highest priority */
          var sorted = stages.slice().sort(function(a, b) { return (b.priority || 0) - (a.priority || 0); });
          for (var i = 0; i < sorted.length; i++) {
            var ec = sorted[i].entry_condition;
            if (ec && ec.type === 'first_message') { firstStage = sorted[i]; break; }
          }
          if (!firstStage) firstStage = sorted[0];
        } else if (typeof stages === 'object') {
          var keys = Object.keys(stages);
          for (var k = 0; k < keys.length; k++) {
            var s = stages[keys[k]];
            var ec2 = s.entry_condition;
            if (ec2 && ec2.type === 'first_message') { firstStage = s; break; }
          }
          if (!firstStage && keys.length) firstStage = stages[keys[0]];
        }

        if (firstStage) {
          var tasks = firstStage.tasks;
          var firstTask = null;
          if (Array.isArray(tasks)) {
            tasks.slice().sort(function(a, b) { return (b.priority || 0) - (a.priority || 0); });
            firstTask = tasks[0];
          } else if (tasks && typeof tasks === 'object') {
            var tkeys = Object.keys(tasks);
            if (tkeys.length) firstTask = tasks[tkeys[0]];
          }
          if (firstTask && firstTask.approved_phrases && firstTask.approved_phrases.length) {
            var phrase = firstTask.approved_phrases[0];
            /* Replace template vars */
            phrase = phrase.replace(/\{name\}/gi, name.split(' ')[0]);
            phrase = phrase.replace(/\{agent_name\}/gi, brandName);
            phrase = phrase.replace(/\{company\}/gi, brandName);
            return phrase;
          }
        }
      }
      /* Fallback to simple greeting */
      return 'Hi ' + name.split(' ')[0] + '! I am the Plasthic Web assistant. How can I help you today?';
    }

    /* ── Message sending ───────────────────────────────────────────────── */
    function sendMessage(text) {
      if ((!text.trim() && !pendingAttachments.length) || isSending || isUploading || !leadId) return;
      isSending = true;
      var isFirstTurn = !hasShownGreeting;
      var curAttachments = pendingAttachments.slice();
      var normalizedText = text.trim();
      pendingAttachments = [];
      renderPendingAttachments();

      addMessage('user', text, curAttachments);
      document.getElementById('sr-input').value = '';
      autoResize(document.getElementById('sr-input'));
      document.getElementById('sr-send').disabled = true;
      showTyping();

      var payload = {
        workspace_id: workspace,
        lead_id: leadId,
        message: text,
        channel: 'web',
        session_id: sessionId,
      };
      if (curAttachments.length) {
        payload.attachments = curAttachments;
      }

      postJSON(apiBase + '/v1/widget/message', payload)
        .then(function (res) {
          hideTyping();
          if (isFirstTurn) {
            hasShownGreeting = true;
            addMessage('bot', getGreetingFromScenario('there'));
            return;
          }
          addMessage('bot', res.bot_reply || '(no reply)');

          /* ── Check for photo_upload action (PRD 3) ─────────────────── */
          var actions = res.actions || [];
          for (var ai = 0; ai < actions.length; ai++) {
            var action = actions[ai];
            if (action && (action.type === 'photo_upload' || action.tag === '#photo_upload')) {
              /* Try to get patient_id from lead external_identities */
              if (!patientId) {
                fetchPatientId(function() {
                  renderPhotoUploadStep(action.config || action.payload || {}, function(slots) {
                    var count = slots.filter(function(s) { return s.status === 'success'; }).length;
                    if (count > 0) {
                      addMessage('bot', '\u2705 ' + count + ' photo(s) uploaded successfully. Thank you!');
                    }
                    sendMessage('photo_upload_complete');
                  });
                });
              } else {
                renderPhotoUploadStep(action.config || action.payload || {}, function(slots) {
                  var count = slots.filter(function(s) { return s.status === 'success'; }).length;
                  if (count > 0) {
                    addMessage('bot', '\u2705 ' + count + ' photo(s) uploaded successfully. Thank you!');
                  }
                  sendMessage('photo_upload_complete');
                });
              }
              break;
            }
          }
        })
        .catch(function (err) {
          hideTyping();
          showError('Error: ' + (err.message || 'Could not get a response.'));
        })
        .finally(function () {
          isSending = false;
          document.getElementById('sr-send').disabled = false;
          document.getElementById('sr-input').focus();
        });
    }

    /* ── Event bindings ────────────────────────────────────────────────── */
    bubble.addEventListener('click', function () {
      isOpen = !isOpen;
      if (isOpen) {
        panel.classList.add('sr-open');
        bubble.innerHTML = SVG_CLOSE;
        badge.style.display = 'none';
        if (!leadId) {
          autoCreateLead();
        }
        document.getElementById('sr-input') && document.getElementById('sr-input').focus();
      } else {
        panel.classList.remove('sr-open');
        bubble.innerHTML = SVG_CHAT + badge.outerHTML;
      }
    });

    document.getElementById('sr-close-btn').addEventListener('click', function () {
      isOpen = false;
      panel.classList.remove('sr-open');
      bubble.innerHTML = SVG_CHAT;
      bubble.appendChild(badge);
    });

    var inputEl = document.getElementById('sr-input');
    inputEl.addEventListener('input', function () { autoResize(this); });
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(this.value); }
    });

    document.getElementById('sr-send').addEventListener('click', function () {
      sendMessage(inputEl.value);
    });

    previewRow.addEventListener('click', function (event) {
      var clearAllButton = event.target.closest('#sr-preview-clear');
      if (clearAllButton) {
        pendingAttachments = [];
        renderPendingAttachments();
        return;
      }

      var removeButton = event.target.closest('.sr-preview-remove-item');
      if (!removeButton) return;

      var index = Number(removeButton.getAttribute('data-index'));
      if (isNaN(index)) return;
      pendingAttachments = pendingAttachments.filter(function (_, itemIndex) {
        return itemIndex !== index;
      });
      renderPendingAttachments();
    });

    /* ── Attachment handling ───────────────────────────────────────────── */
    var fileInputEl = document.getElementById('sr-file-input');
    var attachBtn = document.getElementById('sr-attach');
    attachBtn.addEventListener('click', function () { fileInputEl.click(); });
    fileInputEl.addEventListener('change', function (e) {
      var selectedFiles = Array.prototype.slice.call(e.target.files || []);
      if (!selectedFiles.length) return;
      if (pendingAttachments.length + selectedFiles.length > 3) {
        alert('You can attach up to 3 photos per message');
        fileInputEl.value = '';
        return;
      }

      var oversizedFile = null;
      for (var fileIndex = 0; fileIndex < selectedFiles.length; fileIndex += 1) {
        if (selectedFiles[fileIndex].size > 10 * 1024 * 1024) {
          oversizedFile = selectedFiles[fileIndex];
          break;
        }
      }
      if (oversizedFile) {
        alert('File too large (max 10MB): ' + oversizedFile.name);
        fileInputEl.value = '';
        return;
      }
      
      var origHtml = attachBtn.innerHTML;
      attachBtn.innerHTML = '...';
      attachBtn.disabled = true;
      isUploading = true;

      var fd = new FormData();
      for (var uploadIndex = 0; uploadIndex < selectedFiles.length; uploadIndex += 1) {
        fd.append('file', selectedFiles[uploadIndex]);
      }
      fd.append('workspace_id', workspace);

      var host = apiBase === '/' ? '' : apiBase;
      fetch(host + '/v1/widget/upload', {
        method: 'POST',
        body: fd
      }).then(function(r) { 
        if (!r.ok) throw new Error('Upload failed');
        return r.json(); 
      })
      .then(function(data) {
          var uploadedFiles = normalizeUploadedFiles(data);
          if (uploadedFiles.length) {
            pendingAttachments = pendingAttachments.concat(
              uploadedFiles.map(function (item) { return item.url; }).filter(Boolean)
            ).slice(0, 3);
            renderPendingAttachments();
          }
      }).catch(function(e) { 
         alert('Upload failed: ' + e.message);
      }).finally(function() {
         attachBtn.innerHTML = origHtml;
         attachBtn.disabled = false;
         isUploading = false;
         fileInputEl.value = '';
      });
    });

    updateInputPlaceholder();
  }

  /* ── Utility: auto-grow textarea ─────────────────────────────────────── */
  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 96) + 'px';
  }

  /* ── Utility: escape HTML ────────────────────────────────────────────── */
  function escHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ── Utility: darken/lighten hex color ───────────────────────────────── */
  function shadeColor(hex, pct) {
    var num = parseInt(hex.replace('#', ''), 16);
    var r = Math.min(255, Math.max(0, (num >> 16) + pct));
    var g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + pct));
    var b = Math.min(255, Math.max(0, (num & 0xff) + pct));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /* ── SVG Icons ───────────────────────────────────────────────────────── */
  var SVG_CHAT = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var SVG_CLOSE = '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  var SVG_BOT = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M12 2v4M8 11V7a4 4 0 0 1 8 0v4"/><circle cx="9" cy="16" r="1" fill="white"/><circle cx="15" cy="16" r="1" fill="white"/></svg>';
  var SVG_SEND = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>';
  var SVG_ATTACH = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>';

  /* ── Public API ──────────────────────────────────────────────────────── */
  w.sellrise = function (cmd, config) {
    if (cmd === 'init') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { injectCSS(); init(config); });
      } else {
        injectCSS();
        init(config);
      }
    }
  };

})(window);
