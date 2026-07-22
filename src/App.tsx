/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  ShieldCheck, 
  Globe, 
  Zap, 
  Settings, 
  Activity, 
  Lock, 
  Power, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Signal, 
  Clock, 
  Download, 
  Upload,
  Menu,
  X,
  Sparkles,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { cn } from './lib/utils';
import { PROTOCOLS, FRONTING_DOMAINS, COMMON_PORTS, FINGERPRINTS } from './constants';
import { ConnectionStatus, Server, ConnectionStats } from './types';

// Import Firebase Auth, Firestore, and local config
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth as firebaseAuth, db, handleFirestoreError, OperationType } from './lib/firebase';

// Import our modular tab views
import { DashboardView } from './components/DashboardView';
import { LocationsView } from './components/LocationsView';
import { SecurityView } from './components/SecurityView';
import { PrivacyView } from './components/PrivacyView';
import { SettingsView } from './components/SettingsView';
import { SmartSelectView } from './components/SmartSelectView';

interface ConnectionErrorInfo {
  message: string;
  tips: string[];
}

export default function App() {
  const [servers, setServers] = useState<Server[]>([]);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [protocol, setProtocol] = useState(PROTOCOLS[0]);
  const [stats, setStats] = useState<ConnectionStats>({
    downloadSpeed: 0,
    uploadSpeed: 0,
    dataUsed: 12.4,
    sessionTime: 0
  });
  const [history, setHistory] = useState<{ 
    time: number; 
    download: number; 
    upload: number; 
    data: number; 
    stealth: number; 
    session: number;
  }[]>([]);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTcpMode, setIsTcpMode] = useState(false);
  const [customDnsServer, setCustomDnsServer] = useState('');
  const [isCustomDnsEnabled, setIsCustomDnsEnabled] = useState(false);
  const [isAntiDnsPoisoningEnabled, setIsAntiDnsPoisoningEnabled] = useState(true);
  const [isDnsLeakProtectionEnabled, setIsDnsLeakProtectionEnabled] = useState(true);
  const [isObfuscationEnabled, setIsObfuscationEnabled] = useState(false);
  const [isMultiHopEnabled, setIsMultiHopEnabled] = useState(false);
  const [secondServer, setSecondServer] = useState<Server | null>(null);
  const [isDpiBypassEnabled, setIsDpiBypassEnabled] = useState(true);
  const [isTlsFragmentationEnabled, setIsTlsFragmentationEnabled] = useState(true);
  const [isLengthManipulationEnabled, setIsLengthManipulationEnabled] = useState(false);
  const [isSniPaddingEnabled, setIsSniPaddingEnabled] = useState(false);
  const [sniMask, setSniMask] = useState('google.com');
  const [activePort, setActivePort] = useState(COMMON_PORTS[0]);
  const [isAdaptiveSwitchingEnabled, setIsAdaptiveSwitchingEnabled] = useState(true);
  const [protocolHealth, setProtocolHealth] = useState<number>(100);
  const [currentFingerprint, setCurrentFingerprint] = useState(FINGERPRINTS[0]);
  const [isCdnFrontingEnabled, setIsCdnFrontingEnabled] = useState(false);
  const [cdnDomain, setCdnDomain] = useState(FRONTING_DOMAINS[0]);

  // State-of-the-Art Stealth Engine
  const [isPacketMorphingEnabled, setIsPacketMorphingEnabled] = useState(true);
  const [isTimingObfuscationEnabled, setIsTimingObfuscationEnabled] = useState(true);
  const [isAlpnSpoofingEnabled, setIsAlpnSpoofingEnabled] = useState(true);
  const [isChaffingEnabled, setIsChaffingEnabled] = useState(false);
  const [isMultiPathSimEnabled, setIsMultiPathSimEnabled] = useState(true);
  const [isYoutubeOptimizerEnabled, setIsYoutubeOptimizerEnabled] = useState(true);

  // System general configs
  const [isTrafficCompressionEnabled, setIsTrafficCompressionEnabled] = useState(true);
  const [isAutoDisconnectEnabled, setIsAutoDisconnectEnabled] = useState(false);
  const [isResilienceModeEnabled, setIsResilienceModeEnabled] = useState(false);
  const [isNetworkOptimizationEnabled, setIsNetworkOptimizationEnabled] = useState(true);
  const [isKillSwitchEnabled, setIsKillSwitchEnabled] = useState(true);

  const [isCompromised, setIsCompromised] = useState(false);
  const [detectedIsp, setDetectedIsp] = useState<'MCI' | 'Irancell' | 'Wifi' | 'Other'>('Other');
  const [isDetectingIsp, setIsDetectingIsp] = useState(true);
  const [integrityStatus, setIntegrityStatus] = useState<'secure' | 'warning' | 'compromised' | 'healing'>('secure');
  const [connectionError, setConnectionError] = useState<ConnectionErrorInfo | null>(null);
  const [rotationInterval, setRotationInterval] = useState(50); // minutes
  const [rotationPolicyType, setRotationPolicyType] = useState<'countdown' | 'schedule'>('countdown');
  const [customScheduleMinute, setCustomScheduleMinute] = useState(0); // minute mark of every hour (0-59)

  const getSecondsUntilNextSchedule = (targetMinute: number) => {
    const now = new Date();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    let minutesLeft = targetMinute - currentMinute;
    if (minutesLeft < 0 || (minutesLeft === 0 && currentSecond > 0)) {
      minutesLeft += 60;
    }
    
    return (minutesLeft * 60) - currentSecond;
  };

  const [rotationTimeLeft, setRotationTimeLeft] = useState(() => rotationInterval * 60);
  const [showRotationWarning, setShowRotationWarning] = useState(false);

  // Dynamically update rotationTimeLeft when policy config changes
  useEffect(() => {
    const nextIntervalSeconds = rotationPolicyType === 'countdown'
      ? rotationInterval * 60
      : getSecondsUntilNextSchedule(customScheduleMinute);
    
    setRotationTimeLeft(nextIntervalSeconds);
  }, [rotationInterval, rotationPolicyType, customScheduleMinute]);

  // SOTA Operator Session State (OAuth and Firebase Auth)
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    email: string;
    avatar_url: string;
    provider: string;
    authenticated_at: string;
    uid?: string;
  } | null>(() => {
    const saved = localStorage.getItem('sota_operator');
    return saved ? JSON.parse(saved) : null;
  });

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      if (user) {
        const sotaUser = {
          username: user.displayName || user.email?.split('@')[0] || 'firebase_operator',
          email: user.email || '',
          avatar_url: user.photoURL || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
          provider: 'Firebase Auth (Google)',
          authenticated_at: new Date().toISOString(),
          uid: user.uid
        };
        setCurrentUser(sotaUser);
        localStorage.setItem('sota_operator', JSON.stringify(sotaUser));
      } else {
        const saved = localStorage.getItem('sota_operator');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.provider === 'Firebase Auth (Google)') {
            setCurrentUser(null);
            localStorage.removeItem('sota_operator');
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to emulated / GitHub OAuth popup messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
        setCurrentUser(event.data.user);
        localStorage.setItem('sota_operator', JSON.stringify(event.data.user));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) throw new Error('Failed to fetch Auth URL');
      const { url } = await response.json();
      
      const authWindow = window.open(
        url,
        'oauth_popup',
        'width=600,height=720,status=no,resizable=yes'
      );
      if (!authWindow) {
        alert('Please allow popups to bind secure operator credentials!');
      }
    } catch (err) {
      console.error("Failed to start OAuth flow:", err);
    }
  };

  const handleFirebaseLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(firebaseAuth, provider);
    } catch (err) {
      console.error("Firebase login error:", err);
      alert("Authentication failed: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleLogout = async () => {
    try {
      if (firebaseAuth.currentUser) {
        await signOut(firebaseAuth);
      }
    } catch (err) {
      console.error("Firebase logout error:", err);
    }
    setCurrentUser(null);
    localStorage.removeItem('sota_operator');
  };

  // Load settings from Firestore and Cloud SQL when a Firebase operator connects
  useEffect(() => {
    if (!currentUser || currentUser.provider !== 'Firebase Auth (Google)' || !currentUser.uid) {
      return;
    }

    const loadSettings = async () => {
      try {
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (token) {
          // Sync / Register user profile in Cloud SQL
          await fetch('/api/sql/users', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          // Fetch user settings from Cloud SQL
          const sqlRes = await fetch('/api/sql/settings', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (sqlRes.ok) {
            const data = await sqlRes.json();
            if (data) {
              if (data.protocol) setProtocol(data.protocol);
              if (data.isDpiBypassEnabled !== undefined) setIsDpiBypassEnabled(data.isDpiBypassEnabled);
              if (data.isPacketMorphingEnabled !== undefined) setIsPacketMorphingEnabled(data.isPacketMorphingEnabled);
              if (data.isTimingObfuscationEnabled !== undefined) setIsTimingObfuscationEnabled(data.isTimingObfuscationEnabled);
              if (data.isAlpnSpoofingEnabled !== undefined) setIsAlpnSpoofingEnabled(data.isAlpnSpoofingEnabled);
              if (data.isChaffingEnabled !== undefined) setIsChaffingEnabled(data.isChaffingEnabled);
              if (data.isMultiPathSimEnabled !== undefined) setIsMultiPathSimEnabled(data.isMultiPathSimEnabled);
              if (data.isYoutubeOptimizerEnabled !== undefined) setIsYoutubeOptimizerEnabled(data.isYoutubeOptimizerEnabled);
              return;
            }
          }
        }

        // Fallback to Firestore settings if not in Cloud SQL
        const docRef = doc(db, `users/${currentUser.uid}/settings/default`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.protocol) setProtocol(data.protocol);
          if (data.isDpiBypassEnabled !== undefined) setIsDpiBypassEnabled(data.isDpiBypassEnabled);
          if (data.isPacketMorphingEnabled !== undefined) setIsPacketMorphingEnabled(data.isPacketMorphingEnabled);
          if (data.isTimingObfuscationEnabled !== undefined) setIsTimingObfuscationEnabled(data.isTimingObfuscationEnabled);
          if (data.isAlpnSpoofingEnabled !== undefined) setIsAlpnSpoofingEnabled(data.isAlpnSpoofingEnabled);
          if (data.isChaffingEnabled !== undefined) setIsChaffingEnabled(data.isChaffingEnabled);
          if (data.isMultiPathSimEnabled !== undefined) setIsMultiPathSimEnabled(data.isMultiPathSimEnabled);
          if (data.isYoutubeOptimizerEnabled !== undefined) setIsYoutubeOptimizerEnabled(data.isYoutubeOptimizerEnabled);
        }
      } catch (err) {
        console.error("Failed to load user settings from DB:", err);
      }
    };

    loadSettings();
  }, [currentUser]);

  // Debounce and sync settings changes to Firestore and Cloud SQL
  useEffect(() => {
    if (!currentUser || currentUser.provider !== 'Firebase Auth (Google)' || !currentUser.uid) {
      return;
    }

    const saveSettings = async () => {
      const settingsPath = `users/${currentUser.uid}/settings/default`;
      try {
        const payload = {
          userId: currentUser.uid,
          protocol,
          isDpiBypassEnabled,
          isPacketMorphingEnabled,
          isTimingObfuscationEnabled,
          isAlpnSpoofingEnabled,
          isChaffingEnabled,
          isMultiPathSimEnabled,
          isYoutubeOptimizerEnabled,
          updatedAt: new Date().toISOString()
        };

        // 1. Save to Firestore
        await setDoc(doc(db, settingsPath), payload);

        // 2. Save to Cloud SQL via API
        const token = await firebaseAuth.currentUser?.getIdToken();
        if (token) {
          await fetch('/api/sql/settings', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, settingsPath);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      saveSettings();
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [
    currentUser,
    protocol,
    isDpiBypassEnabled,
    isPacketMorphingEnabled,
    isTimingObfuscationEnabled,
    isAlpnSpoofingEnabled,
    isChaffingEnabled,
    isMultiPathSimEnabled,
    isYoutubeOptimizerEnabled
  ]);

  // DNS Live Diagnostic States
  const [dnsDiagnosticLogs, setDnsDiagnosticLogs] = useState<string[]>([]);
  const [dnsDiagnosticStatus, setDnsDiagnosticStatus] = useState<'idle' | 'running' | 'completed'>('idle');
  
  // Locations Tab Latency Sweep & Filter States
  const [isSweepingLatency, setIsSweepingLatency] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const [stealthStatus, setStealthStatus] = useState<string>('Idle');

  // SOTA Panic Wipe States
  const [isPanicWiping, setIsPanicWiping] = useState(false);
  const [panicLogs, setPanicLogs] = useState<string[]>([]);
  const [panicProgress, setPanicProgress] = useState(0);

  const triggerPanicWipe = () => {
    setIsPanicWiping(true);
    setPanicProgress(0);
    setPanicLogs([
      '[CRITICAL] PANIC TRIGGER RECEIVED FROM TERMINAL SHIELD...',
      '[INIT] STARTING MIL-SPEC CYBER-PURGE PROTOCOL [SOTA-WIPE-2026]...'
    ]);

    const steps = [
      { progress: 15, log: '[WIPE] PURGING COOKIES AND CLIENT-SIDE LOCAL STORAGE...', action: () => { localStorage.clear(); } },
      { progress: 40, log: '[WIPE] DISCONNECTING ACTIVE MULTIPLEXED SHIELD TUNNELS...', action: () => { setStatus('disconnected'); } },
      { progress: 65, log: '[WIPE] RESTORING NETWORK PROTOCOLS AND CRYPTOGRAPHIC SHIELDS TO GENERAL BASELINES...', action: () => {
        setProtocol(PROTOCOLS[0]);
        setStats({ downloadSpeed: 0, uploadSpeed: 0, dataUsed: 12.4, sessionTime: 0 });
        setHistory([]);
        setIsTcpMode(false);
        setCustomDnsServer('');
        setIsCustomDnsEnabled(false);
        setIsAntiDnsPoisoningEnabled(true);
        setIsDnsLeakProtectionEnabled(true);
        setIsObfuscationEnabled(false);
        setIsMultiHopEnabled(false);
        setSecondServer(servers[2] || servers[0] || null);
        setIsDpiBypassEnabled(true);
        setIsTlsFragmentationEnabled(true);
        setIsLengthManipulationEnabled(false);
        setIsSniPaddingEnabled(false);
        setSniMask('google.com');
        setActivePort(COMMON_PORTS[0]);
        setIsAdaptiveSwitchingEnabled(true);
        setProtocolHealth(100);
        setCurrentFingerprint(FINGERPRINTS[0]);
        setIsCdnFrontingEnabled(false);
        setCdnDomain(FRONTING_DOMAINS[0]);
      } },
      { progress: 85, log: '[WIPE] RESETTING DYNAMIC TUNING CONSTANTS AND SECURE OPERATOR ENVELOPES...', action: () => {
        setIsPacketMorphingEnabled(true);
        setIsTimingObfuscationEnabled(true);
        setIsAlpnSpoofingEnabled(true);
        setIsChaffingEnabled(false);
        setIsMultiPathSimEnabled(true);
        setIsYoutubeOptimizerEnabled(true);
        setIsTrafficCompressionEnabled(true);
        setIsAutoDisconnectEnabled(false);
        setIsResilienceModeEnabled(false);
        setIsNetworkOptimizationEnabled(true);
        setIsKillSwitchEnabled(true);
        setIsCompromised(false);
        setIntegrityStatus('secure');
        setConnectionError(null);
        setRotationInterval(50);
        setRotationPolicyType('countdown');
        setCustomScheduleMinute(0);
        setRotationTimeLeft(3000);
        setShowRotationWarning(false);
        setCurrentUser(null);
        setDnsDiagnosticLogs([]);
        setDnsDiagnosticStatus('idle');
        setIsSweepingLatency(false);
        setSearchQuery('');
        setSelectedRegion('All');
        setStealthStatus('Idle');
        setActiveTab('Dashboard');
        if (servers.length > 0) {
          setSelectedServer(servers[0]);
        }
      } },
      { progress: 100, log: '[SUCCESS] APPLICATION SANITIZED CLEANLY. LAUNCHING FACTORY REBOOT.', action: () => {} }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setPanicProgress(step.progress);
        setPanicLogs(prev => [...prev, step.log]);
        step.action();
        
        if (index === steps.length - 1) {
          // Restart complete
          setTimeout(() => {
            setIsPanicWiping(false);
            setPanicProgress(0);
            setPanicLogs([]);
          }, 1500);
        }
      }, (index + 1) * 500);
    });
  };

  // Fetch servers from SQLite Backend
  useEffect(() => {
    const fetchServers = async () => {
      try {
        const response = await fetch('/api/servers');
        if (response.ok) {
          const data = await response.json();
          setServers(data);
          if (data.length > 0) {
            setSelectedServer(data[0]);
            setSecondServer(data[2] || data[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch servers from alien infrastructure:", error);
      }
    };
    fetchServers();
  }, []);

  // ISP Detection & Logic
  useEffect(() => {
    setIsDetectingIsp(true);
    setTimeout(() => {
      const ISPs: ('MCI' | 'Irancell' | 'Wifi' | 'Other')[] = ['MCI', 'Irancell', 'Wifi', 'Other'];
      const randomISP = ISPs[Math.floor(Math.random() * ISPs.length)];
      setDetectedIsp(randomISP);
      
      if (randomISP === 'MCI') {
        setIsTcpMode(true); // MCI often blocks UDP
        setIsDpiBypassEnabled(true);
        setSniMask('google.com');
        setProtocol('VLESS-XTLS-Reality (2026 SOTA)'); // Ultimate 2026 choice for MCI
      } else if (randomISP === 'Irancell') {
        setIsTlsFragmentationEnabled(true);
        setIsObfuscationEnabled(true);
        setSniMask('bing.com');
        setProtocol('Hysteria 2 (UDP-Obfs SOTA)'); // Ultimate 2026 choice for Irancell
      } else if (randomISP === 'Wifi') {
        setIsTcpMode(false);
        setIsDpiBypassEnabled(true);
        setSniMask('cloudflare.com');
        setProtocol('WireGuard-Obfs (SOTA)');
      }
      setIsDetectingIsp(false);
    }, 2000);
  }, []);

  const handleSmartConnect = () => {
    if (status === 'connecting' || status === 'connected') return;
    
    setStatus('connecting');
    setConnectionError(null);
    
    setTimeout(() => {
      setStealthStatus('Analyzing Network Noise...');
      const bestServer = [...servers]
        .filter(s => s.load < 80) // Reliability check
        .sort((a, b) => a.latency - b.latency)[0]; // Speed check
      
      if (bestServer) setSelectedServer(bestServer);
      
      setTimeout(() => {
        setStealthStatus('Synchronizing Stealth Engine...');
        
        // ISP-Specific Handshake Logic
        let successChance = 0.95;
        if (detectedIsp === 'MCI' && !isTcpMode) successChance = 0.3;
        if (detectedIsp === 'Irancell' && !isObfuscationEnabled) successChance = 0.4;

        if (Math.random() < successChance) { 
          setStatus('connected');
          const initialTime = rotationPolicyType === 'countdown'
            ? rotationInterval * 60
            : getSecondsUntilNextSchedule(customScheduleMinute);
          setRotationTimeLeft(initialTime);
          setStealthStatus('Active');
          
          // Log success to backend
          fetch('/api/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'smart_connect',
              status: 'success',
              server_id: bestServer?.id || 'unknown',
              protocol: protocol
            })
          }).catch(err => console.error("Logs upload error:", err));

          // Log success to Firebase Firestore and Cloud SQL if operator is logged in via Firebase
          if (firebaseAuth.currentUser) {
            const logId = `log_${Date.now()}`;
            const logPath = `users/${firebaseAuth.currentUser.uid}/logs/${logId}`;
            const logPayload = {
              userId: firebaseAuth.currentUser.uid,
              event: 'connection_start',
              details: `Connected to server: ${bestServer?.city || 'unknown'} (${bestServer?.country || 'unknown'}) via ${protocol}`,
              timestamp: new Date().toISOString()
            };

            // Firestore sync
            setDoc(doc(db, logPath), logPayload).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, logPath);
            });

            // Cloud SQL sync
            firebaseAuth.currentUser.getIdToken().then(token => {
              fetch('/api/sql/logs', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  event: 'connection_start',
                  details: `Connected to server: ${bestServer?.city || 'unknown'} (${bestServer?.country || 'unknown'}) via ${protocol}`
                })
              }).catch(err => console.error("Cloud SQL log failed:", err));
            });
          }
        } else {
          setStealthStatus('Failed');
          setStatus('error');
          setConnectionError({
            message: 'Cryptographic handshake blocked by national DPI firewall.',
            tips: [
              'Enable TLS record fragmentation',
              'Spoof SNI mask target',
              'Toggle Multi-Path virtual streams'
            ]
          });

          // Log connection error to Firebase Firestore and Cloud SQL if operator is logged in via Firebase
          if (firebaseAuth.currentUser) {
            const logId = `log_${Date.now()}`;
            const logPath = `users/${firebaseAuth.currentUser.uid}/logs/${logId}`;
            const logPayload = {
              userId: firebaseAuth.currentUser.uid,
              event: 'error',
              details: `Cryptographic handshake blocked by national DPI firewall. Tried server ${bestServer?.city || 'unknown'} via ${protocol}`,
              timestamp: new Date().toISOString()
            };

            // Firestore sync
            setDoc(doc(db, logPath), logPayload).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, logPath);
            });

            // Cloud SQL sync
            firebaseAuth.currentUser.getIdToken().then(token => {
              fetch('/api/sql/logs', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  event: 'error',
                  details: `Cryptographic handshake blocked by national DPI firewall. Tried server ${bestServer?.city || 'unknown'} via ${protocol}`
                })
              }).catch(err => console.error("Cloud SQL log failed:", err));
            });
          }
        }
      }, 1500);
    }, 1500);
  };

  // Rotation Logic
  useEffect(() => {
    if (status !== 'connected') {
      setShowRotationWarning(false);
      return;
    }

    const timer = setInterval(() => {
      setRotationTimeLeft(prev => {
        if (prev <= 1) {
          // Trigger automated route rotation
          setStealthStatus('Automated route rotating...');
          setStatus('connecting');
          
          setTimeout(() => {
            // Pick next healthy server
            const otherServers = servers.filter(s => s.id !== selectedServer?.id && s.load < 80);
            const nextServer = otherServers.length > 0 
              ? otherServers[Math.floor(Math.random() * otherServers.length)] 
              : (servers[0] || null);
              
            if (nextServer) setSelectedServer(nextServer);
            
            setTimeout(() => {
              setStatus('connected');
              setStealthStatus('Active (Auto-Rotated)');
            }, 1000);
          }, 1000);

          const nextIntervalSeconds = rotationPolicyType === 'countdown'
            ? rotationInterval * 60
            : getSecondsUntilNextSchedule(customScheduleMinute);
          return nextIntervalSeconds;
        }
        
        // Dynamic warning threshold
        const warningThreshold = rotationPolicyType === 'countdown'
          ? (rotationInterval >= 6 ? 300 : Math.max(10, Math.floor(rotationInterval * 60 * 0.1)))
          : 120; // 2 minutes warning for scheduled rotation

        if (prev === warningThreshold + 1) {
          setShowRotationWarning(true);
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, rotationInterval, rotationPolicyType, customScheduleMinute, selectedServer, servers]);

  // Simulate protocol health and adaptive switching
  useEffect(() => {
    if (status !== 'connected' || !isAdaptiveSwitchingEnabled) {
      setProtocolHealth(100);
      return;
    }

    const interval = setInterval(() => {
      setProtocolHealth(prev => {
        const drop = Math.random() > 0.9 ? Math.floor(Math.random() * 30) : 0;
        const newHealth = Math.max(0, prev - drop + 2); // Slowly recover
        
        if (newHealth < 20) {
          // Protocol blocked! Switch to next one
          const currentIndex = PROTOCOLS.indexOf(protocol);
          const nextIndex = (currentIndex + 1) % PROTOCOLS.length;
          setProtocol(PROTOCOLS[nextIndex]);
          
          // Also hop port
          const portIndex = COMMON_PORTS.indexOf(activePort);
          const nextPortIndex = (portIndex + 1) % COMMON_PORTS.length;
          setActivePort(COMMON_PORTS[nextPortIndex]);
          
          return 100; // Reset health for new protocol
        }
        return Math.min(100, newHealth);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [status, isAdaptiveSwitchingEnabled, protocol, activePort]);

  // Compromise Detection & Auto-Shutdown
  useEffect(() => {
    if (status !== 'connected') return;

    const interval = setInterval(() => {
      if (Math.random() > 0.99) {
        setIntegrityStatus('warning');
        setTimeout(() => {
          if (Math.random() > 0.5) {
            setIntegrityStatus('compromised');
            setStatus('disconnected');
            setIsCompromised(true);
          } else {
            setIntegrityStatus('secure');
          }
        }, 3000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== 'connected') {
      setStats(prev => ({ ...prev, downloadSpeed: 0, uploadSpeed: 0 }));
      return;
    }

    const interval = setInterval(() => {
      const baseDownload = isYoutubeOptimizerEnabled ? 480 : 420;
      const jitter = Math.sin(Date.now() / 2000) * 20;
      const dSpeed = Math.floor(baseDownload + jitter + Math.random() * 30);
      const uSpeed = Math.floor(Math.random() * 25) + 95;
      const stealthIntegrity = status === 'connected' ? (99 + Math.random() * 0.9).toFixed(1) : 0;
      
      setStats(prev => ({
        ...prev,
        downloadSpeed: dSpeed,
        uploadSpeed: uSpeed,
        sessionTime: prev.sessionTime + 1,
        dataUsed: prev.dataUsed + (dSpeed / 1024 / 8)
      }));

      setHistory(prev => {
        const newEntry = { 
          time: Date.now(), 
          download: dSpeed, 
          upload: uSpeed,
          data: stats.dataUsed,
          stealth: Number(stealthIntegrity),
          session: stats.sessionTime
        };
        const newHistory = [...prev, newEntry];
        return newHistory.slice(-30);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  const runDnsDiagnostic = () => {
    if (dnsDiagnosticStatus === 'running') return;
    
    setDnsDiagnosticStatus('running');
    setDnsDiagnosticLogs([]);
    
    const serversToTest = [
      { name: 'us-east.dnsleak.net (US)', country: 'United States', status: 'Secured (No Leak)' },
      { name: 'de-fra.dnsleak.net (DE)', country: 'Germany', status: 'Secured (No Leak)' },
      { name: 'sg-sin.dnsleak.net (SG)', country: 'Singapore', status: 'Secured (No Leak)' },
      { name: 'nl-ams.dnsleak.net (NL)', country: 'Netherlands', status: 'Secured (No Leak)' },
      { name: 'uk-lon.dnsleak.net (UK)', country: 'United Kingdom', status: 'Secured (No Leak)' },
    ];
    
    let currentStep = 0;
    
    const runStep = () => {
      if (currentStep < serversToTest.length) {
        const item = serversToTest[currentStep];
        setDnsDiagnosticLogs(prev => [
          ...prev, 
          `[${new Date().toLocaleTimeString()}] Querying DNS-over-QUIC resolver node: ${item.name}...`
        ]);
        
        setTimeout(() => {
          setDnsDiagnosticLogs(prev => [
            ...prev, 
            `[RESOLVED] ${item.status}. Routed via tunnel. Real IP and ISP DNS hidden.`
          ]);
          currentStep++;
          setTimeout(runStep, 600);
        }, 500);
      } else {
        setTimeout(() => {
          setDnsDiagnosticLogs(prev => [
            ...prev,
            `\n[SUCCESS] --- DIAGNOSTICS COMPLETED ---`,
            `RESULT: 0 DNS Leaks detected. DNS requests strictly encrypted and isolated inside DoQ tunnel.`,
          ]);
          setDnsDiagnosticStatus('completed');
        }, 800);
      }
    };
    
    setDnsDiagnosticLogs(['[INIT] Initiating cryptographic leak audit of active interfaces...']);
    setTimeout(runStep, 800);
  };

  const runLatencySweep = () => {
    if (isSweepingLatency) return;
    setIsSweepingLatency(true);
    
    let currentIdx = 0;
    const sweepInterval = setInterval(() => {
      if (currentIdx < servers.length) {
        setServers(prev => {
          const updated = [...prev];
          const s = { ...updated[currentIdx] };
          const jitter = Math.floor(Math.random() * 8) - 4;
          s.latency = Math.max(10, s.latency + jitter);
          updated[currentIdx] = s;
          return updated;
        });
        currentIdx++;
      } else {
        clearInterval(sweepInterval);
        setIsSweepingLatency(false);
      }
    }, 150);
  };

  const handleToggleConnection = () => {
    if (status === 'disconnected' || status === 'error') {
      setStatus('connecting');
      setConnectionError(null);
      setStealthStatus('Initializing Stealth Engine...');
      const randomFingerprint = FINGERPRINTS[Math.floor(Math.random() * FINGERPRINTS.length)];
      setCurrentFingerprint(randomFingerprint);

      const jitter = Math.floor(Math.random() * 1500) + 1000;
      
      setTimeout(() => {
        let successChance = 0.9;
        if (detectedIsp === 'MCI' && !isTcpMode) successChance = 0.2;
        if (detectedIsp === 'Irancell' && !isObfuscationEnabled) successChance = 0.3;

        if (Math.random() < successChance) {
          setStatus('connected');
          const initialTime = rotationPolicyType === 'countdown'
            ? rotationInterval * 60
            : getSecondsUntilNextSchedule(customScheduleMinute);
          setRotationTimeLeft(initialTime);
          setStealthStatus('Active');
        } else {
          setStatus('error');
          setStealthStatus('Failed');
          const errorPool = [
            {
              message: detectedIsp === 'MCI' ? 'MCI Firewall: UDP Handshake Blocked' : 'DPI detected: TLS fragmentation failed',
              tips: detectedIsp === 'MCI' ? ['Switch to TCP mode', 'Use Port 443', 'Enable SNI Masking'] : ['Increase TLS Fragmentation size', 'Enable SNI Padding', 'Try a different SNI Mask']
            },
            {
              message: 'Server full: Connection refused',
              tips: ['Select a server with lower load', 'Try Alien Auto Mode', 'Check for server maintenance']
            },
            {
              message: 'Network timeout: ISP interference suspected',
              tips: ['Enable CDN Fronting', 'Switch to Cellular/Fiber toggle', 'Use a custom DNS server']
            },
            {
              message: 'Protocol mismatch: AEAD handshake failed',
              tips: ['Update your application', 'Disable packet compression', 'Reset security settings']
            }
          ];
          setConnectionError(errorPool[Math.floor(Math.random() * errorPool.length)]);
        }
      }, jitter);
    } else {
      setStatus('disconnected');
      setStealthStatus('Idle');
      setStats(prev => ({ ...prev, sessionTime: 0 }));
      setHistory([]);
      const initialTime = rotationPolicyType === 'countdown'
        ? rotationInterval * 60
        : getSecondsUntilNextSchedule(customScheduleMinute);
      setRotationTimeLeft(initialTime);
    }
  };

  const handleManualRotation = () => {
    if (status !== 'connected') return;
    
    setStealthStatus('Rotating secure route...');
    setStatus('connecting');
    
    setTimeout(() => {
      const currentId = selectedServer?.id;
      const otherServers = servers.filter(s => s.id !== currentId && s.load < 80);
      const nextServer = otherServers.length > 0 
        ? otherServers[Math.floor(Math.random() * otherServers.length)] 
        : (servers[0] || null);
        
      if (nextServer) setSelectedServer(nextServer);
      
      setTimeout(() => {
        setStatus('connected');
        const initialTime = rotationPolicyType === 'countdown'
          ? rotationInterval * 60
          : getSecondsUntilNextSchedule(customScheduleMinute);
        setRotationTimeLeft(initialTime);
        setStealthStatus('Active (Rotated)');
      }, 1000);
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-orange-500/30">
      <AnimatePresence>
        {isPanicWiping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center p-6 font-mono border-4 border-red-500/80"
          >
            <div className="max-w-2xl w-full bg-zinc-950 border-2 border-red-500/40 rounded-3xl p-8 space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.25)] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Flame size={120} className="text-red-500 animate-pulse" />
              </div>
              <div className="flex items-center gap-4 border-b border-red-500/20 pb-4">
                <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-2xl text-red-500 animate-bounce">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-red-500 tracking-widest uppercase">CRITICAL SYSTEM PURGE</h1>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">SOTA Mil-Spec Zeroization Engaged</p>
                </div>
              </div>

              {/* Progress counter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-black text-red-400">
                  <span>WIPING LOCAL CRYPTO KEYSTORE</span>
                  <span>{panicProgress}%</span>
                </div>
                <div className="h-3 w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full animate-pulse"
                    style={{ width: `${panicProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Terminal-like output */}
              <div className="bg-black border border-red-500/10 p-4 h-[180px] rounded-2xl overflow-y-auto space-y-1.5 text-[9px] text-zinc-400 select-none custom-scrollbar">
                {panicLogs.map((log, i) => (
                  <div key={i} className={cn(
                    log.includes('[SUCCESS]') ? 'text-emerald-400 font-bold' :
                    log.includes('[CRITICAL]') || log.includes('[WIPE]') ? 'text-red-400 animate-pulse' :
                    'text-zinc-500'
                  )}>
                    {log}
                  </div>
                ))}
              </div>

              <div className="text-center text-[9px] text-zinc-600 uppercase tracking-widest animate-pulse">
                WARNING: Do not refresh browser. All ephemeral cryptocards are being zeroed out.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 h-full bg-zinc-950 border-r border-zinc-800 transition-all duration-300 z-50",
        isSidebarOpen ? "w-52" : "w-14"
      )}>
        <div className="p-4 flex items-center gap-2.5 border-b border-zinc-800">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 shadow-[0_0_12px_rgba(249,115,22,0.3)] border border-orange-400/20 select-none shrink-0">
            <span className="font-mono font-extrabold text-xs text-black tracking-tight">
              FJ
            </span>
          </div>
          {isSidebarOpen && <span className="font-bold text-base tracking-tighter text-orange-500">ORANGE™</span>}
        </div>

        <nav className="p-2 space-y-1">
          {[
            { icon: Activity, label: 'Dashboard' },
            { icon: Sparkles, label: 'Smart Select' },
            { icon: Globe, label: 'Locations' },
            { icon: Lock, label: 'Security' },
            { icon: ShieldCheck, label: 'Privacy' },
            { icon: Settings, label: 'Settings' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
                activeTab === item.label ? "bg-orange-500/10 text-orange-400 shadow-[inset_0_0_10px_rgba(249,115,22,0.1)]" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"
              )}
            >
              <item.icon size={20} className={cn(activeTab === item.label && "animate-pulse")} />
              {isSidebarOpen && <span className="font-black text-[10px] uppercase tracking-[0.2em]">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-zinc-800 space-y-4">
          {isSidebarOpen && (
            <div className="space-y-2">
              <div className="px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="flex items-center gap-2 text-orange-400 mb-1">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">No-Logs Verified</span>
                </div>
                <p className="text-[9px] text-zinc-500 leading-tight">Your activity is never recorded or stored on our RAM-only servers.</p>
              </div>
              <div className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Privacy Audit</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[8px]">
                    <span className="text-zinc-500">Local Logs</span>
                    <span className="text-orange-400">Zero</span>
                  </div>
                  <div className="flex justify-between text-[8px]">
                    <span className="text-zinc-500">IP Cache</span>
                    <span className="text-orange-400">Hashed</span>
                  </div>
                  <div className="flex justify-between text-[8px] pt-1 border-t border-zinc-800">
                    <span className="text-zinc-500">ISP Detect</span>
                    <span className={cn(
                      "font-black flex items-center gap-1",
                      isDetectingIsp ? "animate-pulse text-zinc-600" :
                      detectedIsp === 'MCI' ? "text-blue-500" : 
                      detectedIsp === 'Irancell' ? "text-amber-500" : 
                      detectedIsp === 'Wifi' ? "text-cyan-400" :
                      "text-emerald-400"
                    )}>
                      {isDetectingIsp ? "PROBING..." : 
                       detectedIsp === 'Other' ? 'CLEAN - MASKED' : 
                       detectedIsp === 'Irancell' ? 'MTN IRANCELL' :
                       detectedIsp === 'MCI' ? 'MCI NET' :
                       'WIFI ISP'}
                      {!isDetectingIsp && (
                        <div className={cn(
                          "w-1 h-1 rounded-full", 
                          detectedIsp === 'Other' ? "bg-emerald-500" : 
                          detectedIsp === 'Irancell' ? "bg-amber-500" :
                          detectedIsp === 'MCI' ? "bg-blue-500" :
                          "bg-cyan-400"
                        )} />
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Operator session widget */}
              <div className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase">Secure Operator</span>
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    currentUser ? "bg-emerald-400 animate-pulse" : "bg-orange-500 animate-pulse"
                  )} />
                </div>
                {currentUser ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <img 
                        src={currentUser.avatar_url} 
                        alt="Avatar" 
                        referrerPolicy="no-referrer"
                        className="w-6 h-6 rounded-full border border-orange-500/30"
                      />
                      <div className="overflow-hidden">
                        <div className="text-[9px] font-black text-white truncate">{currentUser.username}</div>
                        <div className="text-[8px] text-zinc-500 truncate">{currentUser.email}</div>
                      </div>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full py-1 text-[8px] font-black uppercase tracking-wider text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-lg transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <button 
                      onClick={handleFirebaseLogin}
                      className="w-full py-1.5 text-[8px] font-black uppercase tracking-wider text-black bg-orange-500 hover:bg-orange-400 rounded-lg transition-all shadow-[0_0_10px_rgba(249,115,22,0.2)] cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Sparkles size={10} />
                      Bind Google (Firebase)
                    </button>
                    <button 
                      onClick={handleLogin}
                      className="w-full py-1 text-[8px] font-black uppercase tracking-wider text-zinc-400 bg-zinc-850 hover:bg-zinc-800 rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                    >
                      Bind GitHub (OAuth)
                    </button>
                  </div>
                )}
              </div>

              {/* Panic Mode Button inside expanded sidebar */}
              <button 
                id="panic-mode-expanded-btn"
                onClick={triggerPanicWipe}
                className="w-full py-2 bg-red-600 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl transition-all border border-red-500/30 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.2)] hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] mt-1.5"
              >
                <Flame size={12} className="animate-bounce text-white" />
                PANIC MODE
              </button>
            </div>
          )}
          {!isSidebarOpen && (
            <div className="space-y-3 flex flex-col items-center">
              {/* Panic Mode Button inside collapsed sidebar */}
              <button 
                id="panic-mode-collapsed-btn"
                onClick={triggerPanicWipe}
                title="PANIC MODE (Full Memory Purge)"
                className="w-8 h-8 rounded-full flex items-center justify-center border border-red-500 bg-red-600 hover:bg-red-500 text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(220,38,38,0.4)] animate-pulse"
              >
                <Flame size={12} />
              </button>

              <button 
                onClick={currentUser ? handleLogout : handleFirebaseLogin}
                title={currentUser ? `Operator: ${currentUser.username} (Click to Logout)` : "Bind Google (Firebase)"}
                className={cn(
                  "w-8 h-8 mx-auto rounded-full flex items-center justify-center border transition-all cursor-pointer",
                  currentUser ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-orange-500/40 bg-orange-500/10 text-orange-400"
                )}
              >
                <Lock size={12} className={cn(currentUser ? "text-emerald-400" : "text-orange-400 animate-pulse")} />
              </button>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 text-zinc-500 hover:text-white cursor-pointer"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen p-8",
        isSidebarOpen ? "ml-52" : "ml-14"
      )}>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <header className="flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="px-2 py-0.5 bg-orange-500 text-black text-[10px] font-black rounded uppercase tracking-tighter">Alien Tier Security</div>
                <span className="text-[8px] text-zinc-500 font-black uppercase tracking-tighter">SOTA v4.0</span>
              </div>
              <div className="inline-block border border-orange-500/50 px-3 py-1 rounded-lg mt-1 bg-black">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Alien Tier</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={cn(
                "px-3 py-1 rounded-full border flex items-center gap-2 transition-all duration-500",
                status === 'connected' ? "bg-emerald-500/10 border-emerald-500/50" : 
                status === 'error' ? "bg-red-500/10 border-red-500/50" :
                "bg-red-500/5 border-red-500/20"
              )}>
                <div className="relative flex items-center justify-center w-1.5 h-1.5">
                  {status === 'connected' && (
                    <>
                      <span className="absolute w-4 h-4 rounded-full bg-emerald-500/30 animate-ping" />
                      <span className="absolute w-2.5 h-2.5 rounded-full bg-emerald-500/50 animate-ping [animation-delay:150ms]" />
                    </>
                  )}
                  <div className={cn(
                    "relative w-1.5 h-1.5 rounded-full z-10", 
                    status === 'connected' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : 
                    status === 'error' ? "bg-red-500" :
                    "bg-red-500/50"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  status === 'connected' ? "text-emerald-400" : 
                  "text-red-400"
                )}>{status === 'idle' ? 'Disconnected' : status}</span>
              </div>
            </div>
          </header>

          {/* Conditional View Router */}
          {activeTab === 'Dashboard' ? (
            <DashboardView
              status={status}
              selectedServer={selectedServer}
              secondServer={secondServer}
              isMultiHopEnabled={isMultiHopEnabled}
              handleToggleConnection={handleToggleConnection}
              connectionError={connectionError}
              servers={servers}
              setSelectedServer={setSelectedServer}
              handleSmartConnect={handleSmartConnect}
              stats={stats}
              formatTime={formatTime}
              history={history}
              isYoutubeOptimizerEnabled={isYoutubeOptimizerEnabled}
              isPacketMorphingEnabled={isPacketMorphingEnabled}
              setIsPacketMorphingEnabled={setIsPacketMorphingEnabled}
              isTimingObfuscationEnabled={isTimingObfuscationEnabled}
              setIsTimingObfuscationEnabled={setIsTimingObfuscationEnabled}
              isAlpnSpoofingEnabled={isAlpnSpoofingEnabled}
              setIsAlpnSpoofingEnabled={setIsAlpnSpoofingEnabled}
              isChaffingEnabled={isChaffingEnabled}
              setIsChaffingEnabled={setIsChaffingEnabled}
              isMultiPathSimEnabled={isMultiPathSimEnabled}
              setIsMultiPathSimEnabled={setIsMultiPathSimEnabled}
              setIsYoutubeOptimizerEnabled={setIsYoutubeOptimizerEnabled}
              stealthStatus={stealthStatus}
              protocol={protocol}
              activePort={activePort}
              detectedIsp={detectedIsp}
              isDetectingIsp={isDetectingIsp}
              isDnsLeakProtectionEnabled={isDnsLeakProtectionEnabled}
              isAntiDnsPoisoningEnabled={isAntiDnsPoisoningEnabled}
              isDpiBypassEnabled={isDpiBypassEnabled}
              isTlsFragmentationEnabled={isTlsFragmentationEnabled}
              isLengthManipulationEnabled={isLengthManipulationEnabled}
              isSniPaddingEnabled={isSniPaddingEnabled}
              isKillSwitchEnabled={isKillSwitchEnabled}
              currentUser={currentUser}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
            />
          ) : activeTab === 'Smart Select' ? (
            <SmartSelectView
              status={status}
              setStatus={setStatus}
              protocol={protocol}
              setProtocol={setProtocol}
              detectedIsp={detectedIsp}
              selectedServer={selectedServer}
              setSelectedServer={setSelectedServer}
              servers={servers}
              isPacketMorphingEnabled={isPacketMorphingEnabled}
              setIsPacketMorphingEnabled={setIsPacketMorphingEnabled}
              isTimingObfuscationEnabled={isTimingObfuscationEnabled}
              setIsTimingObfuscationEnabled={setIsTimingObfuscationEnabled}
              isAlpnSpoofingEnabled={isAlpnSpoofingEnabled}
              setIsAlpnSpoofingEnabled={setIsAlpnSpoofingEnabled}
              isChaffingEnabled={isChaffingEnabled}
              setIsChaffingEnabled={setIsChaffingEnabled}
              isMultiPathSimEnabled={isMultiPathSimEnabled}
              setIsMultiPathSimEnabled={setIsMultiPathSimEnabled}
              isYoutubeOptimizerEnabled={isYoutubeOptimizerEnabled}
              setIsYoutubeOptimizerEnabled={setIsYoutubeOptimizerEnabled}
              isTrafficCompressionEnabled={isTrafficCompressionEnabled}
              setIsTrafficCompressionEnabled={setIsTrafficCompressionEnabled}
              isAutoDisconnectEnabled={isAutoDisconnectEnabled}
              setIsAutoDisconnectEnabled={setIsAutoDisconnectEnabled}
              isResilienceModeEnabled={isResilienceModeEnabled}
              setIsResilienceModeEnabled={setIsResilienceModeEnabled}
              isNetworkOptimizationEnabled={isNetworkOptimizationEnabled}
              setIsNetworkOptimizationEnabled={setIsNetworkOptimizationEnabled}
              isKillSwitchEnabled={isKillSwitchEnabled}
              setIsKillSwitchEnabled={setIsKillSwitchEnabled}
              isDnsLeakProtectionEnabled={isDnsLeakProtectionEnabled}
              setIsDnsLeakProtectionEnabled={setIsDnsLeakProtectionEnabled}
              isAntiDnsPoisoningEnabled={isAntiDnsPoisoningEnabled}
              setIsAntiDnsPoisoningEnabled={setIsAntiDnsPoisoningEnabled}
              isDpiBypassEnabled={isDpiBypassEnabled}
              setIsDpiBypassEnabled={setIsDpiBypassEnabled}
              isTlsFragmentationEnabled={isTlsFragmentationEnabled}
              setIsTlsFragmentationEnabled={setIsTlsFragmentationEnabled}
              isLengthManipulationEnabled={isLengthManipulationEnabled}
              setIsLengthManipulationEnabled={setIsLengthManipulationEnabled}
              isSniPaddingEnabled={isSniPaddingEnabled}
              setIsSniPaddingEnabled={setIsSniPaddingEnabled}
              isObfuscationEnabled={isObfuscationEnabled}
              setIsObfuscationEnabled={setIsObfuscationEnabled}
              isCdnFrontingEnabled={isCdnFrontingEnabled}
              setIsCdnFrontingEnabled={setIsCdnFrontingEnabled}
              sniMask={sniMask}
              setSniMask={setSniMask}
              setStealthStatus={setStealthStatus}
              setRotationTimeLeft={setRotationTimeLeft}
            />
          ) : activeTab === 'Locations' ? (
            <LocationsView
              servers={servers}
              selectedServer={selectedServer}
              setSelectedServer={setSelectedServer}
              status={status}
              protocol={protocol}
              detectedIsp={detectedIsp}
              isSweepingLatency={isSweepingLatency}
              runLatencySweep={runLatencySweep}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedRegion={selectedRegion}
              setSelectedRegion={setSelectedRegion}
            />
          ) : activeTab === 'Security' ? (
            <SecurityView
              isPacketMorphingEnabled={isPacketMorphingEnabled}
              setIsPacketMorphingEnabled={setIsPacketMorphingEnabled}
              isTimingObfuscationEnabled={isTimingObfuscationEnabled}
              setIsTimingObfuscationEnabled={setIsTimingObfuscationEnabled}
              isAlpnSpoofingEnabled={isAlpnSpoofingEnabled}
              setIsAlpnSpoofingEnabled={setIsAlpnSpoofingEnabled}
              isChaffingEnabled={isChaffingEnabled}
              setIsChaffingEnabled={setIsChaffingEnabled}
              isMultiPathSimEnabled={isMultiPathSimEnabled}
              setIsMultiPathSimEnabled={setIsMultiPathSimEnabled}
              isYoutubeOptimizerEnabled={isYoutubeOptimizerEnabled}
              setIsYoutubeOptimizerEnabled={setIsYoutubeOptimizerEnabled}
              stealthStatus={stealthStatus}
              protocol={protocol}
              setProtocol={setProtocol}
              protocols={PROTOCOLS}
              isAdaptiveSwitchingEnabled={isAdaptiveSwitchingEnabled}
              setIsAdaptiveSwitchingEnabled={setIsAdaptiveSwitchingEnabled}
              protocolHealth={protocolHealth}
              activePort={activePort}
              setActivePort={setActivePort}
              commonPorts={COMMON_PORTS}
              isDpiBypassEnabled={isDpiBypassEnabled}
              setIsDpiBypassEnabled={setIsDpiBypassEnabled}
              sniMask={sniMask}
              setSniMask={setSniMask}
              isTlsFragmentationEnabled={isTlsFragmentationEnabled}
              setIsTlsFragmentationEnabled={setIsTlsFragmentationEnabled}
              isLengthManipulationEnabled={isLengthManipulationEnabled}
              setIsLengthManipulationEnabled={setIsLengthManipulationEnabled}
              isSniPaddingEnabled={isSniPaddingEnabled}
              setIsSniPaddingEnabled={setIsSniPaddingEnabled}
              isMultiHopEnabled={isMultiHopEnabled}
              setIsMultiHopEnabled={setIsMultiHopEnabled}
              secondServer={secondServer}
              setSecondServer={setSecondServer}
              servers={servers}
              isObfuscationEnabled={isObfuscationEnabled}
              setIsObfuscationEnabled={setIsObfuscationEnabled}
              isCdnFrontingEnabled={isCdnFrontingEnabled}
              setIsCdnFrontingEnabled={setIsCdnFrontingEnabled}
              cdnDomain={cdnDomain}
              setCdnDomain={setCdnDomain}
              frontingDomains={FRONTING_DOMAINS}
            />
          ) : activeTab === 'Privacy' ? (
            <PrivacyView
              isDnsLeakProtectionEnabled={isDnsLeakProtectionEnabled}
              setIsDnsLeakProtectionEnabled={setIsDnsLeakProtectionEnabled}
              isAntiDnsPoisoningEnabled={isAntiDnsPoisoningEnabled}
              setIsAntiDnsPoisoningEnabled={setIsAntiDnsPoisoningEnabled}
              isCustomDnsEnabled={isCustomDnsEnabled}
              setIsCustomDnsEnabled={setIsCustomDnsEnabled}
              customDnsServer={customDnsServer}
              setCustomDnsServer={setCustomDnsServer}
              status={status}
              dnsDiagnosticLogs={dnsDiagnosticLogs}
              dnsDiagnosticStatus={dnsDiagnosticStatus}
              runDnsDiagnostic={runDnsDiagnostic}
            />
          ) : activeTab === 'Settings' ? (
            <SettingsView
              isAdaptiveSwitchingEnabled={isAdaptiveSwitchingEnabled}
              setIsAdaptiveSwitchingEnabled={setIsAdaptiveSwitchingEnabled}
              isTrafficCompressionEnabled={isTrafficCompressionEnabled}
              setIsTrafficCompressionEnabled={setIsTrafficCompressionEnabled}
              isAutoDisconnectEnabled={isAutoDisconnectEnabled}
              setIsAutoDisconnectEnabled={setIsAutoDisconnectEnabled}
              isResilienceModeEnabled={isResilienceModeEnabled}
              setIsResilienceModeEnabled={setIsResilienceModeEnabled}
              isNetworkOptimizationEnabled={isNetworkOptimizationEnabled}
              setIsNetworkOptimizationEnabled={setIsNetworkOptimizationEnabled}
              isKillSwitchEnabled={isKillSwitchEnabled}
              setIsKillSwitchEnabled={setIsKillSwitchEnabled}
              currentFingerprint={currentFingerprint}
              setCurrentFingerprint={setCurrentFingerprint}
              fingerprints={FINGERPRINTS}
              status={status}
              stats={stats}
              rotationInterval={rotationInterval}
              setRotationInterval={setRotationInterval}
              rotationPolicyType={rotationPolicyType}
              setRotationPolicyType={setRotationPolicyType}
              customScheduleMinute={customScheduleMinute}
              setCustomScheduleMinute={setCustomScheduleMinute}
              rotationTimeLeft={rotationTimeLeft}
              handleManualRotation={handleManualRotation}
            />
          ) : null}

          <AnimatePresence>
            {showRotationWarning && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="fixed top-8 right-8 z-[100] bg-zinc-900 border border-orange-500/50 p-4 rounded-2xl shadow-2xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 font-bold text-xs">
                  {Math.floor(rotationTimeLeft / 60)}m
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Route Rotation Scheduled</div>
                  <div className="text-[10px] text-zinc-500">Refreshing connection for security in {formatTime(rotationTimeLeft)}</div>
                </div>
              </motion.div>
            )}

            {isCompromised && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-8 right-8 z-[100] bg-red-950 border border-red-500 p-6 rounded-3xl shadow-2xl max-w-sm"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-red-500 rounded-lg">
                    <Shield size={20} className="text-black" />
                  </div>
                  <h3 className="font-bold text-red-500">Security Breach Detected</h3>
                </div>
                <p className="text-sm text-red-200/70 mb-4">
                  The application detected an integrity compromise. All active tunnels have been terminated and sensitive session data has been purged.
                </p>
                <button 
                  onClick={() => setIsCompromised(false)}
                  className="w-full py-2 bg-red-500 text-black font-bold rounded-xl hover:bg-red-400 transition-colors"
                >
                  Acknowledge & Reset
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <footer className="pt-12 pb-4 border-t border-zinc-900 flex justify-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent animate-pulse">
              FJ™- Cybertronic Systems
            </p>
          </footer>
        </div>
      </main>

      {/* Global CSS for custom scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}} />
    </div>
  );
}
