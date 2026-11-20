import {
  ConstructionAnnotation,
  ConstructionStage,
} from "./ConstructionMotion";
import { SwitchRadiusVisibility, SwitchThumbVisibility } from "./Switch";

/**
 * Ported from coss.com/ui (MIT, © 2025 coss.com and Origin UI).
 * See ./LICENSE for the full license text.
 */
// Clear only the grid segments behind each stage's visible annotations.
const labelGaps = [
  // Avatar radius and angle.
  "M324 132V163 M283 164H354",
  // Pill radius and width.
  "M172 164H200 M284 298V320",
  // Switch width; its thumb radius follows a separate timeline below.
  "M284 298V320",
  // Button padding.
  "M164 240V260 M140 244H168",
  // Card inset and inner width.
  "M374 204H394 M284 298V320",
  // Slider travel and percentage labels.
  "M284 121V142 M273 124H295 M124 298V320 M284 298V320 M444 298V320",
];

export function GridLabelMask() {
  return (
    <g fill="none" stroke="black" strokeOpacity="1" strokeWidth="1.3">
      {labelGaps.map((d, stage) => (
        <ConstructionStage key={d} stage={stage}>
          <ConstructionAnnotation stage={stage}>
            <path d={d} />
          </ConstructionAnnotation>
        </ConstructionStage>
      ))}
      <g opacity="0">
        <SwitchThumbVisibility />
        <g opacity="0">
          <SwitchRadiusVisibility />
          <path d="M324 164H354" />
        </g>
      </g>
    </g>
  );
}
