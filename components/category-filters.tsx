'use client'

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

const CATEGORIES = [
  'Pizza', 'Hambúrguer', 'Japonês', 'Sushi', 'Frango',
  'Árabe', 'Brasileiro', 'Italiana', 'Mexicano', 'Vegetariano',
]

export default function CategoryFilters() {
  return (
    <section style={{ background: '#fff', padding: '20px 0', borderBottom: '1px solid #f0f0f0' }}>
      <div
        style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', gap: '12px', overflowX: 'auto' }}
        className="scrollbar-hide"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
              padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #f0f0f0',
              background: '#fafafa', cursor: 'pointer', minWidth: '80px', flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor = '#EA1D2C'
              ;(e.currentTarget as HTMLElement).style.background = '#FFF5F5'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor = '#f0f0f0'
              ;(e.currentTarget as HTMLElement).style.background = '#fafafa'
            }}
          >
            <span style={{ fontSize: '24px' }}>{CATEGORY_ICONS[cat] ?? '🍽️'}</span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#3E3E3E', whiteSpace: 'nowrap' }}>
              {cat}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
