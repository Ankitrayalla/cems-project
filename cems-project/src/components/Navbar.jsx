import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [role, setRole] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchRole = async () => {
      if (!user?.id) {
        if (isMounted) {
          setRole('');
        }
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error('Failed to fetch navbar role:', error);
        setRole('');
        return;
      }

      setRole(String(data?.role ?? '').toLowerCase().trim());
    };

    fetchRole();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
      return;
    }

    setIsUserMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="app-nav-wrap">
      <nav className="app-nav">
        <div className="app-brand">
          <Link to="/" className="brand-link">
            CEMS
          </Link>
        </div>

        <div className="desktop-nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          {user && role === 'hod' ? (
            <Link to="/hod-dashboard" className="nav-link">
              HOD
            </Link>
          ) : null}
          {user && role === 'principal' ? (
            <Link to="/principal-dashboard" className="nav-link">
              Principal
            </Link>
          ) : null}
          {user && role === 'admin' ? (
            <Link to="/admin" className="nav-link">
              Admin Allocation
            </Link>
          ) : null}
          {user && role === 'admin' ? (
            <Link to="/admin-resource-verification" className="nav-link">
              Admin Verify
            </Link>
          ) : null}
          {user && role === 'club' ? (
            <Link to="/club-resource-request" className="nav-link">
              Resource Request
            </Link>
          ) : null}
          <Link to="/login" className="nav-link">
            Login
          </Link>
          <Link to="/signup" className="nav-link">
            Signup
          </Link>
        </div>

        <div className="desktop-user-menu">
          <div className="user-menu-wrap">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              className="btn btn-secondary"
            >
              User Menu
            </button>

            {isUserMenuOpen ? (
              <div className="user-dropdown">
                {user ? (
                  <>
                    <p className="user-email">{user.email}</p>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="dropdown-item danger"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item">
                      Login
                    </Link>
                    <Link to="/signup" className="dropdown-item">
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
          className="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
        >
          Menu
        </button>
      </nav>

      {isMobileOpen ? (
        <div className="mobile-nav-panel">
          <div className="mobile-nav-links">
            <Link to="/" className="mobile-link">
              Home
            </Link>
            {user && role === 'hod' ? (
              <Link to="/hod-dashboard" className="mobile-link">
                HOD
              </Link>
            ) : null}
            {user && role === 'principal' ? (
              <Link to="/principal-dashboard" className="mobile-link">
                Principal
              </Link>
            ) : null}
            {user && role === 'admin' ? (
              <Link to="/admin" className="mobile-link">
                Admin Allocation
              </Link>
            ) : null}
            {user && role === 'admin' ? (
              <Link to="/admin-resource-verification" className="mobile-link">
                Admin Verify
              </Link>
            ) : null}
            {user && role === 'club' ? (
              <Link to="/club-resource-request" className="mobile-link">
                Resource Request
              </Link>
            ) : null}
            <Link to="/login" className="mobile-link">
              Login
            </Link>
            <Link to="/signup" className="mobile-link">
              Signup
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;