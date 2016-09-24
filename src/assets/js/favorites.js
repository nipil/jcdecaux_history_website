
function jhwDrawFavoritesGraph(graph_index, graph_label, api_data) {
	// prepare dataset
	var hue = jhwGetHue(graph_index);
	var dataset = {
		label: graph_label.text(),
		data: [],
		fill: false,
		lineTension: 0,
		borderColor: jhwHslColor(hue, 1),
		backgroundColor: jhwHslColor(hue, 0.3),
		borderWidth: 1,
		pointHitRadius: 5,
		pointRadius: 0,
	};
	// set table color
	graph_label.attr("style", "background-color: " + jhwHslColor(hue, 0.3));
	// populate dataset
	for (var i = 0; i < api_data.length; i++) {
		var ts_moment = moment.unix(api_data[i].timestamp);
		window.jhwFavoritesGraphConfig.data.labels.push(ts_moment.toDate());
		dataset.data.push({
			x: ts_moment.format('YYYY-MM-DD HH:mm'),
			y: api_data[i].available_bikes
		});
	}
	window.jhwFavoritesGraphConfig.data.datasets.push(dataset);
	window.jhwFavoritesGraph.update();
}

function jhwFavoritesUpdateGraph() {
	$('#favorite_stations tr').each(function (i, tr_element) {
		tr_element = $(tr_element);
		i_element = tr_element.find("i");
		var contract_id = i_element.attr("contract_id");
		var station_number = i_element.attr("station_number");
		var label = tr_element.find("td:first-of-type");
		// check that the label is not already present
		for (var j = 0; j < window.jhwFavoritesGraphConfig.data.datasets.length; j++) {
			var dataset = window.jhwFavoritesGraphConfig.data.datasets[j];
			if (dataset.label === label.text()) {
				return;
			}
		}
		// otherwise, load it
		jhaGetSamples(
			window.jhwFavoritesConfig.date,
			contract_id,
			station_number
		)
		.done(
			function(data, textStatus, jqXHR) {
				if (data.length > 0) {
					jhwDrawFavoritesGraph(i, label, data);
				}
			}
		)
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log("jhwGetStations fail", jqXHR, textStatus, errorThrown);
		});
	});
}

function jhwFavoritesAddStation(table, contract_id, station_number, contract_text = null, station_text = null) {
	var tbody = table.find('tbody');
	// skip when invalid (example: when page is loading)
	if (contract_id == null || station_number == null) {
		return false;
	}
	// filter duplicates
	var sameStations = tbody.find("i[contract_id='"
		+ contract_id
		+ "'][station_number='"
		+ station_number
		+ "']");
	if (sameStations.length > 0) {
		return false;
	}
	// create element
	var row = $(
		"<tr><td>C"
		+ contract_id
		+ "-S"
		+ station_number
		+ "</td><td contract_text>"
		+ (contract_text == null ? "Chargement..." : contract_text)
		+ "</td><td station_text>"
		+ (station_text == null ? "Chargement..." : station_text)
		+ "</td><td><i class='fi-x' contract_id='"
		+ contract_id
		+ "' station_number='"
		+ station_number
		+ "'></i></td></tr>"
	);
	// add suppression handler
	row.find("i").click(function(event) {
		row.remove();
		jhwFavoritesSaveStations(table);
		jhwFavoritesUpdateGraph();
	})
	// lazy load missing data
	if (contract_text == null) {
		jhaGetContract(contract_id).done(
			function(data, textStatus, jqXHR) {
				row.find('td[contract_text]').text(
					jhwContractText(jhwSanitizeContract(data))
				);
			}
		);
	}
	if (station_text == null) {
		jhaGetStation(contract_id, station_number).done(
			function(data, textStatus, jqXHR) {
				row.find('td[station_text]').text(
					jhwStationText(jhwSanitizeStation(data))
				);
			}
		);
	}
	// add new station
	tbody.append(row);
	// something was added
	return true;
}

