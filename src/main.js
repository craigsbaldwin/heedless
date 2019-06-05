import Client from 'shopify-buy';
import Vue from 'vue';

import App from './App.vue';
import router from './router';
import {on} from './utils';

import './main.scss';

Vue.config.productionTip = false

Vue.component('product-card', {
  props: ['product'],
  template: ''
})

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});

/**
 * Headerless Shopify.
 */
const client = Client.buildClient({
  domain: 'heedless.myshopify.com',
  storefrontAccessToken: 'ebc823ca217a89fecdc9cce9f063e902'
});

/**
 * Global variables.
 */
let checkoutId = '';
let products = {};

/**
 * Creates empty checkout.
 */
client.checkout.create().then((checkout) => {
  checkoutId = checkout.id;
});

/**
 * Handle forward/back browser navigation
 */
window.onpopstate = function() {
  checkUrl();
}

/**
 * Check page's URL to load based on that.
 */
function checkUrl() {
  if (location.href === `${location.origin}/`) {
    renderHomepage();
    return;
  }

  if (location.search) {
    const productHandle = location.search.replace('?product=', '');
    checkProductCache(productHandle);
    return;
  }
}

/**
 * Update the history state.
 * @param {String} title history title.
 * @param {String} url the history url.
 */
function updateHistory(title, url) {
  window.history.pushState({
    'html': '',
    'pageTitle': title,
  }, '', url);
}

/**
 * Render the homepage (all products).
 */
function renderHomepage() {
  if (products) {
    console.log('cached products');
    renderProducts(products);
  } else {
    loadProductsFromApi();
  }
}

function loadProductsFromApi() {
  console.log('load products');

  client.product.fetchAll().then((products) => {
    renderProducts(products);

    localStorage.setItem('products', JSON.stringify(products));
  });
}

function renderProducts(products) {
  console.log('products', products);
  const html = products.map((product) => {
    return `
      <div class="product-card" js-page="productCard">
        <div class="product-card__image">
          <img class="product-page__image" src="${product.images[0].src}" alt="${product.images[0].altText}">
        </div>

        <div class="product-card__footer" data-id="${product.variants[0].id}" data-handle="${product.handle}">
          <h2>${product.title}</h2>
          <button class="button" js-page="addToCart">Add To Cart</button>
          <button class="button button--alt" js-page="viewProduct">View Product</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelector('[js-page="homepage"]').innerHTML = html;
}

// Listen for all click events, filter by needed
function addEventListeners() {
  on('click', document.querySelector('body'), (event) => {
    if (isCorrectButton(event.target, 'addToCart')) {
      handleAddToCartClick(event.target);
      return;
    }

    if (isCorrectButton(event.target, 'viewProduct')) {
      handleViewProductClick(event.target);
      return;
    }

    if (isCorrectButton(event.target, 'closeProduct')) {
      handleCloseProductClick();
      return;
    }
  });
}

/**
 * Test for correct button.
 * @param {HTMLElement} target the clicked item.
 * @param {String} attribute the desired attribute.
 * @returns {Boolean} whether it's the correct element.
 */
function isCorrectButton(target, attribute) {
  return (
    typeof target.attributes['js-page'] !== 'undefined' &&
    target.getAttribute('js-page') === attribute
  );
}

/**
 * Handle add to cart click.
 * @param {HTMLElement} target the clicked button (has data attributes).
 */
function handleAddToCartClick(target) {
  console.log('add to cart', target.parentNode.getAttribute('data-id'));

  const lineItemsToAdd = [
    {
      variantId: target.parentNode.getAttribute('data-id'),
      quantity: 1,
    }
  ];

  // Add an item to the checkout
  client.checkout.addLineItems(checkoutId, lineItemsToAdd).then((checkout) => {
    console.log('checkout', checkout.lineItems.length);
  });
}

/**
 * View a product page.
 * @param {HTMLElement} target the clicked button (has data attributes).
 */
function handleViewProductClick(target) {
  const productHandle = target.parentNode.getAttribute('data-handle');

  checkProductCache(productHandle);
}

/**
 * Check product cache to determine where to load from.
 * @param {String} handle the product handle to load.
 */
function checkProductCache(handle) {
  const filteredProduct = products.filter((product) => {
    return (product.handle === handle) ? product : '';
  })[0];

  if (filteredProduct) {
    console.log('cached product');
    renderProductPage(filteredProduct);
    return;
  }

  loadProductFromApi(handle);
}

/**
 * Render the product page.
 * @param {Object} product the product to load.
 */
function renderProductPage(product) {
  const url = `?product=${product.handle}`;

  updateHistory(product.title, url);

  document.querySelector('[js-page="productPage"]').innerHTML = productTemplate(product);
  document.querySelector('[js-page="productPage"]').classList.add('is-active');
  document.querySelector('[js-page="overlay"]').classList.add('is-active');
}

/**
 * The product template.
 * @param {Object} product the product to render.
 * @returns {HTML} the product template.
 */
function productTemplate(product) {
  return `
    <div class="product-page__image-container">
      <img class="product-page__image" src="${product.images[0].src}" alt="${product.images[0].altText}">
    </div>

    <div class="product-page__meta" data-id="${product.variants[0].id}">
      <h1 class="product-page__title">${product.title}</h1>

      <div class="product-page__description">${product.descriptionHtml}</div>

      <strong class="product-page__price">${product.variants[0].price}</strong>

      <button class="button button--large" js-page="addToCart">Add To Cart</button>
      <button class="button button--large button--alt" js-page="closeProduct">Close</button>
    </div>
  `;
}

/**
 * Load product from API.
 * @param {String} handle the product handle to load.
 */
function loadProductFromApi(handle) {
  console.log('load product');

  client.product.fetchByHandle(handle).then((product) => {
    renderProductPage(product);
  });
}

/**
 * Handle the close product click.
 */
function handleCloseProductClick() {
  renderHomepage();

  updateHistory('Homepage', '/');
  document.querySelector('[js-page="productPage"]').classList.remove('is-active');
  document.querySelector('[js-page="overlay"]').classList.remove('is-active');
}

/**
 * Document ready.
 */
document.addEventListener('DOMContentLoaded', () => {
  // products = JSON.parse(localStorage.getItem('products'));

  // checkUrl();
  // addEventListeners();
});