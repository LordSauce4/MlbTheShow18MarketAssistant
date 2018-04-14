// Buy/Sell now buttons will always make you lose money, get them out of the way
$($.find(".marketplace-card-order-now")).each(function (index, element) {
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
// Set background image
$(".marketplace-card-info-asset img").each(function (indexInArray, value) {
    imgSrc = $(value)[0].src;
    // Find the actual item image (i.e. instead of the topps or team logos)
    if (imgSrc.indexOf("actionshots") >= 0 || imgSrc.indexOf("items") >= 0) {
        $('.marketplace-card').css('background-image', 'url("' + imgSrc + '")');
    }
});
// This must go after setting the background image since $(".marketplace-card-info-asset img") is under $(".marketplace-card-info")
$(".marketplace-card-info").remove();
// If we can sell this, tell us
sellableCount = cleanNumberString($(".marketplace-card-owned")[1].innerHTML);
// Remove captchas (don't know if this actually works yet)
$(".g-recaptcha").removeClass("g-recaptcha")
// Most useful for when you are monitoring a buy order, it sells and the you refresh and see this
if (sellableCount != 0) {
    alert("You can sell this");
}
// Pre-fill buy order form with the best offer
highestBuyOrderContainer = $(".marketplace-card-buy-orders").find("td")[0];
if (highestBuyOrderContainer != null) {
    highestBuyOrderNumber = cleanNumberString(highestBuyOrderContainer.innerText);
    $("#create-buy-order-form").find("#price")[0].value = highestBuyOrderNumber + 1;
}
// Pre-fill sell order form with the best offer
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