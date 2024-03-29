import THREE from '../utils/threeProxy';

import GPUComputationRenderer from './utils/GPUComputationRenderer';
import getFactors from '../utils/getFactors';

import basicVertexShader from '../shaders/basic.vertex.glsl';

import physicsPositionShader from './shaders/physicsPosition.fragment.glsl';
import physicsVelocityShader from './shaders/physicsVelocity.fragment.glsl';
import blankVelocityShader from './shaders/blankVelocity.fragment.glsl';
import physicsParticleVertex from './shaders/physicsParticle.vertex.glsl';
import physicsParticleFragment from './shaders/physicsParticle.fragment.glsl';

class Particles {
    constructor({
        renderer,
        particles,

        positions,
        velocities,
        positionShader,
        velocityShader,

        uniformUpdates,
        attributes,

        particleSize,
        particleScale,
        noiseStrength,
        transparent,
        depthTest,
        blending,
        particleMaterial,
        simulationMaterial,
        velocitySettings,

        createPoints,
    }) {
        this.object3d = new THREE.Object3D();

        this.renderer = renderer;
        this.particles = particles;

        this.positions = positions;
        this.velocities = velocities;
        this.positionShader = positionShader;
        this.velocityShader = velocityShader;

        this.uniformUpdates = uniformUpdates;
        this.attributes = [...(attributes || [])];

        this.particleSize = particleSize || 50;
        this.particleScale = particleScale || window.innerHeight / 25;
        this.noiseStrength = noiseStrength === undefined ? 5 : noiseStrength;
        this.transparent = transparent === undefined ? true : transparent;
        this.depthTest = depthTest === undefined ? false : depthTest;
        this.blending =
            blending === undefined ? THREE.NormalBlending : blending;

        this.createPoints = createPoints === undefined ? true : createPoints;

        this.particleMaterial = particleMaterial;
        this.simulationMaterial = simulationMaterial;
        this.velocitySettings = velocitySettings || {};

        this.defines = {};
        this.velocityDefines = {
            VELOCITY_DAMING:
                this.velocitySettings.damping === undefined
                    ? 0.978
                    : this.velocitySettings.damping,
            VELOCITY_MOUSE_RADIUS:
                this.velocitySettings.mouseRadius === undefined
                    ? 30
                    : this.velocitySettings.mouseRadius,
            VELOCITY_MOUSE_STRENGTH:
                this.velocitySettings.mouseStrength === undefined
                    ? 0.04
                    : this.velocitySettings.mouseStrength,
            VELOCITY_REST_INERTIA:
                this.velocitySettings.restInertia === undefined
                    ? 0.0002
                    : this.velocitySettings.restInertia,
        };

        if (!this.validateData()) {
            return;
        }

        this.init();
    }

    generateAttributeData({ key, dimensions, indexes }) {
        if (!this.particles || !this.particles[0][key]) return null;

        switch (key) {
            case 'aSize':
                this.defines.HAS_SIZE = true;
                break;
            case 'aColor':
                this.defines.HAS_COLOR = true;
                break;
            case 'velocity':
                this.defines.HAS_VELOCITY = true;
                break;
            default:
                break;
        }

        const data = new Float32Array(this.particles.length * dimensions);

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const i3 = i * dimensions;

            for (let j = 0; j < dimensions; j++) {
                data[i3 + j] =
                    indexes && indexes[j]
                        ? particle[key][indexes[j]] || 0
                        : particle[key][j];
            }
        }

