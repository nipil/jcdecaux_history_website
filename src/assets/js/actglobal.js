
function jhwDrawActivityGlobalGraph(api_data) {

	// reset graph data
	window.jhwActivityGlobalGraphConfig.data.labels.length = 0
	window.jhwActivityGlobalGraphConfig.data.datasets.length = 0

	// time key
	t = window.ActivityGlobalConfig["timename"]

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
		window.jhwActivityGlobalGraphConfig.data.labels.push(ts_moment.toDate());
		dataset.data.push({
			"x": ts_moment.format('YYYY-MM-DD HH:mm'),
			"y": api_data[i].num_changes
		});
	}

	// populate dataset
	window.jhwActivityGlobalGraphConfig.data.datasets.push(dataset);

	window.jhwActivityGlobalGraph.update()
}

function jhwSetupActivityGlobalGraph() {

	// init ActivityGlobal graph config
	window.jhwActivityGlobalGraphConfig = {
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
				text: 'Nombre de dépôts/retraits de vélos sur l\'ensemble des contrats JCDecaux'
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

	// create ActivityGlobal graph
	window.jhwActivityGlobalGraph = new Chart(
		$('#graph_activity_global'),
		window.jhwActivityGlobalGraphConfig
	);
}

function jhwActivityGlobalGraphPeriodCallback() {

	// time key
	switch(window.ActivityGlobalConfig.period) {
		case "day":
		case "week":
		case "month":
		case "year":
			window.ActivityGlobalConfig["timename"] = "start_of_" + window.ActivityGlobalConfig.period
			break;
	}

	// cache
	if (window.ActivityGlobalConfig.period in window.ActivityGlobalConfig.data) {
		jhwDrawActivityGlobalGraph(window.ActivityGlobalConfig.data[window.ActivityGlobalConfig.period])
		return
	}

	// get
	jhaGetStatsGlobal(
		"activity",
		window.ActivityGlobalConfig.period
	)
	.done(
		function(data, textStatus, jqXHR) {
			window.ActivityGlobalConfig.data[window.ActivityGlobalConfig.period] = data
			jhwDrawActivityGlobalGraph(data);
		}
	)
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhaGetStatsGlobal fail", jqXHR, textStatus, errorThrown);
	});
}

function jhwSetupActivityGlobal() {
	// init api
	jhaSetApiUrl();

	window.ActivityGlobalConfig = {
		"period": "day",
		"data": {}
	}

	jhwSetupActivityGlobalGraph();

	// link period buttons to date in config
	var days = $("a[period]").each(function(i, e) {
		$(e).click(
			$(e).attr("period"),
			function (event) {
				window.ActivityGlobalConfig["period"] = event.data
				jhwActivityGlobalGraphPeriodCallback()
			}
		);
	});

	jhwActivityGlobalGraphPeriodCallback()
}
