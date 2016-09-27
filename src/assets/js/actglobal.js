
function jhwDrawActivityGlobalGraph(api_data) {

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
		var ts_moment = moment.unix(api_data[i].start_of_day);
		window.jhwActivityGlobalGraphConfig.data.labels.push(ts_moment.toDate());
		dataset.data.push({
			"x": ts_moment.format('YYYY-MM-DD HH:mm'),
			"y": api_data[i].num_changes
		});
	}

	// populate dataset
	window.jhwActivityGlobalGraphConfig.data.datasets.push(dataset);

	// update graph
	window.jhwActivityGlobalGraph.update();
}

function jhwActivityGlobalGraphUpdate() {
	// get
	jhaGetStatsGlobal(
		"activity",
		"day"
	)
	.done(
		function(data, textStatus, jqXHR) {
			jhwDrawActivityGlobalGraph(data);
		}
	)
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhaGetStatsGlobal fail", jqXHR, textStatus, errorThrown);
	});
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

	jhwActivityGlobalGraphUpdate();
}

function jhwSetupActivityGlobal() {
	// init api
	jhaSetApiUrl();

	jhwSetupActivityGlobalGraph();
}
