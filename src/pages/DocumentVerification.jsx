import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  Search,
  Sparkles,
  Eye,
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  Check,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react';

import {
  getPendingVendorKyc,
  getVendorKycDetails,
  approveVendorKyc,
  rejectVendorKyc,
} from '../Api/vendorKycService/vendorKycService';

/* =========================================================
   Animated Value
========================================================= */

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === undefined || value === null || value === '') {
      setDisplayValue('0');
      return;
    }

    const stringValue = String(value);
    const match = stringValue.match(/([₹\d,.]+)\s*(.*)/);

    if (!match) {
      setDisplayValue(stringValue);
      return;
    }

    const isRupee = stringValue.startsWith('₹');
    const rawNumberStr = match[1].replace(/[₹,]/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';
    const isDecimal = rawNumberStr.includes('.');
    const hasComma = match[1].includes(',');

    if (Number.isNaN(targetNum)) {
      setDisplayValue(stringValue);
      return;
    }

    const duration = 1000;
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
        `${isRupee ? '₹' : ''}${formatted}${
          suffix ? ` ${suffix}` : ''
        }`
      );

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(updateCount);
      } else {
        setDisplayValue(stringValue);
      }
    };

    animationFrameId =
      requestAnimationFrame(updateCount);

    return () =>
      cancelAnimationFrame(animationFrameId);
  }, [value]);

  return <span>{displayValue}</span>;
}

/* =========================================================
   Main Component
========================================================= */

