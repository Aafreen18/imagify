import { useState, type FormEvent } from 'react'
import { ArrowUpRight, Download, Sparkles, WandSparkles } from 'lucide-react'
import { api, messageFrom } from '../api'
import AppNav from '../components/AppNav'
import { useAuth } from '../context/AuthContext'
import type { ImageItem } from '../types'

export default function HomePage() {
  const { user, setUser } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [image, setImage] = useState<ImageItem | null>(null)

  async function generate(event: FormEvent) {
    event.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setError('')
    setImage(null)
    try {
      const response = await api.post('/images/generate', { prompt })
      setImage(response.data.image)
      if (user) setUser({ ...user, creditBalance: response.data.creditBalance })
    } catch (err) { setError(messageFrom(err)) }
    finally { setLoading(false) }
  }

  return <div className="app-shell">
    <AppNav />
    <main className="studio">
      <div className="studio-welcome"><div className="section-kicker">A GOOD DAY TO MAKE SOMETHING</div><h1>Hey {user?.name?.split(' ')[0]}, <em>what's on your mind?</em></h1><p>Start with a thought. We'll help you see where it goes.</p></div>
      <form className="prompt-card" onSubmit={generate}>
        <label htmlFor="prompt">DESCRIBE YOUR IDEA</label>
        <textarea id="prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="A tiny bookshop on the moon, its windows glowing warm against the starry night…" maxLength={1000} />
        <div className="prompt-footer"><span>{prompt.length}/1,000 <span className="prompt-hint">· A little detail goes a long way</span></span><button className="button button-dark" disabled={loading || !prompt.trim()}>{loading ? <><span className="spinner" /> Dreaming it up…</> : <><WandSparkles size={16} /> Generate image</>}</button></div>
      </form>
      {error && <div className="error-message generation-error">{error}</div>}
      {image ? <section className="result-card"><div className="result-heading"><div><div className="section-kicker">YOUR IDEA, ILLUSTRATED</div><p>{image.prompt}</p></div><a className="button button-outline" href={image.imageUrl} download="imagify-creation.png"><Download size={16} /> Save image</a></div><img src={image.imageUrl} alt={image.prompt} /></section> : !loading ? <div className="studio-empty"><div className="empty-orbit"><Sparkles size={26} /><span>✳</span></div><b>A blank canvas, full of possibility.</b><p>Your creations will appear here. Start with whatever you can imagine.</p></div> : <div className="loading-art"><div className="loading-spark">✳</div><b>Gathering a few stars…</b><p>Good ideas are worth a little wait.</p></div>}
      <div className="studio-example"><span>NEED A STARTING POINT?</span><button onClick={() => setPrompt('A little seaside café at the end of a cobblestone street, golden hour, dreamy watercolor style')}>“A tiny seaside café at golden hour” <ArrowUpRight size={13} /></button><button onClick={() => setPrompt('A curious red fox botanist tending a moon garden, whimsical storybook illustration')}>“A fox tending a garden on the moon” <ArrowUpRight size={13} /></button></div>
    </main>
  </div>
}
