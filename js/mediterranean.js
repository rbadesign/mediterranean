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
	var createDatabase = function(db) {
		var populateDB = function (tx) {
			console.log("populateDB",'start');
			
			var count = 0;
			var successCreate = function (tx,results) {
				if (++count == 10) {
					var successDeletePerioods = function(tx,results) {
						periods.forEach(function(value,index) {
							var query = "INSERT INTO periods(period_id,period_title,period_delay) VALUES (?,?,?)";
							console.log(query,[value.id,value.title,value.delay]);
							tx.executeSql(query,[value.id,value.title,value.delay],successCB,errorCB);
						});
					}
					
					tx.executeSql("DELETE FROM periods",[],successDeletePerioods,errorCB);
					
					var successDeleteCuisineTypes = function(tx,results) {
						cuisineTypes.forEach(function(value,index) {
							var query = "INSERT INTO cuisine_types(cuisine_type_id,cuisine_type_title) VALUES (?,?)";
							console.log(query,[value.id,value.title]);
							tx.executeSql(query,[value.id,value.title],successCB,errorCB);
						});			
					}
					
					tx.executeSql("DELETE FROM cuisine_types",[],successDeleteCuisineTypes,errorCB);
		
					var successDeleteDiet = function(tx,results) {
						products.forEach(function(value,index) {
							var query = "INSERT INTO diet(product_id,product_title,product_qty,product_period_id) VALUES (?,?,?,?)";
							console.log(query,[value.id,value.title,value.qty,value.period]);
							tx.executeSql(query,[value.id,value.title,value.qty,value.period], successCB, errorCB);
						});
					}
					
					tx.executeSql("DELETE FROM diet",[],successDeleteDiet,errorCB);		
				}
			}
			
			tx.executeSql("CREATE TABLE IF NOT EXISTS periods (period_id VARCHAR(255) NOT NULL PRIMARY KEY,period_title VARCHAR(255),period_delay BIGINT)",[],successCreate,errorCB);
			tx.executeSql("CREATE TABLE IF NOT EXISTS cuisine_types (cuisine_type_id VARCHAR(255) NOT NULL PRIMARY KEY,cuisine_type_title VARCHAR(255))",[],successCreate,errorCB);
			tx.executeSql("CREATE TABLE IF NOT EXISTS diet (product_id VARCHAR(255) NOT NULL PRIMARY KEY,product_title VARCHAR(255),product_qty int,product_period_id VARCHAR(255))",[],successCreate,errorCB);
			tx.executeSql("CREATE TABLE IF NOT EXISTS cuisines (cuisine_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,cuisine_type_id VARCHAR(255),cuisine_title VARCHAR(255))",[],successCreate,errorCB);
			tx.executeSql("CREATE TABLE IF NOT EXISTS cuisine_products (cuisine_id INTEGER,product_id INTEGER,cuisine_product_qty INTEGER)",[],successCreate,errorCB);
			tx.executeSql("CREATE TABLE IF NOT EXISTS planner (planner_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,cuisine_datetime BIGINT)",[],successCreate,errorCB);
			tx.executeSql("CREATE TABLE IF NOT EXISTS planner_cuisines (planner_id INTEGER,cuisine_id INTEGER)",[],successCreate,errorCB);
			tx.executeSql("CREATE TABLE IF NOT EXISTS diary (diary_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,cuisine_datetime BIGINT)",[],successCreate,errorCB);
			tx.executeSql("CREATE TABLE IF NOT EXISTS diary_cuisines (diary_id INTEGER,cuisine_id INTEGER)",[],successCreate,errorCB);
			tx.executeSql("CREATE TABLE IF NOT EXISTS media (diary_id INTEGER,full_path VARCHAR(255))",[],successCreate,errorCB);

			
			console.log("populateDB",'end');
		}
		
		db.transaction(populateDB, errorCB);
	}
	
	return window.openDatabase("mediterranean", "1.0", "Mediterranean diet", 1000000, createDatabase);	
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
function addDiaryItem() {
	var item = $(".diary-item-template").clone();
	item.attr("data-role","collapsible");
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
			var db = getDatabase();
			saveDiary(db,item,function(db) { 
				item.removeClass("changed").removeClass("new");
				item.find(".diary-cuisine").removeClass("changed").removeClass("new");
				clearAvailable();
				queryAvailable(db);
				queryForecast(db);
			});
		}
	});
	
	item.on("vclick", ".delete", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".diary-item");
		var db = getDatabase();
		deleteDiary(db,item,function(db) {
			item.remove();
			clearAvailable();
			queryAvailable(db);
			queryForecast(db);
		});
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
			console.log("error",e);
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
		var item = $("select.diary-cuisine",$(this).parents(".diary-item-cuisine"));
		var cuisineTypeId = $(this).val();
		var db = getDatabase();
		querySameCuisines(db,item,cuisineTypeId)
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
	item.attr("data-role","collapsible");
	item.prependTo(".cuisine-items").removeClass("cuisine-item-template").addClass("cuisine-item").collapsible({ collapsed: false }); 
	item.data("data",cuisineId.length);
	cuisineId.push(-1);
	
	item.find(".cuisine-product").each(function(index,element) {
		$(this).data("product-id", $(".cuisine-item-template").find("#"+$(this).attr("id")).data("product-id"));
	});
	
	item.find("[data-role='none']").removeAttr("data-role");
