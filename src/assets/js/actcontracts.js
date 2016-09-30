
function jhwDrawActivityContractsGraph(api_data) {

	// reset graph data
	window.jhwActivityContractsGraphConfig.data.labels.length = 0
	window.jhwActivityContractsGraphConfig.data.datasets.length = 0

	// time key
	t = window.ActivityContractsConfig["timename"]

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
		window.jhwActivityContractsGraphConfig.data.labels.push(ts_moment.toDate());
		dataset.data.push({
			"x": ts_moment.format('YYYY-MM-DD HH:mm'),
			"y": api_data[i].num_changes
		});
	}

	// populate dataset
	window.jhwActivityContractsGraphConfig.data.datasets.push(dataset);

	window.jhwActivityContractsGraph.update()
}

function jhwSetupActivityContractsGraph() {

	// init ActivityContracts graph config
	window.jhwActivityContractsGraphConfig = {
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

	// create ActivityContracts graph
	window.jhwActivityContractsGraph = new Chart(
		$('#graph_activity_contracts'),
		window.jhwActivityContractsGraphConfig
	);
}

function jhwActivityContractsGraphPeriodCallback() {

	// time key
	switch(window.ActivityContractsConfig.period) {
		case "day":
		case "week":
		case "month":
		case "year":
			window.ActivityContractsConfig["timename"] = "start_of_" + window.ActivityContractsConfig.period
			break;
	}

	// cache
	if (window.ActivityContractsConfig.contract_id in window.ActivityContractsConfig.data) {
		c = window.ActivityContractsConfig.data[window.ActivityContractsConfig.contract_id]
		if (window.ActivityContractsConfig.period in c) {
			jhwDrawActivityContractsGraph(c[window.ActivityContractsConfig.period])
			return
		}
	} else {
		window.ActivityContractsConfig.data[window.ActivityContractsConfig.contract_id] = {}
	}

	// get
	jhaGetStatsContract(
		"activity",
		window.ActivityContractsConfig.period,
		window.ActivityContractsConfig.contract_id
	)
	.done(
		function(data, textStatus, jqXHR) {
			window.ActivityContractsConfig.data[window.ActivityContractsConfig.contract_id][window.ActivityContractsConfig.period] = data
			jhwDrawActivityContractsGraph(data);
		}
	)
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhaGetStatsGlobal fail", jqXHR, textStatus, errorThrown);
	});
}

function jhwSetupActivityContracts() {
	// init api
	jhaSetApiUrl();

	window.ActivityContractsConfig = {
		"period": "day",
		"data": {}
	}

	jhwSetupActivityContractsGraph();

	// link period buttons to date in config
	var days = $("a[period]").each(function(i, e) {
		$(e).click(
			$(e).attr("period"),
			function (event) {
				window.ActivityContractsConfig["period"] = event.data
				jhwActivityContractsGraphPeriodCallback()
			}
		);
	});

	// init selection components
	jhwSelectContractStationSetup(
		$('#select_contract'),
		null,
		function (contract_id, station_number) {
			window.ActivityContractsConfig.contract_id = contract_id;
			jhwActivityContractsGraphPeriodCallback()
		}
	);
}
