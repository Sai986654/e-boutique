import { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  QrCode, 
  Send, 
  MessageCircle, 
  Mail, 
  ExternalLink, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { Saree } from '../types';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  sareeToShare?: Saree | null;
}

export function ShareAppModal({ isOpen, onClose, sareeToShare }: ShareAppModalProps) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;
  
  const defaultTitle = sareeToShare 
    ? `${sareeToShare.name} - Virasat Saree Boutique`
    : 'Virasat - Handloom Sarees of AP & Telangana';

  const shareText = sareeToShare
    ? `✨ Look at this exquisite ${sareeToShare.name} (${sareeToShare.fabric}) from Virasat Saree Boutique! 🌸 Price: ₹${sareeToShare.price.toLocaleString('en-IN')}. Weaver-direct handloom from ${sareeToShare.origin}:`
    : `✨ Explore Virasat Saree Boutique! 🌸 Authentic Pochampally Ikkat, Gadwal Pattu, Uppada Jamdani & Dharmavaram Silk sarees handcrafted by AP & Telangana master weavers. Enjoy free Fall & Pico and express delivery:`;

  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(shareText);

  // Native Web Share API trigger
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: defaultTitle,
          text: shareText,
          url: currentUrl,
        });
      } catch (err) {
        console.log('Share dismissed:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${shareText} ${currentUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // QR Code URL via Google Chart API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}&color=821D24&bgcolor=FAF8F5`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-[#FAF8F5] w-full max-w-md rounded-3xl border border-[#E8DFD1] shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#821D24] text-white p-5 relative text-center">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5]/10 border border-white/20 flex items-center justify-center mx-auto mb-2 text-[#F5C767]">
            <Share2 className="w-6 h-6" />
          </div>
          <h3 className="font-serif-title text-xl font-bold tracking-wide">
            {sareeToShare ? 'Share Saree with Loved Ones' : 'Share Virasat Boutique App'}
          </h3>
          <p className="text-xs text-[#F5C767] mt-0.5 font-medium">
            చేనేత పట్టు చీరలు • AP & Telangana Handlooms
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-[#2A1E17]">
          {/* Saree Card Preview if sharing specific saree */}
          {sareeToShare && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-[#E8DFD1]">
              <img
                src={sareeToShare.images[0]}
                alt={sareeToShare.name}
                className="w-14 h-14 rounded-xl object-cover border border-[#D5C5B2]"
              />
              <div className="text-xs">
                <span className="font-bold text-[#2A1E17] block line-clamp-1">{sareeToShare.name}</span>
                <span className="text-[11px] text-[#821D24] font-bold block">
                  ₹{sareeToShare.price.toLocaleString('en-IN')} • {sareeToShare.fabric}
                </span>
                <span className="text-[10px] text-[#7A6757]">{sareeToShare.origin}</span>
              </div>
            </div>
          )}

          {/* Quick Native Share Button */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full py-3 px-4 rounded-2xl bg-[#821D24] text-white text-xs font-bold hover:bg-[#68141A] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-[#F5C767]" />
              <span>Share via Device Share Sheet</span>
            </button>
          )}

          {/* Social Share Grid */}
          <div>
            <label className="text-xs font-bold text-[#5C4B3E] block mb-2">
              Instant Share Channels:
            </label>
            <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white hover:bg-[#25D366]/10 rounded-2xl border border-[#E8DFD1] hover:border-[#25D366] transition-all group flex flex-col items-center gap-1.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#25D366]/15 text-[#25D366] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-5 h-5 fill-[#25D366] text-white" />
                </div>
                <span className="font-semibold text-[#2A1E17]">WhatsApp</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white hover:bg-[#0088cc]/10 rounded-2xl border border-[#E8DFD1] hover:border-[#0088cc] transition-all group flex flex-col items-center gap-1.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#0088cc]/15 text-[#0088cc] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Send className="w-4 h-4" />
                </div>
                <span className="font-semibold text-[#2A1E17]">Telegram</span>
              </a>

              {/* SMS */}
              <a
                href={`sms:?body=${encodedText}%20${encodedUrl}`}
                className="p-3 bg-white hover:bg-[#821D24]/10 rounded-2xl border border-[#E8DFD1] hover:border-[#821D24] transition-all group flex flex-col items-center gap-1.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#821D24]/15 text-[#821D24] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="font-semibold text-[#2A1E17]">SMS</span>
              </a>

              {/* QR Code Toggle */}
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className={`p-3 rounded-2xl border transition-all group flex flex-col items-center gap-1.5 cursor-pointer ${
                  showQr ? 'bg-[#821D24] text-white border-[#821D24]' : 'bg-white hover:bg-[#FAF2E8] border-[#E8DFD1]'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${
                  showQr ? 'bg-white/20 text-white' : 'bg-[#F5C767]/20 text-[#821D24]'
                }`}>
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="font-semibold">QR Code</span>
              </button>
            </div>
          </div>

          {/* QR Code Display */}
          {showQr && (
            <div className="p-4 bg-white rounded-2xl border border-[#E8DFD1] text-center space-y-2 animate-fade-in">
              <img
                src={qrCodeUrl}
                alt="App Store QR Code"
                className="w-36 h-36 mx-auto rounded-xl border border-[#E8DFD1] p-1"
              />
              <span className="text-[11px] text-[#7A6757] block font-medium">
                Scan with any mobile camera to open Virasat Saree Store instantly!
              </span>
            </div>
          )}

          {/* Direct Copy Link Field */}
          <div>
            <label className="text-xs font-bold text-[#5C4B3E] block mb-1.5">
              Copy Store URL Link:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 p-2.5 bg-white border border-[#D5C5B2] rounded-xl text-xs text-[#2A1E17] font-mono select-all focus:outline-hidden"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  copied
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#821D24] text-white hover:bg-[#68141A]'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="text-[10px] text-[#7A6757] text-center pt-2 border-t border-[#E8DFD1]">
            <Sparkles className="w-3 h-3 text-[#C89933] inline mr-1" />
            Empowering Pochampally, Gadwal & Uppada handloom weaver families across AP & Telangana.
          </div>
        </div>
      </div>
    </div>
  );
}
