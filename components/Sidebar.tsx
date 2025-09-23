// components/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

type Item = { href: string; label: string };

const ITEMS: Item[] = [
  { href: '/',        label: 'Home' },
  { href: '/downlines', label: 'Downlines' },
  { href: '/packages',  label: 'Packages' },
  { href: '/bots',      label: 'Bots' },          // 👈 new
];


export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 border-r border-white/10 bg-black/40 backdrop-blur">
      <div className="p-4 font-bold">Admin Panel</div>
      <nav className="px-2 pb-4 space-y-1">
        {ITEMS.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + '/');
          return (
            <Link
              key={it.href}
              href={it.href}
              className={clsx(
                'block rounded-lg px-3 py-2 text-sm',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
  
}
