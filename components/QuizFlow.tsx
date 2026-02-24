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

// ─── Cinematic Text Reveal (powered by 21st.dev TextEffect patterns) ─────
import { TextEffect } from "@/components/ui/text-effect";
import { FlipText } from "@/components/ui/flip-text";
import { LetterReveal } from "@/components/ui/letter-reveal";
const CinematicFocusTitle = ({ text }: { text: string }) => {
    return (
        <div className="w-full flex justify-center px-4">
            <TextEffect
                per="word"
                preset="blur"
                className="text-[1.75rem] leading-[1.2] sm:text-[2.25rem] md:text-[2.75rem] font-display font-medium tracking-[-0.04em] text-center text-neutral-950"
            >
                {text}
            </TextEffect>
        </div>
    );
};

// ─── Decorative Question Number ──────────────────────────────────────────
const DecorativeQuestionNumber = ({ number }: { number: number }) => {
    const display = String(number).padStart(2, "0");
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{
                opacity: 1,
                scale: 1,
                y: [0, -8, 0], // Floating animation
            }}
            transition={{
                opacity: { duration: 0.8 },
                scale: { duration: 0.8 },
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" } // Infinite float
            }}
            className="absolute top-[40%] sm:top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50%] select-none pointer-events-none -z-10"
        >
            <span className="text-[12rem] sm:text-[16rem] font-display font-bold leading-none tracking-tighter text-transparent"
                style={{ WebkitTextStroke: "1px rgba(0,0,0,0.04)" }}>
                {display}
            </span>
        </motion.div>
    );
};

// Progress bar moved to header

