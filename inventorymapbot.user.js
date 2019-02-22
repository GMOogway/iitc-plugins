// ==UserScript==
// @id             iitc-plugin-InventoryMapBot@GMOogway
// @name           IITC plugin: InventoryMapBot plugin
// @category       Controls
// @version        0.4.5.20190214
// @author         GMOogway
// @description    [local-2019-02-14] InventoryMapBot plugin by GMOogway, works with sync.
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
plugin_info.dateTimeVersion = '20190214';
plugin_info.pluginId = 'InventoryMapBot';
//END PLUGIN AUTHORS NOTE

// PLUGIN START ////////////////////////////////////////////////////////
// use own namespace for plugin
window.plugin.InventoryMapBot = function() {};

window.plugin.InventoryMapBot.IS_DEBUG = true;
window.plugin.InventoryMapBot.KEY_STORAGE = 'plugin-inventorymapbot-data';
window.plugin.InventoryMapBot.STATUS = 'stop';
window.plugin.InventoryMapBot.NOKEYSPORTALS = 'agent-no-keys-protals';
window.plugin.InventoryMapBot.dataObj = {};
window.plugin.InventoryMapBot.updateQueue = {};
window.plugin.InventoryMapBot.updatingQueue = {};
window.plugin.InventoryMapBot.KEY = {key: window.plugin.InventoryMapBot.KEY_STORAGE, field: 'dataObj'};
window.plugin.InventoryMapBot.UPDATE_QUEUE = {key: 'plugin-InventoryMapBot-queue', field: 'updateQueue'};
window.plugin.InventoryMapBot.UPDATING_QUEUE = {key: 'plugin-InventoryMapBot-updating-queue', field: 'updatingQueue'};
window.plugin.InventoryMapBot.SYNC_DELAY = 3000;
window.plugin.InventoryMapBot.enableSync = false;

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
  return (year+"/"+month+"/"+day+" "+week+" "+hour+":"+minute+":"+second);
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

window.plugin.InventoryMapBot.saveStorage = function() {
  window.plugin.InventoryMapBot.storeLocal(window.plugin.InventoryMapBot.KEY);
  window.plugin.InventoryMapBot.syncNow();
}

window.plugin.InventoryMapBot.loadStorage = function() {
  window.plugin.InventoryMapBot.loadLocal(window.plugin.InventoryMapBot.KEY);
}

window.plugin.InventoryMapBot.resetStorage = function() {
  window.plugin.InventoryMapBot.loadLocal(window.plugin.InventoryMapBot.KEY);
  window.plugin.InventoryMapBot.updateQueue = {};
  for(var agent in window.plugin.InventoryMapBot.dataObj){
    window.plugin.InventoryMapBot.updateQueue[agent] = undefined;
  }
  window.plugin.InventoryMapBot.dataObj = {};
  window.plugin.InventoryMapBot.dataObj[window.plugin.InventoryMapBot.NOKEYSPORTALS] = {'agent':window.plugin.InventoryMapBot.NOKEYSPORTALS, 'items':{}};
  window.plugin.InventoryMapBot.storeLocal(window.plugin.InventoryMapBot.KEY);
  window.plugin.InventoryMapBot.syncNow();
}

window.plugin.InventoryMapBot.createStorage = function() {
  if (!localStorage[window.plugin.InventoryMapBot.KEY_STORAGE]){
    window.plugin.InventoryMapBot.resetStorage();
  }
}

// Delay the syncing to group a few updates in a single request
window.plugin.InventoryMapBot.delaySync = function() {
  if(!window.plugin.InventoryMapBot.enableSync) return;
  clearTimeout(window.plugin.InventoryMapBot.delaySync.timer);
  window.plugin.InventoryMapBot.delaySync.timer = setTimeout(function() {
    window.plugin.InventoryMapBot.delaySync.timer = null;
    window.plugin.InventoryMapBot.syncNow();
  }, window.plugin.InventoryMapBot.SYNC_DELAY);
}

// Store the updateQueue in updatingQueue and upload
window.plugin.InventoryMapBot.syncNow = function() {
  if(!window.plugin.InventoryMapBot.enableSync) return;
  //$.extend(window.plugin.InventoryMapBot.updatingQueue, window.plugin.InventoryMapBot.updateQueue);
  window.plugin.InventoryMapBot.loadLocal(window.plugin.InventoryMapBot.KEY);
  window.plugin.InventoryMapBot.updatingQueue = window.plugin.InventoryMapBot.dataObj;
  for(var agent in window.plugin.InventoryMapBot.updateQueue){
    if (!window.plugin.InventoryMapBot.updatingQueue[agent]){
      window.plugin.InventoryMapBot.updatingQueue[agent] = undefined;
    }
  }
  window.plugin.InventoryMapBot.storeLocal(window.plugin.InventoryMapBot.UPDATING_QUEUE);
  window.plugin.InventoryMapBot.updateQueue = {};
  window.plugin.InventoryMapBot.storeLocal(window.plugin.InventoryMapBot.UPDATE_QUEUE);
  window.plugin.sync.updateMap('InventoryMapBot', window.plugin.InventoryMapBot.KEY.field, Object.keys(window.plugin.InventoryMapBot.updatingQueue));
}

