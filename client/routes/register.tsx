import React, { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { LucideIcon } from "@site-builder/icons";
import { register } from "../src/lib/auth";

export const meta = {
  title: "Register | Oruma",
  description: "Create your Oruma account and begin your counselling journey.",
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({ email, password });
      navigate("/login", {
        state: { message: "Account created. Please login to continue." },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account right now.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8FBF8] font-body text-[#2E3E3C]">
      <Navbar />
      <section className="pt-32 md:pt-36 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
          <div className="bg-white border border-[#E2E8E6] rounded-[2rem] p-7 md:p-10 shadow-xl shadow-[#064F4B]/5">
            <Link to="/" className="inline-flex items-center gap-2 text-[#0A7F7A] text-xs font-black uppercase tracking-widest mb-8">
              <LucideIcon name="arrow-left" size={16} />
              Back to home
            </Link>

            <div className="mb-8">
              <p className="text-[#0A7F7A] text-[11px] font-black uppercase tracking-[0.22em] mb-3">
                Start gently
              </p>
              <h1 className="font-heading text-4xl md:text-5xl font-black text-[#064F4B] leading-tight">
                Create patient account
              </h1>
              <p className="mt-4 text-[#5F7F7A] leading-relaxed">
                Set up a private patient account to book sessions and connect with the right support.
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

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

              <div className="grid md:grid-cols-2 gap-4">
                <label className="block">
                  <span className="block text-xs font-black text-[#064F4B] uppercase tracking-widest mb-2">
                    Password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-2xl border border-[#DDE8E2] bg-white px-5 py-4 outline-none transition focus:border-[#0A7F7A] focus:ring-4 focus:ring-[#0A7F7A]/10"
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>

                <label className="block">
                  <span className="block text-xs font-black text-[#064F4B] uppercase tracking-widest mb-2">
                    Confirm
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border border-[#DDE8E2] bg-white px-5 py-4 outline-none transition focus:border-[#0A7F7A] focus:ring-4 focus:ring-[#0A7F7A]/10"
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0A7F7A] text-white rounded-full px-6 py-4 font-black uppercase tracking-widest text-xs shadow-lg shadow-[#0A7F7A]/20 transition hover:bg-[#064F4B] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm font-bold text-[#5F7F7A]">
              Already have an account?{" "}
              <Link to="/login" className="text-[#0A7F7A] hover:underline">
                Login
              </Link>
            </p>
          </div>

          <div className="hidden lg:block">
            <img
              src="/assets/hero-therapist-professional.webp"
              alt="Oruma therapist"
              className="w-full max-h-[650px] object-cover rounded-[2rem] shadow-2xl shadow-[#064F4B]/10"
            />
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
