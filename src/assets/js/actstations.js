
function jhwDrawActivityStationsGraph(api_data) {

	// reset graph data
	window.jhwActivityStationsGraphConfig.data.labels.length = 0
	window.jhwActivityStationsGraphConfig.data.datasets.length = 0

	// time key
	t = window.ActivityStationsConfig["timename"]

	// prepare dataset
	var dataset = {
		label: "Evénements",
		data: [],
		fill: false,
		lineTension: 0,
		borderColor: jhwHslColor(jhwGetHue(0), 1),
		backgroundColor: jhwHslColor(jhwGetHue(0), 0.3),
		borderWidth: 1,
		pointHitRadius: 5,
		pointRadius: 0,
	};

	// populate dataset
	for (var i = 0; i < api_data.length; i++) {
		var ts_moment = moment.unix(api_data[i][t]);
		window.jhwActivityStationsGraphConfig.data.labels.push(ts_moment.toDate());
		dataset.data.push({
			"x": ts_moment.format('YYYY-MM-DD HH:mm'),
			"y": api_data[i].num_changes
		});
	}

	// populate dataset
	window.jhwActivityStationsGraphConfig.data.datasets.push(dataset);

	window.jhwActivityStationsGraph.update()
}

function jhwSetupActivityStationsGraph() {

	// init ActivityStations graph config
	window.jhwActivityStationsGraphConfig = {
		type: 'line',
		data: {
			labels: [], // Date Objects
			datasets: []
		},
		options: {
			hover: {
				mode: 'label',
			},
			title: {
				display:true,
				text: 'Nombre de dépôts/retraits de vélos pour le contrat sélectionné'
			},
			scales: {
				xAxes: [{
					type: "time",
					time: {
						format: 'YYYY-MM-DD HH:mm',
						unit: "month",
						displayFormats: {
							month: 'MMM YYYY'
						},
						tooltipFormat: 'D MMM YYYY',
					},
				}, ],
				yAxes: [{
					scaleLabel: {
						display: false,
					},
					ticks: {
						beginAtZero: true,
					}
				}]
			},
		}
	};

	// create ActivityStations graph
	window.jhwActivityStationsGraph = new Chart(
		$('#graph_activity_stations'),
		window.jhwActivityStationsGraphConfig
	);
}

function jhwActivityStationsGraphPeriodCallback() {

	// time key
	switch(window.ActivityStationsConfig.period) {
		case "day":
		case "week":
		case "month":
		case "year":
			window.ActivityStationsConfig["timename"] = "start_of_" + window.ActivityStationsConfig.period
			break;
	}

	// cache
	if (window.ActivityStationsConfig.contract_id in window.ActivityStationsConfig.data) {
		c = window.ActivityStationsConfig.data[window.ActivityStationsConfig.contract_id]
		if (window.ActivityStationsConfig.station_number in c) {
			s = c[window.ActivityStationsConfig.station_number]
			if (window.ActivityStationsConfig.period in s) {
				jhwDrawActivityStationsGraph(s[window.ActivityStationsConfig.period])
				return
			}
		} else {
			c[window.ActivityStationsConfig.station_number]	= {}
		}
	} else {
		window.ActivityStationsConfig.data[window.ActivityStationsConfig.contract_id] = {}
	}

	// get
	jhaGetStatsStation(
		"activity",
		window.ActivityStationsConfig.period,
		window.ActivityStationsConfig.contract_id,
		window.ActivityStationsConfig.station_number
	)
	.done(
		function(data, textStatus, jqXHR) {
			window.ActivityStationsConfig.data[window.ActivityStationsConfig.contract_id][window.ActivityStationsConfig.period] = data
			jhwDrawActivityStationsGraph(data);
		}
	)
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhaGetStatsGlobal fail", jqXHR, textStatus, errorThrown);
	});
}

function jhwSetupActivityStations() {
	// init api
	jhaSetApiUrl();

	window.ActivityStationsConfig = {
		"period": "day",
		"data": {}
	}

	jhwSetupActivityStationsGraph();

	// link period buttons to date in config
	var days = $("a[period]").each(function(i, e) {
		$(e).click(
			$(e).attr("period"),
			function (event) {
				window.ActivityStationsConfig["period"] = event.data
				jhwActivityStationsGraphPeriodCallback()
			}
		);
	});

	// init selection components
	jhwSelectContractStationSetup(
		$('#select_contract'),
		$('#select_station'),
		function (contract_id, station_number) {
			window.ActivityStationsConfig.contract_id = contract_id;
			window.ActivityStationsConfig.station_number = station_number;
			jhwActivityStationsGraphPeriodCallback()
		}
	);
}
