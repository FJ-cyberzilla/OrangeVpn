import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ShieldCheck, ShieldAlert, AlertTriangle, 
  CheckCircle2, Timer, RotateCcw, Cpu, Wifi, 
  Terminal, ArrowRight, Shield, Zap, RefreshCw, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Helper for Tailwind styling merge
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

interface SmartSelectViewProps {
  status: 'disconnected' | 'connecting' | 'connected';
  setStatus: (s: 'disconnected' | 'connecting' | 'connected') => void;
  protocol: string;
  setProtocol: (p: string) => void;
  detectedIsp: 'MCI' | 'Irancell' | 'Wifi' | 'Other';
  selectedServer: any;
  setSelectedServer: (s: any) => void;
  servers: any[];
  
  // Security settings
  isPacketMorphingEnabled: boolean;
  setIsPacketMorphingEnabled: (b: boolean) => void;
  isTimingObfuscationEnabled: boolean;
  setIsTimingObfuscationEnabled: (b: boolean) => void;
  isAlpnSpoofingEnabled: boolean;
  setIsAlpnSpoofingEnabled: (b: boolean) => void;
  isChaffingEnabled: boolean;
  setIsChaffingEnabled: (b: boolean) => void;
  isMultiPathSimEnabled: boolean;
  setIsMultiPathSimEnabled: (b: boolean) => void;
  isYoutubeOptimizerEnabled: boolean;
  setIsYoutubeOptimizerEnabled: (b: boolean) => void;

  // Settings
  isTrafficCompressionEnabled: boolean;
  setIsTrafficCompressionEnabled: (b: boolean) => void;
  isAutoDisconnectEnabled: boolean;
  setIsAutoDisconnectEnabled: (b: boolean) => void;
  isResilienceModeEnabled: boolean;
  setIsResilienceModeEnabled: (b: boolean) => void;
  isNetworkOptimizationEnabled: boolean;
  setIsNetworkOptimizationEnabled: (b: boolean) => void;
  isKillSwitchEnabled: boolean;
  setIsKillSwitchEnabled: (b: boolean) => void;

  // Privacy/DPI settings
  isDnsLeakProtectionEnabled: boolean;
  setIsDnsLeakProtectionEnabled: (b: boolean) => void;
  isAntiDnsPoisoningEnabled: boolean;
  setIsAntiDnsPoisoningEnabled: (b: boolean) => void;
  isDpiBypassEnabled: boolean;
  setIsDpiBypassEnabled: (b: boolean) => void;
  isTlsFragmentationEnabled: boolean;
  setIsTlsFragmentationEnabled: (b: boolean) => void;
  isLengthManipulationEnabled: boolean;
  setIsLengthManipulationEnabled: (b: boolean) => void;
  isSniPaddingEnabled: boolean;
  setIsSniPaddingEnabled: (b: boolean) => void;
  isObfuscationEnabled: boolean;
  setIsObfuscationEnabled: (b: boolean) => void;
  isCdnFrontingEnabled: boolean;
  setIsCdnFrontingEnabled: (b: boolean) => void;
  sniMask: string;
  setSniMask: (s: string) => void;
  setStealthStatus: (s: string) => void;
  setRotationTimeLeft: (t: number) => void;
}

interface DiagnosisItem {
  id: string;
  name: string;
  status: 'optimal' | 'warning' | 'critical';
  details: string;
  autoFixValue: string;
}

