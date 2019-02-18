// ==UserScript==
// @id             iitc-plugin-InventoryMapBot@GMOogway
// @name           IITC plugin: InventoryMapBot plugin by GMOogway
// @category       Controls
// @version        0.3.5.20190214
// @author         GMOogway
// @description    [local-2019-02-14] InventoryMapBot plugin by GMOogway.
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

window.plugin.InventoryMapBot.IS_DEBUG = false;
window.plugin.InventoryMapBot.KEY_STORAGE = 'plugin-inventorymapbot-data';
window.plugin.InventoryMapBot.STATUS = 'stop';
window.plugin.InventoryMapBot.NOKEYSPORTALS = 'agent-no-keys-protals';
window.plugin.InventoryMapBot.dataObj = {};

window.plugin.InventoryMapBot.DELAY = 500;
window.plugin.InventoryMapBot.GAODEMAP_KEY = '2ce1125f3069586a30a1dae79b0774eb';
window.plugin.InventoryMapBot.IDcount = 0;
window.plugin.InventoryMapBot.MAP_READY = false;


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

window.plugin.InventoryMapBot.resetDataObj = function(){
  window.plugin.InventoryMapBot.dataObj = {};
}

window.plugin.InventoryMapBot.saveStorage = function() {
  localStorage[window.plugin.InventoryMapBot.KEY_STORAGE] = JSON.stringify(window.plugin.InventoryMapBot.dataObj);
  window.plugin.InventoryMapBot.resetDataObj();
}

window.plugin.InventoryMapBot.loadStorage = function() {
  window.plugin.InventoryMapBot.dataObj = JSON.parse(localStorage[window.plugin.InventoryMapBot.KEY_STORAGE]);
}

window.plugin.InventoryMapBot.resetStorage = function() {
  window.plugin.InventoryMapBot.dataObj = {};
  window.plugin.InventoryMapBot.dataObj[window.plugin.InventoryMapBot.NOKEYSPORTALS] = {'agent':window.plugin.InventoryMapBot.NOKEYSPORTALS, 'items':{}};
  window.plugin.InventoryMapBot.saveStorage();
}

window.plugin.InventoryMapBot.createStorage = function() {
  if (!localStorage[window.plugin.InventoryMapBot.KEY_STORAGE]){
    window.plugin.InventoryMapBot.resetStorage();
  }
}

window.plugin.InventoryMapBot.setupContent = function() {
  plugin.InventoryMapBot.htmlCallSetBox = '<a onclick="window.plugin.InventoryMapBot.manualOpt();return false;">InventoryMapBot Opt</a>';
  var actions = '';
  actions += '<a id="InventoryMapBot_status" onclick="window.plugin.InventoryMapBot.optExport();return false;">Export</a>';
  actions += '<a onclick="window.plugin.InventoryMapBot.optImport();return false;">Import</a>';
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
  window.plugin.InventoryMapBot.optSetStatus(window.plugin.InventoryMapBot.STATUS);
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
   }
   return data;

  }catch(e)
  {
    return undefined;
  }
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
      //bookmarks
      localStorage[window.plugin.bookmarks.KEY.key] = '{"maps":{"idOthers":{"label":"Others","state":1,"bkmrk":{}}},"portals":{"idOthers":{"label":"Others","state":1,"bkmrk":{}}}}';
      localStorage[window.plugin.bookmarks.UPDATE_QUEUE.key] = '{}';
      localStorage[window.plugin.bookmarks.UPDATING_QUEUE.key] = '{}';
      localStorage[window.plugin.bookmarks.KEY_STATUS_BOX] = '{"show":0,"page":0,"pos":{"x":100,"y":100}}';
      //keys
      localStorage[window.plugin.keys.KEY.key] = '{}';
      localStorage[window.plugin.keys.UPDATE_QUEUE.key] = '{}';
      localStorage[window.plugin.keys.UPDATING_QUEUE.key] = '{}';
      //InventoryMapBot
      window.plugin.InventoryMapBot.resetStorage();
      window.location.reload();
    }
  }
}

window.plugin.InventoryMapBot.optImportSingle = function(data){
  try{
    window.plugin.InventoryMapBot.loadStorage();
    if (window.plugin.InventoryMapBot.getJsonLength(window.plugin.InventoryMapBot.dataObj) == 1){
      var result = confirm('It looks like this is your first time importing data. This operation will erase all bookmarks and keys data. Are you sure?');
      if (result){
        data = window.plugin.InventoryMapBot.optCleanItems(data);
        if (data !== undefined && data['agent'] != window.plugin.InventoryMapBot.NOKEYSPORTALS){
          window.plugin.InventoryMapBot.dataObj[data['agent']] = {};
          window.plugin.InventoryMapBot.dataObj[data['agent']]['agent'] = data['agent'];
          window.plugin.InventoryMapBot.dataObj[data['agent']]['items'] = data['items'];
          window.plugin.InventoryMapBot.saveStorage();
          return true;
        }
      }else{
        return false;
      }
    }else{
      data = window.plugin.InventoryMapBot.optCleanItems(data);
      if (data !== undefined){
        window.plugin.InventoryMapBot.dataObj[data['agent']] = {};
        window.plugin.InventoryMapBot.dataObj[data['agent']]['agent'] = data['agent'];
        window.plugin.InventoryMapBot.dataObj[data['agent']]['items'] = data['items'];
        window.plugin.InventoryMapBot.saveStorage();
        return true;
      }
    }
  }catch(e){
    window.plugin.InventoryMapBot.optAlert('<span style="color: #f88">Import failed: ' + e + '</span>');
    return false;
  }
}

