import type { ElementInput, Point } from '../types';
import { dimensions } from './dimensions';
import { getEventPos, on } from './event';
import { last, pointInRect } from './lang';

export class MouseTracker {
    private positions: Point[] = [];
    private unbind?: () => void;
    private interval?: ReturnType<typeof setInterval>;

    init(): void {
        this.positions = [];
        let position: Point | undefined;
        this.unbind = on(document, 'mousemove', (event) => {
            position = getEventPos(event);
        });
        this.interval = setInterval(() => {
            if (!position) {
                return;
            }
            this.positions.push(position);
            if (this.positions.length > 5) {
                this.positions.shift();
            }
        }, 50);
    }

    cancel(): void {
        this.unbind?.();
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    movesTo(target: ElementInput): boolean {
        if (this.positions.length < 2) {
            return false;
        }
        const rect = dimensions(target);
        const previous = this.positions[0];
        const position = last(this.positions);
        if (!previous || !position || pointInRect(position, rect)) {
            return false;
        }
        const { left, right, top, bottom } = rect;
        const path: [Point, Point] = [previous, position];
        const diagonals: [Point, Point][] = [
            [
                { x: left, y: top },
                { x: right, y: bottom },
            ],
            [
                { x: left, y: bottom },
                { x: right, y: top },
            ],
        ];
        return diagonals.some((diagonal) => {
            const intersection = intersect(path, diagonal);
            return Boolean(intersection && pointInRect(intersection, rect));
        });
    }
}

function intersect(
    [{ x: x1, y: y1 }, { x: x2, y: y2 }]: [Point, Point],
    [{ x: x3, y: y3 }, { x: x4, y: y4 }]: [Point, Point],
): Point | false {
    const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    if (denominator === 0) {
        return false;
    }
    const ratio = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
    return ratio < 0 ? false : { x: x1 + ratio * (x2 - x1), y: y1 + ratio * (y2 - y1) };
}
