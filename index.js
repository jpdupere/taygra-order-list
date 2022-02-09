'use strict';

const db = require('./db.js');
const { getOrderList, getBrazilLineItems, getVariantImgSrc } = require('./shopify_api.js');

const extractData = async (orderList) => {
    const lineItems = [];
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
                lineItems.push(record);
            }
        }
    }
    return lineItems;
}

const updateDb = async () => {
    const orderList = await getOrderList();
    const lineItems = await extractData(orderList);
    console.log(`Unfulfilled Shopify line-item count: ${lineItems.length}`);
    const localDbState = db.read();
    // create new localDb state with all the existing lineItems
    const newDbState = {};
    for (const lineItem of lineItems) {
        const lineItemUid = `${lineItem.number}|${lineItem.sku}`
        if (!localDbState[lineItemUid]) {
            // line-item doesn't exist in localDb
            // fetch the product image url
            lineItem.imgSrc = await getVariantImgSrc(lineItem.variantId);
            console.log(`Fetched image source for line-item ${lineItemUid}: ${lineItem.imgSrc}`);
            newDbState[lineItemUid] = {
                ...lineItem,
                reservedQty: 0,
                sentQty: 0
            };
        } else {
            newDbState[lineItemUid] = {
                ...lineItem,
                imgSrc: localDbState[lineItemUid].imgSrc,
                reservedQty: localDbState[lineItemUid].reservedQty,
                sentQty: localDbState[lineItemUid].sentQty
            };
        }
    }
    console.log(`${lineItems.length} line-items to fulfill from Brazil`);

    // add the lineItems from the original localDb that don't exist in the new db but have reservedQty
    for (const lineItemUid in localDbState) {
        if (!lineItems[lineItemUid] && localDbState[lineItemUid].reservedQty > 0) {
            // If there is a reserved quatity for an item that is no longer unfulfilled (ex: cancelled or fulfilled), keep that item in the list.
            console.log(`Line-item ${lineItemUid} has a reserved qty of ${localDbState[lineItemUid].reservedQty} but is no longer needed.`)
            newDbState[lineItemUid] = localDbState[lineItemUid];
        }
    }

    // override the db with the new line-items
    db.write(newDbState);
    console.log('Local database updated');

    const delay = 3600 * 1000;
    setTimeout(async () => {
        await updateDb();
    }, delay);
    console.log(`Next run in ${delay/1000/60} min`);
}

(async () => {
    await updateDb();
})()