"use client";

import React, { useRef, useState, useEffect } from "react";

type Variant = "default" | "quiz" | "feed";

// Fashion-friendly pastel palettes
const PALETTES: Record<Variant, string[]> = {
    default: [
        "rgba(245, 210, 220, 0.5)",  // Soft blush pink
        "rgba(220, 200, 240, 0.45)", // Lavender
        "rgba(200, 225, 245, 0.4)",  // Baby blue
        "rgba(250, 230, 200, 0.35)", // Warm champagne
        "rgba(230, 215, 235, 0.3)",  // Mauve
    ],
    quiz: [
        "rgba(245, 200, 215, 0.5)",  // Rose petals
        "rgba(215, 195, 240, 0.45)", // Soft violet
        "rgba(195, 220, 245, 0.4)",  // Sky wash
        "rgba(248, 225, 195, 0.35)", // Golden sand
        "rgba(225, 210, 230, 0.3)",  // Dusty lilac
    ],
    feed: [
        "rgba(248, 215, 210, 0.45)", // Peach
        "rgba(240, 225, 200, 0.4)",  // Cream
        "rgba(210, 225, 240, 0.35)", // Powder blue
        "rgba(245, 210, 195, 0.3)",  // Salmon blush
        "rgba(220, 215, 240, 0.28)", // Light periwinkle
    ],
};

const BG_GRADIENTS: Record<Variant, [string, string]> = {
    default: ["rgb(252, 247, 250)", "rgb(245, 240, 248)"],
    quiz: ["rgb(253, 248, 251)", "rgb(246, 241, 249)"],
    feed: ["rgb(252, 249, 246)", "rgb(248, 244, 250)"],
};

// Orb positions — each orb gets unique placement for visual depth
const ORB_POSITIONS = [
    { top: "-10%", left: "-8%", size: "55%" },
    { bottom: "-12%", right: "-6%", size: "60%" },
    { top: "18%", right: "8%", size: "40%" },
    { top: "50%", left: "15%", size: "35%" },
    { top: "25%", left: "-5%", size: "32%" },
];

const ORB_ANIMATIONS = [
    "animate-orb-first",
    "animate-orb-second",
    "animate-orb-third",
    "animate-orb-fourth",
    "animate-orb-fifth",
];

export function AnimatedBackground({
    children,
    variant = "default",
}: {
    children?: React.ReactNode;
    variant?: Variant;
}) {
    const palette = PALETTES[variant];
    const [bgStart, bgEnd] = BG_GRADIENTS[variant];
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
            className="relative w-full h-full min-h-screen overflow-hidden flex flex-col"
            style={{
                background: `linear-gradient(135deg, ${bgStart}, ${bgEnd})`,
            }}
        >
            {/* ── SVG Goo Filter for liquid blending ── */}
            <svg className="hidden" aria-hidden>
                <defs>
                    <filter id="goo-bg">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
                            result="goo"
                        />
                        <feBlend in="SourceGraphic" in2="goo" />
                    </filter>
                </defs>
            </svg>

            {/* ── Layer 1: Gradient Orbs with CSS animations ── */}
            <div
                className="absolute inset-0 overflow-hidden pointer-events-none z-0"
                style={{ filter: "url(#goo-bg) blur(80px)" }}
            >
                {ORB_POSITIONS.map((pos, i) => (
                    <div
                        key={i}
                        className={`absolute rounded-full will-change-transform ${ORB_ANIMATIONS[i]}`}
                        style={{
                            top: pos.top,
                            left: (pos as any).left,
                            right: (pos as any).right,
                            bottom: (pos as any).bottom,
                            width: pos.size,
                            height: pos.size,
                            background: `radial-gradient(circle at center, ${palette[i]} 0%, transparent 70%)`,
                            mixBlendMode: "normal",
                        }}
                    />
                ))}
            </div>

            {/* ── Layer 2: Film Grain Noise ── */}
            <div
                className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "repeat",
                    backgroundSize: "180px 180px",
                }}
            />

            {/* ── Layer 3: Top & bottom vignette ── */}
            <div className="absolute inset-x-0 top-0 h-40 pointer-events-none z-0 bg-gradient-to-b from-white/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-32 pointer-events-none z-0 bg-gradient-to-t from-white/30 to-transparent" />

            {/* ── Layer 4: Mouse Spotlight ── */}
            <div
                className="absolute inset-0 pointer-events-none z-0 transition-[background] duration-200"
                style={{
                    background: `radial-gradient(circle 350px at ${spot.x} ${spot.y}, rgba(245,200,220,0.12) 0%, transparent 80%)`,
                }}
            />

            {/* ── Content ── */}
            <div className="relative z-10 flex-1 w-full h-full">
                {children}
            </div>
        </div>
    );
}
