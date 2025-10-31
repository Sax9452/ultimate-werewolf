/**
 * Input validation utility functions
 * ป้องกัน XSS, SQL Injection และ input validation
 */

/**
 * Validate and sanitize player name
 * @param {string} name - Player name
 * @returns {Object} {valid: boolean, sanitized: string, error: string}
 */
export function validatePlayerName(name) {
  // Check if name is provided
  if (!name || typeof name !== 'string') {
    return { valid: false, sanitized: '', error: 'ชื่อผู้เล่นต้องไม่เป็นค่าว่าง' };
  }

  // Trim whitespace
  let sanitized = name.trim();

  // Check length
  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'ชื่อผู้เล่นต้องไม่เป็นค่าว่าง' };
  }

  if (sanitized.length > 20) {
    return { valid: false, sanitized: '', error: 'ชื่อผู้เล่นต้องไม่เกิน 20 ตัวอักษร' };
  }

  // ⭐ Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>{}[\]]/g, ''); // Remove < > { } [ ]

  // Check if only special characters were removed
  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'ชื่อผู้เล่นประกอบด้วยตัวอักษรที่ใช้ไม่ได้' };
  }

  return { valid: true, sanitized, error: null };
}

/**
 * Validate and sanitize lobby code
 * @param {string} code - Lobby code
 * @returns {Object} {valid: boolean, sanitized: string, error: string}
 */
export function validateLobbyCode(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, sanitized: '', error: 'รหัสห้องต้องไม่เป็นค่าว่าง' };
  }

  let sanitized = code.trim().toUpperCase();

  // Must be exactly 5 characters and alphanumeric
  if (sanitized.length !== 5) {
    return { valid: false, sanitized: '', error: 'รหัสห้องต้องมี 5 หลัก' };
  }

  if (!/^[A-Z0-9]{5}$/.test(sanitized)) {
    return { valid: false, sanitized: '', error: 'รหัสห้องต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น' };
  }

  return { valid: true, sanitized, error: null };
}

/**
 * Validate and sanitize chat message
 * @param {string} message - Chat message
 * @returns {Object} {valid: boolean, sanitized: string, error: string}
 */
export function validateChatMessage(message) {
  if (!message || typeof message !== 'string') {
    return { valid: false, sanitized: '', error: 'ข้อความต้องไม่เป็นค่าว่าง' };
  }

  let sanitized = message.trim();

  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'ข้อความต้องไม่เป็นค่าว่าง' };
  }

  if (sanitized.length > 200) {
    return { valid: false, sanitized: '', error: 'ข้อความต้องไม่เกิน 200 ตัวอักษร' };
  }

  // Remove potentially dangerous characters
  sanitized = sanitized.replace(/[<>{}[\]]/g, '');

  // Check if only special characters were removed
  if (sanitized.length === 0) {
    return { valid: false, sanitized: '', error: 'ข้อความประกอบด้วยตัวอักษรที่ใช้ไม่ได้' };
  }

  return { valid: true, sanitized, error: null };
}

/**
 * Validate socket event action payload
 * @param {Object} action - Action payload
 * @returns {Object} {valid: boolean, error: string}
 */
export function validateActionPayload(action) {
  if (!action || typeof action !== 'object') {
    return { valid: false, error: 'Invalid action payload' };
  }

  // Check for common fields
  if (action.targetId && typeof action.targetId !== 'string') {
    return { valid: false, error: 'Invalid targetId type' };
  }

  if (action.targetId2 && typeof action.targetId2 !== 'string') {
    return { valid: false, error: 'Invalid targetId2 type' };
  }

  if (action.lover1 && typeof action.lover1 !== 'string') {
    return { valid: false, error: 'Invalid lover1 type' };
  }

  if (action.lover2 && typeof action.lover2 !== 'string') {
    return { valid: false, error: 'Invalid lover2 type' };
  }

  if (action.type && typeof action.type !== 'string') {
    return { valid: false, error: 'Invalid action type' };
  }

  return { valid: true, error: null };
}

