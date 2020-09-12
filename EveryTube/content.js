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


function inViewport(els) {
  let matches = [],
      elCt = els.length;

  for (let i=0; i<elCt; ++i) {
      let el = els[i],
          b = el.getBoundingClientRect(), c;

      if  (b.width > 0 && b.height > 0 &&
          // b.left+b.width > 0 && b.right-b.width < window.outerWidth &&
          // b.top+b.height > 0 && b.bottom-b.width < window.outerHeight &&
          (c = window.getComputedStyle(el)) &&
          c.getPropertyValue('visibility') === 'visible' &&
          c.getPropertyValue('opacity') !== 'none') {
          matches.push(el);
      }
  }
  return matches;
}

function addContent(externalSubscriptions) {
  console.log('addContent called');
  elementsReady('ytd-item-section-renderer #items').then((elements) => {
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
  });

}


function addExternalSubscriptionVideos() {
  console.log('addExternalSubscriptionVideos called');
  chrome.runtime.sendMessage(
    {
      type: 'UPDATE_THE_PAGE',
    },
    function (externalSubscriptions) {
      console.log('videos');
      console.log(externalSubscriptions);
      for (var idx in externalSubscriptions) {
        var content = externalSubscriptions[idx];
        if (content.type === 'content') {
          addContent(content);
        }
      }
    },
  );
}

function elementsReady(selector) {
  return new Promise((resolve, reject) => {
    const elements = inViewport(document.querySelectorAll(selector));
    console.log(elements.length);
    if (elements.length === 3) {
      resolve(elements);
    }
    new MutationObserver((mutationRecords, observer) => {
      var elements2 = inViewport(document.querySelectorAll(selector));
      console.log(elements2.length);
      if (elements2.length === 3) {
        resolve(elements2);
        observer.disconnect();
      }
      // Array.from(document.querySelectorAll(selector)).forEach((element, idx) => {
      //   resolve([idx, element]);
      //   observer.disconnect();
      // });
    })
      .observe(document.documentElement, {
        childList: true,
        subtree: true
      });
  });
}

function elementReady(selector) {
  return new Promise((resolve, reject) => {
    const el = document.querySelector(selector);
    if (el) { resolve(el); }
    new MutationObserver((mutationRecords, observer) => {
      Array.from(document.querySelectorAll(selector)).forEach((element) => {
        resolve(element);
        observer.disconnect();
      });
    })
      .observe(document.documentElement, {
        childList: true,
        subtree: true
      });
  });
}

function onClickHandler() {
  addExternalSubscriptionVideos();
  // setTimeout(() => { addExternalSubscriptionVideos() }, 2000);
}

function onContentLoaded() {
  if (window.location.pathname.includes('/feed/subscriptions') === true) {
    addExternalSubscriptionVideos();
  }
  elementReady('a[title=Subscriptions]').then((element) => {
    element.addEventListener('click', onClickHandler);
  });
}



document.addEventListener('DOMContentLoaded', onContentLoaded, false);

