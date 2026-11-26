import jwt from 'jsonwebtoken'

export default function authUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.headers.token
  if (!token) return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded.id) return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' })
    req.userId = decoded.id
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Not Authorized. Login Again' })
  }
}
