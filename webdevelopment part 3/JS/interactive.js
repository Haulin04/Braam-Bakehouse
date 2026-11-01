/* Braam Bakehouse - interactive elements.
   Scroll animations, accordions, the gallery lightbox, the "open now" badge
   and the interactive Leaflet map on the Contact page. */

document.documentElement.classList.add("js");

/* ---------- fade-in animation when sections scroll into view ---------- */
var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var revealObserver = ("IntersectionObserver" in window && !reduceMotion)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 })
    : null;

window.observeReveals = function (root) {
    (root || document).querySelectorAll(".reveal:not(.visible)").forEach(function (el, i) {
        if (!revealObserver) {
            el.classList.add("visible");
            return;
        }
        el.style.transitionDelay = Math.min(i, 6) * 60 + "ms";
        revealObserver.observe(el);
    });
};
window.observeReveals();

/* ---------- hamburger menu: close on outside click or Escape ---------- */
var menuToggle = document.getElementById("menu-toggle");
if (menuToggle) {
    document.addEventListener("click", function (e) {
        if (menuToggle.checked && !e.target.closest(".dropdown-menu")) menuToggle.checked = false;
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") menuToggle.checked = false;
    });
}

/* ---------- accordions (About and Contact pages) ---------- */
document.querySelectorAll(".accordion").forEach(function (accordion) {
    var buttons = accordion.querySelectorAll(".accordion-trigger");
    buttons.forEach(function (btn) {
        var panel = document.getElementById(btn.getAttribute("aria-controls"));
        // start closed unless marked open in the HTML
        if (btn.getAttribute("aria-expanded") !== "true") panel.hidden = true;
        else panel.style.maxHeight = "none";

        btn.addEventListener("click", function () {
            var open = btn.getAttribute("aria-expanded") === "true";
            // only one panel open at a time
            buttons.forEach(function (other) {
                if (other !== btn) setPanel(other, false);
            });
            setPanel(btn, !open);
        });
    });
});

function setPanel(btn, open) {
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
        panel.hidden = false;
        panel.style.maxHeight = "0px";
        requestAnimationFrame(function () { panel.style.maxHeight = panel.scrollHeight + "px"; });
    } else if (!panel.hidden) {
        panel.style.maxHeight = panel.scrollHeight + "px";
        requestAnimationFrame(function () { panel.style.maxHeight = "0px"; });
        setTimeout(function () {
            if (btn.getAttribute("aria-expanded") === "false") panel.hidden = true;
        }, 300);
    }
}

/* ---------- gallery lightbox ---------- */
var galleryLinks = Array.prototype.slice.call(document.querySelectorAll(".gallery-item"));
if (galleryLinks.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Image viewer");
    box.hidden = true;
    box.innerHTML =
        '<button type="button" class="lb-close" aria-label="Close image">&times;</button>' +
        '<button type="button" class="lb-prev" aria-label="Previous image">&#8249;</button>' +
        '<figure><img alt=""><figcaption></figcaption></figure>' +
        '<button type="button" class="lb-next" aria-label="Next image">&#8250;</button>' +
        '<p class="lb-count" aria-live="polite"></p>';
    document.body.appendChild(box);

    var lbImg = box.querySelector("img");
    var lbCaption = box.querySelector("figcaption");
    var lbCount = box.querySelector(".lb-count");
    var current = 0;
    var opener = null;

    function showImage(index) {
        current = (index + galleryLinks.length) % galleryLinks.length;
        var link = galleryLinks[current];
        var thumb = link.querySelector("img");
        box.classList.remove("zoom");
        void box.offsetWidth; // restart zoom animation
        box.classList.add("zoom");
        lbImg.src = link.getAttribute("href");
        lbImg.alt = thumb.alt;
        lbCaption.textContent = link.dataset.caption || thumb.alt;
        lbCount.textContent = (current + 1) + " of " + galleryLinks.length;
    }

    function openLightbox(index) {
        opener = document.activeElement;
        showImage(index);
        box.hidden = false;
        document.body.classList.add("no-scroll");
        box.querySelector(".lb-close").focus();
    }

    function closeLightbox() {
        box.hidden = true;
        document.body.classList.remove("no-scroll");
        if (opener) opener.focus();
    }

    galleryLinks.forEach(function (link, i) {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            openLightbox(i);
        });
    });
    box.addEventListener("click", function (e) {
        if (e.target === box || e.target.closest(".lb-close")) closeLightbox();
        if (e.target.closest(".lb-prev")) showImage(current - 1);
        if (e.target.closest(".lb-next")) showImage(current + 1);
    });
    document.addEventListener("keydown", function (e) {
        if (box.hidden) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowLeft") showImage(current - 1);
        if (e.key === "ArrowRight") showImage(current + 1);
        // keep keyboard focus inside the lightbox
        if (e.key === "Tab") {
            var focusables = box.querySelectorAll("button");
            var firstEl = focusables[0], lastEl = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
            else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
        }
    });

    // simple filter buttons above the gallery
    document.querySelectorAll("[data-gallery-filter]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var tag = btn.dataset.galleryFilter;
            document.querySelectorAll("[data-gallery-filter]").forEach(function (b) {
                b.setAttribute("aria-pressed", b === btn ? "true" : "false");
            });
            galleryLinks.forEach(function (link) {
                link.closest("li").hidden = tag !== "all" && link.dataset.tag !== tag;
            });
        });
    });
}

