/* Braam Bakehouse - main script (every page).
   Handles: cart drawer, wishlist, header search, the dynamic product listing
   on the Services page (search, category tabs and sorting) and checkout.
   Cart and wishlist are saved in the visitor's browser with localStorage. */

// pages live in /pages/, the homepage lives one level up
var inPages = window.location.pathname.indexOf("/pages/") !== -1;
var pagesPath = inPages ? "" : "pages/";
var imagePath = inPages ? "../Image/" : "Image/";

/* ---------- small helpers ---------- */

// escape text before putting it into HTML (stops script injection)
function esc(text) {
    return String(text).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
}

function load(key) {
    try {
        var data = JSON.parse(localStorage.getItem(key));
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full or blocked */ }
}

function getCart() { return load("bb-cart"); }
function getWishlist() { return load("bb-wishlist"); }
function money(amount) { return "R" + amount; }

function showMessage(text) {
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.textContent = text;
    document.body.appendChild(toast);
    // let the browser paint first so the slide-in transition runs
    requestAnimationFrame(function () { toast.classList.add("show"); });
    setTimeout(function () {
        toast.classList.remove("show");
        setTimeout(function () { toast.remove(); }, 400);
    }, 2400);
}

/* ---------- cart ---------- */
function addToCart(id, quantity) {
    var product = findProduct(id);
    if (!product) return;
    var cart = getCart();
    var item = cart.find(function (i) { return i.id === id; });
    if (item) {
        item.quantity = Math.min(99, item.quantity + quantity);
    } else {
        cart.push({ id: id, name: product.name, price: product.price, quantity: quantity });
    }
    save("bb-cart", cart);
    updateCounts(true);
    showMessage("Added " + quantity + " x " + product.name + " to your cart");
}

function changeQuantity(id, change) {
    var cart = getCart();
    cart.forEach(function (i) { if (i.id === id) i.quantity = Math.min(99, i.quantity + change); });
    cart = cart.filter(function (i) { return i.quantity > 0; });
    save("bb-cart", cart);
    updateCounts();
    renderCart();
    renderCheckoutSummary();
}

function cartTotal(cart) {
    return cart.reduce(function (sum, i) { return sum + i.price * i.quantity; }, 0);
}

function updateCounts(bump) {
    var count = getCart().reduce(function (n, i) { return n + i.quantity; }, 0);
    document.querySelectorAll(".cart-count").forEach(function (el) {
        el.textContent = count;
        if (bump) {
            // restart the little "bump" animation on the cart button
            var btn = el.closest(".shop-link");
            btn.classList.remove("bump");
            void btn.offsetWidth;
            btn.classList.add("bump");
        }
    });
    document.querySelectorAll(".wish-count").forEach(function (el) {
        el.textContent = getWishlist().length;
    });
}

// build the cart drawer (a modal dialog) once on every page
var overlay = document.createElement("div");
overlay.className = "cart-overlay";
overlay.innerHTML =
    '<div class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">' +
    '<button type="button" class="cart-close" aria-label="Close cart">&times;</button>' +
    '<h2 id="cart-title">Your Cart</h2><div id="cart-items"></div></div>';
document.body.appendChild(overlay);
var lastFocus = null;

function openCart() {
    renderCart();
    lastFocus = document.activeElement;
    overlay.classList.add("open");
    document.body.classList.add("no-scroll");
    overlay.querySelector(".cart-close").focus();
}

function closeCart() {
    overlay.classList.remove("open");
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
}

overlay.addEventListener("click", function (e) {
    if (e.target === overlay || e.target.closest(".cart-close")) closeCart();
});
document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay.classList.contains("open")) closeCart();
});

function renderCart() {
    var box = document.getElementById("cart-items");
    var cart = getCart();
    if (cart.length === 0) {
        box.innerHTML = '<p class="muted">Your cart is empty.</p><a class="checkout-btn" href="' +
            pagesPath + 'services.html">Browse our products</a>';
        return;
    }
    var html = "";
    cart.forEach(function (i) {
        html += '<div class="cart-line"><b>' + esc(i.name) + "</b>" +
            money(i.price) + " x " + i.quantity + " = <b>" + money(i.price * i.quantity) + "</b>" +
            '<div class="qty-controls">' +
            '<button type="button" data-change="-1" data-id="' + esc(i.id) + '" aria-label="Remove one ' + esc(i.name) + '">-</button>' +
            '<button type="button" data-change="1" data-id="' + esc(i.id) + '" aria-label="Add one ' + esc(i.name) + '">+</button>' +
            '<button type="button" class="link-btn" data-change="-999" data-id="' + esc(i.id) + '">Remove</button>' +
            "</div></div>";
    });
    html += '<p class="cart-total">Total: ' + money(cartTotal(cart)) + "</p>";
    html += '<a class="checkout-btn" href="' + pagesPath + 'checkout.html">Checkout</a>';
    html += '<button type="button" id="empty-cart" class="link-btn">Empty cart</button>';
    box.innerHTML = html;
}

