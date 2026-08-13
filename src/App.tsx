import { useState, useEffect } from 'react'
import logoSrc from '@/imports/UoE_AzSoc_LOGO.png'
import { useAuth } from '@/context/AuthContext'
import LoginPage from '@/pages/LoginPage'
import AdminDashboard from '@/pages/AdminDashboard'
import { api, type AzEvent } from '@/lib/api'

const NAV_LINKS = [
  { label: 'About', href: '#about' },
  { label: 'Events', href: '#events' },
  { label: 'Gallery', href: '#gallery' },
  { label: 'Committee', href: '#committee' },
  { label: 'Join Us', href: '#join' },
  { label: 'Contact', href: '#contact' },
]

const FALLBACK_EVENTS: AzEvent[] = [
  { id: '1', title: 'Freshers Welcome Night', description: 'Meet fellow members, enjoy traditional Azerbaijani tea, and discover what AzSoc has in store for the year ahead.', date: 'Sep 28, 2025', location: 'Pleasance Courtyard', tag: 'Social', tag_color: '#c0392b', is_featured: true, created_at: '' },
  { id: '2', title: 'Novruz Cultural Evening', description: 'Celebrate the Persian New Year with music, dance, traditional food, and poetry — a night of Azerbaijani heritage.', date: 'Oct 15, 2025', location: 'Old College', tag: 'Cultural', tag_color: '#2a9d8f', is_featured: false, created_at: '' },
  { id: '3', title: 'Academic Panel: The South Caucasus', description: 'A panel of academics and diplomats discuss the geopolitics, history, and future of the South Caucasus region.', date: 'Nov 3, 2025', location: 'Teviot Row House', tag: 'Academic', tag_color: '#c9a84c', is_featured: false, created_at: '' },
  { id: '4', title: 'Azerbaijani Film Screening', description: 'Screening of award-winning Azerbaijani cinema followed by a discussion with a guest speaker.', date: 'Nov 22, 2025', location: 'Filmhouse Edinburgh', tag: 'Arts', tag_color: '#0f2560', is_featured: false, created_at: '' },
  { id: '5', title: 'End of Term Dinner', description: 'Join us for a formal dinner celebrating the end of semester with traditional music and a three-course Azerbaijani menu.', date: 'Dec 10, 2025', location: 'The Playfair Library', tag: 'Social', tag_color: '#c0392b', is_featured: false, created_at: '' },
  { id: '6', title: 'Language Exchange Café', description: 'A casual café session pairing Azerbaijani and Scottish students for language exchange, coffee, and conversation.', date: 'Jan 18, 2026', location: 'Café Nero, South Bridge', tag: 'Language', tag_color: '#2a9d8f', is_featured: false, created_at: '' },
]

const COMMITTEE = [
  { name: 'Leyla Hasanova', role: 'President', initial: 'LH' },
  { name: 'Elçin Mammadov', role: 'Vice President', initial: 'EM' },
  { name: 'Nigar Aliyeva', role: 'Events Director', initial: 'NA' },
  { name: 'Kamran Huseynov', role: 'Treasurer', initial: 'KH' },
  { name: 'Aynur Qasımova', role: 'Social Secretary', initial: 'AQ' },
  { name: 'Tural Rzayev', role: 'Outreach Officer', initial: 'TR' },
]

type Page = 'site' | 'login' | 'admin'

