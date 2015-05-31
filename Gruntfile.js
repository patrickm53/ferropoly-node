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
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      main: {
        files: [
          {
            expand: true,
            cwd: '../ferropoly-editor/common/lib',
            src: '**',
            dest: 'common/lib/',
            flatten: true,
            filter: 'isFile',
            timestamp: true
          },

          {
            expand: true,
            cwd: '../ferropoly-editor/common/models',
            src: '**',
            dest: 'common/models/',
            flatten: true,
            filter: 'isFile',
            timestamp: true
          },

          {
            expand: true,
            cwd: '../ferropoly-editor/common/models/accounting',
            src: '**',
            dest: 'common/models/accounting',
            flatten: true,
            filter: 'isFile',
            timestamp: true
          },

          {
            expand: true,
            cwd: '../ferropoly-editor/common/routes',
            src: '**',
            dest: 'common/routes/',
            flatten: true,
            filter: 'isFile',
            timestamp: true
          }
        ]
      }
    },

    eslint: {
      src: [
        'server.js',
        'main/lib/**/*.js',
        'main/routes/**/*.js'
      ],
      options: {
        config: './.eslintrc'
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
  grunt.loadNpmTasks('grunt-bump');
  grunt.registerTask('default', ['uglify:js']);
  grunt.registerTask('minify', ['uglify:js']);
  grunt.registerTask('v:patch', ['bump-only:patch']);
  grunt.registerTask('v:minor', ['bump-only:minor']);
  grunt.registerTask('v:major', ['bump-only:major']);
  grunt.registerTask('demo', ['shell']);
  grunt.registerTask('update', ['copy']);
  grunt.registerTask('lint', ['eslint']);
};