/* ---------- "open now" badge (uses bakery hours from products.js) ---------- */
function openStatus(now) {
    var hours = BAKERY.hours[now.getDay()];
    var h = now.getHours() + now.getMinutes() / 60;
    var pad = function (n) { return (n < 10 ? "0" : "") + n + ":00"; };
    if (h >= hours[0] && h < hours[1]) return { open: true, text: "Open now - closes at " + pad(hours[1]) };
    if (h < hours[0]) return { open: false, text: "Closed now - opens today at " + pad(hours[0]) };
    var tomorrow = BAKERY.hours[(now.getDay() + 1) % 7];
    return { open: false, text: "Closed now - opens tomorrow at " + pad(tomorrow[0]) };
}

document.querySelectorAll(".open-status").forEach(function (el) {
    var status = openStatus(new Date());
    el.textContent = status.text;
    el.classList.add(status.open ? "is-open" : "is-closed");
});

/* ---------- interactive map (Leaflet + OpenStreetMap) ---------- */
var mapBox = document.getElementById("map");
if (mapBox && window.L) {
    var shop = [BAKERY.lat, BAKERY.lng];
    var map = L.map(mapBox, { scrollWheelZoom: false }).setView(shop, 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener noreferrer" target="_blank">OpenStreetMap</a> contributors'
    }).addTo(map);

    var shopMarker = L.marker(shop, { title: BAKERY.name }).addTo(map);
    shopMarker.bindPopup(
        "<b>" + BAKERY.name + "</b><br>100 Jorissen Street, Braamfontein<br>" +
        openStatus(new Date()).text + "<br>" +
        '<a href="https://www.google.com/maps/dir/?api=1&destination=' + BAKERY.lat + "," + BAKERY.lng +
        '" target="_blank" rel="noopener noreferrer">Get directions</a>'
    ).openPopup();

    // circle showing the Braamfontein area we serve
    L.circle(shop, { radius: 400, color: "#7a3e25", fillColor: "#d17a42", fillOpacity: 0.12 }).addTo(map);

    // "How far am I?" uses the browser's location (asks permission first)
    var locateBtn = document.getElementById("locate-btn");
    var distanceText = document.getElementById("distance-text");
    var youMarker = null, line = null;

    locateBtn.addEventListener("click", function () {
        if (!navigator.geolocation) {
            distanceText.textContent = "Your browser cannot share your location.";
            return;
        }
        distanceText.textContent = "Finding your location...";
        navigator.geolocation.getCurrentPosition(function (pos) {
            var you = [pos.coords.latitude, pos.coords.longitude];
            var km = map.distance(you, shop) / 1000;
            if (youMarker) map.removeLayer(youMarker);
            if (line) map.removeLayer(line);
            youMarker = L.circleMarker(you, { radius: 8, color: "#3d2920", fillColor: "#d17a42", fillOpacity: 1 })
                .addTo(map).bindPopup("You are here").openPopup();
            line = L.polyline([you, shop], { color: "#7a3e25", dashArray: "6 8" }).addTo(map);
            map.fitBounds(line.getBounds(), { padding: [40, 40] });
            distanceText.textContent = "You are about " + km.toFixed(1) + " km from Braam Bakehouse (in a straight line).";
        }, function () {
            distanceText.textContent = "We couldn't get your location. You can still use Get directions.";
        }, { timeout: 10000 });
    });

    document.getElementById("recenter-btn").addEventListener("click", function () {
        map.setView(shop, 16);
        shopMarker.openPopup();
    });
} else if (mapBox) {
    mapBox.innerHTML = '<p class="map-fallback">The map needs an internet connection. We are at 100 Jorissen Street, Braamfontein, Johannesburg.</p>';
}