/* ---------- wishlist ---------- */
function toggleWish(id) {
    var product = findProduct(id);
    if (!product) return;
    var list = getWishlist();
    var exists = list.some(function (i) { return i.id === id; });
    if (exists) {
        list = list.filter(function (i) { return i.id !== id; });
        showMessage("Removed " + product.name + " from your wishlist");
    } else {
        list.push({ id: id, name: product.name, price: product.price });
        showMessage("Saved " + product.name + " to your wishlist");
    }
    save("bb-wishlist", list);
    updateCounts();
    paintWishButtons();
    renderWishlist();
}

function paintWishButtons() {
    var list = getWishlist();
    document.querySelectorAll(".wish-btn").forEach(function (btn) {
        var saved = list.some(function (i) { return i.id === btn.dataset.id; });
        btn.classList.toggle("saved", saved);
        btn.setAttribute("aria-pressed", saved ? "true" : "false");
        btn.innerHTML = saved ? "&#9829; Saved" : "&#9825; Wishlist";
    });
}

function renderWishlist() {
    var box = document.getElementById("wishlist-items");
    if (!box) return;
    var list = getWishlist();
    if (list.length === 0) {
        box.innerHTML = '<p class="muted">Your wishlist is empty.</p><a class="btn" href="services.html">Browse products</a>';
        return;
    }
    var html = "";
    list.forEach(function (i) {
        html += '<div class="wish-line"><b>' + esc(i.name) + "</b>" + money(i.price) +
            '<div><button type="button" class="wish-add" data-id="' + esc(i.id) + '">Add to cart</button>' +
            '<button type="button" class="wish-remove link-btn" data-id="' + esc(i.id) + '">Remove</button></div></div>';
    });
    box.innerHTML = html;
}

/* ---------- one click handler for every page (event delegation) ---------- */
document.addEventListener("click", function (e) {
    var t = e.target.closest("button, a");
    if (!t) return;

    if (t.classList.contains("cart-open")) openCart();
    if (t.dataset.change) changeQuantity(t.dataset.id, Number(t.dataset.change));
    if (t.id === "empty-cart") {
        save("bb-cart", []);
        updateCounts();
        renderCart();
    }
    if (t.classList.contains("add-to-cart")) {
        var input = document.getElementById("qty-" + t.dataset.id);
        var qty = Math.max(1, Math.min(99, parseInt(input ? input.value : 1, 10) || 1));
        addToCart(t.dataset.id, qty);
        if (input) input.value = 1;
    }
    if (t.classList.contains("wish-btn") || t.classList.contains("wish-remove")) toggleWish(t.dataset.id);
    if (t.classList.contains("wish-add")) addToCart(t.dataset.id, 1);
});

/* ---------- Services page: dynamic product listing ---------- */
var productGrid = document.getElementById("product-grid");
var filters = { q: "", category: "all", sort: "featured" };

function productCard(p) {
    var cat = CATEGORIES.find(function (c) { return c.id === p.category; });
    return '<article class="product-card reveal" data-category="' + p.category + '">' +
        '<img src="' + imagePath + cat.image + '" alt="' + esc(p.name + " - " + cat.name + " at Braam Bakehouse") +
        '" width="400" height="300" loading="lazy">' +
        '<div class="product-body">' +
        '<p class="tag">' + cat.name + "</p>" +
        "<h3>" + esc(p.name) + "</h3>" +
        "<p>" + esc(p.description) + "</p>" +
        '<p class="price">' + money(p.price) + (p.unit ? " <small>" + p.unit + "</small>" : "") + "</p>" +
        '<div class="buy-row">' +
        '<label for="qty-' + p.id + '">Quantity</label>' +
        '<input type="number" id="qty-' + p.id + '" min="1" max="99" value="1">' +
        '<button type="button" class="add-to-cart" data-id="' + p.id + '">Add to cart</button>' +
        '<button type="button" class="wish-btn" data-id="' + p.id + '" aria-pressed="false" aria-label="Save ' +
        esc(p.name) + ' to wishlist">&#9825; Wishlist</button>' +
        "</div></div></article>";
}

