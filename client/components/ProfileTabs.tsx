import React from "react";

type ProfileTab = {
  id: string;
  label: string;
};

type ProfileTabsProps = {
  tabs: ProfileTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
};

export default function ProfileTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
}: ProfileTabsProps) {
  return (
    <nav
      aria-label="Profile sections"
      className={`flex max-w-full gap-2 overflow-x-auto border-b border-[#E2E8E6] pb-4 sm:flex-wrap ${className}`}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={isActive}
            className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-5 py-3 text-xs font-black uppercase tracking-widest transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A7F7A] ${
              isActive
                ? "bg-[#064F4B] text-white shadow-sm"
                : "bg-[#F5F8F7] text-[#064F4B] hover:bg-[#E8F2EE]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
