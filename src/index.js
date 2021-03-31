import deepExtend from 'deep-extend';

import EffectComposer from './postprocessing/EffectComposer';
import RenderPass from './postprocessing/RenderPass';
import ShaderPass from './postprocessing/ShaderPass';
import UnrealBloomPass from './postprocessing/UnrealBloomPass';
import CopyShader from './postprocessing/shaders/CopyShader';

import FinalShader from './shaders/FinalShader';
import basicVertexShader from './shaders/basic.vertex.glsl';
import AdditiveBlendShader from './shaders/AdditiveBlendShader';

import { clamp } from './utils';
import getMousePatternPosition from './utils/getMousePatternPosition';
import createWordTexture from './utils/createWordTexture';
import isWebGLAvailable from './utils/isWebGLAvailable';
import getInstagramTexture from './utils/exportTemplates/getInstagramTexture';
import getNftTexture from './utils/exportTemplates/getNftTexture';
import getRandomColor from './utils/getRandomColor';
import Inertia from './utils/Inertia';
import './utils/shaderChunks';

import exportTemplates from './constants/exportTemplates';

import Particles from './Particles';
// import SoftBody from './SoftBody';
import FullscreenFbo from './FullscreenFbo';

class DCDScene {
    THREE = THREE;
    name = '367';
    canvas = document.querySelector('canvas');
    breakpoints = [
        {
            name: 'desktop',
            threshold: 960,
        },
        {
            name: 'mobile',
            threshold: 0,
        },
    ];
    breakpoint = global.innerWidth < 960 ? 'mobile' : 'desktop';
    initialCameraPosition = {
        mobile: { x: 0, y: 0, z: 100 },
        desktop: { x: 0, y: 0, z: 60 },
    };
    cameraLookAt = new THREE.Vector3(0, 0, 0);
    cameraOffset = new THREE.Vector3(0, 0, 0);
    bg = 'rgb(0,0,0)';
    setBodyBg = false;
    resolution = new THREE.Vector2(0, 0);
    availableWebGLVersion = isWebGLAvailable();

    isRunning = false;
    rafId = null;

    width = 0;
    height = 0;
    resizeListeners = [];

    dpr = Math.min(2, global.devicePixelRatio);
    minDpr = global.devicePixelRatio >= 2 ? 1 : global.devicePixelRatio * 0.5;
    maxDpr = global.devicePixelRatio;

    near = 0.1;
    far = 200;
    minFov = 45;
    maxFov = 70;
    fov = 60;

    antialias = false;
    alpha = false;
    powerPreference = 'high-performance'; // 'high-performance', 'default'

    uniforms = {
        elapsed: [],
        dynamicTime: [],
        mousePosition: [],
        mousePosition3d: [],
        mouseInertiaPosition: [],
        mouseInertiaPosition3d: [],
        click: [],
        inertiaClick: [],
        resolution: [],
        captureProgress: [],
    };

    mousePosition = {
        x: 0.5,
        y: 0.5,
    };
    mouseInertiaPosition = {
        acc: 0.3,
        dec: 0.14,
        x: null,
        y: null,
    };
    deviceOrientation = {
        x: 0,
        y: 0,
        fx: 2.25,
        fy: 1,
        screenOrientation: global.orientation || 0,
    };

    mousePanCamera = true;
    mouseMoveForce = {
        mobile: {
            x: 40,
            y: 20,
        },
        desktop: {
            x: 40,
            y: 20,
        },
    };
    mouseMoveSpeed = {
        mobile: {
            x: 0.02,
            y: 0.02,
        },
        desktop: {
            x: 0.02,
            y: 0.02,
        },
    };
    mouseMoveZByYFactor = {
        mobile: 1.5,
        desktop: 1.5,
    };
    mouse3dVec = new THREE.Vector3();
    mouse3dPos = new THREE.Vector3();

    showFinalShaderMouseTrace = false;

    usePostProcessing = true;
    useOcclusion = false;
    defaultLayer = 0;
    occlusionLayer = 1;
    occlusionScale = window.devicePixelRatio < 2 ? 1 : 0.5;

