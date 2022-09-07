import { JSDOM } from './jsdom.js';

var PROVIDER_URLS = {
  bitchute: 'https://www.bitchute.com',
  lbry: 'https://api.lbry.tv/api/v1/proxy?m=claim_search',
  lbry_me: 'https://api.lbry.com/user/me?auth_token=',
  lbry_subs_list: 'https://api.lbry.com/subscription/list?auth_token=',
};
var PROVIDER_LABELS = {
  bitchute: 'BitChute',
  lbry: 'Odysee',
};
var PROVIDER_DOMAINS = [
  new URL(PROVIDER_URLS['bitchute']).host,
  new URL(PROVIDER_URLS['lbry']).host,
];
var PROVIDER_LOGIN_STATE_COOKIE = {
  bitchute: 'sessionid',
  lbry: 'auth_token',
};
var PROVIDER_LOGGED_IN = {
  bitchute: false,
  lbry: false,
};
var LBRY_AUTH_TOKEN = null;
var CACHE_MAX = 60000 * 5; // 5 mins
var CACHE_KEY = 'everytubecache';

function isElement(o) {
  return typeof HTMLElement === 'object'
    ? o instanceof HTMLElement //DOM2
    : o &&
    typeof o === 'object' &&
    o !== null &&
    o.nodeType === 1 &&
    typeof o.nodeName === 'string';
}

function kFormatter(num) {
  return Math.abs(num) > 999
    ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k'
    : Math.sign(num) * Math.abs(num);
}

function parseVideosFromBitchute(html_text) {
  let dom = new JSDOM(html_text);
  var subs = dom.window.document.getElementById('listing-subscribed');
  var videoEls = subs.querySelectorAll('.video-card');
  var videosPublishedToday = [];
  var videosPublishedYesterday = [];
  var videosPublishedThisWeek = [];
  console.log(`videoEls=${videoEls.length}`)
  for (var videoElIdx in videoEls) {
    var el = videoEls[videoElIdx];
    if (isElement(el) == true) {
      var base = PROVIDER_URLS['bitchute'];
      var videoLink = base + el.querySelector('a').getAttribute('href');
      var thumbUrl = el.querySelector('img').getAttribute('data-src');
      var videoTitle = el.getElementsByClassName('video-card-title')[0].textContent;
      var channelTitle = el.getElementsByClassName('video-card-channel')[0].textContent;
      var channelUrl =
        base + el.querySelector('.video-card-channel a').getAttribute('href');
      var videoDuration = el.getElementsByClassName('video-duration')[0].textContent;
      var videoPublishedOn = el.getElementsByClassName('video-card-published')[0].textContent;
      var videoViews = parseInt(
        el.getElementsByClassName('video-views')[0].textContent.trim().replace('.', '').replace('K', '00')
      )
      var video = {
        videoLink: videoLink,
        thumbUrl: thumbUrl,
        videoTitle: videoTitle,
        channelTitle: channelTitle,
        channelUrl: channelUrl,
        videoDuration: videoDuration,
        videoViews: kFormatter(videoViews),
        videoPublishedOn: videoPublishedOn,
        provider: PROVIDER_LABELS['bitchute'],
      };
      if (videoPublishedOn.includes('1 day,') === true) {
        videosPublishedYesterday.push(video);
      } else if (
        (videoPublishedOn.includes('minutes ago') ||
          videoPublishedOn.includes('hour ago') ||
          videoPublishedOn.includes('hours ago')) &&
        !videoPublishedOn.includes('day')
      ) {
        videosPublishedToday.push(video);
      } else if (videoPublishedOn.includes('days')) {
        videosPublishedThisWeek.push(video);
      }
    }
  }
  return {
    type: 'content',
    today: videosPublishedToday,
    yesterday: videosPublishedYesterday,
    thisWeek: videosPublishedThisWeek,
  };
}

function timeAgo(time) {

  var units = [
    {
      name: 'second',
      limit: 60,
      in_seconds: 1,
    },
    {
      name: 'minute',
      limit: 3600,
      in_seconds: 60,
    },
    {
      name: 'hour',
      limit: 86400,
      in_seconds: 3600,
    },
    {
      name: 'day',
      limit: 604800,
      in_seconds: 86400,
    },
    {
      name: 'week',
      limit: 2629743,
      in_seconds: 604800,
    },
    {
      name: 'month',
      limit: 31556926,
      in_seconds: 2629743,
    },
    {
      name: 'year',
      limit: null,
      in_seconds: 31556926,
    },
  ];
  var diff = (new Date() - new Date(time * 1000)) / 1000;
  if (diff < 5) return 'now';

  var i = 0;
  var result;

  while (i <= units.length) {
    i++;
    var unit = units[i]
    if (diff < unit.limit || !unit.limit) {
      var diff = Math.floor(diff / unit.in_seconds);
      result = diff + ' ' + unit.name + (diff > 1 ? 's' : '') + ' ago';
      return result
    }
  }
}

