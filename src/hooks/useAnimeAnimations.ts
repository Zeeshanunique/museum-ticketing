'use client';

import { useRef, useEffect } from 'react';
import anime from 'animejs/lib/anime.js';

// Custom hook for scroll-triggered animations
export const useScrollAnimation = (
  animationConfig: any,
  threshold: number = 0.1,
  triggerOnce: boolean = true
) => {
  const elementRef = useRef<HTMLElement>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && (!hasTriggeredRef.current || !triggerOnce)) {
            anime({
              targets: entry.target,
              ...animationConfig,
            });
            if (triggerOnce) {
              hasTriggeredRef.current = true;
            }
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [animationConfig, threshold, triggerOnce]);

  return elementRef;
};

// Custom hook for staggered animations
export const useStaggerAnimation = (
  selector: string,
  animationConfig: any,
  staggerDelay: number = 100
) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targets = entry.target.querySelectorAll(selector);
            anime({
              targets,
              ...animationConfig,
              delay: anime.stagger(staggerDelay),
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [selector, animationConfig, staggerDelay]);

  return containerRef;
};

// Custom hook for continuous animations (like floating elements)
export const useFloatingAnimation = (
  animationConfig: any = {},
  autoStart: boolean = true
) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !autoStart) return;

    const defaultConfig = {
      translateY: [-10, 10, -10],
      translateX: [-5, 5, -5],
      rotate: [-2, 2, -2],
      duration: 4000,
      loop: true,
      easing: 'easeInOutSine',
      direction: 'alternate',
    };

    anime({
      targets: element,
      ...defaultConfig,
      ...animationConfig,
    });
  }, [animationConfig, autoStart]);

  return elementRef;
};

// Custom hook for entrance animations
export const useEntranceAnimation = (
  delay: number = 0,
  animationConfig: any = {}
) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const defaultConfig = {
      translateY: [50, 0],
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 800,
      easing: 'easeOutExpo',
      delay,
    };

    // Set initial state
    anime.set(element, {
      translateY: 50,
      opacity: 0,
      scale: 0.8,
    });

    // Animate in
    const animation = anime({
      targets: element,
      ...defaultConfig,
      ...animationConfig,
    });

    return () => animation.pause();
  }, [delay, animationConfig]);

  return elementRef;
};

export default {
  useScrollAnimation,
  useStaggerAnimation,
  useFloatingAnimation,
  useEntranceAnimation,
};