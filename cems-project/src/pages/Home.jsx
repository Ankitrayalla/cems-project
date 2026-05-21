import { Link } from "react-router-dom";

function Home() {
  return (
    <section className="home-hero page-fade-in">
      <p className="eyebrow">College Event Governance</p>
      <h1>Plan, Approve &amp; Allocate Campus Events</h1>
      <p className="hero-subtitle">
        A unified workflow for clubs, HOD, Principal, and Admin — from proposal submission
        to resource verification, in one premium control center.
      </p>
      <div className="hero-actions">
        <Link to="/dashboard" className="btn btn-primary">
          Open Dashboard
        </Link>
        <Link to="/create" className="btn btn-secondary">
          Create Proposal
        </Link>
      </div>

      <div className="hero-features">
        <div className="feature-card">
          <div className="feature-icon" aria-hidden="true">
            ◈
          </div>
          <h3>Proposal Workflow</h3>
          <p>Submit events, track multi-stage approvals, and manage edits from one place.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon" aria-hidden="true">
            ◉
          </div>
          <h3>Role Dashboards</h3>
          <p>Dedicated panels for HOD, Principal, Admin, and Club resource coordination.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon" aria-hidden="true">
            ◆
          </div>
          <h3>Resource Governance</h3>
          <p>Request halls and equipment, verify availability, and allocate with audit trails.</p>
        </div>
      </div>
    </section>
  );
}

export default Home;
