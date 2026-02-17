import React, { useCallback, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { CheckCircle, AlertCircle } from 'lucide-react-native'
import { radius } from '@/constants/DesignTokens'
import { useAppTheme } from '@/contexts/ThemeContext'

type ToastType = 'success' | 'error'

interface ToastItem {
  id: number
  type: ToastType
  text: string
  exiting: boolean
}

const TOAST_DURATION = 2500
const EXIT_DURATION = 280

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const show = useCallback((type: ToastType, text: string) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, type, text, exiting: false }])

    setTimeout(() => {
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)))
    }, TOAST_DURATION)

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_DURATION + EXIT_DURATION)
  }, [])

  return { show, toasts }
}

/** 放在组件树中渲染 Toast，接收 useToast() 返回的 toasts */
export function ToastViewport({ toasts }: { toasts: ToastItem[] }) {
  return <ToastPortalInner toasts={toasts} />
}

function ToastPortalInner({ toasts }: { toasts: ToastItem[] }) {
  const { isDark } = useAppTheme()

  if (toasts.length === 0 || typeof document === 'undefined') return null

  return ReactDOM.createPortal(
    <>
      <style>{`
        @keyframes loof-toast-in {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes loof-toast-out {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(24px); }
        }
        .loof-toast { animation: loof-toast-in 0.32s cubic-bezier(0.21, 0.47, 0.32, 1); }
        .loof-toast.loof-toast-exit { animation: loof-toast-out 0.28s cubic-bezier(0.4, 0, 1, 1) forwards; }
      `}</style>
      <div
        style={{
          position: 'fixed',
          top: 'calc(20px + var(--safe-top, 0px))',
          right: 'calc(20px + var(--safe-right, 0px))',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} isDark={isDark} />
        ))}
      </div>
    </>,
    document.body,
  )
}

function ToastCard({ toast, isDark }: { toast: ToastItem; isDark: boolean }) {
  const isSuccess = toast.type === 'success'
  const accent = isSuccess ? '#22c55e' : '#ef4444'

  return (
    <div
      className={`loof-toast${toast.exiting ? ' loof-toast-exit' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '14px 20px',
        borderRadius: radius.xl,
        background: isDark
          ? 'linear-gradient(135deg, rgba(30,30,30,0.72) 0%, rgba(45,45,45,0.68) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.72) 0%, rgba(248,252,248,0.68) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.65)'}`,
        boxShadow: isDark
          ? '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 12px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: `${accent}26`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isSuccess ? (
          <CheckCircle size={18} color={accent} />
        ) : (
          <AlertCircle size={18} color={accent} />
        )}
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: accent, letterSpacing: '0.02em' }}>
        {toast.text}
      </span>
    </div>
  )
}
