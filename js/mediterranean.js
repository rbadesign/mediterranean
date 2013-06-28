// JavaScript Document
var periods = Array(
	{ id:"day", title:"в день", delay:24*60*60*1000},
	{ id:"week", title:"в неделю", delay:7*24*60*60*1000 },
	{ id:"month", title:"в месяц", delay:30*24*60*60*1000 }
);

var products = Array(
	{ id:"meat", title:"Мясо", qty:1, period:"month" },
	{ id:"sweet", title:"Сладкое", qty:2, period:"month" },
	{ id:"eggs", title:"Яйца", qty:4, period:"week" },
	{ id:"bird", title:"Птица", qty:1, period:"week" },
	{ id:"fish", title:"Рыба", qty:1, period:"week" },
	{ id:"cheese", title:"Сыр и йогурт", qty:1, period:"day" },
	{ id:"oil", title:"Оливковое масло", qty:1, period:"day" },
	{ id:"fruits", title:"Фрукты", qty:1, period:"day" },
	{ id:"nuts", title:"Бобовые и орехи", qty:1, period:"day" },
	{ id:"vegetables", title:"Овощи", qty:1, period:"day" },
	{ id:"bread", title:"Хлеб", qty:1, period:"day" },
	{ id:"water", title:"Вода", qty:6, period:"day" },
	{ id:"vine", title:"Красное вино", qty:2, period:"day" }
);

var cuisineTypes = Array(
	{ id:"entree", title:"Основное" },
	{ id:"soup", title:"Суп" },
	{ id:"garnish", title:"Гарнир" },
	{ id:"salad", title:"Салат" },
	{ id:"drinks", title:"Напитки" },
	{ id:"desert", title:"Десерт" },
	{ id:"snack", title:"Закуска" }
);

var cuisineId = Array();
var plannerId = Array();
var diaryId = Array();
var media = Array();
var mediaIndex = Array();

function getDatabase() {
	return window.openDatabase("mediterranean", "1.0", "Mediterranean diet", 1000000);	
}

