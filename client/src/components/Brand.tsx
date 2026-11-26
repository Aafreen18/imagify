import { Sparkles } from 'lucide-react'

export default function Brand({ light = false }: { light?: boolean }) {
  return <div className={`brand ${light ? 'brand-light' : ''}`}>
    <span className="brand-icon"><Sparkles size={17} strokeWidth={2.2} /></span>
    <span>imagify</span><span className="brand-period">.</span>
  </div>
}
