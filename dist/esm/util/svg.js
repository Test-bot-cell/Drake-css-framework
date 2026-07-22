import { $$ } from './dom.js';
import { isVisible } from './filter.js';

function getMaxPathLength(element) {
  return isVisible(element) ? Math.ceil(
    Math.max(
      0,
      ...$$(
        "[stroke]",
        element instanceof Element ? element : void 0
      ).map((stroke) => stroke.getTotalLength())
    )
  ) : 0;
}

export { getMaxPathLength };
