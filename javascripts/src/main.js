(function () {
  'use strict';

  // # modules
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  // # Web Font Loader
  // Load linked fonts using @font-face with added control – Web Font Loader, Typekit & Google
  // https://github.com/typekit/webfontloader
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  const WebFontConfig = {
    custom: {
      families: [
        // '',
      ]
    }
  };

  function initWebFonts() {
    const wf = document.createElement('script');
    const s  = document.scripts[0];

    // Link to CDN for for script source,
    // documentation recommends using explicit version numbers for performance reason
    wf.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.16/webfont.js';
    s.parentNode.insertBefore(wf, s);
  }

  // # Preloader
  //
  // Ease in initial page content
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  const Preloader = {
    el   : document.getElementsByClassName('preloader')[0],
    body : document.getElementsByTagName('body')[0],
    state: {
      active: true
    },

    //////////////////////////////
    // # Stop page scrolling
    //////////////////////////////
    stopScroll() {
      const obj = this;
      obj.body.style.overflow = 'hidden';
    },

    //////////////////////////////
    // # Start (allow) page scrolling
    //////////////////////////////
    startScroll() {
      const obj = this;
      obj.body.style.overflow = 'auto';
    },

    //////////////////////////////
    // # Open
    //////////////////////////////
    open() {
      const obj = this;
      // Restrict page content viewing
      obj.stopScroll();
      obj.state.active = true;
      // Transit in preloader
      TweenLite.set(obj.el, {
        display   : 'table',
        visibility: 'visible',
        opacity   : 0
      });
      TweenLite.to(obj.el, 0.35, {
        opacity: 1
      });
    },

    //////////////////////////////
    // # Close
    //////////////////////////////
    close() {
      const obj = this;
      // Transit out preloader
      TweenLite.to(obj.el, 0.5, {
        opacity   : 0,
        onComplete: function() {
          TweenLite.set(obj.el, {
            display   : 'none',
            visibility: 'hidden'
          });
          // Allow page content viewing
          obj.startScroll();
          obj.state.active = false;
        }
      });
    },

    //////////////////////////////
    // # Toggle
    //////////////////////////////
    toggle() {
      const obj = this;
      if (obj.state.active) {
        obj.close();
      } else {
        obj.open();
      }
    }
  };

  // # View Controller
  // - Barba.js utility
  // - http://barbajs.org/
  //
  // Utilising Pushstate AJAX (or PJAX) to simuluate a SPA-type navigation
  ////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////
  const ViewController = {
    //////////////////////////////
    // # Initialise
    //////////////////////////////
    init() {
      // Update DOM parsing variables
      Barba.Pjax.Dom.wrapperId      = 'mainframe-wrap';
      Barba.Pjax.Dom.containerClass = 'mainframe';
      Barba.Pjax.ignoreClassLink    = 'no-frame-load';
      // Processes
      const obj = this;
      obj.initAnalytics();
      obj.initTransitions();
      obj.initActions();
    },

    //////////////////////////////
    // # Initialise analytics
    // Track new pages loaded in timeline
    //////////////////////////////
    initAnalytics() {
      Barba.Dispatcher.on('initStateChange', function() {
        if (Barba.HistoryManager.prevStatus() === null) {
          // Google analytics SPA tracking
          // - https://developers.google.com/analytics/devguides/collection/analyticsjs/single-page-applications
          // ga('set', 'page', Barba.Pjax.getCurrentUrl());
          // ga('send', 'pageview');
        }
      });
    },

    //////////////////////////////
    // # Transitions
    // Custom transitions
    //////////////////////////////
    transitions: {
      //////////////////////////////
      // # Fade in-out
      //////////////////////////////
      fade: Barba.BaseTransition.extend({
        //////////////////////////////
        // # Start
        //////////////////////////////
        start: function() {
          const obj = this;
          Promise
            .all([obj.newContainerLoading, obj.hideOld()])
            .then(obj.showNew.bind(this));
        },

        //////////////////////////////
        // # Hide old content
        //////////////////////////////
        hideOld: function() {
          // Animate out current content and fulfill promise
          const obj = this;
          return new Promise((resolve, reject) => {
            TweenLite.to(obj.oldContainer, 0.15, {
              opacity   : 0,
              onComplete: function() {
                resolve(true);
              }
            });
          });
        },

        //////////////////////////////
        // # Show new content
        //////////////////////////////
        showNew: function() {
          const obj = this;
          // Hide old content
          obj.oldContainer.style.display = 'none';
          // Animate in new content and fulfill promise
          TweenLite.set(obj.newContainer, {
            visibility: 'visible',
            opacity   : 0
          });
          TweenLite.to(this.newContainer, 0.15, {
            opacity: 1,
            onComplete: function() {
              obj.done();
            }
          });
        }
      })
    },

    //////////////////////////////
    // # Initialise transitions
    // Process view-specific transitions if required,
    // defaults to fade in-out
    //////////////////////////////
    initTransitions() {
      const obj = this;
      Barba.Pjax.getTransition = function() {
        // Get transition based on current namespace
        switch(Barba.HistoryManager.prevStatus().namespace) {
          case 'index': return obj.transitions.fade;
          default:      return obj.transitions.fade;
        }
      };
    },

    //////////////////////////////
    // # Initialise actions
    // Process view-specific and step-specific actions
    // - http://barbajs.org/views.html
    //////////////////////////////
    initActions() {
      const list = {
        // Index view
        index: Barba.BaseView.extend({
          namespace: 'index',
          onEnter: function() {
            // New container is ready and attached to DOM
          },
          onEnterCompleted: function() {
            // Transition is complete
          },
          onLeave: function() {
            // New transition to a new page has started
          },
          onLeaveCompleted: function() {
            // Current container removed from DOM
          }
        })
      };

      for (let view in list) {
        list[view].init();
      }
    }
  };


  // # PROCESS: on load
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  // Web Font Loader
  initWebFonts();
  // Preloader
  Preloader.toggle();


  // # PROCESS: on complete
  //
  // Post-CSSOM load – ensures styles are applied first before executing functions
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////////////////////

  const complete = setInterval(function() {
    if(document.readyState === 'complete') {
      // View Controller
      ViewController.init();
      Barba.Pjax.start();

      clearInterval(complete);
    }
  }, 100);
})();