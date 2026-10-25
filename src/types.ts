export interface UserRecord {
  id: string;
  msisdn: string;
  displayNumber: string;
  operator: string;
  created_at: number;
  access_token: string;
  refresh_token?: string;
  isSimulated?: boolean;
}

export interface ActivationRecord {
  id: string;
  msisdn: string;
  timestamp: number;
  bundle: string;
  validity: string;
  reward: string;
  status: 'SUCCESS' | 'FAILED';
  source: string;
}

export interface DiagnosticsData {
  version: string;
  bffUrl: string;
  authUrl: string;
  xVersion: string;
  signature: string;
  proxyConfigured: boolean;
  proxyHost: string;
  endpointHealth: string;
  activeUser: string | null;
  totalActivations: number;
  telegramBot: {
    botTokenSet: boolean;
    channel: string;
    mode: string;
  };
}

export interface ActivationStep {
  id: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'failed';
}
