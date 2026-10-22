import { useEffect, useState } from "react";

function UserSolution() {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(null);

  const user = JSON.parse(
    localStorage.getItem("briefit_user") ||
      localStorage.getItem("user") ||
      "null",
  );

  const userId = user?._id || user?.id || user?.user?._id || user?.user?.id;

  const fetchSolutions = async () => {
    try {
      setLoading(true);
      setError("");

      if (!userId) {
        setError("User not found. Please login again.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/solutions/citizen?userId=${userId}`,
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch solutions");
      }

      // Filter only solutions proposed by universities
      const universitySolutions = (data.solutions || []).filter((sol) =>
        Boolean(sol.university),
      );

      setSolutions(universitySolutions);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load solutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  const approveSolution = async (solutionId) => {
    try {
      setApproving(solutionId);
      setError("");

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

      setSolutions((previous) =>
        previous.map((solution) =>
          String(solution._id) === String(solutionId)
            ? {
                ...solution,
                status: "approved",
              }
            : solution,
        ),
      );
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to approve solution");
    } finally {
      setApproving(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("briefit_user");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className="solution-page">
      <style>{`
        * { box-sizing: border-box; }
        .solution-page {
          min-height: 100vh;
          background: radial-gradient(circle at 80% 0%, rgba(37, 99, 235, 0.12), transparent 30%), #050b14;
          color: white;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .navbar {
          height: 76px;
          padding: 0 5%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #172235;
          background: rgba(5, 11, 20, 0.92);
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
          background: linear-gradient(135deg, #2563eb, #06b6d4);
        }
        .brand span { color: #38bdf8; }
        .nav-right { display: flex; align-items: center; gap: 14px; }
        .user-name { color: #94a3b8; font-size: 13px; }
        .avatar {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #14b8a6);
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
        .logout:hover { color: white; border-color: #475569; }
        .hero { padding: 55px 5% 35px; }
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
          font-size: clamp(35px, 5vw, 52px);
          letter-spacing: -3px;
          line-height: 1;
        }
        .hero h1 span {
          background: linear-gradient(90deg, #38bdf8, #2dd4bf);
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
        .content { padding: 0 5% 70px; }
        .section-header { margin-bottom: 22px; }
        .section-header h2 { margin: 0; font-size: 24px; letter-spacing: -1px; }
        .section-header p { margin-top: 6px; color: #64748b; font-size: 12px; }
        .solution-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .solution-card {
          padding: 22px;
          border: 1px solid #1e293b;
          border-radius: 19px;
          background: linear-gradient(145deg, rgba(15, 23, 42, 0.9), rgba(8, 17, 30, 0.9));
          transition: 0.2s;
        }
        .solution-card:hover {
          transform: translateY(-3px);
          border-color: #334155;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.25);
        }
        .solution-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }
        .solution-label {
          color: #5eead4;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .solution-card h3 { margin: 8px 0 12px; font-size: 19px; line-height: 1.35; }
        .status {
          padding: 7px 10px;
          border-radius: 100px;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .status-approved { color: #6ee7b7; background: rgba(16, 185, 129, 0.1); }
        .status-proposed { color: #38bdf8; background: rgba(56, 189, 248, 0.08); }
        .status-funded { color: #fcd34d; background: rgba(245, 158, 11, 0.1); }
        .status-other { color: #c4b5fd; background: rgba(139, 92, 246, 0.1); }
        .description { color: #94a3b8; font-size: 13px; line-height: 1.7; }
        .problem-box {
          margin-top: 18px;
          padding: 13px;
          border: 1px solid #1e293b;
          border-radius: 11px;
          background: #07111f;
        }
        .problem-label {
          color: #475569;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .problem-title {
          margin-top: 6px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 700;
        }
        .university {
          margin-top: 14px;
          color: #38bdf8;
          font-size: 11px;
          font-weight: 700;
        }
        .fund {
          margin-top: 13px;
          color: #6ee7b7;
          font-size: 12px;
          font-weight: 800;
        }
        .attachments {
          margin-top: 17px;
          padding-top: 15px;
          border-top: 1px solid #1e293b;
        }
        .attachment-title {
          color: #475569;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .attachment {
          display: block;
          margin-top: 7px;
          padding: 9px 11px;
          border-radius: 8px;
          background: #0b1627;
          color: #38bdf8;
          font-size: 10px;
          text-decoration: none;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .approve-button {
          width: 100%;
          margin-top: 18px;
          min-height: 45px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #059669, #0d9488);
          color: white;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.2s;
        }
        .approve-button:hover { transform: translateY(-1px); opacity: 0.95; }
        .approve-button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        .approved-box {
          width: 100%;
          margin-top: 18px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(16, 185, 129, 0.1);
          color: #6ee7b7;
          text-align: center;
          font-size: 11px;
          font-weight: 800;
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
        @keyframes spin { to { transform: rotate(360deg); } }
        .empty {
          padding: 70px 20px;
          text-align: center;
          border: 1px dashed #263449;
          border-radius: 18px;
          color: #64748b;
        }
        .empty-icon { font-size: 35px; margin-bottom: 10px; }
        @media (max-width: 700px) {
          .navbar { padding: 0 20px; }
          .hero, .content { padding-left: 20px; padding-right: 20px; }
          .user-name, .logout { display: none; }
          .solution-grid { grid-template-columns: 1fr; }
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
        <div className="eyebrow">Citizen Portal</div>
        <h1>
          University
          <br />
          <span>Solutions.</span>
        </h1>
        <p>
          Review solutions proposed by universities for the problems you
          reported and approve the solution you believe should move forward.
        </p>
      </section>

      <main className="content">
        <div className="section-header">
          <h2>Proposed Solutions</h2>
          <p>Solutions submitted by universities</p>
        </div>

        {error && <div className="error">{error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Loading solutions...
          </div>
        ) : solutions.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🎓</div>
            <h3>No solutions available</h3>
            <p>
              University solutions for your submitted problems will appear here.
            </p>
          </div>
        ) : (
          <div className="solution-grid">
            {solutions.map((solution) => {
              const status = String(
                solution.status || "proposed",
              ).toLowerCase();
              const approved = status === "approved";

              let statusClass = "status-proposed";
              if (approved) {
                statusClass = "status-approved";
              } else if (status === "funded") {
                statusClass = "status-funded";
              } else if (status !== "proposed") {
                statusClass = "status-other";
              }

              return (
                <div className="solution-card" key={solution._id}>
                  <div className="solution-top">
                    <div>
                      <div className="solution-label">University Solution</div>
                      <h3>{solution.title}</h3>
                    </div>

                    <div className={`status ${statusClass}`}>
                      {status.replace("_", " ")}
                    </div>
                  </div>

                  <div className="description">{solution.description}</div>

                  {solution.university && (
                    <div className="university">
                      🏫 {solution.university.name || "University"}
                    </div>
                  )}

                  {solution.problem && (
                    <div className="problem-box">
                      <div className="problem-label">SOLUTION FOR</div>
                      <div className="problem-title">
                        {solution.problem.title || "Reported Problem"}
                      </div>
                    </div>
                  )}

                  {solution.fund !== undefined && solution.fund !== null && (
                    <div className="fund">
                      💰 Funding Required: ₹
                      {Number(solution.fund).toLocaleString("en-IN")}
                    </div>
                  )}

                  {solution.attachments?.length > 0 && (
                    <div className="attachments">
                      <div className="attachment-title">ATTACHMENTS</div>
                      {solution.attachments.map((attachment, index) => (
                        <a
                          className="attachment"
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
                    <div className="approved-box">✓ Approved by Citizen</div>
                  ) : (
                    <button
                      className="approve-button"
                      disabled={approving === solution._id}
                      onClick={() => approveSolution(solution._id)}
                    >
                      {approving === solution._id
                        ? "Approving..."
                        : "✓ Approve Solution"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default UserSolution;
