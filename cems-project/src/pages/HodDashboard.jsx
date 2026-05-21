import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { approveEvent, fetchPendingEvents, rejectEvent } from "../services/proposals";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import AlertBanner from "../components/ui/AlertBanner";
import RejectModal from "../components/ui/RejectModal";
import DashboardSkeleton from "../components/ui/DashboardSkeleton";
import { getStatusTone } from "../utils/statusStyles";

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

  const formatStatusLabel = (status) =>
    String(status ?? "pending_hod").toLowerCase().replace(/_/g, " ");

  const totalProposals = proposals.length;
  const approvedCount = proposals.filter((p) => getStatusTone(p.status) === "approved").length;
  const pendingCount = proposals.filter((p) => getStatusTone(p.status) === "pending").length;

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "HOD Panel";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        setError(null);
        setLoading(true);

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
          await loadProposals();
        }
      } catch (err) {
        setError(err.message);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, []);

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

      await loadProposals();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingEventId) return;

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
    if (updating) return;
    setIsRejectModalOpen(false);
    setRejectingEventId(null);
    setRejectComment("");
  };

  if (!loading && !isAdmin) {
    return (
      <section className="dashboard-page access-panel">
        <h1>Access Denied</h1>
        <div className="proposal-card glass-panel">
          <p>You do not have HOD access to this page.</p>
          {error ? <AlertBanner variant="error">⚠️ {error}</AlertBanner> : null}
          <ul className="debug-list">
            <li>Auth user id: {debug.authUserId ?? "none"}</li>
            <li>Profile found: {debug.profileFound ? "yes" : "no"}</li>
            <li>Profile id: {debug.profileId ?? "none"}</li>
            <li>Profile role: {debug.profileRole ?? "none"}</li>
            <li>Expected role: hod (or admin)</li>
          </ul>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="dashboard-page">
        <PageHeader
          eyebrow="Management"
          title="HOD Panel"
          subtitle="Review and approve club event proposals."
        />
        <div className="dashboard-body">
          <DashboardSkeleton cards={2} />
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard-page">
      <PageHeader
        eyebrow="Management"
        title="HOD Panel"
        subtitle="Review and approve club event proposals."
      />

      <div className="dashboard-body">
      <div className="stats-grid">
        <StatCard label="Total Proposals" value={totalProposals} variant="accent" index={0} />
        <StatCard label="Approved" value={approvedCount} variant="success" index={1} />
        <StatCard label="Pending" value={pendingCount} variant="warning" index={2} />
      </div>

      {error ? <AlertBanner variant="error">⚠️ {error}</AlertBanner> : null}

      <div className="dashboard-section">
      {proposals.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No proposals yet"
          description="All submitted proposals will appear here for HOD review."
        />
      ) : (
        <div className="proposal-grid">
          {proposals.map((proposal) => (
            <article key={proposal.id} className="proposal-card">
              <h3>{proposal.title}</h3>
              <p className="proposal-description">{proposal.description}</p>

              <div className="proposal-meta">
                <span className="meta-pill">📅 {proposal.date || "No date"}</span>
                <span className="meta-pill">👥 {proposal.participants || 0} participants</span>
              </div>

              <p className="proposal-status">
                <span>Status</span>
                <StatusBadge
                  status={proposal.status}
                  label={formatStatusLabel(proposal.status)}
                />
              </p>

              <div className="proposal-actions">
                <button
                  onClick={() => handleUpdateStatus(proposal.id, "approved_hod")}
                  disabled={updating === proposal.id}
                  className="btn btn-success"
                >
                  {updating === proposal.id ? "Approving..." : "Approve"}
                </button>

                <button
                  onClick={() => handleUpdateStatus(proposal.id, "rejected_hod")}
                  disabled={updating === proposal.id}
                  className="btn btn-danger"
                >
                  {updating === proposal.id ? "Rejecting..." : "Reject"}
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
          description="Add a clear reason for rejection. This will be saved as HOD comment."
          commentId="hod-reject-comment"
          comment={rejectComment}
          onCommentChange={setRejectComment}
          maxLength={HOD_COMMENT_MAX_LENGTH}
          onClose={closeRejectModal}
          onSubmit={handleRejectSubmit}
          isSubmitting={Boolean(updating)}
        />
      ) : null}
    </section>
  );
}

export default HodDashboard;
