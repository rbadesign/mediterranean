// JavaScript Document
var currentLanguage = "ru";

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

var tables = Array(
	{ id:"diet", title:"Диета" },
	{ id:"forecast", title:"Прогноз" },
	{ id:"available", title:"Доступно" },
	{ id:"planner", title:"Планы" },
	{ id:"diary", title:"Дневник" },
	{ id:"cuisine", title:"Блюда" }
);

var itemId = {
	diet: Array(),
	forecast: Array(),
	available:Array(),
	cuisine: Array(),
	diary: Array(),
	planner:Array()
};
var media = {
	diet: Array(),
	forecast: Array(),
	available:Array(),
	cuisine: Array(),
	diary: Array(),
	planner:Array()
};
var mediaIndex = {
	diet: Array(),
	forecast: Array(),
	available:Array(),
	cuisine: Array(),
	diary: Array(),
	planner:Array()
};

function getDatabase() {
	
	return window.openDatabase("mediterranean", "", "Mediterranean diet", 1000000);	
}

function createDatabase(db,callback) {
	var populateDatabase = function (tx) {
		debugWrite("populateDatabase",'start');
		
		var count = 0;
		var queries = Array(
			"CREATE TABLE IF NOT EXISTS periods (period_id VARCHAR(255) NOT NULL PRIMARY KEY,period_title VARCHAR(255),period_delay BIGINT)",
			"CREATE TABLE IF NOT EXISTS cuisine_types (cuisine_type_id VARCHAR(255) NOT NULL PRIMARY KEY,cuisine_type_title VARCHAR(255))",
			"CREATE TABLE IF NOT EXISTS diet (product_id VARCHAR(255) NOT NULL PRIMARY KEY,product_title VARCHAR(255),product_qty int,product_period_id VARCHAR(255))",
			"CREATE TABLE IF NOT EXISTS cuisine (cuisine_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,cuisine_type_id VARCHAR(255),cuisine_title VARCHAR(255))",
			"CREATE TABLE IF NOT EXISTS cuisine_product (cuisine_id INTEGER,product_id INTEGER,cuisine_product_qty INTEGER)",
			"CREATE TABLE IF NOT EXISTS cuisine_media (cuisine_id INTEGER,full_path VARCHAR(255))",
			"CREATE TABLE IF NOT EXISTS planner (planner_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,cuisine_datetime BIGINT)",
			"CREATE TABLE IF NOT EXISTS planner_cuisine (planner_id INTEGER,cuisine_id INTEGER)",
			"CREATE TABLE IF NOT EXISTS planner_media (planner_id INTEGER,full_path VARCHAR(255))",
			"CREATE TABLE IF NOT EXISTS diary (diary_id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,cuisine_datetime BIGINT)",
			"CREATE TABLE IF NOT EXISTS diary_cuisine (diary_id INTEGER,cuisine_id INTEGER)",
			"CREATE TABLE IF NOT EXISTS diary_media (diary_id INTEGER,full_path VARCHAR(255))"
		);

		var successCreate = function (tx,results) {
			if(++count == queries.length) {
				var periodsReadyDeferred = $.Deferred();
				var cuisineTypesReadyDeferred = $.Deferred();
				var dietReadyDeferred = $.Deferred();
				
				$.when(periodsReadyDeferred, cuisineTypesReadyDeferred, dietReadyDeferred).then(function() {
					callback(db);
				});
			
				var periodsCount = 0;
				var cuisineTypesCount = 0;
				var dietCount = 0;

				var successDeletePeriods = function(tx,results) {
					periods.forEach(function(value,index) {
						var successInsert = function (tx,results) {
							if(++periodsCount==periods.length) {
								periodsReadyDeferred.resolve();
							}
						}
						var query = "INSERT INTO periods(period_id,period_title,period_delay) VALUES (?,?,?)";
						debugWrite(query,[value.id,value.title,value.delay]);
						tx.executeSql(query,[value.id,value.title,value.delay],successInsert,StatementErrorCallback);
					});
				}
				
				tx.executeSql("DELETE FROM periods",[],successDeletePeriods,StatementErrorCallback);
				
				var successDeleteCuisineTypes = function(tx,results) {
					cuisineTypes.forEach(function(value,index) {
						var successInsert = function (tx,results) {
							if(++cuisineTypesCount==cuisineTypes.length) {
								cuisineTypesReadyDeferred.resolve();
							}
						}
						var query = "INSERT INTO cuisine_types(cuisine_type_id,cuisine_type_title) VALUES (?,?)";
						debugWrite(query,[value.id,value.title]);
						tx.executeSql(query,[value.id,value.title],successInsert,StatementErrorCallback);
					});			
				}
				
				tx.executeSql("DELETE FROM cuisine_types",[],successDeleteCuisineTypes,StatementErrorCallback);

				var successCountDiet = function	(tx,results) {
					if (results.rows.length != products.length) {
						var successDeleteDiet = function(tx,results) {
							products.forEach(function(value,index) {
								var successInsert = function (tx,results) {
									if(++dietCount==products.length) {
										dietReadyDeferred.resolve();
									}
								}
								var query = "INSERT INTO diet(product_id,product_title,product_qty,product_period_id) VALUES (?,?,?,?)";
								debugWrite(query,[value.id,value.title,value.qty,value.period]);
								tx.executeSql(query,[value.id,value.title,value.qty,value.period], successInsert, StatementErrorCallback);
							});
						}
						
						tx.executeSql("DELETE FROM diet",[],successDeleteDiet,StatementErrorCallback);		
					} else {
						dietReadyDeferred.resolve();
					}
				}
				tx.executeSql("SELECT * FROM diet",[],successCountDiet,StatementErrorCallback);		
			}
		}
		
		
		queries.forEach(function(value,index) {
			debugWrite(value,[]);
			tx.executeSql(value,[],successCreate,StatementErrorCallback);
		});
		
		debugWrite("populateDatabase",'end');
	}
	
	db.transaction(populateDatabase, TransactionErrorCallback);
}

