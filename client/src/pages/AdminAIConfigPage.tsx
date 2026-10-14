import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Coins,
  Activity,
  Layers,
  HelpCircle,
  Key,
  Eye,
  EyeOff,
  Save,
  Power,
  PowerOff,
  Zap,
  PlayCircle,
  AlertCircle,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { AdminAIConfig, AIStatusInfo } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';

export const AdminAIConfigPage: React.FC = () => {
  const { showToast } = useToast();

  const [config, setConfig] = useState<AdminAIConfig | null>(null);
  const [platformUsage, setPlatformUsage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [provider, setProvider] = useState('gemini');

  // Action states
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

  // Test Request states
  const [testing, setTesting] = useState(false);
  const [testPrompt, setTestPrompt] = useState('Recommend 2 top-rated headphones in our catalog');
  const [testResult, setTestResult] = useState<{
    prompt: string;
    reply: string;
    model: string;
    durationMs: number;
    tokensUsed: number;
  } | null>(null);

  const fetchConfigAndUsage = async () => {
    try {
      setLoading(true);
      const [configRes, usageRes] = await Promise.all([
        api.ai.getConfig(),
        api.ai.getUsage(),
      ]);

      if (configRes.success && configRes.config) {
        setConfig(configRes.config);
        setSelectedModel(configRes.config.model || 'gemini-2.5-flash');
      }
      if (usageRes.success && usageRes.platform) {
        setPlatformUsage(usageRes.platform);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch AI configuration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigAndUsage();
  }, []);

  // 1. Verify Connection
  const handleVerify = async () => {
    try {
      setVerifying(true);
      const res = await api.ai.verifyConfig({
        apiKey: apiKeyInput.trim() || undefined,
        model: selectedModel,
      });

      if (res.success && res.verification) {
        if (res.verification.status === 'verified') {
          showToast('Connection verified successfully! Google Gemini is responding.', 'success');
        } else if (res.verification.status === 'invalid_credentials') {
          showToast('Authentication failed: Invalid Gemini API key.', 'error');
        } else {
          showToast(`Verification: ${res.verification.message}`, 'info');
        }
        await fetchConfigAndUsage();
      }
    } catch (err: any) {
      showToast(err.message || 'Verification request failed.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  // 2. Save Configuration
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const res = await api.ai.saveConfig({
        provider,
        model: selectedModel,
        apiKey: apiKeyInput.trim() || undefined,
      });

      if (res.success && res.config) {
        setConfig(res.config);
        setApiKeyInput(''); // Clear input for security
        showToast('AI Provider configuration saved securely.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save configuration.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 3. Enable / Disable Assistant
  const handleToggleAssistant = async () => {
    if (!config) return;
    try {
      setToggling(true);
      const targetState = !config.isEnabled;
      const res = await api.ai.toggleAssistant(targetState);
      if (res.success) {
        setConfig((prev) => (prev ? { ...prev, isEnabled: res.isEnabled } : null));
        showToast(res.message, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to toggle assistant.', 'error');
    } finally {
      setToggling(false);
    }
  };

  // 4. Disconnect Provider with Confirmation
  const handleDisconnectConfirm = async () => {
    try {
      setDisconnecting(true);
      const res = await api.ai.disconnectProvider(true);
      if (res.success && res.config) {
        setConfig(res.config);
        setApiKeyInput('');
        setIsDisconnectModalOpen(false);
        showToast('AI Provider disconnected. Storefront assistant has been disabled.', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to disconnect provider.', 'error');
    } finally {
      setDisconnecting(false);
    }
  };

  // 5. Test AI Request
  const handleTestRequest = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      const res = await api.ai.testRequest(testPrompt);
      if (res.success && res.result) {
        setTestResult(res.result);
        showToast('Test AI request completed successfully.', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Test request failed. Please verify credentials.', 'error');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <LoadingSpinner text="Loading AI Provider Settings & SDK Telemetry..." />
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!config) return null;
    const s = config.connectionStatus;
    switch (s) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Connected & Verified
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            Connection Error / Invalid Key
          </span>
        );
      case 'disconnected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
            <PowerOff className="w-3.5 h-3.5 text-slate-500" />
            Disconnected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Pending Verification
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Admin Settings &gt; AI Provider Settings
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Google Gemini Connection Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure secure API credentials, verify supported Gemini models, and control shopping assistant storefront availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={fetchConfigAndUsage}
            disabled={loading || verifying || saving}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Enable / Disable Assistant Control */}
          <Button
            variant={config?.isEnabled ? 'secondary' : 'primary'}
            onClick={handleToggleAssistant}
            isLoading={toggling}
            className={`flex items-center gap-2 ${
              config?.isEnabled
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {config?.isEnabled ? (
              <>
                <PowerOff className="w-4 h-4" /> Disable Assistant
              </>
            ) : (
              <>
                <Power className="w-4 h-4" /> Start Connection / Enable Assistant
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Connection Status Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-violet-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Live AI Provider Status
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official Google Gen AI SDK: @google/genai v2.29.1
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {config?.isEnabled ? (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-violet-100 text-violet-800 border border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800">
                Storefront Active
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                Storefront Paused
              </span>
            )}
          </div>
        </div>

        {/* Status Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Provider
            </span>
            <p className="text-base font-bold text-slate-900 dark:text-white">Google Gemini</p>
            <p className="text-[11px] text-slate-500">Official REST/RPC API</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Configured Model
            </span>
            <p className="text-base font-bold text-violet-600 dark:text-violet-400 font-mono">
              {config?.model || 'gemini-2.5-flash'}
            </p>
            <p className="text-[11px] text-slate-500">Fast reasoning & low latency</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              API Key Storage
            </span>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {config?.hasApiKey ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono text-sm">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {config.keyMask || 'Encrypted (AES-256)'}
                </span>
              ) : (
                <span className="text-slate-400">None Configured</span>
              )}
            </p>
            <p className="text-[11px] text-slate-400">Encrypted server-side</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Last Verified Time
            </span>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {config?.lastVerifiedAt
                ? new Date(config.lastVerifiedAt).toLocaleString()
                : 'Not verified yet'}
            </p>
            <p className="text-[11px] text-slate-400">Real ping to @google/genai</p>
          </div>
        </div>

        {/* Sanitized Error Banner if present */}
        {config?.lastVerificationError && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-sm text-rose-900 dark:text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Verification Diagnostic: </span>
              <span>{config.lastVerificationError}</span>
            </div>
          </div>
        )}
      </div>

      {/* Configuration Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-violet-600" />
            Provider Credentials & Model Selection
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Update your Google Gemini API key and adjust the target generation model.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Provider Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                AI Provider Selection
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                <option value="gemini">Google Gemini (Official @google/genai SDK)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                Official Google Gen AI SDK integration for multi-vendor shopping assistance.
              </p>
            </div>

            {/* Model Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Gemini Model Selection
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-violet-500 focus:outline-none"
              >
                <option value="gemini-2.5-flash">gemini-2.5-flash (Recommended: Low latency & cost)</option>
                <option value="gemini-1.5-flash">gemini-1.5-flash (Balanced speed & accuracy)</option>
                <option value="gemini-2.0-flash">gemini-2.0-flash (Fast multimodal generation)</option>
                <option value="gemini-2.5-pro">gemini-2.5-pro (Advanced complex reasoning)</option>
              </select>
              <p className="text-[11px] text-slate-400">
                The AI model used for intent interpretation and catalog grounded explanations.
              </p>
            </div>
          </div>

          {/* Secure API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Secure Gemini API Key
              </label>
              {config?.hasApiKey && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  Currently Saved: {config.keyMask}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder={
                  config?.hasApiKey
                    ? 'Enter new key to replace existing encrypted key...'
                    : 'AIzaSy...'
                }
                className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono placeholder:text-slate-400 focus:ring-2 focus:ring-violet-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              🔒 <strong>Security Policy:</strong> API keys are encrypted at rest on the server using AES-256-GCM authenticated encryption. Keys are never exposed in browser JavaScript, client-side storage, or network response payloads.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleVerify}
                isLoading={verifying}
                disabled={saving || disconnecting}
                className="flex items-center gap-2 border-violet-200 dark:border-violet-900 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/50"
              >
                <Sparkles className="w-4 h-4" />
                Verify Connection
              </Button>

              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                disabled={verifying || disconnecting}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
              >
                <Save className="w-4 h-4" />
                Save Configuration
              </Button>
            </div>

            {config?.hasApiKey && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsDisconnectModalOpen(true)}
                disabled={saving || verifying || disconnecting}
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 text-xs"
              >
                <PowerOff className="w-4 h-4" />
                Disconnect Provider
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Test AI Request Console */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              Test AI Request Console
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Execute a real, lightweight shopping prompt to verify end-to-end response generation and token accounting.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleTestRequest}
            isLoading={testing}
            disabled={verifying || saving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 self-start sm:self-auto text-xs"
          >
            <PlayCircle className="w-4 h-4" />
            Test AI Request
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              Sample Shopping Test Query
            </label>
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="e.g. Recommend 2 high-rated headphones in our catalog"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {testResult && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs border border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Response Generated
                </span>
                <span>Model: {testResult.model}</span>
                <span>Latency: {testResult.durationMs}ms</span>
                <span>Tokens: {testResult.tokensUsed}</span>
              </div>
              <p className="text-slate-200 leading-relaxed font-sans text-sm whitespace-pre-wrap">
                {testResult.reply}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Platform Token Usage & Cost Accounting Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Platform AI Token Accounting
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audited metrics collected directly from Google Gen AI usage metadata
              </p>
            </div>
          </div>
          <Badge variant="success">Audit Active</Badge>
        </div>

        {/* Token Counters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Requests</span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {platformUsage?.totalRequests ?? 0}
            </p>
            <span className="text-[10px] text-slate-400">Recorded events</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Tokens</span>
            <p className="text-2xl font-black text-violet-600 dark:text-violet-400 mt-1">
              {(platformUsage?.totalTokens ?? 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">Input + Output</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Input Tokens</span>
            <p className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-1">
              {(platformUsage?.inputTokens ?? 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">Prompt grounding</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Output Tokens</span>
            <p className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-1">
              {(platformUsage?.outputTokens ?? 0).toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">Generated replies</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Success Rate</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {platformUsage?.totalRequests
                ? `${Math.round(
                    ((platformUsage.successfulRequests || 0) / platformUsage.totalRequests) * 100
                  )}%`
                : '100%'}
            </p>
            <span className="text-[10px] text-slate-400">Reliability ratio</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Est. Ref Cost</span>
            <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400 mt-1">
              ${Number(platformUsage?.estimatedCostUSD || 0).toFixed(4)}
            </p>
            <span className="text-[10px] text-slate-400">Reference estimate</span>
          </div>
        </div>
      </div>

      {/* Disconnect Confirmation Modal */}
      <Modal
        isOpen={isDisconnectModalOpen}
        onClose={() => setIsDisconnectModalOpen(false)}
        title="Disconnect Google Gemini Provider?"
        description="Please confirm you wish to disconnect the active AI credentials."
        maxWidth="md"
      >
        <div className="space-y-4 py-2">
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Disconnecting will erase the encrypted API credentials from database storage and disable the shopping assistant on the storefront. Standard marketplace browsing, search bar, cart, and checkout will continue to operate normally.
            </p>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400">
            Are you sure you want to proceed with disconnecting?
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDisconnectModalOpen(false)}
              disabled={disconnecting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDisconnectConfirm}
              isLoading={disconnecting}
            >
              Confirm Disconnect
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
