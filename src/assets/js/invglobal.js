
function jhwDrawInventoryGlobalGraph(api_data) {
	// create InventoryGlobal graph
	window.jhwInventoryGlobalGraph = new Chart(
		$('#graph_inventory_global'),
		window.jhwInventoryGlobalGraphConfig
	);

	// prepare dataset
	var dataset_min = {
		label: "Minimum disponible",
		data: [],
		fill: false,
		lineTension: 0,
		borderColor: jhwHslColor(jhwGetHue(0), 1),
		backgroundColor: jhwHslColor(jhwGetHue(0), 0.3),
		borderWidth: 1,
		pointHitRadius: 5,
		pointRadius: 0,
	};
	var dataset_max = {
		label: "Maximum disponible",
		data: [],
		fill: false,
		lineTension: 0,
		borderColor: jhwHslColor(jhwGetHue(1), 1),
		backgroundColor: jhwHslColor(jhwGetHue(1), 0.3),
		borderWidth: 1,
		pointHitRadius: 5,
		pointRadius: 0,
	};
	var dataset_circulation = {
		label: "Maximum en circulation",
		data: [],
		fill: false,
		lineTension: 0,
		borderColor: jhwHslColor(jhwGetHue(2), 1),
		backgroundColor: jhwHslColor(jhwGetHue(2), 0.3),
		borderWidth: 1,
		pointHitRadius: 5,
		pointRadius: 0,
	};

	// populate dataset
	for (var i = 0; i < api_data.length; i++) {
		var ts_moment = moment.unix(api_data[i].start_of_day);
		window.jhwInventoryGlobalGraphConfig.data.labels.push(ts_moment.toDate());
		dataset_min.data.push(api_data[i].min_bikes);
		dataset_max.data.push(api_data[i].max_bikes);
		dataset_circulation.data.push(api_data[i].max_bikes - api_data[i].min_bikes);
	}

	// populate dataset
	window.jhwInventoryGlobalGraphConfig.data.datasets.push(dataset_min);
	window.jhwInventoryGlobalGraphConfig.data.datasets.push(dataset_max);
	window.jhwInventoryGlobalGraphConfig.data.datasets.push(dataset_circulation);

	// update graph
	window.jhwInventoryGlobalGraph.update();
}

function jhwInventoryGlobalGraphUpdate() {
	// get
	jhaGetStatsGlobal(
		"minmax",
		"day"
	)
	.done(
		function(data, textStatus, jqXHR) {
			jhwDrawInventoryGlobalGraph(data);
		}
	)
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhaGetStatsGlobal fail", jqXHR, textStatus, errorThrown);
	});
}

function jhwSetupInventoryGlobalGraph() {

	// init InventoryGlobal graph config
	window.jhwInventoryGlobalGraphConfig = {
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
				text: 'Nombre total de vélos gérés par JCDecaux, tous contrats confondus'
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

	jhwInventoryGlobalGraphUpdate();
}

function jhwSetupInventoryGlobal() {
	// init api
	jhaSetApiUrl();

	jhwSetupInventoryGlobalGraph();
}
