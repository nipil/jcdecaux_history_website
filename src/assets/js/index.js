function jhwSetInformations(element, data) {
	var labels = {};
	labels["dates_count"] = "Jours collectés";
	labels["contract_count"] = "Contrats gérés";
	labels["station_count"] = "Stations connues";
	labels["sample_count"] = "Échantillons en base";
	labels["database_size"] = "Octets sur disque";
	for (k in labels) {
		sn = jhwNumberWithCommas(data[k])
		element.append(
			$('<li>').append(
				labels[k] + ": " + sn
			)
		);
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
