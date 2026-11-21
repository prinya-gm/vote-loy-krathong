import React from "react";

/* ==========================================================
   KRATHONG & COSTUME CUSTOMIZATION DEFINITIONS
   ตัวเลือกแบบชุดไทย (ชาย 5 แบบ, หญิง 5 แบบ แยกบน-ล่าง)
   ตัวเลือกกระทง (5 แบบ) และ ดอกไม้ในกระทง (5 แบบ)
========================================================== */

// 1. ชาย ส่วนบน (Male Tops - 5 แบบ)
export const MALE_TOPS = [
  {
    id: "male-top-1",
    name: "เสื้อราชปะแตนไหมงาช้าง",
    subtitle: "Classic Ivory Rajpatan",
    desc: "เสื้อคอตั้งสีงาช้าง กระดุมทอง 5 เม็ด ผ้าเช็ดหน้าไหมทองที่อกซ้าย",
    colorHex: "#fffdf5",
    accentHex: "#f59e0b",
  },
  {
    id: "male-top-2",
    name: "เสื้อพระราชทานไหมทอง",
    subtitle: "Royal Golden Silk Shirt",
    desc: "ผ้าไหมไทยสีทองสุวรรณ คอตั้ง คัตติ้งเนี้ยบหรูหรา ภูมิฐาน",
    colorHex: "#f59e0b",
    accentHex: "#d97706",
  },
  {
    id: "male-top-3",
    name: "เสื้อพระราชทานสีกรมท่า",
    subtitle: "Deep Navy Silk Shirt",
    desc: "ผ้าไหมสีกรมท่าเข้ม สุขุม คลาสสิก ประดับกระดุมโลหะเงินทอง",
    colorHex: "#1e3a8a",
    accentHex: "#93c5fd",
  },
  {
    id: "male-top-4",
    name: "เสื้อกุยเฮงไหมทับทิมสยาม",
    subtitle: "Ruby Silk Gui-Heng",
    desc: "ผ้าไหมสีแดงทับทิม กระดุมขมวดไหมทอง พร้อมสไบไหมพาดบ่า",
    colorHex: "#991b1b",
    accentHex: "#f59e0b",
  },
  {
    id: "male-top-5",
    name: "เสื้อม่อฮ่อมประยุกต์ครามธรรมชาติ",
    subtitle: "Modern Indigo Mor-Hom",
    desc: "สีครามธรรมชาติ คอจีนประยุกต์ กระดุมกะลาผสานลายไทยร่วมสมัย",
    colorHex: "#1e40af",
    accentHex: "#78350f",
  },
];

// 2. ชาย ส่วนล่าง (Male Bottoms - 5 แบบ)
export const MALE_BOTTOMS = [
  {
    id: "male-bottom-1",
    name: "โจงกระเบนไหมสีแดงทับทิม",
    subtitle: "Ruby Red Jongkraben",
    desc: "โจงกระเบนผ้าไหมสีแดงทับทิมสยาม นุ่งจีบพับขลิบทอง พร้อมถุงน่องขาว",
    colorHex: "#881337",
    accentHex: "#f59e0b",
  },
  {
    id: "male-bottom-2",
    name: "โจงกระเบนไหมสีกรมท่า",
    subtitle: "Navy Blue Jongkraben",
    desc: "โจงกระเบนผ้าไหมสีกรมท่าเข้ม นุ่งยกพกงามสง่า แบบขุนนางโบราณ",
    colorHex: "#172554",
    accentHex: "#3b82f6",
  },
  {
    id: "male-bottom-3",
    name: "โจงกระเบนไหมยกทองคำ",
    subtitle: "Gilded Gold Jongkraben",
    desc: "ผ้าไหมยกทองคำลายพิกุลอร่าม เข็มขัดทองประดับพลอยทับทิม",
    colorHex: "#d97706",
    accentHex: "#fde047",
  },
  {
    id: "male-bottom-4",
    name: "โจงกระเบนไหมสีเขียวมรกต",
    subtitle: "Emerald Green Jongkraben",
    desc: "โจงกระเบนไหมสีเขียวมรกตเหลือบทอง นุ่งจับจีบกระเบนเหน็บหลัง",
    colorHex: "#065f46",
    accentHex: "#34d399",
  },
  {
    id: "male-bottom-5",
    name: "กางเกงแพรไทยสีงาช้างขลิบทอง",
    subtitle: "Ivory Silk Thai Trousers",
    desc: "กางเกงผ้าแพรไหมไทยสีงาช้าง ขากระบอกตรงขลิบชายทอง สวมสบายสง่างาม",
    colorHex: "#fef3c7",
    accentHex: "#f59e0b",
  },
];

