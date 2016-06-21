function jhaSetApiUrl() {
	$(document).data(
		"jha_base_url",
		"https://nipil.org/jcdecaux_history_api"
	);
}

function jhaGetApiUrl() {
	return $(document).data(
		"jha_base_url"
	);
}

function jhaLazyGet(url) {
	if (window.jhaLazyGetPromises == null) {
		window.jhaLazyGetPromises = {};
	}
	if (window.jhaLazyGetPromises.hasOwnProperty(url)) {
		return window.jhaLazyGetPromises[url];
	} else {
		var promise = $.getJSON(url)
			.always(function() {
				delete window.jhaLazyGetPromises[url];
			});
		window.jhaLazyGetPromises[url] = promise;
		return promise;
	}
}

function jhaGetSamples(date, contract_id, station_number) {
	return jhaLazyGet(
		jhaGetApiUrl()
			+ "/samples/dates/" + date
			+ "/contracts/" + contract_id
			+ "/stations/" + station_number);
}

function jhaGetStation(contract_id, station_number) {
	return jhaLazyGet(
		jhaGetApiUrl()
		+ "/contracts/" + contract_id
		+ "/stations/" + station_number
	);
}

function jhaGetStations(contract_id) {
	return jhaLazyGet(
		jhaGetApiUrl()
		+ "/contracts/" + contract_id
		+ "/stations"
	);
}

function jhaGetContract(contract_id) {
	return jhaLazyGet(
		jhaGetApiUrl()
		+ "/contracts/" + contract_id
	);
}

function jhaGetContracts() {
	return jhaLazyGet(
		jhaGetApiUrl()
		+ "/contracts"
	);
}