window.plugin.InventoryMapBot.optImportMultiple = function(data){
  try{
    var result = confirm('This operation will erase all bookmarks and keys data. Are you sure?');
    if (result){
      for(var agent in data){
        var agentdata = window.plugin.InventoryMapBot.optCleanItems(data[agent]);
        if (agentdata !== undefined){
          data[agent] = {};
          data[agent]['agent'] = agent;
          data[agent]['items'] = agentdata['items'];
        }else{
          delete data[agent];
        }
      }
      window.plugin.InventoryMapBot.resetStorage();
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
  //to bookmarks
  localStorage[window.plugin.bookmarks.KEY.key] = '{"maps":{"idOthers":{"label":"Others","state":1,"bkmrk":{}}},"portals":{"idOthers":{"label":"Others","state":1,"bkmrk":{}}}}';
  localStorage[window.plugin.bookmarks.UPDATE_QUEUE.key] = '{}';
  localStorage[window.plugin.bookmarks.UPDATING_QUEUE.key] = '{}';
  localStorage[window.plugin.bookmarks.KEY_STATUS_BOX] = '{"show":0,"page":0,"pos":{"x":100,"y":100}}';
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
  window.plugin.bookmarks.syncBkmrks();
  //to keys
  localStorage[window.plugin.keys.KEY.key] = '{}';
  localStorage[window.plugin.keys.UPDATE_QUEUE.key] = '{}';
  localStorage[window.plugin.keys.UPDATING_QUEUE.key] = '{}';
  window.plugin.keys.loadKeys();
  for(agent in data){
    for (guid in data[agent]['items']){
      window.plugin.keys.addKey(data[agent]['items'][guid]['amount'], guid);
    }
  }

  window.location.reload();
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
  data[window.plugin.InventoryMapBot.NOKEYSPORTALS]['items'][p['options']['guid']] = {
    "amount": 0,
    "guid": p['options']['guid'],
    "latitude": p['options']['data']['latE6'] / 1E6,
    "longitude": p['options']['data']['lngE6'] / 1E6,
    "name": p['options']['data']['title'],
    "image": p['options']['data']['image'],
    "address": ""
  };
  window.plugin.InventoryMapBot.dataObj = data;
  window.plugin.InventoryMapBot.saveStorage();
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

window.plugin.InventoryMapBot.removePluginKeysHook = function(){
  var index;
  $.each(window._hooks['portalDetailsUpdated'], function(ind, callback) {
    if (callback.toString().indexOf('plugin.keys.contentHTML') >= 0){
      index = ind;
    }
  });
  window._hooks['portalDetailsUpdated'].splice(index,1);
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
                + '<div class="InventoryMapBot-keys-button" onclick="window.plugin.InventoryMapBot.addKey(20,\'' + agent + '\',\'' + guid + '\');">20</div>&nbsp;'
                + '<div class="InventoryMapBot-keys-button" onclick="window.plugin.InventoryMapBot.addKey(50,\'' + agent + '\',\'' + guid + '\');">50</div>&nbsp;';
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
      window.plugin.InventoryMapBot.debug(keyinfo);
      window.plugin.InventoryMapBot.debug(data[agent]['items'][guid]);
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
      window.plugin.InventoryMapBot.debug(found);
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

var setup = function() {
  window.plugin.InventoryMapBot.setupCSS();
  window.plugin.InventoryMapBot.setupContent();
  $('#toolbox').append(window.plugin.InventoryMapBot.htmlCallSetBox);
  window.plugin.InventoryMapBot.createStorage();
  window.addHook('portalDetailsUpdated', window.plugin.InventoryMapBot.addToSidebar);
  window.addHook('pluginBkmrksEdit', window.plugin.InventoryMapBot.editStar);
  const timeId = setInterval(() => {
    if (window.plugin.keys) {
      window.plugin.InventoryMapBot.removePluginKeysHook();
      clearInterval(timeId);
    }
  },1000)
}

/*
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

window.plugin.InventoryMapBot.optExport = function() {
  if (window.plugin.InventoryMapBot.optCheck()) {
    if (window.plugin.InventoryMapBot.STATUS == 'working') return;
    window.plugin.InventoryMapBot.optSetStatus('working');
    var dataobj = {
      agent: PLAYER.nickname,
      guid: "1234567890.c",
      update: "true",
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
          dataobj['items'][guid] = {
            "amount": amount,
            "latitude": latlng.split(',')[0],
            "longitude": latlng.split(',')[1],
            "name": bkmrk['label'],
          };
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
          if (portal['latitude'] && portal['longitude']){
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
        }
        localStorage['plugin-bookmarks'] = JSON.stringify(bookmarksobj);
        localStorage['plugin-bookmarks-queue'] = JSON.stringify(bookmarksobj);
        localStorage['plugin-bookmarks-updating-queue'] = JSON.stringify(bookmarksobj);
        localStorage['plugin-keys-data'] = JSON.stringify(keysobj);
        localStorage['plugin-keys-data-queue'] = JSON.stringify(keysobj);
        localStorage['plugin-keys-data-updating-queue'] = JSON.stringify(keysobj);
        window.plugin.InventoryMapBot.optAlert('Successful. ');
        window.location.reload();
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
*/
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
