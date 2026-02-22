"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
    initialQuestion, maleQuestions, femaleQuestions, unisexQuestions,
    Option, FashionCategory, Question
} from "@/lib/questions";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ArrowRight, Loader2, Check } from "lucide-react";
import { Confetti } from "@/components/ui/confetti";

// ─── Cinematic Text Reveal (21st.dev style) ───────────────────────────────
const CinematicTextReveal = ({ text }: { text: string }) => {
    const words = text.split(" ");
    // Find the most important word (longest or last) to highlight
    const highlightIdx = words.reduce((best, w, i) => w.length > words[best].length ? i : best, words.length - 1);

    return (
        <h3 className="text-[1.4rem] leading-[1.1] sm:text-[1.75rem] md:text-[2.1rem] font-display tracking-[-0.03em] flex flex-wrap justify-center items-center gap-x-[0.25em] gap-y-0.5 text-center text-neutral-950 px-1">
            {words.map((word, i) => {
                const isHighlight = i === highlightIdx;
                return (
                    <span className="inline-block overflow-hidden pb-2 pt-0.5 -mb-2 -mt-0.5" key={i}>
                        <motion.span
                            initial={{ opacity: 0, y: "100%", filter: "blur(8px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            transition={{
                                delay: i * 0.04 + 0.08,
                                duration: 0.8,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className={`inline-block origin-bottom-left ${isHighlight
                                    ? "font-semibold bg-gradient-to-r from-neutral-900 via-neutral-700 to-neutral-500 bg-clip-text text-transparent"
                                    : i === words.length - 1 && i !== highlightIdx
                                        ? "font-light italic text-neutral-400"
                                        : "font-medium"
                                }`}
                        >
                            {word}
                        </motion.span>
                    </span>
                );
            })}
        </h3>
    );
};

const QuizOptionCard = ({
    option,
    isSelected,
    onClick,
    className,
}: {
    option: Option;
    isSelected: boolean;
    onClick: () => void;
    className?: string;
}) => {
    const ref = useRef<HTMLButtonElement>(null);
    const mx = useMotionValue(0);
    const my = useMotionValue(0);

    const rx = useTransform(useSpring(my, { stiffness: 120, damping: 18 }), [-0.5, 0.5], ["4deg", "-4deg"]);
    const ry = useTransform(useSpring(mx, { stiffness: 120, damping: 18 }), [-0.5, 0.5], ["-4deg", "4deg"]);

    const onMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        if (!ref.current || window.innerWidth < 768) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
    }, [mx, my]);

    const onMouseLeave = useCallback(() => {
        mx.set(0);
        my.set(0);
    }, [mx, my]);

    const buttonProps = {
        ref,
        onClick,
        onMouseMove,
        onMouseLeave,
        style: {
            rotateX: rx,
            rotateY: ry,
            transformStyle: "preserve-3d" as const,
            scale: isSelected ? 1.02 : 1,
        },
        variants: {
            hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
            show: {
                opacity: 1, y: 0, filter: "blur(0px)",
                transition: { type: "spring" as const, stiffness: 320, damping: 26 }
            }
        },
        whileTap: { scale: 0.96 },
        transition: { type: "spring" as const, stiffness: 280, damping: 22 },
        className: [
            "relative w-full rounded-2xl select-none touch-manipulation group",
            className || ""
        ].join(" ")
    };

    // ─── Render IMAGE Card ──────────────────────────────────────────────────
    if (option.image) {
        return (
            <motion.button
                {...buttonProps}
                className={`${buttonProps.className} overflow-hidden flex flex-col items-center justify-start h-full border transition-colors duration-500 ${isSelected ? "border-neutral-900 ring-1 ring-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-300 bg-white"
                    }`}
            >
                {/* Image Container */}
                <div className="w-full h-[80px] sm:h-[100px] md:h-[120px] relative bg-neutral-100 shrink-0 pointer-events-none border-b border-neutral-100 overflow-hidden">
                    <img
                        src={option.image}
                        alt={option.text}
                        className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] ${isSelected ? "scale-[1.03] filter-none" : "scale-100 brightness-[0.96] contrast-[0.95]"
                            }`}
                    />

                    {/* Checkbox overlay */}
                    <div className="absolute top-3 right-3 z-20 pointer-events-none">
                        <div
                            style={{ transition: "all 0.4s cubic-bezier(0.19, 1, 0.22, 1)" }}
                            className={[
                                "w-5 h-5 rounded-full border-[1px] flex items-center justify-center backdrop-blur-md shadow-sm",
                                isSelected
                                    ? "bg-neutral-900 border-neutral-900 scale-100"
                                    : "bg-white/20 border-white/60",
                            ].join(" ")}
                        >
                            <div
                                className="w-2 h-2 rounded-full bg-white"
                                style={{
                                    opacity: isSelected ? 1 : 0,
                                    transform: isSelected ? "scale(1)" : "scale(0.5)",
                                    transition: "all 0.4s cubic-bezier(0.19,1,0.22,1)",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Text Container */}
                <div className="w-full p-2 sm:p-2.5 flex items-center justify-center pointer-events-none h-full z-10">
                    <p
                        className={`font-medium text-[10px] sm:text-xs text-center uppercase tracking-widest leading-snug break-words ${isSelected ? "text-neutral-900" : "text-neutral-500"
                            }`}
                        style={{ transition: "color 0.4s ease" }}
                    >
                        {option.text}
                    </p>
                </div>
            </motion.button>
        );
    }

    // ─── Render TEXT Card ───────────────────────────────────────────────────
    return (
        <motion.button
            {...buttonProps}
            className={`${buttonProps.className} border overflow-visible p-3 sm:p-4 transition-all duration-400 ease-[cubic-bezier(0.19,1,0.22,1)] ${isSelected ? "bg-neutral-900 border-neutral-900 text-white" : "bg-white border-neutral-200 hover:border-neutral-300 text-neutral-900"
                }`}
        >
            <div
                style={{ transform: "translateZ(10px)", transformStyle: "preserve-3d" }}
                className="w-full h-full flex items-center justify-between relative pointer-events-none"
            >
                {/* Label */}
                <div className="flex-1 text-left pr-4">
                    <p
                        className="font-medium text-sm sm:text-base leading-tight tracking-tight"
                    >
                        {option.text}
                    </p>
                </div>

                {/* Color Swatches */}
                {option.colors && option.colors.length > 0 && (
                    <div className="flex items-center shrink-0 mr-3">
                        <div className="flex items-center gap-1.5">
                            {option.colors.map((color, i) => (
                                <div
                                    key={i}
                                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-[5px] shadow-sm"
                                    style={{
                                        backgroundColor: color,
                                        border: `1px solid ${isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)'}`,
                                        transition: "border 0.4s ease",
                                    }}
                                />
                            ))}
                        </div>
                        <div className={`w-[1px] h-5 ml-3 ${isSelected ? 'bg-neutral-600' : 'bg-neutral-200'}`} style={{ transition: "background 0.4s ease" }} />
                    </div>
                )}

                {/* Checkbox */}
                <div
                    style={{ transition: "all 0.4s cubic-bezier(0.19, 1, 0.22, 1)" }}
                    className={[
                        "shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[1px] flex items-center justify-center",
                        isSelected
                            ? "border-neutral-600 bg-neutral-800"
                            : "border-neutral-300 bg-neutral-50",
                    ].join(" ")}
                >
                    <div
                        className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white"
                        style={{
                            opacity: isSelected ? 1 : 0,
                            transform: isSelected ? "scale(1)" : "scale(0.5)",
                            transition: "all 0.4s cubic-bezier(0.19,1,0.22,1)",
                        }}
                    />
                </div>
            </div>
        </motion.button>
    );
};

