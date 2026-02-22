"use client";

import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Eye, Gift, ChevronRight } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

// ── Aurora Background (Monochrome/Editorial) ───────────────────────────────
const ORBS = [
  { top: "-12%", left: "-8%", w: "58%", h: "58%", dur: 22, color: "bg-neutral-400/10", dx: ["0%", "7%", "-5%", "0%"], dy: ["0%", "9%", "-7%", "0%"] },
  { bottom: "-18%", right: "-10%", w: "65%", h: "65%", dur: 28, color: "bg-white/5", dx: ["0%", "-8%", "5%", "0%"], dy: ["0%", "6%", "-10%", "0%"] },
  { top: "18%", right: "3%", w: "42%", h: "42%", dur: 18, color: "bg-neutral-500/10", dx: ["0%", "10%", "-9%", "0%"], dy: ["0%", "-9%", "8%", "0%"] },
  { top: "55%", left: "12%", w: "38%", h: "38%", dur: 25, color: "bg-neutral-600/5", dx: ["0%", "-6%", "8%", "0%"], dy: ["0%", "8%", "-6%", "0%"] },
  { top: "8%", left: "32%", w: "32%", h: "32%", dur: 33, color: "bg-white/10", dx: ["0%", "5%", "-7%", "0%"], dy: ["0%", "-7%", "6%", "0%"] },
];

const AuroraBackground = () => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const [spot, setSpot] = useState({ x: "50%", y: "50%" });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      const ny = (e.clientY - r.top) / r.height;
      mx.set(nx); my.set(ny);
      setSpot({ x: `${nx * 100}%`, y: `${ny * 100}%` });
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div ref={ref} className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute inset-0 bg-neutral-950" />
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          animate={{ x: orb.dx, y: orb.dy, scale: [1, 1.08, 0.93, 1] }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: "linear" }}
          className={`absolute rounded-full blur-[130px] will-change-transform mix-blend-screen ${orb.color}`}
          style={{ top: (orb as any).top, left: (orb as any).left, right: (orb as any).right, bottom: (orb as any).bottom, width: orb.w, height: orb.h }}
        />
      ))}
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "repeating-linear-gradient(-45deg,#ffffff 0px,#ffffff 1px,transparent 1px,transparent 16px)" }} />
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "160px 160px" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 80% 80% at center, transparent 30%, rgba(0,0,0,0.85) 100%)" }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(circle 350px at ${spot.x} ${spot.y}, rgba(255,255,255,0.05) 0%, transparent 75%)` }} />
    </div>
  );
};

// ── Magnetic Button ───────────────────────────────────────────────────────────
const MagneticItem = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    setPos({ x: (e.clientX - (left + width / 2)) * 0.22, y: (e.clientY - (top + height / 2)) * 0.22 });
  };
  return (
    <motion.div ref={ref} onMouseMove={handleMouse} onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={className}>
      {children}
    </motion.div>
  );
};

// ── Line-by-line text reveal ──────────────────────────────────────────────────
const LineReveal = ({ lines, className = "", delay = 0 }: { lines: string[]; className?: string; delay?: number }) => (
  <span className={`flex flex-col ${className}`}>
    {lines.map((line, i) => (
      <span key={i} className="overflow-hidden block pb-5 pt-3 -mb-5 -mt-3">
        <motion.span
          initial={{ y: "100%", opacity: 0, rotate: 2 }}
          animate={{ y: "0%", opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 22, delay: delay + i * 0.12 }}
          className="block origin-bottom-left"
        >
          {line}
        </motion.span>
      </span>
    ))}
  </span>
);

