/* Braam Bakehouse - product data.
   Every product on the Services page is built from this list by JavaScript
   (see renderProducts in script.js), so prices only need changing here. */

var CATEGORIES = [
    { id: "cakes", name: "Cakes", image: "braam-bakehouse-cakes.webp",
      alt: "Chocolate celebration cake, red velvet slice and berry cheesecake from Braam Bakehouse" },
    { id: "cupcakes", name: "Cupcakes", image: "braam-bakehouse-cupcakes.webp",
      alt: "Tray of chocolate, vanilla and red velvet cupcakes with buttercream swirls" },
    { id: "pastries", name: "Pastries", image: "braam-bakehouse-pastries.webp",
      alt: "Golden butter croissants, cinnamon rolls and Danish pastries" },
    { id: "bread", name: "Bread", image: "braam-bakehouse-bread.webp",
      alt: "Freshly baked white loaf, sourdough and bread rolls" }
];

var PRODUCTS = [
    { id: "chocolate-celebration-cake", category: "cakes", name: "Chocolate Celebration Cake", price: 250, unit: "",
      description: "A rich and moist chocolate cake covered with smooth chocolate frosting. Perfect for birthdays and celebrations." },
    { id: "red-velvet-cake", category: "cakes", name: "Red Velvet Cake", price: 280, unit: "",
      description: "A soft red velvet sponge layered with creamy cream-cheese frosting." },
    { id: "vanilla-celebration-cake", category: "cakes", name: "Vanilla Celebration Cake", price: 230, unit: "",
      description: "A light and fluffy vanilla cake decorated with smooth buttercream frosting." },

    { id: "chocolate-cupcakes", category: "cupcakes", name: "Chocolate Cupcakes", price: 25, unit: "each",
      description: "Soft chocolate cupcakes topped with creamy chocolate frosting." },
    { id: "vanilla-cupcakes", category: "cupcakes", name: "Vanilla Cupcakes", price: 22, unit: "each",
      description: "Light and fluffy vanilla cupcakes finished with delicious buttercream." },
    { id: "red-velvet-cupcakes", category: "cupcakes", name: "Red Velvet Cupcakes", price: 25, unit: "each",
      description: "Classic red velvet cupcakes topped with cream-cheese frosting." },

    { id: "butter-croissant", category: "pastries", name: "Butter Croissant", price: 20, unit: "",
      description: "A golden and flaky pastry with a rich buttery flavour." },
    { id: "cinnamon-roll", category: "pastries", name: "Cinnamon Roll", price: 25, unit: "",
      description: "Soft baked dough filled with cinnamon and sugar and finished with a sweet glaze." },
    { id: "danish-pastry", category: "pastries", name: "Danish Pastry", price: 25, unit: "",
      description: "A light and flaky pastry with a sweet filling." },

    { id: "white-bread", category: "bread", name: "White Bread", price: 18, unit: "",
      description: "Soft, freshly baked white bread suitable for everyday meals." },
    { id: "wholewheat-bread", category: "bread", name: "Wholewheat Bread", price: 22, unit: "",
      description: "A wholesome wholewheat loaf with a rich and satisfying flavour." },
    { id: "sourdough-bread", category: "bread", name: "Sourdough Bread", price: 35, unit: "",
      description: "Freshly baked sourdough with a crisp crust and soft interior." }
];

/* Bakery details used by the map, forms and opening-hours checks. */
var BAKERY = {
    name: "Braam Bakehouse",
    email: "info@braambakehouse.co.za",
    phone: "061 234 5678",
    address: "100 Jorissen Street, Braamfontein, Johannesburg, Gauteng",
    lat: -26.1929,
    lng: 28.0339,
    // opening hour and closing hour for each day, Sunday (0) to Saturday (6)
    hours: { 0: [9, 15], 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 15] }
};

function findProduct(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
        if (PRODUCTS[i].id === id) return PRODUCTS[i];
    }
    return null;
}