function jhwFavoritesSaveStations(table) {
	var tbody = table.find('tbody');
	// set favorite stations cookie
	var favorites = {};
	tbody.find("i").each(function(index, element) {
		var element = $(element);
		var contract_id = element.attr("contract_id");
		var station_number = element.attr("station_number");
		var contract = null;
		if (!favorites.hasOwnProperty(contract_id)) {
			favorites[contract_id] = [];
		}
		contract = favorites[contract_id];
		contract.push(station_number);
	});
	var favorites_stations_cookie = JSON.stringify(favorites);
	// console.log("favorites_stations_cookie", favorites_stations_cookie);
	Cookies.set(
		'favorites_stations',
		favorites_stations_cookie,
		{
			expires: 365
		}
	);
}

function jhwLoadFavoriteStations(table, preferred) {
	for (var contract_id in preferred) {
		var stations = preferred[contract_id];
		for (var i in stations) {
			var station_number = stations[i];
			jhwFavoritesAddStation(table, contract_id, station_number);
		}
	}
}

function jhwSetupFavoritesGraph() {
	// init api
	jhaSetApiUrl();

	// default selection
	window.jhwFavoritesConfig = {
		date: moment.utc().format("YYYY-MM-DD"),
	}

	// init availability graph config
	window.jhwFavoritesGraphConfig = {
		type: 'line',
		data: {
			labels: [], // Date Objects
			datasets: []
		},
		options: {
			title: {
				display: true,
				text: 'Disponibilité pour les stations favorites'
			},
			scales: {
				xAxes: [{
					type: "time",
					time: {
						format: 'YYYY-MM-DD HH:mm',
						unit: "hour",
						displayFormats: {
							hour: 'HH:mm'
						},
						tooltipFormat: 'HH:mm',
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

	// create availability graph
	window.jhwFavoritesGraph = new Chart(
		$('#graph_favorites'),
		window.jhwFavoritesGraphConfig
	);

	// init selection components
	jhwSelectContractStationSetup(
		$('#select_contract'),
		$('#select_station'),
		function (contract_id, station_number) {
			window.jhwFavoritesConfig.contract_id = contract_id;
			window.jhwFavoritesConfig.station_number = station_number;
		}
	);

	// init date navigation component
	jhwDateNavSetup(
		$('#date_picker'),
		$('#date_prev'),
		$('#date_next'),
		function (date) {
			if (date != window.jhwFavoritesConfig.date) {
				// memorize new date
				window.jhwFavoritesConfig.date = date;
				// clear graph
				window.jhwFavoritesGraphConfig.data.labels.length = 0;
				window.jhwFavoritesGraphConfig.data.datasets.length = 0;
				// limit display
				if (date > moment.utc().format("YYYY-MM-DD")) {
					window.jhwFavoritesGraph.update();
					return;
				}
				// update graph
				jhwFavoritesUpdateGraph();
			}
		},
		window.jhwFavoritesConfig.date
	);

	// init add station component
	$('#add_button').click(function(event) {
		var result = jhwFavoritesAddStation(
			$('#favorite_stations'),
			window.jhwFavoritesConfig.contract_id,
			window.jhwFavoritesConfig.station_number,
			$.trim($('#select_contract option[value="' + window.jhwFavoritesConfig.contract_id + '"]').text()),
			$.trim($('#select_station option[value="' + window.jhwFavoritesConfig.station_number + '"]').text())
		);
		if (result) {
			jhwFavoritesSaveStations($('#favorite_stations'));
			jhwFavoritesUpdateGraph();
		}
	});

	// init favorite stations
	var preferred = Cookies.get('favorites_stations');
	if (preferred != null) {
		jhwLoadFavoriteStations(
			$('#favorite_stations'),
			JSON.parse(preferred)
		);
		// request graph update
		jhwFavoritesUpdateGraph();
	}
}
