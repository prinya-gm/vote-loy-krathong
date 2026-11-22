import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  query,
  orderBy,
  limit
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, isFirebaseConfigured } from "../firebase";

const LOCAL_STORAGE_KEY = "loy_krathong_entries_v1";
const VOTED_KEY = "loy_krathong_voted_ids";

// Seed default sample entries if empty
const defaultEntries = [
  {
    id: "sample-1",
    name: "น้องมะลิ & พี่กล้า",
    description: "มาลอยกระทงคู่กันปีแรก ขอให้ความรักราบรื่นสดใสเหมือนสายน้ำครับ 🌸",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
    votes: 48,
    color: "#ec4899", // pink
    gender: "female",
    costumeStyle: "female-top-2",
    costumeColor: "#ec4899",
    topStyle: "female-top-2",
    bottomStyle: "female-bottom-5",
    krathongStyle: "krathong-lotus",
    flowerStyle: "flower-pink-lotus",
    x: 0,
    z: 8,
    speed: 0.008,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-2",
    name: "กลุ่มเพื่อนวิศวะ 67",
    description: "ลอยกระทงเพื่อสิ่งแวดล้อม กระทงน้ำแข็งสลายตัวได้ใน 10 นาที! 🌿",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80",
    votes: 62,
    color: "#10b981", // emerald
    gender: "male",
    costumeStyle: "male-top-1",
    costumeColor: "#10b981",
    topStyle: "male-top-1",
    bottomStyle: "male-bottom-4",
    krathongStyle: "krathong-banana-leaf",
    flowerStyle: "flower-jasmine-champaca",
    x: -8,
    z: 14,
    speed: 0.006,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-3",
    name: "ครอบครัวสุขสันต์",
    description: "พาคุณยายมาขอขมาพระแม่คงคา อิ่มบุญอิ่มใจทุกคนค่ะ 🙏✨",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80",
    votes: 35,
    color: "#f59e0b", // amber
    gender: "male",
    costumeStyle: "male-top-2",
    costumeColor: "#f59e0b",
    topStyle: "male-top-2",
    bottomStyle: "male-bottom-3",
    krathongStyle: "krathong-gold-rose",
    flowerStyle: "flower-gold-marigold",
    x: 10,
    z: 4,
    speed: 0.01,
    createdAt: new Date().toISOString()
  },
  {
    id: "sample-4",
    name: "น้องฟ้าใสชุดไทยจิตรลดา",
    description: "ชุดไทยประยุกต์ร่วมอนุรักษ์วัฒนธรรมลอยกระทง 2569 ค่ะ 👑",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
    votes: 89,
    color: "#8b5cf6", // purple
    gender: "female",
    costumeStyle: "female-top-1",
    costumeColor: "#8b5cf6",
    topStyle: "female-top-1",
    bottomStyle: "female-bottom-1",
    krathongStyle: "krathong-banana-stem",
    flowerStyle: "flower-purple-orchid",
    x: -14,
    z: 2,
    speed: 0.007,
    createdAt: new Date().toISOString()
  }
];

// Helper to get local votes list
export const getVotedIds = () => {
  try {
    const raw = localStorage.getItem(VOTED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const hasVotedFor = (id) => {
  return getVotedIds().includes(id);
};

export const recordVoteLocally = (id) => {
  const current = getVotedIds();
  if (!current.includes(id)) {
    current.push(id);
    localStorage.setItem(VOTED_KEY, JSON.stringify(current));
  }
};

// Subscribe to entries stream (either Firestore or LocalStorage)
export const subscribeToEntries = (callback) => {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, "krathongs"), orderBy("createdAt", "desc"));
      return onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data()
        }));
        if (items.length === 0) {
          // If firestore is empty, also give defaults
          callback(defaultEntries);
        } else {
          callback(items);
        }
      }, (err) => {
        console.warn("Firestore listener error, fallback to local:", err);
        fallbackLocal(callback);
      });
    } catch (e) {
      console.warn("Firestore subscription failed:", e);
      return fallbackLocal(callback);
    }
  } else {
    return fallbackLocal(callback);
  }
};

function fallbackLocal(callback) {
  const load = () => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        callback(JSON.parse(stored));
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultEntries));
        callback(defaultEntries);
      }
    } catch {
      callback(defaultEntries);
    }
  };

  load();
  const handleStorage = () => load();
  window.addEventListener("storage", handleStorage);
  return () => window.removeEventListener("storage", handleStorage);
}

