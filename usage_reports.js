(function() {
  'use strict';


  class UsageReporter {
    constructor() {
      this.r = "";

    }
    plotUsage(data){
      this.r = data;
      console.log("usage=",data)

      var labels = []
      var durations = []

      for (var i = 0; i < data["data"]["chairUsageByLegPosition"].length; i++){
        var value = data["data"]["chairUsageByLegPosition"][i];
        if (value["leftLegPos"]["name"] == "Up" && value["rightLegPos"]["name"] == "Up"){
          labels.push("seated");
          durations.push(value["stateDuration"]);

        }else if (value["leftLegPos"]["name"] == "Down" && value["rightLegPos"]["name"] == "Up"){
          labels.push("leftFlamingo");
          durations.push(value["stateDuration"]);
        
        }else if (value["leftLegPos"]["name"] == "Up" && value["rightLegPos"]["name"] == "Down"){
          labels.push("rightFlamingo");
          durations.push(value["stateDuration"]);
        }else if (value["leftLegPos"]["name"] == "Down" && value["rightLegPos"]["name"] == "Down"){
          labels.push("Standing");
          durations.push(value["stateDuration"]);
        }
      }

      const reducer = (previousValue, currentValue) => previousValue + currentValue;
      var total_time = durations.reduce(reducer);
      var total_time_formated = new Date(total_time * 1000).toISOString().substr(11, 8);
      

      var d3 = Plotly.d3
      var format = d3.format(',02f')

      var text = durations.map((v, i) => `
        ${labels[i]}<br>
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

      for (var i = 0; i < labels.length; i++) {
        colors.push(colorMap[labels[i]]);
      }

      var data = [{
        values: durations,
        labels: labels,
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
          text: "Usage Report -- total usage time= "+ total_time_formated
        }
      };

      var config = {responsive: true}


      Plotly.newPlot('usagePlot', data, layout, config);

      var myPlot = document.getElementById('piechart');

      // myPlot.on('plotly_click', function(data){
      //   var pts = '';
      //   for(var i=0; i < data.points.length; i++){
      //       pts = 'label(country) = '+ data.points[0].label + '\nvalue(%) = ' + data.points[0].value;
      //   }
      //   console.log("--------")
      //   console.log(data)
      //   // alert('Closest point clicked:\n\n'+pts);
      //   // console.log('Closest point clicked:\n\n'+pts);
      //   data.points[0].value = data.points[0].value + 1;
      //   // console.log(data.points[0].value);
      //   index = data.points[0].i;
      //   myPlot.data[0].values[index] +=1;
      //   Plotly.redraw('piechart');
      // });

      
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


        // var colors = [];
        // var colorMap = {
        //   // should contain a map of category -> color for every category
        //   seated: '#003f5c',
        //   leftFlamingo: '#7a5195',
        //   rightFlamingo: '#ef5675',
        //   Standing: '#ffa600'
        // }

        // for (var i = 0; i < dataTable.getNumberOfRows(); i++) {
        //   colors.push(colorMap[dataTable.getValue(i, 1)]);
        //   console.log(dataTable.getValue(i, 1), colorMap[dataTable.getValue(i, 1)]);
        // }

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

      fetch("https://movably.fielden.com.au/api/graphql", {
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

    //   google.charts.load('current', {
    //   callback: function () {
    //     var container = document.getElementById('chart_div');
    //     var chart = new google.visualization.Timeline(container);

    //     var dataTable = new google.visualization.DataTable();
    //     dataTable.addColumn({type: 'string', id: 'RowLabel'});
    //     dataTable.addColumn({type: 'string', id: 'BarLabel'});
    //     dataTable.addColumn({type: 'date', id: 'Start'});
    //     dataTable.addColumn({type: 'date', id: 'End'});

    //     dataTable.addRows([
    //       ['25 August', 'Kasabian - La Fee Verte', new Date(2016,1,1, 13,37,32), new Date(2016,1,1, 13,43,19)],
    //       ['26 August', 'Test Data 1', new Date(2016,1,1, 13,37,32), new Date(2016,1,1, 13,53,19)],
    //       ['27 August', 'Test Data 2', new Date(2016,1,1, 13,37,32), new Date(2016,1,1, 13,43,19)]
    //     ]);

    //     dataTable.insertColumn(2, {type: 'string', role: 'tooltip', p: {html: true}});

    //     var dateFormat = new google.visualization.DateFormat({
    //       pattern: 'h:mm a'
    //     });

    //     for (var i = 0; i < dataTable.getNumberOfRows(); i++) {
    //       var tooltip = '<div class="ggl-tooltip"><span>' +
    //         dataTable.getValue(i, 1) + '</span></div><div class="ggl-tooltip"><span>' +
    //         dataTable.getValue(i, 0) + '</span>: ' +
    //         dateFormat.formatValue(dataTable.getValue(i, 3)) + ' - ' +
    //         dateFormat.formatValue(dataTable.getValue(i, 4)) + '</div>';

    //       dataTable.setValue(i, 2, tooltip);
    //     }

    //     chart.draw(dataTable, {
    //       tooltip: {
    //         isHtml: true
    //       }
    //     });
    //   },
    //   packages: ['timeline']
    // });

      
      // var userEmail = "raghid.mardini@gmail.com"
      // var fromDate = "2021-10-06 00:0:0"
      // var toDate = "2021-10-06 23:59:59"

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

      fetch("https://movably.fielden.com.au/api/graphql", {
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
  }

  window.UsageReporter = new UsageReporter();

})();