function addItem(table) {
	debugWrite("addItem",table);
	var id = ""+table+"-"+itemId[table].length;
	var itemData = itemId[table].length;
	var item = $(".item-template").clone();
	var page = $("."+table+"-page-template").clone();
	item.prependTo("."+table+"-items").removeClass("item-template").addClass(""+table+"-item"); 
	page.appendTo("body").removeClass(""+table+"-page-template").addClass(""+table+"-page");
	page.attr("data-role","page");
	page.find("select.cuisine-product").attr("data-role","slider");
	page.find("[data-role='none']").removeAttr("data-role");
	item.find("[data-role='none']").removeAttr("data-role");
	item.attr("id",id);
	page.attr("id",id);
	item.find("a").attr("href","#"+id);
	item.jqmData("data",itemData);
	page.jqmData("data",itemData);
	itemId[table].push(-1);
	media[table].push(Array());
	mediaIndex[table].push(-1);
	page.jqmData("table",table);
	item.jqmData("table",table);
	page.find("a").jqmData("table",table);
	item.find("a").addClass(table);
	page.find("a").addClass(table);

	try {
		page.find("form").validate();
	} catch(e) {
		debugWrite("error",e);
	}
		
	$(".ui-listview ."+table+"-item#"+id).trigger("create");

	page.on("pageshow", function(event) {
		var table = $(this).jqmData("table");
		$(this).find("select.diary-"+table+",select.planner-"+table+"").selectmenu("refresh");
	});

	page.find(".cuisine-product").each(function(index,element) {
		$(this).jqmData("product-id", $(".cuisine-page-template").find("#"+$(this).attr("id")).jqmData("product-id"));
	});
	
	page.on("vclick", ".add-cuisine", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var page = $(this).parents("."+table+"-page");
		var id = page.attr("id");
		var item = $("."+table+"-item#"+id);
		debugWrite("vclick",".add-cuisine",table,id);
		var cuisine = addItemCuisine(table,id);
		cuisine.addClass("new");
		cuisine.trigger("create");
	});
	
	page.on("vclick", ".diary.save,.planner.save", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var page = $(this).parents("."+table+"-page");
		var id = page.attr("id");
		var item = $("."+table+"-item#"+id);
		setStatus(table,id,"time");
		debugWrite("vclick",".diary.save,.planner.save",table,id);
		var itemData = item.jqmData("data");
		var isValid = true;
		try {
			isValid = page.find("form").valid();
		} catch(e) {
			debugWrite("error",e);
		}
		if (isValid) {
			var datetime = new Date(page.find("#cuisine-date").val()+"T"+page.find("#cuisine-time").val());
			datetime = new Date(datetime.getTime()+datetime.getTimezoneOffset()*60*1000);
			var title = $.format.date(datetime,"yyyy-MM-dd HH:mm")
			item.find("#item-title").text(title);
			var db = getDatabase();
			saveItem(table,db,id,function(db) { 
				queryDesc(table,db,id);
				item.removeClass("changed").removeClass("new");
				page.removeClass("changed").removeClass("new");
				page.find("."+table+"-cuisine").removeClass("changed").removeClass("new");
				$.mobile.changePage("#"+table+"");
			});
		}
	});
		
	page.on("vclick", ".cuisine.save", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var page = $(this).parents("."+table+"-page");
		var id = page.attr("id");
		var item = $("."+table+"-item#"+id);
		setStatus(table,id,"time");
		debugWrite("vclick",".cuisine-page .save",table,id);
		var itemData = item.jqmData("data");
		var isValid = true;
		try {
			isValid = page.find("form").valid();
		} catch(e) {
			debugWrite("error",e);
		}
		if (isValid) {
			var title = page.find("#cuisine-title").val();
			item.find("#item-title").text(title)
			var db = getDatabase();
			if (itemId[table][itemData]==-1) {
				saveItem(table,db,id,function(db) {
					setStatus(table,id,"dialog-clean");
					queryDesc(table,db,id);
					var option = "<option data-placeholder='false' value='"+itemId[table][itemData]+"'>"+title+"</option>";
					$("select.diary-"+table+",select.planner-"+table+"").append(option);
					item.removeClass("changed").removeClass("new");
					page.removeClass("changed").removeClass("new");
					$.mobile.changePage("#"+table+"");
				});
			} else {
				saveItem(table,db,id,function(db) {
					setStatus(table,id,"dialog-clean");
					queryDesc(table,db,id);
					$("select.diary-"+table+" option[value='"+itemId[table][itemData]+"']").text(title);
					$("select.planner-"+table+" option[value='"+itemId[table][itemData]+"']").text(title);
					item.removeClass("changed").removeClass("new");
					page.removeClass("changed").removeClass("new");
					$.mobile.changePage("#"+table+"");
				});
			}
		}
	});
	
	page.on("vclick", ".delete", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var page = $(this).parents("."+table+"-page");
		var id = page.attr("id");
		var item = $("."+table+"-item#"+id);
		setStatus(table,id,"delete");
		debugWrite("vclick",".delete",table,id);
		var itemData = item.jqmData("data");
		
		var pageHideReadyDeferred = $.Deferred();
		var pageDeleteReadyDeferred = $.Deferred();
		
		$.when(pageHideReadyDeferred, pageDeleteReadyDeferred).then(function() {
			page.remove();
			item.remove();
			$("."+table+"-items.ui-listview").listview("refresh");
		});

		$(page).one('pagehide', function(event) {
			pageHideReadyDeferred.resolve();
		});
		
		var db = getDatabase();
		deleteItem(table,db,id,function(db) {
			pageDeleteReadyDeferred.resolve();
		});
		
		$.mobile.changePage("#"+table+"");
	});

	page.on("vclick", ".cuisine-image img", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		$("#fullScreen img").attr("src",$(this).attr("src"));
		$.mobile.changePage("#fullScreen");
//		$(this).toggleFullScreen();
	});
	page.on("vclick", ".prev-image", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var page = $(this).parents("."+table+"-page");
		var id = page.attr("id");
		var item = $("."+table+"-item#"+id);
		var itemData = item.jqmData("data");
		var itemImage = item.find("img#item-image");
		var pageImage = page.find("img#cuisine-image");
		if(media[table][itemData].length) {
			mediaIndex[table][itemData]--; if (mediaIndex[table][itemData]<0) mediaIndex[table][itemData] = 0;
			loadImage(itemImage,media[table][itemData][mediaIndex[table][itemData]]);
			loadImage(pageImage,media[table][itemData][mediaIndex[table][itemData]]);
		}
	});
	page.on("vclick", ".next-image", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var page = $(this).parents("."+table+"-page");
		var id = page.attr("id");
		var item = $("."+table+"-item#"+id);
		var itemData = item.jqmData("data");
		var itemImage = item.find("img#item-image");
		var pageImage = page.find("img#cuisine-image");
		if(media[table][itemData].length) {
			mediaIndex[table][itemData]++; if (mediaIndex[table][itemData]>media[table][itemData].length-1) mediaIndex[table][itemData] = media[table][itemData].length-1;
			loadImage(itemImage,media[table][itemData][mediaIndex[table][itemData]]);
			loadImage(pageImage,media[table][itemData][mediaIndex[table][itemData]]);
		}
	});
	page.on("vclick", ".take-photo", function(event) {
		// capture callback
		var table = $(this).jqmData("table");
		var page = $(this).parents("."+table+"-page");
		var id = page.attr("id");
		var item = $("."+table+"-item#"+id);
		var itemData = item.jqmData("data");
		var itemImage = item.find("img#item-image");
		var pageImage = page.find("img#cuisine-image");
		try {
			var captureSuccess = function(mediaFiles) {    
				var i, path, len;    
				for (i = 0, len = mediaFiles.length; i < len; i += 1) {        
					path = mediaFiles[i].fullPath;        // do something interesting with the file  
					debugWrite("path",path);
					media[table][itemData].push(path);
				}
				if(media[table][itemData].length) {
					mediaIndex[table][itemData] = media[table][itemData].length-1;  
					loadImage(itemImage,media[table][itemData][mediaIndex[table][itemData]]);
					loadImage(pageImage,media[table][itemData][mediaIndex[table][itemData]]);
				}
				item.addClass("changed");
			};
			// capture error callback
			var captureError = function(error) {    
				navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
			};
			// start image capture
			navigator.device.capture.captureImage(captureSuccess, captureError);
		} catch (e) {
			debugWrite("error",e);
		}
	});
	
	page.on("vclick", ".planner.release", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var page = $(this).parents("."+table+"-page");
		var id = page.attr("id");
		var item = $("."+table+"-item#"+id);
		var itemData = item.jqmData("data");
		setStatus(table,id,"delete");
		var diary = "diary";
		var diaryId = addItem(diary);
		debugWrite("diaryId",diaryId);
		var diaryPage = $("."+diary+"-page#"+diaryId);
		var diaryItem = $("."+diary+"-item#"+diaryId);
		var diaryItemData = diaryItem.jqmData("data");
		
		var today = new Date();
		
		diaryPage.find("#cuisine-date").val($.format.date(today,"yyyy-MM-dd"));
		diaryPage.find("#cuisine-time").val($.format.date(today,"HH:mm"));
		page.find("select."+table+"-cuisine").each(function(index,element) {
			var cuisine = addItemCuisine(diary,diaryId);
			var value = $(element).val();
			cuisine.find("select."+diary+"-cuisine").val(value);
		});
		media[diary][diaryItemData]=media[table][itemData];
		mediaIndex[diary][diaryItemData]=mediaIndex[table][itemData];
		if (media[diary][diaryItemData].length) {
			var itemImage = diaryItem.find("img#item-image");
			var pageImage = diaryPage.find("img#cuisine-image");
			loadImage(itemImage,media[diary][diaryItemData][mediaIndex[diary][diaryItemData]]);
			loadImage(pageImage,media[diary][diaryItemData][mediaIndex[diary][diaryItemData]]);
		}
		
		var pageHideReadyDeferred = $.Deferred();
		var deleteReadyDeferred = $.Deferred();
		var saveReadyDeferred = $.Deferred();
		
		$.when(pageHideReadyDeferred, deleteReadyDeferred).then(function() {
			page.remove();
			item.remove();
			$("."+table+"-items.ui-listview").listview("refresh");
		});
		$.when(deleteReadyDeferred, saveReadyDeferred).then(function() {
		});
		$(page).one('pagehide', function(event) {
			pageHideReadyDeferred.resolve();
		});
		var db = getDatabase();
		deleteItem(table,db,id,function(db) {
			deleteReadyDeferred.resolve();
		});
		saveItem(diary,db,diaryId,function(db) { 
			queryDesc(diary,db,diaryId);
			saveReadyDeferred.resolve();
		});
		$.mobile.changePage("#"+diaryId);
	});
	
	return id;
}
function addItemCuisine(table,id) {
	debugWrite("addItemCuisine",table,id);
	var page = $("."+table+"-page#"+id);
	var item = $("."+table+"-item#"+id);
	var itemData = item.jqmData("data");
	var cuisine = $("."+table+"-cuisine-template").clone();
	cuisine.appendTo($("#"+table+"-cuisine",page)).removeClass(""+table+"-cuisine-template").addClass(""+table+"-cuisine");
	cuisine.find("[data-role='none']").removeAttr("data-role");
	cuisine.find("a,select").jqmData("table",table);
	
	cuisine.on("change",".cuisine-type", function(event) {
		var table = $(this).jqmData("table");
		var item = $("select."+table+"-cuisine",$(this).parents("."+table+"-cuisine"));
		var cuisineTypeId = $(this).val();
		var db = getDatabase();
		querySame("cuisine",db,item,cuisineTypeId,function (db) {
			item.selectmenu("refresh");
		});
	});
	
	cuisine.on("vclick", ".delete-cuisine", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var page = $(this).parents("."+table+"-page");
		var id = page.attr("id");
		var item = $("."+table+"-item#"+id);
		var itemData = item.jqmData("data");
		item.addClass("changed");
		page.addClass("changed");
		$(this).parents("div."+table+"-cuisine").remove();
	});

	cuisine.on("change", "select."+table+"-cuisine", function(event) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var page = $(this).parents("."+table+"-page");
		var id = page.attr("id");
		var item = $("."+table+"-item#"+id);
		var itemData = item.jqmData("data");
		item.addClass("changed");
		page.addClass("changed");
	});

	return cuisine;
}