    finalShader = FinalShader;
    bloom = {
        resolution: {
            x: 512,
            y: 512,
        },
        strength: 0.5,
        radius: 0.1,
        threshold: 0.2,
    };
    preBloomPasses = [];
    postBloomPasses = [];

    lastTimestamp = 0;
    dynamicTime = 0;
    dynamicTimeFactor = 0.05;
    dynamicTimeIdleMovement = 0.05;

    enablePauseOnBlur = false;

    textureLoader = new THREE.TextureLoader();
    measureLength = 10;
    measuredFps = [];
    adjustDprFps = 40;
    fpsAdjustments = 0;
    maxAllowedFpsAdjustments = 3;

    defaultFont = 'Montserrat';

    capture = {
        active: global.isCapturing && global.CCapture,
        width: 1080,
        height: 1080,
        frame: 0,
        frameRate: 60,
        endFrame: 60 * 12,
        idleEndFrames: 60 * 1,
        highjackMouse: true,
        mousePattern: 'spiral',
        template: 'instagram',
        fov: 100,
        cameraOffset: { x: 0, y: 0, z: 0 },
    };

    particleBuffers = [];
    // softBodies = [];
    fullscreenFbos = [];

    renderListeners = [];

    constructor(props = {}) {
        deepExtend(this, props);

        if (props.THREE) {
            global.THREE = props.THREE;
        }

        this.scene = new THREE.Scene();
    }

    init() {
        if (this.capture.active) {
            this.setupCapture();
        }

        if (this.setBodyBg) {
            document.body.style.background = this.bg;
        }
        this.addListeners();
        this.handleResize();

        const renderProps = {
            canvas: this.canvas,
            antialias: this.antialias,
            alpha: this.alpha,
            powerPreference: this.powerPreference,
        };

        if (this.availableWebGLVersion === 2) {
            const context = this.canvas.getContext('webgl2', {
                antialias: this.antialias,
            });
            renderProps.context = context;
        }

        this.renderer = new THREE.WebGLRenderer(renderProps);
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(this.dpr);
        this.clearColor = new THREE.Color(this.bg);
        this.renderer.setClearColor(this.clearColor, 1);
        this.renderer.gammaFactor = 2.2;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        this.camera = new THREE.PerspectiveCamera(
            this.fov,
            this.width / this.height,
            this.near,
            this.far
        );
        this.camera.position.set(
            this.initialCameraPosition[this.breakpoint].x + this.cameraOffset.x,
            this.initialCameraPosition[this.breakpoint].y + this.cameraOffset.y,
            this.initialCameraPosition[this.breakpoint].z + this.cameraOffset.z
        );

        this.clock = new THREE.Clock(false);

        if (this.useOcclusion) {
            this.camera.layers.enable(this.occlusionLayer);
            this.setupOcclusionComposer();
        }

        if (this.usePostProcessing) {
            this.setupPostprocessing();
        }

        this.mouseInertiaPosition.x = new Inertia(
            0,
            1,
            this.mouseInertiaPosition.acc,
            this.mouseInertiaPosition.dec
        );
        this.mouseInertiaPosition.y = new Inertia(
            0,
            1,
            this.mouseInertiaPosition.acc,
            this.mouseInertiaPosition.dec
        );

        this.mouseInertiaPosition.x.setValue(0.5);
        this.mouseInertiaPosition.y.setValue(0.5);

        this.click = 0;
        this.inertiaClick = new Inertia(0, 1, 0.4, 0.28);

        this.handleResize();

        this.inited = true;
    }

