import React, { useState } from "react";
import { LucideIcon } from "@site-builder/icons";

export default function MultiSelectDropdown({
  label,
  values,
  options,
  onChange,
  hint,
  allowCustom = true,
}: {
  label: string;
  values: string[];
  options: readonly string[];
  onChange: (values: string[]) => void;
  hint?: string;
  allowCustom?: boolean;
}) {
  const [customValue, setCustomValue] = useState("");
  const legacyValues = values.filter(
    (value) => !options.some((option) => option === value),
  );
  const availableOptions = [...legacyValues, ...options];

  const toggle = (option: string) => {
    onChange(
      values.includes(option)
        ? values.filter((value) => value !== option)
        : [...values, option],
    );
  };
  const addCustomValue = () => {
    const value = customValue.trim();
    if (!value || values.some((item) => item.toLowerCase() === value.toLowerCase()))
      return;
    onChange([...values, value]);
    setCustomValue("");
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-[#5F7F7A]">
        {label}
      </span>
      <details
        aria-label={`${label} options`}
        className="group relative rounded-lg border border-[#DDE8E5] bg-white open:border-[#0A7F7A]"
      >
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-bold text-[#064F4B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A7F7A]">
          <span className={values.length ? "" : "text-[#6F8581]"}>
            {values.length
              ? `${values.length} selected`
              : `Select ${label.toLowerCase()}`}
          </span>
          <LucideIcon
            name="chevron-down"
            size={17}
            className="shrink-0 transition-transform group-open:rotate-180"
          />
        </summary>
        <div className="z-20 max-h-64 overflow-y-auto border-t border-[#DDE8E5] bg-white p-2 shadow-xl md:absolute md:left-0 md:right-0 md:top-full md:mt-2 md:rounded-lg md:border">
          {availableOptions.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-[#31534E] hover:bg-[#F5F8F7]"
            >
              <input
                type="checkbox"
                checked={values.includes(option)}
                onChange={() => toggle(option)}
                className="h-4 w-4 accent-[#0A7F7A]"
              />
              {option}
            </label>
          ))}
          {allowCustom && (
            <div className="mt-2 flex gap-2 border-t border-[#DDE8E5] p-2 pt-3">
              <input
                value={customValue}
                maxLength={80}
                placeholder={`Add another ${label.toLowerCase()}`}
                onChange={(event) => setCustomValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addCustomValue();
                  }
                }}
                className="min-w-0 flex-1 rounded-lg border border-[#DDE8E5] px-3 py-2 text-sm font-bold outline-none focus:border-[#0A7F7A]"
              />
              <button
                type="button"
                onClick={addCustomValue}
                className="rounded-lg bg-[#064F4B] px-3 py-2 text-xs font-black uppercase text-white"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </details>
      {values.length > 0 && (
        <p className="text-xs font-bold leading-5 text-[#5F7F7A]">
          {values.join(", ")}
        </p>
      )}
      {hint && (
        <p className="text-xs font-medium leading-5 text-[#6F8581]">{hint}</p>
      )}
    </div>
  );
}