function secondsToTime(secs) {
  var hours = Math.floor(secs / (60 * 60));

  var divisor_for_minutes = secs % (60 * 60);
  var minutes = Math.floor(divisor_for_minutes / 60);

  var divisor_for_seconds = divisor_for_minutes % 60;
  var seconds = Math.ceil(divisor_for_seconds);

  var obj = {
    h: hours,
    m: minutes,
    s: seconds,
  };
  return obj;
}

function parseVideosFromLbry(items) {
  console.log(`parseVideosFromLbry ${items.length}`)
  var videosPublishedToday = [];
  var videosPublishedYesterday = [];
  var videosPublishedThisWeek = [];
  for (var idx in items) {
    var item = items[idx];

    if (
      item.value_type == 'stream' &&
      item.is_channel_signature_valid == true &&
      typeof item.value.video !== 'undefined'
    ) {
      var videoLink =
        'https://odysee.com/' +
        item.signing_channel.normalized_name +
        '/' +
        item.normalized_name;
      if (item.value.thumbnail.url) {
        var thumbUrl = item.value.thumbnail.url;
      } else {
        var thumbUrl = 'https://odysee.com/public/img/placeholder.png';
      }
      var videoTitle = item.value.title;
      if (item.signing_channel.value.title) {
        var channelTitle = item.signing_channel.value.title;
      } else {
        var channelTitle = item.signing_channel.name;
      }
      var channelUrl =
        'https://odysee.com/' + item.signing_channel.normalized_name;
      var durationData = secondsToTime(item.value.video.duration);
      if (durationData.h) {
        var videoDuration =
          durationData.h + ':' + durationData.m + ':' + durationData.s;
      } else {
        var videoDuration = durationData.m + ':' + durationData.s;
      }
      var videoPublishedOn = timeAgo(item.meta.creation_timestamp);
      var video = {
        videoLink: videoLink,
        thumbUrl: thumbUrl,
        videoTitle: videoTitle,
        channelTitle: channelTitle,
        channelUrl: channelUrl,
        videoDuration: videoDuration,
        videoViews: '∞',
        videoPublishedOn: videoPublishedOn,
        provider: PROVIDER_LABELS['lbry'],
      };
      if (videoPublishedOn === '1 day ago') {
        videosPublishedYesterday.push(video);
      } else if (
        (videoPublishedOn.includes('minutes ago') ||
          videoPublishedOn.includes('hour ago') ||
          videoPublishedOn.includes('hours ago')) &&
        !videoPublishedOn.includes('day')
      ) {
        videosPublishedToday.push(video);
      } else if (videoPublishedOn.includes('days ago')) {
        videosPublishedThisWeek.push(video);
      }
    }
  }
  return {
    type: 'content',
    today: videosPublishedToday,
    yesterday: videosPublishedYesterday,
    thisWeek: videosPublishedThisWeek,
  };
}

function updateProviderLoginState() {
  console.log('updateProviderLoginState...')
  PROVIDER_LOGGED_IN['bitchute'] = false;
  var cookieName = PROVIDER_LOGIN_STATE_COOKIE['bitchute'];
  var cookieUrl = PROVIDER_URLS['bitchute'];
  chrome.cookies.get(
    {
      url: cookieUrl,
      name: cookieName,
    },
    function (cookie) {
      if (cookie != null && cookie.value.length > 0) {
        PROVIDER_LOGGED_IN['bitchute'] = true;
      }
    },
  );

  PROVIDER_LOGGED_IN['lbry'] = false;
  var cookieName = PROVIDER_LOGIN_STATE_COOKIE['lbry'];
  var cookieUrl = 'https://odysee.com'
  chrome.cookies.get(
    {
      url: cookieUrl,
      name: cookieName,
    },
    function (cookie) {
      if (cookie != null && cookie.value.length > 0) {
        LBRY_AUTH_TOKEN = cookie.value;
        PROVIDER_LOGGED_IN['lbry'] = true;
      }
    },
  );
}

function loggedInToBitchute() {
  return PROVIDER_LOGGED_IN['bitchute'] === true;
}

function loggedInToOdysee() {
  return PROVIDER_LOGGED_IN['lbry'] === true;
}

