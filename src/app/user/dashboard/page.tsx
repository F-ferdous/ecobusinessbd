"use client";

import UserLayout from '@/components/user/UserLayout';
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const cards = [
  { label: 'My Purchases', color: 'emerald', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4zm0 6l9 4 9-4"/></svg>
    )},
  { label: 'Courses Enrolled', color: 'violet', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 20l9-5-9-5-9 5 9 5z M12 10l9-5-9-5-9 5 9 5z"/></svg>
    )},
  { label: 'Payments', color: 'amber', icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg>
    )},
];

const colorMap: Record<string, {bg:string; ring:string; chipBg:string; chipFg:string}> = {
  emerald: { bg: 'bg-emerald-50', ring: 'ring-emerald-100', chipBg: 'bg-emerald-100', chipFg: 'text-emerald-700' },
  violet:  { bg: 'bg-violet-50',  ring: 'ring-violet-100',  chipBg: 'bg-violet-100',  chipFg: 'text-violet-700' },
  amber:   { bg: 'bg-amber-50',   ring: 'ring-amber-100',   chipBg: 'bg-amber-100',   chipFg: 'text-amber-700' },
};

export default function UserDashboardPage() {
  return (
    <UserLayout>
      <React.Suspense fallback={<section className="py-4"><div className="text-gray-600">Loading...</div></section>}>
        <DashboardContent />
      </React.Suspense>
    </UserLayout>
  );
}

function DashboardContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [uid, setUid] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string>('');
  const [savedOnce, setSavedOnce] = React.useState(false);
  const [purchaseCount, setPurchaseCount] = React.useState<number | null>(null);
  const [totalPaid, setTotalPaid] = React.useState<number | null>(null);

  const status = (params.get('status') || '').toLowerCase();
  const pkg = params.get('pkg') || '';
  const amount = Number(params.get('amount') || '0');
  const currency = (params.get('currency') || 'USD').toUpperCase();
  const titleFromQuery = params.get('title') || '';

  React.useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace('/login');
        return;
      }
      setUid(u.uid);
      setEmail(u.email || null);
    });
    return () => unsub();
  }, [router]);

  React.useEffect(() => {
    const shouldPersist = status === 'success' && uid && !savedOnce && amount > 0 && db;
    if (!shouldPersist) return;
    let cancelled = false;
    (async () => {
      try {
        setSaving(true);
        setSaveError('');
        const payload = {
          userId: uid || '',
          email: email || null,
          packageKey: pkg || null,
          packageTitle: titleFromQuery || (pkg ? pkg : null),
          amount,
          currency,
          status: 'completed',
          createdAt: Timestamp.now(),
        } as const;
        await addDoc(collection(db!, 'Transactions'), payload);
        if (!cancelled) setSavedOnce(true);
      } catch (e: unknown) {
        if (!cancelled) setSaveError(e instanceof Error ? e.message : 'Failed to record transaction');
      } finally {
        if (!cancelled) setSaving(false);
      }
    })();
    return () => { cancelled = true; };
  }, [status, uid, email, savedOnce, amount, currency, pkg]);

  // Load user's transactions and compute stats (no indexes)
  React.useEffect(() => {
    let unsub: undefined | (() => void);
    (async () => {
      if (!db || !uid) return;
      const { collection, onSnapshot, query, where } = await import('firebase/firestore');
      const q = query(collection(db, 'Transactions'), where('userId', '==', uid || ''));
      unsub = onSnapshot(q, (snap) => {
        const docs = snap.docs.map(d => d.data() as any);
        const count = docs.length;
        const total = docs.reduce((sum, d) => sum + (Number(d.amount || 0) || 0), 0);
        setPurchaseCount(count);
        setTotalPaid(total);
      }, () => {
        setPurchaseCount(0);
        setTotalPaid(0);
      });
    })();
    return () => { if (unsub) unsub(); };
  }, [uid]);

  return (
      <section className="py-4">
        {status === 'success' && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 p-4">
            <div className="flex items-start gap-3">
              <svg className="h-5 w-5 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              <div className="flex-1">
                <div className="font-semibold">Payment successful</div>
                <div className="text-sm">{pkg ? `Package: ${pkg}` : 'Order'} • Amount: {currency} {amount.toFixed(2)}</div>
                {saving && <div className="text-xs mt-1">Saving your transaction...</div>}
                {saveError && <div className="text-xs text-red-600 mt-1">{saveError}</div>}
              </div>
            </div>
          </div>
        )}
        <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c, i) => {
            const colors = colorMap[c.color];
            return (
              <div
                key={c.label}
                className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ${colors.ring} transition hover:shadow-md hover:-translate-y-0.5`}
                style={{ animation: `fadeIn 300ms ease ${i * 60}ms both` }}
              >
                <div className="p-5 flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-xl inline-flex items-center justify-center ${colors.bg} text-gray-700`}>{c.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-gray-500">{c.label}</div>
                    <div className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
                      {c.label === 'My Purchases' && (purchaseCount ?? '—')}
                      {c.label === 'Courses Enrolled' && '—'}
                      {c.label === 'Payments' && ((totalPaid != null) ? `${currency} ${totalPaid.toFixed(2)}` : '—')}
                    </div>
                  </div>
                  <span className={`hidden sm:inline-flex px-2 py-1 rounded-lg text-xs font-medium ${colors.chipBg} ${colors.chipFg}`}>
                    {c.label === 'My Purchases' && 'count'}
                    {c.label === 'Courses Enrolled' && 'courses'}
                    {c.label === 'Payments' && 'total paid'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <style jsx>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </section>
  );
}
