/**
 * GraphQL: Products.
 * ------------------------------------------------------------------------------
 * Ways of accessing products and collections from API data.
 *
 * @namespace graphqlProducts
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
   * Get products from a collection by handle.
   * @param {String} handle the collection handle.
   * @param {Number} limit number of products to load.
   */
  function getCollectionByHandle(handle, limit) {
    return new Promise((resolve) => {
      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: getCollectionByHandleQuery(handle, limit),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          const collection = response.data.collectionByHandle;
          resolve(convertGetCollectionByHandleResponse(collection));
        })
        .catch((error) => {
          window.console.log('getCollectionByHandle Error', error);
        });
    });
  }

  /**
   * Collection and its products query.
   * @param {String} handle the collection handle.
   * @param {Number} limit number of products to load.
   */
  function getCollectionByHandleQuery(handle, limit) {
    return `
      {
        collectionByHandle(handle: "${handle}") {
          products(first: ${limit}) {
            edges {
              node {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      originalSrc
                      altText
                    }
                  }
                }
                collections(first: 5) {
                  edges {
                    node {
                      handle
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
   * Convert GraphQL response to something nicer.
   * @param {Object} response the original GraphQL response.
   */
  function convertGetCollectionByHandleResponse(response) {
    const convertedResponse = {};

    response.products.edges.forEach((product) => {
      const collections = [];

      product.node.collections.edges.forEach((collection) => {
        collections.push(collection.node.handle);
      });

      convertedResponse[product.node.handle] = {
        id: product.node.id,
        title: product.node.title,
        handle: product.node.handle,
        images: product.node.images.edges.map((image) => {
          return image.node;
        }),
        collections,
      };
    });

    return convertedResponse;
  }

  /**
   * Get a product by its handle.
   * @param {String} handle the product handle.
   */
  function getProductByHandle(handle) {
    return new Promise((resolve) => {
      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: getProductByHandleQuery(handle),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          const product = response.data.productByHandle;
          resolve(convertGetProductByHandleResponse(product));
        })
        .catch((error) => {
          window.console.log('getProductByHandle Error', error);
        });
    });
  }

  /**
   * Product query.
   * @param {String} handle the product handle.
   */
  function getProductByHandleQuery(handle) {
    return `
      {
        productByHandle(handle: "${handle}") {
          id
          title
          handle
          descriptionHtml
          images(first: 1) {
            edges {
              node {
                originalSrc
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                title
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
   * Convert GraphQL response to something nicer.
   * @param {Object} response the original GraphQL response.
   */
  function convertGetProductByHandleResponse(response) {
    const convertedResponse = {};

    convertedResponse[response.handle] = {
      id: response.id,
      title: response.title,
      handle: response.handle,
      images: response.images.edges.map((image) => {
        return image.node;
      }),
      descriptionHtml: response.descriptionHtml,
      variants: response.variants.edges.map((variant) => {
        return {
          title: variant.node.title,
          id: variant.node.id,
          price: variant.node.priceV2.amount,
        };
      }),
      fullRender: true,
    };

    return convertedResponse;
  }

  /**
   * Get a product by its handle.
   * @param {String} searchString the search query.
   */
  function getProductBySearchString(searchString) {
    return new Promise((resolve) => {
      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: getProductBySearchStringQuery(searchString),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          const products = response.data.products;
          resolve(convertGetProductBySearchStringResponse(products));
        })
        .catch((error) => {
          window.console.log('getProductBySearchString Error', error);
        });
    });
  }

  /**
   * Product query.
   * @param {String} searchString the search query.
   */
  function getProductBySearchStringQuery(searchString) {
    return `
      {
        products(first: 3, query: "${searchString}") {
          edges {
            node {
              handle
              title
              images(first: 1) {
                edges {
                  node {
                    originalSrc
                    altText
                  }
                }
              }
              priceRange {
                minVariantPrice {
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
   * Convert GraphQL response to something nicer.
   * @param {Object} response the original GraphQL response.
   */
  function convertGetProductBySearchStringResponse(response) {
    const convertedResponse = response.edges.map((product) => {
      return {
        handle: product.node.handle,
        title: product.node.title,
        images: product.node.images.edges.map((image) => {
          return image.node;
        }),
        price: product.node.priceRange.minVariantPrice.amount,
      };
    });

    return convertedResponse;
  }

  /**
   * Expose public interface.
   */
  return Object.freeze({
    getCollectionByHandle,
    getProductByHandle,
    getProductBySearchString,
  });
};
