'use client';

import {
    BookOutlined,
    BulbOutlined,
    LeftOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    RightOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Row, Spin, Tag, Typography, message } from 'antd';
import { gsap } from 'gsap';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * SmartBookLanding3D — World of Books (No fake data)
 * - Lấy sách thật từ API: http://localhost:8000/api/books/search?limit=500
 * - Map cover_image vào bìa 3D (TextureLoader)
 * - Phân trang 24 quyển/lần (Prev/Next)
 * - Click nền: di chuyển camera theo path; Click sách: zoom cận
 * - Day/Night + Fog + fireflies + vật liệu Physical
 */
export default function SmartBookLanding3D() {
    const mountRef = useRef(null);
    const threeRef = useRef({});

    const [isNight, setIsNight] = useState(false);
    const [hoverInfo, setHoverInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const [books, setBooks] = useState([]);
    const [page, setPage] = useState(1);
    const pageSize = 24;

    const { Title, Paragraph } = Typography;

    // ===== Fetch API (no fake data) =====
    useEffect(() => {
        let aborted = false;
        (async () => {
            try {
                setLoading(true);
                const res = await fetch('http://localhost:8000/api/books/search?limit=500');
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
        return () => {
            aborted = true;
        };
    }, []);

    // ===== Three.js Init =====
    useEffect(() => {
        const mountEl = mountRef.current;
        if (!mountEl) return;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf7fbff);
        scene.fog = new THREE.Fog(0xf0f6ff, 18, 70);

        const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(mountEl.clientWidth, mountEl.clientHeight);
        renderer.shadowMap.enabled = true;
        mountEl.appendChild(renderer.domElement);

        const camera = new THREE.PerspectiveCamera(60, mountEl.clientWidth / mountEl.clientHeight, 0.1, 2000);
        camera.position.set(0, 3.2, 16);

        // Lights
        const hemi = new THREE.HemisphereLight(0xffffff, 0xbad5ff, 0.9);
        scene.add(hemi);
        const dir = new THREE.DirectionalLight(0xffffff, 1.15);
        dir.position.set(10, 12, 8);
        dir.castShadow = true;
        dir.shadow.mapSize.set(1024, 1024);
        scene.add(dir);

        // Env for reflections
        const pmrem = new THREE.PMREMGenerator(renderer);
        const rt = pmrem.fromScene(new THREE.Scene());
        const envTex = rt.texture;

        // Ground
        const groundGeo = new THREE.PlaneGeometry(160, 160, 200, 200);
        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const y = Math.sin(i * 0.27) * 0.15 + Math.cos(i * 0.19) * 0.12;
            pos.setY(i, y);
        }
        pos.needsUpdate = true;
        groundGeo.computeVertexNormals();
        const groundMatDay = new THREE.MeshStandardMaterial({ color: 0xeaf3ff, roughness: 0.95 });
        const groundMatNight = new THREE.MeshStandardMaterial({ color: 0x0b1220, roughness: 1.0 });
        const ground = new THREE.Mesh(groundGeo, groundMatDay);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // Groups
        const bookGroup = new THREE.Group();
        scene.add(bookGroup);

        // Fireflies
        const fireflies = new THREE.Group();
        scene.add(fireflies);
        const fireflyGeo = new THREE.SphereGeometry(0.035, 10, 10);
        const fireflyMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
        for (let i = 0; i < 120; i++) {
            const f = new THREE.Mesh(fireflyGeo, fireflyMat);
            f.position.set(
                THREE.MathUtils.randFloatSpread(24),
                1 + Math.random() * 4.2,
                THREE.MathUtils.randFloatSpread(70) - 15,
            );
            fireflies.add(f);
        }

        // Path for camera travel
        const curvePoints = [
            new THREE.Vector3(0, 2.4, 20),
            new THREE.Vector3(0, 2.2, 8),
            new THREE.Vector3(0, 2.0, 0),
            new THREE.Vector3(0.4, 2.2, -12),
            new THREE.Vector3(-0.4, 2.4, -24),
            new THREE.Vector3(0, 2.6, -38),
            new THREE.Vector3(0.2, 2.8, -55),
        ];
        const path = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.08);
        const pathGeo = new THREE.TubeGeometry(path, 140, 0.05, 8, false);
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
        function onPointerMove(e) {
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        }
        renderer.domElement.addEventListener('pointermove', onPointerMove);

        // Timeline travel
        const travel = { t: 0 };
        const tl = gsap.timeline({ paused: true });
        tl.to(travel, {
            t: 1,
            duration: 36,
            ease: 'power2.inOut',
            onUpdate: () => {
                const p = path.getPointAt(travel.t);
                const lookAt = path.getPointAt(Math.min(travel.t + 0.01, 1));
                camera.position.copy(p);
                camera.lookAt(lookAt);
            },
        });
        function nudge(step = 0.08) {
            gsap.to(travel, {
                t: Math.min(1, travel.t + step),
                duration: 0.8,
                ease: 'power2.out',
                onUpdate: tl.getChildren()[0]?.vars?.onUpdate,
            });
        }

        // Night toggle
        function setNight(n) {
            if (n) {
                scene.background = new THREE.Color(0x060816);
                scene.fog = new THREE.Fog(0x060816, 12, 55);
                ground.material = groundMatNight;
                pathMesh.material = pathMatNight;
                dir.intensity = 0.8;
                hemi.intensity = 0.45;
            } else {
                scene.background = new THREE.Color(0xf7fbff);
                scene.fog = new THREE.Fog(0xf0f6ff, 18, 70);
                ground.material = groundMatDay;
                pathMesh.material = pathMatDay;
                dir.intensity = 1.15;
                hemi.intensity = 0.9;
            }
        }
        setNight(false);

        // Loader for covers
        const loader = new THREE.TextureLoader();
        loader.crossOrigin = 'anonymous';

        function clearBooks() {
            while (bookGroup.children.length) {
                const m = bookGroup.children.pop();
                m.traverse((o) => {
                    if (o.isMesh) {
                        o.geometry?.dispose?.();
                        o.material?.map?.dispose?.();
                        if (Array.isArray(o.material)) o.material.forEach((mm) => mm.dispose?.());
                        o.material?.dispose?.();
                    }
                });
            }
        }

        function makeBook({ title, author, cover }, x, z) {
            const w = THREE.MathUtils.randFloat(0.9, 1.2);
            const h = THREE.MathUtils.randFloat(1.4, 2.0);
            const d = THREE.MathUtils.randFloat(0.18, 0.32);
            const geo = new THREE.BoxGeometry(w, h, d);

            const coverMat = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0.05,
                roughness: 0.65,
                clearcoat: 0.6,
                clearcoatRoughness: 0.35,
                envMap: envTex,
            });
            const pagesMat = new THREE.MeshStandardMaterial({ color: 0xf7f7f2, roughness: 0.9 });
            const spineMat = new THREE.MeshStandardMaterial({ color: 0x1f2a44, roughness: 0.6, metalness: 0.05 });
            const mats = [pagesMat, pagesMat, pagesMat, pagesMat, coverMat, spineMat];
            const mesh = new THREE.Mesh(geo, mats);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            if (cover) {
                loader.load(
                    cover,
                    (tex) => {
                        tex.colorSpace = THREE.SRGBColorSpace;
                        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy?.() || 8);
                        coverMat.map = tex;
                        coverMat.needsUpdate = true;
                    },
                    undefined,
                    () => {},
                );
            }

            // Label (title + author)
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#0000';
            ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 40px "Segoe UI"';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            wrapText(ctx, `${title}\n${author}`, 256, 256, 420, 50);
            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
            sprite.scale.set(1.6, 1.6, 1);
            sprite.position.set(0, h / 2 + 0.1, 0);
            mesh.add(sprite);

            mesh.position.set(x, h / 2, z);
            mesh.rotation.y = THREE.MathUtils.randFloatSpread(0.4);
            mesh.userData = { title, author };
            return mesh;
        }

        function wrapText(ctx, text, x, y, maxWidth, lh) {
            const lines = [];
            text.split('\n').forEach((block) => {
                const words = block.split(/\s+/);
                let line = '';
                for (let i = 0; i < words.length; i++) {
                    const test = line + words[i] + ' ';
                    if (ctx.measureText(test).width > maxWidth && i > 0) {
                        lines.push(line.trim());
                        line = words[i] + ' ';
                    } else line = test;
                }
                lines.push(line.trim());
            });
            const totalH = lines.length * lh;
            let yy = y - totalH / 2 + lh / 2;
            for (const l of lines) {
                ctx.fillText(l, x, yy);
                yy += lh;
            }
        }

        function buildPage(list) {
            clearBooks();
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
                    const x = startX + c * gapX + THREE.MathUtils.randFloatSpread(0.5);
                    const z = startZ + r * gapZ + THREE.MathUtils.randFloatSpread(0.6);
                    const mesh = makeBook(b, x, z);
                    bookGroup.add(mesh);
                }
            }
        }

        // Click: nếu trúng sách => zoom, else => nudge theo path
        function onClick(e) {
            const rect = renderer.domElement.getBoundingClientRect();
            const m = new THREE.Vector2(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -((e.clientY - rect.top) / rect.height) * 2 + 1,
            );
            raycaster.setFromCamera(m, camera);
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

        function onResize() {
            const { clientWidth, clientHeight } = mountEl;
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(clientWidth, clientHeight);
        }
        window.addEventListener('resize', onResize);

        // Animate
        const clock = new THREE.Clock();
        let raf;
        function animate() {
            const t = clock.getElapsedTime();
            fireflies.children.forEach((f, i) => {
                f.position.y += Math.sin(t + i) * 0.0015;
                f.position.x += Math.cos(t * 0.5 + i) * 0.0009;
            });

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

            renderer.render(scene, camera);
            raf = requestAnimationFrame(animate);
        }
        animate();

        // expose
        threeRef.current = { buildPage, setNight };

        // cleanup
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', onResize);
            renderer.domElement.removeEventListener('pointermove', onPointerMove);
            renderer.domElement.removeEventListener('click', onClick);
            mountEl.removeChild(renderer.domElement);
            renderer.dispose();
            groundGeo.dispose();
            pathGeo.dispose();
            pmrem.dispose();
        };
    }, []);

    // Rebuild page when books/page change
    useEffect(() => {
        const api = threeRef.current;
        if (!api?.buildPage) return;
        const start = (page - 1) * pageSize;
        api.buildPage(books.slice(start, start + pageSize));
    }, [books, page]);

    // Night sync
    useEffect(() => {
        threeRef.current?.setNight?.(isNight);
    }, [isNight]);

    const total = books.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return (
        <div style={{ width: '100%', minHeight: '100vh', background: 'var(--sb-bg)' }}>
            <style>{baseCss}</style>
            <section className="hero3d">
                <div className="canvas-wrap" ref={mountRef} />

                {/* Overlay */}
                <div className="overlay">
                    <Tag color="processing" className="brand">
                        SmartBook
                    </Tag>
                    <Title level={2} className="bigtitle">
                        Khám phá <span>Thế Giới Sách</span>
                    </Title>
                    <Paragraph className="subtitle">
                        Ảnh cover lấy từ API thật. Click nền để đi tiếp, click sách để zoom.
                    </Paragraph>
                    <div className="actions">
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlayCircleOutlined />}
                            onClick={() => gsap.globalTimeline.getChildren().forEach((tl) => tl.play && tl.play())}
                        >
                            Khám phá
                        </Button>
                        <Button
                            size="large"
                            icon={<PauseCircleOutlined />}
                            onClick={() => gsap.globalTimeline.getChildren().forEach((tl) => tl.pause && tl.pause())}
                        >
                            Tạm dừng
                        </Button>
                        <Button size="large" icon={<BulbOutlined />} onClick={() => setIsNight((v) => !v)}>
                            {isNight ? 'Ngày' : 'Đêm'}
                        </Button>
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

            {/* Features */}
            <section className="features">
                <div className="container">
                    <Row gutter={[24, 24]}>
                        <Col xs={24} md={8}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <BookOutlined />
                                </div>
                                <Title level={4}>Ảnh thật từ API</Title>
                                <Paragraph>Map cover trực tiếp lên bìa sách 3D.</Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <RocketOutlined />
                                </div>
                                <Title level={4}>Click để di chuyển</Title>
                                <Paragraph>Đi dọc path bằng click nền, zoom gần khi click sách.</Paragraph>
                            </Card>
                        </Col>
                        <Col xs={24} md={8}>
                            <Card className="feature-card" bordered={false}>
                                <div className="feature-icon">
                                    <BulbOutlined />
                                </div>
                                <Title level={4}>Day/Night + Fog</Title>
                                <Paragraph>Vibe điện ảnh, hiệu ứng mượt hơn.</Paragraph>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </section>

            <footer className="footer">© {new Date().getFullYear()} SmartBook — World of Books.</footer>
        </div>
    );
}

