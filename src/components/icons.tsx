import type { SVGProps, ReactNode } from "react"

export type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Base({ size = 18, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export function SearchIcon(props: IconProps) {
  return <Base {...props}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></Base>
}

export function MoonIcon(props: IconProps) {
  return <Base {...props}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" /></Base>
}

export function SunIcon(props: IconProps) {
  return <Base {...props}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></Base>
}

export function MenuIcon(props: IconProps) {
  return <Base {...props}><path d="M4 7h16M4 12h16M4 17h16" /></Base>
}

export function XIcon(props: IconProps) {
  return <Base {...props}><path d="M18 6 6 18M6 6l12 12" /></Base>
}

export function ChevronRightIcon(props: IconProps) {
  return <Base {...props}><path d="m9 18 6-6-6-6" /></Base>
}

export function ChevronDownIcon(props: IconProps) {
  return <Base {...props}><path d="m6 9 6 6 6-6" /></Base>
}

export function ArrowRightIcon(props: IconProps) {
  return <Base {...props}><path d="M5 12h14M13 6l6 6-6 6" /></Base>
}

export function ArrowLeftIcon(props: IconProps) {
  return <Base {...props}><path d="M19 12H5M11 6l-6 6 6 6" /></Base>
}

export function ShuffleIcon(props: IconProps) {
  return <Base {...props}><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></Base>
}

export function BookmarkIcon(props: IconProps) {
  return <Base {...props}><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" /></Base>
}

export function BookmarkFilledIcon(props: IconProps) {
  return <Base {...props} fill="currentColor" stroke="none"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16Z" /></Base>
}

export function CheckIcon(props: IconProps) {
  return <Base {...props}><path d="m5 12 5 5 9-10" /></Base>
}

export function CircleCheckIcon(props: IconProps) {
  return <Base {...props}><circle cx="12" cy="12" r="9" /><path d="m8.5 12 2.5 2.5 4.5-5" /></Base>
}

export function SparklesIcon(props: IconProps) {
  return <Base {...props}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></Base>
}

export function LayersIcon(props: IconProps) {
  return <Base {...props}><path d="m12 2 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 17l9 5 9-5" /></Base>
}

export function ClockIcon(props: IconProps) {
  return <Base {...props}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Base>
}

export function CommandIcon(props: IconProps) {
  return <Base {...props}><path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6Z" /></Base>
}

export function SigmaIcon(props: IconProps) {
  return <Base {...props}><path d="M5 4h14v3l-8 5 8 5v3H5" /></Base>
}

export function BarChartIcon(props: IconProps) {
  return <Base {...props}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></Base>
}

