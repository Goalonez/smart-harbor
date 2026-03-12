import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import type { ToastInput } from '@/features/feedback/feedbackContext'
import type { MessageSet } from '@/i18n/messages'

export type FeedbackTone = ToastInput['type']

export function getToastMeta(messages: MessageSet) {
  return {
    success: {
      title: messages.feedback.success,
      icon: CheckCircle2,
      accentClass: 'bg-emerald-500',
      containerClass:
        'border-slate-200/90 bg-white/95 text-slate-900 shadow-black/10 dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-slate-100',
      titleClass: 'text-emerald-700 dark:text-emerald-300',
      iconWrapperClass:
        'bg-emerald-50 ring-1 ring-emerald-200/80 dark:bg-emerald-500/12 dark:ring-emerald-400/20',
      iconClass: 'text-emerald-700 dark:text-emerald-300',
    },
    warning: {
      title: messages.feedback.warning,
      icon: AlertTriangle,
      accentClass: 'bg-amber-500',
      containerClass:
        'border-slate-200/90 bg-white/95 text-slate-900 shadow-black/10 dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-slate-100',
      titleClass: 'text-amber-700 dark:text-amber-300',
      iconWrapperClass:
        'bg-amber-50 ring-1 ring-amber-200/80 dark:bg-amber-500/12 dark:ring-amber-400/20',
      iconClass: 'text-amber-700 dark:text-amber-300',
    },
    error: {
      title: messages.feedback.error,
      icon: XCircle,
      accentClass: 'bg-red-500',
      containerClass:
        'border-slate-200/90 bg-white/95 text-slate-900 shadow-black/10 dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-slate-100',
      titleClass: 'text-red-700 dark:text-red-300',
      iconWrapperClass: 'bg-red-50 ring-1 ring-red-200/80 dark:bg-red-500/12 dark:ring-red-400/20',
      iconClass: 'text-red-700 dark:text-red-300',
    },
  } as const
}

export function getFeedbackNoticeClass(type?: FeedbackTone | null) {
  switch (type) {
    case 'success':
      return 'rounded-lg border border-emerald-200/90 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-950 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/12 dark:text-emerald-100'
    case 'warning':
      return 'rounded-lg border border-amber-200/90 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-950 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/12 dark:text-amber-100'
    case 'error':
      return 'rounded-lg border border-red-200/90 bg-red-50 px-3 py-2 text-xs leading-5 text-red-950 shadow-sm dark:border-red-500/30 dark:bg-red-500/12 dark:text-red-100'
    default:
      return 'text-xs leading-5 text-muted-foreground'
  }
}
