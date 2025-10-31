/**
 * Role helper utilities
 * แก้ code duplication สำหรับ role emojis, colors
 */

export const roleEmojis = {
  'ชาวบ้าน': '👨‍🌾',
  'มนุษย์หมาป่า': '🐺',
  'หมอดู': '🔮',
  'บอดี้การ์ด': '🛡️',
  'นักล่า': '🏹',
  'คิวปิด': '💘',
  'ลูกหมาป่า': '🐺',
  'ผู้ทรยศ': '🗡️',
  'แม่มด': '🧙‍♀️',
  'ตัวตลก': '🤡',
  'อัลฟ่ามนุษย์หมาป่า': '👑🐺'
};

export const roleColors = {
  'ชาวบ้าน': 'from-green-500 to-emerald-500',
  'มนุษย์หมาป่า': 'from-red-500 to-rose-500',
  'หมอดู': 'from-purple-500 to-violet-500',
  'บอดี้การ์ด': 'from-blue-500 to-cyan-500',
  'นักล่า': 'from-amber-500 to-orange-500',
  'คิวปิด': 'from-pink-500 to-rose-500',
  'ลูกหมาป่า': 'from-red-600 to-red-700',
  'ผู้ทรยศ': 'from-gray-700 to-gray-800',
  'แม่มด': 'from-purple-600 to-purple-700',
  'ตัวตลก': 'from-green-400 to-emerald-400',
  'อัลฟ่ามนุษย์หมาป่า': 'from-red-700 to-red-900'
};

export const roleTextColors = {
  'ชาวบ้าน': 'text-green-400',
  'มนุษย์หมาป่า': 'text-red-400',
  'หมอดู': 'text-purple-400',
  'บอดี้การ์ด': 'text-blue-400',
  'นักล่า': 'text-amber-400',
  'คิวปิด': 'text-pink-400',
  'ลูกหมาป่า': 'text-red-500',
  'ผู้ทรยศ': 'text-gray-400',
  'แม่มด': 'text-purple-500',
  'ตัวตลก': 'text-green-300',
  'อัลฟ่ามนุษย์หมาป่า': 'text-red-600'
};

export const roleBadgeColors = {
  'ชาวบ้าน': 'bg-green-900/50 border-green-600 text-green-300',
  'มนุษย์หมาป่า': 'bg-red-900/50 border-red-600 text-red-300',
  'หมอดู': 'bg-purple-900/50 border-purple-600 text-purple-300',
  'บอดี้การ์ด': 'bg-blue-900/50 border-blue-600 text-blue-300',
  'นักล่า': 'bg-orange-900/50 border-orange-600 text-orange-300',
  'คิวปิด': 'bg-pink-900/50 border-pink-600 text-pink-300',
  'ลูกหมาป่า': 'bg-red-900/50 border-red-600 text-red-300',
  'ผู้ทรยศ': 'bg-gray-900/50 border-gray-600 text-gray-300',
  'แม่มด': 'bg-purple-900/60 border-purple-500 text-purple-200',
  'ตัวตลก': 'bg-emerald-900/50 border-emerald-600 text-emerald-300',
  'อัลฟ่ามนุษย์หมาป่า': 'bg-red-900/70 border-red-500 text-red-200'
};

/**
 * Get emoji for a role
 * @param {string} role - Role name
 * @returns {string} Emoji
 */
export function getRoleEmoji(role) {
  return roleEmojis[role] || '❓';
}

/**
 * Get gradient colors for a role
 * @param {string} role - Role name
 * @returns {string} Tailwind gradient classes
 */
export function getRoleColor(role) {
  return roleColors[role] || 'from-gray-500 to-slate-500';
}

/**
 * Get text color for a role
 * @param {string} role - Role name
 * @returns {string} Tailwind text color class
 */
export function getRoleTextColor(role) {
  return roleTextColors[role] || 'text-gray-400';
}

/**
 * Get badge color for a role
 * @param {string} role - Role name
 * @returns {string} Tailwind badge classes
 */
export function getRoleBadgeColor(role) {
  return roleBadgeColors[role] || 'bg-slate-700 border-slate-600 text-slate-300';
}

