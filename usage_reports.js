(function() {
  'use strict';


  class UsageReporter {
    constructor() {
      this.r = "";

      // let yesterday = new Date;
      // yesterday.setDate(now.getDate() - 1);

      // let past_week = new Date;
      // past_week.setDate(now.getDate() - 7);

      // let past_month = new Date;
      // past_month.setDate(now.getDate() - 30);

    }

    

    plotUsage(data){
      this.r = data;
      console.log("usage=",data)

      var report = {
        durations: [],
        labels: [],
        total_time: 0,
        total_time_formated: ''
      };

      for (var i = 0; i < data["data"]["chairUsageByLegPosition"].length; i++){
        var value = data["data"]["chairUsageByLegPosition"][i];
        if (value["leftLegPos"]["name"] == "Up" && value["rightLegPos"]["name"] == "Up"){
          report.labels.push("seated");
          report.durations.push(value["stateDuration"]);

        }else if (value["leftLegPos"]["name"] == "Down" && value["rightLegPos"]["name"] == "Up"){
          report.labels.push("leftFlamingo");
          report.durations.push(value["stateDuration"]);
        
        }else if (value["leftLegPos"]["name"] == "Up" && value["rightLegPos"]["name"] == "Down"){
          report.labels.push("rightFlamingo");
          report.durations.push(value["stateDuration"]);
        }else if (value["leftLegPos"]["name"] == "Down" && value["rightLegPos"]["name"] == "Down"){
          report.labels.push("Standing");
          report.durations.push(value["stateDuration"]);
        }
      }

      if(report.durations.length > 0){
        const reducer = (previousValue, currentValue) => previousValue + currentValue;
        report.total_time = report.durations.reduce(reducer);
        report.total_time_formated = new Date(report.total_time * 1000).toISOString().substr(11, 8);
      }
      

      var d3 = Plotly.d3
      var format = d3.format(',02f')

      var text = report.durations.map((v, i) => `
        ${report.labels[i]}<br>
        ${format(v)} min<br>
        `)

      var colors = [];
      var colorMap = {
        // should contain a map of category -> color for every category
        seated: '#003f5c',
        leftFlamingo: '#7a5195',
        rightFlamingo: '#ef5675',
        Standing: '#ffa600'
      }

      for (var i = 0; i < report.labels.length; i++) {
        colors.push(colorMap[report.labels[i]]);
      }

      var data = [{
        values: report.durations,
        labels: report.labels,
        type: 'pie',
        sort:false,
        direction:'clockwise',
        text: text,
        hoverinfo: 'text',
        textinfo: 'percent',
        marker: {
          colors: colors
        },
      }];

      var layout = {
        // width: 100%
        paper_bgcolor: "rgba(0,0,0,0)",
        legend: {
          font:{"color":'#FFFFFF',family: 'Old Standard TT, serif',},

        },
        sort:false,
        direction:'clockwise',
        ascending:false,
        title: {
          font:{"color":'#FFFFFF',
            family: 'Old Standard TT, serif',
            size: 18,},
          text: "Usage Report -- total usage time= "+ report.total_time_formated
        }
      };

      var config = {responsive: true}


      Plotly.newPlot('usagePlot', data, layout, config);

      var myPlot = document.getElementById('piechart');

      
      return report;
      
    }

    plotTimeUsage(data){
      console.log("time usage = ", data)
      
      var list = [];//[['Activity', 'Category', 'Start Time', 'End Time']];

      var colorMap = {
        // should contain a map of category -> color for every category
        seated: '#003f5c',
        leftFlamingo: '#7a5195',
        rightFlamingo: '#ef5675',
        Standing: '#ffa600'
      }

      for (var i = 0; i < data['data']['chairEvent'].length; i++){
        var value = data["data"]["chairEvent"][i];
        var type = ""

        if(value["mode"]["name"] == "Away"){
          continue;
        }
        if (value["leftLegPos"]["name"] == "Up" && value["rightLegPos"]["name"] == "Up"){
          type = "seated";

        }else if (value["leftLegPos"]["name"] == "Down" && value["rightLegPos"]["name"] == "Up"){
          type = "leftFlamingo";
        
        }else if (value["leftLegPos"]["name"] == "Up" && value["rightLegPos"]["name"] == "Down"){
          type = "rightFlamingo";
        }else if (value["leftLegPos"]["name"] == "Down" && value["rightLegPos"]["name"] == "Down"){
          type = "Standing";
        }

        // var typeName =  type + " - " + value["mode"]["name"];
        var activity = value["mode"]["name"]
        var event_start = new Date(Date.parse(value["eventTime"]["value"]));
        event_start.setHours(event_start.getHours() + 3);
        var event_end;

        if(i < data['data']['chairEvent'].length - 1){
          event_end = new Date(Date.parse(data["data"]["chairEvent"][i+1]["eventTime"]["value"]))
          event_end.setHours(event_end.getHours() + 3);

        }else{
          event_end = new Date();
        }

        list.push([activity, type, colorMap[type] , event_start, event_end])
      }

      console.log(list)
      
      if(list.Length > 0){
        google.charts.load("current", {packages:["timeline"]});
        google.charts.setOnLoadCallback(drawChart);
        function drawChart() {

          var container = document.getElementById('chart_div');
          var chart = new google.visualization.Timeline(container);
          var dataTable = google.visualization.arrayToDataTable(list);
          var dataTable = new google.visualization.DataTable();
          dataTable.addColumn({ type: 'string', id: 'Position' });
          dataTable.addColumn({ type: 'string', id: 'Name' });
          dataTable.addColumn({ type: 'string', role: 'style' });
          dataTable.addColumn({ type: 'date', id: 'Start' });
          dataTable.addColumn({ type: 'date', id: 'End' });
          dataTable.addRows(list);

          var date_first_event = dataTable.getValue(0, 3);
          var date_last_event = dataTable.getValue(dataTable.getNumberOfRows() - 1, 3);
          var Difference_In_Days = (date_last_event - date_first_event) / (1000 * 3600 * 24.0);
          console.log("Diff = ", Difference_In_Days)

          var options = {
              timeline: { 
                  showBarLabels: false,
                  groupByRowLabel: true,
                  rowLabelStyle: {
                      fontName: 'Roboto Condensed',
                      fontSize: 14,
                      color: '#333333'
                  },
                  barLabelStyle: {
                      fontName: 'Roboto Condensed',
                      fontSize: 14,
                      color: 'white'
                  }
              },                          
              avoidOverlappingGridLines: true,
              // height: chartHeight,
              width: Math.floor(12000*Difference_In_Days),
              // colors: colors,
              hAxis: {
                 format: 'HH:mm',
              }
          };



          google.visualization.events.addListener(chart, 'ready', function () {
            var labels = container.getElementsByTagName('text');
            Array.prototype.forEach.call(labels, function(label) {
              if (label.getAttribute('text-anchor') === 'middle') {
                label.setAttribute('fill', '#ffffff');
              }
            });
          });

          chart.draw(dataTable, options);


        }
      }
      return list;

    }

    requestTimeUsage(userEmail,fromDate,toDate){
      var query = `query
            {
              chairEvent(pageCapacity:300, pageNumber: 0){
                chairUser {
                  email(like: "$userEmail")
                }
                chair {
                  name
                }

                eventTime (from: "$fromDate", to: "$toDate", order: ASC_1)
                leftLegPos { name }
                rightLegPos { name }
                mode { name }
              }
            }`

      query = query.replace("$userEmail", userEmail)
      query = query.replace("$fromDate", fromDate)
      query = query.replace("$toDate", toDate)
      console.log(query)

      return fetch("https://movably.fielden.com.au/api/graphql", {
        method: 'POST',
        headers: {
          "API-KEY":"f3162d2f-e798-4b5e-ae59-9540d69dc56c",
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          "Time-Zone":Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        body: JSON.stringify({
          query,
          // variables: { },
        })
      })
        .then(r => r.json())
        .then(data => this.plotTimeUsage(data))

    }


    request(userEmail,fromDate,toDate) {

      console.log("reporting usage...")

      var query = `query
            {
              chairUsageByLegPosition {
                key {
                  email(like: "$userEmail")
                }
                leftLegPos {
                  name
                }
                rightLegPos {
                  name
                }

                count
                stateDuration
                eventTimeFrom(from: "$fromDate") @skip(if: false)
                eventTimeTo(from: "$toDate") @skip(if: false)
              }
            }`

      query = query.replace("$userEmail", userEmail)
      query = query.replace("$fromDate", fromDate)
      query = query.replace("$toDate", toDate)
      console.log(query)

      return fetch("https://movably.fielden.com.au/api/graphql", {
        method: 'POST',
        headers: {
          "API-KEY":"f3162d2f-e798-4b5e-ae59-9540d69dc56c",
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          "Time-Zone":Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        body: JSON.stringify({
          query,
          // variables: { },
        })
      })
        .then(r => r.json())
        .then(data => this.plotUsage(data))


    }

    getDailyUsages(userEmail){

      const promises = [];

      let now = new Date;
      this.usageReports = [];
      this.scores = [];

      for(let i = 0; i < 7; i++){
        let start = new Date;
        let end = new Date;

        start.setDate(now.getDate() - i - i);
        end.setDate(now.getDate() - i);

        this.usageReports[i] = []
        this.scores[i] = 0;

        promises.push(this.requestTimeUsage(userEmail, dateToString(start), dateToString(end))
          .then(report => this.usageReports[i] = report)
          .then(report => this.calculateScore(report))
          .then(score => this.scores[i] = score)
          .catch(e => console.log(e)))
      }

      Promise.all(promises)
        .then(() => {
          console.log("ready to plot!!")
        })
        .catch((e) => {
          console.log(e)
        });

    }

    calculateScore(usage){
      let totalScore = 0;

      for(let i = 0; i < usage.length; i++){
        if(usage[i].length == 0){
          continue;
        }
        let duration = (usage[i][4] - usage[i][3])/1000/60;

        if(duration < 3*60){
          totalScore += 3;
        }else{
          totalScore += 1;
        }

      }
      return totalScore;
    }
  }

  window.UsageReporter = new UsageReporter();

})();