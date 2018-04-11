highestBuyOrder = cleanNumberString($(".marketplace-card-sell-orders").find("td")[0].innerText);
$("#create-buy-order-form").find("#price")[0].value = ++highestBuyOrder;
lowestSellOrder = cleanNumberString($(".marketplace-card-buy-orders").find("td")[0].innerText);
$("#create-sell-order-form").find("#price")[0].value = --lowestSellOrder;

function cleanNumberString(numberString) {
    return Number(numberString.replace(/\D/g, ""));
}