// ── Marquee Band ─────────────────────────────────────────────────────────────
const MARQUEE_TEXT = ["GÜNLÜK 5 PARÇA", "KİŞİSEL STİL ANALİZİ", "AI DESTEKLI", "ÜCRETSİZ", "MOBİL UYUMLU", "MARKA BAĞIMSIZ"];
const MarqueeBand = () => {
  const repeated = [...MARQUEE_TEXT, ...MARQUEE_TEXT, ...MARQUEE_TEXT, ...MARQUEE_TEXT];
  return (
    <div className="w-full py-3 border-y border-white/10 overflow-hidden relative">
      <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-neutral-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-neutral-950 to-transparent z-10 pointer-events-none" />
      <div className="flex animate-marquee whitespace-nowrap">
        {repeated.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-3 mx-6">
            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-neutral-400 uppercase font-mono">
              {t}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};

// ── Product Preview Stack ─────────────────────────────────────────────────────
const MOCK_PREVIEWS = [
  { brand: "ACNE STUDIOS", name: "Oversized Blazer", price: "₺4.290", color: "from-neutral-900 to-black", accent: "#ffffff" },
  { brand: "TOTÊME", name: "Silk Wrap Dress", price: "₺3.150", color: "from-neutral-800 to-neutral-950", accent: "#cccccc" },
  { brand: "COS", name: "Relaxed Trousers", price: "₺1.890", color: "from-zinc-900 to-black", accent: "#aaaaaa" },
];

const ProductStack = () => {
  const [hovered, setHovered] = useState<number | null>(null);
  return (
    <div className="relative w-full max-w-[220px] sm:max-w-[260px] h-[320px] sm:h-[380px] mx-auto">
      {MOCK_PREVIEWS.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 40, rotate: (i - 1) * 6 }}
          animate={{
            opacity: 1,
            y: i * -18,
            rotate: hovered === i ? 0 : (i - 1) * 6,
            scale: hovered === i ? 1.06 : 1 - i * 0.03,
            zIndex: hovered === i ? 30 : 10 - i,
          }}
          transition={{ type: "spring", stiffness: 220, damping: 20, delay: 0.6 + i * 0.12 }}
          onHoverStart={() => setHovered(i)}
          onHoverEnd={() => setHovered(null)}
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${item.color} shadow-2xl p-5 flex flex-col justify-between cursor-pointer border border-white/10`}
          style={{ bottom: i * 12 }}
        >
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-black tracking-[0.2em] text-white/60 uppercase font-mono">{item.brand}</span>
            <div className="w-6 h-6 rounded-full" style={{ background: item.accent, boxShadow: `0 0 14px ${item.accent}80` }} />
          </div>
          <div>
            <p className="font-display text-white font-bold text-xl leading-tight mb-1">{item.name}</p>
            <p className="text-white/60 text-sm font-mono">{item.price}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ── How It Works ──────────────────────────────────────────────────────────────
const STEPS = [
  { num: "01", icon: <Zap className="w-6 h-6" />, title: "Quizi Tamamla", desc: "13 kısa soru, 2 dakika. Tarzını, renklerini ve estetiğini belirle.", accent: "text-white", glow: "rgba(255,255,255,0.08)" },
  { num: "02", icon: <Eye className="w-6 h-6" />, title: "Profilini Oluştur", desc: "Yapay zeka cevaplarını analiz ederek benzersiz stil kimliğini çıkarır.", accent: "text-neutral-300", glow: "rgba(200,200,200,0.06)" },
  { num: "03", icon: <Gift className="w-6 h-6" />, title: "Her Gün 5 Parça", desc: "Sabah uyandığında sana özel hazırlanmış 5 moda önerisi seni bekliyor.", accent: "text-neutral-400", glow: "rgba(150,150,150,0.04)" },
];

const StepCard = ({ step, index }: { step: typeof STEPS[0]; index: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 18 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || window.innerWidth < 768) return;
    const r = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - r.left) / r.width - 0.5;
    const yPct = (e.clientY - r.top) / r.height - 0.5;
    mx.set(xPct); my.set(yPct);
    rx.set(yPct * 12); ry.set(-xPct * 12);
  };
  const onMouseLeave = () => { mx.set(0); my.set(0); rx.set(0); ry.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ type: "spring", stiffness: 220, damping: 22, delay: index * 0.12 }}
      className="relative rounded-3xl border border-white/8 p-6 sm:p-8 flex flex-col gap-4 cursor-default"
      style={{
        rotateX: rx,
        rotateY: ry,
        transformStyle: "preserve-3d" as const,
        background: `radial-gradient(ellipse at top left, ${step.glow}, transparent 60%), rgba(255,255,255,0.03)`,
        boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 24px 48px rgba(0,0,0,0.3)`,
      } as any}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-2xl bg-white/5 ${step.accent}`}>{step.icon}</div>
        <span className={`font-mono text-5xl font-black opacity-15 ${step.accent}`}>{step.num}</span>
      </div>
      <div>
        <h3 className="text-white font-bold text-xl mb-2 font-display">{step.title}</h3>
        <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-[2px] rounded-b-3xl bg-gradient-to-r from-transparent via-current to-transparent opacity-30 ${step.accent}`} />
    </motion.div>
  );
};

