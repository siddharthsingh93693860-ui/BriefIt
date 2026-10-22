import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UniversityDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("briefit_user") ||
      localStorage.getItem("user") ||
      "null",
  );

  const universityId =
    typeof user?.university === "object"
      ? user?.university?._id
      : user?.university || user?._id || user?.id;

  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("available");
  const [search, setSearch] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const [solutionForm, setSolutionForm] = useState({
    title: "",
    description: "",
    fund: "",
    attachments: "",
  });
  const [submittingSolution, setSubmittingSolution] = useState(false);

  const fetchProblems = async () => {
    if (!universityId) {
      setError("University information not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [availableResponse, assignedResponse] = await Promise.all([
        fetch(
          `http://localhost:5000/api/university/problems?universityId=${universityId}`,
        ),
        fetch(
          `http://localhost:5000/api/university/problems/assigned?universityId=${universityId}`,
        ),
      ]);

      const availableData = await availableResponse.json();
      const assignedData = await assignedResponse.json();

      if (!availableResponse.ok || !availableData.success) {
        throw new Error(
          availableData.message || "Unable to fetch available problems",
        );
      }

      if (!assignedResponse.ok || !assignedData.success) {
        throw new Error(
          assignedData.message || "Unable to fetch assigned problems",
        );
      }

      const availableProblems = availableData.problems || [];
      const assignedProblems = assignedData.problems || [];

      const combined = [
        ...availableProblems,
        ...assignedProblems.filter(
          (assigned) =>
            !availableProblems.some(
              (available) => String(available._id) === String(assigned._id),
            ),
        ),
      ];

      setProblems(combined);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [universityId]);

  const handleClaimProblem = async (problemId) => {
    try {
      setClaimingId(problemId);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/university/problems/${problemId}/claim`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            universityId: universityId,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to claim problem");
      }

      setProblems((prev) =>
        prev.map((problem) =>
          String(problem._id) === String(problemId)
            ? {
                ...problem,
                ...data.problem,
                status: "assigned",
                assignedUniversity: universityId,
              }
            : problem,
        ),
      );

      setActiveTab("assigned");
      alert("Problem claimed successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to claim problem");
    } finally {
      setClaimingId(null);
    }
  };

  const handleSolutionChange = (e) => {
    setSolutionForm({
      ...solutionForm,
      [e.target.name]: e.target.value,
    });
  };

  const submitSolution = async (e) => {
    e.preventDefault();

    if (!selectedProblem) return;

    if (!solutionForm.fund || Number(solutionForm.fund) <= 0) {
      setError("Please enter a valid funding amount.");
      return;
    }

    try {
      setSubmittingSolution(true);
      setError("");

      const attachments = (solutionForm.attachments || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const response = await fetch("http://localhost:5000/api/solutions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problemId: selectedProblem._id,
          universityId: universityId,
          title: solutionForm.title,
          description: solutionForm.description,
          fund: Number(solutionForm.fund),
          attachments,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to submit solution");
      }

      setSelectedProblem(null);
      setSolutionForm({
        title: "",
        description: "",
        fund: "",
        attachments: "",
      });

      await fetchProblems();
      alert("Solution submitted successfully!");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit solution");
    } finally {
      setSubmittingSolution(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("briefit_user");
    localStorage.removeItem("user");
    navigate("/");
  };

  const availableProblems = problems.filter(
    (problem) => problem.status === "submitted",
  );

  const assignedProblems = problems.filter((problem) => {
    const assignedUnivId =
      typeof problem.assignedUniversity === "object"
        ? problem.assignedUniversity?._id
        : problem.assignedUniversity;
    return (
      problem.status === "assigned" &&
      String(assignedUnivId) === String(universityId)
    );
  });

  const currentProblems =
    activeTab === "available"
      ? availableProblems
      : activeTab === "assigned"
        ? assignedProblems
        : problems;

  const filteredProblems = currentProblems.filter((problem) => {
    const text = `${problem.title || ""} ${problem.description || ""} ${
      problem.category || ""
    } ${problem.location?.district || ""} ${
      problem.location?.block || ""
    }`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="university-page">
      <style>{`
        * { box-sizing: border-box; }
        .university-page {
          min-height: 100vh;
          background: radial-gradient(circle at 80% 10%, rgba(37,99,235,.12), transparent 30%), #050b14;
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
          background: rgba(5,11,20,.85);
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
          background: linear-gradient(135deg, #2563eb, #06b6d4);
          box-shadow: 0 8px 25px rgba(37,99,235,.25);
        }
        .brand span { color: #38bdf8; }
        .nav-right { display: flex; align-items: center; gap: 15px; }
        .university-name { color: #94a3b8; font-size: 13px; }
        .avatar {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #2563eb, #14b8a6);
          font-size: 14px;
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
        .logout:hover { color: white; border-color: #475569; }
        .hero {
          padding: 65px 5% 45px;
          background: radial-gradient(circle at 75% 20%, rgba(37,99,235,.16), transparent 35%);
        }
        .eyebrow {
          color: #38bdf8;
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
          background: linear-gradient(90deg, #38bdf8, #2dd4bf);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero p {
          max-width: 650px;
          margin-top: 18px;
          color: #64748b;
          font-size: 16px;
          line-height: 1.7;
        }
        .stats {
          padding: 0 5% 45px;
          display: grid;
          grid-template-columns: repeat(4,1fr);
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
        .content { padding: 0 5% 70px; }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 23px;
        }
        .section-header h2 { margin: 0; font-size: 25px; letter-spacing: -1px; }
        .section-header p { margin-top: 6px; color: #64748b; font-size: 13px; }
        .top-controls { display: flex; gap: 12px; margin-bottom: 25px; }
        .tabs {
          display: flex;
          padding: 4px;
          background: #0b1627;
          border: 1px solid #1e293b;
          border-radius: 11px;
        }
        .tab {
          border: none;
          background: transparent;
          color: #64748b;
          padding: 9px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 12px;
        }
        .tab.active { background: #17243a; color: white; }
        .search {
          flex: 1;
          min-width: 180px;
          padding: 0 15px;
          height: 46px;
          background: #0b1627;
          border: 1px solid #263449;
          border-radius: 11px;
          outline: none;
          color: white;
        }
        .search:focus { border-color: #0ea5e9; }
        .problem-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px,1fr));
          gap: 18px;
        }
        .problem-card {
          padding: 23px;
          border: 1px solid #1e293b;
          border-radius: 20px;
          background: linear-gradient(145deg, rgba(15,23,42,.82), rgba(8,17,30,.82));
          transition: .25s;
        }
        .problem-card:hover {
          transform: translateY(-4px);
          border-color: #334155;
          box-shadow: 0 20px 50px rgba(0,0,0,.25);
        }
        .problem-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }
        .category {
          color: #38bdf8;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .problem-card h3 { margin: 8px 0 10px; font-size: 19px; line-height: 1.35; }
        .description {
          color: #7d8ba0;
          font-size: 13px;
          line-height: 1.65;
          min-height: 65px;
        }
        .priority {
          padding: 6px 10px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .priority.high { color: #fca5a5; background: rgba(239,68,68,.1); }
        .priority.medium { color: #fcd34d; background: rgba(245,158,11,.1); }
        .priority.low { color: #6ee7b7; background: rgba(16,185,129,.1); }
        .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 15px; }
        .tag {
          padding: 5px 8px;
          border-radius: 7px;
          background: rgba(56,189,248,.06);
          border: 1px solid rgba(56,189,248,.1);
          color: #7dd3fc;
          font-size: 10px;
        }
        .location {
          margin-top: 17px;
          padding-top: 15px;
          border-top: 1px solid #1e293b;
          color: #64748b;
          font-size: 12px;
        }
        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 18px;
        }
        .rank { color: #64748b; font-size: 11px; }
        .rank strong { color: #cbd5e1; }
        .claim-btn, .solution-btn {
          border: none;
          padding: 10px 15px;
          border-radius: 9px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .claim-btn {
          background: linear-gradient(135deg, #2563eb, #0891b2);
        }
        .solution-btn {
          background: rgba(20,184,166,.12);
          border: 1px solid rgba(20,184,166,.2);
          color: #5eead4;
        }
        .claim-btn:hover, .solution-btn:hover { transform: translateY(-1px); }
        button:disabled { opacity: .5; cursor: not-allowed; }
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
          width: 27px;
          height: 27px;
          margin-right: 12px;
          border: 2px solid #1e293b;
          border-top-color: #38bdf8;
          border-radius: 50%;
          animation: spin .7s linear infinite;
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
          max-width: 570px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          border: 1px solid #263449;
          border-radius: 23px;
          background: #0b1627;
          box-shadow: 0 30px 100px rgba(0,0,0,.55);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 25px;
        }
        .modal-header h2 { margin: 0; font-size: 23px; }
        .modal-header p { margin-top: 7px; color: #64748b; font-size: 12px; }
        .close {
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: #17243a;
          color: #94a3b8;
          cursor: pointer;
          font-size: 16px;
        }
        .form-field { margin-bottom: 18px; }
        .form-field label {
          display: block;
          margin-bottom: 7px;
          color: #aebaca;
          font-size: 12px;
          font-weight: 600;
        }
        .form-field input, .form-field textarea {
          width: 100%;
          padding: 13px 14px;
          border: 1px solid #263449;
          border-radius: 10px;
          outline: none;
          background: #07111f;
          color: white;
          font-family: inherit;
          font-size: 13px;
        }
        .form-field textarea { min-height: 130px; resize: vertical; line-height: 1.6; }
        .form-field input:focus, .form-field textarea:focus { border-color: #0ea5e9; }
        .submit-solution {
          width: 100%;
          height: 48px;
          border: none;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #0891b2);
          color: white;
          font-weight: 700;
          cursor: pointer;
        }
        @media(max-width:900px) {
          .stats { grid-template-columns: repeat(2,1fr); }
          .top-controls { flex-direction: column; }
          .tabs { width: fit-content; }
        }
        @media(max-width:600px) {
          .navbar { padding: 0 20px; }
          .university-name, .logout { display: none; }
          .hero { padding: 45px 20px 35px; }
          .content, .stats { padding-left: 20px; padding-right: 20px; }
          .hero h1 { font-size: 43px; }
          .stats { grid-template-columns: 1fr; }
          .problem-grid { grid-template-columns: 1fr; }
          .modal { padding: 23px; }
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
          <div className="university-name">{user?.name || "University"}</div>
          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <button className="logout" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow">University Workspace</div>
        <h1>
          Solve problems.
          <br />
          Create <span>impact.</span>
        </h1>
        <p>
          Discover community problems that match your university's expertise,
          claim them, and turn your ideas into real-world solutions.
        </p>
      </section>

      <section className="stats">
        <div className="stat">
          <div className="stat-label">Available Problems</div>
          <div className="stat-value">{availableProblems.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">My Assigned</div>
          <div className="stat-value">{assignedProblems.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total Visible</div>
          <div className="stat-value">{problems.length}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Your Domain</div>
          <div className="stat-value">{user?.domain?.length || "—"}</div>
        </div>
      </section>

      <main className="content">
        <div className="section-header">
          <div>
            <h2>Problem opportunities</h2>
            <p>Problems matched to your university's capabilities.</p>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="top-controls">
          <input
            className="search"
            placeholder="Search by problem, category or district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="tabs">
            <button
              className={`tab ${activeTab === "available" ? "active" : ""}`}
              onClick={() => setActiveTab("available")}
            >
              Available
            </button>
            <button
              className={`tab ${activeTab === "assigned" ? "active" : ""}`}
              onClick={() => setActiveTab("assigned")}
            >
              My Problems
            </button>
            <button
              className={`tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Finding matching problems...
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">◇</div>
            <div>No problems found.</div>
            <p>Try changing your search or check again later.</p>
          </div>
        ) : (
          <div className="problem-grid">
            {filteredProblems.map((problem) => {
              const priority = problem.priority || "medium";
              const assignedUnivId =
                typeof problem.assignedUniversity === "object"
                  ? problem.assignedUniversity?._id
                  : problem.assignedUniversity;
              const isAssigned =
                problem.status === "assigned" &&
                String(assignedUnivId) === String(universityId);

              return (
                <div className="problem-card" key={problem._id}>
                  <div className="problem-top">
                    <div>
                      <div className="category">
                        {problem.category || "General"}
                      </div>
                      <h3>{problem.title}</h3>
                    </div>

                    <div className={`priority ${priority}`}>{priority}</div>
                  </div>

                  <p className="description">{problem.description}</p>

                  {problem.aiTags?.length > 0 && (
                    <div className="tags">
                      {problem.aiTags.slice(0, 4).map((tag, index) => (
                        <span className="tag" key={index}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="location">
                    📍 {problem.location?.district || "Unknown"}
                    {problem.location?.block && ` · ${problem.location.block}`}
                  </div>

                  <div className="card-footer">
                    <div className="rank">
                      AI Rank: <strong>{problem.rank ?? "—"}</strong>
                    </div>

                    {isAssigned ? (
                      <button
                        className="solution-btn"
                        onClick={() => setSelectedProblem(problem)}
                      >
                        Submit solution →
                      </button>
                    ) : (
                      <button
                        className="claim-btn"
                        disabled={claimingId === problem._id}
                        onClick={() => handleClaimProblem(problem._id)}
                      >
                        {claimingId === problem._id
                          ? "Claiming..."
                          : "Claim problem →"}
                      </button>
                    )}
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
            }
          }}
        >
          <form className="modal" onSubmit={submitSolution}>
            <div className="modal-header">
              <div>
                <h2>Submit your solution</h2>
                <p>For: {selectedProblem.title}</p>
              </div>

              <button
                type="button"
                className="close"
                onClick={() => setSelectedProblem(null)}
              >
                ×
              </button>
            </div>

            <div className="form-field">
              <label>Solution title</label>
              <input
                name="title"
                placeholder="e.g. Solar-powered water purification unit"
                value={solutionForm.title}
                onChange={handleSolutionChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Solution description</label>
              <textarea
                name="description"
                placeholder="Explain how your university plans to solve this problem..."
                value={solutionForm.description}
                onChange={handleSolutionChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Required Funding Amount (₹)</label>
              <input
                type="number"
                name="fund"
                min="1"
                placeholder="e.g. 500000"
                value={solutionForm.fund}
                onChange={handleSolutionChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Attachment URLs</label>
              <input
                name="attachments"
                placeholder="https://example.com/proposal.pdf"
                value={solutionForm.attachments}
                onChange={handleSolutionChange}
              />
              <div
                style={{
                  marginTop: 7,
                  color: "#475569",
                  fontSize: 10,
                }}
              >
                Separate multiple URLs with commas.
              </div>
            </div>

            <button className="submit-solution" disabled={submittingSolution}>
              {submittingSolution
                ? "Submitting solution..."
                : "Submit solution →"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
