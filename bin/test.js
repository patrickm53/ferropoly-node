// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * This application demonstrates how to perform basic operations on files with
 * the Google Cloud Storage API.
 *
 * For more information, see the README.md under /storage and the documentation
 * at https://cloud.google.com/storage/docs.
 */

const db = require('../common/lib/ferropolyDb');
const settings = require('../main/settings.js');
const picBucket = require('../main/lib/picBucket')(settings);

console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS)

db.init(settings, ()=> {
  picBucket.announceUpload('demoId', 'teamId', {}, (err, data) => {
    console.log('done', data);

    picBucket.confirmUpload(data.id, err=> {

      picBucket.list('demoId', {uploaded: true}, (err, data) => {
        if (err) {
          return console.error(err);
        }
        console.log('finished', data.length);
      })

    })
  });

})
