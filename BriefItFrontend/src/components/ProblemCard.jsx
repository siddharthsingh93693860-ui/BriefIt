import { useNavigate } from "react-router-dom";

const STATUS_PROGRESS = {
  submitted: 10,
  under_review: 30,
  assigned: 50,
  in_progress: 75,
  solved: 100,
  rejected: 0,
};

function ProblemCard({ problem }) {
  const progress = STATUS_PROGRESS[problem.status] ?? 0;

  return (
    <div className="problem-card">
      <h3>{problem.title}</h3>
      <div className="meta">
        {problem.location?.district}
        {problem.category ? ` · ${problem.category}` : ""}
      </div>

      <span className={`status-badge status-${problem.status}`}>
        {problem.status.replace("_", " ")}
      </span>

      <div className="progress-bar-bg" style={{ marginTop: 10 }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export default ProblemCard;