function wait(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function fetchRetry(url, delay, tries, fetchOptions = {}) {
  function onError(err) {
    triesLeft = tries - 1;
    if (!triesLeft) {
      throw err;
    }
    return wait(delay).then(() =>
      fetchRetry(url, delay, triesLeft, fetchOptions),
    );
  }
  return fetch(url, fetchOptions).catch(onError);
}

updateProviderLoginState();

async function fetchContentBitchute() {
  console.log('fetching content from BitChute...')
  var cached = await getFromCache();
  if (cached) {
    return cached;
  }
  var allVideos = [];
  const loggedIn = loggedInToBitchute() === true
  console.log(`Bitchute, loggedIn=${loggedIn}`)
  if (loggedIn) {
    console.debug('BitChute logged in, getting content');
    var url = PROVIDER_URLS['bitchute'];
    await fetchRetry(url, 0.2, 5, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.text())
      .then((json_data) => {
        return parseVideosFromBitchute(json_data);
      })
      .then((result) => allVideos.push(result))
      .catch((err) => {
        console.log(err);
      });
  }
  return allVideos;
}

async function fetchContentOdysee(previousAllVideos) {
  console.log('fetching content from Odysee...')
  var cached = await getFromCache();
  if (cached) {
    return cached;
  }
  var allVideos = [];
  if (previousAllVideos) {
    allVideos = previousAllVideos;
  }
  const loggedIn = loggedInToOdysee() === true;
  console.log(`Odysee loggedIn=${loggedIn}`)
  if (loggedIn) {
    var url = PROVIDER_URLS['lbry'];
    var releaseTimeQuery =
      '<' + parseInt(new Date().getTime() / 1000).toString();
    var meUrl = PROVIDER_URLS['lbry_me'] + LBRY_AUTH_TOKEN;
    var userId = await fetchRetry(meUrl, 0.2, 5, {
      method: 'GET',
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((json_data) => {
        userId = json_data.data.id;
        return userId;
      });
    var channelClaimIds = await fetchRetry(
      PROVIDER_URLS['lbry_subs_list'] + LBRY_AUTH_TOKEN,
      0.2,
      5,
      {
        method: 'GET',
        credentials: 'include',
      },
    )
      .then((response) => response.json())
      .then(function (json_data) {
        var ids = [];
        for (var idx in json_data.data) {
          var item = json_data.data[idx];
          ids.push(item.claim_id);
        }
        return ids;
      });
    if (channelClaimIds.length == 0) {
      return allVideos;
    }
    var req = {
      jsonrpc: '2.0',
      method: 'claim_search',
      params: {
        page_size: 200,
        page: 1,
        no_totals: true,
        channel_ids: channelClaimIds,
        not_channel_ids: [],
        not_tags: [
          'porn',
          'porno',
          'nsfw',
          'mature',
          'xxx',
          'sex',
          'creampie',
          'blowjob',
          'handjob',
          'vagina',
          'boobs',
          'big boobs',
          'big dick',
          'pussy',
          'cumshot',
          'anal',
          'hard fucking',
          'ass',
          'fuck',
          'hentai',
        ],
        order_by: ['release_time'],
        release_time: releaseTimeQuery,
        fee_amount: '>=0',
        include_purchase_receipt: true,
      },
      id: userId,
    };
    await fetchRetry(url, 0.2, 5, {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(req),
      headers: {
        'x-lbry-auth-token': LBRY_AUTH_TOKEN,
      },
    })
      .then((response) => response.json())
      .then((json_data) => {
        return parseVideosFromLbry(json_data.result.items);
      })
      .then((result) => allVideos.push(result))
      .catch((err) => {
        console.log(err);
      });
    return allVideos;
  } else {
    return allVideos;
  }
}

function getFromCache() {
  return new Promise((resolve) => {
    chrome.storage.local.get([CACHE_KEY], function (items) {
      var cache = items[CACHE_KEY];
      if (cache != null && cache.cacheTime > Date.now() - CACHE_MAX) {
        console.log('Cache hit');
        console.log(cache);
        resolve(cache);
      } else {
        console.log('No cache hit');
        resolve(null);
      }
    });
  });
}

async function setCacheAndSendResponse(data, callback) {
  console.log(`setCacheAndSendResponse ${data.length}`);
  var cached = await getFromCache();
  if (cached == null) {
    var cacheTime = Date.now();
    chrome.storage.local.set(
      {
        [CACHE_KEY]: {
          cache: data,
          cacheTime: cacheTime,
        },
      },
      function () {
        console.log('Set cache');
        console.log(cacheTime);
        return callback(data);
      },
    );
  } else {
    return callback(cached.cache);
  }
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if ((msg.type = 'UPDATE_THE_PAGE')) {
    fetchContentBitchute()
      .then((res) => fetchContentOdysee(res))
      .then((res) => setCacheAndSendResponse(res, sendResponse));
  }
  return true;
});


chrome.cookies.onChanged.addListener(function (cookies) {
  if (
    PROVIDER_DOMAINS.includes(cookies.cookie.domain) === true &&
    cookies.cookie.name === 'sessionid'
  ) {
    updateProviderLoginState();
  }
});

function _sendResponse(data) {
  chrome.tabs.query(
    {
      active: true,
      currentWindow: true,
    },
    function (tabs) {
      if (tabs) {
        console.log('History changed, sent data to content.js');
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'ON_SUBS_PAGE',
          data: data,
        });
      }
    },
  );
}

chrome.history.onVisited.addListener(function (result) {
  if (
    result.url.includes('https://www.youtube.com/feed/subscriptions') === true
  ) {
    fetchContentBitchute()
      .then((res) => fetchContentOdysee(res))
      .then((res) => setCacheAndSendResponse(res, _sendResponse));
  }
});
