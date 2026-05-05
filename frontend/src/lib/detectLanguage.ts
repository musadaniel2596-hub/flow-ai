/**
 * Client-side heuristic language detection
 * Used to provide instant feedback before AI analysis
 */

interface LanguageHint {
  name: string;
  color: string;
  icon: string;
}

const LANGUAGE_MAP: Record<string, LanguageHint> = {
  javascript: { name: "JavaScript", color: "#f7df1e", icon: "JS" },
  typescript: { name: "TypeScript", color: "#3178c6", icon: "TS" },
  python: { name: "Python", color: "#3572A5", icon: "PY" },
  java: { name: "Java", color: "#b07219", icon: "JV" },
  cpp: { name: "C++", color: "#f34b7d", icon: "C+" },
  c: { name: "C", color: "#555555", icon: "C" },
  csharp: { name: "C#", color: "#178600", icon: "C#" },
  rust: { name: "Rust", color: "#dea584", icon: "RS" },
  go: { name: "Go", color: "#00ADD8", icon: "GO" },
  php: { name: "PHP", color: "#777bb4", icon: "PHP" },
  ruby: { name: "Ruby", color: "#701516", icon: "RB" },
  swift: { name: "Swift", color: "#F05138", icon: "SW" },
  kotlin: { name: "Kotlin", color: "#A97BFF", icon: "KT" },
  html: { name: "HTML", color: "#e34c26", icon: "HTML" },
  css: { name: "CSS", color: "#563d7c", icon: "CSS" },
  sql: { name: "SQL", color: "#e38c00", icon: "SQL" },
  bash: { name: "Bash", color: "#89e051", icon: "SH" },
  unknown: { name: "Unknown", color: "#6b7280", icon: "?" },
};

/**
 * Detect language from code content using regex heuristics
 */
export function detectLanguage(code: string): string {
  if (!code.trim()) return "unknown";

  const c = code.trim();

  // HTML
  if (/<(!DOCTYPE|html|head|body|div|p|span|h[1-6])/i.test(c)) return "html";

  // CSS
  if (/^[.#]?[\w-]+\s*\{[\s\S]*?\}/.test(c) && c.includes("{") && c.includes(":")) return "css";

  // SQL
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|FROM|WHERE|JOIN)\b/i.test(c)) return "sql";

  // Python
  if (/\bdef\s+\w+\s*\(|import\s+\w+|from\s+\w+\s+import|\bprint\s*\(|elif\b/.test(c)) return "python";

  // TypeScript (must check before JS)
  if (/:\s*(string|number|boolean|void|any|never|unknown)\b|interface\s+\w+|type\s+\w+\s*=|<\w+>/.test(c)) return "typescript";

  // JavaScript
  if (/\b(const|let|var)\s+\w+|=>\s*\{|require\s*\(|module\.exports|console\.log/.test(c)) return "javascript";

  // Java
  if (/\bpublic\s+(static\s+)?(void|class|int|String)\b|System\.out\.print/.test(c)) return "java";

  // C#
  if (/\busing\s+System|Console\.Write|namespace\s+\w+|\.cs\b/.test(c)) return "csharp";

  // C++
  if (/#include\s*<(iostream|vector|string)>|std::|cout\s*<</.test(c)) return "cpp";

  // Rust
  if (/\bfn\s+\w+|let\s+mut\s+|println!\s*\(|use\s+std::/.test(c)) return "rust";

  // Go
  if (/\bfunc\s+\w+\s*\(|fmt\.\w+|package\s+main/.test(c)) return "go";

  // PHP
  if (/<\?php|\$\w+\s*=|echo\s+/.test(c)) return "php";

  // Ruby
  if (/\bdef\s+\w+|puts\s+|\.each\s+do|end$/.test(c)) return "ruby";

  // Swift
  if (/\bvar\s+\w+:\s+\w+|print\s*\(|func\s+\w+\s*\(.*\)\s*->/.test(c)) return "swift";

  // Kotlin
  if (/\bfun\s+\w+\s*\(|println\s*\(|val\s+\w+\s*=/.test(c)) return "kotlin";

  // Bash
  if (/^#!/.test(c) || /\$\w+|echo\s+|if\s+\[/.test(c)) return "bash";

  // C (generic)
  if (/#include\s*<\w+\.h>|printf\s*\(|int\s+main\s*\(/.test(c)) return "c";

  return "unknown";
}

export function getLanguageInfo(lang: string): LanguageHint {
  return LANGUAGE_MAP[lang.toLowerCase()] || LANGUAGE_MAP.unknown;
}
