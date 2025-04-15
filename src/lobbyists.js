import jquery from 'jquery';
window.jQuery = jquery;
window.$ = jquery;
require( 'datatables.net' )( window, $ )
require( 'datatables.net-dt' )( window, $ )

import underscore from 'underscore';
window.underscore = underscore;
window._ = underscore;

import '../public/vendor/js/popper.min.js'
import '../public/vendor/js/bootstrap.min.js'
import { csv } from 'd3-request'
import { json } from 'd3-request'

import '../public/vendor/css/bootstrap.min.css'
import '../public/vendor/css/dc.css'
import '/scss/main.scss';

import Vue from 'vue';
import Loader from './components/Loader.vue';
import ChartHeader from './components/ChartHeader.vue';


// Data object - is also used by Vue

var vuedata = {
  page: 'organizations',
  loader: true,
  showInfo: true,
  showShare: true,
  chartMargin: 40,
  dataUpdateDate: '',
  charts: {
    legalForm: {
      id: 'legalForm',
      title: 'Rechtsform',
      info: 'Im Lobbyregister muss jede Interessengruppe angeben, welche Rechtsform sie hat. Dies ist eine Spezifizierung der „Art der Interessengruppe“. Dafür gibt es eine Reihe vorgegebener Auswahlmöglichkeiten. Transparency Deutschland zum Beispiel hat die Rechtsform „Eingetragener Verein.“'
    },
    activity: {
      id: 'activity',
      title: 'Art der Interessengruppe',
      info: 'Im Lobbyregister muss jede Interessengruppe angeben, welche Organisationsform sie hat. Dafür gibt es eine Reihe vorgegebener Auswahlmöglichkeiten. Zum Beispiel sind wir von Transparency Deutschland als „Privatrechtliche Organisation mit Gemeinwohlaufgaben (z. B. eingetragene Vereine, Stiftungen)“ eingetragen.'
    },
    fieldsOfInterest: {
      id: 'fieldsOfInterest',
      title: 'Interessenbereiche',
      info: 'Im Lobbyregister muss jede Interessengruppe angeben, welche Interessen- und Vorhabenbereiche sie bearbeitet. Dafür gibt es eine Reihe vorgegebener Auswahlmöglichkeiten, wobei eine Mehrfachauswahl möglich ist. Wir von Transparency Deutschland haben zu unserem Thema Korruptionsbekämpfung aktuell 58 Interessen- und Vorhabenbereiche angegeben, da es ein gesellschaftliches Querschnittsthema darstellt.'
    },
    financialExpense: {
      id: 'financialExpense',
      title: 'Finanzielle Aufwendung der Interessenvertretung',
      info: 'Im Lobbyregister muss jede Interessengruppe angeben, wie hoch die finanziellen Aufwendungen im Bereich der Interessenvertretung innerhalb eines Jahres sind. Dies wird in 10.000-Euro-Schritten veröffentlicht. Geregelt ist dies im Lobbyregistergesetz §3, Abs 1 (6). Wir von Transparency Deutschland fallen für das Jahr 2023 in die Kategorie 60.001 – 70.000 Euro.'
    },
    regulatoryProjects: {
      id: 'regulatoryProjects',
      title: 'Interessenvertretungen mit den meisten Regelungsvorhaben',
      info: 'Seit der Reform des Lobbyregisters im März 2024 muss jede Interessengruppe angeben, welche Themen und Ziele sie in ihrer Lobbyarbeit verfolgt. Diese ergeben sich aus den angegebenen „konkreten Regelungsvorhaben“. Unsere Organisation, Transparency Deutschland, hat zum Beispiel 29 solcher Vorhaben im Lobbyregister eingetragen.'
    },
    table: {
      chart: null,
      type: 'table',
      title: 'Übersicht über alle eingetragenen Interessengruppen',
      info: 'Hier finden Sie eine Liste aller eingetragenen Interessengruppen. Diese können Sie nach den unterschiedlichen Variablen sortieren. Sollten Sie oben bereits eine Auswahl als Filter ausgewählt haben, werden Ihnen hier nur die zutreffenden Interessengruppen angezeigt'
    }
  },
  selectedOrg: {"Name": ""},
  colors: {
    default: "#009fe2",
    range: ["#009fe2", "#0079ca", "#005db5", "#014aa5", "#5c43a5", "#9d2d94", "#d30066", "#ddd"],
    numPies: {
      "0": "#ddd",
      "1": "#ff516a",
      "2": "#f43461",
      "3": "#e51f5c",
      "4": "#d31a60",
      ">5": "#bb1d60"
    }
  }
}