    setupCapture() {
        this.capturer = new CCapture({
            format: 'webm',
            framerate: this.capture.frameRate,
            verbose: false,
            quality: 1,
            name: this.name,
        });

        const templateName =
            this.capture.template || Object.keys(exportTemplates)[0];
        const template = exportTemplates[templateName];

        const { width, height } = template;

        this.capture.width = width;
        this.capture.height = height;
        const aspect = height / width;

        if (this.capture.cameraOffset?.x) {
            this.cameraOffset.x = this.capture.cameraOffset?.x;
        }
        if (this.capture.cameraOffset?.y) {
            this.cameraOffset.y = this.capture.cameraOffset?.y;
        }
        if (this.capture.cameraOffset?.y) {
            this.cameraOffset.z = this.capture.cameraOffset?.z;
        }

        if (templateName === 'nft' && !this.capture.cameraOffset?.y) {
            const yOffset =
                -this.initialCameraPosition[this.breakpoint].z * aspect * 0.2;
            this.cameraLookAt.y = yOffset;
            this.cameraOffset.y = yOffset;
        } else if (this.capture.cameraOffset?.y) {
            this.cameraLookAt.y = this.capture.cameraOffset?.y;
        }

        if (aspect >= 1) {
            this.canvas.style.maxWidth = `${100 / aspect}vmin`;
            this.canvas.style.minWidth = `${100 / aspect}vmin`;
            this.canvas.style.maxHeight = `100vmin`;
            this.canvas.style.minHeight = `100vmin`;
        } else {
            this.canvas.style.maxWidth = `100vmin`;
            this.canvas.style.minWidth = `100vmin`;
            this.canvas.style.maxHeight = `${100 * aspect}vmin`;
            this.canvas.style.minHeight = `${100 * aspect}vmin`;
        }

        if (this.capture.fov) {
            this.fov = this.capture.fov;
        }

        if (this.capture.highjackMouse) {
            const mousePatternPos = getMousePatternPosition(
                this.capture.mousePattern,
                0
            );
            this.mousePosition.x = mousePatternPos.x;
            this.mousePosition.y = mousePatternPos.y;
        }
    }

    setupOcclusionComposer() {
        this.occlusionRenderTarget = new THREE.WebGLRenderTarget(
            this.width * this.occlusionScale * this.dpr,
            this.height * this.occlusionScale * this.dpr
        );

        this.occlusionComposer = new EffectComposer(
            this.renderer,
            this.occlusionRenderTarget
        );
        this.occlusionComposer.addPass(new RenderPass(this.scene, this.camera));

        this.bloomPass = new UnrealBloomPass(
            new THREE.Vector2(this.bloom.resolution.x, this.bloom.resolution.y),
            this.bloom.strength,
            this.bloom.radius,
            this.bloom.threshold
        );

        this.occlusionComposer.addPass(this.bloomPass);

        this.copyPass = new ShaderPass(CopyShader);
        this.occlusionComposer.addPass(this.copyPass);
    }