// 3. หญิง ส่วนบน (Female Tops - 5 แบบ)
export const FEMALE_TOPS = [
  {
    id: "female-top-1",
    name: "สไบจักรพรรดิสองชั้นปักดิ้นทอง",
    subtitle: "Royal Chakraphat Sabai",
    desc: "สไบอัดกลีบชั้นใน ห่มทับด้วยสไบปักดิ้นทองคำแท้ ชายสไบทอดยาว",
    colorHex: "#f59e0b",
    accentHex: "#be123c",
  },
  {
    id: "female-top-2",
    name: "สไบจักรีสีชมพูกลีบบัว",
    subtitle: "Lotus Pink Chakri Sabai",
    desc: "สไบเฉียงผ้าไหมแพรสีชมพูกลีบบัว ทิ้งชายสไบพริ้วไหว อ่อนหวานละมุน",
    colorHex: "#f472b6",
    accentHex: "#f59e0b",
  },
  {
    id: "female-top-3",
    name: "สไบแพรสีเขียวมรกต",
    subtitle: "Emerald Green Silk Sabai",
    desc: "สไบแพรไหมสีเขียวมรกต ขลิบดิ้นทองคำรอบผืน ทรงคุณค่าสง่างาม",
    colorHex: "#059669",
    accentHex: "#f59e0b",
  },
  {
    id: "female-top-4",
    name: "เสื้อลูกไม้คอปิดแขนกระบอก",
    subtitle: "Boromphiman High-Neck Lace",
    desc: "เสื้อคอกลมตั้งแขนยาวผ้าไหมสลับลูกไม้โปร่ง สไตล์ชุดไทยบรมพิมาน",
    colorHex: "#fff1f2",
    accentHex: "#f59e0b",
  },
  {
    id: "female-top-5",
    name: "สไบสองชั้นสีม่วงดอกรัก",
    subtitle: "Royal Purple Silk Sabai",
    desc: "สไบเฉียงสีม่วงดอกรัก ปักเลื่อมทองคำระยิบระยับรับแสงจันทร์เพ็ญ",
    colorHex: "#7c3aed",
    accentHex: "#fde047",
  },
];

// 4. หญิง ส่วนล่าง (Female Bottoms - 5 แบบ)
export const FEMALE_BOTTOMS = [
  {
    id: "female-bottom-1",
    name: "ผ้าซิ่นไหมยกดิ้นทองจีบหน้านาง",
    subtitle: "Gold Brocade Sarong",
    desc: "ผ้าซิ่นไหมยกดิ้นทองคำแท้ ทรงหางปลา ทอดจีบหน้านางตรงกลางขลิบทอง",
    colorHex: "#f59e0b",
    accentHex: "#d97706",
  },
  {
    id: "female-bottom-2",
    name: "ผ้าซิ่นมัดหมี่สีน้ำเงินคราม",
    subtitle: "Indigo Mudmee Sarong",
    desc: "ผ้าซิ่นไหมมัดหมี่ลวดลายไทยโบราณ สีกรมท่าน้ำเงินคราม เชิงทอง",
    colorHex: "#1e3a8a",
    accentHex: "#60a5fa",
  },
  {
    id: "female-bottom-3",
    name: "ผ้าถุงไหมสีแดงทับทิมสยาม",
    subtitle: "Ruby Red Silk Sarong",
    desc: "ผ้าถุงไหมสีแดงทับทิมสยาม ปักเชิงหน้านางดิ้นทองคำ โดดเด่นสะกดสายตา",
    colorHex: "#9f1239",
    accentHex: "#f59e0b",
  },
  {
    id: "female-bottom-4",
    name: "ผ้าซิ่นไหมสีเขียวมรกต",
    subtitle: "Emerald Green Silk Sarong",
    desc: "ผ้าซิ่นไหมยกดอกสีเขียวมรกต ชายกรอมข้อเท้า เสริมทรวดทรงสง่างาม",
    colorHex: "#065f46",
    accentHex: "#34d399",
  },
  {
    id: "female-bottom-5",
    name: "ผ้าถุงไหมสีชมพูกลีบบัว",
    subtitle: "Lotus Pink Silk Sarong",
    desc: "ผ้าถุงไหมสีชมพูกลีบบัวหวานละมุน ชายเชิงซิ่นทองคำประกาย",
    colorHex: "#ec4899",
    accentHex: "#f59e0b",
  },
];

// 5. แบบกระทง (Krathong Bases - 5 แบบ)
export const KRATHONG_BASES = [
  {
    id: "krathong-banana-leaf",
    name: "กระทงใบตองกลีบผกากรอง",
    subtitle: "Traditional Banana Leaf",
    desc: "ใบตองกล้วยตานีสด พับจับจีบกลีบผกากรองซ้อนสองชั้น วิจิตรศิลป์ไทยแท้",
    colorHex: "#2e7d32",
    accentHex: "#15803d",
  },
  {
    id: "krathong-lotus",
    name: "กระทงบัวหลวงสวรรค์",
    subtitle: "Sacred Lotus Petals",
    desc: "กลีบดอกบัวหลวงสีชมพูขาวเรียงซ้อน สัญลักษณ์แห่งความบริสุทธิ์และสิริมงคล",
    colorHex: "#ec4899",
    accentHex: "#fbcfe8",
  },
  {
    id: "krathong-gold-rose",
    name: "กระทงกลีบกุหลาบทองคำ",
    subtitle: "Golden Brocade Rose",
    desc: "กลีบกุหลาบประดิษฐ์จากผ้าไหมยกทองคำ ประดับดิ้นทองเปล่งประกายในสายน้ำ",
    colorHex: "#f59e0b",
    accentHex: "#fde047",
  },
  {
    id: "krathong-banana-stem",
    name: "กระทงกาบกล้วยแกะสลัก",
    subtitle: "Carved Banana Stem",
    desc: "ภูมิปัญญาชาวบ้าน กาบกล้วยแกะสลักลวดลายกนกไทยโบราณ ลอยเด่นเหนือน้ำ",
    colorHex: "#854d0e",
    accentHex: "#ca8a04",
  },
  {
    id: "krathong-eco-pastel",
    name: "กระทงรักษ์โลกแป้งธรรมชาติ",
    subtitle: "Eco-Friendly Natural Starch",
    desc: "กระทงแป้งข้าวโพดและขนมปัง ย่อยสลายได้ 100% เป็นมิตรต่อสายน้ำและปลา",
    colorHex: "#06b6d4",
    accentHex: "#a7f3d0",
  },
];

