import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Globe({ size = 80 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(size, size);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    // Wireframe globe — 14 lat lines × 20 lon lines looks like a clean globe
    const geo = new THREE.SphereGeometry(5, 10, 7);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x888888,
      wireframe: true,
      transparent: true,
      opacity: 0.5,
    });
    const globe = new THREE.Mesh(geo, mat);
    globe.rotation.z = 23.5 * (Math.PI / 180);
    scene.add(globe);

    // London pin
    const lat = 51.5 * (Math.PI / 180);
    const lon = 0;
    const r = 5;

    const pinGeo = new THREE.SphereGeometry(0.45, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x4F46E5 });
    const pin = new THREE.Mesh(pinGeo, pinMat);
    pin.position.set(
      r * Math.cos(lat) * Math.cos(lon),
      r * Math.sin(lat),
      r * Math.cos(lat) * Math.sin(lon),
    );
    globe.add(pin);

    // Pulsing ring
    const ringGeo = new THREE.RingGeometry(0.5, 0.65, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x4F46E5,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pin.position);
    ring.lookAt(new THREE.Vector3(0, 0, 0));
    globe.add(ring);

    // Animate
    let raf, scale = 1, scaleDir = 1;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      globe.rotation.y += 0.006;

      scale += 0.015 * scaleDir;
      if (scale > 1.8) scaleDir = -1;
      if (scale < 1.0) scaleDir = 1;
      ring.scale.setScalar(scale);
      ringMat.opacity = 0.7 - (scale - 1) * 0.5;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [size]);

  return <div ref={mountRef} style={{ width: size, height: size, flexShrink: 0, display: 'inline-block' }} />;
}
