import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";

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
    <span className={`relative inline-block align-bottom ${className}`}>
      {/* Hidden measuring span to reserve the exact width of the longest word */}
      <span className="invisible inline-block" aria-hidden="true">
        {longestWord}
      </span>

      {/* Both words stacked absolutely; only the active one is visible */}
      {words.map((word, i) => (
        <motion.span
          key={word}
          className="absolute inset-0 inline-block text-center"
          initial={false}
          animate={{
            opacity: i === index ? 1 : 0,
            filter: i === index ? "blur(0px)" : "blur(4px)",
          }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
