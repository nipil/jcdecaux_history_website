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

function jhwRandomInt(maxval) {
	return Math.floor(maxval*Math.random());
}

function jhwHslColor(hue, alpha) {
    return 'hsla(' + hue + ',100%,50%,' + alpha + ')';
};

function jhwGetHue(index) {
	var jhw_preset_colors = [
		0, // red
		240, // blue
		120, //green
		300, // violet
		40, // orange
	];
	if (index < jhw_preset_colors.length) {
		return jhw_preset_colors[index];
	} else {
		return jhwRandomInt(360);
	}
}

// source: http://stackoverflow.com/a/2901298/5973357
function jhwNumberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
