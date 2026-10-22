import React from 'react';
import { Camera, Database, BarChart3, User, Crown, Moon, Sun, Bot, FlaskConical, LogIn, LogOut } from 'lucide-react';
import { UserProfile } from '../types/nutrition.ts';
import { useAuth } from '../context/AuthContext.tsx';

interface HeaderProps {
  currentTab: 'today' | 'scanner' | 'database' | 'insights';
  setCurrentTab: (tab: 'today' | 'scanner' | 'database' | 'insights') => void;
  userProfile: UserProfile;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenPaywall: () => void;
  onOpenProfile: () => void;
  onOpenScanner: () => void;
  onOpenChat: () => void;
  onOpenScience: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  userProfile,
  darkMode,
  onToggleDarkMode,
  onOpenPaywall,
  onOpenProfile,
  onOpenScanner,
  onOpenChat,
  onOpenScience,
}) => {
  const { user, signInWithGoogle, logout } = useAuth();
  const scansLeft = userProfile.isPro ? 'Unlimited' : Math.max(0, 3 - userProfile.dailyScansUsed);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 md:gap-6">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('today')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-600/20 group-hover:bg-amber-700 transition-colors">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-stone-900 dark:text-white group-hover:text-amber-600 transition-colors font-sans">
                CuisineLens
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/50">
                Regional AI
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-stone-600 dark:text-stone-300">
          <button
            onClick={() => setCurrentTab('today')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'today'
                ? 'border-amber-600 text-stone-900 dark:text-white font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-white hover:border-stone-300 dark:hover:border-stone-700'
            }`}
          >
            Today's Log
          </button>
          <button
            onClick={onOpenScanner}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 ${
              currentTab === 'scanner'
                ? 'border-amber-600 text-stone-900 dark:text-white font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-white hover:border-stone-300 dark:hover:border-stone-700'
            }`}
          >
            Scan Food Photo
          </button>
          <button
            onClick={() => setCurrentTab('database')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'database'
                ? 'border-amber-600 text-stone-900 dark:text-white font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-white hover:border-stone-300 dark:hover:border-stone-700'
            }`}
          >
            <Database className="w-4 h-4 text-stone-400 dark:text-stone-500" />
            <span>Dishes Database</span>
          </button>
          <button
            onClick={() => setCurrentTab('insights')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 border-b-2 flex items-center gap-1.5 ${
              currentTab === 'insights'
                ? 'border-amber-600 text-stone-900 dark:text-white font-semibold'
                : 'border-transparent hover:text-stone-900 dark:hover:text-white hover:border-stone-300 dark:hover:border-stone-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-stone-400 dark:text-stone-500" />
            <span>Regional Insights</span>
          </button>
        </nav>

        {/* Zone 3: Chat, Bioscience, Theme & Auth Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AI Chatbot Button */}
          <button
            onClick={onOpenChat}
            title="Chat with AI Regional Nutritionist (gemini-4-argon / 3.8 / 3.1)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-xl border border-amber-200 dark:border-amber-800 transition-colors"
          >
            <Bot className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="hidden sm:inline">AI Nutritionist</span>
          </button>

          {/* Bioscience & Grounding Explorer Button */}
          <button
            onClick={onOpenScience}
            title="Bioscience Skills: PubChem 2D chemistry, PubMed citations, Google Search & Maps grounding"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-900 dark:text-cyan-200 bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 rounded-xl border border-cyan-200 dark:border-cyan-800 transition-colors"
          >
            <FlaskConical className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden md:inline">Science & Maps</span>
          </button>

          {/* Dark Mode Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 flex items-center justify-center transition-colors border border-stone-200 dark:border-stone-700"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Pro Status Button */}
          {!userProfile.isPro ? (
            <button
              onClick={onOpenPaywall}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 hover:bg-amber-200 dark:hover:bg-amber-900/80 rounded-lg transition-colors border border-amber-300 dark:border-amber-700"
            >
              <Crown className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Pro ({scansLeft})</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <Crown className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Pro</span>
            </div>
          )}

          {/* Firebase Authentication (Google Sign-In) */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-1">
              <button
                onClick={onOpenProfile}
                title={`Signed in as ${user.displayName || user.email}`}
                className="w-8 h-8 rounded-full overflow-hidden border border-emerald-500 hover:scale-105 transition-transform"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
              </button>
              <button
                onClick={logout}
                title="Sign out of Firebase"
                className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-stone-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center justify-center transition-colors border border-stone-200 dark:border-stone-700"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-stone-50 dark:hover:bg-stone-750 text-stone-800 dark:text-stone-200 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold shadow-2xs transition-all active:scale-[0.98]"
              title="Sign in with Google via Firebase Auth"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Snap Meal Primary Trigger */}
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs shadow-amber-600/20 active:scale-[0.98] transition-all"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Snap</span>
          </button>
        </div>
      </div>
    </header>
  );
};
