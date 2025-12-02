import * as stylex from '@stylexjs/stylex';
import React, { useRef, useState } from 'react';
import { Ranger, useRanger } from '@tanstack/react-ranger';

const styles = stylex.create({
    base: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: '5em',
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        minWidth: '700px',
        borderColor: '#eee',
        borderWidth: '1px',
        borderStyle: 'solid',
        // display: 'flex',
        // flexDirection: 'column',
        // gap: '16px',
        // alignItems: 'center',
    },
    title: {
        fontWeight: '600',
        margin: '0',
        textAlign: 'center',
        marginTop: 16,
    },
    imageContainer: {
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: 'auto',
    },
    imageSize: {
        width: 300,
        height: 300,
    },
    slider: {
        position: 'relative',
        userSelect: 'none',
        height: '4px',
        backgroundColor: '#ddd',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,.6)',
        borderRadius: '2px',
        width: '70%',
    },
    alignCenter: {
        marginInlineEnd: 'auto',
        marginInlineStart: 'auto',
    },
    alignVerticalCenter: {
        position: 'relative',
        top: '50%',
        transform: 'translateY(-50%)',
    },
    transform: {
        transformOrigin: 'center center',
        userSelect: 'none',
        willChange: 'transform',
    },
});

const tempImage =
    'https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=100';

