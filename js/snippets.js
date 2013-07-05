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
	var createReader = function (readable) {
		var reader = new FileReader();
		reader.onloadend = function (evt) {
			var dataURL = evt.target.result;
			$(image).attr("src",dataURL);
		}
		reader.readAsDataURL(readable);
	};    
	var gotFileEntry = function (fileEntry) {
		fileEntry.file(createReader, fail);
	};
	var gotFS = function (fileSystem) {
		fileSystem.root.getFile(imagePath, {exclusive: false}, gotFileEntry, fail);
	};    
	window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
}
