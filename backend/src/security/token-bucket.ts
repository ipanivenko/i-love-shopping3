import {
    CanActivate,
    ExecutionContext,
    Injectable,
    HttpException,
} from '@nestjs/common'
import { Request } from 'express'

type Bucket = {
    tokens: number
    lastRefill: number
}

@Injectable()
export class TokenBucketGuard implements CanActivate {
    private buckets = new Map<string, Bucket>()

    private readonly capacity = 10
    private readonly refillRate = 1 // 1 token per second

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>()

        const ip = request.ip ?? 'unknown'
        const now = Date.now()

        const bucket = this.buckets.get(ip) ?? {
            tokens: this.capacity,
            lastRefill: now,
        }

        const secondsPassed = (now - bucket.lastRefill) / 1000
        const tokensToAdd = secondsPassed * this.refillRate

        bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd)
        bucket.lastRefill = now

        if (bucket.tokens < 1) {
            this.buckets.set(ip, bucket)
            throw new HttpException(
                'Too many requests. Please try again later.',
                429,
            )
        }

        bucket.tokens -= 1
        this.buckets.set(ip, bucket)

        return true
    }
}