var pageObserver = null;
var videoTmpl = `
<div class="inserted-video style-scope ytd-grid-video-renderer">

    <a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail"
        aria-hidden="true" tabindex="-1" rel="null" href="{videoLink}" target="_blank">
        <img id="img" style="height:100%" class="style-scope yt-img-shadow" alt="" width="210" src="{thumbUrl}">

        <div id="overlays" class="style-scope ytd-thumbnail" style="display:block; position:relative">
            <span class="style-scope video-duration ytd-thumbnail-overlay-time-status-renderer">
                {videoDuration}
            </span>
            <span class="style-scope ytd-thumbnail-overlay-time-status-renderer {provider}">
            {provider}
        </span>
        </div>

    </a>
    <div id="details" class="style-scope ytd-grid-video-renderer">
        <div id="meta" class="style-scope ytd-grid-video-renderer">
            <h3 class="style-scope ytd-grid-video-renderer">
                <a id="video-title" class="yt-simple-endpoint style-scope ytd-grid-video-renderer" title="{videoTitle}"
                    href="{videoLink}" target="_blank">{videoTitle}</a>
            </h3>
            <div id="metadata-container" class="grid style-scope ytd-grid-video-renderer" meta-block="">
                <div id="metadata" class="style-scope ytd-grid-video-renderer">
                    <div id="byline-container" class="style-scope ytd-grid-video-renderer">
                        <div id="container" class="style-scope ytd-channel-name">
                            <div id="text-container" class="style-scope ytd-channel-name">
                                <div id="text" title="" class="style-scope ytd-channel-name complex-string"
                                    ellipsis-truncate="" has-link-only_="">
                                    <a class="channel-title yt-simple-endpoint style-scope yt-formatted-string" spellcheck="false"
                                        href="{channelUrl}" dir="auto" target="_blank">{channelTitle}</a>
                                </div>
                            </div>
                        </div>
                        <span class="style-scope ytd-badge-supported-renderer"></span>
                    </div>
                    <dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer">
                        <template is="dom-repeat"></template></dom-repeat>
                </div>
                <div id="metadata-line" class="style-scope ytd-grid-video-renderer">
                    <span class="style-scope ytd-grid-video-renderer">{videoViews} views</span>

                    <span class="style-scope ytd-grid-video-renderer">{videoPublishedOn}</span>
                    <dom-repeat strip-whitespace="" class="style-scope ytd-grid-video-renderer"><template
                            is="dom-repeat"></template></dom-repeat>

                </div>
            </div>
            <div id="additional-metadata-line" class="style-scope ytd-grid-video-renderer">
                <dom-repeat strip-whitespace="" class="style-scope ytd-grid-video-renderer"><template
                        is="dom-repeat"></template></dom-repeat>
            </div>
        </div>
    </div>
</div>
`;

function supplant(string, o) {
  return string.replace(/{([^{}]*)}/g, function (a, b) {
    var r = o[b];
    return typeof r === 'string' || typeof r === 'number' ? r : a;
  });
}

function isRendered(els) {
  let matches = [],
    elCt = els.length;

  for (let i = 0; i < elCt; ++i) {
    let el = els[i],
      b = el.getBoundingClientRect(),
      c;

    if (
      b.width > 0 &&
      b.height > 0 &&
      (c = window.getComputedStyle(el)) &&
      c.getPropertyValue('visibility') === 'visible' &&
      c.getPropertyValue('opacity') !== 'none'
    ) {
      matches.push(el);
    }
  }
  return matches;
}

