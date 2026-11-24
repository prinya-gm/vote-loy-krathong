import React, { useState, useEffect } from "react";
import { Heart, X, Share2, Award, Calendar, CheckCircle2, Loader2, Sparkles, QrCode, Download, Copy, Check } from "lucide-react";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
import {
  MALE_TOPS,
  MALE_BOTTOMS,
  FEMALE_TOPS,
  FEMALE_BOTTOMS,
  KRATHONG_BASES,
  FLOWER_DECORATIONS,
} from "./KrathongAssets";

export default function KrathongDetailModal({ 
  krathong, 
  onClose, 
  onVote, 
  hasVoted, 
  onFocusKrathong,
  onFocusAvatar,
  unlimitedVoteMode = false,
}) {
  const [voting, setVoting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isMale = krathong?.gender === "male";
  const topList = isMale ? MALE_TOPS : FEMALE_TOPS;
  const bottomList = isMale ? MALE_BOTTOMS : FEMALE_BOTTOMS;
  const topItem = topList.find((t) => t.id === krathong?.topStyle) || topList[0];
  const bottomItem = bottomList.find((b) => b.id === krathong?.bottomStyle) || bottomList[0];
  const krathongItem = KRATHONG_BASES.find((k) => k.id === krathong?.krathongStyle) || KRATHONG_BASES[0];
  const flowerItem = FLOWER_DECORATIONS.find((f) => f.id === krathong?.flowerStyle) || FLOWER_DECORATIONS[0];

  const voteUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?vote=${krathong?.id}`
    : "";

  // Generate QR code Data URL when modal opens or krathong changes
  useEffect(() => {
    if (!krathong?.id || !voteUrl) return;

    QRCode.toDataURL(voteUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#091224",
        light: "#ffffff",
      },
      errorCorrectionLevel: "H",
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error("QR Code generation error:", err));
  }, [krathong?.id, voteUrl]);

  if (!krathong) return null;

  // Under unlimited mode, user is never blocked from voting
  const isVotedDisabled = hasVoted && !unlimitedVoteMode;

  const handleVoteClick = async () => {
    if (isVotedDisabled || voting) return;

    try {
      setVoting(true);
      await onVote(krathong.id);
      
      // Trigger festive confetti
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#ec4899", "#10b981", "#38bdf8", "#eab308"]
      });
    } catch (err) {
      alert(err.message || "เกิดข้อผิดพลาดในการโหวต");
    } finally {
      setVoting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `ช่วยโหวตกระทงให้ ${krathong.name} ในงานลอยกระทงกัน!`,
        text: krathong.description || "ร่วมสืบสานประเพณีลอยกระทง โหวตขวัญใจสายน้ำ 2569",
        url: voteUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(voteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyVoteLink = () => {
    navigator.clipboard.writeText(voteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `qrcode-vote-${krathong.name || "candidate"}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-amber-500/30 rounded-3xl shadow-2xl overflow-y-auto max-h-[92dvh] text-slate-100">
        {/* Glow backdrop behind photo */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: krathong.color || "#f59e0b" }}
        />

        {/* Top bar */}
        <div className="relative flex items-center justify-between p-3.5 sm:p-4 z-10 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onFocusKrathong && onFocusKrathong(krathong.id)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-full text-[11px] sm:text-xs text-amber-300 transition cursor-pointer"
              title="ซูมดูกระทงในน้ำ"
            >
              <Sparkles className="w-3.5 h-3.5" /> ซูมดูกระทง
            </button>
            <button
              onClick={() => onFocusAvatar && onFocusAvatar(krathong.id)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-full text-[11px] sm:text-xs text-amber-200 font-bold transition cursor-pointer active:scale-95 shadow-sm"
              title="ส่องดูโมเดลคนบนท่าน้ำ"
            >
              <span>👤</span> ส่องดูคนบนท่าน้ำ
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Photo with QR Button */}
        <div className="relative px-6">
          <div className="relative w-full max-h-80 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-slate-950 flex items-center justify-center p-2">
            <img
              src={krathong.photoUrl}
              alt={krathong.name}
              className="max-h-76 w-auto object-contain rounded-lg"
              onError={(e) => {
                if (krathong.photoUrl && !e.target.src.includes("images.weserv.nl")) {
                  e.target.src = `https://images.weserv.nl/?url=${encodeURIComponent(krathong.photoUrl)}`;
                }
              }}
            />
            {/* Color & Krathong Style pill */}
            <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-2 border border-white/10 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: krathong.color || "#f59e0b" }}
              />
              <span className="text-white font-medium">{krathongItem?.name || "กระทงลอยน้ำ"}</span>
            </div>

            {/* Quick QR toggle pill on top-right of image */}
            <button
              onClick={() => setShowQr((prev) => !prev)}
              className="absolute top-3 right-3 px-3 py-1 bg-black/70 hover:bg-amber-500 hover:text-slate-950 backdrop-blur-md rounded-full flex items-center gap-1.5 border border-amber-400/40 text-xs font-semibold text-amber-300 transition cursor-pointer shadow-lg active:scale-95"
              title="สแกน QR Code เพื่อโหวต"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showQr ? "ปิด QR" : "QR สแกนโหวต"}</span>
            </button>
          </div>
        </div>

        {/* Info & Customization */}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-bold text-white">
                  {krathong.name}
                </h3>
                {unlimitedVoteMode && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold flex items-center gap-1">
                    🌕 โหวตไม่จำกัด
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-300 mt-1 line-clamp-3">
                {krathong.description || "ขอขมาพระแม่คงคา มีความสุขสวัสดีตลอดปี 🪷"}
              </p>
            </div>
            
            {/* Votes badge */}
            <div className="text-center px-4 py-2 bg-gradient-to-b from-amber-500/20 to-amber-900/40 border border-amber-500/40 rounded-2xl shrink-0">
              <div className="flex items-center justify-center gap-1 text-amber-400 font-black text-xl">
                <Heart className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>{krathong.votes || 0}</span>
              </div>
              <span className="text-[10px] text-amber-200 uppercase tracking-wider font-semibold">คะแนนโหวต</span>
            </div>
          </div>

          {/* QR Code Card (Expandable / Toggleable) */}
          {showQr && (
            <div className="p-4 bg-slate-950/90 border border-amber-500/40 rounded-2xl flex flex-col items-center gap-3 animate-fadeIn text-center shadow-inner">
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" /> สแกน QR Code เพื่อโหวตให้ {krathong.name}
                </span>
                <button
                  onClick={() => setShowQr(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  ✕ ซ่อน
                </button>
              </div>

              {qrDataUrl ? (
                <div className="p-3 bg-white rounded-2xl shadow-xl border-2 border-amber-400/80">
                  <img src={qrDataUrl} alt={`QR Code โหวตให้ ${krathong.name}`} className="w-44 h-44 object-contain" />
                </div>
              ) : (
                <div className="w-44 h-44 flex items-center justify-center bg-slate-800 rounded-2xl">
                  <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                </div>
              )}

              <p className="text-[11px] text-slate-300">
                เปิดกล้องมือถือสแกน เพื่อเปิดหน้าโหวตให้ <span className="text-amber-300 font-semibold">{krathong.name}</span> ได้ทันที
              </p>

              <div className="flex items-center gap-2 w-full pt-1">
                <button
                  onClick={handleDownloadQr}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" /> บันทึกรูป QR
                </button>
                <button
                  onClick={handleCopyVoteLink}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> คัดลอกแล้ว!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-400" /> คัดลอกลิงก์
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Customization Details Chips */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="text-[10px] text-amber-400 font-bold">✨ แบบชุดไทย (บน-ล่าง)</div>
              <div className="text-white font-semibold line-clamp-1 mt-0.5">{topItem.name}</div>
              <div className="text-slate-400 text-[10px] line-clamp-1">{bottomItem.name}</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="text-[10px] text-cyan-400 font-bold">🪷 กระทง & ดอกไม้</div>
              <div className="text-white font-semibold line-clamp-1 mt-0.5">{krathongItem.name}</div>
              <div className="text-slate-400 text-[10px] line-clamp-1">{flowerItem.name}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleVoteClick}
              disabled={isVotedDisabled || voting}
              className={`flex-1 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                isVotedDisabled
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default"
                  : "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white shadow-pink-500/25 active:scale-95"
              }`}
            >
              {voting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  กำลังบันทึกคะแนน...
                </>
              ) : isVotedDisabled ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  คุณโหวตกระทงนี้แล้ว
                </>
              ) : unlimitedVoteMode && hasVoted ? (
                <>
                  <Heart className="w-5 h-5 fill-amber-300 text-amber-200" />
                  โหวตเพิ่มอีกครั้ง! 🌕✨
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-white" />
                  โหวตให้กระทงนี้เลย!
                </>
              )}
            </button>

            {/* QR Code Button */}
            <button
              onClick={() => setShowQr((prev) => !prev)}
              className={`p-3.5 border rounded-xl transition cursor-pointer shrink-0 ${
                showQr
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/30"
                  : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
              }`}
              title="แสดง QR Code เพื่อสแกนโหวต"
            >
              <QrCode className="w-5 h-5" />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition cursor-pointer shrink-0"
              title="แชร์กระทงนี้"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {copied && (
            <p className="text-center text-xs text-amber-300 mt-2">
              คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
