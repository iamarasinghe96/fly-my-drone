export interface Coordinates {
  lat: number;
  lng: number;
}

export interface FlightSubmissionData {
  license: string;
  lat: number;
  lon: number;
  from: string; // YYYY-MM-DD HH:MM
  to: string;   // YYYY-MM-DD HH:MM
  coordinates: string;
}

export interface LicenseVerificationResponse {
  result: 'success' | 'error' | 'not_found';
  [key: string]: any;
}

export interface FlightLogResponse {
  status: 'APPROVED' | 'RESTRICTED';
  reason?: string;
  warningNote?: string;
}

export interface RestrictedZone {
  lat: number;
  lng: number;
  radius: number;
  name: string;
  type?: string;
}

export interface LicenseCheckResult {
  isValid: boolean;
  message?: string;
}