//Set vue components and Vue app

Vue.component('chart-header', ChartHeader);
Vue.component('loader', Loader);

new Vue({
  el: '#app',
  data: vuedata,
  methods: {
    //Share
    share: function (platform) {
      if(platform == 'twitter'){
        var thisPage = window.location.href.split('?')[0];
        var shareText = 'Wer lobbyiert auf Bundesebene und wie viel geben die Interessengruppen aus? Bei #integritywatch von @transparency_de finden Sie alle Informationen https://www.integritywatch.transparency.de';
        var shareURL = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText);
        window.open(shareURL, '_blank');
        return;
      }
      if(platform == 'facebook'){
        //var toShareUrl = window.location.href.split('?')[0];
        var toShareUrl = 'https://integritywatch.de';
        var shareURL = 'https://www.facebook.com/sharer/sharer.php?u='+encodeURIComponent(toShareUrl);
        window.open(shareURL, '_blank', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=250,top=300,left=300');
        return;
      }
      if(platform == 'linkedin'){
        var shareURL = 'https://www.linkedin.com/shareArticle?mini=true&url=https%3A%2F%2Fintegritywatch.transparency.de&title=Integrity+Watch+Deutschland&summary=Integrity+Watch+Deutschland&source=integritywatch.transparency.de';
        window.open(shareURL, '_blank', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes');
      }
    },
    getRecipients: function(statement) {
      var recipients = [];
      if(statement.recipientGroups && statement.recipientGroups.length > 0) {
        _.each(statement.recipientGroups, function (g) {
            if(g.recipients && g.recipients.length > 0) {
              _.each(g.recipients, function (r) {
                if(r.de) {
                  recipients.push(r.de);
                }
              });
            }
        });
      }
      if(recipients.length > 0) {
        return recipients.join(', ');
      }
      return '/';
    },
    cleanUpdateTimestamp: function(timestamp) {
      var updateDateParts = timestamp.split('T')[0].split('-');
      if (updateDateParts.length == 3) {
        return updateDateParts[2] + '/' + updateDateParts[1] + '/' + updateDateParts[0];
      }
      return timestamp.split('T')[0];
    }
  }
});

//Initialize info popovers
$(function () {
  $('[data-toggle="popover"]').popover()
})


//Charts

var charts = {
  legalForm: {
    chart: dc.pieChart("#legalform_chart"),
    type: 'pie',
    divId: 'legalform_chart'
  },
  activity: {
    chart: dc.rowChart("#activity_chart"),
    type: 'row',
    divId: 'activity_chart'
  },
  fieldsOfInterest: {
    chart: dc.rowChart("#foi_chart"),
    type: 'row',
    divId: 'foi_chart'
  },
  financialExpense: {
    chart: dc.barChart("#financialexpense_chart"),
    type: 'bar',
    divId: 'financialexpense_chart'
  },
  regulatoryProjects: {
    chart: dc.rowChart("#regprojects_chart"),
    type: 'row',
    divId: 'regprojects_chart'
  },
  table: {
    chart: null,
    type: 'table',
    divId: 'dc-data-table'
  }
}

//Functions for responsivness
var recalcWidth = function(divId) {
  return document.getElementById(divId).offsetWidth - vuedata.chartMargin;
};
var recalcCharsLength = function(width) {
  return parseInt(width / 8);
};
var calcPieSize = function(divId) {
  var newWidth = recalcWidth(divId);
  var sizes = {
    'width': newWidth,
    'height': 0,
    'radius': 0,
    'innerRadius': 0,
    'cy': 0,
    'legendY': 0
  }
  if(newWidth < 300) { 
    sizes.height = newWidth + 170;
    sizes.radius = (newWidth)/2;
    sizes.innerRadius = (newWidth)/4;
    sizes.cy = (newWidth)/2;
    sizes.legendY = (newWidth) + 30;
  } else {
    sizes.height = newWidth*0.75 + 170;
    sizes.radius = (newWidth*0.75)/2;
    sizes.innerRadius = (newWidth*0.75)/4;
    sizes.cy = (newWidth*0.75)/2;
    sizes.legendY = (newWidth*0.75) + 30;
  }
  return sizes;
};
var resizeGraphs = function() {
  for (var c in charts) {
    var sizes = calcPieSize(charts[c].divId);
    var newWidth = recalcWidth(charts[c].divId);
    var charsLength = recalcCharsLength(newWidth);
    if(charts[c].type == 'row'){
      charts[c].chart.width(newWidth);
      charts[c].chart.label(function (d) {
        var thisKey = d.key;
        if(thisKey.indexOf('###') > -1){
          thisKey = thisKey.split('###')[0];
        }
        if(thisKey.length > charsLength){
          return thisKey.substring(0,charsLength) + '...';
        }
        return thisKey;
      })
      charts[c].chart.redraw();
    } else if(charts[c].type == 'bar') {
      charts[c].chart.width(newWidth);
      charts[c].chart.rescale();
      charts[c].chart.redraw();
    } else if(charts[c].type == 'pie') {
      var legendMaxChars = 40;
      if(sizes.width > 425) {
        legendMaxChars = 70;
      }
      charts[c].chart
        .width(sizes.width)
        .height(sizes.height)
        .cy(sizes.cy)
        .innerRadius(sizes.innerRadius)
        .radius(sizes.radius)
        .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(false).legendWidth(sizes.width).legendText(function(d) { 
          var thisKey = d.name;
          if(thisKey == 'Others') {
            thisKey = 'Sonstige';
          }
          if(thisKey.length > legendMaxChars){
            return thisKey.substring(0,legendMaxChars) + '...';
          }
          return thisKey;
        }));
      charts[c].chart.redraw();
    } else if(charts[c].type == 'cloud') {
      charts[c].chart.redraw();
    }
  }
};

