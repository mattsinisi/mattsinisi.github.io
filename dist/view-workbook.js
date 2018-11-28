/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(5);


/***/ }),

/***/ 5:
/***/ (function(module, exports) {

	"use strict";

	TableauServerClient = TableauServerClient.default || TableauServerClient;

	function get_actionlist() {
	  return {
	    "Export to PDF": function ExportToPDF(viz) {
	      viz.showExportPDFDialog();
	    },
	    "Export Image": function ExportImage(viz) {
	      viz.showExportImageDialog();
	    },
	    "Export Crosstab": function ExportCrosstab(viz) {
	      viz.showExportCrossTabDialog();
	    },
	    "Export Data": function ExportData(viz) {
	      viz.showExportDataDialog();
	    },
	    "Revert All": function RevertAll(viz) {
	      viz.getWorkbook().revertAllAsync();
	    },
	    "Download": function Download(viz) {
	      viz.showDownloadWorkbookDialog();
	    }
	  };
	}

	function populate_actionmenu(viz) {
	  var ul = $("ul#actionmenu");
	  ul.empty();
	  $.each(get_actionlist(), function (label, action) {
	    var button = $("<button>" + label + "</button>").on("click", function () {
	      action(viz);
	    }).appendTo(ul).wrap("<li/>");
	  });
	}

	function load_viz(view) {
	  try {
	    var server = view.server;
	    var containerDiv = document.getElementById('content');
	    var baseUrl = server.baseUrl.replace('http:', '').replace('https:', '');

	    // let url = `http:${baseUrl}/views/${view.url}`;
	    // let url = `http:${baseUrl}/t/PerformingArts/views/${view.url}`;
	    // if (server.contentUrl) {
	    //   url = `http:${baseUrl}/t/${server.siteContentUrl}/views/${view.url}`;
	    // }

	    // hard-coding site -> TODO remove this
	    var url = "http:" + baseUrl + "/t/PerformingArts/views/" + view.url;

	    return new Promise(function (done, err) {
	      try {
	        var options = { hideTabs: true, onFirstInteractive: function onFirstInteractive(e) {
	            return done(e);
	          }, hideToolbar: true };
	        var viz = new tableau.Viz(containerDiv, url, options);
	      } catch (e) {
	        console.log(e);err(e);
	      }
	    });
	  } catch (err) {
	    return Promise.reject(err);
	  }
	}

	function create_thumbnail(data) {
	  console.dir(data);
	  var img = "<img src=\"" + data.imageUrl + "\" alt=\"" + data.view.name + " class=\"img-responsive\"> ";
	  var tag = "<a href=\"#\" class=\"viewLink\" data-viewname=\"" + data.view.name + "\">" + img + "</a>";
	  return $(tag);
	}

	function set_view(workbook, element) {
	  var viewname = element.dataset.viewname;
	  console.dir(element.dataset);
	  history.pushState({ viewname: viewname }, "", "#" + viewname);
	  switch_view(workbook, viewname);
	}

	function switch_view(workbook, viewname) {
	  try {
	    workbook.activateSheetAsync(viewname);
	  } catch (err) {
	    console.log(viewname, err);
	  }
	}

	function handle_state(viewname, workbook) {
	  if (viewname !== undefined) {
	    switch_view(workbook, viewname);
	  }
	}

	function populate_view_thumbnails(views) {
	  var thumbnailContainer = $('#thumbnailContainer');
	  var thumbnails = views.map(create_thumbnail);
	  thumbnails.map(function (x) {
	    return thumbnailContainer.append(x);
	  });
	}

	function show_workbook(username, password, server_url, siteName) {
	  var workbook_id = location.search.substring(1, location.search.length); // Remove the opening '?'
	  var auth = TableauServerClient.Auth(username, password, siteName);
	  TableauServerClient.sign_in(server_url, auth).then(function (server) {
	    return server.workbook(workbook_id).populate();
	  }).then(function (value) {
	    return value.views.then(function (value) {
	      var firstView = value[0];
	      var promises = value.map(function (x) {
	        return x.previewImage;
	      });
	      promises.push(load_viz(firstView));

	      return Promise.all(promises);
	    });
	  }).then(function (values) {
	    var viewImages = values.filter(function (x) {
	      return x !== undefined && x.imageUrl !== undefined;
	    });
	    var vizEvent = values.filter(function (x) {
	      return x !== undefined && x.getEventName;
	    })[0];
	    var viz = vizEvent.getViz();
	    var workbook = viz.getWorkbook();
	    var stateObj = history.state || {};
	    var initialSheet = stateObj.viewname || location.hash.substring(1, location.hash.length);
	    if (initialSheet) {
	      handle_state(initialSheet, workbook);
	    }
	    populate_view_thumbnails(viewImages);
	    $('.viewLink').on('click', function (evt) {
	      evt.preventDefault();
	      set_view(workbook, evt.currentTarget);
	    });
	    window.onpopstate = function (evt) {
	      handle_state(evt.state.viewname, workbook);
	    };

	    populate_actionmenu(viz);
	  }).catch(function (err) {
	    return console.dir(err);
	  });
	}
	$(document).ready(function () {
	  // Clone our header and footer content into the page
	  $("#header").load("-header.html");
	  $("#footer").load("-footer.html");

	  if (window.AppConfig.cors) {
	    TableauServerClient.set_cors_proxy(window.AppConfig.cors.ip, window.AppConfig.cors.port);
	  }
	  try {
	    show_workbook(window.AppConfig.username, window.AppConfig.password, window.AppConfig.server_url, window.AppConfig.site_name);
	  } catch (err) {
	    console.log('ERRR!');
	    console.dir(err);
	  }
	});

/***/ })

/******/ });