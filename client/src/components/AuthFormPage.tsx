import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { api, messageFrom } from '../api'
import { useAuth } from '../context/AuthContext'
import Artwork from './Artwork'
import Brand from './Brand'

export default function AuthFormPage({ register = false }: { register?: boolean }) {
  const { setUser } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const form = new FormData(event.currentTarget)
    const body = Object.fromEntries(form.entries())
    try {
      const response = await api.post(`/auth/${register ? 'register' : 'login'}`, body)
      localStorage.setItem('imagify-token', response.data.token)
      setUser(response.data.user)
      navigate('/home')
    } catch (err) { setError(messageFrom(err)) }
    finally { setLoading(false) }
  }

  return <main className="auth-layout">
    <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to Imagify</Link>
    <div className="auth-card">
      <Brand />
      <div className="auth-heading">
        <div className="eyebrow">A LITTLE MAGIC AWAITS</div>
        <h1>{register ? 'Make yourself at home.' : 'Welcome back.'}</h1>
        <p>{register ? 'Create an account and give your ideas a place to live.' : 'Your next idea is waiting to become an image.'}</p>
      </div>
      <form onSubmit={submit} className="auth-form">
        {register && <label>Your name<input name="name" placeholder="The name your friends use" autoComplete="name" required /></label>}
        <label>Email address<input name="email" type="email" placeholder="you@example.com" autoComplete="email" required /></label>
        <label>Password<input name="password" type="password" placeholder={register ? 'At least 8 characters' : 'Your password'} autoComplete={register ? 'new-password' : 'current-password'} minLength={register ? 8 : undefined} required /></label>
        {error && <div className="error-message">{error}</div>}
        <button className="button button-dark auth-submit" disabled={loading}>{loading ? 'One moment…' : register ? 'Create my account' : 'Log in'} <ArrowRight size={16} /></button>
      </form>
      <p className="auth-switch">{register ? 'Already have an account?' : 'New to Imagify?'} <Link to={register ? '/login' : '/register'}>{register ? 'Log in' : 'Create an account'}</Link></p>
      <div className="auth-art-mini"><Artwork className="art-cloud" label="A cloud shaped like a sleeping cat" /></div>
    </div>
    <p className="auth-footnote">Made for the ideas in your head <span>✳</span></p>
  </main>
}
