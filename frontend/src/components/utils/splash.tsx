import React, { useEffect, useState, useRef } from "react";
import logo from "../../assets/images/logo_darna.png";

interface SplashScreenProps {
  onFinish?: () => void;
}

/**
 * Simple splash screen with smooth animations
 */
export default function SplashScreen({ onFinish = () => {} }: SplashScreenProps) {
  const [progress, setProgress] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const progressRef = useRef<number>(0);

  useEffect(() => {
    // Prevent page scroll while splash is visible
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    // Animation parameters
    const durationMs = 1600;
    const startTime = performance.now();
    let rafId: number | null = null;

    const animate = (currentTime: DOMHighResTimeStamp) => {
      const elapsed = currentTime - startTime;
      const rawProgress = Math.min(1, elapsed / durationMs);

      // Smooth easing function
      const easedProgress = rawProgress < 0.5 
        ? Math.pow(rawProgress * 2, 1.5) / 2
        : 1 - Math.pow((1 - rawProgress) * 2, 1.5) / 2;
      
      const currentProgress = Math.floor(easedProgress * 100);

      // Only update state if progress changed
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

        // Smooth exit with fade-out
        setTimeout(() => {
          // Restore scroll
          document.documentElement.style.overflow = prevOverflow || "";
          onFinish();
        }, 400);
      }
    };

    // Start animation with slight delay
    setTimeout(() => {
      rafId = requestAnimationFrame(animate);
    }, 50);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      document.documentElement.style.overflow = prevOverflow || "";
    };
  }, [onFinish]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Application is loading"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-all duration-500 ${
        isComplete ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
      }`}
    >
      <div className="w-full max-w-md px-6 transform transition-transform duration-300">
        <div className="flex flex-col items-center space-y-8">
          {/* Logo with subtle animation */}
          <div className={`transform transition-all duration-700 ${
            progress > 50 ? 'scale-110 rotate-2' : 'scale-100 rotate-0'
          }`}>
            <div className="w-32 h-32 md:w-48 md:h-48 flex items-center justify-center">
              <img src={logo} alt="Darna Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Progress bar */}
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
                }}
              >
                {/* Shimmer effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent transform -skew-x-12"
                  style={{
                    animation: 'shimmer 2s infinite'
                  }}
                />
              </div>
            </div>

            {/* Percentage */}
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
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  progress > 25 * (index + 1)
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
      `}</style>
    </div>
  );
}