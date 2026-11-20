/**
 * Values ported verbatim from leyen-me/typewriter `app/lib/constants.ts`.
 * The only addition is `STAGE`, which describes the gallery-specific rule for
 * keeping a dragged card reachable inside the block.
 */

// 卡片尺寸
export const DEFAULT_CARD_WIDTH = 280;
export const DEFAULT_CARD_HEIGHT = 180;

// Z-index 层级
export const Z_INDEX = {
  BASE: 10,
  MACHINE: 50,
} as const;

// 卡片位置计算
export const CARD_POSITION = {
  MACHINE_HEIGHT: 320,
  CARD_OFFSET_FROM_MACHINE: 550,
  ROTATION_RANGE: 4,
  ROTATION_OFFSET: -2,
} as const;

// 打字动画配置
export const TYPING_CONFIG = {
  INITIAL_DELAY: 100,
  SHORT_TEXT_THRESHOLD: 50,
  LONG_TEXT_THRESHOLD: 150,
  SHORT_TEXT: {
    MIN_DELAY: 30,
    VARIANCE: 50,
  },
  MEDIUM_TEXT: {
    MIN_DELAY: 15,
    VARIANCE: 25,
  },
  LONG_TEXT: {
    MIN_DELAY: 5,
    VARIANCE: 15,
  },
} as const;

// 动画配置
export const ANIMATION = {
  EJECT_DURATION: 500,
  EJECT_BOUNCE_PERCENT: -5,
  EJECT_FINAL_PERCENT: 0,
  TYPING_HOLD_PERCENT: 15,
  DRAG_SCALE: 1.02,
  TRANSITION_DURATION: 200,
} as const;

// 颜色配置
export const COLORS = {
  PAPER: '#ffffff',
  DESK_BG: '#d4d8e0',
  DESK_GRID: '#000',
} as const;

// 设备尺寸
export const DEVICE = {
  WIDTH_MOBILE: 380,
  WIDTH_DESKTOP: 440,
  SCALE_MOBILE: 0.9,
  SCALE_DESKTOP: 1,
  BOTTOM_MARGIN: 24, // mb-6 = 24px
} as const;

// Gallery-only: 拖动时至少保留多少像素在舞台内，避免纸卡被拖到完全不可见
export const STAGE = {
  MIN_VISIBLE_X: 80,
  MIN_VISIBLE_Y: 48,
} as const;

// Gallery-only: 桌面、纸卡与控制台按此比例整体缩放（以底边中点为锚点）。
// 舞台仍是全幅背景，缩放只作用于纸卡/控制台的场景层；
// 拖动坐标会按该比例反算，保证指针与纸卡 1:1 跟随。
export const SCENE_SCALE = 0.84;

// 纸卡聚焦后用方向键移动的步长（无障碍）
export const KEYBOARD_STEP = 16;
