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
  Settings,
  Flame,
  Trees
} from "lucide-react";
import { LoyKrathongScene } from "./components/LoyKrathongScene";
import CreateKrathongModal from "./components/CreateKrathongModal";
import KrathongDetailModal from "./components/KrathongDetailModal";
import LeaderboardDrawer from "./components/LeaderboardDrawer";
import { 
  subscribeToEntries, 
  addKrathongEntry, 
  voteForEntry, 
  hasVotedFor,
  broadcastLiveFirework,
  subscribeToLiveFireworks
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
  const [remoteFireworkToast, setRemoteFireworkToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const audioRef = useRef(null);
  const lastFireworkLaunchRef = useRef(0);

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

  // Auto-play music 3 seconds after opening app
  useEffect(() => {
    let fallbackCleanup = null;
    const startMusic = () => {
      if (!audioRef.current) {
        const audio = new Audio(`${import.meta.env.BASE_URL}audio/kangkaw-kin-kluay.mp3`);
        audio.loop = true;
        audio.volume = 0.65;
        audioRef.current = audio;
      }
      audioRef.current
        .play()
        .then(() => {
          setSoundEnabled(true);
          if (fallbackCleanup) fallbackCleanup();
        })
        .catch(() => {
          // If browser policy blocks unprompted autoplay, start on first touch
          const onFirstTouch = () => {
            if (audioRef.current) {
              audioRef.current.play().then(() => setSoundEnabled(true)).catch(() => {});
            }
            cleanup();
          };
          const cleanup = () => {
            window.removeEventListener("pointerdown", onFirstTouch);
            window.removeEventListener("touchstart", onFirstTouch);
          };
          window.addEventListener("pointerdown", onFirstTouch, { once: true });
          window.addEventListener("touchstart", onFirstTouch, { once: true });
          fallbackCleanup = cleanup;
        });
    };

    const timer = setTimeout(startMusic, 3000);
    return () => {
      clearTimeout(timer);
      if (fallbackCleanup) fallbackCleanup();
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
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.triggerAvatarLevelUp(id);
    }
  };

  const handleFocusKrathong = (id) => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.focusOnKrathong(id);
    }
  };

  const handleFocusAvatar = (id) => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.focusOnCandidateAvatar(id);
    }
  };

  // Subscribe to Live Realtime Fireworks across all devices (Firebase + BroadcastChannel)
  useEffect(() => {
    const unsubscribe = subscribeToLiveFireworks((event) => {
      if (sceneInstanceRef.current) {
        if (event.type === "tree") {
          sceneInstanceRef.current.launchFireworkBehindTrees(event);
        } else {
          sceneInstanceRef.current.launchFirework(event);
        }

        // Floating toast badge indicating another participant launched a firework
        setRemoteFireworkToast("🎆 มีผู้ร่วมงานจุดพลุขึ้นสู่ท้องฟ้า!");
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setRemoteFireworkToast(null);
        }, 2400);
      }
    });

    return () => {
      unsubscribe();
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const resetCamera = () => {
    if (sceneInstanceRef.current) {
      sceneInstanceRef.current.camera.position.set(0, 18, 38);
      sceneInstanceRef.current.controls.target.set(0, 2, 0);
    }
  };

  const handleLaunchFirework = () => {
    const now = Date.now();
    if (now - lastFireworkLaunchRef.current < 320) return;
    lastFireworkLaunchRef.current = now;
    if (sceneInstanceRef.current) {
      const payload = sceneInstanceRef.current.launchFirework();
      if (payload) {
        broadcastLiveFirework("sky", payload);
      }
    }
  };

  const handleLaunchTreeFirework = () => {
    const now = Date.now();
    if (now - lastFireworkLaunchRef.current < 320) return;
    lastFireworkLaunchRef.current = now;
    if (sceneInstanceRef.current) {
      const payload = sceneInstanceRef.current.launchFireworkBehindTrees();
      if (payload) {
        broadcastLiveFirework("tree", payload);
      }
    }
  };

  const toggleSound = () => {
    // Play / pause Kang Khao Kin Kluay (instrumental Thai traditional music)
    if (!audioRef.current) {
      const audio = new Audio(`${import.meta.env.BASE_URL}audio/kangkaw-kin-kluay.mp3`);
      audio.loop = true;
      audio.volume = 0.65;
      audioRef.current = audio;
    }

    const audio = audioRef.current;
    if (soundEnabled) {
      audio.pause();
      setSoundEnabled(false);
    } else {
      audio
        .play()
        .then(() => {
          setSoundEnabled(true);
        })
        .catch((err) => {
          console.warn("Audio play prevented:", err);
        });
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
          {/* Kang Khao Kin Kluay Instrumental Music Button */}
          <button
            onClick={toggleSound}
            className={`p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border backdrop-blur-md shadow-xl transition cursor-pointer flex items-center justify-center ${
              soundEnabled
                ? "border-amber-400 text-amber-300 ring-2 ring-amber-400/30 bg-amber-500/10"
                : "border-slate-700/60 text-slate-400 hover:text-amber-200"
            }`}
            title={soundEnabled ? "ปิดเสียงเพลงค้างคาวกินกล้วย" : "เปิดเสียงเพลงค้างคาวกินกล้วย (ทำนอง)"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
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

      {/* Live Remote Firework Toast Alert */}
      {remoteFireworkToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 bg-slate-900/90 text-amber-300 rounded-full border border-amber-400/40 shadow-xl shadow-amber-500/25 text-xs sm:text-sm backdrop-blur-md flex items-center gap-2 pointer-events-none animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span className="font-medium">{remoteFireworkToast}</span>
        </div>
      )}

      {/* 3D Navigation & Firework Controls Widget (Responsive: Bottom-Right on mobile, Bottom-Left on tablet/desktop) */}
      <div className="absolute bottom-24 right-3 sm:bottom-[max(1.5rem,calc(1rem+env(safe-area-inset-bottom,0px)))] sm:left-6 sm:right-auto z-20 flex flex-col items-center gap-2">
        {/* Firework Launch Buttons - วางเรียงเป็นแนวตั้งเหนือปุ่ม Zoom */}
        <div className="flex flex-col items-center gap-2">
          {/* 1. จุดดอกไม้ไฟกลางสายน้ำ (ความสูงลดลงเหลือ 70%) */}
          <button
            onClick={handleLaunchFirework}
            className="group relative p-2.5 sm:p-3 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white shadow-xl shadow-orange-500/40 hover:shadow-orange-500/60 ring-2 ring-amber-300/80 active:scale-90 transition-all cursor-pointer flex items-center justify-center animate-pulse"
            title="จุดดอกไม้ไฟกลางสายน้ำ 🎆"
          >
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-100 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
            </span>
          </button>

          {/* 2. จุดพลุพุ่งจากหลังแนวต้นไม้ */}
          <button
            onClick={handleLaunchTreeFirework}
            className="group relative p-2.5 sm:p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-amber-500 hover:from-emerald-500 hover:to-amber-400 text-white shadow-xl shadow-teal-500/40 hover:shadow-teal-500/60 ring-2 ring-emerald-300/80 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
            title="จุดพลุจากหลังแนวต้นไม้ 🌳🎆"
          >
            <Trees className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100 group-hover:scale-110 transition-transform" />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1 animate-spin" />
          </button>
        </div>

        {/* Zoom & Camera Controls Pill */}
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
        candidatesCount={entries.filter((e) => e.hasContest !== false).length}
        maxCandidates={50}
      />

      <KrathongDetailModal
        krathong={selectedKrathong}
        onClose={() => setSelectedKrathong(null)}
        onVote={handleVote}
        hasVoted={hasVotedCurrent}
        onFocusKrathong={handleFocusKrathong}
        onFocusAvatar={handleFocusAvatar}
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
