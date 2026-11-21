import React, { useState } from "react";
import { Heart, X, Share2, Award, Calendar, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
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
  onFocusAvatar
}) {
  const [voting, setVoting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!krathong) return null;

  const isMale = krathong.gender === "male";
  const topList = isMale ? MALE_TOPS : FEMALE_TOPS;
  const bottomList = isMale ? MALE_BOTTOMS : FEMALE_BOTTOMS;
  const topItem = topList.find((t) => t.id === krathong.topStyle) || topList[0];
  const bottomItem = bottomList.find((b) => b.id === krathong.bottomStyle) || bottomList[0];
  const krathongItem = KRATHONG_BASES.find((k) => k.id === krathong.krathongStyle) || KRATHONG_BASES[0];
  const flowerItem = FLOWER_DECORATIONS.find((f) => f.id === krathong.flowerStyle) || FLOWER_DECORATIONS[0];

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

        {/* Big Photo */}
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
            {/* Color pill */}
            <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full flex items-center gap-2 border border-white/10 text-xs">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: krathong.color || "#f59e0b" }}
              />
              <span className="text-white font-medium">{krathongItem?.name || "กระทงลอยน้ำ"}</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-6 space-y-4">
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
