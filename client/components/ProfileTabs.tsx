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

export default function ProfileTabs({ tabs, activeTab, onChange, className = "" }: ProfileTabsProps) {
  return (
    <div className={`flex flex-wrap gap-2 border-b border-[#E2E8E6] pb-4 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-full px-5 py-3 text-xs font-black uppercase tracking-widest transition ${
              isActive
                ? "bg-[#064F4B] text-white shadow-sm"
                : "bg-[#F5F8F7] text-[#064F4B] hover:bg-[#E8F2EE]"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
