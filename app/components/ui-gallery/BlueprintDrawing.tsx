import { PrimitivesBlueprint } from "./blueprint/PrimitivesBlueprint";
import { PrimitivesMotion } from "./blueprint/PrimitivesMotion";

/**
 * 页头右侧的组件制图：圆形 / 胶囊 / 开关 / 按钮 / 卡片 / 滑杆 六种形态循环变形。
 *
 * 移植自 coss.com/ui（MIT，© 2025 coss.com and Origin UI），
 * 许可证全文见 ./blueprint/LICENSE。
 */
export function BlueprintDrawing({ className = "" }: { className?: string }) {
  return (
    <div className={`relative select-none ${className}`}>
      <PrimitivesMotion>
        <PrimitivesBlueprint />
      </PrimitivesMotion>
    </div>
  );
}
