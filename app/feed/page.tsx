"use client";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from "framer-motion";
import { Heart, Upload, Sparkles, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const mockDailyProducts = [
    {
        id: "p1",
        title: "Kruvaze Yün Kaban",
        brand: "TOTÊME",
        image_url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop",
        price: 12490.00,
        currency: "₺",
        match: 98
    },
    {
        id: "p2",
        title: "Geniş Paça İpek Pantolon",
        brand: "ACNE STUDIOS",
        image_url: "https://images.unsplash.com/photo-1624378439575-d10c6bcab689?q=80&w=600&auto=format&fit=crop",
        price: 8550.00,
        currency: "₺",
        match: 95
    },
    {
        id: "p3",
        title: "Deri Sivri Burun Bot",
        brand: "JIL SANDER",
        image_url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=600&auto=format&fit=crop",
        price: 13450.00,
        currency: "₺",
        match: 92
    },
    {
        id: "p4",
        title: "Asimetrik Kesim Triko Kazak",
        brand: "COS",
        image_url: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=600&auto=format&fit=crop",
        price: 3200.00,
        currency: "₺",
        match: 88
    },
    {
        id: "p5",
        title: "Mat Gümüş Zircir Kolye",
        brand: "ALL BLUES",
        image_url: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop",
        price: 350.50,
        currency: "₺",
        match: 85
    }
];

// Card variants defined outside to not recreate on each render
const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 220,
            damping: 22,
            delay: Math.min(i * 0.1, 0.35),
        }
    })
};

const badgeVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 25,
            delay: Math.min(i * 0.1, 0.35) + 0.25,
        }
    })
};

const ProductCard = ({ product, index }: { product: typeof mockDailyProducts[0], index: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    // Spring-smoothed parallax — no jank even on fast scrolls
    const smoothScroll = useSpring(scrollYProgress, { stiffness: 80, damping: 25, restDelta: 0.001 });
    const y = useTransform(smoothScroll, [0, 1], ["-8%", "8%"]);

    return (
        <motion.div
            ref={ref}
            custom={index}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            whileTap={{ scale: 0.98 }}
            // Only GPU props used — no layout-triggering animations
            style={{ willChange: "transform, opacity" }}
            className="bg-white overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-neutral-100 group touch-manipulation"
        >
            {/* Image with parallax */}
            <div className="relative w-full aspect-[4/5] bg-neutral-100 overflow-hidden">
                <motion.div style={{ y }} className="absolute inset-0 scale-[1.14] origin-center">
                    <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 30rem"
                        priority={index < 2}
                        className="object-cover"
                    />
                </motion.div>
                {/* Gradient tint */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none z-0" />

                {/* Match badge */}
                <div className="absolute top-4 left-4 z-20">
                    <motion.div
                        custom={index}
                        variants={badgeVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="bg-white/95 backdrop-blur-md px-3 py-1.5 flex items-center gap-2 shadow-sm border border-neutral-200/50"
                    >
                        <div className="relative flex h-1.5 w-1.5 items-center justify-center">
                            <span className="relative inline-flex h-1.5 w-1.5 bg-neutral-900" />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-neutral-900 tracking-widest">
                            %{product.match} Eşleşme
                        </span>
                    </motion.div>
                </div>

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2.5 z-10">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-900 shadow-sm border border-neutral-200/50 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                        <Heart className="w-4.5 h-4.5" />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-900 shadow-sm border border-neutral-200/50 hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                        <Upload className="w-4.5 h-4.5" />
                    </motion.button>
                </div>
            </div>

            {/* Details */}
            <div className="p-5 sm:p-7 bg-white">
                <div className="mb-5 border-b border-neutral-100 pb-5">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-[0.2em] mb-2 block">
                        {product.brand}
                    </span>
                    <h3 className="text-2xl font-display font-medium text-neutral-900 leading-snug tracking-tight">
                        {product.title}
                    </h3>
                </div>

                <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400 mb-1">Fiyat</span>
                        <span className="text-xl font-medium text-neutral-900 tracking-tight">
                            {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {product.currency}
                        </span>
                    </div>

                    <Link href={`/r/${product.id}`}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className="px-8 py-3.5 bg-neutral-900 text-white font-medium text-xs tracking-widest uppercase shadow-xl"
                        >
                            İncele
                        </motion.button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default function FeedPage() {
    const router = useRouter();

    return (
        <div className="w-full min-h-[100dvh] flex flex-col relative text-neutral-900 font-sans pb-24 bg-[var(--background)]">

            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-black/5">
                <div className="flex items-center justify-between px-4 sm:px-6 h-16 max-w-lg mx-auto w-full">
                    <motion.button
                        onClick={() => router.back()}
                        whileTap={{ scale: 0.88 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </motion.button>

                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-neutral-400 mb-0.5 flex items-center gap-1.5">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>GÜNLÜK DROP</span>
                        </span>
                        <h1 className="font-display font-medium text-neutral-900 text-lg tracking-tight">
                            Senin İçin Seçilenler
                        </h1>
                    </div>

                    <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold text-white">5</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-lg mx-auto px-4 sm:px-6 pt-5">
                <div className="flex flex-col gap-5">
                    <AnimatePresence>
                        {mockDailyProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </AnimatePresence>

                    {/* End CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                        className="text-center py-10 pb-16"
                    >
                        <div className="w-12 h-[1px] bg-neutral-300 rounded-full mx-auto mb-8" />
                        <h4 className="text-2xl font-display font-medium text-neutral-900 mb-3 tracking-tight">Bugünün seçimleri bu kadar</h4>
                        <p className="text-xs font-medium text-neutral-500 mb-8 max-w-[260px] mx-auto leading-relaxed">
                            Yarın yeni ve editöryel 5 harika parçayla tekrar burada olacağız.
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-white text-neutral-900 border border-neutral-200 font-semibold text-xs tracking-widest uppercase shadow-sm"
                        >
                            Tüm Gardırobuma Git
                        </motion.button>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
