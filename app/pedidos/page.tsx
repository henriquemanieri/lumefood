'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/header'
import { toast } from 'sonner'
import { formatCurrency, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/lib/utils'

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  restaurant: {
    id: string
    name: string
    cuisine: string
  }
  items: {
    id: string
    quantity: number
    menuItem: { name: string }
  }[]
}

export default function PedidosPage() {
  const { status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetch('/api/pedidos')
        .then((r) => r.json())
        .then((data) => setOrders(Array.isArray(data) ? data : data.orders ?? []))
        .catch(() => toast.error('Erro ao carregar pedidos'))
        .finally(() => setLoading(false))
    }
  }, [status])

  function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F7F7' }}>
        <Header />
        <div
          style={{
            maxWidth: '800px',
            margin: '40px auto',
            padding: '0 24px',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{
                height: '120px',
                borderRadius: '16px',
                marginBottom: '16px',
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
          maxWidth: '800px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        <h1
          style={{
            fontSize: '26px',
            fontWeight: '800',
            color: '#3E3E3E',
            marginBottom: '24px',
          }}
        >
          Meus pedidos
        </h1>

        {orders.length === 0 ? (
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
              style={{ fontSize: '56px', display: 'block', marginBottom: '16px' }}
            >
              📦
            </span>
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#3E3E3E',
                marginBottom: '8px',
              }}
            >
              Você ainda não fez nenhum pedido
            </h2>
            <p style={{ color: '#717171', marginBottom: '24px', fontSize: '14px' }}>
              Explore os restaurantes e faça seu primeiro pedido!
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
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {orders.map((order) => {
              const statusLabel =
                ORDER_STATUS_LABELS[order.status] ?? order.status
              const statusColors = ORDER_STATUS_COLORS[order.status] ?? ''
              const [bgColor, textColor] = statusColors
                .split(' ')
                .map((c: string) => {
                  if (c.startsWith('bg-yellow'))
                    return c === 'bg-yellow-100' ? '#FEF9C3' : '#92400E'
                  if (c.startsWith('bg-blue'))
                    return c === 'bg-blue-100' ? '#DBEAFE' : '#1E40AF'
                  if (c.startsWith('bg-purple'))
                    return c === 'bg-purple-100' ? '#EDE9FE' : '#6B21A8'
                  if (c.startsWith('bg-orange'))
                    return c === 'bg-orange-100' ? '#FFEDD5' : '#9A3412'
                  if (c.startsWith('bg-green'))
                    return c === 'bg-green-100' ? '#DCFCE7' : '#166534'
                  if (c.startsWith('bg-red'))
                    return c === 'bg-red-100' ? '#FEE2E2' : '#991B1B'
                  return c
                })

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#fff',
                    borderRadius: '16px',
                    border: '1px solid #f0f0f0',
                    padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '12px',
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '17px',
                          fontWeight: '700',
                          color: '#3E3E3E',
                          marginBottom: '4px',
                        }}
                      >
                        {order.restaurant.name}
                      </h3>
                      <p style={{ fontSize: '12px', color: '#aaa' }}>
                        {formatDate(order.createdAt)} · #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <span
                      style={{
                        padding: '5px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        background: bgColor ?? '#F3F4F6',
                        color: textColor ?? '#374151',
                      }}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Items preview */}
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#717171',
                      marginBottom: '14px',
                    }}
                  >
                    {order.items
                      .slice(0, 3)
                      .map((i) => `${i.quantity}× ${i.menuItem.name}`)
                      .join(', ')}
                    {order.items.length > 3 &&
                      ` e +${order.items.length - 3} itens`}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #f5f5f5',
                      paddingTop: '14px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: '800',
                        color: '#EA1D2C',
                      }}
                    >
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <button
                      onClick={() => router.push(`/pedidos/${order.id}`)}
                      style={{
                        padding: '9px 20px',
                        background: '#EA1D2C',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '10px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          '#C8151E')
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          '#EA1D2C')
                      }
                    >
                      Ver detalhes →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
