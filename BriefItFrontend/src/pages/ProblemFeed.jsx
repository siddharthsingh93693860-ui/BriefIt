import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProblemFeed() {
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solutionsLoading, setSolutionsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");

  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showReportForm, setShowReportForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    district: "",
    block: "",
    mediaUrl: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const [approvingSolution, setApprovingSolution] = useState(null);
  const [approveError, setApproveError] = useState("");

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

      const response = await fetch("http://localhost:5000/api/problems");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load problems");
      }

      setProblems(data.problems || []);
    } catch (err) {
      setError(err.message || "Failed to load problems");
    } finally {
      setLoading(false);
    }
  };

  const fetchSolutions = async () => {
    try {
      setSolutionsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/solutions/citizen",
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

  const logout = () => {
    localStorage.removeItem("briefit_user");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const filteredProblems = problems.filter((problem) => {
    const searchText = `
      ${problem.title || ""} 
      ${problem.description || ""} 
      ${problem.category || ""} 
      ${problem.location?.district || ""} 
      ${problem.location?.block || ""} 
      ${problem.aiTags?.join(" ") || ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesCategory = !category || problem.category === category;
    const matchesDistrict =
      !district ||
      problem.location?.district
        ?.toLowerCase()
        .includes(district.toLowerCase());

    return matchesSearch && matchesCategory && matchesDistrict;
  });

  const submittedCount = problems.filter(
    (problem) => problem.status === "submitted",
  ).length;

  const inProgressCount = problems.filter(
    (problem) => problem.status === "in_progress",
  ).length;

  const solvedCount = problems.filter(
    (problem) => problem.status === "solved",
  ).length;

  const highPriorityCount = problems.filter(
    (problem) => problem.priority === "high",
  ).length;

  const categories = [
    ...new Set(problems.map((problem) => problem.category).filter(Boolean)),
  ];

  const getPriorityClass = (priority) => {
    if (priority === "high") return "high";
    if (priority === "low") return "low";
    return "medium";
  };

  const getStatusClass = (status) => {
    if (status === "solved") return "solved";
    if (status === "in_progress") return "progress";
    if (status === "assigned") return "assigned";
    if (status === "rejected") return "rejected";
    return "submitted";
  };

  const handleFormChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openReportForm = () => {
    setSubmitError("");
    setSubmitSuccess(false);
    setForm({
      title: "",
      description: "",
      district: "",
      block: "",
      mediaUrl: "",
    });
    setShowReportForm(true);
  };

  const closeReportForm = () => {
    if (submitting) return;
    setShowReportForm(false);
    setSubmitError("");
    setSubmitSuccess(false);
  };

  const handleSubmitProblem = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!userId) {
      setSubmitError("User information not found. Please login again.");
      return;
    }

    if (!form.title.trim()) {
      setSubmitError("Please enter a problem title.");
      return;
    }

    if (!form.description.trim()) {
      setSubmitError("Please describe the problem.");
      return;
    }

    if (!form.district.trim()) {
      setSubmitError("Please enter the district.");
      return;
    }

    if (!form.block.trim()) {
      setSubmitError("Please enter the block.");
      return;
    }

    try {
      setSubmitting(true);

      const media = form.mediaUrl.trim()
        ? [
            {
              url: form.mediaUrl.trim(),
              type: "image",
            },
          ]
        : [];

      const response = await fetch("http://localhost:5000/api/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          location: {
            district: form.district.trim(),
            block: form.block.trim(),
          },
          submittedBy: userId,
          media,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to submit problem");
      }

      setSubmitSuccess(true);
      await fetchProblems();

      setTimeout(() => {
        setShowReportForm(false);
        setSubmitSuccess(false);
        setForm({
          title: "",
          description: "",
          district: "",
          block: "",
          mediaUrl: "",
        });
      }, 1400);
    } catch (err) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const getProblemSolutions = (problemId) => {
    return solutions.filter((solution) => {
      const solutionProblemId =
        typeof solution.problem === "object"
          ? solution.problem?._id
          : solution.problem;

      return String(solutionProblemId) === String(problemId);
    });
  };

  const approveSolution = async (solutionId) => {
    try {
      setApprovingSolution(solutionId);
      setApproveError("");

      const response = await fetch(
        `http://localhost:5000/api/solutions/${solutionId}/approve`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to approve solution");
      }

      await fetchSolutions();
    } catch (err) {
      console.error(err);
      setApproveError(err.message || "Failed to approve solution");
    } finally {
      setApprovingSolution(null);
    }
  };

  return (
    <div className="feed-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .feed-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 80% 5%,
              rgba(37,99,235,.12),
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
          background: rgba(5,11,20,.88);
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
            #2563eb,
            #06b6d4
          );
          box-shadow:
            0 8px 25px rgba(37,99,235,.25);
        }

        .brand span {
          color: #38bdf8;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-solutions-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 9px;
          background: rgba(56, 189, 248, 0.08);
          color: #38bdf8;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s;
        }

        .nav-solutions-btn:hover {
          background: rgba(56, 189, 248, 0.16);
          border-color: #38bdf8;
          color: #e0f2fe;
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
        }

        .logout:hover {
          color: white;
          border-color: #475569;
        }

        .hero {
          padding: 65px 5% 45px;
          background:
            radial-gradient(
              circle at 75% 30%,
              rgba(37,99,235,.14),
              transparent 35%
            );
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
          background:
            linear-gradient(
              90deg,
              #38bdf8,
              #2dd4bf
            );
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

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 28px;
          flex-wrap: wrap;
        }

        .report-button {
          padding: 13px 20px;
          border: none;
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0891b2
            );
          color: white;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          box-shadow:
            0 10px 25px rgba(37,99,235,.2);
          transition: .2s;
        }

        .report-button:hover {
          transform: translateY(-2px);
          box-shadow:
            0 14px 30px rgba(37,99,235,.3);
        }

        .solutions-hero-btn {
          padding: 13px 20px;
          border: 1px solid rgba(45, 212, 191, 0.3);
          border-radius: 10px;
          background: rgba(45, 212, 191, 0.08);
          color: #5eead4;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: .2s;
        }

        .solutions-hero-btn:hover {
          background: rgba(45, 212, 191, 0.16);
          border-color: #5eead4;
          transform: translateY(-2px);
        }

        .stats {
          padding: 0 5% 45px;
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 15px;
        }

        .stat {
          padding: 22px;
          border:
            1px solid rgba(255,255,255,.07);
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
          margin-bottom: 22px;
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

        .filters {
          display: grid;
          grid-template-columns: 1fr 180px 180px;
          gap: 10px;
          margin-bottom: 25px;
        }

        .filter-input,
        .filter-select {
          height: 46px;
          padding: 0 14px;
          border: 1px solid #263449;
          border-radius: 10px;
          outline: none;
          background: #0b1627;
          color: white;
          font-size: 13px;
        }

        .filter-input:focus,
        .filter-select:focus {
          border-color: #0ea5e9;
        }

        .filter-select option {
          background: #0b1627;
        }

        .problem-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fill,
              minmax(320px,1fr)
            );
          gap: 18px;
        }

        .problem-card {
          position: relative;
          padding: 23px;
          border: 1px solid #1e293b;
          border-radius: 20px;
          background:
            linear-gradient(
              145deg,
              rgba(15,23,42,.82),
              rgba(8,17,30,.82)
            );
          transition:
            transform .25s,
            border-color .25s,
            box-shadow .25s;
          cursor: pointer;
        }

        .problem-card:hover {
          transform: translateY(-4px);
          border-color: #334155;
          box-shadow:
            0 20px 50px rgba(0,0,0,.25);
        }

        .problem-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .category {
          color: #38bdf8;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .problem-card h3 {
          margin: 8px 0 10px;
          font-size: 19px;
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
          font-weight: 700;
          text-transform: uppercase;
          white-space: nowrap;
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

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 16px;
        }

        .tag {
          padding: 5px 8px;
          border:
            1px solid rgba(56,189,248,.1);
          border-radius: 7px;
          background: rgba(56,189,248,.06);
          color: #7dd3fc;
          font-size: 10px;
        }

        .location {
          margin-top: 18px;
          padding-top: 15px;
          border-top: 1px solid #1e293b;
          color: #64748b;
          font-size: 12px;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 16px;
        }

        .rank {
          color: #64748b;
          font-size: 11px;
        }

        .rank strong {
          color: #cbd5e1;
        }

        .status {
          padding: 6px 9px;
          border-radius: 100px;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status.submitted {
          color: #38bdf8;
          background: rgba(56,189,248,.08);
        }

        .status.assigned {
          color: #c4b5fd;
          background: rgba(139,92,246,.1);
        }

        .status.progress {
          color: #fcd34d;
          background: rgba(245,158,11,.1);
        }

        .status.solved {
          color: #6ee7b7;
          background: rgba(16,185,129,.1);
        }

        .status.rejected {
          color: #fca5a5;
          background: rgba(239,68,68,.1);
        }

        .solution-indicator {
          margin-top: 15px;
          padding: 10px 12px;
          border: 1px solid rgba(45,212,191,.18);
          border-radius: 10px;
          background: rgba(45,212,191,.06);
          color: #5eead4;
          font-size: 11px;
          font-weight: 700;
        }

        .duplicate {
          margin-top: 12px;
          padding: 8px 10px;
          border:
            1px solid rgba(239,68,68,.15);
          border-radius: 8px;
          background: rgba(239,68,68,.06);
          color: #fca5a5;
          font-size: 10px;
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
          margin-bottom: 10px;
          font-size: 35px;
        }

        .error {
          margin-bottom: 20px;
          padding: 13px 15px;
          border:
            1px solid rgba(239,68,68,.2);
          border-radius: 11px;
          background: rgba(239,68,68,.08);
          color: #fca5a5;
          font-size: 13px;
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
          max-width: 700px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          border: 1px solid #263449;
          border-radius: 23px;
          background: #0b1627;
          box-shadow:
            0 30px 100px rgba(0,0,0,.55);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 25px;
        }

        .modal-category {
          color: #38bdf8;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .modal h2 {
          margin: 7px 0 8px;
          font-size: 27px;
          line-height: 1.2;
        }

        .modal-description {
          color: #94a3b8;
          font-size: 14px;
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

        .modal-info {
          display: grid;
          grid-template-columns: repeat(2,1fr);
          gap: 10px;
          margin-top: 22px;
        }

        .info-box {
          padding: 15px;
          border: 1px solid #1e293b;
          border-radius: 12px;
          background: #07111f;
        }

        .info-label {
          color: #475569;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .info-value {
          margin-top: 6px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 600;
        }

        .modal-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          margin-top: 20px;
        }

        .modal-media {
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid #1e293b;
        }

        .modal-media h4 {
          margin: 0 0 12px;
          color: #94a3b8;
          font-size: 12px;
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
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 14px;
        }

        .solution-heading h3 {
          margin: 0;
          font-size: 16px;
        }

        .solution-card {
          padding: 18px;
          border: 1px solid #263449;
          border-radius: 15px;
          background: #07111f;
          margin-bottom: 12px;
        }

        .solution-card h4 {
          margin: 0 0 9px;
          font-size: 17px;
        }

        .solution-description {
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.7;
        }

        .university-name {
          margin-top: 12px;
          color: #38bdf8;
          font-size: 11px;
          font-weight: 700;
        }

        .solution-attachments {
          margin-top: 14px;
        }

        .solution-attachments a {
          display: block;
          padding: 9px 10px;
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
          margin-top: 15px;
          min-height: 43px;
          border: none;
          border-radius: 10px;
          background:
            linear-gradient(
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
          opacity: .55;
          cursor: not-allowed;
          transform: none;
        }

        .approved-badge {
          display: inline-block;
          margin-top: 14px;
          padding: 7px 10px;
          border-radius: 100px;
          color: #6ee7b7;
          background: rgba(16,185,129,.1);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .approve-error {
          margin-top: 10px;
          padding: 10px;
          border-radius: 8px;
          background: rgba(239,68,68,.08);
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

        .report-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0,0,0,.78);
          backdrop-filter: blur(12px);
        }

        .report-modal {
          width: 100%;
          max-width: 680px;
          max-height: 92vh;
          overflow-y: auto;
          border: 1px solid #263449;
          border-radius: 24px;
          background:
            linear-gradient(
              145deg,
              #0d1728,
              #07111f
            );
          box-shadow:
            0 30px 100px rgba(0,0,0,.6);
        }

        .report-header {
          padding: 28px 30px 22px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #1e293b;
        }

        .report-title {
          margin: 0;
          font-size: 28px;
          letter-spacing: -1px;
        }

        .report-subtitle {
          margin-top: 7px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.6;
        }

        .report-form {
          padding: 28px 30px 30px;
        }

        .form-group {
          margin-bottom: 21px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          color: #cbd5e1;
          font-size: 11px;
          font-weight: 700;
        }

        .required {
          color: #38bdf8;
        }

        .form-input,
        .form-textarea {
          width: 100%;
          border: 1px solid #1e293b;
          border-radius: 11px;
          background: #07111f;
          color: white;
          outline: none;
          font-family: inherit;
          transition: .2s;
        }

        .form-input {
          height: 46px;
          padding: 0 14px;
          font-size: 13px;
        }

        .form-textarea {
          min-height: 130px;
          padding: 13px 14px;
          resize: vertical;
          font-size: 13px;
          line-height: 1.6;
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #475569;
        }

        .form-input:focus,
        .form-textarea:focus {
          border-color: #2563eb;
          box-shadow:
            0 0 0 3px rgba(37,99,235,.1);
        }

        .location-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 13px;
        }

        .helper {
          margin-top: 6px;
          color: #475569;
          font-size: 10px;
        }

        .ai-note {
          display: flex;
          gap: 10px;
          padding: 14px;
          margin-bottom: 22px;
          border:
            1px solid rgba(56,189,248,.12);
          border-radius: 11px;
          background: rgba(56,189,248,.04);
        }

        .ai-icon {
          color: #38bdf8;
          font-size: 18px;
        }

        .ai-note-text {
          color: #64748b;
          font-size: 10px;
          line-height: 1.6;
        }

        .ai-note-text strong {
          color: #94a3b8;
        }

        .submit-error {
          margin-bottom: 18px;
          padding: 12px 14px;
          border:
            1px solid rgba(239,68,68,.25);
          border-radius: 9px;
          background: rgba(239,68,68,.08);
          color: #fca5a5;
          font-size: 11px;
        }

        .report-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .cancel-button,
        .submit-problem-button {
          min-height: 44px;
          padding: 0 18px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .cancel-button {
          border: 1px solid #263449;
          background: transparent;
          color: #94a3b8;
        }

        .submit-problem-button {
          border: none;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0891b2
            );
          color: white;
          box-shadow:
            0 8px 25px rgba(37,99,235,.18);
        }

        .submit-problem-button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .success-screen {
          padding: 75px 30px;
          text-align: center;
        }

        .success-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 18px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: rgba(16,185,129,.1);
          color: #34d399;
          font-size: 26px;
        }

        .success-screen h2 {
          margin: 0;
          font-size: 22px;
        }

        .success-screen p {
          margin-top: 8px;
          color: #64748b;
          font-size: 12px;
        }

        @media(max-width:900px) {
          .stats {
            grid-template-columns: repeat(2,1fr);
          }

          .filters {
            grid-template-columns: 1fr 1fr;
          }

          .filter-input:first-child {
            grid-column: 1 / -1;
          }
        }

        @media(max-width:600px) {
          .navbar {
            padding: 0 20px;
          }

          .user-name,
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

          .filters {
            grid-template-columns: 1fr;
          }

          .problem-grid {
            grid-template-columns: 1fr;
          }

          .modal {
            padding: 23px;
          }

          .modal-info {
            grid-template-columns: 1fr;
          }

          .report-overlay {
            padding: 8px;
            align-items: flex-start;
          }

          .report-modal {
            margin-top: 8px;
          }

          .report-header,
          .report-form {
            padding-left: 20px;
            padding-right: 20px;
          }

          .location-grid {
            grid-template-columns: 1fr;
          }

          .report-actions {
            flex-direction: column-reverse;
          }

          .cancel-button,
          .submit-problem-button {
            width: 100%;
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
          {/* Solutions navigation tab button */}
          <button
            className="nav-solutions-btn"
            onClick={() => navigate("/user/solutions")}
          >
            🎓 View Solutions
          </button>

          <div className="user-name">{user?.name || "Citizen"}</div>

          <div className="avatar">
            {user?.name?.charAt(0)?.toUpperCase() || "C"}
          </div>

          <button className="logout" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow">Citizen Community</div>

        <h1>
          See a problem?
          <br />
          <span>Make it visible.</span>
        </h1>

        <p>
          Explore problems reported by communities across the country. Your
          voice helps universities and industries discover where their work can
          create real impact.
        </p>

        <div className="hero-actions">
          <button className="report-button" onClick={openReportForm}>
            + Report a problem
          </button>
          <button
            className="solutions-hero-btn"
            onClick={() => navigate("/user/solutions")}
          >
            🎓 Proposed Solutions →
          </button>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <div className="stat-label">Total Problems</div>
          <div className="stat-value">{problems.length}</div>
        </div>

        <div className="stat">
          <div className="stat-label">Submitted</div>
          <div className="stat-value">{submittedCount}</div>
        </div>

        <div className="stat">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{inProgressCount}</div>
        </div>

        <div className="stat">
          <div className="stat-label">High Priority</div>
          <div className="stat-value">{highPriorityCount}</div>
        </div>
      </section>

      <main className="content">
        <div className="section-header">
          <div>
            <h2>Community problems</h2>
            <p>Discover what communities need solved.</p>
          </div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="filters">
          <input
            className="filter-input"
            placeholder="Search problems, locations, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="filter-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            className="filter-input"
            placeholder="District"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner" />
            Loading community problems...
          </div>
        ) : filteredProblems.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">◇</div>
            <div>No problems found.</div>
            <p>Try changing your filters or report a new problem.</p>
          </div>
        ) : (
          <div className="problem-grid">
            {filteredProblems.map((problem) => {
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
                      className={`priority ${getPriorityClass(
                        problem.priority,
                      )}`}
                    >
                      {problem.priority || "medium"}
                    </div>
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

                  {problem.isDuplicate && (
                    <div className="duplicate">
                      ⚠ This problem has been identified as a duplicate.
                    </div>
                  )}

                  {problemSolutions.length > 0 && (
                    <div className="solution-indicator">
                      🎓 University solution proposed
                    </div>
                  )}

                  <div className="location">
                    📍 {problem.location?.district || "Unknown district"}
                    {problem.location?.block && ` · ${problem.location.block}`}
                  </div>

                  <div className="card-footer">
                    <div className="rank">
                      AI Rank: <strong>{problem.rank ?? "—"}</strong>
                    </div>

                    <div className={`status ${getStatusClass(problem.status)}`}>
                      {problem.status?.replace("_", " ") || "submitted"}
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

            <div className="modal-info">
              <div className="info-box">
                <div className="info-label">Priority</div>
                <div className="info-value">
                  {selectedProblem.priority || "—"}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">AI Rank</div>
                <div className="info-value">{selectedProblem.rank ?? "—"}</div>
              </div>

              <div className="info-box">
                <div className="info-label">Category</div>
                <div className="info-value">
                  {selectedProblem.category || "—"}
                </div>
              </div>

              <div className="info-box">
                <div className="info-label">Status</div>
                <div className="info-value">
                  {selectedProblem.status || "—"}
                </div>
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
              <div className="modal-tags">
                {selectedProblem.aiTags.map((tag, index) => (
                  <span className="tag" key={index}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {selectedProblem.media?.length > 0 && (
              <div className="modal-media">
                <h4>ATTACHMENTS</h4>

                {selectedProblem.media.map((media, index) => (
                  <a
                    key={index}
                    className="media-link"
                    href={media.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ↗ {media.url}
                  </a>
                ))}
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
                getProblemSolutions(selectedProblem._id).map((solution) => (
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

                    {solution.attachments?.length > 0 && (
                      <div className="solution-attachments">
                        <div className="info-label">ATTACHMENTS</div>

                        {solution.attachments.map((attachment, index) => (
                          <a
                            key={index}
                            href={attachment}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                          >
                            ↗ Attachment {index + 1}
                          </a>
                        ))}
                      </div>
                    )}

                    {solution.status === "approved" ? (
                      <div className="approved-badge">
                        ✓ Approved by Citizen
                      </div>
                    ) : (
                      <>
                        <button
                          className="approve-button"
                          disabled={approvingSolution === solution._id}
                          onClick={() => approveSolution(solution._id)}
                        >
                          {approvingSolution === solution._id
                            ? "Approving..."
                            : "✓ Approve Solution"}
                        </button>

                        {approveError && (
                          <div className="approve-error">{approveError}</div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showReportForm && (
        <div
          className="report-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeReportForm();
            }
          }}
        >
          <div className="report-modal">
            {submitSuccess ? (
              <div className="success-screen">
                <div className="success-icon">✓</div>

                <h2>Problem submitted</h2>

                <p>
                  Your problem has been submitted successfully. Our AI is
                  analyzing it now.
                </p>
              </div>
            ) : (
              <>
                <div className="report-header">
                  <div>
                    <div className="eyebrow">Community Report</div>

                    <h2 className="report-title">Report a problem</h2>

                    <p className="report-subtitle">
                      Tell us about an issue in your community. Our AI will
                      analyze it and route it to the right university.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="close"
                    onClick={closeReportForm}
                  >
                    ×
                  </button>
                </div>

                <form className="report-form" onSubmit={handleSubmitProblem}>
                  {submitError && (
                    <div className="submit-error">{submitError}</div>
                  )}

                  <div className="ai-note">
                    <div className="ai-icon">✦</div>

                    <div className="ai-note-text">
                      <strong>AI-powered classification</strong>
                      <br />
                      You don't need to choose a category or priority. BriefIt
                      will automatically determine the category, rank, urgency,
                      tags and duplicate status.
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Problem title <span className="required">*</span>
                    </label>

                    <input
                      className="form-input"
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleFormChange}
                      placeholder="e.g. No clean drinking water in our village"
                      maxLength={150}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Describe the problem <span className="required">*</span>
                    </label>

                    <textarea
                      className="form-textarea"
                      name="description"
                      value={form.description}
                      onChange={handleFormChange}
                      placeholder="Explain what is happening, how long it has been happening, and how it is affecting people..."
                      maxLength={2000}
                    />

                    <div className="helper">{form.description.length}/2000</div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Location <span className="required">*</span>
                    </label>

                    <div className="location-grid">
                      <input
                        className="form-input"
                        type="text"
                        name="district"
                        value={form.district}
                        onChange={handleFormChange}
                        placeholder="District"
                      />

                      <input
                        className="form-input"
                        type="text"
                        name="block"
                        value={form.block}
                        onChange={handleFormChange}
                        placeholder="Block"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Supporting image</label>

                    <input
                      className="form-input"
                      type="url"
                      name="mediaUrl"
                      value={form.mediaUrl}
                      onChange={handleFormChange}
                      placeholder="https://example.com/problem.jpg"
                    />

                    <div className="helper">
                      Optional — add an image URL that helps explain the
                      problem.
                    </div>
                  </div>

                  <div
                    className="helper"
                    style={{
                      marginBottom: "20px",
                    }}
                  >
                    Submitting as{" "}
                    <strong
                      style={{
                        color: "#94a3b8",
                      }}
                    >
                      {user?.name || "Citizen"}
                    </strong>
                  </div>

                  <div className="report-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={closeReportForm}
                      disabled={submitting}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="submit-problem-button"
                      disabled={submitting}
                    >
                      {submitting
                        ? "Analyzing & submitting..."
                        : "Submit problem →"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
