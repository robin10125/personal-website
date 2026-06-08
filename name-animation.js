/* Name title introduction animation.
 *
 * Concept: an "all-gather" across a multi-TPU node. Six coloured horizontal
 * bars emanate from the screen edges toward the centre; each bar lands on a
 * letter and illuminates one of its rows (a scattered diagonal seed). Then, in
 * a series of steps, each row-colour propagates sideways from letter to letter:
 * a coloured bar emanates from a lit letter into its neighbours. Bars skip over
 * any letter whose glyph has no ink at that row's height and carry on until
 * they reach a letter that does intersect, where they land. After every
 * intersecting letter holds every row the word shows the full spectrum, then it
 * fades to a solid black font.
 */
(function () {
  "use strict";

  var TITLE = document.getElementById("site-title");
  if (!TITLE) return;

  var NAME = "Robin Hylands";
  var ROWS = 6;
  var TEXT = [22, 22, 22]; // #161616 final font colour

  var reduce =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- palette: 6 distinct rainbow colours --------------------------------
  function hsl2rgb(h, s, l) {
    h /= 360;
    function hue(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    return [
      Math.round(hue(p, q, h + 1 / 3) * 255),
      Math.round(hue(p, q, h) * 255),
      Math.round(hue(p, q, h - 1 / 3) * 255),
    ];
  }

  var PALETTE = [];
  for (var r = 0; r < ROWS; r++) {
    PALETTE.push(hsl2rgb((r / ROWS) * 360, 0.72, 0.55));
  }

  // --- build the letter DOM -----------------------------------------------
  var anim = document.createElement("div");
  anim.className = "name-anim";
  anim.setAttribute("aria-hidden", "true");

  var letters = []; // { el, idx, ch, rows: [rgb|null x ROWS], occ: [bool x ROWS] }
  var idx = 0;
  for (var i = 0; i < NAME.length; i++) {
    var ch = NAME.charAt(i);
    if (ch === " ") {
      var sp = document.createElement("span");
      sp.className = "space";
      sp.textContent = " ";
      anim.appendChild(sp);
      continue;
    }
    var el = document.createElement("span");
    el.className = "letter";
    el.textContent = ch;
    anim.appendChild(el);
    var rowsArr = [];
    for (var k = 0; k < ROWS; k++) rowsArr.push(null);
    letters.push({ el: el, idx: idx, ch: ch, rows: rowsArr, occ: null });
    idx++;
  }
  var N = letters.length;

  TITLE.appendChild(anim);
  TITLE.classList.add("anim-ready");

  function rgb(c) {
    return "rgb(" + c[0] + "," + c[1] + "," + c[2] + ")";
  }

  // The ROWS bands are mapped onto the glyph ink range (cap-top to
  // descender-bottom) rather than the whole line box, so colours line up with
  // where the letters actually have ink. Filled by computeOccupancy().
  var inkTop = 0; // fraction of the box height
  var inkSpan = 1;

  function bgFor(rows) {
    var stops = [];
    var top = inkTop * 100;
    var band = (inkSpan / ROWS) * 100;
    stops.push("transparent 0%");
    stops.push("transparent " + top.toFixed(3) + "%");
    for (var rr = 0; rr < ROWS; rr++) {
      var a = (top + rr * band).toFixed(3);
      var b = (top + (rr + 1) * band).toFixed(3);
      var col = rows[rr] ? rgb(rows[rr]) : "transparent";
      stops.push(col + " " + a + "%");
      stops.push(col + " " + b + "%");
    }
    stops.push("transparent " + (top + ROWS * band).toFixed(3) + "%");
    stops.push("transparent 100%");
    return "linear-gradient(to bottom," + stops.join(",") + ")";
  }

  function render(L) {
    L.el.style.backgroundImage = bgFor(L.rows);
  }

  for (var li = 0; li < letters.length; li++) render(letters[li]);

  // --- per-glyph row occupancy --------------------------------------------
  // Rasterise each character and record which pixel rows have ink. The 6 bands
  // are then mapped onto the combined ink range of the word (cap-top to
  // descender-bottom), so the top band is the cap region and the bottom band is
  // the descender region -- not the empty leading above/below the glyphs. Each
  // letter only "intersects" the bands its glyph actually reaches.
  function computeOccupancy() {
    var cs = window.getComputedStyle(letters[0].el);
    var F = parseFloat(cs.fontSize) || 32;
    var L = parseFloat(cs.lineHeight);
    if (!L || isNaN(L)) L = 1.12 * F;
    var font = cs.fontWeight + " " + cs.fontSize + " " + cs.fontFamily;

    var cv = document.createElement("canvas");
    var ctx = cv.getContext("2d", { willReadFrequently: true });
    ctx.font = font;
    var m = ctx.measureText("Hg");
    var asc = m.fontBoundingBoxAscent || m.actualBoundingBoxAscent || F * 0.8;
    var desc = m.fontBoundingBoxDescent || m.actualBoundingBoxDescent || F * 0.2;
    var baseline = (L - (asc + desc)) / 2 + asc; // distance from box top

    var H = Math.max(1, Math.ceil(L));
    var pad = 4;

    // Pass 1: per-letter per-pixel-row ink, and the word's global ink extent.
    var minY = H;
    var maxY = -1;
    for (var n = 0; n < letters.length; n++) {
      var Lt = letters[n];
      ctx.font = font;
      var w = Math.max(1, Math.ceil(ctx.measureText(Lt.ch).width)) + pad * 2;
      cv.width = w;
      cv.height = H;
      ctx.clearRect(0, 0, w, H);
      ctx.font = font;
      ctx.fillStyle = "#000";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(Lt.ch, pad, baseline);
      var data = ctx.getImageData(0, 0, w, H).data;

      var rowInk = new Uint8Array(H);
      for (var y = 0; y < H; y++) {
        var base = y * w * 4;
        for (var x = 0; x < w; x++) {
          if (data[base + x * 4 + 3] > 40) {
            rowInk[y] = 1;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            break;
          }
        }
      }
      Lt._rowInk = rowInk;
    }

    if (maxY < minY) {
      minY = 0;
      maxY = H - 1;
    }
    var span = maxY + 1 - minY;
    inkTop = minY / H;
    inkSpan = span / H;

    // Pass 2: band occupancy over the ink range [minY, maxY].
    for (var n2 = 0; n2 < letters.length; n2++) {
      var Lt2 = letters[n2];
      var occ = [];
      for (var rr = 0; rr < ROWS; rr++) {
        var y0 = Math.round(minY + (rr / ROWS) * span);
        var y1 = Math.max(y0 + 1, Math.round(minY + ((rr + 1) / ROWS) * span));
        var inked = false;
        for (var yy = y0; yy < y1 && yy < H; yy++) {
          if (Lt2._rowInk[yy]) {
            inked = true;
            break;
          }
        }
        occ.push(inked);
      }
      Lt2.occ = occ;
      Lt2._rowInk = null;
    }
  }
  computeOccupancy();

  // For each row, the ordered list of letters whose glyph intersects it.
  var rowLetters = [];
  for (var rr0 = 0; rr0 < ROWS; rr0++) {
    var list = [];
    for (var d0 = 0; d0 < letters.length; d0++) {
      if (letters[d0].occ[rr0]) list.push(d0);
    }
    rowLetters.push(list);
  }

  // Seed letter per row: the intersecting letter closest to a diagonal target,
  // so the initial frame scatters one stripe across the word.
  var seedOf = [];
  for (var sr = 0; sr < ROWS; sr++) {
    var listS = rowLetters[sr];
    if (!listS.length) {
      seedOf.push(-1);
      continue;
    }
    var target = Math.round((sr / Math.max(1, ROWS - 1)) * (N - 1));
    var best = listS[0];
    var bestD = Infinity;
    for (var q2 = 0; q2 < listS.length; q2++) {
      var dd = Math.abs(listS[q2] - target);
      if (dd < bestD) {
        bestD = dd;
        best = listS[q2];
      }
    }
    seedOf.push(best);
  }

  function fill(mode) {
    for (var m2 = 0; m2 < letters.length; m2++) {
      var L = letters[m2];
      for (var c = 0; c < ROWS; c++) {
        if (mode === "black") L.rows[c] = TEXT;
        else if (mode === "rainbow") L.rows[c] = PALETTE[c];
        else if (mode === "diagonal")
          L.rows[c] = seedOf[c] === L.idx ? PALETTE[c] : null;
      }
      render(L);
    }
  }

  // Reduced motion: jump straight to the solid black name.
  if (reduce) {
    fill("black");
    return;
  }

  // Dev hook: ?anim=diagonal|rainbow|black renders a static state for testing.
  var dbg = (location.search.match(/[?&]anim=(\w+)/) || [])[1];
  if (dbg === "diagonal" || dbg === "rainbow" || dbg === "black") {
    fill(dbg);
    return;
  }

  // --- geometry for the emanating bars ------------------------------------
  var strip = TITLE.closest(".education-strip") || TITLE.parentNode;
  strip.style.position = "relative";

  var sr2 = strip.getBoundingClientRect();
  var ar = anim.getBoundingClientRect();
  var bandTop = ar.top - sr2.top;
  var bandHeight = ar.height;

  for (var lg = 0; lg < letters.length; lg++) {
    var lr = letters[lg].el.getBoundingClientRect();
    letters[lg].cx = lr.left + lr.width / 2 - sr2.left;
    letters[lg].w = lr.width;
  }

  // Seed one row on its origin letter (the scattered diagonal the all-gather
  // spreads out from).
  function depositSeed(row) {
    var s = seedOf[row];
    if (s < 0) return;
    var L = letters[s];
    if (L.rows[row]) return;
    L.rows[row] = PALETTE[row];
    render(L);
  }

  // --- phase A: letter fragments fly out from the middle to their seed
  // letters and land seamlessly ---------------------------------------------
  // Each flyer is a clone of its seed letter showing only that one seed row, so
  // when it reaches the real letter the fragment is identical -- the hand-off
  // is a no-op (no shape change, no pop).
  var SPREAD_MS = 650;
  anim.style.position = "relative";
  var animCenterX = anim.clientWidth / 2;

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  var flyers = [];
  for (var rb = 0; rb < ROWS; rb++) {
    var se = seedOf[rb];
    if (se < 0) continue;
    var oneRow = [];
    for (var t0 = 0; t0 < ROWS; t0++) oneRow.push(t0 === rb ? PALETTE[rb] : null);
    var srcEl = letters[se].el;
    var clone = document.createElement("span");
    clone.className = "letter";
    clone.textContent = letters[se].ch;
    clone.style.position = "absolute";
    clone.style.top = srcEl.offsetTop + "px";
    clone.style.backgroundImage = bgFor(oneRow);
    anim.appendChild(clone);
    flyers.push({
      el: clone,
      row: rb,
      from: animCenterX - srcEl.offsetWidth / 2,
      to: srcEl.offsetLeft,
    });
  }
  for (var fi = 0; fi < flyers.length; fi++) {
    flyers[fi].el.style.left = flyers[fi].from + "px";
  }

  function spreadFromCenter() {
    return new Promise(function (resolve) {
      var start = null;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / SPREAD_MS);
        var e = easeInOut(p);
        for (var i = 0; i < flyers.length; i++) {
          var fl = flyers[i];
          fl.el.style.left =
            (fl.from + (fl.to - fl.from) * e).toFixed(2) + "px";
        }
        if (p < 1) {
          requestAnimationFrame(frame);
        } else {
          // Land: reveal the real seed and drop the flyer -- identical fragment
          // in the identical spot, so nothing visibly changes.
          for (var k = 0; k < flyers.length; k++) {
            depositSeed(flyers[k].row);
            if (flyers[k].el.parentNode) {
              flyers[k].el.parentNode.removeChild(flyers[k].el);
            }
          }
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  function wait(ms) {
    return new Promise(function (res) {
      setTimeout(res, ms);
    });
  }

  // --- transfer bar: grows from the source letter toward the destination ---
  var BAR_MS = 160;
  var PAUSE_MS = 120; // brief pause after each step

  function spawnBar(layer, fromCx, toCx, row, color, onArrive) {
    var bar = document.createElement("div");
    bar.className = "transfer-bar";
    var left = Math.min(fromCx, toCx);
    var width = Math.max(2, Math.abs(toCx - fromCx));
    var bandPx = (inkSpan / ROWS) * bandHeight;
    bar.style.left = left + "px";
    bar.style.width = width + "px";
    bar.style.top = (inkTop * bandHeight + row * bandPx).toFixed(2) + "px";
    bar.style.height = bandPx.toFixed(2) + "px";
    bar.style.background = color;
    bar.style.transformOrigin = toCx >= fromCx ? "0% 50%" : "100% 50%";
    bar.style.transform = "scaleX(0)";
    bar.style.transition = "transform " + BAR_MS + "ms ease-out";
    layer.appendChild(bar);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        bar.style.transform = "scaleX(1)";
      });
    });
    setTimeout(function () {
      onArrive();
      if (bar.parentNode) bar.parentNode.removeChild(bar);
    }, BAR_MS);
  }

  // --- phase B: all-gather, one ring per step ------------------------------
  // Each row r propagates independently along rowLetters[r]. A covered letter
  // sends a bar to its next uncovered neighbour in that list; the bar spans the
  // gap (skipping any non-intersecting letters between them) and lands there.
  function allGather() {
    return new Promise(function (resolve) {
      var layer = document.createElement("div");
      layer.className = "name-bars name-transfer";
      layer.style.top = bandTop + "px";
      layer.style.height = bandHeight + "px";
      strip.appendChild(layer);

      // covered[r] aligned with rowLetters[r]; seeded from current fills.
      var covered = [];
      for (var r2 = 0; r2 < ROWS; r2++) {
        var lst = rowLetters[r2];
        var cov = [];
        for (var p = 0; p < lst.length; p++) {
          cov.push(!!letters[lst[p]].rows[r2]);
        }
        covered.push(cov);
      }

      function step() {
        var anyNew = false;
        for (var r3 = 0; r3 < ROWS; r3++) {
          var lst = rowLetters[r3];
          var cov = covered[r3];
          var claimed = {}; // dst position -> chosen this wave (dedupe)
          var moves = [];
          for (var p2 = 0; p2 < lst.length; p2++) {
            if (!cov[p2]) continue;
            var left = p2 - 1;
            var right = p2 + 1;
            if (left >= 0 && !cov[left] && !claimed[left]) {
              claimed[left] = true;
              moves.push([p2, left]);
            }
            if (right < lst.length && !cov[right] && !claimed[right]) {
              claimed[right] = true;
              moves.push([p2, right]);
            }
          }
          for (var mi = 0; mi < moves.length; mi++) {
            var srcP = moves[mi][0];
            var dstP = moves[mi][1];
            cov[dstP] = true; // mark now so it isn't reclaimed next wave
            anyNew = true;
            (function (row, dstLetter, fromCx, toCx) {
              spawnBar(
                layer,
                fromCx,
                toCx,
                row,
                rgb(PALETTE[row]),
                function () {
                  dstLetter.rows[row] = PALETTE[row];
                  render(dstLetter);
                }
              );
            })(r3, letters[lst[dstP]], letters[lst[srcP]].cx, letters[lst[dstP]].cx);
          }
        }

        if (anyNew) {
          setTimeout(step, BAR_MS + PAUSE_MS);
        } else {
          setTimeout(function () {
            for (var f = 0; f < letters.length; f++) {
              for (var c = 0; c < ROWS; c++) {
                if (letters[f].occ[c] && !letters[f].rows[c]) {
                  letters[f].rows[c] = PALETTE[c];
                }
              }
              render(letters[f]);
            }
            if (layer.parentNode) layer.parentNode.removeChild(layer);
            resolve();
          }, BAR_MS + PAUSE_MS);
        }
      }
      setTimeout(step, PAUSE_MS);
    });
  }

  // --- phase C: fade the spectrum to a solid black font --------------------
  var FADE_MS = 750;

  function fadeToBlack() {
    return new Promise(function (resolve) {
      var startRows = letters.map(function (L) {
        return L.rows.map(function (c) {
          return c ? c.slice() : null;
        });
      });
      var start = null;
      function frame(ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / FADE_MS);
        for (var d = 0; d < letters.length; d++) {
          var L = letters[d];
          for (var rr = 0; rr < ROWS; rr++) {
            var s = startRows[d][rr];
            if (!s) continue;
            L.rows[rr] = [
              Math.round(s[0] + (TEXT[0] - s[0]) * p),
              Math.round(s[1] + (TEXT[1] - s[1]) * p),
              Math.round(s[2] + (TEXT[2] - s[2]) * p),
            ];
          }
          render(L);
        }
        if (p < 1) requestAnimationFrame(frame);
        else resolve();
      }
      requestAnimationFrame(frame);
    });
  }

  // --- run the sequence ----------------------------------------------------
  // Bars spread out from the middle to their seed letters, then all-gather,
  // then fade to black.
  spreadFromCenter()
    .then(function () {
      return wait(200);
    })
    .then(allGather)
    .then(function () {
      return wait(320);
    })
    .then(fadeToBlack);
})();
