'use strict';
const fetch = require('node-fetch');
const api = require('./secret.json');
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
const apiUrl = 'taygra-shoes.myshopify.com/admin/api/2021-04/'; 
const brazilLocationId = 63141773507;

const buildOrderUrl = () => {
    return baseUrl + apiUrl + 'orders.json?fields=' + fields.join(',');
}

const buildFulfillmentOrderUrl = (orderId) => {
    return baseUrl + apiUrl + `orders/${orderId}/fulfillment_orders.json`;
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

const extractData = async (orders) => {
    for (const order of orders) {
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
                };
                await addRecord(record);
            }
        }
    }
}

const getPage = async (url) => {
    const response = await fetch(url);
    const { orders } = await response.json();
    await extractData(orders);
    const nextUrl = getNextUrl(response.headers.raw()['link']);
    return { nextUrl };
}

(async () => {
    let url = buildOrderUrl();
    do {
        const { nextUrl } = await getPage(url);
        url = nextUrl ? baseUrl + nextUrl : null;
    } while (url);
})()