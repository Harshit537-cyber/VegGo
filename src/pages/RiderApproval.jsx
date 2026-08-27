import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import RiderModal from '../Models/RiderModal';

import {
  Calendar,
  RefreshCw,
  Check,
  X,
  Truck,
  Clock,
  Eye,
  ShieldCheck,
  Loader2
} from 'lucide-react';

import {
  getPendingDeliveryKyc,
  approveDeliveryKyc,
  rejectDeliveryKyc
} from '../Api/deliveryPartnerKyc/deliveryPartnerKycService';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (!value) {
      setDisplayValue('');
      return;
    }

    const match = String(value).match(/([\d,.]+)\s*(.*)/);

    if (!match) {
      setDisplayValue(value);
      return;
    }

    const rawNumberStr = match[1].replace(/,/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';

    if (Number.isNaN(targetNum)) {
      setDisplayValue(value);
      return;
    }

    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    const duration = 800;
    const startTime = performance.now();

    let animationFrameId;

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

      const currentVal = easeProgress * targetNum;

      let formatted;

      if (isDecimal) {
        formatted = currentVal.toFixed(2);
      } else {
        formatted = Math.floor(currentVal).toString();
      }

      if (hasComma) {
        const parts = formatted.split('.');
        parts[0] = parseInt(
          parts[0],
          10
        ).toLocaleString('en-IN');

        formatted = parts.join('.');
      }

      setDisplayValue(
        `${formatted}${suffix ? ` ${suffix}` : ''}`
      );

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(value);
      }
    };

    animationFrameId =
      requestAnimationFrame(updateCount);

    return () =>
      cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