function hideForecast() { $("#forecast").hide(); }
function showForecast() { $("#forecast").fadeIn(); }
function hideLimits() { $("#limits").hide(); }
function showLimits() { $("#limits").fadeIn(); }
function hideDiary() { $("#diary").hide(); }
function showDiary() { $("#diary").fadeIn(); }
function hideCuisines() { $("#cuisines").hide(); }
function showCuisines() { $("#cuisines").fadeIn(); }
function hidePlanner() { $("#planner").hide(); }
function showPlanner() { $("#planner").fadeIn(); }
function hideAvailable() { $("#available").hide(); }
function showAvailable() { $("#available").fadeIn(); }
function loadSettings() {
	try {
		$("#settings input[type='text'],#setting input[type='password']").each(function() {
			$(this).val(window.localStorage.getItem($(this).attr("id")));
		});
	} catch(e) {
		alert(e);
	}
}
function saveSettings() {
	try {
		$("#settings input[type='text'],#setting input[type='password']").each(function() {
			window.localStorage.setItem($(this).attr("id"),$(this).val());
		});
	} catch(e) {
		alert(e);
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
function addDiaryItem() {
	var item = $(".diary-item-template").clone();
	item.prependTo(".diary-items").removeClass("diary-item-template").addClass("diary-item").collapsible({ collapsed: false }); 
	item.data("data",diaryId.length);
	diaryId.push(-1);
	media.push(Array());
	mediaIndex.push(-1);
	item.find("[data-role='none']").removeAttr("data-role");
	item.trigger("create");
	item.validate();

	item.on("vclick", ".add-cuisine", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".diary-item");
		var cuisine = addDiaryItemCuisine(item);
		cuisine.addClass("new");
	});
	
	item.on("vclick", ".save", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".diary-item");
		if (item.valid()) {
			var itemData = item.data("data");
			var datetime = new Date(item.find("#cuisine-datetime").val());
			datetime = new Date(datetime.getTime()+datetime.getTimezoneOffset()*60*1000);
			var title = datetime.toLocaleString();
			item.find("#diary-item-title .ui-btn-text").text(title);
			saveDiary(item);
			item.removeClass("changed").removeClass("new");
			item.find(".diary-cuisine").removeClass("changed").removeClass("new");
			clearAvailable();
			queryAvailable();
			queryForecast();
		}
	});
	
	item.on("vclick", ".delete", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".diary-item");
		deleteDiary(item);
		item.remove();
		clearAvailable();
		queryAvailable();
		queryForecast();
	});

	item.on("vclick", "img", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		$(this).toggleFullScreen();
	});
	item.on("vclick", ".prev-image", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var itemData = $(this).parents(".diary-item").data("data");
		var image = $($(this).parents(".diary-item").find(".cuisine-image").get(0)).find("img").get(0);
		if(media[itemData].length>0) {
			mediaIndex[itemData]--; if (mediaIndex[itemData]<0) mediaIndex[itemData] = 0;
			loadImage(image,media[itemData][mediaIndex[itemData]]);
		}
	});
	item.on("vclick", ".next-image", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var itemData = $(this).parents(".diary-item").data("data");
		var image = $($(this).parents(".diary-item").find(".cuisine-image").get(0)).find("img").get(0);
		if(media[itemData].length>0) {
			mediaIndex[itemData]++; if (mediaIndex[itemData]>media[itemData].length-1) mediaIndex[itemData] = media[itemData].length-1;
			loadImage(image,media[itemData][mediaIndex[itemData]]);
		}
	});
	item.on("vclick", ".take-photo", function(event) {
		// capture callback
		var item = $(this).parents(".diary-item");
		var itemData = item.data("data");
		var image = $(item.find(".cuisine-image").get(0)).find("img").get(0);
		try {
			var captureSuccess = function(mediaFiles) {    
				var i, path, len;    
				for (i = 0, len = mediaFiles.length; i < len; i += 1) {        
					path = mediaFiles[i].fullPath;        // do something interesting with the file  
					mediaIndex[itemMedia] = media[itemMedia].length;  
					media[itemMedia].push(path);
					loadImage(image,media[itemData][mediaIndex[itemData]]);
					item.addClass("changed");
				}
			};
			// capture error callback
			var captureError = function(error) {    
				navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
			};
			// start image capture
			navigator.device.capture.captureImage(captureSuccess, captureError);
		} catch (e) {
			alert(e);
		}
	});
	
	return item;
}
function addDiaryItemCuisine(item) {
	var cuisine = $(".diary-item-cuisine-template").clone();
	cuisine.appendTo(item.find(".diary-item-cuisines")).removeClass("diary-item-cuisine-template").addClass("diary-item-cuisine");
	cuisine.addClass("new");
	cuisine.find("[data-role='none']").removeAttr("data-role");
	cuisine.trigger("create");
	
	cuisine.on("change",".cuisine-type", function(event) {
		var item = $(this).parent(".diary-item-cuisine").find(".diary-cuisine");
		var db = getDatabase();
		querySameCuisines(db,item,$(this).val());
		item.selectmenu("refresh");
	});
	
	cuisine.on("vclick", ".delete-cuisine", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		$(this).parents(".diary-item").addClass("changed");
		$(this).parents(".diary-item-cuisine").remove();
	});

	cuisine.on("change", ".diary-cuisine", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		$(this).parents(".diary-item").addClass("changed");
	});

	return cuisine;
}
function addCuisineItem() {
	var item = $(".cuisine-item-template").clone();
	item.prependTo(".cuisine-items").removeClass("cuisine-item-template").addClass("cuisine-item").collapsible({ collapsed: false }); 
	item.data("data",cuisineId.length);
	cuisineId.push(-1);
	item.find("select.cuisine-type").selectmenu();
	item.find("select.cuisine-product").slider();
	item.find("[data-role='none']").removeAttr("data-role");
	item.trigger("create");
	item.validate();

	item.on("vclick", ".save", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".cuisine-item");
		if (item.valid()) {
			var itemData = item.data("data");
			var title = item.find("#cuisine-title").val();
			item.find("#cuisine-item-title .ui-btn-text").text(title)
			if (cuisineId[itemData]==-1) {
				saveCuisine(item);
				var option = "<option data-placeholder='false' value='"+cuisineId[itemData]+"'>"+title+"</option>";
				$("select.diary-cuisine,select.planner-cuisine").append(option);
			} else {
				saveCuisine(item);
				$("select.diary-cuisine option[value='"+cuisineId[itemData]+"']").text(title);
				$("select.planner-cuisine option[value='"+cuisineId[itemData]+"']").text(title);
			}
			$(".diary-items select.diary-cuisine,.planner-items select.planner-cuisine").selectmenu("refresh");
			item.removeClass("changed").removeClass("new");
			item.find(".cuisine-product").removeClass("changed").removeClass("new");
			clearAvailable();
			queryAvailable();
			queryForecast();
		}
	});
	
	item.on("vclick", ".delete", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".cuisine-item");
		var itemData = item.data("data");
		$("select.diary-cuisine option[value='"+cuisineId[itemData]+"']").remove();
		$("select.planner-cuisine option[value='"+cuisineId[itemData]+"']").remove();
		$(".diary-items select.diary-cuisine,.planner-items select.planner-cuisine").selectmenu("refresh");
		deleteCuisine(item);
		item.remove();
		clearAvailable();
		queryAvailable();
		queryForecast();
	});
	
	return item;
}
function addPlannerItemCuisine(item) {
	var cuisine = $(".planner-item-cuisine-template").clone();
	cuisine.appendTo(item.find(".planner-item-cuisines")).removeClass("planner-item-cuisine-template").addClass("planner-item-cuisine");
	cuisine.addClass("new");
	cuisine.find("[data-role='none']").removeAttr("data-role");
	cuisine.trigger("create");
	
	cuisine.on("change",".cuisine-type", function(event) {
		var item = $(this).parent(".planner-item-cuisine").find(".planner-cuisine");
		var db = getDatabase();
		querySameCuisines(db,item,$(this).val());
		item.selectmenu("refresh");
	});
	
	cuisine.on("vclick", ".delete-cuisine", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		$(this).parents(".planner-item").addClass("changed");
		$(this).parents(".planner-item-cuisine").remove();
	});

	cuisine.on("change", ".planner-cuisine", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		$(this).parents(".planner-item").addClass("changed");
	});

	return cuisine;
}
function addPlannerItem() {
	var item = $(".planner-item-template").clone();
	item.prependTo(".planner-items").removeClass("planner-item-template").addClass("planner-item").collapsible({ collapsed: false }); 
	item.data("data",plannerId.length);
	plannerId.push(-1);
	item.find("[data-role='none']").removeAttr("data-role");
	item.trigger("create");
	item.validate();

	item.on("vclick", ".add-cuisine", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".planner-item");
		var cuisine = addPlannerItemCuisine(item);
		cuisine.addClass("new");
	});
	
	item.on("vclick", ".release", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".planner-item");
		var diary = addDiaryItem();
		var today = new Date();
		diary.find("#cuisine-datetime").val($.format.date(today,"yyyy-MM-ddTHH:mm"));
		diary.addClass("new");
		item.find("select.planner-cuisine").each(function(index,element) {
			var cuisine = addDiaryItemCuisine(diary);
			var value = $(element).val();
			cuisine.find(".diary-cuisine").val(value);
			cuisine.addClass("new");
        });
		hidePlanner();
		showDiary();
	});
	
	item.on("vclick", ".save", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".planner-item");
		if (item.valid()) {
			var itemData = item.data("data");
			var datetime = new Date(item.find("#cuisine-datetime").val());
			datetime = new Date(datetime.getTime()+datetime.getTimezoneOffset()*60*1000);
			var title = datetime.toLocaleString();
			item.find("#planner-item-title .ui-btn-text").text(title);
			savePlanner(item);
			item.removeClass("changed").removeClass("new");
			item.find(".planner-cuisine").removeClass("changed").removeClass("new");
			clearAvailable();
			queryAvailable();
			queryForecast();
		}
	});
	
	item.on("vclick", ".delete", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".planner-item");
		deletePlanner(item);
		item.remove();
		clearAvailable();
		queryAvailable();
		queryForecast();
	});
	
	return item;
}

