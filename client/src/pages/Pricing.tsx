import { useEffect, useState } from 'react'
import { Check, Coins, Sparkles } from 'lucide-react'
import AppNav from '../components/AppNav'
import { api, messageFrom } from '../api'
import { useAuth } from '../context/AuthContext'
import type { CreatePaymentOrderResponse, PricingPlan, RazorpayCheckoutOptions, Transaction, VerifyPaymentResponse } from '../types'

const formatDollars = (amount: number) => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(amount)

const formatRupees = (amount: number) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
}).format(amount)

declare global {
  interface Window { Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void } }
}

export default function PricingPage() {
  const { user, setUser } = useAuth()
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<{ plans: PricingPlan[] }>('/plans')
      .then((response) => setPlans(response.data.plans))
      .catch((err) => setError(messageFrom(err)))
      .finally(() => setLoading(false))
  }, [])

  async function purchase(plan: PricingPlan) {
    setProcessing(plan.id)
    setNotice('')
    setError('')
    try {
      const RazorpayCheckout = window.Razorpay
      if (!RazorpayCheckout) throw new Error('Razorpay Checkout did not load. Check your internet connection and try again.')
      const { data } = await api.post<CreatePaymentOrderResponse>('/pay-razor', { planId: plan.id })
      const transaction: Transaction = data.transaction
      const checkoutOptions: RazorpayCheckoutOptions = {
        key: data.keyId,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'Imagify',
        description: `${transaction.credits} image credits · ${formatRupees(transaction.amount)} INR`,
        order_id: data.order.id,
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#697451' },
        handler: async (payment) => {
          try {
            const verified = await api.post<VerifyPaymentResponse>('/verify-razor', payment)
            setUser(user ? { ...user, creditBalance: verified.data.creditBalance } : user)
            setNotice(`${plan.credits} credits added. Your new balance is ${verified.data.creditBalance}.`)
          } catch (err) { setError(messageFrom(err)) }
          finally { setProcessing('') }
        },
        modal: { ondismiss: () => setProcessing('') },
      }
      const checkout = new RazorpayCheckout(checkoutOptions)
      checkout.open()
    } catch (err) {
      setError(err instanceof Error ? err.message : messageFrom(err))
      setProcessing('')
    }
  }

  return <div className="app-shell">
    <AppNav />
    <main className="pricing-page">
      <header className="pricing-heading">
        <div className="section-kicker"><Sparkles size={13} /> MORE ROOM TO IMAGINE</div>
        <h1>Our Plans</h1>
        <p>Every image uses one credit. Choose a pack that fits your ideas.</p>
        <div className="pricing-balance"><Coins size={17} /> You have <strong>{user?.creditBalance ?? 0} credits</strong></div>
      </header>
      {error && <div className="error-message pricing-message">{error}</div>}
      {notice && <div className="pricing-success pricing-message">{notice}</div>}
      {loading ? <p className="pricing-loading">Loading plans…</p> : <section className="plan-grid" aria-label="Credit plans">
        {plans.map((plan, index) => <article className={`plan-card ${index === 1 ? 'plan-featured' : ''}`} key={plan.id}>
          {index === 1 && <span className="plan-popular">MOST POPULAR</span>}
          <div className="plan-name">{plan.name}</div>
          <div className="plan-price"><strong>{formatDollars(plan.priceUsd)}</strong><span> USD · one time</span></div>
          <div className="plan-credit-count"><Coins size={18} /> <strong>{plan.credits}</strong> credits</div>
          <p className="plan-detail">Create up to {plan.credits} images. Credits stay in your account until used.</p>
          <ul><li><Check size={15} /> {plan.credits} image generations</li><li><Check size={15} /> Secure Razorpay checkout</li></ul>
          <button className="button button-dark plan-purchase" disabled={Boolean(processing)} onClick={() => purchase(plan)}>
            {processing === plan.id ? 'Opening checkout…' : 'Purchase'}
          </button>
        </article>)}
      </section>}
      <p className="pricing-footnote">Plan prices are shown in USD. Checkout charges and payment records are in Indian rupees (₹, INR).</p>
    </main>
  </div>
}