//	item.find("select.cuisine-type").selectmenu();
	item.find("select.cuisine-product").attr("data-role","slider");
	item.trigger("create");
	item.validate();

	item.on("vclick", ".save", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".cuisine-item");
		if (item.valid()) {
			var itemData = item.data("data");
			var title = item.find("#cuisine-title").val();
			item.find("#cuisine-item-title .ui-btn-text").text(title)
			var db = getDatabase();
			if (cuisineId[itemData]==-1) {
				saveCuisine(db,item,function(db) {
					var option = "<option data-placeholder='false' value='"+cuisineId[itemData]+"'>"+title+"</option>";
					$("select.diary-cuisine,select.planner-cuisine").append(option);
					$(".diary-items select.diary-cuisine,.planner-items select.planner-cuisine").selectmenu("refresh");
					item.removeClass("changed").removeClass("new");
					item.find(".cuisine-product").removeClass("changed").removeClass("new");
					clearAvailable();
					queryAvailable(db);
					queryForecast(db);
				});
			} else {
				saveCuisine(db,item,function(db) {
					$("select.diary-cuisine option[value='"+cuisineId[itemData]+"']").text(title);
					$("select.planner-cuisine option[value='"+cuisineId[itemData]+"']").text(title);
					$(".diary-items select.diary-cuisine,.planner-items select.planner-cuisine").selectmenu("refresh");
					item.removeClass("changed").removeClass("new");
					item.find(".cuisine-product").removeClass("changed").removeClass("new");
					clearAvailable();
					queryAvailable(db);
					queryForecast(db);
				});
			}
		}
	});
	
	item.on("vclick", ".delete", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".cuisine-item");
		var itemData = item.data("data");
		$("select.diary-cuisine option[value='"+cuisineId[itemData]+"']").remove();
		$("select.planner-cuisine option[value='"+cuisineId[itemData]+"']").remove();
		$(".diary-items select.diary-cuisine,.planner-items select.planner-cuisine").selectmenu("refresh");
		var db = getDatabase();
		deleteCuisine(db,item,function(db) {
			item.remove();
			clearAvailable();
			queryAvailable(db);
			queryForecast(db);
		});
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
		var item = $("select.planner-cuisine",$(this).parents(".planner-item-cuisine"));
		var cuisineTypeId = $(this).val();
		var db = getDatabase();
		querySameCuisines(db,item,cuisineTypeId)
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
	item.attr("data-role","collapsible");
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
			cuisine.find("select.diary-cuisine").val(value).selectmenu("refresh");
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
			var db = getDatabase();
			savePlanner(db,item,function(db) {
				item.removeClass("changed").removeClass("new");
				item.find(".planner-cuisine").removeClass("changed").removeClass("new");
				clearAvailable();
				queryAvailable(db);
				queryForecast(db);
			});
		}
	});
	
	item.on("vclick", ".delete", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var item = $(this).parents(".planner-item");
		var db = getDatabase();
		deletePlanner(db,item,function(db) {
			item.remove();
			clearAvailable();
			queryAvailable(db);
			queryForecast(db);
		});
	});
	
	return item;
}

function clearDiary() { $(".diary-item").remove(); }
function deleteDiary(db,item,callback) {
	var itemData = item.data("data");
	var count = 0;
	
	var successDelete = function (tx,results) {
		if (++count==3) {
			callback(db);
		}
	}

	var queryDelete = function (tx) {
		tx.executeSql("DELETE FROM media WHERE diary_id=?",[diaryId[itemData]], successDelete, errorCB);
		tx.executeSql("DELETE FROM diary_cuisines WHERE diary_id=?",[diaryId[itemData]], successDelete, errorCB);
		tx.executeSql("DELETE FROM diary WHERE diary_id=?",[diaryId[itemData]], successDelete, errorCB);
	}
	
	db.transaction(queryDelete, errorCB);
}

function saveDiaryCuisines(db,item,callback) {
	console.log('saveDiaryCuisines','start');
	var itemData = item.data("data");
	var count = 0;
	if (count == item.find("select.diary-cuisine").length) {
		callback(db);
	}
	item.find("select.diary-cuisine").each(function() {
		var cuisine_id = $(this).val();

		var queryInsert = function (tx) {
			
			var successInsert = function (tx, results) {
				console.log('successInsert','start');
				console.log('results',results);
				if (++count == item.find("select.diary-cuisine").length) {
					callback(db);
				}
				console.log('successInsert','end');
			}
			
			var query =	"INSERT INTO diary_cuisines(diary_id,cuisine_id) VALUES (?,?)";
				
			console.log(query,[diaryId[itemData],cuisine_id]);
			tx.executeSql(query,[diaryId[itemData],cuisine_id], successInsert, errorCB);
		}
		
		db.transaction(queryInsert, errorCB);
	});
	console.log('saveDiaryCuisines','end');
}

function saveDiaryMedia(db,item,callback) {
	console.log('saveDiaryMedia','start');
	var itemData = item.data("data");
	var count = 0;
	if (count == media[itemData].length) {
		callback(db);
	}
	media[itemData].forEach(function(value,index) {
		var queryInsert = function (tx) {
			
			var successInsert = function (tx, results) {
				console.log('successInsert','start');
				console.log('results',results);
				if (++count == media[itemData].length) {
					callback(db);
				}
				console.log('successInsert','end');
			}
			
			var query =	"INSERT INTO media(diary_id,full_path) VALUES (?,?)";
				
			console.log(query,[diaryId[itemData],value]);
			tx.executeSql(query,[diaryId[itemData],value], successInsert, errorCB);
		}
		
		db.transaction(queryInsert, errorCB);
	});
	console.log('saveDiaryMedia','end');
}

