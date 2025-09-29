import React, { useEffect, useState, useRef } from "react";
import logo from "../../assets/images/logo_darna.png";
interface SplashScreenProps {
  onFinish?: () => void;
}

/**
 * Enhanced splash screen with perfect easing and smooth animations
 */
export default function SplashScreen({ onFinish = () => { } }: SplashScreenProps) {
  const [progress, setProgress] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const progressRef = useRef<number>(0);

  // Perfect easing functions
  const easingFunctions = {
    // Perfect progress easing - starts fast, ends slow
    perfectProgress: (t: number): number => {
      if (t < 0.5) {
        return Math.pow(t * 2, 1.5) / 2;
      }
      return 1 - Math.pow((1 - t) * 2, 1.5) / 2;
    }
  };

  useEffect(() => {
    // Prevent page scroll while splash is visible
    const prevOverflow = document.documentElement.style.overflow;
    const prevPaddingRight = document.documentElement.style.paddingRight;

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.documentElement.style.paddingRight = `${scrollbarWidth}px`;
    }

    // Animation parameters
    const durationMs = 1600; // Slightly longer for better easing
    const startTime = performance.now();
    let rafId: number | null = null;

    const animate = (currentTime: DOMHighResTimeStamp) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(1, elapsed / durationMs);

      // Use perfect progress easing for the main animation
      const easedProgress = easingFunctions.perfectProgress(rawProgress);
      const currentProgress = Math.floor(easedProgress * 100);

      // Only update state if progress changed (performance optimization)
      if (currentProgress !== progressRef.current) {
        progressRef.current = currentProgress;
        setProgress(currentProgress);
      }

      if (rawProgress < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        // Final completion
        setProgress(100);
        setIsComplete(true);

        // Play beep and finish sequence
        playEnhancedBeep(0.8)
          .catch(() => {
            /* ignore audio errors */
          })
          .finally(() => {
            // Smooth exit with fade-out
            setTimeout(() => {
              // Restore scroll and styles
              document.documentElement.style.overflow = prevOverflow || "";
              document.documentElement.style.paddingRight = prevPaddingRight || "";
              onFinish();
            }, 400); // Reduced pause for better UX
          });
      }
    };

    // Start animation with slight delay for better perceived performance
    setTimeout(() => {
      rafId = requestAnimationFrame(animate);
    }, 50);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      document.documentElement.style.overflow = prevOverflow || "";
      document.documentElement.style.paddingRight = prevPaddingRight || "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Application is loading"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-all duration-500 ${isComplete ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
        }`}
      style={{
        backdropFilter: "blur(8px)"
      }}
    >
      <div className="w-full max-w-md px-6 transform transition-transform duration-300">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo with subtle animation */}
          <div className={`transform transition-all duration-700 ${progress > 50 ? 'scale-110 rotate-2' : 'scale-100 rotate-0'
            }`}>
            <div className="w-32 h-32 md:w-48 md:h-48  flex items-center justify-center text-white font-bold text-xl">
              <img src={logo} alt="" />
            </div>
          </div>

          {/* Enhanced progress bar */}
          <div className="w-full space-y-4">
            <div
              className="w-full bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-200"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-3 rounded-full transition-all duration-150 ease-out relative overflow-hidden"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #2563eb, #06b6d4, #10b981)",
                  boxShadow: `
                    0 2px 4px rgba(37, 99, 235, 0.3),
                    inset 0 1px 2px rgba(255, 255, 255, 0.4)
                  `,
                  transitionProperty: 'width, transform, opacity',
                  transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }}
              >
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12 animate-shimmer"
                  style={{
                    animation: 'shimmer 2s infinite'
                  }}
                />
              </div>
            </div>

            {/* Percentage with counter animation */}
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 tracking-tight">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  {progress}%
                </span>
              </p>
            </div>
          </div>

          {/* Loading dots */}
          <div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${progress > 25 * (index + 1)
                    ? 'bg-green-400 scale-125'
                    : 'bg-blue-400 scale-100'
                  }`}
                style={{
                  animation: `pulse 1.5s infinite ${index * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Embedded animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.9); }
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Enhanced beep with perfect timing and better sound design
 */
async function playEnhancedBeep(seconds = 0.8): Promise<void> {
  // Respect user motion preferences
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return Promise.resolve();
  }

  try {
    const AudioCtxCtor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxCtor) return;

    const ctx: AudioContext = new AudioCtxCtor();

    // Handle autoplay policies
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        await ctx.close();
        return;
      }
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Enhanced sound design
    oscillator.type = "sine";
    oscillator.frequency.value = 784; // G5 - more pleasant frequency

    filter.type = "lowpass";
    filter.frequency.value = 2000;

    gainNode.gain.value = 0;

    // Connect: oscillator -> filter -> gain -> destination
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    // Perfect volume envelope with exponential curves
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.15, now + 0.08); // Smooth attack
    gainNode.gain.exponentialRampToValueAtTime(0.08, now + seconds * 0.7); // Gentle sustain
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + seconds); // Smooth release

    // Subtle frequency sweep for more interesting sound
    oscillator.frequency.setValueAtTime(784, now);
    oscillator.frequency.linearRampToValueAtTime(880, now + seconds * 0.3);
    oscillator.frequency.linearRampToValueAtTime(784, now + seconds);

    oscillator.start(now);
    oscillator.stop(now + seconds + 0.1);

    return new Promise<void>((resolve) => {
      oscillator.onended = () => {
        ctx.close().catch(() => { }).finally(resolve);
      };
    });
  } catch {
    return Promise.resolve();
  }
}