// 6. ดอกไม้ประดับกระทง (Flower Decorations - 5 แบบ)
export const FLOWER_DECORATIONS = [
  {
    id: "flower-pink-lotus",
    name: "ดอกบัวหลวงสีชมพูบานสะพรั่ง",
    subtitle: "Pink Sacred Lotus",
    desc: "ดอกบัวชมพูบานเด่นใจกลางกระทง สักการะพระแม่คงคาด้วยความบริสุทธิ์",
    colorHex: "#ec4899",
    accentHex: "#facc15",
  },
  {
    id: "flower-jasmine-champaca",
    name: "พวงมาลัยมะลิสด & จำปาทอง",
    subtitle: "Jasmine & Champaca Garland",
    desc: "พวงมาลัยดอกมะลิร้อยเรียงคู่ดอกจำปาสีทอง หอมอบอวลเสริมมงคลชีวิต",
    colorHex: "#ffffff",
    accentHex: "#eab308",
  },
  {
    id: "flower-gold-marigold",
    name: "ดอกดาวเรืองมงคลสีทองอร่าม",
    subtitle: "Golden Marigold Blossom",
    desc: "ดอกดาวเรืองสีเหลืองทองอร่าม สื่อถึงความเจริญรุ่งเรือง ร่ำรวย และโชคลาภ",
    colorHex: "#eab308",
    accentHex: "#ca8a04",
  },
  {
    id: "flower-purple-orchid",
    name: "ช่อดอกกล้วยไม้สีม่วงอัญชัน",
    subtitle: "Purple Royal Orchid",
    desc: "ช่อดอกกล้วยไม้ไทยสีม่วงสดใส อ่อนช้อย สวยงามคงทนเหนือกาลเวลา",
    colorHex: "#8b5cf6",
    accentHex: "#c084fc",
  },
  {
    id: "flower-red-rose",
    name: "ดอกกุหลาบมอญแดงสด & ดอกรัก",
    subtitle: "Red Heritage Rose & Crown Flowers",
    desc: "กุหลาบมอญสีแดงสดเปี่ยมความรัก แวดล้อมด้วยดอกรักสีขาวบริสุทธิ์",
    colorHex: "#ef4444",
    accentHex: "#f8fafc",
  },
];

/* ==========================================================
   SVG PREVIEW ILLUSTRATION COMPONENTS (รูปตัวอย่างความละเอียดสูง)
========================================================== */

// ภาพตัวอย่างเสื้อผู้ชาย (Male Top SVG)
export function MaleTopIcon({ id, className = "w-14 h-14" }) {
  switch (id) {
    case "male-top-1": // ราชปะแตนงาช้าง
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="ivoryJacket" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f3eee3" />
            </linearGradient>
          </defs>
          {/* ไหล่และลำตัว */}
          <path d="M22 36 L34 26 L66 26 L78 36 L74 85 L26 85 Z" fill="url(#ivoryJacket)" stroke="#dcd6c8" strokeWidth="2" />
          {/* คอตั้งราชปะแตน */}
          <path d="M40 26 L40 18 Q50 16 60 18 L60 26 Z" fill="#fffdf5" stroke="#f59e0b" strokeWidth="2" />
          {/* แนวน็อตกระดุม */}
          <line x1="50" y1="26" x2="50" y2="85" stroke="#e6dfcf" strokeWidth="2" />
          {/* กระดุมทอง 5 เม็ด */}
          {[32, 42, 52, 62, 72].map((y, idx) => (
            <circle key={idx} cx="50" cy={y} r="2.8" fill="#f59e0b" stroke="#b45309" strokeWidth="1" />
          ))}
          {/* กระเป๋าอกซ้าย + ผ้าเช็ดหน้าทอง */}
          <rect x="30" y="40" width="12" height="8" rx="1.5" fill="#ebe4d6" stroke="#d5ccbb" strokeWidth="1" />
          <polygon points="33,40 36,34 39,40" fill="#f59e0b" />
          {/* สายสะพายเฉียง */}
          <line x1="34" y1="26" x2="68" y2="85" stroke="#f59e0b" strokeWidth="4" opacity="0.85" />
          <circle cx="58" cy="68" r="4" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
        </svg>
      );

    case "male-top-2": // พระราชทานไหมทอง
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="goldSilk" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>
          <path d="M22 36 L34 26 L66 26 L78 36 L74 85 L26 85 Z" fill="url(#goldSilk)" stroke="#b45309" strokeWidth="2" />
          <path d="M40 26 L40 18 Q50 16 60 18 L60 26 Z" fill="#f59e0b" stroke="#78350f" strokeWidth="2" />
          <line x1="50" y1="26" x2="50" y2="85" stroke="#b45309" strokeWidth="2" />
          {[32, 42, 52, 62, 72].map((y, idx) => (
            <circle key={idx} cx="50" cy={y} r="3" fill="#ffffff" stroke="#78350f" strokeWidth="1" />
          ))}
          <polygon points="50,48 53,54 60,54 55,59 57,65 50,61 43,65 45,59 40,54 47,54" fill="#ffffff" opacity="0.9" />
        </svg>
      );

    case "male-top-3": // พระราชทานกรมท่า
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="navySilk" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <path d="M22 36 L34 26 L66 26 L78 36 L74 85 L26 85 Z" fill="url(#navySilk)" stroke="#172554" strokeWidth="2" />
          <path d="M40 26 L40 18 Q50 16 60 18 L60 26 Z" fill="#1e3a8a" stroke="#f59e0b" strokeWidth="2" />
          <line x1="50" y1="26" x2="50" y2="85" stroke="#1d4ed8" strokeWidth="2" />
          {[32, 42, 52, 62, 72].map((y, idx) => (
            <circle key={idx} cx="50" cy={y} r="2.8" fill="#f59e0b" stroke="#172554" strokeWidth="1" />
          ))}
          <line x1="34" y1="26" x2="68" y2="85" stroke="#cbd5e1" strokeWidth="3.5" opacity="0.8" />
        </svg>
      );

    case "male-top-4": // กุยเฮงทับทิม
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="rubyTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#7f1d1d" />
            </linearGradient>
          </defs>
          <path d="M20 38 L32 26 L68 26 L80 38 L75 85 L25 85 Z" fill="url(#rubyTop)" stroke="#991b1b" strokeWidth="2" />
          <ellipse cx="50" cy="28" rx="14" ry="7" fill="#fecaca" />
          <line x1="50" y1="35" x2="50" y2="85" stroke="#b91c1c" strokeWidth="2" />
          {[42, 54, 66, 78].map((y, idx) => (
            <ellipse key={idx} cx="50" cy={y} rx="4.5" ry="2.2" fill="#f59e0b" />
          ))}
          <path d="M30 26 Q40 50 28 85" stroke="#f59e0b" strokeWidth="4" fill="none" opacity="0.9" />
        </svg>
      );

    default: // ม่อฮ่อมคราม
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="morhom" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e40af" />
            </linearGradient>
          </defs>
          <path d="M22 36 L34 26 L66 26 L78 36 L74 85 L26 85 Z" fill="url(#morhom)" stroke="#1e3a8a" strokeWidth="2" />
          <circle cx="50" cy="27" r="10" fill="#fed7aa" />
          <path d="M42 27 Q50 35 58 27" stroke="#1e3a8a" strokeWidth="2" fill="none" />
          <line x1="50" y1="35" x2="50" y2="85" stroke="#1d4ed8" strokeWidth="2" />
          {[42, 54, 66, 78].map((y, idx) => (
            <circle key={idx} cx="50" cy={y} r="3" fill="#78350f" stroke="#451a03" strokeWidth="1" />
          ))}
          {/* ขอบแขนพับลายไทย */}
          <rect x="22" y="50" width="7" height="10" rx="1" fill="#fde047" opacity="0.8" />
          <rect x="71" y="50" width="7" height="10" rx="1" fill="#fde047" opacity="0.8" />
        </svg>
      );
  }
}

