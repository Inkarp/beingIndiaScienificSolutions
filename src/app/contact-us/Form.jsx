'use client';
import { useState, useEffect } from 'react';
import { FaPaperPlane, FaCheckCircle } from 'react-icons/fa';

export default function Form() {

    const [form, setForm] = useState({
        name: '',
        company: '',
        industry: '',
        designation: '',
        department: '',
        email: '',
        // officialEmail: '',
        phone: '',
        typeOfCustomer: '',
        purchasePlan: '',
        state: '',
        city: '',
        message: '',

        // Tracking
        ipAddress: '',
        referrer: '',
        source: '',
        deviceType: '',
        keyword: '',
        timestamp: '',
    });

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);

    /* ================= TRACKING ================= */
    useEffect(() => {
        const collectTrackingData = async () => {

            let ipAddress = 'Unknown';
            try {
                const ipRes = await fetch('https://api.ipify.org?format=json');
                const ipData = await ipRes.json();
                ipAddress = ipData.ip;
            } catch { }

            const referrer = document.referrer || 'Direct Visit';

            const ua = navigator.userAgent.toLowerCase();
            let deviceType = /mobile|android|iphone|ipad/.test(ua)
                ? 'Mobile'
                : 'Desktop';

            setForm(prev => ({
                ...prev,
                ipAddress,
                referrer,
                deviceType,
                timestamp: new Date().toISOString(),
            }));
        };

        collectTrackingData();
    }, []);

    /* ================= RESET FORM AFTER SUCCESS ================= */
    useEffect(() => {
        if (status === 'success') {
            const timer = setTimeout(() => {
                setStatus(null);
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [status]);

    /* ================= VALIDATION ================= */

    const handleChange = (e) => {
        let { name, value } = e.target;

        // Block URLs everywhere
        if (/https?:\/\/|www\./i.test(value)) return;

        // Name → Capitalize every word
        if (name === 'name') {
            value = value.replace(/[^a-zA-Z\s]/g, '');
            value = value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        }

        // Company → Only letters
        if (name === 'company') {
            value = value.replace(/[^a-zA-Z\s]/g, '');
        }

        // Industry / Designation / Department / City → Only letters
        if (['industry', 'designation', 'department', 'city'].includes(name)) {
            value = value.replace(/[^a-zA-Z\s]/g, '');
        }

        // Phone → Only 10 digits
        if (name === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }

        // Email → No spaces
        if (name === 'email') {
            value = value.replace(/\s/g, '');
        }

        setForm(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (form.phone.length !== 10) return "Phone must be 10 digits";
        if (!emailRegex.test(form.email)) return "Invalid Personal Email";
        // if (!emailRegex.test(form.officialEmail)) return "Invalid Official Email";

        return null;
    };

    /* ================= SUBMIT ================= */

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) throw new Error();

            setStatus('success');

            setForm(prev => ({
                ...prev,
                name: '', company: '', industry: '', designation: '',
                department: '', email: '', 
                phone: '', typeOfCustomer: '', purchasePlan: '',
                state: '', city: '', message: ''
            }));

        } catch {
            setStatus('error');
            setError('Something went wrong. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    /* ================= STATES ================= */

    const STATES = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
        "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
        "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
        "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Andaman and Nicobar Islands", "Chandigarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Delhi", "Jammu and Kashmir", "Ladakh",
        "Lakshadweep", "Puducherry"
    ];

    /* ================= UI ================= */

    return (
        <section className="min-h-screen flex items-center justify-center rounded-3xl bg-[#2F4191]/10">

            <div className="p-5 w-full max-w-4xl">

                {!status ? (
                    <form onSubmit={handleSubmit} className="space-y-3">

                        {error && (
                            <div className="bg-red-500 text-white p-4 rounded-xl mb-4">
                                <p className="font-semibold">{error}</p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">

                            <Input name="name" placeholder="Full Name *" value={form.name} onChange={handleChange} required />
                            <Input name="company" placeholder="Company Name *" value={form.company} onChange={handleChange} required />

                            <Input name="industry" placeholder="Industry *" value={form.industry} onChange={handleChange} required />
                            <Input name="designation" placeholder="Designation *" value={form.designation} onChange={handleChange} required />

                            <Input name="department" placeholder="Department *" value={form.department} onChange={handleChange} required />

                            {/* Phone */}
                            <div className="flex">
                                <span className="px-4 py-2 bg-black border border-white/30 rounded-l-xl text-white text-sm h-11 flex items-center">
                                    +91
                                </span>
                                <input
                                    name="phone"
                                    placeholder="Contact Number *"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 rounded-r-xl bg-black border border-white/30 text-white text-sm h-11"
                                />
                            </div>

                            <Input name="email" type="email" placeholder="Personal/Official Email *" value={form.email} onChange={handleChange} required />
                            {/* <Input name="officialEmail" type="email" placeholder="Official Email *" value={form.officialEmail} onChange={handleChange} required /> */}

                            {/* Country (Read Only) */}
                            <input
                                value="India"
                                readOnly
                                className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/30 text-white text-sm h-11"
                            />

                            {/* State */}
                            <select
                                name="state"
                                value={form.state}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/30 text-white text-sm h-11"
                            >
                                <option value="">Select State *</option>
                                {STATES.map(s => <option key={s}>{s}</option>)}
                            </select>

                            <Input name="city" placeholder="City *" value={form.city} onChange={handleChange} required />

                            {/* Type Of Customer */}
                            <select
                                name="typeOfCustomer"
                                value={form.typeOfCustomer}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/30 text-white text-sm h-11"
                            >
                                <option value="">Type Of Customer *</option>
                                <option value="Existing Customer">Existing Customer</option>
                                <option value="New Customer">New Customer</option>
                            </select>

                            {/* Purchase Plan */}
                            <select
                                name="purchasePlan"
                                value={form.purchasePlan}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/30 text-white text-sm h-11"
                            >
                                <option value="">Purchase Plan *</option>
                                <option value="1-3 Months">1-3 Months</option>
                                <option value="3-6 Months">3-6 Months</option>
                                <option value="After 6 Months">After 6 Months</option>
                            </select>

                        </div>

                        <textarea
                            name="message"
                            rows={3}
                            placeholder="Message (Optional)"
                            value={form.message}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 border rounded-xl bg-white/20 border border-white/30 text-black text-sm placeholder-gray-700 h-auto resize-none"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-[#2F4191] to-[#2B7EC2] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                        >
                            {loading ? "Submitting..." : <>
                                <FaPaperPlane />
                                Submit Enquiry
                            </>}
                        </button>
                    </form>
                ) : (
                    <div className="text-center text-white space-y-4 bg-green-200 rounded-xl p-8">
                        <FaCheckCircle className="text-4xl mx-auto" />
                        <h2 className="text-xl text-black font-bold">Success!</h2>
                        <p className='text-[#2F4191]'>We will contact you within 24 hours.</p>
                    </div>
                )}

            </div>
        </section>
    );
}

/* ================= REUSABLE INPUT ================= */

function Input({ name, placeholder, value, onChange, type = "text", required }) {
    return (
        <input
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full px-4 py-2.5 rounded-xl bg-black border border-white/30 text-white text-sm h-11"
        />
    );
}