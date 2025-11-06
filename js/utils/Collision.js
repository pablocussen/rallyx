/**
 * Sistema de Detección de Colisiones
 * AABB (Axis-Aligned Bounding Box) optimizado
 */

export class Collision {
    static rectRect(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    static circleCircle(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < a.radius + b.radius;
    }

    static pointRect(px, py, rect) {
        return (
            px >= rect.x &&
            px <= rect.x + rect.width &&
            py >= rect.y &&
            py <= rect.y + rect.height
        );
    }

    static distance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static distanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }

    static lineRect(x1, y1, x2, y2, rect) {
        const left = this.lineLine(x1, y1, x2, y2, rect.x, rect.y, rect.x, rect.y + rect.height);
        const right = this.lineLine(x1, y1, x2, y2, rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height);
        const top = this.lineLine(x1, y1, x2, y2, rect.x, rect.y, rect.x + rect.width, rect.y);
        const bottom = this.lineLine(x1, y1, x2, y2, rect.x, rect.y + rect.height, rect.x + rect.width, rect.y + rect.height);

        return left || right || top || bottom;
    }

    static lineLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const denominator = ((y4 - y3) * (x2 - x1)) - ((x4 - x3) * (y2 - y1));
        if (denominator === 0) return false;

        const ua = (((x4 - x3) * (y1 - y3)) - ((y4 - y3) * (x1 - x3))) / denominator;
        const ub = (((x2 - x1) * (y1 - y3)) - ((y2 - y1) * (x1 - x3))) / denominator;

        return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
    }

    static isOutOfBounds(entity, width, height) {
        return (
            entity.x < 0 ||
            entity.y < 0 ||
            entity.x + entity.width > width ||
            entity.y + entity.height > height
        );
    }
}

export default Collision;
