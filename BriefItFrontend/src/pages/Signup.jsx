import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  const [role, setRole] = useState("citizen");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    domain: "",
    contact: "",
    logo: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     HANDLE INPUT
  ===================================================== */

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /* =====================================================
     HANDLE ROLE
  ===================================================== */

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
    setSuccess("");
  };

  /* =====================================================
     REGISTER
  ===================================================== */

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      /*
        Base payload required for every user.
      */

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: role,
      };

      /*
        University and Industry require
        additional information.
      */

      if (role === "university" || role === "industry") {
        payload.domain = form.domain
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        payload.contact = form.contact;
        payload.logo = form.logo;
      }

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to create account");
      }

      setSuccess("Account created successfully! Redirecting...");

      /*
        Don't automatically log the user in.
        Your backend registration API only creates
        the account and returns the user.
      */

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <style>{`

        * {
          box-sizing: border-box;
        }

        .signup-page {
          min-height: 100vh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 35px;

          background:
            radial-gradient(
              circle at 15% 20%,
              rgba(37,99,235,.18),
              transparent 32%
            ),
            radial-gradient(
              circle at 85% 80%,
              rgba(20,184,166,.12),
              transparent 32%
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

        /* =================================================
           CONTAINER
        ================================================= */

        .signup-container {
          width: 100%;

          max-width: 1100px;

          min-height: 650px;

          display: grid;

          grid-template-columns:
            0.85fr
            1.15fr;

          overflow: hidden;

          border:
            1px solid
            rgba(255,255,255,.08);

          border-radius: 30px;

          background:
            rgba(10,20,34,.82);

          box-shadow:
            0 35px 100px
            rgba(0,0,0,.45);

          backdrop-filter:
            blur(25px);
        }

        /* =================================================
           LEFT SIDE
        ================================================= */

        .signup-left {
          padding: 50px;

          display: flex;

          flex-direction: column;

          justify-content:
            space-between;

          background:
            radial-gradient(
              circle at 30% 30%,
              rgba(37,99,235,.16),
              transparent 40%
            );
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
            rgba(37,99,235,.3);
        }

        .brand span {
          color: #38bdf8;
        }

        .left-content {
          max-width: 420px;
        }

        .eyebrow {
          margin-bottom: 17px;

          color: #38bdf8;

          font-size: 11px;

          font-weight: 700;

          letter-spacing: 2px;

          text-transform:
            uppercase;
        }

        .left-content h1 {
          margin: 0;

          font-size:
            clamp(42px,4vw,62px);

          line-height: .98;

          letter-spacing: -4px;
        }

        .left-content h1 span {
          background:
            linear-gradient(
              90deg,
              #38bdf8,
              #2dd4bf
            );

          -webkit-background-clip:
            text;

          -webkit-text-fill-color:
            transparent;
        }

        .left-content p {
          margin-top: 25px;

          color: #64748b;

          font-size: 15px;

          line-height: 1.7;
        }

        .steps {
          margin-top: 35px;

          display: flex;

          flex-direction: column;

          gap: 16px;
        }

        .step {
          display: flex;

          align-items: center;

          gap: 12px;

          color: #7d8ba0;

          font-size: 12px;
        }

        .step-number {
          width: 28px;
          height: 28px;

          display: grid;

          place-items: center;

          border-radius: 8px;

          background:
            rgba(56,189,248,.07);

          border:
            1px solid
            rgba(56,189,248,.12);

          color: #38bdf8;

          font-size: 11px;

          font-weight: 700;
        }

        .copyright {
          color: #334155;

          font-size: 10px;
        }

        /* =================================================
           RIGHT SIDE
        ================================================= */

        .signup-right {
          padding: 45px;

          display: flex;

          align-items:
            center;

          justify-content:
            center;

          background:
            rgba(5,12,22,.35);
        }

        .signup-card {
          width: 100%;

          max-width: 510px;
        }

        .signup-header {
          margin-bottom: 27px;
        }

        .signup-header h2 {
          margin: 0;

          font-size: 30px;

          letter-spacing: -1px;
        }

        .signup-header p {
          margin-top: 7px;

          color: #64748b;

          font-size: 13px;
        }

        /* =================================================
           ROLE SELECTOR
        ================================================= */

        .role-title {
          margin-bottom: 9px;

          color: #aebaca;

          font-size: 11px;

          font-weight: 600;
        }

        .roles {
          display: grid;

          grid-template-columns:
            repeat(3,1fr);

          gap: 8px;

          margin-bottom: 23px;
        }

        .role {
          padding:
            14px 8px;

          border:
            1px solid
            #223047;

          border-radius: 12px;

          background:
            #081321;

          color: #64748b;

          text-align: center;

          cursor: pointer;

          transition: .2s;
        }

        .role:hover {
          border-color:
            #334155;

          color: #cbd5e1;
        }

        .role.active {
          border-color:
            #0ea5e9;

          background:
            rgba(14,165,233,.08);

          color: white;

          box-shadow:
            0 0 0 1px
            rgba(14,165,233,.05);
        }

        .role-icon {
          display: block;

          margin-bottom: 5px;

          font-size: 19px;
        }

        .role-name {
          font-size: 11px;

          font-weight: 700;
        }

        /* =================================================
           MESSAGES
        ================================================= */

        .error,
        .success {
          padding:
            12px 14px;

          margin-bottom: 18px;

          border-radius: 10px;

          font-size: 12px;
        }

        .error {
          border:
            1px solid
            rgba(239,68,68,.2);

          background:
            rgba(239,68,68,.08);

          color: #fca5a5;
        }

        .success {
          border:
            1px solid
            rgba(16,185,129,.2);

          background:
            rgba(16,185,129,.08);

          color: #6ee7b7;
        }

        /* =================================================
           FORM
        ================================================= */

        .form-grid {
          display: grid;

          grid-template-columns:
            repeat(2,1fr);

          gap:
            0 12px;
        }

        .field {
          margin-bottom: 17px;
        }

        .field.full {
          grid-column:
            1 / -1;
        }

        .field label {
          display: block;

          margin-bottom: 7px;

          color: #aebaca;

          font-size: 11px;

          font-weight: 600;
        }

        .field input {
          width: 100%;

          height: 47px;

          padding:
            0 13px;

          border:
            1px solid
            #223047;

          border-radius:
            10px;

          outline: none;

          background:
            #07111f;

          color: white;

          font-size: 13px;

          transition: .2s;
        }

        .field input::placeholder {
          color: #3f4d61;
        }

        .field input:focus {
          border-color:
            #0ea5e9;

          box-shadow:
            0 0 0 3px
            rgba(14,165,233,.06);
        }

        .field-hint {
          margin-top: 6px;

          color: #475569;

          font-size: 9px;
        }

        /* =================================================
           SUBMIT
        ================================================= */

        .signup-button {
          width: 100%;

          height: 50px;

          margin-top: 4px;

          border: none;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0891b2
            );

          color: white;

          font-size: 13px;

          font-weight: 750;

          cursor: pointer;

          box-shadow:
            0 10px 28px
            rgba(37,99,235,.2);

          transition: .2s;
        }

        .signup-button:hover {
          transform:
            translateY(-2px);

          box-shadow:
            0 15px 35px
            rgba(37,99,235,.3);
        }

        .signup-button:disabled {
          opacity: .55;

          cursor:
            not-allowed;

          transform: none;
        }

        /* =================================================
           LOGIN
        ================================================= */

        .login-link {
          margin-top: 19px;

          text-align:
            center;

          color: #536176;

          font-size: 12px;
        }

        .login-link button {
          margin-left: 5px;

          border: none;

          background:
            transparent;

          color: #38bdf8;

          font-weight: 700;

          cursor: pointer;
        }

        .login-link button:hover {
          text-decoration:
            underline;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media(max-width:850px) {

          .signup-page {
            padding: 20px;
          }

          .signup-container {
            grid-template-columns:
              1fr;
          }

          .signup-left {
            min-height: 360px;

            padding: 35px;
          }

          .left-content {
            margin-top: 50px;
          }

          .copyright {
            display: none;
          }

        }

        @media(max-width:600px) {

          .signup-page {
            padding: 0;
          }

          .signup-container {
            min-height: 100vh;

            border: none;

            border-radius: 0;
          }

          .signup-left {
            min-height: auto;

            padding: 28px;
          }

          .left-content {
            margin-top: 45px;
          }

          .left-content h1 {
            font-size: 43px;

            letter-spacing: -3px;
          }

          .steps {
            display: none;
          }

          .signup-right {
            padding:
              30px 22px 45px;
          }

          .roles {
            grid-template-columns:
              1fr;
          }

          .role {
            display: flex;

            align-items: center;

            justify-content:
              center;

            gap: 8px;

            padding: 11px;
          }

          .role-icon {
            margin: 0;
          }

          .form-grid {
            grid-template-columns:
              1fr;
          }

          .field.full {
            grid-column:
              auto;
          }

        }

      `}</style>

      <div className="signup-container">
        {/* =================================================
            LEFT
        ================================================= */}

        <section className="signup-left">
          <div className="brand">
            <div className="brand-icon">✦</div>

            <div>
              Brief<span>It</span>
            </div>
          </div>

          <div className="left-content">
            <div className="eyebrow">Join the ecosystem</div>

            <h1>
              Your role.
              <br />
              Your <span>impact.</span>
            </h1>

            <p>
              BriefIt brings citizens, universities and industries together to
              turn real community problems into meaningful solutions.
            </p>

            <div className="steps">
              <div className="step">
                <div className="step-number">01</div>
                Tell us who you are
              </div>

              <div className="step">
                <div className="step-number">02</div>
                Discover opportunities
              </div>

              <div className="step">
                <div className="step-number">03</div>
                Create real-world impact
              </div>
            </div>
          </div>

          <div className="copyright">© 2026 BriefIt</div>
        </section>

        {/* =================================================
            RIGHT
        ================================================= */}

        <section className="signup-right">
          <form className="signup-card" onSubmit={handleSignup}>
            <div className="signup-header">
              <h2>Create your account</h2>

              <p>Choose your role to get started.</p>
            </div>

            {/* ROLE */}

            <div className="role-title">I am joining as</div>

            <div className="roles">
              <div
                className={`role ${role === "citizen" ? "active" : ""}`}
                onClick={() => handleRoleChange("citizen")}
              >
                <span className="role-icon">◉</span>

                <span className="role-name">Citizen</span>
              </div>

              <div
                className={`role ${role === "university" ? "active" : ""}`}
                onClick={() => handleRoleChange("university")}
              >
                <span className="role-icon">🎓</span>

                <span className="role-name">University</span>
              </div>

              <div
                className={`role ${role === "industry" ? "active" : ""}`}
                onClick={() => handleRoleChange("industry")}
              >
                <span className="role-icon">◈</span>

                <span className="role-name">Industry</span>
              </div>
            </div>

            {/* MESSAGES */}

            {error && <div className="error">{error}</div>}

            {success && <div className="success">{success}</div>}

            {/* FORM */}

            <div className="form-grid">
              {/* NAME */}

              <div className="field full">
                <label>
                  {role === "citizen" ? "Full name" : "Organization name"}
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={
                    role === "citizen"
                      ? "Ravi Kumar"
                      : role === "university"
                        ? "BIT Mesra"
                        : "GreenTech Pvt Ltd"
                  }
                  required
                />
              </div>

              {/* EMAIL */}

              <div className="field">
                <label>Email address</label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* PASSWORD */}

              <div className="field">
                <label>Password</label>

                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              {/* EXTRA FIELDS */}

              {(role === "university" || role === "industry") && (
                <>
                  {/* DOMAIN */}

                  <div className="field full">
                    <label>Domains</label>

                    <input
                      type="text"
                      name="domain"
                      value={form.domain}
                      onChange={handleChange}
                      placeholder="water, environment"
                      required
                    />

                    <div className="field-hint">
                      Separate multiple domains with commas.
                    </div>
                  </div>

                  {/* CONTACT */}

                  <div className="field">
                    <label>Contact number</label>

                    <input
                      type="tel"
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  {/* LOGO */}

                  <div className="field">
                    <label>Logo URL</label>

                    <input
                      type="url"
                      name="logo"
                      value={form.logo}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}
            </div>

            {/* BUTTON */}

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? "Creating account..." : "Create account  →"}
            </button>

            {/* LOGIN */}

            <div className="login-link">
              Already have an account?
              <button type="button" onClick={() => navigate("/")}>
                Sign in
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