// Call after IITC and all plugin loaded
window.plugin.InventoryMapBot.registerFieldForSyncing = function() {
  if(!window.plugin.sync) return;
  window.plugin.sync.registerMapForSync('InventoryMapBot', window.plugin.InventoryMapBot.KEY.field, window.plugin.InventoryMapBot.syncCallback, window.plugin.InventoryMapBot.syncInitialed);
}

// Call after local or remote change uploaded
window.plugin.InventoryMapBot.syncCallback = function(pluginName, fieldName, e, fullUpdated) {
  if(fieldName === window.plugin.InventoryMapBot.KEY.field) {
    window.plugin.InventoryMapBot.storeLocal(window.plugin.InventoryMapBot.KEY);
    // All data is replaced if other client update the data during this client offline,
    if(fullUpdated) {
    	//fullUpdated
      return;
    }
    if(!e) return;
    if(e.isLocal) {
      // Update pushed successfully, remove it from updatingQueue
      delete window.plugin.InventoryMapBot.updatingQueue[e.property];
    } else {
      // Remote update
      delete window.plugin.InventoryMapBot.updateQueue[e.property];
      window.plugin.InventoryMapBot.storeLocal(window.plugin.InventoryMapBot.UPDATE_QUEUE);
      console.log('InventoryMapBot: synchronized all');
    }
  }
}

// syncing of the field is initialed, upload all queued update
window.plugin.InventoryMapBot.syncInitialed = function(pluginName, fieldName) {
  if(fieldName === window.plugin.InventoryMapBot.KEY.field) {
    window.plugin.InventoryMapBot.enableSync = true;
    if(Object.keys(window.plugin.InventoryMapBot.updateQueue).length > 0) {
      window.plugin.InventoryMapBot.delaySync();
    }
  }
}

window.plugin.InventoryMapBot.storeLocal = function(mapping) {
  if(typeof(window.plugin.InventoryMapBot[mapping.field]) !== 'undefined' && window.plugin.InventoryMapBot[mapping.field] !== null) {
    localStorage[mapping.key] = JSON.stringify(window.plugin.InventoryMapBot[mapping.field]);
  } else {
    localStorage.removeItem(mapping.key);
  }
}

window.plugin.InventoryMapBot.loadLocal = function(mapping) {
  var objectJSON = localStorage[mapping.key];
  if(!objectJSON) return;
  window.plugin.InventoryMapBot[mapping.field] = mapping.convertFunc
                          ? mapping.convertFunc(JSON.parse(objectJSON))
                          : JSON.parse(objectJSON);
}

window.plugin.InventoryMapBot.syncInventoryMapBot = function() {
  window.plugin.InventoryMapBot.delaySync();
}

window.plugin.InventoryMapBot.optExportToXLSX = function() {
  if (typeof(XLSX) == undefined){
    window.plugin.InventoryMapBot.optAlert('Not ready!');
    return;
  }

  window.plugin.InventoryMapBot.loadLocal(window.plugin.InventoryMapBot.KEY);
  var data = window.plugin.InventoryMapBot.dataObj;
  var json = [];
  for(var agent in data){
    for(var guid in data[agent]['items']){
      json.push({   "agent":agent,
                    "name":data[agent]['items'][guid]['name'],
                    "amount":data[agent]['items'][guid]['amount'],
                    "guid":guid,
                    "latitude":data[agent]['items'][guid]["latitude"],
                    "longitude":data[agent]['items'][guid]["longitude"],
                    "image":data[agent]['items'][guid]["image"],
                    "address":data[agent]['items'][guid]["address"]}
                  );
    }
  }
 //window.plugin.InventoryMapBot.debug(json);
  var wb = XLSX.utils.book_new();
  var ws = XLSX.utils.json_to_sheet(json, {header:["agent","name","amount","guid","latitude","longitude","image","address"]});
  XLSX.utils.book_append_sheet(wb, ws);
  var wbout = XLSX.write(wb, {bookType:'xlsx', type:'array'});
  var xlsxObj = new Blob([wbout],{type:"application/octet-stream"});
  var xlsxDownloadElement = document.createElement("a");
  xlsxDownloadElement.download = 'inventory ' + window.plugin.InventoryMapBot.getDateTime() + '.xlsx';
  xlsxDownloadElement.href = URL.createObjectURL(xlsxObj);
  xlsxDownloadElement.click();
  setTimeout(function () {
    URL.revokeObjectURL(xlsxObj);
  }, 500);
}

