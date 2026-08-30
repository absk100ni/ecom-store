import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import { BUSINESS } from '../config/business';

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Terms of Service - LucubraElec</title>
        <meta name="description" content="Terms and conditions governing use of LucubraElec and purchase of products." />
      </Helmet>

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Terms of Service</span>
      </nav>

      <article className="prose prose-gray max-w-none">
        <h1>Terms of Service</h1>
        <p className="text-sm text-gray-500">Last updated: July 2026</p>

        <h2>1. About Us</h2>
        <p>This website is operated by <strong>{BUSINESS.legalName}</strong>, registered at {BUSINESS.address}. GSTIN: {BUSINESS.gstin}.</p>

        <h2>2. Account</h2>
        <p>You may create an account using your phone number or Google sign-in. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account.</p>

        <h2>3. Pricing</h2>
        <p>All prices displayed are in Indian Rupees (₹) and inclusive of applicable taxes unless stated otherwise. Prices are internally tracked in paise (1/100th of a rupee) for precision; the displayed rupee amount is the binding price.</p>

        <h2>4. Partial Payment & Cash on Delivery</h2>
        <p>Certain orders may be eligible for a partial-payment model: a percentage is paid online at the time of order, and the remaining balance is collected as Cash on Delivery (COD). The exact split is shown at checkout before you confirm payment.</p>

        <h2>5. Order Acceptance & Cancellation</h2>
        <p>Placing an order constitutes an offer to buy. We reserve the right to accept or reject any order (e.g., due to stock issues, pricing errors, or suspected fraud). If we cancel an accepted order, any amount paid will be refunded in full.</p>
        <p>You may cancel an unshipped order by contacting us at <a href={`mailto:${BUSINESS.supportEmail}`}>{BUSINESS.supportEmail}</a>. Once shipped, the return policy applies.</p>

        <h2>6. Intellectual Property</h2>
        <p>All content on this site — text, graphics, logos, images — is the property of {BUSINESS.legalName} or its licensors and is protected by applicable intellectual property laws.</p>

        <h2>7. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, {BUSINESS.legalName} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of this site or purchase of products. Our total liability for any claim shall not exceed the amount you paid for the specific order giving rise to the claim.</p>

        <h2>8. Governing Law & Dispute Resolution</h2>
        <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.</p>

        <h2>9. Changes</h2>
        <p>We may update these terms from time to time. Continued use of the site after changes constitutes acceptance.</p>

        <h2>10. Contact</h2>
        <p>Email: <a href={`mailto:${BUSINESS.supportEmail}`}>{BUSINESS.supportEmail}</a> | Phone: {BUSINESS.supportPhone}</p>
      </article>
    </div>
  );
}
