
function jhwDrawInventoryRepartitionGraph(api_data, sum_bikes) {
	// sort descending
	api_data.sort(function (a, b) {
		return b.max_bikes - a.max_bikes
	})

	// init graph config
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
		options: {
			legend: {
				display: false
			},
			title: {
				display: true,
				text: "Nombre de vélos par contrat, sur les 10 derniers jours"
			},
			tooltips: {
				callbacks: {
					title: function (item, data) {
						return data.datasets[0].data[item[0].index] + " vélos";
					},
					label: function (item, data) {
						return data.labels[item.index];
					},
					footer: function (item, data) {
						v = data.datasets[0].data[item[0].index]
						t = (Math.round(10000 * v / sum_bikes, 2) / 100) + "% du parc total"
						return t;
					},
				}
			}
		}
	};

	// add the relevant data and colors
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

	// create InventoryRepartition graph
	window.jhwInventoryRepartitionGraph = new Chart(
		$('#graph_inventory_repartition'),
		window.jhwInventoryRepartitionGraphConfig
	);
}

function jhwSetupInventoryRepartitionGraph() {

	// fetch stats
	jhaGetStatsRepartition()
	.done(
		function(data, textStatus, jqXHR) {

			// compute sum and ratio
			sum_bikes = data.reduce((p,c) => p + parseInt(c.max_bikes), 0)
			if (sum_bikes < 1) sum_bikes = 1

			// build table data
			window.jhwInventoryRepartitionConfig.table.clear()
			for (i=0; i<data.length; i++) {
				window.jhwInventoryRepartitionConfig.table.row.add([
					data[i].max_bikes,
					(Math.round(10000 * data[i].max_bikes / sum_bikes, 2) / 100) + "%",
					jhwContractText(window.JcdContracts[data[i].contract_id])
				])
			}
			window.jhwInventoryRepartitionConfig.table.draw()

			// draw graph
			jhwDrawInventoryRepartitionGraph(data, sum_bikes);
		}
	)
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhaGetStatsRepartition fail", jqXHR, textStatus, errorThrown);
	});
}

function jhwSetupInventoryRepartition() {
	// init api
	jhaSetApiUrl();


	window.jhwInventoryRepartitionConfig = {
		"table": $('#table_inventory_repartition').DataTable({
			"paging": false,
			"searching": false,
			"order": [[ 1, "desc" ]]
		})
	}

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
