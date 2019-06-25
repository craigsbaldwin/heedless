/**
 * Templates
 * ------------------------------------------------------------------------------
 * Rendering of the page.
 *
 * @namespace templates
 *
 */
import storage from './storage';
import graphql from './graphql';

export default () => {

  /**
   * Request a collection.
   * @param {String} handle the collection handle.
   */
  function requestCollection(handle) {
    if (Heedless.collections && Heedless.collections.hasOwnProperty(handle)) {
      window.console.log('Cached Collection');
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


        >
          <h2>${product.title}</h2>

          <button
            class="button"
            data-id="${product.variants.edges[0].node.id}"
            js-page="addToCart"
          >
            Add To Cart
          </button>

          <button
            class="button button--alt"
            data-handle="${product.handle}"
            js-page="viewProduct"
          >
            View Product
          </button>
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
      window.console.log('Cached Product Page');
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
  }

  /**
   * Render the product page.
   * @param {Object} product the product to load.
   */
  function renderProduct(product) {
    const url = `?product=${product.handle}`;

    Heedless.events.updateHistory(product.title, url);

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

    <div class="product-page__meta">
      <h1 class="product-page__title">${product.title}</h1>

      <div class="product-page__description">${product.descriptionHtml}</div>

      <strong class="product-page__price">
        ${formatMoney(product.variants.edges[0].node.priceV2.amount)}
      </strong>

      <button
        class="button button--large"
        data-id="${product.variants.edges[0].node.id}"
        js-page="addToCart"
      >
        Add To Cart
      </button>

      <button class="button button--large button--alt" js-page="closeProduct">Close</button>
    </div>
  `;
  }

  /**
   * Format money into correct format.
   * @param {String} amount the amount to format.
   */
  function formatMoney(amount) {
    return `£${amount}`;
  }

  return Object.freeze({
    requestCollection,
    requestProductPage,
  });
};
