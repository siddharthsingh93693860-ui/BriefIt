import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";

function IndustrySolutions() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fundingId, setFundingId] = useState(null);
  const [selectedSolution, setSelectedSolution] = useState(null);

  const industryId = user?.industry;

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/solutions/industry");

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch approved solutions");
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

  const fundSolution = async (solutionId) => {
    if (!industryId) {
      setError("Industry account information is missing.");
      return;
    }

    try {
      setFundingId(solutionId);
      setError("");

      const res = await fetch(
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

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Unable to fund solution");
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

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="solutions-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .solutions-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 85% 5%,
              rgba(20,184,166,.13),
              transparent 30%
            ),
            radial-gradient(
              circle at 10% 70%,
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
          position: sticky;
          top: 0;
          z-index: 20;
          border-bottom: 1px solid #172235;
          background: rgba(5,11,20,.88);
          backdrop-filter: blur(18px);
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
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background:
            linear-gradient(
              135deg,
              #0d9488,
              #06b6d4
            );
          box-shadow:
            0 10px 30px rgba(20,184,166,.22);
        }

        .brand span {
          color: #2dd4bf;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .industry-label {
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .avatar {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background:
            linear-gradient(
              135deg,
              #0d9488,
              #2563eb
            );
          font-size: 13px;
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

        .main {
          padding: 58px 5% 80px;
        }

        .hero {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 40px;
        }

        .eyebrow {
          margin-bottom: 13px;
          color: #2dd4bf;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(40px,5vw,60px);
          line-height: 1;
          letter-spacing: -3px;
        }

        .hero h1 span {
          background:
            linear-gradient(
              90deg,
              #2dd4bf,
              #38bdf8
            );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero p {
          max-width: 650px;
          margin-top: 18px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .refresh-button {
          flex-shrink: 0;
          padding: 11px 16px;
          border: 1px solid #263449;
          border-radius: 10px;
          background: #0b1627;
          color: #94a3b8;
          cursor: pointer;
        }

        .refresh-button:hover {
          color: white;
          border-color: #475569;
        }

        .error {
          margin-bottom: 25px;
          padding: 13px 15px;
          border: 1px solid rgba(239,68,68,.2);
          border-radius: 10px;
          background: rgba(239,68,68,.08);
          color: #fca5a5;
          font-size: 12px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 15px;
          margin-bottom: 40px;
        }

        .stat {
          padding: 22px;
          border: 1px solid #1e293b;
          border-radius: 17px;
          background: rgba(15,23,42,.7);
        }

        .stat-label {
          color: #64748b;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-value {
          margin-top: 8px;
          font-size: 30px;
          font-weight: 800;
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

        .solution-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(330px,1fr)
            );
          gap: 18px;
        }

        .solution-card {
          padding: 24px;
          border: 1px solid #1e293b;
          border-radius: 20px;
          background:
            linear-gradient(
              145deg,
              rgba(15,23,42,.86),
              rgba(8,17,30,.86)
            );
          transition: .25s;
        }

        .solution-card:hover {
          transform: translateY(-4px);
          border-color: #334155;
          box-shadow:
            0 20px 50px rgba(0,0,0,.25);
        }

        .solution-label {
          color: #2dd4bf;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1.3px;
          text-transform: uppercase;
        }

        .solution-card h3 {
          margin: 8px 0 12px;
          font-size: 19px;
          line-height: 1.35;
        }

        .solution-description {
          color: #7d8ba0;
          font-size: 13px;
          line-height: 1.65;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .problem-box {
          margin-top: 20px;
          padding: 14px;
          border: 1px solid #1e293b;
          border-radius: 11px;
          background: #07111f;
        }

        .problem-label {
          color: #475569;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .problem-title {
          margin-top: 6px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
        }

        .category {
          display: inline-block;
          margin-top: 7px;
          padding: 4px 7px;
          border-radius: 6px;
          background: rgba(56,189,248,.07);
          color: #38bdf8;
          font-size: 9px;
          text-transform: uppercase;
        }

        .university {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 17px;
        }

        .university-avatar {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(45,212,191,.08);
          color: #2dd4bf;
          font-size: 12px;
          font-weight: 800;
        }

        .university-name {
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 600;
        }

        .university-domain {
          margin-top: 3px;
          color: #475569;
          font-size: 9px;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 20px;
          padding-top: 17px;
          border-top: 1px solid #1e293b;
        }

        .view-button {
          padding: 9px 12px;
          border: 1px solid #263449;
          border-radius: 8px;
          background: transparent;
          color: #94a3b8;
          font-size: 10px;
          cursor: pointer;
        }

        .view-button:hover {
          color: white;
          border-color: #475569;
        }

        .fund-button {
          padding: 10px 16px;
          border: none;
          border-radius: 9px;
          background:
            linear-gradient(
              135deg,
              #0d9488,
              #0891b2
            );
          color: white;
          font-size: 11px;
          font-weight: 750;
          cursor: pointer;
        }

        .fund-button:hover {
          transform: translateY(-1px);
        }

        .fund-button:disabled {
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }

        .empty {
          padding: 80px 20px;
          border: 1px dashed #263449;
          border-radius: 20px;
          text-align: center;
          color: #64748b;
        }

        .empty-icon {
          margin-bottom: 15px;
          color: #2dd4bf;
          font-size: 38px;
        }

        .empty h3 {
          margin: 0;
          color: #cbd5e1;
          font-size: 17px;
        }

        .empty p {
          font-size: 12px;
        }

        .loading {
          min-height: 350px;
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

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0,0,0,.72);
          backdrop-filter: blur(8px);
        }

        .modal {
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          border: 1px solid #263449;
          border-radius: 22px;
          background: #0b1627;
          box-shadow:
            0 30px 100px rgba(0,0,0,.55);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .modal-label {
          color: #2dd4bf;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .modal h2 {
          margin: 7px 0 12px;
          font-size: 27px;
          line-height: 1.2;
        }

        .modal-description {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
        }

        .close {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border: none;
          border-radius: 8px;
          background: #17243a;
          color: #94a3b8;
          cursor: pointer;
          font-size: 18px;
        }

        .modal-section {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #1e293b;
        }

        .modal-section-title {
          margin-bottom: 10px;
          color: #475569;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .attachment {
          display: block;
          margin-bottom: 7px;
          padding: 10px 12px;
          border-radius: 8px;
          background: #07111f;
          color: #38bdf8;
          font-size: 10px;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 25px;
        }

        .fund-modal-button {
          padding: 11px 18px;
          border: none;
          border-radius: 9px;
          background:
            linear-gradient(
              135deg,
              #0d9488,
              #0891b2
            );
          color: white;
          font-weight: 700;
          cursor: pointer;
        }

        .fund-modal-button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        @media(max-width:850px) {
          .hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .stats {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width:600px) {
          .navbar {
            padding: 0 20px;
          }

          .industry-label,
          .logout {
            display: none;
          }

          .main {
            padding: 45px 20px 60px;
          }

          .hero h1 {
            font-size: 43px;
          }

          .solution-grid {
            grid-template-columns: 1fr;
          }

          .modal {
            padding: 23px;
          }

          .card-footer {
            flex-direction: column;
            align-items: stretch;
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
          <div className="industry-label">Industry</div>

          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "I"}
          </div>

          <button className="logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="main">
        <section className="hero">
          <div>
            <div className="eyebrow">Industry Portal</div>

            <h1>
              Discover ideas.
              <br />
              <span>Fund impact.</span>
            </h1>

            <p>
              Explore citizen-approved solutions developed by universities for
              real-world community problems. Find ideas worth investing in and
              help turn them into reality.
            </p>
          </div>

          <button className="refresh-button" onClick={fetchSolutions}>
            ↻ &nbsp; Refresh
          </button>
        </section>

        {error && <div className="error">{error}</div>}

        <section className="stats">
          <div className="stat">
            <div className="stat-label">Available solutions</div>

            <div className="stat-value">{solutions.length}</div>
          </div>

          <div className="stat">
            <div className="stat-label">Universities contributing</div>

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
            <div className="stat-label">Approved opportunities</div>

            <div className="stat-value">{solutions.length}</div>
          </div>
        </section>

        <section>
          <div className="section-header">
            <h2>Citizen-approved solutions</h2>

            <p>
              These solutions have been approved by citizens and are now
              available for industry funding.
            </p>
          </div>

          {loading ? (
            <div className="loading">
              <div className="spinner" />
              Loading approved solutions...
            </div>
          ) : solutions.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">◇</div>

              <h3>No approved solutions available</h3>

              <p>Solutions will appear here after citizen approval.</p>
            </div>
          ) : (
            <div className="solution-grid">
              {solutions.map((solution) => (
                <div className="solution-card" key={solution._id}>
                  <div className="solution-top">
                    <div>
                      <div className="solution-label">
                        Citizen-approved proposal
                      </div>

                      <h3>{solution.title}</h3>
                    </div>
                  </div>

                  <p className="solution-description">{solution.description}</p>

                  {solution.problem && (
                    <div className="problem-box">
                      <div className="problem-label">Solving</div>

                      <div className="problem-title">
                        {solution.problem.title}
                      </div>

                      {solution.problem.category && (
                        <div className="category">
                          {solution.problem.category}
                        </div>
                      )}
                    </div>
                  )}

                  {solution.university && (
                    <div className="university">
                      <div className="university-avatar">
                        {solution.university.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div>
                        <div className="university-name">
                          {solution.university.name}
                        </div>

                        <div className="university-domain">
                          {solution.university.domain?.join(" · ")}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="card-footer">
                    <button
                      className="view-button"
                      onClick={() => setSelectedSolution(solution)}
                    >
                      View details
                    </button>

                    <button
                      className="fund-button"
                      disabled={fundingId === solution._id}
                      onClick={() => fundSolution(solution._id)}
                    >
                      {fundingId === solution._id
                        ? "Funding..."
                        : "Fund solution →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
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
                <div className="modal-label">Citizen-approved solution</div>

                <h2>{selectedSolution.title}</h2>

                <p className="modal-description">
                  {selectedSolution.description}
                </p>
              </div>

              <button
                className="close"
                onClick={() => setSelectedSolution(null)}
              >
                ×
              </button>
            </div>

            {selectedSolution.problem && (
              <div className="modal-section">
                <div className="modal-section-title">Community problem</div>

                <div
                  style={{
                    color: "#cbd5e1",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {selectedSolution.problem.title}
                </div>

                <div className="category">
                  {selectedSolution.problem.category}
                </div>

                <p className="modal-description">
                  {selectedSolution.problem.description}
                </p>
              </div>
            )}

            {selectedSolution.university && (
              <div className="modal-section">
                <div className="modal-section-title">University</div>

                <div
                  style={{
                    color: "#cbd5e1",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {selectedSolution.university.name}
                </div>
              </div>
            )}

            {selectedSolution.attachments?.length > 0 && (
              <div className="modal-section">
                <div className="modal-section-title">Attachments</div>

                {selectedSolution.attachments.map((attachment, index) => (
                  <a
                    key={index}
                    href={attachment}
                    target="_blank"
                    rel="noreferrer"
                    className="attachment"
                  >
                    📎 {attachment}
                  </a>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="view-button"
                onClick={() => setSelectedSolution(null)}
              >
                Close
              </button>

              <button
                className="fund-modal-button"
                disabled={fundingId === selectedSolution._id}
                onClick={() => fundSolution(selectedSolution._id)}
              >
                {fundingId === selectedSolution._id
                  ? "Funding..."
                  : "Fund solution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndustrySolutions;
