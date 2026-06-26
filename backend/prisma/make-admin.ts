import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]

    const secret = process.argv[3]

    if (!process.env.ADMIN_SECRET_KEY) {
        console.error('ADMIN_SECRET_KEY is missing in .env')
        process.exit(1)
    }

    if (secret !== process.env.ADMIN_SECRET_KEY) {
        console.error('Invalid admin secret key')
        process.exit(1)
    }

    if (!email) {
        console.error('Please provide user email')
        console.error('Example: npm run make-admin -- admin@test.com')
        process.exit(1)
    }

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        console.error('User not found')
        process.exit(1)
    }

    if (!user.twoFactorConfirmedAt) {
        console.error(
            'Cannot promote user to ADMIN. 2FA must be enabled first.'
        )
        process.exit(1)
    }

    const updatedUser = await prisma.user.update({
        where: { email },
        data: {
            role: Role.ADMIN,
        },
    })

    console.log(`User ${updatedUser.email} is now ADMIN`)
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })