import { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, AlertTriangle, Send, Bot, User, Loader2, Paperclip, Camera, ImageIcon } from 'lucide-react';
import { Button } from '../Button';
import api, { API_BASE_URL } from '../../services/api';
import AuthImage from '../AuthImage';
import { domainService, scenarioService, workspaceService } from '../../services';

const MAX_ATTACHMENTS = 3;

function pickDisplayName(...candidates) {
  return candidates.find((value) => typeof value === 'string' && value.trim())?.trim() || 'Plasthic';
}

function applyScenarioVariables(text, visitorName, brandName) {
  if (typeof text !== 'string') return '';
  const firstName = (visitorName || 'there').trim().split(/\s+/)[0] || 'there';
  const resolvedBrandName = brandName || 'Plasthic';

  return text
    .replace(/\{name\}/gi, firstName)
    .replace(/\{first_name\}/gi, firstName)
    .replace(/\{agent_name\}/gi, resolvedBrandName)
    .replace(/\{company\}/gi, resolvedBrandName);
}

function sortByPriorityDesc(items) {
  return (Array.isArray(items) ? items : []).slice().sort((a, b) => (b?.priority || 0) - (a?.priority || 0));
}

function normalizeUploadedFiles(response) {
  if (Array.isArray(response?.files)) {
    return response.files;
  }

  if (response?.url) {
    return [response];
  }

  return [];
}

function resolveAttachmentUrl(url) {
  return url?.startsWith('/') ? `${API_BASE_URL}${url}` : url || '';
}



function getInitialMessageFromScenario(scenarioConfig, visitorName, brandName) {
  if (!scenarioConfig || typeof scenarioConfig !== 'object') return null;

  // Legacy (step-based) scenarios
  if (scenarioConfig.entry_step_id && scenarioConfig.steps) {
    const entryStep = scenarioConfig.steps?.[scenarioConfig.entry_step_id];
    const stepText =
      entryStep?.content ||
      entryStep?.message ||
      entryStep?.text ||
      entryStep?.question ||
      entryStep?.prompt;

    const resolved = applyScenarioVariables(stepText, visitorName, brandName);
    return resolved.trim() ? resolved : null;
  }

  // Stage-based scenarios
  if (scenarioConfig.stages) {
    const stages = Array.isArray(scenarioConfig.stages)
      ? sortByPriorityDesc(scenarioConfig.stages)
      : sortByPriorityDesc(Object.values(scenarioConfig.stages || {}));

    const firstStage = stages.find((stage) => stage?.entry_condition?.type === 'first_message') || stages[0];
    if (!firstStage) return null;

    const tasks = Array.isArray(firstStage.tasks)
      ? sortByPriorityDesc(firstStage.tasks)
      : sortByPriorityDesc(Object.values(firstStage.tasks || {}));

    for (const task of tasks) {
      const phrase = task?.approved_phrases?.[0] || task?.fallback_phrases?.[0];
      const resolved = applyScenarioVariables(phrase, visitorName, brandName);
      if (resolved.trim()) return resolved;
    }

    return null;
  }

  return null;
}

/**
 * WidgetSimulator
 *
 * An in-app chat overlay that lets admins test the chatbot widget before
 * embedding it.  Every user message is forwarded to the live conversation
 * engine via:
 *   POST /v1/conversations  – creates the session on open
 *   POST /v1/steps          – processes each user turn and returns a reply
 *
 * Props:
 *   workspaceId    {string}   Workspace public key used to start the conversation
 *   workspaceName  {string}   Display name shown in the simulator header
 *   fallbackMessage {string}  Message shown when the "Simulate Timeout" button is pressed
 *   onClose        {Function} Called when the user dismisses the modal
 */
