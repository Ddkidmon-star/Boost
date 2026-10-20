import React, { useState } from 'react';
import { X, Key, Check, Globe, RefreshCw, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { useSMM } from '../context/SMMContext';
import { smmClient } from '../services/smmApi';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig } = useSMM();

  const [endpoint, setEndpoint] = useState(config.endpoint);
  const [apiKey, setApiKey] = useState(config.apiKey);
  const [useProxy, setUseProxy] = useState(config.useProxy);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Temporarily test with current inputs
      const original = smmClient.getConfig();
      smmClient.saveConfig({ endpoint, apiKey, useProxy });

      const bal = await smmClient.getApiBalance();
      if (bal) {
        setTestResult({
          success: true,
          message: `Connected! Panel balance: $${bal.balance} ${bal.currency}`,
        });
      } else {
        // Test services count
        const svcs = await smmClient.getServices();
        setTestResult({
          success: true,
          message: `Connected! Engine synchronized with ${svcs.length} verified services.`,
        });
      }
      smmClient.saveConfig(original); // revert until saved
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err?.message || 'Connection test timed out or invalid key.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    updateConfig({ endpoint, apiKey, useProxy });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#101322] border border-cyan-500/30 rounded-3xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Key className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">SMM Engine API Configuration</h3>
              <p className="text-[10px] text-slate-400">Standard SMM Panel v2 protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Endpoints */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Provider Base URL
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'SMM8 (Default)', url: 'https://smm8.com/api/v2' },
              { name: 'The Owlet', url: 'https://theowlet.com/api/v2' },
            ].map((p) => (
              <button
                key={p.url}
                type="button"
                onClick={() => setEndpoint(p.url)}
                className={`p-2 rounded-xl text-left border transition text-xs cursor-pointer ${
                  endpoint === p.url
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-medium text-white">{p.name}</div>
                <div className="text-[10px] font-mono text-slate-500 truncate">{p.url}</div>
              </button>
            ))}
          </div>

          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://smm8.com/api/v2"
            className="w-full bg-[#0d101a] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none mt-1"
          />
        </div>

        {/* Master API Key input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Master API Key</span>
            <span className="text-[10px] text-slate-500">Parameter: key=...</span>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your SMM API key (e.g. a7f9d8e...)"
            className="w-full bg-[#0d101a] border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none"
          />
          <p className="text-[10px] text-slate-500">
            Leave blank to use the built-in accelerated simulation mode for instant prototyping.
          </p>
        </div>

        {/* Proxy toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
          <div>
            <span className="text-white font-medium block">CORS Bypass Relay Proxy</span>
            <span className="text-[10px] text-slate-400">Routes calls through /api/smm to avoid browser CORS</span>
          </div>
          <input
            type="checkbox"
            checked={useProxy}
            onChange={(e) => setUseProxy(e.target.checked)}
            className="accent-cyan-400 w-4 h-4 cursor-pointer"
          />
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Test Connection</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition cursor-pointer"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};
