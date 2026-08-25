import { useState, useEffect, useRef } from 'react'
import logoSrc from '@/imports/UoE_AzSoc_LOGO.png'
import { useAuth } from '@/context/AuthContext'
import LoginPage from '@/pages/LoginPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import AdminDashboard from '@/pages/AdminDashboard'
import { api, type AzEvent, type CommitteeMember } from '@/lib/api'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import img1 from "@/imports/image1.jpg";
import img2 from "@/imports/image2.jpg";
import img3 from "@/imports/image3.png";
import img4 from "@/imports/image4.png";
import img5 from "@/imports/image5.png";
import herobg from "@/imports/heroBack.jpg"
import img6 from "@/imports/image6.png";
import carpet from "@/imports/carpet.jpg";

/* ---------- Types ---------- */
type Photo = {
  src: string;
  top: string;
  left: string;
  width: number;
  height: number;
  rotate: number;
  zIndex?: number;

};
type NavLink = {
  label: string;
  href: string;
};

type SocialLink = {
  label: string;
  href: string;
};

const SOCIALS: SocialLink[] = [
  { label: "Instagram", href: "https://www.instagram.com/uoe.azerbaijan/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/azerbaijan-society-university-of-edinburgh" },
];

/* ---------- Data ---------- */
const NAV_LINKS: NavLink[] = [
  { label: "about us", href: "#about" },
  { label: "events", href: "#events" },
  { label: "committee", href: "#committee" },
  { label: "join us", href: "#join" },
  { label: "contact", href: "#contact" },
];

const STATS = [
  { num: "100+", label: "Members" },
  { num: "20+", label: "Events / year" },
  { num: "10+", label: "Nationalities" },
  { num: "3", label: "Years running" },
];

const PHOTOS: Photo[] = [
  { src: img1, top: "6%", left: "-20%", width: 340, height: 240, rotate: -9 },
  { src: img2, top: "4%", left: "20%", width: 380, height: 260, rotate: 7 },
  { src: img3, top: "34%", left: "0%", width: 410, height: 260, rotate: 5 },
  { src: img4, top: "50%", left: "-10%", width: 400, height: 280, rotate: -6 },
  { src: img5, top: "28%", left: "30%", width: 320, height: 300, rotate: 12, zIndex: 3 },
  { src: img6, top: "63%", left: "6%", width: 335, height: 360, rotate: 9 },
];

const FALLBACK_EVENTS: AzEvent[] = [
  { id: '1', title: 'Freshers Welcome Night', description: 'Meet fellow members, enjoy traditional Azerbaijani tea, and discover what AzSoc has in store for the year ahead.', date: 'Sep 28, 2025', location: 'Pleasance Courtyard', tag: 'Social', tag_color: '#c0392b', is_featured: true, created_at: '' },
  { id: '2', title: 'Novruz Cultural Evening', description: 'Celebrate the Persian New Year with music, dance, traditional food, and poetry — a night of Azerbaijani heritage.', date: 'Oct 15, 2025', location: 'Old College', tag: 'Cultural', tag_color: '#2a9d8f', is_featured: false, created_at: '' },
  { id: '3', title: 'Academic Panel: The South Caucasus', description: 'A panel of academics and diplomats discuss the geopolitics, history, and future of the South Caucasus region.', date: 'Nov 3, 2025', location: 'Teviot Row House', tag: 'Academic', tag_color: '#c9a84c', is_featured: false, created_at: '' },
  { id: '4', title: 'Azerbaijani Film Screening', description: 'Screening of award-winning Azerbaijani cinema followed by a discussion with a guest speaker.', date: 'Nov 22, 2025', location: 'Filmhouse Edinburgh', tag: 'Arts', tag_color: '#0f2560', is_featured: false, created_at: '' },
]

const FALLBACK_COMMITTEE: CommitteeMember[] = [
  { id: '1', name: 'Leyla Hasanova', role: 'President', display_order: 1, created_at: '' },
  { id: '2', name: 'Elçin Mammadov', role: 'Vice President', display_order: 2, created_at: '' },
  { id: '3', name: 'Nigar Aliyeva', role: 'Events Director', display_order: 3, created_at: '' },
  { id: '4', name: 'Kamran Huseynov', role: 'Treasurer', display_order: 4, created_at: '' },
  { id: '5', name: 'Aynur Qasımova', role: 'Social Secretary', display_order: 5, created_at: '' },
  { id: '6', name: 'Tural Rzayev', role: 'Outreach Officer', display_order: 6, created_at: '' },
]

type Page = 'site' | 'login' | 'admin' | 'reset-password'

