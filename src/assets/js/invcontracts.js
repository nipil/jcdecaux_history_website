
function jhwInventoryContractsGraphUpdate(contract_id, api_data) {

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
		window.jhwInventoryContractsGraphConfig.data.labels.push(ts_moment.toDate());
		dataset_max.data.push(api_data[i].max_bikes);
		dataset_min.data.push(api_data[i].min_bikes);
		dataset_circulation.data.push(api_data[i].max_bikes - api_data[i].min_bikes);
	}

	// populate dataset
	window.jhwInventoryContractsGraphConfig.data.datasets.push(dataset_min);
	window.jhwInventoryContractsGraphConfig.data.datasets.push(dataset_max);
	window.jhwInventoryContractsGraphConfig.data.datasets.push(dataset_circulation);

	// update graph
	window.jhwInventoryContractsGraph.update();
}

function jhwInventoryContractsLoadIndirection(contract_id) {
	return function(data, textStatus, jqXHR) {
		jhwInventoryContractsGraphUpdate(contract_id, data);
	}
}

function jhwSetupInventoryContractsGraph() {

	// init InventoryContracts graph config
	window.jhwInventoryContractsGraphConfig = {
		type: 'line',
		data: {
			labels: [], // Date Objects
			datasets: []
		},
		options: {
			legend: {
				display: true
			},
			hover: {
				mode: 'label',
			},
			title: {
				display: false,
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

	// create InventoryContracts graph
	window.jhwInventoryContractsGraph = new Chart(
		$('#graph_inventory_contracts'),
		window.jhwInventoryContractsGraphConfig
	);
}

function jhwSetupInventoryContracts() {
	// init api
	jhaSetApiUrl();

	window.InventoryContractsConfig = {}

	// setup graph
	jhwSetupInventoryContractsGraph()

	// init selection components
	jhwSelectContractStationSetup(
		$('#select_contract'),
		null,
		function (contract_id, station_number) {
			window.InventoryContractsConfig.contract_id = contract_id;
			// reset graph data
			window.jhwInventoryContractsGraphConfig.data.labels.length = 0;
			window.jhwInventoryContractsGraphConfig.data.datasets.length = 0;
			// fetch data
			jhaGetStatsContract(
				"minmax",
				"day",
				contract_id
			).done(
				jhwInventoryContractsLoadIndirection(contract_id)
			)
			.fail(function(jqXHR, textStatus, errorThrown) {
				console.log("jhaGetStatsContract fail", jqXHR, textStatus, errorThrown);
			});
		}
	);
}