export default function DocumentVerification() {
  const [currentTab, setCurrentTab] =
    useState('document-verification');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [isRefreshing, setIsRefreshing] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [actionLoading, setActionLoading] =
    useState(null);

  const [error, setError] =
    useState('');

  const [selectedKyc, setSelectedKyc] =
    useState(null);

  const [showDetails, setShowDetails] =
    useState(false);

  const [rejectModal, setRejectModal] =
    useState(false);

  const [rejectShopId, setRejectShopId] =
    useState(null);

  const [rejectReason, setRejectReason] =
    useState('');

  /* =========================================================
     Fetch Pending KYC
  ========================================================= */

  const fetchPendingKyc = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await getPendingVendorKyc();

      console.log(
        'Pending Vendor KYC API Response:',
        response
      );

      const apiData = response?.data;

      let list = [];

      if (Array.isArray(apiData)) {
        list = apiData;
      } else if (Array.isArray(apiData?.content)) {
        list = apiData.content;
      } else if (Array.isArray(apiData?.items)) {
        list = apiData.items;
      } else if (Array.isArray(apiData?.data)) {
        list = apiData.data;
      } else if (Array.isArray(response?.content)) {
        list = response.content;
      } else if (Array.isArray(response?.items)) {
        list = response.items;
      } else if (
        Array.isArray(response?.data?.data)
      ) {
        list = response.data.data;
      }

      setDocuments(list);
    } catch (err) {
      console.error(
        'Failed to fetch pending Vendor KYC:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to load pending vendor KYC'
      );

      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingKyc();
  }, []);

  /* =========================================================
     Refresh
  ========================================================= */

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setRefreshKey((prev) => prev + 1);

      await fetchPendingKyc();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 700);
    }
  };

  /* =========================================================
     Helpers
  ========================================================= */

  const getShopId = (doc) =>
    doc?.shopId ||
    doc?.shop?.shopId ||
    doc?.vendorShopId ||
    doc?.id ||
    doc?._id ||
    '';

  const getPartnerName = (doc) =>
    doc?.shopName ||
    doc?.shop?.shopName ||
    doc?.businessName ||
    doc?.ownerName ||
    doc?.owner?.name ||
    doc?.name ||
    'Unknown Vendor';

  const getOwnerName = (doc) =>
    doc?.ownerFullName ||
    doc?.ownerName ||
    doc?.owner?.name ||
    doc?.authorizedAgent ||
    '—';

  const getDocumentType = (doc) =>
    doc?.documentType ||
    doc?.type ||
    doc?.document?.type ||
    doc?.kycType ||
    'Vendor KYC';

  const getCategory = (doc) =>
    doc?.businessType ||
    doc?.category ||
    doc?.shop?.category ||
    'Vendor KYC';

  const getStatus = (doc) =>
    (
      doc?.status ||
      doc?.kycStatus ||
      doc?.verificationStatus ||
      'PENDING'
    )
      .toString()
      .toUpperCase();

  const getUploadedDate = (doc) => {
    const date =
      doc?.createdAt ||
      doc?.uploadedAt ||
      doc?.submittedAt ||
      doc?.updatedAt;

    if (!date) return '—';

    try {
      return new Date(date).toLocaleDateString(
        'en-IN',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }
      );
    } catch {
      return date;
    }
  };

  const getStatusUI = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'VERIFIED':
        return {
          text: 'Approved',
          icon: CheckCircle2,
          wrapper:
            'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          iconColor: 'text-emerald-600',
        };

      case 'REJECTED':
      case 'FLAGGED':
        return {
          text: 'Rejected',
          icon: XCircle,
          wrapper:
            'bg-rose-50 text-rose-700 border-rose-200/80',
          iconColor: 'text-rose-600',
        };

      default:
        return {
          text: 'Pending',
          icon: Clock,
          wrapper:
            'bg-amber-50 text-amber-700 border-amber-200/80',
          iconColor: 'text-amber-600',
        };
    }
  };

  const isPendingStatus = (doc) => {
    const status = getStatus(doc);

    return (
      status === 'PENDING' ||
      status === 'UNDER_REVIEW' ||
      status === 'SUBMITTED'
    );
  };

  /* =========================================================
     Search
  ========================================================= */

  const filteredDocuments = documents.filter(
    (doc) => {
      const query =
        searchQuery.toLowerCase();

      return (
        getPartnerName(doc)
          .toLowerCase()
          .includes(query) ||
        getOwnerName(doc)
          .toLowerCase()
          .includes(query) ||
        getDocumentType(doc)
          .toLowerCase()
          .includes(query) ||
        getCategory(doc)
          .toLowerCase()
          .includes(query) ||
        String(getShopId(doc))
          .toLowerCase()
          .includes(query)
      );
    }
  );

  /* =========================================================
     Stats
  ========================================================= */

  const pendingCount =
    documents.filter((doc) =>
      isPendingStatus(doc)
    ).length;

  const approvedCount =
    documents.filter((doc) => {
      const status = getStatus(doc);

      return (
        status === 'APPROVED' ||
        status === 'VERIFIED'
      );
    }).length;

  const rejectedCount =
    documents.filter((doc) => {
      const status = getStatus(doc);

      return (
        status === 'REJECTED' ||
        status === 'FLAGGED'
      );
    }).length;

  const totalProcessed =
    approvedCount + rejectedCount;

  const approvalRate =
    totalProcessed > 0
      ? (
          (approvedCount /
            totalProcessed) *
          100
        ).toFixed(1)
      : '0.0';

  const verificationStats = [
    {
      label: 'Pending Applications',
      value: `${pendingCount}`,
      change: '+8.4%',
      up: true,
      accentColor: 'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: FileText,
    },
    {
      label: 'Approved KYC',
      value: `${approvedCount}`,
      change: '+10.2%',
      up: true,
      accentColor: 'bg-teal-600',
      iconBg:
        'bg-teal-50 text-teal-700',
      tagColor:
        'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: CheckCircle2,
    },
    {
      label: 'Rejected KYC',
      value: `${rejectedCount}`,
      change: '-4.5%',
      up: false,
      accentColor: 'bg-emerald-500',
      iconBg:
        'bg-rose-50 text-rose-700',
      tagColor:
        'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: XCircle,
    },
    {
      label: 'Verification Rate',
      value: `${approvalRate}%`,
      change: '+2.1%',
      up: true,
      accentColor: 'bg-green-700',
      iconBg:
        'bg-green-50 text-green-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: Check,
    },
  ];

  /* =========================================================
     View KYC
  ========================================================= */

  const handleView = async (shopId) => {
    if (!shopId) {
      alert('Shop ID not found');
      return;
    }

    try {
      setActionLoading(`view-${shopId}`);

      const response =
        await getVendorKycDetails(shopId);

      console.log(
        'Vendor KYC Details API Response:',
        response
      );

      setSelectedKyc(
        response?.data || response
      );

      setShowDetails(true);
    } catch (err) {
      console.error(
        'Vendor KYC details error:',
        err
      );

      alert(
        err?.response?.data?.message ||
          'Failed to fetch KYC details'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     Approve
  ========================================================= */

  const handleApprove = async (shopId) => {
    if (!shopId) {
      alert('Shop ID not found');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to approve this Vendor KYC?'
    );

    if (!confirmed) return;

    try {
      setActionLoading(
        `approve-${shopId}`
      );

      const response =
        await approveVendorKyc(shopId);

      console.log(
        'Approve Vendor KYC Response:',
        response
      );

      alert(
        response?.message ||
          'Vendor KYC approved successfully'
      );

      await fetchPendingKyc();
    } catch (err) {
      console.error(
        'Approve Vendor KYC error:',
        err
      );

      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to approve Vendor KYC'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     Reject
  ========================================================= */

  const openRejectModal = (shopId) => {
    if (!shopId) {
      alert('Shop ID not found');
      return;
    }

    setRejectShopId(shopId);
    setRejectReason('');
    setRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectShopId) {
      alert('Shop ID not found');
      return;
    }

    if (!rejectReason.trim()) {
      alert('Please enter rejection reason');
      return;
    }

    try {
      setActionLoading(
        `reject-${rejectShopId}`
      );

      const response =
        await rejectVendorKyc(
          rejectShopId,
          {
            reason:
              rejectReason.trim(),
          }
        );

      console.log(
        'Reject Vendor KYC Response:',
        response
      );

      alert(
        response?.message ||
          'Vendor KYC rejected successfully'
      );

      setRejectModal(false);
      setRejectShopId(null);
      setRejectReason('');

      await fetchPendingKyc();
    } catch (err) {
      console.error(
        'Reject Vendor KYC error:',
        err
      );

      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to reject Vendor KYC'
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* =========================================================
     Detail Fields
  ========================================================= */

  const getKycDetailFields = (kyc) => [
    {
      label: 'Business Name',
      value:
        kyc?.businessName ||
        kyc?.shopName ||
        kyc?.shop?.shopName,
    },
    {
      label: 'Owner Full Name',
      value:
        kyc?.ownerFullName ||
        kyc?.ownerName ||
        kyc?.owner?.name,
    },
    {
      label: 'Business Phone',
      value:
        kyc?.businessPhone ||
        kyc?.phone ||
        kyc?.mobile,
    },
    {
      label: 'Email',
      value: kyc?.email,
    },
    {
      label: 'Business Type',
      value:
        kyc?.businessType ||
        kyc?.category,
    },
    {
      label: 'KYC Status',
      value:
        kyc?.kycStatus ||
        kyc?.status,
    },
    {
      label: 'Shop ID',
      value:
        kyc?.shopId ||
        kyc?.vendorShopId ||
        kyc?.id,
    },
    {
      label: 'Submitted At',
      value: kyc?.submittedAt
        ? new Date(
            kyc.submittedAt
          ).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
        : '—',
    },
  ];

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">

      {/* =====================================================
          Sidebar
      ===================================================== */}

      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">

        {/* =================================================
            Header
        ================================================= */}

        <motion.header
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >

          {/* Ambient Lighting */}

          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">

            <div className="flex flex-wrap items-center gap-2.5">

              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">

                <Zap
                  size={12}
                  className="text-emerald-400 animate-bounce"
                />

                Trust & Safety Verification

              </span>

              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-900/80 px-3 py-1 rounded-full text-rose-300 shadow-sm">

                <span className="relative flex h-2 w-2">

                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />

                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />

                </span>

                <span className="text-[10px] font-semibold uppercase tracking-widest text-white">
                  LIVE ADMIN VEG GO
                </span>

              </div>

            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold tracking-tight text-white flex items-center gap-3">

              Document Verification

              <Sparkles className="w-6 h-6 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            </h1>

          </div>

          <div className="flex items-center gap-3 self-start lg:self-center z-10">

            <div className="bg-emerald-900/60 border border-emerald-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-xs font-semibold text-emerald-100 shadow-inner backdrop-blur-sm">

              <Calendar
                size={14}
                className="text-emerald-400"
              />

              <span>
                {new Date().toLocaleDateString(
                  'en-IN',
                  {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }
                )}
              </span>

            </div>

            <motion.button
              whileHover={{
                scale: 1.05,
              }}
              whileTap={{
                scale: 0.95,
              }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner group/btn disabled:opacity-50"
              title="Refresh Data"
            >

              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing
                    ? 'rotate-180 scale-110'
                    : 'group-hover/btn:rotate-45'
                }`}
              />

            </motion.button>

          </div>

        </motion.header>

        {/* =================================================
            Stats
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {verificationStats.map(
            (stat, idx) => {
              const IconComponent =
                stat.icon;

              return (
                <motion.div
                  key={idx}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: idx * 0.1,
                  }}
                  whileHover={{
                    y: -6,
                    transition: {
                      duration: 0.2,
                    },
                  }}
                  className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group cursor-pointer"
                >

                  <div
                    className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accentColor} transition-all duration-300 group-hover:h-2`}
                  />

                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

                  <div className="relative z-10">

                    <div className="flex items-center justify-between mb-4">

                      <span className="text-[11px] font-semibold text-black uppercase tracking-wider group-hover:text-emerald-700 transition-colors duration-200">
                        {stat.label}
                      </span>

                      <motion.div
                        whileHover={{
                          rotate: 12,
                          scale: 1.1,
                        }}
                        className={`${stat.iconBg} p-2.5 rounded-2xl transition-all shadow-xs`}
                      >
                        <IconComponent
                          size={18}
                        />
                      </motion.div>

                    </div>

                    <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono group-hover:text-emerald-800 transition-colors duration-200">

                      <AnimatedValue
                        value={stat.value}
                        key={refreshKey}
                      />

                    </h3>

                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">

                    <span
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-transform duration-300 group-hover:scale-105 ${stat.tagColor}`}
                    >

                      {stat.up ? (
                        <ArrowUpRight
                          size={13}
                          className="text-emerald-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      ) : (
                        <ArrowDownRight
                          size={13}
                          className="text-rose-600 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5"
                        />
                      )}

                      {stat.change}

                    </span>

                    <span className="text-[11px] text-black font-semibold">
                      Monthly Period
                    </span>

                  </div>

                </motion.div>
              );
            }
          )}

        </section>

        {/* =================================================
            KYC Table
        ================================================= */}

        <section className="w-full">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.3,
            }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
          >

            <div>

              {/* Table Header */}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">

                <div className="flex items-center gap-3">

                  <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                    <FileText size={18} />

                  </div>

                  <div>

                    <h2 className="text-lg font-semibold text-black tracking-tight">
                      Vendor KYC Applications
                    </h2>

                    <p className="text-xs font-semibold text-black">
                      Pending vendor document verification directory
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-2">

                  <div className="relative flex-1 sm:w-64">

                    <Search
                      className="absolute left-3 top-2.5 text-slate-400"
                      size={15}
                    />

                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={searchQuery}
                      onChange={(e) =>
                        setSearchQuery(
                          e.target.value
                        )
                      }
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                    />

                  </div>

                </div>

              </div>

              {/* Error */}

              {error && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: -10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700"
                >
                  {error}
                </motion.div>
              )}

              {/* =================================================
                  Desktop Table
              ================================================= */}

              <div className="hidden md:block overflow-x-auto">

                <table className="w-full text-left border-collapse">

                  <thead>

                    <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">

                      <th className="py-3.5 px-4 rounded-l-xl">
                        Shop ID
                      </th>

                      <th className="py-3.5 px-4">
                        Shop Details
                      </th>

                      <th className="py-3.5 px-4">
                        Owner
                      </th>

                      <th className="py-3.5 px-4">
                        Document Type
                      </th>

                      <th className="py-3.5 px-4">
                        Submitted Date
                      </th>

                      <th className="py-3.5 px-4 text-center">
                        Status
                      </th>

                      <th className="py-3.5 px-4 text-right rounded-r-xl">
                        Actions
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {loading ? (

                      <tr>

                        <td
                          colSpan="7"
                          className="py-16 text-center"
                        >

                          <div className="flex flex-col items-center gap-3 text-slate-400">

                            <Loader2
                              size={28}
                              className="animate-spin text-emerald-600"
                            />

                            <span className="text-sm font-semibold">
                              Loading Vendor KYC...
                            </span>

                          </div>

                        </td>

                      </tr>

                    ) : filteredDocuments.length >
                      0 ? (

                      filteredDocuments.map(
                        (doc, idx) => {

                          const shopId =
                            getShopId(doc);

                          const status =
                            getStatus(doc);

                          const statusUI =
                            getStatusUI(
                              status
                            );

                          const StatusIcon =
                            statusUI.icon;

                          const isPending =
                            isPendingStatus(
                              doc
                            );

                          return (

                            <motion.tr
                              key={
                                shopId ||
                                idx
                              }
                              initial={{
                                opacity: 0,
                                y: 10,
                              }}
                              animate={{
                                opacity: 1,
                                y: 0,
                              }}
                              transition={{
                                duration: 0.3,
                                delay:
                                  0.3 +
                                  idx *
                                    0.05,
                              }}
                              className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                            >

                              {/* Shop ID */}

                              <td className="py-3.5 px-4 font-mono text-black font-semibold group-hover:text-emerald-700 transition-colors">
                                {shopId || '—'}
                              </td>

                              {/* Shop */}

                              <td className="py-3.5 px-4">

                                <div className="flex flex-col">

                                  <span className="font-semibold text-black group-hover:translate-x-0.5 group-hover:text-emerald-700 transition-all duration-200">
                                    {getPartnerName(
                                      doc
                                    )}
                                  </span>

                                  <span className="text-[10px] text-slate-500">
                                    Vendor Shop KYC
                                  </span>

                                </div>

                              </td>

                              {/* Owner */}

                              <td className="py-3.5 px-4 text-slate-600">
                                {getOwnerName(
                                  doc
                                )}
                              </td>

                              {/* Document */}

                              <td className="py-3.5 px-4">

                                <span className="bg-slate-50 text-slate-600 border border-slate-100 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                                  {getDocumentType(
                                    doc
                                  )}
                                </span>

                              </td>

                              {/* Date */}

                              <td className="py-3.5 px-4 text-slate-500">
                                {getUploadedDate(
                                  doc
                                )}
                              </td>

                              {/* Status */}

                              <td className="py-3.5 px-4 text-center">

                                <span
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border transition-all duration-300 group-hover:scale-105 ${statusUI.wrapper}`}
                                >

                                  <StatusIcon
                                    size={11}
                                    className={
                                      statusUI.iconColor
                                    }
                                  />

                                  {statusUI.text}

                                </span>

                              </td>

                              {/* Actions */}

                              <td className="py-3.5 px-4 text-right">

                                <div className="flex items-center justify-end gap-1">

                                  {/* View */}

                                  <button
                                    onClick={() =>
                                      handleView(
                                        shopId
                                      )
                                    }
                                    disabled={
                                      actionLoading ===
                                      `view-${shopId}`
                                    }
                                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                    title="View KYC"
                                  >

                                    {actionLoading ===
                                    `view-${shopId}` ? (
                                      <Loader2
                                        size={15}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <Eye
                                        size={15}
                                      />
                                    )}

                                  </button>

                                  {/* Approve */}

                                  {isPending && (

                                    <button
                                      onClick={() =>
                                        handleApprove(
                                          shopId
                                        )
                                      }
                                      disabled={
                                        actionLoading ===
                                        `approve-${shopId}`
                                      }
                                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                      title="Approve KYC"
                                    >

                                      {actionLoading ===
                                      `approve-${shopId}` ? (
                                        <Loader2
                                          size={15}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Check
                                          size={16}
                                        />
                                      )}

                                    </button>

                                  )}

                                  {/* Reject */}

                                  {isPending && (

                                    <button
                                      onClick={() =>
                                        openRejectModal(
                                          shopId
                                        )
                                      }
                                      disabled={
                                        actionLoading ===
                                        `reject-${shopId}`
                                      }
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                      title="Reject KYC"
                                    >

                                      <X
                                        size={16}
                                      />

                                    </button>

                                  )}

                                </div>

                              </td>

                            </motion.tr>

                          );
                        }
                      )

                    ) : (

                      <tr>

                        <td
                          colSpan="7"
                          className="py-12 text-center"
                        >

                          <div className="flex flex-col items-center gap-3">

                            <FileText
                              size={35}
                              className="text-slate-300"
                            />

                            <p className="text-sm font-bold text-slate-500">
                              {documents.length ===
                              0
                                ? 'No pending Vendor KYC found.'
                                : 'No matching KYC applications found.'}
                            </p>

                            <p className="text-xs text-slate-400">
                              New verification requests will appear here
                            </p>

                          </div>

                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  Mobile Cards
              ================================================= */}

              <div className="md:hidden space-y-3">

                {loading ? (

                  <div className="py-12 flex flex-col items-center gap-3 text-slate-400">

                    <Loader2
                      size={28}
                      className="animate-spin text-emerald-600"
                    />

                    <span className="text-sm font-semibold">
                      Loading Vendor KYC...
                    </span>

                  </div>

                ) : filteredDocuments.length >
                  0 ? (

                  filteredDocuments.map(
                    (doc, index) => {

                      const shopId =
                        getShopId(doc);

                      const status =
                        getStatus(doc);

                      const statusUI =
                        getStatusUI(
                          status
                        );

                      const StatusIcon =
                        statusUI.icon;

                      const isPending =
                        isPendingStatus(
                          doc
                        );

                      return (

                        <motion.div
                          key={
                            shopId ||
                            index
                          }
                          initial={{
                            opacity: 0,
                            y: 10,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                          }}
                          whileHover={{
                            scale: 1.01,
                          }}
                          className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
                        >

                          <div className="flex items-center justify-between">

                            <span className="font-mono text-xs text-black font-semibold">
                              {shopId || '—'}
                            </span>

                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusUI.wrapper}`}
                            >

                              <StatusIcon
                                size={10}
                              />

                              {statusUI.text}

                            </span>

                          </div>

                          <div>

                            <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors duration-200">
                              {getPartnerName(
                                doc
                              )}
                            </h4>

                            <p className="text-xs text-slate-500">
                              {getOwnerName(
                                doc
                              )}
                            </p>

                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">

                            <div>

                              <span className="text-[10px] uppercase font-semibold text-black block">
                                Document
                              </span>

                              <span className="font-semibold text-slate-600">
                                {getDocumentType(
                                  doc
                                )}
                              </span>

                            </div>

                            <div>

                              <span className="text-[10px] uppercase font-semibold text-black block">
                                Submitted
                              </span>

                              <span className="font-semibold text-slate-600">
                                {getUploadedDate(
                                  doc
                                )}
                              </span>

                            </div>

                          </div>

                          <div>

                            <span className="text-[10px] uppercase font-semibold text-black block mb-1">
                              Business Type
                            </span>

                            <span className="font-semibold text-slate-600 text-xs">
                              {getCategory(
                                doc
                              )}
                            </span>

                          </div>

                          <div className="flex items-center justify-end gap-1 pt-1">

                            {/* View */}

                            <button
                              onClick={() =>
                                handleView(
                                  shopId
                                )
                              }
                              disabled={
                                actionLoading ===
                                `view-${shopId}`
                              }
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                              title="View KYC"
                            >

                              {actionLoading ===
                              `view-${shopId}` ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <Eye
                                  size={15}
                                />
                              )}

                            </button>

                            {/* Approve */}

                            {isPending && (

                              <button
                                onClick={() =>
                                  handleApprove(
                                    shopId
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  `approve-${shopId}`
                                }
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approve KYC"
                              >

                                {actionLoading ===
                                `approve-${shopId}` ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <Check
                                    size={16}
                                  />
                                )}

                              </button>

                            )}

                            {/* Reject */}

                            {isPending && (

                              <button
                                onClick={() =>
                                  openRejectModal(
                                    shopId
                                  )
                                }
                                disabled={
                                  actionLoading ===
                                  `reject-${shopId}`
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Reject KYC"
                              >

                                <X
                                  size={16}
                                />

                              </button>

                            )}

                          </div>

                        </motion.div>

                      );
                    }
                  )

                ) : (

                  <div className="py-10 text-center">

                    <FileText
                      size={32}
                      className="mx-auto text-slate-300 mb-3"
                    />

                    <p className="text-xs font-semibold text-slate-500">
                      {documents.length ===
                      0
                        ? 'No pending Vendor KYC found.'
                        : 'No matching KYC applications found.'}
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1">
                      New verification requests will appear here
                    </p>

                  </div>

                )}

              </div>

            </div>

          </motion.div>

        </section>

      </main>

      {/* =====================================================
          KYC Details Modal
      ===================================================== */}

      <AnimatePresence>

        {showDetails &&
          selectedKyc && (

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            >

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 10,
                }}
                className="bg-white rounded-3xl w-full max-w-2xl p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto"
              >

                {/* Close */}

                <button
                  onClick={() =>
                    setShowDetails(false)
                  }
                  className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={18} />
                </button>

                {/* Header */}

                <div className="flex items-center gap-3.5 mb-6">

                  <div className="w-12 h-12 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-2xl flex items-center justify-center">
                    <ShieldCheck
                      size={22}
                    />
                  </div>

                  <div>

                    <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider uppercase">
                      Vendor KYC
                    </span>

                    <h3 className="text-lg font-bold text-black">
                      KYC Verification Details
                    </h3>

                  </div>

                </div>

                {/* Detail Fields */}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {getKycDetailFields(
                    selectedKyc
                  ).map(
                    (field, idx) => (

                      <div
                        key={idx}
                        className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60"
                      >

                        <span className="text-[10px] font-bold text-black uppercase tracking-wider block mb-1">
                          {field.label}
                        </span>

                        <span className="text-sm font-semibold text-slate-700 break-words">
                          {field.value || '—'}
                        </span>

                      </div>

                    )
                  )}

                </div>

                {/* Documents */}

                {selectedKyc?.documents &&
                  Object.keys(
                    selectedKyc.documents
                  ).length > 0 && (

                    <div className="mt-6 pt-5 border-t border-slate-100">

                      <div className="flex items-center gap-2 mb-4">

                        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                          <FileText
                            size={16}
                          />
                        </div>

                        <h4 className="text-xs font-bold uppercase tracking-wider text-black">
                          Uploaded Documents
                        </h4>

                      </div>

                      <div className="space-y-2">

                        {Object.entries(
                          selectedKyc.documents
                        ).map(
                          ([
                            docKey,
                            url,
                          ]) => (

                            <div
                              key={docKey}
                              className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/60 flex items-center justify-between gap-3"
                            >

                              <span className="text-xs font-semibold text-slate-700 capitalize">
                                {docKey.replace(
                                  /([A-Z])/g,
                                  ' $1'
                                )}
                              </span>

                              {url ? (

                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold hover:bg-emerald-100 transition-colors"
                                >

                                  <Eye
                                    size={12}
                                  />

                                  View

                                </a>

                              ) : (

                                <span className="text-[10px] font-semibold text-slate-400">
                                  Not Uploaded
                                </span>

                              )}

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  )}

                {/* Close Button */}

                <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">

                  <button
                    onClick={() =>
                      setShowDetails(false)
                    }
                    className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                  >
                    Close
                  </button>

                </div>

              </motion.div>

            </motion.div>

          )}

      </AnimatePresence>

      {/* =====================================================
          Reject Modal
      ===================================================== */}

      <AnimatePresence>

        {rejectModal && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10,
              }}
              className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 relative"
            >

              {/* Close */}

              <button
                onClick={() =>
                  setRejectModal(false)
                }
                className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              {/* Header */}

              <div className="flex items-center gap-3.5 mb-5">

                <div className="w-11 h-11 bg-rose-50 text-rose-600 border border-rose-200 rounded-2xl flex items-center justify-center">
                  <AlertTriangle
                    size={20}
                  />
                </div>

                <div>

                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Verification Action
                  </span>

                  <h3 className="text-lg font-bold text-black">
                    Reject Vendor KYC
                  </h3>

                </div>

              </div>

              <p className="text-xs font-semibold text-slate-500 mb-4 leading-relaxed">
                Please provide a specific reason for rejecting this KYC application. This reason will be shared with the vendor.
              </p>

              {/* Reason */}

              <textarea
                value={rejectReason}
                onChange={(e) =>
                  setRejectReason(
                    e.target.value
                  )
                }
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-black focus:ring-2 focus:ring-rose-500 focus:outline-none mb-5 resize-none placeholder:text-slate-400"
              />

              {/* Buttons */}

              <div className="flex items-center justify-end gap-2.5 pt-1">

                <button
                  onClick={() =>
                    setRejectModal(
                      false
                    )
                  }
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleReject
                  }
                  disabled={
                    actionLoading ===
                    `reject-${rejectShopId}`
                  }
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                >

                  {actionLoading ===
                    `reject-${rejectShopId}` && (

                    <Loader2
                      size={14}
                      className="animate-spin"
                    />

                  )}

                  Confirm Rejection

                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>
  );
}