// ภาพตัวอย่างส่วนล่างผู้ชาย (Male Bottom SVG)
export function MaleBottomIcon({ id, className = "w-14 h-14" }) {
  switch (id) {
    case "male-bottom-1": // โจงแดงทับทิม
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="rubyJong" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
          {/* พองโจงกระเบน 2 ข้าง */}
          <path d="M28 15 Q12 40 28 62 Q36 68 44 60 L48 40 L52 40 L56 60 Q64 68 72 62 Q88 40 72 15 Z" fill="url(#rubyJong)" stroke="#4c0519" strokeWidth="2" />
          <line x1="50" y1="15" x2="50" y2="48" stroke="#f59e0b" strokeWidth="2.5" />
          {/* เข็มขัดทอง */}
          <rect x="26" y="12" width="48" height="7" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <rect x="45" y="10" width="10" height="11" rx="2" fill="#be123c" stroke="#f59e0b" strokeWidth="1.5" />
          {/* ขาถุงน่องขาว */}
          <rect x="32" y="62" width="9" height="22" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="59" y="62" width="9" height="22" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          {/* รองเท้าคัทชู */}
          <rect x="29" y="82" width="14" height="8" rx="2" fill="#18181b" />
          <rect x="57" y="82" width="14" height="8" rx="2" fill="#18181b" />
        </svg>
      );

    case "male-bottom-2": // โจงกรมท่า
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="navyJong" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>
          </defs>
          <path d="M28 15 Q12 40 28 62 Q36 68 44 60 L48 40 L52 40 L56 60 Q64 68 72 62 Q88 40 72 15 Z" fill="url(#navyJong)" stroke="#0f172a" strokeWidth="2" />
          <line x1="50" y1="15" x2="50" y2="48" stroke="#f59e0b" strokeWidth="2.5" />
          <rect x="26" y="12" width="48" height="7" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <rect x="45" y="10" width="10" height="11" rx="2" fill="#3b82f6" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="32" y="62" width="9" height="22" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="59" y="62" width="9" height="22" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="29" y="82" width="14" height="8" rx="2" fill="#18181b" />
          <rect x="57" y="82" width="14" height="8" rx="2" fill="#18181b" />
        </svg>
      );

    case "male-bottom-3": // โจงไหมทอง
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="goldJong" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <path d="M28 15 Q12 40 28 62 Q36 68 44 60 L48 40 L52 40 L56 60 Q64 68 72 62 Q88 40 72 15 Z" fill="url(#goldJong)" stroke="#78350f" strokeWidth="2" />
          <line x1="50" y1="15" x2="50" y2="48" stroke="#ffffff" strokeWidth="2.5" />
          <rect x="26" y="12" width="48" height="7" rx="2" fill="#ffffff" stroke="#78350f" strokeWidth="1" />
          <circle cx="50" cy="15.5" r="5" fill="#be123c" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="32" y="62" width="9" height="22" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="59" y="62" width="9" height="22" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="29" y="82" width="14" height="8" rx="2" fill="#18181b" />
          <rect x="57" y="82" width="14" height="8" rx="2" fill="#18181b" />
        </svg>
      );

    case "male-bottom-4": // โจงเขียวมรกต
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="emeraldJong" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
          </defs>
          <path d="M28 15 Q12 40 28 62 Q36 68 44 60 L48 40 L52 40 L56 60 Q64 68 72 62 Q88 40 72 15 Z" fill="url(#emeraldJong)" stroke="#022c22" strokeWidth="2" />
          <line x1="50" y1="15" x2="50" y2="48" stroke="#f59e0b" strokeWidth="2.5" />
          <rect x="26" y="12" width="48" height="7" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <rect x="45" y="10" width="10" height="11" rx="2" fill="#047857" stroke="#f59e0b" strokeWidth="1.5" />
          <rect x="32" y="62" width="9" height="22" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="59" y="62" width="9" height="22" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="29" y="82" width="14" height="8" rx="2" fill="#18181b" />
          <rect x="57" y="82" width="14" height="8" rx="2" fill="#18181b" />
        </svg>
      );

    default: // กางเกงแพรงาช้าง
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="ivoryPants" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#fef3c7" />
            </linearGradient>
          </defs>
          {/* กางเกงขากระบอกตรง */}
          <path d="M28 15 L72 15 L72 78 L54 78 L50 45 L46 78 L28 78 Z" fill="url(#ivoryPants)" stroke="#d97706" strokeWidth="2" />
          {/* ขลิบทองปลายขา */}
          <rect x="28" y="74" width="18" height="4" fill="#f59e0b" />
          <rect x="54" y="74" width="18" height="4" fill="#f59e0b" />
          {/* เข็มขัด */}
          <rect x="26" y="12" width="48" height="6" rx="2" fill="#f59e0b" />
          {/* รองเท้า */}
          <rect x="30" y="80" width="14" height="7" rx="2" fill="#b45309" />
          <rect x="56" y="80" width="14" height="7" rx="2" fill="#b45309" />
        </svg>
      );
  }
}

