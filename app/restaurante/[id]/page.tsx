import Header from '@/components/header'
import AddToCartButton from '@/components/add-to-cart-button'
import { formatCurrency, formatDeliveryTime } from '@/lib/utils'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  available: boolean
}

interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

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
  menuCategories?: MenuCategory[]
}

async function getRestaurant(id: string): Promise<Restaurant | null> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/restaurantes/${id}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

async function getMenu(id: string): Promise<MenuCategory[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/restaurantes/${id}/cardapio`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : data.categories ?? []
  } catch {
    return []
  }
}

export default async function RestaurantePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [restaurant, categories] = await Promise.all([
    getRestaurant(id),
    getMenu(id),
  ])

  if (!restaurant) {
    return (
      <div style={{ minHeight: '100vh', background: '#F7F7F7' }}>
        <Header />
        <div
          style={{
            maxWidth: '800px',
            margin: '60px auto',
            textAlign: 'center',
            padding: '40px',
            background: '#fff',
            borderRadius: '16px',
          }}
        >
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>
            😕
          </span>
          <h2 style={{ fontSize: '22px', color: '#3E3E3E', marginBottom: '8px' }}>
            Restaurante não encontrado
          </h2>
          <p style={{ color: '#717171' }}>
            Este restaurante não está disponível no momento.
          </p>
        </div>
      </div>
    )
  }

  const allCategories =
    categories.length > 0
      ? categories
      : restaurant.menuCategories ?? []

  return (
    <div style={{ minHeight: '100vh', background: '#F7F7F7' }}>
      <Header />

      {/* Restaurant Banner */}
      <div
        style={{
          background: restaurant.imageUrl
            ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${restaurant.imageUrl}) center/cover`
            : 'linear-gradient(135deg, #EA1D2C 0%, #FF6B35 100%)',
          padding: '40px 24px',
          color: '#fff',
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: '700',
              marginBottom: '12px',
              backdropFilter: 'blur(4px)',
            }}
          >
            {restaurant.cuisine}
          </div>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '800',
              marginBottom: '8px',
            }}
          >
            {restaurant.name}
          </h1>
          {restaurant.description && (
            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255,255,255,0.85)',
                marginBottom: '20px',
                maxWidth: '600px',
              }}
            >
              {restaurant.description}
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            {restaurant.rating !== null && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                <span style={{ color: '#FFB800' }}>★</span>
                {restaurant.rating.toFixed(1)}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              🕒 {formatDeliveryTime(restaurant.deliveryTime)}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              🛵{' '}
              {restaurant.deliveryFee === 0
                ? 'Entrega grátis'
                : formatCurrency(restaurant.deliveryFee)}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.15)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '14px',
                fontWeight: '600',
              }}
            >
              🛒 Mín. {formatCurrency(restaurant.minOrder)}
            </div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <main
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '32px 24px',
        }}
      >
        {allCategories.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px',
              background: '#fff',
              borderRadius: '16px',
              border: '1px solid #f0f0f0',
            }}
          >
            <span
              style={{
                fontSize: '48px',
                display: 'block',
                marginBottom: '16px',
              }}
            >
              🍽️
            </span>
            <p style={{ fontSize: '16px', color: '#717171' }}>
              Cardápio ainda não disponível.
            </p>
          </div>
        ) : (
          allCategories.map((category) => (
            <div key={category.id} style={{ marginBottom: '40px' }}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#3E3E3E',
                  marginBottom: '16px',
                  paddingBottom: '8px',
                  borderBottom: '3px solid #EA1D2C',
                  display: 'inline-block',
                }}
              >
                {category.name}
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '16px',
                  marginTop: '16px',
                }}
              >
                {category.items
                  .filter((item) => item.available !== false)
                  .map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#fff',
                        borderRadius: '14px',
                        border: '1px solid #f0f0f0',
                        overflow: 'hidden',
                        display: 'flex',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                        transition: 'box-shadow 0.2s',
                      }}
                    >
                      {/* Item image */}
                      {item.imageUrl && (
                        <div
                          style={{
                            width: '110px',
                            minWidth: '110px',
                            background: `url(${item.imageUrl}) center/cover`,
                          }}
                        />
                      )}

                      {/* Item content */}
                      <div
                        style={{
                          flex: 1,
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '8px',
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              fontSize: '15px',
                              fontWeight: '700',
                              color: '#3E3E3E',
                              marginBottom: '4px',
                            }}
                          >
                            {item.name}
                          </h3>
                          {item.description && (
                            <p
                              style={{
                                fontSize: '13px',
                                color: '#717171',
                                lineHeight: '1.4',
                              }}
                              className="line-clamp-2"
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '16px',
                              fontWeight: '800',
                              color: '#EA1D2C',
                            }}
                          >
                            {formatCurrency(item.price)}
                          </span>
                          <AddToCartButton
                            menuItemId={item.id}
                            itemName={item.name}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  )
}
