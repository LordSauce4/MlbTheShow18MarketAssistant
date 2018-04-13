$($.find(".marketplace-card-order-now")).each(function (index, element) {
    // Buy/Sell now buttons will always make you lose money, get them out of the way
    $(this).remove();
});

// They put buy orders under the sell header...
buyOrders = $(".marketplace-card-sell-orders .marketplace-card-open-orders");
// and sell orders under the buy header...
sellOrders = $(".marketplace-card-buy-orders .marketplace-card-open-orders");
// Flip the tables
temp1 = $('<span>').hide();
temp2 = $('<span>').hide();
buyOrders.before(temp1);
sellOrders.before(temp2);
temp1.replaceWith(sellOrders);
temp2.replaceWith(buyOrders);

$($.find(".marketplace-card-info")).remove();

highestBuyOrderContainer = $(".marketplace-card-buy-orders").find("td")[0];
if (highestBuyOrderContainer != null) {
    highestBuyOrderNumber = cleanNumberString(highestBuyOrderContainer.innerText);
    $("#create-buy-order-form").find("#price")[0].value = highestBuyOrderNumber + 1;
}
lowestSellOrderContainer = $(".marketplace-card-sell-orders").find("td")[0];
if (lowestSellOrderContainer != null) {
    lowestSellOrderNumber = cleanNumberString(lowestSellOrderContainer.innerText);
    $("#create-sell-order-form").find("#price")[0].value = lowestSellOrderNumber - 1;
}

breadcrumbsContainer = $(".breadcrumbs > a");
itemPath = $(breadcrumbsContainer[2])[0].pathname;
$.ajax({
    url: "/orders"
}).done(function (data) {
    // TODO: context thing https://api.jquery.com/jquery.parsehtml/
    var parsedData = $(jQuery.parseHTML(data));
    shopList = parsedData.find(".shop-list");
    buyOrders = $(shopList).find(".orders")[0];
    $(buyOrders).find(".order").each(function (index, element) {
        buyOrderPathContainer = $(element).find("a")[0];
        buyOrderPath = buyOrderPathContainer.pathname;
        if (itemPath == buyOrderPath) {
            buyOrderPriceContainer = $(element).find(".item-price")[0];
            buyOrderPrice = cleanNumberString($(buyOrderPriceContainer)[0].innerText);
            cancelButton = $(this).find(".item-cancel");
            $(".marketplace-card-buy-orders .marketplace-card-open-orders tbody tr").each(function (index) {
                currentRowPrice = cleanNumberString($($(this)[0].children[0])[0].innerText);
                if (buyOrderPrice == currentRowPrice) {
                    $($(this)[0].children[1])[0].innerHTML = cancelButton[0].innerHTML;
                }
            });
        }
    });
    sellOrders = $(shopList).find(".orders")[1];
    $(sellOrders).find(".order").each(function (index, element) {
        sellOrderPathContainer = $(element).find("a")[0];
        sellOrderPath = sellOrderPathContainer.pathname;
        if (itemPath == sellOrderPath) {
            sellOrderPriceContainer = $(element).find(".item-price")[0];
            sellOrderPrice = cleanNumberString($(sellOrderPriceContainer)[0].innerText);
            cancelButton = $(this).find(".item-cancel");
            $(".marketplace-card-sell-orders .marketplace-card-open-orders tbody tr").each(function (index) {
                currentRowPrice = cleanNumberString($($(this)[0].children[0])[0].innerText);
                if (sellOrderPrice == currentRowPrice) {
                    $($(this)[0].children[1])[0].innerHTML = cancelButton[0].innerHTML;
                }
            });
        }
    });
});