import React, { useState } from 'react';
import { Send, ChevronRight, Cpu, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useInView } from '@/hooks/useInView';

const GadgetIllustration = () => (
  <svg viewBox="0 0 420 480" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <circle cx="210" cy="240" r="160" fill="#6426E1" fillOpacity="0.12" />
    <circle cx="290" cy="160" r="90" fill="#a78bfa" fillOpacity="0.1" />
    <circle cx="130" cy="320" r="80" fill="#06b6d4" fillOpacity="0.08" />
    <circle cx="60" cy="80" r="8" fill="#a78bfa" fillOpacity="0.5" />
    <circle cx="370" cy="340" r="6" fill="#06b6d4" fillOpacity="0.5" />
    <circle cx="350" cy="100" r="5" fill="#e879f9" fillOpacity="0.6" />
    <circle cx="80" cy="380" r="7" fill="#6426E1" fillOpacity="0.4" />
    <rect x="100" y="70" width="220" height="150" rx="10" fill="#1e1128" stroke="#6426E1" strokeWidth="2" />
    <rect x="110" y="80" width="200" height="130" rx="6" fill="#0d0717" />
    <rect x="110" y="80" width="200" height="130" rx="6" fill="url(#screenGrad)" />
    <rect x="122" y="96" width="80" height="5" rx="2.5" fill="#6426E1" fillOpacity="0.9" />
    <rect x="122" y="108" width="120" height="4" rx="2" fill="#a78bfa" fillOpacity="0.6" />
    <rect x="132" y="118" width="90" height="4" rx="2" fill="#06b6d4" fillOpacity="0.7" />
    <rect x="132" y="128" width="110" height="4" rx="2" fill="#a78bfa" fillOpacity="0.5" />
    <rect x="122" y="138" width="70" height="4" rx="2" fill="#6426E1" fillOpacity="0.8" />
    <rect x="122" y="148" width="130" height="4" rx="2" fill="#a78bfa" fillOpacity="0.4" />
    <rect x="132" y="158" width="85" height="4" rx="2" fill="#06b6d4" fillOpacity="0.6" />
    <rect x="235" y="158" width="3" height="10" rx="1" fill="#e879f9" fillOpacity="0.9" />
    <path d="M85 222 L335 222 L345 232 L75 232 Z" fill="#2a1a3e" stroke="#6426E1" strokeWidth="1.5" />
    <rect x="175" y="220" width="70" height="4" rx="2" fill="#3d2060" />
    <rect x="100" y="219" width="220" height="3" rx="1" fill="#3d2060" />
    <rect x="62" y="270" width="36" height="22" rx="4" fill="#2a1a3e" stroke="#6426E1" strokeWidth="1.5" />
    <rect x="54" y="290" width="52" height="56" rx="10" fill="#1e1128" stroke="#6426E1" strokeWidth="2" />
    <rect x="61" y="297" width="38" height="38" rx="7" fill="#0d0717" />
    <rect x="61" y="297" width="38" height="38" rx="7" fill="url(#watchGrad)" fillOpacity="0.8" />
    <text x="80" y="316" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff" fontFamily="monospace">10:42</text>
    <circle cx="80" cy="326" r="7" stroke="#6426E1" strokeWidth="2" fill="none" strokeDasharray="28 16" />
    <circle cx="80" cy="326" r="7" stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="16 28" strokeDashoffset="-28" />
    <rect x="62" y="346" width="36" height="22" rx="4" fill="#2a1a3e" stroke="#6426E1" strokeWidth="1.5" />
    <rect x="310" y="268" width="64" height="76" rx="16" fill="#1e1128" stroke="#6426E1" strokeWidth="2" />
    <rect x="310" y="302" width="64" height="2" fill="#3d2060" />
    <circle cx="342" cy="317" r="4" fill="#6426E1" fillOpacity="0.9" />
    <circle cx="342" cy="317" r="3" fill="#a78bfa" />
    <ellipse cx="330" cy="286" rx="8" ry="11" fill="#2a1a3e" />
    <ellipse cx="330" cy="286" rx="5" ry="8" fill="#0d0717" />
    <circle cx="330" cy="288" r="3" fill="#6426E1" fillOpacity="0.8" />
    <ellipse cx="354" cy="286" rx="8" ry="11" fill="#2a1a3e" />
    <ellipse cx="354" cy="286" rx="5" ry="8" fill="#0d0717" />
    <circle cx="354" cy="288" r="3" fill="#6426E1" fillOpacity="0.8" />
    <rect x="174" y="278" width="72" height="130" rx="12" fill="#1e1128" stroke="#6426E1" strokeWidth="2" />
    <rect x="180" y="288" width="60" height="108" rx="8" fill="#0d0717" />
    <rect x="180" y="288" width="60" height="108" rx="8" fill="url(#phoneGrad)" fillOpacity="0.9" />
    <rect x="200" y="286" width="20" height="6" rx="3" fill="#1e1128" />
    <rect x="188" y="302" width="14" height="14" rx="3" fill="#6426E1" fillOpacity="0.9" />
    <rect x="207" y="302" width="14" height="14" rx="3" fill="#06b6d4" fillOpacity="0.8" />
    <rect x="226" y="302" width="14" height="14" rx="3" fill="#e879f9" fillOpacity="0.8" />
    <rect x="188" y="322" width="14" height="14" rx="3" fill="#a78bfa" fillOpacity="0.7" />
    <rect x="207" y="322" width="14" height="14" rx="3" fill="#6426E1" fillOpacity="0.6" />
    <rect x="226" y="322" width="14" height="14" rx="3" fill="#06b6d4" fillOpacity="0.7" />
    <path d="M155 260 L157 255 L159 260 L164 262 L159 264 L157 269 L155 264 L150 262 Z" fill="#a78bfa" fillOpacity="0.7" />
    <path d="M275 260 L276.5 256 L278 260 L282 261.5 L278 263 L276.5 267 L275 263 L271 261.5 Z" fill="#06b6d4" fillOpacity="0.6" />
    <defs>
      <linearGradient id="screenGrad" x1="110" y1="80" x2="310" y2="210" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6426E1" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.08" />
      </linearGradient>
      <linearGradient id="watchGrad" x1="61" y1="297" x2="99" y2="335" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6426E1" stopOpacity="0.3" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.15" />
      </linearGradient>
      <linearGradient id="phoneGrad" x1="180" y1="288" x2="240" y2="396" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6426E1" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
      </linearGradient>
    </defs>
  </svg>
);

