import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCog,
  Key,
  Bell,
  Sun,
  Cog,
  Code,
  CreditCard,
  ShieldOff,
  List,
  X,
  Copy,
  RefreshCw,
  FileSearch,
  Check,
  ChevronDown,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
      duration: 0.6
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
};

const hoverCard = {
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 200,
    }
  }
};

const hoverButton = {
  hover: {
    scale: 1.05,
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
  },
  tap: {
    scale: 0.98
  }
};

function generateApiKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 32 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function SettingsPage() {
  const [modalType, setModalType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [profile, setProfile] = useState({ name: "Marlon Welimaluwa", email: "you@company.com" });
  const [notifications, setNotifications] = useState({ email: true, push: false });
  const [theme, setTheme] = useState("system");
  const [prefs, setPrefs] = useState({ language: "English", timezone: "UTC+05:30", currency: "USD" });
  const [apiKey, setApiKey] = useState(generateApiKey());
  const [billing, setBilling] = useState({ plan: "Pro", nextBilling: "2025-09-01", cardLast4: "4242" });
  const [logs] = useState([
    { id: 1, when: "Aug 12, 2025 — 10:12", what: "Signed in", who: "You", ip: "198.51.100.1" },
    { id: 2, when: "Aug 10, 2025 — 08:03", what: "Changed password", who: "You", ip: "198.51.100.1" },
    { id: 3, when: "Jul 21, 2025 — 15:20", what: "API key generated", who: "You", ip: "203.0.113.45" },
  ]);

  const openModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setModalType("");
  };

  const handleGenerateKey = () => setApiKey(generateApiKey());
  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      alert("API key copied to clipboard");
    } catch (e) {
      alert("Unable to copy. Select and copy manually.");
    }
  };

  const handleDownloadData = () => {
    const data = { profile, prefs, notifications, billing };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    const ok = window.confirm("Are you sure you want to permanently delete your account? This cannot be undone.");
    if (ok) alert("Account deletion requested (mock).");
  };

  const topCards = [
    { id: "profile", title: "Profile", icon: <UserCog className="w-5 h-5 text-[var(--color-primary)]" />, desc: "Edit your personal info" },
    { id: "security", title: "Security", icon: <Key className="w-5 h-5 text-amber-500" />, desc: "Password & 2FA" },
    { id: "notifications", title: "Notifications", icon: <Bell className="w-5 h-5 text-emerald-500" />, desc: "Email & push prefs" },
    { id: "theme", title: "Theme", icon: <Sun className="w-5 h-5 text-yellow-500" />, desc: "Light / dark / system" },
  ];

  const featureCards = [
    { id: "prefs", title: "Preferences", icon: <Cog className="w-5 h-5 text-gray-500" />, desc: "Language, timezone, currency" },
    { id: "api", title: "API & Integrations", icon: <Code className="w-5 h-5 text-blue-500" />, desc: "Manage API keys & webhooks" },
    { id: "billing", title: "Billing", icon: <CreditCard className="w-5 h-5 text-purple-500" />, desc: "Plan & payment history" },
    { id: "privacy", title: "Privacy", icon: <ShieldOff className="w-5 h-5 text-red-500" />, desc: "Download or delete data" },
    { id: "logs", title: "Audit Logs", icon: <List className="w-5 h-5 text-gray-500" />, desc: "Recent activity & security" },
  ];

  return (
    <div className="md:p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="space-y-2 text-center sm:text-left">
          <h1 className="text-heading-lg font-bold bg-gradient-primary bg-clip-text text-transparent">Settings Hub</h1>
          <p className="text-muted-dark text-sm sm:text-base">
            Personalize your account, integrations, billing and privacy
          </p>
        </motion.div>

        {/* Top quick cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {topCards.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => openModal(c.id)}
              variants={hoverCard}
              whileHover="hover"
              whileTap="tap"
              className="bg-white/80 rounded-xl shadow-md border border-white/20 p-4 flex flex-col items-center gap-3"
            >
              <motion.div
                className={`p-3 rounded-xl ${
                  c.id === "profile" ? "bg-[var(--color-primary)]/20" :
                  c.id === "security" ? "bg-amber-100" :
                  c.id === "notifications" ? "bg-emerald-100" : "bg-yellow-100"
                }`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {c.icon}
              </motion.div>
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-900">{c.title}</div>
                <div className="text-xs text-muted-dark">{c.desc}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Feature cards row */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {featureCards.map((c) => (
            <motion.button
              key={c.id}
              onClick={() => openModal(c.id)}
              variants={hoverCard}
              whileHover="hover"
              whileTap="tap"
              className="bg-white/80 rounded-xl shadow-md border border-white/20 p-4 flex flex-col sm:flex-row items-center gap-3"
            >
              <motion.div
                className={`p-2 rounded-xl ${
                  c.id === "api" ? "bg-blue-100" :
                  c.id === "billing" ? "bg-purple-100" :
                  c.id === "privacy" ? "bg-red-100" : "bg-gray-100"
                }`}
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {c.icon}
              </motion.div>
              <div className="text-center sm:text-left">
                <div className="text-sm font-semibold text-gray-900">{c.title}</div>
                <div className="text-xs text-muted-dark">{c.desc}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto"
            style={{
              background: 'rgba(27, 56, 144, 0.1)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                transition={{ 
                  duration: 0.4,
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className="inline-block align-bottom bg-white/95 backdrop-blur-xl rounded-3xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full border border-white/20"
              >
                <div className="relative p-8">
                  {/* Close button */}
                  <motion.button
                    onClick={closeModal}
                    className="p-3 rounded-2xl hover:bg-red-50 transition-all duration-100 group cursor-pointer absolute top-4 right-4"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-6 w-6 text-gray-600 group-hover:text-red-600 transition-colors duration-100" />
                  </motion.button>

                  {/* Modal Content */}
                  <div className="space-y-6">
                    {/* Modal Header */}
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                        {modalType === "profile" && "Profile"}
                        {modalType === "security" && "Security"}
                        {modalType === "notifications" && "Notifications"}
                        {modalType === "theme" && "Theme"}
                        {modalType === "prefs" && "Preferences"}
                        {modalType === "api" && "API & Integrations"}
                        {modalType === "billing" && "Billing"}
                        {modalType === "privacy" && "Privacy"}
                        {modalType === "logs" && "Audit Logs"}
                      </h2>
                      <p className="text-muted-dark text-sm">
                        {modalType === "profile" && "Update your name and contact info"}
                        {modalType === "security" && "Password & 2FA settings"}
                        {modalType === "notifications" && "Control how we send you updates"}
                        {modalType === "theme" && "Choose your preferred appearance"}
                        {modalType === "prefs" && "Language, timezone and currency"}
                        {modalType === "api" && "Manage API keys and webhooks"}
                        {modalType === "billing" && "Plan & payment history"}
                        {modalType === "privacy" && "Download or delete your data"}
                        {modalType === "logs" && "Recent account activity"}
                      </p>
                    </div>

                    {/* Profile Modal */}
                    {modalType === "profile" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                            <input
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input
                              value={profile.email}
                              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Security Modal */}
                    {modalType === "security" && (
                      <>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
                            <input
                              type="password"
                              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                            <input
                              type="password"
                              className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                            />
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                            <div>
                              <div className="text-sm font-semibold text-gray-700">Two-Factor Authentication</div>
                              <div className="text-xs text-muted-dark">Add an extra layer of security</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Notifications Modal */}
                    {modalType === "notifications" && (
                      <>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                            <div>
                              <div className="text-sm font-semibold text-gray-700">Email Alerts</div>
                              <div className="text-xs text-muted-dark">Important updates by email</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={notifications.email} 
                                onChange={() => setNotifications({ ...notifications, email: !notifications.email })} 
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                            </label>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                            <div>
                              <div className="text-sm font-semibold text-gray-700">Push Notifications</div>
                              <div className="text-xs text-muted-dark">Browser & mobile push</div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={notifications.push} 
                                onChange={() => setNotifications({ ...notifications, push: !notifications.push })} 
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                            </label>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Theme Modal */}
                    {modalType === "theme" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <button 
                            onClick={() => setTheme("light")} 
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${
                              theme === "light" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10" : "border-gray-200"
                            }`}
                          >
                            <Sun className="w-5 h-5" />
                            <span className="text-sm font-medium">Light</span>
                          </button>
                          <button 
                            onClick={() => setTheme("dark")} 
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${
                              theme === "dark" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10" : "border-gray-200"
                            }`}
                          >
                            <Sun className="w-5 h-5" />
                            <span className="text-sm font-medium">Dark</span>
                          </button>
                          <button 
                            onClick={() => setTheme("system")} 
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${
                              theme === "system" ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10" : "border-gray-200"
                            }`}
                          >
                            <Cog className="w-5 h-5" />
                            <span className="text-sm font-medium">System</span>
                          </button>
                        </div>
                      </>
                    )}

                    {/* Preferences Modal */}
                    {modalType === "prefs" && (
                      <>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                            <div className="relative">
                              <select
                                value={prefs.language}
                                onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
                                className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                              >
                                <option>English</option>
                                <option>Español</option>
                                <option>Français</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <ChevronDown className="h-5 w-5 text-[var(--color-primary)]" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Timezone</label>
                            <div className="relative">
                              <select
                                value={prefs.timezone}
                                onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
                                className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                              >
                                <option>UTC+05:30</option>
                                <option>UTC+00:00</option>
                                <option>UTC-07:00</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <ChevronDown className="h-5 w-5 text-[var(--color-primary)]" />
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                            <div className="relative">
                              <select
                                value={prefs.currency}
                                onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
                                className="w-full py-3 px-4 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/20 focus:outline-none appearance-none bg-white/80 backdrop-blur-sm transition-all duration-300"
                              >
                                <option>USD</option>
                                <option>AED</option>
                                <option>LKR</option>
                              </select>
                              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                <ChevronDown className="h-5 w-5 text-[var(--color-primary)]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* API & Integrations Modal */}
                    {modalType === "api" && (
                      <>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold text-gray-700">API Key</div>
                              <div className="text-xs text-muted-dark">Use this key to authenticate API requests</div>
                            </div>
                            <div className="flex gap-2">
                              <motion.button
                                onClick={handleGenerateKey}
                                variants={hoverButton}
                                whileHover="hover"
                                whileTap="tap"
                                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 flex items-center gap-2 text-sm"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Regenerate
                              </motion.button>
                              <motion.button
                                onClick={handleCopyKey}
                                variants={hoverButton}
                                whileHover="hover"
                                whileTap="tap"
                                className="px-3 py-2 rounded-lg bg-gray-100 text-gray-700 flex items-center gap-2 text-sm"
                              >
                                <Copy className="w-4 h-4" />
                                Copy
                              </motion.button>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-gray-50">
                            <code className="text-xs break-all">{apiKey}</code>
                          </div>
                          
                          <div>
                            <div className="text-sm font-semibold text-gray-700 mb-2">Webhooks</div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                <div>
                                  <div className="text-sm font-medium">Order Hook</div>
                                  <div className="text-xs text-muted-dark">https://example.com/webhook/orders</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" defaultChecked />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                                </label>
                              </div>
                              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                                <div>
                                  <div className="text-sm font-medium">Leads Hook</div>
                                  <div className="text-xs text-muted-dark">https://example.com/webhook/leads</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input type="checkbox" className="sr-only peer" />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Billing Modal */}
                    {modalType === "billing" && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-xl bg-gray-50">
                            <div className="text-sm text-muted-dark">Current Plan</div>
                            <div className="text-lg font-semibold text-gray-900 mt-1">{billing.plan}</div>
                            <div className="text-xs text-muted-dark mt-1">Next billing: {billing.nextBilling}</div>
                          </div>
                          <div className="p-4 rounded-xl bg-gray-50">
                            <div className="text-sm text-muted-dark">Payment Method</div>
                            <div className="text-lg font-semibold text-gray-900 mt-1">•••• •••• •••• {billing.cardLast4}</div>
                            <div className="text-xs text-muted-dark mt-1">Update card via Billing Portal</div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Privacy Modal */}
                    {modalType === "privacy" && (
                      <>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
                            <div>
                              <div className="text-sm font-semibold text-gray-700">Download Your Data</div>
                              <div className="text-xs text-muted-dark">Get a copy of your account data (JSON)</div>
                            </div>
                            <motion.button
                              onClick={handleDownloadData}
                              variants={hoverButton}
                              whileHover="hover"
                              whileTap="tap"
                              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm"
                            >
                              Download
                            </motion.button>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50">
                            <div>
                              <div className="text-sm font-semibold text-red-700">Delete Account</div>
                              <div className="text-xs text-red-600">Permanent removal (GDPR)</div>
                            </div>
                            <motion.button
                              onClick={handleDeleteAccount}
                              variants={hoverButton}
                              whileHover="hover"
                              whileTap="tap"
                              className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm"
                            >
                              Delete
                            </motion.button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Audit Logs Modal */}
                    {modalType === "logs" && (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-semibold text-gray-700">Recent Activity</div>
                            <div className="text-xs text-muted-dark">Account actions and security events</div>
                          </div>
                          <motion.button
                            onClick={() => alert("Export logs (mock)")}
                            variants={hoverButton}
                            whileHover="hover"
                            whileTap="tap"
                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm"
                          >
                            Export
                          </motion.button>
                        </div>
                        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-2">
                          {logs.map((log) => (
                            <div key={log.id} className="p-3 rounded-xl bg-gray-50">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{log.what}</div>
                                  <div className="text-xs text-muted-dark">{log.when} • {log.who}</div>
                                </div>
                                <div className="text-xs text-muted-dark">{log.ip}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Modal Footer */}
                    <div className="flex justify-end gap-3 pt-6">
                      <motion.button
                        onClick={closeModal}
                        variants={hoverButton}
                        whileHover="hover"
                        whileTap="tap"
                        className="px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          alert(`${modalType} settings saved (mock)`);
                          closeModal();
                        }}
                        variants={hoverButton}
                        whileHover="hover"
                        whileTap="tap"
                        className="px-6 py-3 bg-gradient-primary text-white rounded-xl font-semibold shadow-lg cursor-pointer"
                      >
                        Save Changes
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}