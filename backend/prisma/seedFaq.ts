import { PrismaClient } from "@prisma/client";

export async function seedFaq(prisma: PrismaClient) {
  const faqs = [
    {
      question: "How can I track my order?",
      answer:
        'You can track your order from your account under "My Orders". Once your order has been shipped, tracking information will be available there.',
    },
    {
      question: "How can I request a refund?",
      answer:
        "You can request a cancellation or refund from your order details page. Our support team will review your request and contact you if additional information is needed.",
    },
    {
      question: "How can I contact support?",
      answer:
        "You can contact our support team using the Contact Support form available on the website. We aim to respond as quickly as possible.",
    },
    {
      question: "Do I need an account to place an order?",
      answer:
        "No. Guest checkout is available. However, creating an account allows you to track your orders and manage your information more easily.",
    },
    {
      question: "How long does delivery take?",
      answer:
        "Delivery times depend on the shipping method selected during checkout. Estimated delivery times are displayed before you confirm your order.",
    },
  ];

  for (const faq of faqs) {
    await prisma.faq.upsert({
      where: { question: faq.question },
      update: {},
      create: faq,
    });
  }

  console.log("✅ FAQs seeded");
}