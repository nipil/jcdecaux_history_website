
function jhwSetRankStationsTable(api_data) {

	var t = "Classement de l'activité des stations "
	if (api_data.length > 0) {
		var ts_moment = moment.unix(api_data[0][window.jhwRankStationsConfig.timename]);
		switch(window.jhwRankStationsConfig.period) {
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

	window.jhwRankStationsConfig.title_element.text(t)

	var sum_changes = api_data.reduce((p,c) => p + parseInt(c.num_changes), 0)
	if (sum_changes < 1) sum_changes = 1

	window.jhwRankStationsConfig.table.clear()
	for (i=0; i<api_data.length; i++) {
		var s = window.JcdStations[api_data[i].contract_id]
		var n = api_data[i].station_number
		var txt = "Inconnue (station fermée ?)"
		if (n in s) {
			txt = jhwStationText(s[n])
		} else {
			console.log("cannot find station number", n, "in contract's stations")
		}
		window.jhwRankStationsConfig.table.row.add([
			api_data[i].rank_contract,
			api_data[i].rank_global,
			api_data[i].num_changes,
			(Math.round(10000 * api_data[i].num_changes / sum_changes, 2) / 100) + "%",
			txt
		])
	}
	window.jhwRankStationsConfig.table.draw()
}

function jhwRankStationsTablePeriodCallback() {
	// time key
	window.jhwRankStationsConfig["timename"] = "start_of_" + window.jhwRankStationsConfig.period

	// cache
	if (window.jhwRankStationsConfig.contract_id in window.jhwRankStationsConfig.data) {
		c = window.jhwRankStationsConfig.data[window.jhwRankStationsConfig.contract_id]
		if (window.jhwRankStationsConfig.period in c) {
			jhwSetRankStationsTable(c[window.jhwRankStationsConfig.period])
			return
		}
	} else {
		window.jhwRankStationsConfig.data[window.jhwRankStationsConfig.contract_id] = {}
	}

	// get
	jhaGetRankStation(window.jhwRankStationsConfig.period, window.jhwRankStationsConfig.contract_id)
	.done(
		function(data, textStatus, jqXHR) {
			window.jhwRankStationsConfig.data[window.jhwRankStationsConfig.period] = data
			jhwSetRankStationsTable(data);
		}
	)
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhaGetRankStations fail", jqXHR, textStatus, errorThrown);
	});
}

function jhwSetupRankStations() {
	// init api
	jhaSetApiUrl();

	window.jhwRankStationsConfig = {
		"period": "day",
		"data": {},
		"title_element": $("#table_rank_title"),
		"table_element": $("#table_rank_contracts"),
		"table": $('#table_rank_stations').DataTable({
			"paging": false,
			"searching": true,
			"autoWidth": false,
			"order": [[ 2, "desc" ]]
		})
	}

	// link period buttons to date in config
	var days = $("a[period]").each(function(i, e) {
		$(e).click(
			$(e).attr("period"),
			function (event) {
				window.jhwRankStationsConfig["period"] = event.data
				jhwRankStationsTablePeriodCallback()
			}
		);
	});

	// init selection components
	jhwSelectContractStationSetup(
		$('#select_contract'),
		null,
		function (contract_id, station_number) {
			window.jhwRankStationsConfig.contract_id = contract_id

			jhaGetStations(contract_id)
			.done(function(data, textStatus, jqXHR) {
				jhwCacheStations(contract_id, data);
				jhwRankStationsTablePeriodCallback()
			})
			.fail(function(jqXHR, textStatus, errorThrown) {
				console.log("jhwGetStations fail", jqXHR, textStatus, errorThrown);
			});
		}
	);
}
