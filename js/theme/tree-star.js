(function () {
  var tree = document.querySelector('.tree');
  if (!tree) return;

  var POINTS = [
    [90.19, 104.33],
    [57.12, 87.38],
    [24.4, 105],
    [30.31, 68.31],
    [3.44, 42.65],
    [40.16, 36.93],
    [56.26, 3.43],
    [73.06, 36.6],
    [109.89, 41.57],
    [83.54, 67.78]
  ];
  var CX = 56.66;
  var CY = 54.22;
  var LAYERS = 14;
  var THICK = 13;
  var SIZE = 34;
  var REDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isPost = document.body.classList.contains('is-post');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var canvas = document.createElement('canvas');
  canvas.className = 'tree-star-canvas';
  canvas.width = SIZE * dpr;
  canvas.height = SIZE * dpr;
  canvas.setAttribute('aria-hidden', 'true');
  tree.innerHTML = '';
  tree.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  function lerpColor(a, b, t) {
    return [
      Math.round(a[0] + (b[0] - a[0]) * t),
      Math.round(a[1] + (b[1] - a[1]) * t),
      Math.round(a[2] + (b[2] - a[2]) * t)
    ];
  }

  function rotateProject(x, y, z, rotX, rotY, rotZ) {
    var cy = y * Math.cos(rotX) - z * Math.sin(rotX);
    var cz = y * Math.sin(rotX) + z * Math.cos(rotX);
    y = cy;
    z = cz;
    var cx = x * Math.cos(rotY) + z * Math.sin(rotY);
    cz = -x * Math.sin(rotY) + z * Math.cos(rotY);
    x = cx;
    z = cz;
    var rx = x * Math.cos(rotZ) - y * Math.sin(rotZ);
    var ry = x * Math.sin(rotZ) + y * Math.cos(rotZ);
    x = rx;
    y = ry;
    var persp = 220;
    var s = persp / (persp - z);
    return { x: x * s, y: y * s, z: z };
  }

  function drawStar(rotX, rotY, rotZ) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.translate(SIZE / 2, SIZE / 2 + 1);

    var scale = 0.205;
    var slices = [];
    var i;
    var p;
    var j;
    var localZ;
    var pt;
    var proj;
    var avgZ;
    var poly;

    for (i = 0; i < LAYERS; i++) {
      localZ = (i / (LAYERS - 1) - 0.5) * THICK;
      poly = [];
      avgZ = 0;
      for (j = 0; j < POINTS.length; j++) {
        pt = POINTS[j];
        proj = rotateProject((pt[0] - CX) * scale, (pt[1] - CY) * scale, localZ, rotX, rotY, rotZ);
        poly.push(proj);
        avgZ += proj.z;
      }
      slices.push({ poly: poly, z: avgZ / POINTS.length, u: i / (LAYERS - 1) });
    }
    slices.sort(function (a, b) { return a.z - b.z; });

    var back = [176, 132, 58];
    var front = [255, 236, 176];
    var edge = [255, 248, 220];

    for (i = 0; i < slices.length; i++) {
      p = slices[i];
      var c = lerpColor(back, front, p.u);
      ctx.beginPath();
      ctx.moveTo(p.poly[0].x, p.poly[0].y);
      for (j = 1; j < p.poly.length; j++) ctx.lineTo(p.poly[j].x, p.poly[j].y);
      ctx.closePath();
      ctx.fillStyle = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
      ctx.fill();
      if (p.u > 0.92) {
        ctx.strokeStyle = 'rgba(' + edge[0] + ',' + edge[1] + ',' + edge[2] + ',0.95)';
        ctx.lineWidth = 0.9;
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.shadowColor = 'rgba(178, 199, 226, 0.55)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  var start = performance.now();
  var zPeriod = 8000;
  var yPeriod = 10000;

  function frame(now) {
    var t = (now - start);
    var rotX;
    var rotY;
    var rotZ;
    if (REDUCE) {
      rotX = 0.38;
      rotY = isPost ? 0.55 : 0.2;
      rotZ = isPost ? 0 : 0.15;
      drawStar(rotX, rotY, rotZ);
      return;
    }
    if (isPost) {
      rotX = 0.28;
      rotY = (t / yPeriod) * Math.PI * 2;
      rotZ = 0;
    } else {
      rotX = 0.4;
      rotY = 0.18;
      rotZ = (t / zPeriod) * Math.PI * 2;
    }
    drawStar(rotX, rotY, rotZ);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();
