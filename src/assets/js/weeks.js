function jhwDrawAvailabilityGraphWeeks(graph_index, target_date, api_data) {
	// calculate timestamp shift
	var delta_ts = moment.utc(window.jhwAvailabilityConfig.date, "YYYY-MM-DD").unix()
		- moment.utc(target_date, "YYYY-MM-DD").unix();
	// prepare dataset
	var hue = jhwGetHue(graph_index);
	var dataset = {
		label: target_date,
		data: [],
		fill: false,
		lineTension: 0,
		borderColor: jhwHslColor(hue, 1),
		backgroundColor: jhwHslColor(hue, 0.3),
		borderWidth: 1,
		pointHitRadius: 5,
		pointRadius: 0,
	};
	// populate dataset
	for (var i = 0; i < api_data.length; i++) {
		// adjust timestamp's date
		var ts_moment = moment.unix(api_data[i].timestamp);
		ts_moment.add(delta_ts, "seconds");
		window.jhwAvailabilityGraphConfig.data.labels.push(ts_moment.toDate());
		dataset.data.push({
			x: ts_moment.format('YYYY-MM-DD HH:mm'),
			y: api_data[i].available_bikes
		});
	}
	window.jhwAvailabilityGraphConfig.data.datasets.push(dataset);
	window.jhwAvailabilityGraph.update();
}

function jhwAvailabilityUpdateAsync(graph_index, target_date) {
	return function(data, textStatus, jqXHR) {
		if (data.length == 0) {
			return;
		}
		jhwDrawAvailabilityGraphWeeks(
			graph_index,
			target_date,
			data
		);
	}
}

function jhwAvailabilityUpdate() {
	// request data load
	for (var i = window.jhwAvailabilityGraphConfig.data.datasets.length; i < window.jhwAvailabilityConfig.weeks; i ++) {
		// calculate date to load
		var t_date = moment(
			window.jhwAvailabilityConfig.date,
			"YYYY-MM-DD"
		).subtract(
			7*i,
			"days"
		).format("YYYY-MM-DD");
		// get
		jhaGetSamples(
			t_date,
			window.jhwAvailabilityConfig.contract_id,
			window.jhwAvailabilityConfig.station_number
		)
		.done(
			// use a function indirection
			// graph_index and target_date are fixed
			// at the time this function is created
			// or else t_date = value of last for iteration
			jhwAvailabilityUpdateAsync(i, t_date)
		)
		.fail(function(jqXHR, textStatus, errorThrown) {
			console.log("jhwGetStations fail", jqXHR, textStatus, errorThrown);
		});
	}
}

function jhwSetupAvailabilityGraph() {
	// init api
	jhaSetApiUrl();

	// link day buttons to date in config
	var days = $("a[dayofweek]").each(function(i, e) {
		$(e).click(
			parseInt($(e).attr("dayofweek")),
			function (event) {
				var cur = window.jhwAvailabilityConfig.date;
				var now = moment.utc();
				var target = now.clone().day(event.data);
				if (target.isAfter(now)) {
					target.subtract(7, 'days');
				}
				window.jhwAvailabilityConfig.date = target.format("YYYY-MM-DD");
				if (cur != window.jhwAvailabilityConfig.date) {
					// reset graph data
					window.jhwAvailabilityGraphConfig.data.labels.length = 0;
					window.jhwAvailabilityGraphConfig.data.datasets.length = 0;
					jhwAvailabilityUpdate();
				}
			}
		);
	});

	// link week buttons to config
	var days = $("a[weekmod]").each(function(i, e) {
		$(e).click(
			parseInt($(e).attr("weekmod")),
			function (event) {
				var cur = window.jhwAvailabilityConfig.weeks;
				window.jhwAvailabilityConfig.weeks += event.data;
				if (window.jhwAvailabilityConfig.weeks < 1) {
					window.jhwAvailabilityConfig.weeks = 1;
				}
				if (cur != window.jhwAvailabilityConfig.weeks) {
					if (cur > window.jhwAvailabilityConfig.weeks) {
						// remove oldest data
						window.jhwAvailabilityGraphConfig.data.datasets.length = window.jhwAvailabilityConfig.weeks;
						window.jhwAvailabilityGraph.update();
					} else {
						jhwAvailabilityUpdate();
					}
				}
			}
		);
	});

	// default selection
	window.jhwAvailabilityConfig = {
		contract_id: null,
		station_number: null,
		date: moment.utc().format('YYYY-MM-DD'),
		weeks: 3
	}

	// init availability graph config
	window.jhwAvailabilityGraphConfig = {
		type: 'line',
		data: {
			labels: [], // Date Objects
			datasets: []
		},
		options: {
			responsive: true,
			// maintainAspectRatio: false,
			title: {
				display:false,
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
	window.jhwAvailabilityGraph = new Chart(
		$('#graph_availability'),
		window.jhwAvailabilityGraphConfig
	);

	// init selection components
	jhwSelectContractStationSetup(
		$('#select_contract'),
		$('#select_station'),
		function (contract_id, station_number) {
			window.jhwAvailabilityConfig.contract_id = contract_id;
			window.jhwAvailabilityConfig.station_number = station_number;
			// reset graph data
			window.jhwAvailabilityGraphConfig.data.labels.length = 0;
			window.jhwAvailabilityGraphConfig.data.datasets.length = 0;
			jhwAvailabilityUpdate();
		}
	);
}
