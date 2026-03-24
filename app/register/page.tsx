'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao criar conta.')
      } else {
        toast.success('Conta criada com sucesso! Faça login para continuar.')
        router.push('/login')
      }
    } catch {
      toast.error('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
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
    transition: 'border-color 0.15s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#3E3E3E',
    marginBottom: '6px',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #EA1D2C 0%, #FF6B35 100%)',
        padding: '24px',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '40px' }}>🔥</span>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#EA1D2C',
              margin: '8px 0 4px',
            }}
          >
            LumeFood
          </h1>
          <p style={{ color: '#717171', fontSize: '14px' }}>
            Crie sua conta e comece a pedir
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="name" style={labelStyle}>
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="João Silva"
              required
              style={inputStyle}
              onFocus={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C')
              }
              onBlur={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5')
              }
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={inputStyle}
              onFocus={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C')
              }
              onBlur={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5')
              }
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={labelStyle}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
              style={inputStyle}
              onFocus={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C')
              }
              onBlur={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5')
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              background: loading ? '#ccc' : '#EA1D2C',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '24px',
            fontSize: '14px',
            color: '#717171',
          }}
        >
          Já tem conta?{' '}
          <Link
            href="/login"
            style={{
              color: '#EA1D2C',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