function saveDiary(db,item,callback) {
	console.log('saveDiary','start');
	var itemData = item.data("data");
	var datetime = Date.parse(item.find("#cuisine-datetime").val());
		
	var diaryReadyDeferred = $.Deferred();
	var diaryCuisinesReadyDeferred = $.Deferred();
	var diaryMediaReadyDeferred = $.Deferred();
	
	$.when(diaryReadyDeferred, diaryCuisinesReadyDeferred, diaryMediaReadyDeferred).then(function() {
		callback(db);
	});

	if (diaryId[itemData] == -1) {
		var queryInsert = function (tx) {
			
			var successInsert = function (tx, results) {
				console.log('successInsert','start');
				console.log('results',results);
				diaryId[itemData] = results.insertId;
				diaryReadyDeferred.resolve();
				saveDiaryCuisines(db, item, function(db) { diaryCuisinesReadyDeferred.resolve(); } );
				saveDiaryMedia(db, item, function(db) { diaryMediaReadyDeferred.resolve(); } );
				console.log('successInsert','end');
			}
				
			tx.executeSql("INSERT INTO diary(cuisine_datetime) VALUES (?)",[datetime], successInsert, errorCB);
		}
		
		db.transaction(queryInsert, errorCB);
	} else {
		var queryUpdate = function (tx) {
			
			var successUpdate = function (tx, results) {
				console.log('successUpdate','start');
				console.log('results',results);
				diaryReadyDeferred.resolve();
				console.log('successUpdate','end');
			}
			
			var query =	"UPDATE diary SET cuisine_datetime=? WHERE diary_id=?";
			console.log(query,[datetime,diaryId[itemData]]);
			tx.executeSql(query,[datetime,diaryId[itemData]], successUpdate, errorCB);
			
			var queryDeleteCuisines = function (tx) {
				
				var successDeleteCuisines = function (tx, results) {
					console.log('successDeleteCuisines','start');
					console.log('results',results);
					saveDiaryCuisines(db, item, function(db) { diaryCuisinesReadyDeferred.resolve(); } );
					console.log('successDeleteCuisines','end');
				}
				
				var query =	"DELETE FROM diary_cuisines WHERE diary_id=?";
				console.log(query,[diaryId[itemData]]);
				tx.executeSql(query,[diaryId[itemData]], successDeleteCuisines, errorCB);
			}
			
			db.transaction(queryDeleteCuisines, errorCB);
			
			var queryDeleteMedia = function (tx) {
				
				var successDeleteMedia = function (tx, results) {
					console.log('successDeleteMedia','start');
					console.log('results',results);
					saveDiaryMedia(db, item, function(db) { diaryMediaReadyDeferred.resolve(); } );
					console.log('successDeleteMedia','end');
				}
				
				var query =	"DELETE FROM media WHERE diary_id=?";
				console.log(query,[diaryId[itemData]]);
				tx.executeSql(query,[diaryId[itemData]], successDeleteMedia, errorCB);
			}
			
			db.transaction(queryDeleteMedia, errorCB);
		}
		
		db.transaction(queryUpdate, errorCB);
	}
	console.log('saveDiary','end');
}
function queryDiary(db) {
	console.log('queryDiary','start');
	try {
		var db = getDatabase();	
		
		var queryRecords = function (tx) {
			
			var successRecords = function (tx, results) {
				console.log('successRecords','start');
				console.log('results',results);
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					var item = addDiaryItem();
					var itemData = item.data("data");
					diaryId[itemData] = results.rows.item(i).diary_id;
					var datetime = new Date(results.rows.item(i).cuisine_datetime);
					datetime = new Date(datetime.getTime()+datetime.getTimezoneOffset()*60*1000);
					item.find("#cuisine-datetime").val($.format.date(datetime,"yyyy-MM-ddTHH:mm"));
					var title = datetime.toLocaleString();
					item.find("#diary-item-title .ui-btn-text").text(title);
				}
				
				$(".diary-item").each(function() {
					var item = $(this);
					var itemData = item.data("data");
			
					var queryCuisines = function (tx) {
						
						var successCuisines = function (tx, results) {
							var len = results.rows.length;
							for (var i=0; i<len; i++){
								var cuisine = addDiaryItemCuisine(item);
								cuisine.find("select.cuisine-type").val(results.rows.item(i).cuisine_type_id);
								cuisine.find("select.diary-cuisine").val(results.rows.item(i).cuisine_id);
//								querySameCuisines(db,$("select.diary-cuisine",cuisine),results.rows.item(i).cuisine_type_id);
							}
							item.find("select").selectmenu("refresh");
						}
							
						var query = "SELECT cuisines.cuisine_id,cuisine_type_id FROM diary_cuisines JOIN cuisines ON diary_cuisines.cuisine_id=cuisines.cuisine_id WHERE diary_id=?";
						
						console.log(query,[diaryId[itemData]]);
						tx.executeSql(query, [diaryId[itemData]], successCuisines, errorCB);
					}
					
					db.transaction(queryCuisines, errorCB);
			
					var queryMedia = function (tx) {
						
						var successMedia = function (tx, results) {
							var len = results.rows.length;
							for (var i=0; i<len; i++){
								media[itemData].push(results.rows.item(i).full_path);
							}
						}
						
						var query = "SELECT * FROM media WHERE diary_id=?";
						
						console.log(query,[diaryId[itemData]]);
						tx.executeSql(query, [diaryId[itemData]], successMedia, errorCB);
					}
					
					db.transaction(queryMedia, errorCB);
				});
				console.log('successRecords','end');
			}
			
			var diary_from_datetime = Date.parse($("#diary-from-date").val());
			var diary_to_datetime = Date.parse($("#diary-to-date").val());
			var query = "SELECT * FROM diary WHERE cuisine_datetime BETWEEN ? AND ? ORDER BY cuisine_datetime DESC";
			
			console.log(query,[diary_from_datetime,diary_to_datetime+24*60*60*1000]);
			tx.executeSql(query, [diary_from_datetime,diary_to_datetime+24*60*60*1000], successRecords, errorCB);
		}
					
		db.transaction(queryRecords, errorCB);
		
	} catch (e) {
		console.log("error",e);
	}
	console.log('queryDiary','end');
}
function clearPlanner() { $(".planner-item").remove(); }
function deletePlanner(db,item,callback) {
	console.log('deletePlanner','start');
	var itemData = item.data("data");
	var count = 0;
	
	var successDelete = function (tx,results) {
		if (++count==2) {
			callback(db);
		}
	}
		
	var queryDelete = function (tx) {
		tx.executeSql("DELETE FROM planner_cuisines WHERE planner_id=?",[plannerId[itemData]], successDelete, errorCB);
		tx.executeSql("DELETE FROM planner WHERE planner_id=?",[plannerId[itemData]], successDelete, errorCB);
	}
	
	db.transaction(queryDelete, errorCB);

	console.log('deletePlanner','end');
}

function savePlannerCuisines(db,item,callback) {
	console.log('savePlannerCuisines','start');
	var itemData = item.data("data");
	var count = 0;
	if (count == item.find("select.planner-cuisine").length) {
		callback(db);
	}
	item.find("select.planner-cuisine").each(function() {
		var cuisine_id = $(this).val();

		var queryInsert = function (tx) {
			
			var successInsert = function (tx, results) {
				console.log('successInsert','start');
				console.log('results',results);
				if (++count == item.find("select.planner-cuisine").length) {
					callback(db);
				}
				console.log('successInsert','end');
			}
			
			var query =	"INSERT INTO planner_cuisines(planner_id,cuisine_id) VALUES (?,?)";
				
			console.log(query,[plannerId[itemData],cuisine_id]);
			tx.executeSql(query,[plannerId[itemData],cuisine_id], successInsert, errorCB);
		}
		
		db.transaction(queryInsert, errorCB);
	});
	console.log('savePlannerCuisines','end');
}