// ภาพตัวอย่างเสื้อ/สไบผู้หญิง (Female Top SVG)
export function FemaleTopIcon({ id, className = "w-14 h-14" }) {
  switch (id) {
    case "female-top-1": // สไบจักรพรรดิ
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="goldChakraphat" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          {/* สไบอัดกลีบชั้นใน */}
          <path d="M30 40 L65 20 L78 30 L45 80 Z" fill="#fef9c3" opacity="0.8" />
          {/* สไบปักดิ้นทองชั้นนอกพาดเฉียงบ่าซ้าย */}
          <path d="M26 30 L42 16 L76 72 L60 85 Z" fill="url(#goldChakraphat)" stroke="#78350f" strokeWidth="1.5" />
          {/* ชายสไบพริ้วทอดหลัง */}
          <path d="M26 30 Q16 55 20 88 L30 85 Q26 55 35 30 Z" fill="#d97706" opacity="0.85" />
          {/* สร้อยสังวาลย์ประดับพลอยทับทิม */}
          <line x1="38" y1="20" x2="68" y2="76" stroke="#fef08a" strokeWidth="2.5" />
          {[30, 45, 60].map((y, idx) => (
            <circle key={idx} cx={35 + idx * 12} cy={y} r="2.8" fill="#be123c" stroke="#f59e0b" strokeWidth="1" />
          ))}
          <circle cx="50" cy="18" r="7" fill="#fed7aa" />
        </svg>
      );

    case "female-top-2": // สไบจักรีชมพู
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="pinkSabai" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
          <path d="M26 30 L42 16 L76 72 L60 85 Z" fill="url(#pinkSabai)" stroke="#9d174d" strokeWidth="1.5" />
          <path d="M26 30 Q16 55 20 88 L30 85 Q26 55 35 30 Z" fill="#be185d" opacity="0.85" />
          <line x1="38" y1="20" x2="68" y2="76" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="50" cy="18" r="7" fill="#fed7aa" />
          <path d="M28 32 L58 83" stroke="#fbcfe8" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );

    case "female-top-3": // สไบเขียวมรกต
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="emeraldSabai" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
          <path d="M26 30 L42 16 L76 72 L60 85 Z" fill="url(#emeraldSabai)" stroke="#064e3b" strokeWidth="1.5" />
          <path d="M26 30 Q16 55 20 88 L30 85 Q26 55 35 30 Z" fill="#065f46" opacity="0.85" />
          <line x1="38" y1="20" x2="68" y2="76" stroke="#f59e0b" strokeWidth="2.5" />
          <circle cx="50" cy="18" r="7" fill="#fed7aa" />
          <path d="M26 30 L60 85" stroke="#fde047" strokeWidth="1.5" />
        </svg>
      );

    case "female-top-4": // เสื้อบรมพิมานลูกไม้
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="boromTop" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff1f2" />
              <stop offset="100%" stopColor="#ffe4e6" />
            </linearGradient>
          </defs>
          {/* เสื้อคอกลมแขนกระบอก */}
          <path d="M20 38 L32 26 L68 26 L80 38 L72 82 L28 82 Z" fill="url(#boromTop)" stroke="#fda4af" strokeWidth="1.5" />
          <ellipse cx="50" cy="26" rx="10" ry="5" fill="#fed7aa" stroke="#f59e0b" strokeWidth="2" />
          {/* สร้อยทองคำรอบคอ */}
          <path d="M42 27 Q50 36 58 27" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
          <circle cx="50" cy="36" r="3" fill="#be123c" />
          {/* ลายลูกไม้โปร่ง */}
          <path d="M30 40 Q50 50 70 40 M30 55 Q50 65 70 55 M30 70 Q50 80 70 70" stroke="#fecdd3" strokeWidth="1.5" fill="none" />
        </svg>
      );

    default: // สไบม่วงดอกรัก
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="purpleSabai" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
          </defs>
          <path d="M26 30 L42 16 L76 72 L60 85 Z" fill="url(#purpleSabai)" stroke="#581c87" strokeWidth="1.5" />
          <path d="M26 30 Q16 55 20 88 L30 85 Q26 55 35 30 Z" fill="#581c87" opacity="0.85" />
          <line x1="38" y1="20" x2="68" y2="76" stroke="#fde047" strokeWidth="2.5" />
          <circle cx="50" cy="18" r="7" fill="#fed7aa" />
          {[35, 48, 62, 75].map((y, idx) => (
            <circle key={idx} cx={40 + idx * 8} cy={y} r="1.5" fill="#fde047" />
          ))}
        </svg>
      );
  }
}