// ─── QuizFlow ─────────────────────────────────────────────────────────────────
const CATEGORY_TR: Record<string, string> = {
    gender: "BAŞLANGIÇ / PROFİL",
    era: "DÖNEM & AKIM",
    style: "GENEL TARZ",
    color: "RENK PALETİ",
    top_fit: "ÜST GİYİM",
    bottom_fit: "ALT GİYİM",
    outerwear: "DIŞ GİYİM",
    shoes: "AYAKKABI",
    accessories: "AKSESUAR",
    signature_piece: "İMZA PARÇA",
    budget: "BÜTÇE & FİYAT",
    brand_affinity: "MODA YAKLAŞIMI",
    core_identity: "KİMLİK & DURUŞ",
    one_piece: "TEK PARÇA",
    formal_wear: "KLASİK GİYİM",
};

// ─── Category Icons (Attention Anchors) ──────────────────────────────────────
const CATEGORY_ICONS: Record<string, string> = {
    gender: "👤",
    era: "🕰️",
    style: "✨",
    color: "🎨",
    top_fit: "👕",
    bottom_fit: "👖",
    outerwear: "🧥",
    shoes: "👟",
    accessories: "💎",
    signature_piece: "💎",
    budget: "💰",
    brand_affinity: "🏷️",
    core_identity: "🪞",
    one_piece: "👗",
    formal_wear: "🤵",
};

