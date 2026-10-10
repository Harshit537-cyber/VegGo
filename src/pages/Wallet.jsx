import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from '../components/Sidebar';
import PageHeader from '../Common/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Wallet as WalletIcon,
  ReceiptText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ArrowDownLeft,
  Sparkles,
  Zap,
  Loader2
} from 'lucide-react';

import {
  getWalletBalance,
  getWalletTransactions,
  getCreditTransactions,
  getDebitTransactions
} from '../Api/payouts/wallet';

function AnimatedValue({ value, prefix = '' }) {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    const targetNum = Number(value);

    if (Number.isNaN(targetNum)) {
      setDisplayValue(String(value ?? ''));
      return;
    }

    const duration = 1000;
    const startTime = performance.now();
    let animationFrameId;

    const updateCount = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(
        elapsed / duration,
        1
      );

      const easeProgress =
        progress === 1
          ? 1
          : 1 - Math.pow(2, -10 * progress);

      setDisplayValue(
        Math.floor(
          easeProgress * targetNum
        ).toLocaleString('en-IN')
      );

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(
            updateCount
          );
      } else {
        setDisplayValue(
          targetNum.toLocaleString(
            'en-IN'
          )
        );
      }
    };

    animationFrameId =
      requestAnimationFrame(
        updateCount
      );

    return () =>
      cancelAnimationFrame(
        animationFrameId
      );
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue}
    </span>
  );
}

const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.errors?.[0]
      ?.message ||
    error?.message ||
    fallback
  );
};

const formatAmount = (amount) => {
  const value =
    Number(amount) || 0;

  return `₹${value.toLocaleString(
    'en-IN',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  )}`;
};

