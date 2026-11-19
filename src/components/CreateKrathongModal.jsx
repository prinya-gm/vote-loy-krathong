import React, { useState, useRef } from "react";
import { Camera, Upload, X, Sparkles, Loader2 } from "lucide-react";

const KRATHONG_COLORS = [
  { name: "ทองเรืองรอง", hex: "#f59e0b" },
  { name: "ชมพูดอกบัว", hex: "#ec4899" },
  { name: "มรกตธรรมชาติ", hex: "#10b981" },
  { name: "ม่วงอัญชัน", hex: "#8b5cf6" },
  { name: "ฟ้าราตรี", hex: "#06b6d4" },
  { name: "แดงเพลิง", hex: "#ef4444" },
];

export default function CreateKrathongModal({ isOpen, onClose, onSubmit }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(KRATHONG_COLORS[0].hex);
  const [previewImage, setPreviewImage] = useState(null);
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  if (!isOpen) return null;

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

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("กรุณากรอกชื่อหรือฉายาของคุณครับ");
      return;
    }
    if (!previewImage && !file) {
      alert("กรุณาถ่ายรูปหรืออัปโหลดรูปของคุณเพื่อใส่ในกระทงครับ");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name,
        description,
        file,
        color: selectedColor,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการสร้างกระทง กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900/95 border border-amber-500/30 rounded-2xl shadow-2xl p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪷</span>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent">
                สร้างกระทง & เข้าร่วมประกวด
              </h2>
              <p className="text-xs text-slate-400">ถ่ายรูปหรืออัปโหลดรูปขึ้นกระทงเพื่อเริ่มรับคะแนนโหวต</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Photo Section */}
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-2">
              รูปภาพของคุณในกระทง <span className="text-red-400">*</span>
            </label>

            {cameraActive ? (
              <div className="relative rounded-xl overflow-hidden bg-black aspect-square flex flex-col items-center justify-center">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline />
                <div className="absolute bottom-4 flex gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-full shadow-lg flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4" /> แชะภาพเลย
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white rounded-full text-sm"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            ) : previewImage ? (
              <div className="relative rounded-xl overflow-hidden border-2 border-amber-500/40 max-h-64 flex items-center justify-center bg-black/40 p-2 mx-auto group">
                <img src={previewImage} alt="Preview" className="max-h-60 w-auto object-contain rounded-lg shadow" />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setFile(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-500 text-white rounded-full shadow-md transition"
                  title="เปลี่ยนรูป"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-amber-500/30 hover:border-amber-400 bg-slate-800/50 hover:bg-slate-800/80 rounded-xl transition cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold">ถ่ายรูปจากกล้อง</span>
                  <span className="text-xs text-slate-400 mt-1">มือถือ / เว็บแคม</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-amber-500/30 hover:border-amber-400 bg-slate-800/50 hover:bg-slate-800/80 rounded-xl transition cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold">อัปโหลดรูปภาพ</span>
                  <span className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP</span>
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
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-1">
              ชื่อ / ฉายา / กลุ่ม <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น น้องพลอย ชุดไทยสวยสะกด, หรือ พี่ต้น & น้องฟ้า"
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              maxLength={40}
            />
          </div>

          {/* Description / Wish */}
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-1">
              คำอธิษฐาน / ข้อความแนะนำตัว
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ขอขมาพระแม่คงคา และขอพรให้ทุกคนมีความสุข หรือ ชวนเพื่อนๆ มาโหวตให้เค้าหน่อยนะ..."
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition text-sm"
              maxLength={150}
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-amber-200 mb-2">
              โทนสีกระทง & ดอกไม้
            </label>
            <div className="flex flex-wrap gap-2.5">
              {KRATHONG_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setSelectedColor(c.hex)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                    selectedColor === c.hex
                      ? "border-amber-300 ring-2 ring-amber-400/40 bg-slate-800 scale-105"
                      : "border-slate-700 bg-slate-800/60 opacity-80 hover:opacity-100"
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full inline-block shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  กำลังลอยกระทงลงสู่สายน้ำ...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  ปล่อยกระทงลงน้ำ & เริ่มเปิดโหวต
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
