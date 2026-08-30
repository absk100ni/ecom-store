import { useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, ArrowLeft, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

// Module-level cache: one loadStripe promise per publishable key
const stripeCache: Record<string, Promise<Stripe | null>> = {};
function getStripe(publishableKey: string) {
  if (!stripeCache[publishableKey]) {
    stripeCache[publishableKey] = loadStripe(publishableKey);
  }
  return stripeCache[publishableKey];
}

interface StripePaymentFormProps {
  clientSecret: string;
  publishableKey: string;
  amount: number; // paise
  onSuccess: (paymentIntentId: string) => void;
  onCancel: () => void;
}

function CheckoutForm({ amount, onSuccess, onCancel }: Pick<StripePaymentFormProps, 'amount' | 'onSuccess' | 'onCancel'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message || 'Payment failed. Please try again.');
        setProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // 3DS handled by Stripe — confirmPayment resolves after authentication
        toast.error('Additional authentication required. Please try again.');
        setProcessing(false);
      } else {
        toast.error('Payment not completed. Please try again.');
        setProcessing(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred.');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
        ) : (
          <><Lock className="w-4 h-4" /> Pay ₹{(amount / 100).toLocaleString('en-IN')}</>
        )}
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={processing}
        className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Cancel & go back
      </button>
    </form>
  );
}

export default function StripePaymentForm({ clientSecret, publishableKey, amount, onSuccess, onCancel }: StripePaymentFormProps) {
  const stripePromise = getStripe(publishableKey);

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 mb-5">
        <Lock className="w-4 h-4 text-green-600" />
        <span className="text-sm font-medium text-gray-700">Secure payment powered by Stripe</span>
      </div>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#0284c7',
              fontFamily: 'Inter, system-ui, sans-serif',
              borderRadius: '0.75rem',
            },
          },
        }}
      >
        <CheckoutForm amount={amount} onSuccess={onSuccess} onCancel={onCancel} />
      </Elements>
    </div>
  );
}
