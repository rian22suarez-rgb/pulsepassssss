export function Logo({ className }: { className?: string }) {
  return (
    <span className={className}>
      <span className="flex items-center gap-2">
        <svg aria-hidden viewBox="0 0 32 32" className="size-7">
          <rect width="32" height="32" rx="9" fill="#17432D" />
          <path d="M5 17h5l3-7 4 13 3-9 2 3h5" fill="none" stroke="#B4F03D" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-titulo text-2xl leading-none tracking-wide uppercase">PulsePass</span>
      </span>
    </span>
  )
}