    setupPostprocessing() {
        this.composer = new EffectComposer(this.renderer);

        const renderPass = new RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        for (const preBloomPass of this.preBloomPasses) {
            this.composer.addPass(preBloomPass);
        }

        if (this.useOcclusion) {
            this.additiveBlendPass = new ShaderPass(AdditiveBlendShader);

            this.additiveBlendPass.uniforms.tAdd.value = this.occlusionRenderTarget.texture;
            this.composer.addPass(this.additiveBlendPass);
        } else if (this.bloom && this.bloom.strength) {
            this.bloomPass = new UnrealBloomPass(
                new THREE.Vector2(
                    this.bloom.resolution.x,
                    this.bloom.resolution.y
                ),
                this.bloom.strength,
                this.bloom.radius,
                this.bloom.threshold
            );
            this.composer.addPass(this.bloomPass);
        }

        for (const postBloomPass of this.postBloomPasses) {
            this.composer.addPass(postBloomPass);
        }

        this.finalPass = new ShaderPass(this.finalShader);

        if (!this.finalPass.material.uniforms.uMouse) {
            this.finalPass.material.uniforms.uMouse = {
                value: new THREE.Vector2(
                    this.mousePosition.x,
                    this.mousePosition.y
                ),
            };
        }
        if (!this.finalPass.material.uniforms.uTime) {
            this.finalPass.material.uniforms.uTime = {
                value: 0,
            };
        }

        this.uniforms.mousePosition.push(
            this.finalPass.material.uniforms.uMouse
        );

        this.uniforms.dynamicTime.push(this.finalPass.material.uniforms.uTime);

        this.finalPass.material.defines.IS_MOBILE =
            this.breakpoint === 'mobile';

        if (this.showFinalShaderMouseTrace) {
            this.finalPass.material.defines.SHOW_MOUSE_TRACE = true;
        }

        if (this.capture.active) {
            if (!this.finalPass.material.uniforms.uCaptureProgress) {
                this.finalPass.material.uniforms.uCaptureProgress = {
                    value: 0,
                };
            }
            this.uniforms.captureProgress.push(
                this.finalPass.material.uniforms.uCaptureProgress
            );

            const template = this.capture.template || 'instagram';

            switch (template) {
                case 'instagram': {
                    this.finalPass.material.defines.SHOW_OVERLAY = true;
                    getInstagramTexture({
                        width: this.capture.width,
                        height: this.capture.height,
                        day: this.name,
                    }).then((texture) => {
                        this.finalPass.material.uniforms.uOverlay = {
                            value: texture,
                        };
                        this.finalPass.material.needsUpdate = true;
                        this.capture.ready = true;
                    });
                    break;
                }
                case 'nft': {
                    this.finalPass.material.defines.SHOW_NFT = true;
                    getNftTexture({
                        width: this.capture.width,
                        height: this.capture.height,
                        day: this.name,
                        heading: this.capture.heading,
                        descriptionLine1: this.capture.descriptionLine1,
                        descriptionLine2: this.capture.descriptionLine2,
                    }).then((texture) => {
                        this.finalPass.material.uniforms.uOverlay = {
                            value: texture,
                        };
                        this.finalPass.material.needsUpdate = true;
                        this.capture.ready = true;
                    });
                    break;
                }
                case 'templateStill4k': {
                    this.stop();
                    window.dcdSetTime = (time) => {
                        this.dynamicTime = time;
                        this.start();
                        this.stop();
                    };
                }
                default: {
                    this.capture.ready = true;
                }
            }
        }

        this.composer.addPass(this.finalPass);
    }

    addListeners() {
        global.addEventListener('resize', this.handleResize);
        if (window.DeviceOrientationEvent) {
            global.addEventListener(
                'deviceorientation',
                this.handleOrientation
            );
            global.addEventListener(
                'orientationchange',
                this.handleOrientationChange
            );
        }
        if (this.enablePauseOnBlur) {
            global.addEventListener('blur', this.handleBlur);
            global.addEventListener('focus', this.handleFocus);
        }

        document.body.addEventListener('touchstart', this.handleMouseDown);
        document.body.addEventListener('touchmove', this.handleMouseMove);
        document.body.addEventListener('touchend', this.handleMouseUp);

        document.body.addEventListener('mousedown', this.handleMouseDown);
        document.body.addEventListener('mousemove', this.handleMouseMove);
        document.body.addEventListener('mouseup', this.handleMouseUp);
    }

    handleResize = () => {
        let width = this.canvas.clientWidth;
        let height = this.canvas.clientHeight;

        if (this.capture.active) {
            width = this.capture.width;
            height = this.capture.height;
        }

        this.width = width;
        this.height = height;

        for (const breakpoint of this.breakpoints) {
            if (width > breakpoint.threshold) {
                this.breakpoint = breakpoint.name;
                break;
            }
        }

        if (this.renderer) {
            this.renderer.setSize(width, height);

            this.renderer.setPixelRatio(this.dpr);

            this.camera.aspect = width / height;
            this.camera.fov = this.getFov(width, height);
            this.camera.updateProjectionMatrix();

            this.resolution.set(width * this.dpr, height * this.dpr);

            this.uniforms.resolution.forEach((uniform) => {
                uniform.value.x = width;
                uniform.value.y = height;
            });

            if (this.usePostProcessing) {
                if (this.finalPass) {
                    this.finalPass.uniforms.resolution.value = this.resolution;
                }

                this.composer.setSize(this.resolution.x, this.resolution.y);
            }

            if (this.useOcclusion) {
                this.occlusionRenderTarget.setSize(
                    this.width * this.occlusionScale * this.dpr,
                    this.height * this.occlusionScale * this.dpr
                );
            }
        }

        for (const listener of this.resizeListeners) {
            listener({
                width,
                height,
            });
        }
    };

