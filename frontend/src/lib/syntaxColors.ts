/**
 * Lightweight regex-based syntax highlighter
 * Returns HTML string with span-wrapped tokens
 */

type TokenRule = {
  pattern: RegExp;
  className: string;
};

// Generic token rules applied to all languages
const COMMON_RULES: TokenRule[] = [
  // Single line comments
  { pattern: /\/\/[^\n]*/g, className: "syn-comment" },
  // Multi-line comments
  { pattern: /\/\*[\s\S]*?\*\//g, className: "syn-comment" },
  // Hash comments (Python, Ruby, Bash)
  { pattern: /#[^\n]*/g, className: "syn-comment" },
  // Template literals
  { pattern: /`[^`]*`/g, className: "syn-string" },
  // Double-quoted strings
  { pattern: /"(?:[^"\\]|\\.)*"/g, className: "syn-string" },
  // Single-quoted strings
  { pattern: /'(?:[^'\\]|\\.)*'/g, className: "syn-string" },
  // Numbers
  { pattern: /\b\d+\.?\d*\b/g, className: "syn-number" },
];

const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  javascript: [
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "do", "switch", "case", "break", "continue", "new", "class", "extends",
    "import", "export", "default", "from", "async", "await", "try", "catch",
    "finally", "throw", "typeof", "instanceof", "in", "of", "this", "super",
    "null", "undefined", "true", "false", "void", "delete",
  ],
  typescript: [
    "const", "let", "var", "function", "return", "if", "else", "for", "while",
    "class", "extends", "implements", "interface", "type", "enum", "namespace",
    "import", "export", "default", "from", "async", "await", "try", "catch",
    "public", "private", "protected", "readonly", "static", "abstract",
    "string", "number", "boolean", "void", "any", "never", "unknown", "object",
    "null", "undefined", "true", "false",
  ],
  python: [
    "def", "class", "return", "if", "elif", "else", "for", "while", "in",
    "import", "from", "as", "try", "except", "finally", "raise", "with",
    "lambda", "yield", "pass", "break", "continue", "global", "nonlocal",
    "True", "False", "None", "and", "or", "not", "is",
  ],
  java: [
    "public", "private", "protected", "static", "void", "class", "interface",
    "extends", "implements", "return", "if", "else", "for", "while", "do",
    "new", "this", "super", "try", "catch", "finally", "throw", "throws",
    "import", "package", "final", "abstract", "int", "long", "double",
    "float", "boolean", "char", "byte", "short", "String", "true", "false", "null",
  ],
  html: ["DOCTYPE", "html", "head", "body", "div", "span", "p", "a", "img"],
  css: ["px", "em", "rem", "vh", "vw", "%", "important"],
  sql: [
    "SELECT", "FROM", "WHERE", "JOIN", "INNER", "LEFT", "RIGHT", "ON",
    "INSERT", "INTO", "VALUES", "UPDATE", "SET", "DELETE", "CREATE", "TABLE",
    "DROP", "ALTER", "ADD", "INDEX", "PRIMARY", "KEY", "FOREIGN", "REFERENCES",
    "ORDER", "BY", "GROUP", "HAVING", "LIMIT", "OFFSET", "DISTINCT", "AS",
    "AND", "OR", "NOT", "NULL", "IS", "IN", "LIKE", "BETWEEN",
  ],
};

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Apply syntax highlighting to code string
 * Returns HTML with <span> elements for coloring
 */
export function highlightSyntax(code: string, language: string): string {
  if (!code) return "";

  const lang = language.toLowerCase();

  // For HTML, use specialized highlighter
  if (lang === "html") return highlightHTML(code);

  // Escape HTML first
  let result = escapeHtml(code);

  // Replace tokens with placeholders to avoid double-processing
  const placeholders: Map<string, string> = new Map();
  let placeholderIndex = 0;

  function addPlaceholder(html: string): string {
    const key = `\x00PLACEHOLDER_${placeholderIndex++}\x00`;
    placeholders.set(key, html);
    return key;
  }

  // Apply common rules
  for (const rule of COMMON_RULES) {
    result = result.replace(rule.pattern, (match) =>
      addPlaceholder(`<span class="${rule.className}">${escapeHtml(match)}</span>`)
    );
  }

  // Apply keyword highlighting
  const keywords = LANGUAGE_KEYWORDS[lang] || LANGUAGE_KEYWORDS.javascript;
  if (keywords.length > 0) {
    const kwPattern = new RegExp(`\\b(${keywords.join("|")})\\b`, "g");
    result = result.replace(kwPattern, (match) =>
      addPlaceholder(`<span class="syn-keyword">${match}</span>`)
    );
  }

  // Function names: word followed by (
  result = result.replace(/\b([a-zA-Z_]\w*)\s*(?=\()/g, (_, name) => {
    // Don't re-highlight if it's already in placeholders
    if (keywords?.includes(name)) return name;
    return addPlaceholder(`<span class="syn-function">${name}</span>`);
  });

  // Operators
  result = result.replace(
    /(\+\+|--|===|!==|==|!=|>=|<=|=>|&&|\|\||[+\-*/%=<>!&|^~])/g,
    (match) => addPlaceholder(`<span class="syn-operator">${match}</span>`)
  );

  // Restore placeholders
  placeholders.forEach((html, key) => {
    result = result.split(key).join(html);
  });

  return result;
}

/**
 * Specialized HTML syntax highlighter
 */
function highlightHTML(code: string): string {
  return escapeHtml(code)
    .replace(
      /(&lt;\/?)([\w-]+)/g,
      (_, bracket, tag) =>
        `${bracket}<span class="syn-tag">${tag}</span>`
    )
    .replace(
      /\s([\w-]+)(?==)/g,
      (_, attr) => ` <span class="syn-attribute">${attr}</span>`
    )
    .replace(
      /(&quot;[^&]*&quot;)/g,
      (match) => `<span class="syn-string">${match}</span>`
    )
    .replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      (match) => `<span class="syn-comment">${match}</span>`
    );
}