export const SmartSelectView: React.FC<SmartSelectViewProps> = ({
  status,
  setStatus,
  protocol,
  setProtocol,
  detectedIsp,
  selectedServer,
  setSelectedServer,
  servers,

  isPacketMorphingEnabled,
  setIsPacketMorphingEnabled,
  isTimingObfuscationEnabled,
  setIsTimingObfuscationEnabled,
  isAlpnSpoofingEnabled,
  setIsAlpnSpoofingEnabled,
  isChaffingEnabled,
  setIsChaffingEnabled,
  isMultiPathSimEnabled,
  setIsMultiPathSimEnabled,
  isYoutubeOptimizerEnabled,
  setIsYoutubeOptimizerEnabled,

  isTrafficCompressionEnabled,
  setIsTrafficCompressionEnabled,
  isAutoDisconnectEnabled,
  setIsAutoDisconnectEnabled,
  isResilienceModeEnabled,
  setIsResilienceModeEnabled,
  isNetworkOptimizationEnabled,
  setIsNetworkOptimizationEnabled,
  isKillSwitchEnabled,
  setIsKillSwitchEnabled,

  isDnsLeakProtectionEnabled,
  setIsDnsLeakProtectionEnabled,
  isAntiDnsPoisoningEnabled,
  setIsAntiDnsPoisoningEnabled,
  isDpiBypassEnabled,
  setIsDpiBypassEnabled,
  isTlsFragmentationEnabled,
  setIsTlsFragmentationEnabled,
  isLengthManipulationEnabled,
  setIsLengthManipulationEnabled,
  isSniPaddingEnabled,
  setIsSniPaddingEnabled,
  isObfuscationEnabled,
  setIsObfuscationEnabled,
  isCdnFrontingEnabled,
  setIsCdnFrontingEnabled,
  sniMask,
  setSniMask,
  setStealthStatus,
  setRotationTimeLeft,
}) => {
  // Main states
  const [tuningState, setTuningState] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [etaSeconds, setEtaSeconds] = useState(8);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Simulation switches to trigger "error handling and troubleshooting" requested by user
  const [simulateDpiProbeInterception, setSimulateDpiProbeInterception] = useState(false);
  const [failurePhase, setFailurePhase] = useState<string>('');
  const [fixedByTroubleshoot, setFixedByTroubleshoot] = useState<string[]>([]);

  // Steps for auto selection process
  const tuningSteps = [
    { name: 'ISP Signature Probe', duration: 1500, log: 'Probing regional telecom routing policies...' },
    { name: 'DNS Leaks Checker', duration: 1500, log: 'Sweeping ports to detect cleartext DNS queries...' },
    { name: 'DPI Middlebox Firewall Simulation', duration: 2000, log: 'Injecting fragmented TLS ClientHello to evaluate SNI block triggers...' },
    { name: 'Multipath Latency Profiler', duration: 1500, log: 'Sweeping 5 global recursive node latencies...' },
    { name: 'SOTA Context-Aware Auto-Configurator', duration: 1500, log: 'Re-routing cryptographic tunnels & mapping parameters...' }
  ];

  // Live real-time analysis of the current settings
  const getDiagnoses = (): DiagnosisItem[] => {
    const list: DiagnosisItem[] = [];

    // Protocol Optimization Diagnosis
    if (detectedIsp === 'MCI' && !protocol.includes('VLESS-XTLS')) {
      list.push({
        id: 'isp-protocol',
        name: 'MCI Protocol Incompatibility',
        status: 'critical',
        details: `Active protocol "${protocol}" has high susceptibility to deep-probing active attacks on MCI Net. VLESS-XTLS-Reality is highly recommended.`,
        autoFixValue: 'VLESS-XTLS-Reality (2026 SOTA)'
      });
    } else if (detectedIsp === 'Irancell' && !protocol.includes('Hysteria 2')) {
      list.push({
        id: 'isp-protocol',
        name: 'Irancell Extreme Throttling Risk',
        status: 'critical',
        details: `Active protocol "${protocol}" is severely throttled under MTN Irancell. High-concurrency UDP Hysteria 2 congestion control is optimal.`,
        autoFixValue: 'Hysteria 2 (UDP-Obfs SOTA)'
      });
    } else if (detectedIsp === 'Wifi' && !protocol.includes('WireGuard')) {
      list.push({
        id: 'isp-protocol',
        name: 'Wifi DPI Filter Proximity',
        status: 'warning',
        details: `Active protocol "${protocol}" lacks optimized MTU headers for general WiFi ISPs. WireGuard-Obfs provides lower overhead.`,
        autoFixValue: 'WireGuard-Obfs (SOTA)'
      });
    }

    // DNS Security Diagnosis
    if (!isDnsLeakProtectionEnabled) {
      list.push({
        id: 'dns-protection',
        name: 'Unbound DNS Exposure (Leak Risk!)',
        status: 'critical',
        details: 'Local port 53 traffic is routing clearly through system default recursive resolvers. Requires Loopback-Bound DoH Isolation.',
        autoFixValue: 'Enable DNS Leak Shield'
      });
    }

    // DPI Obfuscation Diagnosis
    if (detectedIsp === 'Irancell' && !isTlsFragmentationEnabled) {
      list.push({
        id: 'tls-frag',
        name: 'MTN Censorship Susceptibility',
        status: 'warning',
        details: 'TLS handshakes are dispatched unfragmented. Active middleboxes can easily reconstruct SNI filters. Handshake Fragmentation recommended.',
        autoFixValue: 'Enable Handshake Fragmentation'
      });
    }

    // Stealth engine check
    if (!isTimingObfuscationEnabled || !isPacketMorphingEnabled) {
      list.push({
        id: 'stealth-jitter',
        name: 'Timing Correlation Exposure',
        status: 'warning',
        details: 'Traffic flow lacks randomized timing jitter. ISP timing-analysis models can correlate proxy patterns to source IP.',
        autoFixValue: 'Activate Stealth Engine Obfuscators'
      });
    }

    // Server latency optimization check
    const speedLimitServer = servers.find(s => s.load > 80);
    if (selectedServer && selectedServer.load > 75) {
      list.push({
        id: 'server-overload',
        name: 'Overloaded Node Transit',
        status: 'warning',
        details: `Currently bound to ${selectedServer.city} which has a load of ${selectedServer.load}%. Moving to lower-load node will reduce jitter.`,
        autoFixValue: 'Select Lowest-Load SOTA Server'
      });
    }

    return list;
  };

  const currentDiagnoses = getDiagnoses();

  // Run the Smart Selection context aware engine
  const runSmartSelection = () => {
    if (tuningState === 'running') return;
    
    setTuningState('running');
    setEtaSeconds(8);
    setCurrentStepIndex(0);
    setFailurePhase('');
    setFixedByTroubleshoot([]);
    setLogs(['[SYSTEM] Initializing Alien SOTA Smart Select Engine v4.0...', '[INFO] Acquiring real-time application runtime metrics...']);

    let step = 0;
    const runNextStep = () => {
      if (step >= tuningSteps.length) {
        // Complete successfully! Apply auto-tuning modifications to the React State!
        applyOptimalSettings();
        setTuningState('completed');
        return;
      }

      setCurrentStepIndex(step);
      const currentStep = tuningSteps[step];
      
      // Inject logs
      setLogs(prev => [...prev, `[PROBE] ${currentStep.name}: ${currentStep.log}`]);

      // If simulated DPI interception is turned on, trigger failure at Step 2 (DPI simulation)
      if (simulateDpiProbeInterception && step === 2) {
        setTimeout(() => {
          setFailurePhase('DPI_INTERCEPT');
          setTuningState('failed');
          setLogs(prev => [
            ...prev,
            `[FATAL] DPI INTERCEPTION THREAT AT STEP ${step + 1}: ${currentStep.name}`,
            `[ALERT] MIDDLEBOX SHIELDS ACTIVE: DETECTED INJECTED RST PACKETS (TCP/443)`,
            `[ERROR] Handshake Envelope Blocked. Reassembly limits reached!`,
            `[SUGGESTION] Trigger emergency hand-shake mangling to drill through middlebox filters.`
          ]);
        }, 1500);
        return;
      }

      // Decrement ETA
      setEtaSeconds(prev => Math.max(1, prev - 1));

      setTimeout(() => {
        setLogs(prev => [...prev, `[SUCCESS] ${currentStep.name} completed successfully. Status: OPTIMAL.`]);
        step++;
        runNextStep();
      }, currentStep.duration);
    };

    runNextStep();
  };

  // Perform Settings Corrections automatically based on active ISP context data
  const applyOptimalSettings = () => {
    // 1. Select the lowest-load, lowest-latency server
    const sortedServers = [...servers].sort((a, b) => {
      if (a.load !== b.load) return a.load - b.load;
      return a.latency - b.latency;
    });
    if (sortedServers[0]) {
      setSelectedServer(sortedServers[0]);
    }

    // 2. DNS isolation
    setIsDnsLeakProtectionEnabled(true);
    setIsAntiDnsPoisoningEnabled(true);

    // 3. Stealth Obfuscation Features
    setIsPacketMorphingEnabled(true);
    setIsTimingObfuscationEnabled(true);
    setIsAlpnSpoofingEnabled(true);
    setIsYoutubeOptimizerEnabled(true);
    setIsNetworkOptimizationEnabled(true);
    setIsResilienceModeEnabled(true);

    // 4. ISP Specific Rules
    if (detectedIsp === 'MCI') {
      setProtocol('VLESS-XTLS-Reality (2026 SOTA)');
      setSniMask('google.com');
      setIsTlsFragmentationEnabled(false);
      setIsObfuscationEnabled(false);
      setIsCdnFrontingEnabled(true);
    } else if (detectedIsp === 'Irancell') {
      setProtocol('Hysteria 2 (UDP-Obfs SOTA)');
      setSniMask('bing.com');
      setIsTlsFragmentationEnabled(true);
      setIsObfuscationEnabled(true);
      setIsLengthManipulationEnabled(true);
      setIsSniPaddingEnabled(true);
    } else { // Wifi or Other
      setProtocol('WireGuard-Obfs (SOTA)');
      setSniMask('cloudflare.com');
      setIsDpiBypassEnabled(true);
      setIsChaffingEnabled(true);
      setIsMultiPathSimEnabled(true);
    }

    setRotationTimeLeft(3000);
    setStealthStatus('Optimized by Smart Select');

    // If connected or connecting, restart tunnel cleanly
    if (status === 'connected') {
      setStatus('connecting');
      setTimeout(() => {
        setStatus('connected');
      }, 1000);
    }
  };

  // Troubleshoot manual fixes when failure simulation occurs
  const applyTroubleshootFix = (type: string) => {
    if (fixedByTroubleshoot.includes(type)) return;
    setFixedByTroubleshoot(prev => [...prev, type]);

    if (type === 'FRAG') {
      setIsTlsFragmentationEnabled(true);
      setLogs(prev => [...prev, `[TROUBLESHOOT] Engaged Dynamic Handshake TLS Fragmentation. ClientHello split across dual 40-byte boundaries.`]);
    } else if (type === 'SNI') {
      setSniMask('google.com');
      setIsSniPaddingEnabled(true);
      setLogs(prev => [...prev, `[TROUBLESHOOT] Swapped SNI mask to "google.com" and injected 512-byte random zero-padding envelope.`]);
    } else if (type === 'CHAFF') {
      setIsChaffingEnabled(true);
      setIsLengthManipulationEnabled(true);
      setLogs(prev => [...prev, `[TROUBLESHOOT] Enabled active decoy chaff data injections to overwhelm DPI deep pattern detectors.`]);
    }
  };

  // Re-run scan after fixing troubleshooting matrix
  const retryAfterTroubleshoot = () => {
    // If user applied at least two troubleshoot steps, we bypass the simulated failure!
    if (fixedByTroubleshoot.length >= 2) {
      setSimulateDpiProbeInterception(false);
    }
    runSmartSelection();
  };

  return (
    <div id="smart-select-view-container" className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Banner Box */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Sparkles size={160} className="text-orange-500" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-full text-[10px] text-orange-400 font-bold uppercase tracking-widest">
              <Sparkles size={12} className="animate-pulse" />
              SOTA Context-Aware Optimizer
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight">
              SMART SELECT ENGINE <span className="text-orange-500">v4.0</span>
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              This system conducts real-time client-side analysis across all privacy modules, carrier profiles, 
              network traffic, and server latencies. When engaged, it automatically re-wires your handshake fragmentation, 
              protocol wrappers, and stealth variables to ensure an optimal connection.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl cursor-pointer hover:bg-zinc-800/80 transition-all">
              <input 
                type="checkbox"
                checked={simulateDpiProbeInterception}
                onChange={(e) => setSimulateDpiProbeInterception(e.target.checked)}
                className="accent-orange-500 rounded bg-black border-zinc-700"
              />
              <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 select-none">
                Simulate Interception Block
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Diagnostics and Controller */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Smart Tuning Actions Panel */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <h3 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-white">
                <Cpu size={16} className="text-orange-500" />
                Diagnostic Controller
              </h3>
              {tuningState === 'running' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                  <Timer size={12} className="text-orange-500 animate-spin" />
                  <span className="text-[10px] font-mono font-bold text-orange-400">
                    ETA: {etaSeconds}s
                  </span>
                </div>
              )}
            </div>

            {tuningState === 'idle' && (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-orange-500/5 border border-orange-500/20 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(249,115,22,0.1)]">
                  <Sparkles size={28} className="text-orange-500 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white uppercase tracking-wider">Ready for Diagnosis</div>
                  <div className="text-[11px] text-zinc-500 max-w-md mx-auto">
                    Smart Select will analyze {currentDiagnoses.length} non-optimal configurations and calibrate your proxy envelope dynamically.
                  </div>
                </div>
                <button
                  onClick={runSmartSelection}
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-400 text-black text-[11px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Initiate Auto-Tuning
                </button>
              </div>
            )}

            {tuningState === 'running' && (
              <div className="space-y-6 py-4">
                {/* Progress bar with countdown indicator */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="text-zinc-400">Calibration Progress</span>
                    <span className="text-orange-400">{Math.round(((currentStepIndex) / tuningSteps.length) * 100)}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-orange-600 to-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                      initial={{ width: '0%' }}
                      animate={{ width: `${((currentStepIndex + 1) / tuningSteps.length) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>

                {/* Steps tracker with high impact retro green/amber lights */}
                <div className="space-y-2 border border-zinc-900 bg-zinc-900/10 p-4 rounded-2xl">
                  {tuningSteps.map((step, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex items-center justify-between p-2 rounded-xl text-xs transition-all",
                        currentStepIndex === i ? "bg-orange-500/5 border border-orange-500/20 text-orange-400" :
                        currentStepIndex > i ? "text-emerald-400 opacity-60" : "text-zinc-600 opacity-40"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {currentStepIndex > i ? (
                          <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        ) : currentStepIndex === i ? (
                          <RefreshCw size={14} className="text-orange-400 animate-spin shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-zinc-800 shrink-0" />
                        )}
                        <span className="font-bold uppercase tracking-wider text-[10px]">{step.name}</span>
                      </div>
                      <span className="font-mono text-[9px]">
                        {currentStepIndex > i ? 'PASSED' : currentStepIndex === i ? 'PROBING...' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tuningState === 'completed' && (
              <div className="text-center py-8 space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-bold text-white uppercase tracking-wider">Tuning Sequence Complete</div>
                  <div className="text-[11px] text-zinc-400 max-w-md mx-auto">
                    Smart Select successfully mapped routing configurations to your local environment. Zero DNS leaks present. High-performance SOTA tunneling engaged.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
                  <button
                    onClick={runSmartSelection}
                    className="flex-1 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    Run Diagnosis Again
                  </button>
                  <button
                    onClick={() => {
                      setStatus('connected');
                      setStealthStatus('Smart Select Optimized');
                    }}
                    className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-400 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)] cursor-pointer"
                  >
                    Bind Active Tunnel
                  </button>
                </div>
              </div>
            )}

            {tuningState === 'failed' && (
              <div className="border border-red-500/20 bg-red-500/5 p-6 rounded-2xl space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500">
                    <XCircle size={24} className="animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider">TUNING BLOCKAGE DETECTED</h4>
                    <p className="text-[10px] text-red-300/80 leading-relaxed">
                      Middlebox active-probing was detected on Step 3 (DPI Firewall Simulation). The handshake split sequence was abruptly intercepted by simulated ISP packet filters.
                    </p>
                  </div>
                </div>

                {/* SOTA Troubleshooting Matrix */}
                <div className="bg-black/40 border border-zinc-900 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                    <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                      <Terminal size={12} className="text-orange-500" />
                      DPI Threat Troubleshooting Matrix
                    </div>
                    <span className="text-[8px] font-mono text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-900/30 uppercase font-black">
                      INTERCEPTED (ACTIVE BLOCKED)
                    </span>
                  </div>

                  <p className="text-[9px] text-zinc-500 leading-normal">
                    Apply these manual tactical bypass parameters to mutate the handshake signature and drill through active-probing blocks. Apply at least <strong>two overrides</strong> to bypass successfully.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      onClick={() => applyTroubleshootFix('FRAG')}
                      className={cn(
                        "p-3 rounded-xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer",
                        fixedByTroubleshoot.includes('FRAG') 
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                          : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400"
                      )}
                    >
                      <div className="text-[11px] font-black uppercase tracking-wider">Mangle TCP</div>
                      <div className="text-[8px] text-zinc-500 mt-1 leading-snug">
                        Splits TLS packets dynamically to render middlebox reassembly impossible.
                      </div>
                      <div className="text-[8px] font-bold mt-auto self-end">
                        {fixedByTroubleshoot.includes('FRAG') ? 'ENGAGED' : 'ENGAGE'}
                      </div>
                    </button>

                    <button
                      onClick={() => applyTroubleshootFix('SNI')}
                      className={cn(
                        "p-3 rounded-xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer",
                        fixedByTroubleshoot.includes('SNI') 
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                          : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400"
                      )}
                    >
                      <div className="text-[11px] font-black uppercase tracking-wider">SNI Spoofing</div>
                      <div className="text-[8px] text-zinc-500 mt-1 leading-snug">
                        Spoofs SNI header value as standard white-listed google domains.
                      </div>
                      <div className="text-[8px] font-bold mt-auto self-end">
                        {fixedByTroubleshoot.includes('SNI') ? 'ENGAGED' : 'ENGAGE'}
                      </div>
                    </button>

                    <button
                      onClick={() => applyTroubleshootFix('CHAFF')}
                      className={cn(
                        "p-3 rounded-xl border text-left flex flex-col justify-between h-24 transition-all cursor-pointer",
                        fixedByTroubleshoot.includes('CHAFF') 
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                          : "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400"
                      )}
                    >
                      <div className="text-[11px] font-black uppercase tracking-wider">Byte Chaffing</div>
                      <div className="text-[8px] text-zinc-500 mt-1 leading-snug">
                        Injects random decoy bytes within live handshake structures to confuse filters.
                      </div>
                      <div className="text-[8px] font-bold mt-auto self-end">
                        {fixedByTroubleshoot.includes('CHAFF') ? 'ENGAGED' : 'ENGAGE'}
                      </div>
                    </button>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      onClick={() => {
                        setTuningState('idle');
                        setFailurePhase('');
                      }}
                      className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Reset Tuner
                    </button>
                    <button
                      onClick={retryAfterTroubleshoot}
                      className="px-5 py-2 bg-red-500 hover:bg-red-400 text-black text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      Retry Diagnostics ({fixedByTroubleshoot.length}/2 Overrides Applied)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Diagnostic CLI Live Logs */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-white border-b border-zinc-900 pb-3">
              <Terminal size={16} className="text-orange-500" />
              SOTA Diagnostics Terminal
            </h3>

            <div className="bg-black/80 border border-zinc-900 rounded-2xl p-4 h-[220px] overflow-y-auto font-mono text-[9px] text-zinc-400 space-y-1.5 custom-scrollbar select-text">
              {logs.length === 0 ? (
                <div className="text-zinc-600 italic">Terminal is dormant. Initiate auto-tuning to begin probe stream...</div>
              ) : (
                logs.map((log, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      log.includes('[FATAL]') || log.includes('[ERROR]') ? 'text-red-400' :
                      log.includes('[SUCCESS]') || log.includes('[TROUBLESHOOT]') ? 'text-emerald-400' :
                      log.includes('[ALERT]') ? 'text-orange-400 animate-pulse' :
                      log.includes('[PROBE]') ? 'text-cyan-400' : 'text-zinc-400'
                    )}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Active SOTA Context Data */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Detected Network Environment */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <h3 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-white border-b border-zinc-900 pb-3">
              <Wifi size={16} className="text-orange-500" />
              Active Network Context
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl">
                <div className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Detected ISP</div>
                <div className={cn(
                  "text-base font-black uppercase mt-1",
                  detectedIsp === 'MCI' ? 'text-blue-500' : 
                  detectedIsp === 'Irancell' ? 'text-amber-500' : 
                  detectedIsp === 'Wifi' ? 'text-cyan-400' : 'text-emerald-400'
                )}>
                  {detectedIsp === 'Other' ? 'CLEAN MASK' : 
                   detectedIsp === 'Irancell' ? 'MTN IRANCELL' : 
                   detectedIsp === 'MCI' ? 'MCI NET' : 'WIFI ISP'}
                </div>
              </div>

              <div className="p-4 bg-zinc-900/50 border border-zinc-900 rounded-2xl">
                <div className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">Tunnel Active</div>
                <div className={cn(
                  "text-base font-black uppercase mt-1",
                  status === 'connected' ? 'text-emerald-400' : 
                  status === 'connecting' ? 'text-orange-400' : 'text-red-500'
                )}>
                  {status}
                </div>
              </div>
            </div>

            {/* List of Context-Aware Diagnoses */}
            <div className="space-y-3">
              <div className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">System Vulnerability Sweep</div>
              
              {currentDiagnoses.length === 0 ? (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white uppercase tracking-wider">All Clear</div>
                    <div className="text-[10px] text-zinc-400 leading-snug">
                      Your current configurations perfectly align with the SOTA protection guidelines for {detectedIsp === 'Other' ? 'Clean Networks' : `${detectedIsp} ISP`}.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
                  {currentDiagnoses.map((diag, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "p-4 border rounded-2xl space-y-2 relative overflow-hidden",
                        diag.status === 'critical' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        {diag.status === 'critical' ? (
                          <ShieldAlert size={16} className="text-red-400 mt-0.5 shrink-0" />
                        ) : (
                          <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                        )}
                        <div className="space-y-1">
                          <div className="text-xs font-black uppercase tracking-wider text-white">{diag.name}</div>
                          <p className="text-[9px] text-zinc-400 leading-relaxed">{diag.details}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* SOTA Rules Reference Box */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
            <h3 className="font-bold flex items-center gap-2 text-xs uppercase tracking-wider text-white border-b border-zinc-900 pb-3">
              <Shield size={16} className="text-orange-500" />
              SOTA Tuning Guidelines
            </h3>

            <div className="space-y-3 text-[10px] text-zinc-400 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <p>
                  <strong className="text-white uppercase tracking-wider font-bold">MCI ISP:</strong> Demands pure TCP encapsulation, specific White-listed SNI masks (`google.com`), and TLS 1.3 Reality proxying.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <p>
                  <strong className="text-white uppercase tracking-wider font-bold">Irancell ISP:</strong> Demands TLS Fragmentation, UDP Obfuscation layers, random zero-padding payload bounds, and high-performance UDP Hysteria 2 congestion wrappers.
                </p>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                <p>
                  <strong className="text-white uppercase tracking-wider font-bold">Privacy Layer:</strong> DNS Queries should be securely isolated on dynamic local loopback adapters (`10.255.0.1`) under all routing matrices.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