export default function Wallet() {
  const [currentTab, setCurrentTab] =
    useState('wallet');

  const [balance, setBalance] =
    useState(0);

  const [transactions, setTransactions] =
    useState([]);

  const [activeFilter, setActiveFilter] =
    useState('All');

  const [searchQuery, setSearchQuery] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [
    balanceLoading,
    setBalanceLoading
  ] = useState(true);

  const [
    isRefreshing,
    setIsRefreshing
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage
  ] = useState('');

  const [page, setPage] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(1);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const fetchWalletBalance =
    async () => {
      try {
        setBalanceLoading(true);

        const data =
          await getWalletBalance();

        const walletBalance =
          data?.balance ??
          data?.walletBalance ??
          data?.amount ??
          data?.data?.balance ??
          data?.data?.walletBalance ??
          0;

        setBalance(
          Number(walletBalance) || 0
        );
      } catch (error) {
        console.error(
          'Wallet balance error:',
          error
        );

        if (!error.response) {
          setErrorMessage(
            'Unable to connect with server.'
          );
        }
      } finally {
        setBalanceLoading(false);
      }
    };

  const fetchTransactions =
    async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        let data;

        if (
          activeFilter ===
          'Credit'
        ) {
          data =
            await getCreditTransactions(
              page,
              20
            );
        } else if (
          activeFilter ===
          'Debit'
        ) {
          data =
            await getDebitTransactions(
              page,
              20
            );
        } else {
          data =
            await getWalletTransactions(
              page,
              20
            );
        }

        let transactionList = [];

        if (Array.isArray(data)) {
          transactionList =
            data;
        } else if (
          Array.isArray(
            data?.content
          )
        ) {
          transactionList =
            data.content;
        } else if (
          Array.isArray(
            data?.data
          )
        ) {
          transactionList =
            data.data;
        } else if (
          Array.isArray(
            data?.transactions
          )
        ) {
          transactionList =
            data.transactions;
        } else if (
          Array.isArray(
            data?.data?.content
          )
        ) {
          transactionList =
            data.data.content;
        } else if (
          Array.isArray(
            data?.data?.transactions
          )
        ) {
          transactionList =
            data.data.transactions;
        }

        setTransactions(
          transactionList
        );

        const pages =
          data?.totalPages ??
          data?.data?.totalPages ??
          data?.page?.totalPages ??
          1;

        setTotalPages(
          Number(pages) || 1
        );

        setRefreshKey(
          (prev) => prev + 1
        );
      } catch (error) {
        console.error(
          'Wallet transactions error:',
          error
        );

        setTransactions([]);

        setErrorMessage(
          getErrorMessage(
            error,
            'Failed to load wallet transactions.'
          )
        );
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [
    activeFilter,
    page
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchWalletBalance();
    fetchTransactions();
  };

  const handleFilterChange = (
    filter
  ) => {
    setPage(0);
    setActiveFilter(filter);
  };

  const getTransactionType = (
    transaction
  ) => {
    return (
      transaction?.type ||
      transaction?.transactionType ||
      transaction?.transaction_type ||
      ''
    ).toUpperCase();
  };

  const getTransactionAmount = (
    transaction
  ) => {
    return (
      transaction?.amount ??
      transaction?.transactionAmount ??
      transaction?.walletAmount ??
      0
    );
  };

  const getDescription = (
    transaction
  ) => {
    return (
      transaction?.description ||
      transaction?.remarks ||
      transaction?.reason ||
      transaction?.reference ||
      transaction?.transactionId ||
      'Wallet Transaction'
    );
  };

  const getTransactionId = (
    transaction
  ) => {
    return (
      transaction?.transactionId ||
      transaction?.id ||
      '-'
    );
  };

  const getDate = (
    transaction
  ) => {
    const date =
      transaction?.createdAt ||
      transaction?.createdDate ||
      transaction?.date ||
      transaction?.transactionDate;

    if (!date) return '-';

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return '-';
    }

    return parsedDate.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  };

  const creditTotal = useMemo(() => {
    return transactions.reduce(
      (total, transaction) => {
        const type =
          getTransactionType(
            transaction
          );

        if (
          type === 'CREDIT'
        ) {
          return (
            total +
            Math.abs(
              Number(
                getTransactionAmount(
                  transaction
                )
              ) || 0
            )
          );
        }

        return total;
      },
      0
    );
  }, [transactions]);

  const debitTotal = useMemo(() => {
    return transactions.reduce(
      (total, transaction) => {
        const type =
          getTransactionType(
            transaction
          );

        if (
          type === 'DEBIT'
        ) {
          return (
            total +
            Math.abs(
              Number(
                getTransactionAmount(
                  transaction
                )
              ) || 0
            )
          );
        }

        return total;
      },
      0
    );
  }, [transactions]);

  const filteredTransactions =
    useMemo(() => {
      const query =
        searchQuery
          .toLowerCase()
          .trim();

      return transactions.filter(
        (transaction) => {
          const description =
            String(
              getDescription(
                transaction
              )
            ).toLowerCase();

          const transactionId =
            String(
              getTransactionId(
                transaction
              )
            ).toLowerCase();

          const type =
            getTransactionType(
              transaction
            ).toLowerCase();

          const matchesSearch =
            !query ||
            description.includes(
              query
            ) ||
            transactionId.includes(
              query
            ) ||
            type.includes(query);

          const transactionType =
            getTransactionType(
              transaction
            );

          const matchesFilter =
            activeFilter ===
              'All' ||
            (activeFilter ===
              'Credit' &&
              transactionType ===
                'CREDIT') ||
            (activeFilter ===
              'Debit' &&
              transactionType ===
                'DEBIT');

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      transactions,
      searchQuery,
      activeFilter
    ]);

  const totalTransactions =
    transactions.length;

  const creditCount =
    transactions.filter(
      (item) =>
        getTransactionType(
          item
        ) === 'CREDIT'
    ).length;

  const debitCount =
    transactions.filter(
      (item) =>
        getTransactionType(
          item
        ) === 'DEBIT'
    ).length;

  const stats = [
    {
      label: 'Available Balance',
      value: balance,
      prefix: '₹',
      accentColor:
        'bg-emerald-600',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: WalletIcon,
      status: 'Balance'
    },
    {
      label: 'Total Transactions',
      value: totalTransactions,
      prefix: '',
      accentColor:
        'bg-teal-600',
      iconBg:
        'bg-teal-50 text-teal-700',
      tagColor:
        'text-teal-700 bg-teal-50/80 border-teal-200/80',
      icon: ReceiptText,
      status: 'Records'
    },
    {
      label: 'Credit Transactions',
      value: creditCount,
      prefix: '',
      accentColor:
        'bg-emerald-500',
      iconBg:
        'bg-emerald-50 text-emerald-700',
      tagColor:
        'text-emerald-700 bg-emerald-50/80 border-emerald-200/80',
      icon: TrendingUp,
      status: 'Credit'
    },
    {
      label: 'Debit Transactions',
      value: debitCount,
      prefix: '',
      accentColor:
        'bg-green-700',
      iconBg:
        'bg-rose-50 text-rose-700',
      tagColor:
        'text-rose-700 bg-rose-50/80 border-rose-200/80',
      icon: TrendingDown,
      status: 'Debit'
    }
  ];

  return (
    <div className="min-h-dvh bg-slate-100/70 flex flex-col lg:flex-row font-sans antialiased text-slate-800 selection:bg-emerald-500 selection:text-white">
      <Sidebar />

      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pt-18 sm:pt-20 lg:pt-8 w-full space-y-6 sm:space-y-8 lg:max-h-dvh lg:overflow-y-auto">

        <PageHeader
          badge="Finance Control"
          badgeIcon={WalletIcon}
          title="Wallet Operations & Balances"
          subtitle="Track platform escrow balances, partner balances, ledger history, and settlement adjustments."
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{
                opacity: 0,
                y: -10
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                y: -10
              }}
              className="px-5 py-3.5 rounded-2xl border text-xs font-semibold bg-rose-50 border-rose-200 text-rose-700 flex items-center gap-2"
            >

              <AlertCircle
                size={15}
              />

              {errorMessage}

            </motion.div>
          )}
        </AnimatePresence>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

          {stats.map(
            (stat, idx) => {
              const IconComponent =
                stat.icon;

              return (
                <motion.div
                  key={`${idx}-${refreshKey}`}
                  initial={{
                    opacity: 0,
                    y: 20
                  }}
                  animate={{
                    opacity: 1,
                    y: 0
                  }}
                  transition={{
                    duration: 0.4,
                    delay:
                      idx * 0.1
                  }}
                  whileHover={{
                    y: -6,
                    transition: {
                      duration: 0.2
                    }
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
                          scale: 1.1
                        }}
                        className={`${stat.iconBg} p-2.5 rounded-2xl transition-all shadow-xs`}
                      >

                        <IconComponent
                          size={18}
                        />

                      </motion.div>

                    </div>

                    <h3 className="text-2xl sm:text-3xl font-semibold text-black tracking-tight font-mono group-hover:text-emerald-800 transition-colors duration-200">

                      {loading ||
                      (idx === 0 &&
                        balanceLoading) ? (
                        <span className="text-slate-300">
                          ...
                        </span>
                      ) : (
                        <>
                          <AnimatedValue
                            value={
                              stat.value
                            }
                            prefix={
                              stat.prefix
                            }
                          />

                          {idx === 0 && (
                            <span className="text-base ml-1 font-sans">
                              Balance
                            </span>
                          )}

                          {idx !== 0 && (
                            <span className="text-base ml-1 font-sans">
                              Records
                            </span>
                          )}
                        </>
                      )}

                    </h3>

                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between relative z-10">

                    <span
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border transition-transform duration-300 group-hover:scale-105 ${stat.tagColor}`}
                    >

                      {idx === 0 ? (
                        <WalletIcon
                          size={13}
                        />
                      ) : idx === 1 ? (
                        <ReceiptText
                          size={13}
                        />
                      ) : idx === 2 ? (
                        <ArrowDownRight
                          size={13}
                        />
                      ) : (
                        <ArrowUpRight
                          size={13}
                        />
                      )}

                      {stat.status}

                    </span>

                    <span className="text-[11px] text-black font-semibold">

                      {idx === 0
                        ? 'Current'
                        : idx === 1
                        ? 'Current Page'
                        : idx === 2
                        ? formatAmount(
                            creditTotal
                          )
                        : formatAmount(
                            debitTotal
                          )}

                    </span>

                  </div>

                </motion.div>
              );
            }
          )}

        </section>

        <section className="w-full">

          <motion.div
            initial={{
              opacity: 0,
              y: 20
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.5,
              delay: 0.3
            }}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5 sm:p-6"
          >

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">

                  <WalletIcon
                    size={18}
                  />

                </div>

                <div>

                  <h2 className="text-lg font-semibold text-black tracking-tight">
                    Wallet Records
                  </h2>

                  <p className="text-xs font-semibold text-black">
                    Wallet transaction management directory
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2 flex-wrap">

                <div className="relative flex-1 sm:w-72">

                  <Search
                    className="absolute left-3 top-2.5 text-slate-400"
                    size={15}
                  />

                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={
                      searchQuery
                    }
                    onChange={(e) =>
                      setSearchQuery(
                        e.target.value
                      )
                    }
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold text-black focus:outline-none focus:border-emerald-500 focus:bg-white transition-all placeholder:text-slate-400"
                  />

                </div>

                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl p-0.5">

                  <Filter
                    size={13}
                    className="text-slate-400 ml-2"
                  />

                  {[
                    'All',
                    'Credit',
                    'Debit'
                  ].map(
                    (filter) => (
                      <button
                        key={
                          filter
                        }
                        onClick={() =>
                          handleFilterChange(
                            filter
                          )
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                          activeFilter ===
                          filter
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {filter}
                      </button>
                    )
                  )}

                </div>

              </div>

            </div>

            <div className="hidden md:block overflow-x-auto">

              <table className="w-full text-left border-collapse">

                <thead>

                  <tr className="border-b border-slate-200 text-[10px] uppercase font-semibold tracking-wider text-black bg-slate-50/80">

                    <th className="py-3.5 px-4 rounded-l-xl">
                      Transaction
                    </th>

                    <th className="py-3.5 px-4">
                      Type
                    </th>

                    <th className="py-3.5 px-4">
                      Amount
                    </th>

                    <th className="py-3.5 px-4">
                      Date
                    </th>

                    <th className="py-3.5 px-4">
                      Transaction ID
                    </th>

                    <th className="py-3.5 px-4 text-right rounded-r-xl">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {loading ? (
                    <tr>

                      <td
                        colSpan={6}
                        className="py-12 text-center"
                      >

                        <div className="flex flex-col items-center gap-3 text-slate-400">

                          <Loader2
                            size={28}
                            className="animate-spin text-emerald-600"
                          />

                          <span className="text-xs font-semibold">
                            Loading wallet transactions...
                          </span>

                        </div>

                      </td>

                    </tr>
                  ) : filteredTransactions.length >
                    0 ? (
                    filteredTransactions.map(
                      (
                        transaction,
                        idx
                      ) => {
                        const type =
                          getTransactionType(
                            transaction
                          );

                        const amount =
                          Number(
                            getTransactionAmount(
                              transaction
                            )
                          ) || 0;

                        const isCredit =
                          type ===
                          'CREDIT';

                        return (
                          <motion.tr
                            key={
                              transaction?.id ||
                              transaction?.transactionId ||
                              idx
                            }
                            initial={{
                              opacity: 0,
                              y: 10
                            }}
                            animate={{
                              opacity: 1,
                              y: 0
                            }}
                            transition={{
                              duration: 0.3,
                              delay:
                                idx *
                                0.05
                            }}
                            className="text-xs font-semibold text-black hover:bg-emerald-50/40 transition-colors group"
                          >

                            <td className="py-3.5 px-4">

                              <div className="flex items-center gap-3">

                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border overflow-hidden ${
                                    isCredit
                                      ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                      : 'bg-rose-50 border-rose-100 text-rose-700'
                                  }`}
                                >

                                  {isCredit ? (
                                    <ArrowDownLeft
                                      size={
                                        17
                                      }
                                    />
                                  ) : (
                                    <ArrowUpRight
                                      size={
                                        17
                                      }
                                    />
                                  )}

                                </div>

                                <div className="flex flex-col min-w-0">

                                  <span className="font-semibold text-black group-hover:text-emerald-700 transition-colors truncate max-w-[230px]">
                                    {getDescription(
                                      transaction
                                    )}
                                  </span>

                                  <span className="text-[10px] text-slate-500">
                                    Wallet Transaction
                                  </span>

                                </div>

                              </div>

                            </td>

                            <td className="py-3.5 px-4">

                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                  isCredit
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                                    : 'bg-rose-50 text-rose-700 border-rose-200/80'
                                }`}
                              >

                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    isCredit
                                      ? 'bg-emerald-500'
                                      : 'bg-rose-500'
                                  }`}
                                />

                                {type ||
                                  'Transaction'}

                              </span>

                            </td>

                            <td className="py-3.5 px-4">

                              <span
                                className={`font-bold ${
                                  isCredit
                                    ? 'text-emerald-600'
                                    : 'text-rose-600'
                                }`}
                              >

                                {isCredit
                                  ? '+'
                                  : '-'}

                                ₹
                                {Math.abs(
                                  amount
                                ).toLocaleString(
                                  'en-IN',
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  }
                                )}

                              </span>

                            </td>

                            <td className="py-3.5 px-4">

                              <div className="flex items-center gap-2 text-[10px] text-slate-500 whitespace-nowrap">

                                <Calendar
                                  size={
                                    13
                                  }
                                />

                                {getDate(
                                  transaction
                                )}

                              </div>

                            </td>

                            <td className="py-3.5 px-4">

                              <span className="inline-block max-w-[170px] truncate bg-slate-100 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-slate-500">
                                {getTransactionId(
                                  transaction
                                )}
                              </span>

                            </td>

                            <td className="py-3.5 px-4 text-right">

                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">

                                <CheckCircle2
                                  size={
                                    12
                                  }
                                />

                                Completed

                              </span>

                            </td>

                          </motion.tr>
                        );
                      }
                    )
                  ) : (
                    <tr>

                      <td
                        colSpan={6}
                        className="py-12 text-center"
                      >

                        <WalletIcon
                          size={35}
                          className="mx-auto text-slate-300 mb-3"
                        />

                        <p className="text-xs font-semibold text-slate-400">
                          No matching wallet records found.
                        </p>

                      </td>

                    </tr>
                  )}

                </tbody>

              </table>

            </div>

            <div className="md:hidden space-y-3">

              {loading ? (
                <div className="py-10 text-center text-xs font-semibold text-slate-400">

                  <Loader2
                    size={25}
                    className="animate-spin text-emerald-600 mx-auto mb-3"
                  />

                  Loading wallet transactions...

                </div>
              ) : filteredTransactions.length >
                0 ? (
                filteredTransactions.map(
                  (
                    transaction,
                    idx
                  ) => {
                    const type =
                      getTransactionType(
                        transaction
                      );

                    const amount =
                      Number(
                        getTransactionAmount(
                          transaction
                        )
                      ) || 0;

                    const isCredit =
                      type ===
                      'CREDIT';

                    return (
                      <motion.div
                        key={
                          transaction?.id ||
                          transaction?.transactionId ||
                          idx
                        }
                        initial={{
                          opacity: 0,
                          y: 10
                        }}
                        animate={{
                          opacity: 1,
                          y: 0
                        }}
                        whileHover={{
                          scale: 1.01
                        }}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:shadow-md transition-all space-y-3 group"
                      >

                        <div className="flex items-center justify-between gap-3">

                          <div className="flex items-center gap-2 min-w-0">

                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                                isCredit
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >

                              {isCredit ? (
                                <ArrowDownLeft
                                  size={
                                    16
                                  }
                                />
                              ) : (
                                <ArrowUpRight
                                  size={
                                    16
                                  }
                                />
                              )}

                            </div>

                            <div className="min-w-0">

                              <h4 className="font-semibold text-sm text-black group-hover:text-emerald-700 transition-colors truncate">
                                {getDescription(
                                  transaction
                                )}
                              </h4>

                              <p className="text-[10px] text-slate-400">
                                Wallet Transaction
                              </p>

                            </div>

                          </div>

                          <span
                            className={`font-bold text-sm whitespace-nowrap ${
                              isCredit
                                ? 'text-emerald-600'
                                : 'text-rose-600'
                            }`}
                          >

                            {isCredit
                              ? '+'
                              : '-'}

                            ₹
                            {Math.abs(
                              amount
                            ).toLocaleString(
                              'en-IN',
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              }
                            )}

                          </span>

                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">

                          <div>

                            <span className="text-[10px] uppercase font-semibold text-black block">
                              Type
                            </span>

                            <span
                              className={`font-semibold ${
                                isCredit
                                  ? 'text-emerald-600'
                                  : 'text-rose-600'
                              }`}
                            >
                              {type ||
                                'Transaction'}
                            </span>

                          </div>

                          <div>

                            <span className="text-[10px] uppercase font-semibold text-black block">
                              Date
                            </span>

                            <span className="text-slate-500 font-semibold">
                              {getDate(
                                transaction
                              )}
                            </span>

                          </div>

                          <div>

                            <span className="text-[10px] uppercase font-semibold text-black block">
                              Transaction ID
                            </span>

                            <span className="text-slate-500 font-semibold truncate block">
                              {getTransactionId(
                                transaction
                              )}
                            </span>

                          </div>

                          <div>

                            <span className="text-[10px] uppercase font-semibold text-black block">
                              Status
                            </span>

                            <span className="text-emerald-600 font-semibold">
                              Completed
                            </span>

                          </div>

                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-200/60">

                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">

                            <CheckCircle2
                              size={
                                12
                              }
                            />

                            Completed

                          </span>

                        </div>

                      </motion.div>
                    );
                  }
                )
              ) : (
                <div className="py-10 text-center">

                  <WalletIcon
                    size={35}
                    className="mx-auto text-slate-300 mb-3"
                  />

                  <p className="text-xs font-semibold text-slate-400">
                    No wallet transactions found.
                  </p>

                </div>
              )}

            </div>

            {!loading &&
              transactions.length >
                0 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5 pt-4 border-t border-slate-100">

                  <div className="text-xs font-semibold text-slate-500">

                    Showing{' '}

                    <span className="text-emerald-700">
                      {filteredTransactions.length}
                    </span>

                    {' '}of{' '}

                    <span className="text-slate-700">
                      {transactions.length}
                    </span>

                    {' '}transactions

                  </div>

                  <div className="flex items-center gap-2">

                    <button
                      onClick={() =>
                        setPage(
                          (prev) =>
                            Math.max(
                              0,
                              prev - 1
                            )
                        )
                      }
                      disabled={
                        page === 0
                      }
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Previous
                    </button>

                    <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                      {page + 1} /{' '}
                      {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setPage(
                          (prev) =>
                            Math.min(
                              totalPages -
                                1,
                              prev + 1
                            )
                        )
                      }
                      disabled={
                        page >=
                        totalPages -
                          1
                      }
                      className="px-3.5 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      Next
                    </button>

                  </div>

                </div>
              )}

          </motion.div>

        </section>

      </main>

    </div>
  );
}