function addContent(externalSubscriptions) {
  console.log('addContent called');
  contentParentElementsReady('ytd-shelf-renderer #contents').then(
    (elements) => {
      // today
      var parent = elements[0];
      var todayVideos = externalSubscriptions.today;
      var newHtml = '<div class="external-content">';
      for (var idx in todayVideos) {
        var videoHtml = supplant(videoTmpl, todayVideos[idx]);
        newHtml = newHtml + videoHtml;
      }
      newHtml = newHtml + '</div>';
      var div = document.createElement('div');
      div.innerHTML = newHtml.trim();
      parent.prepend(div.firstChild);

      // yesterday
      var parent = elements[1];
      var yesterdayVideos = externalSubscriptions.yesterday;
      var newHtml = '<div class="external-content">';
      for (var idx in yesterdayVideos) {
        var videoHtml = supplant(videoTmpl, yesterdayVideos[idx]);
        newHtml = newHtml + videoHtml;
      }
      newHtml = newHtml + '</div>';
      var div = document.createElement('div');
      div.innerHTML = newHtml.trim();
      parent.prepend(div.firstChild);

      // this week
      var parent = elements[2];
      var thisWeekVideos = externalSubscriptions.thisWeek;
      var newHtml = '<div class="external-content">';
      for (var idx in thisWeekVideos) {
        var videoHtml = supplant(videoTmpl, thisWeekVideos[idx]);
        newHtml = newHtml + videoHtml;
      }
      newHtml = newHtml + '</div>';
      var div = document.createElement('div');
      div.innerHTML = newHtml.trim();
      parent.prepend(div.firstChild);
    },
  );
}

function contentParentElementsReady(selector) {
  return new Promise((resolve, reject) => {
    var elements = isRendered(document.querySelectorAll(selector));
    if (elements.length >= 3) {
      resolve(elements);
    }
    new MutationObserver((mutationRecords, observer) => {
      var els = isRendered(document.querySelectorAll(selector));
      if (els.length >= 3) {
        resolve(els);
        observer.disconnect();
      }
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

function elementReady(selector) {
  return new Promise((resolve, reject) => {
    var el = document.querySelector(selector);
    if (el) {
      resolve(el);
    }
    new MutationObserver((mutationRecords, observer) => {
      Array.from(document.querySelectorAll(selector)).forEach((element) => {
        resolve(element);
        observer.disconnect();
      });
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

function elementsReady(selector) {
  return new Promise((resolve, reject) => {
    var els = document.querySelectorAll(selector);
    if (els) {
      resolve(els);
    }
    new MutationObserver((mutationRecords, observer) => {
      var els = document.querySelectorAll(selector);
      if (els) {
        resolve(els);
        observer.disconnect();
      }
    }).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  });
}

function requestUpdateFromBackend() {
  console.log('requestUpdateFromBackend called');
  chrome.runtime.sendMessage(
    {
      type: 'UPDATE_THE_PAGE',
    },
    function (externalSubscriptions) {
      render(externalSubscriptions);
    },
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function render(externalSubscriptions) {
  var selector = 'yt-page-navigation-progress';
  while (
    document.querySelector(selector) != null &&
    document.querySelector(selector).style.transform != 'scaleX(1)' &&
    document.querySelector(selector).style.transform
  ) {
    console.log('Progress bar not finished');
    await sleep(1000);
  }
  console.log('Progress bar finished');

  if(pageObserver) {
    pageObserver.disconnect();
  }
  pageObserver = new MutationObserver(() => {
    if (
      externalSubscriptions.length > 0 &&
      document.querySelectorAll('.external-content').length == 0
    ) {
      _inject(externalSubscriptions);
    }
  });
  pageObserver.observe(document.body, { childList: true, subtree: true });
}

async function _inject(externalSubscriptions) {
  pageObserver.disconnect();
  // document.querySelectorAll('.external-content').forEach((e) => e.remove());
  for (var idx in externalSubscriptions) {
    var content = externalSubscriptions[idx];
    if (content.type === 'content') {
      addContent(content);
    }
  }
  pageObserver.observe(document.body, { childList: true, subtree: true });
}

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse,
) {
  if (request.type === 'ON_SUBS_PAGE') {
    await render(request.data);
  }
});

window.onload = function () {
  if (window.location.href.includes('/feed/subscriptions') === true) {
    requestUpdateFromBackend();
  }
};
