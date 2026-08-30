import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { BUSINESS } from '../config/business';

export default function RefundPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Refund & Return Policy - LucubraElec</title>
        <meta name="description" content={`Return and refund policy. Returns accepted within ${BUSINESS.returnWindowDays} days of delivery.`} />
      </Helmet>

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Refund Policy</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1>Refund & Return Policy</h1>
        <p className="text-sm text-gray-500">Last updated: July 2026</p>

        <h2>1. Return Window</h2>
        <p>We accept returns and replacements within <strong>{BUSINESS.returnWindowDays} days</strong> from the date of delivery. The item must be unused, in its original packaging, and with all accessories/tags intact.</p>

        <h2>2. How to Request a Return</h2>
        <ol>
          <li>Go to <strong>My Orders</strong> → select the order → click <strong>"Request Return"</strong>.</li>
          <li>Choose Return (refund) or Replacement, select items and quantity, and provide a reason.</li>
          <li>Our team will review your request within 2 business days.</li>
          <li>If approved, we will arrange a reverse pickup or provide shipping instructions.</li>
        </ol>

        <h2>3. Refund Method & Timeline</h2>
        <ul>
          <li><strong>Online payment:</strong> Refunded to the original payment method within 5–7 business days after we receive the returned item.</li>
          <li><strong>COD portion:</strong> The COD amount collected at delivery is not applicable for online refund. If the full order total was paid online (full-payment mode), the full amount is refunded.</li>
          <li><strong>Partial payment orders:</strong> Only the advance amount paid online is refunded. The COD balance (not yet collected or already returned to you at pickup) is not processed.</li>
        </ul>

        <h2>4. Non-Returnable Items</h2>
        <p>The following categories are not eligible for return/replacement unless defective on arrival:</p>
        <ul>
          <li>Items marked "Non-Returnable" on the product page.</li>
          <li>Opened software, digital products, or consumables.</li>
          <li>Items damaged due to misuse, negligence, or unauthorized modifications.</li>
        </ul>

        <h2>5. Damaged / Defective Products</h2>
        <p>If you receive a damaged or defective product, please contact us within 48 hours of delivery with photos. We will arrange a replacement or full refund at no extra cost.</p>

        <h2>6. Contact</h2>
        <p>For return/refund queries: <a href={`mailto:${BUSINESS.supportEmail}`}>{BUSINESS.supportEmail}</a> | {BUSINESS.supportPhone}</p>
      </article>
    </div>
  );
}
