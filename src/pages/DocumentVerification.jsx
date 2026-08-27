import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  X,
  Loader2,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';

import {
  getPendingVendorKyc,
  getVendorKycDetails,
  approveVendorKyc,
  rejectVendorKyc,
} from '../Api/vendorKycService/vendorKycService';

function AnimatedValue({ value }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const stringValue = String(value ?? '');
    const match = stringValue.match(/([\d,.]+)\s*(.*)/);

    if (!match) {
      setDisplayValue(stringValue);
      return;
    }

    const rawNumberStr = match[1].replace(/,/g, '');
    const targetNum = parseFloat(rawNumberStr);
    const suffix = match[2] || '';
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
        parts[0] = parseInt(parts[0], 10).toLocaleString('en-IN');
        formatted = parts.join('.');
      }

      setDisplayValue(
        `${formatted}${suffix ? ` ${suffix}` : ''}`
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

export default function DocumentVerification() {
  const [currentTab, setCurrentTab] = useState(
    'document-verification'
  );

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectShopId, setRejectShopId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchPendingKyc = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await getPendingVendorKyc();

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
      } else if (Array.isArray(response?.data?.data)) {
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

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await fetchPendingKyc();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  const getShopId = (doc) =>
    doc?.shopId ||
    doc?.shop?.shopId ||
    doc?.id ||
    doc?._id ||
    '';

  const getPartnerName = (doc) =>
    doc?.shopName ||
    doc?.shop?.shopName ||
    doc?.ownerName ||
    doc?.owner?.name ||
    doc?.name ||
    doc?.businessName ||
    'Unknown Vendor';

  const getDocumentType = (doc) =>
    doc?.documentType ||
    doc?.type ||
    doc?.document?.type ||
    doc?.kycType ||
    'Vendor KYC';

  const getStatus = (doc) => {
    return (
      doc?.status ||
      doc?.kycStatus ||
      doc?.verificationStatus ||
      'PENDING'
    )
      .toString()
      .toUpperCase();
  };

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

      setSelectedKyc(response?.data || response);
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
      setActionLoading(`approve-${shopId}`);

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
      setActionLoading(`reject-${rejectShopId}`);

      const response =
        await rejectVendorKyc(rejectShopId, {
          reason: rejectReason.trim(),
        });

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

  const pendingCount = documents.filter((doc) => {
    const status = getStatus(doc);

    return (
      status === 'PENDING' ||
      status === 'UNDER_REVIEW' ||
      status === 'SUBMITTED'
    );
  }).length;

  const verifiedCount = documents.filter((doc) => {
    const status = getStatus(doc);

    return (
      status === 'APPROVED' ||
      status === 'VERIFIED'
    );
  }).length;

  const flaggedCount = documents.filter((doc) => {
    const status = getStatus(doc);

    return (
      status === 'REJECTED' ||
      status === 'FLAGGED'
    );
  }).length;

  const auditStats = [
    {
      label: 'Pending KYC',
      value: `${pendingCount}`,
      description: 'Awaiting verification',
      icon: Clock,
      accent: 'bg-amber-500',
      iconBg: 'bg-amber-50 text-amber-700',
      tag: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      label: 'Approved KYC',
      value: `${verifiedCount}`,
      description: 'Successfully verified',
      icon: CheckCircle2,
      accent: 'bg-emerald-600',
      iconBg: 'bg-emerald-50 text-emerald-700',
      tag:
        'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      label: 'Rejected KYC',
      value: `${flaggedCount}`,
      description: 'Requires attention',
      icon: AlertTriangle,
      accent: 'bg-rose-500',
      iconBg: 'bg-rose-50 text-rose-700',
      tag:
        'bg-rose-50 text-rose-700 border-rose-200',
    },
  ];

  const getStatusClasses = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'VERIFIED':
        return {
          wrapper:
            'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          text: 'Approved',
        };

      case 'REJECTED':
      case 'FLAGGED':
        return {
          wrapper:
            'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          text: 'Rejected',
        };

      default:
        return {
          wrapper:
            'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          text: 'Pending',
        };
    }
  };

  const getKycDetailFields = (kyc) => [
    {
      label: 'Business Name',
      value: kyc?.businessName,
    },
    {
      label: 'Owner Full Name',
      value: kyc?.ownerFullName,
    },
    {
      label: 'Business Phone',
      value: kyc?.businessPhone,
    },
    {
      label: 'Email',
      value: kyc?.email,
    },
    {
      label: 'Business Type',
      value: kyc?.businessType,
    },
    {
      label: 'KYC Status',
      value: kyc?.kycStatus || kyc?.status,
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

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col md:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen w-full space-y-6 sm:space-y-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
          }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-emerald-950 text-white shadow-xl shadow-emerald-950/20 border border-emerald-900 relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2.5 z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-emerald-300 bg-emerald-900/90 px-3 py-1 rounded-full border border-emerald-800 shadow-sm backdrop-blur-md">
                <ShieldCheck size={12} />
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

            <p className="text-xs sm:text-sm text-emerald-200/70 font-medium">
              Review and verify vendor KYC submissions
            </p>
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 bg-emerald-900/60 border border-emerald-800 rounded-2xl hover:bg-emerald-800 transition-all text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw
                size={15}
                className={`text-emerald-300 transition-transform duration-700 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
            </motion.button>
          </div>
        </motion.header>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {auditStats.map((stat, idx) => {
            const IconComponent = stat.icon;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.1,
                }}
                whileHover={{
                  y: -6,
                  transition: { duration: 0.2 },
                }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 ${stat.accent} transition-all duration-300 group-hover:h-2`}
                />

                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none group-hover:scale-125" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
                      {stat.label}
                    </span>

                    <motion.div
                      whileHover={{
                        rotate: 12,
                        scale: 1.1,
                      }}
                      className={`${stat.iconBg} p-2.5 rounded-2xl shadow-sm`}
                    >
                      <IconComponent size={18} />
                    </motion.div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight font-mono group-hover:text-emerald-800 transition-colors">
                    <AnimatedValue value={stat.value} />
                  </h3>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${stat.tag}`}
                  >
                    Live Status
                  </span>

                  <span className="text-[11px] text-slate-400 font-semibold">
                    {stat.description}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.3,
          }}
          className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                <FileText size={18} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                  Vendor KYC Verification Ledger
                </h2>

                <p className="text-xs font-semibold text-slate-400">
                  Live KYC submissions from backend
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Pending: {pendingCount}
              </span>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700"
            >
              {error}
            </motion.div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-slate-500 bg-slate-50/80">
                  <th className="py-3.5 px-3 rounded-l-xl">
                    Partner
                  </th>

                  <th className="py-3.5 px-3">
                    Document Type
                  </th>

                  <th className="py-3.5 px-3">
                    Submitted
                  </th>

                  <th className="py-3.5 px-3">
                    Status
                  </th>

                  <th className="py-3.5 px-3 text-right rounded-r-xl">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading && (
                  <tr>
                    <td
                      colSpan="5"
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
                )}

                {!loading &&
                  !error &&
                  documents.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-16 text-center"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <FileText
                            size={35}
                            className="text-slate-300"
                          />

                          <p className="text-sm font-bold text-slate-500">
                            No pending Vendor KYC found
                          </p>

                          <p className="text-xs text-slate-400">
                            New verification requests will appear here
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                {!loading &&
                  documents.map((doc, index) => {
                    const shopId = getShopId(doc);
                    const status = getStatus(doc);
                    const statusUI =
                      getStatusClasses(status);

                    const isPending =
                      status === 'PENDING' ||
                      status === 'UNDER_REVIEW' ||
                      status === 'SUBMITTED';

                    return (
                      <motion.tr
                        key={shopId || index}
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
                          delay: index * 0.04,
                        }}
                        className="text-xs font-semibold text-slate-600 hover:bg-emerald-50/40 transition-colors group"
                      >
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                              {getPartnerName(doc)
                                ?.charAt(0)
                                ?.toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {getPartnerName(doc)}
                              </p>

                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Vendor Partner
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          <div className="inline-flex items-center gap-2">
                            <FileText
                              size={15}
                              className="text-emerald-600"
                            />

                            <span className="text-slate-600">
                              {getDocumentType(doc)}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar
                              size={14}
                              className="text-slate-400"
                            />

                            {getUploadedDate(doc)}
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold border ${statusUI.wrapper}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${statusUI.dot}`}
                            />

                            {statusUI.text}
                          </span>
                        </td>

                        <td className="py-4 px-3">
                          <div className="flex items-center justify-end gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() =>
                                handleView(shopId)
                              }
                              disabled={
                                actionLoading ===
                                `view-${shopId}`
                              }
                              title="View KYC"
                              className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all disabled:opacity-50"
                            >
                              {actionLoading ===
                              `view-${shopId}` ? (
                                <Loader2
                                  size={15}
                                  className="animate-spin"
                                />
                              ) : (
                                <Eye size={15} />
                              )}
                            </motion.button>

                            {isPending && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleApprove(shopId)
                                }
                                disabled={
                                  actionLoading ===
                                  `approve-${shopId}`
                                }
                                title="Approve KYC"
                                className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-all disabled:opacity-50"
                              >
                                {actionLoading ===
                                `approve-${shopId}` ? (
                                  <Loader2
                                    size={15}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <ThumbsUp size={15} />
                                )}
                              </motion.button>
                            )}

                            {isPending && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  openRejectModal(shopId)
                                }
                                disabled={
                                  actionLoading ===
                                  `reject-${shopId}`
                                }
                                title="Reject KYC"
                                className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all disabled:opacity-50"
                              >
                                <ThumbsDown size={15} />
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="md:hidden space-y-3">
            {loading && (
              <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                <Loader2
                  size={28}
                  className="animate-spin text-emerald-600"
                />

                <span className="text-sm font-semibold">
                  Loading Vendor KYC...
                </span>
              </div>
            )}

            {!loading &&
              !error &&
              documents.length === 0 && (
                <div className="py-12 flex flex-col items-center gap-3">
                  <FileText
                    size={32}
                    className="text-slate-300"
                  />

                  <p className="text-sm font-bold text-slate-500">
                    No pending Vendor KYC found
                  </p>
                </div>
              )}

            {!loading &&
              documents.map((doc, index) => {
                const shopId = getShopId(doc);
                const status = getStatus(doc);
                const statusUI =
                  getStatusClasses(status);

                const isPending =
                  status === 'PENDING' ||
                  status === 'UNDER_REVIEW' ||
                  status === 'SUBMITTED';

                return (
                  <motion.div
                    key={shopId || index}
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
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                          {getPartnerName(doc)
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm text-slate-900">
                            {getPartnerName(doc)}
                          </h4>
                          <p className="text-[10px] text-slate-400">
                            Vendor Partner
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusUI.wrapper}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${statusUI.dot}`}
                        />
                        {statusUI.text}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Doc Type</p>
                        <p className="font-medium text-slate-700">{getDocumentType(doc)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Submitted</p>
                        <p className="font-medium text-slate-700">{getUploadedDate(doc)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleView(shopId)}
                        disabled={actionLoading === `view-${shopId}`}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5"
                      >
                        {actionLoading === `view-${shopId}` ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Eye size={14} />
                        )}
                        View
                      </button>

                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApprove(shopId)}
                            disabled={actionLoading === `approve-${shopId}`}
                            className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                          >
                            {actionLoading === `approve-${shopId}` ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <ThumbsUp size={14} />
                            )}
                            Approve
                          </button>

                          <button
                            onClick={() => openRejectModal(shopId)}
                            disabled={actionLoading === `reject-${shopId}`}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-all flex items-center gap-1.5"
                          >
                            <ThumbsDown size={14} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </motion.section>
      </main>

      {/* KYC Details Modal */}
      <AnimatePresence>
        {showDetails && selectedKyc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Vendor KYC Details</h3>
                  <p className="text-xs text-slate-400">Comprehensive shop details and documents</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {getKycDetailFields(selectedKyc).map((field, idx) => (
                  <div key={idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <p className="text-[10px] uppercase font-bold text-slate-400">{field.label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {field.value || '—'}
                    </p>
                  </div>
                ))}
              </div>

              {selectedKyc?.documents && Object.keys(selectedKyc.documents).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Uploaded Documents</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(selectedKyc.documents).map(([docKey, url]) => (
                      <div key={docKey} className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between">
                        <span className="text-xs font-semibold capitalize text-slate-700">{docKey.replace(/([A-Z])/g, ' $1')}</span>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-600 hover:underline font-bold inline-flex items-center gap-1"
                          >
                            <Eye size={12} /> View
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">Not Uploaded</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-7 pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative"
            >
              <button
                onClick={() => setRejectModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                  <AlertTriangle size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Reject Vendor KYC</h3>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Please provide a specific reason for rejecting this KYC application. This will be shared with the vendor.
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none mb-4 resize-none"
              />

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setRejectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading === `reject-${rejectShopId}`}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === `reject-${rejectShopId}` && (
                    <Loader2 size={14} className="animate-spin" />
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