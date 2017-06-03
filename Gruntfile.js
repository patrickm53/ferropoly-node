/**
 * Grunt file for ferropoly main
 *
 * grunt update
 *    Updates the local common files with the ones from the editor project

 * Create a new bugfix version (x.y.++):
 *   grunt v:patch
 *   grunt minify
 *   grunt bump-commit
 *
 * Create a new feature version (x.++.0)
 *   grunt v:minor
 *   grunt minify
 *   grunt bump-commit
 *
 * Create a new major version (++.0.0)
 *   grunt v:major
 *   grunt minify
 *   grunt bump-commit
 *
 * Created by kc on 14.04.15.
 */
'use strict';
module.exports = function (grunt) {
  grunt.initConfig({
    pkg   : grunt.file.readJSON('package.json'),
    concat: {
      options  : {},
      dist     : {
        src : [
          './node_modules/socket.io-client/dist/socket.io.slim.js',
          './main/public/js/reception/genericmodals.js',
          './main/public/js/reception/reception-framework.js',
          './main/public/js/reception/ferropoly-socket.js',
          './main/public/js/reception/datastore/datastore.js',
          './main/public/js/reception/datastore/chancellery.js',
          './main/public/js/reception/datastore/properties.js',
          './main/public/js/reception/datastore/propertyAccount.js',
          './main/public/js/reception/datastore/statistics.js',
          './main/public/js/reception/datastore/team.js',
          './main/public/js/reception/datastore/teamAccount.js',
          './main/public/js/reception/datastore/trafficInfo.js',
          './main/public/js/reception/datastore/travellog.js',
          './main/public/js/reception/datastore/datastoreStarter.js',
          './main/public/js/reception/ferrostats.js',
          './main/public/js/reception/activecall.js',
          './main/public/js/reception/teamaccountsCtrl.js',
          './main/public/js/reception/managecallCtrl.js',
          './main/public/js/reception/dashboardCtrl.js',
          './main/public/js/propertyMarkers.js',
          './main/public/js/reception/mapCtrl.js',
          './main/public/js/reception/ferrostatsCtrl.js',
          './main/public/js/reception/chanceCtrl.js',
          './main/public/js/reception/propertiesCtrl.js',
          './main/public/js/reception/trafficCtrl.js'
        ],
        dest: './main/public/js/reception.js'
      },
      framework: {
        src : [
          './main/public/modules/jquery/dist/jquery.min.js',
          './main/public/modules/bootstrap/dist/js/bootstrap.min.js',
          './main/public/modules/angular/angular.min.js',
          './main/public/modules/angular-sanitize/angular-sanitize.min.js',
          './main/public/modules/moment/min/moment.min.js',
          './main/public/modules/moment/locale/de.js',
          './main/public/modules/lodash/dist/lodash.min.js'
        ],
        dest: './main/public/js/min/framework.min.js'
      },
      c3d3     : {
        src : [
          './main/public/modules/d3/d3.min.js',
          './main/public/modules/c3/c3.min.js'
        ],
        dest: './main/public/js/min/c3d3.min.js'
      },
      css      : {
        src : [
          './main/public/css/cosmo.min.css',
          //'./main/public/modules/bootstrap/dist/css/bootstrap-theme.min.css',
          './main/public/css/ferropoly.css'
        ],
        dest: './main/public/css/ferropoly.min.css'
      },
      checkin  : {
        src : [
          './node_modules/socket.io-client/dist/socket.io.slim.js',
          './main/public/js/checkin/index.js',
          './main/public/js/checkin/geolocation.js',
          './main/public/js/checkin/datastore.js',
          './main/public/js/checkin/checkinsocket.js',
          './main/public/js/checkin/dashboardctrl.js',
          './main/public/js/checkin/mapctrl.js',
          './main/public/js/checkin/propertiesctrl.js',
          './main/public/js/checkin/pricelistctrl.js',
          './main/public/js/checkin/accountctrl.js'
        ],
        dest: 'main/public/js/checkin.js'
      }
    },
    uglify: {
      js     : {
        files: {
          './main/public/js/min/reception.min.js'  : ['./main/public/js/reception.js'],
          './main/public/js/min/loginctrl.min.js'  : ['./main/public/js/loginctrl.js'],
          './main/public/js/min/checkin.min.js'    : ['./main/public/js/checkin.js'],
          './main/public/js/min/teamctrl.min.js'   : ['./main/public/js/teamctrl.js'],
          './main/public/js/min/indexmctrl.min.js' : ['./main/public/js/indexmctrl.js'],
          './main/public/js/min/summaryctrl.min.js': ['./main/public/js/summaryctrl.js']
        }
      },
      options: {
        unused      : true,
        dead_code   : true,
        properties  : false,
        beautify    : false,
        conditionals: true,
        compress    : true,
        mangle      : false, // do not rename variables
        banner      : '/* <%= pkg.name %> V<%= pkg.version %>, <%= grunt.template.today("dd-mm-yyyy") %>, (c) Christian Kuster, CH-8342 Wernetshausen, christian@kusti.ch */\n'

      }
    },
    copy  : {
      main: {
        files: [
          {
            expand   : true,
            cwd      : '../ferropoly-editor/common/lib',
            src      : '*.js*',
            dest     : 'common/lib/',
            flatten  : true,
            filter   : 'isFile',
            timestamp: true
          },

          {
            expand   : true,
            cwd      : '../ferropoly-editor/common/models',
            src      : '*.js',
            dest     : 'common/models/',
            flatten  : true,
            filter   : 'isFile',
            timestamp: true
          },

          {
            expand   : true,
            cwd      : '../ferropoly-editor/common/models/accounting',
            src      : '*.js',
            dest     : 'common/models/accounting',
            flatten  : true,
            filter   : 'isFile',
            timestamp: true
          },

          {
            expand   : true,
            cwd      : '../ferropoly-editor/common/routes',
            src      : '*.js',
            dest     : 'common/routes/',
            flatten  : true,
            filter   : 'isFile',
            timestamp: true
          }
        ]
      }
    },

    eslint: {
      src    : [
        'server.js',
        'main/lib/**/*.js',
        'main/routes/**/*.js'
      ],
      options: {
        config: './.eslintrc'
      }
    },

    bump: {
      options: {
        files             : ['package.json'],
        updateConfigs     : [],
        commit            : true,
        commitMessage     : 'New version added v%VERSION%',
        commitFiles       : ['-a'],
        tagName           : 'v%VERSION%',
        tagMessage        : 'Version %VERSION%',
        push              : true,
        pushTo            : 'git@bitbucket.org:christian_kuster/ferropoly_main.git',
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace     : false,
        prereleaseName    : false,
        regExp            : false
      }
    },

    browserify: {
      checkinstore: {
        files: {
          'main/public/js/checkin/datastore.js': ['main/components/checkin-datastore/index.js']
        }
      },
      options     : {
        browserifyOptions: {
          standalone: 'checkinDatastore'
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-processhtml');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-bump');
  grunt.registerTask('default', ['browserify']);
  grunt.registerTask('minify', ['concat', 'uglify:js']);
  grunt.registerTask('v:patch', ['bump-only:patch']);
  grunt.registerTask('v:minor', ['bump-only:minor']);
  grunt.registerTask('v:major', ['bump-only:major']);
  grunt.registerTask('demo', ['shell']);
  grunt.registerTask('update', ['copy']);
  grunt.registerTask('lint', ['eslint']);
};