const services = [
  'Product Inquiry', 'Technical Support', 'Order Tracking',
  'Returns & Warranty', 'Bulk / Business Purchase', 'Other',
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // ── Animation refs ──────────────────────────────────────────────────────
  const { ref: headingRef, isInView: headingInView } = useInView({ threshold: 0 });
  const { ref: leftRef,    isInView: leftInView    } = useInView({ threshold: 0.05 });
  const { ref: rightRef,   isInView: rightInView   } = useInView({ threshold: 0.05 });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/contact`, formData, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.data.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', service: '', message: '' });
        setTimeout(() => setSubmitStatus('idle'), 5000);
      } else {
        throw new Error(response.data.error || 'Failed to send message');
      }
    } catch (err) {
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full pl-10 pr-4 py-3 border border-[#ede8fb] rounded-xl text-sm font-[DM_Sans,sans-serif] text-[#0f0a1e] bg-[#faf9ff] outline-none transition-all focus:border-[#6426E1] focus:ring-2 focus:ring-[#6426E1]/10 placeholder:text-[#c4b8e8]";

  return (
    <div className="min-h-screen bg-[#faf9ff]" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Syne:wght@600;700;800&display=swap');
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:.6; } 50% { opacity:1; } }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">

        {/* ── Heading ──────────────────────────────────────────────────── */}
        <div
          ref={headingRef}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 items-end mb-8 sm:mb-12 transition-all duration-700 ease-out"
          style={{
            opacity: headingInView ? 1 : 0,
            transform: headingInView ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#6426E1]" />
              <span className="text-xs font-semibold text-[#6426E1] tracking-wider uppercase">Contact Us</span>
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: '#0f0a1e', lineHeight: 1.15, letterSpacing: '-0.02em' }}>
              Get In Touch<br />with Us
            </h1>
          </div>
          <div className="sm:text-right sm:flex sm:justify-end">
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-xs">
              Have a question about a gadget, need help with an order, or want to explore bulk pricing? We're ready to help.
            </p>
          </div>
        </div>

        {/* ── Main grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">

          {/* LEFT: Visual Card */}
          <div
            ref={leftRef}
            className="relative rounded-3xl overflow-hidden flex flex-col order-2 lg:order-1 transition-all duration-700 ease-out"
            style={{
              background: 'linear-gradient(135deg, #0f0a1e 0%, #1a0f35 50%, #0d1a2e 100%)',
              minHeight: '400px',
              opacity: leftInView ? 1 : 0,
              transform: leftInView ? "translateX(0)" : "translateX(-28px)",
            }}
          >
            {/* Illustration */}
            <div className="hidden sm:flex flex-1 items-center justify-center px-8 py-6">
              <div className="w-full max-w-xs">
                <GadgetIllustration />
              </div>
            </div>

            {/* Mobile compact banner */}
            <div className="sm:hidden flex items-center justify-center py-8 px-6">
              <div className="text-center text-white">
                <div className="text-4xl mb-3">📱💻⌚</div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }} className="text-xl text-white mb-1">
                  Aby Gadgets Support
                </h3>
                <p className="text-white/60 text-sm">We're here to help you</p>
              </div>
            </div>

            {/* Bottom overlay */}
            <div
              className="p-5 sm:p-7"
              style={{ background: 'rgba(100,38,225,0.15)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(100,38,225,0.25)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-[#a78bfa]" />
                <span className="text-xs font-semibold tracking-widest uppercase text-[#c4a8ff]">Direct Support</span>
              </div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }} className="text-lg sm:text-xl text-white mb-1.5 leading-tight">
                Prefer to Talk Directly?
              </p>
              <p className="text-xs sm:text-sm text-white/55 mb-4 leading-relaxed">
                Get instant support for urgent inquiries or quick questions.
              </p>
              <a
                href="https://wa.me/2348012345678?text=Hello%2C%20I%20have%20an%20enquiry%20about%20Aby%20Gadgets"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 sm:gap-3 bg-white text-[#0f0a1e] text-sm font-bold px-4 sm:px-5 py-2.5 sm:py-3 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5 hover:shadow-[#6426E1]/20"
              >
                <span className="w-7 h-7 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="#ffffff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.855L.057 23.882l6.221-1.453A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.359-.213-3.694.863.916-3.582-.234-.369A9.793 9.793 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                  </svg>
                </span>
                Chat on WhatsApp
                <ChevronRight size={14} />
              </a>
            </div>
          </div>

          {/* RIGHT: Form Card */}
          <div
            ref={rightRef}
            className="bg-white rounded-3xl border border-[#ede8fb] p-5 sm:p-8 shadow-sm order-1 lg:order-2 transition-all duration-700 ease-out delay-100"
            style={{
              boxShadow: '0 4px 40px rgba(100, 38, 225, 0.08)',
              opacity: rightInView ? 1 : 0,
              transform: rightInView ? "translateX(0)" : "translateX(28px)",
            }}
          >
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }} className="text-xl sm:text-2xl text-[#0f0a1e] mb-1">
              Send Us a Message
            </p>
            <p className="text-sm text-gray-400 mb-6">We'll get back to you within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6426E1]/40 pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </span>
                  <input className={inputClass} name="name" type="text" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Email</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6426E1]/40 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                    </span>
                    <input className={inputClass} name="email" type="email" placeholder="your@email.com" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#374151] mb-1.5">Phone</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6426E1]/40 pointer-events-none">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91A16 16 0 0 0 15 15.91l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </span>
                    <input className={inputClass} name="phone" type="tel" placeholder="+234 ..." value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Service */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Select a Service</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6426E1]/40 pointer-events-none">
                    <Cpu size={16} />
                  </span>
                  <select
                    className={inputClass + " appearance-none pr-10"}
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                  >
                    <option value="">Choose your service</option>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6426E1]/40 pointer-events-none">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
                  </span>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-[#374151] mb-1.5">Message</label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-[#6426E1]/40 pointer-events-none">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </span>
                  <textarea
                    className={inputClass + " resize-none min-h-[100px] sm:min-h-[110px]"}
                    name="message"
                    placeholder="Enter your message..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={4}
                    required
                  />
                </div>
              </div>

              {/* Submit — primary color #6426E1 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-3.5 sm:py-4 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] hover:opacity-90 hover:scale-[1.01]"
                style={{ backgroundColor: '#6426E1' }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Sending…
                  </>
                ) : (
                  <>
                    Send Message
                    <span className="w-7 h-7 bg-white/15 rounded-full flex items-center justify-center">
                      <ChevronRight size={14} />
                    </span>
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="px-4 py-3 rounded-xl text-sm font-medium text-center bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534]" style={{ animation: 'fadeUp 0.3s ease' }}>
                  ✓ Message sent! We'll be in touch soon.
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="px-4 py-3 rounded-xl text-sm font-medium text-center bg-[#fdf4ff] border border-[#e9d5ff] text-[#6426E1]" style={{ animation: 'fadeUp 0.3s ease' }}>
                  ✗ Something went wrong. Please try again.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;