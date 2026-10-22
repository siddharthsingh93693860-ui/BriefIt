import { useEffect, useState } from "react";
import useAuthStore from "../store/authStore";

function AdminDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/admin/analytics");

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch analytics");
      }

      setAnalytics(data.analytics);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "submitted":
        return "submitted";

      case "assigned":
        return "assigned";

      case "in_progress":
        return "progress";

      case "solved":
        return "solved";

      case "rejected":
        return "rejected";

      default:
        return "default";
    }
  };

  const formatStatus = (status) => {
    return status
      ?.replace("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="admin-page">
      <style>{`

        * {
          box-sizing: border-box;
        }

        .admin-page {
          min-height: 100vh;

          background:
            radial-gradient(
              circle at 85% 5%,
              rgba(37,99,235,.13),
              transparent 28%
            ),
            radial-gradient(
              circle at 10% 70%,
              rgba(20,184,166,.07),
              transparent 28%
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

        /* ================================================
           NAVBAR
        ================================================ */

        .navbar {
          height: 76px;

          padding:
            0 5%;

          display: flex;

          align-items: center;

          justify-content:
            space-between;

          position: sticky;

          top: 0;

          z-index: 20;

          border-bottom:
            1px solid
            #172235;

          background:
            rgba(5,11,20,.88);

          backdrop-filter:
            blur(18px);
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
              #2563eb,
              #06b6d4
            );

          box-shadow:
            0 10px 30px
            rgba(37,99,235,.25);
        }

        .brand span {
          color: #38bdf8;
        }

        .nav-right {
          display: flex;

          align-items: center;

          gap: 13px;
        }

        .admin-label {
          color: #64748b;

          font-size: 11px;

          text-transform:
            uppercase;

          letter-spacing: 1px;
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
              #7c3aed,
              #2563eb
            );

          font-size: 13px;

          font-weight: 800;
        }

        .logout {
          padding:
            9px 14px;

          border:
            1px solid
            #263449;

          border-radius: 9px;

          background:
            transparent;

          color: #94a3b8;

          cursor: pointer;

          transition: .2s;
        }

        .logout:hover {
          color: white;

          border-color:
            #475569;
        }

        /* ================================================
           MAIN
        ================================================ */

        .main {
          padding:
            58px 5% 80px;
        }

        .hero {
          display: flex;

          justify-content:
            space-between;

          align-items:
            flex-end;

          gap: 30px;

          margin-bottom: 40px;
        }

        .eyebrow {
          margin-bottom: 13px;

          color: #a78bfa;

          font-size: 10px;

          font-weight: 700;

          letter-spacing: 2px;

          text-transform:
            uppercase;
        }

        .hero h1 {
          margin: 0;

          font-size:
            clamp(38px,5vw,62px);

          line-height: 1;

          letter-spacing: -3px;
        }

        .hero h1 span {
          background:
            linear-gradient(
              90deg,
              #38bdf8,
              #a78bfa
            );

          -webkit-background-clip:
            text;

          -webkit-text-fill-color:
            transparent;
        }

        .hero p {
          max-width: 650px;

          margin-top: 17px;

          color: #64748b;

          font-size: 14px;

          line-height: 1.7;
        }

        .refresh-button {
          flex-shrink: 0;

          padding:
            11px 16px;

          border:
            1px solid
            #263449;

          border-radius: 10px;

          background:
            #0b1627;

          color: #94a3b8;

          cursor: pointer;

          transition: .2s;
        }

        .refresh-button:hover {
          color: white;

          border-color:
            #475569;
        }

        /* ================================================
           ERROR
        ================================================ */

        .error {
          margin-bottom: 25px;

          padding:
            14px 16px;

          border:
            1px solid
            rgba(239,68,68,.2);

          border-radius: 11px;

          background:
            rgba(239,68,68,.08);

          color: #fca5a5;

          font-size: 13px;
        }

        /* ================================================
           STAT CARDS
        ================================================ */

        .stats {
          display: grid;

          grid-template-columns:
            repeat(5,1fr);

          gap: 14px;

          margin-bottom: 40px;
        }

        .stat-card {
          position: relative;

          overflow: hidden;

          padding: 23px;

          border:
            1px solid
            #1e293b;

          border-radius: 18px;

          background:
            linear-gradient(
              145deg,
              rgba(15,23,42,.86),
              rgba(8,17,30,.86)
            );
        }

        .stat-card::after {
          content: "";

          position: absolute;

          width: 90px;
          height: 90px;

          right: -35px;
          bottom: -45px;

          border-radius: 50%;

          background:
            rgba(56,189,248,.06);
        }

        .stat-icon {
          width: 34px;
          height: 34px;

          display: grid;

          place-items: center;

          margin-bottom: 18px;

          border-radius: 9px;

          background:
            rgba(56,189,248,.07);

          color: #38bdf8;

          font-size: 14px;
        }

        .stat-number {
          font-size: 31px;

          font-weight: 800;

          letter-spacing: -1px;
        }

        .stat-label {
          margin-top: 5px;

          color: #64748b;

          font-size: 10px;

          font-weight: 600;

          text-transform:
            uppercase;

          letter-spacing: .8px;
        }

        /* ================================================
           GRID
        ================================================ */

        .dashboard-grid {
          display: grid;

          grid-template-columns:
            1.35fr
            .65fr;

          gap: 18px;

          margin-bottom: 18px;
        }

        .panel {
          padding: 25px;

          border:
            1px solid
            #1e293b;

          border-radius: 20px;

          background:
            linear-gradient(
              145deg,
              rgba(15,23,42,.78),
              rgba(8,17,30,.78)
            );
        }

        .panel-header {
          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          margin-bottom: 24px;
        }

        .panel-title {
          margin: 0;

          font-size: 17px;

          letter-spacing:
            -.4px;
        }

        .panel-subtitle {
          margin-top: 5px;

          color: #475569;

          font-size: 11px;
        }

        /* ================================================
           STATUS
        ================================================ */

        .status-list {
          display: flex;

          flex-direction:
            column;

          gap: 17px;
        }

        .status-row {
          display: grid;

          grid-template-columns:
            115px
            1fr
            40px;

          align-items:
            center;

          gap: 12px;
        }

        .status-name {
          color: #94a3b8;

          font-size: 11px;
        }

        .status-bar {
          height: 7px;

          overflow: hidden;

          border-radius:
            100px;

          background:
            #172235;
        }

        .status-fill {
          height: 100%;

          border-radius:
            inherit;

          background:
            linear-gradient(
              90deg,
              #2563eb,
              #38bdf8
            );

          transition:
            width .5s ease;
        }

        .status-fill.solved {
          background:
            linear-gradient(
              90deg,
              #059669,
              #34d399
            );
        }

        .status-fill.progress {
          background:
            linear-gradient(
              90deg,
              #d97706,
              #fbbf24
            );
        }

        .status-fill.assigned {
          background:
            linear-gradient(
              90deg,
              #7c3aed,
              #a78bfa
            );
        }

        .status-fill.rejected {
          background:
            linear-gradient(
              90deg,
              #dc2626,
              #fb7185
            );
        }

        .status-count {
          color: #cbd5e1;

          font-size: 12px;

          font-weight: 700;

          text-align: right;
        }

        /* ================================================
           CATEGORY
        ================================================ */

        .category-list {
          display: flex;

          flex-direction:
            column;

          gap: 13px;
        }

        .category-row {
          display: flex;

          align-items:
            center;

          justify-content:
            space-between;

          padding:
            12px 13px;

          border:
            1px solid
            #1b293d;

          border-radius: 10px;

          background:
            rgba(7,17,31,.6);
        }

        .category-name {
          color: #94a3b8;

          font-size: 12px;

          text-transform:
            capitalize;
        }

        .category-count {
          min-width: 30px;

          padding:
            4px 7px;

          border-radius: 7px;

          background:
            rgba(56,189,248,.07);

          color: #38bdf8;

          font-size: 10px;

          font-weight: 700;

          text-align: center;
        }

        /* ================================================
           STATUS BADGES
        ================================================ */

        .status-badge {
          display: inline-flex;

          align-items:
            center;

          padding:
            5px 8px;

          border-radius:
            100px;

          font-size: 9px;

          font-weight: 700;

          text-transform:
            uppercase;
        }

        .status-badge.submitted {
          color: #38bdf8;

          background:
            rgba(56,189,248,.08);
        }

        .status-badge.assigned {
          color: #c4b5fd;

          background:
            rgba(139,92,246,.1);
        }

        .status-badge.progress {
          color: #fcd34d;

          background:
            rgba(245,158,11,.1);
        }

        .status-badge.solved {
          color: #6ee7b7;

          background:
            rgba(16,185,129,.1);
        }

        .status-badge.rejected {
          color: #fca5a5;

          background:
            rgba(239,68,68,.1);
        }

        .status-badge.default {
          color: #94a3b8;

          background:
            rgba(148,163,184,.08);
        }

        /* ================================================
           SOLUTION / IMPACT
        ================================================ */

        .impact-grid {
          display: grid;

          grid-template-columns:
            repeat(2,1fr);

          gap: 14px;
        }

        .impact-card {
          padding: 22px;

          border:
            1px solid
            #1e293b;

          border-radius:
            16px;

          background:
            #07111f;
        }

        .impact-number {
          font-size: 28px;

          font-weight: 800;
        }

        .impact-label {
          margin-top: 5px;

          color: #64748b;

          font-size: 11px;
        }

        .impact-icon {
          margin-bottom: 15px;

          color: #2dd4bf;

          font-size: 20px;
        }

        /* ================================================
           LOADING
        ================================================ */

        .loading {
          min-height: 500px;

          display: flex;

          align-items:
            center;

          justify-content:
            center;

          color: #64748b;
        }

        .spinner {
          width: 30px;

          height: 30px;

          margin-right: 12px;

          border:
            2px solid
            #1e293b;

          border-top-color:
            #38bdf8;

          border-radius: 50%;

          animation:
            spin .7s linear infinite;
        }

        @keyframes spin {

          to {
            transform:
              rotate(360deg);
          }

        }

        /* ================================================
           RESPONSIVE
        ================================================ */

        @media(max-width:1100px) {

          .stats {
            grid-template-columns:
              repeat(3,1fr);
          }

        }

        @media(max-width:850px) {

          .dashboard-grid {
            grid-template-columns:
              1fr;
          }

          .hero {
            align-items:
              flex-start;

            flex-direction:
              column;
          }

        }

        @media(max-width:600px) {

          .navbar {
            padding:
              0 20px;
          }

          .admin-label {
            display: none;
          }

          .main {
            padding:
              45px 20px 60px;
          }

          .hero h1 {
            font-size: 43px;
          }

          .stats {
            grid-template-columns:
              repeat(2,1fr);
          }

          .stat-card {
            padding: 18px;
          }

          .stat-number {
            font-size: 26px;
          }

          .status-row {
            grid-template-columns:
              90px 1fr 30px;
          }

          .panel {
            padding: 20px;
          }

        }

        @media(max-width:430px) {

          .stats {
            grid-template-columns:
              1fr;
          }

          .status-row {
            grid-template-columns:
              85px 1fr 30px;
          }

          .logout {
            display: none;
          }

        }

      `}</style>

      {/* =================================================
          NAVBAR
      ================================================= */}

      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">✦</div>

          <div>
            Brief<span>It</span>
          </div>
        </div>

        <div className="nav-right">
          <div className="admin-label">Administrator</div>

          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>

          <button className="logout" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="main">
        <section className="hero">
          <div>
            <div className="eyebrow">System Overview</div>

            <h1>
              Command
              <br />
              <span>center.</span>
            </h1>

            <p>
              Monitor the current state of the BriefIt ecosystem — from
              community problems to university solutions and industry funding.
            </p>
          </div>

          <button className="refresh-button" onClick={fetchAnalytics}>
            ↻ &nbsp; Refresh data
          </button>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && <div className="error">{error}</div>}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Loading system analytics...
          </div>
        ) : analytics ? (
          <>
            {/* =================================================
                MAIN STATS
            ================================================= */}

            <section className="stats">
              <StatCard
                icon="◇"
                label="Total Problems"
                value={analytics.totalProblems}
              />

              <StatCard
                icon="⌁"
                label="Total Solutions"
                value={analytics.totalSolutions}
              />

              <StatCard
                icon="◆"
                label="Funded Solutions"
                value={analytics.fundedSolutions}
              />

              <StatCard
                icon="△"
                label="Universities"
                value={analytics.totalUniversities}
              />

              <StatCard
                icon="◈"
                label="Industries"
                value={analytics.totalIndustries}
              />
            </section>

            {/* =================================================
                STATUS + CATEGORY
            ================================================= */}

            <div className="dashboard-grid">
              {/* STATUS */}

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">Problem lifecycle</h3>

                    <div className="panel-subtitle">
                      Current status across all reported problems
                    </div>
                  </div>
                </div>

                <div className="status-list">
                  {analytics.problemsByStatus?.map((item) => {
                    const total = analytics.totalProblems || 1;

                    const percentage = (item.count / total) * 100;

                    const statusClass = getStatusClass(item._id);

                    return (
                      <div className="status-row" key={item._id}>
                        <div className="status-name">
                          {formatStatus(item._id)}
                        </div>

                        <div className="status-bar">
                          <div
                            className={`status-fill ${statusClass}`}
                            style={{
                              width: `${Math.max(percentage, 3)}%`,
                            }}
                          />
                        </div>

                        <div className="status-count">{item.count}</div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* CATEGORY */}

              <section className="panel">
                <div className="panel-header">
                  <div>
                    <h3 className="panel-title">Problem categories</h3>

                    <div className="panel-subtitle">Distribution by domain</div>
                  </div>
                </div>

                <div className="category-list">
                  {analytics.problemsByCategory?.map((item) => (
                    <div className="category-row" key={item._id}>
                      <div className="category-name">{item._id}</div>

                      <div className="category-count">{item.count}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* =================================================
                IMPACT
            ================================================= */}

            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3 className="panel-title">Ecosystem impact</h3>

                  <div className="panel-subtitle">
                    Solutions moving from ideas to real-world implementation
                  </div>
                </div>
              </div>

              <div className="impact-grid">
                <div className="impact-card">
                  <div className="impact-icon">⌁</div>

                  <div className="impact-number">
                    {analytics.totalSolutions}
                  </div>

                  <div className="impact-label">
                    Solutions proposed by universities
                  </div>
                </div>

                <div className="impact-card">
                  <div className="impact-icon">◆</div>

                  <div className="impact-number">
                    {analytics.fundedSolutions}
                  </div>

                  <div className="impact-label">
                    Solutions receiving industry funding
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <div className="loading">No analytics available.</div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>

      <div className="stat-number">{value ?? 0}</div>

      <div className="stat-label">{label}</div>
    </div>
  );
}

export default AdminDashboard;
