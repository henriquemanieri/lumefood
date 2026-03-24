import Header from '@/components/header'
import CategoryFilters from '@/components/category-filters'
import Link from 'next/link'
import { formatCurrency, formatDeliveryTime } from '@/lib/utils'

interface Restaurant {
  id: string
  name: string
  description: string | null
  cuisine: string
  rating: number | null
  deliveryTime: number
  deliveryFee: number
  minOrder: number
  imageUrl: string | null
}

const CATEGORY_ICONS: Record<string, string> = {
  Pizza: '🍕',
  Hambúrguer: '🍔',
  Japonês: '🍱',
  Sushi: '🍣',
  Árabe: '🥙',
  Brasileiro: '🍖',
  Italiana: '🍝',
  Chinês: '🥡',
  Mexicano: '🌮',
  Vegetariano: '🥗',
  Frango: '🍗',
}

const CUISINE_COLORS: Record<string, string> = {
  Pizza: '#FF6B35',
  Hambúrguer: '#8B4513',
  Japonês: '#DC143C',
  Sushi: '#20B2AA',
  Árabe: '#DAA520',
  Brasileiro: '#228B22',
  Italiana: '#008000',
  Chinês: '#FF0000',
  Mexicano: '#FF8C00',
  Vegetariano: '#32CD32',
  default: '#EA1D2C',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          style={{
            fontSize: '12px',
            color: star <= Math.round(rating) ? '#FFB800' : '#D1D5DB',
          }}
        >
          ★
        </span>
      ))}
      <span
        style={{ fontSize: '12px', color: '#717171', marginLeft: '2px' }}
      >
        {rating.toFixed(1)}
      </span>
    </div>
  )
}

async function getRestaurants(): Promise<Restaurant[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/restaurantes`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : data.restaurants ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const restaurants = await getRestaurants()

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7' }}>
      <Header />

      {/* Hero Banner */}
      <section
        style={{
          background: 'linear-gradient(135deg, #EA1D2C 0%, #FF6B35 100%)',
          padding: '48px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#fff',
              marginBottom: '12px',
              lineHeight: '1.2',
            }}
          >
            Comida boa, entregue rápido! 🚀
          </h1>
          <p
            style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.9)',
              marginBottom: '28px',
            }}
          >
            Os melhores restaurantes da cidade, na palma da sua mão
          </p>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '12px 20px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              <span>⚡</span> Entrega rápida
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '12px 20px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              <span>🔒</span> Pagamento seguro
            </div>
            <div
              style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '12px 20px',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              <span>⭐</span> Avaliações reais
            </div>
          </div>
        </div>
      </section>

      <CategoryFilters />

      {/* Restaurants */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        <h2
          style={{
            fontSize: '22px',
            fontWeight: '700',
            color: '#3E3E3E',
            marginBottom: '20px',
          }}
        >
          Restaurantes disponíveis{' '}
          <span
            style={{
              fontSize: '15px',
              fontWeight: '400',
              color: '#717171',
            }}
          >
            ({restaurants.length})
          </span>
        </h2>

        {restaurants.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #f0f0f0',
            }}
          >
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>
              🍽️
            </span>
            <p style={{ fontSize: '18px', color: '#717171', fontWeight: '500' }}>
              Nenhum restaurante disponível no momento.
            </p>
            <p style={{ fontSize: '14px', color: '#aaa', marginTop: '8px' }}>
              Tente novamente mais tarde.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            {restaurants.map((restaurant) => {
              const color =
                CUISINE_COLORS[restaurant.cuisine] ?? CUISINE_COLORS.default
              return (
                <Link
                  key={restaurant.id}
                  href={`/restaurante/${restaurant.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div
                    className="transition-card"
                    style={{
                      background: '#fff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      border: '1px solid #f0f0f0',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Image / Placeholder */}
                    <div
                      style={{
                        height: '160px',
                        background: restaurant.imageUrl
                          ? `url(${restaurant.imageUrl}) center/cover`
                          : `linear-gradient(135deg, ${color}22 0%, ${color}44 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      {!restaurant.imageUrl && (
                        <span style={{ fontSize: '52px' }}>
                          {CATEGORY_ICONS[restaurant.cuisine] ?? '🍽️'}
                        </span>
                      )}
                      {/* Cuisine badge */}
                      <span
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          background: color,
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '4px 10px',
                          borderRadius: '20px',
                        }}
                      >
                        {restaurant.cuisine}
                      </span>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px' }}>
                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#3E3E3E',
                          marginBottom: '6px',
                        }}
                        className="line-clamp-1"
                      >
                        {restaurant.name}
                      </h3>

                      {restaurant.description && (
                        <p
                          style={{
                            fontSize: '13px',
                            color: '#717171',
                            marginBottom: '10px',
                          }}
                          className="line-clamp-2"
                        >
                          {restaurant.description}
                        </p>
                      )}

                      {restaurant.rating !== null && (
                        <div style={{ marginBottom: '10px' }}>
                          <StarRating rating={restaurant.rating} />
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid #f5f5f5',
                          paddingTop: '10px',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '12px',
                            color: '#717171',
                          }}
                        >
                          <span>🕒</span>
                          <span>{formatDeliveryTime(restaurant.deliveryTime)}</span>
                        </div>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#717171',
                          }}
                        >
                          {restaurant.deliveryFee === 0 ? (
                            <span
                              style={{ color: '#22C55E', fontWeight: '700' }}
                            >
                              Grátis
                            </span>
                          ) : (
                            <span>
                              {formatCurrency(restaurant.deliveryFee)} entrega
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: '#717171' }}>
                          Mín.{' '}
                          <span style={{ fontWeight: '600' }}>
                            {formatCurrency(restaurant.minOrder)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          padding: '24px',
          textAlign: 'center',
          marginTop: '40px',
        }}
      >
        <p style={{ color: '#aaa', fontSize: '13px' }}>
          🔥 LumeFood — Todos os direitos reservados © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  )
}
