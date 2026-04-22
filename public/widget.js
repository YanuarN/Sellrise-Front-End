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
    '  color: #fff; font-size: 16px; font-weight: 700; border-radius: 999px;',
    '  min-width: 26px; height: 26px; padding: 0 5px;',
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
    '.sr-msg-full { max-width: 100% !important; width: 100%; }',
    '.sr-photo-step { padding: 16px; background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; margin: 4px 0; width: 100%; box-sizing: border-box; }',
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
    /* ── Photo Upload Disclaimer ──────────────────────────────────────── */
    '.sr-photo-disclaimer { padding: 14px 16px; background: #fffbeb; border-radius: 12px; border: 1px solid #fcd34d; margin: 4px 0; width: 100%; box-sizing: border-box; }',
    '.sr-photo-disclaimer .sr-disclaimer-icon { font-size: 20px; margin-bottom: 6px; }',
    '.sr-photo-disclaimer .sr-disclaimer-title { font-size: 13px; font-weight: 700; color: #92400e; margin: 0 0 6px 0; }',
    '.sr-photo-disclaimer .sr-disclaimer-body { font-size: 12px; color: #78350f; line-height: 1.5; margin: 0 0 12px 0; }',
    '.sr-photo-disclaimer .sr-disclaimer-actions { display: flex; gap: 8px; }',
    '.sr-photo-disclaimer .sr-disclaimer-actions button { flex: 1; padding: 9px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; border: none; transition: background .15s; }',
    '.sr-disclaimer-btn-accept { background: #2563eb; color: #fff; }',
    '.sr-disclaimer-btn-accept:hover { background: #1d4ed8; }',
    '.sr-disclaimer-btn-decline { background: #e5e7eb; color: #374151; }',
    '.sr-disclaimer-btn-decline:hover { background: #d1d5db; }',
    /* ── Multi-slot photo grid ────────────────────────────────────────── */
    '.sr-slot-counter { font-size: 11px; color: #6b7280; text-align: center; margin-bottom: 8px; }',
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
    var initialUnreadStorageKey = [
      'sr-initial-unread',
      workspace || 'default',
      (w.location && w.location.hostname) || 'unknown'
    ].join(':');
    var patientServiceConfig = null;    // { enabled, base_url, auth_token }
    var patientId = null;               // Phlastic patient_id from external_identities
    // Guard: prevent photo upload UI from re-triggering once the user has
    // interacted with it (uploaded or skipped). Mirrors WidgetSimulator behaviour.
    var photoUploadTriggered = false;

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
    var badge = el('span', { id: 'sr-badge' });
    var bubbleClosedMarkup = bubbleIcon
      ? '<span style="font-size:22px;line-height:1">' + escHtml(bubbleIcon) + '</span>'
      : SVG_CHAT;

    function rememberInitialUnreadDisplayed() {
      try {
        w.sessionStorage.setItem(initialUnreadStorageKey, '1');
      } catch (storageError) {
        console.warn('[Sellrise] Could not persist initial unread badge state:', storageError);
      }
    }

    function shouldShowInitialUnreadBadge() {
      try {
        return w.sessionStorage.getItem(initialUnreadStorageKey) !== '1';
      } catch (storageError) {
        return true;
      }
    }

    function setUnreadBadge(count) {
      if (count > 0) {
        badge.textContent = String(count);
        badge.style.display = 'flex';
        return;
      }

      badge.textContent = '';
      badge.style.display = 'none';
    }

    function renderBubbleIcon(showCloseIcon) {
      bubble.innerHTML = showCloseIcon ? SVG_CLOSE : bubbleClosedMarkup;
      bubble.appendChild(badge);
    }

    renderBubbleIcon(false);
    if (shouldShowInitialUnreadBadge()) {
      setUnreadBadge(1);
      rememberInitialUnreadDisplayed();
    }

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
      /* ── Block the input row until this step fully resolves ─────────── */
      function blockInput() {
        var inp = document.getElementById('sr-input');
        var send = document.getElementById('sr-send');
        var attach = document.getElementById('sr-attach');
        if (inp) { inp.disabled = true; inp.placeholder = 'Please respond to the photo request above…'; }
        if (send) send.disabled = true;
        if (attach) attach.disabled = true;
      }
      function unblockInput() {
        var inp = document.getElementById('sr-input');
        var send = document.getElementById('sr-send');
        var attach = document.getElementById('sr-attach');
        if (inp) { inp.disabled = false; inp.placeholder = 'Type a message…'; }
        if (send) send.disabled = false;
        if (attach) attach.disabled = false;
      }
      /* Wrap onComplete so input is always unblocked when the step ends */
      var originalOnComplete = onComplete;
      onComplete = function(urls) { unblockInput(); originalOnComplete(urls); };

      blockInput();

      /* ── Step 1: show disclaimer first ──────────────────────────────── */
      var disclaimerWrapper = el('div', { class: 'sr-msg bot sr-msg-full' });
      var disclaimerEl = el('div', { class: 'sr-photo-disclaimer' });
      disclaimerEl.innerHTML =
        '<div class="sr-disclaimer-icon">📷</div>' +
        '<p class="sr-disclaimer-title">Photo Upload Permission</p>' +
        '<p class="sr-disclaimer-body">' +
          'You will be asked to upload up to <strong>3 photos</strong> to assist with your consultation. ' +
          'Your photos will be handled securely and used solely for medical analysis by our team. ' +
          'We will not share your photos with any third party without your consent.' +
        '</p>' +
        '<div class="sr-disclaimer-actions">' +
          '<button class="sr-disclaimer-btn-accept" id="sr-disclaimer-accept">I Agree &amp; Continue</button>' +
          '<button class="sr-disclaimer-btn-decline" id="sr-disclaimer-decline">Maybe Later</button>' +
        '</div>';

      disclaimerWrapper.appendChild(disclaimerEl);
      messagesEl.appendChild(disclaimerWrapper);
      messagesEl.scrollTop = messagesEl.scrollHeight;

      var declineBtn = disclaimerEl.querySelector('#sr-disclaimer-decline');
      var acceptBtn = disclaimerEl.querySelector('#sr-disclaimer-accept');

      function lockDisclaimerButtons() {
        [acceptBtn, declineBtn].forEach(function(btn) {
          if (!btn) return;
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.style.cursor = 'not-allowed';
          btn.style.pointerEvents = 'none';
        });
      }

      if (declineBtn) {
        declineBtn.addEventListener('click', function() {
          lockDisclaimerButtons();
          onComplete([]);
        });
      }

      if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
          lockDisclaimerButtons();
          renderPhotoSlots();
        });
      }

      /* ── Step 2: show multi-slot upload UI after disclaimer accepted ── */
      function renderPhotoSlots() {
        var MAX_SLOTS = 3;
        var slotFiles  = [null, null, null]; // File objects per slot
        var slotUrls   = [null, null, null]; // Uploaded URLs per slot
        var slotStates = ['empty', 'empty', 'empty']; // empty | uploading | done | error

        var wrapper = el('div', { class: 'sr-msg bot sr-msg-full' });
        var stepEl  = el('div', { class: 'sr-photo-step' });

        function countUploaded() {
          return slotUrls.filter(function(u) { return !!u; }).length;
        }

        function renderStep() {
          var slotsHtml = '';
          for (var i = 0; i < MAX_SLOTS; i++) {
            var state = slotStates[i];
            var inner = '';
            if (state === 'empty') {
              inner = '<span class="sr-slot-icon">+</span><span class="sr-slot-label">Photo ' + (i + 1) + '</span>';
            } else if (state === 'uploading') {
              inner = '<span class="sr-slot-icon">⏳</span><span class="sr-slot-label">Uploading…</span><div class="sr-slot-progress" style="width:60%"></div>';
            } else if (state === 'done') {
              inner = '<img src="' + escHtml(resolveAttachmentUrl(slotUrls[i])) + '" alt="Photo ' + (i + 1) + '" />' +
                      '<button class="sr-slot-remove" data-slot="' + i + '" title="Remove">&times;</button>' +
                      '<span class="sr-slot-status">✅</span>';
            } else if (state === 'error') {
              inner = '<span class="sr-slot-icon" style="color:#ef4444">⚠️</span>' +
                      '<span class="sr-slot-label" style="color:#ef4444">Failed</span>' +
                      '<button class="sr-photo-retry-btn" data-slot="' + i + '">Retry</button>';
            }
            var extraClass = (state === 'done' || state === 'uploading') ? ' has-photo' : '';
            slotsHtml += '<div class="sr-photo-slot' + extraClass + '" data-slot="' + i + '">' + inner + '</div>';
          }

          var uploaded = countUploaded();
          var canSubmit = uploaded > 0 && slotStates.indexOf('uploading') === -1;

          stepEl.innerHTML =
            '<p class="sr-photo-prompt">Select up to 3 photos (at least 1 required)</p>' +
            '<p class="sr-slot-counter">Uploaded: ' + uploaded + ' / ' + MAX_SLOTS + '</p>' +
            '<div class="sr-photo-grid">' + slotsHtml + '</div>' +
            '<div class="sr-photo-actions">' +
              '<button class="sr-photo-btn-upload" id="sr-photo-submit"' + (canSubmit ? '' : ' disabled') + '>Send Photos (' + uploaded + ')</button>' +
              '<button class="sr-photo-btn-skip" id="sr-photo-skip">Maybe Later</button>' +
            '</div>';

          bindSlotEvents();
        }

        function bindSlotEvents() {
          /* click empty slot → pick file */
          var slots = stepEl.querySelectorAll('.sr-photo-slot');
          for (var si = 0; si < slots.length; si++) {
            (function(slotEl) {
              var idx = Number(slotEl.getAttribute('data-slot'));
              if (slotStates[idx] === 'empty') {
                slotEl.addEventListener('click', function() { openPicker(idx, false); });
              }
            })(slots[si]);
          }

          /* retry button */
          var retryBtns = stepEl.querySelectorAll('.sr-photo-retry-btn');
          for (var ri = 0; ri < retryBtns.length; ri++) {
            (function(btn) {
              var idx = Number(btn.getAttribute('data-slot'));
              btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (slotFiles[idx]) {
                  doUploadSlot(idx, slotFiles[idx]);
                } else {
                  openPicker(idx, false);
                }
              });
            })(retryBtns[ri]);
          }

          /* remove button */
          var removeBtns = stepEl.querySelectorAll('.sr-slot-remove');
          for (var rmi = 0; rmi < removeBtns.length; rmi++) {
            (function(btn) {
              var idx = Number(btn.getAttribute('data-slot'));
              btn.addEventListener('click', function(e) {
                e.stopPropagation();
                slotFiles[idx]  = null;
                slotUrls[idx]   = null;
                slotStates[idx] = 'empty';
                renderStep();
              });
            })(removeBtns[rmi]);
          }

          /* submit */
          var submitBtn = stepEl.querySelector('#sr-photo-submit');
          if (submitBtn) {
            submitBtn.addEventListener('click', function() {
              lockSlotUI();
              var urls = slotUrls.filter(function(u) { return !!u; });
              onComplete(urls);
            });
          }

          /* skip */
          var skipBtn = stepEl.querySelector('#sr-photo-skip');
          if (skipBtn) {
            skipBtn.addEventListener('click', function() {
              lockSlotUI();
              onComplete([]);
            });
          }
        }

        /* Lock the entire slot UI so no button can be re-clicked */
        function lockSlotUI() {
          var allBtns = stepEl.querySelectorAll('button');
          for (var bi = 0; bi < allBtns.length; bi++) {
            allBtns[bi].disabled = true;
            allBtns[bi].style.opacity = '0.5';
            allBtns[bi].style.cursor = 'not-allowed';
            allBtns[bi].style.pointerEvents = 'none';
          }
          var allSlots = stepEl.querySelectorAll('.sr-photo-slot');
          for (var sli = 0; sli < allSlots.length; sli++) {
            allSlots[sli].style.pointerEvents = 'none';
            allSlots[sli].style.cursor = 'default';
          }
        }

        function openPicker(slotIdx, useCamera) {
          var inp = document.createElement('input');
          inp.type = 'file';
          inp.accept = 'image/jpeg,image/png,image/heic,image/*';
          if (useCamera) inp.setAttribute('capture', 'environment');
          inp.style.display = 'none';
          document.body.appendChild(inp);
          inp.addEventListener('change', function(e) {
            var file = e.target.files && e.target.files[0];
            if (file) {
              slotFiles[slotIdx] = file;
              doUploadSlot(slotIdx, file);
            }
            if (inp.parentNode) inp.parentNode.removeChild(inp);
          });
          inp.click();
        }

        function doUploadSlot(slotIdx, file) {
          slotStates[slotIdx] = 'uploading';
          slotUrls[slotIdx]   = null;
          renderStep();

          var host = apiBase === '/' ? '' : apiBase;
          var fd = new FormData();
          fd.append('file', file);
          fd.append('workspace_id', workspace);
          fetch(host + '/v1/widget/upload', { method: 'POST', body: fd })
            .then(function(r) { return r.ok ? r.json() : Promise.reject(new Error('Upload failed')); })
            .then(function(res) {
              var files = normalizeUploadedFiles(res);
              var url = files.length ? (files[0].url || files[0]) : null;
              slotUrls[slotIdx]   = url;
              slotStates[slotIdx] = url ? 'done' : 'error';
              renderStep();
            })
            .catch(function() {
              slotStates[slotIdx] = 'error';
              renderStep();
            });
        }

        renderStep();
        wrapper.appendChild(stepEl);
        messagesEl.appendChild(wrapper);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
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

          /* ── Check for photo_upload stage (stage_type detection) ───── */
          // Primary: check current_stage → stage_type in scenario config (deterministic)
          // Fallback: check res.actions for backwards compatibility
          var shouldShowPhotoUpload = false;
          var photoStepConfig = {};

          if (!photoUploadTriggered) {
            var currentStageId = res.current_stage;
            if (currentStageId && scenario && scenario.stages) {
              var stageList = Array.isArray(scenario.stages)
                ? scenario.stages
                : Object.values(scenario.stages);
              var matchedStage = null;
              for (var si = 0; si < stageList.length; si++) {
                if (stageList[si] && stageList[si].stage_id === currentStageId) {
                  matchedStage = stageList[si];
                  break;
                }
              }
              if (matchedStage && matchedStage.stage_type === 'photo_upload') {
                // Only trigger when bot's reply for THIS turn actually asks for photos,
                // meaning the LLM was genuinely prompted by the photo stage.
                var botLower = (res.bot_reply || '').toLowerCase();
                var mentionsPhoto = ['photo', 'picture', 'image', 'upload', 'foto'].some(function(kw) {
                  return botLower.indexOf(kw) !== -1;
                });
                if (mentionsPhoto) {
                  shouldShowPhotoUpload = true;
                  // Get upload config from actions_catalog if available
                  var catalog = scenario.actions_catalog || {};
                  var catalogEntry = catalog['#photo_upload'];
                  photoStepConfig = (catalogEntry && catalogEntry.payload_schema && catalogEntry.payload_schema.config)
                    ? catalogEntry.payload_schema.config
                    : {};
                }
              }
            }

            // Fallback 2: LLM actions (legacy path, kept for backward compatibility)
            if (!shouldShowPhotoUpload) {
              var actions = res.actions || [];
              for (var ai = 0; ai < actions.length; ai++) {
                var action = actions[ai];
                if (action && (action.type === 'photo_upload' || action.tag === '#photo_upload')) {
                  shouldShowPhotoUpload = true;
                  photoStepConfig = action.config || (action.payload && action.payload.config) || {};
                  break;
                }
              }
            }

            // Fallback 3: pure keyword detection on bot reply — fires when neither
            // stage nor action data is present but the bot is clearly asking for photos.
            if (!shouldShowPhotoUpload) {
              var botReplyLower = (res.bot_reply || '').toLowerCase();
              var photoKeywords = ['photo', 'picture', 'image', 'upload', 'foto'];
              var replyMentionsPhoto = photoKeywords.some(function(kw) {
                return botReplyLower.indexOf(kw) !== -1;
              });
              if (replyMentionsPhoto) {
                shouldShowPhotoUpload = true;
                photoStepConfig = {};
              }
            }
          }

          if (shouldShowPhotoUpload) {
            photoUploadTriggered = true;
            // Small delay so bot message is readable before the upload UI appears
            setTimeout(function() {
              renderPhotoUploadStep(photoStepConfig, function(urls) {
                if (urls.length > 0) {
                  sendMessage("I've uploaded my photos");
                } else {
                  sendMessage('maybe later');
                }
              });
            }, 1200);
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
        renderBubbleIcon(true);
        setUnreadBadge(0);
        if (!leadId) {
          autoCreateLead();
        }
        document.getElementById('sr-input') && document.getElementById('sr-input').focus();
      } else {
        panel.classList.remove('sr-open');
        renderBubbleIcon(false);
      }
    });

    document.getElementById('sr-close-btn').addEventListener('click', function () {
      isOpen = false;
      panel.classList.remove('sr-open');
      renderBubbleIcon(false);
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
