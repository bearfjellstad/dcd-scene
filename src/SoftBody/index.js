const {
    // ShaderMaterial,
    // DataTexture,
    // RGBAFormat,
    // FloatType,
    // LinearFilter,
    // ClampToEdgeWrapping,
    // UVMapping,
    // BufferGeometry,
    // BufferAttribute,
    // Points,
} = global.THREE;

class SoftBody {
    positions = [];
    oldPositions = [];
    sticksById = {};
    sticks = [];
    gravity = {
        x: 0.05 * 1,
        y: -0.02 * 1,
        z: 0,
        enabled: true,
    };

    constructor({ geometry }) {
        this.geometry = geometry;
        this.widthSegments = (geometry.parameters.widthSegments || 1) + 1;
        this.heightSegments = (geometry.parameters.heightSegments || 1) + 1;
        this.count = this.widthSegments * this.heightSegments;

        this.init();
    }

    init() {
        this.positions = this.geometry.attributes.position.array;
        this.oldPositions = new Float32Array(this.positions.length);

        // seed initial oldPositions
        for (let i = 0; i < this.positions.length; i++) {
            this.oldPositions[i] = this.positions[i];
        }

        // add sticks
        for (let i = 0; i < this.count; i++) {
            this.populateSticks(i);
        }

        this.sticks = Object.values(this.sticksById);
        console.log('this.sticks', this.sticks);
    }

    getPosByIndex(index) {
        const i3 = index * 3;

        return {
            x: this.positions[i3],
            y: this.positions[i3 + 1],
            z: this.positions[i3 + 2],
        };
    }

    getDiff(p1, p2) {
        const diff = {
            x: p1.x - p2.x,
            y: p1.y - p2.y,
            z: p1.z - p2.z,
        };

        return {
            delta: diff,
            length: Math.sqrt(diff.x * diff.x + diff.y * diff.y),
        };
    }

    populateSticks(index) {
        const x = index % this.widthSegments;
        const y = ~~(index / this.widthSegments);

        let topLeft = { id: null };
        let top = { id: null };
        let topRight = { id: null };
        let right = { id: null };
        let bottomRight = { id: null };
        let bottom = { id: null };
        let bottomLeft = { id: null };
        let left = { id: null };

        if (x !== 0) {
            left.fromIndex = index - 1;
            left.toIndex = index;
            left.id = `${left.fromIndex}-${left.toIndex}`;

            // if (y !== 0) {
            //     topLeft.fromIndex = index - this.widthSegments - 1;
            //     topLeft.toIndex = index;
            //     topLeft.id = `${topLeft.fromIndex}-${topLeft.toIndex}`;
            // }

            // if (y !== this.heightSegments - 1) {
            //     bottomLeft.fromIndex = index + this.widthSegments - 1;
            //     bottomLeft.toIndex = index;
            //     bottomLeft.id = `${bottomLeft.fromIndex}-${bottomLeft.toIndex}`;
            // }
        }

        if (x !== this.widthSegments - 1) {
            right.fromIndex = index;
            right.toIndex = index + 1;
            right.id = `${right.fromIndex}-${right.toIndex}`;

            // if (y !== 0) {
            //     topRight.fromIndex = index - this.widthSegments + 1;
            //     topRight.toIndex = index;
            //     topRight.id = `${topRight.fromIndex}-${topRight.toIndex}`;
            // }

            // if (y !== this.heightSegments - 1) {
            //     bottomRight.fromIndex = index + this.widthSegments + 1;
            //     bottomRight.toIndex = index;
            //     bottomRight.id = `${bottomRight.fromIndex}-${bottomRight.toIndex}`;
            // }
        }

        if (y !== 0) {
            top.fromIndex = index - this.widthSegments;
            top.toIndex = index;
            top.id = `${top.fromIndex}-${top.toIndex}`;
        }

        if (y !== this.heightSegments - 1) {
            bottom.fromIndex = index;
            bottom.toIndex = index + this.widthSegments;
            bottom.id = `${bottom.fromIndex}-${bottom.toIndex}`;
        }

        // if (topLeft.id && !this.sticksById[topLeft.id]) {
        //     // find initial lengths
        //     const fromPos = this.getPosByIndex(topLeft.fromIndex);
        //     const toPos = this.getPosByIndex(topLeft.toIndex);
        //     console.log('topLeft', fromPos, toPos);
        //     topLeft.initialLength = this.getDiff(fromPos, toPos).length;

        //     this.sticksById[topLeft.id] = topLeft;
        // }
        if (top.id && !this.sticksById[top.id]) {
            // find initial lengths
            const fromPos = this.getPosByIndex(top.fromIndex);
            const toPos = this.getPosByIndex(top.toIndex);
            top.initialLength = this.getDiff(fromPos, toPos).length;

            this.sticksById[top.id] = top;
        }
        // if (topRight.id && !this.sticksById[topRight.id]) {
        //     // find initial lengths
        //     const fromPos = this.getPosByIndex(topRight.fromIndex);
        //     const toPos = this.getPosByIndex(topRight.toIndex);
        //     topRight.initialLength = this.getDiff(fromPos, toPos).length;

        //     this.sticksById[topRight.id] = topRight;
        // }
        if (right.id && !this.sticksById[right.id]) {
            // find initial lengths
            const fromPos = this.getPosByIndex(right.fromIndex);
            const toPos = this.getPosByIndex(right.toIndex);
            right.initialLength = this.getDiff(fromPos, toPos).length;

            this.sticksById[right.id] = right;
        }
        // if (bottomRight.id && !this.sticksById[bottomRight.id]) {
        //     // find initial lengths
        //     const fromPos = this.getPosByIndex(bottomRight.fromIndex);
        //     const toPos = this.getPosByIndex(bottomRight.toIndex);
        //     bottomRight.initialLength = this.getDiff(fromPos, toPos).length;

        //     this.sticksById[bottomRight.id] = bottomRight;
        // }
        if (bottom.id && !this.sticksById[bottom.id]) {
            // find initial lengths
            const fromPos = this.getPosByIndex(bottom.fromIndex);
            const toPos = this.getPosByIndex(bottom.toIndex);
            bottom.initialLength = this.getDiff(fromPos, toPos).length;

            this.sticksById[bottom.id] = bottom;
        }
        // if (bottomLeft.id && !this.sticksById[bottomLeft.id]) {
        //     // find initial lengths
        //     const fromPos = this.getPosByIndex(bottomLeft.fromIndex);
        //     const toPos = this.getPosByIndex(bottomLeft.toIndex);
        //     bottomLeft.initialLength = this.getDiff(fromPos, toPos).length;

        //     this.sticksById[bottomLeft.id] = bottomLeft;
        // }
        if (left.id && !this.sticksById[left.id]) {
            // find initial lengths
            const fromPos = this.getPosByIndex(left.fromIndex);
            const toPos = this.getPosByIndex(left.toIndex);
            left.initialLength = this.getDiff(fromPos, toPos).length;

            this.sticksById[left.id] = left;
        }
    }

