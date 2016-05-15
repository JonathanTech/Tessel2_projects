var _ = require('underscore')
var moment = require('moment')
var request = require('request')

var settings = _.extend({
                          stocks: [
                            {
                              symbol: 'FB',
                              count: 4
                            },
                            {
                              symbol: 'GOOGL',
                              count: 2
                            },
                            {
                              symbol: 'MSFT',
                              count: 5
                            },
                            {
                              symbol: 'AAPL',
                              count: 3
                            },
                            {
                              symbol: 'NVDA',
                              count: 5
                            },
                            {
                              symbol: 'ATVI',
                              count: 5
                            },
                            {
                              symbol: 'LGF',
                              count: 5
                            },
                            {
                              symbol: 'AMZN',
                              count: 1
                            },
                            {
                              symbol: 'NFLX',
                              count: 4
                            },
                            {
                              symbol: 'SCTY',
                              count: 4
                            },
                            {
                              symbol: 'TSLA',
                              count: 1
                            },
                            {
                              symbol: 'DIS',
                              count: 3
                            },
                            {
                              symbol: 'AMD',
                              count: 80
                            }
                          ],
                          startInvestment: 5000.00,
                          cash: 29.49
                        });
var stocks = _.map(settings.stocks, function (item) {return item.symbol;});

var stockUrlString = stocks.join(',');
var url = 'http://finance.yahoo.com/webservice/v1/symbols/' + stockUrlString + '/quote?format=json&view=detail';

setImmediate(function loop() {
  "use strict";
  request({url:url, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      successCallback(body)
    }
    else{
      console.log(error)
    }
  })
  setTimeout(loop, 1000 * 60)
})


//ajax({url: url, type: 'json'}, successCallback, function (error) {console.log(JSON.stringify(error));});

function successCallback(data) {
  var stocks = _.indexBy(settings.stocks, 'symbol');
  var mergedStocks = {};
  _.each(data.list.resources, function (stockResource) {
    var stock = stockResource.resource.fields;
    var mergedStock = _.extend({}, stocks[stock.symbol], stock, {
      startPrice: Number.parseFloat(stock.price) - Number.parseFloat(stock.change),
      change: Number.parseFloat(stock.change)
    });
    mergedStock.changeValue = mergedStock.change * mergedStock.count;
    mergedStock.currentValue = mergedStock.price * mergedStock.count;
    mergedStock.startValue = mergedStock.startPrice * mergedStock.count;
    mergedStocks[mergedStock.symbol] = mergedStock;
  });

  var dailyChange = _.reduce(mergedStocks,
                             function (memo, item) {
                               var changeValue = item.changeValue;
                               if (!_.isNumber(changeValue) || _.isNaN(changeValue)) {
                                 changeValue = 0;
                               }
                               return memo + changeValue;
                             }, 0);
  var currentValue = _.reduce(mergedStocks,
                              function (memo, item) {
                                var currentValue = item.currentValue;
                                if (!_.isNumber(currentValue) || _.isNaN(currentValue)) {
                                  currentValue = 0;
                                }
                                return memo + currentValue;
                              }, 0);
  currentValue += settings.cash;
  var totalGainOrLoss = currentValue - settings.startInvestment;
  console.log('Total:' + totalGainOrLoss.toFixed(2))
  console.log('Daily:' + dailyChange.toFixed(2))
}