function clearItems(table) { 
	$("#available ."+table+"-cuisine").remove();
	$("."+table+"-item").remove(); 
	$("."+table+"-page").remove();
	itemId[table]=Array(); 
	media[table]=Array(); 
	mediaIndex[table]=Array(); 
}

function deleteItem(table,db,id,callback) {
	var page = $("."+table+"-page#"+id);
	var item = $("."+table+"-item#"+id);
	var itemData = item.jqmData("data");
	var count = 0;

	var queries = {
		cuisine: Array(
			"DELETE FROM cuisine_product WHERE cuisine_id=?",
			"DELETE FROM planner_cuisine WHERE cuisine_id=?",
			"DELETE FROM diary_cuisine WHERE cuisine_id=?",
			"DELETE FROM cuisine_media WHERE cuisine_id=?",
			"DELETE FROM cuisine WHERE cuisine_id=?"
		),
		diary: Array(
			"DELETE FROM diary_media WHERE diary_id=?",
			"DELETE FROM diary_cuisine WHERE diary_id=?",
			"DELETE FROM diary WHERE diary_id=?"	
		),
		planner: Array(
			"DELETE FROM planner_media WHERE planner_id=?",
			"DELETE FROM planner_cuisine WHERE planner_id=?",
			"DELETE FROM planner WHERE planner_id=?"
		)
	};
	
	queries[table].forEach(function(query,index) {
		var successDelete = function (tx,results) {
			if (++count==queries[table].length) {
				callback(db);
			}
		}

		var queryDelete = function (tx) {
			debugWrite(query,[itemId[table][itemData]]);
			tx.executeSql(query,[itemId[table][itemData]], successDelete, StatementErrorCallback);
		}
		
		db.transaction(queryDelete, TransactionErrorCallback);
	});
}

function saveItemCuisines(table,db,id,callback) {
	debugWrite('saveItemCuisines','start');
	var page = $("."+table+"-page#"+id);
	var item = $("."+table+"-item#"+id);
	var itemData = item.jqmData("data");
	var count = 0;
	if (count == page.find("select."+table+"-cuisine").length) {
		callback(db);
	}
	page.find("select."+table+"-cuisine").each(function() {
		var cuisine_id = $(this).val();

		var queryInsert = function (tx) {
			
			var successInsert = function (tx, results) {
				debugWrite('successInsert','start');
				debugWrite('results',results);
				if (++count == page.find("select."+table+"-cuisine").length) {
					callback(db);
				}
				debugWrite('successInsert','end');
			}
			
			var query =	"INSERT INTO "+table+"_cuisine("+table+"_id,cuisine_id) VALUES (?,?)";
				
			debugWrite(query,[itemId[table][itemData],cuisine_id]);
			tx.executeSql(query,[itemId[table][itemData],cuisine_id], successInsert, StatementErrorCallback);
		}
		
		db.transaction(queryInsert, TransactionErrorCallback);
	});
	debugWrite('saveItemCuisines','end');
}

function saveItemMedia(table,db,id,callback) {
	debugWrite('saveItemMedia','start');
	var page = $("."+table+"-page#"+id);
	var item = $("."+table+"-item#"+id);
	var itemData = item.jqmData("data");
	debugWrite('item',item);
	debugWrite('page',page);
	debugWrite('itemData',itemData);
	var count = 0;
	if (count == media[table][itemData].length) {
		callback(db);
	}
	media[table][itemData].forEach(function(value,index) {
		var queryInsert = function (tx) {
			
			var successInsert = function (tx, results) {
				debugWrite('successInsert','start');
				debugWrite('results',results);
				if (++count == media[table][itemData].length) {
					callback(db);
				}
				debugWrite('successInsert','end');
			}
			
			var query =	"INSERT INTO "+table+"_media("+table+"_id,full_path) VALUES (?,?)";
				
			debugWrite(query,[itemId[table][itemData],value]);
			tx.executeSql(query,[itemId[table][itemData],value], successInsert, StatementErrorCallback);
		}
		
		db.transaction(queryInsert, TransactionErrorCallback);
	});
	debugWrite('saveItemMedia','end');
}

function saveItemProducts(table,db,id,callback) {
	debugWrite('saveItemProducts','start');
	var page = $("."+table+"-page#"+id);
	var item = $("."+table+"-item#"+id);
	var itemData = item.jqmData("data");
	var count = 0;
	if (count == item.find("select."+table+"-product").length) {
		callback(db);
	}
	
	page.find("select."+table+"-product").each(function() {
		var product_id = $(this).jqmData("product-id");
		var product_qty = $(this).val();

		var queryInsert = function (tx) {
			
			var successInsert = function (tx, results) {
				debugWrite('successInsert','start');
				debugWrite('results',results);
				if (++count == page.find("select."+table+"-product").length) {
					callback(db);
				}
				debugWrite('successInsert','end');
			}
				
			var query = "INSERT INTO "+table+"_product("+table+"_id,product_id,"+table+"_product_qty) VALUES (?,?,?)";
			
			debugWrite(query,[itemId[table][itemData],product_id,product_qty]);
			tx.executeSql(query,[itemId[table][itemData],product_id,product_qty], successInsert, StatementErrorCallback);
		}
		
		db.transaction(queryInsert, TransactionErrorCallback);
	});
	debugWrite('saveItemProducts','end');
}

