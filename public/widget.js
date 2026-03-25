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
    '  display: none; align-items: center; gap: 8px;',
    '}',
    '.sr-preview-thumb {',
    '  width: 40px; height: 40px; border-radius: 6px; object-cover; border: 1px solid #d1d5db; background: #fff;',
    '}',
    '.sr-preview-info { flex: 1; min-width: 0; }',
    '.sr-preview-info div { font-size: 11px; font-weight: 600; color: #374151; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }',
    '.sr-preview-info span { font-size: 10px; color: #6b7280; }',
    '#sr-preview-remove {',
    '  background: #e5e7eb; border: none; border-radius: 50%; width: 22px; height: 22px;',
    '  display: flex; align-items: center; justify-content: center; cursor: pointer; color: #4b5563;',
    '}',
    '#sr-preview-remove:hover { background: #d1d5db; color: #111827; }',
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

  function debugWidget(eventName, payload) {
    if (!w.console || typeof w.console.log !== 'function') return;
    w.console.log('[Sellrise Widget Debug]', eventName, payload || {});
  }

  /* ── Main init ───────────────────────────────────────────────────────── */
  function init(config) {
    var apiBase   = config.apiBaseUrl   || 'http://localhost:8000';
    var workspace = config.workspace    || '';
    var sessionId = config.sessionId    || ('sr_' + Date.now());
    var branding  = config.branding     || {};
    var position  = config.position     || 'bottom-right';
    var scenario  = config.scenario     || null;
    var brandName = branding.brand_name || 'Plashic';
    var brandColor= branding.brand_primary_color || '#2563eb';

    /* Apply brand colour to any --sr-color var in the injected CSS */
    var root = document.querySelector('#sr-widget-css');
    if (root) root.textContent = CSS.replace(/#2563eb/g, brandColor).replace(/#1d4ed8/g, shadeColor(brandColor, -15));

    /* Adjust position */
    var side   = (position === 'bottom-left') ? 'left' : 'right';
    var oppSide= (position === 'bottom-left') ? 'right' : 'left';

    /* ── State ─────────────────────────────────────────────────────────── */
    var isOpen    = false;
    var leadId    = null;
    var isSending = false;
    var isUploading = false;
    var pendingAttachment = null;
    var hasShownGreeting = false;

    /* ── DOM ───────────────────────────────────────────────────────────── */
    var container = el('div', { id: 'sr-widget-root' });

    /* Bubble button */
    var bubble = el('button', { id: 'sr-bubble' });
    bubble.style[side] = '20px';
    bubble.style[oppSide] = 'auto';
    bubble.innerHTML = SVG_CHAT;
    var badge = el('span', { id: 'sr-badge' });
    bubble.appendChild(badge);

    /* Panel */
    var panel = el('div', { id: 'sr-panel' });
    panel.style[side] = '20px';
    panel.style[oppSide] = 'auto';

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

    /* Lead capture form (shown before chat) */
    var leadFormEl = el('div', { id: 'sr-lead-form' });
    leadFormEl.innerHTML =
      '<p>To get started, please tell us a little about yourself.</p>' +
      '<input id="sr-name" type="text" placeholder="Your name" autocomplete="name" />' +
      '<input id="sr-email" type="email" placeholder="Email address" autocomplete="email" />' +
      '<input id="sr-phone" type="tel" placeholder="Phone (optional)" autocomplete="tel" />' +
      '<button id="sr-lead-submit">Start Chat</button>' +
      '<p id="sr-lead-err" class="sr-status-msg" style="color:#ef4444;display:none"></p>';

    /* Preview row */
    var previewRow = el('div', { id: 'sr-preview-row' });
    previewRow.innerHTML =
      '<img class="sr-preview-thumb" id="sr-preview-img" src="" alt="Preview" />' +
      '<div class="sr-preview-info"><div>Photo attached</div><span>Ready to send</span></div>' +
      '<button id="sr-preview-remove" title="Remove">&times;</button>';

    /* Input row */
    var inputRow = el('div', { id: 'sr-input-row', style: 'display:none' });
    inputRow.innerHTML =
      '<button id="sr-attach" aria-label="Attach photo" type="button">' + SVG_ATTACH + '</button>' +
      '<input type="file" id="sr-file-input" accept="image/jpeg, image/png, image/webp" style="display:none" />' +
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
    function addMessage(role, text, attachmentUrl) {
      var msg = el('div', { class: 'sr-msg ' + role });
      var parts = [];
      if (attachmentUrl) {
        var host = apiBase === '/' ? '' : apiBase;
        parts.push('<img src="' + host + attachmentUrl + '" alt="Attachment" />');
      }
      if (text) {
        parts.push('<div class="sr-bubble-msg">' + escHtml(text) + '</div>');
      }
      msg.innerHTML = parts.join('') +
        '<span class="sr-ts">' + ts() + '</span>';
      messagesEl.appendChild(msg);
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

    function createLead(name, email, phone) {
      var btn = document.getElementById('sr-lead-submit');
      var errEl = document.getElementById('sr-lead-err');
      btn.disabled = true;
      btn.textContent = 'Starting…';
      errEl.style.display = 'none';

      postJSON(apiBase + '/v1/widget/lead', {
        workspace_id: workspace,
        session_id: sessionId,
        name: name,
        email: email,
        phone: phone || null,
        consent_given: true,
      })
        .then(function (res) {
          leadId = res.lead_id;
          hasShownGreeting = false;
          leadFormEl.style.display = 'none';
          inputRow.style.display = 'flex';
          document.getElementById('sr-input').focus();
        })
        .catch(function (err) {
          btn.disabled = false;
          btn.textContent = 'Start Chat';
          errEl.textContent = err.message || 'Could not start chat. Please try again.';
          errEl.style.display = 'block';
        });
    }

    /* ── Message sending ───────────────────────────────────────────────── */
    function sendMessage(text) {
      if ((!text.trim() && !pendingAttachment) || isSending || isUploading || !leadId) return;
      isSending = true;
      var isFirstTurn = !hasShownGreeting;
      var curAttachment = pendingAttachment;
      var normalizedText = text.trim();
      pendingAttachment = null;
      document.getElementById('sr-preview-row').style.display = 'none';
      document.getElementById('sr-input').placeholder = "Type a message…";

      debugWidget('message:submit', {
        workspace_id: workspace,
        lead_id: leadId,
        session_id: sessionId,
        message: normalizedText,
        attachments: curAttachment ? [curAttachment] : [],
        is_first_turn: isFirstTurn,
      });

      addMessage('user', text, curAttachment);
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
      if (curAttachment) {
        payload.attachments = [curAttachment];
      }

      postJSON(apiBase + '/v1/widget/message', payload)
        .then(function (res) {
          debugWidget('message:response', {
            request_message: normalizedText,
            bot_reply: res.bot_reply,
            current_stage: res.current_stage,
            current_task: res.current_task,
            actions: res.actions || [],
          });
          hideTyping();
          if (isFirstTurn) {
            hasShownGreeting = true;
            addMessage('bot', getGreetingFromScenario(document.getElementById('sr-name').value || 'there'));
            return;
          }
          addMessage('bot', res.bot_reply || '(no reply)');
        })
        .catch(function (err) {
          debugWidget('message:error', {
            request_message: normalizedText,
            error: err && err.message ? err.message : 'Could not get a response.',
          });
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
          document.getElementById('sr-name') && document.getElementById('sr-name').focus();
        } else {
          document.getElementById('sr-input') && document.getElementById('sr-input').focus();
        }
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

    document.getElementById('sr-lead-submit').addEventListener('click', function () {
      var name  = (document.getElementById('sr-name').value  || '').trim();
      var email = (document.getElementById('sr-email').value || '').trim();
      var phone = (document.getElementById('sr-phone').value || '').trim();
      if (!name)  { alert('Please enter your name.'); return; }
      if (!email) { alert('Please enter your email.'); return; }
      createLead(name, email, phone);
    });

    var inputEl = document.getElementById('sr-input');
    inputEl.addEventListener('input', function () { autoResize(this); });
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(this.value); }
    });

    document.getElementById('sr-send').addEventListener('click', function () {
      sendMessage(inputEl.value);
    });

    document.getElementById('sr-preview-remove').addEventListener('click', function () {
      pendingAttachment = null;
      document.getElementById('sr-preview-row').style.display = 'none';
      document.getElementById('sr-input').placeholder = "Type a message…";
    });

    /* ── Attachment handling ───────────────────────────────────────────── */
    var fileInputEl = document.getElementById('sr-file-input');
    var attachBtn = document.getElementById('sr-attach');
    attachBtn.addEventListener('click', function () { fileInputEl.click(); });
    fileInputEl.addEventListener('change', function (e) {
      if (!e.target.files.length) return;
      var file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) { alert('File too large (max 10MB)'); return; }
      
      var origHtml = attachBtn.innerHTML;
      attachBtn.innerHTML = '...';
      attachBtn.disabled = true;
      isUploading = true;

      var fd = new FormData();
      fd.append('file', file);
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
          if(data.url) {
            pendingAttachment = data.url;
            var host = apiBase === '/' ? '' : apiBase;
            document.getElementById('sr-preview-img').src = host + data.url;
            document.getElementById('sr-preview-row').style.display = 'flex';
            document.getElementById('sr-input').placeholder = "Add a note...";
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
