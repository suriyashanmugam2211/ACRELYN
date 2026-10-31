import React, { useState } from 'react';
import { Mail, Clock, Send, CheckCircle2, MapPin, Shield, Sparkles } from 'lucide-react';
import { repository } from '../lib/storage';

const COUNTRY_DIAL_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
];

export const ContactPage: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+91');
  const [phone, setPhone] = useState<string>('');
  const [subject, setSubject] = useState<string>('General Land Enquiry');
  const [message, setMessage] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Please enter your name.';
    if (!email.trim()) {
      newErrors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Please enter your 10-digit mobile number.';
    } else if (phone.length !== 10) {
      newErrors.phone = `Phone number must be exactly 10 digits (currently ${phone.length}/10 digits).`;
    } else if (countryCode === '+91' && !/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    }
    if (!message.trim()) newErrors.message = 'Please provide your message.';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setError(null);

    const fullPhoneNumber = `${countryCode} ${phone.trim()}`;

    const result = await repository.submitEnquiry({
      property_id: 'GENERAL_CONTACT',
      customer_name: name.trim(),
      email: email.trim(),
      phone: fullPhoneNumber,
      message: `[Subject: ${subject}] ${message.trim()}`,
      status: 'New',
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } else {
      setError(result.error || 'Failed to submit message to the database.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-bold text-[#087F5B]">
          <Sparkles className="w-3.5 h-3.5 text-[#00E6A0]" />
          <span>Contact Support Desk</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#142B25]">
          Get in Touch with ACRELYN
        </h1>
        <p className="text-sm text-[#71817A] max-w-2xl leading-relaxed">
          Have an enquiry about a specific parcel, need verification clarification, or wish to discuss listing land in the Chennai region? Our desk is at your disposal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact Information Column */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-[#087F5B] text-white p-7 rounded-2xl space-y-6 shadow-md border border-[#00E6A0]/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E6A0]/10 rounded-full blur-xl pointer-events-none" />

            <h3 className="font-serif text-xl font-bold">
              Enquiry Coordination Desk
            </h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed">
              We coordinate verified land enquiries and connect buyers with transparent property records across Greater Chennai.
            </p>

            <div className="space-y-4 text-xs text-emerald-100">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#00E6A0] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Direct Email</div>
                  <div className="text-emerald-100/80">enquiries@acrelyn.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#00E6A0] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Desk Working Hours</div>
                  <div className="text-emerald-100/80">Monday — Saturday: 9:30 AM to 6:30 PM IST</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#00E6A0] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-white">Service Area</div>
                  <div className="text-emerald-100/80">Greater Chennai Metropolitan & Growth Corridors</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-emerald-700/60 text-[11px] text-emerald-100/80 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#00E6A0]" />
              <span>Customer contact privacy guaranteed</span>
            </div>
          </div>
        </div>

        {/* Working Form Column */}
        <div className="md:col-span-7 bg-white p-7 rounded-2xl border border-[#DCEBE4] shadow-xs">
          {success ? (
            <div className="p-8 text-center space-y-4 bg-[#B8FFE5]/20 border border-[#00E6A0] rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-[#087F5B] text-[#00E6A0] flex items-center justify-center mx-auto shadow-[0_0_12px_#00E6A0]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#142B25]">
                Message Saved to Database!
              </h3>
              <p className="text-xs text-[#71817A] leading-relaxed max-w-md mx-auto">
                Your enquiry has been successfully recorded into our Supabase database. An Acrelyn representative will follow up via your email shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-5 py-2.5 bg-[#087F5B] hover:bg-[#066346] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#142B25]">
                Submit Your Enquiry
              </h3>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#142B25] mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
                  />
                  {errors.name && <span className="text-[11px] text-red-600 font-medium">{errors.name}</span>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142B25] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
                  />
                  {errors.email && <span className="text-[11px] text-red-600 font-medium">{errors.email}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-[#142B25]">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <span
                      className={`text-[10px] font-bold ${
                        phone.length === 10
                          ? 'text-[#087F5B] bg-[#B8FFE5]/70 px-1.5 py-0.5 rounded border border-[#00E6A0]/40 font-mono'
                          : 'text-[#71817A] font-mono'
                      }`}
                    >
                      {phone.length}/10 digits
                    </span>
                  </div>

                  <div
                    className={`flex rounded-xl overflow-hidden border bg-[#F7FAF8] transition-all ${
                      errors.phone
                        ? 'border-red-400 bg-red-50/20'
                        : phone.length === 10
                        ? 'border-[#00E6A0] ring-1 ring-[#00E6A0]'
                        : 'border-[#DCEBE4] focus-within:ring-2 focus-within:ring-[#087F5B] focus-within:border-[#00E6A0]'
                    }`}
                  >
                    {/* Country Code Selector */}
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="px-2.5 py-2 text-xs font-bold bg-[#EAF3EF] border-r border-[#DCEBE4] text-[#142B25] focus:outline-none cursor-pointer shrink-0"
                      title="Select Country Code"
                    >
                      {COUNTRY_DIAL_CODES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.code} ({c.country})
                        </option>
                      ))}
                    </select>

                    {/* 10-Digit Mobile Number Input */}
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        // Strictly accept digits only and cap at 10 digits
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(digitsOnly);
                        if (errors.phone) {
                          setErrors((prev) => {
                            const updated = { ...prev };
                            delete updated.phone;
                            return updated;
                          });
                        }
                      }}
                      placeholder="98400 12345 (10 digits)"
                      className="w-full px-3 py-2 text-sm bg-transparent text-[#142B25] focus:outline-none font-medium placeholder:text-[#71817A]/50 tracking-wider"
                    />
                  </div>

                  {errors.phone ? (
                    <span className="text-[11px] text-red-600 mt-1 block font-medium">
                      {errors.phone}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#71817A] mt-1 block font-medium">
                      Enter 10-digit mobile number without leading zero.
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#142B25] mb-1">
                    Enquiry Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25] font-medium"
                  >
                    <option value="General Land Enquiry">General Land Enquiry</option>
                    <option value="Specific Property Details">Specific Property Details</option>
                    <option value="Documentation & Legal Verification">Documentation & Legal Verification</option>
                    <option value="Listing a Land Parcel">Listing a Land Parcel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#142B25] mb-1">
                  Message Details <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us about the property ID or locality and budget you are targeting..."
                  className="w-full px-3 py-2 text-sm bg-[#F7FAF8] border border-[#DCEBE4] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#087F5B] text-[#142B25]"
                />
                {errors.message && <span className="text-[11px] text-red-600 font-medium">{errors.message}</span>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#087F5B] hover:bg-[#066346] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,230,160,0.35)]"
              >
                {loading ? (
                  <span>Saving message to database...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-[#00E6A0]" />
                    <span>Submit Message</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