function saveItem(table,db,id,callback) {
	debugWrite('saveItem','start');

	var readyDeferred = $.Deferred();
	var childrenReadyDeferred = $.Deferred();
	var mediaReadyDeferred = $.Deferred();
	
	$.when(readyDeferred, childrenReadyDeferred, mediaReadyDeferred).then(function() {
		callback(db);
	});
		
	var queryDeleteMedia = function (tx) {
		
		var successDeleteMedia = function (tx, results) {
			debugWrite('successDeleteMedia','start');
			debugWrite('results',results);
			saveItemMedia(table,db, id, function(db) { mediaReadyDeferred.resolve(); } );
			debugWrite('successDeleteMedia','end');
		}
		
		var query =	"DELETE FROM "+table+"_media WHERE "+table+"_id=?";
		debugWrite(query,[itemId[table][itemData]]);
		tx.executeSql(query,[itemId[table][itemData]], successDeleteMedia, StatementErrorCallback);
	}

	switch(table) {
	case "diary":
	case "planner":	
		var page = $("."+table+"-page#"+id);
		var item = $("."+table+"-item#"+id);
		var itemData = item.jqmData("data");
		var datetime = Date.parse(page.find("#cuisine-date").val()+"T"+page.find("#cuisine-time").val());
			
	
		if (itemId[table][itemData] == -1) {
			var queryInsert = function (tx) {
				
				var successInsert = function (tx, results) {
					debugWrite('successInsert','start');
					debugWrite('results',results);
					itemId[table][itemData] = results.insertId;
					readyDeferred.resolve();
					saveItemCuisines(table,db, id, function(db) { childrenReadyDeferred.resolve(); } );
					saveItemMedia(table,db, id, function(db) { mediaReadyDeferred.resolve(); } );
					debugWrite('successInsert','end');
				}
					
				tx.executeSql("INSERT INTO "+table+"(cuisine_datetime) VALUES (?)",[datetime], successInsert, StatementErrorCallback);
			}
			
			db.transaction(queryInsert, TransactionErrorCallback);
		} else {
			var queryUpdate = function (tx) {
				
				var successUpdate = function (tx, results) {
					debugWrite('successUpdate','start');
					debugWrite('results',results);
					readyDeferred.resolve();
					debugWrite('successUpdate','end');
				}
				
				var query =	"UPDATE "+table+" SET cuisine_datetime=? WHERE "+table+"_id=?";
				debugWrite(query,[datetime,itemId[table][itemData]]);
				tx.executeSql(query,[datetime,itemId[table][itemData]], successUpdate, StatementErrorCallback);
				
				var queryDeleteCuisines = function (tx) {
					
					var successDeleteCuisines = function (tx, results) {
						debugWrite('successDeleteCuisines','start');
						debugWrite('results',results);
						saveItemCuisines(table,db, id, function(db) { childrenReadyDeferred.resolve(); } );
						debugWrite('successDeleteCuisines','end');
					}
					
					var query =	"DELETE FROM "+table+"_cuisine WHERE "+table+"_id=?";
					debugWrite(query,[itemId[table][itemData]]);
					tx.executeSql(query,[itemId[table][itemData]], successDeleteCuisines, StatementErrorCallback);
				}
				
				db.transaction(queryDeleteCuisines, TransactionErrorCallback);
				db.transaction(queryDeleteMedia, TransactionErrorCallback);
			}
			
			db.transaction(queryUpdate, TransactionErrorCallback);
		}
		break;
	case "cuisine":
		var page = $("."+table+"-page#"+id);
		var item = $("."+table+"-item#"+id);
		var itemData = item.jqmData("data");
		var title = page.find("#"+table+"-title").val();
		var typeId = page.find("#"+table+"-type").val();
				
		if (itemId[table][itemData] == -1) {
			var queryInsert = function (tx) {
				
				var successInsert = function (tx, results) {
					debugWrite('successInsert','start');
					debugWrite('results',results);
					itemId[table][itemData] = results.insertId;
					readyDeferred.resolve();
					saveItemProducts(table,db, id, function(db) { childrenReadyDeferred.resolve(); } );
					saveItemMedia(table,db, id, function(db) { mediaReadyDeferred.resolve(); } );
					debugWrite('successInsert','end');
				}
				
				var query = "INSERT INTO cuisine("+table+"_title,"+table+"_type_id) VALUES (?,?)";
					
				debugWrite(query,[title,typeId]);
				tx.executeSql(query,[title,typeId], successInsert, StatementErrorCallback);
			}
			
			db.transaction(queryInsert, TransactionErrorCallback);
		} else {
			var queryUpdate = function (tx) {
				var successUpdate = function (tx, results) {
					debugWrite('successUpdate','start');
					debugWrite('results',results);
					readyDeferred.resolve();
					debugWrite('successUpdate','end');
				}
				
				var query = "UPDATE cuisine SET "+table+"_title=?,"+table+"_type_id=? WHERE "+table+"_id=?";
				debugWrite(query,[title,typeId,itemId[table][itemData]]);
				tx.executeSql(query,[title,typeId,itemId[table][itemData]], successUpdate, StatementErrorCallback);
			}
			
			db.transaction(queryUpdate, TransactionErrorCallback);
			
			var queryDeleteProducts = function (tx) {
				var successDeleteProducts = function (tx, results) {
					debugWrite('successDeleteProducts','start');
					debugWrite('results',results);
					saveItemProducts(table,db, id, function(db) { childrenReadyDeferred.resolve(); } );
					debugWrite('successDeleteProducts','end');
				}
	
				var query = "DELETE FROM "+table+"_product WHERE "+table+"_id=?";
				debugWrite(query,[itemId[table][itemData]]);
				tx.executeSql(query,[itemId[table][itemData]], successDeleteProducts, StatementErrorCallback);				
			}
			
			db.transaction(queryDeleteProducts, TransactionErrorCallback);
			db.transaction(queryDeleteMedia, TransactionErrorCallback);
		}
		break;
	case "diet":
		readyDeferred.resolve();
		mediaReadyDeferred.resolve();
		var count = 0;
		if (count == $("."+table+"-product").length) {
			childrenReadyDeferred.resolve();
		}
		
		var queryDelete = function (tx) {
			
			var successDelete = function (tx,results) {
				$("."+table+"-product").each(function() {
					var item = $(this);
					var id = item.jqmData("product-id");
					var qty = item.find("#"+table+"-"+id+"-qty").val();
					var period = item.find("#"+table+"-"+id+"-period").val();
					
					var queryInsert = function (tx) {
						
						var successInsert = function (tx, results) {
							debugWrite('successInsert','start');
							debugWrite('results',results);
							if (++count == $("."+table+"-product").length) {
								childrenReadyDeferred.resolve();
							}
							debugWrite('successInsert','end');
						}
							
						var query = "INSERT INTO "+table+"(product_id,product_qty,product_period_id) VALUES (?,?,?)";
						
						debugWrite(query,[id,qty,period]);
						tx.executeSql(query,[id,qty,period], successInsert, StatementErrorCallback);
					}
					
					db.transaction(queryInsert, TransactionErrorCallback);
				});
			}
			
			var query = "DELETE FROM "+table+"";
			debugWrite(query,[]);
			tx.executeSql(query, [], successDelete, StatementErrorCallback);
		}
		
		db.transaction(queryDelete, TransactionErrorCallback);
		break;
	}
	
	debugWrite('saveItem','end');
}
function queryItems(table,db,callback) {
	debugWrite('queryItems','start');
	
	var readyDeferred = $.Deferred();
	var childrenReadyDeferred = $.Deferred();
	var mediaReadyDeferred = $.Deferred();
	
	$.when(readyDeferred, childrenReadyDeferred, mediaReadyDeferred).then(function() {
		callback(db);
	});
		
	
	try {
		switch(table) {
		case "diary":
		case "planner":
			var queryRecords = function (tx) {
				
				var successRecords = function (tx, results) {
					debugWrite('successRecords','start');
					debugWrite('results',results);
					var recordsLength = results.rows.length;
					var childrenCount = 0;
					var mediaCount = 0;
					
					if (childrenCount==recordsLength) {
						childrenReadyDeferred.resolve();
					}
					if (mediaCount==recordsLength) {
						mediaReadyDeferred.resolve();
					}
					
					for (var i=0; i<recordsLength; i++){
						if(itemId[table].indexOf(results.rows.item(i).id)==-1) {
							var id = addItem(table);
							debugWrite("id",id);
							var page = $("."+table+"-page#"+id);
							var item = $("."+table+"-item#"+id);
							var itemData = item.jqmData("data");
							var itemImage = item.find("img#item-image");
							var pageImage = page.find("img#cuisine-image");
							setStatus(table,id,"time");
							queryStatus(table,db,id);
							itemId[table][itemData] = results.rows.item(i).id;
							var datetime = new Date(results.rows.item(i).cuisine_datetime);
							datetime = new Date(datetime.getTime()+datetime.getTimezoneOffset()*60*1000);
							page.find("#cuisine-date").val($.format.date(datetime,"yyyy-MM-dd"));
							page.find("#cuisine-time").val($.format.date(datetime,"HH:mm"));
							var title = $.format.date(datetime,"yyyy-MM-dd HH:mm")
							item.find("#item-title").text(title);

							var queryChildren = function (tx) {
								
								var successChildren = function (tx, results) {
									var len = results.rows.length;
									var titles = Array()
									for (var i=0; i<len; i++){
										titles.push(results.rows.item(i).cuisine_title);
										var cuisine = addItemCuisine(table,id);
										cuisine.find("select.cuisine-type").val(results.rows.item(i).cuisine_type_id);
										cuisine.find("select."+table+"-cuisine").val(results.rows.item(i).cuisine_id);
	//									querySame("cuisine",db,$("select."+table+"-cuisine",cuisine),results.rows.item(i).cuisine_type_id,function (db) {
	//									});
									}
									item.find("#item-desc").text(titles.join(","));
									if (++childrenCount==recordsLength) {
										childrenReadyDeferred.resolve();
									}
								}
									
								var query = "SELECT cuisine.cuisine_id,cuisine_type_id,cuisine_title FROM "+table+"_cuisine JOIN cuisine ON "+table+"_cuisine.cuisine_id=cuisine.cuisine_id WHERE "+table+"_id=?";
								
								debugWrite(query,[itemId[table][itemData]]);
								tx.executeSql(query, [itemId[table][itemData]], successChildren, StatementErrorCallback);
							}
							
							db.transaction(queryChildren, TransactionErrorCallback);
					
							var queryMedia = function (tx) {
								
								var successMedia = function (tx, results) {
									debugWrite('successMedia','start');
									debugWrite('results',results);
									debugWrite('table',table);
									debugWrite('itemData',itemData);
									debugWrite('media[table]',media[table]);
									debugWrite('media[table][itemData]',media[table][itemData]);
									debugWrite('$(".'+table+'-item")',$("."+table+"-item"));
									var len = results.rows.length;
									for (var i=0; i<len; i++){
										media[table][itemData].push(results.rows.item(i).full_path);
									}
									debugWrite('media[table][itemData]',media[table][itemData]);
									if (media[table][itemData].length) {
										mediaIndex[table][itemData] = media[table][itemData].length-1;  
										loadImage(pageImage,media[table][itemData][mediaIndex[table][itemData]]);
										loadImage(itemImage,media[table][itemData][mediaIndex[table][itemData]]);
									}
									if (++mediaCount==recordsLength) {
										mediaReadyDeferred.resolve();
									}
									debugWrite('successMedia','end');
								}
								
								var query = "SELECT * FROM "+table+"_media WHERE "+table+"_id=?";
								
								debugWrite(query,[itemId[table][itemData]]);
								tx.executeSql(query, [itemId[table][itemData]], successMedia, StatementErrorCallback);
							}
							
							db.transaction(queryMedia, TransactionErrorCallback);
						} else {
							var id = table+"-"+itemId[table].indexOf(results.rows.item(i).id);
							debugWrite("id",id);
							var page = $("."+table+"-page#"+id);
							var item = $("."+table+"-item#"+id);
							var itemData = item.jqmData("data");
							var itemImage = item.find("img#item-image");
							var pageImage = page.find("img#cuisine-image");
							setStatus(table,id,"time");
							queryStatus(table,db,id);
							queryDesc(table,db,id);							
							if (++childrenCount==recordsLength) {
								childrenReadyDeferred.resolve();
							}
							if (++mediaCount==recordsLength) {
								mediaReadyDeferred.resolve();
							}
						}
					}
					
					readyDeferred.resolve();
					
					debugWrite('successRecords','end');
				}
				
				var from_datetime = Date.parse($("#"+table+"-from-date").val());
				var to_datetime = Date.parse($("#"+table+"-to-date").val());
				var query = "SELECT "+table+"_id AS id,* FROM "+table+" WHERE cuisine_datetime BETWEEN ? AND ? ORDER BY cuisine_datetime DESC";
				
				debugWrite(query,[from_datetime,to_datetime+24*60*60*1000]);
				tx.executeSql(query, [from_datetime,to_datetime+24*60*60*1000], successRecords, StatementErrorCallback);
			}
						
			db.transaction(queryRecords, TransactionErrorCallback);
			break;
		case "cuisine":
			var querySelect = function (tx) {
				
				var successSelect = function (tx, results) {
					debugWrite('successSelect','start');
					debugWrite('results',results);
					var recordsLength = results.rows.length;
					var childrenCount = 0;
					var mediaCount = 0;
					
					if (childrenCount==recordsLength) {
						childrenReadyDeferred.resolve();
					}
					if (mediaCount==recordsLength) {
						mediaReadyDeferred.resolve();
					}
					for (var i=0; i<recordsLength; i++){
						if(itemId[table].indexOf(results.rows.item(i).id)==-1) {
							var id = addItem(table);
							debugWrite("id",id);
							var page = $("."+table+"-page#"+id);
							var item = $("."+table+"-item#"+id);
							var itemData = item.jqmData("data");
							var itemImage = item.find("img#item-image");
							var pageImage = page.find("img#cuisine-image");
							setStatus(table,id,"dialog-clean");
							itemId[table][itemData] = results.rows.item(i).id;
							var title = results.rows.item(i).cuisine_title;
							var type = results.rows.item(i).cuisine_type_id;
							page.find("#"+table+"-title").val(title);
							page.find("#"+table+"-type").val(type);
							item.find("#item-title").text(title)
			
							var option = "<option data-placeholder='false' value='"+itemId[table][itemData]+"'>"+title+"</option>";
							$("select.diary-"+table+",select.planner-"+table+"").append(option);

							var queryChildren = function (tx) {
								
								var successChildren = function (tx, results) {
									debugWrite('successChildren','start');
									debugWrite('results',results);
									var titles = Array()
									var len = results.rows.length;
									for (var i=0; i<len; i++){
										if (results.rows.item(i).cuisine_product_qty) {
											titles.push(results.rows.item(i).product_title);
										}
										page.find("#"+table+"-"+results.rows.item(i).product_id).val(results.rows.item(i).cuisine_product_qty);
									}
									item.find("#item-desc").text(titles.join(","));
									if (++childrenCount==recordsLength) {
										childrenReadyDeferred.resolve();
									}
									debugWrite('successChildren','end');
								}
								
								var query =	"SELECT "+table+"_product.product_id,product_title,"+table+"_product_qty FROM "+table+"_product JOIN diet ON "+table+"_product.product_id=diet.product_id WHERE "+table+"_id=?";
								
								debugWrite(query,[itemId[table][itemData]]);
								tx.executeSql(query, [itemId[table][itemData]], successChildren, StatementErrorCallback);
							}
							
							db.transaction(queryChildren, TransactionErrorCallback);	
							
							var queryMedia = function (tx) {
								
								var successMedia = function (tx, results) {
									var len = results.rows.length;
									for (var i=0; i<len; i++){
										media[table][itemData].push(results.rows.item(i).full_path);
									}
									if (media[table][itemData].length) {
										mediaIndex[table][itemData] = media[table][itemData].length-1;  
										loadImage(pageImage,media[table][itemData][mediaIndex[table][itemData]]);
										loadImage(itemImage,media[table][itemData][mediaIndex[table][itemData]]);
									}
									if (++mediaCount==recordsLength) {
										mediaReadyDeferred.resolve();
									}
								}
								
								var query = "SELECT * FROM "+table+"_media WHERE "+table+"_id=?";
								
								debugWrite(query,[itemId[table][itemData]]);
								tx.executeSql(query, [itemId[table][itemData]], successMedia, StatementErrorCallback);
							}
							
							db.transaction(queryMedia, TransactionErrorCallback);
						} else {
							var id = table+"-"+itemId[table].indexOf(results.rows.item(i).id);
							debugWrite("id",id);
							var page = $("."+table+"-page#"+id);
							var item = $("."+table+"-item#"+id);
							var itemData = item.jqmData("data");
							var itemImage = item.find("img#item-image");
							var pageImage = page.find("img#cuisine-image");
							setStatus(table,id,"time");
							queryStatus(table,db,id);
							queryDesc(table,db,id);							
							if (++childrenCount==recordsLength) {
								childrenReadyDeferred.resolve();
							}
							if (++mediaCount==recordsLength) {
								mediaReadyDeferred.resolve();
							}
						}
					}
					
					readyDeferred.resolve();
					
					debugWrite('successSelect','end');
				}
				
				var query =	"SELECT "+table+"_id AS id,* FROM "+table+"";	
				
				debugWrite(query,[]);
				tx.executeSql(query, [], successSelect, StatementErrorCallback);
			}
			
			db.transaction(querySelect, TransactionErrorCallback);
			break;
		case "diet":
			var querySelect = function (tx) {
				
				var successSelect = function (tx, results) {
					debugWrite('successSelect','start');
					debugWrite('results',results);
					var len = results.rows.length;
					for (var i=0; i<len; i++){
						$("#"+table+"-"+results.rows.item(i).product_id+"-qty").val(results.rows.item(i).product_qty).change();
						$("#"+table+"-"+results.rows.item(i).product_id+"-period").val(results.rows.item(i).product_period_id).change();
					}
					readyDeferred.resolve();
					childrenReadyDeferred.resolve();
					mediaReadyDeferred.resolve();
					debugWrite('successSelect','end');
				}
					
				var query = "SELECT * FROM "+table+"";
				
				debugWrite(query,[]);
				tx.executeSql(query, [], successSelect, StatementErrorCallback);
			}
			
			db.transaction(querySelect, TransactionErrorCallback);
			break;
		case "forecast":
			var datetime = Date.parse($("#"+table+"-date").val());
			
			var querySelect = function (tx) {
				var successSelect = function (tx, results) {
					debugWrite('successSelect','start');
					debugWrite('results',results);
					debugWrite('results.rows',results.rows);
					var product_id = Array();
					var product_qty = Array();
					var product_max = Array();
					var len = results.rows.length;
					for (var i=0; i<len; i++){
						var index = product_id.indexOf(results.rows.item(i).product_id);
						if (index == -1) {
							product_id.push(results.rows.item(i).product_id);
							product_qty.push(results.rows.item(i).product_qty);
							product_max.push(results.rows.item(i).product_max);
						} else {
							product_qty[index] += results.rows.item(i).product_qty;
							product_max[index] += results.rows.item(i).product_max;
						}
					}
					
					product_qty.forEach(function(value,index) {
						if (value<0) product_qty[index]=0;
					});
			
					$("."+table+"-product input[id^='"+table+"']").val(0);
					product_qty.forEach(function(value,index) {
						$("#"+table+"-"+product_id[index]).attr("max",product_max[index]).val(product_qty[index]);
						debugWrite($("#"+table+"-"+product_id[index]),product_qty[index]);
					});
					readyDeferred.resolve();
					childrenReadyDeferred.resolve();
					mediaReadyDeferred.resolve();
					debugWrite('successSelect','end');
				}
				
				var query = "SELECT product_id,product_qty,product_qty AS product_max FROM diet";
				["diary","planner"].forEach(function(value,index) {
					query += " UNION ALL"
					+" SELECT cuisine_product.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty,0 AS product_max FROM cuisine_product"
					+" JOIN "+value+"_cuisine ON "+value+"_cuisine.cuisine_id=cuisine_product.cuisine_id"
					+" JOIN "+value+" ON "+value+"."+value+"_id="+value+"_cuisine."+value+"_id"
					+" JOIN diet ON diet.product_id=cuisine_product.product_id"
					+" JOIN periods ON diet.product_period_id=periods.period_id"
					+" WHERE "+value+".cuisine_datetime BETWEEN ?-periods.period_delay AND ?"
					+" GROUP BY cuisine_product.product_id";
				});
				
				debugWrite(query,[datetime+24*60*60*1000,datetime+24*60*60*1000,datetime+24*60*60*1000,datetime+24*60*60*1000]);
				tx.executeSql(query,[datetime+24*60*60*1000,datetime+24*60*60*1000,datetime+24*60*60*1000,datetime+24*60*60*1000], successSelect, StatementErrorCallback);
			}
			
			db.transaction(querySelect, TransactionErrorCallback);
			break;
		case "available":
			var datetime = Date.parse($("#"+table+"-date").val());
			
			var querySelect = function (tx) {
				var successSelect = function (tx, results) {
					debugWrite('successSelect','start');
					debugWrite('results',results);
					debugWrite('results.rows',results.rows);
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
						debugWrite('successSelectCuisine','start');
						debugWrite('results',results);
						var cuisine_id = Array();
						var len = results.rows.length;
						for (var i=0; i<len; i++){
							cuisine_id.push(results.rows.item(i).cuisine_id);
						}
						
						if(product_id.length) {
							var querySelectCuisine = function (tx) {
								var query = "SELECT cuisine_id FROM cuisine_product"
								+" WHERE cuisine_id IN("+cuisine_id.join(",")+")"
								+" AND product_id=?"
								+" AND cuisine_product_qty<=?";
								var id = product_id.pop();
								var qty = product_qty.pop();
								debugWrite(query,[id,qty]);
								tx.executeSql(query, [id,qty], successSelectCuisine, StatementErrorCallback);
							}
							
							db.transaction(querySelectCuisine, TransactionErrorCallback);
						} else {
							var querySelectAvailable = function (tx) {
								
								var successSelectAvailable = function (tx, results) {
									debugWrite('successSelectAvailable','start');
									debugWrite('results',results);
									var len = results.rows.length;
									for (var i=0; i<len; i++){
										var item = $("."+table+"-cuisine-template").clone();
										item.jqmData("cuisine-id",results.rows.item(i).cuisine_id);
										item.find("."+table+"-cuisine-id").removeClass(""+table+"-cuisine-id").addClass(""+table+"-"+results.rows.item(i).cuisine_id);
										item.find("#"+table+"-cuisine-id").attr("id", ""+table+"-"+results.rows.item(i).cuisine_id).attr("name", ""+table+"-"+results.rows.item(i).cuisine_id);
										item.find("label[for='"+table+"-cuisine-id']").attr("for",""+table+"-"+results.rows.item(i).cuisine_id).text(results.rows.item(i).cuisine_title);
										item.appendTo("#"+table+"-cuisine").removeClass(""+table+"-cuisine-template").addClass(""+table+"-cuisine");
										item.find("[data-role='none']").removeAttr("data-role");
									}
									readyDeferred.resolve();
									childrenReadyDeferred.resolve();
									mediaReadyDeferred.resolve();
									debugWrite('successSelectAvailable','end');
								}
								
								var query = "SELECT * FROM cuisine"
								+" WHERE cuisine_id IN("+cuisine_id.join(",")+")";
								
								debugWrite(query,[]);
								tx.executeSql(query, [], successSelectAvailable, StatementErrorCallback);
							}
							db.transaction(querySelectAvailable, TransactionErrorCallback);
						}
						debugWrite('successSelectCuisine','end');
					}
				
					var querySelectCuisine = function (tx) {
						
						var query = "SELECT cuisine_id FROM cuisine";
						
						debugWrite(query,[]);
						tx.executeSql(query, [], successSelectCuisine, StatementErrorCallback);
					}
					
					db.transaction(querySelectCuisine, TransactionErrorCallback);
					
					debugWrite('successSelect','end');
				}
				
				var query = "SELECT product_id,product_qty FROM diet";
				["diary","planner"].forEach(function(value,index) {
					query += " UNION ALL"
					+" SELECT cuisine_product.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty FROM cuisine_product"
					+" JOIN "+value+"_cuisine ON "+value+"_cuisine.cuisine_id=cuisine_product.cuisine_id"
					+" JOIN "+value+" ON "+value+"."+value+"_id="+value+"_cuisine."+value+"_id"
					+" JOIN diet ON diet.product_id=cuisine_product.product_id"
					+" JOIN periods ON diet.product_period_id=periods.period_id"
					+" WHERE "+value+".cuisine_datetime BETWEEN ?-periods.period_delay AND ?"
					+" GROUP BY cuisine_product.product_id";
				});
				
				debugWrite(query,[datetime+24*60*60*1000,datetime+24*60*60*1000,datetime+24*60*60*1000,datetime+24*60*60*1000]);
				tx.executeSql(query,[datetime+24*60*60*1000,datetime+24*60*60*1000,datetime+24*60*60*1000,datetime+24*60*60*1000], successSelect, StatementErrorCallback);
			}
			
			db.transaction(querySelect, TransactionErrorCallback);
			break;
		}
	} catch (e) {
		debugWrite("catch error",e);
	}
		
	debugWrite('queryItems','end');
}

