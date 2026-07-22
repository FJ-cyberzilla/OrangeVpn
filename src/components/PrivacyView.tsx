import React, { useRef, useEffect } from 'react';
import { ShieldCheck, Activity, Shield, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface PrivacyViewProps {
  isDnsLeakProtectionEnabled: boolean;
  setIsDnsLeakProtectionEnabled: (v: boolean) => void;
  isAntiDnsPoisoningEnabled: boolean;
  setIsAntiDnsPoisoningEnabled: (v: boolean) => void;
  isCustomDnsEnabled: boolean;
  setIsCustomDnsEnabled: (v: boolean) => void;
  customDnsServer: string;
  setCustomDnsServer: (v: string) => void;
  status: string;
  dnsDiagnosticLogs: string[];
  dnsDiagnosticStatus: 'idle' | 'running' | 'completed';
  runDnsDiagnostic: () => void;
}

export const PrivacyView: React.FC<PrivacyViewProps> = ({
  isDnsLeakProtectionEnabled,
  setIsDnsLeakProtectionEnabled,
  isAntiDnsPoisoningEnabled,
  setIsAntiDnsPoisoningEnabled,
  isCustomDnsEnabled,
  setIsCustomDnsEnabled,
  customDnsServer,
  setCustomDnsServer,
  status,
  dnsDiagnosticLogs,
  dnsDiagnosticStatus,
  runDnsDiagnostic,
}) => {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dnsDiagnosticLogs]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Left Column: DNS Configuration & Zero Logs Ledger */}
      <div className="lg:col-span-6 space-y-6">
        {/* DNS Configuration */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-white">
            <ShieldCheck size={18} className="text-orange-500" />
            DNS Isolation & Spoof Protection
          </h3>

          <div className="space-y-4">
            {/* DNS Leak Protection */}
            <div className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:bg-zinc-900/50 transition-colors">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">DNS Leak Prevention Shield</span>
                <p className="text-[8px] text-zinc-500 mt-0.5">Force all network queries through secure, loopback-bound DNS relays.</p>
              </div>
              <button
                onClick={() => setIsDnsLeakProtectionEnabled(!isDnsLeakProtectionEnabled)}
                className={cn(
                  "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  isDnsLeakProtectionEnabled ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-zinc-950 text-zinc-500 border border-zinc-800"
                )}
              >
                {isDnsLeakProtectionEnabled ? 'SECURED' : 'UNSECURED'}
              </button>
            </div>

            {/* Anti-DNS Poisoning */}
            <div className="flex items-center justify-between p-3 bg-zinc-900/30 border border-zinc-800 rounded-2xl hover:bg-zinc-900/50 transition-colors">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Anti-DNS Poisoning & Hijack Filter</span>
                <p className="text-[8px] text-zinc-500 mt-0.5">Encrypts DNS queries via HTTPS (DoH) or QUIC (DoQ) to block national ISP hijacks.</p>
              </div>
              <button
                onClick={() => setIsAntiDnsPoisoningEnabled(!isAntiDnsPoisoningEnabled)}
                className={cn(
                  "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                  isAntiDnsPoisoningEnabled ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-zinc-950 text-zinc-500 border border-zinc-800"
                )}
              >
                {isAntiDnsPoisoningEnabled ? 'ACTIVE' : 'OFF'}
              </button>
            </div>

            {/* Custom DNS */}
            <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Custom Private Resolvers</span>
                  <p className="text-[8px] text-zinc-500 mt-0.5">Configure custom upstream DNS nodes inside the secure tunnel envelope.</p>
                </div>
                <button
                  onClick={() => setIsCustomDnsEnabled(!isCustomDnsEnabled)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    isCustomDnsEnabled ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-zinc-950 text-zinc-500 border border-zinc-800"
                  )}
                >
                  {isCustomDnsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {isCustomDnsEnabled && (
                <div className="pt-2 animate-in fade-in duration-300 space-y-2">
                  <input
                    type="text"
                    value={customDnsServer}
                    onChange={(e) => setCustomDnsServer(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-orange-500/50"
                    placeholder="e.g. 1.1.1.1"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Cloudflare', ip: '1.1.1.1' },
                      { name: 'Google Secure', ip: '8.8.8.8' },
                      { name: 'AdGuard Family', ip: '94.140.14.14' },
                      { name: 'NextDNS Private', ip: '45.90.28.0' },
                    ].map((dns) => (
                      <button
                        key={dns.ip}
                        onClick={() => setCustomDnsServer(dns.ip)}
                        className={cn(
                          "text-[9px] font-mono px-2 py-0.5 rounded transition-colors",
                          customDnsServer === dns.ip ? "bg-orange-500/20 text-orange-400" : "bg-zinc-950 hover:bg-zinc-900 text-zinc-500"
                        )}
                      >
                        {dns.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Audit Verifier Block */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
          <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-white">
            <Activity size={18} className="text-orange-500" />
            Cryptographic Zero-Log Verification Audit
          </h3>
          <p className="text-[10px] text-zinc-500 leading-normal mb-4">
            Our RAM-only server nodes are compiled with zero static filesystem logging daemons. All session keys and connection history are stored dynamically in volatile RAM sockets and sanitization-purged immediately upon terminal disconnections.
          </p>
          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">RAM Sanitization Pool Status</span>
              <span className="text-[9px] text-emerald-400 font-black uppercase">ACTIVE & VERIFIED</span>
            </div>
            <div className="space-y-1 text-[8px] font-mono text-zinc-600 leading-relaxed">
              <p className="text-emerald-500/80">✔ RamFS volume mounted: /mnt/security-keys (volatile, ephemeral)</p>
              <p className="text-zinc-500">⌛ Garbage collection sweep: Purged 14 expired session handshakes (0.00ms latency)</p>
              <p className="text-zinc-500">🔒 System entropy: 4096-bit (Hardware random seed verification matched)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live DNS Leak Diagnostic Shield Suite */}
      <div className="lg:col-span-6 space-y-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden flex flex-col h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-white">
              <Shield size={18} className="text-orange-500" />
              Live DNS Leak Test Diagnostics
            </h3>
            
            <div className="flex items-center gap-2">
              {status === 'connected' && isDnsLeakProtectionEnabled ? (
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-black uppercase">DNS Protected</span>
              ) : (
                <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                  <AlertCircle size={10} /> Leak Risk
                </span>
              )}
            </div>
          </div>

          <p className="text-[10px] text-zinc-500 leading-relaxed mb-6">
            Make sure that your local ISP or network operators cannot eavesdrop on your domain name requests. Run our automated live diagnostic sweep below to query isolated nodes globally and verify encapsulation integrity.
          </p>

          <div className="space-y-4 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Local Active Resolver</span>
                <span className="text-[11px] font-mono font-black text-white">
                  {status === 'connected' ? '10.255.0.1 (VPN loopback)' : 'ISP Default (Unsecure)'}
                </span>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Tunnel Encapsulation</span>
                <span className="text-[11px] font-mono font-black text-white">
                  {status === 'connected' ? 'DoQ / DoH Combined' : 'Cleartext UDP/53 (Poison-prone)'}
                </span>
              </div>
            </div>

            {/* Simulated Live Terminal output */}
            <div className="flex-1 min-h-[180px] bg-black border border-zinc-800 rounded-2xl p-4 font-mono text-[9px] text-zinc-400 overflow-y-auto max-h-[220px] custom-scrollbar flex flex-col justify-between">
              <div className="space-y-1.5">
                {dnsDiagnosticLogs.length > 0 ? (
                  dnsDiagnosticLogs.map((log, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        log.startsWith('[RESOLVED]') ? "text-emerald-400" :
                        log.includes('---') || log.includes('RESULT:') ? "text-orange-400 font-bold border-t border-zinc-800/80 pt-1.5 mt-1.5" :
                        log.startsWith('[INIT]') ? "text-zinc-500" : "text-zinc-400"
                      )}
                    >
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-600 italic text-center py-12">
                    Terminal ready. Click 'Run DNS Leak Diagnostic Check' to launch the cryptographic interface test.
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>

            <button
              onClick={runDnsDiagnostic}
              disabled={dnsDiagnosticStatus === 'running' || status !== 'connected'}
              className={cn(
                "w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                status !== 'connected'
                  ? "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed"
                  : dnsDiagnosticStatus === 'running'
                  ? "bg-orange-500/10 border border-orange-500/30 text-orange-400 animate-pulse cursor-not-allowed"
                  : "bg-orange-500 text-black hover:bg-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)] active:scale-95"
              )}
            >
              <RefreshCw size={14} className={cn(dnsDiagnosticStatus === 'running' && "animate-spin")} />
              {status !== 'connected' 
                ? 'Establish Connection First' 
                : dnsDiagnosticStatus === 'running' 
                ? 'Testing Leak Interfaces...' 
                : 'Run DNS Leak Diagnostic Check'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
