module.exports = (grunt) ->

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'
    jshint:
      all: ["./src/lazyload.js"]
    uglify:
      js:
        files:
          "./dist/lazyload.min.js": ["./src/lazyload.js"]
    plato:
      dist:
        src: ['src/*.js']
        dest: 'reports'
    watch:
      files: ["./src/lazyload.js"]
      tasks: ["jshint", "uglify"]

  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-watch'

  grunt.registerTask "default", "watch"
  grunt.registerTask "build", "uglify"