/**
 * Adapter to the user infp
 * 24.4.21 KC
 */
import $ from 'jquery';
import {get, isObject} from 'lodash';

/**
 * Returns the information about the current user
 * @param callback
 */
function getUserInfo(callback) {
  $.ajax('/userinfo', {dataType: 'json'})
    .done(function (data) {
      let info                = get(data, 'info', {});
      let hasGoogleAccount    = isObject(get(info, 'info.google', null));
      let hasFacebookAccount  = isObject(get(info, 'info.facebook', null));
      let hasMicrosoftAccount = isObject(get(info, 'info.microsoft', null));
      console.log(hasFacebookAccount, hasGoogleAccount, hasMicrosoftAccount);
      let retVal             = {
        personalData: {
          forename         : get(info, 'personalData.forename', ''),
          surname          : get(info, 'personalData.surname', ''),
          email            : get(info, 'personalData.email', ''),
          avatar           : get(info, 'personalData.avatar', ''),
          generatedAvatar  : get(info, 'info.generatedAvatar', ''),
          registrationDate : get(info, 'info.registrationDate', ''),
          socialMediaActive: hasGoogleAccount || hasFacebookAccount || hasMicrosoftAccount
        },
        google      : {
          email : get(info, 'info.google.emails[0].value', ''),
          avatar: get(info, 'info.google.photos[0].value', ''),
          id    : get(info, 'info.google.id', ''),
          raw   : get(info, 'info.google', {})
        },
        facebook    : {
          email : get(info, 'info.facebook.emails[0].value', ''),
          avatar: get(info, 'info.facebook.photos[0].value', ''),
          id    : get(info, 'info.facebook.id', ''),
          raw   : get(info, 'info.facebook', {})
        },
        microsoft   : {
          email : get(info, 'info.microsoft.emails[0].value', ''),
          avatar: get(info, 'info.microsoft.photos[0].value', ''),
          id    : get(info, 'info.microsoft.id', ''),
          raw   : get(info, 'info.microsoft', {})
        }
      };
      retVal.google.valid    = retVal.google.email.length > 0;
      retVal.facebook.valid  = retVal.facebook.email.length > 0;
      retVal.microsoft.valid = retVal.microsoft.email.length > 0;
      console.log('userinfo', data, retVal);
      callback(null, retVal);
    })
    .fail(function (err) {
      let info = {status: err.status, statusText: err.statusText};
      callback(info);
    });
}

export {getUserInfo};
