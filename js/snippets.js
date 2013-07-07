function loadSettings() {
	try {
		$("#settings input[type='text'],#settings input[type='password']").each(function() {
			$(this).val(window.localStorage.getItem($(this).attr("id")));
		});
	} catch(e) {
		console.log("error",e);
	}
}
function saveSettings() {
	try {
		$("#settings input[type='text'],#settings input[type='password']").each(function() {
			window.localStorage.setItem($(this).attr("id"),$(this).val());
		});
	} catch(e) {
		console.log("error",e);
	}
}
function loadImage(image, imagePath) {
	console.log("loadImage",imagePath);
	var createReader = function (readable) {
		console.log("createReader");
		var reader = new FileReader();
		reader.onloadend = function (evt) {
			console.log("reader.onloadend");
			var dataURL = evt.target.result;
			$(image).attr("src",dataURL);
		}
		reader.readAsDataURL(readable);
	};    
	var gotFileEntry = function (fileEntry) {
		console.log("gotFileEntry");
		fileEntry.file(createReader, fail);
	};
	window.resolveLocalFileSystemURI(imagePath,gotFileEntry, fail);
}
