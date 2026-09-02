import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PasswordInput from "../components/PasswordInput";
import { LucideIcon } from "@site-builder/icons";
import { getCurrentUser, getRedirectPathForRole, login, requestLoginOtp, saveAccessToken, verifyLoginOtp } from "../src/lib/auth";

type LocationState = {
  message?: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loginMode, setLoginMode] = useState<"otp" | "password">("otp");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(state?.message ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const result = await login({ email, password });
      if (result.accessToken) {
        saveAccessToken(result.accessToken);
      }
      const user = getCurrentUser();
      setSuccess("You are logged in. Redirecting...");
      setTimeout(() => navigate(getRedirectPathForRole(user?.role)), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRequestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const result = await requestLoginOtp({ identifier: otpIdentifier });
      setSuccess(result.message ?? "Login code sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send login code right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const result = await verifyLoginOtp({ identifier: otpIdentifier, code: otpCode });
      if (result.accessToken) {
        saveAccessToken(result.accessToken);
      }
      const user = getCurrentUser();
      setSuccess("You are logged in. Redirecting...");
      setTimeout(() => navigate(getRedirectPathForRole(user?.role)), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify login code right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="pt-32 md:pt-36 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-center">
          <div className="hidden lg:block">
            <img
              src="/assets/home-lady-striped-shirt-v2.webp"
              alt="Oruma counselling support"
              loading="lazy"
              decoding="async"
              className="w-full max-h-[620px] object-cover rounded-[2rem] shadow-2xl shadow-[#064F4B]/10"
            />
          </div>

          <div className="bg-white border border-[#E2E8E6] rounded-[2rem] p-7 md:p-10 shadow-xl shadow-[#064F4B]/5">
            <Link to="/" className="inline-flex items-center gap-2 text-[#0A7F7A] text-xs font-black uppercase tracking-widest mb-8">
              <LucideIcon name="arrow-left" size={16} />
              Back to home
            </Link>

            <div className="mb-8">
              <p className="text-[#0A7F7A] text-[11px] font-black uppercase tracking-[0.22em] mb-3">
                Welcome back
              </p>
              <h1 className="font-heading text-4xl md:text-5xl font-black text-[#064F4B] leading-tight">
                Login to Oruma
              </h1>
              <p className="mt-4 text-[#5F7F7A] leading-relaxed">
                Patients can continue with a otp login. Therapists and admins can use password login.
              </p>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-[#F5F8F7] p-1">
              <button
                type="button"
                onClick={() => setLoginMode("otp")}
                className={`rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition ${loginMode === "otp" ? "bg-white text-[#064F4B] shadow-sm" : "text-[#5F7F7A]"}`}
              >
                OTP
              </button>
              <button
                type="button"
                onClick={() => setLoginMode("password")}
                className={`rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition ${loginMode === "password" ? "bg-white text-[#064F4B] shadow-sm" : "text-[#5F7F7A]"}`}
              >
                Password
              </button>
            </div>

            {(success || error) && (
              <div
                className={`mb-6 rounded-2xl px-4 py-3 text-sm font-bold ${
                  error ? "bg-red-50 text-red-700" : "bg-[#0A7F7A]/10 text-[#064F4B]"
                }`}
              >
                {error || success}
              </div>
            )}

            {loginMode === "otp" && (
              <div className="space-y-5">
                <form className="space-y-5" onSubmit={handleRequestOtp}>
                  <label className="block">
                    <span className="block text-xs font-black text-[#064F4B] uppercase tracking-widest mb-2">
                      Email address
                    </span>
                    <input
                      type="email"
                      value={otpIdentifier}
                      onChange={(event) => setOtpIdentifier(event.target.value)}
                      className="w-full rounded-2xl border border-[#DDE8E2] bg-white px-5 py-4 outline-none transition focus:border-[#0A7F7A] focus:ring-4 focus:ring-[#0A7F7A]/10"
                      placeholder="you@example.com or +91..."
                      autoComplete="username"
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0A7F7A] text-white rounded-full px-6 py-4 font-black uppercase tracking-widest text-xs shadow-lg shadow-[#0A7F7A]/20 transition hover:bg-[#064F4B] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Sending..." : "Send login code"}
                  </button>
                </form>

                <form className="space-y-5" onSubmit={handleVerifyOtp}>
                  <label className="block">
                    <span className="block text-xs font-black text-[#064F4B] uppercase tracking-widest mb-2">
                      6-digit code
                    </span>
                    <input
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="w-full rounded-2xl border border-[#DDE8E2] bg-white px-5 py-4 outline-none transition focus:border-[#0A7F7A] focus:ring-4 focus:ring-[#0A7F7A]/10"
                      placeholder="123456"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      minLength={6}
                      required
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting || otpCode.length !== 6}
                    className="w-full bg-[#064F4B] text-white rounded-full px-6 py-4 font-black uppercase tracking-widest text-xs shadow-lg shadow-[#064F4B]/20 transition hover:bg-[#0A7F7A] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? "Verifying..." : "Login with code"}
                  </button>
                </form>
              </div>
            )}

            {loginMode === "password" && (
              <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="block text-xs font-black text-[#064F4B] uppercase tracking-widest mb-2">
                  Email address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-[#DDE8E2] bg-white px-5 py-4 outline-none transition focus:border-[#0A7F7A] focus:ring-4 focus:ring-[#0A7F7A]/10"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <PasswordInput
                label="Password"
                value={password}
                onChange={setPassword}
                placeholder="Minimum 8 characters"
                autoComplete="current-password"
                minLength={8}
                required
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0A7F7A] text-white rounded-full px-6 py-4 font-black uppercase tracking-widest text-xs shadow-lg shadow-[#0A7F7A]/20 transition hover:bg-[#064F4B] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
              </form>
            )}

            <p className="mt-8 text-center text-sm font-bold text-[#5F7F7A]">
              Patient without an account?{" "}
              <Link to="/register" className="text-[#0A7F7A] hover:underline">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
