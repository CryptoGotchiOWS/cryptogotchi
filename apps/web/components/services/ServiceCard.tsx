"use client";

import { useState } from "react";
import type { ServiceConfig, ServiceType, ServiceResponse } from "@cryptogotchi/shared";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

interface ServiceCardProps {
  service: ServiceConfig;
  isLoading: boolean;
  result: ServiceResponse | null;
  error: string | null;
  petReaction: string | null;
  onSubmit: (type: ServiceType, body: Record<string, unknown>) => void;
  onClear: (type: ServiceType) => void;
  customers?: number;
}

const ICON_MAP: Record<string, string> = {
  summarize: "/icons/summarize.png",
  fortune: "/icons/fortune.png",
  "code-review": "/icons/code-review.png",
  crypto: "/icons/crypto.png",
};

function getResultText(type: ServiceType, result: ServiceResponse): string {
  if ("summary" in result) return result.summary;
  if ("fortune" in result) return `${result.fortune}\n\nLucky token: ${result.lucky_token}`;
  if ("review" in result) return `Score: ${result.score}/10\n\n${result.review}`;
  if ("analysis" in result) return `Sentiment: ${result.sentiment}\n\n${result.analysis}`;
  return JSON.stringify(result);
}

export default function ServiceCard({
  service,
  isLoading,
  result,
  error,
  petReaction,
  onSubmit,
  onClear,
  customers = 0,
}: ServiceCardProps) {
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [showTestInput, setShowTestInput] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const earned = customers * parseFloat(service.price);

  const handleSubmit = () => {
    const body: Record<string, unknown> = {};
    switch (service.type) {
      case "summarize":
        if (!input.trim()) return;
        body.text = input;
        break;
      case "fortune":
        break;
      case "code-review":
        if (!input.trim()) return;
        body.code = input;
        body.language = language;
        break;
      case "crypto":
        if (!input.trim()) return;
        body.query = input;
        break;
    }
    onSubmit(service.type, body);
  };

  const iconSrc = ICON_MAP[service.type];

  return (
    <div className="service-card glass-panel rounded-xl p-4 flex flex-col gap-3 border border-sage-mist/50">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 pixel-art rounded-lg bg-cream-blush flex-shrink-0"
          style={{
            backgroundImage: `url(${iconSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-pixel text-[8px] text-charcoal truncate">{service.name}</h4>
          <p className="text-[10px] text-dark-gray mt-0.5">{service.description}</p>
        </div>
        <span className="font-mono text-xs font-bold text-success flex-shrink-0">
          ${service.price}
        </span>
      </div>

      {/* Customer metrics */}
      <div className="flex items-center justify-between text-[9px] font-mono px-1 py-1.5 bg-fog-gray/60 rounded-lg">
        <span className="text-dark-gray">Customers: <span className="font-bold text-charcoal">{customers}</span></span>
        <span className="text-success font-bold">+${earned.toFixed(2)}</span>
      </div>

      {/* Test input toggle */}
      {!showTestInput && !result && (
        <button
          onClick={() => setShowTestInput(true)}
          className="text-[9px] text-dusty-sage hover:text-charcoal transition-colors cursor-pointer self-start"
        >
          Test Service &rarr;
        </button>
      )}

      {/* Input area */}
      {!showTestInput ? null : service.type === "fortune" ? null : (
        <div className="flex flex-col gap-1.5">
          {service.type === "code-review" && (
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Programming language"
              className="text-xs font-mono bg-fog-gray border border-sage-mist rounded px-2 py-1"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="rust">Rust</option>
              <option value="solidity">Solidity</option>
              <option value="go">Go</option>
            </select>
          )}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label={`Input for ${service.name}`}
            placeholder={
              service.type === "summarize"
                ? "Paste text to summarize..."
                : service.type === "code-review"
                  ? "Paste code to review..."
                  : "Ask about crypto..."
            }
            className="
              w-full h-20 px-3 py-2 text-xs font-mono
              bg-fog-gray border border-sage-mist rounded-lg
              resize-none focus:outline-none focus:ring-1 focus:ring-dusty-sage
              placeholder:text-dark-gray/50
            "
            disabled={isLoading}
          />
        </div>
      )}

      {/* Submit button */}
      {showTestInput && (
        <button
          onClick={handleSubmit}
          disabled={isLoading || (service.type !== "fortune" && !input.trim())}
          className="
            w-full font-pixel text-[8px] py-2 rounded-lg
            bg-sage-mist/60 text-dark-gray
            hover:bg-dusty-sage hover:text-white
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all active:scale-[0.98] cursor-pointer
          "
        >
          {isLoading ? (
            <span className="animate-pixel-pulse">Processing...</span>
          ) : (
            "Test Service"
          )}
        </button>
      )}

      {/* Pet reaction */}
      <AnimatePresence>
        {petReaction && !result && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
            className="font-pixel text-[7px] text-dusty-sage italic"
          >
            &ldquo;{petReaction}&rdquo;
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="text-xs text-danger bg-danger/10 rounded-lg p-2">
          {error}
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-fog-gray rounded-lg p-3 max-h-48 overflow-y-auto custom-scrollbar">
              <pre className="text-[10px] font-mono text-charcoal whitespace-pre-wrap break-words">
                {getResultText(service.type, result)}
              </pre>
              {petReaction && (
                <p className="mt-2 font-pixel text-[7px] text-dusty-sage italic border-t border-sage-mist pt-2">
                  &ldquo;{petReaction}&rdquo;
                </p>
              )}
            </div>
            <button
              onClick={() => {
                onClear(service.type);
                setInput("");
              }}
              className="mt-2 text-[10px] text-dark-gray hover:text-charcoal transition-colors cursor-pointer"
            >
              Clear
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
