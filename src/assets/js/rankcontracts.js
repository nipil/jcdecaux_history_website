
function jhwSetRankContractsTable(api_data) {

	var t = "Classement de l'activité des contrats "
	if (api_data.length > 0) {
		var ts_moment = moment.unix(api_data[0][window.jhwRankContractsConfig.timename]);
		switch(window.jhwRankContractsConfig.period) {
			case "day":
				t += "de la journée : " + ts_moment.format("D MMMM YYYY")
				break;
			case "week":
				t += "de la semaine : " + ts_moment.format("W") + " de " + ts_moment.format("YYYY")
				break;
			case "month":
				t += "du mois : " + ts_moment.format("MMMM YYYY")
				break;
			case "year":
				t += "de l'année : " + ts_moment.format("YYYY")
				break;
		}
	}

	window.jhwRankContractsConfig.title_element.text(t)

	var sum_changes = api_data.reduce((p,c) => p + parseInt(c.num_changes), 0)
	if (sum_changes < 1) sum_changes = 1

	window.jhwRankContractsConfig.table.clear()
	for (i=0; i<api_data.length; i++) {
		window.jhwRankContractsConfig.table.row.add([
			api_data[i].rank_global,
			api_data[i].num_changes,
			(Math.round(10000 * api_data[i].num_changes / sum_changes, 2) / 100) + "%",
			jhwContractText(window.JcdContracts[api_data[i].contract_id])
		])
	}
	window.jhwRankContractsConfig.table.draw()
}

function jhwRankContractsTablePeriodCallback() {

	// time key
	window.jhwRankContractsConfig["timename"] = "start_of_" + window.jhwRankContractsConfig.period

	// cache
	if (window.jhwRankContractsConfig.period in window.jhwRankContractsConfig.data) {
		jhwSetRankContractsTable(window.jhwRankContractsConfig.data[window.jhwRankContractsConfig.period])
		return
	}

	// get
	jhaGetRankContracts(window.jhwRankContractsConfig.period)
	.done(
		function(data, textStatus, jqXHR) {
			window.jhwRankContractsConfig.data[window.jhwRankContractsConfig.period] = data
			jhwSetRankContractsTable(data);
		}
	)
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhaGetRankContracts fail", jqXHR, textStatus, errorThrown);
	});
}

function jhwSetupRankContracts() {
	// init api
	jhaSetApiUrl();

	window.jhwRankContractsConfig = {
		"period": "day",
		"data": {},
		"title_element": $("#table_rank_title"),
		"table_element": $("#table_rank_contracts"),
		"table": $('#table_rank_contracts').DataTable({
			"paging": false,
			"searching": false,
			"autoWidth": false,
			"order": [[ 1, "desc" ]]
		})
	}

	// link period buttons to date in config
	var days = $("a[period]").each(function(i, e) {
		$(e).click(
			$(e).attr("period"),
			function (event) {
				window.jhwRankContractsConfig["period"] = event.data
				jhwRankContractsTablePeriodCallback()
			}
		);
	});

	jhaGetContracts()
	.done(
		function(data, textStatus, jqXHR) {
			jhwCacheContracts(data)
			jhwRankContractsTablePeriodCallback()
		}
	)
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhaGetContracts fail", jqXHR, textStatus, errorThrown);
	});
}
