"use client";

interface HeaderProps {
  language?: string;
}

export default function Header({ language }: HeaderProps) {
  return (
    <header className="relative z-10 flex items-center justify-between px-4 md:px-8 py-3 border-b border-white/5 bg-bg-secondary/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {/* Animated logo mark */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-blue to-accent-cyan flex items-center justify-center glow-blue">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 5L7 9L3 13"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 13H15"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="font-display font-bold text-lg text-white leading-none tracking-tight">
            Flow<span className="text-accent-blue">AI</span>
          </h1>
          <p className="text-xs text-text-muted leading-none mt-0.5">
            Smart Code Debugger
          </p>
        </div>
      </div>

      {/* Center: tagline (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-2 text-sm text-text-muted">
        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-slow" />
        AI-powered error detection &amp; correction
      </div>

      {/* Right: detected language badge */}
      <div className="flex items-center gap-3">
        {language && language !== "unknown" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-blue/10 border border-accent-blue/20 text-xs text-accent-blue font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
            {language}
          </div>
        )}

        <a
          href="https://openrouter.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-text-muted hover:text-text-secondary transition-smooth hidden sm:block"
        >
          Powered by OpenRouter
        </a>
      </div>
    </header>
  );
}
