
function jhwDrawInventoryRepartitionGraph(api_data) {
	api_data.sort(function (a, b) {
		return b.max_bikes - a.max_bikes
	})
	c = 0
	n = 360 / api_data.length
	d = window.jhwInventoryRepartitionGraphConfig.data
	for (i=0; i<api_data.length; i++) {
		t = jhwContractText(window.JcdContracts[api_data[i].contract_id])
		d.datasets[0].data.push(api_data[i].max_bikes)
		d.labels.push(t);
		d.datasets[0].hoverBackgroundColor.push(jhwHslColor(Math.floor(c), 100))
		d.datasets[0].backgroundColor.push(jhwHslColor(Math.floor(c), 30))
		c += n
	}
	window.jhwInventoryRepartitionGraph.update()
}

function jhwSetupInventoryRepartitionGraph() {

	// init InventoryRepartition graph config
	window.jhwInventoryRepartitionGraphConfig = {
		type: 'doughnut',
		data: {
			labels: [], // Date Objects
			datasets: [{
				data: [],
				backgroundColor: [],
				hoverBackgroundColor: []
			}]
		},
	};

	// create InventoryRepartition graph
	window.jhwInventoryRepartitionGraph = new Chart(
		$('#graph_inventory_repartition'),
		window.jhwInventoryRepartitionGraphConfig
	);

	// fetch stats
	jhaGetStatsRepartition()
	.done(
		function(data, textStatus, jqXHR) {
			jhwDrawInventoryRepartitionGraph(data);
		}
	)
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhaGetStatsRepartition fail", jqXHR, textStatus, errorThrown);
	});
}

function jhwSetupInventoryRepartition() {
	// init api
	jhaSetApiUrl();

	jhaGetContracts()
	.done(
		function(data, textStatus, jqXHR) {
			jhwCacheContracts(data)
			jhwSetupInventoryRepartitionGraph();
		}
	)
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhaGetContracts fail", jqXHR, textStatus, errorThrown);
	});
}
