import { useEffect } from 'react';

export default function LandingWidgetEmbed() {
  useEffect(() => {
    const w = window;
    const d = document;

    const apiBaseUrl = 'https://api.sellrise.ai';
    const widgetMode = 'bubble';
    const fallbackMessage = 'Please leave your details and our team will contact you shortly.';
    const sessionEndpoint = apiBaseUrl + '/v1/widget/session';
    const fallbackEndpoint = apiBaseUrl + '/v1/widget/fallback-lead';
    const timeoutMs = 12000;

    let initialized = false;
    let fallbackRendered = false;
    let timeoutId = null;
    let fallbackMount = null;

    function createCorrelationId() {
      return 'cid_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    }

    function renderFallback(reason, error) {
      if (fallbackRendered) return;
      fallbackRendered = true;

      const correlationId = createCorrelationId();
      let mount = widgetMode === 'inline' ? d.getElementById('sellrise-widget') : null;

      if (!mount) {
        mount = d.createElement('div');
        mount.id = 'sellrise-fallback-mount';
        mount.style.position = 'fixed';
        mount.style.right = '16px';
        mount.style.bottom = '16px';
        mount.style.width = '320px';
        mount.style.maxWidth = 'calc(100vw - 32px)';
        mount.style.zIndex = '2147483646';
        d.body.appendChild(mount);
      }

      fallbackMount = mount;
      mount.innerHTML = '';

      const card = d.createElement('div');
      card.style.fontFamily = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
      card.style.background = '#ffffff';
      card.style.border = '1px solid #e5e7eb';
      card.style.borderRadius = '12px';
      card.style.boxShadow = '0 10px 30px rgba(0,0,0,.12)';
      card.style.padding = '16px';
      card.innerHTML =
        '<h4 style="margin:0 0 8px;font-size:16px;font-weight:600;color:#111827;">We are here to help</h4>' +
        '<p style="margin:0 0 12px;font-size:14px;line-height:1.4;color:#374151;">' +
        fallbackMessage +
        '</p>' +
        '<form id="sellrise-fallback-form" style="display:grid;gap:8px">' +
        '<input name="name" required placeholder="Your name" style="padding:10px;border:1px solid #d1d5db;border-radius:8px;font-size:14px" />' +
        '<input type="email" name="email" required placeholder="Email" style="padding:10px;border:1px solid #d1d5db;border-radius:8px;font-size:14px" />' +
        '<input name="phone" placeholder="Phone (optional)" style="padding:10px;border:1px solid #d1d5db;border-radius:8px;font-size:14px" />' +
        '<button type="submit" style="padding:10px 12px;background:#111827;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer">Submit</button>' +
        '</form>' +
        '<p id="sellrise-fallback-status" style="margin:8px 0 0;font-size:12px;color:#6b7280"></p>';

      mount.appendChild(card);

      const form = card.querySelector('#sellrise-fallback-form');
      const status = card.querySelector('#sellrise-fallback-status');

      if (!form || !status) return;

      form.addEventListener('submit', function (evt) {
        evt.preventDefault();
        const formData = new FormData(form);
        const payload = {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone') || null,
          reason: reason,
          correlation_id: correlationId,
          page_url: w.location.href,
        };

        status.textContent = 'Submitting...';

        fetch(fallbackEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            if (!res.ok) throw new Error('Fallback submission failed');
            status.textContent = 'Thanks. We received your details.';
            form.reset();
          })
          .catch(function () {
            status.textContent = 'Could not submit right now. Please try again.';
          });
      });

      console.error('[Sellrise] Fallback triggered', {
        reason: reason,
        correlation_id: correlationId,
        error: error ? String(error) : null,
      });
    }

    const existingWidgetScript = d.querySelector('script[data-sellrise-widget="true"]');
    if (existingWidgetScript) {
      return function cleanup() {
        if (timeoutId) w.clearTimeout(timeoutId);
      };
    }

    const js = d.createElement('script');
    js.src = 'https://sellrise.ai/widget.js';
    js.async = true;
    js.setAttribute('data-sellrise-widget', 'true');

    js.onload = function () {
      try {
        if (typeof w.sellrise !== 'function') {
          renderFallback('session_failure');
          return;
        }

        fetch(sessionEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: w.location.hostname,
            page_url: w.location.href,
            referrer: d.referrer || null,
            utm_source: new URLSearchParams(w.location.search).get('utm_source'),
            utm_medium: new URLSearchParams(w.location.search).get('utm_medium'),
            utm_campaign: new URLSearchParams(w.location.search).get('utm_campaign'),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        })
          .then(function (res) {
            if (!res.ok) throw new Error('Session handshake failed');
            return res.json();
          })
          .then(function (session) {
            w.sellrise('init', {
              workspace: '3b7c29d7-547f-438b-878e-556d0e4957b5',
              displayMode: 'bubble',
              position: 'bottom-right',
              apiBaseUrl: apiBaseUrl || null,
              sessionId: session.session_id,
              scenario: session.scenario_json || session.scenario || null,
              branding: session.branding || null,
            });

            initialized = true;
          })
          .catch(function (err) {
            renderFallback('session_failure', err);
          });
      } catch (err) {
        renderFallback('session_failure', err);
      }
    };

    js.onerror = function () {
      renderFallback('session_failure');
    };

    d.head.appendChild(js);

    timeoutId = w.setTimeout(function () {
      if (!initialized) {
        renderFallback('timeout');
      }
    }, timeoutMs);

    return function cleanup() {
      if (timeoutId) w.clearTimeout(timeoutId);
      if (fallbackMount && fallbackMount.id === 'sellrise-fallback-mount' && fallbackMount.parentNode) {
        fallbackMount.parentNode.removeChild(fallbackMount);
      }
    };
  }, []);

  return null;
}