function renderProducts() {
    if (!productGrid) return;
    var q = filters.q.toLowerCase();
    var list = PRODUCTS.filter(function (p) {
        var inCategory = filters.category === "all" || p.category === filters.category;
        var matches = !q || (p.name + " " + p.description + " " + p.category).toLowerCase().indexOf(q) !== -1;
        return inCategory && matches;
    });

    list = list.slice().sort(function (a, b) {
        if (filters.sort === "price-low") return a.price - b.price;
        if (filters.sort === "price-high") return b.price - a.price;
        if (filters.sort === "name") return a.name.localeCompare(b.name);
        return PRODUCTS.indexOf(a) - PRODUCTS.indexOf(b);
    });

    var count = document.getElementById("result-count");
    if (list.length === 0) {
        productGrid.innerHTML = '<p class="empty-state">No products found' +
            (filters.q ? ' for "' + esc(filters.q) + '"' : "") +
            '. Try another word, or <a href="enquiry.html">send us an enquiry</a> for something special.</p>';
        count.textContent = "0 products";
    } else {
        productGrid.innerHTML = list.map(productCard).join("");
        count.textContent = list.length + (list.length === 1 ? " product" : " products");
    }
    paintWishButtons();
    if (window.observeReveals) window.observeReveals(productGrid);

    // keep the address bar in sync so filtered results can be shared
    var params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.category !== "all") params.set("category", filters.category);
    if (filters.sort !== "featured") params.set("sort", filters.sort);
    var url = window.location.pathname + (params.toString() ? "?" + params.toString() : "");
    history.replaceState(null, "", url);
}

function selectTab(category) {
    filters.category = category;
    document.querySelectorAll('[role="tab"]').forEach(function (tab) {
        var active = tab.dataset.category === category;
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.tabIndex = active ? 0 : -1;
    });
    renderProducts();
}

if (productGrid) {
    var params = new URLSearchParams(window.location.search);
    var searchBox = document.getElementById("product-search");
    var sortBox = document.getElementById("product-sort");
    filters.q = (params.get("q") || "").slice(0, 60);
    var startCategory = params.get("category");
    filters.category = CATEGORIES.some(function (c) { return c.id === startCategory; }) ? startCategory : "all";
    filters.sort = ["featured", "price-low", "price-high", "name"].indexOf(params.get("sort")) !== -1 ? params.get("sort") : "featured";
    searchBox.value = filters.q;
    sortBox.value = filters.sort;

    searchBox.addEventListener("input", function () {
        filters.q = searchBox.value.trim();
        renderProducts();
    });
    sortBox.addEventListener("change", function () {
        filters.sort = sortBox.value;
        renderProducts();
    });

    var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
    tabs.forEach(function (tab, index) {
        tab.addEventListener("click", function () { selectTab(tab.dataset.category); });
        // arrow keys move between tabs (WAI-ARIA tabs pattern)
        tab.addEventListener("keydown", function (e) {
            var next = null;
            if (e.key === "ArrowRight") next = tabs[(index + 1) % tabs.length];
            if (e.key === "ArrowLeft") next = tabs[(index - 1 + tabs.length) % tabs.length];
            if (next) {
                e.preventDefault();
                next.focus();
                selectTab(next.dataset.category);
            }
        });
    });
    selectTab(filters.category);
}

/* ---------- header search on every page ---------- */
// The header search is a normal form that sends ?q= to services.html.
// On the Services page itself it filters the list straight away instead.
document.querySelectorAll(".search-container").forEach(function (form) {
    form.addEventListener("submit", function (e) {
        var input = form.querySelector("input");
        var q = input.value.trim();
        if (!q) {
            e.preventDefault();
            input.focus();
            return;
        }
        if (productGrid) {
            e.preventDefault();
            document.getElementById("product-search").value = q;
            filters.q = q;
            selectTab("all");
            document.getElementById("products").scrollIntoView({ behavior: "smooth" });
        }
    });
});

/* ---------- checkout ---------- */
function slotsFor(dateText) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText || "")) return [];
    var parts = dateText.split("-");
    var day = new Date(parts[0], parts[1] - 1, parts[2]).getDay();
    var hours = BAKERY.hours[day];
    var slots = [];
    for (var h = hours[0]; h < hours[1]; h++) slots.push((h < 10 ? "0" : "") + h + ":00");
    return slots;
}

function todayText() {
    var d = new Date();
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
}

function renderCheckoutSummary() {
    var box = document.getElementById("checkout-summary");
    if (!box) return;
    var cart = getCart();
    var form = document.getElementById("checkout-form");
    if (cart.length === 0) {
        box.innerHTML = '<p class="muted">Your cart is empty.</p><a class="btn" href="services.html">Browse products</a>';
        if (form) form.hidden = true;
        return;
    }
    var html = "<h2>Order summary</h2>";
    cart.forEach(function (i) {
        html += '<div class="cart-line"><b>' + esc(i.name) + "</b>" + i.quantity + " x " +
            money(i.price) + " = <b>" + money(i.price * i.quantity) + "</b></div>";
    });
    html += '<p class="cart-total">Total: ' + money(cartTotal(cart)) + "</p>";
    box.innerHTML = html;
}

