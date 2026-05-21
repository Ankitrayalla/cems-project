function RejectModal({
  title,
  description,
  commentId,
  comment,
  onCommentChange,
  maxLength,
  onClose,
  onSubmit,
  isSubmitting,
  submitLabel = "Submit Rejection",
}) {
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="reject-modal-title">
      <div className="modal-panel">
        <h2 id="reject-modal-title">{title}</h2>
        <p>{description}</p>

        <div className="reject-comment-box">
          <div className="form-field">
            <label htmlFor={commentId} className="reject-comment-label">
              Rejection Reason
            </label>
            <textarea
              id={commentId}
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              rows={4}
              maxLength={maxLength}
              placeholder="Write rejection reason..."
            />
          </div>
          <p className="reject-comment-helper">This comment is visible to the event head.</p>
          <p className="char-count">
            {comment.length}/{maxLength}
          </p>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="btn btn-danger"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RejectModal;
