import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

function Navbar() {
    const { user } = useContext(AuthContext);
const navigate = useNavigate();

const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate("/login");
};
	const [isMobileOpen, setIsMobileOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-900 text-white">
			<nav className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
				<div className="flex items-center">
					<Link to="/" className="text-lg font-semibold tracking-wide">
						CEMS

					</Link>
				</div>

				<div className="mx-auto hidden items-center gap-8 md:flex">
					<Link to="/" className="text-sm font-medium text-slate-100 transition hover:text-blue-300">
						Home
					</Link>
					<Link
						to="/login"
						className="text-sm font-medium text-slate-100 transition hover:text-blue-300"
					>
						Login
					</Link>
					<Link
						to="/signup"
						className="text-sm font-medium text-slate-100 transition hover:text-blue-300"
					>
						Signup
					</Link>
				</div>

				<div className="ml-auto hidden items-center md:flex">
					<div className="relative">
						<button
							type="button"
							onClick={() => setIsUserMenuOpen((prev) => !prev)}
							className="rounded-md border border-slate-600 px-3 py-1.5 text-sm transition hover:bg-slate-800"
						>
							User Menu
						</button>

						{isUserMenuOpen && (
  <div className="absolute right-0 mt-2 w-40 rounded-md border border-slate-700 bg-slate-800 py-1 shadow-lg">
    {user ? (
      <>
        <p className="px-3 py-2 text-xs text-slate-400">
          {user.email}
        </p>
        <button
          onClick={handleLogout}
          className="w-full px-3 py-2 text-left text-sm hover:bg-slate-700"
        >
          Logout
        </button>
      </>
    ) : (
      <>
        <Link to="/login" className="block px-3 py-2 text-sm hover:bg-slate-700">
          Login
        </Link>
        <Link to="/signup" className="block px-3 py-2 text-sm hover:bg-slate-700">
          Signup
        </Link>
      </>
    )}
  </div>
)}
					</div>
				</div>

				<button
					type="button"
					onClick={() => setIsMobileOpen((prev) => !prev)}
					className="ml-auto rounded-md border border-slate-600 px-3 py-1 text-sm md:hidden"
					aria-label="Toggle navigation menu"
				>
					Menu
				</button>
			</nav>

			{isMobileOpen ? (
				<div className="border-t border-slate-700 px-4 py-3 md:hidden">
					<div className="flex flex-col gap-2">
						<Link to="/" className="rounded px-2 py-2 text-sm hover:bg-slate-800">
							Home
						</Link>
						<Link to="/login" className="rounded px-2 py-2 text-sm hover:bg-slate-800">
							Login
						</Link>
						<Link to="/signup" className="rounded px-2 py-2 text-sm hover:bg-slate-800">
							Signup
						</Link>
					</div>
				</div>
			) : null}
		</header>
	);
}
const { user } = useContext(AuthContext);
const navigate = useNavigate();

const handleLogout = async () => {
  await supabase.auth.signOut();
  navigate("/login");
};
export default Navbar;
