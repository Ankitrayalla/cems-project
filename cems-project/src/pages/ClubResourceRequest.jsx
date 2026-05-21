import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import EmptyState from "../components/ui/EmptyState";
import AlertBanner from "../components/ui/AlertBanner";
import DashboardSkeleton from "../components/ui/DashboardSkeleton";

function ClubResourceRequest() {
  const HALL_OPTIONS = ["Hall 1", "Hall 2", "Hall 3"];

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState(null);
  const [formById, setFormById] = useState({});
  const [successById, setSuccessById] = useState({});

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Resource Request";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const fetchResourceRequestEvents = async () => {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message || "You must be logged in");
      }

      const { data, error: fetchError } = await supabase
        .from("proposal")
        .select("id, title, description, date, participants, status, requested_hall, requested_resources, resource_request_status")
        .eq("status", "approved_principal")
        .eq("resource_request_status", "pending_request")
        .eq("created_by", user.id)
        .order("date", { ascending: true });

      if (fetchError) {
        console.error("fetchResourceRequestEvents error:", fetchError);
        throw new Error(fetchError.message || "Failed to fetch resource request events");
      }

      const safeData = data ?? [];
      setEvents(safeData);

      setFormById((prev) => {
        const next = { ...prev };
        safeData.forEach((event) => {
          next[event.id] = {
            hall: prev[event.id]?.hall ?? event.requested_hall ?? "Hall 1",
            resources: prev[event.id]?.resources ?? event.requested_resources ?? "",
          };
        });
        return next;
      });

      return safeData;
    } catch (err) {
      console.error("fetchResourceRequestEvents failed:", err);
      setError(err.message || "Failed to fetch resource request events");
      setEvents([]);
      return [];
    }
  };

  const submitResourceRequest = async (id, hall, resources) => {
    try {
      const { data, error: updateError } = await supabase
        .from("proposal")
        .update({
          requested_hall: hall,
          requested_resources: resources,
          resource_request_status: "submitted",
        })
        .eq("id", id)
        .select()
        .single();

      if (updateError) {
        console.error(`submitResourceRequest error for ${id}:`, updateError);
        throw new Error(updateError.message || "Failed to submit resource request");
      }

      console.log(`Resource request submitted successfully for event ${id}.`);
      return data;
    } catch (err) {
      console.error("submitResourceRequest failed:", err);
      throw err;
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        setLoading(true);
        await fetchResourceRequestEvents();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleFormChange = (id, field, value) => {
    setSuccessById((prev) => ({ ...prev, [id]: null }));
    setFormById((prev) => ({
      ...prev,
      [id]: {
        hall: prev[id]?.hall ?? "Hall 1",
        resources: prev[id]?.resources ?? "",
        [field]: value,
      },
    }));
  };

  const handleSubmitRequest = async (id) => {
    const selected = formById[id] ?? { hall: "Hall 1", resources: "" };

    if (!HALL_OPTIONS.includes(selected.hall)) {
      setError("Invalid hall value selected.");
      return;
    }

    if (!selected.resources.trim()) {
      setError("Please enter required resources before submitting.");
      return;
    }

    try {
      setSubmittingId(id);
      setError(null);
      await submitResourceRequest(id, selected.hall, selected.resources.trim());
      setSuccessById((prev) => ({ ...prev, [id]: "Resource request submitted." }));
      await fetchResourceRequestEvents();
    } catch (err) {
      setError(err.message || "Failed to submit resource request");
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <section className="dashboard-page">
        <PageHeader
          eyebrow="Resources"
          title="Club Resource Request"
          subtitle="Request halls and equipment for principal-approved events."
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
        eyebrow="Resources"
        title="Club Resource Request"
        subtitle="Request halls and equipment for principal-approved events."
      />

      <div className="dashboard-body">
      {error ? <AlertBanner variant="error">Error: {error}</AlertBanner> : null}

      <div className="dashboard-section">
      {events.length === 0 ? (
        <EmptyState
          icon="📦"
          title="No approved principal events"
          description="Once the Principal approves an event, you can request hall and resources here."
        />
      ) : (
        <div className="proposal-grid">
          {events.map((event) => {
            const selected = formById[event.id] ?? {
              hall: event.requested_hall ?? "Hall 1",
              resources: event.requested_resources ?? "",
            };

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
                  <StatusBadge
                    status={event.status}
                    tone="approved"
                    label={String(event.status ?? "approved_principal").replace(/_/g, " ")}
                  />
                </p>

                <div className="app-form">
                  <div className="form-field">
                    <label htmlFor={`requested-hall-${event.id}`}>Requested Hall</label>
                    <select
                      id={`requested-hall-${event.id}`}
                      value={selected.hall}
                      onChange={(e) => handleFormChange(event.id, "hall", e.target.value)}
                    >
                      <option value="Hall 1">Hall 1</option>
                      <option value="Hall 2">Hall 2</option>
                      <option value="Hall 3">Hall 3</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor={`requested-resources-${event.id}`}>Required Resources</label>
                    <textarea
                      id={`requested-resources-${event.id}`}
                      rows={3}
                      value={selected.resources}
                      onChange={(e) => handleFormChange(event.id, "resources", e.target.value)}
                      placeholder="Projector, sound system, chairs..."
                    />
                  </div>
                </div>

                <div className="proposal-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={submittingId === event.id}
                    onClick={() => handleSubmitRequest(event.id)}
                  >
                    {submittingId === event.id ? "Submitting..." : "Submit Request"}
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

export default ClubResourceRequest;
