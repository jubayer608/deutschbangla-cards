// Minimal local type declarations for the `web-push` package.
// (No @types/web-push dependency — this covers the small API surface we use.)

declare module "web-push" {
  export interface WebPushSubscription {
    endpoint: string;
    keys: { p256dh: string; auth: string };
  }

  export interface SendResult {
    statusCode: number;
    body: string;
    headers: Record<string, string>;
  }

  export interface SendOptions {
    TTL?: number;
    urgency?: "very-low" | "low" | "normal" | "high";
    topic?: string;
  }

  export class WebPushError extends Error {
    statusCode: number;
    headers: Record<string, string>;
    body: string;
    endpoint: string;
  }

  export function setVapidDetails(
    subject: string,
    publicKey: string,
    privateKey: string,
  ): void;

  export function sendNotification(
    subscription: WebPushSubscription,
    payload?: string | Buffer,
    options?: SendOptions,
  ): Promise<SendResult>;
}