export default function App() {
  const { profile, loading: authLoading } = useAuth()
  const [page, setPage] = useState<Page>('site')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [events, setEvents] = useState<AzEvent[]>(FALLBACK_EVENTS)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [formData, setFormData] = useState({ name: '', email: '', year: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    api.getEvents()
      .then(({ events: data }) => { if (data?.length) setEvents(data) })
      .catch(() => {})
      .finally(() => setEventsLoading(false))
  }, [])

  // Auto-redirect admin to dashboard
  useEffect(() => {
    if (page === 'login' && profile) {
      setPage(profile.role === 'admin' ? 'admin' : 'site')
    }
  }, [profile, page])

  if (authLoading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a1a42', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={logoSrc} alt="Loading" style={{ width: 80, height: 80, borderRadius: '50%', opacity: 0.7, animation: 'spin 1.5s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (page === 'login') return <LoginPage onBack={() => setPage('site')} />
  if (page === 'admin') return <AdminDashboard onBack={() => setPage('site')} />

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, transition: 'all 0.3s ease', backgroundColor: scrolled ? '#0a1a42' : 'transparent', boxShadow: scrolled ? '0 2px 24px rgba(0,0,0,0.35)' : 'none', borderBottom: scrolled ? '1px solid rgba(201,168,76,0.2)' : 'none' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
          <a href="#hero" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <img src={logoSrc} alt="AzSoc UoE Logo" style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
            <div>
              <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1.1 }}>Azerbaijan Society</div>
              <div style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.08em', textTransform: 'uppercase' }}>University of Edinburgh</div>
            </div>
          </a>

          <div style={{ display: 'flex', gap: 28, alignItems: 'center' }} className="hidden-mobile">
            {NAV_LINKS.map(link => (
              link.label === 'Join Us'
                ? <a key={link.label} href={link.href} style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#0a1a42', backgroundColor: '#c9a84c', padding: '8px 18px', borderRadius: 4, textDecoration: 'none', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#e0c060')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#c9a84c')}>
                    {link.label}
                  </a>
                : <a key={link.label} href={link.href} style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#c9a84c')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.85)')}>
                    {link.label}
                  </a>
            ))}
            {/* Auth button */}
            {profile ? (
              <button onClick={() => setPage('admin')} style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: '#c9a84c', background: 'none', border: '1px solid rgba(201,168,76,0.5)', padding: '7px 16px', borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(201,168,76,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}>
                ⚙ Admin
              </button>
            ) : (
              <button onClick={() => setPage('login')} style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', background: 'none', border: '1px solid rgba(255,255,255,0.2)', padding: '7px 16px', borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}>
                Sign In
              </button>
            )}
          </div>

          <button onClick={() => setMenuOpen(!menuOpen)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }} className="show-mobile" aria-label="Toggle menu">
            <div style={{ width: 24, height: 2, backgroundColor: '#fff', marginBottom: 5, transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <div style={{ width: 24, height: 2, backgroundColor: '#fff', marginBottom: 5, opacity: menuOpen ? 0 : 1 }} />
            <div style={{ width: 24, height: 2, backgroundColor: '#fff', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        </div>

        {menuOpen && (
          <div style={{ backgroundColor: '#0a1a42', borderTop: '1px solid rgba(201,168,76,0.2)', padding: '16px 24px 24px' }}>
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '12px 0', fontSize: 15, fontWeight: 500, color: link.label === 'Join Us' ? '#c9a84c' : 'rgba(255,255,255,0.85)', textDecoration: 'none', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                {link.label}
              </a>
            ))}
            <button onClick={() => { setMenuOpen(false); setPage('login') }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4 }}>
              {profile ? '⚙ Admin' : 'Sign In'}
            </button>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section id="hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=1800&h=900&fit=crop&auto=format)`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.35)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(15,37,96,0.7) 0%, rgba(10,26,66,0.85) 60%, rgba(192,57,43,0.25) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 5, display: 'flex' }}>
          <div style={{ flex: 1, backgroundColor: '#0092BC' }} />
          <div style={{ flex: 1, backgroundColor: '#E8383E' }} />
          <div style={{ flex: 1, backgroundColor: '#3F9142' }} />
        </div>

        <div style={{ position: 'relative', textAlign: 'center', padding: '120px 24px 80px', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src={logoSrc} alt="Azerbaijan Society UoE" style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(201,168,76,0.6)', boxShadow: '0 0 60px rgba(201,168,76,0.2)', marginBottom: 40 }} />
          <div style={{ fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', marginBottom: 20, fontWeight: 600 }}>Est. University of Edinburgh</div>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(44px, 7vw, 82px)', fontWeight: 900, color: '#fff', lineHeight: 1.05, marginBottom: 28 }}>
            Azerbaijan Society<br />
            <em style={{ fontStyle: 'italic', color: '#c9a84c' }}>at Edinburgh</em>
          </h1>
          <p style={{ fontSize: 'clamp(16px, 2.2vw, 20px)', color: 'rgba(255,255,255,0.75)', maxWidth: 620, margin: '0 auto 48px', lineHeight: 1.7, fontWeight: 300 }}>
            Bridging Baku and Edinburgh — celebrating Azerbaijani culture, fostering community, and building lasting connections between two great cities.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="#join" style={{ display: 'inline-block', backgroundColor: '#c9a84c', color: '#0a1a42', padding: '14px 36px', borderRadius: 4, fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(201,168,76,0.3)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e0c060'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#c9a84c'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Become a Member
            </a>
            <a href="#about" style={{ display: 'inline-block', backgroundColor: 'transparent', color: '#fff', padding: '14px 36px', borderRadius: 4, fontWeight: 600, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.4)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff' }}>
              Learn More
            </a>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Scroll</div>
          <div style={{ width: 1, height: 40, backgroundColor: 'rgba(201,168,76,0.5)', animation: 'scrollpulse 2s infinite' }} />
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ backgroundColor: '#fff', padding: 'clamp(60px, 8vw, 120px) 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 72, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700, marginBottom: 16 }}>Who We Are</div>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 700, color: '#0f2560', lineHeight: 1.1, marginBottom: 28 }}>
              Two Cities,<br />One Community
            </h2>
            <div style={{ width: 48, height: 3, backgroundColor: '#c0392b', marginBottom: 32 }} />
            <p style={{ fontSize: 17, lineHeight: 1.8, color: '#3a3a4a', marginBottom: 20 }}>
              The Azerbaijan Society at the University of Edinburgh brings together Azerbaijani students, staff, and friends of Azerbaijan from across the University and the wider Edinburgh community.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.8, color: '#3a3a4a', marginBottom: 36 }}>
              Founded to celebrate and share Azerbaijani culture — from the ancient fire temples of Ateshgah to the modern skyline of Baku — we host cultural events, academic talks, language exchanges, and social gatherings throughout the academic year.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {[{ num: '200+', label: 'Members' }, { num: '20+', label: 'Events per year' }, { num: '15+', label: 'Nationalities' }, { num: '5', label: 'Years running' }].map(stat => (
                <div key={stat.label} style={{ padding: '20px', backgroundColor: '#f8f5f0', borderRadius: 6, borderLeft: '3px solid #c9a84c' }}>
                  <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, color: '#0f2560' }}>{stat.num}</div>
                  <div style={{ fontSize: 13, color: '#6a6a7a', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 20px 60px rgba(15,37,96,0.18)' }}>
              <img src="https://images.unsplash.com/photo-1596306499398-8d88944a5ec4?w=700&h=500&fit=crop&auto=format" alt="Baku city skyline" style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ position: 'absolute', bottom: -24, left: -24, backgroundColor: '#0f2560', color: '#fff', padding: '20px 28px', borderRadius: 6, boxShadow: '0 8px 32px rgba(15,37,96,0.3)' }}>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 600, color: '#c9a84c' }}>Baku & Edinburgh</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Connected by culture and curiosity</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── EVENTS ── */}
      <section id="events" style={{ backgroundColor: '#f8f5f0', padding: 'clamp(60px, 8vw, 120px) 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700, marginBottom: 14 }}>What's On</div>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 700, color: '#0f2560', lineHeight: 1.1, marginBottom: 16 }}>Upcoming Events</h2>
            <p style={{ fontSize: 17, color: '#6a6a7a', maxWidth: 520, margin: '0 auto' }}>From cultural celebrations to academic panels — there is always something happening at AzSoc.</p>
          </div>

          {eventsLoading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#6a6a7a' }}>Loading events…</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 28 }}>
              {events.map(event => (
                <div key={event.id}
                  style={{ backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 16px rgba(15,37,96,0.08)', transition: 'all 0.25s', cursor: 'default', borderTop: `4px solid ${event.tag_color}` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 36px rgba(15,37,96,0.15)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 16px rgba(15,37,96,0.08)' }}>
                  {event.image_url && <img src={event.image_url} alt={event.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />}
                  <div style={{ padding: '28px 28px 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: event.tag_color, backgroundColor: `${event.tag_color}15`, padding: '4px 10px', borderRadius: 3 }}>{event.tag}</span>
                      <span style={{ fontSize: 13, color: '#8a8a9a', fontWeight: 500 }}>{event.date}</span>
                    </div>
                    <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, color: '#0f2560', marginBottom: 12, lineHeight: 1.3 }}>{event.title}</h3>
                    {event.location && <div style={{ fontSize: 13, color: '#8a8a9a', marginBottom: 8 }}>📍 {event.location}</div>}
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: '#5a5a6a' }}>{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section id="gallery" style={{ backgroundColor: '#0f2560', padding: 'clamp(60px, 8vw, 100px) 24px', position: 'relative', overflow: 'hidden' }}>
        <svg style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)', opacity: 0.04, width: 500, height: 500 }} viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#c9a84c" strokeWidth="3" />
          <path d="M120,55 Q145,100 120,145 Q90,125 90,100 Q90,75 120,55Z" fill="#c9a84c" />
          <polygon points="130,70 135,82 148,82 138,90 142,102 130,94 118,102 122,90 112,82 125,82" fill="#c9a84c" />
        </svg>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700, marginBottom: 14 }}>Our Two Homes</div>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>Baku meets Edinburgh</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { url: 'https://images.unsplash.com/photo-1596306499398-8d88944a5ec4?w=700&h=480&fit=crop&auto=format', alt: 'Baku skyline with Flame Towers', label: 'Baku, Azerbaijan' },
              { url: 'https://images.unsplash.com/photo-1506377585622-bedcbb027afc?w=700&h=480&fit=crop&auto=format', alt: 'Edinburgh from Calton Hill', label: 'Edinburgh, Scotland' },
              { url: 'https://images.unsplash.com/photo-1616701639706-a89d1a609eda?w=700&h=480&fit=crop&auto=format', alt: 'Architecture in Baku', label: 'Old City, Baku' },
              { url: 'https://images.unsplash.com/photo-1595599014147-a419c147bdc0?w=700&h=480&fit=crop&auto=format', alt: 'University of Edinburgh building', label: 'University of Edinburgh' },
            ].map(img => (
              <div key={img.label} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden', aspectRatio: '4/3' }}
                onMouseEnter={e => { const o = e.currentTarget.querySelector('.photo-overlay') as HTMLElement; if (o) o.style.opacity = '1' }}
                onMouseLeave={e => { const o = e.currentTarget.querySelector('.photo-overlay') as HTMLElement; if (o) o.style.opacity = '0' }}>
                <img src={img.url} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div className="photo-overlay" style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,37,96,0.75)', display: 'flex', alignItems: 'flex-end', padding: 20, opacity: 0, transition: 'opacity 0.3s' }}>
                  <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, color: '#fff', fontWeight: 600 }}>{img.label}</span>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.5))', padding: '24px 16px 14px' }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>{img.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMMITTEE ── */}
      <section id="committee" style={{ backgroundColor: '#fff', padding: 'clamp(60px, 8vw, 120px) 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700, marginBottom: 14 }}>The Team</div>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(34px, 4vw, 52px)', fontWeight: 700, color: '#0f2560', lineHeight: 1.1, marginBottom: 16 }}>2025–26 Committee</h2>
            <p style={{ fontSize: 17, color: '#6a6a7a', maxWidth: 480, margin: '0 auto' }}>Dedicated students working to make AzSoc a welcoming home away from home.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24 }}>
            {COMMITTEE.map(member => (
              <div key={member.name} style={{ textAlign: 'center', padding: '32px 20px 28px', backgroundColor: '#f8f5f0', borderRadius: 8, transition: 'all 0.25s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(15,37,96,0.12)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', backgroundColor: '#0f2560', color: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, margin: '0 auto 16px', border: '2px solid #c9a84c' }}>
                  {member.initial}
                </div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 18, fontWeight: 600, color: '#0f2560', marginBottom: 6 }}>{member.name}</div>
                <div style={{ fontSize: 13, color: '#c0392b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{member.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN ── */}
      <section id="join" style={{ position: 'relative', padding: 'clamp(60px, 8vw, 120px) 24px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1569668444050-b7bc2bfec0c7?w=1800&h=700&fit=crop&auto=format)', backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(0.2)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(15,37,96,0.9) 0%, rgba(192,57,43,0.5) 100%)' }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700, marginBottom: 16 }}>Get Involved</div>
          <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 24 }}>
            Become Part of<br /><em style={{ fontStyle: 'italic', color: '#c9a84c' }}>Our Community</em>
          </h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: 48 }}>
            Whether you are Azerbaijani, have visited Azerbaijan, or are simply curious about the culture — everyone is welcome at AzSoc. Join for free through EUSA.
          </p>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="https://www.eusa.ed.ac.uk" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', backgroundColor: '#c9a84c', color: '#0a1a42', padding: '15px 40px', borderRadius: 4, fontWeight: 700, fontSize: 15, letterSpacing: '0.05em', textDecoration: 'none', transition: 'all 0.2s', textTransform: 'uppercase' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#e0c060'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#c9a84c'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Join on EUSA
            </a>
            <button onClick={() => setPage('login')} style={{ display: 'inline-block', backgroundColor: 'transparent', color: '#fff', padding: '15px 40px', borderRadius: 4, fontWeight: 600, fontSize: 15, letterSpacing: '0.05em', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.4)', transition: 'all 0.2s', textTransform: 'uppercase', cursor: 'pointer' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#c9a84c'; e.currentTarget.style.color = '#c9a84c' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff' }}>
              Member Login
            </button>
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ backgroundColor: '#f8f5f0', padding: 'clamp(60px, 8vw, 120px) 24px' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 72, alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a84c', fontWeight: 700, marginBottom: 16 }}>Say Hello</div>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: 'clamp(34px, 4vw, 48px)', fontWeight: 700, color: '#0f2560', lineHeight: 1.1, marginBottom: 24 }}>Get in Touch</h2>
            <div style={{ width: 48, height: 3, backgroundColor: '#c0392b', marginBottom: 28 }} />
            <p style={{ fontSize: 16, color: '#5a5a6a', lineHeight: 1.8, marginBottom: 40 }}>
              Questions about events, membership, or collaborations? We would love to hear from you.
            </p>
            {[
              { icon: '✉️', label: 'Email', value: 'azerbaijanisociety.uoe@gmail.com' },
              { icon: '📸', label: 'Instagram', value: '@uoe.azerbaijan' },
              { icon: '📍', label: 'Location', value: 'University of Edinburgh, Edinburgh EH8 9YL' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
                <span style={{ fontSize: 20, marginTop: 2 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9a9aaa', marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: 15, color: '#1a1a2e', fontWeight: 500 }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: 10, padding: 'clamp(28px, 5vw, 48px)', boxShadow: '0 4px 32px rgba(15,37,96,0.08)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>🎉</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, fontWeight: 700, color: '#0f2560', marginBottom: 12 }}>Message Sent!</h3>
                <p style={{ color: '#6a6a7a', fontSize: 16 }}>Thanks for reaching out. We will get back to you soon.</p>
                <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', year: '', message: '' }) }} style={{ marginTop: 24, fontSize: 14, color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 700, color: '#0f2560', marginBottom: 28 }}>Send a Message</h3>
                {[
                  { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Leyla Hasanova' },
                  { id: 'email', label: 'Email Address', type: 'email', placeholder: 's1234567@ed.ac.uk' },
                  { id: 'year', label: 'Year of Study', type: 'text', placeholder: 'e.g. 2nd Year, Postgraduate…' },
                ].map(field => (
                  <div key={field.id} style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3a3a4a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{field.label}</label>
                    <input type={field.type} placeholder={field.placeholder} value={formData[field.id as keyof typeof formData]}
                      onChange={e => setFormData(prev => ({ ...prev, [field.id]: e.target.value }))} required
                      style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: 15, outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fafafa', fontFamily: 'inherit' }}
                      onFocus={e => (e.target.style.borderColor = '#0f2560')}
                      onBlur={e => (e.target.style.borderColor = '#ddd')} />
                  </div>
                ))}
                <div style={{ marginBottom: 28 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3a3a4a', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Message</label>
                  <textarea placeholder="Tell us how we can help…" value={formData.message} onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))} required rows={4}
                    style={{ width: '100%', padding: '12px 16px', border: '1.5px solid #ddd', borderRadius: 6, fontSize: 15, outline: 'none', resize: 'vertical', transition: 'border-color 0.2s', backgroundColor: '#fafafa', fontFamily: 'inherit' }}
                    onFocus={e => (e.target.style.borderColor = '#0f2560')}
                    onBlur={e => (e.target.style.borderColor = '#ddd')} />
                </div>
                <button type="submit" style={{ width: '100%', backgroundColor: '#0f2560', color: '#fff', padding: '15px', borderRadius: 6, fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1a3575')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#0f2560')}>
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ backgroundColor: '#0a1a42', borderTop: '1px solid rgba(201,168,76,0.2)', padding: '48px 24px 32px' }}>
        <div style={{ display: 'flex', height: 3, maxWidth: 1160, margin: '0 auto 40px' }}>
          <div style={{ flex: 1, backgroundColor: '#0092BC' }} />
          <div style={{ flex: 1, backgroundColor: '#E8383E' }} />
          <div style={{ flex: 1, backgroundColor: '#3F9142' }} />
        </div>
        <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <img src={logoSrc} alt="AzSoc logo" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 14, color: '#fff' }}>Azerbaijan Society</div>
                <div style={{ fontSize: 11, color: '#c9a84c', letterSpacing: '0.08em' }}>University of Edinburgh</div>
              </div>
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>Bridging cultures, building community — connecting Azerbaijan and Scotland.</p>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Quick Links</div>
            {NAV_LINKS.map(link => (
              <a key={link.label} href={link.href} style={{ display: 'block', fontSize: 14, color: 'rgba(255,255,255,0.6)', textDecoration: 'none', marginBottom: 10, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#c9a84c')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
                {link.label}
              </a>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#c9a84c', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Connect</div>
            {[
              { label: 'Instagram', handle: '@uoe.azerbaijan' },
              { label: 'Email', handle: 'azerbaijanisociety.uoe@gmail.com' },
              { label: 'EUSA Page', handle: 'eusa.ed.ac.uk' },
            ].map(s => (
              <div key={s.label} style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 12, color: '#c9a84c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}: </span>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{s.handle}</span>
              </div>
            ))}
            <button onClick={() => setPage('login')} style={{ marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#c9a84c')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
              Member Login →
            </button>
          </div>
        </div>
        <div style={{ maxWidth: 1160, margin: '0 auto', paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>© 2025–26 Azerbaijan Society, University of Edinburgh. All rights reserved.</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>Affiliated with EUSA</div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } .show-mobile { display: block !important; } }
        @media (min-width: 769px) { .show-mobile { display: none !important; } }
        @keyframes scrollpulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>
    </div>
  )
}
