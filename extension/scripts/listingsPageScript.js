// Full MLB_Card list is too slow to process and nobody knows how to set filters
// If they haven't set any, do it for them
urlSearchParams = new URLSearchParams(window.location.search)
if (urlSearchParams.get("type") == "MLB_Card" && urlSearchParams.get("min_price") == null && urlSearchParams.get("max_price") == null) {
  if (urlSearchParams.get("min_price") == null) {
    urlSearchParams.set("min_price", "5000");
  }
  if (urlSearchParams.get("max_price") == null) {
    urlSearchParams.set("max_price", "50000");
  }
  window.location.search = urlSearchParams.toString();
}
// "Market prices on this page are refreshed hourly." Not anymore!!! :D
$(".marketplace-filter-disclaimer").remove()
// Default table is no good, drop it
$(".marketplace-filter-list").remove()
// Insert our blank table
tableHTML = '<table class="sortable" width=100%><thead><tr><th>Name</th><th class="sorttable_nosort">Create Buy Order</th><th class="sorttable_nosort">Open Buy Orders</th><th class="sorttable_nosort">Create Sell Order</th><th class="sorttable_nosort">Open Sell Orders</th><th class="sorttable_numeric">Traded/hour</th><th class="sorttable_numeric">Profit%</th></th><th class="sorttable_numeric" id="ppph">Profit%/hour</th></tr></thead><tbody></tbody></table>'
$(".menu-pagination").before(tableHTML)
// Find how many pages there are
pageCount = 1
pageCountContainer = $(".pagination").children().last().prev()[0]
if (pageCountContainer != null) { pageCount = pageCountContainer.innerText }
// Get open orders
$.ajax({
  async: false,
  url: "/orders"
}).done(function (ordersPageData) {
  shopList = $(".shop-list", ordersPageData)
  openBuyOrders = $(shopList).find(".orders")[0]
  openSellOrders = $(shopList).find(".orders")[1]
})
for (i = 1; i <= pageCount; i++) {
  pageUrl = window.location.href + "&page=" + i
  // Scrape each page for item links
  $.ajax({
    url: pageUrl
  }).done(function (listingsPageData) {
    $(".marketplace-filter-item-name > a", listingsPageData).each(function () {
      // Got the link, now go get the details and write them into our main table
      $.ajax({
        url: $(this).attr("href")
      }).done(function (itemPageData) {
        row = $("<tr></tr>")
        $("tbody").append(row)

        // Populate "Name" column
        lastBreadcrumb = $($(".breadcrumbs > a", itemPageData)[2])
        itemPath = lastBreadcrumb.attr("href")
        row.append("<td><a href=\"" + itemPath + "\">" + lastBreadcrumb[0].innerText + "</a></td>")

        // Populate "Create Buy Order" column
        highestBuyOrderContainer = $(".marketplace-card-sell-orders td", itemPageData)[0]
        highestBuyOrderNumber = highestBuyOrderContainer == null ? "-" : cleanNumberString(highestBuyOrderContainer.innerText) + 1
        createBuyOrderCell = $("<td>")
        if (cleanNumberString($(".header-wallet")[0].innerText) > highestBuyOrderNumber) {
          buyForm = $("#create-buy-order-form", itemPageData)
          $("#price", buyForm).attr("size", 3)
          buyForm.children().last().remove()
          buyForm.children().last()[0].innerText = "Create"
          $("#price", buyForm)[0].value = highestBuyOrderNumber
          createBuyOrderCell.append(buyForm)
        }
        row.append(createBuyOrderCell)

        // Populate "Open Buy Orders" column
        openBuyOrdersCell = $("<td>")
        $(openBuyOrders).find(".order").each(function () {
          openBuyOrderPathContainer = $(this).find("a")[0]
          openBuyOrderPath = openBuyOrderPathContainer.pathname
          // If we have an open buy order for the item we are currently building the row for
          if (itemPath == openBuyOrderPath) {
            openBuyOrderPathContainer = $(this).find(".item-price")[0]
            openBuyOrderPrice = cleanNumberString($(openBuyOrderPathContainer)[0].innerText)
            cancelButton = $(this).find("form")
            cancelButton.children().prepend(openBuyOrderPrice + " ")
            secondHighestBuyOrderNumber = cleanNumberString($(".marketplace-card-sell-orders tr td", itemPageData)[2].innerText)
            if (openBuyOrderPrice == secondHighestBuyOrderNumber + 1) {
              cancelButton.css("color", "green")
            }
            else {
              cancelButton.css("color", "red")
            }
            openBuyOrdersCell.append(cancelButton[0])
          }
        })
        row.append(openBuyOrdersCell)

        // Populate "Create Sell Order" column
        lowestSellOrderContainer = $(".marketplace-card-buy-orders td", itemPageData)[0]
        lowestSellOrderNumber = lowestSellOrderContainer == null ? "-" : cleanNumberString(lowestSellOrderContainer.innerText) - 1
        createSellOrderCell = $("<td>")
        // TODO: This number is bugged, check inventory instead
        if (cleanNumberString($(".marketplace-card-owned", itemPageData)[1].innerText) > 0) {
          sellForm = $("#create-sell-order-form", itemPageData)
          $("#price", sellForm).attr("size", 3)
          sellForm.children().last().remove()
          sellForm.children().last()[0].innerText = "Create"
          // TODO: Check if the lowest sell order is already ours
          $("#price", sellForm)[0].value = lowestSellOrderNumber
          createSellOrderCell.append(sellForm)
        }
        row.append(createSellOrderCell)

        // Populate "Open Sell Orders" column
        openSellOrdersCell = $("<td>")
        $(openSellOrders).find(".order").each(function () {
          openSellOrderPathContainer = $(this).find("a")[0]
          openSellOrderPath = openSellOrderPathContainer.pathname
          // If we have an open sell order for the item we are currently building the row for
          if (itemPath == openSellOrderPath) {
            openSellOrderPathContainer = $(this).find(".item-price")[0]
            openSellOrderPrice = cleanNumberString($(openSellOrderPathContainer)[0].innerText)
            cancelButton = $(this).find("form")
            cancelButton.children().prepend(openSellOrderPrice + " ")
            secondLowestSellOrderNumber = cleanNumberString($(".marketplace-card-buy-orders tr td", itemPageData)[2].innerText)
            if (openSellOrderPrice == secondLowestSellOrderNumber - 1) {
              cancelButton.css("color", "green")
            }
            else {
              cancelButton.css("color", "red")
            }
            openSellOrdersCell.append(cancelButton[0])
          }
        })
        row.append(openSellOrdersCell)

        // Populate "Traded/hour" column
        tradedPastHour = 0
        $(".completed-order", itemPageData).each(function () {
          orderDate = Date.parse($(this).find(".date").text())
          oneHourAgo = new Date().addHours(-1)
          // These come in descending order
          if (Date.compare(orderDate, oneHourAgo) == 1) {
            tradedPastHour++
          }
          else {
            // Stop as soon as you find one that is more than an hour ago
            return false
          }
        })
        row.append("<td>" + tradedPastHour + "/hour</td>")

        // Populate Profit% and Profit%/hour columns
        if (highestBuyOrderNumber != "-" && lowestSellOrderNumber != "-") {
          profitPercent = getProfitPercentAfterTax(highestBuyOrderNumber, lowestSellOrderNumber)
          row.append("<td>" + profitPercent + "%</td>")
          profitPercentAfterTaxPerHour = getProfitPercentAfterTaxPerHour(profitPercent, tradedPastHour)
          row.append("<td>" + profitPercentAfterTaxPerHour + "%/hour</td></tr>")
        }
        else {
          row.append("<td>-</td><td>-</td></tr>")
        }
      })
    })
  })
}
$(".menu-pagination").remove()
$(document).ajaxStop(function () {
  ppphTh = document.getElementById("ppph")
  sorttable.innerSortFunction.apply(ppphTh, [])
})
function cleanNumberString(numberString) {
  return Number(numberString.replace(/\D/g, ""))
}
function precisionRound(number, precision) {
  factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}
function getProfitPercentAfterTax(buyPrice, sellPrice) {
  return precisionRound((((sellPrice * .9) - buyPrice) / buyPrice) * 100, 0)
}
function getProfitPercentAfterTaxPerHour(profitPercentAfterTax, tradedPastHour) {
  return precisionRound(profitPercentAfterTax * (tradedPastHour / 2), 0)
}