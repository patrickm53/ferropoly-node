/**
 * Adapter for Team Members
 * Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch
 * Created: 28.11.21
 **/

import axios from 'axios';
import {getAuthToken} from '../../common/adapter/authToken';
import {get} from 'lodash';

function getTeamMembers(gameId, teamId, callback) {
  axios.get(`/team/members/${gameId}/${teamId}`, {dataType: 'json'})
    .then(function (resp) {
      callback(null, resp.data.members);
    })
    .catch(function (err) {
      callback(err);
    });
}

function addTeamMember(gameId, teamId, memberId, callback) {
  getAuthToken((err, authToken) => {
    if (err) {
      return callback(err);
    }
    axios.post(`/team/members/${gameId}/${teamId}`,
      {
        newMemberLogin: memberId,
        authToken
      })
      .then(function () {
        callback(null);
      })
      .catch(function (error) {
        let message = get(error, 'response.data.message', error);
        callback({message});
      });
    callback();
  });
}

function deleteTeamMember(gameId, teamId, memberId, callback) {
  getAuthToken((err, token) => {
    if (err) {
      return callback(err);
    }
    callback();
  });
}

export {getTeamMembers, addTeamMember, deleteTeamMember};
