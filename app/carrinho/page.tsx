'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/header'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

interface CartItem {
  id: string
  quantity: number
  menuItem: {
    id: string
    name: string
    price: number
    imageUrl: string | null
    restaurant: {
      id: string
      name: string
    }
  }
}

interface Cart {
  id: string
  items: CartItem[]
  couponCode?: string | null
  discountAmount?: number
}

export default function CarrinhoPage() {
  const { status } = useSession()
  const router = useRouter()
  const [cart, setCart] = useState<Cart | null>(null)
  const [loading, setLoading] = useState(true)
  const [coupon, setCoupon] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    discount: number
  } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetchCart()
    }
  }, [status])

  async function fetchCart() {
    try {
      const res = await fetch('/api/carrinho')
      const data = await res.json()
      setCart(data)
    } catch {
      toast.error('Erro ao carregar carrinho')
    } finally {
      setLoading(false)
    }
  }

  async function updateQuantity(itemId: string, newQty: number) {
    if (newQty < 1) {
      await removeItem(itemId)
      return
    }
    try {
      const res = await fetch(`/api/carrinho/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty }),
      })
      if (res.ok) {
        await fetchCart()
      }
    } catch {
      toast.error('Erro ao atualizar quantidade')
    }
  }

  async function removeItem(itemId: string) {
    try {
      const res = await fetch(`/api/carrinho/items/${itemId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Item removido')
        await fetchCart()
      }
    } catch {
      toast.error('Erro ao remover item')
    }
  }

  async function validateCoupon() {
    if (!coupon.trim()) return
    setCouponLoading(true)
    try {
      const res = await fetch('/api/cupons/validar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon.trim(), subtotal }),
      })
      const data = await res.json()
      if (res.ok) {
        setAppliedCoupon({ code: coupon.trim(), discount: data.discount })
        toast.success(`Cupom aplicado! Desconto de ${formatCurrency(data.discount)}`)
      } else {
        toast.error(data.error ?? 'Cupom inválido')
      }
    } catch {
      toast.error('Erro ao validar cupom')
    } finally {
      setCouponLoading(false)
    }
  }

  const items = cart?.items ?? []
  const subtotal = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  )
  const discount = appliedCoupon?.discount ?? 0
  const deliveryFee = subtotal > 0 ? 599 : 0
  const total = subtotal - discount + deliveryFee

  const restaurantName =
    items.length > 0 ? items[0].menuItem.restaurant.name : ''

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F7F7' }}>
        <Header />
        <div
          style={{
            maxWidth: '900px',
            margin: '40px auto',
            padding: '0 24px',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: '80px',
                borderRadius: '12px',
                marginBottom: '12px',
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7' }}>
      <Header />

      <main
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '32px 24px',
          display: 'grid',
          gridTemplateColumns: items.length > 0 ? '1fr 340px' : '1fr',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left column */}
        <div>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#3E3E3E',
              marginBottom: '8px',
            }}
          >
            🛒 Meu carrinho
          </h1>
          {restaurantName && (
            <p style={{ color: '#717171', fontSize: '14px', marginBottom: '20px' }}>
              {restaurantName}
            </p>
          )}

          {items.length === 0 ? (
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '60px 40px',
                textAlign: 'center',
                border: '1px solid #f0f0f0',
              }}
            >
              <span
                style={{
                  fontSize: '56px',
                  display: 'block',
                  marginBottom: '16px',
                }}
              >
                🛒
              </span>
              <h2
                style={{
                  fontSize: '18px',
                  fontWeight: '700',
                  color: '#3E3E3E',
                  marginBottom: '8px',
                }}
              >
                Seu carrinho está vazio
              </h2>
              <p style={{ color: '#717171', marginBottom: '24px' }}>
                Adicione itens de um restaurante para começar
              </p>
              <button
                onClick={() => router.push('/')}
                style={{
                  padding: '12px 28px',
                  background: '#EA1D2C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Ver restaurantes
              </button>
            </div>
          ) : (
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                overflow: 'hidden',
              }}
            >
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px 20px',
                    borderBottom:
                      idx < items.length - 1 ? '1px solid #f5f5f5' : 'none',
                  }}
                >
                  {/* Thumb */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '10px',
                      background: item.menuItem.imageUrl
                        ? `url(${item.menuItem.imageUrl}) center/cover`
                        : '#FFF5F5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: '28px',
                    }}
                  >
                    {!item.menuItem.imageUrl && '🍽️'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#3E3E3E',
                        marginBottom: '4px',
                      }}
                    >
                      {item.menuItem.name}
                    </p>
                    <p
                      style={{
                        fontSize: '14px',
                        color: '#EA1D2C',
                        fontWeight: '700',
                      }}
                    >
                      {formatCurrency(item.menuItem.price * item.quantity)}
                    </p>
                  </div>

                  {/* Qty controls */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity - 1)
                      }
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '1.5px solid #EA1D2C',
                        background: '#fff',
                        color: '#EA1D2C',
                        fontSize: '18px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: '700',
                        color: '#3E3E3E',
                        minWidth: '20px',
                        textAlign: 'center',
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.id, item.quantity + 1)
                      }
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: 'none',
                        background: '#EA1D2C',
                        color: '#fff',
                        fontSize: '18px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        border: '1px solid #f0f0f0',
                        background: '#fafafa',
                        color: '#999',
                        fontSize: '14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: '4px',
                      }}
                      title="Remover"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Coupon */}
          {items.length > 0 && (
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                border: '1px solid #f0f0f0',
                padding: '20px',
                marginTop: '16px',
              }}
            >
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: '700',
                  color: '#3E3E3E',
                  marginBottom: '12px',
                }}
              >
                🎟️ Cupom de desconto
              </h3>
              {appliedCoupon ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '10px',
                    padding: '12px 16px',
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: '#16A34A',
                      }}
                    >
                      ✓ {appliedCoupon.code}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        color: '#16A34A',
                        marginLeft: '8px',
                      }}
                    >
                      − {formatCurrency(appliedCoupon.discount)}
                    </span>
                  </div>
                  <button
                    onClick={() => setAppliedCoupon(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Remover
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Digite o cupom"
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      border: '1.5px solid #e5e5e5',
                      borderRadius: '10px',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    onFocus={(e) =>
                      ((e.currentTarget as HTMLElement).style.borderColor =
                        '#EA1D2C')
                    }
                    onBlur={(e) =>
                      ((e.currentTarget as HTMLElement).style.borderColor =
                        '#e5e5e5')
                    }
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={couponLoading || !coupon.trim()}
                    style={{
                      padding: '10px 20px',
                      background:
                        couponLoading || !coupon.trim() ? '#ccc' : '#EA1D2C',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor:
                        couponLoading || !coupon.trim()
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    {couponLoading ? '...' : 'Aplicar'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {items.length > 0 && (
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #f0f0f0',
              padding: '24px',
              position: 'sticky',
              top: '80px',
            }}
          >
            <h3
              style={{
                fontSize: '17px',
                fontWeight: '700',
                color: '#3E3E3E',
                marginBottom: '20px',
              }}
            >
              Resumo do pedido
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: '#717171',
                }}
              >
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    color: '#16A34A',
                  }}
                >
                  <span>Desconto</span>
                  <span>− {formatCurrency(discount)}</span>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '14px',
                  color: '#717171',
                }}
              >
                <span>Taxa de entrega</span>
                <span>
                  {deliveryFee === 0 ? (
                    <span style={{ color: '#16A34A', fontWeight: '600' }}>
                      Grátis
                    </span>
                  ) : (
                    formatCurrency(deliveryFee)
                  )}
                </span>
              </div>

              <div
                style={{
                  borderTop: '2px solid #f0f0f0',
                  paddingTop: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '18px',
                  fontWeight: '800',
                  color: '#3E3E3E',
                }}
              >
                <span>Total</span>
                <span style={{ color: '#EA1D2C' }}>{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              style={{
                width: '100%',
                marginTop: '20px',
                padding: '14px',
                background: '#EA1D2C',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = '#C8151E')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = '#EA1D2C')
              }
            >
              Finalizar pedido →
            </button>

            <p
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#aaa',
                marginTop: '12px',
              }}
            >
              🔒 Pagamento 100% seguro
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
