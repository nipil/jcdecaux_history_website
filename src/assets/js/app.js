
function jhwAlphaSortKeyAsc(data, key, asc = true) {
	return data.sort(function(a,b) {
		var cs = (asc ? 1 : -1);
		var ca = a[key].toLowerCase();
		var cb = b[key].toLowerCase();
		if (ca === cb) {
			return 0;
		} else {
			return (ca > cb ? cs : -cs);
		}
	});
}

function jhwEscapeHTML(html) {
    return document.createElement('div').appendChild(document.createTextNode(html)).parentNode.innerHTML;
}

function jhwSetupAvailabilityGraph() {
	var ctx = document.getElementById("graph_availability");
	var opts = {
		type: 'bar',
		data: {
			labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
			datasets: [{
				label: '# of Votes',
				data: [12, 19, 3, 5, 2, 3],
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(153, 102, 255, 0.2)',
					'rgba(255, 159, 64, 0.2)'
				],
				borderColor: [
					'rgba(255,99,132,1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)'
				],
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						beginAtZero:true
					}
				}]
			}
		}
	};
	var gAvail = new Chart(ctx, opts);
}

function jhwLoadAvailabilityGraph(contract_id, station_number) {
	console.log("jhwLoadAvailabilityGraph", contract_id, station_number);
}

function jhwGetSelectedStation() {
	var selectStation = $("#availability_station");
	var selectedStation = selectStation.find("option:selected");
	if (selectedStation.length > 0) {
		return selectedStation.attr("value");
	} else {
		return null;
	}
}

function jhwChangeStations(event) {
	var contract_id = jhwGetSelectedContract();
	var station_number = jhwGetSelectedStation();
	if (contract_id !== null && station_number !== null) {
		Cookies.set(
			'last_station_number',
			station_number,
			{ expires: 365 }
		);
		jhwLoadAvailabilityGraph(contract_id, station_number);
	}
	return false;
}

function jhwLoadStations(data) {
	// sort by name
	data = jhwAlphaSortKeyAsc(data, "station_name");

	// select prefered station from cookie info
	var last_station_number_id = Cookies.get('last_station_number');

	// Load stations into select
	var avail_stations = $('#availability_station');
	avail_stations.empty();
	for (var i = 0; i < data.length; i++) {
		var station = data[i];
		// sanitize input
		station.station_number = jhwEscapeHTML(station.station_number);
		station.station_name = jhwEscapeHTML(station.station_name);
		station.address = jhwEscapeHTML(station.address);
		// create element
		var option = $(
			'<option value="'
			+ station.station_number
			+ '">'
			+ station.station_name
			+ ' / '
			+ station.address
			+ '</option>');
		// setup based on cookie
		if (station.station_number === last_station_number_id) {
			option.prop("defaultSelected", true);
		}
		// append to select
		avail_stations.append(option);
	}

	// trigger a station change to load graph
	avail_stations.change();
}

function jhwGetStations(contract_id, successCallback) {
	var base_url = $(document).data("jha_base_url");

	var stations = $.getJSON(
		base_url
		+ "/contracts/"
		+ contract_id
		+ "/stations",
		successCallback
	);
}

function jhwGetSelectedContract() {
	var selectContract = $("#availability_contract");
	var selectedContract = selectContract.find("option:selected");
	if (selectedContract.length > 0) {
		return selectedContract.attr("value");
	} else {
		return null;
	}
}

function jhwChangeContracts(event) {
	var contract_id = jhwGetSelectedContract();
	if (contract_id !== null) {
		Cookies.set(
			'last_contract_id',
			contract_id,
			{ expires: 365 }
		);
		jhwGetStations(contract_id, jhwLoadStations);
	}
	return false;
}

function jhwLoadContracts(data) {
	// sort by name
	data = jhwAlphaSortKeyAsc(data, "contract_name");

	// select prefered contract from cookie info
	var last_contract_id = Cookies.get('last_contract_id');

	// load into select
	var avail_contracts = $('#availability_contract');
	avail_contracts.empty();
	for (var i = 0; i < data.length; i++) {
		var contract = data[i];
		// sanitize input
		contract.contract_id = jhwEscapeHTML(contract.contract_id);
		contract.commercial_name = jhwEscapeHTML(contract.commercial_name);
		contract.contract_name = jhwEscapeHTML(contract.contract_name);
		// create element
		var option = $(
			'<option value="'
			+ contract.contract_id
			+ '">'
			+ contract.contract_name
			+ ' / '
			+ contract.commercial_name
			+ '</option>');
		// setup based on cookie
		if (contract.contract_id === last_contract_id) {
			option.prop("defaultSelected", true);
		}
		// append to select
		avail_contracts.append(option);
	}

	// notify to force-load stations
	avail_contracts.change();
}

function jhwGetContracts(successCallback) {
	var base_url = $(document).data("jha_base_url");
	var contracts = $.getJSON(
		base_url + "/contracts",
		successCallback
	);
}

function jhwInitDatePicker() {
	var picker = $('#date_picker');
	var now = moment.utc().format("YYYY-MM-DD");
	picker.fdatepicker({
		initialDate: now,
		language: 'fr',
		weekStart: 1,
		format: 'yyyy-mm-dd',
		disableDblClickSelection: true
	});
}

function jhwSetup() {
	$(document).data(
		"jha_base_url",
		"https://nipil.org/jcdecaux_history_api"
	);

	jhwInitDatePicker();

	jhwGetContracts(jhwLoadContracts);

	$('#availability_contract').change(jhwChangeContracts);
	$('#availability_station').change(jhwChangeStations);

	$("#graph_availability").ready(jhwSetupAvailabilityGraph);
}

$(document).ready(jhwSetup);

$(document).foundation();