const baseCss = `
:root{ --sb-blue:#1677ff; --sb-ink:#0f172a; --sb-ink-2:#475569; --sb-bg:#ffffff; --card-shadow:0 10px 30px rgba(22,119,255,.08); }
*{box-sizing:border-box}
body{margin:0}
.hero3d{position:relative;height:100vh;width:100%;background:linear-gradient(180deg,#f7fbff 0%,#fff 100%)}
.canvas-wrap{position:absolute;inset:0}
.overlay{position:absolute;left:4vw;top:8vh;z-index:3;max-width:540px}
.brand{font-size:14px; padding:6px 10px}
.bigtitle{margin:.3rem 0 0 0; font-weight:800; color:var(--sb-ink)}
.bigtitle span{color:var(--sb-blue)}
.subtitle{color:#475569;margin:.2rem 0 1rem}
.hover-card{position:absolute;right:20px;top:20px;z-index:4;box-shadow:var(--card-shadow)}
.actions{display:flex;gap:12px;margin-top:12px;align-items:center}
.pg{min-width:76px;text-align:center;font-weight:600}
.features{padding:72px 0;background:#fff}
.container{width:min(1100px,92%);margin:0 auto}
.feature-card{border:none;border-radius:16px;box-shadow:var(--card-shadow)}
.feature-icon{width:64px;height:64px;border-radius:16px;display:grid;place-items:center;background:linear-gradient(135deg,#eaf3ff,#d6e9ff);margin-bottom:12px;font-size:28px;color:#1e90ff}
.footer{padding:24px 0 56px;text-align:center;color:#64748b}
.loading{position:absolute;inset:0;display:grid;place-items:center;background:rgba(255,255,255,.5);z-index:5}
@media(max-width:768px){.overlay{left:5vw;top:6vh;right:5vw;max-width:none}}
`;
