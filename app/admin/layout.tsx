'use client'

import Link from 'next/link'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/cardapio', label: 'Cardápio', icon: '🍽️' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: '📦' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F7F7F7' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '240px',
          minWidth: '240px',
          background: 'linear-gradient(180deg, #EA1D2C 0%, #C8151E 100%)',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: '28px 20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '28px' }}>🔥</span>
            <div>
              <p
                style={{
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#fff',
                  lineHeight: 1,
                }}
              >
                LumeFood
              </p>
              <p
                style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.7)',
                  marginTop: '2px',
                }}
              >
                Painel Administrativo
              </p>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                marginBottom: '4px',
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  'rgba(255,255,255,0.15)')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  'transparent')
              }
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              fontSize: '13px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = '#fff')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color =
                'rgba(255,255,255,0.7)')
            }
          >
            <span>←</span> Ver site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
    </div>
  )
}
