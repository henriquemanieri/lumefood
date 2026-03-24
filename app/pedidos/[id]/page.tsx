'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/header'
import { toast } from 'sonner'
import {
  formatCurrency,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from '@/lib/utils'

interface OrderItem {
  id: string
  quantity: number
  unitPrice: number
  menuItem: { name: string }
}

interface StatusHistory {
  id: string
  status: string
  createdAt: string
}

interface Order {
  id: string
  status: string
  totalAmount: number
  deliveryAddress: string
  paymentMethod: string
  createdAt: string
  review: { id: string } | null
  restaurant: { id: string; name: string; cuisine: string }
  items: OrderItem[]
  statusHistory?: StatusHistory[]
}

const STATUS_STEPS = [
  'PENDING',
  'ACCEPTED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

const PAYMENT_LABELS: Record<string, string> = {
  CREDIT_CARD: '💳 Cartão de crédito',
  DEBIT_CARD: '💳 Cartão de débito',
  PIX: '⚡ PIX',
  CASH: '💵 Dinheiro',
}

function getStatusColor(status: string) {
  const colors = ORDER_STATUS_COLORS[status] ?? ''
  const map: Record<string, { bg: string; text: string }> = {
    'bg-yellow-100 text-yellow-800': { bg: '#FEF9C3', text: '#92400E' },
    'bg-blue-100 text-blue-800': { bg: '#DBEAFE', text: '#1E40AF' },
    'bg-purple-100 text-purple-800': { bg: '#EDE9FE', text: '#6B21A8' },
    'bg-orange-100 text-orange-800': { bg: '#FFEDD5', text: '#9A3412' },
    'bg-green-100 text-green-800': { bg: '#DCFCE7', text: '#166534' },
    'bg-red-100 text-red-800': { bg: '#FEE2E2', text: '#991B1B' },
  }
  return map[colors] ?? { bg: '#F3F4F6', text: '#374151' }
}

export default function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewDone, setReviewDone] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    if (status === 'authenticated') {
      fetch(`/api/pedidos/${id}`)
        .then((r) => r.json())
        .then((data) => setOrder(data))
        .catch(() => toast.error('Erro ao carregar pedido'))
        .finally(() => setLoading(false))
    }
  }, [status, id])

  async function submitReview() {
    setReviewSubmitting(true)
    try {
      const res = await fetch('/api/avaliacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, rating, comment }),
      })
      if (res.ok) {
        toast.success('Avaliação enviada! Obrigado. 🌟')
        setReviewDone(true)
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Erro ao enviar avaliação')
      }
    } catch {
      toast.error('Erro ao enviar avaliação')
    } finally {
      setReviewSubmitting(false)
    }
  }

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
        <div style={{ maxWidth: '700px', margin: '40px auto', padding: '0 24px' }}>
          <div className="skeleton" style={{ height: '500px', borderRadius: '16px' }} />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F7F7' }}>
        <Header />
        <div style={{ maxWidth: '700px', margin: '60px auto', textAlign: 'center', padding: '40px', background: '#fff', borderRadius: '16px' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>😕</span>
          <h2 style={{ fontSize: '22px', color: '#3E3E3E' }}>Pedido não encontrado</h2>
        </div>
      </div>
    )
  }

  const { bg: statusBg, text: statusText } = getStatusColor(order.status)
  const currentStepIdx = STATUS_STEPS.indexOf(order.status)
  const isCancelled = order.status === 'CANCELLED'

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7' }}>
      <Header />

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Back */}
        <button
          onClick={() => router.push('/pedidos')}
          style={{
            background: 'none',
            border: 'none',
            color: '#EA1D2C',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            padding: '0',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          ← Meus pedidos
        </button>

        {/* Header card */}
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#3E3E3E', marginBottom: '4px' }}>
                {order.restaurant.name}
              </h1>
              <p style={{ fontSize: '12px', color: '#aaa' }}>
                Pedido #{order.id.slice(0, 8).toUpperCase()} · {formatDate(order.createdAt)}
              </p>
            </div>
            <span
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: '700',
                background: statusBg,
                color: statusText,
              }}
            >
              {ORDER_STATUS_LABELS[order.status] ?? order.status}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#717171' }}>
            <span>📍 {order.deliveryAddress}</span>
            <span>{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</span>
          </div>
        </div>

        {/* Status timeline */}
        {!isCancelled && (
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #f0f0f0',
              padding: '24px',
              marginBottom: '20px',
            }}
          >
            <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#3E3E3E', marginBottom: '20px' }}>
              Acompanhe seu pedido
            </h2>
            <div style={{ position: 'relative' }}>
              {STATUS_STEPS.map((step, idx) => {
                const isCompleted = idx <= currentStepIdx
                const isCurrent = idx === currentStepIdx
                const stepIcons: Record<string, string> = {
                  PENDING: '⏳',
                  ACCEPTED: '✅',
                  PREPARING: '👨‍🍳',
                  OUT_FOR_DELIVERY: '🛵',
                  DELIVERED: '🎉',
                }
                return (
                  <div
                    key={step}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      marginBottom: idx < STATUS_STEPS.length - 1 ? '0' : '0',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: isCompleted ? '#EA1D2C' : '#f0f0f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          flexShrink: 0,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(234,29,44,0.2)' : 'none',
                          transition: 'all 0.3s',
                        }}
                      >
                        {isCompleted ? (
                          <span>{stepIcons[step]}</span>
                        ) : (
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ccc', display: 'block' }} />
                        )}
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          style={{
                            width: '2px',
                            height: '32px',
                            background: idx < currentStepIdx ? '#EA1D2C' : '#f0f0f0',
                            transition: 'background 0.3s',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ paddingBottom: idx < STATUS_STEPS.length - 1 ? '32px' : '0', marginTop: '-4px' }}>
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: isCurrent ? '700' : '500',
                          color: isCompleted ? '#3E3E3E' : '#aaa',
                        }}
                      >
                        {ORDER_STATUS_LABELS[step]}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div
          style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            padding: '24px',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ fontSize: '15px', fontWeight: '700', color: '#3E3E3E', marginBottom: '16px' }}>
            Itens do pedido
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {order.items.map((item) => (
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
                  <span style={{ fontWeight: '700', color: '#EA1D2C', marginRight: '6px' }}>
                    {item.quantity}×
                  </span>
                  {item.menuItem.name}
                </span>
                <span style={{ color: '#717171', fontWeight: '600' }}>
                  {formatCurrency((item.unitPrice ?? 0) * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div
            style={{
              borderTop: '2px solid #f0f0f0',
              paddingTop: '14px',
              marginTop: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '18px',
              fontWeight: '800',
            }}
          >
            <span style={{ color: '#3E3E3E' }}>Total</span>
            <span style={{ color: '#EA1D2C' }}>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Review */}
        {order.status === 'DELIVERED' && !order.review && !reviewDone && (
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              border: '2px solid #EA1D2C',
              padding: '24px',
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
              <span>⭐</span> Avalie seu pedido
            </h2>

            {/* Star selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '32px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: star <= rating ? '#FFB800' : '#D1D5DB',
                    padding: '0',
                    transition: 'color 0.1s',
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi sua experiência (opcional)"
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e5e5e5',
                borderRadius: '10px',
                fontSize: '14px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: '14px',
                boxSizing: 'border-box',
              }}
              onFocus={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C')
              }
              onBlur={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5')
              }
            />

            <button
              onClick={submitReview}
              disabled={reviewSubmitting}
              style={{
                padding: '11px 28px',
                background: reviewSubmitting ? '#ccc' : '#EA1D2C',
                color: '#fff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: reviewSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {reviewSubmitting ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </div>
        )}

        {(reviewDone || (order.status === 'DELIVERED' && order.review)) && (
          <div
            style={{
              background: '#F0FDF4',
              borderRadius: '16px',
              border: '1px solid #BBF7D0',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
              🌟
            </span>
            <p style={{ fontSize: '15px', fontWeight: '600', color: '#166534' }}>
              Avaliação enviada! Obrigado pelo feedback.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
