import React, { useState } from "react";
import { Heart, X, Share2, Award, Calendar, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

export default function KrathongDetailModal({ 
  krathong, 
  onClose, 
  onVote, 
  hasVoted, 
  onFocusKrathong 
}) {
  const [voting, setVoting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!krathong) return null;

  const handleVoteClick = async () => {
    if (hasVoted) return;

    try {
      setVoting(true);
      await onVote(krathong.id);
      
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#ec4899", "#10b981", "#38bdf8"]
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
        text: krathong.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-slate-100">
        {/* Glow backdrop behind photo */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: krathong.color || "#f59e0b" }}
        />

        {/* Top bar */}
        <div className="relative flex items-center justify-between p-4 z-10">
          <button
            onClick={() => onFocusKrathong && onFocusKrathong(krathong.id)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-full text-xs text-amber-300 transition"
          >
            <Sparkles className="w-3.5 h-3.5" /> ซูมดูกระทงในน้ำ
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Photo */}
        <div className="relative px-6">
          <div className="relative w-full max-h-80 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl bg-slate-950 flex items-center justify-center p-2">
            <img
              src={krathong.photoUrl}
              alt={krathong.name}
              className="max-h-76 w-auto object-contain rounded-lg"
            />
            {/* Color pill */}
            <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-2 border border-white/10 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: krathong.color || "#f59e0b" }}
              />
              <span className="text-white font-medium">กระทงลอยน้ำ</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {krathong.name}
              </h3>
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

          {/* Action buttons */}
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleVoteClick}
              disabled={hasVoted || voting}
              className={`flex-1 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
                hasVoted
                  ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default"
                  : "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white shadow-pink-500/25 active:scale-95"
              }`}
            >
              {voting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  กำลังบันทึกคะแนน...
                </>
              ) : hasVoted ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  คุณโหวตกระทงนี้แล้ว
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-white" />
                  โหวตให้กระทงนี้เลย!
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className="p-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
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
