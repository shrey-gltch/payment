import React, { useState, useRef, useEffect } from 'react';
import { analyzeRisk } from './services/geminiService';
import { db } from './utils/database';
import { AppView, AnalysisResult, RiskLevel, ScanHistoryItem } from './types';

// Icons Component
const Icons = {
  ShieldCheck: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  ShieldExclamation: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  QrCode: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4h-4v-2h8v-2zm3 1h1v1h-1v-1zm-1-1h1v1h-1v-1zm-2 1h1v1h-1v-1zm-1-1h1v1h-1v-1zm1 2h1v1h-1v-1zm-2 0h1v1h-1v-1zm4-17V9h-9V4h9zm-2 2H8v5h5V6zm-5 7v1h-2v-1h2zm-2-3h-2v2h2v-2zm-3 8v-2h2v2H7zm0-7h2v1H7v-1zm2-7H4v5h5V6H9z" /></svg>,
  History: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Home: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Search: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Upload: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  ChevronRight: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  Bell: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  CreditCard: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>,
  LockClosed: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>,
  Check: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  User: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  Send: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Download: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Fingerprint: ({ className }: { className?: string }) => <svg className={className || "w-6 h-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.131A8 8 0 008 8mc0 1.527.58 2.916 1.534 4M12 8V4m0 0V2m0 2h.01M16.938 10a8.001 8.001 0 00-9.876 0" /></svg>
};

// --- Helper Components defined BEFORE App ---

function SplashScreen() {
  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center">
      <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 animate-pulse shadow-2xl shadow-indigo-500/30">
        <Icons.QrCode className="w-12 h-12 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white tracking-tight">KavacPay</h1>
      <p className="text-indigo-400 text-sm font-medium mt-2">Secure Payments & AI Guard</p>
    </div>
  );
}

function ProcessingOverlay() {
  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[60] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-r-4 border-purple-500 rounded-full animate-spin reverse-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icons.ShieldCheck className="w-8 h-8 text-indigo-400" />
        </div>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Analyzing Patterns</h2>
      <p className="text-slate-400 text-sm max-w-xs animate-pulse">Checking global scam databases and verifying encryption signatures...</p>
    </div>
  );
}