// ── Social Proof Chips ────────────────────────────────────────────────────────
const CHIPS = [
  { text: "Zeynep tarzını keşfetti 🔥", delay: 0.2, x: "8%", y: "12%" },
  { text: "+3.2k kişi bu ay katıldı", delay: 0.5, x: "62%", y: "8%" },
  { text: "Mehmet ilk seçimini beğendi ❤️", delay: 0.8, x: "5%", y: "72%" },
  { text: "%91 eşleşme oranı ✨", delay: 1.1, x: "65%", y: "78%" },
];

const SocialProofChips = () => (
  <div className="relative w-full h-40 sm:h-48 overflow-hidden pointer-events-none">
    {CHIPS.map((chip, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, scale: 0.7, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        animate={{ y: [0, -6, 0] }}
        transition={{
          opacity: { delay: chip.delay, duration: 0.5 },
          scale: { delay: chip.delay, type: "spring", stiffness: 300 },
          y: { delay: chip.delay + 0.5, duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }
        }}
        className="absolute inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/8 backdrop-blur-md border border-white/12 shadow-lg"
        style={{ left: chip.x, top: chip.y }}
      >
        <span className="text-xs font-semibold text-white whitespace-nowrap">{chip.text}</span>
      </motion.div>
    ))}
  </div>
);

