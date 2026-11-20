/**
 * 纸张卡片数据接口
 */
export interface PaperCardData {
  /** 唯一标识符 */
  id: string;
  /** 卡片文本内容 */
  text: string;
  /** 卡片在页面上的 X 坐标 */
  x: number;
  /** 卡片在页面上的 Y 坐标 */
  y: number;
  /** 卡片旋转角度（度） */
  rotation: number;
  /** 创建时间戳 */
  timestamp: number;
  /** 是否正在打字动画中 */
  isTyping: boolean;
}

/**
 * 坐标点接口
 */
export interface Coordinates {
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
}

/**
 * 舞台可视区域，用于把打印出来的纸卡固定在区块内。
 */
export interface StageSize {
  width: number;
  height: number;
}