var checkoutForm = document.getElementById("checkout-form");
if (checkoutForm) {
    var dateInput = document.getElementById("co-date");
    var timeSelect = document.getElementById("co-time");
    dateInput.min = todayText();

    dateInput.addEventListener("change", function () {
        var slots = slotsFor(dateInput.value);
        timeSelect.innerHTML = '<option value="">Select a time</option>' +
            slots.map(function (s) { return '<option value="' + s + '">' + s + "</option>"; }).join("");
    });

    checkoutForm.querySelectorAll('input[name="method"]').forEach(function (r) {
        r.addEventListener("change", function () {
            document.getElementById("address-group").hidden =
                checkoutForm.querySelector('input[name="method"]:checked').value !== "delivery";
        });
    });

    checkoutForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var method = checkoutForm.querySelector('input[name="method"]:checked').value;
        var payment = checkoutForm.querySelector('input[name="payment"]:checked').value;
        var values = {
            name: document.getElementById("co-name").value.trim(),
            email: document.getElementById("co-email").value.trim(),
            phone: document.getElementById("co-phone").value.trim(),
            address: document.getElementById("co-address").value.trim()
        };
        var errors = {};
        if (values.name.length < 2) errors["co-name"] = "Please enter your full name.";
        if (!isEmail(values.email)) errors["co-email"] = "Please enter a valid email address, e.g. name@example.com.";
        if (!isSaPhone(values.phone)) errors["co-phone"] = "Please enter a 10-digit South African number, e.g. 061 234 5678.";
        if (method === "delivery" && values.address.length < 5) errors["co-address"] = "Please enter your delivery address.";
        if (!dateInput.value || dateInput.value < todayText()) errors["co-date"] = "Please choose today or a future date.";
        if (slotsFor(dateInput.value).indexOf(timeSelect.value) === -1) errors["co-time"] = "Please choose a time within our opening hours.";

        if (!showFieldErrors(checkoutForm, errors)) return;

        var cart = getCart();
        var orderNumber = "BB-" + Math.floor(100000 + Math.random() * 900000);
        var lines = cart.map(function (i) {
            return esc(i.quantity + " x " + i.name + " - " + money(i.price * i.quantity));
        }).join("<br>");
        document.getElementById("order-confirmation").innerHTML =
            '<div class="form-success" tabindex="-1"><h2>Thank you, ' + esc(values.name.split(" ")[0]) + "!</h2>" +
            "<p>Your order <b>" + orderNumber + "</b> has been placed.</p><p>" + lines +
            "<br><b>Total: " + money(cartTotal(cart)) + "</b></p>" +
            "<p>" + (method === "delivery" ? "Delivery to: " + esc(values.address) : "Collect from: 100 Jorissen Street, Braamfontein") +
            "<br>When: " + esc(dateInput.value) + " at " + esc(timeSelect.value) +
            "<br>Payment: " + (payment === "eft" ? "EFT - use " + orderNumber + " as your reference" : "Pay on collection / delivery") +
            '</p><p>Questions? Call us on 061 234 5678.</p><a class="btn" href="services.html">Continue shopping</a></div>';
        save("bb-cart", []);
        updateCounts();
        checkoutForm.hidden = true;
        document.getElementById("checkout-summary").innerHTML = "";
        document.querySelector("#order-confirmation .form-success").focus();
        window.scrollTo(0, 0);
    });
}

/* ---------- shared validation helpers (also used by forms.js) ---------- */
function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 100;
}

// South African numbers: 0XX XXX XXXX or +27 XX XXX XXXX
function isSaPhone(value) {
    var digits = value.replace(/[\s()-]/g, "");
    return /^(0\d{9}|\+27\d{9})$/.test(digits);
}

// shows a message under each field that has an error; returns true when there are none
function showFieldErrors(form, errors) {
    form.querySelectorAll(".field-error").forEach(function (el) { el.remove(); });
    form.querySelectorAll("[aria-invalid]").forEach(function (el) {
        el.removeAttribute("aria-invalid");
        el.removeAttribute("aria-describedby");
    });
    var first = null;
    Object.keys(errors).forEach(function (id) {
        var field = document.getElementById(id);
        if (!field) return;
        var msg = document.createElement("p");
        msg.className = "field-error";
        msg.id = id + "-error";
        msg.textContent = errors[id];
        field.setAttribute("aria-invalid", "true");
        field.setAttribute("aria-describedby", msg.id);
        field.closest(".form-group").appendChild(msg);
        if (!first) first = field;
    });
    var summary = form.querySelector(".error-summary");
    if (summary) {
        var n = Object.keys(errors).length;
        summary.textContent = n ? "Please fix the " + (n === 1 ? "highlighted field" : n + " highlighted fields") + " below." : "";
    }
    if (first) {
        first.focus();
        return false;
    }
    return true;
}

/* ---------- start ---------- */
updateCounts();
paintWishButtons();
renderWishlist();
renderCheckoutSummary();