function clearDiary() { $(".diary-item").remove(); }
function deleteDiary(item) {
	var itemData = item.data("data");
	try {
		var db = getDatabase();
		
		var queryDelete = function (tx) {
			tx.executeSql("DELETE FROM diary_cuisines WHERE diary_id="+diaryId[itemData]);
			tx.executeSql("DELETE FROM diary WHERE diary_id="+diaryId[itemData]);
		}
		
		var successDelete = function (tx, results) {
		}
			
		db.transaction(queryDelete, errorCB, successDelete);
	} catch (e) {
		alert(e);
	}
}

function saveDiary(item) {
	var itemData = item.data("data");
	var datetime = Data.parse(item.find("#cuisine-datetime").val());
	try {
		var db = getDatabase();
		
		if (diaryId[itemData] == -1) {
			var queryInsert = function (tx) {
				tx.executeSql("INSERT INTO diary(cuisine_datetime) VALUES ("+datetime+")");
			}
			
			var successInsert = function (tx, results) {
				diaryId[itemData] = results.insertId;
			}
				
			db.transaction(queryInsert, errorCB, successInsert);
		} else {
			var queryUpdate = function (tx) {
				tx.executeSql("UPDATE diary SET cuisine_datetime="+datetime+" WHERE diary_id="+diaryId[itemData]);
			}
			
			var successUpdate = function (tx, results) {
			}
				
			db.transaction(queryUpdate, errorCB, successUpdate);
		}
		
		var queryDelete = function (tx) {
			tx.executeSql("DELETE FROM diary_cuisines WHERE planner_id="+diaryId[itemData]);
		}
		
		var successDelete = function (tx, results) {
		}
			
		db.transaction(queryDelete, errorCB, successDelete);

		item.find("select.diary-cuisine").each(function() {
			var cuisine_id = $(this).val();
	
			var queryInsert = function (tx) {
				tx.executeSql("INSERT INTO diary_cuisines(diary_id,cuisine_id) VALUES ("+diaryId[itemData]+","+cuisine_id+")");
			}
			
			var successInsert = function (tx, results) {
			}
				
			db.transaction(queryInsert, errorCB, successInsert);
		});
	} catch (e) {
		alert(e);
	}
}
function queryDiary() {
	try {
		var db = getDatabase();	
		
		var queryRecords = function (tx) {
			
			var diary_from_datetime = Date.parse($("#diary-from-date"));
			var diary_to_datetime = Date.parse($("#diary-from-date"))+24*60*60*1000;
			var query = "SELECT * FROM diary WHERE cuisine_datetime BETWEEN('"+diary_from_datetime+"','"+diary_to_datetime+"') ORDER BY cuisine_datetime DESC";
			tx.executeSql(query);
		}
		
		var successRecords = function (tx, results) {
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var item = addDiaryItem();
				var itemData = item.data("data");
				diaryId[itemData] = results.rows.item(i).diary_id;
				var datetime = new Date(results.rows.item(i).cuisine_datetime);
				item.find("#cuisine-datetime").val($.format.date(datetime,"yyyy-MM-ddTHH:mm"));
				datetime = new Date(datetime.getTime()+datetime.getTimezoneOffset()*60*1000);
				var title = datetime.toLocaleString();
				item.find("#diary-item-title .ui-btn-text").text(title);
			}
		}
			
		db.transaction(queryRecords, errorCB, successRecords);
		
		$(".diary-item").each(function() {
			var item = $(this);
			var itemData = item.data("data");
	
			var queryCuisines = function (tx) {
				var query = "SELECT cuisine_id,cuisine_type_id FROM diary_cuisines JOIN cuisines ON diary_cuisines.cuisine_id=cuisines.cuisine_id WHERE diary_id = " + diaryId[itemData];
				tx.executeSql(query);
			}
			
			var successCuisines = function (tx, results) {
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					var cuisine = addDiaryItemCuisine(item);
					querySameCuisines(db,cuisine.find("select.diary-cuisine"),results.rows.item(i).cuisine_type_id);
					cuisine.find("select.cuisine-type").val(results.rows.item(i).cuisine_type_id).selectmenu("refresh");
					cuisine.find("select.diary-cuisine").val(results.rows.item(i).cuisine_id).selectmenu("refresh");
				}
			}
				
			db.transaction(queryCuisines, errorCB, successCuisines);
	
			var queryMedia = function (tx) {
				var query = "SELECT * FROM media WHERE diary_id = " + diaryId[itemData];
				tx.executeSql(query);
			}
			
			var successMedia = function (tx, results) {
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					media[itemData].push(results.rows.item(i).full_path);
				}
			}
				
			db.transaction(queryMedia, errorCB, successMedia);
		});
	} catch (e) {
		alert(e);
	}
}
function clearPlanner() { $(".planner-item").remove(); }
function deletePlanner(item) {
	var itemData = item.data("data");
	try {
		var db = getDatabase();
		
		var queryDelete = function (tx) {
			tx.executeSql("DELETE FROM planner_cuisines WHERE planner_id="+plannerId[itemData]);
			tx.executeSql("DELETE FROM planner WHERE planner_id="+plannerId[itemData]);
		}
		
		var successDelete = function (tx, results) {
		}
			
		db.transaction(queryDelete, errorCB, successDelete);
	} catch (e) {
		alert(e);
	}
}

