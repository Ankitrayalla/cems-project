import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { approveEvent, fetchPendingEvents, rejectEvent } from "../services/proposals";

function HodDashboard() {
  const HOD_COMMENT_MAX_LENGTH = 300;
  const [proposals, setProposals] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingEventId, setRejectingEventId] = useState(null);
  const [rejectComment, setRejectComment] = useState("");
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState({
    authUserId: null,
    profileId: null,
    profileRole: null,
    profileFound: false,
  });

  const normalizeStatus = (status) => String(status ?? "pending_hod").toLowerCase();

  const getStatusTone = (status) => {
    const normalized = normalizeStatus(status);
    if (normalized.includes("approved")) return "approved";
    if (normalized.includes("rejected")) return "rejected";
    return "pending";
  };

  const formatStatusLabel = (status) => {
    const normalized = normalizeStatus(status);
    return normalized.replace(/_/g, " ");
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

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "HOD Panel";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        setError(null);
        setLoading(true);

        // Get current user
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData.user) {
          setDebug({
            authUserId: null,
            profileId: null,
            profileRole: null,
            profileFound: false,
          });
          setIsAdmin(false);
          setError("Not logged in");
          return;
        }

        // Get user's profile to check role
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, role")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profileError) {
          setDebug({
            authUserId: authData.user.id,
            profileId: null,
            profileRole: null,
            profileFound: false,
          });
          setIsAdmin(false);
          setError(`Profile error: ${profileError.message}`);
          return;
        }

        const userProfile = profileData ?? null;

        setDebug({
          authUserId: authData.user.id,
          profileId: userProfile?.id ?? null,
          profileRole: userProfile?.role ?? null,
          profileFound: Boolean(userProfile),
        });

        const normalizedRole = String(userProfile?.role ?? "").toLowerCase().trim();
        const isAdminUser = normalizedRole === "admin" || normalizedRole === "hod";
        setIsAdmin(isAdminUser);

        if (isAdminUser) {
          // Fetch proposals only if HOD-access role is present
          await loadProposals();
        }
      } catch (err) {
        setDebug((prev) => ({ ...prev }));
        setError(err.message);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, []);

  // Load all proposals
  const loadProposals = async () => {
    try {
      const data = await fetchPendingEvents();
      setProposals(data || []);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load pending events");
      setProposals([]);
    }
  };

  // Update proposal status
  const handleUpdateStatus = async (id, status) => {
    try {
      setUpdating(id);
      setError(null);

      if (status === "approved_hod") {
        await approveEvent(id);
      } else if (status === "rejected_hod") {
        setRejectingEventId(id);
        setRejectComment("");
        setIsRejectModalOpen(true);
        return;
      } else {
        const { error: updateError } = await supabase
          .from("proposal")
          .update({ status })
          .eq("id", id);

        if (updateError) {
          setError(`Update failed: ${updateError.message}`);
          return;
        }
      }

      // Refresh the proposals list
      await loadProposals();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingEventId) {
      return;
    }

    const comment = rejectComment.trim();
    if (!comment) {
      setError("Please enter a rejection reason before submitting.");
      return;
    }

    if (comment.length > HOD_COMMENT_MAX_LENGTH) {
      setError(`Rejection reason must be ${HOD_COMMENT_MAX_LENGTH} characters or less.`);
      return;
    }

    try {
      setUpdating(rejectingEventId);
      setError(null);

      await rejectEvent(rejectingEventId, comment);
      setIsRejectModalOpen(false);
      setRejectingEventId(null);
      setRejectComment("");
      await loadProposals();
    } catch (err) {
      setError(err.message || "Failed to reject event");
    } finally {
      setUpdating(null);
    }
  };

  const closeRejectModal = () => {
    if (updating) {
      return;
    }

    setIsRejectModalOpen(false);
    setRejectingEventId(null);
    setRejectComment("");
  };

  // Not logged in or not HOD/admin
  if (!loading && !isAdmin) {
    return (
      <section className="dashboard-page" style={{ marginTop: "22px", color: "#e7ecff" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: "2rem" }}>Access Denied</h1>
        <div className="proposal-card">
          <p>You do not have HOD access to this page.</p>
          {error && <p style={{ color: "#ff9fab" }}>⚠️ {error}</p>}
          <hr style={{ opacity: 0.3 }} />
          <p style={{ margin: "8px 0", color: "#b1bddf" }}>Auth user id: {debug.authUserId ?? "none"}</p>
          <p style={{ margin: "8px 0", color: "#b1bddf" }}>Profile found: {debug.profileFound ? "yes" : "no"}</p>
          <p style={{ margin: "8px 0", color: "#b1bddf" }}>Profile id: {debug.profileId ?? "none"}</p>
          <p style={{ margin: "8px 0", color: "#b1bddf" }}>Profile role: {debug.profileRole ?? "none"}</p>
          <p style={{ margin: "8px 0", color: "#b1bddf" }}>Expected role: hod (or admin)</p>
        </div>
      </section>
    );
  }

  // Loading
  if (loading) {
    return (
      <section className="dashboard-page" style={{ marginTop: "22px", color: "#e7ecff" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: "2rem" }}>HOD Panel</h1>
        <p>Loading...</p>
      </section>
    );
  }

  // HOD - show proposals
  return (
    <section className="dashboard-page" style={{ marginTop: "22px", color: "#e7ecff" }}>
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Management</p>
          <h1>HOD Panel</h1>
        </div>
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

      {error && (
        <div className="proposal-card" style={{ borderLeft: "4px solid #f25865", marginBottom: "12px" }}>
          <p style={{ color: "#ff9fab", margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      {proposals.length === 0 ? (
        <div className="empty-state text-center">
          <h3>No proposals yet 🚀</h3>
          <p>All submitted proposals will appear here.</p>
        </div>
      ) : (
        <div className="proposal-grid">
          {proposals.map((proposal) => (
            <article
              key={proposal.id}
              className="proposal-card transition-all duration-250 ease-out hover:scale-[1.02] hover:shadow-2xl hover:border-slate-300/30"
            >
              <h3>{proposal.title}</h3>

              <p className="proposal-description">{proposal.description}</p>

              <div className="proposal-meta">
                <span>📅 {proposal.date || "No date"}</span>
                <span>👥 {proposal.participants || 0} participants</span>
              </div>

              <p className="proposal-status">
                Status:
                <span className={`status-chip ${getStatusBadgeClass(proposal.status)}`}>
                  {formatStatusLabel(proposal.status)}
                </span>
              </p>

              <div className="proposal-actions">
                <button
                  onClick={() => handleUpdateStatus(proposal.id, "approved_hod")}
                  disabled={updating === proposal.id}
                  className="btn border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                >
                  {updating === proposal.id ? "Approving..." : "Approve"}
                </button>

                <button
                  onClick={() => handleUpdateStatus(proposal.id, "rejected_hod")}
                  disabled={updating === proposal.id}
                  className="btn border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 disabled:opacity-60"
                >
                  {updating === proposal.id ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {isRejectModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="reject-modal-shell w-full max-w-lg rounded-2xl border border-slate-500/30 bg-slate-900/95 p-5 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-100 m-0">Reject Event</h2>
            <p className="text-slate-300 mt-2 mb-3">Add a clear reason for rejection. This will be saved as HOD comment.</p>

            <div className="reject-comment-box">
              <label htmlFor="hod-reject-comment" className="reject-comment-label">Rejection Reason</label>
              <textarea
                id="hod-reject-comment"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
                maxLength={HOD_COMMENT_MAX_LENGTH}
                className="w-full rounded-xl border border-slate-500/40 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none focus:border-rose-400/60"
                placeholder="Write rejection reason..."
              />
              <p className="reject-comment-helper">This comment is visible to the event head.</p>
              <p className="mt-2 mb-0 text-right text-xs text-slate-300">
                {rejectComment.length}/{HOD_COMMENT_MAX_LENGTH}
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeRejectModal}
                className="btn btn-secondary"
                disabled={Boolean(updating)}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                className="btn border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 disabled:opacity-60"
                disabled={Boolean(updating)}
              >
                {updating ? "Rejecting..." : "Submit Rejection"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default HodDashboard;