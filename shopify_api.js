const fetch = require('node-fetch');
const api = require('./secret.json');
// Rate limit: 2 requests per second (500 ms)
const delay = 500;
let lastRequestTimestamp = 0;
const baseUrl = `https://${api.key}:${api.password}@`;
const apiUrl = 'taygra-shoes.myshopify.com/admin/api/2022-01/'; 
const brazilLocationId = 63141773507;

const request = async (url) => {
    // Make sure only a maximum of 2 requests per seconds are sent
    while (Date.now() - lastRequestTimestamp < delay) { /* do nothing */ }
    // Proceed with request
    const response = await fetch(url);
    lastRequestTimestamp = Date.now();
    return response;
}

const getNextUrl = (links = []) => {
    const next = links.find((value) => value.match(/<(.+)>; rel="next"/));
    return next ? next.match(/<https:\/\/(.+)>; rel="next"/)[1] : null;
}

const getPageOrders = async (url) => {
    const response = await request(url);
    const { orders } = await response.json();
    const nextUrl = getNextUrl(response.headers.raw()['link']);
    return { pageOrders: orders, nextUrl };
}

/**
 * Get an array of all the unfulfilled orders from Shopify
 * @returns an array of Shopify's Order object
 */
const getOrderList = async () => {
    let orderList = [];
    let url = baseUrl + apiUrl + 'orders.json?fulfillment_status=unfulfilled&fields=id,contact_email,order_number,phone,customer,line_items';
    let currentPage = 1;
    do {
        const { pageOrders, nextUrl } = await getPageOrders(url);
        console.log(`Found ${pageOrders.length} orders in page ${currentPage}`);
        orderList.push(...pageOrders);
        url = nextUrl ? baseUrl + nextUrl : null;
        currentPage++;
    } while (url);
    return orderList;
}

/**
 * For a given order, get the line items that need to be fulfilled from Brazil.
 * @param {string} orderId The id of the Shopify Order object
 * @returns an array of the line-items from the Shopify's Fulfillement Order object.
 */
const getBrazilLineItems = async (orderId) => {
    const url = baseUrl + apiUrl + `orders/${orderId}/fulfillment_orders.json`;
    const response = await request(url);
    const { fulfillment_orders } = await response.json();
    let brazilLineItems = {};
    for (const fo of fulfillment_orders) {
        if ((fo.status === 'open' || fo.status === 'in_progress') && fo.assigned_location_id === brazilLocationId) {
            for (const li of fo.line_items) {
                brazilLineItems[li.line_item_id] = true;
            }
        }
    }
    return brazilLineItems;
}

const getImageSrc = async (product_id, image_id) => {
    let src;
    if (image_id) {
        const url = baseUrl + apiUrl + `products/${product_id}/images/${image_id}.json`;
        const response = await request(url);
        const {image} = await response.json();
        src = image.src;
    } else {
        const url = baseUrl + apiUrl + `products/${product_id}/images.json`;
        const response = await request(url);
        const {images} = await response.json();
        src = images.sort((a,b) => {
            return a.position - b.position;
        })[0].src;
    }
    return src;
}

/**
 * Find an image url from a variant id
 * @param {string} variantId 
 * @returns the url of the variant image if the variant has an image, or the url of the product image in position number 1
 */
const getVariantImgSrc = async (variantId) => {
    const variantUrl = baseUrl + apiUrl + `variants/${variantId}.json?fields=product_id,image_id`;
    const variantResponse = await request(variantUrl);
    
    const {variant, errors} = await variantResponse.json();
    if (errors === "Not Found") {
        console.log(`Variant image at ${variantUrl}: Not Found`);
        return '';
    }
    if (!variant) console.log(variantResponse);
    const imageSrc = getImageSrc(variant.product_id, variant.image_id);
    return imageSrc;
}

module.exports = { getOrderList, getBrazilLineItems, getVariantImgSrc };