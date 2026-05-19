import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedPastorPriestProps {
  words: [string, string];
  interval?: number;
  className?: string;
}

export default function AnimatedPastorPriest({
  words,
  interval = 3000,
  className = "",
}: AnimatedPastorPriestProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words.length, interval]);

  // Fixed width so layout never shifts — sized to the longest word
  const longestWord = useMemo(
    () => words.reduce((a, b) => (a.length > b.length ? a : b)),
    [words]
  );

  return (
    <span className={`relative inline-block -translate-x-1 ${className}`}>
      {/* Hidden measuring span to reserve the exact width of the longest word */}
      <span className="invisible inline-block" aria-hidden="true">
        {longestWord}
      </span>

      {/* AnimatePresence swap with original slide-up + blur motion */}
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0 inline-block text-center"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