// ── Stats Bar ─────────────────────────────────────────────────────────────────
const STATS = [
  { value: "3.2k+", label: "Aktif Kullanıcı" },
  { value: "91%", label: "Eşleşme Oranı" },
  { value: "5 / Gün", label: "Özel Parça" },
  { value: "2 dk", label: "Quiz Süresi" },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <div className="flex flex-col w-full min-h-[100dvh] text-white relative overflow-x-hidden bg-neutral-950 font-sans">
      <AuroraBackground />

      {/* ── HERO ── */}
      <section className="relative z-10 min-h-[100dvh] flex flex-col">

        {/* Navbar */}
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center justify-between px-6 sm:px-10 lg:px-16 h-16 sm:h-20 border-b border-white/5 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-display font-bold text-lg tracking-tight">Daily 5</span>
          </div>

          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </div>
            <span className="text-[11px] font-mono font-bold text-neutral-400 tracking-wider">CANLI</span>
          </div>

          <MagneticItem>
            <Link href="/quiz">
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                className="flex items-center gap-1.5 px-5 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-white text-sm font-semibold tracking-wide shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:bg-white hover:text-black transition-colors"
              >
                Başla <ChevronRight className="w-4 h-4" />
              </motion.button>
            </Link>
          </MagneticItem>
        </motion.nav>

        {/* Hero Content */}
        <div className="flex-1 flex flex-col lg:flex-row items-center lg:gap-0 px-6 sm:px-10 lg:px-16 pt-6 pb-6 lg:pt-0 max-w-7xl mx-auto w-full">

          {/* Left: Text */}
          <div className="flex-1 flex flex-col gap-5 sm:gap-8 text-center lg:text-left items-center lg:items-start">

            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] font-mono font-bold text-neutral-300 tracking-[0.2em] uppercase">AI Destekli Stil Motoru</span>
            </motion.div>

            {/* Main heading */}
            <h1 className="text-6xl sm:text-7xl lg:text-[8.5rem] font-display font-bold leading-[0.85] tracking-tighter mix-blend-difference z-20">
              <LineReveal
                lines={["Kendi"]}
                className="text-white whitespace-nowrap"
                delay={0.1}
              />
              <LineReveal
                lines={["Tarzını"]}
                className="text-white whitespace-nowrap"
                delay={0.25}
              />
              <LineReveal
                lines={["Keşfet."]}
                delay={0.4}
                className="text-neutral-500 italic font-medium pr-4 whitespace-nowrap"
              />
            </h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-neutral-400 text-lg sm:text-2xl leading-[1.4] max-w-lg font-medium mt-4 lg:mt-8"
            >
              13 kısa soruyla gerçek stil kimliğini ortaya çıkar. <br className="hidden lg:block" />
              Her sabah sana özel <span className="text-white font-bold">5 yeni parça</span> seni bekliyor.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 260, damping: 22 }}
              className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
            >
              <MagneticItem className="w-full sm:w-auto">
                <Link href="/quiz" className="block w-full sm:w-auto">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative w-full sm:w-auto overflow-hidden px-10 py-5 rounded-full bg-white text-neutral-950 font-bold text-sm tracking-widest uppercase shadow-[0_0_50px_rgba(255,255,255,0.15)] flex items-center justify-center gap-3 group"
                  >
                    <div className="absolute inset-0 bg-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="relative z-10">Analize Başla</span>
                    <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300 ease-out" />
                  </motion.button>
                </Link>
              </MagneticItem>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="text-xs text-neutral-600 font-medium"
              >
                Ücretsiz · Kayıt gerektirmez
              </motion.span>
            </motion.div>
          </div>

          {/* Right: Product Stack — hidden on mobile, shown on desktop */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 180, damping: 22 }}
            className="hidden lg:flex flex-shrink-0 items-center justify-end w-auto"
          >
            <ProductStack />
          </motion.div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="relative z-10">
        <MarqueeBand />
      </div>

      {/* ── STATS ── */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ type: "spring", stiffness: 200, damping: 24, delay: i * 0.12 }}
              className="text-center p-6 rounded-[2rem] bg-white/[0.02] border border-white/[0.04] backdrop-blur-sm"
            >
              <p className="font-display text-3xl sm:text-4xl font-black text-white mb-1">{stat.value}</p>
              <p className="text-xs text-neutral-500 font-semibold uppercase tracking-widest">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="relative z-10 overflow-hidden">
        <SocialProofChips />
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, scale: 0.9, filter: "blur(4px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-[10px] font-mono font-bold tracking-[0.3em] text-neutral-400 uppercase mb-4"
            >
              Nasıl Çalışır?
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-5xl sm:text-6xl lg:text-[5rem] font-bold text-white tracking-tighter leading-none"
            >
              3 Adımda Stilini Bul
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6" style={{ perspective: "1200px" }}>
            {STEPS.map((step, i) => <StepCard key={i} step={step} index={i} />)}
          </div>
        </div>
      </section>

      {/* ── BIG CTA ── */}
      <section className="relative z-10 px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          className="relative max-w-3xl mx-auto rounded-[2.5rem] overflow-hidden p-10 sm:p-16 text-center border border-white/10"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.6)",
            backdropFilter: "blur(20px)"
          }}
        >
          {/* Sweeping shimmer */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", repeatDelay: 3 }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)", transform: "skewX(-20deg)" }}
          />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/5 rounded-full blur-[80px] pointer-events-none" />

          <motion.div
            animate={{ rotate: [0, 8, -8, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="inline-block mb-6"
          >
            <Sparkles className="w-10 h-10 text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
          </motion.div>

          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
            Hâlâ Bekliyorsun?
          </h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-md mx-auto font-medium leading-relaxed">
            2 dakikada tarzını keşfet. Yarın sabah ilk öneri seni bekliyor olsun.
          </p>

          <MagneticItem className="inline-block">
            <Link href="/quiz">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-white text-black font-semibold text-sm tracking-widest uppercase shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              >
                <span>Şimdi Başla</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
          </MagneticItem>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 border-t border-white/5 px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="font-display font-medium text-white tracking-tight">Daily 5</span>
        </div>
        <p className="text-xs font-mono text-neutral-600 tracking-widest uppercase">
          © 2026 · AI Destekli Stil Motoru
        </p>
        <a href="/quiz" className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors font-medium">
          Hemen Başla →
        </a>
      </motion.footer>
    </div>
  );
}
