'use strict';
// "Market prices on this page are refreshed hourly." Not anymore!!! :D
$('.marketplace-filter-disclaimer').remove();
var tableHTML = '<table class="sortable" width=100%; style="font-size:15px;"><thead style="background-color:#151515;font-weight:bold;"><tr><th>Name</th><th class="sorttable_numeric">Buy</th><th class="sorttable_numeric">Sell</th><th class="sorttable_numeric">Profit(After Tax)</th><th class="sorttable_numeric">Difference% (After Tax)</th><th class="sorttable_numeric">Traded in the past hour</th></th><th class="sorttable_numeric">Profit per hour</th></tr></thead><tbody>';
var objectArray = [];
$('.marketplace-filter-item').each(function () {
    var name = $(this).find('.marketplace-filter-item-name > a').text();
    var url = $(this).find('.marketplace-filter-item-name > a').attr('href');
    var row = {
        url: url,
        name: name,
    };
    objectArray.push(row);
});
// Thanks for the links! Goodbye!
$('.marketplace-filter-list').remove();
$(objectArray).each(function () {
    tableHTML += '<tr><td class="nameRow"><a href="' + $(this)[0].url + '">' + $(this)[0].name + '</a></td><td class="buyNowRow">-</td><td class="sellNowRow">-</td><td class="datRow">-</td><td class="pdRow">-</td><td class="tradedPastHour">-</td><td class="profitPerHour">-</td></tr>';
});
tableHTML += '</tbody></table>';
$('.menu-pagination').before('<script type="text/javascript" src="https://www.kryogenix.org/code/browser/sorttable/sorttable.js">');
$('.menu-pagination').before(tableHTML);
$('.sortable > tbody  > tr').each(function () {
    var buyPrice;
    var sellPrice;
    var tradedPastHour = 0;
    var rowURL = $(this).find('.nameRow > a').attr('href');
    var buyNowRow = $(this).find('.buyNowRow');
    var sellNowRow = $(this).find('.sellNowRow');
    var datRow = $(this).find('.datRow');
    var pdRow = $(this).find('.pdRow');
    var tradedPastHourRow = $(this).find('.tradedPastHour');
    var profitPerHourRow = $(this).find('.profitPerHour');
    $.ajax({
        url: rowURL
    }).done(function (data) {
        // TODO: context thing https://api.jquery.com/jquery.parsehtml/
        var parsedData = $(jQuery.parseHTML(data));
        var buyNowButtonContainer = parsedData.find(".marketplace-card-sell-orders > .marketplace-card-create-forms > .marketplace-card-order-now")[0];
        // If somebody is offering to sell this item, get price
        if (buyNowButtonContainer != null) { buyPrice = cleanNumberString(buyNowButtonContainer.innerText); }
        // Don't have to do this but it makes console errors go away
        if (buyPrice != null) { buyNowRow.html(buyPrice); }
        var sellNowButtonContainer = parsedData.find(".marketplace-card-buy-orders > .marketplace-card-create-forms > .marketplace-card-order-now")[0];
        // If somebody is offering to buy this item, get price
        if (sellNowButtonContainer != null) { sellPrice = cleanNumberString(sellNowButtonContainer.innerText); }
        // Don't have to do this but it makes console errors go away
        if (sellPrice != null) { sellNowRow.html(sellPrice); }
        parsedData.find(".completed-order").each(function () {
            console.log($(this).find(".date").text());
            var thisDate = moment($(this).find(".date").text(), "MMMM DD, YYYY hh:mA").toDate();
            var OneHourAgo = new Date(Date.now());
            OneHourAgo.setHours(OneHourAgo.getHours() - 1);
            // These come in descending order
            if (thisDate > OneHourAgo) {
                tradedPastHour++;
            }
            else {
                // Stop as soon as you find one that is more than an hour ago
                return false;
            }
        });
        tradedPastHourRow.html(tradedPastHour);
        // buyPrice can be null if nobody is offering to sell this item
        // sellPrice can be null if nobody is offering to buy this item
        if (buyPrice != null && sellPrice != null) {
            var profit = (sellPrice * .9) - buyPrice;
            profit = precisionRound(profit, 0);
            datRow.html(profit);
            var percentDifference = (profit / buyPrice) * 100;
            percentDifference = precisionRound(percentDifference, 2);
            pdRow.html(percentDifference + "%");
            var profitPerHour = profit * (tradedPastHour / 2);
            profitPerHourRow.html(precisionRound(profitPerHour, 0));
        }
    });
});

function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}