import { ArrowDown, ArrowRight, ImagePlus, MessageSquareText, SlidersHorizontal, WandSparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Artwork from '../components/Artwork'
import PublicFooter from '../components/PublicFooter'
import PublicNav from '../components/PublicNav'

const art = [
  { className: 'art-orbit', label: 'A dreamlike planet with a ring of flowers' },
  { className: 'art-portrait', label: 'Portrait of a girl made of blue flowers' },
  { className: 'art-house', label: 'A tiny house in a magical forest' },
  { className: 'art-cloud', label: 'A cloud shaped like a sleeping cat' },
]

export default function DashboardPage() {
  return <div className="landing">
    <PublicNav />
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-star">✳</span> YOUR IMAGINATION, ILLUSTRATED</div>
          <h1>Big ideas.<br /><span>Beautiful images.</span></h1>
          <p className="hero-description">Turn a few words into something wonderful. Dream it up, describe it, and let Imagify bring it to life.</p>
          <Link to="/register" className="button button-dark hero-button">Create your first image <ArrowRight size={17} /></Link>
          <div className="hero-note"><span className="mini-avatars"><i>J</i><i>M</i><i>A</i></span><span>Made for the ideas in your head</span></div>
        </div>
        <div className="hero-art">
          <Artwork className="art-orbit" label="A dreamlike planet with a ring of flowers" />
          <div className="floating-card"><span className="floating-icon"><WandSparkles size={16} /></span><span><b>Somewhere, over the ocean</b><small>just a little daydream...</small></span><span className="floating-spark">✳</span></div>
          <div className="hero-sticker">a little<br />bit of magic <span>↗</span></div>
        </div>
      </section>
      <section className="gallery-strip">
        <div className="strip-head"><span>A peek at the possibilities</span><span>MADE FROM WORDS <ArrowDown size={13} /></span></div>
        <div className="art-grid">{art.slice(1).map((item) => <Artwork key={item.className} {...item} />)}</div>
      </section>
      <section className="how-section" id="how-it-works">
        <div className="section-kicker">A SIMPLE CREATIVE WORKFLOW</div>
        <h2>From first thought to <em>finished image.</em></h2>
        <p className="section-intro">A clear, three-step process makes it easy to bring the picture in your head to life.</p>
        <div className="steps">
          <article className="how-step"><div className="step-top"><span className="step-number">01</span><span className="step-icon"><MessageSquareText size={19} /></span></div><h3>Describe the idea</h3><p>Start with the subject and setting. Add the details that matter, like the moment, mood, or small twist that makes it yours.</p><span className="step-caption">A few words are enough to begin</span></article>
          <article className="how-step"><div className="step-top"><span className="step-number">02</span><span className="step-icon"><SlidersHorizontal size={19} /></span></div><h3>Shape the scene</h3><p>Fine-tune your prompt with a style, atmosphere, or color palette. Clear details help guide the image toward your vision.</p><span className="step-caption">Make the prompt your own</span></article>
          <article className="how-step"><div className="step-top"><span className="step-number">03</span><span className="step-icon"><ImagePlus size={19} /></span></div><h3>Generate and save</h3><p>Create your image, then download it to keep. Your finished work is also saved in My creations for you to revisit.</p><span className="step-caption">Yours to keep and come back to</span></article>
        </div>
      </section>
      <section className="stories-section" id="stories">
        <div className="section-kicker">A FEW KIND WORDS</div>
        <h2>Little ideas, <em>big feelings.</em></h2>
        <div className="testimonials">
          <article><div className="stars">★★★★★</div><p>“I had an idea for a book cover at midnight. By 12:01, I could actually see it.”</p><div className="person"><span className="person-avatar avatar-peach">M</span><span><b>Maya R.</b><small>Writer &amp; chronic daydreamer</small></span></div></article>
          <article><div className="stars">★★★★★</div><p>“It feels less like using a tool and more like finding a friend who understands the picture in your head.”</p><div className="person"><span className="person-avatar avatar-blue">J</span><span><b>Jordan L.</b><small>Making things up, professionally</small></span></div></article>
          <article><div className="stars">★★★★★</div><p>“I made a whole world for my D&amp;D campaign. The group still thinks I hired an artist.”</p><div className="person"><span className="person-avatar avatar-lilac">A</span><span><b>Alex K.</b><small>Player of many imaginary worlds</small></span></div></article>
        </div>
      </section>
      <section className="cta-section">
        <span className="cta-star">✳</span><div className="section-kicker">YOUR TURN</div>
        <h2>So, what are you<br />dreaming of?</h2><p>Your next favorite image is one idea away.</p>
        <Link to="/register" className="button button-light">Let's make it real <ArrowRight size={16} /></Link>
      </section>
    </main>
    <PublicFooter />
  </div>
}
