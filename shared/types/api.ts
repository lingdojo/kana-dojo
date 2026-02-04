export interface ApiErrorResponse {
  code: string;
  message: string;
  status: number;
  retryAfter?: number;
  error?: string;
}
