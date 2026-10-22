import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IndustryDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("briefit_user"));
  const industryId = user?.industry;

  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [fundingId, setFundingId] = useState(null);

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/solutions/industry",
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to fetch approved solutions");
      }

      setSolutions(data.solutions || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  const handleFundSolution = async (solutionId) => {
    if (!industryId) {
      setError("Industry information not found. Please login again.");
      return;
    }

    try {
      setFundingId(solutionId);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/solutions/${solutionId}/fund`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            industryId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fund solution");
      }

      setSolutions((prev) =>
        prev.filter((solution) => solution._id !== solutionId),
      );

      setSelectedSolution(null);

      alert("Solution funded successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setFundingId(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("briefit_user");
    navigate("/");
  };

  const getPriorityClass = (priority) => {
    if (priority === "high") return "high";
    if (priority === "low") return "low";
    return "medium";
  };

  const getCategoryIcon = (category) => {
    if (category === "water") return "💧";
    if (category === "environment") return "🌱";
    if (category === "education") return "📚";
    if (category === "health") return "🏥";
    if (category === "transport") return "🚦";
    if (category === "sanitation") return "🚰";
    if (category === "public_administration") return "🏛️";

    return "◈";
  };

  return (
    <div className="industry-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .industry-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% 5%,
              rgba(20,184,166,.12),
              transparent 30%
            ),
            radial-gradient(
              circle at 15% 20%,
              rgba(37,99,235,.08),
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
          background: rgba(5,11,20,.86);
          backdrop-filter: blur(16px);
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
          letter-spacing: -1px;
        }

        .brand-icon {
          width: 37px;
          height: 37px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: linear-gradient(
            135deg,
            #14b8a6,
            #2563eb
          );
          box-shadow:
            0 8px 25px rgba(20,184,166,.22);
        }

        .brand span {
          color: #2dd4bf;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .industry-name {
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
            #14b8a6,
            #2563eb
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
        }

        .logout:hover {
          color: white;
          border-color: #475569;
        }

        .hero {
          padding: 65px 5% 45px;
          background:
            radial-gradient(
              circle at 75% 25%,
              rgba(20,184,166,.13),
              transparent 35%
            );
        }

        .eyebrow {
          color: #2dd4bf;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 14px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(40px,5vw,64px);
          line-height: 1;
          letter-spacing: -3px;
        }

        .hero h1 span {
          background: linear-gradient(
            90deg,
            #2dd4bf,
            #38bdf8
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero p {
          max-width: 670px;
          margin-top: 18px;
          color: #64748b;
          font-size: 16px;
          line-height: 1.7;
        }

        .stats {
          padding: 0 5% 45px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .stat {
          padding: 22px;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 17px;
          background: rgba(15,23,42,.7);
        }

        .stat-label {
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-value {
          margin-top: 8px;
          font-size: 30px;
          font-weight: 800;
        }

        .content {
          padding: 0 5% 70px;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 23px;
        }

        .section-header h2 {
          margin: 0;
          font-size: 25px;
          letter-spacing: -1px;
        }

        .section-header p {
          margin-top: 6px;
          color: #64748b;
          font-size: 13px;
        }

        .refresh-btn {
          padding: 10px 14px;
          border: 1px solid #263449;
          border-radius: 9px;
          background: #0b1627;
          color: #94a3b8;
          cursor: pointer;
          font-size: 11px;
        }

        .refresh-btn:hover {
          color: white;
          border-color: #475569;
        }

        .solution-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(340px, 1fr)
            );
          gap: 18px;
        }

        .solution-card {
          padding: 23px;
          border: 1px solid #1e293b;
          border-radius: 20px;
          background:
            linear-gradient(
              145deg,
              rgba(15,23,42,.88),
              rgba(8,17,30,.88)
            );
          transition:
            transform .25s,
            border-color .25s,
            box-shadow .25s;
        }

        .solution-card:hover {
          transform: translateY(-4px);
          border-color: #334155;
          box-shadow:
            0 20px 50px rgba(0,0,0,.25);
        }

        .problem-label,
        .solution-label {
          color: #64748b;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .problem-title {
          margin: 7px 0 10px;
          font-size: 19px;
          line-height: 1.35;
        }

        .category-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 14px;
        }

        .category {
          color: #2dd4bf;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .priority {
          padding: 5px 8px;
          border-radius: 100px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .priority.high {
          color: #fca5a5;
          background: rgba(239,68,68,.1);
        }

        .priority.medium {
          color: #fcd34d;
          background: rgba(245,158,11,.1);
        }

        .priority.low {
          color: #6ee7b7;
          background: rgba(16,185,129,.1);
        }

        .problem-description {
          color: #7d8ba0;
          font-size: 12px;
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .location {
          margin-top: 15px;
          color: #64748b;
          font-size: 11px;
        }

        .university-box {
          margin-top: 18px;
          padding: 12px;
          border: 1px solid rgba(45,212,191,.1);
          border-radius: 11px;
          background: rgba(45,212,191,.035);
        }

        .university-label {
          color: #475569;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .university-name-card {
          margin-top: 5px;
          color: #99f6e4;
          font-size: 13px;
          font-weight: 700;
        }

        .solution-divider {
          margin: 19px 0;
          border: none;
          border-top: 1px solid #1e293b;
        }

        .solution-title {
          margin-top: 7px;
          color: #e2e8f0;
          font-size: 16px;
          font-weight: 700;
          line-height: 1.4;
        }

        .solution-description {
          margin-top: 8px;
          color: #7d8ba0;
          font-size: 12px;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .attachment-preview {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 11px;
          border: 1px solid #1e293b;
          border-radius: 9px;
          background: #07111f;
          color: #38bdf8;
          text-decoration: none;
          font-size: 10px;
          overflow: hidden;
        }

        .attachment-preview:hover {
          border-color: #2563eb;
          background: #0b1627;
        }

        .attachment-preview-name {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        .attachment-count {
          margin-top: 7px;
          color: #475569;
          font-size: 9px;
        }

        .card-actions {
          display: flex;
          gap: 9px;
          margin-top: 18px;
        }

        .details-btn,
        .fund-btn {
          flex: 1;
          min-height: 42px;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .details-btn {
          border: 1px solid #263449;
          background: #0b1627;
          color: #94a3b8;
        }

        .details-btn:hover {
          color: white;
          border-color: #475569;
        }

        .fund-btn {
          border: none;
          background:
            linear-gradient(
              135deg,
              #14b8a6,
              #0891b2
            );
          color: white;
          box-shadow:
            0 8px 25px rgba(20,184,166,.14);
        }

        .fund-btn:hover {
          transform: translateY(-1px);
        }

        .fund-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .error {
          margin-bottom: 20px;
          padding: 13px 15px;
          border: 1px solid rgba(239,68,68,.2);
          border-radius: 11px;
          background: rgba(239,68,68,.08);
          color: #fca5a5;
          font-size: 13px;
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
          border-top-color: #2dd4bf;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty {
          padding: 70px 20px;
          text-align: center;
          border: 1px dashed #263449;
          border-radius: 18px;
          color: #64748b;
        }

        .empty-icon {
          font-size: 38px;
          margin-bottom: 12px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0,0,0,.78);
          backdrop-filter: blur(9px);
        }

        .modal {
          width: 100%;
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          border: 1px solid #263449;
          border-radius: 23px;
          background:
            linear-gradient(
              145deg,
              #0d1728,
              #07111f
            );
          box-shadow:
            0 30px 100px rgba(0,0,0,.6);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .modal h2 {
          margin: 5px 0 8px;
          font-size: 26px;
          line-height: 1.25;
        }

        .modal-category {
          color: #2dd4bf;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
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

        .section-box {
          margin-top: 18px;
          padding: 17px;
          border: 1px solid #1e293b;
          border-radius: 13px;
          background: rgba(7,17,31,.7);
        }

        .section-box-title {
          margin-bottom: 10px;
          color: #64748b;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .section-box h3 {
          margin: 0 0 8px;
          color: #e2e8f0;
          font-size: 17px;
          line-height: 1.4;
        }

        .section-box p {
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.7;
          white-space: pre-line;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 18px;
        }

        .info-box {
          padding: 13px;
          border: 1px solid #1e293b;
          border-radius: 10px;
          background: #07111f;
        }

        .info-label {
          color: #475569;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .info-value {
          margin-top: 5px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 13px;
        }

        .tag {
          padding: 5px 8px;
          border: 1px solid rgba(56,189,248,.1);
          border-radius: 7px;
          background: rgba(56,189,248,.06);
          color: #7dd3fc;
          font-size: 9px;
        }

        .attachments {
          margin-top: 18px;
          padding-top: 18px;
          border-top: 1px solid #1e293b;
        }

        .attachments-title {
          margin-bottom: 10px;
          color: #64748b;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .attachment-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .attachment {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 13px;
          border: 1px solid #1e293b;
          border-radius: 9px;
          background: #07111f;
          color: #38bdf8;
          text-decoration: none;
          font-size: 11px;
        }

        .attachment:hover {
          border-color: #2563eb;
          background: #0b1627;
        }

        .attachment-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .fund-modal {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #1e293b;
          display: flex;
          gap: 10px;
        }

        .fund-modal-btn {
          flex: 1;
          height: 46px;
          border: none;
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              #14b8a6,
              #0891b2
            );
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .fund-modal-btn:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .cancel-btn {
          height: 46px;
          padding: 0 18px;
          border: 1px solid #263449;
          border-radius: 10px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
        }

        @media(max-width:900px) {
          .stats {
            grid-template-columns: repeat(2,1fr);
          }
        }

        @media(max-width:650px) {
          .navbar {
            padding: 0 20px;
          }

          .industry-name,
          .logout {
            display: none;
          }

          .hero {
            padding: 45px 20px 35px;
          }

          .content,
          .stats {
            padding-left: 20px;
            padding-right: 20px;
          }

          .hero h1 {
            font-size: 43px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .solution-grid {
            grid-template-columns: 1fr;
          }

          .modal {
            padding: 22px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .card-actions {
            flex-direction: column;
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
          <div className="industry-name">{user?.name || "Industry"}</div>

          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "I"}
          </div>

          <button className="logout" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow">Industry Workspace</div>

        <h1>
          Fund ideas.
          <br />
          Create <span>impact.</span>
        </h1>

        <p>
          Discover citizen-approved solutions proposed by universities for
          real-world community problems. Review the problem, evaluate the
          solution and fund the ideas that can create meaningful impact.
        </p>
      </section>

      <section className="stats">
        <div className="stat">
          <div className="stat-label">Approved Solutions</div>
          <div className="stat-value">{solutions.length}</div>
        </div>

        <div className="stat">
          <div className="stat-label">Universities</div>

          <div className="stat-value">
            {
              new Set(
                solutions
                  .map((solution) => solution.university?._id)
                  .filter(Boolean),
              ).size
            }
          </div>
        </div>

        <div className="stat">
          <div className="stat-label">Problems</div>

          <div className="stat-value">
            {
              new Set(
                solutions
                  .map((solution) => solution.problem?._id)
                  .filter(Boolean),
              ).size
            }
          </div>
        </div>

        <div className="stat">
          <div className="stat-label">Your Industry</div>

          <div className="stat-value">✓</div>
        </div>
      </section>

      <main className="content">
        <div className="section-header">
          <div>
            <h2>Citizen-approved solutions</h2>

            <p>
              Review solutions approved by citizens before making a funding
              decision.
            </p>
          </div>

          <button className="refresh-btn" onClick={fetchSolutions}>
            ↻ Refresh
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Loading approved solutions...
          </div>
        ) : solutions.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">◇</div>

            <h3>No approved solutions available</h3>

            <p>Citizen-approved university solutions will appear here.</p>
          </div>
        ) : (
          <div className="solution-grid">
            {solutions.map((solution) => {
              const problem = solution.problem;
              const university = solution.university;
              const attachments = solution.attachments || [];
              const priority = problem?.priority || "medium";

              return (
                <div className="solution-card" key={solution._id}>
                  <div className="problem-label">COMMUNITY PROBLEM</div>

                  <div className="category-row">
                    <div
                      style={{
                        fontSize: 18,
                        marginTop: 7,
                      }}
                    >
                      {getCategoryIcon(problem?.category)}
                    </div>

                    <div className="category">
                      {problem?.category || "General"}
                    </div>

                    <div className={`priority ${getPriorityClass(priority)}`}>
                      {priority}
                    </div>
                  </div>

                  <div className="problem-title">
                    {problem?.title || "Community problem"}
                  </div>

                  <div className="problem-description">
                    {problem?.description ||
                      "No problem description available."}
                  </div>

                  {problem?.location && (
                    <div className="location">
                      📍 {problem.location.district || ""}
                      {problem.location.block
                        ? ` · ${problem.location.block}`
                        : ""}
                    </div>
                  )}

                  {university && (
                    <div className="university-box">
                      <div className="university-label">UNIVERSITY</div>

                      <div className="university-name-card">
                        {university.name}
                      </div>
                    </div>
                  )}

                  <hr className="solution-divider" />

                  <div className="solution-label">UNIVERSITY SOLUTION</div>

                  <div className="solution-title">{solution.title}</div>

                  <div className="solution-description">
                    {solution.description}
                  </div>

                  {attachments.length > 0 && (
                    <>
                      <a
                        href={attachments[0]}
                        target="_blank"
                        rel="noreferrer"
                        className="attachment-preview"
                      >
                        📎
                        <span className="attachment-preview-name">
                          {attachments[0]}
                        </span>
                      </a>

                      {attachments.length > 1 && (
                        <div className="attachment-count">
                          + {attachments.length - 1} more attachment(s)
                        </div>
                      )}
                    </>
                  )}

                  <div className="card-actions">
                    <button
                      className="details-btn"
                      onClick={() => setSelectedSolution(solution)}
                    >
                      View details
                    </button>

                    <button
                      className="fund-btn"
                      disabled={fundingId === solution._id}
                      onClick={() => handleFundSolution(solution._id)}
                    >
                      {fundingId === solution._id
                        ? "Funding..."
                        : "Fund solution →"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {selectedSolution && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedSolution(null);
            }
          }}
        >
          <div className="modal">
            <div className="modal-header">
              <div>
                <div className="modal-category">Approved solution</div>

                <h2>{selectedSolution.title}</h2>
              </div>

              <button
                className="close"
                onClick={() => setSelectedSolution(null)}
              >
                ×
              </button>
            </div>

            <div className="section-box">
              <div className="section-box-title">Solution</div>

              <h3>{selectedSolution.title}</h3>

              <p>{selectedSolution.description}</p>
            </div>

            {selectedSolution.problem && (
              <div className="section-box">
                <div className="section-box-title">Community Problem</div>

                <h3>{selectedSolution.problem.title}</h3>

                <p>{selectedSolution.problem.description}</p>

                <div className="info-grid">
                  <div className="info-box">
                    <div className="info-label">Category</div>

                    <div className="info-value">
                      {selectedSolution.problem.category || "General"}
                    </div>
                  </div>

                  <div className="info-box">
                    <div className="info-label">Priority</div>

                    <div className="info-value">
                      {selectedSolution.problem.priority || "Medium"}
                    </div>
                  </div>

                  <div className="info-box">
                    <div className="info-label">District</div>

                    <div className="info-value">
                      {selectedSolution.problem.location?.district || "N/A"}
                    </div>
                  </div>

                  <div className="info-box">
                    <div className="info-label">Block</div>

                    <div className="info-value">
                      {selectedSolution.problem.location?.block || "N/A"}
                    </div>
                  </div>
                </div>

                {selectedSolution.problem.aiTags?.length > 0 && (
                  <div className="tags">
                    {selectedSolution.problem.aiTags.map((tag, index) => (
                      <div className="tag" key={index}>
                        {tag}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedSolution.university && (
              <div className="section-box">
                <div className="section-box-title">University</div>

                <h3>{selectedSolution.university.name}</h3>

                {selectedSolution.university.domain?.length > 0 && (
                  <p>{selectedSolution.university.domain.join(" · ")}</p>
                )}
              </div>
            )}

            {selectedSolution.attachments?.length > 0 && (
              <div className="attachments">
                <div className="attachments-title">Attachments</div>

                <div className="attachment-list">
                  {selectedSolution.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noreferrer"
                      className="attachment"
                    >
                      📎
                      <span className="attachment-name">{attachment}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="fund-modal">
              <button
                className="cancel-btn"
                onClick={() => setSelectedSolution(null)}
              >
                Close
              </button>

              <button
                className="fund-modal-btn"
                disabled={fundingId === selectedSolution._id}
                onClick={() => handleFundSolution(selectedSolution._id)}
              >
                {fundingId === selectedSolution._id
                  ? "Funding..."
                  : "Fund this solution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