function savePlanner(item) {
	var itemData = item.data("data");
	var datetime = Data.parse(item.find("#cuisine-datetime").val());
	try {
		var db = getDatabase();
		
		if (plannerId[itemData] == -1) {
			var queryInsert = function (tx) {
				tx.executeSql("INSERT INTO planner(cuisine_datetime) VALUES ("+datetime+")");
			}
			
			var successInsert = function (tx, results) {
				plannerId[itemData] = results.insertId;
			}
				
			db.transaction(queryInsert, errorCB, successInsert);
		} else {
			var queryUpdate = function (tx) {
				tx.executeSql("UPDATE planner SET cuisine_datetime="+datetime+" WHERE planner_id="+plannerId[itemData]);
			}
			
			var successUpdate = function (tx, results) {
			}
				
			db.transaction(queryUpdate, errorCB, successUpdate);
		}
		
		var queryDelete = function (tx) {
			tx.executeSql("DELETE FROM planner_cuisines WHERE planner_id="+plannerId[itemData]);
		}
		
		var successDelete = function (tx, results) {
		}
			
		db.transaction(queryDelete, errorCB, successDelete);

		item.find("select.planner-cuisine").each(function() {
			var cuisine_id = $(this).val();
	
			var queryInsert = function (tx) {
				tx.executeSql("INSERT INTO planner_cuisines(planner_id,cuisine_id) VALUES ("+plannerId[itemData]+","+cuisine_id+")");
			}
			
			var successInsert = function (tx, results) {
			}
				
			db.transaction(queryInsert, errorCB, successInsert);
		});
	} catch (e) {
		alert(e);
	}
}
function queryPlanner() {
	try {
		var db = getDatabase();
	
		var queryRecords = function (tx) {
			var planner_from_datetime = Date.parse($("#planner-from-date"));
			var planner_to_datetime = Date.parse($("#planner-from-date"))+24*60*60*1000;
			var query = "SELECT * FROM planner WHERE cuisine_datetime BETWEEN('"+planner_from_datetime+"','"+planner_to_datetime+"') ORDER BY cuisine_datetime ASC";
			tx.executeSql(query);
		}
		
		var successRecords = function (tx, results) {
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var item = addPlannerItem();
				var itemData = item.data("data");
				plannerId[itemData] = results.rows.item(i).planner_id;
				var datetime = new Date(results.rows.item(i).cuisine_datetime);
				item.find("#cuisine-datetime").val($.format.date(datetime,"yyyy-MM-ddTHH:mm"));
				datetime = new Date(datetime.getTime()+datetime.getTimezoneOffset()*60*1000);
				var title = datetime.toLocaleString();
				item.find("#planner-item-title .ui-btn-text").text(title);
			}
		}
			
		db.transaction(queryRecords, errorCB, successRecords);
		
		$(".planner-item").each(function() {
			var item = $(this);
			var itemData = item.data("data");
	
			var queryCuisines = function (tx) {
				var query = "SELECT * FROM planner_cuisines JOIN cuisines ON planner_cuisines.cuisine_id=cuisines.cuisine_id WHERE planner_id = " + plannerId[itemData];
				tx.executeSql(query);
			}
			
			var successCuisines = function (tx, results) {
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					var cuisine = addPlannerItemCuisine(item);
					querySameCuisines(db,cuisine.find("select.planner-cuisine"),results.rows.item(i).cuisine_type_id);
					cuisine.find("select.cuisine-type").val(results.rows.item(i).cuisine_type_id).selectmenu("refresh");
					cuisine.find("select.planner-cuisine").val(results.rows.item(i).cuisine_id).selectmenu("refresh");
				}
			}
				
			db.transaction(queryCuisines, errorCB, successCuisines);
		});
	} catch (e) {
		alert(e);
	}
}

function deleteCuisine(item) {
	var itemData = item.data("data");
	try {
		var db = getDatabase();
		
		var queryDelete = function (tx) {
			tx.executeSql("DELETE FROM cuisine_products WHERE cuisine_id="+cuisineId[itemData]);
			tx.executeSql("DELETE FROM planner_cuisines WHERE cuisine_id="+cuisineId[itemData]);
			tx.executeSql("DELETE FROM diary_cuisines WHERE cuisine_id="+cuisineId[itemData]);
			tx.executeSql("DELETE FROM cuisines WHERE cuisine_id="+cuisineId[itemData]);
		}
		
		var successDelete = function (tx, results) {
		}
			
		db.transaction(queryDelete, errorCB, successDelete);
	} catch (e) {
		alert(e);
	}
}

function saveCuisine(item) {
	var itemData = item.data("data");
	var title = item.find("#cuisine-title").val();
	try {
		var db = getDatabase();
		
		if (cuisineId[itemData] == -1) {
			var queryInsert = function (tx) {
				tx.executeSql("INSERT INTO cuisines(cuisine_title) VALUES ('"+title+"')");
			}
			
			var successInsert = function (tx, results) {
				cuisineId[itemData] = results.insertId;
			}
				
			db.transaction(queryInsert, errorCB, successInsert);
		} else {
			var queryUpdate = function (tx) {
				tx.executeSql("UPDATE cuisines SET cuisine_title='"+title+"' WHERE cuisine_id="+cuisineId[itemData]);
			}
			
			var successUpdate = function (tx, results) {
			}
				
			db.transaction(queryUpdate, errorCB, successUpdate);
		}
		
		var queryDelete = function (tx) {
			tx.executeSql("DELETE FROM cuisine_products WHERE cuisine_id="+cuisineId[itemData]);
		}
		
		var successDelete = function (tx, results) {
		}
			
		db.transaction(queryDelete, errorCB, successDelete);

		item.find(".cuisine-product").each(function() {
			var product_id = $(this).data("product-id");
			var cuisine_product_qty = $(this).find("#cuisine-"+product_id).val();
	
			var queryInsert = function (tx) {
				tx.executeSql("INSERT INTO cuisine_products(cuisine_id,product_id,cuisine_product_qty) VALUES ("+cuisineId[itemData]+",'"+product_id+"',"+cuisine_product_qty+")");
			}
			
			var successInsert = function (tx, results) {
			}
				
			db.transaction(queryInsert, errorCB, successInsert);
		});
	} catch (e) {
		alert(e);
	}
}
function queryCuisines() {
	try {
		var db = getDatabase();
			
		var querySelect = function (tx) {
			tx.executeSql("SELECT * FROM cuisines");
		}
		
		var successSelect = function (tx, results) {
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var item = addCuisineItem();
				var itemData = item.data("data");
				cuisineId[itemData] = results.rows.item(i).cuisine_id;
				var title = results.rows.item(i).cuisine_title;
				var type = results.rows.item(i).cuisine_type_id;
				item.find("#cuisine-title").val(title);
				item.find("#cuisine-type").val(type).selectmenu("refresh");
				item.find(".cuisine-item-title .ui-btn-text").text(title)
			}
		}
			
		db.transaction(querySelect, errorCB, successSelect);
		
		$(".cuisine-item").each(function() {
			var item = $(this);
			var itemData = item.data("data");
	
			var querySelect = function (tx) {
				tx.executeSql("SELECT * FROM cuisine_products WHERE cuisine_id = " + cuisineId[itemData]);
			}
			
			var successSelect = function (tx, results) {
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					item.find("#cuisine-"+results.rows.item(i).product_id).val(results.rows.item(i).cuisine_product_qty);
				}
			}
				
			db.transaction(querySelect, errorCB, successSelect);	
		});
	} catch (e) {
		alert(e);
	}
}

