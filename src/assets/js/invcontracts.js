
function jhwInventoryContractsGraphUpdate(contract_id, api_data) {
	// prepare dataset
	var dataset = {
		label: contract_id,
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
		window.jhwInventoryContractsGraphConfig.data.labels.push(ts_moment.toDate());
		dataset.data.push({
			x: ts_moment.format('YYYY-MM-DD HH:mm'),
			y: api_data[i].max_bikes
		});
	}

	// populate dataset
	window.jhwInventoryContractsGraphConfig.data.datasets.push(dataset);
	console.log(contract_id, dataset.data.length);

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
			title: {
				display:true,
				text: 'Nombre total maximum de vélos, par contrat JCDecaux'
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
			console.log(contract_id);
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
