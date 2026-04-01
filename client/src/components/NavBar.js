import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="sw-navbar">
      <div className="sw-navbar__left">
        <NavLink to="/" className="sw-navbar__brand-container" style={{ textDecoration: 'none' }}>
          <div className="sw-navbar__brand-text">
            <div className="sw-navbar__brand">SWIFT<em>IFY</em></div>
            <div className="sw-navbar__brand-subtitle">by Thomas Ou</div>
          </div>
        </NavLink>
      </div>

      <div className="sw-navbar__right">
        <NavLink to="/" end className={({ isActive }) => `sw-navbar__link${isActive ? ' active' : ''}`}>
          <span className="sw-nav-text">Home</span>
          <span className="sw-nav-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
          </span>
        </NavLink>
        <NavLink to="/albums" className={({ isActive }) => `sw-navbar__link${isActive ? ' active' : ''}`}>
          <span className="sw-nav-text">Albums</span>
          <span className="sw-nav-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
          </span>
        </NavLink>
        <NavLink to="/songs" className={({ isActive }) => `sw-navbar__link${isActive ? ' active' : ''}`}>
          <span className="sw-nav-text">Songs</span>
          <span className="sw-nav-icon">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </span>
        </NavLink>
      </div>
    </nav>
  );
}
