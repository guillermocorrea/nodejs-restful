/**
 * Created by EXTIGLGCORREAG on 19/05/2014.
 */
'use strict';
/*jslint unparam: true, indent: 4 */
/*jshint indent:4 */
module.exports = function(config){
    config.set({

        // basePath : '../',

        files : [
            'test/*spec.js'
        ],

        autoWatch : true,

        frameworks: ['mocha'],


        reporters: ['coverage', 'progress'],

        preprocessors: {
            '**/*.js': ['coverage']
        },

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        },

        plugins: [
            'karma-mocha',
            'karma-junit-reporter',
            'karma-coverage'
        ],

        coverageReporter: { type : 'html', dir : 'coverage/' }

    });
};