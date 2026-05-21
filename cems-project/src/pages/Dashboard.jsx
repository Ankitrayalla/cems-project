import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getProposals, deleteProposal } from "../services/proposals";
import EventTimeline from "../components/EventTimeline";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProposals = useCallback(async () => {
    if (!user) return;

    try {
      const data = await getProposals(user.id);
      setProposals(data);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const timer = setTimeout(() => {
      fetchProposals();
    }, 0);
    return () => clearTimeout(timer);
  }, [user, fetchProposals]);

  const handleDelete = async (id) => {
    try {
      await deleteProposal(id);
      await fetchProposals();
      alert("Deleted successfully");
    } catch (err) {
      console.error("Error deleting proposal:", err);
      alert("Error deleting proposal");
    }
  };

  const normalizeStatus = (status) => String(status ?? "pending_hod").toLowerCase();

  const getStatusMessage = (event) => {
    const status = normalizeStatus(event?.status);

    if (status === "rejected_hod") {
      const comment = String(event?.hod_comment ?? "").trim();
      return `Rejected by HOD: ${comment || "No HOD comment provided"}`;
    }

    if (status === "rejected_principal") {
      const comment = String(event?.principal_comment ?? "").trim();
      return `Rejected by Principal: ${comment || "No Principal comment provided"}`;
    }

    if (status === "approved_principal") {
      return "Waiting for resource allocation by admin";
    }

    if (status === "resources_approved") {
      return "Resources approved. You can start event preparation.";
    }

    if (status === "resources_rejected") {
      const comment = String(event?.admin_comment ?? "").trim();
      return `Resources not available: ${comment || "No admin comment provided"}`;
    }

    return String(event?.status ?? "pending_hod").replace(/_/g, " ");
  };

  const totalProposals = proposals.length;
  const approvedCount = proposals.filter((p) =>
    String(p.status ?? "").toLowerCase().includes("approved")
  ).length;
  const pendingCount = totalProposals - approvedCount;

  return (
    <section className="dashboard-page">
      <PageHeader
        eyebrow="Workspace"
        title="Club Dashboard"
        subtitle="Track proposals, approval progress, and resource status."
        action={
          <button type="button" onClick={() => navigate("/create")} className="btn btn-primary">
            Create Event
          </button>
        }
      />

      <div className="dashboard-body">
        <div className="stats-grid">
          <StatCard label="Total Proposals" value={isLoading ? "—" : totalProposals} variant="accent" index={0} animate={!isLoading} />
          <StatCard label="Approved" value={isLoading ? "—" : approvedCount} variant="success" index={1} animate={!isLoading} />
          <StatCard label="Pending" value={isLoading ? "—" : pendingCount} variant="warning" index={2} animate={!isLoading} />
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">My Proposals</h2>

          {isLoading ? (
            <div className="proposal-grid" aria-busy="true">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          ) : proposals.length === 0 ? (
            <EmptyState
              icon="✦"
              title="No proposals yet"
              description="Create your first event proposal and manage approvals from this dashboard."
            />
          ) : (
            <div className="proposal-grid">
              {proposals.map((p) => (
                <article key={p.id} className="proposal-card">
                  <h3>{p.title}</h3>
                  <p className="proposal-description">{p.description}</p>

                  <div className="proposal-meta">
                    <span className="meta-pill">📅 {p.date}</span>
                    <span className="meta-pill">👥 {p.participants} participants</span>
                  </div>

                  <p className="proposal-status">
                    <span>Status</span>
                    <StatusBadge status={p.status} label={getStatusMessage(p)} />
                  </p>

                  <EventTimeline event={p} />

                  <div className="proposal-actions">
                    <button
                      type="button"
                      onClick={() => navigate(`/edit/${p.id}`)}
                      className="btn btn-info btn-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