function savePlanner(db,item,callback) {
	console.log('savePlanner','start');
	var itemData = item.data("data");
	var datetime = Date.parse(item.find("#cuisine-datetime").val());
		
	var plannerReadyDeferred = $.Deferred();
	var plannerCuisinesReadyDeferred = $.Deferred();
	
	$.when(plannerReadyDeferred, plannerCuisinesReadyDeferred).then(function() {
		callback(db);
	});

	if (plannerId[itemData] == -1) {
		var queryInsert = function (tx) {
			
			var successInsert = function (tx, results) {
				console.log('successInsert','start');
				console.log('results',results);
				plannerId[itemData] = results.insertId;
				plannerReadyDeferred.resolve();
				savePlannerCuisines(db, item, function(db) { plannerCuisinesReadyDeferred.resolve(); } );
				console.log('successInsert','end');
			}
			
			var query =	"INSERT INTO planner(cuisine_datetime) VALUES (?)";
			
			console.log(query,[datetime]);
			tx.executeSql(query,[datetime], successInsert, errorCB);
		}
		
		db.transaction(queryInsert, errorCB);
	} else {
		var queryUpdate = function (tx) {
			
			var successUpdate = function (tx, results) {
				console.log('successUpdate','start');
				console.log('results',results);
				plannerReadyDeferred.resolve();
				console.log('successUpdate','end');
			}
			
			var query =	"UPDATE planner SET cuisine_datetime=? WHERE planner_id=?";
			console.log(query,[datetime,plannerId[itemData]]);
			tx.executeSql(query,[datetime,plannerId[itemData]], successUpdate, errorCB);
		}
		
		db.transaction(queryUpdate, errorCB);

		var queryDeleteCuisines = function (tx) {

			var successDeleteCuisines = function (tx, results) {
				console.log('successDeleteCuisines','start');
				console.log('results',results);
				savePlannerCuisines(db, item, function(db) { plannerCuisinesReadyDeferred.resolve(); } );
				console.log('successDeleteCuisines','end');
			}
				
			var query =	"DELETE FROM planner_cuisines WHERE planner_id=?";
			console.log(query,[plannerId[itemData]]);
			tx.executeSql(query,[plannerId[itemData]], successDeleteCuisines, errorCB);
		}
		
		db.transaction(queryDeleteCuisines, errorCB);
	}
		
	console.log('savePlanner','end');
}
function queryPlanner(db) {
	console.log('queryPlanner','start');
	
	var queryRecords = function (tx) {
		
		var successRecords = function (tx, results) {
			console.log('successRecords','start');
			console.log('results',results);
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var item = addPlannerItem();
				var itemData = item.data("data");
				plannerId[itemData] = results.rows.item(i).planner_id;
				var datetime = new Date(results.rows.item(i).cuisine_datetime);
				datetime = new Date(datetime.getTime()+datetime.getTimezoneOffset()*60*1000);
				item.find("#cuisine-datetime").val($.format.date(datetime,"yyyy-MM-ddTHH:mm"));
				var title = datetime.toLocaleString();
				item.find("#planner-item-title .ui-btn-text").text(title);
			}
	
			$(".planner-item").each(function() {
				var item = $(this);
				var itemData = item.data("data");
		
				var queryCuisines = function (tx) {
					
					var successCuisines = function (tx, results) {
						var len = results.rows.length;
						for (var i=0; i<len; i++){
							var cuisine = addPlannerItemCuisine(item);
							cuisine.find("select.cuisine-type").val(results.rows.item(i).cuisine_type_id);
							cuisine.find("select.planner-cuisine").val(results.rows.item(i).cuisine_id);
//							querySameCuisines(db,$("select.planner-cuisine",cuisine),results.rows.item(i).cuisine_type_id);
						}
						item.find("select").selectmenu("refresh");
					}
						
					var query = "SELECT cuisines.cuisine_id,cuisine_type_id FROM planner_cuisines JOIN cuisines ON planner_cuisines.cuisine_id=cuisines.cuisine_id WHERE planner_id=?";
					
					console.log(query,[plannerId[itemData]]);
					tx.executeSql(query, [plannerId[itemData]], successCuisines, errorCB);
				}
				
				db.transaction(queryCuisines, errorCB);
			});
			console.log('successRecords','end');
		}
			
		var planner_from_datetime = Date.parse($("#planner-from-date").val());
		var planner_to_datetime = Date.parse($("#planner-to-date").val());
		var query = "SELECT * FROM planner WHERE cuisine_datetime BETWEEN ? AND ? ORDER BY cuisine_datetime ASC";
		
		console.log(query,[planner_from_datetime,planner_to_datetime+24*60*60*1000]);
		tx.executeSql(query, [planner_from_datetime,planner_to_datetime+24*60*60*1000], successRecords, errorCB);
	}
	
	db.transaction(queryRecords, errorCB);

	console.log('queryPlanner','end');
}

function deleteCuisine(db,item,callback) {
	console.log('deleteCuisine','start');
	var itemData = item.data("data");
	var count = 0;
	
	var successDelete = function (tx,results) {
		if (++count==4) {
			callback(db);
		}
	}
	
	var queryDelete = function (tx) {
		tx.executeSql("DELETE FROM cuisine_products WHERE cuisine_id=?",[cuisineId[itemData]], successDelete, errorCB);
		tx.executeSql("DELETE FROM planner_cuisines WHERE cuisine_id=?",[cuisineId[itemData]], successDelete, errorCB);
		tx.executeSql("DELETE FROM diary_cuisines WHERE cuisine_id=?",[cuisineId[itemData]], successDelete, errorCB);
		tx.executeSql("DELETE FROM cuisines WHERE cuisine_id=?",[cuisineId[itemData]], successDelete, errorCB);
	}
	
	db.transaction(queryDelete, errorCB);

	console.log('deleteCuisine','end');
}

function saveCuisineProducts(db,item,callback) {
	console.log('saveCuisineProducts','start');
	var itemData = item.data("data");
	var count = 0;
	if (count == item.find(".cuisine-product").length) {
		callback(db);
	}
	
	item.find(".cuisine-product").each(function() {
		var product_id = $(this).data("product-id");
		var cuisine_product_qty = $(this).val();

		var queryInsert = function (tx) {
			
			var successInsert = function (tx, results) {
				console.log('successInsert','start');
				console.log('results',results);
				if (++count == item.find(".cuisine-product").length) {
					callback(db);
				}
				console.log('successInsert','end');
			}
				
			var query = "INSERT INTO cuisine_products(cuisine_id,product_id,cuisine_product_qty) VALUES (?,?,?)";
			
			console.log(query,[cuisineId[itemData],product_id,cuisine_product_qty]);
			tx.executeSql(query,[cuisineId[itemData],product_id,cuisine_product_qty], successInsert, errorCB);
		}
		
		db.transaction(queryInsert, errorCB);
	});
	console.log('saveCuisineProducts','end');
}

