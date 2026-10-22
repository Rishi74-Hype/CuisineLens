import React, { useState } from 'react';
import { Crown, Check, X, Sparkles, ShieldCheck, Zap, HeartPulse, FileText } from 'lucide-react';
import { UserProfile } from '../types/nutrition.ts';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onToggleProStatus: (isPro: boolean) => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onToggleProStatus,
}) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');

  if (!isOpen) return null;

  const handleActivatePro = () => {
    onToggleProStatus(!userProfile.isPro);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col max-h-[92vh] transition-colors">
        {/* Header Hero */}
        <div className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-400/30">
            <Crown className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            Unlock CuisineLens Pro
          </h2>
          <p className="text-xs text-amber-200/80 mt-1 max-w-xs mx-auto">
            Unlimited AI photo scans & authentic regional cooking fat calibration
          </p>

          {/* Billing Selector */}
          <div className="mt-5 inline-flex items-center p-1 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === 'annual'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Annual (Save 38%)
            </button>
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Feature Comparison List */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="space-y-3">
            {[
              {
                title: 'Unlimited Meal Photo Scans',
                desc: 'Free plan is limited to 3 scans per day. Pro gives you infinite logs.',
                icon: Zap,
              },
              {
                title: 'Hidden Cooking Oil & Ghee Calibration',
                desc: 'Deep detection of high-calorie regional cooking fats (desi ghee, lard, sesame & mustard oil).',
                icon: ShieldCheck,
              },
              {
                title: 'Weekly Regional Dietitian Insights',
                desc: 'Actionable guidance on balancing rich ethnic curries, noodles, and street food with your goals.',
                icon: Sparkles,
              },
              {
                title: 'Complete Micronutrient Dashboard',
                desc: 'Live tracking of dietary fiber, sodium, potassium, and heart-healthy unsaturated fats.',
                icon: HeartPulse,
              },
            ].map((feat, idx) => {
              const IconComp = feat.icon;
              return (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 border border-amber-100 dark:border-amber-900/60">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100">{feat.title}</h4>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">{feat.desc}</p>
                  </div>
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-1" />
                </div>
              );
            })}
          </div>

          {/* Pricing Box */}
          <div className="bg-stone-50 dark:bg-stone-800/60 rounded-2xl p-4 border border-stone-200 dark:border-stone-800 text-center space-y-1">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide">
              {billingCycle === 'annual' ? 'Billed annually at $59.99/yr' : 'Billed monthly at $7.99/mo'}
            </span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-black text-stone-900 dark:text-stone-100 tabular-nums">
                {billingCycle === 'annual' ? '$4.99' : '$7.99'}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">/ month</span>
            </div>
            <p className="text-[10px] text-stone-400 dark:text-stone-500">
              Cancel anytime with 1 tap. Handled via RevenueCat store subscriptions.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 bg-stone-50 dark:bg-stone-950/60 border-t border-stone-200 dark:border-stone-800 space-y-2 transition-colors">
          <button
            onClick={handleActivatePro}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Crown className="w-4 h-4 text-amber-200" />
            <span>
              {userProfile.isPro ? 'Deactivate Pro (Switch to Free)' : 'Start 7-Day Free Trial'}
            </span>
          </button>

          <p className="text-center text-[11px] text-stone-400 dark:text-stone-500">
            {userProfile.isPro ? 'Pro is currently active' : 'Test mode: Clicking above unlocks Pro immediately for testing.'}
          </p>
        </div>
      </div>
    </div>
  );
};