function NavButton({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 w-16 ${active ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
    >
      <div className={`${active ? "scale-110" : ""} transition-transform`}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
}

// --- Main App Component ---

export default function App() {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  
  // Initialize app
  useEffect(() => {
    db.init(); 
    setHistory(db.getAll());

    // Check for onboarding status
    if (!db.isOnboardingComplete()) {
      setView(AppView.ONBOARDING);
    }
    
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const refreshHistory = () => {
    setHistory(db.getAll());
  };

  const handleAnalyze = async (input: File | string) => {
    setProcessing(true);
    try {
      const res = await analyzeRisk(input);
      setResult(res);
      db.add(res);
      refreshHistory();
      setView(AppView.RESULT);
    } catch (e) {
      console.error(e);
      alert("Analysis failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <SplashScreen />;

  return (
    <div className="bg-black min-h-screen text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Main Content Area */}
      <div className="pb-24 max-w-lg mx-auto min-h-screen relative bg-slate-900 shadow-2xl overflow-hidden">
        
        {/* Dynamic Header - Only show on Home/Profile/History */}
        {view !== AppView.SCAN && view !== AppView.PAYMENT && view !== AppView.ONBOARDING && view !== AppView.MANUAL && view !== AppView.RESULT && (
          <header className="px-6 pt-12 pb-4 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
            <div className="flex justify-between items-center mb-6">
              <div 
                onClick={() => setView(AppView.PROFILE)}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold border-2 border-slate-800">
                  JD
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white leading-none">Hello, John</h1>
                  <p className="text-xs text-slate-400">VeriPay Guard Active</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                 <div 
                  onClick={() => setView(AppView.ALERTS)}
                  className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center relative hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <Icons.Bell className="w-5 h-5 text-indigo-400" />
                  <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </div>
              </div>
            </div>
          </header>
        )}

        <main className="px-4 h-full">
          {view === AppView.HOME && <HomeView setView={setView} history={history} />}
          {view === AppView.SCAN && <ScannerView onAnalyze={handleAnalyze} onBack={() => setView(AppView.HOME)} />}
          {view === AppView.MANUAL && <ManualView onAnalyze={handleAnalyze} onBack={() => setView(AppView.HOME)} />}
          {view === AppView.HISTORY && <HistoryView history={history} onSelect={(item) => { setResult(item); setView(AppView.RESULT); }} />}
          {view === AppView.RESULT && result && <ResultView result={result} onBack={() => setView(AppView.HOME)} onProceed={() => setView(AppView.PAYMENT)} />}
          {view === AppView.ALERTS && <AlertsView onBack={() => setView(AppView.HOME)} />}
          {view === AppView.PAYMENT && result && <PaymentFlowView result={result} onCancel={() => setView(AppView.HOME)} />}
          {view === AppView.PROFILE && <ProfileView onBack={() => setView(AppView.HOME)} />}
          {view === AppView.ONBOARDING && <OnboardingView onComplete={() => { db.completeOnboarding(); setView(AppView.HOME); }} />}
        </main>

        {/* Bottom Navigation - GPay Style */}
        {view !== AppView.SCAN && view !== AppView.RESULT && view !== AppView.PAYMENT && view !== AppView.ONBOARDING && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-slate-900 border-t border-slate-800 px-6 py-2 z-40 pb-6">
            <div className="flex justify-between items-end relative">
              <NavButton icon={<Icons.Home />} label="Home" active={view === AppView.HOME} onClick={() => setView(AppView.HOME)} />
              <NavButton icon={<Icons.Search />} label="Check ID" active={view === AppView.MANUAL} onClick={() => setView(AppView.MANUAL)} />
              
              {/* Floating Scan Button */}
              <div className="relative -top-6 mx-2">
                <button 
                  onClick={() => setView(AppView.SCAN)}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center justify-center text-white shadow-xl shadow-indigo-600/30 hover:scale-105 transition-transform active:scale-95 border-4 border-slate-900 group"
                >
                  <Icons.QrCode className="w-8 h-8 group-hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>

              <NavButton icon={<Icons.History />} label="History" active={view === AppView.HISTORY} onClick={() => setView(AppView.HISTORY)} />
              <NavButton icon={<Icons.User />} label="Profile" active={view === AppView.PROFILE} onClick={() => setView(AppView.PROFILE)} />
            </div>
          </nav>
        )}

        {/* Global Loading Overlay */}
        {processing && <ProcessingOverlay />}
      </div>
    </div>
  );
}

// --- Views ---

function HomeView({ setView, history }: { setView: (v: AppView) => void, history: ScanHistoryItem[] }) {
  const people = [
    { name: "Anna", color: "bg-pink-500" },
    { name: "Mike", color: "bg-blue-500" },
    { name: "Dad", color: "bg-green-500" },
    { name: "Shop", color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Balance Card - GPay Style */}
      <div className="bg-gradient-to-r from-[#1a1f35] to-[#111827] rounded-3xl p-6 border border-indigo-500/20 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">KavacPay Balance</p>
          <div className="flex items-baseline space-x-1">
             <span className="text-2xl text-slate-300">$</span>
             <h2 className="text-4xl font-bold text-white tracking-tight">2,450.00</h2>
          </div>
          <div className="mt-6 flex space-x-4">
             <button onClick={() => setView(AppView.MANUAL)} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center space-x-2">
                <Icons.Send className="w-4 h-4" />
                <span>Transfer</span>
             </button>
             <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center space-x-2">
                <Icons.Download className="w-4 h-4" />
                <span>Request</span>
             </button>
          </div>
        </div>
      </div>

      {/* People / Recent */}
      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">People</h3>
        <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-2">
          {people.map((p, i) => (
            <div key={i} className="flex flex-col items-center space-y-2 min-w-[60px] cursor-pointer hover:opacity-80">
              <div className={`w-14 h-14 rounded-full ${p.color} flex items-center justify-center text-white font-bold shadow-lg`}>
                {p.name[0]}
              </div>
              <span className="text-xs text-slate-300 font-medium">{p.name}</span>
            </div>
          ))}
          <div className="flex flex-col items-center space-y-2 min-w-[60px] cursor-pointer hover:opacity-80" onClick={() => setView(AppView.MANUAL)}>
             <div className="w-14 h-14 rounded-full bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center text-slate-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
             </div>
             <span className="text-xs text-slate-400 font-medium">New</span>
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Transactions</h3>
          <button onClick={() => setView(AppView.HISTORY)} className="text-xs text-indigo-400 font-semibold hover:text-indigo-300">View All</button>
        </div>
        <div className="space-y-3">
          {history.slice(0, 3).map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-800/40 border border-white/5 rounded-2xl backdrop-blur-sm cursor-pointer hover:bg-slate-800/60 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.riskLevel === 'SAFE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                   {item.riskLevel === 'SAFE' ? <Icons.ShieldCheck className="w-6 h-6" /> : <Icons.ShieldExclamation className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-[140px]">{item.recipientName}</p>
                  <p className="text-xs text-slate-500 font-mono">{new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`block font-bold ${item.riskLevel === 'SAFE' ? 'text-white' : 'text-red-400'}`}>
                  {item.riskLevel === 'SAFE' ? '-$24.00' : 'Blocked'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.riskLevel === 'SAFE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {item.trustScore}% Trust
                </span>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700">
              <p className="text-slate-500 text-sm">No recent transactions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ManualView({ onAnalyze, onBack }: { onAnalyze: (text: string) => void, onBack?: () => void }) {
  const [input, setInput] = useState("");

  const formatTips = [
    { label: "UPI ID", placeholder: "username@okhdfcbank" },
    { label: "Phone", placeholder: "+1 555 123 4567" },
    { label: "Crypto", placeholder: "0x..." },
    { label: "Email", placeholder: "seller@example.com" }
  ];

  return (
    <div className="pt-8 h-full flex flex-col animate-fade-in relative z-50 bg-slate-900 min-h-screen">
      <div className="flex items-center mb-6">
        {onBack && (
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white mr-2">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
        )}
        <h2 className="text-2xl font-bold text-white">Check ID</h2>
      </div>
      
      <p className="text-slate-400 mb-8 text-sm">Enter payment details below to run a real-time AI fraud check before you send money.</p>
      
      <div className="bg-slate-800 p-6 rounded-3xl border border-white/5 shadow-xl">
        <div className="mb-6">
          <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Recipient Identifier</label>
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter UPI, Phone, or Wallet Address" 
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-4 px-4 pl-12 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-600"
            />
            <div className="absolute left-4 top-4 text-slate-500">
              <Icons.Search />
            </div>
          </div>
        </div>
        
        {/* Quick Chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
           {formatTips.map((tip) => (
             <button 
                key={tip.label}
                onClick={() => setInput(tip.placeholder === input ? "" : tip.placeholder)}
                className="px-3 py-1.5 rounded-full bg-slate-700/50 border border-slate-600 text-xs text-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-colors whitespace-nowrap"
             >
               {tip.label}
             </button>
           ))}
        </div>

        <button 
          onClick={() => onAnalyze(input)}
          disabled={!input}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/50 flex items-center justify-center space-x-2 transition-all active:scale-98"
        >
          <Icons.ShieldCheck className="w-5 h-5" />
          <span>Verify Safety</span>
        </button>
      </div>

      <div className="mt-8 px-4">
        <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase text-center">Supported Formats</h3>
        <div className="grid grid-cols-2 gap-3">
          {['UPI / VPA Handles', 'Mobile Numbers', 'Crypto Wallets', 'Payment Links / URLs'].map((fmt) => (
            <div 
              key={fmt} 
              onClick={() => {
                 if (fmt.includes('UPI')) setInput('user@upi');
                 if (fmt.includes('Mobile')) setInput('+1');
                 if (fmt.includes('Crypto')) setInput('0x');
                 if (fmt.includes('URL')) setInput('https://');
              }}
              className="bg-slate-800/40 p-4 rounded-2xl border border-white/5 text-slate-300 text-xs flex flex-col items-center text-center justify-center hover:bg-slate-800 transition-colors cursor-pointer active:scale-95"
            >
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mb-2"></div>
              <span>{fmt}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OnboardingView({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "Scan & Detect",
      desc: "Instantly analyze QR codes and payment details to detect potential scams before you pay.",
      icon: <Icons.QrCode className="w-12 h-12 text-indigo-400" />
    },
    {
      title: "AI-Powered Analysis",
      desc: "Our advanced Gemini AI engine checks global fraud databases and behavioral patterns in real-time.",
      icon: <Icons.ShieldCheck className="w-12 h-12 text-emerald-400" />
    },
    {
      title: "Secure Transactions",
      desc: "Link your accounts and pay securely with 2-factor authentication and fraud protection layers.",
      icon: <Icons.LockClosed className="w-12 h-12 text-purple-400" />
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col p-6 animate-fade-in">
       <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
          {/* Image/Icon Animation */}
          <div className="w-40 h-40 bg-slate-800 rounded-full flex items-center justify-center relative">
              <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-pulse"></div>
              {steps[step].icon}
          </div>

          <div className="space-y-4 max-w-xs mx-auto">
              <h2 className="text-2xl font-bold text-white">{steps[step].title}</h2>
              <p className="text-slate-400 leading-relaxed">{steps[step].desc}</p>
          </div>
       </div>

       {/* Pagination Dots */}
       <div className="flex justify-center space-x-2 mb-8">
           {steps.map((_, i) => (
               <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-indigo-500' : 'w-2 bg-slate-700'}`}></div>
           ))}
       </div>

       {/* Actions */}
       <div className="flex justify-between items-center">
           <button onClick={onComplete} className="text-slate-500 font-medium px-4 py-2 hover:text-white">Skip</button>
           <button onClick={handleNext} className="bg-white text-slate-900 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center space-x-2">
               <span>{step === steps.length - 1 ? 'Get Started' : 'Next'}</span>
               {step !== steps.length - 1 && <Icons.ChevronRight className="w-4 h-4" />}
           </button>
       </div>
    </div>
  )
}

function AlertsView({ onBack }: { onBack: () => void }) {
  const alerts = [
    { id: 1, title: "New Login Detected", body: "Login from Chrome on Windows at 10:42 AM.", time: "2m ago", type: "warning" },
    { id: 2, title: "Database Updated", body: "New scam patterns for UPI added.", time: "1h ago", type: "info" },
    { id: 3, title: "High Risk Blocked", body: "Prevented transfer to flagged address 0x3f...a9", time: "5h ago", type: "danger" }
  ];

  return (
    <div className="h-full flex flex-col pt-4 animate-fade-in">
      <div className="flex items-center mb-6">
         <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold text-white ml-2">Security Alerts</h2>
      </div>

      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className="bg-slate-800 p-4 rounded-xl border border-white/5 relative overflow-hidden">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
              alert.type === 'danger' ? 'bg-red-500' : alert.type === 'warning' ? 'bg-yellow-500' : 'bg-indigo-500'
            }`}></div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-semibold text-white text-sm">{alert.title}</h3>
              <span className="text-xs text-slate-500">{alert.time}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{alert.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentFlowView({ result, onCancel }: { result: AnalysisResult, onCancel: () => void }) {
  const [step, setStep] = useState<'SELECT' | 'BIOMETRIC' | 'PIN' | 'SUCCESS'>('SELECT');
  const [pin, setPin] = useState('');
  const [selectedBank, setSelectedBank] = useState('chase');
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    const prefs = db.getPreferences();
    setBiometricEnabled(prefs.biometricEnabled || false);
  }, []);

  const handleVerificationStart = () => {
    if (biometricEnabled) {
      setStep('BIOMETRIC');
    } else {
      setStep('PIN');
    }
  };

  const simulateBiometricScan = () => {
    // Simulate biometric delay
    setTimeout(() => {
      setStep('SUCCESS');
    }, 1500);
  };

  // Step 1: Select Bank
  if (step === 'SELECT') {
    return (
      <div className="h-full flex flex-col pt-8 animate-fade-in bg-slate-900 min-h-screen">
         <h2 className="text-2xl font-bold text-white mb-2">Secure Payment</h2>
         <p className="text-sm text-slate-400 mb-8">Select a funding source for <span className="text-white font-medium">{result.recipientName}</span></p>

         <div className="space-y-4 mb-8">
            <div 
              onClick={() => setSelectedBank('chase')}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${selectedBank === 'chase' ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center">
                  <Icons.CreditCard className="text-blue-200 w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-white">Chase Checking</p>
                  <p className="text-xs text-slate-400">**** 4422</p>
                </div>
              </div>
              {selectedBank === 'chase' && <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
            </div>

            <div 
              onClick={() => setSelectedBank('wells')}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${selectedBank === 'wells' ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-800 border-slate-700'}`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-900 rounded-xl flex items-center justify-center">
                  <Icons.CreditCard className="text-red-200 w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-white">Wells Fargo</p>
                  <p className="text-xs text-slate-400">**** 8821</p>
                </div>
              </div>
              {selectedBank === 'wells' && <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full"></div></div>}
            </div>

            <button className="w-full p-4 border border-dashed border-slate-600 rounded-2xl text-slate-400 text-sm hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all flex items-center justify-center space-x-2">
              <span>+ Link New Bank Account</span>
            </button>
         </div>

         <div className="mt-auto space-y-3 pb-8">
           <button 
            onClick={handleVerificationStart}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
           >
             Continue to Verification
           </button>
           <button 
            onClick={onCancel}
            className="w-full bg-slate-800 text-slate-300 py-3 rounded-xl hover:bg-slate-700"
           >
             Cancel
           </button>
         </div>
      </div>
    );
  }

  // Step 2b: Biometric
  if (step === 'BIOMETRIC') {
    return (
      <div className="h-full flex flex-col pt-8 animate-fade-in bg-slate-900 min-h-screen">
        <h2 className="text-2xl font-bold text-white text-center mb-12">Authenticate</h2>
        
        <div className="flex-1 flex flex-col items-center justify-center">
          <button 
            onClick={simulateBiometricScan}
            className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-2 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.3)] animate-pulse hover:scale-105 transition-transform"
          >
            <Icons.Fingerprint className="w-12 h-12 text-indigo-400" />
          </button>
          <p className="text-slate-400 mt-6 text-sm">Touch sensor or scan face to pay <br/> <span className="text-white font-bold">${(Math.random() * 50 + 10).toFixed(2)}</span></p>
        </div>

        <div className="space-y-3 pb-8">
           <button 
            onClick={() => setStep('PIN')}
            className="w-full bg-transparent text-indigo-400 py-3 font-medium hover:text-indigo-300"
           >
             Use PIN instead
           </button>
           <button 
            onClick={() => setStep('SELECT')}
            className="w-full bg-slate-800 text-slate-300 py-3 rounded-xl hover:bg-slate-700"
           >
             Back
           </button>
         </div>
      </div>
    );
  }

  // Step 2: 2FA Verification (PIN)
  if (step === 'PIN') {
    return (
      <div className="h-full flex flex-col pt-8 animate-fade-in bg-slate-900 min-h-screen">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center border border-indigo-500/30">
            <Icons.LockClosed className="w-8 h-8 text-indigo-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-2">Security PIN</h2>
        <p className="text-sm text-slate-400 text-center mb-8 px-8">Enter your 4-digit PIN to authorize payment to <br/><span className="text-white">{result.recipientName}</span></p>

        <div className="flex justify-center mb-8">
          <input 
            type="password" 
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="bg-slate-800 border border-indigo-500/50 text-white text-4xl font-bold tracking-[0.5em] text-center w-64 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all"
            autoFocus
          />
        </div>

        <div className="text-center mb-auto">
          <button className="text-indigo-400 text-sm font-medium hover:text-indigo-300 underline decoration-indigo-500/30">Forgot PIN?</button>
        </div>

        <div className="space-y-3 pb-8">
           <button 
            onClick={() => setStep('SUCCESS')}
            disabled={pin.length < 4}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
           >
             Verify & Pay
           </button>
           <button 
            onClick={() => setStep('SELECT')}
            className="w-full bg-transparent text-slate-400 py-3 rounded-xl hover:text-white"
           >
             Back
           </button>
         </div>
      </div>
    );
  }

  // Step 3: Success
  if (step === 'SUCCESS') {
    return (
      <div className="h-full flex flex-col items-center justify-center pt-8 animate-fade-in text-center bg-slate-900 min-h-screen">
        <div className="w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-8 animate-bounce">
          <Icons.Check className="w-16 h-16 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Paid Successfully!</h2>
        <p className="text-slate-400 mb-10">Transaction verified and secured.</p>

        <div className="bg-slate-800 rounded-3xl p-6 w-full mb-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <div className="flex justify-between mb-4">
            <span className="text-slate-400 text-sm">Recipient</span>
            <span className="text-white font-medium">{result.recipientName}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-slate-400 text-sm">Payment Method</span>
            <span className="text-white font-medium capitalize">{selectedBank} *22</span>
          </div>
           <div className="flex justify-between pt-4 border-t border-white/5">
            <span className="text-slate-400 text-sm">Transaction ID</span>
            <span className="text-white font-mono text-xs">TXN-{Math.floor(Math.random() * 1000000)}</span>
          </div>
        </div>

        <button 
          onClick={onCancel}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
        >
          Return Home
        </button>
      </div>
    );
  }

  return null;
}

function ProfileView({ onBack }: { onBack: () => void }) {
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    const prefs = db.getPreferences();
    setBiometricEnabled(prefs.biometricEnabled || false);
  }, []);

  const toggleBiometric = async () => {
    if (!biometricEnabled) {
      // Simulate checking native availability
      if (window.PublicKeyCredential) {
        try {
           // In a real app, you would create credentials here
           await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
           alert("Biometric security enabled for future payments.");
           setBiometricEnabled(true);
           db.setPreference('biometricEnabled', true);
        } catch (e) {
          alert("Biometric sensor not available.");
        }
      } else {
        // Fallback for demo
        setBiometricEnabled(true);
        db.setPreference('biometricEnabled', true);
      }
    } else {
      setBiometricEnabled(false);
      db.setPreference('biometricEnabled', false);
    }
  };

  return (
    <div className="pt-4 h-full flex flex-col animate-fade-in">
       <div className="flex items-center mb-6">
         <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold text-white ml-2">My Profile</h2>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-xl border-4 border-slate-800">
          JD
        </div>
        <h3 className="text-xl font-bold text-white">John Doe</h3>
        <p className="text-slate-400 text-sm">john.doe@example.com</p>
        <span className="mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30">Verified User</span>
      </div>

      <div className="space-y-4 overflow-y-auto pb-24 no-scrollbar">
        
        {/* Account Settings */}
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-white/5">
          <div className="p-4 border-b border-white/5 font-bold text-slate-300 text-sm uppercase tracking-wider">Account Settings</div>
          <div className="p-4 flex items-center justify-between hover:bg-slate-700/50 cursor-pointer">
            <div className="flex items-center space-x-3">
              <Icons.User className="text-slate-400" />
              <span className="text-white">Personal Information</span>
            </div>
            <Icons.ChevronRight className="text-slate-500 w-4 h-4" />
          </div>
          
          {/* Biometric Toggle */}
          <div 
             className="p-4 flex items-center justify-between hover:bg-slate-700/50 cursor-pointer"
             onClick={toggleBiometric}
          >
             <div className="flex items-center space-x-3">
              <Icons.Fingerprint className="text-slate-400" />
              <div className="flex flex-col">
                <span className="text-white">Biometric Security</span>
                <span className="text-xs text-slate-500">Face ID / Fingerprint</span>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${biometricEnabled ? 'bg-indigo-600' : 'bg-slate-600'}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${biometricEnabled ? 'left-7' : 'left-1'}`}></div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-white/5">
          <div className="p-4 border-b border-white/5 font-bold text-slate-300 text-sm uppercase tracking-wider">Payment Methods</div>
          <div className="p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center"><Icons.CreditCard className="w-4 h-4 text-white"/></div>
              <div>
                <p className="text-white text-sm font-medium">Chase Checking</p>
                <p className="text-xs text-slate-500">**** 4422</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400">Primary</span>
          </div>
           <div className="p-4 flex items-center justify-between hover:bg-slate-700/50 cursor-pointer text-indigo-400">
             <span className="font-medium">+ Link Bank Account</span>
          </div>
        </div>

         {/* Preferences */}
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-white/5">
          <div className="p-4 border-b border-white/5 font-bold text-slate-300 text-sm uppercase tracking-wider">Preferences</div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icons.Bell className="text-slate-400" />
              <span className="text-white">Notifications</span>
            </div>
            <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        <button className="w-full py-4 text-red-400 font-bold hover:bg-slate-800 rounded-xl transition-colors">
          Log Out
        </button>

      </div>
    </div>
  )
}

function ScannerView({ onAnalyze, onBack }: { onAnalyze: (file: File) => void, onBack: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    const startCamera = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (e) {
        console.log("Camera not accessible");
      }
    };
    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAnalyze(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
       <div className="relative flex-1 bg-black overflow-hidden">
         {stream ? (
           <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover opacity-80" />
         ) : (
           <div className="absolute inset-0 flex items-center justify-center text-slate-500">
             <p>Camera inactive</p>
           </div>
         )}
         
         <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-64 h-64 border-2 border-white/50 rounded-3xl relative">
               <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl -mt-1 -ml-1"></div>
               <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl -mt-1 -mr-1"></div>
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl -mb-1 -ml-1"></div>
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl -mb-1 -mr-1"></div>
               <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
            </div>
            <p className="mt-8 text-white font-medium bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Align QR code within frame</p>
         </div>

         <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
            <button onClick={onBack} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
         </div>
       </div>

       <div className="bg-slate-900 p-8 pb-12 rounded-t-3xl -mt-6 relative z-10">
          <div className="flex justify-center mb-2">
             <div className="w-12 h-1 bg-slate-700 rounded-full"></div>
          </div>
          <p className="text-center text-slate-400 text-sm mb-6">Scan any payment QR code to instantly verify safety.</p>
          
          <div className="flex justify-center space-x-6">
             <button 
               onClick={() => fileInputRef.current?.click()}
               className="flex flex-col items-center space-y-2 text-slate-300 hover:text-white group"
             >
                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 group-hover:bg-slate-700 transition-colors">
                   <Icons.Upload className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium">Upload</span>
             </button>
             
             <button className="w-20 h-20 bg-white rounded-full border-4 border-slate-900 ring-4 ring-white flex items-center justify-center transform active:scale-95 transition-transform shadow-lg shadow-white/20">
               <div className="w-16 h-16 bg-white border-2 border-slate-300 rounded-full"></div>
             </button>

             <button className="flex flex-col items-center space-y-2 text-slate-300 hover:text-white group">
                <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 group-hover:bg-slate-700 transition-colors">
                   <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <span className="text-xs font-medium">Flash</span>
             </button>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
       </div>
    </div>
  );
}

function HistoryView({ history, onSelect }: { history: ScanHistoryItem[], onSelect: (item: ScanHistoryItem) => void }) {
  return (
    <div className="pt-4 h-full flex flex-col animate-fade-in pb-20">
      <h2 className="text-2xl font-bold text-white mb-6 px-2">Scan History</h2>
      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 opacity-60">
           <Icons.History className="w-16 h-16 mb-4" />
           <p>No history yet</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto">
          {history.map((item) => (
             <div 
               key={item.id} 
               onClick={() => onSelect(item)}
               className="flex items-center justify-between p-4 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-700 transition-colors"
             >
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.riskLevel === 'SAFE' ? 'bg-emerald-500/20 text-emerald-500' :
                  item.riskLevel === 'HIGH_RISK' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                   {item.riskLevel === 'SAFE' ? <Icons.ShieldCheck className="w-5 h-5" /> : <Icons.ShieldExclamation className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white truncate max-w-[150px]">{item.recipientName}</p>
                  <p className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                 <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    item.riskLevel === 'SAFE' ? 'bg-emerald-500/10 text-emerald-400' : 
                    item.riskLevel === 'HIGH_RISK' ? 'bg-red-500/10 text-red-400' : 'bg-yellow-500/10 text-yellow-400'
                 }`}>
                   {item.trustScore}%
                 </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ResultView({ result, onBack, onProceed }: { result: AnalysisResult, onBack: () => void, onProceed: () => void }) {
  const isSafe = result.riskLevel === 'SAFE';
  const isRisky = result.riskLevel === 'HIGH_RISK';
  
  return (
    <div className="h-full flex flex-col pt-4 animate-fade-in relative z-50 bg-slate-900 min-h-screen">
      <div className="flex items-center mb-6">
         <button onClick={onBack} className="p-2 -ml-2 text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="text-xl font-bold text-white ml-2">Analysis Result</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        <div className={`relative p-8 rounded-3xl mb-6 overflow-hidden flex flex-col items-center text-center ${
           isSafe ? 'bg-gradient-to-b from-emerald-600 to-emerald-800' : 
           isRisky ? 'bg-gradient-to-b from-red-600 to-red-800' : 'bg-gradient-to-b from-yellow-500 to-yellow-700'
        }`}>
           <div className="relative z-10 bg-white/20 p-4 rounded-full mb-4 backdrop-blur-md">
             {isSafe ? <Icons.ShieldCheck className="w-12 h-12 text-white" /> : <Icons.ShieldExclamation className="w-12 h-12 text-white" />}
           </div>
           
           <h1 className="relative z-10 text-3xl font-bold text-white mb-1">{result.riskLevel.replace('_', ' ')}</h1>
           <p className="relative z-10 text-white/90 font-medium mb-6">Trust Score: {result.trustScore}/100</p>
           
           <div className="relative z-10 w-full bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
              <div className="text-xs text-white/60 uppercase tracking-wider mb-1">Recipient</div>
              <div className="text-lg font-bold text-white truncate">{result.recipientName}</div>
              <div className="text-xs text-white/80 font-mono truncate">{result.recipientId}</div>
           </div>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-white/5 mb-6">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">AI Security Analysis</h3>
           <p className="text-slate-300 leading-relaxed text-sm">{result.reasoning}</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 border border-white/5 mb-6">
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detection Flags</h3>
           <div className="space-y-3">
              {result.flags.map((flag, i) => (
                 <div key={i} className="flex items-start space-x-3">
                    <div className={`mt-1 w-2 h-2 rounded-full ${isSafe ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm text-slate-300">{flag}</span>
                 </div>
              ))}
              {result.flags.length === 0 && <span className="text-slate-500 text-sm">No specific flags detected.</span>}
           </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-slate-900 border-t border-slate-800 z-40">
         <div className="max-w-lg mx-auto flex space-x-4">
            <button 
              onClick={onBack}
              className="flex-1 py-4 rounded-xl font-bold text-slate-400 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
               Cancel
            </button>
            <button 
              onClick={onProceed}
              disabled={isRisky}
              className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                 isRisky ? 'bg-slate-700 opacity-50 cursor-not-allowed' : 
                 isSafe ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50' : 'bg-yellow-600 hover:bg-yellow-500 shadow-yellow-900/50'
              }`}
            >
               {isRisky ? 'Blocked' : 'Proceed to Pay'}
            </button>
         </div>
      </div>
    </div>
  );
}