function saveCuisine(db,item,callback) {
	console.log('saveCuisine','start');
	var itemData = item.data("data");
	var title = item.find("#cuisine-title").val();
	var typeId = item.find("#cuisine-type").val();
		
	var cuisineReadyDeferred = $.Deferred();
	var cuisineProductsReadyDeferred = $.Deferred();
	
	$.when(cuisineReadyDeferred, cuisineProductsReadyDeferred).then(function() {
		callback(db);
	});

	if (cuisineId[itemData] == -1) {
		var queryInsert = function (tx) {
			
			var successInsert = function (tx, results) {
				console.log('successInsert','start');
				console.log('results',results);
				cuisineId[itemData] = results.insertId;
				cuisineReadyDeferred.resolve();
				saveCuisineProducts(db, item, function(db) { cuisineProductsReadyDeferred.resolve(); } );
				console.log('successInsert','end');
			}
			
			var query = "INSERT INTO cuisines(cuisine_title,cuisine_type_id) VALUES (?,?)";
				
			console.log(query,[title,typeId]);
			tx.executeSql(query,[title,typeId], successInsert, errorCB);
		}
		
		db.transaction(queryInsert, errorCB);
	} else {
		var queryUpdate = function (tx) {
			var successUpdate = function (tx, results) {
				console.log('successUpdate','start');
				console.log('results',results);
				cuisineReadyDeferred.resolve();
				console.log('successUpdate','end');
			}
			
			var query = "UPDATE cuisines SET cuisine_title=?,cuisine_type_id=? WHERE cuisine_id=?";
			console.log(query,[title,typeId,cuisineId[itemData]]);
			tx.executeSql(query,[title,typeId,cuisineId[itemData]], successUpdate, errorCB);
		}
		
		db.transaction(queryUpdate, errorCB);
		
		var queryDeleteProducts = function (tx) {
			var successDeleteProducts = function (tx, results) {
				console.log('successDeleteProducts','start');
				console.log('results',results);
				saveCuisineProducts(db, item, function(db) { cuisineProductsReadyDeferred.resolve(); } );
				console.log('successDeleteProducts','end');
			}

			var query = "DELETE FROM cuisine_products WHERE cuisine_id=?";
			console.log(query,[cuisineId[itemData]]);
			tx.executeSql(query,[cuisineId[itemData]], successDeleteProducts, errorCB);				
		}
		
		db.transaction(queryDeleteProducts, errorCB);
	}

	console.log('saveCuisine','end');
}
function queryCuisines(db) {
	console.log('queryCuisines','start');
			
	var querySelect = function (tx) {
		
		var successSelect = function (tx, results) {
			console.log('successSelect','start');
			console.log('results',results);
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var item = addCuisineItem();
				var itemData = item.data("data");
				cuisineId[itemData] = results.rows.item(i).cuisine_id;
				var title = results.rows.item(i).cuisine_title;
				var type = results.rows.item(i).cuisine_type_id;
				item.find("#cuisine-title").val(title);
				item.find("#cuisine-type").val(type).selectmenu("refresh");
				item.find("#cuisine-item-title .ui-btn-text").text(title)

				var option = "<option data-placeholder='false' value='"+cuisineId[itemData]+"'>"+title+"</option>";
				$("select.diary-cuisine,select.planner-cuisine").append(option);
			}
			$(".diary-items select.diary-cuisine,.planner-items select.planner-cuisine").selectmenu("refresh");

			$(".cuisine-item").each(function() {
				var item = $(this);
				var itemData = item.data("data");
		
				var querySelect = function (tx) {
					
					var successSelect = function (tx, results) {
						console.log('successSelect','start');
						console.log('results',results);
						var len = results.rows.length;
						for (var i=0; i<len; i++){
							item.find("#cuisine-"+results.rows.item(i).product_id).val(results.rows.item(i).cuisine_product_qty).slider("refresh");
						}
						console.log('successSelect','end');
					}
					
					var query =	"SELECT * FROM cuisine_products WHERE cuisine_id=?";
					
					console.log(query,[cuisineId[itemData]]);
					tx.executeSql(query, [cuisineId[itemData]], successSelect, errorCB);
				}
				
				db.transaction(querySelect, errorCB);	
			});

			console.log('successSelect','end');
		}
		
		var query =	"SELECT * FROM cuisines";	
		
		console.log(query,[]);
		tx.executeSql(query, [], successSelect, errorCB);
	}
	
	db.transaction(querySelect, errorCB);
		
	console.log('queryCuisines','end');
}

function queryLimits(db) {
	console.log('queryLimits','start');
		
	var querySelect = function (tx) {
		
		var successSelect = function (tx, results) {
			console.log('successSelect','start');
			console.log('results',results);
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				$("#limit-"+results.rows.item(i).product_id+"-qty").val(results.rows.item(i).product_qty).selectmenu('refresh');
				$("#limit-"+results.rows.item(i).product_id+"-period").val(results.rows.item(i).product_period_id).selectmenu('refresh');
			}
			console.log('successSelect','end');
		}
			
		var query = "SELECT * FROM diet";
		
		console.log(query,[]);
		tx.executeSql(query, [], successSelect, errorCB);
	}
	
	db.transaction(querySelect, errorCB);
		
	console.log('queryLimits','end');
}

