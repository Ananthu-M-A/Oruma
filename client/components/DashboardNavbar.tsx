import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LucideIcon } from "@site-builder/icons";
import { AUTH_CHANGED_EVENT, AuthAccount, AuthRole, clearAccessToken, getAccessToken, getCurrentUser, getMyAccount } from "../src/lib/auth";
import {
  AppNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../src/lib/notifications";
import { IST_TIME_ZONE } from "../src/lib/dateTime";

const roleHome: Record<AuthRole, string> = {
  PATIENT: "/profile/patient",
  THERAPIST: "/profile/therapist",
  ADMIN: "/profile/admin",
};

export default function DashboardNavbar() {
  const user = getCurrentUser();
  const [account, setAccount] = useState<AuthAccount | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
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

  const loadNotifications = () => {
    const token = getAccessToken();
    if (!token) return;

    setIsNotificationsLoading(true);
    getNotifications(token)
      .then(setNotifications)
      .catch(() => setNotifications([]))
      .finally(() => setIsNotificationsLoading(false));
  };

  useEffect(() => {
    if (!user) return;

    loadNotifications();
    const interval = window.setInterval(loadNotifications, 60_000);

    return () => window.clearInterval(interval);
  }, [user?.userId]);

  const handleLogout = () => {
    clearAccessToken();
    navigate("/login", { replace: true });
  };

  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  const handleMarkRead = async (notification: AppNotification) => {
    if (notification.readAt) return;
    const token = getAccessToken();
    if (!token) return;

    setNotifications((current) =>
      current.map((item) =>
        item.id === notification.id ? { ...item, readAt: new Date().toISOString() } : item,
      ),
    );
    await markNotificationRead(token, notification.id).catch(loadNotifications);
  };

  const handleMarkAllRead = async () => {
    const token = getAccessToken();
    if (!token) return;

    const readAt = new Date().toISOString();
    setNotifications((current) => current.map((item) => ({ ...item, readAt })));
    await markAllNotificationsRead(token).catch(loadNotifications);
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
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((current) => !current)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E2E8E6] bg-white text-[#064F4B] hover:bg-[#F5F8F7]"
              title="Notifications"
              aria-label="Notifications"
              aria-expanded={isNotificationsOpen}
            >
              <LucideIcon name="bell" size={17} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D9480F] px-1 text-[10px] font-black leading-none text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[#E2E8E6] bg-white shadow-2xl shadow-[#064F4B]/10">
                <div className="flex items-center justify-between border-b border-[#E2E8E6] px-4 py-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
                      Notifications
                    </p>
                    <p className="mt-1 text-xs font-bold text-[#5F7F7A]">
                      {unreadCount} unread
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    className="rounded-full bg-[#F5F8F7] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#064F4B] disabled:opacity-40"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isNotificationsLoading && notifications.length === 0 && (
                    <p className="p-5 text-sm font-bold text-[#5F7F7A]">Loading notifications...</p>
                  )}
                  {!isNotificationsLoading && notifications.length === 0 && (
                    <p className="p-5 text-sm font-bold text-[#5F7F7A]">No notifications yet.</p>
                  )}
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onOpen={() => {
                        void handleMarkRead(notification);
                        setIsNotificationsOpen(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
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

function NotificationItem({
  notification,
  onOpen,
}: {
  notification: AppNotification;
  onOpen: () => void;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <span
        className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
          notification.readAt ? "bg-[#DDE8E5]" : "bg-[#0A7F7A]"
        }`}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-sm font-black text-[#064F4B]">{notification.title}</p>
          <p className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
            {formatNotificationTime(notification.createdAt)}
          </p>
        </div>
        <p className="mt-1 line-clamp-2 text-xs font-bold leading-relaxed text-[#5F7F7A]">
          {notification.body}
        </p>
        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">
          {notification.type.toLowerCase()}
        </p>
      </div>
    </div>
  );

  const className = `block w-full border-b border-[#E2E8E6] px-4 py-3 text-left last:border-b-0 ${
    notification.readAt ? "bg-white" : "bg-[#F5F8F7]"
  } hover:bg-[#EAF7F2]`;

  if (notification.actionUrl) {
    return (
      <Link to={notification.actionUrl} onClick={onOpen} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onOpen} className={className}>
      {content}
    </button>
  );
}

function formatNotificationTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "Now";
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;

  return date.toLocaleDateString("en-IN", {
    timeZone: IST_TIME_ZONE,
    day: "numeric",
    month: "short",
  });
}
