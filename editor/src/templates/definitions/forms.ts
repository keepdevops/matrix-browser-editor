import type { Template } from '../../lib/schemas';

export const formTemplates: Template[] = [
  {
    id: 'form-login',
    name: 'Login Form',
    category: 'form',
    description: 'Email/password login with validation and submit state',
    tags: ['auth', 'login', 'validation'],
    code: `import { useState } from 'react';
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('All fields required'); return; }
    setLoading(true); setError('');
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-sm space-y-4">
        <h2 className="text-2xl font-bold text-center">Sign In</h2>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600" />
        <button type="submit" disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 font-semibold disabled:opacity-50">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}`,
  },
  {
    id: 'form-contact',
    name: 'Contact Form',
    category: 'form',
    description: 'Multi-field contact form with character counter and success state',
    tags: ['contact', 'textarea', 'feedback'],
    code: `import { useState } from 'react';
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState('');
  if (sent) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-2xl">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="font-bold text-lg">Message sent!</h3>
      </div>
    </div>
  );
  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Contact Us</h2>
      <input placeholder="Name" className="w-full border rounded-lg px-4 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
      <input type="email" placeholder="Email" className="w-full border rounded-lg px-4 py-2 text-sm dark:bg-gray-800 dark:border-gray-700" />
      <div className="relative">
        <textarea placeholder="Your message" rows={5} value={message} onChange={e=>setMessage(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm resize-none dark:bg-gray-800 dark:border-gray-700" maxLength={500} />
        <span className="absolute bottom-2 right-3 text-xs text-gray-400">{message.length}/500</span>
      </div>
      <button onClick={() => setSent(true)}
        className="w-full bg-indigo-600 text-white rounded-lg py-2 font-semibold hover:bg-indigo-700">Send Message</button>
    </div>
  );
}`,
  },
];