// Add new Krathong & Entry
export const addKrathongEntry = async ({
  name,
  description,
  file,
  color,
  gender = "female",
  costumeStyle = "female-top-1",
  costumeColor = "#f59e0b",
  topStyle,
  bottomStyle,
  krathongStyle,
  flowerStyle,
  hasContest = true,
  hasKrathong = true,
}) => {
  let photoUrl = "";
  
  // If user provided a file or photo
  if (file) {
    const compressedDataUrl = await compressAndPreserveAspectRatio(file, 640, 0.85);

    if (isFirebaseConfigured && storage) {
      try {
        const fileRef = ref(storage, `photos/${Date.now()}_photo.jpg`);
        const res = await fetch(compressedDataUrl);
        const blob = await res.blob();
        const snapshot = await uploadBytes(fileRef, blob);
        photoUrl = await getDownloadURL(snapshot.ref);
      } catch (uploadErr) {
        console.warn("Storage upload failed, using compressed base64 data URL instead", uploadErr);
        photoUrl = compressedDataUrl;
      }
    } else {
      photoUrl = compressedDataUrl;
    }
  }

  const chosenTop = topStyle || costumeStyle || (gender === "male" ? "male-top-1" : "female-top-1");
  const chosenBottom = bottomStyle || (gender === "male" ? "male-bottom-1" : "female-bottom-1");
  const chosenKrathong = krathongStyle || "krathong-banana-leaf";
  const chosenFlower = flowerStyle || "flower-pink-lotus";

  // Random initial river coordinates
  const newEntry = {
    name: name.trim() || "ผู้ร่วมลอยกระทง",
    description: description.trim() || "ขอขมาพระแม่คงคา มีความสุขสวัสดีตลอดปี",
    photoUrl: photoUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
    color: color || "#f59e0b",
    gender: gender || "female",
    costumeStyle: chosenTop,
    costumeColor: costumeColor || color || "#f59e0b",
    topStyle: chosenTop,
    bottomStyle: chosenBottom,
    krathongStyle: chosenKrathong,
    flowerStyle: chosenFlower,
    votes: 0,
    hasContest: hasContest !== false,
    hasKrathong: hasKrathong !== false,
    x: (Math.random() - 0.5) * 30,
    z: 20 + Math.random() * 10, // start from upstream
    speed: 0.005 + Math.random() * 0.008,
    createdAt: new Date().toISOString()
  };

  if (isFirebaseConfigured && db) {
    const docRef = await addDoc(collection(db, "krathongs"), {
      ...newEntry,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } else {
    // Local storage fallback
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [...defaultEntries];
    const generatedId = "local-" + Date.now();
    const item = { ...newEntry, id: generatedId };
    list.unshift(item);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    // trigger custom event for same window
    window.dispatchEvent(new Event("storage"));
    return generatedId;
  }
};

// Vote for an entry
export const voteForEntry = async (id) => {
  if (hasVotedFor(id)) {
    throw new Error("คุณได้โหวตให้กับกระทงนี้ไปแล้ว!");
  }

  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, "krathongs", id);
      await updateDoc(docRef, {
        votes: increment(1)
      });
      recordVoteLocally(id);
      return true;
    } catch (e) {
      console.warn("Firestore vote failed, updating local state", e);
    }
  }

  // Fallback local vote
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  const list = raw ? JSON.parse(raw) : [...defaultEntries];
  const idx = list.findIndex((item) => item.id === id);
  if (idx !== -1) {
    list[idx].votes = (list[idx].votes || 0) + 1;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event("storage"));
  }
  recordVoteLocally(id);
  return true;
};

// ย่อรูปโดยคงอัตราส่วนเดิม (Aspect Ratio) 100% ไม่บิดเบี้ยว ไม่ตัดส่วนของรูปทิ้ง
export function compressAndPreserveAspectRatio(file, maxDim = 640, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }
    // กรณีเป็น data URL หรือ string อยู่แล้ว
    if (typeof file === "string" && (file.startsWith("data:") || file.startsWith("http"))) {
      const img = new Image();
      if (!file.startsWith("data:")) img.crossOrigin = "anonymous";
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => resolve(file);
      img.src = file;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // คำนวณขนาดใหม่ตามสัดส่วนเดิมอย่างแม่นยำ
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            // แนวนอน (Landscape) หรือ จัตุรัส (Square)
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            // แนวตั้ง (Portrait)
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// REALTIME LIVE FIREWORK SYNCHRONIZATION (วิธีที่ 1: Firebase + BroadcastChannel)
// เมื่อเครื่องใดกดจุดพลุ เครื่องอื่นๆ จะเห็นพลุแตกกระจายพร้อมกันทันทีทั่วโลก
// ============================================================================

let fireworkBroadcastChannel = null;
try {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    fireworkBroadcastChannel = new BroadcastChannel("loy_krathong_live_fireworks");
  }
} catch {
  // BroadcastChannel unsupported or restricted in context
}

