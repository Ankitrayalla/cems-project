import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import AlertBanner from "../components/ui/AlertBanner";
import RejectModal from "../components/ui/RejectModal";
import DashboardSkeleton from "../components/ui/DashboardSkeleton";

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
    if (updating) return;
    setIsRejectModalOpen(false);
    setRejectingEventId(null);
    setRejectComment("");
  };

  const handleRejectSubmit = async () => {
    if (!rejectingEventId) return;

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
      <section className="dashboard-page access-panel">
        <h1>Access Denied</h1>
        <div className="proposal-card glass-panel">
          <p>You do not have Principal access to this page.</p>
          {error ? <AlertBanner variant="error">⚠️ {error}</AlertBanner> : null}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="dashboard-page">
        <PageHeader
          eyebrow="Management"
          title="Principal Panel"
          subtitle="Final approval for HOD-cleared events."
        />
        <div className="dashboard-body">
          <DashboardSkeleton showStats={false} cards={2} />
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <PageHeader
        eyebrow="Management"
        title="Principal Panel"
        subtitle="Final approval for HOD-cleared events."
      />

      <div className="dashboard-body">
      {error ? <AlertBanner variant="error">⚠️ {error}</AlertBanner> : null}

      <div className="dashboard-section">
      {events.length === 0 ? (
        <EmptyState
          icon="✓"
          title="No approved HOD events yet"
          description="Events approved by HOD will appear here for Principal review."
        />
      ) : (
        <div className="proposal-grid">
          {events.map((event) => (
            <article key={event.id} className="proposal-card">
              <h3>{event.title}</h3>
              <p className="proposal-description">{event.description}</p>

              <div className="proposal-meta">
                <span className="meta-pill">📅 {event.date || "No date"}</span>
                <span className="meta-pill">👥 {event.participants || 0} participants</span>
              </div>

              <p className="proposal-status">
                <span>Status</span>
                <StatusBadge status={event.status} label={formatStatusLabel(event.status)} />
              </p>

              <div className="proposal-actions">
                <button
                  onClick={() => handleApprove(event.id)}
                  disabled={updating === event.id}
                  className="btn btn-success"
                >
                  {updating === event.id ? "Approving..." : "Approve"}
                </button>

                <button
                  onClick={() => handleOpenRejectModal(event.id)}
                  disabled={updating === event.id}
                  className="btn btn-danger"
                >
                  {updating === event.id ? "Rejecting..." : "Reject"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
      </div>
      </div>

      {isRejectModalOpen ? (
        <RejectModal
          title="Reject Event"
          description="Add a clear reason for rejection. This will be saved as Principal comment."
          commentId="principal-reject-comment"
          comment={rejectComment}
          onCommentChange={setRejectComment}
          maxLength={PRINCIPAL_COMMENT_MAX_LENGTH}
          onClose={handleCloseRejectModal}
          onSubmit={handleRejectSubmit}
          isSubmitting={Boolean(updating)}
        />
      ) : null}
    </section>
  );
}

export default PrincipalDashboard;
