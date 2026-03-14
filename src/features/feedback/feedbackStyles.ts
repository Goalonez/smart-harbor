import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import type { ToastInput } from '@/features/feedback/feedbackContext'
import type { MessageSet } from '@/i18n/messages'

export type FeedbackTone = ToastInput['type']

export function getToastMeta(messages: MessageSet) {
  return {
    success: {
      title: messages.feedback.success,
      icon: CheckCircle2,
      accentClass: 'bg-orange-400',
      containerClass:
        'border-orange-200/70 bg-[linear-gradient(135deg,rgba(250,247,240,0.98),rgba(255,243,232,0.95))] text-stone-900 shadow-[0_20px_45px_rgba(234,88,12,0.1)] dark:border-orange-500/30 dark:bg-[linear-gradient(135deg,rgba(63,37,22,0.96),rgba(91,47,24,0.9))] dark:text-orange-50',
      titleClass: 'text-orange-800 dark:text-orange-100',
      iconWrapperClass:
        'bg-white/80 ring-1 ring-orange-200/80 dark:bg-white/10 dark:ring-orange-400/20',
      iconClass: 'text-orange-700 dark:text-orange-200',
    },
    warning: {
      title: messages.feedback.warning,
      icon: AlertTriangle,
      accentClass: 'bg-amber-500',
      containerClass:
        'border-amber-200/70 bg-[linear-gradient(135deg,rgba(250,247,240,0.98),rgba(255,247,237,0.96))] text-stone-900 shadow-[0_20px_45px_rgba(245,158,11,0.12)] dark:border-amber-500/30 dark:bg-[linear-gradient(135deg,rgba(68,39,18,0.96),rgba(120,53,15,0.9))] dark:text-amber-50',
      titleClass: 'text-amber-800 dark:text-amber-100',
      iconWrapperClass:
        'bg-white/80 ring-1 ring-amber-200/80 dark:bg-white/10 dark:ring-amber-400/20',
      iconClass: 'text-amber-700 dark:text-amber-200',
    },
    error: {
      title: messages.feedback.error,
      icon: XCircle,
      accentClass: 'bg-red-500',
      containerClass:
        'border-rose-200/70 bg-[linear-gradient(135deg,rgba(250,247,240,0.98),rgba(255,241,242,0.96))] text-stone-900 shadow-[0_20px_45px_rgba(244,63,94,0.12)] dark:border-rose-500/30 dark:bg-[linear-gradient(135deg,rgba(72,28,36,0.96),rgba(127,29,29,0.9))] dark:text-rose-50',
      titleClass: 'text-rose-800 dark:text-rose-100',
      iconWrapperClass:
        'bg-white/80 ring-1 ring-rose-200/80 dark:bg-white/10 dark:ring-rose-400/20',
      iconClass: 'text-rose-700 dark:text-rose-200',
    },
  } as const
}

export function getFeedbackNoticeClass(type?: FeedbackTone | null) {
  switch (type) {
    case 'success':
      return 'rounded-xl border border-orange-200/70 bg-[linear-gradient(135deg,rgba(250,247,240,0.98),rgba(255,243,232,0.94))] px-3 py-2.5 text-xs leading-5 text-orange-950 shadow-[0_12px_28px_rgba(234,88,12,0.1)] dark:border-orange-500/30 dark:bg-[linear-gradient(135deg,rgba(63,37,22,0.96),rgba(91,47,24,0.88))] dark:text-orange-50'
    case 'warning':
      return 'rounded-xl border border-amber-200/70 bg-[linear-gradient(135deg,rgba(250,247,240,0.98),rgba(255,247,237,0.94))] px-3 py-2.5 text-xs leading-5 text-amber-950 shadow-[0_12px_28px_rgba(245,158,11,0.1)] dark:border-amber-500/30 dark:bg-[linear-gradient(135deg,rgba(68,39,18,0.96),rgba(120,53,15,0.88))] dark:text-amber-50'
    case 'error':
      return 'rounded-xl border border-rose-200/70 bg-[linear-gradient(135deg,rgba(250,247,240,0.98),rgba(255,241,242,0.94))] px-3 py-2.5 text-xs leading-5 text-rose-950 shadow-[0_12px_28px_rgba(244,63,94,0.1)] dark:border-rose-500/30 dark:bg-[linear-gradient(135deg,rgba(72,28,36,0.96),rgba(127,29,29,0.88))] dark:text-rose-50'
    default:
      return 'text-xs leading-5 text-muted-foreground'
  }
}
