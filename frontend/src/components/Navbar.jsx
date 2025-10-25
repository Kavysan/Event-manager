import { Link, useNavigate } from "react-router-dom";
import '../css/Navbar.css';
import { useEventContext } from "../contexts/EventContext";
import { useAuth } from "../contexts/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";

function Navbar() {
  const { clearSearch, cart } = useEventContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const totalTickets = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" onClick={clearSearch}>Event-Manager</Link>
      </div>

      <div className="navbar-links">
        <Link to="/" className="nav-link" onClick={clearSearch}>Events</Link>

        {user ? (
          <>
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/login" onClick={handleLogout} className="nav-link">
              Logout
            </Link>
          </>
        ) : (
          <Link to="/login" className="nav-link">Login</Link>
        )}

        <Link to="/checkout" className="nav-link relative">
          <FontAwesomeIcon icon={faShoppingCart} size="lg" />
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