function saveLimits(db,callback) {
	console.log('saveLimits','start');
	
	var count = 0;
	if (count == $(".limit-product").length) {
		callback(db);
	}
	
	var queryDelete = function (tx) {
		
		var successDelete = function (tx,results) {
			$(".limit-product").each(function() {
				var item = $(this);
				var id = item.data("product-id");
				var qty = item.find("#limit-"+id+"-qty").val();
				var period = item.find("#limit-"+id+"-period").val();
				
				var queryInsert = function (tx) {
					
					var successInsert = function (tx, results) {
						console.log('successInsert','start');
						console.log('results',results);
						if (++count == $(".limit-product").length) {
							callback(db);
						}
						console.log('successInsert','end');
					}
						
					var query = "INSERT INTO diet(product_id,product_qty,product_period_id) VALUES (?,?,?)";
					
					console.log(query,[id,qty,period]);
					tx.executeSql(query,[id,qty,period], successInsert, errorCB);
				}
				
				db.transaction(queryInsert, errorCB);
			});
		}
		
		var query = "DELETE FROM diet";
		console.log(query,[]);
		tx.executeSql(query, [], successDelete, errorCB);
	}
	
	db.transaction(queryDelete, errorCB);
	
		
	console.log('saveLimits','end');
}

function queryForecast(db) {
	console.log('queryForecast','start');
	var datetime = Date.parse($("#forecast-date").val());
	
	var querySelect = function (tx) {
		var successSelect = function (tx, results) {
			console.log('successSelect','start');
			console.log('results',results);
			console.log('results.rows',results.rows);
			var product_id = Array();
			var product_qty = Array();
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
			
			product_qty.forEach(function(value,index) {
				if (value<0) product_qty[index]=0;
			});
	
			$(".forecast-products input[id^='forecast']").val(0);
			product_qty.forEach(function(value,index) {
				$("#forecast-"+product_id[index]).val(product_qty[index]).slider("refresh");
			});
			console.log('successSelect','end');
		}
		
		var query = "SELECT product_id,product_qty FROM diet"
		+" UNION ALL"
		+" SELECT cuisine_products.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty FROM cuisine_products"
		+" JOIN diary_cuisines ON diary_cuisines.cuisine_id=cuisine_products.cuisine_id"
		+" JOIN diary ON diary.diary_id=diary_cuisines.diary_id"
		+" JOIN diet ON diet.product_id=cuisine_products.product_id"
		+" JOIN periods ON diet.product_period_id=periods.period_id"
		+" WHERE diary.cuisine_datetime BETWEEN ?-periods.period_delay AND ?"
		+" GROUP BY cuisine_products.product_id"
		+" UNION ALL"
		+" SELECT cuisine_products.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty FROM cuisine_products"
		+" JOIN planner_cuisines ON planner_cuisines.cuisine_id=cuisine_products.cuisine_id"
		+" JOIN planner ON planner.planner_id=planner_cuisines.planner_id"
		+" JOIN diet ON diet.product_id=cuisine_products.product_id"
		+" JOIN periods ON diet.product_period_id=periods.period_id"
		+" WHERE planner.cuisine_datetime BETWEEN ?-periods.period_delay AND ?"
		+" GROUP BY cuisine_products.product_id";
		
		console.log(query,[datetime,datetime+24*60*60*1000,datetime,datetime+24*60*60*1000]);
		tx.executeSql(query,[datetime,datetime+24*60*60*1000,datetime,datetime+24*60*60*1000], successSelect, errorCB);
	}
	
	db.transaction(querySelect, errorCB);
	
	console.log('queryForecast','end');
}

function clearAvailable() {
	$(".available-cuisine").remove();
}

function queryAvailable(db) {
	console.log('queryAvailable','start');
	var datetime = Date.parse($("#available-date").val());
	
	var querySelect = function (tx) {
		var successSelect = function (tx, results) {
			console.log('successSelect','start');
			console.log('results',results);
			console.log('results.rows',results.rows);
			var product_id = Array();
			var product_qty = Array();
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
			
			product_qty.forEach(function(value,index) {
				if (value<0) product_qty[index]=0;
			});
	
			var successSelectCuisine = function (tx, results) {
				console.log('successSelectCuisine','start');
				console.log('results',results);
				var cuisine_id = Array();
				var len = results.rows.length;
				for (var i=0; i<len; i++){
					cuisine_id.push(results.rows.item(i).cuisine_id);
				}
				
				if(product_id.length) {
					var querySelectCuisine = function (tx) {
						var query = "SELECT cuisine_id FROM cuisine_products"
						+" WHERE cuisine_id IN("+cuisine_id.join(",")+")"
						+" AND product_id=?"
						+" AND cuisine_product_qty<=?";
						var id = product_id.pop();
						var qty = product_qty.pop();
						console.log(query,[id,qty]);
						tx.executeSql(query, [id,qty], successSelectCuisine, errorCB);
					}
					
					db.transaction(querySelectCuisine, errorCB);
				} else {
					var querySelectAvailable = function (tx) {
						
						var successSelectAvailable = function (tx, results) {
							console.log('successSelectAvailable','start');
							console.log('results',results);
							var len = results.rows.length;
							for (var i=0; i<len; i++){
								var item = $(".available-cuisine-template").clone();
								item.data("cuisine-id",results.rows.item(i).cuisine_id);
								item.find(".available-cuisine-id").removeClass("available-cuisine-id").addClass("available-"+results.rows.item(i).cuisine_id);
								item.find("#available-cuisine-id").attr("id", "available-"+results.rows.item(i).cuisine_id).attr("name", "available-"+results.rows.item(i).cuisine_id);
								item.find("label[for='available-cuisine-id']").attr("for","available-"+results.rows.item(i).cuisine_id).text(results.rows.item(i).cuisine_title);
								item.appendTo(".available-cuisines").removeClass("available-cuisine-template").addClass("available-cuisine");
								item.find("[data-role='none']").removeAttr("data-role");
								item.trigger("create"); 
							}
							console.log('successSelectAvailable','end');
						}
						
						var query = "SELECT * FROM cuisines"
						+" WHERE cuisine_id IN("+cuisine_id.join(",")+")";
						
						console.log(query,[]);
						tx.executeSql(query, [], successSelectAvailable, errorCB);
					}
					db.transaction(querySelectAvailable, errorCB);
				}
				console.log('successSelectCuisine','end');
			}
		
			var querySelectCuisine = function (tx) {
				
				var query = "SELECT cuisine_id FROM cuisines";
				
				console.log(query,[]);
				tx.executeSql(query, [], successSelectCuisine, errorCB);
			}
			
			db.transaction(querySelectCuisine, errorCB);
			
			console.log('successSelect','end');
		}
		
		var query = "SELECT product_id,product_qty FROM diet"
		+" UNION ALL"
		+" SELECT cuisine_products.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty FROM cuisine_products"
		+" JOIN diary_cuisines ON diary_cuisines.cuisine_id=cuisine_products.cuisine_id"
		+" JOIN diary ON diary.diary_id=diary_cuisines.diary_id"
		+" JOIN diet ON diet.product_id=cuisine_products.product_id"
		+" JOIN periods ON diet.product_period_id=periods.period_id"
		+" WHERE diary.cuisine_datetime BETWEEN ?-periods.period_delay AND ?"
		+" GROUP BY cuisine_products.product_id"
		+" UNION ALL"
		+" SELECT cuisine_products.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty FROM cuisine_products"
		+" JOIN planner_cuisines ON planner_cuisines.cuisine_id=cuisine_products.cuisine_id"
		+" JOIN planner ON planner.planner_id=planner_cuisines.planner_id"
		+" JOIN diet ON diet.product_id=cuisine_products.product_id"
		+" JOIN periods ON diet.product_period_id=periods.period_id"
		+" WHERE planner.cuisine_datetime BETWEEN ?-periods.period_delay AND ?"
		+" GROUP BY cuisine_products.product_id";
		
		console.log(query,[datetime,datetime+24*60*60*1000,datetime,datetime+24*60*60*1000]);
		tx.executeSql(query,[datetime,datetime+24*60*60*1000,datetime,datetime+24*60*60*1000], successSelect, errorCB);
	}
	
	db.transaction(querySelect, errorCB);
		
	console.log('queryAvailable','end');
}

