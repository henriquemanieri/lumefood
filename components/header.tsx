'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Header() {
  const { data: session, status } = useSession()
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/carrinho')
        .then((r) => r.json())
        .then((data) => {
          if (data?.items) {
            const count = data.items.reduce(
              (sum: number, item: { quantity: number }) => sum + item.quantity,
              0
            )
            setCartCount(count)
          }
        })
        .catch(() => {})
    } else {
      setCartCount(0)
    }
  }, [status])

  return (
    <header
      style={{
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            textDecoration: 'none',
          }}
        >
          <span style={{ fontSize: '24px' }}>🔥</span>
          <span
            style={{
              fontSize: '22px',
              fontWeight: '800',
              color: '#EA1D2C',
              letterSpacing: '-0.5px',
            }}
          >
            LumeFood
          </span>
        </Link>

        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link
            href="/"
            style={{
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#3E3E3E',
              textDecoration: 'none',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background = '#f5f5f5')
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background = 'transparent')
            }
          >
            Início
          </Link>

          {status === 'authenticated' && (
            <Link
              href="/pedidos"
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#3E3E3E',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = '#f5f5f5')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  'transparent')
              }
            >
              Pedidos
            </Link>
          )}

          {/* Cart */}
          {status === 'authenticated' && (
            <Link
              href="/carrinho"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#FFF5F5',
                textDecoration: 'none',
              }}
              title="Carrinho"
            >
              <span style={{ fontSize: '20px' }}>🛒</span>
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    background: '#EA1D2C',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: '700',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
          )}

          {/* Auth area */}
          {status === 'loading' ? (
            <div
              style={{
                width: '80px',
                height: '36px',
                borderRadius: '8px',
                background: '#f0f0f0',
              }}
            />
          ) : status === 'authenticated' ? (
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  background: '#FFF5F5',
                }}
              >
                <span style={{ fontSize: '16px' }}>👤</span>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#3E3E3E',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {session.user?.name?.split(' ')[0] ?? 'Usuário'}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #EA1D2C',
                  background: 'transparent',
                  color: '#EA1D2C',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background = '#EA1D2C'
                  ;(e.currentTarget as HTMLElement).style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background =
                    'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = '#EA1D2C'
                }}
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                background: '#EA1D2C',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = '#C8151E')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = '#EA1D2C')
              }
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
