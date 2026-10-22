import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function SubmittedProblem() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solutionsLoading, setSolutionsLoading] = useState(false);
  const [error, setError] = useState("");
  const [approveError, setApproveError] = useState("");
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [approvingSolution, setApprovingSolution] = useState(null);

  const user = JSON.parse(
    localStorage.getItem("briefit_user") ||
      localStorage.getItem("user") ||
      "null",
  );

  const userId = user?._id || user?.id || user?.user?._id || user?.user?.id;

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError("");

      if (!userId) {
        setError("User information not found. Please login again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/problems?submittedBy=${userId}`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load submitted problems");
      }

      const userProblems = (data.problems || []).filter((problem) => {
        const submittedBy =
          typeof problem.submittedBy === "object"
            ? problem.submittedBy?._id
            : problem.submittedBy;

        return String(submittedBy) === String(userId);
      });

      setProblems(userProblems);
    } catch (err) {
      console.error("Problem error:", err);
      setError(err.message || "Unable to load problems");
    } finally {
      setLoading(false);
    }
  };

  const fetchSolutions = async () => {
    try {
      setSolutionsLoading(true);

      if (!userId) {
        console.error("User ID not found");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/solutions/citizen?userId=${userId}`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load solutions");
      }

      setSolutions(data.solutions || []);
    } catch (err) {
      console.error("Solutions error:", err);
    } finally {
      setSolutionsLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
    fetchSolutions();
  }, []);

  const getProblemSolutions = (problemId) => {
    return solutions.filter((solution) => {
      const solutionProblemId =
        typeof solution.problem === "object"
          ? solution.problem?._id
          : solution.problem;

      return String(solutionProblemId) === String(problemId);
    });
  };

  const approveSolution = async (solutionId, problemId) => {
    try {
      setApprovingSolution(solutionId);
      setApproveError("");

      if (!userId) {
        throw new Error("User ID not found. Please login again.");
      }

      const response = await fetch(
        `http://localhost:5000/api/solutions/${solutionId}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to approve solution");
      }

      // Update solution state
      setSolutions((previousSolutions) =>
        previousSolutions.map((solution) =>
          String(solution._id) === String(solutionId)
            ? {
                ...solution,
                ...(data.solution || {}),
                status: "approved",
              }
            : solution,
        ),
      );

      // Resolve problem ID if not passed directly
      const targetProblemId =
        problemId ||
        (typeof data.solution?.problem === "object"
          ? data.solution?.problem?._id
          : data.solution?.problem);

      // Update problem status internally to solved / approved
      if (targetProblemId) {
        setProblems((prevProblems) =>
          prevProblems.map((p) =>
            String(p._id) === String(targetProblemId)
              ? { ...p, status: "solved" }
              : p,
          ),
        );

        setSelectedProblem((prev) =>
          prev && String(prev._id) === String(targetProblemId)
            ? { ...prev, status: "solved" }
            : prev,
        );
      }
    } catch (err) {
      console.error("Approve solution error:", err);
      setApproveError(err.message || "Failed to approve solution");
    } finally {
      setApprovingSolution(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("briefit_user");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "solved":
        return "status-solved";

      case "assigned":
        return "status-assigned";

      case "in_progress":
        return "status-progress";

      case "rejected":
        return "status-rejected";

      default:
        return "status-submitted";
    }
  };

  return (
    <div className="citizen-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .citizen-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% 0%,
              rgba(37, 99, 235, 0.12),
              transparent 30%
            ),
            #050b14;
          color: white;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .navbar {
          height: 76px;
          padding: 0 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #172235;
          background: rgba(5, 11, 20, 0.9);
          backdrop-filter: blur(15px);
          position: sticky;
          top: 0;
          z-index: 20;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 22px;
          font-weight: 800;
        }

        .brand-icon {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: linear-gradient(
            135deg,
            #2563eb,
            #06b6d4
          );
        }

        .brand span {
          color: #38bdf8;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .user-name {
          color: #94a3b8;
          font-size: 13px;
        }

        .avatar {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            #2563eb,
            #14b8a6
          );
          font-weight: 800;
        }

        .logout {
          padding: 9px 14px;
          border: 1px solid #263449;
          border-radius: 9px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          font-weight: 700;
        }

        .logout:hover {
          color: white;
          border-color: #475569;
        }

        .hero {
          padding: 55px 5% 40px;
        }

        .eyebrow {
          color: #38bdf8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(36px, 5vw, 55px);
          letter-spacing: -3px;
          line-height: 1;
        }

        .hero h1 span {
          background: linear-gradient(
            90deg,
            #38bdf8,
            #2dd4bf
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero p {
          max-width: 650px;
          margin-top: 17px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }


        .solutions-page-button {
          margin-top: 22px;
          padding: 13px 20px;
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 10px;
          background: linear-gradient(
            135deg,
            rgba(37, 99, 235, 0.2),
            rgba(20, 184, 166, 0.12)
          );
          color: #38bdf8;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .solutions-page-button:hover {
          transform: translateY(-2px);
          border-color: #38bdf8;
          box-shadow: 0 8px 25px rgba(56, 189, 248, 0.12);
        }

        .content {
          padding: 0 5% 70px;
        }

        .section-header {
          margin-bottom: 22px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 24px;
          letter-spacing: -1px;
        }

        .section-header p {
          margin-top: 6px;
          color: #64748b;
          font-size: 12px;
        }

        .problem-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(320px, 1fr)
          );
          gap: 18px;
        }

        .problem-card {
          padding: 22px;
          border: 1px solid #1e293b;
          border-radius: 19px;
          background: linear-gradient(
            145deg,
            rgba(15, 23, 42, 0.85),
            rgba(8, 17, 30, 0.85)
          );
          cursor: pointer;
          transition: 0.2s;
        }

        .problem-card:hover {
          transform: translateY(-4px);
          border-color: #334155;
          box-shadow:
            0 20px 50px rgba(0, 0, 0, 0.25);
        }

        .problem-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .category {
          color: #38bdf8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .problem-card h3 {
          margin: 8px 0 10px;
          font-size: 18px;
          line-height: 1.35;
        }

        .description {
          color: #7d8ba0;
          font-size: 13px;
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .priority {
          padding: 6px 9px;
          border-radius: 100px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .priority-high {
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.1);
        }

        .priority-medium {
          color: #fcd34d;
          background: rgba(245, 158, 11, 0.1);
        }

        .priority-low {
          color: #6ee7b7;
          background: rgba(16, 185, 129, 0.1);
        }

        .location {
          margin-top: 17px;
          padding-top: 14px;
          border-top: 1px solid #1e293b;
          color: #64748b;
          font-size: 11px;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
        }

        .date {
          color: #475569;
          font-size: 10px;
        }

        .status {
          padding: 6px 9px;
          border-radius: 100px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .status-submitted {
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.08);
        }

        .status-assigned {
          color: #c4b5fd;
          background: rgba(139, 92, 246, 0.1);
        }

        .status-progress {
          color: #fcd34d;
          background: rgba(245, 158, 11, 0.1);
        }

        .status-solved {
          color: #6ee7b7;
          background: rgba(16, 185, 129, 0.1);
        }

        .status-rejected {
          color: #fca5a5;
          background: rgba(239, 68, 68, 0.1);
        }

        .solution-count {
          margin-top: 15px;
          padding: 10px 12px;
          border: 1px solid rgba(45, 212, 191, 0.18);
          border-radius: 10px;
          background: rgba(45, 212, 191, 0.06);
          color: #5eead4;
          font-size: 11px;
          font-weight: 700;
        }

        .card-solutions {
          margin-top: 18px;
          padding-top: 16px;
          border-top: 1px solid #1e293b;
        }

        .card-solution-title {
          margin-bottom: 10px;
          color: #5eead4;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.7px;
        }

        .card-solution {
          padding: 14px;
          border: 1px solid #263449;
          border-radius: 12px;
          background: #07111f;
        }

        .card-solution + .card-solution {
          margin-top: 10px;
        }

        .card-solution-name {
          color: #f1f5f9;
          font-size: 14px;
          font-weight: 800;
        }

        .card-solution-description {
          margin-top: 7px;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.6;
        }

        .card-solution-university {
          margin-top: 9px;
          color: #38bdf8;
          font-size: 10px;
          font-weight: 700;
        }

        .card-solution-fund {
          margin-top: 10px;
          color: #6ee7b7;
          font-size: 11px;
          font-weight: 800;
        }

        .card-solution-attachments {
          margin-top: 10px;
        }

        .card-solution-attachments a {
          display: block;
          margin-top: 5px;
          color: #38bdf8;
          font-size: 10px;
          text-decoration: none;
        }

        .card-approve-button {
          width: 100%;
          margin-top: 13px;
          padding: 10px;
          border: none;
          border-radius: 8px;
          background: linear-gradient(
            135deg,
            #059669,
            #0d9488
          );
          color: white;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .card-approve-button:hover {
          opacity: 0.9;
        }

        .card-approve-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .card-approved {
          margin-top: 12px;
          padding: 9px;
          border-radius: 8px;
          background: rgba(16, 185, 129, 0.1);
          color: #6ee7b7;
          font-size: 10px;
          font-weight: 800;
          text-align: center;
        }

        .loading {
          min-height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .spinner {
          width: 28px;
          height: 28px;
          margin-right: 12px;
          border: 2px solid #1e293b;
          border-top-color: #38bdf8;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error {
          padding: 14px;
          margin-bottom: 20px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.08);
          color: #fca5a5;
          font-size: 12px;
        }

        .empty {
          padding: 70px 20px;
          text-align: center;
          border: 1px dashed #263449;
          border-radius: 18px;
          color: #64748b;
        }

        .empty-icon {
          font-size: 35px;
          margin-bottom: 10px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
        }

        .modal {
          width: 100%;
          max-width: 720px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          border: 1px solid #263449;
          border-radius: 23px;
          background: #0b1627;
          box-shadow:
            0 30px 100px rgba(0, 0, 0, 0.55);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .modal-category {
          color: #38bdf8;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .modal h2 {
          margin: 8px 0;
          font-size: 27px;
          line-height: 1.2;
        }

        .modal-description {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
        }

        .close {
          flex-shrink: 0;
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 8px;
          background: #17243a;
          color: #94a3b8;
          cursor: pointer;
          font-size: 18px;
        }

        .close:hover {
          color: white;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .info-box {
          padding: 14px;
          border: 1px solid #1e293b;
          border-radius: 11px;
          background: #07111f;
        }

        .info-label {
          color: #475569;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .info-value {
          margin-top: 6px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .tag {
          padding: 5px 8px;
          border: 1px solid rgba(56, 189, 248, 0.1);
          border-radius: 7px;
          background: rgba(56, 189, 248, 0.06);
          color: #7dd3fc;
          font-size: 10px;
        }

        .duplicate {
          padding: 10px 12px;
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.06);
          color: #fca5a5;
          font-size: 10px;
        }

        .media-section {
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid #1e293b;
        }

        .media-section h4 {
          margin: 0 0 12px;
          color: #94a3b8;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .media-link {
          display: block;
          padding: 10px 12px;
          margin-bottom: 7px;
          border-radius: 8px;
          background: #07111f;
          color: #38bdf8;
          font-size: 11px;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .solution-section {
          margin-top: 25px;
          padding-top: 22px;
          border-top: 1px solid #1e293b;
        }

        .solution-heading {
          margin-bottom: 15px;
        }

        .solution-heading h3 {
          margin: 0;
          font-size: 17px;
        }

        .solution-card {
          padding: 19px;
          margin-bottom: 14px;
          border: 1px solid #263449;
          border-radius: 15px;
          background: #07111f;
        }

        .solution-card h4 {
          margin: 0 0 10px;
          font-size: 17px;
        }

        .solution-description {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
        }

        .university-name {
          margin-top: 13px;
          color: #38bdf8;
          font-size: 11px;
          font-weight: 700;
        }

        .solution-fund {
          margin-top: 12px;
          color: #6ee7b7;
          font-size: 12px;
          font-weight: 700;
        }

        .solution-attachments {
          margin-top: 15px;
        }

        .solution-attachments a {
          display: block;
          padding: 9px 11px;
          margin-top: 6px;
          border-radius: 8px;
          background: #0b1627;
          color: #38bdf8;
          font-size: 11px;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .approve-button {
          width: 100%;
          min-height: 44px;
          margin-top: 16px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(
            135deg,
            #059669,
            #0d9488
          );
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .approve-button:hover {
          transform: translateY(-1px);
        }

        .approve-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        .approved-badge {
          display: block;
          width: 100%;
          margin-top: 16px;
          padding: 11px;
          border-radius: 9px;
          background: rgba(16, 185, 129, 0.1);
          color: #6ee7b7;
          font-size: 11px;
          font-weight: 800;
          text-align: center;
          text-transform: uppercase;
        }

        .approve-error {
          margin-top: 10px;
          padding: 10px;
          border-radius: 8px;
          background: rgba(239, 68, 68, 0.08);
          color: #fca5a5;
          font-size: 11px;
        }

        .no-solution {
          padding: 18px;
          border: 1px dashed #263449;
          border-radius: 12px;
          color: #64748b;
          font-size: 12px;
          text-align: center;
        }

        @media (max-width: 700px) {
          .navbar {
            padding: 0 20px;
          }

          .hero,
          .content {
            padding-left: 20px;
            padding-right: 20px;
          }

          .user-name,
          .logout {
            display: none;
          }

          .problem-grid {
            grid-template-columns: 1fr;
          }

          .modal {
            padding: 22px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">✦</div>
          <div>
            Brief<span>It</span>
          </div>
        </div>

        <div className="nav-right">
          <div className="user-name">{user?.name || "Citizen"}</div>
          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <button className="logout" onClick={logout}>
            LOGOUT
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow">Citizen Dashboard</div>
        <h1>
          Your reported
          <br />
          <span>problems.</span>
        </h1>
        <p>
          Track the problems you have reported, see their current status, and
          review solutions proposed by universities.
        </p>

        <button
          className="solutions-page-button"
          onClick={() => navigate("/user/solutions")}
        >
          🎓 University Solutions
        </button>
      </section>

      <main className="content">
        <div className="section-header">
          <h2>My Submitted Problems</h2>
          <p>Problems reported by your account</p>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Loading your problems...
          </div>
        ) : problems.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">◇</div>
            <h3>No problems submitted yet</h3>
            <p>Problems you report will appear here.</p>
          </div>
        ) : (
          <div className="problem-grid">
            {problems.map((problem) => {
              const problemSolutions = getProblemSolutions(problem._id);

              return (
                <div
                  className="problem-card"
                  key={problem._id}
                  onClick={() => setSelectedProblem(problem)}
                >
                  <div className="problem-top">
                    <div>
                      <div className="category">
                        {problem.category || "General"}
                      </div>
                      <h3>{problem.title}</h3>
                    </div>

                    <div
                      className={`priority ${
                        problem.priority === "high"
                          ? "priority-high"
                          : problem.priority === "low"
                            ? "priority-low"
                            : "priority-medium"
                      }`}
                    >
                      {problem.priority || "medium"}
                    </div>
                  </div>

                  <p className="description">{problem.description}</p>

                  {problem.location && (
                    <div className="location">
                      📍 {problem.location.district || "Unknown"}
                      {problem.location.block
                        ? ` · ${problem.location.block}`
                        : ""}
                    </div>
                  )}

                  {problemSolutions.length > 0 && (
                    <div className="card-solutions">
                      <div className="card-solution-title">
                        🎓 University Solution
                      </div>

                      {problemSolutions.map((solution) => {
                        const approved =
                          String(solution.status || "").toLowerCase() ===
                          "approved";

                        return (
                          <div
                            className="card-solution"
                            key={solution._id}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="card-solution-name">
                              {solution.title}
                            </div>

                            <div className="card-solution-description">
                              {solution.description}
                            </div>

                            {solution.university && (
                              <div className="card-solution-university">
                                🏫 Proposed by{" "}
                                {solution.university.name || "University"}
                              </div>
                            )}

                            {solution.fund !== undefined &&
                              solution.fund !== null && (
                                <div className="card-solution-fund">
                                  💰 Fund Required: ₹
                                  {Number(solution.fund).toLocaleString(
                                    "en-IN",
                                  )}
                                </div>
                              )}

                            {solution.attachments?.length > 0 && (
                              <div className="card-solution-attachments">
                                {solution.attachments.map(
                                  (attachment, index) => (
                                    <a
                                      key={index}
                                      href={attachment}
                                      target="_blank"
                                      rel="noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      ↗ Attachment {index + 1}
                                    </a>
                                  ),
                                )}
                              </div>
                            )}

                            {approved ? (
                              <div className="card-approved">
                                ✓ Approved by Citizen
                              </div>
                            ) : (
                              <button
                                className="card-approve-button"
                                disabled={approvingSolution === solution._id}
                                onClick={() =>
                                  approveSolution(solution._id, problem._id)
                                }
                              >
                                {approvingSolution === solution._id
                                  ? "Approving..."
                                  : "✓ Approve Solution"}
                              </button>
                            )}

                            {approveError && (
                              <div className="approve-error">
                                {approveError}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {problemSolutions.length === 0 && !solutionsLoading && (
                    <div className="solution-count">
                      No solution proposed yet
                    </div>
                  )}

                  <div className="card-footer">
                    <div className="date">
                      {problem.createdAt
                        ? new Date(problem.createdAt).toLocaleDateString(
                            "en-IN",
                          )
                        : ""}
                    </div>

                    <div className={`status ${getStatusClass(problem.status)}`}>
                      {problem.status
                        ? problem.status.replace("_", " ")
                        : "submitted"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedProblem && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedProblem(null);
              setApproveError("");
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="modal-category">
                  {selectedProblem.category || "General"}
                </div>
                <h2>{selectedProblem.title}</h2>
                <p className="modal-description">
                  {selectedProblem.description}
                </p>
              </div>

              <button
                className="close"
                onClick={() => {
                  setSelectedProblem(null);
                  setApproveError("");
                }}
              >
                ×
              </button>
            </div>

            <div className="info-grid">
              <div className="info-box">
                <div className="info-label">Status</div>
                <div className="info-value">
                  {selectedProblem.status
                    ? selectedProblem.status.replace("_", " ")
                    : "—"}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">Priority</div>
                <div className="info-value">
                  {selectedProblem.priority || "—"}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">Category</div>
                <div className="info-value">
                  {selectedProblem.category || "—"}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">AI Rank</div>
                <div className="info-value">{selectedProblem.rank ?? "—"}</div>
              </div>

              <div className="info-box">
                <div className="info-label">District</div>
                <div className="info-value">
                  {selectedProblem.location?.district || "—"}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">Block</div>
                <div className="info-value">
                  {selectedProblem.location?.block || "—"}
                </div>
              </div>
            </div>

            {selectedProblem.aiTags?.length > 0 && (
              <div
                className="tags"
                style={{
                  marginTop: "20px",
                }}
              >
                {selectedProblem.aiTags.map((tag, index) => (
                  <span className="tag" key={index}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {selectedProblem.isDuplicate && (
              <div
                className="duplicate"
                style={{
                  marginTop: "20px",
                }}
              >
                ⚠ This problem was identified as a duplicate by the AI system.
              </div>
            )}

            {selectedProblem.media?.length > 0 && (
              <div className="media-section">
                <h4>ATTACHMENTS</h4>
                {selectedProblem.media.map((media, index) => (
                  <a
                    className="media-link"
                    key={index}
                    href={media.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ↗ {media.url}
                  </a>
                ))}
              </div>
            )}

            {selectedProblem.createdAt && (
              <div
                style={{
                  marginTop: "20px",
                  color: "#475569",
                  fontSize: "11px",
                }}
              >
                Submitted on{" "}
                {new Date(selectedProblem.createdAt).toLocaleString("en-IN")}
              </div>
            )}

            <div className="solution-section">
              <div className="solution-heading">
                <h3>🎓 University Solutions</h3>
              </div>

              {solutionsLoading ? (
                <div className="no-solution">Loading solutions...</div>
              ) : getProblemSolutions(selectedProblem._id).length === 0 ? (
                <div className="no-solution">
                  No university solution has been proposed yet.
                </div>
              ) : (
                getProblemSolutions(selectedProblem._id).map((solution) => {
                  const approved =
                    String(solution.status || "").toLowerCase() === "approved";

                  return (
                    <div className="solution-card" key={solution._id}>
                      <h4>{solution.title}</h4>

                      <div className="solution-description">
                        {solution.description}
                      </div>

                      {solution.university && (
                        <div className="university-name">
                          🏫 Proposed by{" "}
                          {solution.university.name || "University"}
                        </div>
                      )}

                      {solution.fund !== undefined &&
                        solution.fund !== null && (
                          <div className="solution-fund">
                            💰 Funding Required: ₹
                            {Number(solution.fund).toLocaleString("en-IN")}
                          </div>
                        )}

                      {solution.attachments?.length > 0 && (
                        <div className="solution-attachments">
                          <div className="info-label">ATTACHMENTS</div>
                          {solution.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment}
                              target="_blank"
                              rel="noreferrer"
                            >
                              ↗ Attachment {index + 1}
                            </a>
                          ))}
                        </div>
                      )}

                      {approved ? (
                        <div className="approved-badge">
                          ✓ Approved by Citizen
                        </div>
                      ) : (
                        <button
                          className="approve-button"
                          disabled={approvingSolution === solution._id}
                          onClick={() =>
                            approveSolution(solution._id, selectedProblem._id)
                          }
                        >
                          {approvingSolution === solution._id
                            ? "Approving..."
                            : "✓ Approve Solution"}
                        </button>
                      )}

                      {approveError && (
                        <div className="approve-error">{approveError}</div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubmittedProblem;
