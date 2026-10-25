import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthSection } from './components/AuthSection';
import { Dashboard } from './components/Dashboard';
import { ActivationHistory } from './components/ActivationHistory';
import { PowerSnakeInspector } from './components/PowerSnakeInspector';
import { NetworkDiagnosticsModal } from './components/NetworkDiagnosticsModal';
import { TelegramBotSimulator } from './components/TelegramBotSimulator';
import { Footer } from './components/Footer';
import { UserRecord, ActivationRecord } from './types';
import { api } from './services/api';
import { Loader2 } from 'lucide-react';

export function App() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [user, setUser] = useState<UserRecord | null>(null);
  const [history, setHistory] = useState<ActivationRecord[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Modals
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  // RTL sync with language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Initial session & history fetch
  useEffect(() => {
    async function init() {
      try {
        const [sessionRes, historyRes] = await Promise.allSettled([
          api.getSession(),
          api.getHistory(),
        ]);

        if (sessionRes.status === 'fulfilled' && sessionRes.value.user) {
          setUser(sessionRes.value.user);
        }
        if (historyRes.status === 'fulfilled' && historyRes.value.history) {
          setHistory(historyRes.value.history);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsInitializing(false);
      }
    }
    init();
  }, []);

  const handleLoginSuccess = (loggedInUser: UserRecord) => {
    setUser(loggedInUser);
    // Refresh history
    api.getHistory().then((res) => setHistory(res.history)).catch(() => {});
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
  };

  const handleActivationSuccess = (newRecord: ActivationRecord) => {
    setHistory((prev) => [newRecord, ...prev]);
  };

  const handleClearHistory = async () => {
    try {
      await api.clearHistory();
      setHistory([]);
    } catch (e) {
      console.error(e);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
        <span className="text-sm font-semibold tracking-wide">
          {lang === 'ar' ? 'جاري تشغيل محرك Power3...' : 'Initializing Power3...'}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        user={user}
        lang={lang}
        setLang={setLang}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onOpenTelegramModal={() => setIsTelegramModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {!user ? (
          <div className="space-y-10 py-6">
            {/* Hero pitch */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/15 border border-red-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>{lang === 'ar' ? 'باقات أوريدو غير المحدودة' : 'Unlimited Ooredoo Algeria Activation'}</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                {lang === 'ar' ? (
                  <>
                    فعّل إنترنت <span className="text-rose-500">1 GB مجاناً</span> بسرعة وبدون حدود
                  </>
                ) : (
                  <>
                    Activate <span className="text-rose-500">1 GB Free Data</span> Instantly & Without Limits
                  </>
                )}
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                {lang === 'ar'
                  ? 'محرك Power3 لتفعيل باقات Ooredoo الجزائر ومكافآت لعبة Power Snake برقم هاتفك وبشكل مباشر.'
                  : 'Power3 high-performance engine for activating Ooredoo DZ bundles and Power Snake quest rewards directly.'}
              </p>
            </div>

            {/* Auth Form Card */}
            <AuthSection lang={lang} onLoginSuccess={handleLoginSuccess} />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Authenticated Dashboard */}
            <Dashboard
              user={user}
              lang={lang}
              onLogout={handleLogout}
              onActivationSuccess={handleActivationSuccess}
            />

            {/* Power Snake Gamification Component */}
            <PowerSnakeInspector user={user} lang={lang} />

            {/* History Feed */}
            <ActivationHistory
              history={history}
              lang={lang}
              onClearHistory={handleClearHistory}
            />
          </div>
        )}
      </main>

      <Footer lang={lang} />

      {/* Diagnostics Modal */}
      <NetworkDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        lang={lang}
      />

      {/* Telegram Bot Simulator */}
      <TelegramBotSimulator
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        lang={lang}
        user={user}
        onTriggerActivation={() => {
          // If called from telegram modal, trigger via API
          api.activateBundle().then((res) => {
            if (res.success && res.history?.[0]) {
              handleActivationSuccess(res.history[0]);
            }
          });
        }}
        onTriggerRelogin={handleLogout}
      />
    </div>
  );
}
export default App;
