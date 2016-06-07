

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

function jhwLoadContracts(data) {
	var avail_contracts = $('#availability_contract');
	avail_contracts.empty();
	for (var i = 0; i < data.length; i++) {
		var contract = data[i];
		contract.commercial_name = jhwEscapeHTML(contract.commercial_name);
		contract.contract_name = jhwEscapeHTML(contract.contract_name);
		avail_contracts.append(
			'<option value="'
			+ contract.contract_id
			+ '">'
			+ contract.contract_name
			+ ' / '
			+ contract.commercial_name
			+ '</option>');
	}
}

function jhwGetContracts(successCallback) {
	var base_url = $(document).data("jha_base_url");

	var contracts = $.getJSON(
		base_url + "/contracts",
		successCallback
	);
}

function jhwSetup() {
	$(document).data(
		"jha_base_url",
		"https://nipil.org/jcdecaux_history_api"
	);

	jhwGetContracts(jhwLoadContracts);

	$("#graph_availability").ready(jhwSetupAvailabilityGraph);
}

$(document).ready(jhwSetup);

$(document).foundation();
