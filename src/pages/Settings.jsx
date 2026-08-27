import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';

import {
  User,
  Bell,
  Shield,
  Globe,
  Save,
  Mail,
  Key,
  Settings as SettingsIcon,
  Truck,
  Percent,
  Clock,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';

import {
  getAdminProfile,
  updateAdminProfile,
  getNotificationPreferences,
  updateNotificationPreferences,
  changeAdminPassword,
  getActiveSessions,
  revokeSession
} from '../Api/settingsService/settingsService';

import apiClient from '../Api/Interceptor/axiosInstance';

export default function Settings() {
  const [currentTab, setCurrentTab] = useState('settings');

  // =========================
  // GLOBAL MESSAGE
  // =========================
  const [message, setMessage] = useState({
    type: '',
    text: ''
  });

  // =========================
  // PROFILE
  // =========================
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: ''
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // =========================
  // NOTIFICATIONS
  // =========================
  const [notifications, setNotifications] = useState({
    emailAlerts: false,
    pushNotifications: false,
    weeklyReport: false
  });

  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [savingNotifications, setSavingNotifications] = useState(false);

  // =========================
  // PLATFORM SETTINGS
  // =========================
  const [platformSettings, setPlatformSettings] = useState({
    deliveryRadiusKm: '',
    platformCommissionPercent: '',
    vendorAcceptTimeoutSeconds: '',
    deliveryAcceptTimeoutSeconds: '',
    rebroadcastMaxRounds: '',
    rebroadcastMaxElapsedMinutes: ''
  });

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  // =========================
  // PASSWORD MODAL
  // =========================
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [changingPassword, setChangingPassword] = useState(false);

  // =========================
  // SESSIONS MODAL
  // =========================
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchAllSettings();
  }, []);

  const fetchAllSettings = async () => {
    await Promise.all([
      fetchProfile(),
      fetchNotifications(),
      fetchPlatformSettings()
    ]);
  };

  // =========================================================
  // PROFILE API
  // =========================================================

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);

      const response = await getAdminProfile();

      console.log('Admin Profile Response:', response);

      const data = response?.data || response;

      setProfile({
        name: data?.name || data?.fullName || '',
        email: data?.email || '',
        role: data?.role || data?.adminRole || ''
      });
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);

      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to load admin profile.'
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      setMessage({ type: '', text: '' });

      const payload = {
        name: profile.name,
        email: profile.email
      };

      const response = await updateAdminProfile(payload);

      console.log('Update Profile Response:', response);

      const data = response?.data || response;

      setProfile((prev) => ({
        ...prev,
        name: data?.name || data?.fullName || payload.name,
        email: data?.email || payload.email,
        role: data?.role || data?.adminRole || prev.role
      }));

      setMessage({
        type: 'success',
        text: 'Profile updated successfully.'
      });
    } catch (error) {
      console.error('Failed to update profile:', error);

      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to update profile.'
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================================================
  // NOTIFICATION API
  // =========================================================

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const response = await getNotificationPreferences();

      console.log(
        'Notification Preferences Response:',
        response
      );

      const data = response?.data || response;

      setNotifications({
        emailAlerts:
          data?.emailAlerts ??
          data?.emailNotifications ??
          false,

        pushNotifications:
          data?.pushNotifications ??
          data?.pushAlerts ??
          false,

        weeklyReport:
          data?.weeklyReport ??
          data?.weeklyReports ??
          false
      });
    } catch (error) {
      console.error(
        'Failed to fetch notification preferences:',
        error
      );

      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to load notification preferences.'
      });
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleNotificationChange = async (
    field,
    value
  ) => {
    const updatedNotifications = {
      ...notifications,
      [field]: value
    };

    setNotifications(updatedNotifications);

    try {
      setSavingNotifications(true);

      const response =
        await updateNotificationPreferences(
          updatedNotifications
        );

      console.log(
        'Notification Update Response:',
        response
      );

      setMessage({
        type: 'success',
        text: 'Notification preferences updated.'
      });
    } catch (error) {
      console.error(
        'Failed to update notification preferences:',
        error
      );

      // Revert on API failure
      setNotifications(notifications);

      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to update notification preferences.'
      });
    } finally {
      setSavingNotifications(false);
    }
  };

  // =========================================================
  // PLATFORM SETTINGS API
  // =========================================================

  const fetchPlatformSettings = async () => {
    try {
      setLoadingSettings(true);

      const response = await apiClient.get(
        '/api/admin/settings'
      );

      console.log(
        'Platform Settings API Response:',
        response.data
      );

      const data =
        response?.data?.data ||
        response?.data;

      if (data) {
        setPlatformSettings({
          deliveryRadiusKm:
            data.deliveryRadiusKm ?? '',

          platformCommissionPercent:
            data.platformCommissionPercent ?? '',

          vendorAcceptTimeoutSeconds:
            data.vendorAcceptTimeoutSeconds ?? '',

          deliveryAcceptTimeoutSeconds:
            data.deliveryAcceptTimeoutSeconds ?? '',

          rebroadcastMaxRounds:
            data.rebroadcastMaxRounds ?? '',

          rebroadcastMaxElapsedMinutes:
            data.rebroadcastMaxElapsedMinutes ?? ''
        });
      }
    } catch (error) {
      console.error(
        'Failed to fetch platform settings:',
        error
      );

      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to load platform settings.'
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  const handlePlatformSettingChange = (
    field,
    value
  ) => {
    setPlatformSettings((prev) => ({
      ...prev,
      [field]: value
    }));

    setMessage({
      type: '',
      text: ''
    });
  };

  const handleSavePlatformSettings = async () => {
    try {
      setSavingSettings(true);
      setMessage({ type: '', text: '' });

      const payload = {
        deliveryRadiusKm: Number(
          platformSettings.deliveryRadiusKm
        ),

        platformCommissionPercent: Number(
          platformSettings.platformCommissionPercent
        ),

        vendorAcceptTimeoutSeconds: Number(
          platformSettings.vendorAcceptTimeoutSeconds
        ),

        deliveryAcceptTimeoutSeconds: Number(
          platformSettings.deliveryAcceptTimeoutSeconds
        ),

        rebroadcastMaxRounds: Number(
          platformSettings.rebroadcastMaxRounds
        ),

        rebroadcastMaxElapsedMinutes: Number(
          platformSettings.rebroadcastMaxElapsedMinutes
        )
      };

      console.log(
        'Updating Platform Settings:',
        payload
      );

      const response = await apiClient.put(
        '/api/admin/settings',
        payload
      );

      console.log(
        'Update Platform Settings Response:',
        response.data
      );

      const updatedData =
        response?.data?.data ||
        response?.data;

      if (updatedData) {
        setPlatformSettings({
          deliveryRadiusKm:
            updatedData.deliveryRadiusKm ??
            payload.deliveryRadiusKm,

          platformCommissionPercent:
            updatedData.platformCommissionPercent ??
            payload.platformCommissionPercent,

          vendorAcceptTimeoutSeconds:
            updatedData.vendorAcceptTimeoutSeconds ??
            payload.vendorAcceptTimeoutSeconds,

          deliveryAcceptTimeoutSeconds:
            updatedData.deliveryAcceptTimeoutSeconds ??
            payload.deliveryAcceptTimeoutSeconds,

          rebroadcastMaxRounds:
            updatedData.rebroadcastMaxRounds ??
            payload.rebroadcastMaxRounds,

          rebroadcastMaxElapsedMinutes:
            updatedData.rebroadcastMaxElapsedMinutes ??
            payload.rebroadcastMaxElapsedMinutes
        });
      }

      setMessage({
        type: 'success',
        text: 'Platform settings updated successfully.'
      });
    } catch (error) {
      console.error(
        'Failed to update platform settings:',
        error
      );

      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to update platform settings.'
      });
    } finally {
      setSavingSettings(false);
    }
  };

  // =========================================================
  // PASSWORD API
  // =========================================================

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      setMessage({
        type: 'error',
        text: 'Please enter your current password.'
      });
      return;
    }

    if (!passwordData.newPassword) {
      setMessage({
        type: 'error',
        text: 'Please enter a new password.'
      });
      return;
    }

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      setMessage({
        type: 'error',
        text: 'New password and confirm password do not match.'
      });
      return;
    }

    try {
      setChangingPassword(true);

      const response = await changeAdminPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      console.log(
        'Change Password Response:',
        response
      );

      setMessage({
        type: 'success',
        text: 'Password changed successfully.'
      });

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setShowPasswordModal(false);
    } catch (error) {
      console.error(
        'Failed to change password:',
        error
      );

      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to change password.'
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // =========================================================
  // SESSIONS API
  // =========================================================

  const handleOpenSessions = async () => {
    try {
      setShowSessionsModal(true);
      setLoadingSessions(true);

      const response = await getActiveSessions();

      console.log(
        'Active Sessions Response:',
        response
      );

      const data =
        response?.data ||
        response;

      setSessions(
        Array.isArray(data)
          ? data
          : data?.sessions || []
      );
    } catch (error) {
      console.error(
        'Failed to fetch active sessions:',
        error
      );

      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to load active sessions.'
      });
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (
    sessionId
  ) => {
    try {
      await revokeSession(sessionId);

      setSessions((prev) =>
        prev.filter(
          (session) =>
            (session.id || session.sessionId) !==
            sessionId
        )
      );

      setMessage({
        type: 'success',
        text: 'Session revoked successfully.'
      });
    } catch (error) {
      console.error(
        'Failed to revoke session:',
        error
      );

      setMessage({
        type: 'error',
        text:
          error?.response?.data?.message ||
          'Failed to revoke session.'
      });
    }
  };

  // =========================================================
  // TOGGLE COMPONENT
  // =========================================================

  const Toggle = ({
    checked,
    onChange,
    disabled = false
  }) => (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
        checked
          ? 'bg-emerald-500 justify-end'
          : 'bg-slate-200 justify-start'
      } ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : ''
      }`}
    >
      <span className="bg-white w-4 h-4 rounded-full shadow-sm" />
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-slate-50 flex">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />

      <main className="flex-1 min-h-screen p-8 lg:p-12 overflow-y-auto w-full">

        {/* HEADER */}
        <header className="mb-8">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
            Configuration
          </span>

          <h1 className="text-3xl font-black text-slate-900 mt-2">
            System Settings
          </h1>

          <p className="text-slate-500 mt-1">
            Manage your profile, platform configuration,
            notification preferences, and security.
          </p>
        </header>

        {/* GLOBAL MESSAGE */}
        {message.text && (
          <div
            className={`mb-6 flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}

              <span className="text-sm font-semibold">
                {message.text}
              </span>
            </div>

            <button
              onClick={() =>
                setMessage({
                  type: '',
                  text: ''
                })
              }
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="w-full space-y-6">

          {/* =================================================
              PLATFORM SETTINGS
          ================================================= */}

          <section className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-sm space-y-6">

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <SettingsIcon size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 text-lg">
                  Platform Settings
                </h2>

                <p className="text-xs text-slate-500">
                  Configure delivery, commission, timeout and
                  rebroadcast rules.
                </p>
              </div>
            </div>

            {loadingSettings ? (
              <div className="flex justify-center py-12">
                <Loader2
                  size={24}
                  className="animate-spin text-emerald-600"
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Delivery Radius */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Delivery Radius
                    </label>

                    <div className="relative">
                      <Truck
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="number"
                        min="0.5"
                        step="0.1"
                        value={
                          platformSettings.deliveryRadiusKm
                        }
                        onChange={(e) =>
                          handlePlatformSettingChange(
                            'deliveryRadiusKm',
                            e.target.value
                          )
                        }
                        className="w-full pl-11 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        KM
                      </span>
                    </div>
                  </div>

                  {/* Commission */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Platform Commission
                    </label>

                    <div className="relative">
                      <Percent
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={
                          platformSettings.platformCommissionPercent
                        }
                        onChange={(e) =>
                          handlePlatformSettingChange(
                            'platformCommissionPercent',
                            e.target.value
                          )
                        }
                        className="w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Vendor Timeout */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Vendor Accept Timeout
                    </label>

                    <div className="relative">
                      <Clock
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="number"
                        min="0"
                        value={
                          platformSettings.vendorAcceptTimeoutSeconds
                        }
                        onChange={(e) =>
                          handlePlatformSettingChange(
                            'vendorAcceptTimeoutSeconds',
                            e.target.value
                          )
                        }
                        className="w-full pl-11 pr-20 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        seconds
                      </span>
                    </div>
                  </div>

                  {/* Delivery Timeout */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Delivery Accept Timeout
                    </label>

                    <div className="relative">
                      <Clock
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="number"
                        min="0"
                        value={
                          platformSettings.deliveryAcceptTimeoutSeconds
                        }
                        onChange={(e) =>
                          handlePlatformSettingChange(
                            'deliveryAcceptTimeoutSeconds',
                            e.target.value
                          )
                        }
                        className="w-full pl-11 pr-20 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        seconds
                      </span>
                    </div>
                  </div>

                  {/* Rebroadcast Rounds */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Rebroadcast Max Rounds
                    </label>

                    <div className="relative">
                      <RotateCcw
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="number"
                        min="0"
                        value={
                          platformSettings.rebroadcastMaxRounds
                        }
                        onChange={(e) =>
                          handlePlatformSettingChange(
                            'rebroadcastMaxRounds',
                            e.target.value
                          )
                        }
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                      />
                    </div>
                  </div>

                  {/* Rebroadcast Elapsed */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Rebroadcast Max Elapsed Time
                    </label>

                    <div className="relative">
                      <Clock
                        size={17}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="number"
                        min="0"
                        value={
                          platformSettings.rebroadcastMaxElapsedMinutes
                        }
                        onChange={(e) =>
                          handlePlatformSettingChange(
                            'rebroadcastMaxElapsedMinutes',
                            e.target.value
                          )
                        }
                        className="w-full pl-11 pr-20 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium"
                      />

                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        minutes
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSavePlatformSettings}
                    disabled={savingSettings}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-sm font-bold rounded-xl"
                  >
                    {savingSettings ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Platform Settings
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </section>

          {/* =================================================
              PROFILE
          ================================================= */}

          <section className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-sm space-y-6">

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <User size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 text-lg">
                  Profile Information
                </h2>

                <p className="text-xs text-slate-500">
                  Update your admin account details.
                </p>
              </div>
            </div>

            {loadingProfile ? (
              <div className="flex justify-center py-8">
                <Loader2
                  size={24}
                  className="animate-spin text-blue-600"
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) =>
                        setProfile({
                          ...profile,
                          name: e.target.value
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="email"
                        value={profile.email}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            email: e.target.value
                          })
                        }
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Account Role
                    </label>

                    <input
                      type="text"
                      value={profile.role}
                      disabled
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-medium text-slate-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-bold rounded-xl"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Profile
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </section>

          {/* =================================================
              NOTIFICATIONS
          ================================================= */}

          <section className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-sm space-y-6">

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <Bell size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 text-lg">
                  Notification Preferences
                </h2>

                <p className="text-xs text-slate-500">
                  Choose when and how you want to be notified.
                </p>
              </div>
            </div>

            {loadingNotifications ? (
              <div className="flex justify-center py-8">
                <Loader2
                  size={24}
                  className="animate-spin text-emerald-600"
                />
              </div>
            ) : (
              <div className="space-y-4">

                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Email Alerts
                    </h4>

                    <p className="text-xs text-slate-500">
                      Receive system updates and critical issue notices via email.
                    </p>
                  </div>

                  <Toggle
                    checked={notifications.emailAlerts}
                    disabled={savingNotifications}
                    onChange={(value) =>
                      handleNotificationChange(
                        'emailAlerts',
                        value
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Push Notifications
                    </h4>

                    <p className="text-xs text-slate-500">
                      Get alerts directly on your browser or device.
                    </p>
                  </div>

                  <Toggle
                    checked={
                      notifications.pushNotifications
                    }
                    disabled={savingNotifications}
                    onChange={(value) =>
                      handleNotificationChange(
                        'pushNotifications',
                        value
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Weekly Summary Reports
                    </h4>

                    <p className="text-xs text-slate-500">
                      Receive a consolidated status report every Monday.
                    </p>
                  </div>

                  <Toggle
                    checked={
                      notifications.weeklyReport
                    }
                    disabled={savingNotifications}
                    onChange={(value) =>
                      handleNotificationChange(
                        'weeklyReport',
                        value
                      )
                    }
                  />
                </div>

              </div>
            )}
          </section>

          {/* =================================================
              SECURITY
          ================================================= */}

          <section className="bg-white p-6 md:p-8 rounded-[24px] border border-slate-200/60 shadow-sm space-y-6">

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Shield size={20} />
              </div>

              <div>
                <h2 className="font-bold text-slate-900 text-lg">
                  Security & Authentication
                </h2>

                <p className="text-xs text-slate-500">
                  Manage credentials and active login sessions.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">

              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold"
              >
                <Key size={16} />
                Change Password
              </button>

              <button
                onClick={handleOpenSessions}
                className="flex items-center gap-2 px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold"
              >
                <Globe size={16} />
                Manage Active Sessions
              </button>

            </div>
          </section>

        </div>
      </main>

      {/* =====================================================
          PASSWORD MODAL
      ===================================================== */}

      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Change Password
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Update your admin account password.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowPasswordModal(false)
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">

              <input
                type="password"
                placeholder="Current Password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value
                  })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />

              <input
                type="password"
                placeholder="New Password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value
                  })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value
                  })
                }
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() =>
                  setShowPasswordModal(false)
                }
                className="px-5 py-3 border border-slate-200 rounded-xl text-sm font-bold"
              >
                Cancel
              </button>

              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="px-5 py-3 bg-emerald-600 text-white rounded-xl text-sm font-bold"
              >
                {changingPassword
                  ? 'Changing...'
                  : 'Change Password'}
              </button>

            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          SESSIONS MODAL
      ===================================================== */}

      {showSessionsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl">

            <div className="flex items-center justify-between mb-6">

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Active Sessions
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Manage devices currently logged into your account.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowSessionsModal(false)
                }
              >
                <X size={20} />
              </button>

            </div>

            {loadingSessions ? (
              <div className="flex justify-center py-10">
                <Loader2
                  size={24}
                  className="animate-spin text-emerald-600"
                />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Globe
                  size={30}
                  className="mx-auto mb-3"
                />

                <p className="text-sm font-medium">
                  No active sessions found.
                </p>
              </div>
            ) : (
              <div className="space-y-3">

                {sessions.map((session, index) => {
                  const sessionId =
                    session.id ||
                    session.sessionId;

                  return (
                    <div
                      key={sessionId || index}
                      className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {session.device ||
                            session.deviceName ||
                            'Unknown Device'}
                        </p>

                        <p className="text-xs text-slate-500 mt-1">
                          {session.ipAddress ||
                            session.ip ||
                            'Unknown IP'}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {session.lastActive ||
                            session.lastLogin ||
                            ''}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleRevokeSession(
                            sessionId
                          )
                        }
                        className="px-3 py-2 text-xs font-bold text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                      >
                        Revoke
                      </button>
                    </div>
                  );
                })}

              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}