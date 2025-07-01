"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

function generateStars(count: number, starColor: string) {
  const shadows: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(Math.random() * 4000) - 2000;
    const y = Math.floor(Math.random() * 4000) - 2000;
    shadows.push(`${x}px ${y}px ${starColor}`);
  }
  return shadows.join(", ");
}

function StarLayer({
  count = 1000,
  size = 1,
  duration = 50,
  starColor = "#fff",
  className,
  ...props
}: {
  count?: number;
  size?: number;
  duration?: number;
  starColor?: string;
  className?: string;
  [key: string]: any;
}) {
  const [boxShadow, setBoxShadow] = React.useState<string>("");

  React.useEffect(() => {
    setBoxShadow(generateStars(count, starColor));
  }, [count, starColor]);

  return (
    <motion.div
      animate={{ y: [0, -2000] }}
      transition={{ repeat: Infinity, duration, ease: "linear" }}
      className={cn("absolute top-0 left-0 w-full h-[2000px]", className)}
      {...props}
    >
      <div
        className="absolute bg-transparent rounded-full"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: boxShadow,
        }}
      />
      <div
        className="absolute bg-transparent rounded-full top-[2000px]"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          boxShadow: boxShadow,
        }}
      />
    </motion.div>
  );
}

export function StarsBackground({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";
  const backgroundGradient = isDark 
    ? "bg-[radial-gradient(ellipse_at_bottom,_#262626_0%,_#000_100%)]"
    : "bg-[radial-gradient(ellipse_at_bottom,_#f8fafc_0%,_#ffffff_100%)]";
  const starColor = isDark ? "#fff" : "#000";

  return (
    <div
      className={cn(
        "relative size-full overflow-hidden",
        backgroundGradient,
        className,
      )}
      {...props}
    >
      <StarLayer count={1000} size={1} duration={50} starColor={starColor} />
      <StarLayer count={400} size={2} duration={100} starColor={starColor} />
      <StarLayer count={200} size={3} duration={150} starColor={starColor} />
      {children}
    </div>
  );
} 