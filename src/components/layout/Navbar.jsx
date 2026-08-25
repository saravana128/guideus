import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Button from "../common/Button";
import Avatar from "../common/Avatar";

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-surface-950/70 backdrop-blur-xl">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-lg shadow-glow group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
            🧭
          </span>
          <span className="font-display text-xl font-bold gradient-text">
            GuideUs
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white/10 text-white"
                      : "text-surface-300 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-4 border-l border-white/10">
                <Avatar
                  name={user?.name || user?.email || "?"}
                  size="sm"
                  className="shadow-glow"
                />
                <span className="hidden md:block text-sm text-surface-300 max-w-[10rem] truncate">
                  {user?.name || user?.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-surface-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                Login
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started ✨</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
