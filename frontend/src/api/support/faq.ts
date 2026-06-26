import { API } from "../config"

export type FaqItem = {
  id: string
  question: string
  answer: string
  createdAt: string
}

export async function getFaqs(): Promise<FaqItem[]> {
  const response = await fetch(`${API}/faq`)

  if (!response.ok) {
    throw new Error('Failed to fetch FAQs')
  }

  return response.json()
}