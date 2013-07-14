function loadSettings() {
	try {
		$("#settings input[type='text'],#settings input[type='password']").each(function() {
			$(this).val(window.localStorage.getItem($(this).attr("id")));
		});
	} catch(e) {
		debugWrite("error",e);
	}
}
function saveSettings() {
	try {
		$("#settings input[type='text'],#settings input[type='password']").each(function() {
			window.localStorage.setItem($(this).attr("id"),$(this).val());
		});
	} catch(e) {
		debugWrite("error",e);
	}
}
function loadImage(image, imagePath) {
	debugWrite("loadImage",imagePath);
	var createReader = function (readable) {
		debugWrite("createReader","start");
		var reader = new FileReader();
		reader.onloadend = function (evt) {
			debugWrite("reader.onloadend","start");
			var dataURL = evt.target.result;
			$(image).attr("src",dataURL);
			debugWrite("reader.onloadend","end");
		}
		reader.readAsDataURL(readable);
		debugWrite("createReader","end");
	};    
	var gotFileEntry = function (fileEntry) {
		debugWrite("gotFileEntry","start");
		fileEntry.file(createReader, fail);
		debugWrite("gotFileEntry","end");
	};
	window.resolveLocalFileSystemURI(imagePath,gotFileEntry, fail);
}

// Функция вывода сообщений трассировки
// Обработка try-catch требуется для совместимости с IE
function debugWrite(a,b) {
	try {
		console.log(a+":"+b);
	} catch (e) {
	}
}

function parseDate(input) {
  var parts = input.split('-');
  // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
}

function parseDatetime(input) {
  var parts = input.split("T");
  var dateParts = parts[0].split('-');
  var timeParts = parts[1].split(':');
  // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(dateParts[0], dateParts[1]-1, dateParts[2], timeParts[0], timeParts[1]); // months are 0-based
}
