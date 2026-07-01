'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'snackscout_premium';

export function useIsPremium(): boolean {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsPremium(localStorage.getItem(STORAGE_KEY) === 'true');

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setIsPremium(e.newValue === 'true');
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return isPremium;
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE PLAY BILLING — INTEGRATION GUIDE
//
// All billing logic lives in this file. When ready to wire up the real store:
//
// Prerequisites:
//   • App deployed as a TWA (Trusted Web Activity) via Bubblewrap / PWABuilder
//   • HTTPS assetlinks.json verified on your domain
//   • Play Console → Monetize → Subscriptions → create SKU: "snackscout_premium_monthly"
//   • Digital Goods API available only inside a TWA (not plain browser)
//
// Integration points are marked with // >>> GOOGLE PLAY: <action> <<<
// ─────────────────────────────────────────────────────────────────────────────

// >>> GOOGLE PLAY: On app launch, verify existing purchase receipt instead of reading localStorage.
// Replace `localStorage.getItem(STORAGE_KEY) === 'true'` with:
//
//   async function verifyExistingPurchase(): Promise<boolean> {
//     if (!('getDigitalGoodsService' in window)) return false;
//     const service = await (window as any).getDigitalGoodsService('https://play.google.com/billing');
//     const purchases = await service.listPurchases();
//     return purchases.some((p: any) => p.itemId === 'snackscout_premium_monthly');
//   }
//
// Call this in useIsPremium's useEffect instead of the localStorage read.

/**
 * Initiates a premium subscription purchase.
 *
 * Stub: simulates ~1.5 s of Play Store latency so the loading UI is testable.
 * Replace the stub body with the real implementation when wiring up billing.
 */
export async function purchasePremium(): Promise<void> {
  // >>> GOOGLE PLAY: Replace this entire block with the Digital Goods API flow.
  //
  // Step 1 — Check availability (only works inside a TWA):
  //   if (!('getDigitalGoodsService' in window)) throw new Error('Billing not available');
  //
  // Step 2 — Get the Play billing service:
  //   const service = await (window as any)
  //     .getDigitalGoodsService('https://play.google.com/billing');
  //
  // Step 3 — Fetch the SKU you created in Play Console:
  //   const [item] = await service.getDetails(['snackscout_premium_monthly']);
  //   if (!item) throw new Error('SKU not found — check Play Console');
  //
  // Step 4 — Launch the native payment sheet:
  //   const paymentRequest = new (window as any).PaymentRequest(
  //     [{ supportedMethods: 'https://play.google.com/billing', data: { sku: item.itemId } }],
  //     { total: { label: 'Total', amount: { currency: 'USD', value: '0' } } },
  //   );
  //   const response = await paymentRequest.show();
  //
  // Step 5 — Acknowledge the purchase (required within 3 days or Google refunds):
  //   await response.complete('success');
  //
  // Step 6 — (Recommended) Verify server-side to prevent fraud:
  //   await fetch('/api/verify-purchase', {
  //     method: 'POST',
  //     body: JSON.stringify({ purchaseToken: response.details.purchaseToken }),
  //   });
  //
  // Step 7 — Persist premium state via your backend / receipt instead of localStorage.
  //
  // Ref: https://developer.chrome.com/docs/android/trusted-web-activity/receive-payments-play-billing

  // STUB ↓ remove when real billing is wired
  await new Promise<void>((resolve) => setTimeout(resolve, 1500));
  localStorage.setItem(STORAGE_KEY, 'true');
  // Notify same-tab listeners (StorageEvent only fires cross-tab by default)
  window.dispatchEvent(
    new StorageEvent('storage', { key: STORAGE_KEY, newValue: 'true' }),
  );
  // STUB ↑
}
