function jhwSetInformations(element, data) {
	var labels = {};
	labels["dates_count"] = "Jours collectés";
	labels["contract_count"] = "Contrats";
	labels["station_count"] = "Stations";
	labels["sample_count"] = "Échantillons";
	labels["database_size"] = "Espace disque";
	for (k in labels) {
		element.append($('<li>').append(labels[k] + ": " + data[k]));
	}
}

function jhwSetMissingInformations(element) {
	element.append($('<li>').append("Données indisponibles"));
}

function jhwSetupIndex() {
	// init api
	jhaSetApiUrl();

	// target element
	var info_element = $("#general_informations");
	info_element.empty();

	jhaGetInformation()
	.done(function(data, textStatus, jqXHR) {
		jhwSetInformations(info_element, data)
	})
	.fail(function(jqXHR, textStatus, errorThrown) {
		jhwSetMissingInformations(info_element);
		console.log("jhwGetStations fail", jqXHR, textStatus, errorThrown);
	});
}
