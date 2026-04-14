(function () {
    'use strict';

    /* ============================
       ROI VERTICAL TABS
       ============================ */
    const roiData = {
        pest: {
            dealLabel: '24-Mo Customer Value',
            revLabel: '24-Month Revenue',
            note: 'Avg contract: $1,000/yr · 20% annual attrition over 24 months',
            conservative: { leads: 20, rate: '35–50%', closes: '7–10', deal: '$1,440', rev: '$10k–$14.4k', mult: '~3.5–5x' },
            expected:     { leads: 30, rate: '35–50%', closes: '10–15', deal: '$1,440', rev: '$14.4k–$21.6k', mult: '~5–7x' }
        },
        roofing: {
            conservative: { leads: 15, rate: '10–15%', closes: '1–2', deal: '$20,000', rev: '$20k–$40k', mult: '~7–14x' },
            expected:     { leads: 25, rate: '15–20%', closes: '3–5', deal: '$30,000', rev: '$90k–$150k', mult: '~31–52x' }
        },
        realestate: {
            conservative: { leads: 20, rate: '25–30%', closes: '1–2', deal: '$7,500–$15,000', rev: '$7.5k–$30k', mult: '~3–10x' },
            expected:     { leads: '25–30', rate: '25–30%', closes: '2–3', deal: '$7,500–$15,000', rev: '$15k–$45k', mult: '~5–15x' }
        },
        wholesale: {
            conservative: { leads: 20, rate: '10–15%', closes: '2–3', deal: '$5,000–$10,000', rev: '$10k–$30k', mult: '~3–10x' },
            expected:     { leads: '25–30', rate: '10–15%', closes: '3–5', deal: '$8,000–$12,000', rev: '$24k–$60k', mult: '~8–21x' }
        },
        solar: {
            /* 2026 avg residential solar system: $25k–$35k
               Close rate from qualified leads: 10–15% */
            note: 'Avg residential system: $30,000 · 2026 market data',
            conservative: { leads: 20, rate: '10–15%', closes: '2–3', deal: '$28,000', rev: '$56k–$84k', mult: '~19–29x' },
            expected:     { leads: 30, rate: '10–15%', closes: '3–5', deal: '$30,000', rev: '$90k–$150k', mult: '~31–52x' }
        },
        hvac: {
            /* 2026 avg HVAC system replacement: $5k–$12.5k
               Sweet spot for cold-called leads: full system installs
               Close rate from qualified leads: 20–30% */
            note: 'Avg system replacement: $8,000 · 2026 market data',
            conservative: { leads: 20, rate: '20–30%', closes: '4–6', deal: '$8,000', rev: '$32k–$48k', mult: '~11–16x' },
            expected:     { leads: 30, rate: '20–30%', closes: '6–9', deal: '$8,000', rev: '$48k–$72k', mult: '~16–25x' }
        },
        landscape: {
            /* 2026 avg residential landscape project: $1k–$6k
               Project-based work (patios, installs, hardscape)
               Close rate from qualified leads: 25–35% */
            note: 'Avg project ticket: $3,500 · installs, hardscape & design',
            conservative: { leads: 20, rate: '25–35%', closes: '5–7', deal: '$3,500', rev: '$17.5k–$24.5k', mult: '~6–8x' },
            expected:     { leads: 30, rate: '25–35%', closes: '8–10', deal: '$3,500', rev: '$28k–$35k', mult: '~10–12x' }
        },
    };

    function col(d, highlight, meta) {
        const dealLabel = (meta && meta.dealLabel) || 'Avg Deal Value';
        const revLabel = (meta && meta.revLabel) || 'Monthly Revenue';
        return '<div class="roi-column' + (highlight ? ' roi-column--highlight' : '') + '">' +
            '<div class="roi-column-header">' + (highlight ? 'Expected Growth' : 'Conservative Baseline') + '</div>' +
            '<div class="roi-row"><span class="roi-label">▼ Qualified Leads</span><span class="roi-value">' + d.leads + '</span></div>' +
            '<div class="roi-row"><span class="roi-label">Close Rate (' + d.rate + ')</span><span class="roi-value highlight-green">' + d.closes + ' Closed</span></div>' +
            '<div class="roi-divider"></div>' +
            '<div class="roi-row"><span class="roi-label">' + dealLabel + '</span><span class="roi-value">' + d.deal + '</span></div>' +
            '<div class="roi-result"><span class="roi-result-label">' + revLabel + '</span><span class="roi-result-value">' + d.rev + '</span></div>' +
            '<div class="roi-multiplier' + (highlight ? ' roi-multiplier--big' : '') + '">' + d.mult + '</div>' +
            '</div>';
    }

    function renderROI(v) {
        const el = document.getElementById('roiContent');
        if (!el) return;
        const d = roiData[v];
        const meta = { dealLabel: d.dealLabel, revLabel: d.revLabel };
        let html = col(d.conservative, false, meta) + col(d.expected, true, meta);
        if (d.note) {
            html += '<p class="roi-note" style="width:100%;text-align:center;font-size:12px;color:rgba(168,184,200,0.7);margin-top:12px;font-style:italic;">' + d.note + '</p>';
        }
        el.innerHTML = html;
    }

    /* Calculator defaults per vertical — extracted from roiData deal values */
    var calcDefaults = {
        roofing:    { deal: 20000, rate: 15, leads: 25 },
        realestate: { deal: 10000, rate: 28, leads: 25 },
        wholesale:  { deal: 8000,  rate: 12, leads: 25 },
        solar:      { deal: 30000, rate: 12, leads: 25 },
        hvac:       { deal: 8000,  rate: 25, leads: 25 },
        landscape:  { deal: 3500,  rate: 30, leads: 25 },
        pest:       { deal: 1440,  rate: 42, leads: 25 }
    };

    /* Verticals that use commission-based earnings */
    var commissionVerticals = { pest: 60, solar: 25 };


    function syncCalcToVertical(vertical) {
        var d = calcDefaults[vertical];
        if (!d) return;
        var calcDealEl = document.getElementById('calcDeal');
        var calcRateEl = document.getElementById('calcRate');
        var calcLeadsEl = document.getElementById('calcLeads');
        var commRow = document.getElementById('calcCommissionRow');
        var commSlider = document.getElementById('calcCommission');
        var commVal = document.getElementById('calcCommissionVal');
        var commLabel = commRow ? commRow.querySelector('.roi-calc-label') : null;
        var dealRow = document.getElementById('calcDealRow');
        if (!calcDealEl) return;
        calcDealEl.value = d.deal;
        calcRateEl.value = d.rate;
        calcLeadsEl.value = d.leads;

        if (commissionVerticals.hasOwnProperty(vertical)) {
            // Solar/Pest: show commission %, show deal size
            if (dealRow) dealRow.style.display = 'flex';
            commRow.style.display = 'flex';
            if (commLabel) commLabel.textContent = 'Your Commission %';
            commSlider.min = 5;
            commSlider.max = 100;
            commSlider.step = 1;
            commSlider.value = commissionVerticals[vertical];
            commVal.textContent = commissionVerticals[vertical] + '%';
        } else {
            // All others: show deal size, hide commission/stack
            if (dealRow) dealRow.style.display = 'flex';
            commRow.style.display = 'none';
        }

        // Store current vertical for updateCalc
        window._currentVertical = vertical;

        if (typeof window.updateCalc === 'function') window.updateCalc();
    }

    document.addEventListener('click', function (e) {
        if (!e.target.classList.contains('vtab')) return;
        document.querySelectorAll('.vtab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        var v = e.target.dataset.vertical;
        renderROI(v);
        syncCalcToVertical(v);
    });

    if (document.getElementById('roiContent')) renderROI('roofing');

    /* ============================
       BOOKING MODAL
       ============================ */
    const modal = document.getElementById('bookingModal');
    const modalClose = document.getElementById('modalClose');
    const bookingForm = document.getElementById('bookingForm');
    const modalSuccess = document.getElementById('modalSuccess');

    function openModal(e) {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Attach to all CTA buttons
    document.querySelectorAll('.cta-btn, .pricing-cta').forEach(function (btn) {
        btn.addEventListener('click', openModal);
    });

    if (modalClose) modalClose.addEventListener('click', closeModal);

    // Close on overlay click
    if (modal) modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
    });

    // Form submission
    if (bookingForm) bookingForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const data = new FormData(bookingForm);
        const obj = {};
        data.forEach(function (v, k) { obj[k] = v; });

        // Send to Google Sheets via Apps Script
        fetch('https://script.google.com/macros/s/AKfycbzfpEylM-brhh_Kc58en2YoJw9nBQ94w-ghdW4C7X1CaAsILduQO2T9vI5EqnYqNnvw5A/exec', {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify(obj)
        }).catch(function (err) { console.warn('Sheet submit error:', err); });

        // Show success state
        bookingForm.style.display = 'none';
        document.querySelector('.modal-sub').style.display = 'none';
        if (modalSuccess) modalSuccess.style.display = 'block';

        // Auto-close after 4 seconds
        setTimeout(function () {
            closeModal();
            // Reset form for next use
            setTimeout(function () {
                bookingForm.reset();
                bookingForm.style.display = '';
                document.querySelector('.modal-sub').style.display = '';
                if (modalSuccess) modalSuccess.style.display = 'none';
            }, 400);
        }, 4000);
    });

    /* ============================
       SCROLL VISIBILITY (for animations)
       ============================ */
    const slides = document.querySelectorAll('.slide');

    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: [0.2] });
    slides.forEach(s => obs.observe(s));
    slides[0].classList.add('is-visible');

    /* Scramble text module removed — replaced with CSS typewriter */

    /* ============================
       CINEMATIC MODULE 3: SPOTLIGHT BORDER CARDS
       ============================ */
    // Add spot-card class to all card grids
    var spotGridSelectors = ['.problem-card', '.exec-card', '.faq-card', '.glance-card'];
    spotGridSelectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (card) {
            card.classList.add('spot-card');
        });
    });

    // Add spot-grid class to parent grids
    var gridSelectors = ['.problem-grid', '.execution-grid', '.faq-grid', '.glance-grid'];
    gridSelectors.forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (grid) {
            grid.classList.add('spot-grid');
        });
    });

    // Mousemove tracker for all spotlight grids
    document.querySelectorAll('.spot-grid').forEach(function (grid) {
        grid.addEventListener('mousemove', function (e) {
            var cards = grid.querySelectorAll('.spot-card');
            cards.forEach(function (c) {
                var r = c.getBoundingClientRect();
                c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                c.style.setProperty('--my', (e.clientY - r.top) + 'px');
            });
        });
    });




    /* ============================
       FEATURE 3: INTERACTIVE ROI CALCULATOR
       ============================ */
    var calcDeal = document.getElementById('calcDeal');
    var calcRate = document.getElementById('calcRate');
    var calcLeads = document.getElementById('calcLeads');
    var calcCommission = document.getElementById('calcCommission');
    var calcDealVal = document.getElementById('calcDealVal');
    var calcRateVal = document.getElementById('calcRateVal');
    var calcLeadsVal = document.getElementById('calcLeadsVal');
    var calcCommissionVal = document.getElementById('calcCommissionVal');
    var calcRevenue = document.getElementById('calcRevenue');
    var calcROI = document.getElementById('calcROI');
    var calcCommissionRow = document.getElementById('calcCommissionRow');

    // Make updateCalc available to syncCalcToVertical
    window.updateCalc = updateCalc;
    function updateCalc() {
        if (!calcDeal) return;
        var deal = parseInt(calcDeal.value);
        var rate = parseInt(calcRate.value);
        var leads = parseInt(calcLeads.value);
        var vert = window._currentVertical || 'roofing';

        calcDealVal.textContent = '$' + deal.toLocaleString();
        calcRateVal.textContent = rate + '%';
        calcLeadsVal.textContent = leads;

        var closes = Math.round(leads * (rate / 100) * 10) / 10;
        var revenue;

        if (calcCommissionRow && calcCommissionRow.style.display !== 'none' && calcCommission && commissionVerticals.hasOwnProperty(vert)) {
            // Solar/Pest: apply commission % to deal value
            var commPct = parseInt(calcCommission.value);
            calcCommissionVal.textContent = commPct + '%';
            var effectiveDeal = Math.round(deal * (commPct / 100));
            revenue = Math.round(closes * effectiveDeal);
        } else {
            revenue = Math.round(closes * deal);
        }

        var roi = (revenue / 2910).toFixed(1);

        calcRevenue.textContent = '$' + revenue.toLocaleString();
        calcROI.textContent = "That's a " + roi + 'x return on your $2,910 investment';
    }

    if (calcDeal) {
        calcDeal.addEventListener('input', updateCalc);
        calcRate.addEventListener('input', updateCalc);
        calcLeads.addEventListener('input', updateCalc);
        if (calcCommission) calcCommission.addEventListener('input', updateCalc);
        updateCalc();
    }

    /* ============================
       FEATURE 5: AMBIENT AURORA + CONSTELLATION
       ============================ */
    var orbCanvas = document.getElementById('ambientCanvas');
    if (orbCanvas) {
        var ctx = orbCanvas.getContext('2d');

        function resizeCanvas() {
            orbCanvas.width = window.innerWidth;
            orbCanvas.height = window.innerHeight;
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Large aurora blobs
        var blobs = [
            { x: 0.1,  y: 0.1,  r: 500, color: [91,155,213],  alpha: 0.22, speed: 0.0008, phase: 0 },
            { x: 0.9,  y: 0.2,  r: 450, color: [78,205,196],   alpha: 0.18, speed: 0.0006, phase: 1.5 },
            { x: 0.5,  y: 0.5,  r: 550, color: [126,200,227],  alpha: 0.14, speed: 0.0007, phase: 3.0 },
            { x: 0.2,  y: 0.8,  r: 480, color: [78,205,196],   alpha: 0.20, speed: 0.0009, phase: 4.5 },
            { x: 0.85, y: 0.7,  r: 420, color: [91,155,213],    alpha: 0.16, speed: 0.0005, phase: 2.0 },
            { x: 0.4,  y: 0.3,  r: 400, color: [60,140,200],    alpha: 0.18, speed: 0.0007, phase: 5.5 }
        ];

        // Constellation particles — visible but not overtaking
        var stars = [];
        var numStars = 90;
        var connectionDist = 160;

        for (var si = 0; si < numStars; si++) {
            stars.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.25,
                radius: 1.2 + Math.random() * 2,
                alpha: 0.35 + Math.random() * 0.4,
                twinkleSpeed: 0.002 + Math.random() * 0.003,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }

        function drawScene(t) {
            ctx.clearRect(0, 0, orbCanvas.width, orbCanvas.height);
            var w = orbCanvas.width;
            var h = orbCanvas.height;

            /* --- Aurora blobs --- */
            for (var i = 0; i < blobs.length; i++) {
                var b = blobs[i];
                var ox = Math.sin(t * b.speed + b.phase) * 180;
                var oy = Math.cos(t * b.speed * 0.7 + b.phase) * 120;
                var bx = b.x * w + ox;
                var by = b.y * h + oy;
                var pulse = 0.5 + 0.5 * Math.sin(t * b.speed * 1.5 + b.phase);
                var currentAlpha = b.alpha * (0.5 + pulse * 0.5);
                var currentR = b.r * (0.8 + pulse * 0.4);
                var grad = ctx.createRadialGradient(bx, by, 0, bx, by, currentR);
                grad.addColorStop(0, 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',' + currentAlpha + ')');
                grad.addColorStop(0.3, 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',' + (currentAlpha * 0.6) + ')');
                grad.addColorStop(0.7, 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',' + (currentAlpha * 0.2) + ')');
                grad.addColorStop(1, 'rgba(' + b.color[0] + ',' + b.color[1] + ',' + b.color[2] + ',0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(bx, by, currentR, 0, Math.PI * 2);
                ctx.fill();
            }

            /* --- Constellation stars & lines --- */
            // Update positions
            for (var j = 0; j < stars.length; j++) {
                var s = stars[j];
                s.x += s.vx;
                s.y += s.vy;
                // Wrap around edges
                if (s.x < 0) s.x = w;
                if (s.x > w) s.x = 0;
                if (s.y < 0) s.y = h;
                if (s.y > h) s.y = 0;
            }

            // Draw connecting lines
            for (var a = 0; a < stars.length; a++) {
                for (var c = a + 1; c < stars.length; c++) {
                    var dx = stars[a].x - stars[c].x;
                    var dy = stars[a].y - stars[c].y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDist) {
                        var lineAlpha = (1 - dist / connectionDist) * 0.3;
                        ctx.strokeStyle = 'rgba(150,210,235,' + lineAlpha + ')';
                        ctx.lineWidth = 0.7;
                        ctx.beginPath();
                        ctx.moveTo(stars[a].x, stars[a].y);
                        ctx.lineTo(stars[c].x, stars[c].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw star dots with twinkle
            for (var k = 0; k < stars.length; k++) {
                var st = stars[k];
                var twinkle = 0.5 + 0.5 * Math.sin(t * st.twinkleSpeed + st.twinklePhase);
                var starAlpha = st.alpha * (0.42 + twinkle * 0.58);
                ctx.fillStyle = 'rgba(210,230,245,' + starAlpha + ')';
                ctx.beginPath();
                ctx.arc(st.x, st.y, st.radius * (0.8 + twinkle * 0.4), 0, Math.PI * 2);
                ctx.fill();
            }

            requestAnimationFrame(drawScene);
        }
        requestAnimationFrame(drawScene);
    }

})();
