import { Injectable } from '@nestjs/common';
import { UpdateCheckoutProfileDto } from './dto/update-checkout-profile.dto';
import { PrismaService } from 'prisma/prisma.service'
import { NotFoundException } from '@nestjs/common';
import { ValidateAddressDto } from './dto/validate-address.dto';
import { EncryptionService } from 'src/security/encryption.service';

type NominatimResult = {
    display_name: string
    address?: {
        road?: string
        house_number?: string
        city?: string
        town?: string
        village?: string
        postcode?: string
        country?: string
    }
}

@Injectable()
export class CheckoutService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryptionService: EncryptionService,
    ) { }

    async getPrefill(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                name: true,
                fullName: true,
                phone: true,
                address: true,
                city: true,
                postcode: true,
                country: true,
            },
        })

        if (!user) {
            throw new NotFoundException('User not found')
        }

        return {
            profile: {
                ...user,
                fullName: this.encryptionService.decrypt(user.fullName),
                phone: this.encryptionService.decrypt(user.phone),
                address: this.encryptionService.decrypt(user.address),
                city: this.encryptionService.decrypt(user.city),
            },
        }
    }

    async updateProfile(userId: string, dto: UpdateCheckoutProfileDto) {
        const user = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...dto,
                fullName: this.encryptionService.encrypt(dto.fullName),
                phone: this.encryptionService.encrypt(dto.phone),
                address: this.encryptionService.encrypt(dto.address),
                city: this.encryptionService.encrypt(dto.city),
            },
            select: {
                email: true,
                name: true,
                fullName: true,
                phone: true,
                address: true,
                city: true,
                postcode: true,
                country: true,
            },
        })

        return {
            profile: {
                ...user,
                fullName: this.encryptionService.decrypt(user.fullName),
                phone: this.encryptionService.decrypt(user.phone),
                address: this.encryptionService.decrypt(user.address),
                city: this.encryptionService.decrypt(user.city),
            },
        }
    }

    async validateAddress(dto: ValidateAddressDto) {
        const query = `${dto.address}, ${dto.postcode} ${dto.city}, ${dto.country}`

        const params = new URLSearchParams({
            q: query,
            format: 'json',
            addressdetails: '1',
            limit: '1',
        })

        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?${params.toString()}`,
            {
                headers: {
                    'User-Agent': 'MoveOn-Ecommerce/ ipanivenko@gmail.com',
                },
            },
        )

        if (!res.ok) {
            return {
                valid: false,
                message: 'Address validation service is unavailable.',
            }
        }

        const results = (await res.json()) as NominatimResult[]

        if (results.length === 0) {
            return {
                valid: false,
                message: 'We could not verify this address.',
            }
        }

        const found = results[0]
        const foundPostcode = found.address?.postcode
        const foundCity =
            found.address?.city || found.address?.town || found.address?.village

        if (foundPostcode && foundPostcode !== dto.postcode) {
            return {
                valid: false,
                message: `Postcode looks different. Found: ${foundPostcode}.`,
                suggestion: found.display_name,
            }
        }

        if (
            foundCity &&
            foundCity.toLowerCase() !== dto.city.trim().toLowerCase()
        ) {
            return {
                valid: false,
                message: `City looks different. Found: ${foundCity}.`,
                suggestion: found.display_name,
            }
        }

        return {
            valid: true,
            message: 'Address verified.',
            suggestion: found.display_name,
        }
    }
}
