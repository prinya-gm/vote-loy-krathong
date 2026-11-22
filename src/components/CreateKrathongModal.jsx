import React, { useState, useRef } from "react";
import { Camera, Upload, X, Sparkles, Loader2, Check } from "lucide-react";
import {
  MALE_TOPS,
  MALE_BOTTOMS,
  FEMALE_TOPS,
  FEMALE_BOTTOMS,
  KRATHONG_BASES,
  FLOWER_DECORATIONS,
  MaleTopIcon,
  MaleBottomIcon,
  FemaleTopIcon,
  FemaleBottomIcon,
  KrathongBaseIcon,
  FlowerDecorationIcon,
  CombinedAvatarPreview,
  CombinedKrathongPreview,
} from "./KrathongAssets";

export default function CreateKrathongModal({ isOpen, onClose, onSubmit }) {
  const [enableContest, setEnableContest] = useState(false); // ถ่ายรูปชุดไทยเพื่อร่วมโหวต
  const [enableKrathong, setEnableKrathong] = useState(false); // ร่วมลอยกระทง
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("female");
  const [topStyle, setTopStyle] = useState("female-top-1");
  const [bottomStyle, setBottomStyle] = useState("female-bottom-1");
  const [krathongStyle, setKrathongStyle] = useState("krathong-banana-leaf");
  const [flowerStyle, setFlowerStyle] = useState("flower-pink-lotus");
  const [previewImage, setPreviewImage] = useState(null);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const resetForm = () => {
    setEnableContest(false);
    setEnableKrathong(false);
    setName("");
    setDescription("");
    setGender("female");
    setTopStyle("female-top-1");
    setBottomStyle("female-bottom-1");
    setKrathongStyle("krathong-banana-leaf");
    setFlowerStyle("flower-pink-lotus");
    setPreviewImage(null);
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    stopCamera();
  };

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    if (newGender === "male") {
      setTopStyle("male-top-1");
      setBottomStyle("male-bottom-1");
    } else {
      setTopStyle("female-top-1");
      setBottomStyle("female-bottom-1");
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewImage(url);
    }
  };

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access error:", err);
      alert("ไม่สามารถเข้าถึงกล้องได้ กรุณาใช้วิธีอัปโหลดรูปภาพแทนครับ");
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const vw = videoRef.current.videoWidth || 640;
    const vh = videoRef.current.videoHeight || 480;
    const canvas = document.createElement("canvas");
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, vw, vh);

    canvas.toBlob((blob) => {
      if (blob) {
        const photoFile = new File([blob], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });
        setFile(photoFile);
        setPreviewImage(URL.createObjectURL(blob));
        stopCamera();
      }
    }, "image/jpeg", 0.9);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!enableContest && !enableKrathong) {
      alert("กรุณาเลือกอย่างน้อย 1 รายการครับ (ถ่ายรูปชุดไทยเพื่อร่วมโหวต หรือ ร่วมลอยกระทง)");
      return;
    }
    if (!name.trim()) {
      alert("กรุณากรอกชื่อหรือฉายาของคุณครับ");
      return;
    }
    // ถ้าเลือกถ่ายรูปชุดไทยเพื่อร่วมโหวต บังคับให้ลงรูปถ่าย
    if (enableContest && !previewImage && !file) {
      alert("กรุณาถ่ายรูปหรืออัปโหลดรูปของคุณเพื่อร่วมโหวตครับ");
      return;
    }

    try {
      setIsSubmitting(true);

      // Find color from selected Krathong / Costume
      const currentKrathong = KRATHONG_BASES.find((k) => k.id === krathongStyle);
      const currentTop = (gender === "male" ? MALE_TOPS : FEMALE_TOPS).find((t) => t.id === topStyle);

      await onSubmit({
        name,
        description: enableKrathong ? description : "",
        file: enableContest ? file : null,
        color: currentKrathong?.colorHex || "#f59e0b",
        gender,
        costumeStyle: topStyle,
        costumeColor: currentTop?.colorHex || "#f59e0b",
        topStyle,
        bottomStyle,
        krathongStyle,
        flowerStyle,
        hasContest: enableContest,
        hasKrathong: enableKrathong,
      });
      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const activeTops = gender === "male" ? MALE_TOPS : FEMALE_TOPS;
  const activeBottoms = gender === "male" ? MALE_BOTTOMS : FEMALE_BOTTOMS;
  const hasSelection = enableContest || enableKrathong;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900/98 border border-amber-500/40 rounded-2xl sm:rounded-3xl shadow-2xl text-slate-100 max-h-[94dvh] flex flex-col overflow-hidden">
        {/* Fixed Header */}
        <div className="shrink-0 flex items-center justify-between p-3.5 sm:p-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl sm:text-3xl">
              {enableContest && enableKrathong ? "🪷" : (enableContest ? "👑" : (enableKrathong ? "🪷" : "✨"))}
            </span>
            <div>
              <h2 className="text-base sm:text-xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                {enableContest && enableKrathong
                  ? "สร้างกระทง & ออกแบบชุดไทย"
                  : (enableContest
                      ? "ถ่ายรูปชุดไทยเพื่อร่วมโหวต"
                      : (enableKrathong
                          ? "ร่วมลอยกระทงออนไลน์"
                          : "เลือกกิจกรรมเข้าร่วม"))}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                {enableContest && enableKrathong
                  ? "เลือกแบบชุดไทย (บน-ล่าง) และแบบกระทง & ดอกไม้มงคลตามใจคุณ"
                  : (enableContest
                      ? "แต่งกายชุดไทยสวยสง่าบนท่าน้ำเพื่อเปิดรับคะแนนโหวต"
                      : (enableKrathong
                          ? "เลือกกระทงและดอกไม้มงคล พร้อมอธิษฐานขอพรพระแม่คงคา"
                          : "กรุณาทำเครื่องหมายถูกเลือกกิจกรรมด้านล่างเพื่อเริ่มต้น"))}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form with Scrollable Body & Sticky Submit Footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-5 custom-scrollbar">
            
            {/* 0. กิจกรรมที่ต้องการเข้าร่วม (Mode Selector Checkboxes) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-slate-800/80 to-cyan-500/15 border border-amber-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-amber-300 flex items-center gap-1.5">
                  <span>✨</span> เลือกกิจกรรมที่คุณต้องการเข้าร่วม:
                </span>
                <span className="text-[10px] text-slate-400">เลือกได้มากกว่า 1 ข้อ</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* ตัวเลือก 1: ถ่ายรูปชุดไทยเพื่อร่วมโหวต */}
                <label
                  className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                    enableContest
                      ? "border-amber-400 bg-amber-500/20 shadow-md ring-1 ring-amber-400/40 text-white"
                      : "border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 text-slate-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enableContest}
                    onChange={(e) => setEnableContest(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-600 bg-slate-700 cursor-pointer accent-amber-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-amber-200">
                      <span>📸</span> ถ่ายรูปชุดไทยเพื่อร่วมโหวต
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">
                      มีโมเดล 3D ยืนบนท่าน้ำ พร้อมป้ายชื่อและรูปถ่ายจริงเปิดรับโหวต
                    </p>
                  </div>
                </label>

                {/* ตัวเลือก 2: ร่วมลอยกระทง */}
                <label
                  className={`relative flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition select-none ${
                    enableKrathong
                      ? "border-cyan-400 bg-cyan-500/20 shadow-md ring-1 ring-cyan-400/40 text-white"
                      : "border-slate-700 bg-slate-800/50 hover:bg-slate-800/80 text-slate-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enableKrathong}
                    onChange={(e) => setEnableKrathong(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 border-slate-600 bg-slate-700 cursor-pointer accent-cyan-500 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-cyan-200">
                      <span>🪷</span> ร่วมลอยกระทง
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">
                      เลือกกระทงและดอกไม้ พร้อมปล่อยลอยสู่สายน้ำและขอพร
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {!hasSelection ? (
              <div className="py-10 px-4 text-center rounded-2xl bg-slate-800/30 border border-dashed border-slate-700/80 flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500/20 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-2xl animate-bounce">
                  👆
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm sm:text-base font-bold text-slate-200">
                    กรุณาทำเครื่องหมายถูกเลือกกิจกรรมที่คุณต้องการเข้าร่วมด้านบน
                  </h3>
                  <p className="text-xs text-slate-400 max-w-sm">
                    เลือก "ถ่ายรูปชุดไทยเพื่อร่วมโหวต", "ร่วมลอยกระทง" หรือเลือกทั้ง 2 อย่าง เพื่อเริ่มกรอกข้อมูลและออกแบบ
                  </p>
                </div>
              </div>
            ) : (
              <>

            {/* 1. PHOTO & NAME SECTION (กรณีเลือกถ่ายรูปชุดไทยเพื่อร่วมโหวต) */}
            {enableContest ? (
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <label className="block text-xs sm:text-sm font-bold text-amber-300">
                  1. รูปถ่ายและชื่อของคุณ <span className="text-red-400">*</span>
                </label>

                {cameraActive ? (
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video sm:aspect-square max-h-56 flex flex-col items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
                    <div className="absolute bottom-3 flex gap-2.5">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full shadow-lg flex items-center gap-2 text-xs sm:text-sm cursor-pointer active:scale-95"
                      >
                        <Camera className="w-4 h-4" /> แชะภาพเลย
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-white rounded-full text-xs cursor-pointer"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : previewImage ? (
                  <div className="relative rounded-xl overflow-hidden border-2 border-amber-500/40 max-h-48 sm:max-h-56 flex items-center justify-center bg-black/40 p-2 mx-auto group">
                    <img src={previewImage} alt="Preview" className="max-h-44 sm:max-h-52 w-auto object-contain rounded-lg shadow" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewImage(null);
                        setFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-500 text-white rounded-full shadow-md transition cursor-pointer"
                      title="เปลี่ยนรูป"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-amber-500/30 hover:border-amber-400 bg-slate-800/50 hover:bg-slate-800/80 rounded-xl transition cursor-pointer group active:scale-95"
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mb-1.5 group-hover:scale-110 transition">
                        <Camera className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold">ถ่ายรูปจากกล้อง</span>
                      <span className="text-[10px] text-slate-400">มือถือ / เว็บแคม</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-amber-500/30 hover:border-amber-400 bg-slate-800/50 hover:bg-slate-800/80 rounded-xl transition cursor-pointer group active:scale-95"
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mb-1.5 group-hover:scale-110 transition">
                        <Upload className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold">อัปโหลดรูปภาพ</span>
                      <span className="text-[10px] text-slate-400">PNG, JPG, WEBP</span>
                    </button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />

                <div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="กรอกชื่อ / ฉายา / กลุ่มของคุณ (เช่น น้องฟ้า ชุดไทยสวยสะกด)"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition text-xs sm:text-sm"
                    maxLength={40}
                  />
                </div>
              </div>
            ) : (
              /* 1. NAME ONLY SECTION (กรณีเลือกลอยกระทงอย่างเดียว ไม่ต้องมีส่วนสำหรับถ่ายรูป) */
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2.5">
                <label className="block text-xs sm:text-sm font-bold text-cyan-300">
                  1. ชื่อหรือฉายาของคุณ / ครอบครัว <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="กรอกชื่อ / ฉายา / ครอบครัวของคุณ (เช่น ครอบครัวใจดี, น้องฟ้า)"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition text-xs sm:text-sm"
                  maxLength={40}
                />
              </div>
            )}

            {/* 2. THAI COSTUME CUSTOMIZATION (แสดงเฉพาะเมื่อเลือกถ่ายรูปชุดไทยเพื่อร่วมโหวต) */}
            {enableContest && (
              <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-500/10 via-slate-800/50 to-slate-900/60 border border-amber-500/35 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-amber-300 flex items-center gap-1.5">
                      <span>👑</span> 2. เลือกแบบชุดไทย (แยกบน-ล่าง มีรูปตัวอย่าง)
                    </h3>
                    <p className="text-[11px] text-slate-400">เลือกจับคู่เสื้อและผ้านุ่ง/โจงกระเบนได้ตามสไตล์คุณ</p>
                  </div>
                  <div className="flex gap-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleGenderChange("female")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        gender === "female"
                          ? "bg-amber-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      👩 หญิง (5 แบบ)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGenderChange("male")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        gender === "male"
                          ? "bg-amber-500 text-slate-950 shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      👨 ชาย (5 แบบ)
                    </button>
                  </div>
                </div>

                {/* 2.1 เสื้อ / สไบ ส่วนบน (Upper Garment - 5 Options with Preview Images) */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-amber-200">
                    เสื้อ / สไบ ส่วนบน (เลือก 1 ใน 5 แบบ):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {activeTops.map((top) => {
                      const isSelected = topStyle === top.id;
                      return (
                        <button
                          key={top.id}
                          type="button"
                          onClick={() => setTopStyle(top.id)}
                          className={`relative flex flex-col items-center p-2 rounded-xl border text-center transition cursor-pointer active:scale-95 group ${
                            isSelected
                              ? "border-amber-400 bg-amber-500/25 ring-2 ring-amber-400/40 shadow-lg scale-102"
                              : "border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          <div className="w-12 h-12 flex items-center justify-center my-1 group-hover:scale-105 transition">
                            {gender === "male" ? (
                              <MaleTopIcon id={top.id} className="w-12 h-12" />
                            ) : (
                              <FemaleTopIcon id={top.id} className="w-12 h-12" />
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-amber-100 line-clamp-1 leading-tight">
                            {top.name}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                            {top.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2.2 โจงกระเบน / ผ้าซิ่น ส่วนล่าง (Lower Garment - 5 Options with Preview Images) */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-amber-200">
                    {gender === "male" ? "โจงกระเบน / กางเกง ส่วนล่าง (เลือก 1 ใน 5 แบบ):" : "ผ้าซิ่น / ผ้านุ่ง ส่วนล่าง (เลือก 1 ใน 5 แบบ):"}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {activeBottoms.map((bottom) => {
                      const isSelected = bottomStyle === bottom.id;
                      return (
                        <button
                          key={bottom.id}
                          type="button"
                          onClick={() => setBottomStyle(bottom.id)}
                          className={`relative flex flex-col items-center p-2 rounded-xl border text-center transition cursor-pointer active:scale-95 group ${
                            isSelected
                              ? "border-amber-400 bg-amber-500/25 ring-2 ring-amber-400/40 shadow-lg scale-102"
                              : "border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          <div className="w-12 h-12 flex items-center justify-center my-1 group-hover:scale-105 transition">
                            {gender === "male" ? (
                              <MaleBottomIcon id={bottom.id} className="w-12 h-12" />
                            ) : (
                              <FemaleBottomIcon id={bottom.id} className="w-12 h-12" />
                            )}
                          </div>
                          <span className="text-[11px] font-bold text-amber-100 line-clamp-1 leading-tight">
                            {bottom.name}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                            {bottom.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Combined Avatar Preview Card */}
                <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-amber-500/20">
                  <CombinedAvatarPreview gender={gender} topId={topStyle} bottomId={bottomStyle} className="w-32 shrink-0" />
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">ชุดไทยที่เลือกจับคู่</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {activeTops.find((t) => t.id === topStyle)?.name}
                    </h4>
                    <p className="text-xs text-amber-200 mt-0.5">
                      คู่กับ {activeBottoms.find((b) => b.id === bottomStyle)?.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {activeTops.find((t) => t.id === topStyle)?.desc}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. KRATHONG BASE & FLOWER DECORATION (แสดงเฉพาะเมื่อเลือกร่วมลอยกระทง) */}
            {enableKrathong && (
              <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-b from-cyan-950/30 via-slate-800/50 to-slate-900/60 border border-cyan-500/35 space-y-4">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-cyan-300 flex items-center gap-1.5">
                    <span>🪷</span> {enableContest ? "3." : "2."} เลือกแบบกระทง & ดอกไม้มงคล (มีรูปตัวอย่าง)
                  </h3>
                  <p className="text-[11px] text-slate-400">เลือกฐานกระทงและช่อดอกไม้มงคลที่ประดับอยู่บนกระทงของคุณ</p>
                </div>

                {/* 3.1 รูปแบบกระทง (Krathong Base - 5 Options with Preview Images) */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-cyan-200">
                    รูปแบบกระทง (เลือก 1 ใน 5 แบบ):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {KRATHONG_BASES.map((base) => {
                      const isSelected = krathongStyle === base.id;
                      return (
                        <button
                          key={base.id}
                          type="button"
                          onClick={() => setKrathongStyle(base.id)}
                          className={`relative flex flex-col items-center p-2 rounded-xl border text-center transition cursor-pointer active:scale-95 group ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-500/25 ring-2 ring-cyan-400/40 shadow-lg scale-102"
                              : "border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          <div className="w-12 h-12 flex items-center justify-center my-1 group-hover:scale-105 transition">
                            <KrathongBaseIcon id={base.id} className="w-12 h-12" />
                          </div>
                          <span className="text-[11px] font-bold text-cyan-100 line-clamp-1 leading-tight">
                            {base.name}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                            {base.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3.2 ดอกไม้ประดับกระทง (Flower Decoration - 5 Options with Preview Images) */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-cyan-200">
                    ดอกไม้ประดับกระทง (เลือก 1 ใน 5 แบบ):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {FLOWER_DECORATIONS.map((flower) => {
                      const isSelected = flowerStyle === flower.id;
                      return (
                        <button
                          key={flower.id}
                          type="button"
                          onClick={() => setFlowerStyle(flower.id)}
                          className={`relative flex flex-col items-center p-2 rounded-xl border text-center transition cursor-pointer active:scale-95 group ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-500/25 ring-2 ring-cyan-400/40 shadow-lg scale-102"
                              : "border-slate-700 bg-slate-800/70 hover:bg-slate-800 text-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          <div className="w-12 h-12 flex items-center justify-center my-1 group-hover:scale-105 transition">
                            <FlowerDecorationIcon id={flower.id} className="w-12 h-12" />
                          </div>
                          <span className="text-[11px] font-bold text-cyan-100 line-clamp-1 leading-tight">
                            {flower.name}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-1">
                            {flower.subtitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Combined Krathong Preview Card */}
                <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20">
                  <CombinedKrathongPreview krathongId={krathongStyle} flowerId={flowerStyle} className="w-36 shrink-0" />
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold">กระทงและดอกไม้ที่จัดแต่ง</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">
                      {KRATHONG_BASES.find((k) => k.id === krathongStyle)?.name}
                    </h4>
                    <p className="text-xs text-cyan-200 mt-0.5">
                      ประดับด้วย {FLOWER_DECORATIONS.find((f) => f.id === flowerStyle)?.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {FLOWER_DECORATIONS.find((f) => f.id === flowerStyle)?.desc}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. WISH / DESCRIPTION (แสดงเฉพาะเมื่อเลือกร่วมลอยกระทง) */}
            {enableKrathong && (
              <div>
                <label className="block text-xs sm:text-sm font-bold text-amber-200 mb-1">
                  {enableContest ? "4." : "3."} คำอธิษฐานขอขมาพระแม่คงคา
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ขอขมาพระแม่คงคา และขอพรให้ทุกคนมีความสุข หรือ ชวนเพื่อนๆ มาช่วยโหวตให้เค้าหน่อยนะ..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition text-xs sm:text-sm"
                  maxLength={150}
                />
              </div>
            )}
              </>
            )}
          </div>

          {/* Sticky Action Footer (แสดงเฉพาะเมื่อมีการเลือกกิจกรรมอย่างน้อย 1 อย่าง) */}
          {hasSelection && (
            <div className="shrink-0 p-3.5 sm:p-5 border-t border-slate-800 bg-slate-900/95 backdrop-blur-md">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 sm:py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-sm sm:text-base rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    กำลังบันทึกข้อมูล...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    {enableContest && enableKrathong
                      ? "ปล่อยกระทงลงน้ำ & เริ่มเปิดโหวต"
                      : (enableContest
                          ? "บันทึกรูปและเปิดรับโหวตบนท่าน้ำ"
                          : "ปล่อยกระทงลงสู่สายน้ำ")}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
