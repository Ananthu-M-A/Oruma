import React, { FormEvent, useState } from "react";
import { LucideIcon } from "@site-builder/icons";
import PasswordInput from "./PasswordInput";
import { changePassword } from "../src/lib/auth";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setNotice("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSaving(true);

    try {
      const result = await changePassword({ currentPassword, newPassword });
      setNotice(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-[#E2E8E6] bg-[#FBFDFC] p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A7F7A]/10 text-[#0A7F7A]">
          <LucideIcon name="key-round" size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#0A7F7A]">Account security</p>
          <h3 className="mt-1 text-2xl font-heading font-black text-[#064F4B]">Change password</h3>
        </div>
      </div>

      {notice && <p className="mt-5 rounded-lg bg-[#EAF7F2] p-4 font-bold text-[#075E59]">{notice}</p>}
      {error && <p className="mt-5 rounded-lg bg-red-50 p-4 font-bold text-red-700">{error}</p>}

      <div className="mt-5 flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        <PasswordField
          label="Current password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
        />
        <PasswordField
          label="New password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm new password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#064F4B] px-6 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60 sm:w-auto"
      >
        <LucideIcon name="save" size={16} />
        {isSaving ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
}) {
  return (
    <PasswordInput
      label={label}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      required
      minLength={8}
      inputClassName="mt-2 rounded-lg border-[#DDE8E5] px-4 py-3 font-bold text-[#064F4B]"
    />
  );
}
