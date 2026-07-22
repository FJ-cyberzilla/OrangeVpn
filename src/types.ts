export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface Server {
  id: string;
  country: string;
  city: string;
  flag: string;
  latency: number;
  load: number;
  ip: string;
  region?: string;
  transitPath?: string[];
}

export interface ConnectionStats {
  downloadSpeed: number;
  uploadSpeed: number;
  dataUsed: number;
  sessionTime: number;
  fingerprint?: string;
  packetMorphing?: string;
  chaffTraffic?: number;
}