export default function RiderApproval() {
  const [currentTab, setCurrentTab] =
    useState('rider-approval');

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(null);

  const [selectedRider, setSelectedRider] =
    useState(null);

  const [applicants, setApplicants] =
    useState([]);

  // ==============================
  // FETCH PENDING DELIVERY KYC
  // ==============================

  const fetchApplicants = async () => {
    try {
      setLoading(true);

      const response =
        await getPendingDeliveryKyc({
          page: 0,
          size: 20
        });

      console.log(
        'Pending Delivery KYC Response:',
        response
      );

      const list =
        response?.data?.content ||
        response?.content ||
        [];

      setApplicants(
        Array.isArray(list) ? list : []
      );
    } catch (error) {
      console.error(
        'Failed to fetch pending Delivery KYC:',
        error
      );

      console.error(
        'API Error Response:',
        error?.response?.data
      );

      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // ==============================
  // REFRESH
  // ==============================

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      await fetchApplicants();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // ==============================
  // APPROVE KYC
  // ==============================

  const handleApprove = async (userId) => {
    if (!userId) {
      alert('Delivery partner ID is missing');
      return;
    }

    try {
      setActionLoading(`approve-${userId}`);

      console.log(
        'Approving Delivery KYC:',
        userId
      );

      await approveDeliveryKyc(userId);

      setApplicants((prev) =>
        prev.filter(
          (rider) =>
            rider.userId !== userId &&
            rider.deliveryPartnerUserId !== userId
        )
      );

      setSelectedRider(null);
    } catch (error) {
      console.error(
        'Failed to approve Delivery KYC:',
        error
      );

      alert(
        error?.response?.data?.message ||
          'Failed to approve Delivery KYC'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ==============================
  // REJECT KYC
  // ==============================

  const handleReject = async (userId) => {
    if (!userId) {
      alert('Delivery partner ID is missing');
      return;
    }

    try {
      setActionLoading(`reject-${userId}`);

      console.log(
        'Rejecting Delivery KYC:',
        userId
      );

      await rejectDeliveryKyc(userId);

      setApplicants((prev) =>
        prev.filter(
          (rider) =>
            rider.userId !== userId &&
            rider.deliveryPartnerUserId !== userId
        )
      );

      setSelectedRider(null);
    } catch (error) {
      console.error(
        'Failed to reject Delivery KYC:',
        error
      );

      alert(
        error?.response?.data?.message ||
          'Failed to reject Delivery KYC'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = applicants.length;

  // ==============================
  // STATS
  // ==============================

  const riderStats = [
    {
      label: 'Awaiting Verification',
      value: `${pendingCount} Applicants`,
      cardBg:
        'bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-transparent',
      cardBorder: 'border-amber-500/20',
      iconBg:
        'bg-amber-500/15 text-amber-700',
      icon: Clock
    },
    {
      label: 'Riders Activated Today',
      value: '34 Couriers',
      cardBg:
        'bg-gradient-to-br from-emerald-500/10 via-emerald-400/5 to-transparent',
      cardBorder: 'border-emerald-500/20',
      iconBg:
        'bg-emerald-500/15 text-emerald-700',
      icon: Truck
    },
    {
      label: 'Background Pass Rate',
      value: '98.2% Passing',
      cardBg:
        'bg-gradient-to-br from-teal-500/10 via-teal-400/5 to-transparent',
      cardBorder: 'border-teal-500/20',
      iconBg:
        'bg-teal-500/15 text-teal-700',
      icon: ShieldCheck
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/10 to-teal-50/20 flex font-sans antialiased text-slate-800">

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto max-h-screen">

        {/* ================= HEADER ================= */}

        <header className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white shadow-lg overflow-hidden border border-emerald-700/30">

          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:16px_24px] pointer-events-none" />

          <div className="space-y-4 z-10 flex-1">

            <div className="flex flex-wrap items-center gap-3">

              <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-100 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/15">
                Logistics Fleet Onboarding
              </span>

              <div className="flex items-center gap-3 bg-rose-950/60 backdrop-blur-md border border-rose-500/30 px-3.5 py-1.5 rounded-full text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.2)] max-w-[190px] overflow-hidden">

                <span className="relative flex h-3.5 w-3.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 shadow-[0_0_8px_#f43f5e] border border-white/20" />
                </span>

                <div className="overflow-hidden whitespace-nowrap text-[11px] font-black uppercase tracking-widest text-white w-full">
                  <marquee
                    scrollamount="3.5"
                    className="leading-none"
                  >
                    LIVE ADMIN VEG GO
                  </marquee>
                </div>

              </div>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
              Rider Approvals
            </h1>

            <p className="text-emerald-100/80 text-sm font-medium">
              Review and verify pending delivery partner KYC applications.
            </p>

          </div>

          <div className="flex items-center gap-3 z-10">

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm text-sm font-bold text-emerald-50">
              <Calendar
                size={16}
                className="text-emerald-300"
              />

              <span>
                Aug 26, 2026
              </span>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-3 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl hover:bg-white/20 transition-all duration-300 active:scale-95 shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 group disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing
                    ? 'rotate-180'
                    : 'group-hover:rotate-45'
                }`}
              />
            </button>

          </div>
        </header>

        {/* ================= STATS ================= */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">

          {riderStats.map((stat, idx) => {
            const IconComponent = stat.icon;

            return (
              <div
                key={idx}
                className={`${stat.cardBg} ${stat.cardBorder} p-6 rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-between group relative overflow-hidden`}
              >

                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-125 pointer-events-none" />

                <div>
                  <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {stat.label}
                  </p>

                  <h3 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                    <AnimatedValue
                      value={stat.value}
                    />
                  </h3>
                </div>

                <div
                  className={`${stat.iconBg} p-4 rounded-2xl border border-white/10 shadow-sm z-10`}
                >
                  <IconComponent size={22} />
                </div>

              </div>
            );
          })}

        </section>

        {/* ================= TABLE ================= */}

        <section className="bg-white rounded-3xl border border-emerald-100/50 shadow-sm p-6 md:p-8">

          <div className="flex items-center justify-between mb-8">

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Pending Logistics Onboarding Registry
              </h2>

              <p className="text-xs text-slate-400 mt-1">
                Delivery partners waiting for KYC verification
              </p>
            </div>

            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
              Queue Depth: {pendingCount}
            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left border-collapse">

              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase font-bold tracking-widest text-slate-400">

                  <th className="pb-4">
                    Applicant Driver
                  </th>

                  <th className="pb-4">
                    Phone
                  </th>

                  <th className="pb-4">
                    Vehicle
                  </th>

                  <th className="pb-4">
                    Application Date
                  </th>

                  <th className="pb-4 text-right">
                    Verification Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100/60">

                {/* LOADING */}

                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="py-16 text-center"
                    >
                      <div className="flex justify-center items-center gap-3 text-emerald-600">

                        <Loader2
                          size={22}
                          className="animate-spin"
                        />

                        <span className="font-bold">
                          Loading pending riders...
                        </span>

                      </div>
                    </td>
                  </tr>

                ) : applicants.length === 0 ? (

                  /* EMPTY */

                  <tr>
                    <td
                      colSpan="5"
                      className="py-16 text-center"
                    >

                      <div className="flex flex-col items-center gap-3">

                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center">
                          <ShieldCheck
                            size={26}
                            className="text-emerald-500"
                          />
                        </div>

                        <p className="text-slate-500 font-bold text-sm">
                          No pending rider registrations remaining.
                        </p>

                        <button
                          onClick={handleRefresh}
                          className="text-emerald-600 text-xs font-bold hover:underline"
                        >
                          Refresh Queue
                        </button>

                      </div>

                    </td>
                  </tr>

                ) : (

                  /* DATA */

                  applicants.map((rider, index) => {

                    const riderId =
                      rider.userId ||
                      rider.deliveryPartnerUserId ||
                      rider.id;

                    return (
                      <tr
                        key={
                          riderId ||
                          index
                        }
                        className="text-sm font-semibold text-slate-600 hover:bg-emerald-50/20 transition-colors"
                      >

                        {/* NAME */}

                        <td className="py-4 font-bold text-slate-900">
                          {rider.fullName ||
                            rider.name ||
                            rider.ownerName ||
                            'Unknown Rider'}
                        </td>

                        {/* PHONE */}

                        <td className="py-4 text-slate-500">
                          {rider.phone ||
                            rider.mobile ||
                            rider.phoneNumber ||
                            '-'}
                        </td>

                        {/* VEHICLE */}

                        <td className="py-4">

                          <div className="flex flex-col">

                            <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-lg text-xs font-bold w-fit">
                              {rider.vehicleType ||
                                rider.vehicle?.type ||
                                '-'}
                            </span>

                            <span className="text-xs text-slate-400 mt-1">
                              {rider.vehicleModel ||
                                rider.vehicle?.model ||
                                '-'}
                            </span>

                          </div>

                        </td>

                        {/* DATE */}

                        <td className="py-4 text-xs text-slate-400 font-medium">

                          {rider.submittedAt ||
                          rider.createdAt ? (
                            new Date(
                              rider.submittedAt ||
                                rider.createdAt
                            ).toLocaleDateString(
                              'en-IN'
                            )
                          ) : (
                            '-'
                          )}

                        </td>

                        {/* ACTIONS */}

                        <td className="py-4 text-right space-x-2">

                          {/* VIEW */}

                          <button
                            onClick={() =>
                              setSelectedRider(
                                rider
                              )
                            }
                            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-600 transition-all"
                            title="View KYC"
                          >
                            <Eye size={16} />
                          </button>

                          {/* APPROVE */}

                          <button
                            onClick={() =>
                              handleApprove(
                                riderId
                              )
                            }
                            disabled={
                              !riderId ||
                              actionLoading ===
                                `approve-${riderId}`
                            }
                            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200/50 transition-all disabled:opacity-50"
                            title="Approve KYC"
                          >

                            {actionLoading ===
                            `approve-${riderId}` ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Check
                                size={16}
                              />
                            )}

                          </button>

                          {/* REJECT */}

                          <button
                            onClick={() =>
                              handleReject(
                                riderId
                              )
                            }
                            disabled={
                              !riderId ||
                              actionLoading ===
                                `reject-${riderId}`
                            }
                            className="inline-flex items-center justify-center p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/50 transition-all disabled:opacity-50"
                            title="Reject KYC"
                          >

                            {actionLoading ===
                            `reject-${riderId}` ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <X size={16} />
                            )}

                          </button>

                        </td>

                      </tr>
                    );
                  })

                )}

              </tbody>

            </table>

          </div>

        </section>

      </main>

      {/* ================= RIDER MODAL ================= */}

      <RiderModal
        rider={selectedRider}
        isOpen={!!selectedRider}
        onClose={() =>
          setSelectedRider(null)
        }
        onApprove={handleApprove}
        onReject={handleReject}
      />

    </div>
  );
}