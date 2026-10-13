import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Sidebar from "../../../layouts/Sidebar";
import SegmentedTabs from "../../../components/common/SegmentedTabs";
import { Store, Bike, User } from "lucide-react";
import Vendor from "../../vendors/pages/Vendor";
import Delivery from "../../delivery/pages/Delivery";
import Customer from "../../customers/pages/Customer";

export default function Management({ defaultTab = "vendors" }) {
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

  const managementTabs = [
    { id: "vendors", label: "Vendors / Stores", icon: Store },
    { id: "delivery", label: "Delivery Partners", icon: Bike },
    { id: "customers", label: "Customer Accounts", icon: User },
  ];

  return (
    <div className="min-h-dvh bg-[#f6f9f7] flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-100 selection:text-emerald-900">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-20 sm:pt-22 lg:pt-22 overflow-y-auto max-h-dvh w-full space-y-5 sm:space-y-6">
        {/* Horizontal Navigation Segmented Tabs Bar */}
        <div className="bg-white p-2 rounded-2xl border border-emerald-100/80 shadow-2xs">
          <SegmentedTabs
            tabs={managementTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>

        {/* Tab View Content */}
        <div className="w-full">
          {activeTab === "vendors" && <Vendor embedded={true} />}
          {activeTab === "delivery" && <Delivery embedded={true} />}
          {activeTab === "customers" && <Customer embedded={true} />}
        </div>
      </main>
    </div>
  );
}
