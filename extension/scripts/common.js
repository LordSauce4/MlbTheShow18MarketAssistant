function cleanNumberString(numberString) {
    return Number(numberString.replace(/\D/g, ""));
}
function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}
function getProfitPercentAfterTax(buyPrice, sellPrice) {
    return precisionRound((((sellPrice * .9) - buyPrice) / buyPrice) * 100, 0);
}
function getProfitPercentAfterTaxPerHour(profitPercentAfterTax, tradedPastHour) {
    return precisionRound(profitPercentAfterTax * (tradedPastHour / 2), 0);
}