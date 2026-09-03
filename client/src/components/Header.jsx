import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [location])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const scrollToSection = (e, sectionId) => {
    if (location.pathname !== '/') {
      return // Let Link handle navigation
    }
    e.preventDefault()
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = 80
      const targetPosition = element.offsetTop - headerHeight
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <nav className="nav">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="RCCG Graceland Area HQ Logo" className="logo-image" />
          <div className="logo-text">
            <h1>RCCG GRACELAND AREA HQ</h1>
            <p>Favored Family | Lagos, Nigeria</p>
          </div>
        </Link>
        
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
        
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/#livestream" onClick={(e) => scrollToSection(e, 'livestream')}>Live</Link></li>
          <li><Link to="/#about" onClick={(e) => scrollToSection(e, 'about')}>About</Link></li>
          <li><Link to="/#services" onClick={(e) => scrollToSection(e, 'services')}>Services</Link></li>
          <li><Link to="/#sermons" onClick={(e) => scrollToSection(e, 'sermons')}>Sermons</Link></li>
          <li><Link to="/blog">Blog</Link></li>
          <li><Link to="/#ministries" onClick={(e) => scrollToSection(e, 'ministries')}>Ministries</Link></li>
          <li><Link to="/#contact" onClick={(e) => scrollToSection(e, 'contact')}>Contact</Link></li>
          <li><Link to="/#give" onClick={(e) => scrollToSection(e, 'give')}>Give</Link></li>
        </ul>
      </nav>
    </header>
  )
}

export default Header
