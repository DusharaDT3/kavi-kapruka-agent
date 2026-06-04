"use client";

const SUGGESTIONS = [
  { icon: "🎂", text: "Birthday cakes in Colombo" },
  { icon: "🌹", text: "Flower bouquets for Mum" },
  { icon: "🍫", text: "Chocolate gift boxes" },
  { icon: "📱", text: "Latest smartphones" },
  { icon: "🎁", text: "Avurudu gift hampers" },
  { icon: "💐", text: "Wedding day flowers" },
];

interface WelcomeScreenProps {
  onSuggestion: (text: string) => void;
}

export function WelcomeScreen({ onSuggestion }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.7); }
          to { opacity: 1; transform: scale(1); }
        }
        .anim-pop { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        .anim-up-1 { animation: fadeUp 0.5s ease both 0.15s; }
        .anim-up-2 { animation: fadeUp 0.5s ease both 0.3s; }
        .anim-up-3 { animation: fadeUp 0.4s ease both 0.5s; }
      `}</style>

      {/* Logo */}
      <div className="anim-pop w-20 h-20 rounded-3xl bg-kavi-gradient flex items-center justify-center
        text-white font-bold text-4xl mb-6 shadow-xl shadow-primary/40">
        K
      </div>

      {/* Greeting */}
      <div className="anim-up-1">
        <h1 className="text-3xl font-bold text-text-primary mb-1">
          ආයුබෝවන්! I&apos;m Kavi
        </h1>
        <p className="text-text-muted text-base mt-2 max-w-sm">
          Your AI shopping guide for{" "}
          <a
            href="https://www.kapruka.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-light hover:underline"
          >
            Kapruka.com
          </a>{" "}
          — Sri Lanka&apos;s largest e-commerce platform
        </p>
        <p className="text-text-faint text-sm mt-2">
          🇱🇰 Gifts · Cakes · Flowers · Electronics · Delivered anywhere in Sri Lanka
        </p>
      </div>

      {/* Suggestion chips */}
      <div className="anim-up-2 mt-8 flex flex-wrap justify-center gap-2.5 max-w-lg">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.text}
            onClick={() => onSuggestion(s.text)}
            className="flex items-center gap-2 px-4 py-2 rounded-full
              bg-surface-2 border border-border text-sm text-text-muted
              hover:bg-surface-3 hover:border-primary/50 hover:text-text-primary
              transition-all duration-200 hover:-translate-y-0.5"
          >
            <span>{s.icon}</span>
            <span>{s.text}</span>
          </button>
        ))}
      </div>

      {/* Hint */}
      <p className="anim-up-3 text-text-faint text-xs mt-8">
        Also speaks සිංහල and Tanglish 🙌
      </p>
    </div>
  );
}