//X Axis labels for charts
var addXLabel = function(chartToUpdate, displayText) {
  var textSelection = chartToUpdate.svg()
            .append("text")
              .attr("class", "x-axis-label")
              .attr("text-anchor", "middle")
              .attr("x", chartToUpdate.width() / 2)
              .attr("y", chartToUpdate.height() + 30)
              .text(displayText);
  var textDims = textSelection.node().getBBox();
  var chartMargins = chartToUpdate.margins();
  // Dynamically adjust positioning after reading text dimension from DOM
  textSelection
      .attr("x", chartMargins.left + (chartToUpdate.width()
        - chartMargins.left - chartMargins.right) / 2)
      .attr("y", chartToUpdate.height() - Math.ceil(textDims.height) / 2);
};

//Add commas to thousands
function addcommas(x){
  if(parseInt(x)){
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return x;
}
//Custom date order for dataTables
var dmy = d3.timeParse("%d/%m/%Y");
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "date-eu-pre": function (date) {
    if(date.indexOf("Cancelled") > -1){
      date = date.split(" ")[0];
    }
      return dmy(date);
  },
  "date-eu-asc": function (a, b) {
      return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "date-eu-desc": function ( a, b ) {
      return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});

//Custom ordering for min and max
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "num-html-pre": function (a) {
    var x = a.replace(' €', '').replaceAll(',','');
    if(x == '') {
      return 0;
    }
    return parseFloat(x);
  },
  "num-html-asc": function (a, b) {
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "num-html-desc": function (a, b) {
      return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});

//Custom ordering for range costs string
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "amt-range-pre": function (a) {
    if(!a) {
      return -1;
    }
    if(a == 'keine Angabe') {
      return -1;
    }
    var x = a.split("-");
    if(x.length < 2) {
      x = x[0].replace('€', '').replaceAll(',','').trim();
    } else {
      x = x[1].replace('€', '').replaceAll(',','').trim();
    }
    if(x == '' || isNaN(x)) {
      return -1;
    }
    return parseFloat(x);
  },
  "amt-range-asc": function (a, b) {
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "amt-range-desc": function (a, b) {
      return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});

//Custom ordering for floats with text
jQuery.extend( jQuery.fn.dataTableExt.oSort, {
  "num-text-pre": function (a) {
    if(isNaN(a)) {
      return -10;
    }
    if(a == 'keine Angabe') {
      return -10;
    }
    return parseFloat(a);
  },
  "num-text-asc": function (a, b) {
    return ((a < b) ? -1 : ((a > b) ? 1 : 0));
  },
  "num-text-desc": function (a, b) {
      return ((a < b) ? 1 : ((a > b) ? -1 : 0));
  }
});

//Calculate category for lobby expense streamlining
function lobbyExpenseStreamlining(expMax){
  expMax = parseInt(expMax);
  if(expMax > 5000000) {
    return "> 5M";
  } else if(expMax > 1000000) {
    return "1M - 5M";
  } else if(expMax > 500000) {
    return "500K - 1M";
  } else if(expMax > 200000) {
    return "200K - 500K";
  } else if(expMax > 100000) {
    return "100K - 200K";
  } else if(expMax > 70000) {
    return "70K - 100K";
  } else if(expMax > 50000) {
    return "50K - 70K";
  } else if(expMax > 30000) {
    return "30K - 50K";
  } else if(expMax > 10000) {
    return "10K - 30K";
  } else if(expMax > 0) {
    return "1 - 10K";
  } else {
    return "0"
  }
}

//Format euro amount
function formatAmount(amt){
  if(isNaN(amt)) {
    return amt;
  }
  return '€' + addcommas(amt);
}

//Load data and generate charts
//Generate random parameter for dynamic dataset loading (to avoid caching)

var randomPar = '';
var randomCharacters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
for ( var i = 0; i < 5; i++ ) {
  randomPar += randomCharacters.charAt(Math.floor(Math.random() * randomCharacters.length));
}

//json('./data/lobbyists/lobbyregister.json?' + randomPar, (err, jsonData) => {
  //https://integritywatch.eu//autoupdate_data_de/lobbyists.json
  //json('./data/lobbyists/lobbyists.json?' + randomPar, (err, jsonData) => {
  json('https://integritywatch.eu//autoupdate_data_de/lobbyists.json?' + randomPar, (err, jsonData) => {
  var organizations = jsonData.lobbyists;
  console.log(organizations.length);
  var finCats = {};
  vuedata.dataUpdateDate = jsonData.sourceDate.split('T')[0];
  //Parse data
  _.each(organizations, function (d) {
    if(!d.name) {
      console.log(d);
    }
    //Legal form
    d.legalFormString = "keine Angabe";
    if(d.legalForm) {
      if(!d.legalForm.de) {
        console.log("no legalform DE");
        console.log(d.legalForm);
      }
      d.legalFormString = d.legalForm.de;
    }
    //Activity
    d.activityString = "keine Angabe";
    if(d.activity && d.activity.de) {
      d.activityString = d.activity.de;
    }
    //FoI
    d.fois = [];
    if(d.foi) {
      d.fois = d.foi;
    }
    //Financial Expenses
    d.finExpCategory = "N/A";
    if(d.financialExpenses && d.financialExpenses.financialExpensesEuro) {
      d.finExpCategoryFull = formatAmount(d.financialExpenses.financialExpensesEuro.from) + ' - ' + formatAmount(d.financialExpenses.financialExpensesEuro.to);
      d.finExpCategory = lobbyExpenseStreamlining(d.financialExpenses.financialExpensesEuro.to);
      if(finCats[d.finExpCategory]) {
        finCats[d.finExpCategory] ++;
      } else {
        finCats[d.finExpCategory] = 1;
      }
    }
    //Regulatory Projects
    d.regulatoryProjectsNum = 0;
    if(d.regulatoryProjects && d.regulatoryProjects.num) {
      d.regulatoryProjectsNum = d.regulatoryProjects.num;
    }
    //Table info
    //Country
    if(!d.country) {
      d.country = "keine Angabe";
    } else {
      d.country  = d.country.code;
    }
    //Employees
    d.employees = "keine Angabe";
    if(d.employeesCount) {
      d.employees = d.employeesCount.from + " - " + d.employeesCount.to;
      if(d.employeesCount.from == d.employeesCount.to) {
        d.employees = d.employeesCount.to;
      }
    }
    if(typeof d.employeeFTE === "undefined") {
      d.employeeFTE = "keine Angabe";
    }
    //Memberships
    if(!d.memberships) {
      d.memberships = "keine Angabe";
    }
    //Code violation
    d.codeViolation = "Nein";
    if(d.codexViolations && d.codexViolations == true) {
      d.codeViolation = "Ja";
    }
  });

  //Set dc main vars
  var ndx = crossfilter(organizations);
  var searchDimension = ndx.dimension(function (d) {
      var entryString = "" + d.name;
      return entryString.toLowerCase();
  });
  var searchDimensionRegProjects = ndx.dimension(function (d) {
    var entryString = "";
    if(d.regulatoryProjects) {
      entryString += d.regulatoryProjects.projectNums.join(" ") + " " + d.regulatoryProjects.projectTitles.join(" ") + " " + d.regulatoryProjects.lawsTitles.join(" ") + " " + d.regulatoryProjects.laws.join(" ") + " " + d.regulatoryProjects.printedMattersNums.join(" ") ;
    }
    return entryString.toLowerCase();
});

  //CHART 1 - Fields of Interest
  var createFoisChart = function() {
    var chart = charts.fieldsOfInterest.chart;
    var dimension = ndx.dimension(function (d) {
      return d.fois;
    }, true);
    var group = dimension.group().reduceSum(function (d) {
      return 1;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(20).filter(function(d) {
            return (d.value != 0);
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.fieldsOfInterest.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(520)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default;
      })
      .label(function (d) {
          if(d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + d.value;
      })
      .elasticX(true)
      .xAxis().ticks(4);
    /*
    chart.on("postRender", function(chart) {
      addXLabel(chart, "Anzahl Interessenbereiche");
    });
    */
    chart.render();
  }

  //CHART 2 - Legal Form
  var createLegalFormChart = function() {
    var chart = charts.legalForm.chart;
    var dimension = ndx.dimension(function (d) {
      return d.legalFormString;
    });
    var group = dimension.group().reduceSum(function (d) { return 1; });
    var sizes = calcPieSize(charts.legalForm.divId);
    var legendMaxChars = 40;
    if(sizes.width > 425) {
      legendMaxChars = 70;
    }
    chart
      .width(sizes.width)
      .height(sizes.height)
      .cy(sizes.cy)
      .innerRadius(sizes.innerRadius)
      .radius(sizes.radius)
      .cap(7)
      .legend(dc.legend().x(0).y(sizes.legendY).gap(10).autoItemWidth(true).horizontal(false).legendWidth(sizes.width).legendText(function(d) { 
        var thisKey = d.name;
        if(thisKey == 'Others') {
          thisKey = 'Sonstige';
        }
        if(thisKey.length > legendMaxChars){
          return thisKey.substring(0,legendMaxChars) + '...';
        }
        return thisKey;
      }))
      .title(function(d){
        if(d.key == 'Others') {
          return 'Sonstige : ' + d.value;
        }
        return d.key + ': ' + d.value;
      })
      .dimension(dimension)
      .ordinalColors(vuedata.colors.range)
      //.ordinalColors(vuedata.colors.generic)
      .group(group);
      /*
      .colorCalculator(function(d, i) {
        return vuedata.colors.incomes[d.key];
      });
      */
    chart.render();
  }

  //CHART 3 - Activity
  var createActivityChart = function() {
    var chart = charts.activity.chart;
    var dimension = ndx.dimension(function (d) {
        return d.activityString;
    }, false);
    var group = dimension.group().reduceSum(function (d) {
        return 1;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(100).filter(function(d) {
            return (d.value != 0);
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.activity.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(520)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default;
      })
      .label(function (d) {
          if(d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + d.value;
      })
      .elasticX(true)
      .xAxis().ticks(4);
    chart.render();
  }

  //CHART 4 - Financial Expense
  var createFinancialExpenseChart = function() {
    var chart = charts.financialExpense.chart;
    var dimension = ndx.dimension(function (d) {
        return d.finExpCategory;
    });
    var group = dimension.group().reduceSum(function (d) {
        return 1;
    });
    var width = recalcWidth(charts.financialExpense.divId);
    var order = ["N/A", "0", "1 - 10K", "10K - 30K", "30K - 50K", "50K - 70K", "70K - 100K", "100K - 200K", "200K - 500K", "500K - 1M", "1M - 5M", "> 5M"];
    chart
      .width(width)
      .height(490)
      .group(group)
      .dimension(dimension)
      .on("preRender",(function(chart,filter){
      }))
      .margins({top: 0, right: 10, bottom: 20, left: 40})
      .x(d3.scaleBand().domain(order))
      .xUnits(dc.units.ordinal)
      .gap(15)
      .yAxisLabel("Anzahl der Aufwendungen")
      .elasticY(true)
      //.ordering(function(d) { return -d.value; })
      .colorCalculator(function(d, i) {
        return vuedata.colors.default;
      });
      //.ordinalColors(vuedata.colors.generic);
    chart.render();
  }

  //CHART 5 - Regulatory Projects
  var createRegProjectsChart = function() {
    var chart = charts.regulatoryProjects.chart;
    var dimension = ndx.dimension(function (d) {
      return d.name;
    }, false);
    var group = dimension.group().reduceSum(function (d) {
      return d.regulatoryProjectsNum;
    });
    var filteredGroup = (function(source_group) {
      return {
        all: function() {
          return source_group.top(15).filter(function(d) {
            return (d.value != 0);
          });
        }
      };
    })(group);
    var width = recalcWidth(charts.fieldsOfInterest.divId);
    var charsLength = recalcCharsLength(width);
    chart
      .width(width)
      .height(450)
      .margins({top: 0, left: 0, right: 0, bottom: 20})
      .group(filteredGroup)
      .dimension(dimension)
      .colorCalculator(function(d, i) {
        return vuedata.colors.default;
      })
      .label(function (d) {
          if(d.key.length > charsLength){
            return d.key.substring(0,charsLength) + '...';
          }
          return d.key;
      })
      .title(function (d) {
          return d.key + ': ' + d.value;
      })
      .elasticX(true)
      .xAxis().ticks(4);
    chart.render();
  }

  //TABLE
  var createTable = function() {
    var count=0;
    charts.table.chart = $("#dc-data-table").dataTable({
      "language": {
        "info": "Zeigt _START_ bis _END_ von _TOTAL_ Einträgen",
        "lengthMenu": "Zeige _MENU_ Einträge ",
        "paginate": {
          "first":      "First",
          "last":       "Last",
          "next":       "Nächste ",
          "previous":   "Vorherige"
        }
      },
      "columnDefs": [
        {
          "searchable": false,
          "orderable": false,
          "targets": 0,   
          data: function ( row, type, val, meta ) {
            return count;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 1,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.name;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 2,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.legalFormString;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 3,
          "defaultContent":"N/A",
          "type": "amt-range",
          "data": function(d) {
            return d.employees;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 4,
          "defaultContent":"N/A",
          "type": "num-text",
          "data": function(d) {
            return d.employeeFTE;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 5,
          "defaultContent":"N/A",
          "type": "num-text",
          "data": function(d) {
            return d.memberships;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 6,
          "defaultContent":"N/A",
          "type": "amt-range",
          "data": function(d) {
            return d.finExpCategoryFull;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 7,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.regulatoryProjectsNum;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 8,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.codeViolation;
          }
        },
        {
          "searchable": false,
          "orderable": true,
          "targets": 9,
          "defaultContent":"N/A",
          "data": function(d) {
            return d.country;
          }
        }
      ],
      "iDisplayLength" : 25,
      "bPaginate": true,
      "bLengthChange": true,
      "bFilter": false,
      "order": [[ 6, "desc" ]],
      "bSort": true,
      "bInfo": true,
      "bAutoWidth": false,
      "bDeferRender": true,
      "aaData": searchDimension.top(Infinity),
      "bDestroy": true,
    });
    var datatable = charts.table.chart;
    datatable.on( 'draw.dt', function () {
      var PageInfo = $('#dc-data-table').DataTable().page.info();
        datatable.DataTable().column(0, { page: 'current' }).nodes().each( function (cell, i) {
            cell.innerHTML = i + 1 + PageInfo.start;
        });
      });
      datatable.DataTable().draw();

    $('#dc-data-table tbody').on('click', 'tr', function () {
      var data = datatable.DataTable().row( this ).data();
      json('https://integritywatch.eu//autoupdate_data_de/lobbyists_jsons/'+data.registerNumber+'.json?'+randomPar, (err, fullData) => {
        data.fullData = fullData;
        vuedata.selectedOrg = data;
        console.log(vuedata.selectedOrg);
        $('#detailsModal').modal();
      });
    });
  }
  //REFRESH TABLE
  function RefreshTable() {
    dc.events.trigger(function () {
      var alldata = searchDimension.top(Infinity);
      charts.table.chart.fnClearTable();
      charts.table.chart.fnAddData(alldata);
      charts.table.chart.fnDraw();
    });
  }

  //SEARCH INPUT FUNCTIONALITY
  var typingTimer;
  var doneTypingInterval = 1000;
  var $input = $("#search-input");
  $input.on('keyup', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
  });
  $input.on('keydown', function () {
    clearTimeout(typingTimer);
  });
  function doneTyping () {
    var s = $input.val().toLowerCase();
    searchDimension.filter(function(d) { 
      return d.indexOf(s) !== -1;
    });
    throttle();
    var throttleTimer;
    function throttle() {
      window.clearTimeout(throttleTimer);
      throttleTimer = window.setTimeout(function() {
          dc.redrawAll();
      }, 250);
    }
  }
  //REGULATORY PROJECTS SEARCH INPUT FUNCTIONALITY
  var typingTimerRegProjects;
  var doneTypingIntervalRegProjects = 1000;
  var $inputRegProjects = $("#search-input-regprojects");
  $inputRegProjects.on('keyup', function () {
    clearTimeout(typingTimerRegProjects);
    typingTimerRegProjects = setTimeout(doneTypingRegProjects, doneTypingIntervalRegProjects);
  });
  $inputRegProjects.on('keydown', function () {
    clearTimeout(typingTimerRegProjects);
  });
  function doneTypingRegProjects () {
    var s = $inputRegProjects.val().toLowerCase();
    searchDimensionRegProjects.filter(function(d) { 
      return d.indexOf(s) !== -1;
    });
    throttle();
    var throttleTimer;
    function throttle() {
      window.clearTimeout(throttleTimer);
      throttleTimer = window.setTimeout(function() {
          dc.redrawAll();
      }, 250);
    }
  }

  //Reset charts
  var resetGraphs = function() {
    for (var c in charts) {
      if(charts[c].type !== 'table' && charts[c].chart.hasFilter()){
        charts[c].chart.filterAll();
      }
    }
    searchDimension.filter(null);
    searchDimensionRegProjects.filter(null);
    $('#search-input').val('');
    $('#search-input-regprojects').val('');
    dc.redrawAll();
  }
  $('.reset-btn').click(function(){
    resetGraphs();
  })
  
  //Render charts
  createLegalFormChart();
  createActivityChart();
  createFoisChart();
  createFinancialExpenseChart();
  createRegProjectsChart();
  createTable();

  $('.dataTables_wrapper').append($('.dataTables_length'));

  //Hide loader
  vuedata.loader = false;

  //COUNTERS
  //Main counter
  var all = ndx.groupAll();
  var counter = dc.dataCount('.dc-data-count')
    .dimension(ndx)
    .group(all);
  counter.render();
  counter.on("renderlet.resetall", function(c) {
    RefreshTable();
  });

  //Window resize function
  window.onresize = function(event) {
    resizeGraphs();
  };
  //Show disclaimer modal
  $('#disclaimerModal').modal();

});
