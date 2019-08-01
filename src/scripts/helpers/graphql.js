/**
 * GraphQL helper functions
 * ------------------------------------------------------------------------------
 * Ways of accessing storefront API data.
 *
 * @namespace graphql
 *
 */
import fetch from 'node-fetch';
import Cookies from 'js-cookie';

/**
 * Global variables.
 */
const shopUrl = 'https://heedless.myshopify.com';
const accessToken = 'ebc823ca217a89fecdc9cce9f063e902';

export default () => {

  /**
   * Create checkout instance.
   */
  function createCheckout() {
    return new Promise((resolve) => {
      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/graphql',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: createCheckoutQuery(),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          const checkout = response.data.checkoutCreate.checkout;
          resolve(checkout);
        })
        .catch((error) => {
          window.console.log('createCheckout Error', error);
        });
    });
  }

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
   * Create checkout instance.
   */
  function getCart() {
    return new Promise((resolve) => {
      const cart = JSON.parse(Cookies.get('cart'));
      const graphQlQuery = getCartQuery();

      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: JSON.stringify({
          query: graphQlQuery,
          variables: {
            checkoutId: cart.id,
            input: {
              customAttributes: {
                key: "Heedless",
                value: "v0.1",
              },
            },
          },
        }),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          let lineItems = [];
          const checkout = response.data.checkoutAttributesUpdateV2.checkout.lineItems.edges;

          if (checkout.length > 0) {
            lineItems = checkout.map((lineItem) => {
              return {
                variantId: lineItem.node.variant.id,
                quantity: lineItem.node.quantity,
              };
            });
          }

          resolve(lineItems);
        })
        .catch((error) => {
          window.console.log('getCart Error', error);
        });
    });
  }

  /**
   * Check line items in cart (adapted mutation).
   */
  function getCartQuery() {
    return `
      mutation checkoutAttributesUpdateV2($checkoutId: ID!, $input: CheckoutAttributesUpdateV2Input!) {
        checkoutAttributesUpdateV2(checkoutId: $checkoutId, input: $input) {
          checkout {
            lineItems(first: 20) {
              edges {
                node {
                  variant {
                    id
                  }
                  quantity
                }
              }
            }
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
   * Replace the cart with new line items.
   * @param {Array} newLineItems the line items to replace the cart with.
   */
  function replaceCart(newLineItems) {
    return new Promise((resolve) => {
      const cart = JSON.parse(Cookies.get('cart'));
      const graphQlQuery = replaceCartQuery();

      const query = {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': accessToken,
        },
        body: JSON.stringify({
          query: graphQlQuery,
          variables: {
            checkoutId: cart.id,
            lineItems: newLineItems,
          },
        }),
      };

      fetch(`${shopUrl}/api/graphql`, query)
        .then((response) => response.json())
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          window.console.log('replaceCart Error', error);
        });
    });
  }

  /**
   * Add to cart (replace cart mutation).
   */
  function replaceCartQuery() {
    return `
      mutation checkoutLineItemsReplace($checkoutId: ID!, $lineItems: [CheckoutLineItemInput!]!) {
        checkoutLineItemsReplace(checkoutId: $checkoutId, lineItems: $lineItems) {
          checkout {
            lineItems(first: 20) {
              edges {
                node {
                  variant {
                    id
                    title
                    priceV2 {
                      amount
                    }
                  }
                  quantity
                  title
                }
              }
            }
          }
          userErrors {
            code
            field
            message
          }
        }
      }
    `;
  }

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

  return Object.freeze({
    createCheckout,
    getCart,
    replaceCart,
    getCollectionByHandle,
    getProductByHandle,
    getProductBySearchString,
  });
};
