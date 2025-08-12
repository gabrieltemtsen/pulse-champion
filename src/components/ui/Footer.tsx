import React from "react";
import { Tab } from "~/components/App";

interface FooterProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const Footer: React.FC<FooterProps> = ({ activeTab, setActiveTab }) => (
  <nav
    className="fixed bottom-0 left-0 right-0 z-50"
    aria-label="Primary"
    style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.25rem)' }}
  >
    <div className="mx-4 mb-3 card glow-effect">
      <ul className="grid grid-cols-5 gap-1 items-center h-14" role="tablist">
        <li>
          <button
            type="button"
            onClick={() => setActiveTab(Tab.Dashboard)}
            className={`flex flex-col items-center justify-center w-full h-full focus-ring rounded-md transition-all duration-300 ${
              activeTab === Tab.Dashboard 
                ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transform scale-105 glow-effect' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            role="tab"
            aria-selected={activeTab === Tab.Dashboard}
            aria-current={activeTab === Tab.Dashboard ? 'page' : undefined}
          >
            <span className="text-xl" aria-hidden>📊</span>
            <span className="text-[10px] mt-1">Home</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setActiveTab(Tab.Leaderboard)}
            className={`flex flex-col items-center justify-center w-full h-full focus-ring rounded-md transition-all duration-300 ${
              activeTab === Tab.Leaderboard 
                ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transform scale-105 glow-effect' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            role="tab"
            aria-selected={activeTab === Tab.Leaderboard}
            aria-current={activeTab === Tab.Leaderboard ? 'page' : undefined}
          >
            <span className="text-xl" aria-hidden>🏆</span>
            <span className="text-[10px] mt-1">Leaders</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setActiveTab(Tab.Rounds)}
            className={`flex flex-col items-center justify-center w-full h-full focus-ring rounded-md transition-all duration-300 ${
              activeTab === Tab.Rounds 
                ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transform scale-105 glow-effect' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            role="tab"
            aria-selected={activeTab === Tab.Rounds}
            aria-current={activeTab === Tab.Rounds ? 'page' : undefined}
          >
            <span className="text-xl" aria-hidden>⏱️</span>
            <span className="text-[10px] mt-1">Rounds</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setActiveTab(Tab.Rewards)}
            className={`flex flex-col items-center justify-center w-full h-full focus-ring rounded-md transition-all duration-300 ${
              activeTab === Tab.Rewards 
                ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transform scale-105 glow-effect' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            role="tab"
            aria-selected={activeTab === Tab.Rewards}
            aria-current={activeTab === Tab.Rewards ? 'page' : undefined}
          >
            <span className="text-xl" aria-hidden>🎁</span>
            <span className="text-[10px] mt-1">Rewards</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => setActiveTab(Tab.Profile)}
            className={`flex flex-col items-center justify-center w-full h-full focus-ring rounded-md transition-all duration-300 ${
              activeTab === Tab.Profile 
                ? 'text-white bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg transform scale-105 glow-effect' 
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
            role="tab"
            aria-selected={activeTab === Tab.Profile}
            aria-current={activeTab === Tab.Profile ? 'page' : undefined}
          >
            <span className="text-xl" aria-hidden>👤</span>
            <span className="text-[10px] mt-1">Profile</span>
          </button>
        </li>
      </ul>
    </div>
  </nav>
);