window.plugin.InventoryMapBot.optImportFromXLSX = function(){
  if (typeof(XLSX) == undefined){
    window.plugin.InventoryMapBot.optAlert('Not ready!');
    return;
  }

  dialog({
    html: '<div id="plugin-InventoryMapBot-import-xlsx-div" style="border: 1px solid #ffce00;margin: 20px 48px;width:65%;text-align:center;"><input type="file" onchange="window.plugin.InventoryMapBot.importXLSX(this)"/></div>',
    dialogClass: 'ui-dialog',
    id: 'plugin-InventoryMapBot-import-xlsx',
    title: 'Choose a xlsx file'
  });
}

window.plugin.InventoryMapBot.importXLSX = function(obj){
  if (!obj.files){
    return;
  }
  try{
    $("#plugin-InventoryMapBot-import-xlsx-div").html("working");
    var f = obj.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      var data = e.target.result;
      var wb = XLSX.read(data, {type: 'binary'});
      var sheet_name_list = wb.SheetNames;
      var json = XLSX.utils.sheet_to_json(wb.Sheets[sheet_name_list[0]]);
      var dataObj = {};
      window.plugin.InventoryMapBot.debug('start');
      for (var row in json){
        //window.plugin.InventoryMapBot.debug(row);
        window.plugin.InventoryMapBot.debug('for');
        try{
          if (json[row]['agent'].replace(/(^s*)|(s*$)/g, "").length > 0 && json[row]['name'].replace(/(^s*)|(s*$)/g, "").length > 0 && Math.floor(json[row]['amount']) === json[row]['amount'] && json[row]['amount'] >= 0 && json[row]['guid'].replace(/(^s*)|(s*$)/g, "").length > 0 && !isNaN(json[row]['latitude']) && json[row]['latitude'] > -90 && json[row]['latitude'] < 90 && !isNaN(json[row]['longitude']) && json[row]['longitude'] > -180 && json[row]['longitude'] < 180 && json[row]['image'].replace(/(^s*)|(s*$)/g, "").length > 0 && json[row]['address'].replace(/(^s*)|(s*$)/g, "").length > 0){
            window.plugin.InventoryMapBot.debug('for in');
            if (!dataObj[json[row]['agent']]){
              dataObj[json[row]['agent']] = {};
            }
            if (!dataObj[json[row]['agent']]['agent']){
              dataObj[json[row]['agent']]['agent'] = json[row]['agent'];
            }
            if (!dataObj[json[row]['agent']]['items']){
              dataObj[json[row]['agent']]['items'] = {};
            }
            dataObj[json[row]['agent']]['items'][json[row]['guid']] = {
              'amount':    (json[row]['agent'] == window.plugin.InventoryMapBot.NOKEYSPORTALS)?0:json[row]['amount'],
              'name':      json[row]['name'],
              'guid':      json[row]['guid'],
              'latitude':  json[row]['latitude'],
              'longitude': json[row]['longitude'],
              'image':     json[row]['image'],
              'address':   json[row]['address']
            }
          }else{
            $("#plugin-InventoryMapBot-import-xlsx-div").html("Invaild format");
            return;
          }
        }catch(e){
          $("#plugin-InventoryMapBot-import-xlsx-div").html("Invaild format");
          return;
        }
      }
      window.plugin.InventoryMapBot.dataObj = dataObj;
      window.plugin.InventoryMapBot.saveStorage();
      window.plugin.InventoryMapBot.optRefreshBkmksKeysData();
      $("#plugin-InventoryMapBot-import-xlsx-div").html("Over");
    };
    reader.readAsBinaryString(f);
  }catch(e){
    window.plugin.InventoryMapBot.debug('catch');
    $("#plugin-InventoryMapBot-import-xlsx-div").html("Error");
    return;
  }
}

