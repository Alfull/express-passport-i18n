/**
 * Module dependencies.
 */

var express = require('express')
  , mongoStore = require('connect-mongo')(express)
  , flash = require('connect-flash')
  , engine = require('ejs-locals')
  , helpers = require('view-helpers')
  , i18n = require('i18n-abide')

module.exports = function (app, config, passport) {

  app.set('showStackError', true)
  // should be placed before express.static
  app.use(express.compress({
    filter: function (req, res) {
      return /json|text|javascript|css/.test(res.getHeader('Content-Type'));
    },
    level: 9
  }))
  app.use(express.favicon())
  app.use(express.static(config.root + '/public'))
  
  // don't use logger for test env
  if (process.env.NODE_ENV !== 'test') {
    app.use(express.logger('dev'))
  }

  //Template engine
  app.engine('ejs', engine);

  // set views path, template engine and default layout
  app.set('views', config.root + '/app/views')
  app.set('view engine', 'ejs'); 


  app.configure(function () {
    // dynamic helpers
    app.use(helpers(config.app.name))

    // cookieParser should be above session
    app.use(express.cookieParser())

    // bodyParser should be above methodOverride
    app.use(express.bodyParser())
    app.use(express.methodOverride())

    // express/mongo session storage
    app.use(express.session({
      secret: 'noobjs',
      store: new mongoStore({
        url: config.db,
        collection : 'sessions'
      })
    }))

    // connect flash for flash messages
    app.use(flash())

    // use passport session
    app.use(passport.initialize())
    app.use(passport.session())

    // Internationalization with i18n abide
    app.use(i18n.abide({
      supported_languages: ['en-US', 'es-MX'],
      default_lang: 'en-US',
      translation_directory: 'i18n'
    }));
    
    
    // routes should be at the last
    app.use(app.router)
    
    
  })
}
