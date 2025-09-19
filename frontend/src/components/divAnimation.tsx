import { motion, MotionProps } from "framer-motion";
import { ReactNode } from "react";

type MotionDivProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
} & MotionProps;

export default function MotionDiv({
  children,
  className = "",
  delay = 0,
  duration = 0.4,
  y = 0,
  ...rest
}: MotionDivProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}