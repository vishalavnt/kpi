function getCurrentLogger () {
  if (window.trackJs) {
    return window.trackJs.track;
  }
}

class Logging {
  get log () {
    return getCurrentLogger() || console.log;
  }
  get error () {
    return getCurrentLogger() || console.error;
  }
}

export var logging = new Logging();