    getSurroundingStickIds(index) {
        const x = index % this.widthSegments;
        const y = ~~(index / this.widthSegments);

        let top = null;
        let right = null;
        let bottom = null;
        let left = null;

        if (x !== 0 && x !== this.widthSegments - 1) {
            const leftFromIndex = index - 1;
            const leftToIndex = index;
            left = `${leftFromIndex}-${leftToIndex}`;

            const rightFromIndex = index;
            const rightToIndex = index + 1;
            right = `${rightFromIndex}-${rightToIndex}`;
        }

        if (y !== 0 && y !== this.heightSegments - 1) {
            const topFromIndex = index - this.widthSegments;
            const topToIndex = index;
            top = `${topFromIndex}-${topToIndex}`;

            const bottomFromIndex = index;
            const bottomToIndex = index + this.widthSegments;
            bottom = `${bottomFromIndex}-${bottomToIndex}`;
        }

        return [top, right, bottom, left];
    }

    clamp(min, max, val) {
        return Math.max(min, Math.min(max, val));
    }

    update() {
        const stickCount = this.sticks.length;

        for (let i = 0; i < 1; i++) {
            for (const stick of this.sticks) {
                const fromI3 = stick.fromIndex * 3;
                const toI3 = stick.toIndex * 3;

                const from = {
                    x: this.positions[fromI3 + 0],
                    y: this.positions[fromI3 + 1],
                    z: this.positions[fromI3 + 2],
                };
                const to = {
                    x: this.positions[toI3 + 0],
                    y: this.positions[toI3 + 1],
                    z: this.positions[toI3 + 2],
                };

                const { delta, length } = this.getDiff(from, to);

                const diff = length - stick.initialLength;
                const perc = diff / length / 2;
                const offsetX = delta.x * perc * (1 / stickCount);
                const offsetY = delta.y * perc * (1 / stickCount);

                if (stick.fromIndex > this.widthSegments - 1) {
                    this.positions[fromI3 + 0] -= offsetX;
                    this.positions[fromI3 + 1] -= offsetY;
                }

                if (stick.toIndex > this.widthSegments - 1) {
                    this.positions[toI3 + 0] += offsetX;
                    this.positions[toI3 + 1] += offsetY;
                }
            }
        }

        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;

            const velocity = {
                x: this.positions[i3 + 0] - this.oldPositions[i3 + 0],
                y: this.positions[i3 + 1] - this.oldPositions[i3 + 1],
                z: this.positions[i3 + 2] - this.oldPositions[i3 + 2],
            };

            // const surroundingSticksIds = this.getSurroundingStickIds(i);

            // for (let physLoopIndex = 0; physLoopIndex < 1; physLoopIndex++) {
            //     for (const stickId of surroundingSticksIds) {
            //         if (stickId !== null) {
            //             const stick = this.sticksById[stickId];

            //         }
            //     }
            // }

            if (i > this.widthSegments - 1) {
                // update new positions
                this.positions[i3 + 0] += velocity.x;
                this.positions[i3 + 1] += velocity.y;
                this.positions[i3 + 2] += velocity.z;

                if (this.gravity.enabled) {
                    this.positions[i3 + 0] += this.gravity.x;
                    this.positions[i3 + 1] += this.gravity.y;
                    this.positions[i3 + 2] += this.gravity.z;
                }
            }

            // update old positions
            this.oldPositions[i3 + 0] = this.positions[i3 + 0];
            this.oldPositions[i3 + 1] = this.positions[i3 + 1];
            this.oldPositions[i3 + 2] = this.positions[i3 + 2];
        }

        this.geometry.attributes.position.needsUpdate = true;

        // reset sticks
        // for (const stick of this.sticks) {

        // }
        // Object.values(this.sticksById).forEach(stick => {
        //     stick.isDone = false;
        // });
    }

    setGravity(values) {
        this.gravity = {
            ...this.gravity,
            ...values,
        };
    }
}

export default SoftBody;
