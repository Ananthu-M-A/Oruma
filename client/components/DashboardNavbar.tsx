import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LucideIcon } from "@site-builder/icons";
import { AUTH_CHANGED_EVENT, AuthAccount, AuthRole, clearAccessToken, getCurrentUser, getMyAccount } from "../src/lib/auth";

const roleHome: Record<AuthRole, string> = {
  PATIENT: "/profile/patient",
  THERAPIST: "/profile/therapist",
  ADMIN: "/profile/admin",
};

export default function DashboardNavbar() {
  const user = getCurrentUser();
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const loadAccount = () => {
      getMyAccount()
        .then(setAccount)
        .catch(() => setAccount(null));
    };

    loadAccount();
    window.addEventListener(AUTH_CHANGED_EVENT, loadAccount);

    return () => window.removeEventListener(AUTH_CHANGED_EVENT, loadAccount);
  }, [user?.userId]);

  const handleLogout = () => {
    clearAccessToken();
    navigate("/login", { replace: true });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-[1000] border-b border-[#E2E8E6] bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to={user ? roleHome[user.role] : "/"} className="flex items-center gap-3">
          <img src="/assets/oruma-main-logo.webp" alt="Oruma Logo" className="h-10 w-auto object-contain" />
          <div>
            <p className="text-lg font-heading font-black uppercase leading-none text-[#01413D]">oruma</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#0A7F7A]">Dashboard</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {user?.role === "ADMIN" && (
            <>
              <Link to="/profile/admin" className="hidden rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest text-[#064F4B] hover:bg-[#F5F8F7] sm:inline-flex">
                Overview
              </Link>
              <Link to="/profile/admin/therapists" className="hidden rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest text-[#064F4B] hover:bg-[#F5F8F7] sm:inline-flex">
                Therapists
              </Link>
            </>
          )}
          {user?.role === "PATIENT" && (
            <Link to="/therapists" className="hidden rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest text-[#064F4B] hover:bg-[#F5F8F7] sm:inline-flex">
              Book
            </Link>
          )}
          {user && (
            <Link to={roleHome[user.role]} className="hidden rounded-full bg-[#F5F8F7] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#0A7F7A] md:inline-flex">
              {(account?.fullName || user.email).slice(0, 28)} · {user.role}
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#064F4B] text-white"
            title="Logout"
          >
            <LucideIcon name="log-out" size={16} />
          </button>
        </nav>
      </div>
    </header>
  );
}
