import Link from "next/link"
import { ArrowLeftIcon } from "@/components/icons"

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-page px-5 py-16">
      <div className="text-center">
        <p className="font-display text-7xl font-semibold text-primary">404</p>
        <h1 className="mt-4 font-display text-2xl text-fg">这道题还没有被收录</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          你访问的页面不存在，可能是链接失效，或者内容已经被移动。
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-accent-strong"
        >
          <ArrowLeftIcon size={15} />
          回到首页
        </Link>
      </div>
    </div>
  )
}
