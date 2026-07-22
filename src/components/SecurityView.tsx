import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, Zap, Lock, Signal, Clock, ChevronRight, Activity, TrendingUp, Info } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { cn } from '../lib/utils';
import { Server } from '../types';

interface SecurityViewProps {
  // Stealth Engine
  isPacketMorphingEnabled: boolean;
  setIsPacketMorphingEnabled: (v: boolean) => void;
  isTimingObfuscationEnabled: boolean;
  setIsTimingObfuscationEnabled: (v: boolean) => void;
  isAlpnSpoofingEnabled: boolean;
  setIsAlpnSpoofingEnabled: (v: boolean) => void;
  isChaffingEnabled: boolean;
  setIsChaffingEnabled: (v: boolean) => void;
  isMultiPathSimEnabled: boolean;
  setIsMultiPathSimEnabled: (v: boolean) => void;
  isYoutubeOptimizerEnabled: boolean;
  setIsYoutubeOptimizerEnabled: (v: boolean) => void;
  stealthStatus: string;

  // Protocols
  protocol: string;
  setProtocol: (v: string) => void;
  protocols: string[];
  isAdaptiveSwitchingEnabled: boolean;
  setIsAdaptiveSwitchingEnabled: (v: boolean) => void;
  protocolHealth: number;
  activePort: number;
  setActivePort: (v: number) => void;
  commonPorts: number[];

  // DPI Bypass
  isDpiBypassEnabled: boolean;
  setIsDpiBypassEnabled: (v: boolean) => void;
  sniMask: string;
  setSniMask: (v: string) => void;
  isTlsFragmentationEnabled: boolean;
  setIsTlsFragmentationEnabled: (v: boolean) => void;
  isLengthManipulationEnabled: boolean;
  setIsLengthManipulationEnabled: (v: boolean) => void;
  isSniPaddingEnabled: boolean;
  setIsSniPaddingEnabled: (v: boolean) => void;

  // Advanced Routing
  isMultiHopEnabled: boolean;
  setIsMultiHopEnabled: (v: boolean) => void;
  secondServer: Server | null;
  setSecondServer: (v: Server | null) => void;
  servers: Server[];
  isObfuscationEnabled: boolean;
  setIsObfuscationEnabled: (v: boolean) => void;
  isCdnFrontingEnabled: boolean;
  setIsCdnFrontingEnabled: (v: boolean) => void;
  cdnDomain: string;
  setCdnDomain: (v: string) => void;
  frontingDomains: string[];
}

