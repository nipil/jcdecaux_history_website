function jhwDateNavSetup(pickerText, prevButton, nextButton, callback, defaultDate = null) {
	// set default date
	if (defaultDate == null) {
		defaultDate = moment.utc().format("YYYY-MM-DD");
	}
	// initialize component
	pickerText.fdatepicker({
		initialDate: defaultDate,
		language: 'fr',
		weekStart: 1,
		format: 'yyyy-mm-dd',
		disableDblClickSelection: true
	});
	prevButton.click(function(event) {
		pickerText.val(
			moment.utc(pickerText.val(), "YYYY-MM-DD")
			.subtract(1, "days")
			.format("YYYY-MM-DD")
		);
		callback(pickerText.val());
	});
	nextButton.click(function(event) {
		pickerText.val(
			moment.utc(pickerText.val(), "YYYY-MM-DD")
			.add(1, "days")
			.format("YYYY-MM-DD")
		);
		callback(pickerText.val());
	});
	pickerText.on('changeDate', function (event) {
		callback(pickerText.val());
	});
}
