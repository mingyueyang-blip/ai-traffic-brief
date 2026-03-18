import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/brief', label: 'Brief' },
  { to: '/insights', label: 'Insights' },
  { to: '/delivery', label: 'Delivery' },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-base/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-semibold text-brand">
            AI Traffic Brief
          </h1>
          <nav className="flex gap-1">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-glow text-brand'
                      : 'text-secondary hover:text-primary hover:bg-elevated'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm text-secondary">
          <span>Last 24h</span>
          <span className="text-muted">·</span>
          <span>Unique Users</span>
        </div>
      </div>
    </header>
  )
}