// ภาพตัวอย่างส่วนล่างผู้หญิง (Female Bottom SVG)
export function FemaleBottomIcon({ id, className = "w-14 h-14" }) {
  switch (id) {
    case "female-bottom-1": // ซิ่นไหมยกดิ้นทอง
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="goldSin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          {/* ผ้าซิ่นทรงหางปลา */}
          <path d="M35 15 L65 15 L72 82 L28 82 Z" fill="url(#goldSin)" stroke="#854d0e" strokeWidth="2" />
          {/* จีบหน้านางตรงกลาง */}
          <rect x="46" y="15" width="8" height="67" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          {/* เชิงผ้าซิ่นทอง */}
          <rect x="28" y="76" width="44" height="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          {/* เข็มขัดทอง + ปั้นเหน่งพลอย */}
          <rect x="33" y="12" width="34" height="6" rx="2" fill="#f59e0b" />
          <circle cx="50" cy="15" r="4.5" fill="#be123c" stroke="#f59e0b" strokeWidth="1.5" />
        </svg>
      );

    case "female-bottom-2": // ซิ่นมัดหมี่น้ำเงิน
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="navySin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
          <path d="M35 15 L65 15 L72 82 L28 82 Z" fill="url(#navySin)" stroke="#172554" strokeWidth="2" />
          <rect x="46" y="15" width="8" height="67" fill="#60a5fa" stroke="#1d4ed8" strokeWidth="1" />
          <rect x="28" y="76" width="44" height="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <rect x="33" y="12" width="34" height="6" rx="2" fill="#f59e0b" />
          <circle cx="50" cy="15" r="4.5" fill="#3b82f6" stroke="#f59e0b" strokeWidth="1.5" />
          {/* ลายมัดหมี่ */}
          <path d="M36 35 L40 40 L36 45 M64 35 L60 40 L64 45" stroke="#93c5fd" strokeWidth="1.5" fill="none" />
        </svg>
      );

    case "female-bottom-3": // ซิ่นทับทิมสยาม
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="rubySin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
          <path d="M35 15 L65 15 L72 82 L28 82 Z" fill="url(#rubySin)" stroke="#4c0519" strokeWidth="2" />
          <rect x="46" y="15" width="8" height="67" fill="#fda4af" stroke="#be123c" strokeWidth="1" />
          <rect x="28" y="76" width="44" height="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <rect x="33" y="12" width="34" height="6" rx="2" fill="#f59e0b" />
          <circle cx="50" cy="15" r="4.5" fill="#fde047" stroke="#b45309" strokeWidth="1.5" />
        </svg>
      );

    case "female-bottom-4": // ซิ่นมรกต
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="emeraldSin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
          </defs>
          <path d="M35 15 L65 15 L72 82 L28 82 Z" fill="url(#emeraldSin)" stroke="#022c22" strokeWidth="2" />
          <rect x="46" y="15" width="8" height="67" fill="#6ee7b7" stroke="#047857" strokeWidth="1" />
          <rect x="28" y="76" width="44" height="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <rect x="33" y="12" width="34" height="6" rx="2" fill="#f59e0b" />
          <circle cx="50" cy="15" r="4.5" fill="#34d399" stroke="#f59e0b" strokeWidth="1.5" />
        </svg>
      );

    default: // ซิ่นชมพูกลีบบัว
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="pinkSin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
          </defs>
          <path d="M35 15 L65 15 L72 82 L28 82 Z" fill="url(#pinkSin)" stroke="#831843" strokeWidth="2" />
          <rect x="46" y="15" width="8" height="67" fill="#fbcfe8" stroke="#db2777" strokeWidth="1" />
          <rect x="28" y="76" width="44" height="6" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
          <rect x="33" y="12" width="34" height="6" rx="2" fill="#f59e0b" />
          <circle cx="50" cy="15" r="4.5" fill="#f43f5e" stroke="#f59e0b" strokeWidth="1.5" />
        </svg>
      );
  }
}

