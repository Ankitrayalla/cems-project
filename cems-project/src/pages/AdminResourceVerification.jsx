import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function AdminResourceVerification() {
  const ADMIN_COMMENT_MAX_LENGTH = 300;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [commentById, setCommentById] = useState({});

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Admin Resource Verification";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  const fetchAdminEvents = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("proposal")
        .select("id, title, description, requested_hall, requested_resources, resource_request_status")
        .eq("resource_request_status", "submitted")
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("fetchAdminEvents error:", fetchError);
        throw new Error(fetchError.message || "Failed to fetch submitted resource requests");
      }

      const safeData = data ?? [];
      setEvents(safeData);

      setCommentById((prev) => {
        const next = { ...prev };
        safeData.forEach((event) => {
          if (next[event.id] === undefined) {
            next[event.id] = "";
          }
        });
        return next;
      });

      return safeData;
    } catch (err) {
      console.error("fetchAdminEvents failed:", err);
      setError(err.message || "Failed to fetch submitted resource requests");
      setEvents([]);
      return [];
    }
  };

  const approveResources = async (id) => {
    try {
      const { data, error: updateError } = await supabase
        .from("proposal")
        .update({
          admin_approved: true,
          resource_request_status: "verified",
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error(`approveResources error for ${id}:`, updateError);
        throw new Error(updateError.message || "Failed to approve resources");
      }

      console.log(`Resources approved successfully for event ${id}.`);
      return data;
    } catch (err) {
      console.error("approveResources failed:", err);
      throw err;
    }
  };

  const rejectResources = async (id, comment) => {
    try {
      const { data, error: updateError } = await supabase
        .from("proposal")
        .update({
          admin_approved: false,
          resource_request_status: "verified",
          admin_comment: comment,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error(`rejectResources error for ${id}:`, updateError);
        throw new Error(updateError.message || "Failed to reject resources");
      }

      console.log(`Resources rejected successfully for event ${id}.`);
      return data;
    } catch (err) {
      console.error("rejectResources failed:", err);
      throw err;
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
          setIsAdmin(false);
          setError("Not logged in");
          return;
        }

        const { data, error: roleError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (roleError) {
          setIsAdmin(false);
          setError(roleError.message || "Failed to fetch user role");
          return;
        }

        const role = String(data?.role ?? "").toLowerCase().trim();
        const hasAccess = role === "admin";
        setIsAdmin(hasAccess);

        if (hasAccess) {
          await fetchAdminEvents();
        }
      } catch (err) {
        console.error("Admin resource verification init failed:", err);
        setIsAdmin(false);
        setError(err.message || "Failed to initialize admin verification dashboard");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleApprove = async (id) => {
    try {
      setUpdatingId(id);
      setError(null);
      await approveResources(id);
      await fetchAdminEvents();
    } catch (err) {
      setError(err.message || "Failed to approve resources");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id) => {
    const comment = (commentById[id] ?? "").trim();
    if (!comment) {
      setError("Please enter an admin comment before rejecting.");
      return;
    }

    if (comment.length > ADMIN_COMMENT_MAX_LENGTH) {
      setError(`Admin comment must be ${ADMIN_COMMENT_MAX_LENGTH} characters or less.`);
      return;
    }

    try {
      setUpdatingId(id);
      setError(null);
      await rejectResources(id, comment);
      await fetchAdminEvents();
    } catch (err) {
      setError(err.message || "Failed to reject resources");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!loading && !isAdmin) {
    return (
      <section className="dashboard-page" style={{ marginTop: "22px", color: "#e7ecff" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: "2rem" }}>Access Denied</h1>
        <div className="proposal-card">
          <p>You do not have Admin access to this page.</p>
          {error ? <p style={{ color: "#ff9fab" }}>Error: {error}</p> : null}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="dashboard-page" style={{ marginTop: "22px", color: "#e7ecff" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: "2rem" }}>Admin Verification</h1>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section className="dashboard-page" style={{ marginTop: "22px", color: "#e7ecff" }}>
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Verification</p>
          <h1>Admin Resource Verification</h1>
        </div>
      </div>

      {error ? (
        <div className="proposal-card" style={{ borderLeft: "4px solid #f25865", marginBottom: "12px" }}>
          <p style={{ color: "#ff9fab", margin: 0 }}>Error: {error}</p>
        </div>
      ) : null}

      {events.length === 0 ? (
        <div className="empty-state text-center">
          <h3>No approved events</h3>
          <p>No submitted resource requests to verify.</p>
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
                <span>Requested Hall: {event.requested_hall || "Not specified"}</span>
              </div>

              <div className="form-field" style={{ marginTop: "8px" }}>
                <label>Requested Resources</label>
                <textarea
                  value={event.requested_resources || "No resources listed"}
                  readOnly
                  rows={3}
                  className="w-full rounded-xl border border-slate-500/40 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none"
                />
              </div>

              <div className="form-field" style={{ marginTop: "8px" }}>
                <label htmlFor={`admin-comment-${event.id}`}>Admin Comment (for rejection)</label>
                <textarea
                  id={`admin-comment-${event.id}`}
                  rows={3}
                  maxLength={ADMIN_COMMENT_MAX_LENGTH}
                  value={commentById[event.id] ?? ""}
                  onChange={(e) =>
                    setCommentById((prev) => ({
                      ...prev,
                      [event.id]: e.target.value,
                    }))
                  }
                  placeholder="Optional for approve, required for reject"
                  className="w-full rounded-xl border border-slate-500/40 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none"
                />
                <p className="mt-1 mb-0 text-right text-xs text-slate-300">
                  {(commentById[event.id] ?? "").length}/{ADMIN_COMMENT_MAX_LENGTH}
                </p>
              </div>

              <p className="proposal-status" style={{ marginTop: "10px" }}>
                Request Status:
                <span className="status-chip bg-amber-500/15 text-amber-300 border border-amber-400/35 font-semibold">
                  {String(event.resource_request_status ?? "submitted").replace(/_/g, " ")}
                </span>
              </p>

              <div className="proposal-actions">
                <button
                  type="button"
                  className="btn border border-emerald-400/40 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60"
                  disabled={updatingId === event.id}
                  onClick={() => handleApprove(event.id)}
                >
                  {updatingId === event.id ? "Saving..." : "Approve"}
                </button>

                <button
                  type="button"
                  className="btn border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 disabled:opacity-60"
                  disabled={updatingId === event.id}
                  onClick={() => handleReject(event.id)}
                >
                  {updatingId === event.id ? "Saving..." : "Reject"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AdminResourceVerification;
