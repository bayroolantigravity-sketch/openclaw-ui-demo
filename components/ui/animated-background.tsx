"use client";

import { motion } from "framer-motion";
import React, { useRef, useState, useEffect } from "react";

type Variant = "default" | "quiz" | "feed";

const PALETTES: Record<Variant, string[]> = {
    default: [
        "bg-purple-300/40",
        "bg-pink-300/35",
        "bg-rose-200/30",
        "bg-violet-300/28",
        "bg-fuchsia-200/22",
    ],
    quiz: [
        "bg-pink-400/40",
        "bg-purple-300/35",
        "bg-violet-300/30",
        "bg-fuchsia-300/28",
        "bg-rose-300/25",
    ],
    feed: [
        "bg-pink-300/38",
        "bg-amber-200/30",
        "bg-rose-300/30",
        "bg-orange-200/25",
        "bg-fuchsia-200/22",
    ],
};

// Deterministic orb configs — no Math.random(), SSR safe
const ORB_CONFIGS = [
    { top: "-15%", left: "-5%", width: "65%", height: "65%", dur: 22, dx: ["0%", "6%", "-4%", "0%"], dy: ["0%", "8%", "-6%", "0%"] },
    { top: "auto", right: "-8%", bottom: "-15%", width: "70%", height: "70%", dur: 28, dx: ["0%", "-7%", "5%", "0%"], dy: ["0%", "5%", "-9%", "0%"] },
    { top: "15%", right: "5%", width: "45%", height: "45%", dur: 18, dx: ["0%", "9%", "-9%", "0%"], dy: ["0%", "-8%", "7%", "0%"] },
    { top: "55%", left: "20%", width: "40%", height: "40%", dur: 24, dx: ["0%", "-5%", "7%", "0%"], dy: ["0%", "7%", "-5%", "0%"] },
    { top: "30%", left: "-10%", width: "38%", height: "38%", dur: 32, dx: ["0%", "8%", "-6%", "0%"], dy: ["0%", "-6%", "9%", "0%"] },
];

export function AnimatedBackground({
    children,
    variant = "default",
}: {
    children?: React.ReactNode;
    variant?: Variant;
}) {
    const palette = PALETTES[variant];
    const containerRef = useRef<HTMLDivElement>(null);
    const [spot, setSpot] = useState({ x: "50%", y: "50%" });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const handleMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            setSpot({
                x: `${((e.clientX - r.left) / r.width) * 100}%`,
                y: `${((e.clientY - r.top) / r.height) * 100}%`,
            });
        };
        el.addEventListener("mousemove", handleMove);
        return () => el.removeEventListener("mousemove", handleMove);
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full min-h-screen bg-neutral-50 overflow-hidden flex flex-col"
        >
            {/* ── Layer 1: Aurora Orbs ── */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {ORB_CONFIGS.map((cfg, i) => (
                    <motion.div
                        key={i}
                        animate={{ x: cfg.dx, y: cfg.dy, scale: [1, 1.07, 0.94, 1] }}
                        transition={{ duration: cfg.dur, repeat: Infinity, ease: "linear" }}
                        className={`absolute rounded-full blur-[110px] will-change-transform ${palette[i]}`}
                        style={{
                            top: (cfg as any).top,
                            left: (cfg as any).left,
                            right: (cfg as any).right,
                            bottom: (cfg as any).bottom,
                            width: cfg.width,
                            height: cfg.height,
                        }}
                    />
                ))}
            </div>

            {/* ── Layer 2: Subtle Dot Grid ── */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.15]"
                style={{
                    backgroundImage: "radial-gradient(circle, #94a3b8 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                }}
            />

            {/* ── Layer 3: Diagonal Line Texture ── */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.04]"
                style={{
                    backgroundImage: `repeating-linear-gradient(
            -45deg,
            #9333ea 0px,
            #9333ea 1px,
            transparent 1px,
            transparent 12px
          )`,
                }}
            />

            {/* ── Layer 4: Film Grain Noise ── */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.035]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "180px 180px",
                }}
            />

            {/* ── Layer 5: Top & bottom vignette ── */}
            <div className="absolute inset-x-0 top-0 h-40 pointer-events-none z-0 bg-gradient-to-b from-white/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-0 bg-gradient-to-t from-white/40 to-transparent" />

            {/* ── Layer 6: Mouse Spotlight ── */}
            <div
                className="absolute inset-0 pointer-events-none z-0 transition-[background] duration-150"
                style={{
                    background: `radial-gradient(circle 320px at ${spot.x} ${spot.y}, rgba(236,72,153,0.10) 0%, transparent 80%)`,
                }}
            />

            {/* ── Content ── */}
            <div className="relative z-10 flex-1 w-full h-full">
                {children}
            </div>
        </div>
    );
}
