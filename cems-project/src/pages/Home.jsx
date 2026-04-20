import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="home-hero">
      <p className="eyebrow">Campus Event Management System</p>
      <h1>Plan Better Campus Events</h1>
      <p className="hero-subtitle">
        Create proposals, manage edits, and keep every event update in one clean dashboard.
      </p>
      <div className="hero-actions">
        <Link to="/dashboard" className="btn btn-primary">
          Open Dashboard
        </Link>
        <Link to="/create" className="btn btn-secondary">
          Create Proposal
        </Link>
      </div>
    </section>
  );
}

export default Home;