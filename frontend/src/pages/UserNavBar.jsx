import { useState, useEffect, useRef } from 'react';
import { Home, FlaskConical, CheckCircle, BarChart3, ChevronRight, Menu, X } from 'lucide-react';

export default function UserNavBar() {
  const [activeItem, setActiveItem] = useState('/');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isOpen, setIsOpen] = useState(false); // Sidebar open state
  const [isMobile, setIsMobile] = useState(false); // Mobile/tablet detection

  const sidebarRef = useRef();

  // Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024); // mobile/tablet breakpoint
      if (window.innerWidth > 1024) {
        setIsOpen(false); // reset mobile sidebar state on desktop
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detect mouse near left edge (desktop only)
  useEffect(() => {
    if (!isMobile) {
      const handleMouseMove = (e) => {
        if (e.clientX < 40) {
          setIsOpen(true);
        }
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [isMobile]);

  // Close sidebar when clicking outside (mobile only)
  useEffect(() => {
    if (isMobile && isOpen) {
      const handleClickOutside = (e) => {
        if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobile, isOpen]);

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Practicals', path: '/practicals', icon: FlaskConical },
    { label: 'Attendance', path: '/attendance', icon: CheckCircle },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
  ];

  const expandedWidth = 280;
  const collapsedWidth = 60;

  const styles = {
    sidebar: {
      width: isOpen ? expandedWidth + 'px' : collapsedWidth + 'px',
      transition: 'width 0.35s ease',
      height: '100vh',
      background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      padding: '24px 16px',
      position: isMobile ? 'fixed' : 'fixed',
      left: isOpen || !isMobile ? 0 : '-100%',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: isMobile ? '4px 0 20px rgba(0,0,0,0.5)' : '4px 0 20px rgba(0,0,0,0.3)',
      zIndex: 1000,
      overflow: 'hidden',
    },
    topBar: {
      display: isMobile ? 'flex' : 'none',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      color: 'white',
      position: 'fixed',
      top: 0,
      right: -15,
      zIndex: 1001,
    },
    nav: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    navButton: (isActive) => ({
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 16px',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      background: isActive
        ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
        : 'transparent',
      transform: isActive ? 'translateX(4px)' : 'translateX(0)',
      boxShadow: isActive ? '0 4px 12px rgba(168, 85, 247, 0.3)' : 'none',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    }),
    label: (isActive) => ({
      fontWeight: isActive ? '600' : '500',
      fontSize: '15px',
      flex: 1,
      textAlign: 'left',
      color: isActive ? 'white' : 'rgba(255,255,255,0.85)',
      opacity: isOpen ? 1 : 0,
      transition: 'opacity .3s ease',
    }),
    iconWrapper: (isActive) => ({
      display: 'flex',
      color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
      transition: 'color 0.3s ease',
      zIndex: 10,
    }),
    footer: {
      paddingTop: '24px',
      borderTop: '1px solid rgba(255,255,255,0.1)',
      opacity: isOpen ? 1 : 0,
      transition: 'opacity .3s ease',
    },
    footerText: {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.5)',
      textAlign: 'center',
      margin: 0,
    },
  };

  return (
    <>
      {/* Top bar for mobile */}
      {isMobile && (
        <div style={styles.topBar}>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={styles.sidebar}
        onMouseLeave={() => !isMobile && setIsOpen(false)}
      >
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.path;

            return (
              <button
                key={item.path}
                onClick={() => setActiveItem(item.path)}
                style={styles.navButton(isActive)}
              >
                <div style={styles.iconWrapper(isActive)}>
                  <Icon size={20} />
                </div>
                <span style={styles.label(isActive)}>{item.label}</span>
                {isActive && <ChevronRight size={18} style={{ color: 'white', opacity: isOpen ? 1 : 0 }} />}
              </button>
            );
          })}
        </nav>

        <div style={styles.footer}>
          <p style={styles.footerText}>© 2024 Student Portal</p>
        </div>
      </div>
    </>
  );
}
