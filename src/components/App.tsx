"use client";

import { useEffect } from "react";
import { useMiniApp } from "@neynar/react";
import { Header } from "~/components/ui/Header";
import { Footer } from "~/components/ui/Footer";
import { HomeTab, ActionsTab, ContextTab, WalletTab } from "~/components/ui/tabs";
import { useNeynarUser } from "../hooks/useNeynarUser";
// New tabs
import { DashboardTab } from "~/components/ui/tabs/DashboardTab";
import { LeaderboardTab } from "~/components/ui/tabs/LeaderboardTab";
import { RoundsTab } from "~/components/ui/tabs/RoundsTab";
import { RewardsTab } from "~/components/ui/tabs/RewardsTab";
import { ProfileTab } from "~/components/ui/tabs/ProfileTab";
import { TopSummaryBar } from "~/components/ui/TopSummaryBar";

// --- Types ---
export enum Tab {
  Home = "home",
  Actions = "actions",
  Context = "context",
  Wallet = "wallet",
  Dashboard = "dashboard",
  Leaderboard = "leaderboard",
  Rounds = "rounds",
  Rewards = "rewards",
  Profile = "profile",
}

export interface AppProps {
  title?: string;
}

/**
 * App component serves as the main container for the mini app interface.
 * 
 * This component orchestrates the overall mini app experience by:
 * - Managing tab navigation and state
 * - Handling Farcaster mini app initialization
 * - Coordinating wallet and context state
 * - Providing error handling and loading states
 * - Rendering the appropriate tab content based on user selection
 * 
 * The component integrates with the Neynar SDK for Farcaster functionality
 * and Wagmi for wallet management. It provides a complete mini app
 * experience with multiple tabs for different functionality areas.
 * 
 * Features:
 * - Tab-based navigation (Home, Actions, Context, Wallet)
 * - Farcaster mini app integration
 * - Wallet connection management
 * - Error handling and display
 * - Loading states for async operations
 * 
 * @param props - Component props
 * @param props.title - Optional title for the mini app (defaults to "Neynar Starter Kit")
 * 
 * @example
 * ```tsx
 * <App title="My Mini App" />
 * ```
 */
export default function App(
  { title: _title }: AppProps = { title: "Neynar Starter Kit" }
) {
  // --- Hooks ---
  const {
    isSDKLoaded,
    context,
    setInitialTab,
    setActiveTab,
    currentTab,
  } = useMiniApp();

  // --- Neynar user hook ---
  const { user: neynarUser } = useNeynarUser(context || undefined);

  // --- Effects ---
  /**
   * Sets the initial tab to "dashboard" when the SDK is loaded.
   * 
   * This effect ensures that users start on the dashboard tab when they first
   * load the mini app. It only runs when the SDK is fully loaded to
   * prevent errors during initialization.
   */
  useEffect(() => {
    if (isSDKLoaded) {
      setInitialTab(Tab.Dashboard);
    }
  }, [isSDKLoaded, setInitialTab]);

  // --- Early Returns ---
  if (!isSDKLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="spinner h-8 w-8 mx-auto mb-4" aria-hidden></div>
          <p>Loading SDK...</p>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      {/* Header should be full width */}
      <Header neynarUser={neynarUser} />
      {currentTab !== Tab.Home && <TopSummaryBar />}

      {/* Main content and footer should be centered */}
      <div className="container py-2 pb-20" role="main">
        {/* New core screens */}
        {currentTab === Tab.Dashboard && <DashboardTab />}
        {currentTab === Tab.Leaderboard && <LeaderboardTab />}
        {currentTab === Tab.Rounds && <RoundsTab />}
        {currentTab === Tab.Rewards && <RewardsTab />}
        {currentTab === Tab.Profile && <ProfileTab />}

        {/* Legacy tabs (optional/dev) */}
        {currentTab === Tab.Home && <HomeTab />}
        {currentTab === Tab.Actions && <ActionsTab />}
        {currentTab === Tab.Context && <ContextTab />}
        {currentTab === Tab.Wallet && <WalletTab />}

        {/* Footer with navigation */}
        <Footer activeTab={currentTab as Tab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