function queryLimits() {
	try {
		var db = getDatabase();	
		
		var querySelect = function (tx) {
			var query = "SELECT * FROM diet";
			tx.executeSql(query);
		}
		
		var successSelect = function (tx, results) {
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				$("#limit-"+results.rows.item(i).product_id+"-qty").val(results.rows.item(i).product_qty);
				$("#limit-"+results.rows.item(i).product_id+"-period").val(results.rows.item(i).product_period_id);
			}
		}
			
		db.transaction(querySelect, errorCB, successSelect);
		
	} catch (e) {
		alert(e);
	}
}

function saveLimits() {
	try {
		var db = getDatabase();
	
		var queryDelete = function (tx) {
			var query = "DELETE FROM diet";
			tx.executeSql(query);
		}
		
		var successDelete = function (tx, results) {
		}
			
		db.transaction(queryDelete, errorCB, successDelete);
		
		$(".limit-product").each(function() {
			var item = $(this);
			var id = item.data("product-id");
			var qty = item.find("#limit-"+id+"-qty").val();
			var period = item.find("#limit-"+id+"-period").val();
			
			var queryInsert = function (tx) {
				var query = "INSERT INTO diet(product_id,product_qty,product_period_id) VALUES ('"+id+"','"+qty+"','"+period+"')";
				tx.executeSql(query);
			}
			
			var successInsert = function (tx, results) {
			}
				
			db.transaction(queryInsert, errorCB, successInsert);
		});
		
	} catch (e) {
		alert(e);
	}
}
function queryForecast() {
	var datetime = Date.parse($("#forecast-date").val());
	var product_id = Array();
	var product_qty = Array();
	
	try {
		var db = getDatabase();
		
		var querySelectDiet = function (tx) {
			var query = "SELECT diet.product_id AS product_id,diet.product_qty AS product_qty FROM diet"
			tx.executeSql(query);
		}
		var querySelectDiary = function (tx) {
			var query = "SELECT cuisines.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty FROM cuisines"
			+" JOIN diary_cuisines ON diary_cuisines.cuisine_id=cuisines.cuisine_id"
			+" JOIN diary ON diary.diary_id=diary_cuisines.diary_id"
			+" JOIN diet ON diet.product_id=cuisines.product_id"
			+" JOIN periods ON diet.product_period_id=periods.period_id"
			+" WHERE diary.cuisine_datetime BETWEEN("+datetime+"-periods.period_delay,"+datetime+")"
			+" GROUP BY cuisines.product_id";
			tx.executeSql(query);
		}
		var querySelectPlanner = function (tx) {
			var query = "SELECT cuisines.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty FROM cuisines"
			+" JOIN planner_cuisines ON planner_cuisines.cuisine_id=cuisines.cuisine_id"
			+" JOIN planner ON planner.planner_id=planner_cuisines.planner_id"
			+" JOIN diet ON diet.product_id=cuisines.product_id"
			+" JOIN periods ON diet.product_period_id=periods.period_id"
			+" WHERE planner.cuisine_datetime BETWEEN("+datetime+"-periods.period_delay,"+datetime+")"
			+" GROUP BY cuisines.product_id";
			tx.executeSql(query);
		}
		
		var successSelect = function (tx, results) {
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var index = product_id.indexOf(results.rows.item(i).product_id);
				if (index == -1) {
					product_id.push(results.rows.item(i).product_id);
					product_qty.push(results.rows.item(i).product_qty);
				} else {
					product_qty[index] += results.rows.item(i).product_qty;
				}
			}
		}
			
		db.transaction(querySelectDiet, errorCB, successSelect);
		db.transaction(querySelectDiary, errorCB, successSelect);
		db.transaction(querySelectPlanner, errorCB, successSelect);
		
		product_qty.forEach(function(value,index) {
			if (value<0) product_qty[index]=0;
		});
		
	} catch (e) {
		alert(e);
	}
	
	$("input[id^='forecast']").val(0);
	product_qty.forEach(function(value,index) {
		$("#forecast-"+product_id[index]).val(product_qty[index]).slider("refresh");
	});
}