// ภาพตัวอย่างกระทง (Krathong Base SVG)
export function KrathongBaseIcon({ id, className = "w-16 h-16" }) {
  switch (id) {
    case "krathong-banana-leaf": // ใบตองกลีบผกา
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="leafGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>
          {/* ฐานหยวกกล้วย */}
          <ellipse cx="50" cy="65" rx="38" ry="16" fill="#166534" stroke="#14532d" strokeWidth="2" />
          {/* กลีบผกาใบตองซ้อนรอบทิศ */}
          {[
            "M14,60 L24,42 L34,60 Z",
            "M26,62 L38,36 L48,62 Z",
            "M42,64 L50,32 L58,64 Z",
            "M52,62 L62,36 L74,62 Z",
            "M66,60 L76,42 L86,60 Z",
          ].map((d, idx) => (
            <path key={idx} d={d} fill="url(#leafGrad)" stroke="#14532d" strokeWidth="1.5" />
          ))}
          {/* ขอบกระทงดอกไม้ */}
          <ellipse cx="50" cy="62" rx="28" ry="10" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
        </svg>
      );

    case "krathong-lotus": // บัวหลวงสวรรค์
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="lotusGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="60%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#be185d" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="65" rx="38" ry="16" fill="#15803d" />
          {/* กลีบบัวหลวงชมพูรอบวง */}
          {[
            "M14,60 Q24,35 34,60 Z",
            "M24,62 Q38,28 48,62 Z",
            "M40,64 Q50,22 60,64 Z",
            "M52,62 Q62,28 76,62 Z",
            "M66,60 Q76,35 86,60 Z",
          ].map((d, idx) => (
            <path key={idx} d={d} fill="url(#lotusGrad)" stroke="#9d174d" strokeWidth="1.5" />
          ))}
          <ellipse cx="50" cy="62" rx="28" ry="10" fill="#fbcfe8" stroke="#db2777" strokeWidth="1" />
        </svg>
      );

    case "krathong-gold-rose": // กุหลาบทองคำ
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="goldRoseGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="65" rx="38" ry="16" fill="#78350f" />
          {[
            "M14,60 Q24,36 34,60 Z",
            "M26,62 Q38,30 48,62 Z",
            "M42,64 Q50,25 58,64 Z",
            "M52,62 Q62,30 74,62 Z",
            "M66,60 Q76,36 86,60 Z",
          ].map((d, idx) => (
            <path key={idx} d={d} fill="url(#goldRoseGrad)" stroke="#78350f" strokeWidth="1.5" />
          ))}
          <ellipse cx="50" cy="62" rx="28" ry="10" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
        </svg>
      );

    case "krathong-banana-stem": // กาบกล้วยแกะสลัก
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="barkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ca8a04" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
          </defs>
          <path d="M12 60 L18 78 L82 78 L88 60 Z" fill="url(#barkGrad)" stroke="#451a03" strokeWidth="2" />
          <ellipse cx="50" cy="60" rx="38" ry="14" fill="#a16207" stroke="#713f12" strokeWidth="2" />
          {/* ลายบากฟันปลาไทยรอบกาบกล้วย */}
          <path d="M16 68 L24 62 L32 68 L40 62 L48 68 L56 62 L64 68 L72 62 L80 68 L84 62" stroke="#fef08a" strokeWidth="2" fill="none" />
          <ellipse cx="50" cy="58" rx="28" ry="10" fill="#eab308" />
        </svg>
      );

    default: // แป้งธรรมชาติรักษ์โลก
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="ecoGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#67e8f9" />
              <stop offset="50%" stopColor="#a7f3d0" />
              <stop offset="100%" stopColor="#fde047" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="65" rx="38" ry="16" fill="#0284c7" />
          {[
            "M14,60 Q24,38 34,60 Z",
            "M26,62 Q38,32 48,62 Z",
            "M42,64 Q50,28 58,64 Z",
            "M52,62 Q62,32 74,62 Z",
            "M66,60 Q76,38 86,60 Z",
          ].map((d, idx) => (
            <path key={idx} d={d} fill="url(#ecoGrad)" stroke="#0891b2" strokeWidth="1.5" />
          ))}
          <ellipse cx="50" cy="62" rx="28" ry="10" fill="#ecfeff" stroke="#06b6d4" strokeWidth="1" />
        </svg>
      );
  }
}

// ภาพตัวอย่างดอกไม้ในกระทง (Flower Decoration SVG)
export function FlowerDecorationIcon({ id, className = "w-14 h-14" }) {
  switch (id) {
    case "flower-pink-lotus": // บัวหลวงชมพู
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <circle cx="50" cy="50" r="42" fill="#fdf2f8" opacity="0.6" />
          <path d="M50 18 Q35 40 50 62 Q65 40 50 18 Z" fill="#ec4899" />
          <path d="M25 45 Q45 35 60 50 Q45 65 25 45 Z" fill="#f472b6" />
          <path d="M75 45 Q55 35 40 50 Q55 65 75 45 Z" fill="#f472b6" />
          <path d="M35 30 Q50 48 35 65 Q20 48 35 30 Z" fill="#db2777" />
          <path d="M65 30 Q80 48 65 65 Q50 48 65 30 Z" fill="#db2777" />
          {/* ฝักบัวใจกลางสีเหลือง */}
          <circle cx="50" cy="48" r="9" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
          {[[-3, -3], [3, -3], [-3, 3], [3, 3]].map(([dx, dy], idx) => (
            <circle key={idx} cx={50 + dx} cy={48 + dy} r="1.2" fill="#713f12" />
          ))}
        </svg>
      );

    case "flower-jasmine-champaca": // พวงมาลัยมะลิจำปา
      return (
        <svg viewBox="0 0 100 100" className={className}>
          {/* วงพวงมาลัยดอกมะลิสีขาว */}
          <circle cx="50" cy="48" r="32" fill="none" stroke="#f8fafc" strokeWidth="12" strokeDasharray="6 4" />
          <circle cx="50" cy="48" r="32" fill="none" stroke="#cbd5e1" strokeWidth="1" />
          {/* ดอกจำปาทองประดับ 4 มุม */}
          {[0, 90, 180, 270].map((deg, idx) => {
            const rad = (deg * Math.PI) / 180;
            const cx = 50 + Math.cos(rad) * 32;
            const cy = 48 + Math.sin(rad) * 32;
            return <ellipse key={idx} cx={cx} cy={cy} rx="6" ry="3.5" transform={`rotate(${deg} ${cx} ${cy})`} fill="#eab308" stroke="#ca8a04" strokeWidth="1" />;
          })}
          {/* อุบะพวงดอกรักจำปาห้อยตรงกลาง */}
          <circle cx="50" cy="48" r="5" fill="#f59e0b" />
          <path d="M47 53 L50 64 L53 53 Z" fill="#eab308" />
        </svg>
      );

    case "flower-gold-marigold": // ดาวเรืองมงคล
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="marigoldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="36" fill="url(#marigoldGrad)" />
          {/* กลีบหยักหนาแน่นของดาวเรือง */}
          {[12, 18, 24, 30].map((r, rIdx) => (
            <circle key={rIdx} cx="50" cy="50" r={r} fill="none" stroke="#a16207" strokeWidth="2.5" strokeDasharray="4 3" />
          ))}
          <circle cx="50" cy="50" r="6" fill="#facc15" />
        </svg>
      );

    case "flower-purple-orchid": // กล้วยไม้ม่วง
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="orchidGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#d8b4fe" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
          </defs>
          {/* กลีบกล้วยไม้ 5 แฉก */}
          <path d="M50 20 Q40 38 50 50 Q60 38 50 20 Z" fill="url(#orchidGrad)" />
          <path d="M24 35 Q40 45 50 50 Q34 60 24 35 Z" fill="url(#orchidGrad)" />
          <path d="M76 35 Q60 45 50 50 Q66 60 76 35 Z" fill="url(#orchidGrad)" />
          <path d="M30 68 Q45 58 50 50 Q40 75 30 68 Z" fill="url(#orchidGrad)" />
          <path d="M70 68 Q55 58 50 50 Q60 75 70 68 Z" fill="url(#orchidGrad)" />
          {/* ปากกล้วยไม้และเกสรสีเหลืองขาว */}
          <ellipse cx="50" cy="52" rx="7" ry="9" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="50" cy="49" r="3" fill="#be123c" />
        </svg>
      );

    default: // กุหลาบมอญแดงสด
      return (
        <svg viewBox="0 0 100 100" className={className}>
          <defs>
            <linearGradient id="roseGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="50%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="35" fill="url(#roseGrad)" />
          {/* ขดกลีบกุหลาบมอญ */}
          <path d="M42 35 Q58 32 60 48 Q62 62 48 64 Q32 66 34 48 Q36 38 46 40" stroke="#fecaca" strokeWidth="2.5" fill="none" />
          <circle cx="50" cy="50" r="6" fill="#7f1d1d" />
          {/* ดอกรักสีขาวแวดล้อม */}
          {[
            [22, 26], [78, 26], [20, 72], [80, 72]
          ].map(([x, y], idx) => (
            <circle key={idx} cx={x} cy={y} r="5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
          ))}
        </svg>
      );
  }
}

