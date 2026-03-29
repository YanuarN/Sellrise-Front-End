import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowRight, ArrowLeft, HelpCircle } from 'lucide-react';

/**
 * SpotlightOnboarding – step-by-step guided tour overlay.
 *
 * Props:
 *  - steps       {Array<{ target: string, title: string, description: string }>}
 *                Each step uses `target` to find `[data-onboarding="<target>"]` in the DOM.
 *  - storageKey  {string}  localStorage key to remember completion (default: 'onboarding_done').
 *  - onComplete  {Function} Called when the user finishes or skips the tour.
 *  - showHint    {boolean}  If true, renders a floating "?" button to replay the tour.
 *
 * Ref API:
 *  - ref.current.restart()  – programmatically replay the tour.
 */
const SpotlightOnboarding = forwardRef(function SpotlightOnboarding(
  { steps, storageKey = 'onboarding_done', onComplete, showHint = false },
  ref,
) {
  const [active, setActive] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);

  /* ── Imperative restart ───────────────────────────────── */
  const restart = useCallback(() => {
    setStepIdx(0);
    setActive(true);
    requestAnimationFrame(() => setFadeIn(true));
  }, []);

  useImperativeHandle(ref, () => ({ restart }), [restart]);

  /* ── Boot ─────────────────────────────────────────────── */
  useEffect(() => {
    if (localStorage.getItem(storageKey)) return;
    // wait for the page to settle before showing the overlay
    const t = setTimeout(() => {
      setActive(true);
      requestAnimationFrame(() => setFadeIn(true));
    }, 800);
    return () => clearTimeout(t);
  }, [storageKey]);

  /* ── Measure current target ───────────────────────────── */
  const measure = useCallback(() => {
    if (!active || !steps[stepIdx]) return;
    const el = document.querySelector(`[data-onboarding="${steps[stepIdx].target}"]`);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [active, stepIdx, steps]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    const iv = setInterval(measure, 250);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      clearInterval(iv);
    };
  }, [measure]);

  /* ── Auto-skip steps whose target is missing ──────────── */
  useEffect(() => {
    if (!active) return;
    const el = document.querySelector(`[data-onboarding="${steps[stepIdx]?.target}"]`);
    if (!el) {
      const next = findNextVisible(stepIdx + 1, 1);
      if (next === -1) finish();
      else setStepIdx(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, stepIdx]);

  /* ── Navigation helpers ───────────────────────────────── */
  const findNextVisible = (from, dir = 1) => {
    let i = from;
    while (i >= 0 && i < steps.length) {
      if (document.querySelector(`[data-onboarding="${steps[i].target}"]`)) return i;
      i += dir;
    }
    return -1;
  };

  const finish = useCallback(() => {
    localStorage.setItem(storageKey, '1');
    setFadeIn(false);
    setTimeout(() => { setActive(false); onComplete?.(); }, 250);
  }, [storageKey, onComplete]);

  const next = () => {
    const n = findNextVisible(stepIdx + 1, 1);
    if (n === -1) finish();
    else setStepIdx(n);
  };

  const prev = () => {
    const p = findNextVisible(stepIdx - 1, -1);
    if (p >= 0) setStepIdx(p);
  };

  if (!active && !showHint) return null;
  if (!active && showHint) {
    return createPortal(
      <button
        onClick={restart}
        className="fixed bottom-6 right-6 z-[9999] group flex items-center gap-2 bg-white text-blue-600 border border-blue-200 shadow-lg shadow-blue-500/10 rounded-full pl-3 pr-4 py-2.5 hover:bg-blue-50 hover:border-blue-300 hover:shadow-xl transition-all duration-200"
        aria-label="Show guided tour"
      >
        <HelpCircle className="w-4.5 h-4.5" />
        <span className="text-xs font-semibold">Tour</span>
      </button>,
      document.body,
    );
  }

  /* ── Computed layout values ───────────────────────────── */
  const pad = 10;
  const spot = rect
    ? { x: rect.left - pad, y: rect.top - pad, w: rect.width + pad * 2, h: rect.height + pad * 2 }
    : null;

  // visible-only step counter
  const activeSteps = steps.filter(
    (s) => !!document.querySelector(`[data-onboarding="${s.target}"]`),
  );
  const activeIdx = activeSteps.findIndex((s) => s.target === steps[stepIdx]?.target);
  const hasPrev = findNextVisible(stepIdx - 1, -1) >= 0;
  const hasNext = findNextVisible(stepIdx + 1, 1) !== -1;

  /* ── Tooltip positioning ──────────────────────────────── */
  const getTooltipStyle = () => {
    if (!spot) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    const tw = 340;
    const gap = 16;
    const centerX = Math.max(16, Math.min(spot.x + spot.w / 2 - tw / 2, window.innerWidth - tw - 16));

    // prefer below
    if (spot.y + spot.h + gap + 220 < window.innerHeight) {
      return { top: spot.y + spot.h + gap, left: centerX };
    }
    // above
    if (spot.y - gap - 220 > 0) {
      return { top: spot.y - gap - 220, left: centerX };
    }
    // right
    if (spot.x + spot.w + gap + tw < window.innerWidth) {
      return { top: Math.max(16, spot.y), left: spot.x + spot.w + gap };
    }
    // left
    return { top: Math.max(16, spot.y), left: Math.max(16, spot.x - gap - tw) };
  };

  const overlay = createPortal(
    <div
      className="fixed inset-0"
      style={{
        zIndex: 99990,
        opacity: fadeIn ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Click-blocker – stops interaction with page below */}
      <div className="absolute inset-0" style={{ zIndex: 0 }} />

      {/* Dark overlay with spotlight hole (box-shadow trick) */}
      {spot ? (
        <div
          className="absolute rounded-xl"
          style={{
            left: spot.x,
            top: spot.y,
            width: spot.w,
            height: spot.h,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
            transition: 'left 0.35s ease, top 0.35s ease, width 0.35s ease, height 0.35s ease',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/65" style={{ zIndex: 1 }} />
      )}

      {/* Glow ring around target */}
      {spot && (
        <div
          className="absolute rounded-xl"
          style={{
            left: spot.x,
            top: spot.y,
            width: spot.w,
            height: spot.h,
            boxShadow: '0 0 0 3px rgba(99,102,241,0.6), 0 0 24px rgba(99,102,241,0.18)',
            transition: 'left 0.35s ease, top 0.35s ease, width 0.35s ease, height 0.35s ease',
            pointerEvents: 'none',
            zIndex: 2,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute w-[340px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
        style={{ ...getTooltipStyle(), zIndex: 3, transition: 'all 0.35s ease' }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            style={{
              width: `${((activeIdx + 1) / activeSteps.length) * 100}%`,
              transition: 'width 0.35s ease',
            }}
          />
        </div>

        <div className="p-5">
          {/* Step counter + close */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              Step {activeIdx + 1} of {activeSteps.length}
            </span>
            <button
              onClick={finish}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-[15px] font-bold text-slate-800 mb-1.5">
            {steps[stepIdx]?.title}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            {steps[stepIdx]?.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={finish}
              className="text-xs text-slate-400 hover:text-slate-600 hover:underline transition-colors"
            >
              Skip tour
            </button>
            <div className="flex gap-2">
              {hasPrev && (
                <button
                  onClick={prev}
                  className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back
                </button>
              )}
              <button
                onClick={next}
                className="flex items-center gap-1 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition-colors"
              >
                {hasNext ? (
                  <>
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  "Got it!"
                )}
              </button>
            </div>
          </div>

          {/* Step dots */}
          <div className="flex justify-center gap-1.5 mt-4">
            {activeSteps.map((s, i) => (
              <div
                key={s.target}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                  i === activeIdx
                    ? 'bg-blue-600'
                    : i < activeIdx
                      ? 'bg-blue-300'
                      : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );

  return overlay;
});

export default SpotlightOnboarding;
