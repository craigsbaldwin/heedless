/**
 * Templates
 * ------------------------------------------------------------------------------
 * Rendering of the page.
 *
 * @namespace templates
 *
 */
import events from './events';
import storage from './storage';
import graphql from './graphql';

export default () => {

  /**
   * Request a collection.
   * @param {String} handle the collection handle.
   */
  function requestCollection(handle) {
    if (Heedless.collections && Heedless.collections.hasOwnProperty(handle)) {
      console.log('Cached Collection');
      renderProducts(Heedless.collections[handle]);
      return;
    }

    graphql().getCollectionByHandle('frontpage', 5)
      .then((response) => {
        if (response) {
          renderProducts(response);
          storage().storeCollections(response);
          return;
        }

        throw new Error('Response not found');
      })
      .catch((error) => error);
  }

  /**
   * Render collection of products.
   * @param {Object} collection collection of products to render.
   */
  function renderProducts(collection) {
    const products = collection.products.edges;

    const html = products.map((productNode) => {
      const product = productNode.node;

      return `
      <div class="product-card" js-page="productCard">
        <div class="product-card__image">
          <img
            class="product-page__image"
            alt="${product.images.edges[0].node.altText}"
            src="${product.images.edges[0].node.smallImage}"
            srcset="
              ${product.images.edges[0].node.smallImage} 300w,
              ${product.images.edges[0].node.mediumImage} 600w"
            sizes="auto"
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
    if (Heedless.products && Heedless.products.hasOwnProperty(handle)) {
      console.log('Cached Product Page');
      renderProduct(Heedless.products[handle]);
      return;
    }

    graphql().getProductByHandle(handle)
      .then((response) => {
        if (response) {
          renderProduct(response);
          storage().storeProducts(response);
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

    events().updateHistory(product.title, url);

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

  return Object.freeze({
    requestCollection,
    requestProductPage,
  })
}
