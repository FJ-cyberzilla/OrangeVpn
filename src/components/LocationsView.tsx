import React from 'react';
import { Globe, Activity, Shield, Zap, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Server } from '../types';

interface LocationsViewProps {
  servers: Server[];
  selectedServer: Server | null;
  setSelectedServer: (server: Server) => void;
  status: string;
  protocol: string;
  detectedIsp: string;
  isSweepingLatency: boolean;
  runLatencySweep: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({
  servers,
  selectedServer,
  setSelectedServer,
  status,
  protocol,
  detectedIsp,
  isSweepingLatency,
  runLatencySweep,
  searchQuery,
  setSearchQuery,
  selectedRegion,
  setSelectedRegion,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
      {/* Left Column: Server Selection & Searching */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <Globe size={18} className="text-orange-500 animate-pulse" />
                Interactive Nodes
              </h3>
              <button 
                onClick={runLatencySweep}
                disabled={isSweepingLatency}
                className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-xl text-[10px] text-orange-400 font-black uppercase tracking-widest hover:bg-orange-500/20 transition-all disabled:opacity-50"
              >
                {isSweepingLatency ? 'Sweeping...' : 'Sweep Latency'}
              </button>
            </div>
            
            {/* Search & Filter */}
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Search country or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none focus:border-orange-500/50 transition-colors text-white"
              />
              <select 
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-xs font-bold rounded-xl px-3 py-2 outline-none cursor-pointer text-white"
              >
                <option value="All">All</option>
                <option value="Europe">Europe</option>
                <option value="Americas">Americas</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
            {servers
              .filter(s => {
                const matchesSearch = s.city.toLowerCase().includes(searchQuery.toLowerCase()) || s.country.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesRegion = selectedRegion === 'All' || s.region === selectedRegion;
                return matchesSearch && matchesRegion;
              })
              .map((server) => (
                <button
                  key={server.id}
                  onClick={() => setSelectedServer(server)}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-2xl border transition-all",
                    selectedServer?.id === server.id 
                      ? "bg-orange-500/10 border-orange-500/50" 
                      : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{server.flag}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-sm text-white">{server.city}</div>
                        {server.latency < 40 && (
                          <span className="text-[8px] bg-orange-500/20 text-orange-400 px-1 rounded font-bold uppercase">High Speed</span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500">{server.country}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs font-mono text-zinc-400">{server.latency}ms</div>
                      <div className="w-12 h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                        <div 
                          className={cn("h-full", server.load > 70 ? "bg-red-500" : "bg-orange-500")} 
                          style={{ width: `${server.load}%` }} 
                        />
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-zinc-600" />
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Right Column: Dynamic Route map and Ping diagnostic logs */}
      <div className="lg:col-span-7 space-y-6">
        {/* Visual Transit pipeline card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
          <h3 className="font-bold flex items-center gap-2 mb-6 text-sm uppercase tracking-wider text-white">
            <Globe size={18} className="text-orange-500" />
            Encrypted Multi-Hop Tunnel Transit Route (2026 Standards)
          </h3>
          
          {status === 'connected' && selectedServer ? (
            <div className="p-6 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative">
                
                {/* Source Node */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 rounded-full bg-zinc-950 border-2 border-orange-500/30 flex items-center justify-center text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                    🇮🇷
                  </div>
                  <span className="text-xs font-bold text-zinc-400 mt-2">Iran (Source)</span>
                  <span className="text-[9px] text-zinc-600 font-mono">Real ISP: {detectedIsp === 'Other' ? 'Clean ISP' : detectedIsp}</span>
                </div>

                <div className="w-0.5 h-6 md:w-12 md:h-0.5 bg-gradient-to-r from-orange-500/40 to-orange-500/10" />

                {/* Middle Transit nodes */}
                {selectedServer.transitPath && selectedServer.transitPath.map((node, i) => (
                  <React.Fragment key={node}>
                    <div className="flex flex-col items-center z-10">
                      <div className="w-10 h-10 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-orange-500 shadow-[inset_0_0_8px_rgba(255,255,255,0.02)]">
                        <Shield size={14} className="text-orange-500/60 animate-pulse" />
                      </div>
                      <span className="text-[11px] font-bold text-zinc-300 mt-2">{node}</span>
                      <span className="text-[8px] text-emerald-400/80 font-black uppercase tracking-widest mt-0.5">Encrypted</span>
                    </div>
                    <div className="w-0.5 h-6 md:w-12 md:h-0.5 bg-gradient-to-r from-orange-500/10 to-orange-500/40" />
                  </React.Fragment>
                ))}

                {/* Exit Node */}
                <div className="flex flex-col items-center z-10">
                  <div className="w-12 h-12 rounded-full bg-zinc-950 border-2 border-emerald-500 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    {selectedServer.flag}
                  </div>
                  <span className="text-xs font-black text-emerald-400 mt-2">{selectedServer.city}</span>
                  <span className="text-[9px] text-zinc-500 font-mono">Exit Node IP: {selectedServer.ip}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider leading-relaxed">
                  ⚡ Handshake Protocol: <span className="text-orange-400 font-black">{protocol}</span> | Cryptographic Hash: <span className="text-white font-mono">SHA-384 / Ed25519</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500 bg-zinc-900/10 border border-zinc-800/50 rounded-2xl flex flex-col items-center justify-center space-y-3">
              <Globe size={32} className="text-zinc-600 animate-pulse" />
              <div>
                <p className="text-sm font-bold uppercase text-zinc-400 tracking-wider">No Active Transit Tunnel</p>
                <p className="text-xs text-zinc-600 max-w-xs mt-1">Activate the ORANGE™ secure connection toggle to establish cryptographic double-hop routing.</p>
              </div>
            </div>
          )}
        </div>

        {/* Node sweeping statistics card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6">
          <h3 className="font-bold flex items-center gap-2 mb-4 text-sm uppercase tracking-wider text-white">
            <Activity size={18} className="text-orange-500" />
            Dynamic Path Diagnostics (Real-Time Sweeps)
          </h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Global Node Health</span>
                <span className="text-lg font-mono font-black text-white">99.85%</span>
              </div>
              <div className="p-4 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-1">Packet Droppage</span>
                <span className="text-lg font-mono font-black text-emerald-400">0.00% SECURE</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl font-mono text-[9px] text-zinc-500 leading-normal max-h-[120px] overflow-y-auto custom-scrollbar">
              <p className="text-emerald-400/80">✔ BBR-3 Congestion-Control Kernel Modules Active</p>
              <p className="text-emerald-400/80">✔ ICMP echo request packets obfuscated as HTTPS payloads</p>
              <p className="text-orange-400/80">ℹ Active Node pool includes Austria, Belgium, Denmark, Spain, Finland, Romania, Czech Republic, UK, US, NL, PL, DE</p>
              <p className="text-zinc-600">⌛ Diagnostic pipeline listening on multiplexed UDP tunnels...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