export default function App() {
     const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const maxOffset = 300; // max px it can move up or down — tweak this

    const handleScroll = () => {
      if (divRef.current) {
        const rawOffset = -window.scrollY * 0.3;
        // clamp between -maxOffset and +maxOffset
        const clampedOffset = Math.max(-maxOffset, Math.min(maxOffset, rawOffset));
        divRef.current.style.transform = `rotate(15deg) translateY(${clampedOffset+300}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { profile, loading: authLoading, logout, passwordRecovery } = useAuth()
  const [page, setPage] = useState<Page>('site')
  const [menuOpen, setMenuOpen] = useState(false)
  const [memberMenuOpen, setMemberMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [events, setEvents] = useState<AzEvent[]>(isSupabaseConfigured ? [] : FALLBACK_EVENTS)
  const [committee, setCommittee] = useState<CommitteeMember[]>(FALLBACK_COMMITTEE)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set())
  const [selectedEvent, setSelectedEvent] = useState<AzEvent | null>(null)
  const [eventImageMap, setEventImageMap] = useState<Record<string, string>>({})
  const [registering, setRegistering] = useState(false)
  const [registrationError, setRegistrationError] = useState('')
  const [formData, setFormData] = useState({ name: '', email: '', year: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    api.getCommitteeMembers()
      .then(({ members }) => { if (members?.length) setCommittee(members) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    api.getEvents()
      .then(({ events: data }) => { setEvents(data || []) })
      .catch(() => {})
      .finally(() => setEventsLoading(false))
  }, [])

  useEffect(() => {
    let mounted = true;
    const urlsCreated: string[] = [];
    async function fetchImages() {
      for (const ev of events) {
        if (!ev.image_url) continue;
        if (/^https?:\/\//i.test(ev.image_url)) {
          setEventImageMap(prev => ({ ...prev, [ev.id]: ev.image_url as string }));
          continue;
        }
        try {
          const { url } = await api.downloadFromStorage(undefined, 'events', ev.image_url as string);
          if (!mounted) { URL.revokeObjectURL(url); break; }
          urlsCreated.push(url);
          setEventImageMap(prev => ({ ...prev, [ev.id]: url }));
        } catch (_e) {
          // ignore download errors
        }
      }
    }
    fetchImages();
    return () => { mounted = false; urlsCreated.forEach(u => URL.revokeObjectURL(u)); };
  }, [events])

  useEffect(() => {
    if (!profile) {
      setRegisteredEventIds(new Set())
      return
    }
    api.getMyEventRegistrations()
      .then(({ registrations }) => setRegisteredEventIds(new Set(registrations.map(registration => registration.event_id))))
      .catch(() => setRegisteredEventIds(new Set()))
  }, [profile])

  // Auto-redirect admin to dashboard
  useEffect(() => {
    if (page === 'login' && profile) {
      setPage(profile.role === 'admin' ? 'admin' : 'site')
    }
  }, [profile, page])

  useEffect(() => {
    if (page === 'admin' && profile?.role !== 'admin') setPage('site')
  }, [profile, page])

  useEffect(() => {
    if (passwordRecovery) setPage('reset-password')
  }, [passwordRecovery])

  // Close the mobile nav whenever the viewport is resized back up to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 860) setMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lock body scroll while the mobile nav drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  if (authLoading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a1a42', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src={logoSrc} alt="Loading" style={{ width: 80, height: 80, borderRadius: '50%', opacity: 0.7, animation: 'spin 1.5s linear infinite' }} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (page === 'login') return <LoginPage onBack={() => setPage('site')} />
  if (page === 'admin') return <AdminDashboard onBack={() => setPage('site')} />
  if (page === 'reset-password') return <ResetPasswordPage onDone={() => setPage('site')} />

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const payload = profile ? { name: profile.full_name || '', email: profile.email, year: '', message: formData.message } : formData
      await api.createContactMessage(payload)
      setSubmitted(true)
      setFormData({ name: '', email: '', year: '', message: '' })
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Unable to send your message. Please try again.')
    }
  }

  async function registerForSelectedEvent() {
    if (!selectedEvent) return
    if (!profile) {
      setSelectedEvent(null)
      setPage('login')
      return
    }
    setRegistering(true)
    setRegistrationError('')
    try {
      await api.registerForEvent(selectedEvent.id)
      setRegisteredEventIds(previous => new Set(previous).add(selectedEvent.id))
    } catch (error) {
      setRegistrationError(error instanceof Error ? error.message : 'Unable to register for this event.')
    } finally {
      setRegistering(false)
    }
  }


  //carpet animation



  return (
      <div className="az-page">
      <style>{styles}</style>

      {/* NAVIGATION */}
      <nav className="az-nav">
        <button
          type="button"
          className={`az-nav-toggle ${menuOpen ? 'is-active' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(open => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <ul className={`az-nav-links ${menuOpen ? 'is-open' : ''}`}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>
            </li>
          ))}

          {/* Auth control — admin shortcut / account menu / sign in */}
          <li className="az-nav-auth-item">
            {profile?.role === 'admin' ? (
              <button type="button" onClick={() => { setPage('admin'); setMenuOpen(false) }}>
                Admin
              </button>
            ) : profile ? (
              <>
                <button
                  type="button"
                  className="az-avatar-btn"
                  onClick={() => setMemberMenuOpen(open => !open)}
                  aria-label="Open account menu"
                  aria-expanded={memberMenuOpen}
                  title={`Signed in as ${profile.full_name || profile.email}`}
                >
                  {(profile.full_name || profile.email).trim().charAt(0).toUpperCase()}
                </button>
                {memberMenuOpen && (
                  <div className="az-member-dropdown">
                    <div className="az-member-dropdown-name">{profile.full_name || profile.email}</div>
                    <button
                      type="button"
                      className="az-signout-btn"
                      onClick={() => { logout(); setMemberMenuOpen(false); setMenuOpen(false) }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button type="button" onClick={() => { setPage('login'); setMenuOpen(false) }}>
                Sign In
              </button>
            )}
          </li>
        </ul>


        {menuOpen && <button type="button" className="az-nav-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
      </nav>

      {/* HERO */}
      <header className="az-hero" id="about">
        <img src={herobg} className='hero-background'></img>
        <div className="az-hero-left" style={{background: "none"}}
>
          <div className="az-logo" style={{backgroundImage: `url(${logoSrc})`, backgroundSize: "100%"}}></div>
          <h1 className="az-title">
            Azerbaijan
            <br />
            Society
          </h1>
          <p className="az-subtitle">
            THE UNIVERSITY
            <br />
            <em>of</em> EDINBURGH
          </p>
          <p className="az-intro">
            We are one of the largest Azerbaijani student societies in the UK,
            proudly running cultural, networking, and social events at the
            University of Edinburgh since 2021.
          </p>

          {/* Quick stats */}
          <div className="az-stats">
            {STATS.map((stat) => (
              <div key={stat.label} className="az-stat">
                <span className="az-stat-num">{stat.num}</span>
                <span className="az-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="az-hero-right">
          {PHOTOS.map((photo, i) => (
            <div
              key={i}
              className="az-photo"
              style={{
                top: photo.top,
                left: photo.left,
                width: photo.width,
                height: photo.height,
                transform: `rotate(${photo.rotate}deg)`,
                zIndex: photo.zIndex,
                ['--photo-rotate' as string]: `${photo.rotate}deg`,
              }}
            >
                  <img src={photo.src} alt={`Society photo ${i + 1}`} />

              
            </div>
          ))}
        </div>
      </header>

      {/* EVENTS */}
      <section className="az-events" id="events">
        <h2 className="az-section-title">Upcoming Events</h2>

        {eventsLoading ? (
          <p className="az-events-loading">Loading events…</p>
        ) : (
          <div className="az-event-grid">
            {events.map((event) => {
              const isUrl = /^https?:\/\//i.test(event.image_url || '');
              const imgSrc = isUrl ? event.image_url : eventImageMap[event.id];
              const isRegistered = registeredEventIds.has(event.id);
              return (
                <article
                  key={event.id}
                  className="az-event-card"
                  style={{ borderTop: `4px solid ${event.tag_color || '#08004F'}` }}
                  onClick={() => { setSelectedEvent(event); setRegistrationError('') }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedEvent(event);
                      setRegistrationError('');
                    }
                  }}
                >
                  {imgSrc ? (
                    <img className="az-event-thumb-img" src={imgSrc} alt={event.title} />
                  ) : (
                    <div className="az-event-thumb">Event image</div>
                  )}
                  <div className="az-event-body">
                    <div className="az-event-meta">
                      {event.tag && (
                        <span
                          className="az-event-tag"
                          style={{ color: event.tag_color || '#08004F', backgroundColor: `${event.tag_color || '#08004F'}18` }}
                        >
                          {event.tag}
                        </span>
                      )}
                      <p className="az-event-date">{event.date}</p>
                    </div>
                    <h3 className="az-event-name">{event.title}</h3>
                    {event.location && <p className="az-event-location">📍 {event.location}</p>}
                    <p className="az-event-desc">{event.description}</p>
                    <p className="az-event-status" style={isRegistered ? { color: '#2a9d8f' } : undefined}>
                      {isRegistered ? '✓ You are registered' : 'View event & register →'}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Azerbaijani carpet placeholder */}
        <div className="az-carpet"  ref={divRef}  style={{
    backgroundImage: `url(${carpet})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
        </div>
      </section>

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <div
          className="az-modal-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedEvent(null) }}
        >
          <div className="az-modal" role="dialog" aria-modal="true" aria-labelledby="az-modal-title">
            {(() => {
              const isUrl = /^https?:\/\//i.test(selectedEvent.image_url || '');
              const src = isUrl ? selectedEvent.image_url : eventImageMap[selectedEvent.id];
              return src ? <img className="az-modal-image" src={src} alt="" /> : null;
            })()}
            <div className="az-modal-body">
              <div className="az-modal-top">
                {selectedEvent.tag && (
                  <span
                    className="az-event-tag"
                    style={{ color: selectedEvent.tag_color || '#08004F', backgroundColor: `${selectedEvent.tag_color || '#08004F'}18` }}
                  >
                    {selectedEvent.tag}
                  </span>
                )}
                <button type="button" className="az-modal-close" aria-label="Close event details" onClick={() => setSelectedEvent(null)}>×</button>
              </div>
              <h3 id="az-modal-title" className="az-modal-title">{selectedEvent.title}</h3>
              <div className="az-modal-meta">
                <span>📅 {selectedEvent.date}</span>
                {selectedEvent.location && <span>📍 {selectedEvent.location}</span>}
              </div>
              <p className="az-modal-desc">{selectedEvent.description}</p>

              {registrationError && <div className="az-modal-error">{registrationError}</div>}

              {registeredEventIds.has(selectedEvent.id) ? (
                <div className="az-modal-registered">✓ You are registered for this event</div>
              ) : (
                <button
                  type="button"
                  className="az-modal-register"
                  disabled={registering}
                  onClick={registerForSelectedEvent}
                >
                  {registering ? 'Registering…' : profile ? 'Register for this event' : 'Sign in to register'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMMITTEE */}
      <section className="az-committee" id="committee">
        <h2 className="az-section-title">Committee</h2>
        <p className="az-section-sub">
          Meet the team behind the Azerbaijan Society.
        </p>

        <div className="az-committee-grid">
          {committee.map((member, i) => (
            <article key={i} className="az-member-card">
              <div className="az-member-photo">
                {member.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <h3 className="az-member-name">{member.name}</h3>
              <p className="az-member-role">{member.role}</p>
            </article>
          ))}
        </div>
      </section>

      {/* JOIN */}
      <section className="az-join" id="join">
        <div className="az-join-inner">
          <h2 className="az-join-title">Become part of our community</h2>
          <p className="az-join-text">
            Whether you're Azerbaijani, have visited Azerbaijan, or are simply
            curious about the culture — everyone is welcome at AzSoc. Joining
            is free through EUSA.
          </p>
          <div className="az-join-actions">
           
            <button type="button" className="az-join-secondary" onClick={() => setPage('login')}>
              {profile ? 'Member Dashboard' : 'Member Login'}
            </button>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="az-contact" id="contact">
        <div className="az-contact-inner">
          <div className="az-contact-info">
            <h2 className="az-contact-title">Get in Touch</h2>
            <p className="az-contact-text">
              Have a question or want to collaborate? Send us a message and
              we'll get back to you as soon as we can.
            </p>

            <ul className="az-contact-list">
              <li>
                <span className="az-contact-label" target="_blank" >Email</span>
azerbaijanisociety.uoe@gmail.com              </li>
             
            </ul>

            <div className="az-contact-socials">
              {SOCIALS.map((s) => (
                <a key={s.label} href={s.href} target="_blank"  className="az-social-link">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <form className="az-contact-form" onSubmit={handleSubmit}>
            {submitted ? (
              <div className="az-contact-success">
                <p className="az-contact-success-title">Message sent!</p>
                <p className="az-contact-success-text">
                  Thanks for reaching out — we'll get back to you soon.
                </p>
                <button
                  type="button"
                  className="az-contact-again"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                {!profile && (
                  <>
                    <label className="az-field">
                      <span>Name</span>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </label>
                    <label className="az-field">
                      <span>Email</span>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </label>
                  </>
                )}
                <label className="az-field">
                  <span>Message</span>
                  <textarea
                    rows={4}
                    placeholder="Your message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    required
                  />
                </label>
                <button type="submit" className="az-submit">
                  Send Message
                </button>
              </>
            )}
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="az-footer">
        <div className="az-footer-inner">
          <div className="az-footer-brand">
            <div className="az-footer-logo" style={{backgroundImage: `url(${logoSrc})`, backgroundSize: "100%"}}></div>
            <p className="az-footer-name">Azerbaijan Society</p>
            <p className="az-footer-uni">The University of Edinburgh</p>
          </div>

          <div className="az-footer-col">
            <h4>Explore</h4>
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>

          <div className="az-footer-col">
            <h4>Follow</h4>
            {SOCIALS.map((s) => (
              <a key={s.label} href={s.href} target="_blank"  >
                {s.label}
              </a>
            ))}
          </div>

          <div className="az-footer-col">
            <h4>Contact</h4>
            <a href="mailto:azerbaijanisociety.uoe@gmail.com" target="_blank" >
azerbaijanisociety.uoe@gmail.com            </a>
          </div>

          <div className="az-footer-col">
            <h4>Account</h4>
            {profile?.role === 'admin' ? (
              <button type="button" className="az-footer-linkbtn" onClick={() => setPage('admin')}>
                Admin Dashboard
              </button>
            ) : profile ? (
              <button type="button" className="az-footer-linkbtn" onClick={() => logout()}>
                Sign Out
              </button>
            ) : (
              <button type="button" className="az-footer-linkbtn" onClick={() => setPage('login')}>
                Member Login
              </button>
            )}
          </div>
        </div>

        <div className="az-footer-bottom">
          <span>© {new Date().getFullYear()} Azerbaijan Society. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Styles ---------- */
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Pathway+Extreme:ital,opsz,wght@0,8..144,100..900;1,8..144,100..900&display=swap');

  html, body { overflow-x: hidden; }

  .az-page {
    --indigo: #3a2b8c;
    --indigo-dark: #2f2373;
    --ink: #131313;
    --muted: #555;
  font-family: "Pathway Extreme", sans-serif;
  font-optical-sizing: auto;

    color: var(--ink);
    background: #fff;
    overflow-x: hidden;
    width: 100%;
  }
  .az-page * { margin: 0; padding: 0; box-sizing: border-box; font-family: inherit; }
  .az-page img { max-width: 100%; }

  .az-page input,
  .az-page textarea,
  .az-page button { font-family: "Pathway Extreme", sans-serif; }

  /* NAV */
  .az-nav {
    position: sticky;
    top: 0;
    z-index: 50;
    background: #08004F;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px clamp(28px, 9vw, 180px);
    
    gap: 16px;
  }
  .az-nav-links { display: flex; align-items: center; padding-left: 20px; gap: 60px; list-style: none; }
  .az-nav a {
    color: #fff;
    text-decoration: none;
    font-weight: 700;
    display: inline-block;   
    font-size: 15px;
         position: relative;

    opacity: .92;
  transition: transform 0.2s ease-in-out; 

  }
  .az-nav a:hover { 
  opacity: 1; text-decoration: underline;    transform: rotate(-2deg) scale(1.1);
  font-size: 17px;
  z-index:2;
  
}
  .az-lang { font-size: 15px; }

  /* Auth control in nav */
  .az-nav-auth-item { position: relative; display: flex; align-items: center; }
  .az-nav-auth-item > button {
    background: none;
    border: 1px solid rgba(255,255,255,.4);
    color: #fff;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: .3px;
    padding: 7px 16px;
    border-radius: 999px;
    cursor: pointer;
    transition: background .2s, border-color .2s;
  }
  .az-nav-auth-item > button:hover { background: rgba(255,255,255,.12); border-color: rgba(255,255,255,.7); }
  .az-avatar-btn {
    width: 34px !important;
    height: 34px !important;
    border-radius: 50% !important;
    background: #c0392b !important;
    color: #fff !important;
    font-weight: 800 !important;
    font-size: 14px !important;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(255,255,255,.5) !important;
    padding: 0 !important;
  }
  .az-member-dropdown {
    position: absolute;
    top: 44px;
    right: 0;
    min-width: 190px;
    background: #fff;
    color: var(--ink);
    border-radius: 8px;
    padding: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,.25);
    z-index: 60;
  }
  .az-member-dropdown-name {
    font-size: 12px;
    color: var(--muted);
    padding: 6px 10px 10px;
    border-bottom: 1px solid #eee;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .az-signout-btn {
    width: 100%;
    text-align: left;
    background: none;
    border: none !important;
    padding: 8px 10px;
    color: #c0392b !important;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    border-radius: 0 !important;
  }

  /* Mobile nav toggle (hidden on desktop) */
  .az-nav-toggle {
    display: none;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    width: 34px;
    height: 34px;
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 60;
  }
  .az-nav-toggle span {
    display: block;
    width: 100%;
    height: 2px;
    background: #fff;
    border-radius: 2px;
    transition: transform .25s ease, opacity .25s ease;
  }
  .az-nav-toggle.is-active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
  .az-nav-toggle.is-active span:nth-child(2) { opacity: 0; }
  .az-nav-toggle.is-active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

  .az-nav-scrim {
    display: none;
  }

  /* HERO */
.hero-background {
  position: absolute;
  inset: 0;
  width: 100%;
  opacity:0.4;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
.az-hero {
  display: flex;
  min-height: 95vh;
  position: relative;
  background-color: #08004F; /* fixed: "colour" isn't valid CSS, must be "color" */
}  
  .az-hero-left {
    flex: 1 1 46%;
    position: relative;
    padding: 46px clamp(28px, 10vw, 180px) 40px;
    
    display: flex;
    flex-direction: column;
  }
  .az-hero-left::after {
    position: absolute;
    bottom: 10px;
    left: 14px;
    font-size: 11px;
    color: rgba(255,255,255,.6);
    letter-spacing: .5px;
  }
    .az-photo img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s cubic-bezier(.22,.61,.36,1); }

  .az-logo {
    width: 130px;
    height: 130px;
    border-radius: 50%;
  
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;

    margin-bottom: 14px;
    position: relative;
    z-index: 2;
  }
  .az-title {
    font-weight: 700;
    font-size: clamp(60px, 10vw, 120px);
    line-height: .95;
   
    color: white;
    position: relative;
    z-index: 2;
  }
  .az-subtitle {
    font-family: "Playfair Display", Georgia, serif;
    font-size: clamp(25px, 3.2vw, 40px);
    line-height: 1.15;
    color: #ffffffff;
    margin-top: 12px;
    position: relative;
    z-index: 2;
  }
  .az-subtitle em { font-style: italic; }
  .az-intro {
    color: #ffffffff;
    max-width: 600px;
    margin-top: 22px;
    font-size: clamp(16px, 2vw, 20px);
font-weight: 600;
    line-height: 1.5;
    text-shadow: 0 1px 3px rgba(0,0,0,.35);
    position: relative;
    z-index: 2;
  }

  /* STATS */
  .az-stats {
    display: grid;
    grid-template-columns: repeat(2, minmax(110px, 1fr));
    gap: 14px;
    margin-top: 30px;
    max-width: 420px;
    position: relative;
    z-index: 2;
  }
  .az-stat {
    background: rgba(25, 37, 165, 0.62);
    border-left: 3px solid #ffffffff;
    border-radius: 4px;
    padding: 12px 14px;
  }
  .az-stat-num { display: block; font-size: 26px; font-weight: 700; color: #fff; }
  .az-stat-label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: rgba(255,255,255,.7); margin-top: 2px; }

  /* COLLAGE */
  .az-hero-right {
    flex: 1 1 54%;
    position: relative;
    min-height: 560px;
    z-index:1;
  }
.az-photo {
  position: absolute;
  border: 5px solid #062154ff;
  box-shadow: 0 8px 18px rgba(0, 27, 94, 0.18);
  display: flex;
  z-index: 0;
  max-width: 44vw;
  max-height: 44vw;
  overflow: hidden;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #9aa0a8;

  animation: collageIn 0.8s ease-out forwards;
  transition: transform 0.6s ease-in-out;
}

@keyframes collageIn {
  from {
    opacity: 0;
    transform: translateY(60px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1) rotate(var(--photo-rotate));
  }
}

.az-photo.settled {
  animation: none;
  transform: translateY(0) scale(1) rotate(var(--photo-rotate));
  transition: transform 0.6s ease-in-out, box-shadow 0.6s ease-in-out;
}

.az-photo.settled:hover {
  transform: rotate(calc(var(--photo-rotate) * 0.9)) scale(1.3);
  box-shadow: 0 12px 22px rgba(0, 27, 94, 0.24);
  z-index: 10;
}

  /* EVENTS */
  .az-events {
    position: relative;
    padding: 46px clamp(28px, 9vw, 180px) 120px;
    min-height: 95vh;
    overflow: hidden;
  
  }
  .az-section-title { font-weight: 700; font-size: clamp(34px, 7vw, 70px); margin-bottom: 8px; position:relative; z-index:2; }
  .az-section-sub { color: var(--muted); font-size: 15px; margin-bottom: 30px;z-index:1; }
  .az-events .az-section-title { margin-bottom: 30px; z-index:1; }
  .az-events-loading { color: var(--muted); font-size: 15px; position: relative; z-index: 1; }
  .az-event-grid {
  z-index:1;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 24px;
    width: 100%;
  }
  .az-event-card {
    z-index:1;

    border: 1px solid #e6e6e6;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0,0,0,.05);
    background: #fff;
    max-width:260px;
    cursor: pointer;
    transition: transform .2s, box-shadow .2s;
  }
  .az-event-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 26px rgba(0,0,0,.12);
  }
  .az-event-thumb {
    height: 140px;
    background: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9aa0a8;
    font-size: 13px;
    z-index:1;
  }
  .az-event-thumb-img { width: 100%; height: 140px; object-fit: cover; display: block; }
  .az-event-body { padding: 14px 16px 18px; }
  .az-event-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
  .az-event-tag { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; padding: 3px 9px; border-radius: 999px; }
  .az-event-date { font-size: 12px; color: var(--indigo); font-weight: 600; letter-spacing: .3px; }
  .az-event-name { font-size: 16px; font-weight: 600; margin: 6px 0 4px; }
  .az-event-location { font-size: 12px; color: var(--muted); margin-bottom: 6px; }
  .az-event-desc { font-size: 13px; color: var(--muted); line-height: 1.45; }
  .az-event-status { font-size: 12px; font-weight: 700; color: var(--indigo); margin-top: 10px; }

  /* EVENT MODAL */
  .az-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(5,10,40,.7);
    z-index: 300;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .az-modal {
    width: 100%;
    max-width: 540px;
    max-height: 90vh;
    overflow-y: auto;
    background: #fff;
    border-radius: 14px;
    overflow-x: hidden;
    box-shadow: 0 28px 70px rgba(0,0,0,.4);
  }
  .az-modal-image { width: 100%; height: 200px; object-fit: cover; display: block; }
  .az-modal-body { padding: 30px 32px 32px; }
  .az-modal-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 12px; }
  .az-modal-close { background: none; border: none; font-size: 26px; line-height: 1; color: var(--muted); cursor: pointer; }
  .az-modal-title { font-size: 26px; font-weight: 700; color: var(--indigo); margin-bottom: 12px; line-height: 1.25; }
  .az-modal-meta { display: flex; flex-wrap: wrap; gap: 14px; font-size: 13px; color: var(--muted); margin-bottom: 18px; }
  .az-modal-desc { font-size: 15px; line-height: 1.65; color: #3a3a4a; margin-bottom: 22px; }
  .az-modal-error { margin-bottom: 14px; padding: 10px 12px; background: #fef2f2; color: #c0392b; border-radius: 6px; font-size: 13px; }
  .az-modal-registered { padding: 12px 14px; border-radius: 6px; background: #eef8f6; color: #176b60; font-weight: 700; text-align: center; }
  .az-modal-register {
    width: 100%;
    padding: 13px;
    border: none;
    border-radius: 6px;
    background: var(--indigo);
    color: #fff;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: background .2s;
  }
  .az-modal-register:disabled { background: #93a3c8; cursor: not-allowed; }
  .az-modal-register:hover:not(:disabled) { background: var(--indigo-dark); }

  /* CARPET */
  .az-carpet {
    position: absolute;
    bottom: -250px;
    left: -70px;
    width: 600px;
    height: 1000px;
    z-index:0;
    background: repeating-conic-gradient(#c53d3d 0deg 15deg, #2f2373 15deg 30deg);
    transform: rotate(45deg);
    box-shadow: 0 10px 30px rgba(0,0,0,.25);
    display: flex;
 align-items: center;
    justify-content: center;
  }
 

  /* COMMITTEE */
  .az-committee {
    padding: 60px clamp(28px, 9vw, 180px) 70px;
    background: #f7f7fb;
  }
  .az-committee-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 28px;
    max-width: 1000px;
  }
  .az-member-card {
    background: #fff;
    border: 1px solid #ececf2;
    border-radius: 14px;
    padding: 22px 18px 24px;
    text-align: center;
    box-shadow: 0 4px 14px rgba(0,0,0,.05);
    transition: transform .2s, box-shadow .2s;
  }
  .az-member-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 22px rgba(0,0,0,.08);
  }
  .az-member-photo {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    margin: 0 auto 14px;
    background: var(--indigo);
    color: #fff;
    font-weight: 800;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,.15);
  }
  .az-member-name { font-size: 16px; font-weight: 600; }
  .az-member-role { font-size: 13px; color: var(--indigo); font-weight: 600; margin-top: 4px; }

  /* JOIN */
  .az-join {
    background: var(--indigo);
    color: #fff;
    padding: 70px clamp(28px, 9vw, 180px);
  }
  .az-join-inner { max-width: 680px; margin: 0 auto; text-align: center; }
  .az-join-title { font-weight: 700; font-size: clamp(30px, 5vw, 52px); margin-bottom: 18px; }
  .az-join-text { font-size: 16px; line-height: 1.6; opacity: .9; margin-bottom: 34px; }
  .az-join-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
  .az-join-cta {
    background: #c0392b;
    color: #fff;
    padding: 13px 32px;
    border-radius: 6px;
    font-weight: 700;
    text-decoration: none;
    font-size: 14px;
    letter-spacing: .3px;
    transition: background .2s;
  }
  .az-join-cta:hover { background: #a53024; }
  .az-join-secondary {
    background: none;
    border: 1px solid rgba(255,255,255,.4);
    color: #fff;
    padding: 13px 32px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all .2s;
  }
  .az-join-secondary:hover { border-color: #fff; background: rgba(255,255,255,.08); }

  /* CONTACT */
  .az-contact {
    padding: 64px clamp(28px, 9vw, 180px) 72px;
    background: #08004F;
    color: #fff;
  }
  .az-contact-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 48px;
    max-width: 1040px;
    margin: 0 auto;
    align-items: start;
  }
  .az-contact-title { font-size: 28px; font-weight: 800; margin-bottom: 14px; }
  .az-contact-text { font-size: 15px; line-height: 1.55; opacity: .9; max-width: 380px; }
  .az-contact-list { list-style: none; margin: 26px 0; }
  .az-contact-list li { margin-bottom: 14px; font-size: 15px; }
  .az-contact-label {
    display: block;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .8px;
    opacity: .7;
    margin-bottom: 2px;
  }
  .az-contact-socials { display: flex; gap: 14px; flex-wrap: wrap; }
  .az-social-link {
    color: #fff;
    text-decoration: none;
    font-size: 14px;
    padding: 7px 14px;
    border: 1px solid rgba(255,255,255,.4);
    border-radius: 999px;
    transition: background .2s;
  }
  .az-social-link:hover { background: rgba(255,255,255,.15); }

  .az-contact-form {
    background: #fff;
    border-radius: 16px;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .az-field { display: flex; flex-direction: column; gap: 6px; }
  .az-field span { font-size: 13px; font-weight: 600; color: var(--ink); }
  .az-field input,
  .az-field textarea {
    font-family: inherit;
    font-size: 14px;
    padding: 11px 13px;
    border: 1px solid #d7d7e0;
    border-radius: 9px;
    outline: none;
    resize: vertical;
    color: var(--ink);
    width: 100%;
  }
  .az-field input:focus,
  .az-field textarea:focus { border-color: var(--indigo); }
  .az-submit {
    margin-top: 4px;
background: #08004F;    color: #fff;
    border: none;
    border-radius: 9px;
    padding: 12px 18px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background .2s;
  }
  .az-submit:hover { background: var(--indigo-dark); }

  .az-contact-success { text-align: center; padding: 30px 6px; }
  .az-contact-success-title { font-size: 22px; font-weight: 700; color: var(--indigo); margin-bottom: 8px; }
  .az-contact-success-text { font-size: 14px; color: var(--muted); }
  .az-contact-again { margin-top: 18px; background: none; border: none; color: #c0392b; text-decoration: underline; font-size: 13px; cursor: pointer; }

  /* FOOTER */
  .az-footer {
background: #090339ff;    color: #fff;
  }
  .az-footer-inner {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 32px;
    max-width: 1040px;
    margin: 0 auto;
    padding: 52px clamp(28px, 9vw, 180px) 40px;
  }
  .az-footer-logo {
    width: 54px;
    height: 54px;
    border-radius: 50%;
background: #08004F;    border: 1px solid rgba(255,255,255,.3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: rgba(255,255,255,.7);
    margin-bottom: 12px;
  }
  .az-footer-name { font-weight: 700; font-size: 18px; }
  .az-footer-uni { font-size: 13px; opacity: .75; margin-top: 2px; }
  .az-footer-col { display: flex; flex-direction: column; gap: 10px; }
  .az-footer-col h4 {
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: .6px;
    margin-bottom: 4px;
    opacity: .9;
  }
  .az-footer-col a, .az-footer-text {
    color: #fff;
    text-decoration: none;
    font-size: 14px;
    opacity: .8;
    transition: opacity .2s;
  }
  .az-footer-col a:hover { opacity: 1; text-decoration: underline; }
  .az-footer-linkbtn {
    background: none;
    border: none;
    color: #fff;
    text-decoration: none;
    font-size: 14px;
    opacity: .8;
    cursor: pointer;
    padding: 0;
    text-align: left;
  }
  .az-footer-linkbtn:hover { opacity: 1; text-decoration: underline; }
  .az-footer-bottom {
    border-top: 1px solid rgba(255,255,255,.15);
    padding: 18px 40px;
    text-align: center;
    font-size: 13px;
    opacity: .7;
  }

  /* RESPONSIVE — tablet */
  @media (max-width: 1100px) {
    .az-hero-left { padding: 40px clamp(24px, 5vw, 64px) 36px; }
    .az-carpet { width: 460px; height: 780px; bottom: -190px; left: -60px; }
  }

  @media (max-width: 860px) {
    .az-nav { padding: 14px 20px; position: relative; }
    .az-nav-toggle { display: flex; }

    /* Mobile nav becomes a slide-down drawer, triggered by the hamburger */
    .az-nav-links {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      flex-direction: column;
      align-items: stretch;
      gap: 0;
      background: var(--indigo);
      list-style: none;
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      transition: max-height .3s ease, opacity .25s ease;
      box-shadow: 0 12px 20px rgba(0,0,0,.18);
    }
    .az-nav-links.is-open {
      max-height: 420px;
      opacity: 1;
    }
    .az-nav-links li { width: 100%; }
    .az-nav-links a {
      display: block;
      padding: 16px 24px;
      border-top: 1px solid rgba(255,255,255,.12);
      font-size: 16px;
    }
    .az-nav-auth-item {
      padding: 16px 24px;
      border-top: 1px solid rgba(255,255,255,.12);
    }
    .az-nav-auth-item > button { width: 100%; text-align: center; }
    .az-nav-scrim {
      position: fixed;
      inset: 0;
      top: 100%;
      height: 100vh;
      background: rgba(0,0,0,.25);
      border: none;
      z-index: 40;
    }

    .az-hero { flex-direction: column; }
    .az-hero-left { padding: 32px 24px; }

    /* Collapse the rotated photo collage into a simple responsive grid */
    .az-hero-right {
      position: static;
      min-height: auto;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 24px;
    }
    .az-photo {
      position: static !important;
      top: auto !important;
      left: auto !important;
      transform: none !important;
      width: calc(50% - 6px) !important;
      max-width: none;
      height: 150px !important;
    }

    .az-events { padding: 32px 24px 260px; }
    .az-event-grid { margin-left: 0; }
    .az-carpet { width: 320px; height: 560px; bottom: -140px; left: -50px; }

    .az-committee { padding: 44px 24px; }
    .az-join { padding: 44px 24px; }
    .az-contact { padding: 44px 24px; }
    .az-contact-inner { grid-template-columns: 1fr; gap: 32px; }
    .az-footer-inner { grid-template-columns: 1fr 1fr; padding: 40px 24px 32px; }
  }

  /* RESPONSIVE — phones */
  @media (max-width: 560px) {
    .az-nav-links { flex-wrap: wrap; }
    .az-footer-inner { grid-template-columns: 1fr; }

    .az-photo { width: 100% !important; height: 200px !important; }
    .az-events { padding: 28px 16px 200px; }
    .az-carpet { width: 240px; height: 420px; bottom: -100px; left: -40px; }
    .az-committee-grid { grid-template-columns: 1fr 1fr; gap: 16px; }
    .az-contact-form { padding: 20px; }
  }

  
`;