function hideAll() {
	hideForecast();
	hideDiary();
	hideLimits();
	hideCuisines();
	hidePlanner();
	hideAvailable();
}

function querySameCuisines(db,item,cuisineTypeId) {
	console.log('querySameCuisines','start');

	var querySame = function (tx) {
		
		var successSame = function (tx, results) {
			console.log('successSame','start');
			console.log('results',results);
			console.log('results.rows',results.rows);
			console.log('remove',item.find("option[data-placeholder='false']"));
			console.log(item,item.html());
			item.find("option[data-placeholder='false']").remove();
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var option = "<option data-placeholder='false' value='"+results.rows.item(i).cuisine_id+"'>"+results.rows.item(i).cuisine_title+"</option>";
				item.append(option);
			}
			item.selectmenu("refresh");
			console.log('successSame','end');
		}
		
		var query = "SELECT * FROM cuisines WHERE cuisine_type_id=?";
		
		console.log(query,[cuisineTypeId]);
		tx.executeSql(query, [cuisineTypeId], successSame, errorCB);
	}
	db.transaction(querySame, errorCB);

	console.log('querySameCuisines','end');
}

$(document).one( 'pagebeforecreate','#main',function(event){
	console.log('pagebeforecreate','main');

	for(i=1; i<10 ; i++) {
		var option = "<option data-placeholder='false' value='"+i+"'>"+i+" раз"+"</option>";
		$("#limit-product-id-qty").append(option);
	}

	periods.forEach(function(value,index) {
		var option = "<option data-placeholder='false' value='"+value.id+"'>"+value.title+"</option>";
		$("#limit-product-id-period").append(option);
	});
	
	cuisineTypes.forEach(function(value,index) {
		var option = "<option data-placeholder='false' value='"+value.id+"'>"+value.title+"</option>";
		$("select.cuisine-type").append(option);
	});
	
	products.forEach(function(value,index) {
		var item = $(".cuisine-item-product-template").clone();
		item.removeClass("cuisine-item-product-template").addClass("cuisine-item-product");
		item.find(".cuisine-product").data("product-id",value.id);
		item.find(".cuisine-product-id").removeClass("cuisine-product-id").addClass("cuisine-"+value.id);
		item.find("#cuisine-product-id").attr("id", "cuisine-"+value.id).attr("name", "cuisine-"+value.id);
		item.find("label[for='cuisine-product-id']").attr("for","cuisine-"+value.id).text(value.title);
		item.appendTo(".cuisine-item-products");
	});
		
	products.forEach(function(value,index) {
		var item = $(".forecast-product-template").clone();
		item.removeClass("forecast-product-template").addClass("forecast-product");
		item.data("product-id",value.id);
		item.find(".forecast-product-id").removeClass("forecast-product-id").addClass("forecast-"+value.id);
		item.find("#forecast-product-id").attr("id", "forecast-"+value.id).attr("name", "forecast-"+value.id);
		item.find("label[for='forecast-product-id']").attr("for","forecast-"+value.id).text(value.title);
		item.find("#forecast-"+value.id).attr("min",0).attr("max",value.qty).val(1);
		item.appendTo(".forecast-products");
		item.find("[data-role='none']").removeAttr("data-role");
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
	});
});

var deviceReadyDeferred = $.Deferred();
var jqmReadyDeferred = $.Deferred();

$.when(deviceReadyDeferred, jqmReadyDeferred).then(function() {
	console.log('when(deviceReadyDeferred, jqmReadyDeferred).then','start');
	var db = getDatabase();
	queryLimits(db);
	queryCuisines(db);
	queryAvailable(db);
	queryForecast(db);
	queryPlanner(db);
	queryDiary(db);
	console.log('when(deviceReadyDeferred, jqmReadyDeferred).then','end');
});

$(document).on( 'pageshow','#main',function(event){
	console.log('pageshow','main');
});
	
