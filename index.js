'use strict';
const fetch = require('node-fetch');
const api = require('./secret.json');
const db = require('./db.js');
const { addRecord } = require('./csv');
const baseUrl = `https://${api.key}:${api.password}@`;
const fields = [
    'id',
    'contact_email',
    'order_number',
    'phone',
    'customer',
    'line_items',
]
const apiUrl = 'taygra-shoes.myshopify.com/admin/api/2022-01/'; 
const brazilLocationId = 63141773507;


const buildOrderUrl = () => {
    return baseUrl + apiUrl + 'orders.json?fields=' + fields.join(',');
}

const buildFulfillmentOrderUrl = (orderId) => {
    return baseUrl + apiUrl + `orders/${orderId}/fulfillment_orders.json`;
}

const buildVariantUrl = (variantId) => {
    return baseUrl + apiUrl + `variants/${variantId}.json`;
}

const getImageSrc = async (product_id, image_id) => {
    let src;
    if (image_id) {
        const url = baseUrl + apiUrl + `products/${product_id}/images/${image_id}.json`;
        const response = await fetch(url);
        const {image} = await response.json();
        src = image.src;
    } else {
        const url = baseUrl + apiUrl + `products/${product_id}/images.json`;
        const response = await fetch(url);
        const {images} = await response.json();
        src = images[0].src;
    }
    return src;
}

const getNextUrl = (links = []) => {
    const next = links.find((value) => value.match(/<(.+)>; rel="next"/));
    return next ? next.match(/<https:\/\/(.+)>; rel="next"/)[1] : null;
}

const getBrazilLineItems = async (orderId) => {
    const response = await fetch(buildFulfillmentOrderUrl(orderId));
    const { fulfillment_orders } = await response.json();
    let brazilLineItems = {};
    for (const fo of fulfillment_orders) {
        if (fo.status === 'open' && fo.assigned_location_id === brazilLocationId) {
            for (const li of fo.line_items) {
                brazilLineItems[li.line_item_id] = true;
            }
        }
    }
    return brazilLineItems;
}

const extractData = async (orderList) => {
    const lineItems = [];
    for (const order of orderList) {
        // get a map of lineItems which locations are in Brazil
        const brazilLineItems = await getBrazilLineItems(order.id);
        for (const lineItem of order.line_items) {
            if (lineItem.fulfillable_quantity > 0 && brazilLineItems[lineItem.id]) {
                const record = {
                    title: lineItem.name,
                    number: order.order_number,
                    sku: lineItem.sku,
                    qty: lineItem.fulfillable_quantity,
                    firstName: order.customer.first_name,
                    lastName: order.customer.last_name,
                    email: order.contact_email,
                    phone: order.phone,
                    variantId: lineItem.variant_id
                };
                // create a unique id with the ordernumber and sku
                lineItems.push(record);
            }
        }
    }
    return lineItems;
}

const getPageOrders = async (url) => {
    const response = await fetch(url);
    const { orders } = await response.json();
    const nextUrl = getNextUrl(response.headers.raw()['link']);
    return { pageOrders: orders, nextUrl };
}

const loopThroughPages = async () => {
    let orderList = [];
    let url = buildOrderUrl();
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

const getVariantImgSrc = async (variantId) => {
    const variantUrl = buildVariantUrl(variantId);
    const variantResponse = await fetch(variantUrl);
    const {variant} = await variantResponse.json();
    const imageSrc = getImageSrc(variant.product_id, variant.image_id);
    return imageSrc;
}

const updateDb = async () => {
    const orderList = await loopThroughPages();
    const lineItems = await extractData(orderList);
    console.log(`Unfulfilled Shopify line-item count: ${lineItems.length}`);
    const localDbState = db.read();
    const newLocalDb = {};
    // create new localDb state with all the existing lineItems
    for (const lineItem of lineItems) {
        const lineItemUid = `${lineItem.number}|${lineItem.sku}`;
        let imgSrc;
        if (!localDbState[lineItemUid]) {
            // line-item doesn't exist in localDb
            // fetch the product image url
            imgSrc = await getVariantImgSrc(lineItem.variantId);
        } else {
            imgSrc = localDbState[lineItemUid].imgSrc;
        }
        newLocalDb[lineItemUid] = {...lineItem, imgSrc};
    }
    // add the lineItems from the original localDb that don't exist in the new db but have reservedQty
}

(async () => {
    await updateDb();
})()