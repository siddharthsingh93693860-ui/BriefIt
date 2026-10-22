import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Invalid email or password");
      }

      // Store complete user returned by backend
      localStorage.setItem("briefit_user", JSON.stringify(data.user));

      // Redirect according to role
      if (data.user.role === "citizen") {
        navigate("/feed");
      } else if (data.user.role === "university") {
        navigate("/university");
      } else if (data.user.role === "industry") {
        navigate("/industry");
      } else if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          background: #050b14;
          color: #ffffff;
          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
          overflow: hidden;
        }

        /* ================= LEFT ================= */

        .login-left {
          width: 55%;
          min-height: 100vh;
          padding: 42px 6%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;

          background:
            radial-gradient(
              circle at 15% 30%,
              rgba(37, 99, 235, 0.22),
              transparent 35%
            ),
            radial-gradient(
              circle at 80% 80%,
              rgba(20, 184, 166, 0.12),
              transparent 30%
            );
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;

          font-size: 23px;
          font-weight: 800;
          letter-spacing: -1px;
        }

        .brand-icon {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background: linear-gradient(
            135deg,
            #2563eb,
            #06b6d4
          );

          box-shadow:
            0 10px 30px rgba(37, 99, 235, 0.3);
        }

        .brand span {
          color: #38bdf8;
        }

        .hero {
          max-width: 650px;
        }

        .eyebrow {
          margin-bottom: 20px;

          color: #38bdf8;

          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        .hero h1 {
          margin: 0;

          font-size: clamp(48px, 5.5vw, 78px);
          line-height: 0.98;
          letter-spacing: -5px;
        }

        .hero h1 span {
          background: linear-gradient(
            90deg,
            #38bdf8,
            #22d3ee,
            #2dd4bf
          );

          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-text {
          max-width: 560px;

          margin-top: 28px;

          color: #718096;

          font-size: 17px;
          line-height: 1.7;
        }

        .features {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;

          margin-top: 30px;
        }

        .feature {
          padding: 9px 13px;

          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;

          background: rgba(255,255,255,0.035);

          color: #a7b2c3;
          font-size: 12px;
        }

        .copyright {
          color: #334155;
          font-size: 11px;
        }

        /* ================= RIGHT ================= */

        .login-right {
          width: 45%;
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 35px;

          background:
            radial-gradient(
              circle at 50% 50%,
              rgba(15, 23, 42, 0.6),
              transparent 60%
            );
        }

        .login-card {
          width: 100%;
          max-width: 430px;

          padding: 42px;

          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 28px;

          background:
            linear-gradient(
              145deg,
              rgba(18,31,51,0.9),
              rgba(8,17,30,0.9)
            );

          box-shadow:
            0 35px 90px rgba(0,0,0,0.45),
            inset 0 1px 0 rgba(255,255,255,0.04);

          backdrop-filter: blur(25px);
        }

        .login-card h2 {
          margin: 0;

          font-size: 31px;
          letter-spacing: -1px;
        }

        .subtitle {
          margin: 8px 0 30px;

          color: #64748b;

          font-size: 14px;
        }

        /* ================= ERROR ================= */

        .error {
          margin-bottom: 18px;
          padding: 12px 14px;

          border: 1px solid rgba(239,68,68,0.2);
          border-radius: 11px;

          background: rgba(239,68,68,0.08);

          color: #fca5a5;
          font-size: 13px;
        }

        /* ================= INPUT ================= */

        .field {
          margin-bottom: 19px;
        }

        .field label {
          display: block;

          margin-bottom: 8px;

          color: #aebaca;

          font-size: 12px;
          font-weight: 600;
        }

        .field input {
          width: 100%;
          height: 50px;

          padding: 0 15px;

          border: 1px solid #223047;
          border-radius: 12px;

          outline: none;

          background: rgba(5,12,22,0.8);

          color: white;

          font-size: 14px;

          transition: 0.2s;
        }

        .field input::placeholder {
          color: #3f4d61;
        }

        .field input:focus {
          border-color: #0ea5e9;

          box-shadow:
            0 0 0 3px rgba(14,165,233,0.08);
        }

        /* ================= BUTTON ================= */

        .login-button {
          width: 100%;
          height: 52px;

          margin-top: 5px;

          border: none;
          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0891b2
            );

          color: white;

          font-size: 14px;
          font-weight: 750;

          cursor: pointer;

          box-shadow:
            0 10px 30px rgba(37,99,235,0.2);

          transition: 0.2s;
        }

        .login-button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 15px 35px rgba(37,99,235,0.35);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* ================= SIGNUP ================= */

        .signup {
          margin-top: 24px;

          text-align: center;

          color: #536176;
          font-size: 13px;
        }

        .signup button {
          margin-left: 5px;

          border: none;
          background: transparent;

          color: #38bdf8;

          font-weight: 700;

          cursor: pointer;
        }

        .signup button:hover {
          text-decoration: underline;
        }

        /* ================= RESPONSIVE ================= */

        @media (max-width: 900px) {
          .login-page {
            display: block;
            overflow: auto;
          }

          .login-left {
            width: 100%;
            min-height: auto;

            padding: 30px 35px;
          }

          .hero {
            margin-top: 70px;
            margin-bottom: 60px;
          }

          .login-right {
            width: 100%;
            min-height: auto;

            padding: 30px 25px 60px;
          }
        }

        @media (max-width: 550px) {
          .login-left {
            padding: 25px;
          }

          .login-right {
            padding: 20px;
          }

          .login-card {
            padding: 28px 22px;
            border-radius: 22px;
          }

          .hero h1 {
            font-size: 45px;
            letter-spacing: -3px;
          }

          .hero-text {
            font-size: 15px;
          }
        }
      `}</style>

      {/* ================= LEFT SIDE ================= */}

      <section className="login-left">
        <div className="brand">
          <div className="brand-icon">✦</div>

          <div>
            Brief<span>It</span>
          </div>
        </div>

        <div className="hero">
          <div className="eyebrow">Community × Innovation</div>

          <h1>
            Turn problems
            <br />
            into <span>progress.</span>
          </h1>

          <p className="hero-text">
            BriefIt connects citizens, universities and industries to transform
            real-world problems into practical solutions.
          </p>

          <div className="features">
            <div className="feature">✦ AI assisted</div>

            <div className="feature">◉ Community driven</div>

            <div className="feature">⌁ Impact focused</div>
          </div>
        </div>

        <div className="copyright">
          © 2026 BriefIt · Building solutions that matter
        </div>
      </section>

      {/* ================= LOGIN ================= */}

      <section className="login-right">
        <form className="login-card" onSubmit={handleLogin}>
          <h2>Welcome back</h2>

          <p className="subtitle">Sign in to continue to your workspace.</p>

          {error && <div className="error">{error}</div>}

          <div className="field">
            <label>Email address</label>

            <input
              type="email"
              name="email"
              placeholder="ravi@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="field">
            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign in  →"}
          </button>

          <div className="signup">
            Don't have an account?
            <button type="button" onClick={() => navigate("/signup")}>
              Create account
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