function clearAvailable() {
	$(".available-cuisine").remove();
}
function queryAvailable() {
	var datetime = Date.parse($("#available-date").val());
	var product_id = Array();
	var product_qty = Array();
	var cuisine_id = Array();
	
	try {
		var db = getDatabase();
		
		var querySelectDiet = function (tx) {
			var query = "SELECT diet.product_id AS product_id,diet.product_qty AS product_qty FROM diet"
			tx.executeSql(query);
		}
		var querySelectDiary = function (tx) {
			var query = "SELECT cuisines.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty FROM cuisines"
			+" JOIN diary_cuisines ON diary_cuisines.cuisine_id=cuisines.cuisine_id"
			+" JOIN diary ON diary.diary_id=diary_cuisines.diary_id"
			+" JOIN diet ON diet.product_id=cuisines.product_id"
			+" JOIN periods ON diet.product_period_id=periods.period_id"
			+" WHERE diary.cuisine_datetime BETWEEN("+datetime+"-periods.period_delay,"+datetime+")"
			+" GROUP BY cuisines.product_id";
			tx.executeSql(query);
		}
		var querySelectPlanner = function (tx) {
			var query = "SELECT cuisines.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty FROM cuisines"
			+" JOIN planner_cuisines ON planner_cuisines.cuisine_id=cuisines.cuisine_id"
			+" JOIN planner ON planner.planner_id=planner_cuisines.planner_id"
			+" JOIN diet ON diet.product_id=cuisines.product_id"
			+" JOIN periods ON diet.product_period_id=periods.period_id"
			+" WHERE planner.cuisine_datetime BETWEEN("+datetime+"-periods.period_delay,"+datetime+")"
			+" GROUP BY cuisines.product_id";
			tx.executeSql(query);
		}
		
		var successSelect = function (tx, results) {
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var index = product_id.indexOf(results.rows.item(i).product_id);
				if (index == -1) {
					product_id.push(results.rows.item(i).product_id);
					product_qty.push(results.rows.item(i).product_qty);
				} else {
					product_qty[index] += results.rows.item(i).product_qty;
				}
			}
		}
			
		db.transaction(querySelectDiet, errorCB, successSelect);
		db.transaction(querySelectDiary, errorCB, successSelect);
		db.transaction(querySelectPlanner, errorCB, successSelect);
		
		product_qty.forEach(function(value,index) {
			if (value<0) product_qty[index]=0;
		});
		
		var querySelectCuisine = function (tx) {
			var query = "SELECT cuisine_id FROM cuisines";
			tx.executeSql(query);
		}
		var successSelectCuisine = function (tx, results) {
			cuisine_id = Array();
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				cuisine_id.push(results.rows.item(i).cuisine_id);
			}
		}
		db.transaction(querySelectCuisine, errorCB, successSelectCuisine);
		
		product_qty.forEach(function(value,index) {
			var querySelectCuisine = function (tx) {
				var query = "SELECT cuisine_id FROM cuisine_products"
				+" WHERE cuisine_id IN("+cuisine_id.join(",")+")"
				+" AND product_id="+product_id[index]
				+" AND cuisine_product_qty<="+product_qty[index];
				tx.executeSql(query);
			}
			db.transaction(querySelectCuisine, errorCB, successSelectCuisine);
		});

		var querySelect = function (tx) {
			var query = "SELECT * FROM cuisines"
			+" WHERE cuisine_id IN("+cuisine_id.join(",")+")";
			tx.executeSql(query);
		}
		var successSelect = function (tx, results) {
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var item = $(".available-cuisine-template").clone();
				item.data("cuisine-id",results.rows.item(i).cuisine_id);
				item.find(".available-cuisine-id").removeClass("available-cuisine-id").addClass("available-"+results.rows.item(i).cuisine_id);
				item.find("#available-cuisine-id").attr("id", "available-"+results.rows.item(i).cuisine_id).attr("name", "available-"+results.rows.item(i).cuisine_id);
				item.find("label[for='available-cuisine-id']").attr("for","available-"+results.rows.item(i).cuisine_id).text(results.rows.item(i).cuisine_title);
				item.appendTo(".available-cuisines").removeClass("available-cuisine-template").addClass("available-cuisine"); 
			}
		}
		db.transaction(querySelectCuisine, errorCB, successSelectCuisine);
		
		
	} catch (e) {
		alert(e);
	}
}

function hideAll() {
	hideForecast();
	hideDiary();
	hideLimits();
	hideCuisines();
	hidePlanner();
	hideAvailable();
}

function createDatabase() {
	try {
		var db = getDatabase();
	
		var populateDB = function (tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS periods (period_id VARCHAR(255) NOT NULL PRIMARY KEY,period_title VARCHAR(255),period_delay BIGINT)");
			tx.executeSql("CREATE TABLE IF NOT EXISTS cuisine_types (cuisine_type_id VARCHAR(255) NOT NULL PRIMARY KEY,cuisine_type_title VARCHAR(255))");
			tx.executeSql("CREATE TABLE IF NOT EXISTS diet (product_id VARCHAR(255) NOT NULL PRIMARY KEY,product_title VARCHAR(255),product_qty int,product_period_id VARCHAR(255))");
			tx.executeSql("CREATE TABLE IF NOT EXISTS cuisines (cuisine_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,cuisine_type_id VARCHAR(255),cuisine_title VARCHAR(255))");
			tx.executeSql("CREATE TABLE IF NOT EXISTS cuisine_products (cuisine_id INTEGER,product_id INTEGER,cuisine_product_qty INTEGER)");
			tx.executeSql("CREATE TABLE IF NOT EXISTS planner (planner_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,cuisine_datetime BIGINT)");
			tx.executeSql("CREATE TABLE IF NOT EXISTS planner_cuisines (planner_id INTEGER,cuisine_id INTEGER)");
			tx.executeSql("CREATE TABLE IF NOT EXISTS diary (diary_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,cuisine_datetime BIGINT)");
			tx.executeSql("CREATE TABLE IF NOT EXISTS diary_cuisines (diary_id INTEGER,cuisine_id INTEGER)");
			tx.executeSql("CREATE TABLE IF NOT EXISTS media (diary_id INTEGER,full_path VARCHAR(255))");

			tx.executeSql("DELETE FROM periods");
			periods.forEach(function(value,index) {
				tx.executeSql("INSERT INTO periods(period_id,period_title,period_delay) VALUES ('"+value.id+"','"+value.title+"',"+value.delay+")");
			});
			tx.executeSql("DELETE FROM cuisine_types");
			cuisineTypes.forEach(function(value,index) {
				tx.executeSql("INSERT INTO cuisine_types(cuisine_type_id,cuisine_type_title) VALUES ('"+value.id+"','"+value.title+"')");
			});
		}
		
		db.transaction(populateDB, errorCB, successCB);
	} catch (e) {
		alert(e);
	}
}
function querySameCuisines(db,item,cuisineTypeId) {
	try {
		var querySame = function (tx) {
			var query = "SELECT * FROM cuisines WHERE cuisine_type_id = '"+cuisineTypeId+"'";
			tx.executeSql(query);
		}
		var successSame = function (tx, results) {
			item.find("option[data-placeholder='false']").remove();
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var option = "<option data-placeholder='false' value='"+results.rows.item(i).cuisine_id+"'>"+results.rows.item(i).cuisine_title+"</option>";
				item.append(option);
			}
		}
		db.transaction(querySame, errorCB, successSame);
	} catch (e) {
		alert(e);
	}
}

