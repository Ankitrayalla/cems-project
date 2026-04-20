import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function PrincipalDashboard() {
  const PRINCIPAL_COMMENT_MAX_LENGTH = 300;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState(null);
  const [isPrincipal, setIsPrincipal] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectingEventId, setRejectingEventId] = useState(null);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Principal Panel";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  const getStatusBadgeClass = (status) => {
    const normalized = String(status ?? "approved_hod").toLowerCase();

    if (normalized.includes("approved")) {
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/35 font-semibold";
    }

    if (normalized.includes("rejected")) {
      return "bg-rose-500/15 text-rose-300 border border-rose-400/35 font-semibold";
    }

    return "bg-amber-500/15 text-amber-300 border border-amber-400/35 font-semibold";
  };

  const formatStatusLabel = (status) => String(status ?? "approved_hod").replace(/_/g, " ");

  const fetchPrincipalEvents = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("proposal")
        .select("id, title, description, date, participants, status")
        .eq("status", "approved_hod")
        .order("date", { ascending: true });

      if (fetchError) {
        console.error("fetchPrincipalEvents error:", fetchError);
        throw new Error(fetchError.message || "Failed to fetch principal events");
      }

      setEvents(data ?? []);
      return data ?? [];
    } catch (err) {
      console.error("fetchPrincipalEvents failed:", err);
      setError(err.message || "Failed to fetch principal events");
      setEvents([]);
      return [];
    }
  };

  const approveByPrincipal = async (id) => {
    try {
      const { error: updateError } = await supabase
        .from("proposal")
        .update({ status: "approved_principal" })
        .eq("id", id);

      if (updateError) {
        console.error("approveByPrincipal error:", updateError);
        throw new Error(updateError.message || "Failed to approve by principal");
      }

      console.log(`Approved by Principal: ${id}`);
      await fetchPrincipalEvents();
    } catch (err) {
      console.error("approveByPrincipal failed:", err);
      setError(err.message || "Failed to approve by principal");
    }
  };

  const rejectByPrincipal = async (id, comment) => {
    try {
      const { error: updateError } = await supabase
        .from("proposal")
        .update({
          status: "rejected_principal",
          principal_comment: comment,
        })
        .eq("id", id);

      if (updateError) {
        console.error("rejectByPrincipal error:", updateError);
        throw new Error(updateError.message || "Failed to reject by principal");
      }

      console.log(`Rejected by Principal: ${id}`);
      await fetchPrincipalEvents();
    } catch (err) {
      console.error("rejectByPrincipal failed:", err);
      setError(err.message || "Failed to reject by principal");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        setLoading(true);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setIsPrincipal(false);
          setError("Not logged in");
          return;
        }

        const { data, error: roleError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (roleError) {
          setIsPrincipal(false);
          setError(roleError.message || "Failed to fetch user role");
          return;
        }

        const role = String(data?.role ?? "").toLowerCase().trim();
        const hasAccess = role === "principal" || role === "admin";
        setIsPrincipal(hasAccess);

        if (hasAccess) {
          await fetchPrincipalEvents();
        }
      } catch (err) {
        console.error("Principal dashboard init failed:", err);
        setIsPrincipal(false);
        setError(err.message || "Failed to initialize principal dashboard");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleApprove = async (id) => {
    try {
      setUpdating(id);
      setError(null);
      await approveByPrincipal(id);
    } finally {
      setUpdating(null);
    }
  };

  const handleOpenRejectModal = (id) => {
    setRejectingEventId(id);
    setRejectComment("");
    setIsRejectModalOpen(true);
  };

  const handleCloseRejectModal = () => {
    if (updating) {
      return;
    }

    setIsRejectModalOpen(false);
    setRejectingEventId(null);
    setRejectComment("");
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

    if (comment.length > PRINCIPAL_COMMENT_MAX_LENGTH) {
      setError(`Rejection reason must be ${PRINCIPAL_COMMENT_MAX_LENGTH} characters or less.`);
      return;
    }

    try {
      setUpdating(rejectingEventId);
      setError(null);
      await rejectByPrincipal(rejectingEventId, comment);
      setIsRejectModalOpen(false);
      setRejectingEventId(null);
      setRejectComment("");
    } finally {
      setUpdating(null);
    }
  };

  if (!loading && !isPrincipal) {
    return (
      <section className="dashboard-page" style={{ marginTop: "22px", color: "#e7ecff" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: "2rem" }}>Access Denied</h1>
        <div className="proposal-card">
          <p>You do not have Principal access to this page.</p>
          {error && <p style={{ color: "#ff9fab" }}>⚠️ {error}</p>}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="dashboard-page" style={{ marginTop: "22px", color: "#e7ecff" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: "2rem" }}>Principal Panel</h1>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section className="dashboard-page" style={{ marginTop: "22px", color: "#e7ecff" }}>
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Management</p>
          <h1>Principal Panel</h1>
        </div>
      </div>

      {error && (
        <div className="proposal-card" style={{ borderLeft: "4px solid #f25865", marginBottom: "12px" }}>
          <p style={{ color: "#ff9fab", margin: 0 }}>⚠️ {error}</p>
        </div>
      )}

      {events.length === 0 ? (
        <div className="empty-state text-center">
          <h3>No approved HOD events yet 🚀</h3>
          <p>Events approved by HOD will appear here for Principal review.</p>
        </div>
      ) : (
        <div className="proposal-grid">
          {events.map((event) => (
            <article
              key={event.id}
              className="proposal-card transition-all duration-250 ease-out hover:scale-[1.02] hover:shadow-2xl hover:border-slate-300/30"
            >
              <h3>{event.title}</h3>
              <p className="proposal-description">{event.description}</p>

              <div className="proposal-meta">
                <span>📅 {event.date || "No date"}</span>
                <span>👥 {event.participants || 0} participants</span>
              </div>

              <p className="proposal-status">
                Status:
                <span className={`status-chip ${getStatusBadgeClass(event.status)}`}>
                  {formatStatusLabel(event.status)}
                </span>
              </p>

              <div className="proposal-actions">
                <button
                  onClick={() => handleApprove(event.id)}
                  disabled={updating === event.id}
                  className="btn border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                >
                  {updating === event.id ? "Approving..." : "Approve"}
                </button>

                <button
                  onClick={() => handleOpenRejectModal(event.id)}
                  disabled={updating === event.id}
                  className="btn border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 disabled:opacity-60"
                >
                  {updating === event.id ? "Rejecting..." : "Reject"}
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
            <p className="text-slate-300 mt-2 mb-3">Add a clear reason for rejection. This will be saved as Principal comment.</p>

            <div className="reject-comment-box">
              <label htmlFor="principal-reject-comment" className="reject-comment-label">Rejection Reason</label>
              <textarea
                id="principal-reject-comment"
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
                maxLength={PRINCIPAL_COMMENT_MAX_LENGTH}
                className="w-full rounded-xl border border-slate-500/40 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none focus:border-rose-400/60"
                placeholder="Write rejection reason..."
              />
              <p className="reject-comment-helper">This comment is visible to the event head.</p>
              <p className="mt-2 mb-0 text-right text-xs text-slate-300">
                {rejectComment.length}/{PRINCIPAL_COMMENT_MAX_LENGTH}
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseRejectModal}
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

export default PrincipalDashboard;