function setStatus(table,id,status) {
	var page = $("."+table+"-page#"+id);
	var item = $("."+table+"-item#"+id);
	var itemData = item.jqmData("data");
	var icon = "<img src='16x16/"+status+".png'>";
	item.find("#item-status").children().remove();
	item.find("#item-status").append(icon);
}

function queryStatus(table,db,id) {
	debugWrite('queryStatus','start');
	var page = $("."+table+"-page#"+id);
	var item = $("."+table+"-item#"+id);
	var itemData = item.jqmData("data");
	
	var datetime = Date.parse(page.find("#cuisine-date").val()+"T"+page.find("#cuisine-time").val());

	var other;
	switch(table) {
	case "diary": other = "planner"; break;
	case "planner": other = "diary"; break;
	}
	var available_id = Array();
	var available_qty = Array();
	var product_id = Array();
	var product_qty = Array();

	var availableReadyDeferred = $.Deferred();
	var productReadyDeferred = $.Deferred();
	
	$.when(availableReadyDeferred, productReadyDeferred).then(function() {
		var isOk = true;
		product_qty.forEach(function(value,index) {
			var indexAvailable = available_id.indexOf(product_id[index]);
			isOk = isOk && (value<=available_qty[indexAvailable]);
		});
		if (isOk) {
			setStatus(table,id,"dialog-clean");
		} else {
			setStatus(table,id,"dialog-error");
		}
		$("."+table+"-items.ui-listview").listview("refresh");
	});
				
	var querySelectAvailable = function (tx) {
		var successSelectAvailable = function (tx, results) {
			debugWrite('successSelectAvailable','start');
			debugWrite('results',results);
			debugWrite('results.rows',results.rows);
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var index = available_id.indexOf(results.rows.item(i).product_id);
				if (index == -1) {
					available_id.push(results.rows.item(i).product_id);
					available_qty.push(results.rows.item(i).product_qty);
				} else {
					available_qty[index] += results.rows.item(i).product_qty;
				}
			}
			
			available_qty.forEach(function(value,index) {
				if (value<0) available_qty[index]=0;
			});
			
			availableReadyDeferred.resolve();
			
			debugWrite('successSelectAvailable','end');
		}
		
		var query = "SELECT product_id,product_qty FROM diet"
		+" UNION ALL"
		+" SELECT cuisine_product.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty FROM cuisine_product"
		+" JOIN "+other+"_cuisine ON "+other+"_cuisine.cuisine_id=cuisine_product.cuisine_id"
		+" JOIN "+other+" ON "+other+"."+other+"_id="+other+"_cuisine."+other+"_id"
		+" JOIN diet ON diet.product_id=cuisine_product.product_id"
		+" JOIN periods ON diet.product_period_id=periods.period_id"
		+" WHERE "+other+".cuisine_datetime BETWEEN ?-periods.period_delay AND ?"
		+" GROUP BY cuisine_product.product_id"
		+" UNION ALL"
		+" SELECT cuisine_product.product_id AS product_id,-SUM(cuisine_product_qty) AS product_qty FROM cuisine_product"
		+" JOIN "+table+"_cuisine ON "+table+"_cuisine.cuisine_id=cuisine_product.cuisine_id"
		+" JOIN "+table+" ON "+table+"."+table+"_id="+table+"_cuisine."+table+"_id"
		+" JOIN diet ON diet.product_id=cuisine_product.product_id"
		+" JOIN periods ON diet.product_period_id=periods.period_id"
		+" WHERE "+table+".cuisine_datetime BETWEEN ?-periods.period_delay AND ?"
		+" AND "+table+"."+table+"_id<>?"
		+" GROUP BY cuisine_product.product_id";
		
		debugWrite(query,[datetime,datetime,datetime,datetime,itemId[table][itemData]]);
		tx.executeSql(query,[datetime,datetime,datetime,datetime,itemId[table][itemData]], successSelectAvailable, StatementErrorCallback);
	}
	
	db.transaction(querySelectAvailable, TransactionErrorCallback);

	var querySelectProduct = function (tx) {
		var successSelectProduct = function (tx, results) {
			debugWrite('successSelectProduct','start');
			debugWrite('results',results);
			debugWrite('results.rows',results.rows);
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
			
			productReadyDeferred.resolve();
				
			debugWrite('successSelectProduct','end');
		}
		
		var query = "SELECT cuisine_product.product_id,SUM(cuisine_product_qty) AS product_qty FROM "+table+"_cuisine"
		+" JOIN cuisine_product ON "+table+"_cuisine.cuisine_id=cuisine_product.cuisine_id"
		+" WHERE "+table+"_cuisine."+table+"_id=?"
		+" GROUP BY cuisine_product.product_id";
		
		debugWrite(query,[itemId[table][itemData]]);
		tx.executeSql(query,[itemId[table][itemData]], successSelectProduct, StatementErrorCallback);
	}
	
	db.transaction(querySelectProduct, TransactionErrorCallback);

	debugWrite('queryStatus','end');
}

