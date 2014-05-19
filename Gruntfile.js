/**
 * Created by EXTIGLGCORREAG on 13/05/2014.
 */
'use strict';
module.exports = function(grunt) {
    var banner = '/*\n<%= pkg.name %> <%= pkg.version %>';
    banner += '- <%= pkg.description %>\n<%= pkg.repository.url %>\n';
    banner += 'Built on <%= grunt.template.today("yyyy-mm-dd") %>\n*/\n';
    var reportsFolder = 'reports';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jslint: {
            // lint your project's server code
            server: {
                src: [ // some example files
                    'src/backend/*.js',
                    'src/backend/**/*.js'
                ],
                exclude: [

                ],
                directives: { // example directives
                    node: true,
                    todo: true
                },
                unparam: true,
                options: {
                    edition: 'latest', // specify an edition of jslint or use 'dir/mycustom-jslint.js' for own path
                    junit: reportsFolder + '/server-junit.xml', // write the output to a JUnit XML
                    log: reportsFolder + '/server-lint.log',
                    jslintXml: reportsFolder + '/server-jslint.xml',
                    errorsOnly: true, // only display errors
                    failOnError: false, // defaults to true
                    checkstyle: reportsFolder + '/server-checkstyle.xml', // write a checkstyle-XML
                    unparam: true
                }
            },
            test: {
                src: [ // some example files
                    'test/*.js',
                    'test/**/*.js'
                ],
                exclude: [

                ],
                directives: { // example directives
                    node: true,
                    todo: true
                },
                unparam: true,
                options: {
                    edition: 'latest', // specify an edition of jslint or use 'dir/mycustom-jslint.js' for own path
                    junit: reportsFolder + '/tests-junit.xml', // write the output to a JUnit XML
                    log: reportsFolder + '/tests-lint.log',
                    jslintXml: reportsFolder + '/tests-jslint.xml',
                    errorsOnly: true, // only display errors
                    failOnError: false, // defaults to true
                    checkstyle: reportsFolder + '/tests-checkstyle.xml', // write a checkstyle-XML
                    unparam: true
                }
            },
            // lint your project's client code
            client: {
                src: [
                    'src/client/**/*.js'
                ],
                directives: {
                    browser: true,
                    predef: [
                        'jQuery'
                    ]
                },
                options: {
                    junit: reportsFolder + '/client-junit.xml'
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        concat: {
            options: {
                separator: ';\n',
                banner: banner
            },
            build: {
                files: [{
                    src: ['src/*.js'],
                    dest: 'build/<%= pkg.name %>.js'
                }]
            }
        },
        uglify: {
            options: {
                banner: banner
            },
            build: {
                files: {
                    'build/<%= pkg.name %>.min.js':
                        ['build/<%= pkg.name %>.js'],
                }
            }
        },
        simplemocha: {
            options: {
                globals: ['expect'],
                timeout: 3000,
                ignoreLeaks: false,
                ui: 'bdd',
                reporter: 'tap'
            },
            all: { src: ['test/*.js'] }
        },
        mocha_istanbul: {
            coverage: {
                src: 'test', // the folder, not the files,
                options: {
                    mask: '*.spec.js',
                    dryRun: true,
                    coverageFolder: reportsFolder + '/coverage'
                }
            }
        },
        coveralls: {
            options: {
                // LCOV coverage file relevant to every target
                src: reportsFolder + '/coverage/lcov.info',

                // When true, grunt-coveralls will only print a warning rather than
                // an error, to prevent CI builds from failing unnecessarily (e.g. if
                // coveralls.io is down). Optional, defaults to false.
                force: false
            }
        }
    });

    grunt.loadNpmTasks('grunt-coveralls');
    grunt.loadNpmTasks('grunt-mocha-istanbul');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-jslint');

    grunt.registerTask('default', ['simplemocha', 'jshint', 'mocha_istanbul', 'coveralls']);
    grunt.registerTask('test', ['simplemocha', 'jshint', 'mocha_istanbul', 'coveralls']);
};