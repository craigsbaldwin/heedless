import {on, concat} from './utils';
import graphql from './graphql';

/**
 * Global variables.
 */
let checkoutId = '';
let products = {};
let singleProducts = {};

/**
 * Handle forward/back browser navigation
 */
window.onpopstate = function() {
  checkUrl();
}

/**
 * Document ready.
 */
document.addEventListener('DOMContentLoaded', () => {
  products = JSON.parse(localStorage.getItem('products'));
  singleProducts = JSON.parse(localStorage.getItem('singleProducts'));

  checkUrl();
  addEventListeners();
});

/**
 * Check page's URL to load based on that.
 */
function checkUrl() {
  if (location.href === `${location.origin}/`) {
    requestHomePage();
    return;
  }

  if (location.search) {
    const handle = location.search.replace('?product=', '');
    requestProductPage(handle);
  }
}

/**
 * Listen for all client events, filtered by needed
 */
function addEventListeners() {
  on('click', document.querySelector('body'), (event) => {
    // if (isCorrectButton(event.target, 'addToCart')) {
    //   handleAddToCartClick(event.target);
    //   return;
    // }

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
 * Request the homepage (all products).
 */
function requestHomePage() {
  if (products) {
    renderProducts(products);

  } else {
    graphql().getCollectionProductsByHandle('frontpage', 5)
      .then((response) => {
        if (response) {
          renderProducts(response);
          products = response;
          localStorage.setItem('products', JSON.stringify(response));
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }
}

/**
 * Render collection of products.
 * @param {Object} products products to render.
 */
function renderProducts(products) {
  const html = products.map((productNode) => {
    const product = productNode.node;

    return `
      <div class="product-card" js-page="productCard">
        <div class="product-card__image">
          <img
            class="product-page__image"
            alt="${product.images.edges[0].node.altText}"
            src="${product.images.edges[0].node.transformedSrc}"
          >
        </div>

        <div
          class="product-card__footer"
          data-handle="${product.handle}"
          data-id="${product.variants.edges[0].node.id}"
        >
          <h2>${product.title}</h2>

          <button class="button" js-page="addToCart">Add To Cart</button>
          <button class="button button--alt" js-page="viewProduct">View Product</button>
        </div>
      </div>
    `;
  }).join('');

  document.querySelector('[js-page="homepage"]').innerHTML = html;
}

/**
 * Request the product page.
 * @param {String} handle the product handle to render.
 */
function requestProductPage(handle) {
  graphql().getProductByHandle(handle)
    .then((response) => {
      if (response) {
        renderProduct(response);
        addToLocalStorage('singleProducts', response);
        return;
      }

      throw new Error('Response not found');
    })
    .catch((error) => error);
  return;
}

/**
 * Render the product page.
 * @param {Object} product the product to load.
 */
function renderProduct(product) {
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
      <img class="product-page__image"
        alt="${product.images.edges[0].node.altText}"
        src="${product.images.edges[0].node.transformedSrc}"
      >
    </div>

    <div class="product-page__meta" data-id="${product.variants.edges[0].node.id}">
      <h1 class="product-page__title">${product.title}</h1>

      <div class="product-page__description">${product.descriptionHtml}</div>

      <strong class="product-page__price">
        ${product.variants.edges[0].node.priceV2.amount}
      </strong>

      <button class="button button--large" js-page="addToCart">Add To Cart</button>
      <button class="button button--large button--alt" js-page="closeProduct">Close</button>
    </div>
  `;
}

/**
 * Format money into correct format.
 * @param {String} amount the amount to format.
 */
function formatMoney(amount) {
  return `£`
}

/**
 * View a product page.
 * @param {HTMLElement} target the clicked button (has data attributes).
 */
function handleViewProductClick(target) {
  const handle = target.parentNode.getAttribute('data-handle');
  requestProductPage(handle);
}

/**
 * Handle the close product click.
 */
function handleCloseProductClick() {
  requestHomePage();

  updateHistory('Homepage', '/');
  document.querySelector('[js-page="productPage"]').classList.remove('is-active');
  document.querySelector('[js-page="overlay"]').classList.remove('is-active');
}

/**
 * Add new content to local storage.
 * @param {String} storage the name of the storage.
 * @param {Object} contentToAdd the content to add.
 */
function addToLocalStorage(storage, contentToAdd) {
  const content = JSON.parse(localStorage.getItem(storage));
  console.log('add', content);

  if (content) {
    console.log('typeof', typeof content)
    if (typeof content === 'object') {
      const updatedContent = [content];
    } else {
      const updatedContent = content;
    }

    updatedContent.push(contentToAdd);

    localStorage.setItem(storage, JSON.stringify(updatedContent));
    console.log('storage', JSON.parse(localStorage.getItem('singleProducts')));

    return;
  }

  localStorage.setItem(storage, JSON.stringify(contentToAdd))
  console.log('storage', JSON.parse(localStorage.getItem('singleProducts')));
}

/**
 * Handle add to cart click.
 * @param {HTMLElement} target the clicked button (has data attributes).
 */
// function handleAddToCartClick(target) {
//   console.log('add to cart', target.parentNode.getAttribute('data-id'));

//   const lineItemsToAdd = [
//     {
//       variantId: target.parentNode.getAttribute('data-id'),
//       quantity: 1,
//     }
//   ];

//   // Add an item to the checkout
//   client.checkout.addLineItems(checkoutId, lineItemsToAdd).then((checkout) => {
//     console.log('checkout', checkout.lineItems.length);
//   });
// }