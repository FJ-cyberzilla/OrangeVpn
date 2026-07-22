import { Server } from './types';

export const SERVERS: Server[] = [
  { id: 'us-east', country: 'United States', city: 'New York', flag: '🇺🇸', latency: 24, load: 45, ip: '104.21.45.12', region: 'Americas', transitPath: ['Ukraine', 'Germany'] },
  { id: 'us-west', country: 'United States', city: 'Los Angeles', flag: '🇺🇸', latency: 48, load: 62, ip: '104.21.45.89', region: 'Americas', transitPath: ['Canada', 'Mexico'] },
  { id: 'uk-lon', country: 'United Kingdom', city: 'London', flag: '🇬🇧', latency: 32, load: 30, ip: '185.12.33.4', region: 'Europe', transitPath: ['Netherlands', 'Iceland'] },
  { id: 'pl-war', country: 'Poland', city: 'Warsaw', flag: '🇵🇱', latency: 42, load: 25, ip: '91.231.140.1', region: 'Europe', transitPath: ['Sweden', 'Finland'] },
  { id: 'nl-ams', country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', latency: 28, load: 38, ip: '141.105.64.12', region: 'Europe', transitPath: ['Norway', 'Denmark'] },
  { id: 'de-fra', country: 'Germany', city: 'Frankfurt', flag: '🇩🇪', latency: 35, load: 42, ip: '95.12.55.21', region: 'Europe', transitPath: ['Switzerland', 'Austria'] },
  { id: 'at-vie', country: 'Austria', city: 'Vienna', flag: '🇦🇹', latency: 38, load: 30, ip: '193.25.100.5', region: 'Europe', transitPath: ['Germany', 'Hungary'] },
  { id: 'be-bru', country: 'Belgium', city: 'Brussels', flag: '🇧🇪', latency: 32, load: 25, ip: '185.10.20.5', region: 'Europe', transitPath: ['France', 'Netherlands'] },
  { id: 'dk-cop', country: 'Denmark', city: 'Copenhagen', flag: '🇩🇰', latency: 40, load: 20, ip: '185.15.30.5', region: 'Europe', transitPath: ['Sweden', 'Germany'] },
  { id: 'es-mad', country: 'Spain', city: 'Madrid', flag: '🇪🇸', latency: 45, load: 35, ip: '185.20.40.5', region: 'Europe', transitPath: ['Portugal', 'France'] },
  { id: 'fi-hel', country: 'Finland', city: 'Helsinki', flag: '🇫🇮', latency: 50, load: 15, ip: '185.25.50.5', region: 'Europe', transitPath: ['Estonia', 'Sweden'] },
  { id: 'ro-buc', country: 'Romania', city: 'Bucharest', flag: '🇷🇴', latency: 55, load: 40, ip: '185.30.60.5', region: 'Europe', transitPath: ['Bulgaria', 'Hungary'] },
  { id: 'cz-pra', country: 'Czech Republic', city: 'Prague', flag: '🇨🇿', latency: 35, load: 28, ip: '185.35.70.5', region: 'Europe', transitPath: ['Germany', 'Slovakia'] },
];

export const FINGERPRINTS = [
  { name: 'Chrome 121', os: 'Windows 11', ciphers: 'TLS_AES_256_GCM_SHA384' },
  { name: 'Safari 17.2', os: 'iPhone 15 Pro', ciphers: 'TLS_CHACHA20_POLY1305' },
  { name: 'WebView 120', os: 'Pixel 8', ciphers: 'TLS_AES_128_GCM_SHA256' },
  { name: 'Firefox 122', os: 'macOS Sonoma', ciphers: 'TLS_AES_256_GCM_SHA384' },
  { name: 'Edge 121', os: 'Linux Ubuntu', ciphers: 'TLS_CHACHA20_POLY1305' }
];

export const PROTOCOLS = [
  'VLESS-XTLS-Reality (2026 SOTA)',
  'Hysteria 2 (UDP-Obfs SOTA)',
  'TUIC v5 (QUIC SOTA)',
  'WireGuard-Obfs (SOTA)',
  'Shadowsocks-2022 (BLAKE3)',
  'Trojan-gRPC (CDN Fronted)',
  'VMess-gRPC (V2Ray SOTA)',
  'SSHv3-Obfs (Stealth Tunnel)'
];

export const FRONTING_DOMAINS = [
  'www.google.com',
  'www.cloudflare.com',
  'cdn.akamai.com',
  'assets.microsoft.com',
  'static.facebook.com'
];

export const COMMON_PORTS = [443, 80, 53, 123, 993];
