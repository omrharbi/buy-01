/** The error shape every service returns. `fields` routes a 400 into the field that caused it. */
export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fields?: Record<string, string>;
}

/** What the app hands to a component after an HTTP failure: never a raw status code. */
export interface FailedRequest {
  status: number;
  message: string;
  fields: Record<string, string>;
}