$(document).on ('pageinit', '#main', function (event) {
	hideAll();

	for(i=1; i<10 ; i++) {
		var option = "<option value='"+i+"'>"+i+" раз"+"</option>";
		$("#limit-product-id-qty").append(option);
	}

	periods.forEach(function(value,index) {
		var option = "<option value='"+value.id+"'>"+value.title+"</option>";
		$("#limit-product-id-period").append(option);
	});
	
	cuisineTypes.forEach(function(value,index) {
		var option = "<option value='"+value.id+"'>"+value.title+"</option>";
		$("select.cuisine-type").append(option);
	});
	
	products.forEach(function(value,index) {
		var item = $(".cuisine-item-product-template").clone();
		item.removeClass("cuisine-item-product-template").addClass("cuisine-item-product");
		item.find(".cuisine-product-id").removeClass("cuisine-product-id").addClass("cuisine-"+value.id);
		item.find("#cuisine-product-id").attr("id", "cuisine-"+value.id).attr("name", "cuisine-"+value.id);
		item.find("label[for='cuisine-product-id']").attr("for","cuisine-"+value.id).text(value.title);
		item.appendTo(".cuisine-item-products");
		item.find("select[data-role='none']").attr("data-role","slider");
		item.find("[data-role='none']").removeAttr("data-role");
	});
		
	products.forEach(function(value,index) {
		var item = $(".forecast-product-template").clone();
		item.removeClass("forecast-product-template").addClass("forecast-product");
		item.find(".forecast-product-id").removeClass("forecast-product-id").addClass("forecast-"+value.id);
		item.find("#forecast-product-id").attr("id", "forecast-"+value.id).attr("name", "forecast-"+value.id);
		item.find("label[for='forecast-product-id']").attr("for","forecast-"+value.id).text(value.title);
		item.find("#forecast-"+value.id).attr("min",0).attr("max",value.qty).val(1);
		item.appendTo(".forecast-products");
		item.find("[data-role='none']").removeAttr("data-role");
		item.trigger("create");
	});
		
	products.forEach(function(value,index) {
		var item = $(".limit-product-template").clone();
		item.removeClass("limit-product-template").addClass("limit-product");
		item.data("product-id",value.id);
		item.find("#limit-product-id").attr("id", "limit-"+value.id).attr("name", "limit-"+value.id).text(value.title);
		item.find("#limit-product-id-qty").attr("id", "limit-"+value.id+"-qty").attr("name", "limit-"+value.id+"-qty").val(value.qty);
		item.find("#limit-product-id-period").attr("id", "limit-"+value.id+"-period").attr("name", "limit-"+value.id+"-period").val(value.period);
		item.find("label[for='limit-product-id']").attr("for","limit-"+value.id);
		item.find("label[for='limit-product-id-qty']").attr("for","limit-"+value.id+"-qty");
		item.find("label[for='limit-product-id-period']").attr("for","limit-"+value.id+"-period");
		item.appendTo(".limit-products");
		item.find("[data-role='none']").removeAttr("data-role");
		item.trigger("create");
	});
	$("#limits select").selectmenu();
	
	var today = new Date();
	$("#forecast-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#available-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#diary-from-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#diary-to-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#planner-from-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#planner-to-date").val($.format.date(today,"yyyy-MM-dd"));

	createDatabase();
	
	queryLimits();
	saveLimits();
	
	queryCuisines();
	
	$(".cuisine-item").each(function (index,element) {
		var item = $(element);
		var itemData = item.data("data");
		var title = item.find("#cuisine-title").val();
		var option = "<option data-placeholder='false' value='"+cuisineId[itemData]+"'>"+title+"</option>";
		$("select.diary-cuisine,select.planner-cuisine").append(option);
	});
	
	queryAvailable();
	queryForecast();
	queryPlanner();
	queryDiary();

	showAvailable();
		
	$(".planner-link").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		hideAll();
		showPlanner();
	});
	$(".cuisines-link").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		hideAll();
		showCuisines();
	});
	$(".forecast-link").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		hideAll();
		showForecast();
	});
	$(".available-link").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		hideAll();
		showAvailable();
	});
	$(".limits-link").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		hideAll();
		showLimits();
	});
	$(".diary-link").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		hideAll();
		showDiary();
	});

	$("#available .plan").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = addPlannerItem();
		$(".available-cuisine").each(function(index,element) {
			var value = $(element).data("cuisine-id");
			var checked = $(element).find("#available-"+value+":checked");
			if (checked.length > 0) {
				var cuisine = addPlannerItemCuisine(item);
				cuisine.find(".planner-cuisine").val(value);
				cuisine.addClass("new");
			}
		});
		item.addClass("new");
		hideAvailable();
		showPlanner();
	});
	$("#cuisines .add").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = addCuisineItem();
		item.addClass("new");
	});
	$("#diary .add").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = addDiaryItem();
		item.addClass("new");
		var today = new Date();
		item.find("#cuisine-datetime").val($.format.date(today,"yyyy-MM-ddTHH:mm"));
		var cuisine = addDiaryItemCuisine(item);
		cuisine.addClass("new");
	});
	$("#planner .add").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = addPlannerItem();
		item.addClass("new");
		var today = new Date();
		item.find("#cuisine-datetime").val($.format.date(today,"yyyy-MM-ddTHH:mm"));
		var cuisine = addPlannerItemCuisine(item);
		cuisine.addClass("new");
	});

	$("#forecast .today").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		$("#forecast-date").val($.format.date(today,"yyyy-MM-dd"));
		queryForecast();
	});
	$("#forecast .tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
		$("#forecast-date").val($.format.date(tomorrow,"yyyy-MM-dd"));
		queryForecast();
	});
	$("#forecast .day-after-tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
		$("#forecast-date").val($.format.date(dayAfterTomorrow,"yyyy-MM-dd"));
		queryForecast();
	});
	$("#forecast .next-week").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var week = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
		$("#forecast-date").val($.format.date(week,"yyyy-MM-dd"));
		queryForecast();
	});
	$("#forecast .next-month").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var month = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
		$("#forecast-date").val($.format.date(month,"yyyy-MM-dd"));
		queryForecast();
	});
	$("#forecast .custom").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		queryForecast();
	});

	$("#available .today").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		$("#available-date").val($.format.date(today,"yyyy-MM-dd"));
		clearAvailable();
		queryAvailable();
	});
	$("#available .tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
		$("#available-date").val($.format.date(tomorrow,"yyyy-MM-dd"));
		clearAvailable();
		queryAvailable();
	});
	$("#available .day-after-tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
		$("#available-date").val($.format.date(dayAfterTomorrow,"yyyy-MM-dd"));
		clearAvailable();
		queryAvailable();
	});
	$("#available .next-week").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var week = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
		$("#available-date").val($.format.date(week,"yyyy-MM-dd"));
		clearAvailable();
		queryAvailable();
	});
	$("#available .next-month").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var month = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
		$("#available-date").val($.format.date(month,"yyyy-MM-dd"));
		clearAvailable();
		queryAvailable();
	});
	$("#available .custom").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		clearAvailable();
		queryAvailable();
	});

	$("#planner .today").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		$("#planner-from-date").val($.format.date(today,"yyyy-MM-dd"));
		$("#planner-to-date").val($.format.date(today,"yyyy-MM-dd"));
		clearPlanner();
		queryPlanner();
	});
	$("#planner .tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
		$("#planner-from-date").val($.format.date(tomorrow,"yyyy-MM-dd"));
		$("#planner-to-date").val($.format.date(tomorrow,"yyyy-MM-dd"));
		clearPlanner();
		queryPlanner();
	});
	$("#planner .day-after-tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
		$("#planner-from-date").val($.format.date(dayAfterTomorrow,"yyyy-MM-dd"));
		$("#planner-to-date").val($.format.date(dayAfterTomorrow,"yyyy-MM-dd"));
		clearPlanner();
		queryPlanner();
	});
	$("#planner .next-week").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var week = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
		$("#planner-from-date").val($.format.date(week,"yyyy-MM-dd"));
		$("#planner-to-date").val($.format.date(week,"yyyy-MM-dd"));
		clearPlanner();
		queryPlanner();
	});
	$("#planner .next-month").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var month = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
		$("#planner-from-date").val($.format.date(month,"yyyy-MM-dd"));
		$("#planner-to-date").val($.format.date(month,"yyyy-MM-dd"));
		clearPlanner();
		queryPlanner();
	});
	$("#planner .custom").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		clearPlanner();
		queryPlanner();
	});

	$("#diary .today").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		$("#diary-from-date").val($.format.date(today,"yyyy-MM-dd"));
		$("#diary-to-date").val($.format.date(today,"yyyy-MM-dd"));
		clearDiary();
		queryDiary();
	});
	$("#diary .yesterday").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000));
		$("#diary-from-date").val($.format.date(yesterday,"yyyy-MM-dd"));
		$("#diary-to-date").val($.format.date(yesterday,"yyyy-MM-dd"));
		clearDiary();
		queryDiary();
	});
	$("#diary .day-before-yesterday").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var dayBeforeYesterday = new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000));
		$("#diary-from-date").val($.format.date(dayBeforeYesterday,"yyyy-MM-dd"));
		$("#diary-to-date").val($.format.date(dayBeforeYesterday,"yyyy-MM-dd"));
		clearDiary();
		queryDiary();
	});
	$("#diary .prev-week").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var week = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
		$("#diary-from-date").val($.format.date(week,"yyyy-MM-dd"));
		$("#diary-to-date").val($.format.date(week,"yyyy-MM-dd"));
		clearDiary();
		queryDiary();
	});
	$("#diary .prev-month").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var month = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
		$("#diary-from-date").val($.format.date(month,"yyyy-MM-dd"));
		$("#diary-to-date").val($.format.date(month,"yyyy-MM-dd"));
		clearDiary();
		queryDiary();
	});
	$("#diary .custom").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		clearDiary();
		queryDiary();
	});

	$("#limits .refresh").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		products.forEach(function(value,index) {
			$("#limit-"+value.id+"-qty").val(value.qty).change();
			$("#limit-"+value.id+"-period").val(value.period).change();
		});
	});
	$("#limits .save").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		saveLimits();
	});

});

function fail(error) {        
	navigator.notification.alert('Error code: ' + error.code, null, 'Fail');
}
function errorCB(error) {
	navigator.notification.alert('Error code: ' + error.code, null, 'Database Error');
}
function successCB(tx, results) {
}
			

// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// Cordova is ready
//
function onDeviceReady() {
}