export const SecurityView: React.FC<SecurityViewProps> = ({
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
  stealthStatus,

  protocol,
  setProtocol,
  protocols,
  isAdaptiveSwitchingEnabled,
  setIsAdaptiveSwitchingEnabled,
  protocolHealth,
  activePort,
  setActivePort,
  commonPorts,

  isDpiBypassEnabled,
  setIsDpiBypassEnabled,
  sniMask,
  setSniMask,
  isTlsFragmentationEnabled,
  setIsTlsFragmentationEnabled,
  isLengthManipulationEnabled,
  setIsLengthManipulationEnabled,
  isSniPaddingEnabled,
  setIsSniPaddingEnabled,

  isMultiHopEnabled,
  setIsMultiHopEnabled,
  secondServer,
  setSecondServer,
  servers,
  isObfuscationEnabled,
  setIsObfuscationEnabled,
  isCdnFrontingEnabled,
  setIsCdnFrontingEnabled,
  cdnDomain,
  setCdnDomain,
  frontingDomains,
}) => {
  // Helper to determine the peak throughput capability of each protocol standard
  const getBaseThroughput = (proto: string) => {
    if (proto.includes('Hysteria')) return 320;
    if (proto.includes('VLESS')) return 240;
    if (proto.includes('TUIC')) return 190;
    if (proto.includes('WireGuard')) return 150;
    if (proto.includes('Shadowsocks')) return 110;
    if (proto.includes('Trojan')) return 95;
    if (proto.includes('VMess')) return 85;
    return 45; // SSHv3
  };

  // Keep track of active stealth techniques
  const activeStealthCount = [
    isPacketMorphingEnabled,
    isTimingObfuscationEnabled,
    isAlpnSpoofingEnabled,
    isChaffingEnabled,
    isMultiPathSimEnabled,
    isYoutubeOptimizerEnabled
  ].filter(Boolean).length;

  // Initialize a realistic historical trend dataset to give immediate high-fidelity feedback
  const generateInitialHistory = (
    proto: string,
    isDpiBypass: boolean,
    stealthCount: number,
    healthValue: number
  ) => {
    const points = [];
    const baseThroughput = getBaseThroughput(proto);
    
    // Throttled if bypass is off and we don't have stealth techniques applied
    const isThrottled = !isDpiBypass && stealthCount < 2;
    const throttleMultiplier = isThrottled ? 0.15 : 1.0;
    const baseLoss = isThrottled ? 8.5 : 0.1;
    
    for (let i = 11; i >= 0; i--) {
      const timeLabel = i === 0 ? 'Now' : `-${i * 10}s`;
      const variance = 0.95 + Math.random() * 0.1; // realistic slight variance
      const currentThroughput = Math.round(baseThroughput * throttleMultiplier * variance);
      const lossVariance = Math.max(0, baseLoss + (Math.random() * 0.8 - 0.4) * (isThrottled ? 2.5 : 0.05));
      
      const pointHealth = i === 0 
        ? healthValue 
        : Math.min(100, Math.max(15, (isThrottled ? 45 : 95) + Math.floor(Math.random() * 8 - 4)));

      points.push({
        time: timeLabel,
        health: pointHealth,
        throughput: currentThroughput,
        packetLoss: parseFloat(lossVariance.toFixed(1)),
      });
    }
    return points;
  };

  const [chartMetric, setChartMetric] = useState<'health' | 'throughput' | 'packetLoss'>('health');
  const [history, setHistory] = useState(() => 
    generateInitialHistory(protocol, isDpiBypassEnabled, activeStealthCount, protocolHealth)
  );

  // Sync historical view immediately when user toggles central settings or updates protocol
  useEffect(() => {
    setHistory(generateInitialHistory(protocol, isDpiBypassEnabled, activeStealthCount, protocolHealth));
  }, [protocol, isDpiBypassEnabled, activeStealthCount]);

  // Push updates every few seconds to slide the live diagnostic timeline
  useEffect(() => {
    const interval = setInterval(() => {
      setHistory(prev => {
        const updated = [...prev.slice(1)];
        const baseThroughput = getBaseThroughput(protocol);
        const isThrottled = !isDpiBypassEnabled && activeStealthCount < 2;
        const throttleMultiplier = isThrottled ? 0.15 : 1.0;
        const baseLoss = isThrottled ? 8.5 : 0.1;

        const variance = 0.95 + Math.random() * 0.1;
        const currentThroughput = Math.round(baseThroughput * throttleMultiplier * variance);
        const currentLoss = Math.max(0, baseLoss + (Math.random() * 0.8 - 0.4) * (isThrottled ? 2.5 : 0.05));

        // Slide existing timelines and label appropriately
        const nextUpdated = updated.map((pt, idx) => ({
          ...pt,
          time: idx === 10 ? 'Now' : `-${(11 - idx) * 10}s`
        }));

        nextUpdated.push({
          time: 'Now',
          health: protocolHealth,
          throughput: currentThroughput,
          packetLoss: parseFloat(currentLoss.toFixed(1))
        });

        return nextUpdated;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [protocol, isDpiBypassEnabled, activeStealthCount, protocolHealth]);

  const latestPoint = history[history.length - 1] || { health: 100, throughput: 240, packetLoss: 0.1 };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Left Column: SOTA Stealth Engine & Protocol Suite */}
      <div className="lg:col-span-6 space-y-6">
        {/* Stealth Engine Section */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-white">
              <Zap size={18} className="text-orange-500" />
              Stealth Engine v4.0 (SOTA)
            </h3>
            <div className="px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest bg-orange-500/20 text-orange-400">
              {stealthStatus}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Packet Morphing', state: isPacketMorphingEnabled, setter: setIsPacketMorphingEnabled, desc: 'Mimic HTTPS/Video metadata' },
              { label: 'Timing Jitter', state: isTimingObfuscationEnabled, setter: setIsTimingObfuscationEnabled, desc: 'Randomizes packet intervals' },
              { label: 'ALPN Spoofing', state: isAlpnSpoofingEnabled, setter: setIsAlpnSpoofingEnabled, desc: 'Spoof HTTP/3 ALPN signatures' },
              { label: 'Chaff Traffic', state: isChaffingEnabled, setter: setIsChaffingEnabled, desc: 'Inject decoy packet noise' },
              { label: 'Multi-Path Sim', state: isMultiPathSimEnabled, setter: setIsMultiPathSimEnabled, desc: 'Split streams across sub-flows' },
              { label: 'YouTube Opt.', state: isYoutubeOptimizerEnabled, setter: setIsYoutubeOptimizerEnabled, desc: '4K Buffer-Free predictive cache' },
            ].map((feature) => (
              <button
                key={feature.label}
                onClick={() => feature.setter(!feature.state)}
                className={cn(
                  "p-3 rounded-2xl border text-left transition-all",
                  feature.state ? "bg-orange-500/5 border-orange-500/30" : "bg-zinc-900/30 border-zinc-800 opacity-60"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white">{feature.label}</span>
                  {feature.state && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />}
                </div>
                <div className="text-[9px] text-zinc-500 leading-tight">{feature.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Core Protocols Setup */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-white">
            <Lock size={18} className="text-orange-500" />
            Adaptive Protocol Suite
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-2">Active Protocol Standard (2026 SOTA)</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500/50 cursor-pointer"
              >
                {protocols.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-2">Target Port Mapping</label>
                <select
                  value={activePort}
                  onChange={(e) => setActivePort(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500/50 cursor-pointer"
                >
                  {commonPorts.map((port) => (
                    <option key={port} value={port}>Port {port}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-2">Adaptive Switching</label>
                <button
                  onClick={() => setIsAdaptiveSwitchingEnabled(!isAdaptiveSwitchingEnabled)}
                  className={cn(
                    "w-full py-2 px-3 border rounded-xl text-xs font-bold transition-all text-center uppercase tracking-widest",
                    isAdaptiveSwitchingEnabled 
                      ? "bg-orange-500/15 border-orange-500/30 text-orange-400" 
                      : "bg-zinc-900 border-zinc-800 text-zinc-500"
                  )}
                >
                  {isAdaptiveSwitchingEnabled ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>

            {isAdaptiveSwitchingEnabled && (
              <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-zinc-500 uppercase">Signal Stability Jitter:</span>
                  <span className={cn(
                    "font-mono",
                    protocolHealth > 50 ? "text-emerald-400" : "text-amber-500 animate-pulse"
                  )}>{protocolHealth}%</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-500", 
                      protocolHealth > 50 ? "bg-emerald-500" : "bg-amber-500"
                    )} 
                    style={{ width: `${protocolHealth}%` }} 
                  />
                </div>
                <p className="text-[8px] text-zinc-500 leading-tight">
                  Automatically hops to different protocols and ports if deep-packet-inspection interference drops signal strength below 20%.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ISP Throttling & Performance Trend Card */}
        <div id="throttling-trend-card" className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-white">
              <TrendingUp size={18} className="text-orange-500" />
              Active Protocol Performance & ISP Throttling Diagnostic
            </h3>
            <div className={cn(
              "px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider border",
              !isDpiBypassEnabled && activeStealthCount < 2
                ? "bg-red-500/10 border-red-500/20 text-red-400 animate-pulse"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            )}>
              {!isDpiBypassEnabled && activeStealthCount < 2 ? "🔴 Severe Throttling Risk" : "🟢 Throttling Bypassed"}
            </div>
          </div>

          <p className="text-[10px] text-zinc-500 leading-normal">
            Deep-packet-inspection middleboxes detect signatures and apply speed limitations. Enable <strong className="text-zinc-400">DPI Bypass</strong> and <strong className="text-zinc-400">Stealth features</strong> to evade ISP detection.
          </p>

          {/* Metric Selector and Current Readings */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'health' as const, label: 'Health Index', value: `${latestPoint.health}%`, color: 'text-orange-500', bg: 'bg-orange-500/5', border: 'border-orange-500/20' },
              { id: 'throughput' as const, label: 'Throughput', value: `${latestPoint.throughput} Mbps`, color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/20' },
              { id: 'packetLoss' as const, label: 'Packet Loss', value: `${latestPoint.packetLoss}%`, color: 'text-red-400', bg: 'bg-red-400/5', border: 'border-red-400/20' },
            ].map((metric) => (
              <button
                key={metric.id}
                id={`metric-btn-${metric.id}`}
                onClick={() => setChartMetric(metric.id)}
                className={cn(
                  "p-2.5 rounded-2xl border text-left transition-all cursor-pointer",
                  chartMetric === metric.id 
                    ? `${metric.bg} ${metric.border} border-opacity-100 scale-[1.02]` 
                    : "bg-zinc-900/20 border-zinc-800 opacity-60 hover:opacity-100"
                )}
              >
                <span className="text-[8px] text-zinc-500 uppercase font-black tracking-widest block mb-1">{metric.label}</span>
                <span className={cn("text-xs font-mono font-bold block", metric.color)}>{metric.value}</span>
              </button>
            ))}
          </div>

          {/* Recharts Line Chart Container */}
          <div className="h-[180px] w-full relative z-10 pt-2 bg-zinc-900/10 border border-zinc-900 rounded-2xl p-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161618" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#52525b" 
                  fontSize={8} 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={8} 
                  tickLine={false}
                  axisLine={false}
                  domain={chartMetric === 'health' ? [0, 100] : chartMetric === 'packetLoss' ? [0, 'auto'] : [0, 'auto']}
                  tickFormatter={(v) => chartMetric === 'health' ? `${v}%` : chartMetric === 'packetLoss' ? `${v}%` : `${v}M`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px' }}
                  labelStyle={{ color: '#a1a1aa', fontFamily: 'monospace', fontSize: '9px', fontWeight: 'bold' }}
                  itemStyle={{ fontFamily: 'monospace', fontSize: '9px', padding: 0 }}
                  formatter={(value: any) => [
                    chartMetric === 'health' ? `${value}% Health` : chartMetric === 'packetLoss' ? `${value}% Loss` : `${value} Mbps`,
                    chartMetric === 'health' ? 'Stability' : chartMetric === 'packetLoss' ? 'Packet Loss' : 'Throughput'
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey={chartMetric}
                  stroke={chartMetric === 'health' ? '#f97316' : chartMetric === 'throughput' ? '#60a5fa' : '#ef4444'}
                  strokeWidth={2}
                  dot={{ r: 2, strokeWidth: 1, fill: '#09090b' }}
                  activeDot={{ r: 4, strokeWidth: 1 }}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Instructive Overlay Alert when active throttling is simulated */}
          {!isDpiBypassEnabled && activeStealthCount < 2 ? (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-500/5 border border-red-500/10 rounded-2xl text-[9px] text-red-400 leading-normal animate-pulse">
              <Info size={14} className="shrink-0 mt-0.5 text-red-400" />
              <div>
                <strong className="uppercase tracking-wider font-black block mb-0.5">ISP Deep-Packet-Inspection Block Active</strong>
                Our diagnostic engine has caught periodic MTU fragmentation blocks and SNI target sniffing. Speed is capped and packet loss is critical. Turn on <strong className="text-white">DPI Bypass Suite</strong> to spoof the SNI and restore full performance.
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-[9px] text-emerald-400 leading-normal">
              <ShieldCheck size={14} className="shrink-0 mt-0.5 text-emerald-400 animate-bounce" />
              <div>
                <strong className="uppercase tracking-wider font-black block mb-0.5">Traffic Shield Active</strong>
                Your tunnel signature matches reputable HTTPS traffic. Handshake fragmentation and SNI padding are actively confusing ISP DPI filters. Speed, latency, and stability are running at peak physical layer levels.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: DPI Bypass & Advanced Routing */}
      <div className="lg:col-span-6 space-y-6">
        {/* DPI Bypass Suite */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-white">
              <ShieldCheck size={18} className="text-orange-500" />
              DPI Bypass Suite
            </h3>
            <button
              onClick={() => setIsDpiBypassEnabled(!isDpiBypassEnabled)}
              className={cn(
                "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                isDpiBypassEnabled 
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" 
                  : "bg-zinc-900 text-zinc-500 border border-zinc-800"
              )}
            >
              {isDpiBypassEnabled ? 'Bypass Active' : 'Bypass Paused'}
            </button>
          </div>

          {isDpiBypassEnabled && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="text-[10px] text-zinc-500 uppercase font-black tracking-widest block mb-2">SNI Masking Target</label>
                <input
                  type="text"
                  value={sniMask}
                  onChange={(e) => setSniMask(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none focus:border-orange-500/50"
                  placeholder="e.g. google.com"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {['google.com', 'bing.com', 'wikipedia.org', 'cloudflare.com'].map((domain) => (
                    <button
                      key={domain}
                      onClick={() => setSniMask(domain)}
                      className={cn(
                        "text-[9px] font-mono px-2 py-0.5 rounded transition-colors",
                        sniMask === domain ? "bg-orange-500/20 text-orange-400" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-500"
                      )}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { label: 'TLS Fragment', state: isTlsFragmentationEnabled, setter: setIsTlsFragmentationEnabled, desc: 'Split handshake' },
                  { label: 'Length Manip', state: isLengthManipulationEnabled, setter: setIsLengthManipulationEnabled, desc: 'Pad packet length' },
                  { label: 'SNI Padding', state: isSniPaddingEnabled, setter: setIsSniPaddingEnabled, desc: 'Insert dummy fields' },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => item.setter(!item.state)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all",
                      item.state ? "bg-orange-500/5 border-orange-500/30" : "bg-zinc-900/30 border-zinc-800 opacity-60"
                    )}
                  >
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white mb-1">{item.label}</div>
                    <div className="text-[8px] text-zinc-500 leading-tight">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Advanced Multi-Hop Routing */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-6">
          <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-white">
            <Shield size={18} className="text-orange-500" />
            Cryptographic Routing Tunnels
          </h3>

          <div className="space-y-4">
            {/* Multi-Hop / Double VPN */}
            <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">Cryptographic Double-Hop Routing</span>
                  <p className="text-[8px] text-zinc-500 mt-0.5">Routes traffic through two sequential exit servers (Source {"->"} Transit Node {"->"} Exit Node).</p>
                </div>
                <button
                  onClick={() => setIsMultiHopEnabled(!isMultiHopEnabled)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    isMultiHopEnabled ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-zinc-950 text-zinc-500 border border-zinc-800"
                  )}
                >
                  {isMultiHopEnabled ? 'ACTIVE' : 'OFF'}
                </button>
              </div>

              {isMultiHopEnabled && (
                <div className="pt-2 animate-in fade-in duration-300">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest block mb-2">Configure Second-Hop Exit Node</label>
                  <select
                    value={secondServer?.id || ''}
                    onChange={(e) => {
                      const found = servers.find(s => s.id === e.target.value);
                      if (found) setSecondServer(found);
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500/50 cursor-pointer"
                  >
                    <option value="" disabled>Select Second Server Location...</option>
                    {servers.map((s) => (
                      <option key={s.id} value={s.id}>{s.flag} {s.city}, {s.country} ({s.latency}ms)</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* CDN Domain Fronting */}
            <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">CDN / Domain Fronting Integration</span>
                  <p className="text-[8px] text-zinc-500 mt-0.5">Spoof network requests via reputable global CDNs to hide final destination IP.</p>
                </div>
                <button
                  onClick={() => setIsCdnFrontingEnabled(!isCdnFrontingEnabled)}
                  className={cn(
                    "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                    isCdnFrontingEnabled ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" : "bg-zinc-950 text-zinc-500 border border-zinc-800"
                  )}
                >
                  {isCdnFrontingEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              {isCdnFrontingEnabled && (
                <div className="pt-2 animate-in fade-in duration-300">
                  <label className="text-[9px] text-zinc-500 uppercase font-black tracking-widest block mb-2">Select Fronting Host CDN</label>
                  <select
                    value={cdnDomain}
                    onChange={(e) => setCdnDomain(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-orange-500/50 cursor-pointer"
                  >
                    {frontingDomains.map((domain) => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
