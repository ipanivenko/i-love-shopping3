import { PrismaClient } from '@prisma/client'

export async function seedShipping(prisma: PrismaClient) {
  const methods = [
    {
      code: 'ECONOMY_HOME',
      name: 'Economy delivery',
      description: 'Delivery in 5-8 business days',
      priceCents: 299,
      estimatedDaysMin: 5,
      estimatedDaysMax: 8,
    },
    {
      code: 'STANDARD_HOME',
      name: 'Standard delivery',
      description: 'Delivery in 3-5 business days',
      priceCents: 499,
      estimatedDaysMin: 3,
      estimatedDaysMax: 5,
    },
    {
      code: 'EXPRESS_HOME',
      name: 'Express delivery',
      description: 'Delivery in 1-2 business days',
      priceCents: 999,
      estimatedDaysMin: 1,
      estimatedDaysMax: 2,
    },
  ]

  for (const method of methods) {
    await prisma.shippingMethod.upsert({
      where: { code: method.code },
      update: method,
      create: method,
    })
  }

  console.log('✅ Shipping methods seeded')
}