// ─── Category-Based Gradient Backgrounds ─────────────────────────────────────
const CATEGORY_GRADIENTS: Record<string, { bg: string; orb1: string; orb2: string }> = {
    gender: { bg: "#FDF6F0", orb1: "rgba(245,222,200,0.5)", orb2: "rgba(230,210,190,0.35)" },
    era: { bg: "#FAF5F0", orb1: "rgba(210,180,140,0.4)", orb2: "rgba(190,160,120,0.3)" },
    style: { bg: "#FBF5FA", orb1: "rgba(230,180,220,0.45)", orb2: "rgba(200,170,230,0.35)" },
    color: { bg: "#FFF9F5", orb1: "rgba(255,120,100,0.3)", orb2: "rgba(100,200,180,0.3)" },
    top_fit: { bg: "#F5F7FA", orb1: "rgba(180,200,220,0.4)", orb2: "rgba(200,210,230,0.3)" },
    bottom_fit: { bg: "#F5F7FA", orb1: "rgba(170,190,215,0.4)", orb2: "rgba(195,205,225,0.3)" },
    outerwear: { bg: "#F3F5F8", orb1: "rgba(150,175,210,0.45)", orb2: "rgba(130,150,180,0.3)" },
    shoes: { bg: "#FAF6F2", orb1: "rgba(180,140,100,0.4)", orb2: "rgba(210,185,160,0.35)" },
    accessories: { bg: "#FBF8F0", orb1: "rgba(220,200,140,0.45)", orb2: "rgba(200,180,120,0.3)" },
    signature_piece: { bg: "#FBF8F0", orb1: "rgba(220,195,130,0.45)", orb2: "rgba(210,185,140,0.35)" },
    budget: { bg: "#F2FAF5", orb1: "rgba(130,210,170,0.4)", orb2: "rgba(150,220,180,0.3)" },
    brand_affinity: { bg: "#F5F2FA", orb1: "rgba(140,100,180,0.4)", orb2: "rgba(120,80,160,0.3)" },
    core_identity: { bg: "#F2F4FA", orb1: "rgba(100,120,180,0.4)", orb2: "rgba(80,100,160,0.3)" },
    one_piece: { bg: "#FBF5FA", orb1: "rgba(220,170,210,0.4)", orb2: "rgba(200,160,190,0.3)" },
    formal_wear: { bg: "#F4F4F6", orb1: "rgba(160,160,170,0.4)", orb2: "rgba(140,140,155,0.3)" },
};

const optionsContainerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.55 }
    }
};

