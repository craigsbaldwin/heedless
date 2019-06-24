/**
 * GraphQL helper functions
 * ------------------------------------------------------------------------------
 * Ways of accessing storefront API data.
 *
 * @namespace graphql
 *
 */
import fetch from 'node-fetch';

/**
 * Global variables.
 */
const shopUrl = 'https://heedless.myshopify.com';
const accessToken = 'ebc823ca217a89fecdc9cce9f063e902';

export default () => {

  /**
   * Create checkout query.
   */
  function createCheckoutQuery() {
    return `
      mutation {
        checkoutCreate(input: {}) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }
    `;
  }

  /**
   * Collection and its products query.
   * @param {String} handle the collection handle.
   * @param {Number} limit number of products to load.
   */
  function collectionsQuery(handle, limit) {
    return `
      {
        collectionByHandle(handle: "${handle}") {
          handle
          products(first: ${limit}) {
            edges {
              node {
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      smallImage: transformedSrc(maxWidth: 300)
                      mediumImage: transformedSrc(maxWidth: 600)
                      altText
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
  }

  /**
   * Product query.
   * @param {String} handle the product handle.
   */
  function productQuery(handle) {
    return `
      {
        productByHandle(handle: "${handle}") {
          title
          handle
          descriptionHtml
          images(first: 1) {
            edges {
              node {
                transformedSrc(maxWidth: 900)
                altText
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                priceV2 {
                  amount
                }
              }
            }
          }
        }
      }
    `;
  }

  /**
   * Create checkout instance.
   */
  function createCheckout() {
    return new Promise((resolve, reject) => {
      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql',
          'X-Shopify-Storefront-Access-Token': accessToken
        },
        body: createCheckoutQuery()
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then(res => res.json())
        .then(response => {
          const checkout = response.data.checkoutCreate.checkout;
          resolve(checkout);
        });
    });
  }

  /**
   * Get products from a collection by handle.
   * @param {String} handle the collection handle.
   * @param {Number} limit number of products to load.
   */
  function getCollectionByHandle(handle, limit) {
    return new Promise((resolve, reject) => {
      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql',
          'X-Shopify-Storefront-Access-Token': accessToken
        },
        body: collectionsQuery(handle, limit)
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then(res => res.json())
        .then(response => {
          const collection = response.data.collectionByHandle;
          resolve(collection);
        });
    });
  }

  /**
   * Get a product by its handle.
   * @param {String} handle the product handle.
   */
  function getProductByHandle(handle) {
    return new Promise((resolve, reject) => {
      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql',
          'X-Shopify-Storefront-Access-Token': accessToken
        },
        body: productQuery(handle)
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then(res => res.json())
        .then(response => {
          const products = response.data.productByHandle;
          resolve(products);
        });
    });
  }

  return Object.freeze({
    createCheckout,
    getCollectionByHandle,
    getProductByHandle,
  });
}