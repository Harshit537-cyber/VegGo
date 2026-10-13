import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../../layouts/Sidebar";
import SegmentedTabs from "../../../components/common/SegmentedTabs";
import { Wallet as WalletIcon, TrendingUp } from "lucide-react";
import Wallet from "./Wallet";
import PayoutRequests from "./PayoutRequests";

export default function Payouts({ defaultTab = "wallet" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(
    currentTabParam || defaultTab
  );

  useEffect(() => {
    if (currentTabParam && currentTabParam !== activeTab) {
      setActiveTab(currentTabParam);
    }
  }, [currentTabParam, activeTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    { id: "wallet", label: "Admin Wallet", icon: WalletIcon },
    { id: "payouts", label: "Payout Requests", icon: TrendingUp },
  ];

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-5 sm:space-y-6">
        {/* Horizontal Navigation Segmented Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
          <SegmentedTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Tab View Content */}
        <div className="w-full">
          {activeTab === "wallet" && <Wallet embedded={true} />}
          {activeTab === "payouts" && <PayoutRequests embedded={true} />}
        </div>
      </main>
    </div>
  );
}