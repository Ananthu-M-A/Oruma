import React, { useState } from "react";

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  inputClassName?: string;
};

export default function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  required = false,
  minLength = 8,
  inputClassName,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-[#064F4B]">
        {label}
      </span>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full min-w-0 rounded-2xl border border-[#DDE8E2] bg-white px-5 py-4 pr-20 outline-none transition focus:border-[#0A7F7A] focus:ring-4 focus:ring-[#0A7F7A]/10 ${inputClassName ?? ""}`.trim()}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute inset-y-0 right-3 flex items-center text-xs font-black uppercase tracking-widest text-[#0A7F7A]"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </label>
  );
}