const QuizOptionCard = ({
    option,
    isSelected,
    onClick,
    className,
    layout = "default",
}: {
    option: Option;
    isSelected: boolean;
    onClick: () => void;
    className?: string;
    layout?: "default" | "large-image";
}) => {
    const buttonProps = {
        onClick,
        initial: "hidden",
        animate: "show",
        variants: {
            hidden: { opacity: 0, y: 15, scale: 0.98 },
            show: {
                opacity: 1, y: 0, scale: 1,
                transition: { type: "spring" as const, stiffness: 350, damping: 25 }
            }
        },
        whileHover: {
            scale: 1.01,
            y: -2,
            transition: { type: "spring" as const, stiffness: 400, damping: 25 }
        },
        whileTap: {
            scale: 0.97,
            transition: { type: "spring" as const, stiffness: 400, damping: 15 }
        },
        className: [
            "relative w-full rounded-2xl select-none touch-manipulation group outline-none"
        ].join(" ")
    };

    const floatClass = option.text.length % 3 === 0 ? "animate-option-float"
        : option.text.length % 3 === 1 ? "animate-option-float-reverse"
            : "animate-option-float-slow";

    // ─── Render LARGE IMAGE Card ─────────────────────────────────────────────
    if (layout === "large-image" && option.image) {
        const isFullWidth = className?.includes("col-span-full");
        return (
            <div className={`w-full flex justify-center ${floatClass} ${className || ""}`}>
                <motion.button
                    {...buttonProps}
                    className={`${buttonProps.className} group overflow-hidden flex flex-col items-center w-full mx-auto ${isFullWidth ? "aspect-[2/1] sm:aspect-[2.5/1]" : "aspect-[4/5] sm:aspect-[3/4]"} h-auto border-[0.5px] rounded-[28px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSelected
                        ? "border-black ring-[1.5px] ring-black bg-white/95 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] z-10"
                        : "border-black/5 hover:border-black/10 hover:shadow-[0_12px_30px_rgb(0,0,0,0.08)] bg-white/70 backdrop-blur-xl"
                        }`}
                >
                    {/* Image Area */}
                    <div className="w-full h-full relative bg-neutral-100 shrink-0 pointer-events-none overflow-hidden p-1.5 sm:p-2 rounded-[28px]">
                        <div className="relative w-full h-full rounded-[20px] sm:rounded-[24px] overflow-hidden">
                            <img
                                src={option.image}
                                alt={option.text}
                                style={{ objectPosition: option.imagePosition || "center 10%" }}
                                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out ${isSelected ? "scale-[1.05]" : "scale-100 group-hover:scale-[1.02]"}`}
                            />
                            {/* Premium Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-80" />

                            {/* Inner shadow */}
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-[20px] sm:rounded-[24px]" />
                        </div>

                        {/* Checkbox overlay on image (Top Right) */}
                        <div className="absolute top-4 right-4 shrink-0 flex items-center justify-center pointer-events-none z-10">
                            <AnimatePresence>
                                {isSelected ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.5 }}
                                        transition={{ duration: 0.2, type: "spring", stiffness: 400, damping: 25 }}
                                        className="w-[24px] h-[24px] rounded-full bg-black text-white flex items-center justify-center shadow-md"
                                    >
                                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-[24px] h-[24px] rounded-full border-[1.5px] border-white/80 bg-black/10 backdrop-blur-sm"
                                    />
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Text Area (Floating Pill Button Style) */}
                        <div className="absolute bottom-4 sm:bottom-5 left-0 w-full px-3 z-20 flex justify-center pointer-events-none">
                            <motion.div
                                className={`w-auto min-w-[110px] sm:min-w-[130px] max-w-[92%] py-2 sm:py-2.5 px-4 sm:px-5 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden relative ${isSelected
                                    ? "bg-white text-black shadow-[0_8px_25px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
                                    : "bg-white/80 text-neutral-800 shadow-sm ring-1 ring-black/[0.04]"
                                    }`}
                            >
                                <p
                                    className={`relative z-10 leading-tight text-center truncate transition-all duration-300 font-sans ${isSelected ? "font-semibold text-[13px] sm:text-[14px] tracking-[-0.01em]" : "font-medium text-[13px] sm:text-[14px] tracking-[-0.01em]"
                                        }`}
                                >
                                    {option.text}
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </motion.button>
            </div>
        );
    }

    // ─── Render NORMAL IMAGE Card (Vertical Stack Format) ───────────────────────────
    if (option.image) {
        return (
            <div className={`w-full ${floatClass} ${className || ""}`}>
                <motion.button
                    {...buttonProps}
                    className={`${buttonProps.className} overflow-hidden flex flex-row items-center justify-start w-full border-[0.5px] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSelected
                        ? "border-neutral-900/40 ring-1 ring-neutral-900/10 bg-white/95 backdrop-blur-3xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.2)]"
                        : "border-black/5 hover:border-black/10 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white/70 backdrop-blur-xl"
                        }`}
                >
                    {/* Checkbox — Left */}
                    <div className="shrink-0 flex items-center justify-center px-3.5 pointer-events-none">
                        <motion.div
                            animate={{
                                scale: isSelected ? [1, 1.15, 1] : 1,
                                backgroundColor: isSelected ? "#262626" : "#FAFAFA",
                                borderColor: isSelected ? "#262626" : "#E5E5E5"
                            }}
                            transition={{
                                scale: { duration: 0.3, ease: "easeOut" },
                                backgroundColor: { duration: 0.2 },
                                borderColor: { duration: 0.2 }
                            }}
                            className="w-[18px] h-[18px] sm:w-[22px] sm:h-[22px] rounded-full border-[1.5px] flex items-center justify-center"
                        >
                            <motion.div
                                initial={false}
                                animate={{
                                    opacity: isSelected ? 1 : 0,
                                    scale: isSelected ? 1 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                className="w-[7px] h-[7px] sm:w-[9px] sm:h-[9px] rounded-full bg-white"
                            />
                        </motion.div>
                    </div>

                    {/* Image Thumbnail */}
                    <div className="w-[56px] sm:w-[64px] h-[56px] sm:h-[64px] relative bg-neutral-100 shrink-0 pointer-events-none border-r border-neutral-100/50 overflow-hidden rounded-lg ml-1">
                        <img
                            src={option.image}
                            alt={option.text}
                            style={{ objectPosition: option.imagePosition || "center center" }}
                            className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[600ms] ease-out ${isSelected ? "scale-[1.05]" : "scale-100"}`}
                        />
                        {/* Inner shadow for premium feel */}
                        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-lg" />
                    </div>

                    {/* Text */}
                    <div className="flex-1 px-4 py-3 pointer-events-none z-10 flex items-center h-full">
                        <p
                            className={`font-medium text-[14px] sm:text-[15px] leading-snug text-left transition-colors duration-300 ${isSelected ? "text-neutral-900 font-semibold tracking-[-0.02em]" : "text-neutral-600 tracking-[-0.01em]"
                                }`}
                        >
                            {option.text}
                        </p>
                    </div>
                </motion.button>
            </div>
        );
    }

    // ─── Render TEXT Card ───────────────────────────────────────────────────
    return (
        <div className={`w-full ${floatClass} ${className || ""}`}>
            <motion.button
                {...buttonProps}
                className={`${buttonProps.className} border-[0.5px] overflow-visible p-4 sm:p-5 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSelected
                    ? "bg-white/95 backdrop-blur-3xl border-black ring-[2px] ring-black text-black shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] z-10"
                    : "bg-white/60 backdrop-blur-xl border-black/5 hover:border-black/10 text-neutral-800 hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.1)] hover:bg-white/80"
                    }`}
            >
                <div className="w-full h-full flex items-center gap-3.5 relative pointer-events-none">
                    {/* Checkbox — Left */}
                    <div className="shrink-0 flex items-center justify-center">
                        <motion.div
                            animate={{
                                scale: isSelected ? [1, 1.2, 1] : 1,
                                backgroundColor: isSelected ? "#000000" : "#FFFFFF",
                                borderColor: isSelected ? "#000000" : "#E5E5E5"
                            }}
                            transition={{
                                scale: { duration: 0.4, type: "spring", stiffness: 400, damping: 20 },
                                backgroundColor: { duration: 0.2 },
                                borderColor: { duration: 0.2 }
                            }}
                            className="w-[22px] h-[22px] sm:w-[24px] sm:h-[24px] rounded-full border-[1.5px] flex items-center justify-center ring-[3px] ring-white"
                        >
                            <motion.div
                                initial={false}
                                animate={{
                                    opacity: isSelected ? 1 : 0,
                                    scale: isSelected ? 1 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                className="w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] rounded-full bg-white"
                            />
                        </motion.div>
                    </div>

                    {/* Label */}
                    <div className="flex-1 text-center flex items-center justify-center h-full">
                        <p
                            className={`font-medium text-[15px] sm:text-[16px] leading-snug transition-colors duration-300 ${isSelected ? "font-semibold tracking-[-0.01em] text-black" : "tracking-[-0.01em] text-neutral-600 font-normal"}`}
                        >
                            {option.text}
                        </p>
                    </div>

                    {/* Color Swatches — Right */}
                    {option.colors && option.colors.length > 0 && (
                        <div className="flex items-center shrink-0">
                            <div className={`w-[1px] h-6 mr-3 transition-colors duration-300 ${isSelected ? 'bg-white/20' : 'bg-neutral-200'}`} />
                            <div className="flex items-center gap-1.5">
                                {option.colors.map((color, i) => (
                                    <motion.div
                                        key={i}
                                        initial={false}
                                        animate={{
                                            y: isSelected ? [0, -4, 0] : 0,
                                            scale: isSelected ? 1.05 : 1
                                        }}
                                        transition={{
                                            duration: 0.35,
                                            ease: "easeOut",
                                            delay: i * 0.05
                                        }}
                                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-md shadow-sm"
                                        style={{
                                            backgroundColor: color,
                                            border: `1px solid ${isSelected ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.1)'}`,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.button>
        </div>
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
    gender: { bg: "#F4F0EB", orb1: "rgba(225,215,205,0.6)", orb2: "rgba(235,225,215,0.4)" },
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
        transition: { staggerChildren: 0.06, delayChildren: 0.55 }
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
                <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#F6F4F1] to-transparent" />
                {/* Bottom vignette */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#EDEAE5] to-transparent" />
            </motion.div>

            <div className="w-full h-[100dvh] flex flex-col relative text-neutral-900 overflow-hidden font-sans z-10">
                {/* Header */}
                <header className="absolute top-0 inset-x-0 z-50">
                    <div className="flex flex-col w-full bg-transparent relative pt-4">
                        {/* Elegant Hairline Progress Bar */}
                        <div className="w-full max-w-[390px] mx-auto px-4 absolute top-0 left-1/2 -translate-x-1/2 mt-1">
                            <div className="w-full h-[4px] bg-black/5 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-black origin-left rounded-full"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: (currentQuestionIndex + 1) / (totalQuestions - 1) }}
                                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 max-w-[390px] mx-auto w-full">
                            <button
                                onClick={handleBack}
                                className="w-11 h-11 flex flex-col items-center justify-center rounded-full active:scale-90 transition-transform -ml-2"
                            >
                                <ChevronLeft className="w-6 h-6 text-neutral-800" strokeWidth={1.5} />
                            </button>

                            <div className="flex flex-col items-center justify-center">
                                {currentQuestionIndex > 0 && (
                                    <div className="font-sans text-[11px] sm:text-[12px] font-medium tracking-[0.1em] text-neutral-500 uppercase">
                                        Adım {currentQuestionIndex + 1} / {totalQuestions - 1}
                                    </div>
                                )}
                            </div>

                            <div className="w-11" />
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 flex flex-col w-full max-w-[390px] mx-auto pt-14 pb-2 h-full relative z-10 transition-all duration-500">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="flex-1 flex flex-col justify-center h-full w-full"
                        >
                            {/* Question — Compact Header */}
                            {/* Decorative Question Number */}

                            <div className={`flex flex-col items-center justify-center px-4 pb-1 shrink-0 text-center relative ${currentQuestionIndex === 0 ? "pt-0 mb-1" : "pt-4 sm:pt-6 mb-2"}`}>
                                <DecorativeQuestionNumber number={currentQuestionIndex + 1} />
                                <motion.div
                                    key={`title-wrapper-${currentQuestionIndex}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className={`w-full max-w-md mx-auto flex flex-col items-center justify-center relative z-10 ${currentQuestionIndex === 0 ? "-mt-4" : ""}`}
                                >
                                    {currentQuestionIndex === 0 ? (
                                        <div className="relative w-full max-w-[390px] mx-auto mt-0 mb-3 flex flex-col items-center justify-center">
                                            {/* Minimalist Top Anchor Label */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                                                className="mb-1.5 font-sans text-[11px] font-medium tracking-[0.15em] uppercase text-black/55"
                                            >
                                                ADIM 01 / 12
                                            </motion.div>

                                            {/* The Premium Typography Setup */}
                                            <div className="relative z-10 w-full text-center px-4 flex flex-col items-center justify-center">
                                                {/* Actual Title */}
                                                <h1 className="text-[28px] font-serif tracking-[-0.01em] leading-[1.15] text-neutral-900 drop-shadow-[0_2px_4px_rgba(0,0,0,0.03)] mb-1 font-normal">
                                                    Stil yolculuğuna<br />başlıyoruz.
                                                </h1>

                                                {/* Subtitle */}
                                                <p className="text-[14px] font-sans text-black/60 tracking-[-0.01em] font-normal mt-0 max-w-[280px]">
                                                    Sana en uygun kategoriyi seç.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <CinematicFocusTitle text={question.scenario} />
                                    )}
                                    {/* Multi-Select Badge — hide on Q1 (gender) */}
                                    {currentQuestionIndex > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 18 }}
                                            className="flex items-center justify-center mt-3 sm:mt-4"
                                        >
                                            <div className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-neutral-900/[0.06] backdrop-blur-sm border border-neutral-200/60">
                                                {/* Pulsing dot */}
                                                <span className="relative flex h-2 w-2">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-500 opacity-40"></span>
                                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-600"></span>
                                                </span>
                                                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.12em] uppercase text-neutral-600">
                                                    Birden fazla seçebilirsiniz
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Options */}
                            <div
                                className="w-full px-5 flex flex-col justify-start pb-0 relative z-0 overflow-y-auto no-scrollbar"
                            >
                                <motion.div
                                    className={`w-full pb-0 ${question.layout === "large-image" || (question.options.some(o => o.image) && question.options.length > 3)
                                        ? "grid grid-cols-2 gap-3"
                                        : question.options.some(o => o.image)
                                            ? "flex flex-col gap-3"
                                            : question.options.length > 4
                                                ? "grid grid-cols-1 md:grid-cols-2 gap-2"
                                                : "flex flex-col gap-2"
                                        }`}
                                    variants={optionsContainerVariants}
                                    initial="hidden"
                                    animate="show"
                                >
                                    {question.options.map((option, idx) => {
                                        const isGrid = question.layout === "large-image";
                                        // Specific to gender: if grid and index is 2 (3rd item, usually Unisex), span fully.
                                        const isUnisexInGender = isGrid && question.category === "gender" && idx === 2;

                                        return (
                                            <QuizOptionCard
                                                key={option.id}
                                                option={option}
                                                isSelected={currentSelections.includes(option.value)}
                                                onClick={() => handleOptionToggle(option)}
                                                className={isUnisexInGender ? "col-span-full w-full" : undefined}
                                                layout={question.layout}
                                            />
                                        );
                                    })}
                                </motion.div>
                            </div>

                            {/* Bottom area — always visible */}
                            <div className="w-full px-4 pt-3 pb-2 shrink-0">
                                <AnimatePresence mode="popLayout" initial={false}>
                                    {currentSelections.length > 0 ? (
                                        <motion.div
                                            key="confirm"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            className="w-full flex justify-center"
                                        >
                                            <motion.button
                                                onClick={handleNext}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.96 }}
                                                className="group relative w-full h-[56px] mx-auto flex items-center justify-center gap-3 rounded-full bg-black text-white font-medium text-[15px] shadow-[0_10px_25px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.3)] transition-shadow duration-300 overflow-hidden"
                                            >
                                                <span className="relative z-10 font-sans tracking-tight">{currentQuestionIndex === totalQuestions - 1 ? "Sonuçları Gör" : "Seçimi Onayla"}</span>
                                                <ArrowRight className="w-4 h-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 relative z-10" />
                                            </motion.button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="hint"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="w-full flex justify-center px-5 pb-5"
                                        >
                                            <div className="w-full h-[56px] flex items-center justify-center rounded-full bg-black/20 text-black/60 font-medium text-[15px] cursor-not-allowed">
                                                <span>Bir seçenek seç</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
}
