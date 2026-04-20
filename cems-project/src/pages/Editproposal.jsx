import { useParams, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { updateProposal } from "../services/proposals";

function EditProposal() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState("");

  const fetchProposal = useCallback(async () => {
    const { data, error } = await supabase
      .from("proposal")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
    } else {
      setTitle(data.title);
      setDescription(data.description);
      setDate(data.date);
      setParticipants(data.participants);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProposal();
  }, [fetchProposal]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      await updateProposal(id, {
        title,
        description,
        date,
        participants: Number(participants),
      });

      alert("Updated successfully");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Error updating");
    }
  };

  return (
    <section className="form-page">
      <div className="form-shell">
        <div className="form-head">
          <p className="eyebrow">Proposal Management</p>
          <h1>Edit Proposal</h1>
          <p className="form-subtitle">
            Update your proposal details and keep your event plan accurate.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="app-form" noValidate>
          <div className="form-field">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your event"
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label htmlFor="date">Event Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="participants">Expected Participants</label>
              <input
                id="participants"
                type="number"
                min="1"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="100"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Update Proposal
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default EditProposal;