import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { BUSINESS } from '../config/business';

export default function ShippingPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Shipping Policy - LucubraElec</title>
        <meta name="description" content="Shipping policy covering delivery timelines, charges, tracking, and COD availability." />
      </Helmet>

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Shipping Policy</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1>Shipping Policy</h1>
        <p className="text-sm text-gray-500">Last updated: July 2026</p>

        <h2>1. Processing Time</h2>
        <p>Orders are processed within 1–2 business days (Monday–Saturday, excluding public holidays). You will receive a confirmation SMS/email once your order is shipped.</p>

        <h2>2. Delivery Estimates</h2>
        <table>
          <thead><tr><th>Region</th><th>Estimated Delivery</th></tr></thead>
          <tbody>
            <tr><td>Metro cities (Delhi, Mumbai, Bengaluru, etc.)</td><td>3–5 business days</td></tr>
            <tr><td>Tier-2 cities</td><td>5–7 business days</td></tr>
            <tr><td>Remote / rural areas</td><td>7–10 business days</td></tr>
          </tbody>
        </table>
        <p>Delivery times are estimates and may vary due to weather, holidays, or courier delays.</p>

        <h2>3. Shipping Charges</h2>
        <ul>
          <li><strong>Free shipping</strong> on orders above ₹999.</li>
          <li>A flat shipping fee of ₹49 applies to orders below ₹999.</li>
        </ul>

        <h2>4. Cash on Delivery (COD) & Partial Payment</h2>
        <p>We offer a <strong>partial payment</strong> option on eligible orders: pay a portion online at checkout, and the balance is collected as Cash on Delivery. The exact split is clearly displayed before you confirm your order.</p>

        <h2>5. Tracking Your Order</h2>
        <p>Once shipped, you can track your order from <strong>My Orders → Order Details</strong>. The AWB number and courier partner link will be available once the shipment is dispatched.</p>

        <h2>6. Undelivered Packages</h2>
        <p>If delivery is attempted and you are unavailable, the courier will make up to 2 re-attempts. After that, the package may be returned to us. We will contact you to arrange re-dispatch (additional shipping charges may apply).</p>

        <h2>7. Contact</h2>
        <p>For shipping queries: <a href={`mailto:${BUSINESS.supportEmail}`}>{BUSINESS.supportEmail}</a> | {BUSINESS.supportPhone}</p>
      </article>
    </div>
  );
}