        return data;
    }

    init() {
        const count =
            this.particles && this.particles.length
                ? this.particles.length
                : this.positions.length / 4;
        const factors = getFactors(count);

        const textureWidth = factors[Math.floor(factors.length / 2)];
        if (!Number.isInteger(textureWidth)) {
            console.warn(`Unable to factorize ${count} particles`);
        }

        const textureHeight = count / textureWidth;
        this.width = textureWidth;
        this.height = textureHeight;

        for (const attribute of this.attributes) {
            attribute.data = this.generateAttributeData(attribute);
        }

        if (!this.positions) {
            this.positions = this.generateAttributeData({
                key: 'position',
                dimensions: 4,
                indexes: ['x', 'y', 'z', 'w'],
            });
        }

        if (!this.velocities) {
            this.velocities = this.generateAttributeData({
                key: 'velocity',
                dimensions: 4,
                indexes: ['x', 'y', 'z', 'w'],
            });
        }

        if (!this.defines.HAS_VELOCITY) {
            this.defines.HAS_NO_VELOCITY = true;
            this.noVelocities = true;
        }

        this.particlePositions = new THREE.DataTexture(
            new Float32Array(this.positions.length),
            textureWidth,
            textureHeight,
            THREE.RGBAFormat,
            THREE.FloatType
        );

        this.particlePositions.image.data = this.positions;

        this.particlePositions.generateMipmaps = false;
        this.particlePositions.wrapS = this.particlePositions.wrapT =
            THREE.ClampToEdgeWrapping;
        this.particlePositions.minFilter = THREE.LinearFilter;
        this.particlePositions.needsUpdate = true;

        this.setupComputationRenderer();
    }

    render() {
        this.gpuCompute.compute();

        this.particleMaterial.uniforms.uPositions.value =
            this.gpuCompute.getCurrentRenderTarget(
                this.positionVariable
            ).texture;
        this.particleMaterial.uniforms.uVelocities.value =
            this.gpuCompute.getCurrentRenderTarget(
                this.velocityVariable
            ).texture;
    }

    setupComputationRenderer() {
        // Create computation renderer
        this.gpuCompute = new GPUComputationRenderer(
            this.width,
            this.height,
            this.renderer
        );

        const dtPosition = this.gpuCompute.createTexture();
        const dtRestPosition = this.gpuCompute.createTexture();
        const dtVelocity = this.gpuCompute.createTexture();
        dtPosition.image.data = this.positions;
        dtRestPosition.image.data = this.positions;
        dtVelocity.image.data = this.velocities;

        let positionShader = physicsPositionShader;
        if (this.positionShader) {
            positionShader = this.positionShader;
        } else if (this.simulationMaterial) {
            positionShader = this.simulationMaterial.fragmentShader;
        }

        this.positionVariable = this.gpuCompute.addVariable(
            'uPositions',
            positionShader,
            dtPosition
        );
        this.velocityVariable = this.gpuCompute.addVariable(
            'uVelocities',
            this.velocityShader ||
                (this.noVelocities
                    ? blankVelocityShader
                    : physicsVelocityShader),
            dtVelocity
        );

        this.gpuCompute.setVariableDependencies(this.positionVariable, [
            this.positionVariable,
            this.velocityVariable,
        ]);
        this.gpuCompute.setVariableDependencies(this.velocityVariable, [
            this.positionVariable,
            this.velocityVariable,
        ]);

        this.positionUniforms = this.positionVariable.material.uniforms;
        this.positionVariable.material.defines = {
            ...this.defines,
            ...this.positionVariable.material.defines,
        };

        this.positionUniforms.uRestPositions = {
            value: dtRestPosition,
        };
        this.velocityUniforms = this.velocityVariable.material.uniforms;
        this.velocityUniforms.uRestPositions = {
            value: dtRestPosition,
        };
        this.velocityVariable.material.defines = {
            ...this.velocityVariable.material.defines,
            ...this.velocityDefines,
        };

        this.positionUniforms.uTime = { value: 0 };
        this.positionUniforms.uAmp = { value: this.noiseStrength };

        this.velocityUniforms.uTime = { value: 0 };
        this.velocityUniforms.uMouse3d = { value: new THREE.Vector3() };

        this.uniformUpdates.elapsed.push(this.positionUniforms.uTime);
        this.uniformUpdates.elapsed.push(this.velocityUniforms.uTime);
        this.uniformUpdates.mousePosition3d.push(
            this.velocityUniforms.uMouse3d
        );

        // Add uniforms from simulationMaterial
        if (this.simulationMaterial) {
            for (const [key, val] of Object.entries(
                this.simulationMaterial.uniforms
            )) {
                this.positionUniforms[key] = val;
            }
        }

        if (this.gpuCompute.init() !== null) {
            console.log('Something went wrong');
        }

        if (!this.particleMaterial) {
            this.particleMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    uSize: { value: this.particleSize },
                    uScale: { value: this.particleScale },
                    uTime: { value: 0 },
                    uAmp: { value: this.noiseStrength },
                },
                vertexShader: physicsParticleVertex,
                fragmentShader: physicsParticleFragment,
                transparent: this.transparent,
                depthTest: this.depthTest,
                blending: this.blending,
            });

            this.uniformUpdates.elapsed.push(
                this.particleMaterial.uniforms.uTime
            );
        }

        this.particleMaterial.uniforms.uPositions = { value: dtPosition };
        this.particleMaterial.uniforms.uRestPositions = {
            value: dtRestPosition,
        };
        this.particleMaterial.uniforms.uVelocities = { value: dtVelocity };

        this.particleMaterial.defines = {
            ...this.defines,
            ...this.particleMaterial.defines,
        };

        const count = this.width * this.height;

        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        geometry.addAttribute(
            'position',
            new THREE.BufferAttribute(positions, 3)
        );

        const indexes = new Float32Array(count * 2);
        for (let i = 0; i < indexes.length; i++) {
            const x = (i % this.width) / this.width;
            const y = ~~(i / this.width) / this.height;

            indexes[i * 2] = x;
            indexes[i * 2 + 1] = y;
        }
        this.indexesAttribute = new THREE.BufferAttribute(indexes, 2);
        geometry.addAttribute('uv', this.indexesAttribute);

        if (this.attributes && this.attributes.length) {
            for (const attribute of this.attributes) {
                geometry.addAttribute(
                    attribute.key,
                    new THREE.BufferAttribute(
                        attribute.data,
                        attribute.dimensions
                    )
                );
            }
        }

        if (this.createPoints) {
            this.mesh = new THREE.Points(geometry, this.particleMaterial);
            this.mesh.matrixAutoUpdate = false;
            this.mesh.updateMatrix();
            this.mesh.frustumCulled = false;
            this.particles = this.mesh;
            this.object3d.add(this.particles);
        }
    }

    getPositionsUniform() {
        return this.particleMaterial.uniforms.uPositions;
    }

    getIndexesAttribute() {
        return this.indexesAttribute;
    }

    createDebugPlane() {
        const geo = new THREE.PlaneBufferGeometry(
            50,
            (this.height / this.width) * 50
        );
        const mat = new THREE.ShaderMaterial({
            uniforms: {
                uTexture: {
                    value: this.particleMaterial.uniforms.positions.value,
                },
            },
            vertexShader: basicVertexShader,
            fragmentShader: `
            varying vec2 vUv;
            uniform sampler2D uTexture;

            void main() {
                gl_FragColor = vec4(normalize(texture2D(uTexture, vUv).rgb), 1.);
            }
            `,
        });
        const mesh = new THREE.Mesh(geo, mat);
        return mesh;
    }

    validateData() {
        let valid = true;
        if (this.positions && this.positions.length) {
        } else {
            if (!this.particles || !this.particles.length) {
                console.warn('No particles');
                valid = false;
            } else {
                const p = this.particles[0];
                if (
                    !p.position ||
                    p.position.x === undefined ||
                    p.position.y === undefined ||
                    p.position.z === undefined
                ) {
                    valid = false;
                    console.warn('Particles does not contain cooridnates');
                }
            }
        }

        return valid;
    }
}

export default Particles;
