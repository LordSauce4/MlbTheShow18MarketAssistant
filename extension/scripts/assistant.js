// Insert our page template
urlSearchParams = new URLSearchParams(window.location.search)
min_price = urlSearchParams.get("min_price")
max_price = urlSearchParams.get("max_price")
templateHTML = '<center><form method="get">Min Price:<input name="min_price" value="' + min_price + '"> Max Price:<input name="max_price" value="' + max_price + '"> <input type="submit" value="Submit"><center></form><table class="sortable" width=100%><thead><tr><th>Name</th><th class="sorttable_nosort">Create Buy Order</th><th class="sorttable_nosort">Open Buy Orders</th><th class="sorttable_nosort">Create Sell Order</th><th class="sorttable_nosort">Open Sell Orders</th><th class="sorttable_numeric">Traded/hour</th><th class="sorttable_numeric">Profit%</th></th><th class="sorttable_numeric" id="ppph">Profit%/hour</th></tr></thead><tbody></tbody></table>'
$(".content-inner").replaceWith(templateHTML)
// Pre-requisites
prerequisiteAjaxs = []
// Get open orders
prerequisiteAjaxs.push(
  $.ajax({
    url: "/orders"
  }).done(function (ordersPageData) {
    shopList = $(".shop-list", ordersPageData)
    openBuyOrders = $(shopList).find(".orders")[0]
    openSellOrders = $(shopList).find(".orders")[1]
  })
)
// Check how many pages total are being requested
types = [["MLB_Card", 1], ["Stadium", 1], ["Equipment", 1], ["Sponsorship", 1], ["Souvenir", 1]]
totalPages = 0
$(types).each(function (index) {
  pageUrl = "https://mlb18.theshownation.com/community_market/listings?type=" + types[index][0] + "&min_price=" + min_price + "&max_price=" + max_price
  prerequisiteAjaxs.push(
    $.ajax({
      url: pageUrl
    }).done(function (listingsPageData) {
      pageCountContainer = $(".pagination", listingsPageData).children().last().prev()[0]
      if (pageCountContainer != null) types[index][1] = Number(pageCountContainer.innerText)
    })
  )
})
// When done with all pre-requisites
$.when.apply($, prerequisiteAjaxs).then(function () {
  $(document).ajaxStop(function () {
    ppphTh = document.getElementById("ppph")
    sorttable.innerSortFunction.apply(ppphTh, [])
  })
  $(types).each(function () {
    for (i = 1; i <= this[1]; i++) {
      pageUrl = "https://mlb18.theshownation.com/community_market/listings?type=" + this[0] + "&min_price=" + min_price + "&max_price=" + max_price + "&page=" + i
      // Scrape each page for item links
      $.ajax({
        url: pageUrl
      }).done(function (listingsPageData) {
        $(".marketplace-filter-item-name > a", listingsPageData).each(function () {
          // Got the link, now go get the details
          $.ajax({
            url: $(this).attr("href")
          }).done(function (itemPageData) {
            // Got the details, do calculations and then write them into our main table
            row = $("<tr></tr>")
            $("tbody").append(row)
            // Populate "Name" column
            lastBreadcrumb = $($(".breadcrumbs > a", itemPageData)[2])
            itemPath = lastBreadcrumb.attr("href")
            row.append("<td>" + lastBreadcrumb[0].innerText + "</a></td>")
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
            else {
              createBuyOrderCell.append(highestBuyOrderNumber)
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
            else {
              createSellOrderCell.append(lowestSellOrderNumber)
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
              profitPercent = precisionRound((((lowestSellOrderNumber * .9) - highestBuyOrderNumber) / highestBuyOrderNumber) * 100, 0)
              row.append("<td>" + profitPercent + "%</td>")
              profitPercentAfterTaxPerHour = precisionRound(profitPercent * (tradedPastHour / 2), 0)
              row.append("<td>" + profitPercentAfterTaxPerHour + "%/hour</td></tr>")
            }
            else {
              row.append("<td>-</td><td>-</td></tr>")
            }
          })
        })
      })
    }
  })
});
function cleanNumberString(numberString) {
  return Number(numberString.replace(/\D/g, ""))
}
function precisionRound(number, precision) {
  factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}