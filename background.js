var
  app,
  HIBP,
  domainFromHostname = /([\w-]{4,}|^[\w-]+)(\.[\w-]{1,3})*$/,
  pwnedDetails = {},
  pwnAddedCallback,
  pwnRemovedCallback;

HIBP = (function () {
  var
    apiBaseUrl = "https://haveibeenpwned.com/api/v2/",
    apiUrls = {
      password : "pwnedpassword/",
      username : "breachedaccount/",
      domain : "breaches/"
    },
    lastSendTime = 0,
    queue = [],
    rateLimit = 1600;

  setInterval(watch, 250);

  return {
    passwordRequest: passwordRequest
  };

  function passwordRequest(password, id, callback) {
    var
      url = apiBaseUrl + apiUrls.password + encodeURI(password),
      xhr = new XMLHttpRequest();

    console.log(password, id);

    xhr.onreadystatechange = stateChange;
    xhr.open("GET", url);
    xhr.setRequestHeader("api-version", "2");

    // `id` allows elements to overwrite their queue entry with updated info
    id && queue.some(function (element, index, array) {
      if (element.id === id) {
        array[index] = send;
      }
    }) || queue.push(xhr);

    function stateChange() {
      if(xhr.readyState === XMLHttpRequest.DONE) {
        callback(xhr.status === 200);
      }
    }
  }
  function now() {
    return (new Date()).getTime();
  }
  function watch() {
    if (now() < lastSendTime + rateLimit) {
      return;
    }
    lastSendTime = now();
    if (queue.length) {
      queue.shift().send();
    }
  }
}());

app = {
  onPwnAdded: function (cb) {
    pwnAddedCallback = cb;
    Object.keys(pwnedDetails).forEach(function (id) {
      pwnAddedCallback(id, pwnedDetails[id]);
    });
  },
  onPwnRemoved: function (cb) {
    pwnRemovedCallback = cb;
  },
  removePwn: function (id) {
    delete pwnedDetails[id];
    refreshBadge();
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {

  if (!message.password) {
    return;
  }

  // "domain" in this context is the recogniseable name of the site
  message.domain = (
    domainFromHostname.exec(message.hostname) || [message.hostname]
  )[0];

  id = message.domain + '|' + message.username;

  HIBP.passwordRequest(message.password, id,
    function (result) {
      if (result) {
        pwnedDetails[id] = message;

        message.pwnedPassword = true;
        message.read = false;
        if (typeof pwnAddedCallback === 'function') {
          pwnAddedCallback(id, message);
        }
      } else {
        delete pwnedDetails[id];
        if (typeof pwnRemovedCallback === 'function') {
          pwnRemovedCallback(id, message);
        }
      }
      refreshBadge();
      sendResponse({
        password: result
      });
    });

  return true;
});

function refreshBadge(pwnage) {
  var numUnread = 0;
  Object.values(pwnedDetails).forEach(function (val) {
    if (!val.read) {
      numUnread++;
    }
  });
  chrome.browserAction.setBadgeBackgroundColor({
    color: [255, 0, 0, 255]
  });
  chrome.browserAction.setBadgeText({
    text: (numUnread || '').toString()
  });
}
