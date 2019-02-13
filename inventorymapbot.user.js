// ==UserScript==
// @id             iitc-plugin-InventoryMapBot@GMOogway
// @name           IITC plugin: InventoryMapBot plugin by GMOogway
// @category       Controls
// @version        0.3.0.20190211
// @author         GMOogway
// @description    [local-2019-02-11] InventoryMapBot plugin by GMOogway.
// @downloadURL    https://github.com/GMOogway/iitc-plugins/raw/master/inventorymapbot.user.js
// @updateURL      https://github.com/GMOogway/iitc-plugins/raw/master/inventorymapbot.user.js
// @namespace      https://github.com/GMOogway/iitc-plugins
// @include        https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==


function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
plugin_info.buildName = 'local';
plugin_info.dateTimeVersion = '20190211';
plugin_info.pluginId = 'InventoryMapBot';
//END PLUGIN AUTHORS NOTE

// PLUGIN START ////////////////////////////////////////////////////////
// use own namespace for plugin
window.plugin.InventoryMapBot = function() {};

window.plugin.InventoryMapBot.IS_DEBUG = false;
window.plugin.InventoryMapBot.DELAY = 500;
window.plugin.InventoryMapBot.GAODEMAP_KEY = '2ce1125f3069586a30a1dae79b0774eb';
window.plugin.InventoryMapBot.IDcount = 0;
window.plugin.InventoryMapBot.MAP_READY = false;
window.plugin.InventoryMapBot.STATUS = 'stop';

window.plugin.InventoryMapBot.getDateTime = function() {
  var date=new Date();
  var year=date.getFullYear();
  var month=date.getMonth()+1;
  var day=date.getDate();
  var hour="00"+date.getHours();
    hour=hour.substr(hour.length-2);
  var minute="00"+date.getMinutes();
    minute=minute.substr(minute.length-2);
  var second="00"+date.getSeconds();
    second=second.substr(second.length-2);
  var week=date.getDay();
  switch(week)
  {
    case 1:week="Monday ";break;
    case 2:week="Tuesday ";break;
    case 3:week="Wednesday ";break;
    case 4:week="Thursday ";break;
    case 5:week="Friday ";break;
    case 6:week="Saturday ";break;
    case 0:week="Sunday ";break;
    default:week="";break;
  }
  return (year+"/"+month+"/"+day+"/"+" "+week+" "+hour+":"+minute+":"+second);
}

window.plugin.InventoryMapBot.debug = function(msg) {
  if (window.plugin.InventoryMapBot.IS_DEBUG){
    console.log(' ');
    console.log('**********  ' + window.plugin.InventoryMapBot.getDateTime() + '  **********');
    console.log(msg);
    console.log('*************************************************************************');
    console.log(' ');

  }
}

// Generate an ID for the bookmark (date time + random number)
window.plugin.InventoryMapBot.generateID = function() {
  var d = new Date();
  var ID = d.getTime().toString() + window.plugin.InventoryMapBot.IDcount.toString() + (Math.floor(Math.random() * 99) + 1);
  window.plugin.InventoryMapBot.IDcount++;
  ID = 'id' + ID.toString();
  return ID;
}

// Format the string
window.plugin.InventoryMapBot.escapeHtml = function(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;").replace(/\//g, '&#47;').replace(/\\/g, '&#92;');
}

window.plugin.InventoryMapBot.escapeUnicode = function(str) {
  for (var result = '', index = 0, charCode; ! isNaN(charCode = str.charCodeAt(index));) {
    if ((charCode & 127) == charCode) {
      result += str[index];
    } else {
      result += '\\u' + ('0000' + charCode.toString(16)).slice( - 4);
    }
    index++;
  }
  return result;
}

window.plugin.InventoryMapBot.optSetStatus = function(status) {
  if (status === undefined){
    if (window.plugin.InventoryMapBot.STATUS == 'stop'){
      status = 'stop';
    }
  }
  switch(status) {
    case 'stop':{
      window.plugin.InventoryMapBot.STATUS = 'stop';
      $('#InventoryMapBot_status').text('Export');
      break;
    }
    case 'working':{
      window.plugin.InventoryMapBot.STATUS = 'working';
      $('#InventoryMapBot_status').text('Working(Don\'t move and zoom map)');
      break;
    }
  }
}

