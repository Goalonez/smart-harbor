import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/i18n/runtime'

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function formatClock(now: Date, language: string) {
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  const seconds = pad(now.getSeconds())
  const dateText = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  const weekdayText = new Intl.DateTimeFormat(language, {
    weekday: 'long',
  }).format(now)

  return {
    dateText,
    weekdayText,
    timeText: `${hours}:${minutes}:${seconds}`,
  }
}

export function HeroClock() {
  const [now, setNow] = useState(() => new Date())
  const { language } = useI18n()

  useEffect(() => {
    let timerId = 0

    const syncClock = () => {
      const current = new Date()
      setNow(current)
      timerId = window.setTimeout(syncClock, 1000 - current.getMilliseconds())
    }

    syncClock()

    return () => {
      window.clearTimeout(timerId)
    }
  }, [])

  const { dateText, weekdayText, timeText } = useMemo(
    () => formatClock(now, language),
    [language, now]
  )
  return (
    <div className="flex flex-col items-center">
      <p
        data-role="hero-title"
        className="animate-slide-up rounded-full border border-border/70 bg-background px-2.5 py-0.5 text-[9px] font-medium tracking-[0.18em] text-muted-foreground shadow-[0_6px_14px_rgba(15,23,42,0.04)] [animation-delay:60ms] md:text-[10px]"
      >
        {dateText} · {weekdayText}
      </p>
      <h2 className="mt-2 animate-slide-up pr-1 font-display text-[1.75rem] font-semibold tracking-[-0.04em] tabular-nums text-foreground [animation-delay:140ms] sm:text-[2.1rem] md:text-[2.55rem]">
        <span>{timeText}</span>
      </h2>
    </div>
  )
}