function WidgetSimulator({ onClose, workspaceId, workspaceName = 'Workspace', fallbackMessage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [leadId, setLeadId] = useState(null);
  const [sessionId] = useState(() => `sim-${Date.now()}`);
  const [resolvedBrandName, setResolvedBrandName] = useState(workspaceName);
  const [publishedScenarioConfig, setPublishedScenarioConfig] = useState(null);
  const [isContextLoading, setIsContextLoading] = useState(true);
  const [isInitialising, setIsInitialising] = useState(true);
  const [initError, setInitError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [showPhotoUploadModal, setShowPhotoUploadModal] = useState(false);
  const [isModalUploading, setIsModalUploading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const modalUploadRef = useRef(null);
  const modalCameraRef = useRef(null);
  // Guard: prevent the photo popup from re-showing after user already interacted
  // with it (uploaded or skipped). Reset only on full conversation reset.
  const photoModalTriggeredRef = useRef(false);

  // Scroll to the latest message whenever messages update.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  useEffect(() => {
    let cancelled = false;

    async function loadWidgetContext() {
      setIsContextLoading(true);
      try {
        const [workspace, domains, scenarios] = await Promise.all([
          workspaceId ? workspaceService.getWorkspace(workspaceId) : Promise.resolve(null),
          domainService.getDomains().catch(() => []),
          scenarioService.getScenarios().catch(() => []),
        ]);

        if (cancelled) return;

        const activeDomain = (Array.isArray(domains) ? domains : []).find((domain) => domain.is_active) || domains?.[0];
        const publishedScenario = (Array.isArray(scenarios) ? scenarios : []).find((scenario) => scenario.is_published);
        setResolvedBrandName(
          pickDisplayName(
            activeDomain?.brand_name,
            publishedScenario?.name,
            workspace?.name,
            workspaceName,
            'Plasthic',
          ),
        );

        if (publishedScenario?.id) {
          const scenarioDetail = await scenarioService.getScenario(publishedScenario.id);
          if (!cancelled) {
            setPublishedScenarioConfig(scenarioDetail?.config || null);
            setResolvedBrandName(
              pickDisplayName(
                activeDomain?.brand_name,
                scenarioDetail?.name,
                publishedScenario?.name,
                workspace?.name,
                workspaceName,
                'Plasthic',
              ),
            );
          }
        }
      } catch {
        if (!cancelled) {
          setResolvedBrandName(pickDisplayName(workspaceName, 'Plasthic'));
        }
      } finally {
        if (!cancelled) setIsContextLoading(false);
      }
    }

    loadWidgetContext();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, workspaceName]);

  const initialGreeting = getInitialMessageFromScenario(
    publishedScenarioConfig,
    'Simulator User',
    resolvedBrandName,
  );

  // Start the conversation session as soon as the simulator opens.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsInitialising(true);
      setInitError(null);

      if (isContextLoading) return;
      if (!publishedScenarioConfig) {
        setInitError('No published scenario found for this workspace. Publish a scenario to simulate the chatbot.');
        setIsInitialising(false);
        return;
      }

      try {
        // Create a simulator lead via the public widget API
        const res = await api.widget.createLead({
          workspace_id: workspaceId,
          name: 'Simulator User',
          email: `simulator-${Date.now()}@test.local`,
          is_simulator: true,
          consent_given: true,
        });
        if (cancelled) return;

        setLeadId(res.lead_id);
        setMessages([]);
      } catch (err) {
        if (!cancelled) {
          setInitError(err.message || 'Failed to start conversation. Check your connection and try again.');
        }
      } finally {
        if (!cancelled) {
          setIsInitialising(false);
          setTimeout(() => inputRef.current?.focus(), 0);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, isContextLoading, publishedScenarioConfig, initialGreeting]);

  const pushBotMessage = (content) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), role: 'bot', content },
    ]);
  };

  /**
   * Core send helper — sends one turn to the widget API and pushes the bot reply.
   * Also detects #photo_upload in actions to trigger the upload modal.
   */
  const sendWidgetMessage = async (textContent, attachmentUrls = []) => {
    if (isSending || !leadId) return;

    const isFirstTurn = !messages.some((m) => m.role === 'user');

    setIsSending(true);
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: 'user', content: textContent, attachmentUrls },
    ]);

    try {
      const payload = {
        workspace_id: workspaceId,
        lead_id: leadId,
        message: textContent,
        channel: 'web',
        session_id: sessionId,
      };
      if (attachmentUrls.length) {
        payload.attachments = attachmentUrls;
      }
      const res = await api.widget.sendMessage(payload);
      pushBotMessage((isFirstTurn && initialGreeting) || res.bot_reply || '[No response]');

      // Detect photo upload step from current_stage → stage_type in scenario config.
      // Deterministic: set by the backend stage resolver, not LLM output.
      const currentStageId = res.current_stage;
      const stages = Array.isArray(publishedScenarioConfig?.stages)
        ? publishedScenarioConfig.stages
        : Object.values(publishedScenarioConfig?.stages || {});
      const currentStageConfig = stages.find((s) => s?.stage_id === currentStageId);

      // Only trigger the photo popup when:
      // 1. The resolved stage is a photo_upload stage
      // 2. The bot's actual reply for THIS turn already mentions photo
      //    (meaning the LLM was genuinely prompted by stage 11 instructions,
      //    not just that the stage resolver quietly jumped ahead)
      // 3. We haven't already shown the popup for this conversation session
      if (
        currentStageConfig?.stage_type === 'photo_upload' &&
        !photoModalTriggeredRef.current
      ) {
        const botReplyLower = (res.bot_reply || '').toLowerCase();
        const replyMentionsPhoto = ['photo', 'picture', 'image', 'upload', 'foto'].some(
          (kw) => botReplyLower.includes(kw),
        );
        if (replyMentionsPhoto) {
          photoModalTriggeredRef.current = true;
          setTimeout(() => setShowPhotoUploadModal(true), 1200);
        }
        // If reply doesn't mention photo yet, the LLM is still finishing the
        // previous stage's reply. Let the next user turn naturally land in stage
        // 11 where the LLM will ask the photo question on its own.
      }
    } catch (err) {
      pushBotMessage(`Error: ${err.message || 'Could not get a response. Please try again.'}`);
    } finally {
      setIsSending(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  /** Upload files chosen inside the modal and auto-send them to the bot. */
  const handleModalFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const oversized = files.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      alert(`File too large (max 10 MB): ${oversized.name}`);
      return;
    }

    setIsModalUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('file', file));
      formData.append('workspace_id', workspaceId);

      const uploadRes = await api.widget.upload(formData);
      const uploadedFiles = normalizeUploadedFiles(uploadRes);
      const urls = uploadedFiles.map((item) => item.url).filter(Boolean);

      if (urls.length) {
        photoModalTriggeredRef.current = true; // prevent popup re-showing after upload
        setShowPhotoUploadModal(false);
        await sendWidgetMessage("I've uploaded my photos", urls);
      }
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsModalUploading(false);
      if (modalUploadRef.current) modalUploadRef.current.value = '';
      if (modalCameraRef.current) modalCameraRef.current.value = '';
    }
  };

  /** User chose "Maybe Later" inside the upload modal. */
  const handleModalSkip = async () => {
    photoModalTriggeredRef.current = true; // prevent popup re-showing after skip
    setShowPhotoUploadModal(false);
    await sendWidgetMessage('maybe later');
  };

  const handleFileUpload = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    if (pendingAttachments.length + selectedFiles.length > MAX_ATTACHMENTS) {
      alert(`You can attach up to ${MAX_ATTACHMENTS} photos per message`);
      return;
    }

    const oversizedFile = selectedFiles.find((file) => file.size > 10 * 1024 * 1024);
    if (oversizedFile) {
      alert(`File too large (max 10MB): ${oversizedFile.name}`);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append('file', file));
      formData.append('workspace_id', workspaceId);

      const res = await api.widget.upload(formData);
      const uploadedFiles = normalizeUploadedFiles(res);

      if (uploadedFiles.length) {
        setPendingAttachments((current) => [
          ...current,
          ...uploadedFiles.map((item) => item.url).filter(Boolean),
        ].slice(0, MAX_ATTACHMENTS));
      }
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSend = async (event) => {
    if (event) event.preventDefault();

    const trimmed = input.trim();
    if ((!trimmed && !pendingAttachments.length) || isFallbackMode || isSending || isUploading || !leadId) return;

    const curAttachments = pendingAttachments;
    setPendingAttachments([]);
    setInput('');

    await sendWidgetMessage(trimmed, curAttachments);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = async () => {
    setMessages([]);
    setInput('');
    setPendingAttachments([]);
    setIsFallbackMode(false);
    setIsSending(false);
    setLeadId(null);
    setIsInitialising(true);
    setInitError(null);
    setShowPhotoUploadModal(false);
    photoModalTriggeredRef.current = false;

    if (isContextLoading) return;
    if (!publishedScenarioConfig) {
      setInitError('No published scenario found for this workspace. Publish a scenario to simulate the chatbot.');
      setIsInitialising(false);
      return;
    }

    try {
      const res = await api.widget.createLead({
        workspace_id: workspaceId,
        name: 'Simulator User',
        email: `simulator-${Date.now()}@test.local`,
        is_simulator: true,
        consent_given: true,
      });
      setLeadId(res.lead_id);
      setMessages([]);
    } catch (err) {
      setInitError(err.message || 'Failed to restart conversation.');
    } finally {
      setIsInitialising(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleTriggerFallback = () => {
    setIsFallbackMode(true);
    setIsSending(false);
    pushBotMessage(fallbackMessage || 'Please leave your details and our team will contact you shortly.');
  };

  const isInputDisabled = isFallbackMode || isSending || isInitialising || isContextLoading || !!initError || !leadId || showPhotoUploadModal;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl" style={{ height: '560px' }}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
              <Bot size={14} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Widget Simulator</h3>
              <p className="text-xs text-gray-500">{resolvedBrandName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close simulator"
          >
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2">
          <Button size="sm" variant="secondary" className="gap-1" onClick={handleReset} disabled={isInitialising}>
            <RotateCcw size={14} /> Reset
          </Button>
          <Button size="sm" variant="outline" className="gap-1" onClick={handleTriggerFallback} disabled={isInitialising || isFallbackMode}>
            <AlertTriangle size={14} /> Simulate Timeout
          </Button>
          {leadId && (
            <span className="ml-auto font-mono text-xs text-gray-400" title="Lead ID">
              {leadId.slice(0, 12)}…
            </span>
          )}
        </div>

        {/* Message area */}
        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
          {/* Initialising state */}
          {isInitialising && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-400">
              <Loader2 size={24} className="animate-spin" />
              <p className="text-sm">Starting conversation…</p>
            </div>
          )}

          {/* Init error */}
          {!isInitialising && initError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-medium">Could not start conversation</p>
              <p className="mt-1 text-xs">{initError}</p>
            </div>
          )}

          {!isInitialising && !initError && messages.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-gray-400">
              <Bot size={28} className="text-gray-300" />
              <p className="text-sm font-medium">Send the first message</p>
              <p className="max-w-xs text-xs">The widget will show the configured greeting after the visitor sends the first message.</p>
            </div>
          )}

          {/* Messages */}
          {!isInitialising && !initError && messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white ${
                  message.role === 'user' ? 'bg-blue-500' : 'bg-indigo-600'
                }`}
              >
                {message.role === 'user' ? <User size={12} /> : <Bot size={12} />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  message.role === 'user'
                    ? 'rounded-tr-sm bg-blue-600 text-white'
                    : 'rounded-tl-sm bg-gray-100 text-gray-800'
                }`}
              >
                {Array.isArray(message.attachmentUrls) && message.attachmentUrls.length > 0 && (
                  <div className="mb-2 grid grid-cols-2 gap-2">
                    {message.attachmentUrls.map((attachmentUrl) => (
                      <AuthImage
                        key={attachmentUrl}
                        src={resolveAttachmentUrl(attachmentUrl)}
                        alt="Attachment"
                        className="max-w-full rounded-lg border border-white/20"
                      />
                    ))}
                  </div>
                )}
                {message.content}
              </div>
            </div>
          ))}

          {/* Bot typing indicator */}
          {isSending && (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">
                <Bot size={12} />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '-0.3s' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '-0.15s' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" />
              </div>
            </div>
          )}

          {/* Fallback form preview */}
          {isFallbackMode && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <p className="mb-2 font-medium">Fallback Contact Form</p>
              <div className="grid gap-2">
                <input disabled value="Your name" className="rounded border border-amber-200 bg-white px-2 py-1.5 text-xs" readOnly />
                <input disabled value="Email" className="rounded border border-amber-200 bg-white px-2 py-1.5 text-xs" readOnly />
                <button type="button" disabled className="rounded bg-gray-300 px-2 py-1.5 text-xs text-gray-700">Submit</button>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Photo Upload Modal — bottom sheet overlay */}
        {showPhotoUploadModal && (
          <div className="absolute inset-0 z-10 flex items-end bg-black/30 rounded-2xl">
            <div className="w-full rounded-t-2xl bg-white px-5 pb-6 pt-4 shadow-2xl">
              {/* drag handle */}
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />

              <h3 className="text-center text-base font-semibold text-gray-900">Upload a Photo</h3>
              <p className="mt-1 text-center text-xs text-gray-500">
                Please upload or take a photo to continue, or choose Maybe Later to skip.
              </p>

              {isModalUploading ? (
                <div className="flex flex-col items-center gap-2 py-8">
                  <Loader2 size={32} className="animate-spin text-blue-600" />
                  <p className="text-sm text-gray-500">Uploading photo…</p>
                </div>
              ) : (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {/* Upload from gallery */}
                    <button
                      type="button"
                      onClick={() => modalUploadRef.current?.click()}
                      className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <ImageIcon size={20} className="text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Upload Photo</span>
                    </button>

                    {/* Take photo with camera */}
                    <button
                      type="button"
                      onClick={() => modalCameraRef.current?.click()}
                      className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <Camera size={20} className="text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">Take Photo</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleModalSkip}
                    className="mt-4 w-full rounded-xl py-2.5 text-sm text-gray-400 transition-colors hover:text-gray-600"
                  >
                    Maybe Later
                  </button>
                </>
              )}

              {/* Hidden file inputs for modal */}
              <input
                ref={modalUploadRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleModalFileSelect}
              />
              <input
                ref={modalCameraRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                onChange={handleModalFileSelect}
              />
            </div>
          </div>
        )}

        {/* Input bar */}
        <form onSubmit={handleSend} className="shrink-0 border-t border-gray-200 p-3">
          {pendingAttachments.length > 0 && (
            <div className="mb-2 rounded-xl border border-gray-100 bg-gray-50 p-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-medium text-gray-700">{pendingAttachments.length} photo{pendingAttachments.length === 1 ? '' : 's'} attached</p>
                  <p className="text-[10px] text-gray-400">Ready to send</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingAttachments([])}
                  className="rounded-full bg-gray-200 p-1 text-gray-500 transition-colors hover:bg-gray-300 hover:text-gray-700"
                  title="Remove all photos"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {pendingAttachments.map((attachmentUrl, index) => (
                  <div key={attachmentUrl} className="relative overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <AuthImage
                      src={resolveAttachmentUrl(attachmentUrl)}
                      alt={`Preview ${index + 1}`}
                      className="h-16 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setPendingAttachments((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                      className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white"
                      title="Remove photo"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/jpeg, image/png, image/webp"
              multiple
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isInputDisabled || pendingAttachments.length >= MAX_ATTACHMENTS}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
              title="Attach photo"
            >
              {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isInputDisabled}
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-50 max-h-24 overflow-y-auto"
              placeholder={
                isFallbackMode
                  ? 'Fallback mode active. Reset to continue.'
                  : isInitialising
                  ? 'Starting conversation…'
                  : initError
                  ? 'Conversation unavailable.'
                  : pendingAttachments.length
                  ? `Add a note... (${pendingAttachments.length}/${MAX_ATTACHMENTS} photos attached)`
                  : 'Type a message… (Enter to send)'
              }
            />
            <button
              type="submit"
              disabled={isInputDisabled || (!input.trim() && !pendingAttachments.length) || isUploading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-200"
              title="Send message"
            >
              {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WidgetSimulator;
