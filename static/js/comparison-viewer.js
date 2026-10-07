// Real-world comparison viewer (adapted from the ECCV 2026 page).
// The divider sweeps back and forth automatically; after each round trip the
// left panel alternates between "No Attack" and "Under Attack". Hovering or
// dragging takes manual control, and leaving resumes the animation.
(function () {
  const IMG_ROOT = 'static/images/realworld/';
  const SCENES = ['scene1', 'scene2', 'scene3', 'scene4'];
  const LEFT_STATES = [
    { key: 'benign', label: 'No Attack', cls: 'benign' },
    { key: 'attacked', label: 'Under Attack', cls: 'attacked' },
  ];

  function init() {
    const viewer = document.getElementById('compViewer');
    if (!viewer) return;
    const base = document.getElementById('compBase');
    const overlay = document.getElementById('compOverlay');
    const divider = document.getElementById('compDivider');
    const labelLeft = document.getElementById('compLabelLeft');

    // Preload every scene so switching does not flicker
    SCENES.forEach(s => ['benign', 'attacked', 'denoised'].forEach(k => {
      new Image().src = IMG_ROOT + s + '/' + k + '.jpg';
    }));

    let currentScene = SCENES[0];
    let stateIdx = 0;
    let pos = 50, vel = 0.35, bounces = 0;
    let switching = false, manual = false, dragging = false;

    function setPos(p) {
      pos = Math.min(100, Math.max(0, p));
      const s = pos.toFixed(1);
      divider.style.left = s + '%';
      overlay.style.clipPath = `polygon(0 0, ${s}% 0, ${s}% 100%, 0 100%)`;
    }

    function switchLeft() {
      stateIdx = (stateIdx + 1) % LEFT_STATES.length;
      const s = LEFT_STATES[stateIdx];
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.src = IMG_ROOT + currentScene + '/' + s.key + '.jpg';
        labelLeft.textContent = s.label;
        labelLeft.className = 'comp-label comp-label-left ' + s.cls;
        overlay.style.opacity = '1';
        switching = false;
      }, 420);
    }

    document.querySelectorAll('.scene-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.scene-btn').forEach(b => b.classList.remove('is-info'));
        btn.classList.add('is-info');
        currentScene = btn.dataset.scene;
        base.src = IMG_ROOT + currentScene + '/denoised.jpg';
        overlay.src = IMG_ROOT + currentScene + '/' + LEFT_STATES[stateIdx].key + '.jpg';
      });
    });

    // Manual control
    function posFromEvent(e) {
      const r = viewer.getBoundingClientRect();
      return ((e.clientX - r.left) / r.width) * 100;
    }
    viewer.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') manual = true; });
    viewer.addEventListener('pointermove', e => {
      if ((manual && e.pointerType === 'mouse') || dragging) setPos(posFromEvent(e));
    });
    viewer.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') manual = false; });
    viewer.addEventListener('pointerdown', e => {
      dragging = manual = true;
      viewer.setPointerCapture(e.pointerId);
      setPos(posFromEvent(e));
    });
    const endDrag = e => {
      if (!dragging) return;
      dragging = false;
      if (e.pointerType !== 'mouse') manual = false;
    };
    viewer.addEventListener('pointerup', endDrag);
    viewer.addEventListener('pointercancel', endDrag);

    // Auto animation: one full round trip (2 bounces) switches the left panel
    function tick() {
      if (!manual) {
        let p = pos + vel;
        if (p >= 95 && vel > 0) { vel = -vel; bounces++; }
        if (p <= 5 && vel < 0) { vel = -vel; bounces++; }
        if (bounces >= 2 && !switching) {
          bounces = 0;
          switching = true;
          switchLeft();
        }
        setPos(p);
      }
      requestAnimationFrame(tick);
    }
    setPos(50);
    requestAnimationFrame(tick);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