export default function QuizFlow() {
    const router = useRouter();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [activeBranch, setActiveBranch] = useState<Question[] | null>(null);
    const [answers, setAnswers] = useState<Record<FashionCategory, string[]>>({} as never);
    const [isFinished, setIsFinished] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isInitialStep = currentQuestionIndex === 0;
    const question = isInitialStep
        ? initialQuestion
        : (activeBranch?.[currentQuestionIndex - 1] as Question);

    const totalQuestions = 1 + (activeBranch ? activeBranch.length : 12);
    const progressPct = (currentQuestionIndex / totalQuestions) * 100;
    const currentSelections = answers[question?.category] || [];

    const handleOptionToggle = useCallback((option: Option) => {
        setAnswers(prev => {
            const cat = prev[question.category] || [];
            if (question.category === "gender") {
                return { ...prev, [question.category]: [option.value] };
            }
            return {
                ...prev,
                [question.category]: cat.includes(option.value)
                    ? cat.filter(v => v !== option.value)
                    : [...cat, option.value],
            };
        });
    }, [question]);

    const handleNext = useCallback(() => {
        if (!currentSelections.length) return;
        if (isInitialStep) {
            const g = currentSelections[0];
            setActiveBranch(g === "male" ? maleQuestions : g === "female" ? femaleQuestions : unisexQuestions);
            setCurrentQuestionIndex(1);
            return;
        }
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(p => p + 1);
        } else {
            setIsFinished(true);
        }
    }, [currentSelections, isInitialStep, currentQuestionIndex, totalQuestions]);

    const handleBack = useCallback(() => {
        if (currentQuestionIndex > 0) {
            if (currentQuestionIndex === 1) setActiveBranch(null);
            setCurrentQuestionIndex(p => p - 1);
        } else {
            router.push("/");
        }
    }, [currentQuestionIndex, router]);

    const submitPreferences = async () => {
        setIsSubmitting(true);
        try {
            await fetch("/api/user/preferences", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(answers),
            });
        } catch (e) {
            console.error("Failed to save preferences", e);
        } finally {
            router.push("/feed");
        }
    };

    // ── Finished state ──
    if (isFinished) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="flex flex-col items-center justify-center min-h-[100dvh] w-full text-center p-6 space-y-8 relative overflow-hidden bg-neutral-50"
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300/30 rounded-full blur-[90px] pointer-events-none" />

                <motion.div
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 26 }}
                    className="z-10 flex flex-col items-center space-y-6"
                >
                    <Confetti
                        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none z-50"
                        globalOptions={{ resize: true, useWorker: true }}
                    />

                    <h2 className="text-4xl sm:text-5xl font-display font-medium text-neutral-900 tracking-[-0.03em] leading-none mb-1">
                        Profilin Hazır
                    </h2>
                    <p className="text-base text-neutral-500 max-w-sm px-4 leading-relaxed mt-2">
                        Tarzını analiz ettik. Editöryel seçimlerin hazırlandı.
                    </p>
                </motion.div>

                <motion.button
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 26 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={submitPreferences}
                    disabled={isSubmitting}
                    className="relative w-full max-w-xs overflow-hidden px-8 py-5 bg-neutral-900 text-white rounded-full font-medium tracking-wide text-sm uppercase shadow-xl disabled:opacity-70 z-10"
                >
                    <span className="flex items-center justify-center space-x-2">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Vitrin Hazırlanıyor...</span>
                            </>
                        ) : (
                            <>
                                <span>Önerileri Keşfet</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </span>
                </motion.button>
            </motion.div>
        );
    }

    // ── Gradient for current category ──
    const gradient = CATEGORY_GRADIENTS[question.category] || CATEGORY_GRADIENTS.gender;

    // ── Quiz state ──
    return (
        <div className="w-full h-[100dvh] flex flex-col relative text-neutral-900 overflow-hidden font-sans">
            {/* ── Animated Gradient Background ── */}
            <motion.div
                className="absolute inset-0 z-0"
                animate={{ backgroundColor: gradient.bg }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            >
                {/* Orb 1 — top left */}
                <motion.div
                    className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full blur-[120px] will-change-transform"
                    animate={{
                        backgroundColor: gradient.orb1,
                        x: ["0%", "5%", "-3%", "0%"],
                        y: ["0%", "6%", "-4%", "0%"],
                    }}
                    transition={{
                        backgroundColor: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
                        x: { duration: 20, repeat: Infinity, ease: "linear" },
                        y: { duration: 24, repeat: Infinity, ease: "linear" },
                    }}
                />
                {/* Orb 2 — bottom right */}
                <motion.div
                    className="absolute -bottom-[20%] -right-[10%] w-[65%] h-[65%] rounded-full blur-[120px] will-change-transform"
                    animate={{
                        backgroundColor: gradient.orb2,
                        x: ["0%", "-6%", "4%", "0%"],
                        y: ["0%", "-5%", "7%", "0%"],
                    }}
                    transition={{
                        backgroundColor: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
                        x: { duration: 26, repeat: Infinity, ease: "linear" },
                        y: { duration: 22, repeat: Infinity, ease: "linear" },
                    }}
                />
                {/* Noise texture overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "repeat",
                        backgroundSize: "180px 180px",
                    }}
                />
                {/* Top vignette */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/40 to-transparent" />
                {/* Bottom vignette */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white/30 to-transparent" />
            </motion.div>

            <div className="w-full h-[100dvh] flex flex-col relative text-neutral-900 overflow-hidden font-sans z-10">
                {/* Header */}
                <header className="absolute top-0 inset-x-0 z-50">
                    <div className="flex items-center justify-between px-4 sm:px-6 h-16 max-w-lg mx-auto w-full backdrop-blur-md bg-white/50 border-b border-black/5">
                        <button
                            onClick={handleBack}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-neutral-200 text-neutral-600 active:scale-90 transition-transform"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs">{CATEGORY_ICONS[question.category] || ""}</span>
                                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400`}>
                                    {CATEGORY_TR[question.category] || question.category}
                                </span>
                            </div>
                            <div className="font-medium text-neutral-400 text-xs mt-0.5">
                                <span className="text-neutral-900">{currentQuestionIndex + 1}</span> / {totalQuestions}
                            </div>
                        </div>

                        <div className="w-10" />
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-[1px] bg-neutral-200">
                        <motion.div
                            className="h-full bg-neutral-900"
                            animate={{ width: `${progressPct}%` }}
                            transition={{ type: "spring", stiffness: 90, damping: 18 }}
                        />
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 flex flex-col w-full max-w-lg mx-auto pt-16 pb-28 h-full relative z-10">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                            className="flex-1 flex flex-col h-full w-full"
                        >
                            {/* Question — Glassmorphism focal container */}
                            <div className="px-4 pt-2 sm:pt-3 pb-2 sm:pb-3 shrink-0 flex flex-col items-center justify-center text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                    className="w-full max-w-md mx-auto px-5 py-4 sm:py-5 rounded-2xl backdrop-blur-sm bg-white/50 border border-white/70 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)]"
                                >
                                    <CinematicTextReveal text={question.scenario} />
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.7 }}
                                        transition={{ delay: 0.4, duration: 0.6 }}
                                        className="flex items-center gap-2 mt-2 sm:mt-3"
                                    >
                                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-neutral-300"></div>
                                        <p className="text-neutral-400 text-[7px] sm:text-[8px] font-semibold tracking-[0.25em] uppercase">
                                            Birden Fazla Seçim
                                        </p>
                                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-neutral-300"></div>
                                    </motion.div>
                                </motion.div>
                            </div>

                            {/* Options */}
                            <div
                                className="flex-1 w-full px-5 flex flex-col justify-start mt-1 pb-2 relative z-0 overflow-y-auto no-scrollbar"
                                style={{ perspective: "1000px" }}
                            >
                                <motion.div
                                    className={`w-full pb-4 ${question.options.some(o => o.image) ? "grid grid-cols-2 gap-2 sm:gap-3" : "flex flex-col gap-2"}`}
                                    variants={optionsContainerVariants}
                                    initial="hidden"
                                    animate="show"
                                >
                                    {question.options.map((option, idx) => {
                                        const totalOpts = question.options.length;
                                        const hasImages = question.options.some(o => o.image);
                                        const isLastAndOdd = hasImages && totalOpts % 2 !== 0 && idx === totalOpts - 1;

                                        return (
                                            <QuizOptionCard
                                                key={option.id}
                                                option={option}
                                                isSelected={currentSelections.includes(option.value)}
                                                onClick={() => handleOptionToggle(option)}
                                                className={isLastAndOdd ? "col-span-full" : undefined}
                                            />
                                        );
                                    })}
                                </motion.div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>

                {/* Next button */}
                <AnimatePresence>
                    {currentSelections.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 40 }}
                            transition={{ type: "spring", stiffness: 300, damping: 26 }}
                            className="absolute bottom-6 inset-x-0 flex justify-center z-50 px-6 max-w-lg mx-auto"
                        >
                            <motion.button
                                onClick={handleNext}
                                whileTap={{ scale: 0.96 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className="w-full max-w-sm mx-auto flex items-center justify-center gap-3 py-4 sm:py-5 rounded-full bg-neutral-900 text-white font-medium text-sm tracking-widest uppercase shadow-2xl"
                            >
                                <span>{currentQuestionIndex === totalQuestions - 1 ? "Sonuçları Gör" : "Seçimi Onayla"}</span>
                                <ArrowRight className="w-4 h-4" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
