import { useEffect } from "react";
import { useMotionValue, useSpring, useReducedMotion, type SpringOptions } from "framer-motion";

const DEFAULT_SPRING: SpringOptions = { stiffness: 90, damping: 20, mass: 0.6 };

/** Spring-smoothed motion value that chases `target` without overshoot bounce. */
export function useAnimatedValue(target: number, spring: SpringOptions = DEFAULT_SPRING) {
  const prefersReduced = useReducedMotion();
  const motionValue = useMotionValue(target);
  const smoothed = useSpring(motionValue, prefersReduced ? { stiffness: 1000, damping: 100 } : spring);

  useEffect(() => {
    motionValue.set(target);
  }, [target, motionValue]);

  return smoothed;
}
