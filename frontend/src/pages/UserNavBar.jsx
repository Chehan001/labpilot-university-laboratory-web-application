import { useState, useEffect } from 'react';
import { Home, FlaskConical, CheckCircle, BarChart3, ChevronRight } from 'lucide-react';

export default function UserNavBar() {
  const [activeItem, setActiveItem] = useState('/');
  const [hoveredItem, setHoveredItem] = useState(null);

  // NEW: sidebar visibility state
  const [isOpen, setIsOpen] = useState(false);

  // Detect mouse near left edge to open sidebar
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX < 40) {
        setIsOpen(true);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const navItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Practicals", path: "/practicals", icon: FlaskConical },
    { label: "Attendance", path: "/attendance", icon: CheckCircle },
    { label: "Reports", path: "/reports", icon: BarChart3 },
  ];

  // SIDEBAR WIDTH
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
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '4px 0 20px rgba(0,0,0,0.3)',
      zIndex: 1000,
      overflow: 'hidden',
    },

    header: {
      marginBottom: '32px',
      opacity: isOpen ? 1 : 0,
      transition: 'opacity .3s ease',
    },

    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
      paddingBottom: '24px',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
    },

    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: '600',
      boxShadow: '0 4px 6px rgba(168, 85, 247, 0.3)',
    },

    title: {
      fontSize: '20px',
      fontWeight: '700',
      margin: 0,
    },

    subtitle: {
      fontSize: '12px',
      color: 'rgba(255,255,255,0.6)',
      marginTop: '4px',
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
    <div
      style={styles.sidebar}
      onMouseLeave={() => setIsOpen(false)}  // auto-close
    >
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.avatar}>U</div>
          <div>
            <h2 style={styles.title}>User Panel</h2>
            <p style={styles.subtitle}>Student Dashboard</p>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.path;
          const isHovered = hoveredItem === item.path;

          return (
            <button
              key={item.path}
              onClick={() => setActiveItem(item.path)}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              style={styles.navButton(isActive)}
            >
              <div style={styles.iconWrapper(isActive)}>
                <Icon size={20} />
              </div>

              <span style={styles.label(isActive)}>
                {item.label}
              </span>

              {isActive && (
                <ChevronRight size={18} style={{ color: 'white', opacity: isOpen ? 1 : 0 }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div style={styles.footer}>
        <p style={styles.footerText}>© 2024 Student Portal</p>
      </div>
    </div>
  );
}
