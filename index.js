(function (){
  'use strict';

  var CLIEngine = require("eslint").CLIEngine;
  var cli = new CLIEngine({});
  var _ = '\x1b[';
  var COLOR = {
      RED: _ + '91m',
      YELLOW: _ + '93m',
      LIGHT_RED: _ + '31m',
      DARK_BLUE: _ + '34m',
      BLUE: _ + '94m',
      LIGHT_GREEN: _ + '92m',
      GREEN: _ + '32m',
      WHITE: _ + '37m',
      DARK_GREY: _ + '31m;1m',
      RESET: _ + '0m'
  };

  var ESLintReporter = function(loggerFactory, eslintPreprocessorConfig) {
      console.log("=============================================");
      console.log(eslintPreprocessorConfig);
      console.log("=============================================");
    var log = loggerFactory.create('preprocessor.eslint');
    var options = {
      showWarnings: getOptionWithFallback('showWarnings', true),
      stopOnError: getOptionWithFallback('stopOnError', true),
      stopOnWarning: getOptionWithFallback('stopOnWarning', false)
    };

    function getOptionWithFallback(option, fallback) {
      if(typeof eslintPreprocessorConfig[option] !== 'undefined') {
        return eslintPreprocessorConfig[option];
      } else {
        return fallback;
      }
    }

    function processErrors(results) {
      var getError = function(message) {
        return '   - ' + COLOR.LIGHT_RED + message.line +
          ':' + message.column + COLOR.RESET + ' ' +
          COLOR.DARK_BLUE + message.message + COLOR.RESET;
      };

      results.forEach(function(result) {
	  if(result.errorCount > 0) {
          var errors = [];
          result.messages.forEach(function(message) {
	      if(message.severity > 1){
		  errors.push(getError(message));
	      }
          });
          log.error('\n' +
            COLOR.LIGHT_RED + result.errorCount + ' error(s) in ' + result.filePath + '\n' + COLOR.RESET +
            errors.join('\n') + '\n\n'
          );
        }
      });
    }

    function processWarnings(results) {
      var getWarning = function(message) {
        return '   - ' + COLOR.YELLOW + message.line +
          ':' + message.column + COLOR.RESET + ' ' +
          COLOR.DARK_BLUE + message.message + COLOR.RESET;
      };

      results.forEach(function(result) {
	  if(result.warningCount > 0) {
          var warnings = [];
          result.messages.forEach(function(message) {
	      if(message.severity === 1){
		  warnings.push(getWarning(message));
	      }
          });
          log.warn('\n' +
            COLOR.YELLOW + result.warningCount + ' warning(s) in ' + result.filePath + '\n' + COLOR.RESET +
            warnings.join('\n') + '\n\n'
          );
        }
      });
    }

    function shouldStop(report) {
      if(report.warningCount && 
	 (options.showWarnings || options.stopOnWarning)) 
	  processWarnings(report.results);
      if(report.errorCount) processErrors(report.results);
      return (report.errorCount && options.stopOnError) ||
        (report.warningCount && options.stopOnWarning);
    }

    return function(content, file, done) {
      var report = cli.executeOnFiles([file.path]);

      log.debug('Processing "%s".', file.originalPath);
      if(shouldStop(report)) {
        done(report.results);
      } else {
        done(null, content);
      }
    };
  };

  ESLintReporter.$inject = ['logger', 'config.eslint'];

  module.exports = {
    'preprocessor:eslint': ['factory', ESLintReporter]
  };
}).call(this);