window.plugin.InventoryMapBot.setupContent = function() {
  plugin.InventoryMapBot.htmlCallSetBox = '<a onclick="window.plugin.InventoryMapBot.manualOpt();return false;">InventoryMapBot Opt</a>';
  var actions = '';
  actions += '<a id="InventoryMapBot_status" onclick="window.plugin.InventoryMapBot.optExport();return false;">Export to JSON</a>';
  actions += '<a onclick="window.plugin.InventoryMapBot.optImport();return false;">Import From JSON</a>';
  actions += '<a id="InventoryMapBot_export_to_xlsx" onclick="window.plugin.InventoryMapBot.optExportToXLSX();return false;">Export to XLSX</a>';
  actions += '<a id="InventoryMapBot_export_from_xlsx" onclick="window.plugin.InventoryMapBot.optImportFromXLSX();return false;">Import Form XLSX</a>';
  actions += '<a onclick="window.plugin.InventoryMapBot.optReset();return false;">Reset</a>';
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

  $('<style>').prop('type', 'text/css').html('\
    #InventoryMapBot-keys-content-outer {\
      display: table;\
      width: 100%;\
      height: 26px;\
      text-align: center;\
    }\
    #InventoryMapBot-keys-content-outer > div{\
      display: inline-block;\
      vertical-align: middle;\
      margin: 6px 3px 1px 3px;\
    }\
    .InventoryMapBot-keys-label {\
      padding: 0 4px;\
    }\
    .InventoryMapBot-keys-agent-name {\
      width: 80px;\
      padding: 0 4px;\
    }\
    .InventoryMapBot-keys-count {\
      width: 26px;\
      height: 18px !important;\
      border: 1px solid;\
      text-align: center;\
    }\
    .InventoryMapBot-keys-button {\
      position:relative;\
      width: 16px;\
      height: 16px !important;\
    }\
    .InventoryMapBot-keys-button > div {\
      background-color: rgb(32, 168, 177);\
      position: absolute;\
    }\
    .InventoryMapBot-keys-button-minus {\
      width: 100%;\
      height: 4px;\
      top: 6px;\
    }\
    .InventoryMapBot-keys-button-plus-h {\
      width: 100%;\
      height: 4px;\
      top: 6px;\
    }\
    .InventoryMapBot-keys-button-plus-v {\
      width: 4px;\
      height: 100%;\
      left: 6px;\
    }\
  ').appendTo("head");
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

window.plugin.InventoryMapBot.manualOpt = function() {
  dialog({
    html: plugin.InventoryMapBot.htmlSetbox,
    dialogClass: 'ui-dialog',
    id: 'plugin-InventoryMapBot-options',
    title: 'InventoryMapBot Options'
  });
  //window.plugin.InventoryMapBot.optSetStatus(window.plugin.InventoryMapBot.STATUS);
}

window.plugin.InventoryMapBot.optCheckRequirePlugins = function() {
  if (window.plugin.bookmarks && window.plugin.keys) {
    return true;
  } else {
    window.plugin.InventoryMapBot.optAlert('bookmarks and keys plugin installed?');
    return false;
  }
}

window.plugin.InventoryMapBot.optAlert = function(message, ms) {
  $('.ui-dialog .ui-dialog-buttonset').prepend('<p class="alert" style="float:left;margin-top:4px;">' + message + '</p>');
  if (ms === undefined){
    $('.alert').delay(2000).fadeOut();
  }else{
    $('.alert').delay(ms).fadeOut();
  }
}

window.plugin.InventoryMapBot.optCheckJsonFormat = function(data){
  if (data['agent'] && data['items']){
    return 'single';
  }else{
    var flag = true;
    try{
      for (var agent in data) {
        if (!data[agent]['items'] || !data[agent]['agent'] || data[agent]['agent'] != agent) flag = false;
      }
      if (flag){
        return 'multiple';
      }else{
        return 'unknown';
      }
    }catch(e){
      return 'unknown';
    }
  }
}

window.plugin.InventoryMapBot.getJsonLength = function(jsonData){
  var jsonLength = 0;
  for(var item in jsonData){
    jsonLength++;
  }
  return jsonLength;
}

window.plugin.InventoryMapBot.optCleanItems = function(data){
  try{
   for(var item in data['items']){
     if (!data['items'][item]['latitude'] || !data['items'][item]['longitude']){
       delete data['items'][item];
     }
     if (data['agent'] == window.plugin.InventoryMapBot.NOKEYSPORTALS){
       data['items'][item]['amount'] = 0;
     }
   }
   return data;

  }catch(e)
  {
    return undefined;
  }
}

window.plugin.InventoryMapBot.resetKeys = function(){
  window.plugin.keys.updateQueue = {};
  try{
    for (var guid in JSON.parse(localStorage[window.plugin.keys.KEY.key])){
      window.plugin.keys.updateQueue[guid] = null;
    }
  }catch(e){

  }
  window.plugin.keys.keys = {};
  window.plugin.keys.storeLocal(window.plugin.keys.KEY);
  window.plugin.keys.storeLocal(window.plugin.keys.UPDATE_QUEUE);
  window.plugin.keys.syncNow();
}

window.plugin.InventoryMapBot.resetBookmarks = function(){
  delete localStorage[window.plugin.bookmarks.KEY_STORAGE];
  window.plugin.bookmarks.createStorage();
  window.plugin.bookmarks.loadStorage();
  window.plugin.bookmarks.refreshBkmrks();
  window.runHooks('pluginBkmrksEdit', {"target": "all", "action": "reset"});
}

window.plugin.InventoryMapBot.optReset = function() {
  if (!window.plugin.InventoryMapBot.optCheckRequirePlugins()) {
    return;
  }
  var result;
  result = confirm('This operation will erase all data. Are you sure?');
  if (result){
    result = confirm('Confirm again. This operation will erase all data. ARE YOU SURE?');
    if (result){
      window.plugin.InventoryMapBot.resetBookmarks();
      window.plugin.InventoryMapBot.resetKeys();
      window.plugin.InventoryMapBot.resetStorage();
      window.plugin.InventoryMapBot.optAlert('Reset successful. ');
    }
  }
}

window.plugin.InventoryMapBot.optImportSingle = function(data){
  try{
    window.plugin.InventoryMapBot.loadStorage();
    data = window.plugin.InventoryMapBot.optCleanItems(data);
    if (data !== undefined){
      window.plugin.InventoryMapBot.dataObj[data['agent']] = {};
      window.plugin.InventoryMapBot.dataObj[data['agent']]['agent'] = data['agent'];
      window.plugin.InventoryMapBot.dataObj[data['agent']]['items'] = data['items'];
      if (!window.plugin.InventoryMapBot.dataObj[window.plugin.InventoryMapBot.NOKEYSPORTALS]){
        window.plugin.InventoryMapBot.dataObj[window.plugin.InventoryMapBot.NOKEYSPORTALS] = {'agent':window.plugin.InventoryMapBot.NOKEYSPORTALS, 'items':{}};
      }
      window.plugin.InventoryMapBot.saveStorage();
      return true;
    }else{
      return false;
    }
  }catch(e){
    window.plugin.InventoryMapBot.optAlert('<span style="color: #f88">Import failed: ' + e + '</span>');
    return false;
  }
}

window.plugin.InventoryMapBot.optImportMultiple = function(data){
  try{
    var result = confirm('This operation will erase all bookmarks and keys data. Are you sure?');
    var agent;
    if (result){
      for(agent in data){
        var agentdata = window.plugin.InventoryMapBot.optCleanItems(data[agent]);
        if (agentdata !== undefined){
          data[agent] = {};
          data[agent]['agent'] = agent;
          data[agent]['items'] = agentdata['items'];
        }else{
          delete data[agent];
        }
      }
      if (!data[window.plugin.InventoryMapBot.NOKEYSPORTALS]){
        data[window.plugin.InventoryMapBot.NOKEYSPORTALS] = {'agent':window.plugin.InventoryMapBot.NOKEYSPORTALS, 'items':{}};
      }
      window.plugin.InventoryMapBot.loadLocal(window.plugin.InventoryMapBot.KEY);
      window.plugin.InventoryMapBot.updateQueue = {};
      for(agent in window.plugin.InventoryMapBot.dataObj){
        if (!data[agent]){
          window.plugin.InventoryMapBot.updateQueue[agent] = undefined;
        }
      }
      window.plugin.InventoryMapBot.dataObj = data;
      window.plugin.InventoryMapBot.saveStorage();
      return true;
    }
  }catch(e){
    window.plugin.InventoryMapBot.optAlert('<span style="color: #f88">Import failed: ' + e + '</span>');
    return false;
  }
}

window.plugin.InventoryMapBot.optRefreshBkmksKeysData = function(){
  window.plugin.InventoryMapBot.loadStorage();
  var data = window.plugin.InventoryMapBot.dataObj;
  var agent, guid;

  window.plugin.InventoryMapBot.resetBookmarks();
  window.plugin.InventoryMapBot.resetKeys();

  //to bookmarks
  window.plugin.bookmarks.loadStorage();
  for(agent in data){
    for (guid in data[agent]['items']){
      var bkmrkData = window.plugin.bookmarks.findByGuid(guid);
      if(!bkmrkData) {
        var ID = window.plugin.bookmarks.generateID();
        window.plugin.bookmarks.bkmrksObj['portals'][window.plugin.bookmarks.KEY_OTHER_BKMRK]['bkmrk'][ID] = {"guid":guid,"latlng":data[agent]['items'][guid]['latitude']+','+data[agent]['items'][guid]['longitude'],"label":data[agent]['items'][guid]['name']};
      }
    }
  }
  window.plugin.bookmarks.saveStorage();
  window.plugin.bookmarks.refreshBkmrks();
  window.runHooks('pluginBkmrksEdit', {"target": "all", "action": "import"});

  //to keys
  window.plugin.keys.loadKeys();
  for(agent in data){
    for (guid in data[agent]['items']){
      window.plugin.keys.addKey(data[agent]['items'][guid]['amount'], guid);
    }
  }
}

window.plugin.InventoryMapBot.optExport = function() {
  if (!window.plugin.InventoryMapBot.optCheckRequirePlugins()) {
    return;
  }
  try{
    window.plugin.InventoryMapBot.loadStorage();
    var data = window.plugin.InventoryMapBot.dataObj;
    dialog({
      html: '<p><a onclick="$(\'.ui-dialog-InventoryMapBot-copy textarea\').select();">Select all</a> and press CTRL+C to copy it.</p><textarea readonly>' + JSON.stringify(data) + '</textarea>',
      dialogClass: 'ui-dialog-InventoryMapBot-copy',
      id: 'plugin-InventoryMapBot-export',
      title: 'InventoryMapBot Export'
    });
  }catch(e){
    window.plugin.InventoryMapBot.optAlert('<span style="color: #f88">Export failed: ' + e + '</span>');
    return false;
  }
}
window.plugin.InventoryMapBot.optImport = async function() {

  if (!window.plugin.InventoryMapBot.optCheckRequirePlugins()) {
    return;
  }

  var promptAction = prompt('Press CTRL+V to paste it.', '');
  if (promptAction == null || promptAction == '') {
    return;
  }

  var data;
  try{
    data = JSON.parse(promptAction);
  }catch(e){
    window.plugin.InventoryMapBot.optAlert('<span style="color: #f88">Import failed: ' + e + '</span>');
    return;
  }

  var result = false;
  switch(window.plugin.InventoryMapBot.optCheckJsonFormat(data)){
    case 'single':
      result = window.plugin.InventoryMapBot.optImportSingle(data);
      if (result){
        window.plugin.InventoryMapBot.optRefreshBkmksKeysData();//todo put data to bookmarks and keys;
        window.plugin.InventoryMapBot.optAlert('Successful. ');
      }
      break;
    case 'multiple':
      result = window.plugin.InventoryMapBot.optImportMultiple(data);
      if (result){
        window.plugin.InventoryMapBot.optRefreshBkmksKeysData();//todo put data to bookmarks and keys;
        window.plugin.InventoryMapBot.optAlert('Successful. ');
      }
      break;
    case 'unknown':
      window.plugin.InventoryMapBot.optAlert('<span style="color: #f88">Import failed: unknown format.</span>');
      break;
    default:
      break;
  }
}

window.plugin.InventoryMapBot.addNoKeysPortal = function(guid){
  window.plugin.InventoryMapBot.loadStorage();
  var data = window.plugin.InventoryMapBot.dataObj;
  if (!data[window.plugin.InventoryMapBot.NOKEYSPORTALS]){
    data[window.plugin.InventoryMapBot.NOKEYSPORTALS] = {};
    data[window.plugin.InventoryMapBot.NOKEYSPORTALS]['agent'] = window.plugin.InventoryMapBot.NOKEYSPORTALS;
  }
  if (!data[window.plugin.InventoryMapBot.NOKEYSPORTALS]['items']){
    data[window.plugin.InventoryMapBot.NOKEYSPORTALS]['items'] = {};
  }
  var p = window.portals[guid];
  var portalInfo = {
    "amount": 0,
    "guid": p['options']['guid'],
    "latitude": p['options']['data']['latE6'] / 1E6,
    "longitude": p['options']['data']['lngE6'] / 1E6,
    "name": p['options']['data']['title'],
    "image": p['options']['data']['image'],
    "address": "Export form InventoryMapBot plugin"
  };
  if (portalInfo['name'] && portalInfo['image']){
    data[window.plugin.InventoryMapBot.NOKEYSPORTALS]['items'][guid] = portalInfo;
    window.plugin.InventoryMapBot.dataObj = data;
    window.plugin.InventoryMapBot.saveStorage();
  }else{
    window.plugin.bookmarks.switchStarPortal(guid);
  }
}

window.plugin.InventoryMapBot.removePortalByGuid = function(portalguid){
  window.plugin.InventoryMapBot.loadStorage();
  var data = window.plugin.InventoryMapBot.dataObj;
  for(var agent in data){
    for (var guid in data[agent]['items']){
      if (portalguid == guid){
        delete data[agent]['items'][guid];
      }
    }
  }
  window.plugin.InventoryMapBot.dataObj = data;
  window.plugin.InventoryMapBot.saveStorage();
}

window.plugin.InventoryMapBot.editStar = function(data) {
  if(data.target === 'portal') {
    if(data.action === 'add') {
      window.plugin.InventoryMapBot.addNoKeysPortal(data.guid);
    }
    else if(data.action === 'remove') {
      if (window.plugin.keys.keys[data.guid]){
        var result = confirm('Detected that you still have ' + window.plugin.keys.keys[data.guid] + ' keys for this portal. This operation will erase the keys data. Are you sure?');
        if (result){
          window.plugin.keys.addKey(0 - window.plugin.keys.keys[data.guid], data.guid);
          window.plugin.InventoryMapBot.removePortalByGuid(data.guid);
        }else{
          var p = window.portals[data.guid];
          var ll = p.getLatLng();
          window.plugin.bookmarks.addPortalBookmark(data.guid, ll.lat+','+ll.lng, p.options.data.title);
        }
      }else{
        window.plugin.InventoryMapBot.removePortalByGuid(data.guid);
      }
    }
  }
}

window.plugin.InventoryMapBot.getPortalKeysHtmlInfo = function(){
  var guid = window.selectedPortal;
  var html ='';
  window.plugin.InventoryMapBot.loadStorage();
  var data = window.plugin.InventoryMapBot.dataObj;
  for(var agent in data){
      if (agent != window.plugin.InventoryMapBot.NOKEYSPORTALS){
        html += '<br />'
                + '<div class="InventoryMapBot-keys-agent-name">'+ agent + '</div>'
                + '<div class="InventoryMapBot-keys-button" onclick="window.plugin.InventoryMapBot.addKey(-20,\'' + agent + '\',\'' + guid + '\');">-20</div>&nbsp;'
                + '<div class="InventoryMapBot-keys-button" onclick="window.plugin.InventoryMapBot.addKey(-50,\'' + agent + '\',\'' + guid + '\');">-50</div>&nbsp;'
                + '<div class="InventoryMapBot-keys-button" onclick="window.plugin.InventoryMapBot.addKey(-1,\'' + agent + '\',\'' + guid + '\');">'
                + '<div class="InventoryMapBot-keys-button-minus"></div>'
                + '</div>'
                + '<div id="InventoryMapBot-keys-' + agent + '" class="InventoryMapBot-keys-count">' + (data[agent]['items'][guid]?(data[agent]['items'][guid]['amount'] || 0):0) +　'</div>'
                + '<div class="InventoryMapBot-keys-button" onclick="window.plugin.InventoryMapBot.addKey(1,\'' + agent + '\',\'' + guid + '\');">'
                + '<div class="InventoryMapBot-keys-button-plus-v"></div>'
                + '<div class="InventoryMapBot-keys-button-plus-h"></div>'
                + '</div>'
                + '<div class="InventoryMapBot-keys-button" onclick="window.plugin.InventoryMapBot.addKey(20,\'' + agent + '\',\'' + guid + '\');">+20</div>&nbsp;'
                + '<div class="InventoryMapBot-keys-button" onclick="window.plugin.InventoryMapBot.addKey(50,\'' + agent + '\',\'' + guid + '\');">+50</div>&nbsp;';
      }
  }
  return html;
}

window.plugin.InventoryMapBot.getKeysByAgentGuid = function(agent, guid){
  window.plugin.InventoryMapBot.loadStorage();
  var data = window.plugin.InventoryMapBot.dataObj;
  if (!data[agent]['items'][guid]){
    return 0;
  }else{
    return data[agent]['items'][guid]['amount'];
  }
}

window.plugin.InventoryMapBot.addKey = function(addCount, agent, guid){
  var bkmrkData = window.plugin.bookmarks.findByGuid(guid);
  if (!bkmrkData){
    alert('Sorry, if you do not collect this portal, you will not be able to modify the number of keys.');
    return;
  }
  var oldCount = window.plugin.InventoryMapBot.getKeysByAgentGuid(agent, guid);
  if (oldCount + addCount < 0){
    return;
  }
  var newCount = Math.max(oldCount + addCount, 0);
  var data, keyinfo, found, tagent, tguid;
  if(oldCount !== newCount) {
    if (newCount === 0) {
      window.plugin.InventoryMapBot.loadStorage();
      data = window.plugin.InventoryMapBot.dataObj;
      keyinfo = JSON.parse(JSON.stringify(data[agent]['items'][guid]));
      delete data[agent]['items'][guid];
      found = false;
      for(tagent in data){
        if (tagent != window.plugin.InventoryMapBot.NOKEYSPORTALS){
          for (tguid in data[tagent]['items']){
            if (tguid == guid){
              found = true;
            }
          }
        }
      }
      if (!found)
      {
        data[window.plugin.InventoryMapBot.NOKEYSPORTALS]['items'][guid] = keyinfo;
        data[window.plugin.InventoryMapBot.NOKEYSPORTALS]['items'][guid]['amount'] = 0;
      }
      window.plugin.InventoryMapBot.dataObj = data;
      window.plugin.InventoryMapBot.saveStorage();
    } else {
      window.plugin.InventoryMapBot.loadStorage();
      data = window.plugin.InventoryMapBot.dataObj;
      if (data[agent]['items'][guid]){
        data[agent]['items'][guid]['amount'] = newCount;
      }else{
        found = false;
        var foundagent;
        for(tagent in data){
          if (tagent != window.plugin.InventoryMapBot.NOKEYSPORTALS){
            for (tguid in data[tagent]['items']){
              if (tguid == guid){
                found = true;
                foundagent = tagent;
                break;
              }
            }
          }
        }
        if (found){
          keyinfo = JSON.parse(JSON.stringify(data[foundagent]['items'][guid]));
        }else{
          keyinfo = JSON.parse(JSON.stringify(data[window.plugin.InventoryMapBot.NOKEYSPORTALS]['items'][guid]));
          delete data[window.plugin.InventoryMapBot.NOKEYSPORTALS]['items'][guid];
        }
        data[agent]['items'][guid] = keyinfo;
        data[agent]['items'][guid]['amount'] = newCount;
      }
      window.plugin.InventoryMapBot.dataObj = data;
      window.plugin.InventoryMapBot.saveStorage();
    }
    $('#InventoryMapBot-keys-' + agent).html(newCount);
  }
  window.plugin.keys.addKey(addCount, guid);
}

window.plugin.InventoryMapBot.addToSidebar = function(){
  var portalKeysHtmlInfo = window.plugin.InventoryMapBot.getPortalKeysHtmlInfo();
  var contentHTML = '<div id="InventoryMapBot-keys-content-outer">'
                              + '<div class="InventoryMapBot-keys-label">Key(s):</div>'
                              + '<div id="keys-count" title="Problem? Point to the question mark!"></div>'
                              + portalKeysHtmlInfo
                          + '</div>';
  var disabledMessage = '<div id="keys-content-outer" title="Your browser do not support localStorage">Plugin Keys disabled</div>';

  if(typeof(Storage) === "undefined") {
    $('#portaldetails > .imgpreview').after(disabledMessage);
    return;
  }
  $('#portaldetails > .imgpreview').after(contentHTML);
  window.plugin.keys.updateDisplayCount();
}

window.plugin.InventoryMapBot.pluginKeysInjection= function(){
  var index;
  $.each(window._hooks['portalDetailsUpdated'], function(ind, callback) {
    if (callback.toString().indexOf('plugin.keys.contentHTML') >= 0){
      index = ind;
    }
  });
  window._hooks['portalDetailsUpdated'].splice(index,1);
}

window.plugin.InventoryMapBot.pluginBookmarksInjection= function(){
  window.addHook('pluginBkmrksEdit', window.plugin.InventoryMapBot.editStar);

    window.plugin.bookmarks.dialogLoadList = function() {
    var r = 'The "<a href="https://iitc.modos189.ru/desktop.html" target="_BLANK"><strong>Draw Tools</strong></a>" plugin is required.</span>';

    if(!window.plugin.bookmarks || !window.plugin.drawTools) {
      $('.ui-dialog-autodrawer .ui-dialog-buttonset .ui-button:not(:first)').hide();
    }
    else{
      var portalsList = JSON.parse(localStorage['plugin-bookmarks']);
      var element = '';
      var elementTemp = '';
      var elemGenericFolder = '';

      // For each folder
      var list = portalsList.portals;
      for(var idFolders in list) {
        var folders = list[idFolders];

        // Create a label and a anchor for the sortable
        var folderLabel = '<a class="folderLabel" onclick="$(this).siblings(\'div\').toggle();return false;">'+folders['label']+'</a>';

        // Create a folder
        elementTemp = '<div class="bookmarkFolder" id="'+idFolders+'">'+folderLabel+'<div>';

        // For each bookmark
        var fold = folders['bkmrk'];
        for(var idBkmrk in fold) {
          var bkmrk = fold[idBkmrk];
          var label = bkmrk['label'];
          var latlng = bkmrk['latlng'];

          // Create the bookmark
          elementTemp += '<a class="bkmrk" id="'+idBkmrk+'" onclick="$(this).toggleClass(\'selected\');return false" data-latlng="['+latlng+']">'+label+'</a>';
        }
        elementTemp += '</div></div>';

        if(idFolders !== window.plugin.bookmarks.KEY_OTHER_BKMRK) {
          element += elementTemp;
        } else {
          elemGenericFolder += elementTemp;
        }
      }
      element += elemGenericFolder;

      var filterOnchangeJs = '\
<script type="text/javascript">\
  $("#bkmrk-filter").bind("input porpertychange",function(){\
    var filter = $("#bkmrk-filter").val();\
    if (filter === ""){\
      var uuu = $("#bkmrksAutoDrawer a.bkmrk").each(function(i){\
        $(this).show();\
      });\
    }else{\
      var uuu = $("#bkmrksAutoDrawer a.bkmrk").each(function(i){\
        var bookmarkName = $(this).text();\
        if (bookmarkName.indexOf(filter) >= 0){\
          $(this).show();\
        }else{\
          $(this).hide();\
        }\
      });\
    }\
  });\
</script>';

      // Append all folders and bookmarks
      r = '<div id="bkmrksAutoDrawer">'
        + '<label style="margin-bottom: 9px; display: block;">'
        + '<input style="vertical-align: middle;" type="checkbox" id="bkmrkClearSelection" checked>'
        + ' Clear selection after drawing</label>'
        + '<p style="margin-bottom:9px;color:red">You must select 2 or 3 portals!</p>'
        + 'BookMarks Filter :<input id="bkmrk-filter" type="text" style="margin-bottom: 4px; border: 1px solid #20a8b1;width:100%;"/>'
        + filterOnchangeJs
        + '<div onclick="window.plugin.bookmarks.autoDrawOnSelect();return false;">'
        + element
        + '</div>'
        + '</div>';
    }
    return r;
  }
}
var setup = function() {
  window.plugin.InventoryMapBot.setupCSS();
  window.plugin.InventoryMapBot.setupContent();
  $('#toolbox').append(window.plugin.InventoryMapBot.htmlCallSetBox);
  window.plugin.InventoryMapBot.createStorage();
  window.addHook('portalDetailsUpdated', window.plugin.InventoryMapBot.addToSidebar);
  window.addHook('iitcLoaded', window.plugin.InventoryMapBot.registerFieldForSyncing);
  window.plugin.InventoryMapBot.loadStorage();
  load('https://cdn.staticfile.org/xlsx/0.14.1/xlsx.full.min.js');
  const bookmarksTimeId = setInterval(() => {
    if (window.plugin.bookmarks) {
      window.plugin.InventoryMapBot.pluginBookmarksInjection();
      clearInterval(bookmarksTimeId);
    }
  },1000)
  const keysTimeId = setInterval(() => {
    if (window.plugin.keys) {
      window.plugin.InventoryMapBot.pluginKeysInjection();
      clearInterval(keysTimeId);
    }
  },1000)
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
