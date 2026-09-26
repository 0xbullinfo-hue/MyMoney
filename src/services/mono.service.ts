import 'server-only';
import crypto from 'crypto';

export interface MonoAccountInfo {
  id: string;
  name: string;
  accountNumber: string;
  type: string;
  balance: number;
  currency: string;
  bvn?: string;
  institution: {
    name: string;
    bankCode: string;
    type: string;
  };
}

export interface MonoTransaction {
  _id: string;
  amount: number;
  type: 'debit' | 'credit';
  narration: string;
  date: string;
  balance: number;
  category?: string;
}

export interface MonoAuthResponse {
  id: string; // The permanent account id
}

class MonoService {
  private baseUrl = 'https://api.withmono.com';

  private get secretKey(): string {
    const key = process.env.MONO_SECRET_KEY;
    if (!key) {
      throw new Error('MONO_SECRET_KEY is not configured in environment.');
    }
    return key;
  }

  private get headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'mono-sec-key': this.secretKey,
    };
  }

  /**
   * Exchanges the temporary authorization code returned by Mono Connect widget
   * for a permanent Account ID.
   */
  async exchangeToken(code: string): Promise<MonoAuthResponse> {
    const response = await fetch(`${this.baseUrl}/v1/accounts/auth`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mono token exchange failed [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    return { id: data.id };
  }

  /**
   * Retrieves account information, identity, and balance.
   */
  async getAccount(accountId: string): Promise<MonoAccountInfo> {
    const response = await fetch(`${this.baseUrl}/v1/accounts/${accountId}`, {
      method: 'GET',
      headers: this.headers,
      next: { revalidate: 60 }, // Cache up to 1 minute
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mono account fetch failed [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    const account = data.account;

    return {
      id: account._id || accountId,
      name: account.name,
      accountNumber: account.accountNumber,
      type: account.type,
      balance: account.balance / 100, // Mono returns kobo for NGN in certain endpoints
      currency: account.currency,
      bvn: account.bvn,
      institution: {
        name: account.institution.name,
        bankCode: account.institution.bankCode,
        type: account.institution.type,
      },
    };
  }

  /**
   * Fetches real-time transactions for an account.
   */
  async getTransactions(
    accountId: string,
    options?: { limit?: number; paginate?: boolean }
  ): Promise<{ data: MonoTransaction[]; total: number }> {
    const limit = options?.limit ?? 50;
    const url = new URL(`${this.baseUrl}/v1/accounts/${accountId}/transactions`);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('paginate', options?.paginate ? 'true' : 'false');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mono transactions fetch failed [${response.status}]: ${errorText}`);
    }

    const res = await response.json();
    const list: MonoTransaction[] = (res.data || []).map((tx: any) => ({
      _id: tx._id,
      amount: tx.amount / 100,
      type: tx.type,
      narration: tx.narration,
      date: tx.date,
      balance: tx.balance ? tx.balance / 100 : 0,
      category: tx.category,
    }));

    return {
      data: list,
      total: res.meta?.total || list.length,
    };
  }

  /**
   * Triggers a live background sync for the linked account.
   */
  async triggerAccountSync(accountId: string): Promise<{ status: string; code: string }> {
    const response = await fetch(`${this.baseUrl}/v1/accounts/${accountId}/sync`, {
      method: 'POST',
      headers: this.headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Mono sync trigger failed [${response.status}]: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Unlinks an account on Mono.
   */
  async unlinkAccount(accountId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/v1/accounts/${accountId}/unlink`, {
      method: 'POST',
      headers: this.headers,
    });

    return response.ok;
  }

  /**
   * Validates inbound Mono webhook signature.
   * Mono signs webhooks using HMAC SHA256 of the raw body or passes `mono-webhook-secret`.
   */
  verifyWebhookSignature(headerSecret: string | null, rawBody: string): boolean {
    const configuredSecret = process.env.MONO_WEBHOOK_SECRET;
    if (!configuredSecret) {
      console.warn('[Mono Webhook] MONO_WEBHOOK_SECRET is not configured.');
      return false;
    }

    if (!headerSecret) return false;

    // Check direct secret match (timing-safe)
    const headerBuf = Buffer.from(headerSecret);
    const secretBuf = Buffer.from(configuredSecret);
    if (headerBuf.length === secretBuf.length && crypto.timingSafeEqual(headerBuf, secretBuf)) {
      return true;
    }

    // Check HMAC-SHA256 signature
    const computedHmac = crypto.createHmac('sha256', configuredSecret).update(rawBody).digest('hex');
    const computedBuf = Buffer.from(computedHmac);
    return headerBuf.length === computedBuf.length && crypto.timingSafeEqual(headerBuf, computedBuf);
  }
}

export const monoService = new MonoService();
