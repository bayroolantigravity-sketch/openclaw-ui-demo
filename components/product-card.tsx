"use client";

import { motion } from "framer-motion";
import { Heart, X, ExternalLink } from "lucide-react";
import Image from "next/image";

type Product = {
    id: string;
    title: string;
    brand: string | null;
    image_url: string | null;
    price: number | null;
    currency: string | null;
    redirect_url: string;
};

interface ProductCardProps {
    product: Product;
    onVote: (vote: "like" | "dislike") => void;
}

export function ProductCard({ product, onVote }: ProductCardProps) {
    return (
        <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full aspect-[3/4] max-h-[60vh] bg-card rounded-3xl overflow-hidden shadow-xl border border-border group"
        >
            {/* Image */}
            <div className="absolute inset-0 bg-muted">
                {product.image_url ? (
                    <Image
                        src={product.image_url}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No Image
                    </div>
                )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-6 text-white space-y-2">
                <div className="space-y-1">
                    <p className="text-sm font-medium opacity-80 uppercase tracking-widest">{product.brand}</p>
                    <h3 className="text-xl font-bold leading-tight line-clamp-2">{product.title}</h3>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <span className="text-lg font-semibold bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg">
                        {product.price} {product.currency}
                    </span>
                    <a
                        href={product.redirect_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-colors"
                    >
                        <ExternalLink className="w-5 h-5" />
                    </a>
                </div>
            </div>

            {/* Vote Buttons (Floating or Overlay) */}
            <div className="absolute top-4 right-4 flex flex-col space-y-3">
                {/* Could be here or bottom. Let's put them at the bottom in the page layout instead for better ergonomics. */}
            </div>
        </motion.div>
    );
}
