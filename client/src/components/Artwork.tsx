type ArtworkProps = { className: string; label: string }

export default function Artwork({ className, label }: ArtworkProps) {
  return <div className={`artwork ${className}`} role="img" aria-label={label}>
    <span className="art-glow" />
    <span className="art-detail art-detail-one" />
    <span className="art-detail art-detail-two" />
    <span className="art-label">{label}</span>
  </div>
}