// Client Session ID เพื่อคัดกรองไม่ให้เล่นเสียงหรือเอฟเฟกต์ซ้ำกับตัวเองที่เพิ่งกด
export const getClientSessionId = () => {
  try {
    let sid = sessionStorage.getItem("lk_client_session_id");
    if (!sid) {
      sid = "user-" + Math.random().toString(36).substring(2, 9) + "-" + Date.now().toString(36);
      sessionStorage.setItem("lk_client_session_id", sid);
    }
    return sid;
  } catch {
    return "anon-" + Math.random().toString(36).substring(2, 9);
  }
};

/**
 * ส่งสัญญาณเหตุการณ์การจุดพลุไปยังเครื่องอื่นๆ ทั่วโลกผ่าน Firebase + แท็บอื่นๆ ผ่าน BroadcastChannel
 */
export const broadcastLiveFirework = async (type = "sky", payload = {}) => {
  const sessionId = getClientSessionId();
  const eventData = {
    type,
    paletteIndex: payload.paletteIndex ?? Math.floor(Math.random() * 7),
    startX: payload.startX,
    startZ: payload.startZ,
    targetY: payload.targetY,
    speedY: payload.speedY,
    senderId: sessionId,
    clientTimestamp: Date.now()
  };

  // 1. Broadcast ส่งต่อให้แท็บอื่นๆ ในเบราว์เซอร์เดียวกันทันที (0ms latency)
  if (fireworkBroadcastChannel) {
    try {
      fireworkBroadcastChannel.postMessage(eventData);
    } catch (e) {
      console.warn("BroadcastChannel post error:", e);
    }
  }

  // 2. ส่ง Event ขึ้น Firebase Firestore ไปยังเครื่องอื่นๆ ทั่วโลกแบบ Realtime
  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, "live_fireworks"), {
        ...eventData,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.warn("Firestore live firework broadcast error:", err);
    }
  }
};

/**
 * ดักฟัง Event การจุดพลุสดจากเครื่องอื่นๆ แบบ Realtime
 */
export const subscribeToLiveFireworks = (onFireworkReceived) => {
  const mySessionId = getClientSessionId();
  const processedEventIds = new Set();
  const sessionStartTime = Date.now() - 3500; // เพิกเฉยพลุที่จุดไปแล้วก่อนเปิดเว็บ

  // 1. รับ Event จากแท็บอื่นๆ ในเบราว์เซอร์เดียวกัน
  const handleBcMessage = (msgEvent) => {
    const data = msgEvent.data;
    if (!data || data.senderId === mySessionId) return;
    if (data.clientTimestamp && Date.now() - data.clientTimestamp > 4000) return;
    onFireworkReceived({ ...data, isRemote: true });
  };

  if (fireworkBroadcastChannel) {
    fireworkBroadcastChannel.addEventListener("message", handleBcMessage);
  }

  // 2. รับ Event จาก Firebase Firestore ดักฟังแบบ Realtime
  let unsubscribeFirestore = () => {};
  if (isFirebaseConfigured && db) {
    try {
      const q = query(
        collection(db, "live_fireworks"),
        orderBy("clientTimestamp", "desc"),
        limit(8)
      );

      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            const docId = change.doc.id;
            if (processedEventIds.has(docId)) return;
            processedEventIds.add(docId);

            const data = change.doc.data();
            if (!data) return;

            // คัดกรองไม่ให้รันซ้ำกับเครื่องตัวเองที่เพิ่งกด
            if (data.senderId === mySessionId) return;

            // ไม่แสดงพลุที่เกิดขึ้นก่อนผู้ใช้เข้าเว็บ หรือพลุที่เก่าเกิน 4.5 วินาที
            const eventTime = data.clientTimestamp || sessionStartTime;
            if (eventTime < sessionStartTime || Date.now() - eventTime > 4500) return;

            // จุดพลุบนหน้าจอทันที!
            onFireworkReceived({
              ...data,
              isRemote: true
            });
          }
        });
      }, (err) => {
        console.warn("Firestore live_fireworks listener warning:", err);
      });
    } catch (e) {
      console.warn("Failed to subscribe to firestore live fireworks:", e);
    }
  }

  return () => {
    if (fireworkBroadcastChannel) {
      fireworkBroadcastChannel.removeEventListener("message", handleBcMessage);
    }
    unsubscribeFirestore();
  };
};
