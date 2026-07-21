import type { ElementInput } from '../types';
import { $$ } from './dom';
import { isVisible } from './filter';

export function getMaxPathLength(element: ElementInput): number {
    return isVisible(element)
        ? Math.ceil(
              Math.max(
                  0,
                  ...$$<SVGGeometryElement>(
                      '[stroke]',
                      element instanceof Element ? element : undefined,
                  ).map((stroke) => stroke.getTotalLength()),
              ),
          )
        : 0;
}
