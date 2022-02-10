'use strict';

const { getLineItems, addOrReplaceLineItem, updateLineItem, removeLineItem } = require('./db.js');
const { getOrderList, getBrazilLineItems, getVariantImgSrc } = require('./shopify_api.js');

const extractData = async (orderList) => {
    const lineItems = {};
    for (const order of orderList) {
        console.log(`Extracting data for order ${order.order_number}`);
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
                const lineItemUid = `${order.order_number}|${lineItem.sku}`;
                lineItems[lineItemUid] = record;
            }
        }
    }
    return lineItems;
}

const updateDb = async () => {
    const orderList = await getOrderList();
    const lineItems = await extractData(orderList);
    console.log(`${Object.keys(lineItems).length} line-items to fulfill from Brazil`);
    for (const lineItemUid in lineItems) {
        const db = getLineItems();
        if (!db[lineItemUid]) {
            // line-item doesn't exist in db
            // fetch the product image url
            const imgSrc = await getVariantImgSrc(lineItems[lineItemUid].variantId);
            console.log(`Fetched image source for line-item ${lineItemUid}: ${imgSrc}`);
            // update db
            addOrReplaceLineItem(lineItemUid, {...lineItems[lineItemUid], imgSrc, reservedQty: 0, sentQty: 0});
        } else {
            // line-item already exists, make sure the qty is still accurate
            updateLineItem(lineItemUid, {qty: lineItems[lineItemUid].qty});
        }
    }

    // add the lineItems from the original localDb that don't exist in the new db but have reservedQty
    const db = getLineItems();
    for (const lineItemUid in db) {
        if (!lineItems[lineItemUid]) {
            if (db[lineItemUid].reservedQty === 0) {
                removeLineItem(lineItemUid);
            } else {
                updateLineItem(lineItemUid, {qty: 0});
            }
        }
    }

    const delay = 3600 * 1000;
    setTimeout(async () => {
        await updateDb();
    }, delay);
    console.log(`Next run in ${delay/1000/60} min`);
}

(async () => {
    await updateDb();
})()