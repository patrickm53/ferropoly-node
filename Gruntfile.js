/**
 * Grunt file for ferropoly main
 *
 * grunt update
 *    Updates the local common files with the ones from the editor project

 * Create a new bugfix version (x.y.++):
 *   grunt v:patch
 *   grunt bump-commit
 *
 * Create a new feature version (x.++.0)
 *   grunt v:minor
 *   grunt bump-commit
 *
 * Create a new major version (++.0.0)
 *   grunt v:major
 *   grunt bump-commit
 *
 *
 * Build Webpack for development:  grunt webpack:dev
 * Build Webpack for release:  grunt webpack:prod
 *
 * Created by kc on 14.04.15.
 */
'use strict';
const webpackDevConfig  = require('./main/webapp/webpack.dev.js');
const webpackProdConfig = require('./main/webapp/webpack.prod.js');

module.exports          = function (grunt) {

  grunt.initConfig({
    pkg   : grunt.file.readJSON('package.json'),
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


    webpack: {
      options: {
        stats: !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
      },
      prod   : webpackProdConfig,
      dev    : Object.assign({watch: true}, webpackDevConfig)
    }
  });



  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.registerTask('default', ['browserify']);
  grunt.registerTask('v:patch', ['bump-only:patch']);
  grunt.registerTask('v:minor', ['bump-only:minor']);
  grunt.registerTask('v:major', ['bump-only:major']);
  grunt.registerTask('demo', ['shell']);
  grunt.registerTask('update', ['copy']);
  grunt.registerTask('lint', ['eslint']);
  grunt.loadNpmTasks('grunt-webpack');
};
