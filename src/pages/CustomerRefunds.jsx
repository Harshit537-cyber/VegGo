import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  CheckCircle,
  Clock3,
  IndianRupee,
  Loader2,
  AlertCircle,
  RotateCcw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

import { getPendingRefunds } from "../Api/payouts/customerRefunds";

const CustomerRefunds = () => {
  const [refunds, setRefunds] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // ==========================================
  // GET CREDIT TRANSACTIONS (= auto-refunds)
  // ==========================================
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPendingRefunds(page, 20);

      console.log("Wallet Credit Transactions (Refunds):", data);

      // Handle all possible response shapes from the backend
      let list = [];

      if (Array.isArray(data)) {
        list = data;
      } else if (Array.isArray(data?.content)) {
        list = data.content;
      } else if (Array.isArray(data?.data?.content)) {
        list = data.data.content;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.transactions)) {
        list = data.transactions;
      } else if (Array.isArray(data?.data?.transactions)) {
        list = data.data.transactions;
      }

      setRefunds(list);

      const pages =
        data?.totalPages ??
        data?.data?.totalPages ??
        data?.data?.page?.totalPages ??
        1;

      setTotalPages(Number(pages) || 1);
    } catch (err) {
      console.error("Refund fetch error:", err);
      setRefunds([]);
      setError(
        err.response?.data?.message ||
          "Failed to load refund transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INITIAL LOAD / PAGE CHANGE
  // ==========================================
  useEffect(() => {
    fetchRefunds();
  }, [page]);

  // ==========================================
  // FIELD HELPERS — handle variable API shapes
  // ==========================================

  const getTxId = (tx) =>
    tx?.id ?? tx?.transactionId ?? tx?.txId ?? "-";

  const getAmount = (tx) =>
    tx?.amount ?? tx?.creditAmount ?? tx?.transactionAmount ?? 0;

  const getReason = (tx) =>
    tx?.reason ??
    tx?.description ??
    tx?.narration ??
    tx?.remarks ??
    "Order Refund";

  const getBalanceAfter = (tx) =>
    tx?.balanceAfter ?? tx?.walletBalanceAfter ?? null;

  const getDate = (tx) => {
    const raw =
      tx?.createdAt ??
      tx?.transactionDate ??
      tx?.createdDate ??
      tx?.timestamp;

    if (!raw) return "-";

    return new Date(raw).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ==========================================
  // TOTAL CREDITED AMOUNT
  // ==========================================
  const totalCredited = refunds.reduce(
    (sum, tx) => sum + Number(getAmount(tx) || 0),
    0
  );

  return (
    <div className="flex min-h-screen bg-slate-100/70 text-slate-800">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-x-hidden">

        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="relative overflow-hidden rounded-3xl bg-emerald-950 p-6 lg:p-8 mb-8 shadow-xl shadow-emerald-950/10">

          {/* Decorative background */}
          <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute -left-20 -bottom-32 w-72 h-72 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                <RotateCcw size={13} />
                Refund Transactions
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Customer Refunds
              </h1>

              <p className="text-emerald-100/60 mt-2 max-w-xl text-sm sm:text-base">
                Wallet credit transactions — refunds are processed automatically when a customer cancels an order.
              </p>

              <div className="flex items-center gap-2 mt-4 text-xs text-emerald-200/50">
                <Clock3 size={14} />
                <span>
                  {new Date().toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <button
              onClick={fetchRefunds}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-950 font-bold text-sm hover:bg-emerald-50 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

          </div>
        </div>

        {/* ==========================================
            INFO BANNER — explain automatic refunds
        ========================================== */}
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-700 shadow-sm">
          <Info size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">
              Automatic Refund System
            </p>
            <p className="text-sm mt-0.5 text-blue-600">
              Refunds in VegGo are processed automatically to the customer's
              wallet when an order is cancelled. No manual approval is
              required. This page shows all wallet credit (refund) transactions.
            </p>
          </div>
        </div>

        {/* ==========================================
            ERROR
        ========================================== */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 shadow-sm">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">
                Failed to load refund transactions
              </p>
              <p className="text-sm mt-0.5 text-rose-600">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* ==========================================
            SUMMARY CARDS
        ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

          {/* TOTAL TRANSACTIONS */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400" />
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
                <RotateCcw size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Refund Entries
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">
                  {refunds.length}
                </p>
              </div>
            </div>
          </div>

          {/* TOTAL CREDITED */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <IndianRupee size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Refunded (This Page)
                </p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {formatAmount(totalCredited)}
                </p>
              </div>
            </div>
          </div>

          {/* STATUS */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500" />
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-teal-50 text-teal-600 border border-teal-100">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Processing Mode
                </p>
                <p className="text-2xl font-black text-teal-700 mt-1">
                  AUTO
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* ==========================================
            REFUND TABLE CARD
        ========================================== */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">

          {/* TABLE HEADER */}
          <div className="px-5 sm:px-6 py-5 border-b border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  Refund Transactions
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  All wallet credit entries (auto-refunds on order cancellation).
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
                <CheckCircle size={14} />
                Auto-Processed
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-left">

                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Transaction ID
                  </th>

                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Amount Refunded
                  </th>

                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Reason / Description
                  </th>

                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Balance After
                  </th>

                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Date & Time
                  </th>

                  <th className="px-6 py-4 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {/* LOADING */}
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                          <Loader2
                            size={30}
                            className="animate-spin text-emerald-600"
                          />
                        </div>
                        <p className="text-slate-600 font-semibold mt-4">
                          Loading refund transactions...
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Please wait while we fetch the latest data.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : refunds.length === 0 ? (

                  /* EMPTY */
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 rounded-2xl bg-slate-100 text-slate-400">
                          <FileText size={30} />
                        </div>
                        <p className="text-slate-700 font-bold mt-4">
                          No refund transactions found
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          Refunds appear here automatically when customers cancel orders.
                        </p>
                      </div>
                    </td>
                  </tr>

                ) : (

                  /* DATA ROWS */
                  refunds.map((tx, index) => {

                    const txId = getTxId(tx);
                    const balAfter = getBalanceAfter(tx);

                    return (
                      <tr
                        key={txId !== "-" ? txId : index}
                        className="border-b border-slate-100 last:border-0 hover:bg-emerald-50/30 transition-colors"
                      >

                        {/* TX ID */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono text-xs font-bold text-slate-600">
                            #{String(txId).slice(0, 12)}
                            {String(txId).length > 12 ? "…" : ""}
                          </span>
                        </td>

                        {/* AMOUNT */}
                        <td className="px-6 py-4">
                          <span className="font-black text-emerald-600">
                            + {formatAmount(getAmount(tx))}
                          </span>
                        </td>

                        {/* REASON */}
                        <td className="px-6 py-4 max-w-[260px]">
                          <span
                            title={getReason(tx)}
                            className="block text-sm font-medium text-slate-600 truncate"
                          >
                            {getReason(tx)}
                          </span>
                        </td>

                        {/* BALANCE AFTER */}
                        <td className="px-6 py-4">
                          {balAfter !== null ? (
                            <span className="font-semibold text-slate-700">
                              {formatAmount(balAfter)}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">—</span>
                          )}
                        </td>

                        {/* DATE */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                            {getDate(tx)}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                            <CheckCircle size={13} />
                            CREDITED
                          </span>
                        </td>

                      </tr>
                    );
                  })
                )}

              </tbody>

            </table>

          </div>

          {/* ==========================================
              PAGINATION
          ========================================== */}
          {!loading && refunds.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/70">

              <p className="text-sm font-medium text-slate-500">
                Page{" "}
                <span className="font-bold text-slate-800">
                  {page + 1}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">

                <button
                  onClick={() =>
                    setPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={page === 0}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  onClick={() =>
                    setPage((prev) =>
                      Math.min(totalPages - 1, prev + 1)
                    )
                  }
                  disabled={page >= totalPages - 1}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-bold hover:bg-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-sm"
                >
                  Next
                  <ChevronRight size={16} />
                </button>

              </div>

            </div>
          )}

        </div>

      </main>
    </div>
  );
};

export default CustomerRefunds;