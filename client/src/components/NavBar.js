import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav className="sw-navbar">
      <div className="sw-navbar__left">
        <NavLink to="/" className="sw-navbar__brand">
          ✦ Swiftify
        </NavLink>
      </div>

      <div className="sw-navbar__right">
        <NavLink to="/" end className={({ isActive }) => `sw-navbar__link${isActive ? ' active' : ''}`}>
          Home
        </NavLink>
        <NavLink to="/albums" className={({ isActive }) => `sw-navbar__link${isActive ? ' active' : ''}`}>
          Albums
        </NavLink>
        <NavLink to="/songs" className={({ isActive }) => `sw-navbar__link${isActive ? ' active' : ''}`}>
          Songs
        </NavLink>
      </div>
    </nav>
  );
}