window.plugin.InventoryMapBot.optStatus = function() {
  window.plugin.InventoryMapBot.optSetStatus();
}

window.plugin.InventoryMapBot.manualOpt = function() {
  dialog({
    html: plugin.InventoryMapBot.htmlSetbox,
    dialogClass: 'ui-dialog',
    id: 'plugin-InventoryMapBot-options',
    title: 'InventoryMapBot Options'
  });
  window.plugin.InventoryMapBot.optSetStatus(window.plugin.InventoryMapBot.STATUS);
}

window.plugin.InventoryMapBot.optAlert = function(message, ms) {
  $('.ui-dialog .ui-dialog-buttonset').prepend('<p class="alert" style="float:left;margin-top:4px;">' + message + '</p>');
  if (ms === undefined){
    $('.alert').delay(1000).fadeOut();
  }else{
    $('.alert').delay(ms).fadeOut();
  }
}

window.plugin.InventoryMapBot.optCheck = function() {
  if (window.plugin.bookmarks && window.plugin.keys) {
    return true;
  } else {
    window.plugin.InventoryMapBot.optAlert('bookmarks and keys plugin installed?');
    return false;
  }
}

window.plugin.InventoryMapBot.optGetKeyCount = function(guid) {
  var keys = JSON.parse(localStorage['plugin-keys-data']);
  var keycount = keys[guid] || 0;
  return keycount;
}

window.plugin.InventoryMapBot.Sleep = function(ms) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve();
    },
    ms);
  });
}
window.plugin.InventoryMapBot.optExport = async function() {
  if (window.plugin.InventoryMapBot.optCheck()) {
    if (window.plugin.InventoryMapBot.STATUS == 'working') return;
    window.plugin.InventoryMapBot.optSetStatus('working');
    var dataobj = {
      agent: PLAYER.nickname,
      guid: "1234567890.c",
      items: {}
    };
    var portalsList = JSON.parse(localStorage['plugin-bookmarks']);
    // For each folder
    var list = portalsList.portals;
    for (var idFolders in list) {
      var folders = list[idFolders];
      // For each bookmark
      var fold = folders['bkmrk'];
      for (var idBkmrk in fold) {
        var bkmrk = fold[idBkmrk];
        var label = bkmrk['label'];
        var latlng = bkmrk['latlng'];
        var guid = bkmrk['guid'];
        var amount = window.plugin.InventoryMapBot.optGetKeyCount(guid);
        var portalDetails, portalAddress;
        try{
          await window.postAjax('getPortalDetails', {guid:guid}, function(data,textStatus,jqXHR) { portalDetails = data; }, function() {});
          $.getJSON("https://restapi.amap.com/v3/geocode/regeo?output=json&location=" + latlng.split(',')[1] + "," + latlng.split(',')[0] + "&key=" + window.plugin.InventoryMapBot.GAODEMAP_KEY + "&radius=1000&extensions=base").done(function(result) {
            portalAddress = result['regeocode']['formatted_address'];
          });
          await window.plugin.InventoryMapBot.Sleep(window.plugin.InventoryMapBot.DELAY);
          dataobj['items'][guid] = {
            "amount": amount,
            "guid": guid,
            "latitude": latlng.split(',')[0],
            "longitude": latlng.split(',')[1],
            "name": portalDetails['result'][8],
            "image": portalDetails['result'][7],
            "address": portalAddress
          };
          window.plugin.InventoryMapBot.optAlert('get ' + label + ' !', 500);
        }catch(e){
          alert('get ' + label + ' fail!');
        }
        //window.plugin.InventoryMapBot.debug(dataobj);
      }
    }
    dialog({
      html: '<p><a onclick="$(\'.ui-dialog-InventoryMapBot-copy textarea\').select();">Select all</a> and press CTRL+C to copy it.</p><textarea readonly>' + JSON.stringify(dataobj) + '</textarea>',
      dialogClass: 'ui-dialog-InventoryMapBot-copy',
      id: 'plugin-InventoryMapBot-export',
      title: 'InventoryMapBot Export'
    });
    window.plugin.InventoryMapBot.optSetStatus('stop');
  }
}

