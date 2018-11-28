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
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _viewFavorites = __webpack_require__(2);

	var _viewFavorites2 = _interopRequireDefault(_viewFavorites);

	var _viewTaggedWorkbooks = __webpack_require__(4);

	var _viewTaggedWorkbooks2 = _interopRequireDefault(_viewTaggedWorkbooks);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	TableauServerClient = TableauServerClient.default || TableauServerClient;

	$(document).ready(function () {
	  if (window.AppConfig.cors) {
	    TableauServerClient.set_cors_proxy(window.AppConfig.cors.ip, window.AppConfig.cors.port);
	  }

	  var auth = TableauServerClient.Auth(window.AppConfig.username, window.AppConfig.password, window.AppConfig.site_name);
	  TableauServerClient.sign_in(window.AppConfig.server_url, auth).then(function (server) {
	    (0, _viewFavorites2.default)(server);
	    (0, _viewTaggedWorkbooks2.default)(server, window.AppConfig.team_tag);
	  });
	});

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _utils = __webpack_require__(3);

	TableauServerClient = TableauServerClient.default || TableauServerClient;

	function getFavorites(server) {
	  server.favorites.get().then(function (value) {
	    var favorites = value.favorites;

	    return Promise.all(favorites.map(function (x) {
	      return x.populate().then(function (x) {
	        return x.previewImage;
	      });
	    }));
	  }).then(function (values) {
	    var elements = values.map(function (x) {
	      return (0, _utils.build_element)(x.workbook, x.imageUrl);
	    });
	    var containers = (0, _utils.create_rows)(elements, 3);
	    (0, _utils.add_to_content)(containers, 'myFavoritesContainer');
	  });
	}

	exports.default = function (server) {
	  return getFavorites(server);
	};

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.build_element = build_element;
	exports.create_rows = create_rows;
	exports.add_to_content = add_to_content;
	function create_link_to_workbook(workbookId) {
	  return $('<a href="workbook.html?' + workbookId + '"/>');
	}

	function create_tags_element(tagList) {
	  var tagListString = tagList.join(', ');
	  return $('<p> Tags: ' + tagListString + '</p><p></p>');
	}

	function build_element(workbook, previewImageUrl) {
	  var retval = $('<div />');
	  retval.addClass("col-md-4").addClass("faculty_grid");

	  var figure = $('<figure />').addClass("team_member").addClass('viz'); // FIXME not a team member
	  var img = $('<img />');
	  img.addClass('img-responsive').attr('alt', '').attr('src', previewImageUrl);

	  var title = $('<h3 class="person-title"/>');
	  title.text(workbook.name);

	  var caption = $('<figcaption />');
	  figure.append(img);
	  figure.append('<div />');
	  caption.append(title);
	  caption.append(create_tags_element(workbook.tags));
	  figure.append(caption);

	  var titleLink = create_link_to_workbook(workbook.id);
	  figure.wrapInner(titleLink);

	  retval.append(figure);
	  return retval;
	}

	function create_rows(elements, size) {
	  var retval = [];
	  for (var i = 0; i < elements.length; i += size) {
	    retval.push(elements.slice(i, i + size));
	  }

	  return retval;
	}

	function wrap_in_container(elements) {
	  var container = $(document.createElement('div'));
	  container.addClass('faculty_top');
	  elements.map(function (x) {
	    return container.append(x);
	  });
	  container.append($('<div class="clearfix"> </div>'));

	  return container;
	}

	function add_to_content(containers, element_name) {
	  var content = $(document.getElementById(element_name));
	  containers.map(function (x) {
	    return wrap_in_container(x);
	  }).map(function (x) {
	    return content.append(x);
	  });
	}

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _utils = __webpack_require__(3);

	TableauServerClient = TableauServerClient.default || TableauServerClient;

	function getWorkbooks(server, tag) {
	  server.workbooks.get({
	    filter: {
	      operator: TableauServerClient.operators.Equal,
	      field: TableauServerClient.fields.Tag,
	      value: tag
	    }
	  }).then(function (value) {
	    var workbooks = value.workbooks;

	    return Promise.all(workbooks.map(function (x) {
	      return x.previewImage;
	    }));
	  }).then(function (values) {
	    var elements = values.map(function (x) {
	      return (0, _utils.build_element)(x.workbook, x.imageUrl);
	    });
	    var containers = (0, _utils.create_rows)(elements, 3);
	    (0, _utils.add_to_content)(containers, 'teamWorkbooksContainer');
	  });
	}

	exports.default = function (server, tag) {
	  return getWorkbooks(server, tag);
	};

/***/ })
/******/ ]);