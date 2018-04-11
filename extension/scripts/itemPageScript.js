highestBuyOrderContainer = $(".marketplace-card-sell-orders").find("td")[0];
if (highestBuyOrderContainer != null) {
    highestBuyOrderNumber = cleanNumberString(highestBuyOrderContainer.innerText);
    $("#create-buy-order-form").find("#price")[0].value = ++highestBuyOrderNumber;
}
lowestSellOrderContainer = $(".marketplace-card-buy-orders").find("td")[0];
if (lowestSellOrderContainer != null) {
    lowestSellOrder = cleanNumberString(lowestSellOrderContainer.innerText);
    $("#create-sell-order-form").find("#price")[0].value = --lowestSellOrder;
}