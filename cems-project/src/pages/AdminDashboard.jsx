import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const getBaseAllocation = (event) => ({
  hall: event.hall ?? "Hall 1",
  resource_status: event.resource_status ?? "available",
  comment: event.admin_comment ?? "",
});

function AdminDashboard() {
  const HALL_OPTIONS = ["Hall 1", "Hall 2", "Hall 3"];
  const RESOURCE_OPTIONS = ["available", "not_available"];

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allocationById, setAllocationById] = useState({});
  const [initialAllocationById, setInitialAllocationById] = useState({});
  const [successById, setSuccessById] = useState({});

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Admin Panel";

    return () => {
      document.title = previousTitle;
    };
  }, []);

  const getStatusBadgeClass = (status) => {
    const normalized = String(status ?? "approved_principal").toLowerCase();

    if (normalized.includes("approved")) {
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/35 font-semibold";
    }

    if (normalized.includes("rejected")) {
      return "bg-rose-500/15 text-rose-300 border border-rose-400/35 font-semibold";
    }

    return "bg-amber-500/15 text-amber-300 border border-amber-400/35 font-semibold";
  };

  const formatStatusLabel = (status) => String(status ?? "approved_principal").replace(/_/g, " ");

  const fetchAdminEvents = useCallback(async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from("proposal")
        .select("id, title, description, date, participants, status, hall, resource_status, admin_comment")
        .eq("status", "approved_principal")
        .order("date", { ascending: true });

      if (fetchError) {
        console.error("fetchAdminEvents error:", fetchError);
        throw new Error(fetchError.message || "Failed to fetch admin events");
      }

      const safeData = data ?? [];
      setEvents(safeData);

      const nextAllocationById = {};
      safeData.forEach((event) => {
        nextAllocationById[event.id] = getBaseAllocation(event);
      });

      setAllocationById(nextAllocationById);
      setInitialAllocationById(nextAllocationById);

      return safeData;
    } catch (err) {
      console.error("fetchAdminEvents failed:", err);
      setError(err.message || "Failed to fetch admin events");
      setEvents([]);
      return [];
    }
  }, []);

  const assignResources = async (id, hall, resource_status, comment) => {
    try {
      const isApproved = resource_status === "available";

      const { data, error: updateError } = await supabase
        .from("proposal")
        .update({
          hall,
          resource_status,
          status: isApproved ? "resources_approved" : "resources_rejected",
          admin_approved: isApproved,
          admin_comment: isApproved ? "" : comment,
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error(`assignResources error for ${id}:`, updateError);
        throw new Error(updateError.message || "Failed to assign resources");
      }

      console.log(`Resources assigned successfully for event ${id}.`);
      return data;
    } catch (err) {
      console.error("assignResources failed:", err);
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
        console.error("Admin dashboard init failed:", err);
        setIsAdmin(false);
        setError(err.message || "Failed to initialize admin dashboard");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fetchAdminEvents]);

  const handleAllocationChange = (id, field, value) => {
    setSuccessById((prev) => ({
      ...prev,
      [id]: null,
    }));

    setAllocationById((prev) => ({
      ...prev,
      [id]: {
        hall: prev[id]?.hall ?? "Hall 1",
        resource_status: prev[id]?.resource_status ?? "available",
        comment: prev[id]?.comment ?? "",
        [field]: value,
      },
    }));
  };

  const handleConfirmAllocation = async (id) => {
    const selected = allocationById[id] ?? initialAllocationById[id] ?? {
      hall: "Hall 1",
      resource_status: "available",
      comment: "",
    };
    const initial = initialAllocationById[id] ?? {
      hall: "Hall 1",
      resource_status: "available",
      comment: "",
    };

    const isChanged =
      selected.hall !== initial.hall ||
      selected.resource_status !== initial.resource_status ||
      selected.comment !== initial.comment;

    if (!isChanged) {
      setError("No changes to save for this event.");
      return;
    }

    if (selected.resource_status === "not_available" && !selected.comment.trim()) {
      setError("Admin comment is required when rejecting resources.");
      return;
    }

    if (!HALL_OPTIONS.includes(selected.hall)) {
      setError("Invalid hall value selected.");
      return;
    }

    if (!RESOURCE_OPTIONS.includes(selected.resource_status)) {
      setError("Invalid resource status selected.");
      return;
    }

    try {
      setUpdatingId(id);
      setError(null);

      await assignResources(
        id,
        selected.hall,
        selected.resource_status,
        selected.comment.trim()
      );

      await fetchAdminEvents();
      setSuccessById((prev) => ({
        ...prev,
        [id]: "Allocation saved successfully.",
      }));
    } catch (err) {
      setError(err.message || "Failed to confirm allocation");
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
          {error ? <p style={{ color: "#ff9fab" }}>⚠️ {error}</p> : null}
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="dashboard-page" style={{ marginTop: "22px", color: "#e7ecff" }}>
        <h1 style={{ margin: "0 0 12px", fontSize: "2rem" }}>Admin Panel</h1>
        <p>Loading...</p>
      </section>
    );
  }

  return (
    <section className="dashboard-page" style={{ marginTop: "22px", color: "#e7ecff" }}>
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">Management</p>
          <h1>Admin Panel</h1>
        </div>
      </div>

      {error ? (
        <div className="proposal-card" style={{ borderLeft: "4px solid #f25865", marginBottom: "12px" }}>
          <p style={{ color: "#ff9fab", margin: 0 }}>⚠️ {error}</p>
        </div>
      ) : null}

      {events.length === 0 ? (
        <div className="empty-state text-center">
          <h3>No approved events</h3>
          <p>Events approved by Principal will appear here for allocation.</p>
        </div>
      ) : (
        <div className="proposal-grid">
          {events.map((event) => {
            const selected = allocationById[event.id] ?? {
              hall: event.hall ?? "Hall 1",
              resource_status: event.resource_status ?? "available",
              comment: event.admin_comment ?? "",
            };
            const initial = initialAllocationById[event.id] ?? {
              hall: event.hall ?? "Hall 1",
              resource_status: event.resource_status ?? "available",
              comment: event.admin_comment ?? "",
            };
            const isChanged =
              selected.hall !== initial.hall ||
              selected.resource_status !== initial.resource_status ||
              selected.comment !== initial.comment;

            return (
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

                <div className="app-form" style={{ marginTop: "12px", gap: "10px" }}>
                  <div className="form-field">
                    <label htmlFor={`hall-${event.id}`}>Hall</label>
                    <select
                      id={`hall-${event.id}`}
                      value={selected.hall}
                      onChange={(e) => handleAllocationChange(event.id, "hall", e.target.value)}
                      className="w-full rounded-xl border border-slate-500/40 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none"
                    >
                      <option value="Hall 1">Hall 1</option>
                      <option value="Hall 2">Hall 2</option>
                      <option value="Hall 3">Hall 3</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor={`resource-${event.id}`}>Resource Availability</label>
                    <select
                      id={`resource-${event.id}`}
                      value={selected.resource_status}
                      onChange={(e) => handleAllocationChange(event.id, "resource_status", e.target.value)}
                      className="w-full rounded-xl border border-slate-500/40 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none"
                    >
                      <option value="available">available</option>
                      <option value="not_available">not_available</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor={`comment-${event.id}`}>Admin Comment</label>
                    <textarea
                      id={`comment-${event.id}`}
                      rows={3}
                      value={selected.comment}
                      onChange={(e) => handleAllocationChange(event.id, "comment", e.target.value)}
                      placeholder="Add allocation notes..."
                      className="w-full rounded-xl border border-slate-500/40 bg-slate-950/80 px-3 py-2 text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div className="proposal-actions" style={{ marginTop: "10px" }}>
                  <button
                    type="button"
                    className="btn border border-sky-400/40 bg-sky-500/10 text-sky-200 hover:bg-sky-500/20 disabled:opacity-60"
                    disabled={updatingId === event.id || !isChanged}
                    onClick={() => handleConfirmAllocation(event.id)}
                  >
                    {updatingId === event.id ? "Saving..." : "Confirm Allocation"}
                  </button>
                </div>

                {successById[event.id] ? (
                  <p style={{ color: "#86efac", marginTop: "10px", marginBottom: 0 }}>
                    {successById[event.id]}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default AdminDashboard;