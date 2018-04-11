highestBuyOrderContainer = $(".marketplace-card-sell-orders").find("td")[0];
if (highestBuyOrderContainer != null) {
    highestBuyOrderNumber = cleanNumberString(highestBuyOrderContainer.innerText);
    $("#create-buy-order-form").find("#price")[0].value = highestBuyOrderNumber + 1;
}
lowestSellOrderContainer = $(".marketplace-card-buy-orders").find("td")[0];
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
            if (buyOrderPrice != highestBuyOrderNumber) {
                alert("You are offering to buy for " + buyOrderPrice + " but there is a better offer: " + highestBuyOrderNumber);
            }
            else {
                alert("You are offering to buy for the best price price: " + buyOrderPrice);
            }
        }
    });

    sellOrders = $(shopList).find(".orders")[1];
    $(sellOrders).find(".order").each(function (index, element) {
        sellOrderPathContainer = $(element).find("a")[0];
        sellOrderPath = sellOrderPathContainer.pathname;
        if (itemPath == sellOrderPath) {
            sellOrderPriceContainer = $(element).find(".item-price")[0];
            sellOrderPrice = cleanNumberString($(sellOrderPriceContainer)[0].innerText);
            if (sellOrderPrice != lowestSellOrderNumber) {
                alert("You are offering to sell for " + sellOrderPrice + " but there is a better offer: " + lowestSellOrderNumber);
            }
            else {
                alert("You are offering to sell for the best price: " + sellOrderPrice);
            }
        }
    });
});