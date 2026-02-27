import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import gsap from 'gsap'
import { useAuth } from '../context/useAuth'
import RotatingBadge from './RotatingBadge'
import MagneticButton from './MagneticButton'
import './Navbar.css'

const baseNavLinks = [
  { label: 'Home', path: '/' },
  { label: 'Menu', path: '/menu' },
  { label: 'Our Story', path: '/story' },
  { label: 'Contact', path: '/contact' },
]

const linkImages = {
  '/': 'https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=300&q=60',
  '/menu': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=300&q=60',
  '/story': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=60',
  '/contact': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=60',
  '/admin/menu': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&q=60',
  '/profile': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=60',
}

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [hoveredLink, setHoveredLink] = useState(null)
  const location = useLocation()
  const navRef = useRef(null)
  const menuRef = useRef(null)
  const tl = useRef(null)
  const { user, isAdmin } = useAuth()

  // Build dynamic nav links
  const navLinks = [...baseNavLinks]
  if (isAdmin) {
    navLinks.push({ label: 'Admin', path: '/admin/menu' })
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  useEffect(() => {
    if (menuRef.current) {
      if (menuOpen) {
        document.body.style.overflow = 'hidden'
        gsap.set(menuRef.current, { display: 'flex' })
        tl.current = gsap.timeline()
        tl.current
          .to(menuRef.current, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 0.8,
            ease: 'power4.inOut',
          })
          .from(
            menuRef.current.querySelectorAll('.mobile-nav-link'),
            {
              x: -100,
              opacity: 0,
              stagger: 0.08,
              duration: 0.6,
              ease: 'power3.out',
            },
            '-=0.3'
          )
          .from(
            menuRef.current.querySelector('.mobile-nav-footer'),
            {
              y: 30,
              opacity: 0,
              duration: 0.5,
              ease: 'power3.out',
            },
            '-=0.3'
          )
      } else {
        document.body.style.overflow = ''
        gsap.to(menuRef.current, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.6,
          ease: 'power4.inOut',
          onComplete: () => {
            gsap.set(menuRef.current, { display: 'none' })
          },
        })
      }
    }
  }, [menuOpen])

  return (
    <>
      <nav
        ref={navRef}
        className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${menuOpen ? 'navbar-open' : ''}`}
      >
        <div className="navbar-inner container">
          <Link to="/" className="navbar-logo">
            <div className="navbar-badge">
              <RotatingBadge size={40} />
            </div>
            <span className="logo-text">Khasta</span>
            <span className="logo-accent">Corner</span>
          </Link>

          <div className="navbar-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
                <span className="link-underline" />
              </Link>
            ))}
          </div>

          <div className="navbar-right">
            {user ? (
              <MagneticButton strength={0.25}>
                <Link to="/profile" className="navbar-cta navbar-cta-profile">
                  <span className="nav-avatar">
                    {user.profileImage ? (
                      <img src={user.profileImage} alt="" />
                    ) : (
                      user.fullName?.charAt(0).toUpperCase()
                    )}
                  </span>
                  Profile
                </Link>
              </MagneticButton>
            ) : (
              <MagneticButton strength={0.25}>
                <Link to="/login" className="navbar-cta">
                  Login
                </Link>
              </MagneticButton>
            )}
            <button
              className={`menu-toggle ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <span className="toggle-line" />
              <span className="toggle-line" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile/Full-screen menu */}
      <div ref={menuRef} className="mobile-menu">
        <div className="mobile-menu-inner">
          <div className="mobile-nav-links">
            {navLinks.map((link, i) => (
              <div key={link.path} className="mobile-nav-link-wrapper">
                <span className="mobile-link-ghost-num">0{i + 1}</span>
                <Link
                  to={link.path}
                  className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                  onMouseEnter={() => setHoveredLink(link.path)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <span className="mobile-link-num">0{i + 1}</span>
                  {link.label}
                </Link>
              </div>
            ))}
          </div>

          {/* Preview image */}
          <div className={`mobile-menu-preview ${hoveredLink ? 'visible' : ''}`}>
            {hoveredLink && (
              <img src={linkImages[hoveredLink]} alt="" />
            )}
          </div>

          <div className="mobile-nav-footer">
            <div className="mobile-footer-col">
              <span className="text-label">Account</span>
              {user ? (
                <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
            <div className="mobile-footer-col">
              <span className="text-label">Contact</span>
              <a href="tel:9103777757">910 377 7757</a>
            </div>
            <div className="mobile-footer-col">
              <span className="text-label">Social</span>
              <a href="https://instagram.com/khasta_corner_" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