$(document).on( 'pageinit','#main',function(event){
	console.log('pageinit','main');
		
	hideAll();
	showAvailable();
	
	var today = new Date();
	$("#forecast-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#available-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#diary-from-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#diary-to-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#planner-from-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#planner-to-date").val($.format.date(today,"yyyy-MM-dd"));
	
	jqmReadyDeferred.resolve();

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
		var current = new Date(Date.parse($("#available-date").val())+12*60*60*1000);
		var datetime = new Date(current.getTime()+current.getTimezoneOffset()*60*1000);
		item.find("#cuisine-datetime").val($.format.date(datetime,"yyyy-MM-ddTHH:mm"));
		$(".available-cuisine").each(function(index,element) {
			var value = $(element).data("cuisine-id");
			var checked = $(element).find("#available-"+value+":checked");
			if (checked.length) {
				var cuisine = addPlannerItemCuisine(item);
				cuisine.find("select.planner-cuisine").val(value).selectmenu("refresh");
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
		var db = getDatabase();
		queryForecast(db);
	});
	$("#forecast .tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
		$("#forecast-date").val($.format.date(tomorrow,"yyyy-MM-dd"));
		var db = getDatabase();
		queryForecast(db);
	});
	$("#forecast .day-after-tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
		$("#forecast-date").val($.format.date(dayAfterTomorrow,"yyyy-MM-dd"));
		var db = getDatabase();
		queryForecast(db);
	});
	$("#forecast .next-week").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var week = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
		$("#forecast-date").val($.format.date(week,"yyyy-MM-dd"));
		var db = getDatabase();
		queryForecast(db);
	});
	$("#forecast .next-month").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var month = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
		$("#forecast-date").val($.format.date(month,"yyyy-MM-dd"));
		var db = getDatabase();
		queryForecast(db);
	});
	$("#forecast .custom").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var db = getDatabase();
		queryForecast(db);
	});

	$("#available .today").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		$("#available-date").val($.format.date(today,"yyyy-MM-dd"));
		clearAvailable();
		var db = getDatabase();
		queryAvailable(db);
	});
	$("#available .tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
		$("#available-date").val($.format.date(tomorrow,"yyyy-MM-dd"));
		clearAvailable();
		var db = getDatabase();
		queryAvailable(db);
	});
	$("#available .day-after-tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
		$("#available-date").val($.format.date(dayAfterTomorrow,"yyyy-MM-dd"));
		clearAvailable();
		var db = getDatabase();
		queryAvailable(db);
	});
	$("#available .next-week").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var week = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
		$("#available-date").val($.format.date(week,"yyyy-MM-dd"));
		clearAvailable();
		var db = getDatabase();
		queryAvailable(db);
	});
	$("#available .next-month").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var month = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
		$("#available-date").val($.format.date(month,"yyyy-MM-dd"));
		clearAvailable();
		var db = getDatabase();
		queryAvailable(db);
	});
	$("#available .custom").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		clearAvailable();
		var db = getDatabase();
		queryAvailable(db);
	});

	$("#planner .today").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		$("#planner-from-date").val($.format.date(today,"yyyy-MM-dd"));
		$("#planner-to-date").val($.format.date(today,"yyyy-MM-dd"));
		clearPlanner();
		var db = getDatabase();
		queryPlanner(db);
	});
	$("#planner .tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000));
		$("#planner-from-date").val($.format.date(tomorrow,"yyyy-MM-dd"));
		$("#planner-to-date").val($.format.date(tomorrow,"yyyy-MM-dd"));
		clearPlanner();
		var db = getDatabase();
		queryPlanner(db);
	});
	$("#planner .day-after-tomorrow").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var dayAfterTomorrow = new Date(today.getTime() + (2 * 24 * 60 * 60 * 1000));
		$("#planner-from-date").val($.format.date(dayAfterTomorrow,"yyyy-MM-dd"));
		$("#planner-to-date").val($.format.date(dayAfterTomorrow,"yyyy-MM-dd"));
		clearPlanner();
		var db = getDatabase();
		queryPlanner(db);
	});
	$("#planner .next-week").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var week = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
		$("#planner-from-date").val($.format.date(week,"yyyy-MM-dd"));
		$("#planner-to-date").val($.format.date(week,"yyyy-MM-dd"));
		clearPlanner();
		var db = getDatabase();
		queryPlanner(db);
	});
	$("#planner .next-month").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var month = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
		$("#planner-from-date").val($.format.date(month,"yyyy-MM-dd"));
		$("#planner-to-date").val($.format.date(month,"yyyy-MM-dd"));
		clearPlanner();
		var db = getDatabase();
		queryPlanner(db);
	});
	$("#planner .custom").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		clearPlanner();
		var db = getDatabase();
		queryPlanner(db);
	});

	$("#diary .today").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		$("#diary-from-date").val($.format.date(today,"yyyy-MM-dd"));
		$("#diary-to-date").val($.format.date(today,"yyyy-MM-dd"));
		clearDiary();
		var db = getDatabase();
		queryDiary(db);
	});
	$("#diary .yesterday").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var yesterday = new Date(today.getTime() - (24 * 60 * 60 * 1000));
		$("#diary-from-date").val($.format.date(yesterday,"yyyy-MM-dd"));
		$("#diary-to-date").val($.format.date(yesterday,"yyyy-MM-dd"));
		clearDiary();
		var db = getDatabase();
		queryDiary(db);
	});
	$("#diary .day-before-yesterday").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var dayBeforeYesterday = new Date(today.getTime() - (2 * 24 * 60 * 60 * 1000));
		$("#diary-from-date").val($.format.date(dayBeforeYesterday,"yyyy-MM-dd"));
		$("#diary-to-date").val($.format.date(dayBeforeYesterday,"yyyy-MM-dd"));
		clearDiary();
		var db = getDatabase();
		queryDiary(db);
	});
	$("#diary .prev-week").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var week = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
		$("#diary-from-date").val($.format.date(week,"yyyy-MM-dd"));
		$("#diary-to-date").val($.format.date(week,"yyyy-MM-dd"));
		clearDiary();
		var db = getDatabase();
		queryDiary(db);
	});
	$("#diary .prev-month").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var today = new Date();
		var month = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
		$("#diary-from-date").val($.format.date(month,"yyyy-MM-dd"));
		$("#diary-to-date").val($.format.date(month,"yyyy-MM-dd"));
		clearDiary();
		var db = getDatabase();
		queryDiary(db);
	});
	$("#diary .custom").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		clearDiary();
		var db = getDatabase();
		queryDiary(db);
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
		clearAvailable();
		var db = getDatabase();
		saveLimits(db, function(db) { 
			queryAvailable(db);
			queryForecast(db);
		});
	});
});

function fail(error) {        
	console.log('Fail',error);
	navigator.notification.alert('Error code: ' + error.code, null, 'Fail');
}
function errorCB(tx,error) {
	console.log('Database Error',error);
	navigator.notification.alert('Error code: ' + error.code, null, 'Database Error');
}
function successCB(tx, results) {
	console.log('successCB',results);
}
			

// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// Cordova is ready
//
function onDeviceReady() {
	console.log('deviceready');
	deviceReadyDeferred.resolve();
	document.addEventListener("backbutton", handleBackButton, false);
}

function handleBackButton() {
  	console.log("Back Button Pressed!");
    navigator.app.exitApp();
}