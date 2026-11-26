export type User = { id: string; name: string; email: string; creditBalance: number; createdAt?: string }
export type ImageItem = { _id: string; prompt: string; imageUrl: string; createdAt: string }

export type PlanId = 'basic' | 'advanced' | 'premium'
export type PricingPlan = { id: PlanId; name: string; credits: number; priceUsd: number; priceInr: number }

export type Transaction = {
  id: string
  planId: PlanId
  credits: number
  /** Purchased amount in whole INR rupees; Razorpay receives this value in paise. */
  amount: number
  currency: 'INR'
  payment: boolean
  status: 'pending' | 'paid' | 'failed'
  createdAt: string
}

export type RazorpayPaymentOrder = { id: string; amount: number; currency: 'INR' }
export type CreatePaymentOrderResponse = {
  success: true
  keyId: string
  order: RazorpayPaymentOrder
  plan: Pick<PricingPlan, 'id' | 'name' | 'credits' | 'priceUsd'>
  transaction: Transaction
}
export type VerifyPaymentResponse = { success: true; message: string; creditBalance: number }

export type RazorpayCheckoutResult = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}
export type RazorpayCheckoutOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: { name?: string; email?: string }
  theme: { color: string }
  handler: (result: RazorpayCheckoutResult) => void
  modal: { ondismiss: () => void }
}
