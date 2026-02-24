"use client";

import { motion } from "framer-motion";

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1], // Cinematic easing
            }}
            className="w-full h-full min-h-[100dvh]"
        >
            {children}
        </motion.div>
    );
}