// การ์ดพรีวิวชุดไทยรวม (แสดง Top + Bottom ประกบคู่กัน)
export function CombinedAvatarPreview({ gender, topId, bottomId, className = "" }) {
  const isMale = gender === "male";
  return (
    <div className={`relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 shadow-xl ${className}`}>
      <div className="absolute top-2 left-2 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
        พรีวิวชุดไทยที่เลือก
      </div>
      
      {/* ศีรษะและใบหน้า */}
      <div className="relative mt-2">
        <div className="w-10 h-10 rounded-full bg-[#dfb088] border-2 border-amber-400/40 shadow-inner flex items-center justify-center text-lg">
          {isMale ? "👨" : "👩"}
        </div>
      </div>

      {/* ส่วนบน */}
      <div className="-mt-1 z-10">
        {isMale ? (
          <MaleTopIcon id={topId} className="w-20 h-20 drop-shadow-md" />
        ) : (
          <FemaleTopIcon id={topId} className="w-20 h-20 drop-shadow-md" />
        )}
      </div>

      {/* ส่วนล่าง */}
      <div className="-mt-4 z-0">
        {isMale ? (
          <MaleBottomIcon id={bottomId} className="w-20 h-20 drop-shadow-md" />
        ) : (
          <FemaleBottomIcon id={bottomId} className="w-20 h-20 drop-shadow-md" />
        )}
      </div>
    </div>
  );
}

// การ์ดพรีวิวกระทงรวม (แสดง Krathong Base + Flower + Candle)
export function CombinedKrathongPreview({ krathongId, flowerId, className = "" }) {
  return (
    <div className={`relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 shadow-xl ${className}`}>
      <div className="absolute top-2 left-2 text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
        พรีวิวกระทง & ดอกไม้
      </div>

      {/* เปลวเทียนและธูปส่องแสง */}
      <div className="flex items-end justify-center gap-1.5 -mb-2 z-20">
        <div className="flex flex-col items-center">
          <div className="w-2.5 h-3.5 bg-gradient-to-t from-amber-500 to-yellow-200 rounded-full animate-pulse shadow-[0_0_10px_#f59e0b]" />
          <div className="w-1.5 h-4 bg-white rounded-t-sm" />
        </div>
        <div className="flex gap-0.5 items-end">
          <div className="w-0.5 h-6 bg-amber-900 rotate-[-8deg] relative">
            <span className="absolute -top-1 left-[-1px] w-1 h-1 bg-red-500 rounded-full" />
          </div>
          <div className="w-0.5 h-7 bg-amber-900 relative">
            <span className="absolute -top-1 left-[-1px] w-1 h-1 bg-red-500 rounded-full" />
          </div>
          <div className="w-0.5 h-6 bg-amber-900 rotate-[8deg] relative">
            <span className="absolute -top-1 left-[-1px] w-1 h-1 bg-red-500 rounded-full" />
          </div>
        </div>
      </div>

      {/* ดอกไม้ประดับตรงกลาง */}
      <div className="z-10 -mb-7">
        <FlowerDecorationIcon id={flowerId} className="w-14 h-14 drop-shadow-md" />
      </div>

      {/* ฐานกระทง */}
      <div className="z-0">
        <KrathongBaseIcon id={krathongId} className="w-24 h-24 drop-shadow-lg" />
      </div>
    </div>
  );
}
