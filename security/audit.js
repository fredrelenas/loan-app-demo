/**
 * MoneyMe Loan App — Security Audit Script
 * Checks HTML files for security compliance
 * Run: node security/audit.js
 * Exit 0 = PASS, Exit 1 = FAIL
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HTML_FILES = [];
const JS_FILES = [];
let failures = 0;
let warnings = 0;

/**
 * Recursively find files by extension
 * @param {string} dir - Directory to search
 * @param {string} ext - File extension to match
 * @param {string[]} results - Accumulated results
 * @returns {string[]}
 */
function findFiles(dir, ext, results) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      findFiles(fullPath, ext, results);
    } else if (entry.isFile() && entry.name.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Log a failure
 * @param {string} file - File path
 * @param {string} message - Failure description
 */
function fail(file, message) {
  const rel = path.relative(ROOT, file);
  console.error(`  FAIL: [${rel}] ${message}`);
  failures++;
}

/**
 * Log a warning
 * @param {string} file - File path
 * @param {string} message - Warning description
 */
function warn(file, message) {
  const rel = path.relative(ROOT, file);
  console.warn(`  WARN: [${rel}] ${message}`);
  warnings++;
}

/**
 * Check that all HTML <input> and <textarea> elements have maxlength
 * @param {string} file - File path
 * @param {string} content - File content
 */
function checkMaxlength(file, content) {
  // Match input elements that are text-like (not range, checkbox, radio, hidden, submit, button)
  const inputRegex = /<input\s[^>]*type=["'](text|email|tel|number|password|search|url)["'][^>]*>/gi;
  const textareaRegex = /<textarea\s[^>]*>/gi;
  let match;

  while ((match = inputRegex.exec(content)) !== null) {
    if (!/maxlength=/i.test(match[0])) {
      fail(file, `Input missing maxlength: ${match[0].substring(0, 80)}...`);
    }
  }

  while ((match = textareaRegex.exec(content)) !== null) {
    if (!/maxlength=/i.test(match[0])) {
      fail(file, `Textarea missing maxlength: ${match[0].substring(0, 80)}...`);
    }
  }
}

/**
 * Check for inline event handlers (onclick, onsubmit, etc.)
 * @param {string} file - File path
 * @param {string} content - File content
 */
function checkInlineHandlers(file, content) {
  const handlerRegex = /\s(on\w+)=["']/gi;
  let match;
  while ((match = handlerRegex.exec(content)) !== null) {
    fail(file, `Inline event handler found: ${match[1]}`);
  }
}

/**
 * Check for CSP meta tag in HTML files
 * @param {string} file - File path
 * @param {string} content - File content
 */
function checkCSP(file, content) {
  if (!/Content-Security-Policy/i.test(content)) {
    fail(file, 'Missing Content-Security-Policy meta tag');
  }
}

/**
 * Check that external links have rel="noopener noreferrer"
 * @param {string} file - File path
 * @param {string} content - File content
 */
function checkExternalLinks(file, content) {
  const linkRegex = /<a\s[^>]*href=["']https?:\/\/[^>]*>/gi;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    if (!/rel=["'][^"']*noopener[^"']*noreferrer/i.test(match[0])) {
      fail(file, `External link missing rel="noopener noreferrer": ${match[0].substring(0, 80)}`);
    }
  }
}

/**
 * Check JS files for dangerous patterns
 * @param {string} file - File path
 * @param {string} content - File content
 */
function checkDangerousJS(file, content) {
  // Strip comments before checking for dangerous patterns
  const codeOnly = content
    .replace(/\/\*[\s\S]*?\*\//g, '')  // block comments
    .replace(/\/\/.*$/gm, '');          // line comments

  // Check for eval()
  if (/\beval\s*\(/g.test(codeOnly)) {
    fail(file, 'eval() usage detected');
  }

  // Check for innerHTML with variables (not static strings)
  const innerHTMLRegex = /\.innerHTML\s*=\s*(?!['"`])/g;
  if (innerHTMLRegex.test(codeOnly)) {
    fail(file, 'innerHTML assigned with dynamic value (potential XSS)');
  }

  // Check for document.write
  if (/\bdocument\.write\s*\(/g.test(codeOnly)) {
    fail(file, 'document.write() usage detected');
  }

  // Check for Function constructor
  if (/\bnew\s+Function\s*\(/g.test(codeOnly)) {
    fail(file, 'new Function() constructor detected');
  }

  // Check for localStorage usage in code (not comments)
  if (/\blocalStorage\b/g.test(codeOnly)) {
    warn(file, 'localStorage usage detected — use sessionStorage for PII');
  }
}

// --- Main ---
console.log('MoneyMe Security Audit');
console.log('='.repeat(50));

findFiles(ROOT, '.html', HTML_FILES);
findFiles(ROOT, '.js', JS_FILES).filter((f) => !f.includes('node_modules') && !f.includes('audit.js'));

console.log(`\nScanning ${HTML_FILES.length} HTML files, ${JS_FILES.length} JS files...\n`);

// HTML checks
for (const file of HTML_FILES) {
  const content = fs.readFileSync(file, 'utf8');
  checkMaxlength(file, content);
  checkInlineHandlers(file, content);
  checkCSP(file, content);
  checkExternalLinks(file, content);
}

// JS checks
for (const file of JS_FILES) {
  if (file.includes('audit.js') || file.includes('node_modules')) continue;
  const content = fs.readFileSync(file, 'utf8');
  checkDangerousJS(file, content);
}

// Results
console.log('\n' + '='.repeat(50));
console.log('\nChecks performed:');
console.log('  [HTML] maxlength on text inputs and textareas');
console.log('  [HTML] No inline event handlers (onclick, etc.)');
console.log('  [HTML] Content-Security-Policy meta tag present');
console.log('  [HTML] External links have rel="noopener noreferrer"');
console.log('  [JS]   No eval() usage');
console.log('  [JS]   No innerHTML with dynamic values');
console.log('  [JS]   No document.write()');
console.log('  [JS]   No new Function() constructor');
console.log('  [JS]   No localStorage usage (sessionStorage only)');
console.log('');

if (failures > 0) {
  console.error(`AUDIT FAILED: ${failures} failure(s), ${warnings} warning(s)`);
  process.exit(1);
} else {
  console.log(`AUDIT PASSED: 0 failures, ${warnings} warning(s)`);
  process.exit(0);
}
