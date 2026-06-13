import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/services';

const BUSINESS_TYPES = ['trader', 'artisan', 'food_vendor', 'transport', 'other'];
const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Hausa', value: 'ha' },
  { label: 'Yoruba', value: 'yo' },
  { label: 'Igbo', value: 'ig' },
  { label: 'Pidgin', value: 'pcm' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', password: '',
    businessName: '', businessType: 'trader', language: 'en',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await authService.register(form);
      navigate(`/login?registered=1&phone=${encodeURIComponent(form.phone)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-extrabold text-3xl">S</span>
          </div>
          <h1 className="text-3xl font-extrabold text-primary-500">Create Account</h1>
          <p className="text-gray-500 mt-1">Join millions of African traders building their digital identity</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name *</label>
                <input className="input" placeholder="Amina" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} required />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input className="input" placeholder="Musa" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="label">Phone Number *</label>
              <input type="tel" className="input" placeholder="+2348012345678" value={form.phone} onChange={(e) => set('phone', e.target.value)} required />
            </div>

            <div>
              <label className="label">Password *</label>
              <input type="password" className="input" placeholder="Min. 8 characters" value={form.password} onChange={(e) => set('password', e.target.value)} required />
            </div>

            <div>
              <label className="label">Business Name</label>
              <input className="input" placeholder="Amina Provisions" value={form.businessName} onChange={(e) => set('businessName', e.target.value)} />
            </div>

            <div>
              <label className="label">Business Type</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {BUSINESS_TYPES.map((t) => (
                  <button key={t} type="button" onClick={() => set('businessType', t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                      form.businessType === t ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
                    {t.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Preferred Language</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {LANGUAGES.map((l) => (
                  <button key={l.value} type="button" onClick={() => set('language', l.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      form.language === l.value ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-500 font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
