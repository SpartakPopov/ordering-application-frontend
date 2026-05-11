export function ErrorScreen({ message, onRetry }) {
  return (
    <div className="error-screen">
      <div className="error-content">
        <div className="error-icon">!</div>
        <h2>Connection failed</h2>
        <p>{message || 'Make sure your Spring Boot backend is running on localhost:8080'}</p>
        <button className="retry-btn" onClick={onRetry}>
          Retry
        </button>
      </div>
    </div>
  );
}
