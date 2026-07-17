// Maps a browser KeyboardEvent to the canonical key name shared with the Lua
// side (see client/commands.lua KEY_CODES). Returns null for keys we cannot
// bind (unknown codes). Escape is intentionally left unmapped: it is reserved
// to close the menu / cancel a capture.

const CODE_MAP: Record<string, string> = {
  Space: 'SPACE',
  Enter: 'ENTER',
  Tab: 'TAB',
  Backspace: 'BACKSPACE',
  Delete: 'DELETE',
  Insert: 'INSERT',
  Home: 'HOME',
  End: 'END',
  PageUp: 'PAGEUP',
  PageDown: 'PAGEDOWN',
  ArrowLeft: 'LEFT',
  ArrowUp: 'UP',
  ArrowRight: 'RIGHT',
  ArrowDown: 'DOWN',
  ShiftLeft: 'SHIFT',
  ShiftRight: 'SHIFT',
  ControlLeft: 'CTRL',
  ControlRight: 'CTRL',
  AltLeft: 'ALT',
  AltRight: 'ALT',
  CapsLock: 'CAPSLOCK',
  Minus: 'MINUS',
  Equal: 'EQUAL',
  BracketLeft: 'LBRACKET',
  BracketRight: 'RBRACKET',
  Backslash: 'BACKSLASH',
  Semicolon: 'SEMICOLON',
  Quote: 'QUOTE',
  Comma: 'COMMA',
  Period: 'PERIOD',
  Slash: 'SLASH',
  Backquote: 'BACKQUOTE',
  NumpadMultiply: 'NUMMULTIPLY',
  NumpadAdd: 'NUMADD',
  NumpadSubtract: 'NUMSUBTRACT',
  NumpadDecimal: 'NUMDECIMAL',
  NumpadDivide: 'NUMDIVIDE',
}

export function codeToKeyName(e: KeyboardEvent): string | null {
  const code = e.code

  if (/^F([1-9]|1[0-2])$/.test(code)) return code

  const letter = /^Key([A-Z])$/.exec(code)
  if (letter) return letter[1]

  const digit = /^Digit([0-9])$/.exec(code)
  if (digit) return digit[1]

  const num = /^Numpad([0-9])$/.exec(code)
  if (num) return 'NUM' + num[1]

  return CODE_MAP[code] ?? null
}

const LABEL_MAP: Record<string, string> = {
  CTRL: 'Ctrl',
  ALT: 'Alt',
  SHIFT: 'Shift',
  PAGEUP: 'Page Up',
  PAGEDOWN: 'Page Down',
  CAPSLOCK: 'Caps',
  BACKSPACE: 'Backspace',
  DELETE: 'Del',
  INSERT: 'Ins',
  LBRACKET: '[',
  RBRACKET: ']',
  BACKSLASH: '\\',
  SEMICOLON: ';',
  QUOTE: "'",
  COMMA: ',',
  PERIOD: '.',
  SLASH: '/',
  BACKQUOTE: '`',
  MINUS: '-',
  EQUAL: '=',
  NUMMULTIPLY: 'Num *',
  NUMADD: 'Num +',
  NUMSUBTRACT: 'Num -',
  NUMDECIMAL: 'Num .',
  NUMDIVIDE: 'Num /',
  UP: '↑',
  DOWN: '↓',
  LEFT: '←',
  RIGHT: '→',
}

export function formatKeyLabel(name: string | null | false): string {
  if (!name) return ''
  if (LABEL_MAP[name]) return LABEL_MAP[name]
  if (/^NUM[0-9]$/.test(name)) return 'Num ' + name.slice(3)
  return name
}

// Splits a canonical combo ("ALT+F3") into its formatted parts (['Alt', 'F3']).
export function formatCombo(combo: string | false | null): string[] {
  if (!combo) return []
  return combo.split('+').map((part) => formatKeyLabel(part))
}
