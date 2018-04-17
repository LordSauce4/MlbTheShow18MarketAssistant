// "Market prices on this page are refreshed hourly." Not anymore!!! :D
$(".marketplace-filter-disclaimer").remove();
// Default table is no good, drop it
$(".marketplace-filter-list").remove();
// Insert our blank table
tableHTML = '<table class="sortable" width=100%; style="font-size:15px;"><thead style="background-color:#151515;font-weight:bold;"><tr><th>Name</th><th class="sorttable_numeric">Buy</th><th class="sorttable_numeric">Sell</th><th class="sorttable_numeric">Traded/hr</th><th class="sorttable_numeric">Profit%(After Tax)</th></th><th class="sorttable_numeric">Profit%(After Tax)/hr</th></tr></thead><tbody></tbody></table>';
$(".menu-pagination").before(tableHTML);
// Find how many pages there are
pageCount = 1;
pageCountContainer = $(".pagination").children().last().prev()[0];
if (pageCountContainer != null) { pageCount = pageCountContainer.innerText }
for (i = 1; i <= pageCount; i++) {
    pageUrl = window.location.href + "&page=" + i;
    // Scrape each page for item links
    $.ajax({
        url: pageUrl
    }).done(function (data1) {
        parsedData1 = $(jQuery.parseHTML(data1));
        parsedData1.find(".marketplace-filter-item-name > a").each(function () {
            // Got the link, now go get the details and write them into our main table
            $.ajax({
                url: $(this).attr("href")
            }).done(function (data2) {
                parsedData2 = $(jQuery.parseHTML(data2));
                lastBreadcrumb = $(parsedData2.find(".breadcrumbs > a")[2]);
                rowHtml = "<tr><td><a href=\"" + lastBreadcrumb.attr("href") + "\">" + lastBreadcrumb[0].innerText + "</a></td>";
                buyNowButtonContainer = parsedData2.find(".marketplace-card-sell-orders > .marketplace-card-create-forms > .marketplace-card-order-now")[0];
                // If somebody is offering to sell this item, get price
                buyPrice = "-";
                if (buyNowButtonContainer != null) { buyPrice = cleanNumberString(buyNowButtonContainer.innerText); }
                rowHtml += "<td>" + buyPrice + "</td>";
                sellNowButtonContainer = parsedData2.find(".marketplace-card-buy-orders > .marketplace-card-create-forms > .marketplace-card-order-now")[0];
                // If somebody is offering to buy this item, get price
                sellPrice = "-";
                if (sellNowButtonContainer != null) { sellPrice = cleanNumberString(sellNowButtonContainer.innerText); }
                rowHtml += "<td>" + sellPrice + "</td>";
                tradedPastHour = 0;
                parsedData2.find(".completed-order").each(function () {
                    thisDate = moment($(this).find(".date").text(), "MMMM DD, YYYY hh:mA").toDate();
                    OneHourAgo = new Date(Date.now());
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
                rowHtml += "<td>" + tradedPastHour + "</td>";
                // buyPrice can be null if nobody is offering to sell this item
                // sellPrice can be null if nobody is offering to buy this item
                if (buyPrice != "-" && sellPrice != "-") {
                    profitPercent = getProfitPercentAfterTax(buyPrice, sellPrice);
                    rowHtml += "<td>" + profitPercent + "%</td>";
                    profitPercentAfterTaxPerHour = getProfitPercentAfterTaxPerHour(profitPercent, tradedPastHour);
                    rowHtml += "<td>" + profitPercentAfterTaxPerHour + "</td></tr>";
                }
                else {
                    rowHtml += "<td>-</td><td>-</td></tr>";
                }
                $("tbody").append(rowHtml);
            });
        });
    });
}
$(".menu-pagination").remove();