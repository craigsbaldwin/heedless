import Client from 'shopify-buy';
import Cookies from 'js-cookie';

import {on} from './utils';

const client = Client.buildClient({
  domain: 'heedless.myshopify.com',
  storefrontAccessToken: 'ebc823ca217a89fecdc9cce9f063e902'
});

let checkoutId = '';

// Create an empty checkout
client.checkout.create().then((checkout) => {
  checkoutId = checkout.id;
});

document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  addEventListeners();
});

function loadProducts() {
  client.product.fetchAll().then((products) => {
    renderProducts(products);
  });
}

function renderProducts(products) {
  const html = products.map((product) => {
    return `
      <div class="product-card" js-page="productCard" data-id="${product.variants[0].id}" data-handle="${product.handle}">
        <h2>${product.title}</h2>
        <button class="button" js-page="addToCart">Add To Cart</button>
        <button class="button" js-page="viewProduct">View Product</button>
      </div>
    `;
  }).join('');

  document.querySelector('[js-page="container"]').innerHTML = html;
}

// Listen for all click events, filter by needed
function addEventListeners() {
  on('click', document.querySelector('body'), (event) => {
    if (isAddToCartButton(event.target)) {
      addToCart(event.target);
      return;
    }

    if (isViewProductButton(event.target)) {
      viewProduct(event.target);
      return;
    }

    if (isCloseProductButton(event.target)) {
      closeProduct();
      return;
    }
  });
}

// Test if correct target
function isAddToCartButton(target) {
  return (
    typeof target.attributes['js-page'] !== 'undefined' &&
    target.getAttribute('js-page') === 'addToCart'
  );
}

function isViewProductButton(target) {
  return (
    typeof target.attributes['js-page'] !== 'undefined' &&
    target.getAttribute('js-page') === 'viewProduct'
  );
}

function isCloseProductButton(target) {
  return (
    typeof target.attributes['js-page'] !== 'undefined' &&
    target.getAttribute('js-page') === 'closeProduct'
  );
}

// Add To Cart
function addToCart(target) {
  const lineItemsToAdd = [
    {
      variantId: target.parentNode.getAttribute('data-id'),
      quantity: 1,
    }
  ];

  // Add an item to the checkout
  client.checkout.addLineItems(checkoutId, lineItemsToAdd).then((checkout) => {
    console.log('checkout', checkout.lineItems[0].title);
  });
}

// View product
function viewProduct(target) {
  const productHandle = target.parentNode.getAttribute('data-handle');

  client.product.fetchByHandle(productHandle).then((product) => {
    document.querySelector('[js-page="container"]').innerHTML = productTemplate(product.attrs);
  });
}

function productTemplate(product) {
  return `
    <div class="product-page" js-page="product">
      <div class="col">
        <img class="product-page__image" src="${product.images[0].src}" alt="${product.images[0].altText}">
      </div>

      <div class="col" data-id="${product.id}">
        <h1 class="product-page__title">${product.title}</h1>

        <div class="product-page__description">${product.descriptionHtml}</div>

        <button class="button button--large" js-page="addToCart">Add To Cart</button>
        <button class="button button--close" js-page="closeProduct">Close</button>
      </div>
    </div>
  `;
}

function closeProduct() {
  client.product.fetchAll().then((products) => {
    renderProducts(products);
  });
}