function queryDesc(table,db,id) {
	debugWrite('queryDesc','start');
	var page = $("."+table+"-page#"+id);
	var item = $("."+table+"-item#"+id);
	var itemData = item.jqmData("data");
	
	var successSelect = function (tx, results) {
		debugWrite('successSelect','start');
		debugWrite('results',results);
		debugWrite('results.rows',results.rows);
		var titles = Array()
		var len = results.rows.length;
		for (var i=0; i<len; i++){
			titles.push(results.rows.item(i).title);
		}
		item.find("#item-desc").text(titles.join(","));
		$("."+table+"-items.ui-listview").listview("refresh");
		debugWrite('successSelect','end');
	}
	
	switch(table) {
	case "diary":
	case "planner":
		var querySelect = function (tx) {
			var query = "SELECT cuisine_title AS title FROM "+table+"_cuisine JOIN cuisine ON "+table+"_cuisine.cuisine_id=cuisine.cuisine_id WHERE "+table+"_id=?";
			debugWrite(query,[itemId[table][itemData]]);
			tx.executeSql(query, [itemId[table][itemData]], successSelect, StatementErrorCallback);
		}
		db.transaction(querySelect, TransactionErrorCallback);
		break;
	case "cuisine":
		var querySelect = function (tx) {
			var query = "SELECT product_title AS title FROM "+table+"_product JOIN diet ON "+table+"_product.product_id=diet.product_id WHERE "+table+"_product."+table+"_product_qty>0 AND "+table+"_id=?";
			debugWrite(query,[itemId[table][itemData]]);
			tx.executeSql(query, [itemId[table][itemData]], successSelect, StatementErrorCallback);
		}
		db.transaction(querySelect, TransactionErrorCallback);
		break;
	}
	debugWrite('queryDesc','end');
}

