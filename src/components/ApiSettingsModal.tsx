import React, { useState } from 'react';
import { X, Key, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
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
      const original = smmClient.getConfig();
      smmClient.saveConfig({ endpoint, apiKey, useProxy });

      const bal = await smmClient.getApiBalance();
      if (bal) {
        setTestResult({
          success: true,
          message: `Connected to SMM API! Panel balance: $${bal.balance} ${bal.currency}`,
        });
      } else {
        const svcs = await smmClient.getServices();
        setTestResult({
          success: true,
          message: `Connected! Synchronized ${svcs.length} verified services from SMM engine.`,
        });
      }
      smmClient.saveConfig(original);
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
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#16081e] border-2 border-pink-500/40 rounded-3xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
              <Key className="w-4 h-4 text-pink-400" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">SMM Engine API Configuration</h3>
              <p className="text-[10px] text-pink-300/70">POST parameters: key, action, service, link, quantity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-pink-400 hover:text-white hover:bg-pink-900/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preset Endpoints */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-pink-300/80">
            Provider Base URL
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: 'SMM8 Endpoint', url: 'https://smm8.com/api/v2' },
              { name: 'The Owlet Endpoint', url: 'https://theowlet.com/api/v2' },
            ].map((p) => (
              <button
                key={p.url}
                type="button"
                onClick={() => setEndpoint(p.url)}
                className={`p-2.5 rounded-2xl text-left border transition text-xs cursor-pointer ${
                  endpoint === p.url
                    ? 'bg-pink-500/20 border-pink-500 text-pink-300 font-bold shadow-md shadow-pink-500/20'
                    : 'bg-[#1b0a24] border-pink-900/40 text-pink-300/60 hover:text-white'
                }`}
              >
                <div className="font-bold text-white">{p.name}</div>
                <div className="text-[10px] font-mono text-pink-300/60 truncate">{p.url}</div>
              </button>
            ))}
          </div>

          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://smm8.com/api/v2"
            className="w-full bg-[#120718] border border-pink-900/40 focus:border-pink-500 rounded-2xl px-4 py-2 text-xs text-white font-mono focus:outline-none mt-1 shadow-inner"
          />
        </div>

        {/* Master API Key input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-pink-300/80 flex items-center justify-between">
            <span>Master API Key</span>
            <span className="text-[10px] text-pink-400 font-mono">key=...</span>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your SMM API key (e.g. 7f9d8e12a...)"
            className="w-full bg-[#120718] border border-pink-900/40 focus:border-pink-500 rounded-2xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none shadow-inner"
          />
          <p className="text-[10px] text-pink-300/60">
            Orders from <strong className="text-pink-300">Preciousddkid@gmail.com</strong> dispatch through this master key at $0.00 / Free rate.
          </p>
        </div>

        {/* Proxy toggle */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#120718] border border-pink-900/40 text-xs">
          <div>
            <span className="text-white font-bold block">Backend Relay Proxy</span>
            <span className="text-[10px] text-pink-300/60">Forwards requests via Express server to eliminate CORS blocks</span>
          </div>
          <input
            type="checkbox"
            checked={useProxy}
            onChange={(e) => setUseProxy(e.target.checked)}
            className="accent-pink-500 w-4 h-4 cursor-pointer"
          />
        </div>

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-3 rounded-2xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
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
            className="flex-1 py-3 rounded-2xl bg-[#1c0a24] hover:bg-pink-900/30 border border-pink-900/40 text-pink-200 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-pink-400' : ''}`} />
            <span>Test Connection</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-black transition shadow-lg shadow-pink-500/30 cursor-pointer"
          >
            Save & Connect
          </button>
        </div>
      </div>
    </div>
  );
};
