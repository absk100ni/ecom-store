// Shared Razorpay checkout flow — used by checkout page and order retry.
import * as api from '../services/api';
import { STORE_NAME } from '../config/constants';
import toast from 'react-hot-toast';

declare global {
  interface Window { Razorpay: any; }
}

interface RazorpayPayData {
  razorpay_key_id: string;
  razorpay_order_id: string;
  amount: number;
  currency?: string;
}

interface OpenRazorpayOpts {
  payData: RazorpayPayData;
  orderId: string;
  orderNumber: string;
  prefillName?: string;
  prefillPhone?: string;
  guestToken?: string;
  onSuccess: () => void;
  onDismiss: () => void;
  onVerifyFail: () => void;
}

/** Open the Razorpay modal for a given payment payload. */
export function openRazorpayModal(opts: OpenRazorpayOpts) {
  const { payData, orderId, orderNumber, prefillName, prefillPhone, guestToken, onSuccess, onDismiss, onVerifyFail } = opts;
  const options = {
    key: payData.razorpay_key_id,
    amount: payData.amount,
    currency: payData.currency || 'INR',
    name: STORE_NAME,
    description: `Order #${orderNumber}`,
    order_id: payData.razorpay_order_id,
    prefill: { name: prefillName || '', contact: prefillPhone || '' },
    theme: { color: '#4F46E5' },
    handler: async (response: any) => {
      try {
        if (guestToken) {
          await api.guestVerifyPayment({
            order_id: orderId,
            guest_token: guestToken,
            gateway: 'razorpay',
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        } else {
          await api.verifyPayment({
            gateway: 'razorpay',
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        }
        toast.success('🎉 Payment successful! Order confirmed.');
        onSuccess();
      } catch {
        toast.error('Payment verification failed. Please contact support.');
        onVerifyFail();
      }
    },
    modal: {
      ondismiss: () => {
        onDismiss();
      },
    },
  };
  const rzp = new window.Razorpay(options);
  rzp.open();
}

/** Full retry flow: create payment → open Razorpay modal.
 *  Returns false if the gateway wasn't Razorpay (caller should handle). */
export async function retryRazorpayPayment(
  orderId: string,
  orderNumber: string,
  callbacks: { onSuccess: () => void; onDismiss: () => void; onVerifyFail: () => void },
  guestToken?: string
): Promise<boolean> {
  const payRes = guestToken
    ? await api.guestCreatePayment(orderId, guestToken)
    : await api.createPayment(orderId);
  const payData = payRes.data;
  if (payData.gateway === 'razorpay' && payData.razorpay_key_id) {
    openRazorpayModal({
      payData,
      orderId,
      orderNumber,
      guestToken,
      ...callbacks,
    });
    return true;
  }
  return false;
}