function querySame(table,db,item,typeId,callback) {
	debugWrite('querySame','start');

	var querySelect = function (tx) {
		
		var successSelect = function (tx, results) {
			debugWrite('successSelect','start');
			debugWrite('results',results);
			debugWrite('results.rows',results.rows);
			item.find("option[data-placeholder='false']").remove();
			var len = results.rows.length;
			for (var i=0; i<len; i++){
				var option = "<option data-placeholder='false' value='"+results.rows.item(i).id+"'>"+results.rows.item(i).title+"</option>";
				item.append(option);
			}
			callback(db);
			debugWrite('successSelect','end');
		}
		
		var query = "SELECT "+table+"_id AS id,"+table+"_title AS title FROM "+table+" WHERE "+table+"_type_id=?";
		
		debugWrite(query,[typeId]);
		tx.executeSql(query, [typeId], successSelect, StatementErrorCallback);
	}
	db.transaction(querySelect, TransactionErrorCallback);

	debugWrite('querySame','end');
}

$(document).one('pagebeforecreate',function(event){
	debugWrite('pagebeforecreate');

	for(i=1; i<10 ; i++) {
		var table = "diet";
		var option = "<option data-placeholder='false' value='"+i+"'>"+i+" раз"+"</option>";
		$("#"+table+"-product-id-qty").append(option);
	}

	periods.forEach(function(value,index) {
		var table = "diet";
		var option = "<option data-placeholder='false' value='"+value.id+"'>"+value.title+"</option>";
		$("#"+table+"-product-id-period").append(option);
	});
	
	cuisineTypes.forEach(function(value,index) {
		var option = "<option data-placeholder='false' value='"+value.id+"'>"+value.title+"</option>";
		$("select.cuisine-type").append(option);
	});
	
	products.forEach(function(value,index) {
		var table = "cuisine";
		var item = $("."+table+"-product-template").clone();
		item.removeClass(""+table+"-product-template").addClass(""+table+"-product");
		item.find("."+table+"-product").jqmData("product-id",value.id);
		item.find("."+table+"-product-id").removeClass(""+table+"-product-id").addClass(""+table+"-"+value.id);
		item.find("#"+table+"-product-id").attr("id", ""+table+"-"+value.id).attr("name", ""+table+"-"+value.id);
		item.find("label[for='"+table+"-product-id']").attr("for",""+table+"-"+value.id).text(value.title);
		item.appendTo("#"+table+"-product");
	});
		
	products.forEach(function(value,index) {
		var table = "forecast";
		var item = $("."+table+"-product-template").clone();
		item.removeClass(""+table+"-product-template").addClass(""+table+"-product");
		item.jqmData("product-id",value.id);
		item.find("."+table+"-product-id").removeClass(""+table+"-product-id").addClass(""+table+"-"+value.id);
		item.find("#"+table+"-product-id").attr("id", ""+table+"-"+value.id).attr("name", ""+table+"-"+value.id);
		item.find("label[for='"+table+"-product-id']").attr("for",""+table+"-"+value.id).text(value.title);
		item.find("#"+table+"-"+value.id).attr("min",0).attr("max",value.qty).val(1);
		item.appendTo("#"+table+"-product");
		item.find("[data-role='none']").removeAttr("data-role");
	});
		
	products.forEach(function(value,index) {
		var table = "diet";
		var item = $("."+table+"-product-template").clone();
		item.removeClass(""+table+"-product-template").addClass(""+table+"-product");
		item.jqmData("product-id",value.id);
		item.find("#"+table+"-product-id").attr("id", ""+table+"-"+value.id).attr("name", ""+table+"-"+value.id).text(value.title);
		item.find("#"+table+"-product-id-qty").attr("id", ""+table+"-"+value.id+"-qty").attr("name", ""+table+"-"+value.id+"-qty").val(value.qty);
		item.find("#"+table+"-product-id-period").attr("id", ""+table+"-"+value.id+"-period").attr("name", ""+table+"-"+value.id+"-period").val(value.period);
		item.find("label[for='"+table+"-product-id']").attr("for",""+table+"-"+value.id);
		item.find("label[for='"+table+"-product-id-qty']").attr("for",""+table+"-"+value.id+"-qty");
		item.find("label[for='"+table+"-product-id-period']").attr("for",""+table+"-"+value.id+"-period");
		item.appendTo("#"+table+"-product");
		item.find("[data-role='none']").removeAttr("data-role");
	});
	
	tables.forEach(function(value,index) {
		var header = $(".header-template").clone();
		header.find("h2").text(value.title);
		header.prependTo($("#"+value.id+"[data-role='page']")).removeClass("header-template");
		debugWrite("h2",header.find("h2").text());
		debugWrite(value.id,value.title);
	});
});

var deviceReadyDeferred = $.Deferred();
var jqmReadyDeferred = $.Deferred();

$.when(deviceReadyDeferred, jqmReadyDeferred).then(function() {
	debugWrite('when(deviceReadyDeferred, jqmReadyDeferred).then','start');
	var db = getDatabase();
	queryItems("cuisine",db,function(db){
		$.mobile.changePage("#available");
	});
	debugWrite('when(deviceReadyDeferred, jqmReadyDeferred).then','end');
});

$(document).one("pageinit",function(event){
	debugWrite("pageinit");
		
	tables.forEach(function(value,index) {
		$("#"+value.id).jqmData("table",value.id);
		$("#"+value.id).find("a").jqmData("table",value.id);
	});
		
	jqmReadyDeferred.resolve();
});

$(document).on("pageinit",'#main',function(event){
	var table = $(this).jqmData("table");
	$("#"+table).find("a").jqmData("table",table);
});

