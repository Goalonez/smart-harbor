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
    <>
      <p
        data-role="hero-title"
        className="animate-slide-up text-[11px] font-medium tracking-[0.22em] text-muted-foreground [animation-delay:60ms] md:text-sm"
      >
        {dateText} · {weekdayText}
      </p>
      <h2 className="mt-1.5 animate-slide-up font-display text-2xl font-bold tracking-tight tabular-nums text-foreground [animation-delay:140ms] md:text-4xl">
        {timeText}
      </h2>
    </>
  )
}