    handleOrientation = (event) => {
        const x = event.gamma;
        const y = event.beta;

        if (this.deviceOrientation.screenOrientation !== 0) {
            this.deviceOrientation.x = 0;
            this.deviceOrientation.y = 0;
        } else if (x !== null && x !== undefined) {
            this.deviceOrientation.y = y / 90 - 1;
            this.deviceOrientation.x =
                (x / 90) * -Math.sign(this.deviceOrientation.y);

            if (this.deviceOrientation.x > 1) {
                this.deviceOrientation.x = 1;
            } else if (this.deviceOrientation.x < -1) {
                this.deviceOrientation.x = -1;
            }
        }
    };

    handleOrientationChange = () => {
        this.deviceOrientation.screenOrientation = global.orientation || 0;
    };

    handleBlur = () => {
        this.stop();
    };

    handleFocus = () => {
        this.start();
    };

    handleMouseDown = () => {
        this.click = 1;

        for (const uniform of this.uniforms.click) {
            uniform.value = this.click;
        }
    };

    handleMouseMove = (e) => {
        if (this.capture.active && this.capture.highjackMouse) return;

        let event = e;
        if (e.touches) {
            event = e.touches[0];
        }

        this.mousePosition.x = event.pageX / this.width;
        this.mousePosition.y = 1 - event.pageY / this.height;
    };

    handleMouseUp = () => {
        this.click = 0;

        for (const uniform of this.uniforms.click) {
            uniform.value = this.click;
        }
    };

    add = (mesh) => {
        this.scene.add(mesh);
    };

    addToOcclusion = (mesh) => {
        if (this.useOcclusion) {
            mesh.layers.set(this.occlusionLayer);
        }
        this.scene.add(mesh);
    };

    start() {
        if (!this.inited) {
            console.warn('Scene not inited');
            return;
        }
        if (this.isRunning) return;
        this.isRunning = true;

        if (this.capture.active) {
            this.capture.frame = -1;
        }

        if (!this.rafId) this.render();

        if (!this.clock.elapsedTime) {
            this.clock.start();
        } else {
            this.clock.running = true;
        }
    }

    stop() {
        if (!this.isRunning) return;

        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        if (this.capture.active) {
            this.capture.active = false;
            this.capturer.stop();
            this.capturer.save();
        }

        this.isRunning = false;

        this.pauseElapsedTime = this.clock.elapsedTime;
        this.clock.stop();
    }

    onResize(cb) {
        this.resizeListeners.push(cb);
    }

    getFov = (width, height) => {
        if (this.capture.fov) return this.capture.fov;

        return clamp(
            this.minFov,
            this.maxFov,
            (360 / Math.PI) *
                Math.atan(
                    this.fov *
                        (height /
                            (width /
                                (width > 768
                                    ? Math.min(width / height, 16 / 9)
                                    : 16 / 9)))
                )
        );
    };

    createUniforms(uniforms) {
        if (!uniforms) return {};

        Object.keys(uniforms).forEach((key) => {
            const uniform = uniforms[key];
            if (!uniform) uniform = {};

            switch (key) {
                case 'uTime':
                    if (!uniform.value) uniform.value = 0;
                    this.uniforms.dynamicTime.push(uniform);
                    break;
                case 'uTimeOffset':
                    if (!uniform.value) uniform.value = Math.random() * 10;
                    break;
                case 'uElapsed':
                    if (!uniform.value) uniform.value = 0;
                    this.uniforms.elapsed.push(uniform);
                    break;
                case 'uMouse':
                    if (!uniform.value) {
                        uniform.value = new THREE.Vector2(
                            this.mousePosition.x,
                            this.mousePosition.y
                        );
                    }
                    this.uniforms.mousePosition.push(uniform);
                    break;
                case 'uMouse3d':
                    if (!uniform.value) {
                        uniform.value = new THREE.Vector3(0, 0, 0);
                    }
                    this.uniforms.mousePosition3d.push(uniform);
                    break;
                case 'uMouseInertia':
                    if (!uniform.value) {
                        uniform.value = new THREE.Vector2(
                            this.mousePosition.x,
                            this.mousePosition.y
                        );
                    }
                    this.uniforms.mouseInertiaPosition.push(uniform);
                    break;
                case 'uMouseInertia3d':
                    if (!uniform.value) {
                        uniform.value = new THREE.Vector3(0, 0, 0);
                    }
                    this.uniforms.mouseInertiaPosition3d.push(uniform);
                    break;
                case 'uClick':
                    if (!uniform.value) {
                        uniform.value = 0;
                    }
                    this.uniforms.click.push(uniform);
                    break;
                case 'uInertiaClick':
                    if (!uniform.value) {
                        uniform.value = 0;
                    }
                    this.uniforms.inertiaClick.push(uniform);
                    break;
                case 'uResolution':
                    if (!uniform.value) {
                        uniform.value = new THREE.Vector2(
                            this.width * this.dpr,
                            this.height * this.dpr
                        );
                    }
                    this.uniforms.resolution.push(uniform);
                    break;
                default:
                    break;
            }
        });

        return uniforms;
    }

