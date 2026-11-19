import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trophy, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  Info, 
  Sparkles, 
  RotateCcw,
  Volume2,
  VolumeX,
  Settings
} from "lucide-react";
import { LoyKrathongScene } from "./components/LoyKrathongScene";
import CreateKrathongModal from "./components/CreateKrathongModal";
import KrathongDetailModal from "./components/KrathongDetailModal";
import LeaderboardDrawer from "./components/LeaderboardDrawer";
import { 
  subscribeToEntries, 
  addKrathongEntry, 
  voteForEntry, 
  hasVotedFor 
} from "./services/dataService";
import { isFirebaseConfigured } from "./firebase";

export default function App() {
  const containerRef = useRef(null);
  const sceneInstanceRef = useRef(null);

  const [entries, setEntries] = useState([]);
  const [selectedKrathong, setSelectedKrathong] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [hasVotedCurrent, setHasVotedCurrent] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioRef = useRef(null);

  // Initialize 3D Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new LoyKrathongScene(containerRef.current, (entry) => {
      setSelectedKrathong(entry);
    });
    sceneInstanceRef.current = scene;

    return () => {
      scene.destroy();
    };
  }, []);

  // Subscribe to Krathongs data stream
  useEffect(() => {
    const unsubscribe = subscribeToEntries((items) => {
      setEntries(items);
      if (sceneInstanceRef.current) {
        sceneInstanceRef.current.updateKrathongs(items);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // Check voted status when selected krathong changes
  useEffect(() => {
    if (selectedKrathong) {
      setHasVotedCurrent(hasVotedFor(selectedKrathong.id));
    }
  }, [selectedKrathong, entries]);

  const handleCreateSubmit = async (data) => {
    await addKrathongEntry(data);
  };

  const handleVote = async (id) => {
    await voteForEntry(id);
    setHasVotedCurrent(true);
    // Refresh selected krathong votes
    setSelectedKrathong((prev) => (prev ? { ...prev, votes: (prev.votes || 0) + 1 } : null));
  };

  const handleFocusKrathong = (id) => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.focusOnKrathong(id);
    }
  };

  const resetCamera = () => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.camera.position.set(0, 18, 38);
      sceneInstanceRef.current.controls.target.set(0, 2, 0);
    }
  };

  const toggleSound = () => {
    // Ambient water audio synthesizer using Web Audio API
    if (!audioRef.current) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioContext();
        
        // Gentle brown noise generator for river water flow sound
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = output[i];
          output[i] *= 2.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(450, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start(0);
        audioRef.current = { ctx, gainNode };
        setSoundEnabled(true);
      } catch (e) {
        console.warn("Audio Context init blocked:", e);
      }
    } else {
      if (soundEnabled) {
        audioRef.current.ctx.suspend();
        setSoundEnabled(false);
      } else {
        audioRef.current.ctx.resume();
        setSoundEnabled(true);
      }
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-slate-950 text-slate-100 select-none">
      {/* 3D Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Header Overlay */}
      <header className="absolute top-0 inset-x-0 p-3 sm:p-6 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pointer-events-none flex items-start justify-between z-20">
        {/* App Title & Festive Branding */}
        <div className="pointer-events-auto bg-slate-950/70 backdrop-blur-md border border-amber-500/30 rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-2xl flex items-center gap-2.5 sm:gap-3.5 max-w-[calc(100vw-110px)] sm:max-w-none">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-xl sm:text-2xl shadow-lg shadow-amber-500/30 animate-pulse shrink-0">
            🌕
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-black tracking-wide bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-500 bg-clip-text text-transparent truncate">
              ลอยกระทง 2569 โหวตขวัญใจสายน้ำ
            </h1>
            <p className="text-[10px] sm:text-xs text-amber-200/80 flex items-center gap-2 truncate">
              <span>หมุนซูม 3D | คลิกที่กระทงเพื่อโหวต</span>
              {!isFirebaseConfigured && (
                <span className="hidden xs:inline px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                  Demo Mode
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="pointer-events-auto flex items-center gap-2 shrink-0">
          {/* Ambient Sound Button */}
          <button
            onClick={toggleSound}
            className="p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 backdrop-blur-md text-amber-300 shadow-xl transition cursor-pointer"
            title={soundEnabled ? "ปิดเสียงสายน้ำ" : "เปิดเสียงสายน้ำ"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* Leaderboard Button */}
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-amber-500/30 backdrop-blur-md text-amber-300 shadow-xl transition cursor-pointer font-bold text-xs sm:text-sm"
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            <span className="hidden sm:inline">อันดับโหวต</span>
          </button>
        </div>
      </header>

      {/* 3D Navigation Controls Widget (Responsive: Bottom-Right on mobile, Bottom-Left on tablet/desktop) */}
      <div className="absolute bottom-24 right-3 sm:bottom-[max(1.5rem,calc(1rem+env(safe-area-inset-bottom,0px)))] sm:left-6 sm:right-auto z-20 flex flex-col gap-2">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-2xl p-1 sm:p-1.5 flex flex-col shadow-2xl">
          <button
            onClick={() => {
              if (sceneInstanceRef.current) {
                sceneInstanceRef.current.camera.position.multiplyScalar(0.85);
              }
            }}
            className="p-2 sm:p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
            title="ซูมเข้า (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (sceneInstanceRef.current) {
                sceneInstanceRef.current.camera.position.multiplyScalar(1.15);
              }
            }}
            className="p-2 sm:p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
            title="ซูมออก (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetCamera}
            className="p-2 sm:p-2.5 hover:bg-slate-800 rounded-xl text-slate-300 hover:text-white transition cursor-pointer"
            title="รีเซ็ตมุมกล้อง"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        <div className="hidden sm:block text-[10px] text-slate-400 bg-slate-900/70 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800">
          คลิกลากเพื่อหมุน | สกอร์เมาส์เพื่อซูม
        </div>
      </div>

      {/* Main Bottom Floating Action Bar (Lifted above mobile safe area & fully responsive) */}
      <div className="absolute bottom-[max(1.25rem,calc(0.75rem+env(safe-area-inset-bottom,0px)))] left-1/2 -translate-x-1/2 z-20 flex items-center justify-center w-full px-4 max-w-md pointer-events-none">
        {/* Launch / Create Krathong CTA Button */}
        <button
          onClick={() => setIsCreateOpen(true)}
          className="pointer-events-auto group relative w-full sm:w-auto px-5 sm:px-7 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm sm:text-base shadow-[0_12px_30px_-5px_rgba(245,158,11,0.55),0_6px_12px_-4px_rgba(0,0,0,0.5)] ring-2 ring-amber-300/70 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-sm"
        >
          <div className="w-6 h-6 rounded-lg bg-slate-950/25 flex items-center justify-center shrink-0">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="truncate">ถ่ายรูป / ปล่อยกระทงเพื่อรับโหวต</span>
          <Sparkles className="w-4 h-4 text-slate-950 animate-bounce shrink-0" />
        </button>
      </div>

      {/* Modals & Drawers */}
      <CreateKrathongModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      <KrathongDetailModal
        krathong={selectedKrathong}
        onClose={() => setSelectedKrathong(null)}
        onVote={handleVote}
        hasVoted={hasVotedCurrent}
        onFocusKrathong={handleFocusKrathong}
      />

      <LeaderboardDrawer
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        entries={entries}
        onSelectKrathong={(entry) => setSelectedKrathong(entry)}
        onFocusKrathong={handleFocusKrathong}
      />
    </div>
  );
}
