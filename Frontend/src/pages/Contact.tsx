import React, { useState } from 'react';
import { Send, ChevronRight, Cpu } from 'lucide-react';
import axios from 'axios';

const GadgetIllustration = () => (
  <svg viewBox="0 0 420 480" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    {/* Background glow blobs */}
    <circle cx="210" cy="240" r="160" fill="#6426E1" fillOpacity="0.12" />
    <circle cx="290" cy="160" r="90" fill="#a78bfa" fillOpacity="0.1" />
    <circle cx="130" cy="320" r="80" fill="#06b6d4" fillOpacity="0.08" />

    {/* Floating small orbs */}
    <circle cx="60" cy="80" r="8" fill="#a78bfa" fillOpacity="0.5" />
    <circle cx="370" cy="340" r="6" fill="#06b6d4" fillOpacity="0.5" />
    <circle cx="350" cy="100" r="5" fill="#e879f9" fillOpacity="0.6" />
    <circle cx="80" cy="380" r="7" fill="#6426E1" fillOpacity="0.4" />
    <circle cx="380" cy="220" r="4" fill="#a78bfa" fillOpacity="0.6" />

    {/* === LAPTOP === */}
    {/* Screen body */}
    <rect x="100" y="70" width="220" height="150" rx="10" fill="#1e1128" stroke="#6426E1" strokeWidth="2" />
    {/* Screen inner */}
    <rect x="110" y="80" width="200" height="130" rx="6" fill="#0d0717" />
    {/* Screen glow effect */}
    <rect x="110" y="80" width="200" height="130" rx="6" fill="url(#screenGrad)" />
    {/* Code lines on screen */}
    <rect x="122" y="96" width="80" height="5" rx="2.5" fill="#6426E1" fillOpacity="0.9" />
    <rect x="122" y="108" width="120" height="4" rx="2" fill="#a78bfa" fillOpacity="0.6" />
    <rect x="132" y="118" width="90" height="4" rx="2" fill="#06b6d4" fillOpacity="0.7" />
    <rect x="132" y="128" width="110" height="4" rx="2" fill="#a78bfa" fillOpacity="0.5" />
    <rect x="122" y="138" width="70" height="4" rx="2" fill="#6426E1" fillOpacity="0.8" />
    <rect x="122" y="148" width="130" height="4" rx="2" fill="#a78bfa" fillOpacity="0.4" />
    <rect x="132" y="158" width="85" height="4" rx="2" fill="#06b6d4" fillOpacity="0.6" />
    <rect x="132" y="168" width="100" height="4" rx="2" fill="#a78bfa" fillOpacity="0.5" />
    {/* Cursor blink */}
    <rect x="235" y="158" width="3" height="10" rx="1" fill="#e879f9" fillOpacity="0.9" />
    {/* Laptop base */}
    <path d="M85 222 L335 222 L345 232 L75 232 Z" fill="#2a1a3e" stroke="#6426E1" strokeWidth="1.5" />
    <rect x="175" y="220" width="70" height="4" rx="2" fill="#3d2060" />
    {/* Hinge line */}
    <rect x="100" y="219" width="220" height="3" rx="1" fill="#3d2060" />

    {/* === SMARTWATCH (left side) === */}
    {/* Band top */}
    <rect x="62" y="270" width="36" height="22" rx="4" fill="#2a1a3e" stroke="#6426E1" strokeWidth="1.5" />
    {/* Watch body */}
    <rect x="54" y="290" width="52" height="56" rx="10" fill="#1e1128" stroke="#6426E1" strokeWidth="2" />
    {/* Watch screen */}
    <rect x="61" y="297" width="38" height="38" rx="7" fill="#0d0717" />
    <rect x="61" y="297" width="38" height="38" rx="7" fill="url(#watchGrad)" fillOpacity="0.8" />
    {/* Watch time */}
    <text x="80" y="316" textAnchor="middle" fontSize="9" fontWeight="700" fill="#ffffff" fontFamily="monospace">10:42</text>
    {/* Watch activity ring */}
    <circle cx="80" cy="326" r="7" stroke="#6426E1" strokeWidth="2" fill="none" strokeDasharray="28 16" />
    <circle cx="80" cy="326" r="7" stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="16 28" strokeDashoffset="-28" />
    {/* Band bottom */}
    <rect x="62" y="346" width="36" height="22" rx="4" fill="#2a1a3e" stroke="#6426E1" strokeWidth="1.5" />
    {/* Watch crown button */}
    <rect x="106" y="308" width="5" height="12" rx="2.5" fill="#3d2060" stroke="#6426E1" strokeWidth="1" />

    {/* === WIRELESS EARBUDS (right side) === */}
    {/* Case */}
    <rect x="310" y="268" width="64" height="76" rx="16" fill="#1e1128" stroke="#6426E1" strokeWidth="2" />
    {/* Case lid hinge line */}
    <rect x="310" y="302" width="64" height="2" fill="#3d2060" />
    {/* Case LED */}
    <circle cx="342" cy="317" r="4" fill="#6426E1" fillOpacity="0.9" />
    <circle cx="342" cy="317" r="3" fill="#a78bfa" />
    {/* Left earbud pocket */}
    <ellipse cx="330" cy="286" rx="8" ry="11" fill="#2a1a3e" />
    <ellipse cx="330" cy="286" rx="5" ry="8" fill="#0d0717" />
    <circle cx="330" cy="288" r="3" fill="#6426E1" fillOpacity="0.8" />
    {/* Right earbud pocket */}
    <ellipse cx="354" cy="286" rx="8" ry="11" fill="#2a1a3e" />
    <ellipse cx="354" cy="286" rx="5" ry="8" fill="#0d0717" />
    <circle cx="354" cy="288" r="3" fill="#6426E1" fillOpacity="0.8" />

    {/* === FLOATING PHONE === */}
    <rect x="174" y="278" width="72" height="130" rx="12" fill="#1e1128" stroke="#6426E1" strokeWidth="2" />
    {/* Phone screen */}
    <rect x="180" y="288" width="60" height="108" rx="8" fill="#0d0717" />
    <rect x="180" y="288" width="60" height="108" rx="8" fill="url(#phoneGrad)" fillOpacity="0.9" />
    {/* Notch */}
    <rect x="200" y="286" width="20" height="6" rx="3" fill="#1e1128" />
    {/* App grid on phone */}
    <rect x="188" y="302" width="14" height="14" rx="3" fill="#6426E1" fillOpacity="0.9" />
    <rect x="207" y="302" width="14" height="14" rx="3" fill="#06b6d4" fillOpacity="0.8" />
    <rect x="226" y="302" width="14" height="14" rx="3" fill="#e879f9" fillOpacity="0.8" />
    <rect x="188" y="322" width="14" height="14" rx="3" fill="#a78bfa" fillOpacity="0.7" />
    <rect x="207" y="322" width="14" height="14" rx="3" fill="#6426E1" fillOpacity="0.6" />
    <rect x="226" y="322" width="14" height="14" rx="3" fill="#06b6d4" fillOpacity="0.7" />
    {/* Phone notification card */}
    <rect x="185" y="344" width="50" height="28" rx="6" fill="#2a1a3e" />
    <rect x="190" y="350" width="30" height="3" rx="1.5" fill="#a78bfa" fillOpacity="0.8" />
    <rect x="190" y="357" width="40" height="3" rx="1.5" fill="#6b7280" fillOpacity="0.6" />
    {/* Home bar */}
    <rect x="200" y="386" width="20" height="3" rx="1.5" fill="#3d2060" />

    {/* Sparkle accents */}
    <path d="M155 260 L157 255 L159 260 L164 262 L159 264 L157 269 L155 264 L150 262 Z" fill="#a78bfa" fillOpacity="0.7" />
    <path d="M275 260 L276.5 256 L278 260 L282 261.5 L278 263 L276.5 267 L275 263 L271 261.5 Z" fill="#06b6d4" fillOpacity="0.6" />
    <path d="M140 340 L141 337 L142 340 L145 341 L142 342 L141 345 L140 342 L137 341 Z" fill="#e879f9" fillOpacity="0.5" />

    {/* Gradient defs */}
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
  'Product Inquiry',
  'Technical Support',
  'Order Tracking',
  'Returns & Warranty',
  'Bulk / Business Purchase',
  'Other',
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ✅ Real API call using axios
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const response = await axios.post('/api/v1/contact', formData, {
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
      console.error('Contact form error:', err);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#faf9ff', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Syne:wght@600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .contact-root { padding: 48px 24px 80px; max-width: 1160px; margin: 0 auto; }

        .top-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: end;
          margin-bottom: 48px;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 500;
          color: #6426E1;
          margin-bottom: 10px;
          letter-spacing: 0.03em;
        }
        .breadcrumb-dot { width: 4px; height: 4px; border-radius: 50%; background: #6426E1; }

        .heading-main {
          font-family: 'Syne', sans-serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 800;
          color: #0f0a1e;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }

        .tagline-box {
          display: flex;
          align-items: center;
        }
        .tagline-text {
          font-size: 15px;
          color: #6b7280;
          line-height: 1.65;
          max-width: 340px;
          margin-left: auto;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: stretch;
        }

        /* LEFT – Gadget Visual Card */
        .visual-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background: linear-gradient(135deg, #0f0a1e 0%, #1a0f35 50%, #0d1a2e 100%);
          min-height: 540px;
          display: flex;
          flex-direction: column;
        }

        .visual-illustration {
          flex: 1;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .visual-overlay-card {
          padding: 28px 28px 32px;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .overlay-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(100, 38, 225, 0.25);
          border: 1px solid rgba(100, 38, 225, 0.4);
          border-radius: 100px;
          padding: 4px 12px 4px 8px;
          font-size: 11px;
          font-weight: 600;
          color: #c4a8ff;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .overlay-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; }

        .overlay-heading {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.3;
          margin-bottom: 8px;
        }

        .overlay-subtext {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .call-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #0f0a1e;
          font-size: 14px;
          font-weight: 600;
          padding: 11px 20px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          text-decoration: none;
        }
        .call-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(100, 38, 225, 0.35);
        }
        .call-btn-icon {
          width: 28px;
          height: 28px;
          background: #25D366;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* RIGHT – Form Card */
        .form-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #ede8fb;
          padding: 36px 32px;
          box-shadow: 0 4px 40px rgba(100, 38, 225, 0.06);
        }

        .form-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0f0a1e;
          margin-bottom: 4px;
        }
        .form-sub {
          font-size: 14px;
          color: #9ca3af;
          margin-bottom: 28px;
        }

        .field-group { margin-bottom: 18px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }

        .field-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
          margin-bottom: 7px;
        }

        .field-input-wrap {
          position: relative;
        }
        .field-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #d1c4fa;
          pointer-events: none;
          display: flex;
        }
        .field-icon-ta {
          position: absolute;
          left: 13px;
          top: 14px;
          color: #d1c4fa;
          pointer-events: none;
          display: flex;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 11px 14px 11px 40px;
          border: 1.5px solid #ede8fb;
          border-radius: 10px;
          font-size: 14px;
          font-family: inherit;
          color: #0f0a1e;
          background: #faf9ff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          appearance: none;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: #6426E1;
          box-shadow: 0 0 0 3px rgba(100, 38, 225, 0.1);
          background: #ffffff;
        }
        .form-input::placeholder, .form-textarea::placeholder { color: #c4b8e8; }
        .form-textarea { padding: 12px 14px 12px 40px; resize: none; min-height: 110px; }

        .select-arrow {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #9ca3af;
        }

        .submit-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #0f0a1e;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          padding: 14px 28px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          margin-top: 4px;
        }
        .submit-btn:hover:not(:disabled) { background: #6426E1; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .submit-btn svg { flex-shrink: 0; }

        .arrow-icon {
          width: 28px;
          height: 28px;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-msg {
          margin-top: 14px;
          padding: 11px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          text-align: center;
          animation: fadeUp 0.3s ease;
        }
        .status-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
        .status-error { background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 820px) {
          .top-section { grid-template-columns: 1fr; gap: 12px; }
          .tagline-box { justify-content: flex-start; }
          .tagline-text { margin-left: 0; }
          .main-grid { grid-template-columns: 1fr; }
          .visual-card { min-height: 420px; }
          .field-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="contact-root">
        {/* Top heading row */}
        <div className="top-section">
          <div>
            <div className="breadcrumb">
              <div className="breadcrumb-dot" />
              Contact Us
            </div>
            <h1 className="heading-main">Get In Touch<br />with Us</h1>
          </div>
          <div className="tagline-box">
            <p className="tagline-text">
              Have a question about a gadget, need help with an order, or want to explore bulk pricing? Our team at Aby Gadget is ready to assist you every step of the way.
            </p>
          </div>
        </div>

        {/* Main two-column grid */}
        <div className="main-grid">

          {/* LEFT: Visual Card with WhatsApp link */}
          <div className="visual-card">
            <div className="visual-illustration">
              <GadgetIllustration />
            </div>
            <div className="visual-overlay-card">
              <div className="overlay-badge">
                <div className="overlay-badge-dot" />
                Direct Support
              </div>
              <p className="overlay-heading">Prefer to Talk to Us Directly?</p>
              <p className="overlay-subtext">Get instant support from our team for urgent inquiries or quick questions.</p>
              {/* WhatsApp deep-link – replace number with your actual WhatsApp number (international format without '+') */}
              <a
                href="https://wa.me/2348012345678?text=Hello%2C%20I%20have%20an%20enquiry%20about%20Aby%20Gadgets"
                target="_blank"
                rel="noopener noreferrer"
                className="call-btn"
              >
                <span className="call-btn-icon">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="#ffffff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.126 1.528 5.855L.057 23.882l6.221-1.453A11.942 11.942 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.002-1.366l-.359-.213-3.694.863.916-3.582-.234-.369A9.793 9.793 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182S21.818 6.57 21.818 12 17.43 21.818 12 21.818z"/>
                  </svg>
                </span>
                Chat on WhatsApp
                <ChevronRight size={15} />
              </a>
            </div>
          </div>

          {/* RIGHT: Form Card */}
          <div className="form-card">
            <p className="form-title">Send Us a Message</p>
            <p className="form-sub">We'll get back to you within 24 hours.</p>

            <form onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="field-group">
                <label className="field-label" htmlFor="name">Full Name</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </span>
                  <input className="form-input" id="name" name="name" type="text" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
                </div>
              </div>

              {/* Email + Phone row */}
              <div className="field-row">
                <div>
                  <label className="field-label" htmlFor="email">Email</label>
                  <div className="field-input-wrap">
                    <span className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
                    </span>
                    <input className="form-input" id="email" name="email" type="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>
                <div>
                  <label className="field-label" htmlFor="phone">Phone</label>
                  <div className="field-input-wrap">
                    <span className="field-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L9.09 9.91A16 16 0 0 0 15 15.91l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </span>
                    <input className="form-input" id="phone" name="phone" type="tel" placeholder="Enter your number" value={formData.phone} onChange={handleChange} />
                  </div>
                </div>
              </div>

              {/* Select a Service */}
              <div className="field-group">
                <label className="field-label" htmlFor="service">Select a Service</label>
                <div className="field-input-wrap">
                  <span className="field-icon">
                    <Cpu size={16} />
                  </span>
                  <select className="form-select" id="service" name="service" value={formData.service} onChange={handleChange} style={{ paddingRight: '36px' }}>
                    <option value="">Choose your service</option>
                    {services.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <span className="select-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="field-group">
                <label className="field-label" htmlFor="message">Message</label>
                <div className="field-input-wrap">
                  <span className="field-icon-ta">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1c4fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </span>
                  <textarea className="form-textarea" id="message" name="message" placeholder="Enter your message" value={formData.message} onChange={handleChange} rows={4} required />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Sending…
                  </>
                ) : (
                  <>
                    Send Message
                    <span className="arrow-icon">
                      <ChevronRight size={15} />
                    </span>
                  </>
                )}
              </button>

              {submitStatus === 'success' && (
                <div className="status-msg status-success">✓ Message sent! We'll be in touch soon.</div>
              )}
              {submitStatus === 'error' && (
                <div className="status-msg status-error">✗ Something went wrong. Please try again.</div>
              )}
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Contact;