    createMaterial(options = {}) {
        if (!options.vertexShader) options.vertexShader = basicVertexShader;

        const material = new THREE.ShaderMaterial({
            ...options,
            uniforms: this.createUniforms(options.uniforms),
        });

        return material;
    }

    createParticleSystem(options = { particles: [] }) {
        if (!this.inited) {
            console.warn('init must be called before createParticleSystem');
            return;
        }

        const instance = new Particles({
            renderer: this.renderer,
            uniformUpdates: this.uniforms,
            ...options,
        });

        this.particleBuffers.push(instance);

        if (instance.particles) {
            if (options.addToOcclusion) {
                this.addToOcclusion(instance.object3d);
            } else {
                this.add(instance.object3d);
            }
        }

        return instance;
    }

    // createSoftBody(geometry) {
    //     const instance = new SoftBody({
    //         geometry,
    //     });

    //     this.softBodies.push(instance);

    //     return instance;
    // }

    createFullscreenFbo(options = {}) {
        if (!this.inited) {
            console.warn('init must be called before createFullscreenFbo');
            return;
        }

        const props = {
            renderer: this.renderer,
            width: this.width,
            height: this.height,
            ...options,
        };
        if (!props.material) {
            props.uniforms = this.createUniforms({
                uTime: {},
                uMouse: {},
            });
        }
        const instance = new FullscreenFbo(props);

        this.fullscreenFbos.push(instance);

        return instance.getTexture();
    }

    adjustDpr(direction = -1) {
        const oldDpr = this.dpr;
        const adjustment = this.maxDpr * 0.2 * direction;
        this.dpr = Math.min(
            this.maxDpr,
            Math.max(this.minDpr, this.dpr + adjustment)
        );

        if (this.dpr !== oldDpr) {
            this.handleResize();
        }

        this.fpsAdjustments++;
    }

    createWordTexture = (options) => {
        if (!options.fontFamily) {
            options.fontFamily = this.defaultFont;
        }
        return createWordTexture(options);
    };

    createTextPlane = ({
        text,
        size,
        font,
        weight,
        scale,
        vertexShader,
        fragmentShader,
        uniforms,
        widthSegments,
        heightSegments,
        ...rest
    }) => {
        return new Promise((resolve) => {
            const defaultScaleFactor = 0.074;

            createWordTexture({
                word: text,
                size,
                fontFamily: font,
                weight,
            }).then((texture) => {
                const geo = new THREE.PlaneBufferGeometry(
                    texture.image.width * (scale || defaultScaleFactor),
                    texture.image.height * (scale || defaultScaleFactor),
                    widthSegments || 1,
                    heightSegments || 1
                );
                const mat = this.createMaterial({
                    uniforms: {
                        uTexture: { value: texture },
                        ...uniforms,
                    },
                    vertexShader,
                    fragmentShader,
                    ...rest,
                });
                const mesh = new THREE.Mesh(geo, mat);
                resolve(mesh);
            });
        });
    };

