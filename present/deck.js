(function () {
  var slides = [].slice.call(document.querySelectorAll('.slide'));
  var bar = document.createElement('div'); bar.className = 'bar'; document.body.appendChild(bar);
  var count = document.createElement('div'); count.className = 'count'; document.body.appendChild(count);
  var prev = document.createElement('button'); prev.className = 'nav prev'; prev.setAttribute('aria-label', 'Previous slide'); prev.textContent = '‹'; document.body.appendChild(prev);
  var next = document.createElement('button'); next.className = 'nav next'; next.setAttribute('aria-label', 'Next slide'); next.textContent = '›'; document.body.appendChild(next);
  var i = Math.max(0, Math.min(slides.length - 1, (parseInt(location.hash.slice(1), 10) || 1) - 1));

  function show(n) {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function (s, k) {
      s.classList.toggle('on', k === i);
      s.querySelectorAll('video').forEach(function (v) { if (k === i) { v.currentTime = 0; v.play().catch(function () {}); } else v.pause(); });
      s.querySelectorAll('.msg').forEach(function (m) { m.style.animation = 'none'; if (k === i) { void m.offsetWidth; m.style.animation = ''; } });
    });
    var cur = slides[i];
    document.body.classList.toggle('ondark', cur.classList.contains('dark') || cur.classList.contains('green'));
    bar.style.width = ((i + 1) / slides.length * 100) + '%';
    count.textContent = (i + 1) + ' / ' + slides.length;
    history.replaceState(null, '', '#' + (i + 1));
  }
  document.addEventListener('keydown', function (e) {
    if (['ArrowRight', 'PageDown', ' ', 'Enter'].indexOf(e.key) > -1) { e.preventDefault(); show(i + 1); }
    if (['ArrowLeft', 'PageUp', 'Backspace'].indexOf(e.key) > -1) { e.preventDefault(); show(i - 1); }
    if (e.key === 'Home') show(0); if (e.key === 'End') show(slides.length - 1);
    if (e.key === 'f') { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {}); else document.exitFullscreen(); }
  });
  prev.addEventListener('click', function () { show(i - 1); });
  next.addEventListener('click', function () { show(i + 1); });
  var x0 = null;
  document.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 50) show(i + (dx < 0 ? 1 : -1)); x0 = null; });
  show(i);
})();
