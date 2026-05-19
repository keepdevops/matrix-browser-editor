import type { Template } from '../../lib/schemas';

export const cardTemplates: Template[] = [
  {
    id: 'card-profile',
    name: 'Profile Card',
    category: 'card',
    description: 'User avatar, name, bio, and social stats',
    tags: ['profile', 'user', 'avatar', 'social'],
    code: `export function ProfileCard() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 w-72 text-center">
        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar"
          className="w-20 h-20 rounded-full mx-auto border-4 border-indigo-500" />
        <h2 className="mt-4 text-xl font-bold dark:text-white">Alex Johnson</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Product Designer · San Francisco</p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 leading-relaxed">
          Crafting beautiful interfaces and scalable design systems.
        </p>
        <div className="flex justify-around mt-5 border-t dark:border-gray-700 pt-4">
          {[['142', 'Posts'], ['8.4k', 'Followers'], ['310', 'Following']].map(([n, l]) => (
            <div key={l}>
              <p className="font-bold text-lg dark:text-white">{n}</p>
              <p className="text-xs text-gray-500">{l}</p>
            </div>
          ))}
        </div>
        <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2 text-sm font-semibold">
          Follow
        </button>
      </div>
    </div>
  );
}`,
  },
  {
    id: 'card-pricing',
    name: 'Pricing Card',
    category: 'card',
    description: 'Tiered pricing card with feature list and CTA',
    tags: ['pricing', 'subscription', 'cta'],
    code: `import { useState } from 'react';
export function PricingCard() {
  const [annual, setAnnual] = useState(false);
  const plans = [
    { name: 'Starter', monthly: 9, annual: 7, features: ['5 projects', '10 GB storage', 'Email support'] },
    { name: 'Pro', monthly: 29, annual: 23, features: ['Unlimited projects', '100 GB storage', 'Priority support', 'Analytics'], highlight: true },
    { name: 'Team', monthly: 79, annual: 63, features: ['Everything in Pro', '1 TB storage', 'SSO', 'SLA'] },
  ];
  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold dark:text-white">Simple Pricing</h2>
        <div className="flex items-center justify-center gap-3 mt-4">
          <span className="text-sm text-gray-500">Monthly</span>
          <button onClick={() => setAnnual(a => !a)}
            className={\`w-12 h-6 rounded-full transition-colors \${annual ? 'bg-indigo-600' : 'bg-gray-300'}\`}>
            <span className={\`block w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 \${annual ? 'translate-x-6' : ''}\`} />
          </button>
          <span className="text-sm text-gray-500">Annual <span className="text-green-500 font-medium">−20%</span></span>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {plans.map(p => (
          <div key={p.name} className={\`rounded-2xl p-6 shadow \${p.highlight ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800 dark:text-white'}\`}>
            <h3 className="font-bold text-lg">{p.name}</h3>
            <p className="text-4xl font-bold mt-3">${annual ? p.annual : p.monthly}<span className="text-base font-normal opacity-70">/mo</span></p>
            <ul className="mt-4 space-y-2">
              {p.features.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <span className={p.highlight ? 'text-indigo-200' : 'text-green-500'}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button className={\`mt-6 w-full py-2 rounded-lg font-semibold text-sm transition-colors \${p.highlight ? 'bg-white text-indigo-600 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700'}\`}>
              Get started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },
  {
    id: 'card-product',
    name: 'Product Card',
    category: 'card',
    description: 'E-commerce product card with image, rating, and add-to-cart',
    tags: ['ecommerce', 'product', 'cart', 'rating'],
    code: `import { useState } from 'react';
export function ProductCard() {
  const [added, setAdded] = useState(false);
  const [qty, setQty] = useState(1);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden w-72">
        <div className="bg-indigo-50 dark:bg-indigo-900/30 h-48 flex items-center justify-center text-6xl">👟</div>
        <div className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide">Nike</p>
              <h3 className="font-bold text-lg dark:text-white mt-0.5">Air Max 2024</h3>
            </div>
            <p className="text-xl font-bold text-indigo-600">$129</p>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {'★★★★☆'.split('').map((s, i) => (
              <span key={i} className="text-yellow-400 text-sm">{s}</span>
            ))}
            <span className="text-xs text-gray-400 ml-1">(248)</span>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="flex items-center border dark:border-gray-600 rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-700">−</button>
              <span className="px-3 text-sm dark:text-white">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="px-3 py-1 text-lg hover:bg-gray-100 dark:hover:bg-gray-700">+</button>
            </div>
            <button onClick={() => setAdded(true)}
              className={\`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors \${added ? 'bg-green-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}\`}>
              {added ? '✓ Added' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}`,
  },
];
