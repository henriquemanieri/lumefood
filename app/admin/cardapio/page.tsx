'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  imageUrl: string | null
  available: boolean
}

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: '',
  imageUrl: '',
}

export default function AdminCardapioPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

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
      fetchItems()
    }
  }, [status])

  async function fetchItems() {
    try {
      const res = await fetch('/api/admin/cardapio')
      const data = await res.json()
      setItems(Array.isArray(data) ? data : data.items ?? [])
    } catch {
      toast.error('Erro ao carregar cardápio')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setShowModal(true)
  }

  function openEdit(item: MenuItem) {
    setForm({
      name: item.name,
      description: item.description ?? '',
      price: (item.price / 100).toFixed(2),
      category: item.category,
      imageUrl: item.imageUrl ?? '',
    })
    setEditingId(item.id)
    setShowModal(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price: Math.round(parseFloat(form.price.replace(',', '.')) * 100),
        category: form.category,
        imageUrl: form.imageUrl || null,
      }

      let res: Response
      if (editingId) {
        res = await fetch(`/api/admin/cardapio/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/cardapio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (res.ok) {
        toast.success(editingId ? 'Item atualizado!' : 'Item adicionado!')
        setShowModal(false)
        await fetchItems()
      } else {
        const data = await res.json()
        toast.error(data.error ?? 'Erro ao salvar item')
      }
    } catch {
      toast.error('Erro ao salvar item')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remover "${name}" do cardápio?`)) return
    try {
      const res = await fetch(`/api/admin/cardapio/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast.success('Item removido')
        await fetchItems()
      } else {
        toast.error('Erro ao remover item')
      }
    } catch {
      toast.error('Erro ao remover item')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '1.5px solid #e5e5e5',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  if (status === 'loading' || loading) {
    return (
      <div style={{ padding: '32px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton" style={{ height: '60px', borderRadius: '10px', marginBottom: '12px' }} />
        ))}
      </div>
    )
  }

  const categories = [...new Set(items.map((i) => i.category))].sort()

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#3E3E3E' }}>
            Cardápio
          </h1>
          <p style={{ color: '#717171', fontSize: '14px' }}>
            {items.length} itens cadastrados
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            padding: '11px 22px',
            background: '#EA1D2C',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ fontSize: '18px' }}>+</span> Novo item
        </button>
      </div>

      {/* Table */}
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          border: '1px solid #f0f0f0',
          overflow: 'hidden',
        }}
      >
        {items.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>
              🍽️
            </span>
            <p style={{ color: '#717171' }}>Nenhum item no cardápio ainda.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#fafafa' }}>
                {['Nome', 'Categoria', 'Preço', 'Disponível', 'Ações'].map(
                  (h) => (
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
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={item.id}
                  style={{
                    borderTop: idx > 0 ? '1px solid #f5f5f5' : 'none',
                  }}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#3E3E3E' }}>
                        {item.name}
                      </p>
                      {item.description && (
                        <p style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }} className="line-clamp-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: '#FFF5F5',
                        color: '#EA1D2C',
                      }}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '14px 20px',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#3E3E3E',
                    }}
                  >
                    {formatCurrency(item.price)}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: item.available ? '#DCFCE7' : '#FEE2E2',
                        color: item.available ? '#166534' : '#991B1B',
                      }}
                    >
                      {item.available ? 'Sim' : 'Não'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openEdit(item)}
                        style={{
                          padding: '7px 16px',
                          background: '#F5F5F5',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#3E3E3E',
                          cursor: 'pointer',
                        }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        style={{
                          padding: '7px 16px',
                          background: '#FEE2E2',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '600',
                          color: '#991B1B',
                          cursor: 'pointer',
                        }}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false)
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '28px',
              width: '100%',
              maxWidth: '500px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
              }}
            >
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#3E3E3E' }}>
                {editingId ? 'Editar item' : 'Novo item'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#aaa',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#3E3E3E', display: 'block', marginBottom: '5px' }}>
                    Nome *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="Ex: Pizza Margherita"
                    style={inputStyle}
                    onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C')}
                    onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5')}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#3E3E3E', display: 'block', marginBottom: '5px' }}>
                    Descrição
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descrição do item"
                    rows={2}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                    onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C')}
                    onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5')}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#3E3E3E', display: 'block', marginBottom: '5px' }}>
                      Preço (R$) *
                    </label>
                    <input
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                      placeholder="29,90"
                      type="text"
                      style={inputStyle}
                      onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C')}
                      onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5')}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#3E3E3E', display: 'block', marginBottom: '5px' }}>
                      Categoria *
                    </label>
                    <input
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      required
                      placeholder="Ex: Pizzas"
                      list="categories-list"
                      style={inputStyle}
                      onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C')}
                      onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5')}
                    />
                    <datalist id="categories-list">
                      {categories.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#3E3E3E', display: 'block', marginBottom: '5px' }}>
                    URL da imagem
                  </label>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..."
                    type="url"
                    style={inputStyle}
                    onFocus={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C')}
                    onBlur={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5')}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: '11px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#3E3E3E',
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 2,
                    padding: '11px',
                    background: saving ? '#ccc' : '#EA1D2C',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#fff',
                    cursor: saving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Adicionar item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
