import { useEffect, useState } from 'react'
import { ArrowRight, Download, WandSparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api, messageFrom } from '../api'
import AppNav from '../components/AppNav'
import type { ImageItem } from '../types'

export default function GeneratedPage() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/images').then((response) => setImages(response.data.images)).catch((err) => setError(messageFrom(err))).finally(() => setLoading(false))
  }, [])

  return <div className="app-shell">
    <AppNav />
    <main className="gallery-page">
      <div className="gallery-title"><div><div className="section-kicker">A LITTLE IDEA ARCHIVE</div><h1>My creations<span className="brand-period">.</span></h1><p>Every thought you've brought to life, all in one place.</p></div><Link to="/home" className="button button-dark"><WandSparkles size={16} /> Make something new</Link></div>
      {error && <div className="error-message">{error}</div>}
      {loading ? <div className="gallery-loading">Gathering your creations…</div> : images.length ? <div className="creation-grid">{images.map((item) => <article className="creation-card" key={item._id}><img src={item.imageUrl} alt={item.prompt} /><div><p>{item.prompt}</p><div className="creation-meta"><span>{new Date(item.createdAt).toLocaleDateString()}</span><a href={item.imageUrl} download="imagify-creation.png"><Download size={15} /></a></div></div></article>)}</div> : !error && <div className="gallery-empty"><div className="empty-orbit"><WandSparkles size={25} /></div><h2>Nothing here just yet.</h2><p>Your first creation is only a daydream away.</p><Link to="/home" className="button button-dark">Create an image <ArrowRight size={15} /></Link></div>}
    </main>
  </div>
}