export function Crop() {
    const rangerRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const [targetImage, setTargetImage] = useState<string>(tempImage);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [values, setValues] = useState<ReadonlyArray<number>>([0]);

    const [transform, setTransform] = useState({
        x: 0,
        y: 0,
    });
    const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

    const rangerInstance = useRanger<HTMLDivElement>({
        getRangerElement: () => rangerRef.current,
        values,
        min: 0,
        max: 100,
        stepSize: 1,
        // onChange: (instance: Ranger<HTMLDivElement>) => setValues(instance.sortedValues),
        onDrag: (instance: Ranger<HTMLDivElement>) => {
            setValues(instance.sortedValues);
        },
    });

    function getPanLimits() {
        const cw = containerRef.current?.clientWidth ?? 0;
        const ch = containerRef.current?.clientHeight ?? 0;

        const bw = imgRef.current?.offsetWidth ?? 0; // base displayed width
        const bh = imgRef.current?.offsetHeight ?? 0; // base displayed height

        const sw = bw * scale; // scaled width
        const sh = bh * scale; // scaled height

        const maxX = Math.max(0, (sw - cw) / 2);
        const maxY = Math.max(0, (sh - ch) / 2);

        return { maxX, maxY };
    }

    const transform3dValue =
        'translate3d(' + transform.x + 'px, ' + transform.y + 'px, 0) scale(' + (1 + values[0] / 100) + ')';

    const scale = 1 + values[0] / 100;

    const handleOnPanStart = (e: React.PointerEvent) => {
        e.preventDefault();

        setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
    };

    const handleOnPan = (e: React.PointerEvent) => {
        if (e.buttons !== 1 || !dragStart) return;

        const { maxX, maxY } = getPanLimits();

        // When scale <= 1 there's no overflow; lock to center.
        const clampX = maxX === 0 ? 0 : Math.max(-maxX, Math.min(maxX, e.clientX - dragStart.x));
        const clampY = maxY === 0 ? 0 : Math.max(-maxY, Math.min(maxY, e.clientY - dragStart.y));

        setTransform({ x: clampX, y: clampY });
    };

    const handleOnPanEnd = () => {
        setDragStart(null);
    };

    const getCroppedImage = (opts?: {
        outWidth?: number; // final width in pixels (default: container width)
        outHeight?: number; // final height in pixels (default: container height)
        circular?: boolean; // clip to a circle
        format?: 'image/png' | 'image/jpeg' | 'image/webp'; // default 'image/png'
        quality?: number; // for JPEG/WEBP, 0..1 (default 0.92)
        pixelRatio?: number; // override device pixel ratio (default: window.devicePixelRatio)
        supersample?: number; // extra multiplier for sharpness (default: 1)
    }) => {
        if (!imgRef.current || !containerRef.current) return null;

        const imgEl = imgRef.current;
        const containerEl = containerRef.current;

        // Viewport size in CSS px
        const cw = containerEl.clientWidth;
        const ch = containerEl.clientHeight;

        // Output (final) size in px
        const outW = Math.max(1, Math.round(opts?.outWidth ?? cw));
        const outH = Math.max(1, Math.round(opts?.outHeight ?? ch));

        // HiDPI render scale (bigger canvas -> better sampling)
        const dpr = opts?.pixelRatio ?? (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
        const supersample = Math.max(1, opts?.supersample ?? 1);
        const renderScale = dpr * supersample;

        const renderW = Math.round(outW * renderScale);
        const renderH = Math.round(outH * renderScale);

        // Image sizes
        const natW = imgEl.naturalWidth;
        const natH = imgEl.naturalHeight;
        const bw = imgEl.offsetWidth; // base displayed width before transforms
        const bh = imgEl.offsetHeight; // base displayed height before transforms

        if (!bw || !bh || !natW || !natH) return null;

        const cssToNatX = natW / bw;
        const cssToNatY = natH / bh;

        // UI transform
        const s = 1 + values[0] / 100;
        const tx = transform.x;
        const ty = transform.y;

        // Source window size in natural px that maps to the viewport
        const sw = (cw * cssToNatX) / s;
        const sh = (ch * cssToNatY) / s;

        // Center of the viewport in natural coords (invert translate then scale, origin at image center)
        const centerNatX = natW / 2 - (tx * cssToNatX) / s;
        const centerNatY = natH / 2 - (ty * cssToNatY) / s;

        // Top-left of source rect
        let sx = centerNatX - sw / 2;
        let sy = centerNatY - sh / 2;

        // Clamp to image bounds
        sx = Math.max(0, Math.min(sx, natW - sw));
        sy = Math.max(0, Math.min(sy, natH - sh));

        // 1) Render to a high-res canvas
        const hiCanvas = document.createElement('canvas');
        hiCanvas.width = renderW;
        hiCanvas.height = renderH;
        const hiCtx = hiCanvas.getContext('2d');
        if (!hiCtx) return null;

        hiCtx.imageSmoothingEnabled = true;
        hiCtx.imageSmoothingQuality = 'high';

        if (opts?.circular) {
            hiCtx.save();
            hiCtx.beginPath();
            const r = Math.min(renderW, renderH) / 2;
            hiCtx.arc(renderW / 2, renderH / 2, r, 0, Math.PI * 2);
            hiCtx.closePath();
            hiCtx.clip();
        }

        // Draw the visible source region to high-res canvas
        hiCtx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, renderW, renderH);

        if (opts?.circular) {
            hiCtx.restore();
        }

        // 2) Optionally downsample to final size for sharper result at requested dimensions
        let finalCanvas: HTMLCanvasElement = hiCanvas;
        if (renderScale !== 1) {
            const lowCanvas = document.createElement('canvas');
            lowCanvas.width = outW;
            lowCanvas.height = outH;
            const lowCtx = lowCanvas.getContext('2d');
            if (!lowCtx) return null;
            lowCtx.imageSmoothingEnabled = true;
            lowCtx.imageSmoothingQuality = 'high';
            lowCtx.drawImage(hiCanvas, 0, 0, outW, outH);
            finalCanvas = lowCanvas;
        }

        const format = opts?.format ?? 'image/png';
        if (format === 'image/jpeg' || format === 'image/webp') {
            return finalCanvas.toDataURL(format, opts?.quality ?? 0.92);
        }
        return finalCanvas.toDataURL('image/png');
    };

    return (
        <div {...stylex.props(styles.base)}>
            <div {...stylex.props(styles.modal)}>
                <h3 {...stylex.props(styles.title)}>Choose profile picture</h3>
                <div
                    style={{
                        position: 'relative',
                        height: '420px',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            height: '100%',
                        }}
                    >
                        <div {...stylex.props(styles.alignCenter, styles.imageSize, styles.alignVerticalCenter)}>
                            <div
                                style={{
                                    maskImage: '-webkit-radial-gradient(center, white, black)',
                                    borderRadius: '50%',
                                    position: 'absolute',
                                }}
                            >
                                <div
                                    {...stylex.props(styles.imageContainer, styles.imageSize, styles.transform)}
                                    style={{
                                        zIndex: 5,
                                        transform: transform3dValue,
                                    }}
                                    onPointerDown={handleOnPanStart}
                                    onPointerUp={handleOnPanEnd}
                                    onPointerLeave={handleOnPanEnd}
                                    onPointerMove={handleOnPan}
                                >
                                    <img
                                        src={targetImage}
                                        alt="Profile"
                                        {...stylex.props(styles.image)}
                                        draggable={false}
                                    />
                                </div>
                            </div>
                            <div
                                ref={containerRef}
                                {...stylex.props(styles.imageContainer, styles.imageSize, styles.transform)}
                                style={{
                                    opacity: 0.5,
                                    zIndex: 10,
                                    transform: transform3dValue,
                                    cursor: 'grab',
                                }}
                                onPointerDown={handleOnPanStart}
                                onPointerUp={handleOnPanEnd}
                                onPointerLeave={handleOnPanEnd}
                                onPointerMove={handleOnPan}
                            >
                                <img
                                    ref={imgRef}
                                    src={targetImage}
                                    alt="Profile"
                                    {...stylex.props(styles.image)}
                                    draggable={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    ref={rangerRef}
                    {...stylex.props(styles.slider, styles.alignCenter)}
                    style={{ marginTop: '10px', marginBottom: '24px' }}
                >
                    <div
                        {...stylex.props(styles.slider)}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            height: '100%',
                            width: `${rangerInstance.getPercentageForValue(values[0])}%`,
                            backgroundColor: '#4caf50',
                        }}
                    />
                    {rangerInstance
                        .handles()
                        .map(({ value, onKeyDownHandler, onMouseDownHandler, onTouchStart, isActive }, i) => (
                            <button
                                key={i}
                                onKeyDown={onKeyDownHandler}
                                onMouseDown={onMouseDownHandler}
                                onTouchStart={onTouchStart}
                                role="slider"
                                aria-valuemin={rangerInstance.options.min}
                                aria-valuemax={rangerInstance.options.max}
                                aria-valuenow={value}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: `${rangerInstance.getPercentageForValue(value)}%`,
                                    zIndex: isActive ? '1' : '0',
                                    transform: 'translate(-50%, -50%)',
                                    width: '14px',
                                    height: '14px',
                                    outline: 'none',
                                    borderRadius: '100%',
                                    background: 'linear-gradient(to bottom, #eee 45%, #ddd 55%)',
                                    border: 'solid 1px #888',
                                }}
                            />
                        ))}
                </div>
            </div>

            <div>
                <button
                    style={{
                        marginTop: '24px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#4caf50',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                    onClick={() => {
                        const cropped = getCroppedImage();
                        setCroppedImage(cropped);
                    }}
                >
                    Crop Image
                </button>
                <button
                    style={{
                        marginTop: '24px',
                        marginLeft: '16px',
                        padding: '10px 20px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#2196f3',
                        color: '#fff',
                        cursor: 'pointer',
                    }}
                    onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';

                        setTimeout(() => {
                            input.click();
                        }, 0);

                        input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    const result = ev.target?.result;
                                    if (typeof result === 'string') {
                                        setTargetImage(result);
                                        setCroppedImage(null);
                                        setTransform({ x: 0, y: 0 });
                                        setValues([0]);
                                    }
                                };
                                reader.readAsDataURL(file);
                            }
                        };
                    }}
                >
                    Choose Image
                </button>
            </div>
            {croppedImage && (
                <div
                    style={{
                        marginTop: '24px',
                        textAlign: 'center',
                        marginBottom: '24px',
                    }}
                >
                    <h4>Cropped Image:</h4>
                    <div
                        style={{
                            borderWidth: 2,
                            borderColor: '#eee',
                            borderStyle: 'solid',
                            borderRadius: '50%',
                            display: 'inline-block',
                            overflow: 'hidden',
                            height: 300,
                        }}
                    >
                        <img
                            crossOrigin="anonymous"
                            src={croppedImage}
                            alt="Cropped"
                            style={{
                                width: '100%',
                                height: 'auto',
                                objectFit: 'cover',
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