    createImageTexture = (src) => {
        return new Promise((resolve) => {
            this.textureLoader.load(src, (texture) => {
                texture.generateMipmaps = false;
                texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.minFilter = THREE.LinearFilter;

                resolve(texture);
            });
        });
    };

    createImagePlane = ({
        src,
        scale,
        vertexShader,
        fragmentShader,
        uniforms,
        widthSegments,
        heightSegments,
        ...rest
    }) => {
        return new Promise((resolve) => {
            const defaultScaleFactor = 0.074;

            this.createImageTexture(src).then((texture) => {
                const geo = new THREE.PlaneBufferGeometry(
                    texture.image.width * (scale || defaultScaleFactor),
                    texture.image.height * (scale || defaultScaleFactor),
                    widthSegments || 1,
                    heightSegments || 1
                );
                const mat = this.createMaterial({
                    uniforms: {
                        uTexture: { value: texture },
                        ...uniforms,
                    },
                    vertexShader,
                    fragmentShader,
                    ...rest,
                });
                const mesh = new THREE.Mesh(geo, mat);

                resolve(mesh);
            });
        });
    };

    render = (timestamp) => {
        const delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        for (const callback of this.renderListeners) {
            callback({ delta, elapsed });
        }

        // TWEEN.update(timestamp);

        if (this.mousePanCamera) {
            this.updateDynamicCameraMovement();
        }

        this.updateUniforms(elapsed, delta);

        if (this.useOcclusion) {
            this.camera.layers.set(this.occlusionLayer);
            this.renderer.setClearColor(0x000000);
            this.occlusionComposer.render();

            this.camera.layers.set(this.defaultLayer);
            this.renderer.setClearColor(this.clearColor);
        }

        if (this.usePostProcessing) {
            this.composer.render(delta);
        } else {
            this.renderer.render(this.scene, this.camera);
        }

        this.adjustPerformance(elapsed, delta);

        if (this.capture.active) {
            this.captureFrame();
        }

        for (const particle of this.particleBuffers) {
            particle.render();
        }
        // for (const softBody of this.softBodies) {
        //     softBody.update();
        // }
        for (const fbo of this.fullscreenFbos) {
            fbo.render();
        }

        if (this.isRunning) {
            requestAnimationFrame(this.render);
        }
    };

    updateDynamicCameraMovement = () => {
        const {
            breakpoint,
            mousePosition,
            mouseMoveForce,
            mouseMoveSpeed,
            mouseMoveZByYFactor,
            deviceOrientation,
            camera,
            scene,
        } = this;

        this.camX =
            ((mousePosition.x -
                0.5 +
                -deviceOrientation.x * deviceOrientation.fx) *
                mouseMoveForce[breakpoint].x -
                camera.position.x) *
            mouseMoveSpeed[breakpoint].x;
        this.camY =
            ((mousePosition.y -
                0.5 -
                deviceOrientation.y * deviceOrientation.fy) *
                mouseMoveForce[breakpoint].y -
                camera.position.y) *
            mouseMoveSpeed[breakpoint].y;

        camera.position.x += this.camX;
        camera.position.y += this.camY;
        if (mouseMoveZByYFactor[breakpoint]) {
            camera.position.z -= this.camY * mouseMoveZByYFactor[breakpoint];
        }

        camera.lookAt(this.cameraLookAt);
    };

