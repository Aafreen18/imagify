import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { User, GeneratedImage, Transaction } from './models.js'
import authUser from './middleware/auth.js'

const app = express()
const clientOrigin = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/+$/, '')
app.use(cors({ origin: clientOrigin }))
app.use(express.json({ limit: '2mb' }))

const tokenFor = (user) => jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, creditBalance: user.creditBalance ?? 5, createdAt: user.createdAt })
const requireAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ message: 'Please sign in to continue.' })
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id
    next()
  } catch { res.status(401).json({ message: 'Your session expired. Please sign in again.' }) }
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected' }))
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email, and password are required.' })
    if (password.length < 8) return res.status(400).json({ message: 'Use a password with at least 8 characters.' })
    if (await User.exists({ email: email.trim().toLowerCase() })) return res.status(409).json({ message: 'An account with that email already exists.' })
    const user = await User.create({ name: name.trim(), email: email.trim().toLowerCase(), password: await bcrypt.hash(password, 12), creditBalance: 5 })
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) })
  } catch (error) { res.status(500).json({ message: error.code === 11000 ? 'An account with that email already exists.' : 'Could not create your account.' }) }
})
app.post('/api/auth/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email?.trim().toLowerCase() })
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) return res.status(401).json({ message: 'Email or password is incorrect.' })
  if (user.creditBalance == null) { user.creditBalance = 5; await user.save() }
  res.json({ token: tokenFor(user), user: publicUser(user) })
})
app.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId)
  if (!user) return res.status(404).json({ message: 'Account not found.' })
  if (user.creditBalance == null) { user.creditBalance = 5; await user.save() }
  res.json({ user: publicUser(user) })
})
app.get('/api/credits', requireAuth, async (req, res) => {
  const user = await User.findById(req.userId).select('creditBalance')
  if (!user) return res.status(404).json({ message: 'Account not found.' })
  res.json({ creditBalance: user.creditBalance ?? 5 })
})
app.get('/api/images', requireAuth, async (req, res) => {
  const images = await GeneratedImage.find({ user: req.userId }).sort({ createdAt: -1 }).limit(100)
  res.json({ images })
})
app.post('/api/images/generate', requireAuth, async (req, res) => {
  const prompt = req.body.prompt?.trim()
  if (!prompt) return res.status(400).json({ message: 'Add a description for your image first.' })
  if (prompt.length > 1000) return res.status(400).json({ message: 'Keep your description under 1,000 characters.' })
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  if (!accountId || !apiToken) return res.status(503).json({ message: 'Cloudflare image generation is not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to server/.env, then restart the server.' })
  const user = await User.findOneAndUpdate({ _id: req.userId, creditBalance: { $gte: 1 } }, { $inc: { creditBalance: -1 } }, { new: true })
  if (!user) return res.status(402).json({ message: 'You are out of credits. Choose a plan to add more.' })
  let creditRefunded = false
  const refundCredit = async () => {
    if (creditRefunded) return
    creditRefunded = true
    await User.updateOne({ _id: req.userId }, { $inc: { creditBalance: 1 } })
  }
  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/@cf/black-forest-labs/flux-1-schnell`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    const contentType = response.headers.get('content-type') || ''
    let imageBase64 = ''
    let providerError = ''
    if (contentType.startsWith('image/') || contentType === 'application/octet-stream') {
      imageBase64 = Buffer.from(await response.arrayBuffer()).toString('base64')
    } else {
      const payload = await response.json().catch(() => ({}))
      imageBase64 = payload.result?.image || payload.result?.image_b64 || (typeof payload.result === 'string' ? payload.result : '')
      providerError = payload.errors?.map((item) => item.message).filter(Boolean).join('; ') || payload.error?.message || payload.message || ''
    }
    if (!response.ok) {
      const detail = providerError || `Cloudflare returned HTTP ${response.status}.`
      throw Object.assign(new Error(detail), { status: response.status })
    }
    if (!imageBase64) throw new Error(providerError || 'Cloudflare returned no image. Try a different prompt.')
    const imageUrl = `data:image/jpeg;base64,${imageBase64}`
    const image = await GeneratedImage.create({ user: req.userId, prompt, imageUrl })
    res.status(201).json({ image, creditBalance: user.creditBalance })
  } catch (error) {
    await refundCredit().catch((refundError) => console.error('Could not refund image credit:', refundError.message))
    const providerMessage = String(error.message || 'Unknown Cloudflare error').replaceAll(apiToken, '[hidden API token]')
    console.error(`Cloudflare image generation failed (${error.status || error.code || 'unknown'}):`, providerMessage)
    const code = error.status || 502
    const hint = code === 401 || code === 403
      ? ' Check that the Cloudflare token is valid and has Workers AI permissions.'
      : code === 429
        ? ' The Cloudflare Workers AI daily free allocation may be exhausted; check your Workers AI usage and limits.'
        : ''
    res.status(502).json({ message: `Cloudflare image generation failed (${code}): ${providerMessage}.${hint}` })
  }
})

const plans = {
  basic: { name: 'Basic', credits: 100, priceUsd: 10 },
  advanced: { name: 'Advanced', credits: 200, priceUsd: 20 },
  premium: { name: 'Premium', credits: 500, priceUsd: 50 },
}
const usdToInrRate = Number(process.env.USD_TO_INR_RATE || 92.5)
const toRupees = (usd) => Math.round(usd * usdToInrRate)
const toPaise = (rupees) => rupees * 100

app.get('/api/plans', (_req, res) => {
  res.json({ plans: Object.entries(plans).map(([id, plan]) => ({ id, ...plan, priceInr: toRupees(plan.priceUsd) })) })
})

app.post('/api/pay-razor', authUser, async (req, res) => {
  const plan = plans[req.body.planId]
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!plan) return res.status(400).json({ success: false, message: 'Choose a valid pricing plan.' })
  if (!keyId || !keySecret) return res.status(503).json({ success: false, message: 'Razorpay is not configured. Add its test key ID and secret to server/.env.' })
  try {
    const amount = toRupees(plan.priceUsd)
    const amountPaise = toPaise(amount)
    const transaction = await Transaction.create({ user: req.userId, planId: req.body.planId, credits: plan.credits, amount, currency: 'INR' })
    const receipt = `imagify_${transaction._id}`
    const razorResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt, notes: { transactionId: String(transaction._id), userId: String(req.userId), planId: req.body.planId } }),
    })
    const order = await razorResponse.json()
    if (!razorResponse.ok) {
      await Transaction.updateOne({ _id: transaction._id }, { $set: { status: 'failed' } })
      console.error('Razorpay order creation failed:', order.error?.description || razorResponse.status)
      return res.status(502).json({ success: false, message: 'Could not start payment. Please try again.' })
    }
    transaction.razorpayOrderId = order.id
    await transaction.save()
    res.status(201).json({
      success: true,
      order,
      keyId,
      plan: { id: req.body.planId, name: plan.name, credits: plan.credits, priceUsd: plan.priceUsd },
      transaction: {
        id: String(transaction._id),
        planId: transaction.planId,
        credits: transaction.credits,
        amount: transaction.amount,
        currency: transaction.currency,
        payment: transaction.payment,
        status: transaction.status,
        createdAt: transaction.createdAt,
      },
    })
  } catch (error) {
    console.error('Razorpay order creation failed:', error.message)
    res.status(500).json({ success: false, message: 'Could not start payment. Please try again.' })
  }
})

app.post('/api/verify-razor', authUser, async (req, res) => {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body
  if (!orderId || !paymentId || !signature) return res.status(400).json({ success: false, message: 'Payment verification details are missing.' })
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) return res.status(503).json({ success: false, message: 'Razorpay is not configured.' })

  const expectedSignature = createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest()
  let providedSignature
  try { providedSignature = Buffer.from(signature, 'hex') } catch { providedSignature = Buffer.alloc(0) }
  if (providedSignature.length !== expectedSignature.length || !timingSafeEqual(providedSignature, expectedSignature)) {
    return res.status(400).json({ success: false, message: 'Payment signature could not be verified.' })
  }

  try {
    const transaction = await Transaction.findOne({ razorpayOrderId: orderId, user: req.userId })
    if (!transaction) return res.status(404).json({ success: false, message: 'Payment order not found.' })
    if (transaction.status === 'paid') {
      const user = await User.findById(req.userId).select('creditBalance')
      return res.json({ success: true, message: 'Credits already added.', creditBalance: user.creditBalance })
    }

    const razorResponse = await fetch(`https://api.razorpay.com/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}` },
    })
    const order = await razorResponse.json()
    if (!razorResponse.ok || order.id !== orderId || order.status !== 'paid' || order.currency !== transaction.currency || order.amount !== toPaise(transaction.amount)) {
      return res.status(402).json({ success: false, message: 'Razorpay has not confirmed this payment yet.' })
    }

    let updatedUser
    await mongoose.connection.transaction(async (session) => {
      const updatedTransaction = await Transaction.findOneAndUpdate(
        { _id: transaction._id, status: 'pending' },
        { $set: { payment: true, status: 'paid', razorpayPaymentId: paymentId } },
        { new: true, session },
      )
      if (!updatedTransaction) return
      updatedUser = await User.findByIdAndUpdate(req.userId, { $inc: { creditBalance: transaction.credits } }, { new: true, session }).select('creditBalance')
      if (!updatedUser) throw new Error('Account not found while applying credits.')
    })
    if (!updatedUser) {
      const currentUser = await User.findById(req.userId).select('creditBalance')
      if (transaction.status === 'paid') return res.json({ success: true, message: 'Credits already added.', creditBalance: currentUser.creditBalance })
      return res.status(409).json({ success: false, message: 'This payment is already being processed.' })
    }
    res.json({ success: true, message: 'Credits added.', creditBalance: updatedUser.creditBalance })
  } catch (error) {
    console.error('Razorpay verification failed:', error.message)
    res.status(500).json({ success: false, message: 'Could not verify payment. Contact support if your payment was charged.' })
  }
})

const port = process.env.PORT || 5000
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI).then(() => console.log('Connected to MongoDB')).catch((error) => console.error('MongoDB connection failed:', error.message))
} else console.warn('MONGODB_URI is missing. Add it to server/.env to enable accounts and saved images.')
app.listen(port, () => console.log(`Imagify API listening on http://localhost:${port}`))
