
import moment from 'moment';
import alertify from 'alertifyjs';
import $ from 'jquery';
import cookie from 'react-cookie';
import Promise from 'es6-promise';

export const LANGUAGE_COOKIE_NAME = 'django_language';

export var assign = require('react/lib/Object.assign');

export function notify(msg, atype='success') {
  alertify.notify(msg, atype);
}

export function formatTime(timeStr) {
  var _m = moment(timeStr);
  return _m.calendar(null, {sameElse: 'LL'});
}

export var anonUsername = 'AnonymousUser';
export function getAnonymousUserPermission(permissions) {
  return permissions.filter(function(perm){
    if (perm.user__username === undefined) {
      perm.user__username = perm.user.match(/\/users\/(.*)\//)[1];
    }
    return perm.user__username === anonUsername;
  })[0];
}

export function surveyToValidJson(survey) {
  // skip logic references only preserved after initial call
  // to "survey.toFlatJSON()"
  survey.toFlatJSON();
  // returning the result of the second call to "toFlatJSON()"
  return JSON.stringify(survey.toFlatJSON());
}

export function customPromptAsync(msg, def) {
  return new Promise(function(resolve, reject){
    window.setTimeout(function(){
      var val = window.prompt(msg, def);
      if (val === null) {
        reject(new Error('empty value'));
      } else {
        resolve(val);
      }
    }, 0);
  });
}

export function customConfirmAsync(msg) {
  var dfd = new $.Deferred();
  window.setTimeout(function(){
    var tf = window.confirm(msg);
    dfd[ tf ? 'resolve' : 'reject' ](tf);
  }, 0);
  return dfd.promise();
}

export function customConfirm(msg) {
  /*eslint no-alert: 0*/
  return window.confirm(msg);
}
export function customPrompt(msg) {
  /*eslint no-alert: 0*/
  return window.prompt(msg);
}

export function redirectTo(href) {
  window.location.href = href;
}

export function parsePermissions(owner, permissions) {
  var users = [];
  var perms = {};
  if (!permissions) {
    return [];
  }
  permissions.map((perm) => {
    perm.user__username = perm.user.match(/\/users\/(.*)\//)[1];
    return perm;
  }).filter((perm)=> {
    return ( perm.user__username !== owner && perm.user__username !== anonUsername);
  }).forEach((perm)=> {
    if(users.indexOf(perm.user__username) === -1) {
      users.push(perm.user__username);
      perms[perm.user__username] = [];
    }
    perms[perm.user__username].push(perm);
  });
  return users.map((username)=>{
    return {
      username: username,
      can: perms[username].reduce((cans, perm)=> {
        var permCode = perm.permission.split('_')[0];
        cans[permCode] = perm;
        return cans;
      }, {})
    };
  });
}


export var log = (function(){
  var _log = function(...args) {
    console.log.apply(console, args);
    return args[0];
  };
  _log.profileSeconds = function(n=1) {
    console.profile();
    window.setTimeout(function(){
      console.profileEnd();
    }, n * 1000);
  };
  return _log;
})();
window.log = log;


var __strings = [];


/*global gettext*/
if (window.gettext) {
  var _gettext = window.gettext;
} else {
  var _gettext = function(s){
    return s;
  };
}

let savedTranslations = [],
    recordUntranslatedStrings = false;

export function t(str) {
  let translated = _gettext(str),
      hasChanged = (translated !== str);

  if (recordUntranslatedStrings && !hasChanged &&
      savedTranslations.indexOf(str) === -1) {
    savedTranslations.push(str);
  }
  return translated;
};

export function currentLang() {
  return cookie.load(LANGUAGE_COOKIE_NAME) || 'en';
}

log.recordUntranslatedStrings = function (tf) {
  recordUntranslatedStrings = !!tf;
};
log.savedTranslations = function () {
  return savedTranslations;
};

// unique id for forms with inputs and labels
let lastId = 0;
export var newId = function(prefix='id') {
  lastId++;
  return `${prefix}${lastId}`;
};

export var randString = function () {
  return Math.random().toString(36).match(/\.(\S{6}).*/)[1];
};

export function isLibrary(router) {
  return !!router.getCurrentPathname().match(/library/);
}
