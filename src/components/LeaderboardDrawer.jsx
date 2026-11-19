import React from "react";
import { Trophy, Heart, Sparkles, X, ChevronRight } from "lucide-react";

export default function LeaderboardDrawer({ 
  isOpen, 
  onClose, 
  entries, 
  onSelectKrathong,
  onFocusKrathong 
}) {
  if (!isOpen) return null;

  // Sort by votes descending
  const sorted = [...entries].sort((a, b) => (b.votes || 0) - (a.votes || 0));

  const getRankBadge = (index) => {
    switch (index) {
      case 0:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/40">
            🥇
          </div>
        );
      case 1:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 flex items-center justify-center text-slate-950 font-black">
            🥈
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 flex items-center justify-center text-white font-black">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-xs">
            {index + 1}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900/95 border-l border-amber-500/20 backdrop-blur-xl shadow-2xl flex flex-col text-slate-100 animate-slideLeft">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-amber-400" />
          <h2 className="text-lg font-bold bg-gradient-to-r from-amber-200 to-yellow-400 bg-clip-text text-transparent">
            อันดับกระทงยอดนิยม
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sorted.map((item, index) => (
          <div
            key={item.id}
            onClick={() => {
              onSelectKrathong(item);
              onFocusKrathong(item.id);
            }}
            className={`flex items-center gap-3 p-3 rounded-2xl border transition cursor-pointer hover:scale-[1.02] ${
              index === 0
                ? "bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border-amber-500/40 shadow-lg shadow-amber-500/10"
                : "bg-slate-800/40 border-slate-800 hover:border-slate-700"
            }`}
          >
            {/* Rank */}
            <div className="shrink-0">{getRankBadge(index)}</div>

            {/* Thumbnail */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-amber-500/30 shrink-0 bg-slate-950">
              <img
                src={item.photoUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title & Desc */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate text-white">
                {item.name}
              </h4>
              <p className="text-xs text-slate-400 truncate">
                {item.description || "กระทงลอยน้ำ"}
              </p>
            </div>

            {/* Votes */}
            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1 text-pink-400 font-bold text-sm">
                <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                <span>{item.votes || 0}</span>
              </div>
              <span className="text-[10px] text-slate-400">โหวต</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
