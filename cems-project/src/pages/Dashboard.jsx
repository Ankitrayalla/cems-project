import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { getProposals, deleteProposal } from "../services/proposals";
import EventTimeline from "../components/EventTimeline";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [proposals, setProposals] = useState([]);

  const fetchProposals = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      const data = await getProposals(user.id);
      setProposals(data);
    } catch (err) {
      console.error("Error fetching proposals:", err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      return;
    }

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

  const getStatusTone = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized.includes("approved")) return "approved";
    if (normalized.includes("rejected")) return "rejected";
    return "pending";
  };

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

    return String(event?.status ?? "pending_hod");
  };

  const totalProposals = proposals.length;
  const approvedCount = proposals.filter((p) => getStatusTone(p.status) === "approved").length;
  const pendingCount = proposals.filter((p) => getStatusTone(p.status) === "pending").length;

  const getStatusBadgeClass = (status) => {
    const tone = getStatusTone(status);

    if (tone === "approved") {
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/35 font-semibold";
    }

    if (tone === "rejected") {
      return "bg-rose-500/15 text-rose-300 border border-rose-400/35 font-semibold";
    }

    return "bg-amber-500/15 text-amber-300 border border-amber-400/35 font-semibold";
  };

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h1>Dashboard</h1>
        </div>

        <button
          type="button"
          onClick={() => navigate("/create")}
          className="btn btn-primary"
        >
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
        <div className="proposal-card border border-slate-400/20 bg-slate-900/30 backdrop-blur-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-300 m-0">Total Proposals</p>
          <h3 className="text-3xl mt-2 mb-0 leading-none">{totalProposals}</h3>
        </div>
        <div className="proposal-card border border-emerald-400/20 bg-emerald-900/10 backdrop-blur-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-200/80 m-0">Approved</p>
          <h3 className="text-3xl mt-2 mb-0 leading-none text-emerald-300">{approvedCount}</h3>
        </div>
        <div className="proposal-card border border-amber-400/20 bg-amber-900/10 backdrop-blur-sm">
          <p className="text-[11px] uppercase tracking-[0.16em] text-amber-200/80 m-0">Pending</p>
          <h3 className="text-3xl mt-2 mb-0 leading-none text-amber-300">{pendingCount}</h3>
        </div>
      </div>

      <h2 className="section-title">My Proposals</h2>

      {proposals.length === 0 ? (
        <div className="empty-state text-center">
          <h3>No proposals yet 🚀</h3>
          <p>Create your first event proposal and manage it from this dashboard.</p>
        </div>
      ) : (
        <div className="proposal-grid">
          {proposals.map((p) => (
            <article
              key={p.id}
              className="proposal-card transition-all duration-250 ease-out hover:scale-[1.02] hover:shadow-2xl hover:border-slate-300/30"
            >
              <h3>{p.title}</h3>
              <p className="proposal-description">{p.description}</p>

              <div className="proposal-meta">
                <span>{p.date}</span>
                <span>{p.participants} participants</span>
              </div>

              <p className="proposal-status">
                Status:
                <span className={`status-chip ${getStatusBadgeClass(p.status)}`}>
                  {getStatusMessage(p)}
                </span>
              </p>

              <EventTimeline event={p} />

              <div className="proposal-actions">
                <button
                  type="button"
                  onClick={() => navigate(`/edit/${p.id}`)}
                  className="btn border border-sky-300/30 bg-sky-400/10 text-sky-100 hover:bg-sky-400/20"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="btn border border-rose-300/35 bg-rose-500/10 text-rose-100 hover:bg-rose-500/20"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Dashboard;