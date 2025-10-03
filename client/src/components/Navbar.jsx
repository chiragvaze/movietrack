import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ padding: "1rem", background: "#333", color: "#fff" }}>
      <Link to="/" style={{ margin: "0 1rem", color: "#fff" }}>Home</Link>
      <Link to="/dashboard" style={{ margin: "0 1rem", color: "#fff" }}>Dashboard</Link>
      <Link to="/login" style={{ margin: "0 1rem", color: "#fff" }}>Login</Link>
      <Link to="/signup" style={{ margin: "0 1rem", color: "#fff" }}>Signup</Link>
    </nav>
  );
}
