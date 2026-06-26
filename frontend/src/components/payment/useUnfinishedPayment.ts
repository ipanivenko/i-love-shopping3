import { useEffect, useMemo, useState } from 'react'

export type PendingPayment = {
    orderId: string
    expiresAt: number
}

export function usePendingPayment() {
    const [now, setNow] = useState(Date.now())

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(Date.now())
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    const pendingPayment = useMemo(() => {
        const raw = sessionStorage.getItem('pending_payment')

        if (!raw) {
            return null
        }

        try {
            const parsed = JSON.parse(raw) as PendingPayment

            if (parsed.expiresAt <= now) {
                sessionStorage.removeItem('pending_payment')
                return null
            }

            return parsed
        } catch {
            return null
        }
    }, [now])

    const remainingTime = useMemo(() => {
        if (!pendingPayment) {
            return null
        }

        const remainingMs = Math.max(
            pendingPayment.expiresAt - now,
            0,
        )

        const totalSeconds = Math.floor(remainingMs / 1000)

        const minutes = Math.floor(totalSeconds / 60)
        const seconds = totalSeconds % 60

        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    }, [pendingPayment, now])

    return {
        pendingPayment,
        remainingTime,
    }
}