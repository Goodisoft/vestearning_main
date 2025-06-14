!(function (NioApp, $) {
  var polarChartData = {
    labels: ["Started", "Inprogress", "Completed", "Cencel", "Success"],
    dataUnit: "$",
    legend: !1,
    datasets: [
      {
        borderColor: "#fff",
        background: [
          NioApp.hexRGB("#9cabff", 0.8),
          NioApp.hexRGB("#f4aaa4", 0.8),
          NioApp.hexRGB("#9785FF", 0.8),
          NioApp.hexRGB("#E85347", 0.8),
          NioApp.hexRGB("#8feac5", 0.8),
        ],
        data: [110, 150, 168, 45, 235],
      },
    ],
  };
  function polarAreaChart(selector, set_data) {
    var $selector = $(selector || ".polar-chart");
    $selector.each(function () {
      for (
        var $self = $(this),
          _self_id = $self.attr("id"),
          _get_data = void 0 === set_data ? eval(_self_id) : set_data,
          selectCanvas = document.getElementById(_self_id).getContext("2d"),
          chart_data = [],
          i = 0;
        i < _get_data.datasets.length;
        i++
      )
        chart_data.push({
          backgroundColor: _get_data.datasets[i].background,
          borderWidth: 2,
          borderColor: _get_data.datasets[i].borderColor,
          hoverBorderColor: _get_data.datasets[i].borderColor,
          data: _get_data.datasets[i].data,
        });
      var chart = new Chart(selectCanvas, {
        type: "polarArea",
        data: { labels: _get_data.labels, datasets: chart_data },
        options: {
          plugins: {
            legend: {
              display: _get_data.legend || !1,
              rtl: NioApp.State.isRTL,
              labels: { boxWidth: 12, padding: 20, color: "#6783b8" },
            },
            tooltip: {
              enabled: !0,
              rtl: NioApp.State.isRTL,
              callbacks: {
                label: function (a) {
                  return "".concat(a.parsed.r, " ").concat(_get_data.dataUnit);
                },
              },
              backgroundColor: "#eff6ff",
              titleFont: { size: 13 },
              titleColor: "#6783b8",
              titleMarginBottom: 6,
              bodyColor: "#9eaecf",
              bodyFont: { size: 12 },
              bodySpacing: 4,
              padding: 10,
              footerMarginTop: 0,
              displayColors: !1,
            },
          },
          maintainAspectRatio: !1,
        },
      });
    });
  }
  polarAreaChart();
  var doughnutChartData = {
    labels: ["Started", "Inprogress", "Completed", "Cencel"],
    dataUnit: "BTC",
    legend: !1,
    datasets: [
      {
        borderColor: "#fff",
        background: ["#9cabff", "#f4aaa4", "#9785FF", "#E85347"],
        data: [160, 135, 190, 60],
      },
    ],
  };
  function doughnutChart(selector, set_data) {
    var $selector = $(selector || ".doughnut-chart");
    $selector.each(function () {
      for (
        var $self = $(this),
          _self_id = $self.attr("id"),
          _get_data = void 0 === set_data ? eval(_self_id) : set_data,
          selectCanvas = document.getElementById(_self_id).getContext("2d"),
          chart_data = [],
          i = 0;
        i < _get_data.datasets.length;
        i++
      )
        chart_data.push({
          backgroundColor: _get_data.datasets[i].background,
          borderWidth: 2,
          borderColor: _get_data.datasets[i].borderColor,
          hoverBorderColor: _get_data.datasets[i].borderColor,
          data: _get_data.datasets[i].data,
        });
      var chart = new Chart(selectCanvas, {
        type: "doughnut",
        data: { labels: _get_data.labels, datasets: chart_data },
        options: {
          plugins: {
            legend: {
              display: _get_data.legend || !1,
              rtl: NioApp.State.isRTL,
              labels: { boxWidth: 12, padding: 20, color: "#6783b8" },
            },
            tooltip: {
              enabled: !0,
              rtl: NioApp.State.isRTL,
              callbacks: {
                label: function (a) {
                  return "".concat(a.parsed, " ").concat(_get_data.dataUnit);
                },
              },
              backgroundColor: "#eff6ff",
              titleFont: { size: 13 },
              titleColor: "#6783b8",
              titleMarginBottom: 6,
              bodyColor: "#9eaecf",
              bodyFont: { size: 12 },
              bodySpacing: 4,
              padding: 10,
              footerMarginTop: 0,
              displayColors: !1,
            },
          },
          rotation: 1,
          cutoutPercentage: 40,
          maintainAspectRatio: !1,
        },
      });
    });
  }
  doughnutChart();
  var orderOverview = {
    labels: [
      "19 Dec",
      "20 Dec",
      "21 Dec",
      "22 Dec",
      "23 Dec",
      "24 Dec",
      "25 Dec",
      "26 Dec",
      "27 Dec",
      "28 Dec",
      "29 Dec",
      "30 Dec",
      "31 Dec",
      "01 Jan",
    ],
    dataUnit: "USD",
    datasets: [
      {
        label: "Income",
        color: "#8feac5",
        data: [
          2420, 1820, 3e3, 5e3, 2450, 1820, 2700, 5e3, 2400, 2600, 4e3, 2380,
          2120, 1700,
        ],
      },
      {
        label: "Expense",
        color: "#9cabff",
        data: [
          1740, 2500, 1820, 1200, 1600, 2500, 1820, 1200, 1700, 1820, 1400,
          1600, 1930, 2100,
        ],
      },
    ],
  };
  function orderOverviewChart(selector, set_data) {
    var $selector = $(selector || ".order-overview-chart");
    $selector.each(function () {
      for (
        var $self = $(this),
          _self_id = $self.attr("id"),
          _get_data = void 0 === set_data ? eval(_self_id) : set_data,
          _d_legend = void 0 !== _get_data.legend && _get_data.legend,
          selectCanvas = document.getElementById(_self_id).getContext("2d"),
          chart_data = [],
          i = 0;
        i < _get_data.datasets.length;
        i++
      )
        chart_data.push({
          label: _get_data.datasets[i].label,
          data: _get_data.datasets[i].data,
          backgroundColor: _get_data.datasets[i].color,
          borderWidth: 2,
          borderColor: "transparent",
          hoverBorderColor: "transparent",
          borderSkipped: "bottom",
          barPercentage: NioApp.State.asMobile ? 1 : 0.7,
          categoryPercentage: NioApp.State.asMobile ? 1 : 0.7,
        });
      var chart = new Chart(selectCanvas, {
        type: "bar",
        data: { labels: _get_data.labels, datasets: chart_data },
        options: {
          plugins: {
            legend: {
              display: _get_data.legend || !1,
              labels: { boxWidth: 30, padding: 20, color: "#6783b8" },
            },
            tooltip: {
              enabled: !0,
              rtl: NioApp.State.isRTL,
              callbacks: {
                label: function (a) {
                  return "".concat(a.parsed.y, " ").concat(_get_data.dataUnit);
                },
              },
              backgroundColor: "#eff6ff",
              titleFont: { size: 13 },
              titleColor: "#6783b8",
              titleMarginBottom: 6,
              bodyColor: "#9eaecf",
              bodyFont: { size: 12 },
              bodySpacing: 4,
              padding: 10,
              footerMarginTop: 0,
              displayColors: !1,
            },
          },
          maintainAspectRatio: !1,
          scales: {
            y: {
              display: !0,
              stacked: _get_data.stacked || !1,
              position: NioApp.State.isRTL ? "right" : "left",
              ticks: {
                beginAtZero: !0,
                font: { size: 11 },
                color: "#9eaecf",
                padding: 10,
                callback: function (a, t, e) {
                  return "$ " + a;
                },
                min: 100,
                max: 5e3,
                stepSize: 1200,
              },
              grid: {
                color: NioApp.hexRGB("#526484", 0.2),
                tickLength: 0,
                zeroLineColor: NioApp.hexRGB("#526484", 0.2),
                drawTicks: !1,
              },
            },
            x: {
              display: !0,
              stacked: _get_data.stacked || !1,
              ticks: {
                font: { size: 9 },
                color: "#9eaecf",
                source: "auto",
                padding: 10,
              },
              reverse: NioApp.State.isRTL,
              grid: {
                color: "transparent",
                tickLength: 0,
                zeroLineColor: "transparent",
                drawTicks: !1,
              },
            },
          },
        },
      });
    });
  }
  NioApp.coms.docReady.push(function () {
    orderOverviewChart();
  });
  var analyticAuData = {
    labels: [
      "01 Jan",
      "02 Jan",
      "03 Jan",
      "04 Jan",
      "05 Jan",
      "06 Jan",
      "07 Jan",
      "08 Jan",
      "09 Jan",
      "10 Jan",
      "11 Jan",
      "12 Jan",
      "13 Jan",
      "14 Jan",
      "15 Jan",
      "16 Jan",
      "17 Jan",
      "18 Jan",
      "19 Jan",
      "20 Jan",
      "21 Jan",
      "22 Jan",
      "23 Jan",
      "24 Jan",
      "25 Jan",
      "26 Jan",
      "27 Jan",
      "28 Jan",
      "29 Jan",
      "30 Jan",
    ],
    dataUnit: "People",
    lineTension: 0.1,
    datasets: [
      {
        label: "Active Customer",
        color: "#9cabff",
        background: "#9cabff",
        data: [
          1110, 1220, 1310, 980, 900, 770, 1060, 830, 690, 730, 790, 950, 1100,
          800, 1250, 850, 950, 450, 900, 1e3, 1200, 1250, 900, 950, 1300, 1200,
          1250, 650, 950, 750,
        ],
      },
    ],
  };
  function analyticsAu(selector, set_data) {
    var $selector = $(selector || ".analytics-au-chart");
    $selector.each(function () {
      for (
        var $self = $(this),
          _self_id = $self.attr("id"),
          _get_data = void 0 === set_data ? eval(_self_id) : set_data,
          selectCanvas = document.getElementById(_self_id).getContext("2d"),
          chart_data = [],
          i = 0;
        i < _get_data.datasets.length;
        i++
      )
        chart_data.push({
          label: _get_data.datasets[i].label,
          tension: _get_data.lineTension,
          backgroundColor: _get_data.datasets[i].background,
          borderWidth: 2,
          borderColor: _get_data.datasets[i].color,
          data: _get_data.datasets[i].data,
          barPercentage: 0.7,
          categoryPercentage: 0.7,
        });
      var chart = new Chart(selectCanvas, {
        type: "bar",
        data: { labels: _get_data.labels, datasets: chart_data },
        options: {
          plugins: {
            legend: {
              display: _get_data.legend || !1,
              labels: { boxWidth: 12, padding: 20, color: "#6783b8" },
            },
            tooltip: {
              enabled: !0,
              rtl: NioApp.State.isRTL,
              callbacks: {
                title: function () {
                  return !1;
                },
                label: function (a) {
                  return "".concat(a.parsed.y, " ").concat(_get_data.dataUnit);
                },
              },
              backgroundColor: "#eff6ff",
              titleFont: { size: 11 },
              titleColor: "#6783b8",
              titleMarginBottom: 6,
              bodyColor: "#9eaecf",
              bodyFont: { size: 9 },
              bodySpacing: 4,
              padding: 6,
              footerMarginTop: 0,
              displayColors: !1,
            },
          },
          maintainAspectRatio: !1,
          scales: {
            y: {
              display: !0,
              position: NioApp.State.isRTL ? "right" : "left",
              ticks: {
                beginAtZero: !1,
                font: { size: 12 },
                color: "#9eaecf",
                padding: 0,
                display: !1,
                stepSize: 300,
              },
              grid: {
                color: NioApp.hexRGB("#526484", 0.2),
                tickLength: 0,
                zeroLineColor: NioApp.hexRGB("#526484", 0.2),
                drawTicks: !1,
              },
            },
            x: {
              display: !1,
              ticks: {
                font: { size: 12 },
                color: "#9eaecf",
                source: "auto",
                padding: 0,
              },
              reverse: NioApp.State.isRTL,
              grid: {
                color: "transparent",
                tickLength: 0,
                zeroLineColor: "transparent",
                offset: !0,
                drawTicks: !1,
              },
            },
          },
        },
      });
    });
  }
  NioApp.coms.docReady.push(function () {
    analyticsAu();
  });
  var analyticOvData = {
    labels: [
      "01 Jan",
      "02 Jan",
      "03 Jan",
      "04 Jan",
      "05 Jan",
      "06 Jan",
      "07 Jan",
      "08 Jan",
      "09 Jan",
      "10 Jan",
      "11 Jan",
      "12 Jan",
      "13 Jan",
      "14 Jan",
      "15 Jan",
      "16 Jan",
      "17 Jan",
      "18 Jan",
      "19 Jan",
      "20 Jan",
      "21 Jan",
      "22 Jan",
      "23 Jan",
      "24 Jan",
      "25 Jan",
      "26 Jan",
      "27 Jan",
      "28 Jan",
      "29 Jan",
      "30 Jan",
    ],
    dataUnit: "People",
    lineTension: 0.1,
    datasets: [
      {
        label: "Current Month",
        color: "#c4cefe",
        dash: [5, 5],
        background: "transparent",
        data: [
          3910, 4420, 4110, 5180, 4400, 5170, 6460, 8830, 5290, 5430, 4690,
          4350, 4600, 5200, 5650, 6850, 6950, 4150, 4300, 6e3, 6800, 2250, 6900,
          7950, 6900, 4200, 6250, 7650, 8950, 9750,
        ],
      },
      {
        label: "Current Month",
        color: "#798bff",
        dash: [0, 0],
        background: NioApp.hexRGB("#798bff", 0.15),
        data: [
          4310, 4720, 4810, 5880, 4950, 5670, 6660, 4830, 5590, 5730, 4790,
          4950, 6500, 3900, 5950, 7850, 5950, 4450, 4900, 8e3, 7200, 7250, 7900,
          8950, 6300, 7200, 7250, 7650, 6950, 4750,
        ],
      },
    ],
  };
  function analyticsLineLarge(selector, set_data) {
    var $selector = $(selector || ".analytics-line-large");
    $selector.each(function () {
      for (
        var $self = $(this),
          _self_id = $self.attr("id"),
          _get_data = void 0 === set_data ? eval(_self_id) : set_data,
          selectCanvas = document.getElementById(_self_id).getContext("2d"),
          chart_data = [],
          i = 0;
        i < _get_data.datasets.length;
        i++
      )
        chart_data.push({
          label: _get_data.datasets[i].label,
          tension: _get_data.lineTension,
          backgroundColor: _get_data.datasets[i].background,
          fill: !0,
          borderWidth: 2,
          borderDash: _get_data.datasets[i].dash,
          borderColor: _get_data.datasets[i].color,
          pointBorderColor: "transparent",
          pointBackgroundColor: "transparent",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: _get_data.datasets[i].color,
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 2,
          pointRadius: 4,
          pointHitRadius: 4,
          data: _get_data.datasets[i].data,
        });
      var chart = new Chart(selectCanvas, {
        type: "line",
        data: { labels: _get_data.labels, datasets: chart_data },
        options: {
          plugins: {
            legend: {
              display: _get_data.legend || !1,
              labels: { boxWidth: 12, padding: 20, color: "#6783b8" },
            },
            tooltip: {
              enabled: !0,
              rtl: NioApp.State.isRTL,
              callbacks: {
                label: function (a) {
                  return "".concat(a.parsed.y, " ").concat(_get_data.dataUnit);
                },
              },
              backgroundColor: "#fff",
              borderColor: "#eff6ff",
              borderWidth: 2,
              titleFont: { size: 13 },
              titleColor: "#6783b8",
              titleMarginBottom: 6,
              bodyColor: "#9eaecf",
              bodyFont: { size: 12 },
              bodySpacing: 4,
              padding: 10,
              footerMarginTop: 0,
              displayColors: !1,
            },
          },
          maintainAspectRatio: !1,
          scales: {
            y: {
              display: !0,
              position: NioApp.State.isRTL ? "right" : "left",
              ticks: {
                beginAtZero: !0,
                font: { size: 12 },
                color: "#9eaecf",
                padding: 8,
                stepSize: 2400,
              },
              grid: {
                color: NioApp.hexRGB("#526484", 0.2),
                tickLength: 0,
                zeroLineColor: NioApp.hexRGB("#526484", 0.2),
                drawTicks: !1,
              },
            },
            x: {
              display: !1,
              ticks: {
                font: { size: 12 },
                color: "#9eaecf",
                source: "auto",
                padding: 0,
              },
              reverse: NioApp.State.isRTL,
              grid: {
                color: "transparent",
                tickLength: 0,
                zeroLineColor: "transparent",
                offset: !0,
                drawTicks: !1,
              },
            },
          },
        },
      });
    });
  }
  NioApp.coms.docReady.push(function () {
    analyticsLineLarge();
  });
  var PaymentDoughnutData = {
      labels: ["Paid", "Due", "Invoice", "Estimate"],
      dataUnit: "$",
      legend: !1,
      datasets: [
        {
          borderColor: "#fff",
          background: ["#798bff", "#b8acff", "#ffa9ce", "#f9db7b"],
          data: [4305, 859, 482, 138],
        },
      ],
    },
    TrafficChannelDoughnutData = {
      labels: ["Organic Search", "Social Media", "Referrals", "Others"],
      dataUnit: "People",
      legend: !1,
      datasets: [
        {
          borderColor: "#fff",
          background: ["#798bff", "#b8acff", "#ffa9ce", "#f9db7b"],
          data: [4305, 859, 482, 138],
        },
      ],
    };
  function analyticsDoughnut(selector, set_data) {
    var $selector = $(selector || ".analytics-doughnut");
    $selector.each(function () {
      for (
        var $self = $(this),
          _self_id = $self.attr("id"),
          _get_data = void 0 === set_data ? eval(_self_id) : set_data,
          selectCanvas = document.getElementById(_self_id).getContext("2d"),
          chart_data = [],
          i = 0;
        i < _get_data.datasets.length;
        i++
      )
        chart_data.push({
          backgroundColor: _get_data.datasets[i].background,
          borderWidth: 2,
          borderColor: _get_data.datasets[i].borderColor,
          hoverBorderColor: _get_data.datasets[i].borderColor,
          data: _get_data.datasets[i].data,
        });
      var chart = new Chart(selectCanvas, {
        type: "doughnut",
        data: { labels: _get_data.labels, datasets: chart_data },
        options: {
          plugins: {
            legend: {
              display: _get_data.legend || !1,
              labels: { boxWidth: 12, padding: 20, color: "#6783b8" },
            },
            tooltip: {
              enabled: !0,
              rtl: NioApp.State.isRTL,
              callbacks: {
                label: function (a) {
                  return "".concat(a.parsed, " ").concat(_get_data.dataUnit);
                },
              },
              backgroundColor: "#fff",
              borderColor: "#eff6ff",
              borderWidth: 2,
              titleFont: { size: 13 },
              titleColor: "#6783b8",
              titleMarginBottom: 6,
              bodyColor: "#9eaecf",
              bodyFont: { size: 12 },
              bodySpacing: 4,
              padding: 10,
              footerMarginTop: 0,
              displayColors: !1,
            },
          },
          rotation: -1.5,
          cutoutPercentage: 70,
          maintainAspectRatio: !1,
        },
      });
    });
  }
  NioApp.coms.docReady.push(function () {
    analyticsDoughnut();
  });
  var OrganicSearchData = {
      labels: [
        "01 Jan",
        "02 Jan",
        "03 Jan",
        "04 Jan",
        "05 Jan",
        "06 Jan",
        "07 Jan",
        "08 Jan",
        "09 Jan",
        "10 Jan",
        "11 Jan",
        "12 Jan",
      ],
      dataUnit: "People",
      lineTension: 0.1,
      datasets: [
        {
          label: "Organic Search",
          color: "#798bff",
          background: NioApp.hexRGB("#798bff", 0.25),
          data: [110, 80, 125, 65, 95, 75, 90, 110, 80, 125, 70, 95],
        },
      ],
    },
    SocialMediaData = {
      labels: [
        "01 Jan",
        "02 Jan",
        "03 Jan",
        "04 Jan",
        "05 Jan",
        "06 Jan",
        "07 Jan",
        "08 Jan",
        "09 Jan",
        "10 Jan",
        "11 Jan",
        "12 Jan",
      ],
      dataUnit: "People",
      lineTension: 0.1,
      datasets: [
        {
          label: "Social Media",
          color: "#b8acff",
          background: NioApp.hexRGB("#b8acff", 0.25),
          data: [110, 80, 125, 65, 95, 75, 90, 110, 80, 125, 70, 95],
        },
      ],
    },
    ReferralsData = {
      labels: [
        "01 Jan",
        "02 Jan",
        "03 Jan",
        "04 Jan",
        "05 Jan",
        "06 Jan",
        "07 Jan",
        "08 Jan",
        "09 Jan",
        "10 Jan",
        "11 Jan",
        "12 Jan",
      ],
      dataUnit: "People",
      lineTension: 0.1,
      datasets: [
        {
          label: "Referrals",
          color: "#ffa9ce",
          background: NioApp.hexRGB("#ffa9ce", 0.25),
          data: [110, 80, 125, 65, 95, 75, 90, 110, 80, 125, 70, 95],
        },
      ],
    },
    OthersData = {
      labels: [
        "01 Jan",
        "02 Jan",
        "03 Jan",
        "04 Jan",
        "05 Jan",
        "06 Jan",
        "07 Jan",
        "08 Jan",
        "09 Jan",
        "10 Jan",
        "11 Jan",
        "12 Jan",
      ],
      dataUnit: "People",
      lineTension: 0.1,
      datasets: [
        {
          label: "Others",
          color: "#f9db7b",
          background: NioApp.hexRGB("#f9db7b", 0.25),
          data: [110, 80, 125, 65, 95, 75, 90, 110, 80, 125, 70, 95],
        },
      ],
    };
  function analyticsLineSmall(selector, set_data) {
    var $selector = $(selector || ".analytics-line-small");
    $selector.each(function () {
      for (
        var $self = $(this),
          _self_id = $self.attr("id"),
          _get_data = void 0 === set_data ? eval(_self_id) : set_data,
          selectCanvas = document.getElementById(_self_id).getContext("2d"),
          chart_data = [],
          i = 0;
        i < _get_data.datasets.length;
        i++
      )
        chart_data.push({
          label: _get_data.datasets[i].label,
          tension: _get_data.lineTension,
          backgroundColor: _get_data.datasets[i].background,
          fill: !0,
          borderWidth: 2,
          borderColor: _get_data.datasets[i].color,
          pointBorderColor: "transparent",
          pointBackgroundColor: "transparent",
          pointHoverBackgroundColor: "#fff",
          pointHoverBorderColor: _get_data.datasets[i].color,
          pointBorderWidth: 2,
          pointHoverRadius: 4,
          pointHoverBorderWidth: 2,
          pointRadius: 4,
          pointHitRadius: 4,
          data: _get_data.datasets[i].data,
        });
      var chart = new Chart(selectCanvas, {
        type: "line",
        data: { labels: _get_data.labels, datasets: chart_data },
        options: {
          plugins: {
            legend: {
              display: _get_data.legend || !1,
              labels: { boxWidth: 12, padding: 20, color: "#6783b8" },
            },
            tooltip: {
              enabled: !0,
              rtl: NioApp.State.isRTL,
              callbacks: {
                title: function () {
                  return !1;
                },
                label: function (a) {
                  return "".concat(a.parsed.y, " ").concat(_get_data.dataUnit);
                },
              },
              backgroundColor: "#eff6ff",
              titleFont: { size: 11 },
              titleColor: "#6783b8",
              titleMarginBottom: 6,
              bodyColor: "#9eaecf",
              bodyFont: { size: 9 },
              bodySpacing: 4,
              padding: 6,
              footerMarginTop: 0,
              displayColors: !1,
            },
          },
          maintainAspectRatio: !1,
          scales: {
            y: {
              display: !1,
              ticks: {
                beginAtZero: !1,
                font: { size: 12 },
                color: "#9eaecf",
                padding: 0,
              },
              grid: {
                color: NioApp.hexRGB("#526484", 0.2),
                tickLength: 0,
                zeroLineColor: NioApp.hexRGB("#526484", 0.2),
                drawTicks: !1,
              },
            },
            x: {
              display: !1,
              ticks: {
                font: { size: 12 },
                color: "#9eaecf",
                source: "auto",
                padding: 0,
              },
              reverse: NioApp.State.isRTL,
              grid: {
                color: "transparent",
                tickLength: 0,
                zeroLineColor: NioApp.hexRGB("#526484", 0.2),
                offset: !0,
                drawTicks: !1,
              },
            },
          },
        },
      });
    });
  }
  NioApp.coms.docReady.push(function () {
    analyticsLineSmall();
  });
})(NioApp, jQuery);
