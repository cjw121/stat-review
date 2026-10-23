import Link from "next/link"
import { ChevronRightIcon } from "./icons"

interface Crumb {
  label: string
  href?: string
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="面包屑" className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRightIcon size={13} className="text-faint" />}
          {crumb.href ? (
            <Link href={crumb.href} className="transition-colors hover:text-primary">
              {crumb.label}
            </Link>
          ) : (
            <span className="font-medium text-fg">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
