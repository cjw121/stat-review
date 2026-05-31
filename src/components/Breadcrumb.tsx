import Link from 'next/link'

interface Crumb {
  label: string
  href?: string
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm text-muted mb-4">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span className="opacity-40">/</span>}
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="hover:text-primary transition-colors duration-150"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-fg font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
