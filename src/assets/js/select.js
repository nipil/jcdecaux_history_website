function jhwSanitizeText(object, properties) {
	for (var i in properties) {
		var t = object[properties[i]];
		object[properties[i]] = jhwEscapeHTML(t);
	}
	return object;
}

function jhwSanitizeContract(contract) {
	return jhwSanitizeText(
		contract,
		['contract_id', 'commercial_name', 'contract_name']
	);
}

function jhwSanitizeStation(station) {
	return jhwSanitizeText(
		station,
		['station_number', 'station_name', 'address']
	);
}

function jhwContractText(contract) {
	return contract.contract_name
		+ ' / '
		+ contract.commercial_name;

}
function jhwStationText(station) {
	return station.station_name
		+ ' / '
		+ station.address;
}

function jhwSelectContractStationSetup(selectContract, selectStation, afterChangeCallback) {
	// store eventual child selectStation in the DOM element
	selectContract.get(0).jhwSelectStation = selectStation;

	// initialize component
	selectContract.select2();
	selectContract.change(jhwSelectContractChange);

	// configure selectStation
	if (selectStation == null) {

		// change in contracts will trigger user callback
		selectContract.get(0).jhwAfterChangeCallback = afterChangeCallback;

	} else {

		// change in contracts will trigger station load and change in station
		selectContract.get(0).jhwAfterChangeCallback = function(contract_id) {
			jhwFetchStations(selectStation, contract_id);
		};
		// change in contracts will trigger user callback
		selectStation.get(0).jhwAfterChangeCallback = afterChangeCallback;

		// initialize component
		selectStation.select2();
		selectStation.change(jhwSelectStationsChange);
	}

	// initialize contract data
	jhwFetchContracts(selectContract);
}

function jhwSelectContractLoad(data, selectContract) {
	// sort by name
	data = jhwAlphaSortKeyAsc(data, "contract_name");
	// select prefered contract from cookie info
	var last_contract_id = Cookies.get('last_contract_id');
	// load into select
	selectContract.empty();
	for (var i = 0; i < data.length; i++) {
		var contract = data[i];
		jhwSanitizeContract(contract);
		// create element
		var option = $(
			'<option value="'
			+ contract.contract_id
			+ '">'
			+ jhwContractText(contract)
			+ '</option>');
		// setup based on cookie
		if (contract.contract_id === last_contract_id) {
			option.prop("defaultSelected", true);
		}
		// append to select
		selectContract.append(option);
	}
}

function jhwSelectStationsLoad(data, selectStation) {
	// sort by name
	data = jhwAlphaSortKeyAsc(data, "station_name");
	// select prefered station from cookie info
	var last_station_number_id = Cookies.get('last_station_number');
	// Load stations into select
	selectStation.empty();
	for (var i = 0; i < data.length; i++) {
		var station = data[i];
		jhwSanitizeStation(station);
		// create element
		var option = $(
			'<option value="'
			+ station.station_number
			+ '">'
			+ jhwStationText(station)
			+ '</option>');
		// setup based on cookie
		if (station.station_number === last_station_number_id) {
			option.prop("defaultSelected", true);
		}
		// append to select
		selectStation.append(option);
	}
}

function jhwSelectContractChange(event) {
	// detect which was selected
	var target = event.target;
	if (target.selectedIndex == -1) {
		return;
	}
	// get currently selected contract
	var contract_id = target[target.selectedIndex].value;
	// memorize as prefered contract
	Cookies.set(
		'last_contract_id',
		contract_id,
		{
			expires: 365
		}
	);
	// call after change hook
	if (target.jhwAfterChangeCallback != null) {
		target.jhwAfterChangeCallback(contract_id);
	}
	// if selectContract has a child selectStation
	if (target.jhwSelectStation != null) {
		target.jhwSelectStation.get(0).jhwContractId = contract_id;
	}
	// don't bubble up further
	return false;
}

function jhwSelectStationsChange(event) {
	// detect which was selected
	var target = event.target;
	if (target.selectedIndex == -1) {
		return;
	}
	// get currently selected contract
	var station_number = target[target.selectedIndex].value;
	// memorize as prefered contract
	Cookies.set(
		'last_station_number',
		station_number,
		{
			expires: 365
		}
	);
	// load eventual parent contract_id
	var contract_id = null;
	if (target.jhwContractId != null) {
		contract_id = target.jhwContractId;
	}
	// call after change hook
	if (target.jhwAfterChangeCallback != null) {
		target.jhwAfterChangeCallback(contract_id, station_number);
	}
	// don't bubble up further
	return false;
}

function jhwCacheContracts(data) {
	window.JcdStations = {}
	window.JcdContracts = {}
	for (i=0; i<data.length; i++) {
		contract = data[i]
		window.JcdContracts[contract.contract_id] = contract;
	}
}

function jhwCacheStations(contract_id, data) {
	window.JcdStations[contract_id] = {}
	for (i=0; i<data.length; i++) {
		station = data[i]
		window.JcdStations[contract_id][station.station_number] = station;
	}
}

function jhwFetchContracts(selectContract) {
	// fetch and load contract data
	jhaGetContracts()
	.done(function(data, textStatus, jqXHR) {
		jhwCacheContracts(data);
		jhwSelectContractLoad(data, selectContract);
		selectContract.change();
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhwGetContracts fail", jqXHR, textStatus, errorThrown);
	});
}

function jhwFetchStations(selectStation, contract_id) {
	jhaGetStations(contract_id)
	.done(function(data, textStatus, jqXHR) {
		jhwCacheStations(contract_id, data);
		window.JcdStations[contract_id] = data;
		jhwSelectStationsLoad(data, selectStation);
		selectStation.change();
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		console.log("jhwGetStations fail", jqXHR, textStatus, errorThrown);
	});
}
