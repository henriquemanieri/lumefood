'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface AddToCartButtonProps {
  menuItemId: string
  itemName: string
}

export default function AddToCartButton({
  menuItemId,
  itemName,
}: AddToCartButtonProps) {
  const { status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAddToCart() {
    if (status === 'unauthenticated') {
      toast.error('Faça login para adicionar itens ao carrinho')
      router.push('/login')
      return
    }

    if (status === 'loading') return

    setLoading(true)
    try {
      const res = await fetch('/api/carrinho/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ menuItemId, quantity: 1 }),
      })

      if (res.ok) {
        toast.success(`${itemName} adicionado ao carrinho!`)
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Erro ao adicionar ao carrinho')
      }
    } catch {
      toast.error('Erro ao adicionar ao carrinho. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={loading || status === 'loading'}
      style={{
        padding: '8px 16px',
        background: loading ? '#ccc' : '#EA1D2C',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s',
        whiteSpace: 'nowrap',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
      onMouseEnter={(e) => {
        if (!loading)
          (e.currentTarget as HTMLElement).style.background = '#C8151E'
      }}
      onMouseLeave={(e) => {
        if (!loading)
          (e.currentTarget as HTMLElement).style.background = '#EA1D2C'
      }}
    >
      {loading ? (
        '...'
      ) : (
        <>
          <span>+</span> Adicionar
        </>
      )}
    </button>
  )
}