    updateUniforms = (elapsed, delta) => {
        const {
            mousePosition,
            mouseInertiaPosition,
            click,
            inertiaClick,
            camera,
            uniforms,
        } = this;

        this.dynamicTime +=
            (Math.abs(this.camX) + Math.abs(this.camY)) *
                this.dynamicTimeFactor +
            delta * this.dynamicTimeIdleMovement;

        mouseInertiaPosition.x.update(mousePosition.x);
        mouseInertiaPosition.y.update(mousePosition.y);

        for (const uniform of uniforms.elapsed) {
            uniform.value = elapsed;
        }
        for (const uniform of uniforms.dynamicTime) {
            uniform.value = this.dynamicTime;
        }

        if (uniforms.inertiaClick.length) {
            inertiaClick.update(click);

            for (const uniform of uniforms.inertiaClick) {
                uniform.value = inertiaClick.value;
            }
        }

        for (const uniform of uniforms.mousePosition) {
            uniform.value.x = mousePosition.x;
            uniform.value.y = mousePosition.y;
        }
        for (const uniform of uniforms.mouseInertiaPosition) {
            uniform.value.x = mouseInertiaPosition.x.value;
            uniform.value.y = mouseInertiaPosition.y.value;
        }

        if (uniforms.mousePosition3d.length) {
            // calculate moouse position in 3d space
            this.mouse3dVec.set(
                mousePosition.x * 2 - 1,
                -(1 - mousePosition.y) * 2 + 1,
                0.5
            );
            this.mouse3dVec.unproject(camera);
            this.mouse3dVec.sub(camera.position).normalize();

            const distance = -camera.position.z / this.mouse3dVec.z;
            this.mouse3dPos
                .copy(camera.position)
                .add(this.mouse3dVec.multiplyScalar(distance));

            for (const uniform of uniforms.mousePosition3d) {
                uniform.value.x = this.mouse3dPos.x;
                uniform.value.y = this.mouse3dPos.y;
            }
        }

        if (uniforms.mouseInertiaPosition3d.length) {
            // calculate moouse position in 3d space
            this.mouse3dVec.set(
                mouseInertiaPosition.x.value * 2 - 1,
                -(1 - mouseInertiaPosition.y.value) * 2 + 1,
                0.5
            );
            this.mouse3dVec.unproject(camera);
            this.mouse3dVec.sub(camera.position).normalize();

            const distance = -camera.position.z / this.mouse3dVec.z;
            this.mouse3dPos
                .copy(camera.position)
                .add(this.mouse3dVec.multiplyScalar(distance));

            for (const uniform of uniforms.mouseInertiaPosition3d) {
                uniform.value.x = this.mouse3dPos.x;
                uniform.value.y = this.mouse3dPos.y;
            }
        }

        for (const uniform of uniforms.captureProgress) {
            uniform.value = this.capture.progress;
        }
    };

    onRender = (callback) => {
        if (typeof callback !== 'function') return;

        this.renderListeners.push(callback);
    };

    adjustPerformance = (elapsed, delta) => {
        if (
            elapsed > 0.25 &&
            !this.capture.active &&
            this.fpsAdjustments < this.maxAllowedFpsAdjustments
        ) {
            const fps = 1 / delta;
            this.measuredFps.push(fps);

            if (this.measuredFps.length > this.measureLength) {
                this.measuredFps.shift();

                let total = 0;
                for (let i = 0; i < this.measuredFps.length; i++) {
                    const element = this.measuredFps[i];
                    total += element;
                }

                this.averageFps = total / this.measuredFps.length;

                if (this.averageFps < this.adjustDprFps) {
                    this.adjustDpr(-1);
                    this.measuredFps = [];
                } else if (this.averageFps > 60) {
                    this.adjustDpr(1);
                    this.measuredFps = [];
                }
            }
        }
    };

    captureFrame = () => {
        if (this.capture.ready && !this.capture.started) {
            if (this.capture.frame > 4) {
                this.capturer.start();
                this.capture.started = true;
            } else {
                this.capture.frame++;
            }
        }

        if (this.capture.started) {
            this.capture.progress = clamp(
                0,
                1,
                this.capture.frame / this.capture.endFrame
            );

            if (this.capture.highjackMouse) {
                const mousePatternPos = getMousePatternPosition(
                    this.capture.mousePattern,
                    this.capture.progress
                );
                this.mousePosition.x = mousePatternPos.x;
                this.mousePosition.y = mousePatternPos.y;
            }
            console.log(this.capture.progress);

            this.capturer.capture(this.canvas);

            if (
                this.capture.frame >
                this.capture.endFrame + this.capture.idleEndFrames
            ) {
                this.stop();
            }

            this.capture.frame++;
        }
    };

    getBasicVertexShader = () => basicVertexShader;
    getRandomColor = getRandomColor;
    ShaderPass = ShaderPass;
}

export default DCDScene;
