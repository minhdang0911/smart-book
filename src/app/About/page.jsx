'use client';

import {
    BookOutlined,
    BulbOutlined,
    CompassOutlined,
    LeftOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    RightOutlined,
    RocketOutlined,
    SearchOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Input, Row, Spin, Tag, Typography, message } from 'antd';
import { gsap } from 'gsap';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

export default function SmartBookKingdom3D() {
    const mountRef = useRef(null);
    const threeRef = useRef({});

    const [isNight, setIsNight] = useState(false);
    const [hoverInfo, setHoverInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const pageSize = 24;

    const { Title, Paragraph } = Typography;

    // ===== Fetch book data (staged) =====
    useEffect(() => {
        let aborted = false;

        (async () => {
            try {
                setLoading(true);
                // tải nhẹ trước để “lên hình” ngay
                const res = await fetch('https://smartbook.io.vn/api/books/search?limit=120');
                const json = await res.json();
                const arr = (json?.data || []).map((b) => ({
                    id: b.id,
                    title: b.title,
                    author: b?.author?.name || '—',
                    cover: b.cover_image,
                }));
                if (!aborted) setBooks(arr);
            } catch (e) {
                console.error(e);
                message.error('Không gọi được API sách. Kiểm tra backend/CORS.');
            } finally {
                if (!aborted) setLoading(false);
            }
        })();

        // tải thêm sau 1.5s (append) cho mượt
        const moreTimer = setTimeout(async () => {
            try {
                const res2 = await fetch('https://smartbook.io.vn/api/books/search?limit=500&offset=120');
                const more = await res2.json();
                const arr2 = (more?.data || []).map((b) => ({
                    id: b.id,
                    title: b.title,
                    author: b?.author?.name || '—',
                    cover: b.cover_image,
                }));
                if (!aborted) setBooks((old) => old.concat(arr2));
            } catch {
                // ignore
            }
        }, 1500);

        return () => {
            aborted = true;
            clearTimeout(moreTimer);
        };
    }, []);

    // ===== Three.js scene =====
    useEffect(() => {
        const mountEl = mountRef.current;
        if (!mountEl) return;

        // Scene & fog
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf7fbff);
        scene.fog = new THREE.Fog(0xf0f6ff, 18, 85);

        // Renderer (nhẹ khi khởi động)
        const DPR_START = Math.min(1.25, window.devicePixelRatio || 1);
        const renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            alpha: false,
            depth: true,
        });
        renderer.setPixelRatio(DPR_START);
        renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
        renderer.shadowMap.enabled = false; // tắt bóng ban đầu cho mượt
        mountEl.appendChild(renderer.domElement);

        // Camera
        const camera = new THREE.PerspectiveCamera(60, mountEl.clientWidth / mountEl.clientHeight, 0.1, 2000);
        camera.position.set(0, 3.2, 18);

        // Lights (nhẹ)
        const hemi = new THREE.HemisphereLight(0xffffff, 0xbad5ff, 0.9);
        scene.add(hemi);
        const dir = new THREE.DirectionalLight(0xffffff, 1.0);
        dir.position.set(10, 12, 8);
        // không bật shadow khi khởi động
        scene.add(dir);

        // Ground (gợn nhẹ)
        const groundGeo = new THREE.PlaneGeometry(220, 220, 200, 200);
        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = Math.sin(i * 0.17) * 0.12 + Math.cos(i * 0.12) * 0.1;
            pos.setY(i, y);
        }
        pos.needsUpdate = true;
        groundGeo.computeVertexNormals();
        const groundMatDay = new THREE.MeshStandardMaterial({ color: 0xeaf3ff, roughness: 0.95 });
        const groundMatNight = new THREE.MeshStandardMaterial({ color: 0x0a0f1d, roughness: 1 });
        const ground = new THREE.Mesh(groundGeo, groundMatDay);
        ground.rotation.x = -Math.PI / 2;
        scene.add(ground);

        // Groups
        const bookGroup = new THREE.Group(); // page books
        const kingdomGroup = new THREE.Group(); // towers, gate, props
        const skies = new THREE.Group(); // clouds/stars
        scene.add(bookGroup, kingdomGroup, skies);

        // Fireflies (giảm số lượng)
        const fireflies = new THREE.Group();
        scene.add(fireflies);
        const fireflyGeo = new THREE.SphereGeometry(0.035, 10, 10);
        const fireflyMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
        for (let i = 0; i < 80; i++) {
            const f = new THREE.Mesh(fireflyGeo, fireflyMat);
            f.position.set(
                THREE.MathUtils.randFloatSpread(30),
                1 + Math.random() * 4.5,
                -8 + THREE.MathUtils.randFloatSpread(90),
            );
            fireflies.add(f);
        }

        // Camera path (giảm segments)
        const curvePoints = [
            new THREE.Vector3(0, 2.4, 24),
            new THREE.Vector3(0, 2.2, 8),
            new THREE.Vector3(0, 2.1, -6),
            new THREE.Vector3(0.5, 2.2, -20), // Market
            new THREE.Vector3(-0.2, 2.4, -34), // Castle
            new THREE.Vector3(0.3, 2.6, -52), // Sky Docks
            new THREE.Vector3(0.0, 2.8, -70),
        ];
        const path = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.08);
        const pathGeo = new THREE.TubeGeometry(path, 80, 0.05, 6, false);
        const pathMatDay = new THREE.MeshStandardMaterial({ color: 0x1677ff, roughness: 0.6, metalness: 0.2 });
        const pathMatNight = new THREE.MeshStandardMaterial({
            color: 0x4f46e5,
            roughness: 0.6,
            metalness: 0.2,
            emissive: 0x4338ca,
            emissiveIntensity: 0.35,
        });
        const pathMesh = new THREE.Mesh(pathGeo, pathMatDay);
        scene.add(pathMesh);

        // Raycast
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        renderer.domElement.addEventListener('pointermove', (e) => {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        });

        // Travel timeline
        const travel = { t: 0 };
        const tl = gsap.timeline({ paused: true });
        function updateCam() {
            const p = path.getPointAt(travel.t);
            const lookAt = path.getPointAt(Math.min(travel.t + 0.01, 1));
            camera.position.copy(p);
            camera.lookAt(lookAt);
        }
        tl.to(travel, { t: 1, duration: 40, ease: 'power2.inOut', onUpdate: updateCam });

        function nudge(step = 0.08) {
            gsap.to(travel, {
                t: Math.min(1, travel.t + step),
                duration: 0.8,
                ease: 'power2.out',
                onUpdate: updateCam,
            });
        }
        function jumpTo(ratio) {
            gsap.to(travel, { t: ratio, duration: 1, ease: 'power3.inOut', onUpdate: updateCam });
        }

        // Night toggle
        function setNight(n) {
            if (n) {
                scene.background = new THREE.Color(0x060816);
                scene.fog = new THREE.Fog(0x060816, 12, 65);
                ground.material = groundMatNight;
                pathMesh.material = pathMatNight;
                dir.intensity = 0.8;
                hemi.intensity = 0.45;
                skies.children.forEach((c) => (c.visible = c.userData.kind !== 'cloud'));
            } else {
                scene.background = new THREE.Color(0xf7fbff);
                scene.fog = new THREE.Fog(0xf0f6ff, 18, 85);
                ground.material = groundMatDay;
                pathMesh.material = pathMatDay;
                dir.intensity = 1.0;
                hemi.intensity = 0.9;
                skies.children.forEach((c) => (c.visible = c.userData.kind !== 'stars'));
            }
        }
        setNight(false);

        // Loaders
        const texLoader = new THREE.TextureLoader();
        texLoader.crossOrigin = 'anonymous';

        // Helpers
        function clearGroup(g) {
            while (g.children.length) {
                const m = g.children.pop();
                m.traverse?.((o) => {
                    if (o.isMesh) {
                        o.geometry?.dispose?.();
                        o.material?.map?.dispose?.();
                        if (Array.isArray(o.material)) o.material.forEach((mm) => mm.dispose?.());
                        o.material?.dispose?.();
                    }
                });
            }
        }

        // ===== Book mesh (nhẹ, không label sprite) =====
        function makeBook(param = {}, x, z) {
            const { title = 'No title', author = '—', cover } = param;

            const w = THREE.MathUtils.randFloat(0.9, 1.2);
            const h = THREE.MathUtils.randFloat(1.4, 2.0);
            const d = THREE.MathUtils.randFloat(0.18, 0.32);
            const geo = new THREE.BoxGeometry(w, h, d);

            const coverMat = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.0,
                roughness: 0.8,
            });
            const pagesMat = new THREE.MeshStandardMaterial({ color: 0xf7f7f2, roughness: 0.9 });
            const spineMat = new THREE.MeshStandardMaterial({ color: 0x1f2a44, roughness: 0.6, metalness: 0.05 });
            const mats = [pagesMat, pagesMat, pagesMat, pagesMat, coverMat, spineMat];
            const mesh = new THREE.Mesh(geo, mats);

            if (cover) {
                texLoader.load(cover, (tex) => {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy?.() || 8);
                    coverMat.map = tex;
                    coverMat.needsUpdate = true;
                });
            }

            mesh.position.set(x, h / 2, z);
            mesh.rotation.y = THREE.MathUtils.randFloatSpread(0.4);
            mesh.userData = { title, author };
            return mesh;
        }

        // ===== Kingdom dressing =====
        function makeBookTower(covers, center, radius = 1.2, levels = 6) {
            const safeCovers = covers?.length ? covers : [{ title: '—', author: '—', cover: null }];
            const g = new THREE.Group();
            const baseH = THREE.MathUtils.randFloat(0.2, 0.5);
            levels = Math.min(levels, 4);

            for (let i = 0; i < levels; i++) {
                const ring = new THREE.Group();
                const count = 4 + Math.floor(Math.random() * 3);
                const h = baseH + i * THREE.MathUtils.randFloat(0.35, 0.5);
                for (let k = 0; k < count; k++) {
                    const theta = (k / count) * Math.PI * 2;
                    const x = center.x + Math.cos(theta) * (radius + i * 0.12);
                    const z = center.z + Math.sin(theta) * (radius + i * 0.12);
                    const mesh = makeBook(safeCovers[(i + k) % safeCovers.length], x, z);
                    mesh.position.y = h + THREE.MathUtils.randFloat(0, 0.2);
                    mesh.rotation.y = theta + Math.PI / 2;
                    ring.add(mesh);
                }
                g.add(ring);
            }
            return g;
        }

        function makeGate(z = -30) {
            const gate = new THREE.Group();
            // two pillars
            for (let s of [-1, 1]) {
                const geo = new THREE.BoxGeometry(1.2, 5.2, 1.2);
                const mat = new THREE.MeshStandardMaterial({ color: 0x1f2a44, roughness: 0.6 });
                const p = new THREE.Mesh(geo, mat);
                p.position.set(3.2 * s, 2.6, z);
                gate.add(p);
            }
            // arch
            const archGeo = new THREE.TorusGeometry(3.2, 0.18, 16, 100, Math.PI);
            const archMat = new THREE.MeshStandardMaterial({
                color: 0x4f46e5,
                metalness: 0.2,
                roughness: 0.5,
                emissive: 0x4338ca,
                emissiveIntensity: 0.25,
            });
            const arch = new THREE.Mesh(archGeo, archMat);
            arch.rotation.x = Math.PI / 2;
            arch.position.set(0, 5.1, z);
            gate.add(arch);

            // label
            const label = makeBillboard('Library Castle');
            label.position.set(0, 6.3, z);
            gate.add(label);
            return gate;
        }

        function makeBillboard(text) {
            const canvas = document.createElement('canvas');
            canvas.width = 1024;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#0000';
            ctx.fillRect(0, 0, 1024, 256);
            ctx.fillStyle = '#e2e8f0';
            ctx.font = 'bold 90px "Segoe UI"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.strokeStyle = '#4f46e5';
            ctx.lineWidth = 6;
            ctx.strokeText(text, 512, 128);
            ctx.fillText(text, 512, 128);
            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
            sp.scale.set(6, 1.5, 1);
            return sp;
        }

        function makeClouds() {
            const clouds = new THREE.Group();
            clouds.userData.kind = 'cloud';
            const sprite = (() => {
                const c = document.createElement('canvas');
                c.width = c.height = 256;
                const ctx = c.getContext('2d');
                const grd = ctx.createRadialGradient(128, 128, 40, 128, 128, 128);
                grd.addColorStop(0, 'rgba(255,255,255,0.9)');
                grd.addColorStop(1, 'rgba(255,255,255,0)');
                ctx.fillStyle = grd;
                ctx.beginPath();
                ctx.arc(128, 128, 120, 0, Math.PI * 2);
                ctx.fill();
                return new THREE.CanvasTexture(c);
            })();

            for (let i = 0; i < 12; i++) {
                const s = new THREE.Sprite(
                    new THREE.SpriteMaterial({ map: sprite, transparent: true, depthWrite: false }),
                );
                s.scale.set(8 + Math.random() * 8, 4 + Math.random() * 3, 1);
                s.position.set(THREE.MathUtils.randFloatSpread(120), 8 + Math.random() * 8, -20 - Math.random() * 100);
                s.userData.vx = 0.02 + Math.random() * 0.04;
                clouds.add(s);
            }
            skies.add(clouds);
        }

        function makeStars() {
            const starGeo = new THREE.BufferGeometry();
            const N = 1000;
            const arr = new Float32Array(N * 3);
            for (let i = 0; i < N; i++) {
                arr[i * 3 + 0] = THREE.MathUtils.randFloatSpread(180);
                arr[i * 3 + 1] = 10 + Math.random() * 40;
                arr[i * 3 + 2] = -Math.random() * 160;
            }
            starGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
            const starMat = new THREE.PointsMaterial({ size: 0.08 });
            const stars = new THREE.Points(starGeo, starMat);
            stars.userData.kind = 'stars';
            skies.add(stars);
        }

        // Kingdom
        function buildKingdomScene(sampleCovers) {
            clearGroup(kingdomGroup);

            const zones = [
                { name: 'Market', z: -16 },
                { name: 'Library Castle', z: -30 },
                { name: 'Sky Docks', z: -48 },
            ];

            zones.forEach((z, idx) => {
                // towers left/right
                for (let side of [-1, 1]) {
                    const center = new THREE.Vector3(4.5 * side, 0, z.z ?? z);
                    const tower = makeBookTower(
                        sampleCovers,
                        center,
                        1.1 + Math.random() * 0.5,
                        4 + Math.floor(Math.random() * 2),
                    );
                    kingdomGroup.add(tower);
                }

                // portal ring to jump
                const ring = new THREE.Mesh(
                    new THREE.RingGeometry(0.6, 0.8, 32),
                    new THREE.MeshStandardMaterial({
                        color: 0x22d3ee,
                        emissive: 0x0891b2,
                        emissiveIntensity: 0.6,
                        side: THREE.DoubleSide,
                    }),
                );
                ring.rotation.y = Math.PI / 2;
                ring.position.set(0, 1.5, z.z ?? z);
                ring.userData.portalT = [0.25, 0.48, 0.7][idx];
                kingdomGroup.add(ring);

                const sign = makeBillboard(z.name);
                sign.position.set(0, 3.2, (z.z ?? z) - 1.4);
                kingdomGroup.add(sign);
            });

            // Main gate at castle
            kingdomGroup.add(makeGate(-30));
        }

        // Click: book to zoom, else nudge; click portal to jump
        function onClick(e) {
            const rect = renderer.domElement.getBoundingClientRect();
            const m = new THREE.Vector2(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -((e.clientY - rect.top) / rect.height) * 2 + 1,
            );
            raycaster.setFromCamera(m, camera);

            // portals
            const portalHits = raycaster
                .intersectObjects(kingdomGroup.children, true)
                .filter((h) => h.object.userData.portalT !== undefined);
            if (portalHits.length) {
                const t = portalHits[0].object.userData.portalT;
                jumpTo(t);
                return;
            }

            // books
            const hits = raycaster.intersectObjects(bookGroup.children, true);
            if (hits.length) {
                let obj = hits[0].object;
                while (obj && !bookGroup.children.includes(obj)) obj = obj.parent;
                if (obj) {
                    const target = obj.position.clone().add(new THREE.Vector3(0.8, 0.6, 1.2));
                    gsap.to(camera.position, {
                        x: target.x,
                        y: target.y,
                        z: target.z,
                        duration: 0.9,
                        ease: 'power3.out',
                    });
                    gsap.to({}, { duration: 0.9, onUpdate: () => camera.lookAt(obj.position) });
                    setHoverInfo(obj.userData);
                    return;
                }
            }
            nudge(0.08);
        }
        renderer.domElement.addEventListener('click', onClick);

        // Resize (no re-alloc)
        function onResize() {
            const { clientWidth, clientHeight } = mountEl;
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(clientWidth | 0, clientHeight | 0, false);
        }
        window.addEventListener('resize', onResize);

        // Animate (throttle raycast check)
        const clock = new THREE.Clock();
        let raf;
        let frameCount = 0;

        function animate() {
            const t = clock.getElapsedTime();

            // clouds drift
            skies.children.forEach((grp) => {
                if (grp.userData.kind === 'cloud') {
                    grp.children.forEach((s) => {
                        s.position.x += s.userData.vx * 0.02;
                        if (s.position.x > 90) s.position.x = -90;
                    });
                }
            });

            // fireflies wobble
            fireflies.children.forEach((f, i) => {
                f.position.y += Math.sin(t + i) * 0.0015;
                f.position.x += Math.cos(t * 0.5 + i) * 0.0009;
            });

            // hover tilt + info (throttle ~15fps)
            frameCount = (frameCount + 1) | 0;
            if (frameCount % 4 === 0) {
                raycaster.setFromCamera(mouse, camera);
                const hits = raycaster.intersectObjects(bookGroup.children, true);
                if (hits.length) {
                    let m = hits[0].object;
                    while (m && !bookGroup.children.includes(m)) m = m.parent;
                    if (m) {
                        const { title, author } = m.userData || {};
                        setHoverInfo({ title, author });
                        gsap.to(m.rotation, { y: m.rotation.y + 0.35, duration: 0.6, overwrite: true });
                    }
                } else if (hoverInfo) setHoverInfo(null);
            }

            renderer.render(scene, camera);
            raf = requestAnimationFrame(animate);
        }
        animate();

        // Skies
        makeClouds();
        makeStars();

        // expose API
        function boostQuality() {
            renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
            // nếu cần thêm: renderer.shadowMap.enabled = true; dir.castShadow = true; ground.receiveShadow = true;
        }

        threeRef.current = {
            buildPage(list) {
                clearGroup(bookGroup);
                const cols = 4,
                    rows = 6;
                const gapX = 3.2,
                    gapZ = 3.8;
                const startX = -((cols - 1) * gapX) / 2;
                const startZ = -((rows - 1) * gapZ) / 2 - 8;
                let k = 0;
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        if (k >= list.length) break;
                        const b = list[k++];
                        if (!b) continue;
                        const x = startX + c * gapX + THREE.MathUtils.randFloatSpread(0.5);
                        const z = startZ + r * gapZ + THREE.MathUtils.randFloatSpread(0.6);
                        const mesh = makeBook(b, x, z);
                        bookGroup.add(mesh);
                    }
                }
            },
            buildKingdom(sample) {
                buildKingdomScene(sample || []);
            },
            setNight,
            jumpTo,
            play: () => tl.play(),
            pause: () => tl.pause(),
            boostQuality,
        };

        // nâng DPR nhẹ sau khi init 2s cho mượt mắt
        const qualityTimer = setTimeout(() => {
            boostQuality();
        }, 2000);

        // Cleanup
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(qualityTimer);
            window.removeEventListener('resize', onResize);
            renderer.domElement.removeEventListener('click', onClick);
            if (renderer.domElement.parentNode === mountEl) {
                mountEl.removeChild(renderer.domElement);
            }
            renderer.dispose();
            groundGeo.dispose();
            pathGeo.dispose();
        };
    }, []);

    // Rebuild page & kingdom when data/page changes
    useEffect(() => {
        const api = threeRef.current;
        if (!api?.buildPage) return;
        const start = (page - 1) * pageSize;
        const pageList = books.slice(start, start + pageSize);
        api.buildPage(pageList);

        // sample ~12 covers for towers (nhẹ)
        const sample = books.slice(0, 12);

        // build kingdom khi idle để không chặn khung hình đầu
        if (window.requestIdleCallback) {
            requestIdleCallback(() => api.buildKingdom(sample), { timeout: 800 });
        } else {
            setTimeout(() => api.buildKingdom(sample), 0);
        }
    }, [books, page]);

    // Night
    useEffect(() => {
        threeRef.current?.setNight?.(isNight);
    }, [isNight]);

    const total = books.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div style={{ width: '100%', minHeight: '100vh', background: 'var(--sb-bg)' }}>
            <style>{baseCss}</style>

            {/* ===== HERO 3D ===== */}
            <section className="hero3d">
                <div className="canvas-wrap" ref={mountRef} />

                {/* Overlay */}
                <div className="overlay">
                    <Tag color="processing" className="brand">
                        SmartBook
                    </Tag>
                    <Title level={2} className="bigtitle">
                        Khám phá <span>Book Kingdom</span>
                    </Title>
                    <Paragraph className="subtitle">
                        Đi dọc con đường tri thức — click nền để tiến, click sách để zoom, click vòng sáng để teleport.
                    </Paragraph>

                    <div className="actions">
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlayCircleOutlined />}
                            onClick={() => {
                                threeRef.current?.play?.();
                                threeRef.current?.boostQuality?.(); // nâng chất khi user chủ động khám phá
                            }}
                        >
                            Khám phá
                        </Button>
                        <Button size="large" icon={<PauseCircleOutlined />} onClick={() => threeRef.current?.pause?.()}>
                            Tạm dừng
                        </Button>
                        <Button size="large" icon={<BulbOutlined />} onClick={() => setIsNight((v) => !v)}>
                            {isNight ? 'Ngày' : 'Đêm'}
                        </Button>

                        <div className="jumpers">
                            <Button icon={<CompassOutlined />} onClick={() => threeRef.current?.jumpTo?.(0.05)}>
                                Cổng
                            </Button>
                            <Button icon={<CompassOutlined />} onClick={() => threeRef.current?.jumpTo?.(0.48)}>
                                Lâu đài
                            </Button>
                            <Button icon={<CompassOutlined />} onClick={() => threeRef.current?.jumpTo?.(0.7)}>
                                Bến mây
                            </Button>
                        </div>

                        <Button
                            shape="circle"
                            icon={<LeftOutlined />}
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        />
                        <span className="pg">
                            {page} / {totalPages}
                        </span>
                        <Button
                            shape="circle"
                            icon={<RightOutlined />}
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        />
                    </div>
                </div>

                {/* Hover card */}
                {hoverInfo && (
                    <Card className="hover-card" bordered>
                        <div className="hover-title">{hoverInfo.title}</div>
                        <div className="hover-sub">{hoverInfo.author}</div>
                    </Card>
                )}

                {loading && (
                    <div className="loading">
                        <Spin tip="Đang tải sách từ API..." />
                    </div>
                )}
            </section>

            {/* ===== FEATURES ===== */}
            <section className="features">
                <div className="container">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <BookOutlined />
                                </div>
                                <Title level={4}>Book Towers</Title>
                                <Paragraph>
                                    Tháp sách 2 bên đường, bảng chỉ dẫn & cổng thư viện như vương quốc.
                                </Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <RocketOutlined />
                                </div>
                                <Title level={4}>Teleport & Path</Title>
                                <Paragraph>Click vòng sáng để nhảy khu; click nền để trôi tiếp.</Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <BulbOutlined />
                                </div>
                                <Title level={4}>Day/Night + Skies</Title>
                                <Paragraph>Mây bay ban ngày, sao đêm lấp lánh; đom đóm quanh đường.</Paragraph>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </section>

            {/* ===== FAQ ===== */}
            <ShopFAQ />

            <footer className="footer">© {new Date().getFullYear()} SmartBook — World of Books.</footer>
        </div>
    );
}

