/**
 * Grunt file for ferropoly main
 *
 * grunt update
 *    Updates the local common files with the ones from the editor project
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
    }


  });
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('update', ['copy']);
};