$(document).on("pageinit",'#available',function(event){
	var table = $(this).jqmData("table");
	$("#"+table).find("a").jqmData("table",table);
	$("#"+table+" .plan").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var page = $(this).parents("."+table+"-page");
		var id = page.attr("id");
		var item = $("."+table+"-item#"+id);
		var planner = "planner";
		var plannerId = addItem(planner);
		var plannerPage = $("."+planner+"-page#"+plannerId);
		var plannerItem = $("."+planner+"-item#"+plannerId);
		var datetime = new Date(Date.parse($("#"+table+"-date").val())+12*60*60*1000);
		datetime = new Date(datetime.getTime()+datetime.getTimezoneOffset()*60*1000);
		plannerPage.find("#cuisine-date").val($.format.date(datetime,"yyyy-MM-dd"));
		plannerPage.find("#cuisine-time").val($.format.date(datetime,"HH:mm"));
		$("."+table+"-cuisine").each(function(index,element) {
			var value = $(element).jqmData("cuisine-id");
			var checked = $(element).find("#"+table+"-"+value+":checked");
			if (checked.length) {
				var cuisine = addItemCuisine(planner,plannerId);
				cuisine.find("select."+planner+"-cuisine").val(value);
				cuisine.addClass("new");
			}
		});
		plannerItem.addClass("new");
		plannerPage.addClass("new");
		$.mobile.changePage("#"+plannerId);
	});
});
$(document).on("pageinit",'#cuisine',function(event){
	var table = $(this).jqmData("table");
	$("#"+table).find("a").jqmData("table",table);
	$("#"+table+" .add").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var id = addItem(table);
		debugWrite("id",id);
		var page = $("."+table+"-page#"+id);
		var item = $("."+table+"-item#"+id);
		item.addClass("new");
		page.addClass("new");
		$("."+table+"-items.ui-listview").listview("refresh");
		$.mobile.changePage("#"+id);
	});
});
$(document).on("pageinit",'#diary,#planner',function(event){
	var table = $(this).jqmData("table");
	$("#"+table).find("a").jqmData("table",table);
	
	var today = new Date();
	$("#"+table+"-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#"+table+"-from-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#"+table+"-to-date").val($.format.date(today,"yyyy-MM-dd"));

	var db = getDatabase();
	$("."+table+"-item.new").remove();
	$("."+table+"-page.new").remove();
	queryItems(table,db,function(db){
		$("#"+table+" ."+table+"-items.ui-listview").listview("refresh");
	});
	
	$("#"+table+" .add").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var id = addItem(table);
		debugWrite("id",id);
		var page = $("."+table+"-page#"+id);
		var item = $("."+table+"-item#"+id);
		item.addClass("new");
		page.addClass("new");
		var today = new Date();
		page.find("#cuisine-date").val($.format.date(today,"yyyy-MM-dd"));
		page.find("#cuisine-time").val($.format.date(today,"HH:mm"));
		var cuisine = addItemCuisine(table,id);
		cuisine.addClass("new");
		$("#"+table+" ."+table+"-items.ui-listview").listview("refresh");
		$.mobile.changePage("#"+id);
	});
});

$(document).on("pageshow","#available,#forecast",function(event){
	var table = $(this).jqmData("table");
	clearItems(table);
	debugWrite("pageshow",table);
	var db = getDatabase();
	queryItems(table,db,function(db){
		debugWrite("queryItems(table,db,function(db){","start");
		$("#"+table+" ."+table+"-cuisine").trigger("create");
		$("#"+table+" ."+table+"-product input.ui-slider-input").slider("refresh");
		debugWrite($("#"+table+" ."+table+"-product input"),"refresh");
		debugWrite("queryItems(table,db,function(db){","end");
	});
});

$(document).on("pageshow","#diary,#planner",function(event){
	var table = $(this).jqmData("table");
	$("#"+table).jqmData("table",table);
	$("#"+table+" ."+table+"-item").jqmData("table",table);
	var db = getDatabase();
	$("#"+table+" ."+table+"-item").each(function(index,element) {
		var elementTable = $(element).jqmData("table");
		var elementId = $(element).attr("id");
		setStatus(elementTable,elementId,"time");
		queryStatus(elementTable,db,elementId);
	});
	$("#"+table+" ."+table+"-items.ui-listview").listview("refresh");
});

$(document).on("pageshow","#cuisine",function(event){
	var table = $(this).jqmData("table");
	$("#"+table).jqmData("table",table);
	$("#"+table+" ."+table+"-items.ui-listview").listview("refresh");
});

$(document).on("pageinit","#available,#forecast",function(event){
	var table = $(this).jqmData("table");
	$("#"+table).find("a").jqmData("table",table);
	
	var today = new Date();
	$("#"+table+"-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#"+table+"-from-date").val($.format.date(today,"yyyy-MM-dd"));
	$("#"+table+"-to-date").val($.format.date(today,"yyyy-MM-dd"));
});

function clearQueryUpdateStatus(table) {
	clearItems(table);
	var db = getDatabase();
	queryItems(table,db,function(db){
		$("#"+table+" ."+table+"-cuisine").trigger("create");
		$("#"+table+" ."+table+"-product input.ui-slider-input").slider("refresh");
		$("#"+table+" ."+table+"-items.ui-listview").listview("refresh");
		$("#"+table+" ."+table+"-item").each(function(index,element) {
			var elementTable = $(element).jqmData("table");
			var elementId = $(element).attr("id");
			setStatus(elementTable,elementId,"time");
			queryStatus(elementTable,db,elementId);
		});
		$("#"+table+" ."+table+"-items.ui-listview").listview("refresh");
	});
}

var buttons = Array(
	{ buttonClass:"today", timeOffset:0 },
	{ buttonClass:"tomorrow", timeOffset:24 * 60 * 60 * 1000 },
	{ buttonClass:"day-after-tomorrow", timeOffset:2 * 24 * 60 * 60 * 1000 },
	{ buttonClass:"next-week", timeOffset:7 * 24 * 60 * 60 * 1000 },
	{ buttonClass:"next-month", timeOffset:30 * 24 * 60 * 60 * 1000 },
	{ buttonClass:"yesterday", timeOffset:-24 * 60 * 60 * 1000 },
	{ buttonClass:"day-before-yesterday", timeOffset:-2 * 24 * 60 * 60 * 1000 },
	{ buttonClass:"prev-week", timeOffset:-7 * 24 * 60 * 60 * 1000 },
	{ buttonClass:"prev-month", timeOffset:-30 * 24 * 60 * 60 * 1000 }
);
	
tables.forEach(function(value,index) {
	$(document).on("pageinit","#"+value.id,function(event){
		var table = $(this).jqmData("table");
		$("#"+table).find("a").jqmData("table",table);
		
		buttons.forEach(function(value,index) {
			$("#"+table+" ."+value.buttonClass+"").jqmData("timeOffset",value.timeOffset);
			
			$("#"+table+" ."+value.buttonClass+"").bind("vclick", function(event,ui) {
				if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
				var table = $(this).jqmData("table");
				var timeOffset = $(this).jqmData("timeOffset");
				var today = new Date();
				var datetime = new Date(today.getTime() + timeOffset);
				$("#"+table+"-date").val($.format.date(datetime,"yyyy-MM-dd"));
				$("#"+table+"-from-date").val($.format.date(datetime,"yyyy-MM-dd"));
				$("#"+table+"-to-date").val($.format.date(datetime,"yyyy-MM-dd"));
				clearQueryUpdateStatus(table);
			});
		});
		
		$("#"+table+" .custom").bind("vclick", function(event,ui) {
			if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
			var table = $(this).jqmData("table");
			clearQueryUpdateStatus(table);
		});
	});
});

$(document).on("pageinit","#diet", function(event){
	var table = $(this).jqmData("table");
	$("#"+table).find("a").jqmData("table",table);
	
	var db = getDatabase();
	queryItems(table,db,function(db){
		$("#"+table+" ."+table+"-product select").selectmenu("refresh");
		debugWrite($("#"+table+" ."+table+"-product select"),"refresh");
	});

	$("#"+table+" .refresh").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		debugWrite(table,"refresh");
		products.forEach(function(value,index) {
			$("#"+table+"-"+value.id+"-qty").val(value.qty).change();
			$("#"+table+"-"+value.id+"-period").val(value.period).change();
		});
	});
	$("#"+table+" .save").bind("vclick", function(event,ui) {
		if (event.preventDefault) { event.preventDefault(); } else { event.returnValue = false; }
		var table = $(this).jqmData("table");
		var db = getDatabase();
		saveItem(table,db,"",function(db) { 
		});
	});
});

$(document).on("pagebeforecreate","div[data-role='page']",function(event) {
	$.mobiscroll.setDefaults({lang:currentLanguage});
	debugWrite("pagebeforecreate",$(this).find("input[type='date']"));
	debugWrite("pagebeforecreate",$(this).find("input[type='time']"));
	$(this).find("input[type='date']").attr("type","text").mobiscroll().date({theme:"jqm",dateFormat:"yy-mm-dd"});
	$(this).find("input[type='time']").attr("type","text").mobiscroll().time({theme:"jqm",timeFormat:"HH:ii"});
});

function fail(error) {        
	debugWrite('Fail',error);
	navigator.notification.alert('Error code: ' + error.code, null, 'Fail');
}
 
function TransactionErrorCallback(error) {
	debugWrite('TransactionErrorCallback',error);
	try {
		navigator.notification.alert(error.message+'('+error.code+')', null, 'Database Error');
	} catch(e) {
		debugWrite('catch error',e);
	}
}
function StatementErrorCallback(tx,error) {
	debugWrite('StatementErrorCallback',error);
	try {
		navigator.notification.alert(error.message+'('+error.code+')', null, 'Database Error');
	} catch(e) {
		debugWrite('catch error',e);
	}
}
function StatementCallback(tx, results) {
	debugWrite('StatementCallback',results);
}

// Wait for Cordova to load
//
document.addEventListener("deviceready", onDeviceReady, false);

// Cordova is ready
//
function onDeviceReady() {
	debugWrite("onDeviceReady","start");
	var db = getDatabase();
	debugWrite("db.version",db.version);
	createDatabase(db, function(db) {
		deviceReadyDeferred.resolve();
	});
	document.addEventListener("backbutton", handleBackButton, false);
	debugWrite("onDeviceReady","end");
}

function handleBackButton() {
  	debugWrite("Back Button Pressed!","start");
    navigator.app.exitApp();
  	debugWrite("Back Button Pressed!","end");
}