import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProposal } from "../services/proposals";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

function CreateProposal() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [participants, setParticipants] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 🔥 IMPORTANT CHECK
    if (!user) {
      alert("You must be logged in");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createProposal({
        title: title.trim(),
        description: description.trim(),
        date,
        participants: Number(participants),
      });

      alert(result?.message || "Proposal submitted successfully!");

      // reset form
      setTitle("");
      setDescription("");
      setDate("");
      setParticipants("");
    } catch (error) {
      console.error("Insert Error:", error);
      alert(error.message || "Error submitting proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="form-page">
      <div className="form-shell">
        <div className="form-head">
          <p className="eyebrow">Event Workflow</p>
          <h1>Create Event Proposal</h1>
          <p className="form-subtitle page-subtitle">
            Provide clear event details to help reviewers evaluate your proposal efficiently.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="app-form" noValidate>
          <div className="form-field">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Tech Symposium 2026"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add objective, venue idea, and key highlights"
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
                placeholder="120"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/dashboard")}>
              Back
            </button>
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

export default CreateProposal;