/* =======================
 * FAQ Section
 * ======================= */
function ShopFAQ() {
    const { Title } = Typography;
    const [query, setQuery] = useState('');
    const categories = [
        'Tất cả',
        'Mua hàng & thanh toán',
        'Đọc online',
        'Giao hàng & đổi trả',
        'Bảo hành & hỗ trợ',
        'Khác',
    ];
    const [activeCat, setActiveCat] = useState('Tất cả');
    const [flipped, setFlipped] = useState({});

    const faqs = [
        {
            id: 1,
            cat: 'Mua hàng & thanh toán',
            q: 'Có những hình thức thành toán nào?',
            a: 'COD (thanh toán khi nhận), ví MoMo, ZaloPay.',
        },
        {
            id: 2,
            cat: 'Mua hàng & thanh toán',
            q: 'Thanh toán lỗi thì sao?',
            a: 'Đơn ở trạng thái “Chờ thanh toán”. Có thể bấm Thanh toán lại hoặc chọn COD.',
        },
        {
            id: 3,
            cat: 'Mua hàng & thanh toán',
            q: 'COD có phụ phí không?',
            a: 'Không. Phí ship (nếu có) sẽ hiển thị khi xác nhận đơn.',
        },

        {
            id: 10,
            cat: 'Đọc online',
            q: 'Có đọc trực tiếp trên web không?',
            a: 'Có. Sách mua hoặc free đều đọc trực tiếp',
        },
        {
            id: 11,
            cat: 'Đọc online',
            q: 'Thiết bị nào đọc được?',
            a: 'Bất kỳ máy có trình duyệt hiện đại. Khuyến nghị Chrome/Edge/Safari bản mới.',
        },

        {
            id: 20,
            cat: 'Giao hàng & đổi trả',
            q: 'Giao sách giấy bao lâu?',
            a: 'Tùy đơn vị vận chuyển và địa chỉ. Thời gian dự kiến hiện ở trang chi tiết đơn.',
        },
        {
            id: 21,
            cat: 'Giao hàng & đổi trả',
            q: 'Đổi trả khi sách lỗi?',
            a: 'Chụp ảnh tình trạng, gửi mã đơn. Đội ngũ sẽ đổi/hoàn tiền theo chính sách.',
        },

        {
            id: 30,
            cat: 'Tài khoản & Premium',
            q: 'Có cần tài khoản để mua?',
            a: 'Nên đăng nhập để lưu đơn và tiến độ đọc. Khách vãng lai chỉ xem thử.',
        },
        {
            id: 31,
            cat: 'Tài khoản ',
            q: 'Không thấy sách đã mua?',
            a: 'Đăng nhập đúng email. Nếu vẫn lỗi, gửi mã đơn để mở lại thư viện.',
        },

        {
            id: 40,
            cat: 'Bảo hành & hỗ trợ',
            q: 'Liên hệ hỗ trợ ở đâu?',
            a: 'Ngay chat góc phải, hoặc email/điện thoại trong phần Liên hệ.',
        },
        {
            id: 41,
            cat: 'Bảo hành & hỗ trợ',
            q: 'Có hóa đơn không?',
            a: 'Sau khi thanh toán xong sẽ có biên nhận điện tử trong Chi tiết đơn.',
        },

        {
            id: 50,
            cat: 'Khác',
            q: 'Có sách audio không?',
            a: 'Một số sách có audiobook (biểu tượng 🎧), nghe trực tiếp trên web/app.',
        },
    ];

    const filtered = useMemo(() => {
        return faqs.filter((it) => {
            const matchCat = activeCat === 'Tất cả' || it.cat === activeCat;
            const matchQuery = (it.q + ' ' + it.a).toLowerCase().includes(query.toLowerCase());
            return matchCat && matchQuery;
        });
    }, [faqs, activeCat, query]);

    return (
        <section className="faq">
            <div className="container">
                <div className="faq-head">
                    <Title level={3}>❓ Câu hỏi thường gặp</Title>
                    <Input
                        allowClear
                        prefix={<SearchOutlined />}
                        placeholder="Tìm câu hỏi..."
                        className="faq-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div className="faq-tabs">
                    {categories.map((c) => (
                        <Tag.CheckableTag key={c} checked={activeCat === c} onChange={() => setActiveCat(c)}>
                            {c}
                        </Tag.CheckableTag>
                    ))}
                </div>

                <div className="faq-grid">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className={`faq-card ${flipped[item.id] ? 'flipped' : ''}`}
                            onClick={() => setFlipped((old) => ({ ...old, [item.id]: !old[item.id] }))}
                        >
                            <div className="faq-inner">
                                <div className="faq-front">
                                    <span>{item.q}</span>
                                </div>
                                <div className="faq-back">
                                    <span>{item.a}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* =======================
 * CSS
 * ======================= */
const baseCss = `
:root{ --sb-blue:#1677ff; --sb-ink:#0f172a; --sb-ink-2:#475569; --sb-bg:#ffffff; --card-shadow:0 10px 30px rgba(22,119,255,.08); }
*{box-sizing:border-box}
.hero3d{position:relative;height:100vh;width:100%;background:linear-gradient(180deg,#f7fbff 0%,#fff 100%)}
.canvas-wrap{position:absolute;inset:0}
.overlay{position:absolute;left:4vw;top:7vh;z-index:3;max-width:640px}
.brand{font-size:14px;padding:6px 10px}
.bigtitle{margin:.3rem 0 0 0;font-weight:800;color:var(--sb-ink)}
.bigtitle span{color:var(--sb-blue)}
.subtitle{color:#475569;margin:.2rem 0 1rem}
.hover-card{position:absolute;right:20px;top:20px;z-index:4;box-shadow:var(--card-shadow)}
.actions{display:flex;gap:12px;margin-top:12px;align-items:center;flex-wrap:wrap}
.jumpers{display:flex;gap:8px}
.pg{min-width:76px;text-align:center;font-weight:600}
.loading{position:absolute;inset:0;display:grid;place-items:center;background:rgba(255,255,255,.5);z-index:5}

.features{padding:72px 0;background:#fff}
.container{width:min(1100px,92%);margin:0 auto}
.feature-card{border:none;border-radius:16px;box-shadow:var(--card-shadow)}
.feature-icon{width:64px;height:64px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(135deg,#eaf3ff,#d6e9ff);margin-bottom:12px;font-size:28px;color:#1e90ff}

.faq{background:linear-gradient(180deg,#f8fbff 0%,#ffffff 100%);padding:64px 0}
.faq-head{display:flex;gap:16px;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap}
.faq-search{max-width:360px}
.faq-tabs{margin-bottom:24px;display:flex;flex-wrap:wrap;gap:8px}
.faq-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.faq-card{perspective:1000px;cursor:pointer;height:160px;border-radius:16px}
.faq-inner{position:relative;width:100%;height:100%;transition:transform .6s;transform-style:preserve-3d}
.faq-card:hover .faq-inner{transform:rotateY(180deg)}
.faq-card.flipped .faq-inner{transform:rotateY(180deg)}
.faq-front,.faq-back{
  position:absolute;inset:0;border-radius:16px;display:flex;align-items:center;justify-content:center;
  padding:16px;text-align:center;box-shadow:var(--card-shadow);backface-visibility:hidden;
}
.faq-front{background:#ffffff}
.faq-back{background:linear-gradient(135deg,#eaf3ff,#d6e9ff); transform:rotateY(180deg)}
.faq-front span{font-weight:600;color:#0f172a}
.faq-back span{color:#0f172a}

.footer{padding:24px 0 56px;text-align:center;color:#64748b}

@media(max-width:992px){ .faq-grid{grid-template-columns:repeat(2,1fr)} }
@media(max-width:680px){
  .overlay{left:5vw;top:6vh;right:5vw;max-width:none}
  .faq-grid{grid-template-columns:1fr}
}
`;
