import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { BUSINESS } from '../config/business';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Privacy Policy - LucubraElec</title>
        <meta name="description" content="Privacy policy describing how LucubraElec collects, uses, and protects your personal data." />
      </Helmet>

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Privacy Policy</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1>Privacy Policy</h1>
        <p className="text-sm text-gray-500">Last updated: July 2026</p>

        <p><strong>{BUSINESS.legalName}</strong> ("{BUSINESS.legalName}", "we", "us") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.</p>

        <h2>1. Information We Collect</h2>
        <ul>
          <li><strong>Account information:</strong> Name, email address, phone number provided during registration or checkout.</li>
          <li><strong>Order information:</strong> Shipping address, order history, payment status.</li>
          <li><strong>Payment data:</strong> Payments are processed securely via Stripe/Razorpay. We <strong>never</strong> store your card number, CVV, or full card details on our servers.</li>
          <li><strong>Usage data:</strong> Pages viewed, device type, browser, IP address — collected via cookies and analytics tools (see below).</li>
        </ul>

        <h2>2. Cookies & Analytics</h2>
        <p>We use the following analytics services to improve our store:</p>
        <ul>
          <li><strong>Meta Pixel (Facebook):</strong> Tracks page views and purchase events for advertising measurement.</li>
          <li><strong>Google Analytics 4 (GA4):</strong> Measures site traffic, user behaviour, and conversion events.</li>
        </ul>
        <p>You can manage cookie preferences via your browser settings. Disabling cookies may affect site functionality.</p>

        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>Processing and delivering your orders.</li>
          <li>Communicating order updates via SMS/email.</li>
          <li>Improving our products and services.</li>
          <li>Preventing fraud and maintaining security.</li>
          <li>Legal compliance (e.g., tax records under GST).</li>
        </ul>

        <h2>4. Data Sharing</h2>
        <p>We do not sell your personal data. We share information only with:</p>
        <ul>
          <li>Payment processors (Stripe, Razorpay) for transaction processing.</li>
          <li>Shipping partners for order delivery.</li>
          <li>Analytics providers (Meta, Google) in anonymised/aggregated form.</li>
          <li>Legal authorities when required by law.</li>
        </ul>

        <h2>5. Data Retention</h2>
        <p>We retain your account and order data for as long as your account is active or as needed to provide services. Tax-related records are retained for the statutory period (currently 7 years under Indian tax law).</p>

        <h2>6. Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal data by contacting us at <a href={`mailto:${BUSINESS.supportEmail}`}>{BUSINESS.supportEmail}</a>. We will respond within 30 days.</p>

        <h2>7. Security</h2>
        <p>We use industry-standard security measures including HTTPS encryption, secure payment gateways, and access controls to protect your data.</p>

        <h2>8. Contact Us</h2>
        <p>For any privacy-related queries:</p>
        <ul>
          <li>Email: <a href={`mailto:${BUSINESS.supportEmail}`}>{BUSINESS.supportEmail}</a></li>
          <li>Phone: {BUSINESS.supportPhone}</li>
          <li>Grievance Officer: {BUSINESS.grievanceOfficer.name} — <a href={`mailto:${BUSINESS.grievanceOfficer.email}`}>{BUSINESS.grievanceOfficer.email}</a></li>
        </ul>
      </article>
    </div>
  );
}