window.plugin.InventoryMapBot.optImport = async function() {
  if (window.plugin.InventoryMapBot.optCheck()) {
    var promptAction = prompt('Press CTRL+V to paste it.', '');
    if (promptAction !== null && promptAction !== '') {
      try {
        var bookmarksobj = {
          "maps": {
            "idOthers": {
              "label": "Others",
              "state": 1,
              "bkmrk": {}
            }
          },
          "portals": {
            "idOthers": {
              "label": "Others",
              "state": 1,
              "bkmrk": {}
            }
          }
        };
        var keysobj = {};
        var botdataobj = JSON.parse(promptAction); // try to parse JSON first
        var portals = botdataobj['items'];
        for (var portalguid in portals) {
          var portal = portals[portalguid];
          var guid = portal['guid'];
          if (portal['amount'] != 0) {
            keysobj[guid] = portal['amount'];
          }
          var ID = window.plugin.InventoryMapBot.generateID();
          bookmarksobj['portals']['idOthers']['bkmrk'][ID] = {
            "guid": portal['guid'],
            "latlng": portal['latitude'] + ',' + portal['longitude'],
            "label": portal['name']
          };
        }
        localStorage['plugin-bookmarks'] = JSON.stringify(bookmarksobj);
        localStorage['plugin-bookmarks-updating-queue'] = JSON.stringify(bookmarksobj);
        localStorage['plugin-keys-data'] = JSON.stringify(keysobj);
        localStorage['plugin-keys-data-queue'] = JSON.stringify(keysobj);
        window.plugin.InventoryMapBot.optAlert('Successful. ');
      } catch(e) {
        console.warn('InventoryMapBot: failed to import data: ' + e);
        window.plugin.InventoryMapBot.optAlert('<span style="color: #f88">Import failed </span>');
      }
    }
  }
}

window.plugin.InventoryMapBot.onMapDataRefreshEnd = function () {
  //window.plugin.InventoryMapBot.debug('onMapDataRefreshEnd');
  window.plugin.InventoryMapBot.MAP_READY = true;
}

window.plugin.InventoryMapBot.onMapDataRefreshStart = function () {
  //window.plugin.InventoryMapBot.debug('onMapDataRefreshStart');
  window.plugin.InventoryMapBot.MAP_READY = false;
}

window.plugin.InventoryMapBot.setupContent = function() {
  plugin.InventoryMapBot.htmlCallSetBox = '<a onclick="window.plugin.InventoryMapBot.manualOpt();return false;">InventoryMapBot Opt</a>';
  var actions = '';
  actions += '<a id="InventoryMapBot_status" onclick="window.plugin.InventoryMapBot.optExport();return false;">Export</a>';
  actions += '<a onclick="window.plugin.InventoryMapBot.optImport();return false;">Import</a>';
  plugin.InventoryMapBot.htmlSetbox = '<div id="InventoryMapBotSetbox">' + actions + '</div>';
}

window.plugin.InventoryMapBot.setupCSS = function() {
  $('<style>').prop('type', 'text/css').html('\
  #InventoryMapBotSetbox a{\
	display:block;\
	color:#ffce00;\
	border:1px solid #ffce00;\
	padding:3px 0;\
	margin:10px auto;\
	width:80%;\
	text-align:center;\
	background:rgba(8,48,78,.9);\
  }\
  #InventoryMapBotSetbox a.disabled,\
  #InventoryMapBotSetbox a.disabled:hover{\
	color:#666;\
	border-color:#666;\
	text-decoration:none;\
  }\
  .ui-dialog-InventoryMapBot-copy textarea{\
	width:96%;\
	height:120px;\
	resize:vertical;\
  }\
').appendTo('head');
}

var setup = function() {
  window.plugin.InventoryMapBot.setupCSS();
  window.plugin.InventoryMapBot.setupContent();
  $('#toolbox').append(window.plugin.InventoryMapBot.htmlCallSetBox);
  //window.addHook('mapDataRefreshStart', window.plugin.InventoryMapBot.onMapDataRefreshStart);
  //window.addHook('mapDataRefreshEnd', window.plugin.InventoryMapBot.onMapDataRefreshEnd);
}
// PLUGIN END //////////////////////////////////////////////////////////


setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
