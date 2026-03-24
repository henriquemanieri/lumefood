'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        toast.error('Email ou senha incorretos. Tente novamente.')
      } else {
        toast.success('Login realizado com sucesso!')
        router.push('/')
        router.refresh()
      }
    } catch {
      toast.error('Erro ao realizar login. Tente novamente.')
    } finally {
      setLoading(false)
    }
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
            Entre para pedir sua comida favorita
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#3E3E3E',
                marginBottom: '6px',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e5e5e5',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#3E3E3E',
                background: '#fafafa',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
                outline: 'none',
              }}
              onFocus={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C')
              }
              onBlur={(e) =>
                ((e.currentTarget as HTMLElement).style.borderColor = '#e5e5e5')
              }
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="password"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: '600',
                color: '#3E3E3E',
                marginBottom: '6px',
              }}
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1.5px solid #e5e5e5',
                borderRadius: '10px',
                fontSize: '14px',
                color: '#3E3E3E',
                background: '#fafafa',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
                outline: 'none',
              }}
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
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
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
          Não tem conta?{' '}
          <Link
            href="/register"
            style={{
              color: '#EA1D2C',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
