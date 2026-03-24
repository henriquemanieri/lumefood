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
  }
}

const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD', label: '💳 Cartão de crédito' },
  { value: 'DEBIT_CARD', label: '💳 Cartão de débito' },
  { value: 'PIX', label: '⚡ PIX' },
  { value: 'CASH', label: '💵 Dinheiro' },
]

export default function CheckoutPage() {
  const { status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetch('/api/carrinho')
        .then((r) => r.json())
        .then((data) => {
          if (data?.items?.length > 0) {
            setItems(data.items)
          } else {
            router.push('/carrinho')
          }
        })
        .catch(() => toast.error('Erro ao carregar carrinho'))
        .finally(() => setLoading(false))
    }
  }, [status])

  const subtotal = items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  )
  const deliveryFee = subtotal > 0 ? 599 : 0
  const total = subtotal + deliveryFee

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!address.trim()) {
      toast.error('Informe o endereço de entrega')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryAddress: address.trim(),
          paymentMethod,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Pedido realizado com sucesso! 🎉')
        router.push(`/pedidos/${data.id}`)
      } else {
        toast.error(data.error ?? 'Erro ao realizar pedido')
      }
    } catch {
      toast.error('Erro ao realizar pedido. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    border: '1.5px solid #e5e5e5',
    borderRadius: '10px',
    fontSize: '14px',
    color: '#3E3E3E',
    background: '#fafafa',
    boxSizing: 'border-box',
    outline: 'none',
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F7F7' }}>
        <Header />
        <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 24px' }}>
          <div
            className="skeleton"
            style={{ height: '400px', borderRadius: '16px' }}
          />
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
          gridTemplateColumns: '1fr 340px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '800',
              color: '#3E3E3E',
              marginBottom: '24px',
            }}
          >
            Finalizar pedido
          </h1>

          {/* Delivery address */}
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #f0f0f0',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#3E3E3E',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>📍</span> Endereço de entrega
            </h2>
            <div style={{ marginBottom: '12px' }}>
              <label
                htmlFor="address"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#3E3E3E',
                  marginBottom: '6px',
                }}
              >
                Endereço completo
              </label>
              <textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua das Flores, 123, Apto 4B – Bairro Centro, São Paulo, SP"
                required
                rows={3}
                style={{
                  ...inputStyle,
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C')
                }
                onBlur={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5')
                }
              />
            </div>
          </div>

          {/* Payment */}
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #f0f0f0',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#3E3E3E',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>💳</span> Forma de pagamento
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}
            >
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: `2px solid ${
                      paymentMethod === method.value ? '#EA1D2C' : '#f0f0f0'
                    }`,
                    background:
                      paymentMethod === method.value ? '#FFF5F5' : '#fafafa',
                    color:
                      paymentMethod === method.value ? '#EA1D2C' : '#3E3E3E',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              padding: '15px',
              background: submitting ? '#ccc' : '#EA1D2C',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: submitting ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {submitting
              ? 'Processando...'
              : `Confirmar pedido • ${formatCurrency(total)}`}
          </button>
        </form>

        {/* Order Summary */}
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
              marginBottom: '16px',
            }}
          >
            Seu pedido
          </h3>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              marginBottom: '16px',
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '14px',
                }}
              >
                <span style={{ color: '#3E3E3E' }}>
                  <span
                    style={{
                      fontWeight: '700',
                      color: '#EA1D2C',
                      marginRight: '6px',
                    }}
                  >
                    {item.quantity}×
                  </span>
                  {item.menuItem.name}
                </span>
                <span style={{ color: '#717171', fontWeight: '600' }}>
                  {formatCurrency(item.menuItem.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: '1px solid #f0f0f0',
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: '#717171',
              }}
            >
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: '#717171',
              }}
            >
              <span>Entrega</span>
              <span>{formatCurrency(deliveryFee)}</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '17px',
                fontWeight: '800',
                color: '#EA1D2C',
                borderTop: '2px solid #f0f0f0',
                paddingTop: '10px',
                marginTop: '2px',
              }}
            >
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
