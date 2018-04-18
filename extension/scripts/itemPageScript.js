//Get number of this item traded in the past hour
tradedPerHour = 0;
$(".completed-order").each(function () {
    thisDate = moment($(this).find(".date").text(), "MMMM DD, YYYY hh:mA").toDate();
    OneHourAgo = new Date(Date.now());
    OneHourAgo.setHours(OneHourAgo.getHours() - 1);
    // These come in descending order
    if (thisDate > OneHourAgo) {
        tradedPerHour++;
    }
    else {
        // Stop as soon as you find one that is more than an hour ago
        return false;
    }
});
// Write in it a new heading
clone = $(".marketplace-main-heading h2").clone();
$(".marketplace-main-heading").append(clone);
clone[0].innerText = "Traded/hour: " + tradedPerHour.toString();
// Remove some things we know
$(".marketplace-card-create-order p").remove();
// Buy/Sell now buttons will always make you lose money, get them out of the way
$($.find(".marketplace-card-order-now")).each(function (index, element) {
    $(this).remove();
});
// Remove Reset button
$(".button.button-outline").remove();
// More things we already know
$(".marketplace-card-open-orders p").remove();
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
// Do this after the flip
// Pre-fill buy order form with the best offer
highestBuyOrderContainer = $(".marketplace-card-buy-orders td")[0];
if (highestBuyOrderContainer != null) {
    highestBuyOrderNumber = cleanNumberString(highestBuyOrderContainer.innerText);
    $("#create-buy-order-form").find("#price")[0].value = highestBuyOrderNumber + 1;
}
// Pre-fill sell order form with the best offer
lowestSellOrderContainer = $(".marketplace-card-sell-orders td")[0];
if (lowestSellOrderContainer != null) {
    lowestSellOrderNumber = cleanNumberString(lowestSellOrderContainer.innerText);
    $("#create-sell-order-form").find("#price")[0].value = lowestSellOrderNumber - 1;
}
// Calculate profit and write it in our a new heading
profitPercentAfterTax = getProfitPercentAfterTax(highestBuyOrderNumber, lowestSellOrderNumber);
clone[0].innerText += " | Profit%(After Tax): " + profitPercentAfterTax.toString() + "%";

// Calculate profit/hr and write it in our a new heading
clone[0].innerText += " | Profit%(After Tax)/hour: " + getProfitPercentAfterTaxPerHour(profitPercentAfterTax, tradedPerHour).toString() + "%";
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
// I hate setting a hard delay, but it won't work if we don't
setTimeout(
    function () {
        // Get rid of captchas
        // Not entirely sure why this works but I think cloning breaks the callback listener, making submit the only functional part
        buyOrderFormClone = $("#create-buy-order-form").clone();
        $("#create-buy-order-form").replaceWith(buyOrderFormClone);
        sellOrderFormClone = $("#create-sell-order-form").clone();
        $("#create-sell-order-form").replaceWith(sellOrderFormClone);
    }, 500);