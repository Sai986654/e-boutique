import { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  X, 
  Sparkles, 
  AlertCircle,
  LogIn
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: AdminLoginModalProps) {
  const { loginWithGoogle, demoAdminLogin, adminUser } = useAdminAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const ok = await loginWithGoogle();
      if (ok) {
        onSuccess();
        onClose();
      } else {
        // In iFrames or if popup is closed, prompt fallback
        setErrorMsg('Google Sign-in popup was prevented or dismissed. You can use Quick Store Owner Access below.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleQuickDemoAdmin = () => {
    demoAdminLogin();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#FAF8F5] rounded-3xl shadow-2xl border border-[#E8DFD1] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#821D24] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-2xl bg-[#FAF0E1] text-[#821D24] flex items-center justify-center mx-auto mb-3 shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-serif-title text-2xl font-bold">
            Virasat Admin Portal
          </h3>
          <p className="text-xs text-[#F5C767] mt-1 font-medium">
            Manage Saree Inventory, Regional Orders & Store Features
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="bg-[#FAF2E8] p-4 rounded-2xl border border-[#E5DCD0] space-y-1.5 text-xs text-[#5C4B3E]">
            <div className="flex items-center gap-1.5 font-bold text-[#821D24]">
              <ShieldCheck className="w-4 h-4" />
              <span>Authorized Store Owner</span>
            </div>
            <p className="text-[11px] text-[#7A6757]">
              Pre-configured for <strong>saikrishnask990@gmail.com</strong> with live Firebase Firestore access for real-time order updates, inventory management, and announcements.
            </p>
          </div>

          <div className="space-y-3">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white border border-[#D5C5B2] hover:border-[#821D24] text-xs font-bold text-[#2A1E17] shadow-xs hover:bg-[#FAF8F5] transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoggingIn ? 'Connecting with Google...' : 'Sign in with Google Account'}</span>
            </button>

            {/* Quick Demo Access button (Ideal for direct preview mode) */}
            <button
              onClick={handleQuickDemoAdmin}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#821D24] text-white hover:bg-[#68141A] text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#F5C767]" />
              <span>Instant Store Manager Access (Owner Mode)</span>
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="text-xs text-[#7A6757] hover:underline cursor-pointer"
            >
              Return to Customer Boutique Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
