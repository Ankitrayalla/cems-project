import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import AlertBanner from "../components/ui/AlertBanner";
import DashboardSkeleton from "../components/ui/DashboardSkeleton";

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
    setSuccessById((prev) => ({ ...prev, [id]: null }));

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
      <section className="dashboard-page access-panel">
        <h1>Access Denied</h1>
        <div className="proposal-card glass-panel">
          <p>You do not have Admin access to this page.</p>
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
          title="Admin Allocation Panel"
          subtitle="Assign halls and confirm resource availability."
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
        title="Admin Allocation Panel"
        subtitle="Assign halls and confirm resource availability."
      />

      <div className="dashboard-body">
      {error ? <AlertBanner variant="error">⚠️ {error}</AlertBanner> : null}

      <div className="dashboard-section">
      {events.length === 0 ? (
        <EmptyState
          icon="🏛"
          title="No approved events"
          description="Events approved by Principal will appear here for hall and resource allocation."
        />
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

                <div className="app-form">
                  <div className="form-field">
                    <label htmlFor={`hall-${event.id}`}>Hall</label>
                    <select
                      id={`hall-${event.id}`}
                      value={selected.hall}
                      onChange={(e) => handleAllocationChange(event.id, "hall", e.target.value)}
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
                      onChange={(e) =>
                        handleAllocationChange(event.id, "resource_status", e.target.value)
                      }
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
                    />
                  </div>
                </div>

                <div className="proposal-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={updatingId === event.id || !isChanged}
                    onClick={() => handleConfirmAllocation(event.id)}
                  >
                    {updatingId === event.id ? "Saving..." : "Confirm Allocation"}
                  </button>
                </div>

                {successById[event.id] ? (
                  <p className="inline-success">{successById[event.id]}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
      </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
