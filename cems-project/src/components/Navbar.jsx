import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchRole = async () => {
      if (!user?.id) {
        if (isMounted) setRole("");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!isMounted) return;

      if (error) {
        console.error("Failed to fetch navbar role:", error);
        setRole("");
        return;
      }

      setRole(String(data?.role ?? "").toLowerCase().trim());
    };

    fetchRole();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  useEffect(() => {
    document.body.classList.toggle("nav-open", isMobileOpen);
    return () => document.body.classList.remove("nav-open");
  }, [isMobileOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const closeMobile = () => setIsMobileOpen(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
      return;
    }

    setIsUserMenuOpen(false);
    closeMobile();
    navigate("/login");
  };

  const userInitial = user?.email?.charAt(0)?.toUpperCase() ?? "U";

  const navLinkClass = ({ isActive }) => `nav-link${isActive ? " active" : ""}`;
  const drawerLinkClass = ({ isActive }) =>
    `mobile-drawer-link${isActive ? " active" : ""}`;

  const roleLinks = (
    <>
      {user && role === "hod" ? (
        <NavLink to="/hod-dashboard" className={navLinkClass}>
          HOD
        </NavLink>
      ) : null}
      {user && role === "principal" ? (
        <NavLink to="/principal-dashboard" className={navLinkClass}>
          Principal
        </NavLink>
      ) : null}
      {user && role === "admin" ? (
        <>
          <NavLink to="/admin" className={navLinkClass}>
            Allocation
          </NavLink>
          <NavLink to="/admin-resource-verification" className={navLinkClass}>
            Verify
          </NavLink>
        </>
      ) : null}
      {user && role === "club" ? (
        <NavLink to="/club-resource-request" className={navLinkClass}>
          Resources
        </NavLink>
      ) : null}
      {user ? (
        <NavLink to="/dashboard" className={navLinkClass}>
          Dashboard
        </NavLink>
      ) : null}
    </>
  );

  const drawerRoleLinks = (
    <>
      {user && role === "hod" ? (
        <NavLink to="/hod-dashboard" className={drawerLinkClass} onClick={closeMobile}>
          HOD Dashboard
        </NavLink>
      ) : null}
      {user && role === "principal" ? (
        <NavLink to="/principal-dashboard" className={drawerLinkClass} onClick={closeMobile}>
          Principal Dashboard
        </NavLink>
      ) : null}
      {user && role === "admin" ? (
        <>
          <NavLink to="/admin" className={drawerLinkClass} onClick={closeMobile}>
            Admin Allocation
          </NavLink>
          <NavLink
            to="/admin-resource-verification"
            className={drawerLinkClass}
            onClick={closeMobile}
          >
            Resource Verification
          </NavLink>
        </>
      ) : null}
      {user && role === "club" ? (
        <NavLink to="/club-resource-request" className={drawerLinkClass} onClick={closeMobile}>
          Resource Request
        </NavLink>
      ) : null}
      {user ? (
        <NavLink to="/dashboard" className={drawerLinkClass} onClick={closeMobile}>
          Club Dashboard
        </NavLink>
      ) : null}
    </>
  );

  return (
    <>
      <header className="app-nav-wrap">
        <nav className="app-nav" aria-label="Main navigation">
          <Link to="/" className="brand-link" onClick={closeMobile}>
            CEMS
          </Link>

          <div className="desktop-nav-links">
            <NavLink to="/" end className={navLinkClass}>
              Home
            </NavLink>
            {roleLinks}
            {!user ? (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
                <NavLink to="/signup" className={navLinkClass}>
                  Signup
                </NavLink>
              </>
            ) : null}
          </div>

          <div className="desktop-user-menu">
            <div className="user-menu-wrap">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="btn btn-secondary user-menu-btn"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <span className="user-avatar" aria-hidden="true">
                  {userInitial}
                </span>
                {user ? "Account" : "Menu"}
              </button>

              {isUserMenuOpen ? (
                <div className="user-dropdown" role="menu">
                  {user ? (
                    <>
                      <p className="user-email">{user.email}</p>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="dropdown-item danger"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        className="dropdown-item"
                        onClick={() => setIsUserMenuOpen(false)}
                        role="menuitem"
                      >
                        Signup
                      </Link>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className={`mobile-menu-toggle${isMobileOpen ? " is-open" : ""}`}
            aria-label={isMobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileOpen}
            aria-controls="mobile-nav-drawer"
          >
            <span className="hamburger-line" aria-hidden="true" />
            <span className="hamburger-line" aria-hidden="true" />
            <span className="hamburger-line" aria-hidden="true" />
            <span className="sr-only">Menu</span>
          </button>
        </nav>
      </header>

      <div
        className={`nav-overlay${isMobileOpen ? " is-visible" : ""}`}
        role="presentation"
        onClick={closeMobile}
        aria-hidden={!isMobileOpen}
      />
      <aside
        id="mobile-nav-drawer"
        className={`mobile-nav-drawer${isMobileOpen ? " is-open" : ""}`}
        aria-label="Mobile navigation"
        aria-hidden={!isMobileOpen}
      >
            <div className="mobile-drawer-head">
              <span className="mobile-drawer-brand">CEMS</span>
              <button
                type="button"
                className="mobile-drawer-close"
                onClick={closeMobile}
                aria-label="Close menu"
              >
                ×
              </button>
            </div>

            <nav className="mobile-drawer-links">
              <NavLink to="/" end className={drawerLinkClass} onClick={closeMobile}>
                Home
              </NavLink>
              {drawerRoleLinks}
              {!user ? (
                <>
                  <NavLink to="/login" className={drawerLinkClass} onClick={closeMobile}>
                    Login
                  </NavLink>
                  <NavLink to="/signup" className={drawerLinkClass} onClick={closeMobile}>
                    Signup
                  </NavLink>
                </>
              ) : null}
            </nav>

            {user ? (
              <div className="mobile-drawer-footer">
                <p className="mobile-drawer-user">{user.email}</p>
                <button type="button" onClick={handleLogout} className="btn btn-danger btn-block">
                  Logout
                </button>
              </div>
            ) : null}
      </aside>
    </>
  );
}

export default Navbar;
