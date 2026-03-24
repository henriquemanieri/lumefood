'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  formatCurrency,
  ORDER_STATUS_LABELS,
  VALID_STATUS_TRANSITIONS,
} from '@/lib/utils'

interface Order {
  id: string
  status: string
  totalAmount: number
  deliveryAddress: string
  paymentMethod: string
  createdAt: string
  user: { name: string | null; email: string }
  items: {
    id: string
    quantity: number
    menuItem: { name: string }
  }[]
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#FEF9C3', text: '#92400E' },
  ACCEPTED: { bg: '#DBEAFE', text: '#1E40AF' },
  PREPARING: { bg: '#EDE9FE', text: '#6B21A8' },
  OUT_FOR_DELIVERY: { bg: '#FFEDD5', text: '#9A3412' },
  DELIVERED: { bg: '#DCFCE7', text: '#166534' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B' },
}

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_CARD: '💳 Crédito',
  DEBIT_CARD: '💳 Débito',
  PIX: '⚡ PIX',
  CASH: '💵 Dinheiro',
}

export default function AdminPedidosPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [updating, setUpdating] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

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
      fetchOrders()
      // refresh every 30s
      intervalRef.current = setInterval(fetchOrders, 30000)
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current)
      }
    }
  }, [status])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/admin/pedidos')
      const data = await res.json()
      setOrders(Array.isArray(data) ? data : data.orders ?? [])
    } catch {
      // silent refresh errors
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId)
    try {
      const res = await fetch(`/api/pedidos/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Status atualizado para: ${ORDER_STATUS_LABELS[newStatus]}`)
        await fetchOrders()
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Erro ao atualizar status')
      }
    } catch {
      toast.error('Erro ao atualizar status')
    } finally {
      setUpdating(null)
    }
  }

  function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr))
  }

  const filtered =
    statusFilter === 'ALL'
      ? orders
      : orders.filter((o) => o.status === statusFilter)

  const sortedOrders = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const statusTabCounts: Record<string, number> = {}
  orders.forEach((o) => {
    statusTabCounts[o.status] = (statusTabCounts[o.status] ?? 0) + 1
  })

  if (status === 'loading' || loading) {
    return (
      <div style={{ padding: '32px' }}>
        <div className="skeleton" style={{ height: '50px', borderRadius: '10px', marginBottom: '20px' }} />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '12px', marginBottom: '12px' }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#3E3E3E' }}>
            Pedidos
          </h1>
          <p style={{ color: '#717171', fontSize: '14px' }}>
            {orders.length} pedidos no total · atualiza a cada 30s
          </p>
        </div>
        <button
          onClick={fetchOrders}
          style={{
            padding: '9px 18px',
            background: '#f5f5f5',
            border: '1px solid #e5e5e5',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#3E3E3E',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          🔄 Atualizar
        </button>
      </div>

      {/* Status filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          overflowX: 'auto',
          paddingBottom: '4px',
        }}
      >
        {['ALL', ...Object.keys(ORDER_STATUS_LABELS)].map((s) => {
          const count = s === 'ALL' ? orders.length : (statusTabCounts[s] ?? 0)
          const isActive = statusFilter === s
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: isActive ? 'none' : '1px solid #e5e5e5',
                background: isActive ? '#EA1D2C' : '#fff',
                color: isActive ? '#fff' : '#717171',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {s === 'ALL' ? 'Todos' : ORDER_STATUS_LABELS[s]}
              {count > 0 && (
                <span
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.3)' : '#f0f0f0',
                    borderRadius: '10px',
                    padding: '1px 6px',
                    fontSize: '11px',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Orders list */}
      {sortedOrders.length === 0 ? (
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            border: '1px solid #f0f0f0',
          }}
        >
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>
            📦
          </span>
          <p style={{ color: '#717171' }}>Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {sortedOrders.map((order) => {
            const sc = STATUS_COLORS[order.status] ?? { bg: '#F3F4F6', text: '#374151' }
            const transitions = VALID_STATUS_TRANSITIONS[order.status] ?? []
            const isUpdating = updating === order.id

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
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#3E3E3E' }}>
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: sc.bg,
                          color: sc.text,
                        }}
                      >
                        {ORDER_STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', color: '#717171' }}>
                        👤 {order.user.name ?? order.user.email}
                      </span>
                      <span style={{ fontSize: '13px', color: '#717171' }}>
                        🕒 {formatDate(order.createdAt)}
                      </span>
                      <span style={{ fontSize: '13px', color: '#717171' }}>
                        {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#EA1D2C' }}>
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>

                {/* Items */}
                <p style={{ fontSize: '13px', color: '#717171', marginBottom: '14px' }}>
                  {order.items
                    .slice(0, 4)
                    .map((i) => `${i.quantity}× ${i.menuItem.name}`)
                    .join(', ')}
                  {order.items.length > 4 && ` e +${order.items.length - 4} itens`}
                </p>

                {/* Address */}
                <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '14px' }}>
                  📍 {order.deliveryAddress}
                </p>

                {/* Status update */}
                {transitions.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {transitions.map((nextStatus) => {
                      const nextSc = STATUS_COLORS[nextStatus] ?? {
                        bg: '#F3F4F6',
                        text: '#374151',
                      }
                      return (
                        <button
                          key={nextStatus}
                          onClick={() => updateStatus(order.id, nextStatus)}
                          disabled={isUpdating}
                          style={{
                            padding: '8px 16px',
                            background: isUpdating ? '#f0f0f0' : nextSc.bg,
                            color: isUpdating ? '#aaa' : nextSc.text,
                            border: `1.5px solid ${isUpdating ? '#e5e5e5' : nextSc.text}`,
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: isUpdating ? 'not-allowed' : 'pointer',
                            transition: 'opacity 0.15s',
                          }}
                        >
                          {isUpdating
                            ? 'Atualizando...'
                            : `→ ${ORDER_STATUS_LABELS[nextStatus]}`}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
