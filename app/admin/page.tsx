'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatCurrency, ORDER_STATUS_LABELS } from '@/lib/utils'

interface Restaurant {
  id: string
  name: string
  cuisine: string
}

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  user: { name: string | null; email: string }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      if ((session?.user as { role?: string })?.role !== 'ADMIN') {
        router.push('/')
        return
      }
      Promise.all([
        fetch('/api/admin/restaurante').then((r) => r.json()),
        fetch('/api/admin/pedidos').then((r) => r.json()),
      ])
        .then(([restData, ordersData]) => {
          setRestaurant(restData)
          setOrders(Array.isArray(ordersData) ? ordersData : ordersData.orders ?? [])
        })
        .catch(() => toast.error('Erro ao carregar dados'))
        .finally(() => setLoading(false))
    }
  }, [status])

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length
  const today = new Date().toDateString()
  const todayRevenue = orders
    .filter(
      (o) =>
        new Date(o.createdAt).toDateString() === today &&
        o.status !== 'CANCELLED'
    )
    .reduce((sum, o) => sum + o.totalAmount, 0)

  const recentOrders = [...orders]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)

  function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px' }} />
          ))}
        </div>
        <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#3E3E3E', marginBottom: '4px' }}>
          Dashboard
        </h1>
        {restaurant && (
          <p style={{ color: '#717171', fontSize: '14px' }}>
            {restaurant.name} · {restaurant.cuisine}
          </p>
        )}
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        {[
          {
            label: 'Total de pedidos',
            value: totalOrders,
            icon: '📦',
            color: '#3B82F6',
            bg: '#EFF6FF',
          },
          {
            label: 'Pedidos pendentes',
            value: pendingOrders,
            icon: '⏳',
            color: '#F59E0B',
            bg: '#FFFBEB',
          },
          {
            label: 'Receita hoje',
            value: formatCurrency(todayRevenue),
            icon: '💰',
            color: '#10B981',
            bg: '#ECFDF5',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '20px 24px',
              border: '1px solid #f0f0f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                marginBottom: '12px',
              }}
            >
              {stat.icon}
            </div>
            <p style={{ fontSize: '13px', color: '#717171', marginBottom: '4px' }}>
              {stat.label}
            </p>
            <p
              style={{
                fontSize: '26px',
                fontWeight: '800',
                color: stat.color,
              }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f5f5f5',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#3E3E3E' }}>
            Pedidos recentes
          </h2>
          <button
            onClick={() => router.push('/admin/pedidos')}
            style={{
              background: 'none',
              border: 'none',
              color: '#EA1D2C',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Ver todos →
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>📦</span>
            Nenhum pedido ainda
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['Pedido', 'Cliente', 'Status', 'Total', 'Data'].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 20px',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#717171',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, idx) => {
                const statusColors: Record<string, { bg: string; text: string }> = {
                  PENDING: { bg: '#FEF9C3', text: '#92400E' },
                  ACCEPTED: { bg: '#DBEAFE', text: '#1E40AF' },
                  PREPARING: { bg: '#EDE9FE', text: '#6B21A8' },
                  OUT_FOR_DELIVERY: { bg: '#FFEDD5', text: '#9A3412' },
                  DELIVERED: { bg: '#DCFCE7', text: '#166534' },
                  CANCELLED: { bg: '#FEE2E2', text: '#991B1B' },
                }
                const sc = statusColors[order.status] ?? { bg: '#F3F4F6', text: '#374151' }
                return (
                  <tr
                    key={order.id}
                    style={{
                      borderTop: idx > 0 ? '1px solid #f5f5f5' : 'none',
                    }}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#717171' }}>
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#3E3E3E', fontWeight: '500' }}>
                      {order.user.name ?? order.user.email}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: sc.bg,
                          color: sc.text,
                        }}
                      >
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', fontWeight: '700', color: '#EA1D2C' }}>
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '12px', color: '#aaa' }}>
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
