import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Home, ChevronRight, Mail, Phone, MapPin, User, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { BUSINESS } from '../config/business';
import * as api from '../services/api';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!form.email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitContact(form);
      toast.success('Message sent! We\'ll get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Helmet>
        <title>Contact Us - LucubraElec</title>
        <meta name="description" content="Get in touch with LucubraElec customer support. We're here to help." />
      </Helmet>

      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary-600 flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">Contact Us</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Company Details — Rules 2020 requires prominent display */}
        <div className="lg:col-span-1 space-y-5">
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3">Company Details</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p className="font-semibold text-gray-900">{BUSINESS.legalName}</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <span>{BUSINESS.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <a href={`mailto:${BUSINESS.supportEmail}`} className="text-primary-600 hover:underline">{BUSINESS.supportEmail}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{BUSINESS.supportPhone}</span>
              </div>
              <p className="text-xs text-gray-500">GSTIN: {BUSINESS.gstin}</p>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3">Grievance Officer</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="font-medium">{BUSINESS.grievanceOfficer.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <a href={`mailto:${BUSINESS.grievanceOfficer.email}`} className="text-primary-600 hover:underline">{BUSINESS.grievanceOfficer.email}</a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{BUSINESS.grievanceOfficer.phone}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-3">Support Hours</h2>
            <p className="text-sm text-gray-700">Monday – Saturday: 9:00 AM – 7:00 PM IST</p>
            <p className="text-sm text-gray-500 mt-1">Closed on Sundays & public holidays.</p>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 card p-6">
          <h2 className="font-bold text-gray-900 mb-5">Send us a message</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input className="input-field" placeholder="Your name" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input className="input-field" placeholder="10-digit number" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} inputMode="numeric" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input className="input-field" placeholder="How can we help?" value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea className="input-field min-h-[120px] resize-y" placeholder="Describe your query in detail..."
                value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
