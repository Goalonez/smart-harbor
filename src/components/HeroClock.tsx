import { useEffect, useMemo, useState } from 'react'
import { useI18n } from '@/i18n/runtime'

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

function createClockFormatters(language: string) {
  return {
    dateFormatter: new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }),
    weekdayFormatter: new Intl.DateTimeFormat(language, {
      weekday: 'long',
    }),
  }
}

function formatClock(
  now: Date,
  formatters: ReturnType<typeof createClockFormatters>
) {
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())
  const seconds = pad(now.getSeconds())

  return {
    dateText: formatters.dateFormatter.format(now),
    weekdayText: formatters.weekdayFormatter.format(now),
    timeText: `${hours}:${minutes}:${seconds}`,
  }
}

export function HeroClock() {
  const [now, setNow] = useState(() => new Date())
  const { language } = useI18n()

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const current = new Date()
      setNow((previous) => {
        if (
          previous.getSeconds() === current.getSeconds() &&
          previous.getMinutes() === current.getMinutes() &&
          previous.getHours() === current.getHours() &&
          previous.getDate() === current.getDate()
        ) {
          return previous
        }

        return current
      })
    }, 250)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const formatters = useMemo(() => createClockFormatters(language), [language])
  const { dateText, weekdayText, timeText } = useMemo(
    () => formatClock(now, formatters),
    [formatters, now]
  )
  return (
    <div className="flex items-center gap-3">
      <h2 className="animate-slide-up font-display text-[1.75rem] font-semibold tracking-[-0.04em] tabular-nums text-foreground [animation-delay:140ms] sm:text-[2.1rem] md:text-[2.55rem]">
        <span>{timeText}</span>
      </h2>
      <div className="flex animate-slide-up flex-col justify-center gap-0.5 [animation-delay:60ms]">
        <p
          data-role="hero-title"
          className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[9px] font-medium tracking-[0.18em] text-muted-foreground shadow-[0_6px_14px_rgba(15,23,42,0.04)] md:text-[10px]"
        >
          {dateText}
        </p>
        <p className="rounded-full border border-border/70 bg-background px-2 py-0.5 text-[9px] font-medium tracking-[0.18em] text-muted-foreground shadow-[0_6px_14px_rgba(15,23,42,0.04)] md:text-[10px]">
          {weekdayText}
        </p>
      </div>
    </div>
  )
}
