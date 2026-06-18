/**
 * Escape a value for safe interpolation inside a JSON string literal.
 *
 * Non-string inputs (number, boolean, null) pass through unchanged — they are
 * valid JSON values already and need no escaping. Strings are escaped for the
 * JSON-significant character set: backslash, double quote, and the standard
 * short-form escapes (`\b`, `\f`, `\n`, `\r`, `\t`), plus any character in
 * U+0000–U+001F rendered as `\uXXXX`.
 *
 * Mirrors the escape map Node's own `JSON.stringify` uses internally, so
 * `JSON.parse('"' + jsonEscape(s) + '"') === s` for every string `s`.
 *
 * @param {unknown} value The value to escape.
 * @returns {unknown} The escaped string, or the original value if non-string.
 */
function jsonEscape(value) {
  if (typeof value !== 'string') {
    return value;
  }

  let result = '';
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    const code = ch.charCodeAt(0);

    switch (ch) {
      case '\\':
        result += '\\\\';
        break;
      case '"':
        result += '\\"';
        break;
      case '\b':
        result += '\\b';
        break;
      case '\f':
        result += '\\f';
        break;
      case '\n':
        result += '\\n';
        break;
      case '\r':
        result += '\\r';
        break;
      case '\t':
        result += '\\t';
        break;
      default:
        if (code < 0x20) {
          result += '\\u' + code.toString(16).padStart(4, '0');
        } else {
          result += ch;
        }
    }
  }
  return result;
}

module.exports = { jsonEscape };