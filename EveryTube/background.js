var PROVIDER_URLS = {
    'bitchute': 'https://www.bitchute.com',
    'lbry': 'https://api.lbry.tv/api/v1/proxy?m=claim_search',
}
var PROVIDER_DOMAINS = [
    (new URL(PROVIDER_URLS['bitchute'])).host,
    (new URL(PROVIDER_URLS['lbry'])).host
];
var PROVIDER_LOGIN_STATE_COOKIE = {
    'bitchute': 'sessionid',
    'lbry': 'auth_token',
}
var PROVIDER_LOGGED_IN = {
    'bitchute': false,
    'lbry': false,
};
var LBRY_AUTH_TOKEN = null;

function isElement(o) {
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
}

function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
}

function parseVideosFromBitchute(html_text) {
    var parser = new DOMParser();
    var htmlDoc = parser.parseFromString(html_text, 'text/html');
    var subs = htmlDoc.getElementById('listing-subscribed');
    var videoEls = subs.querySelectorAll('.video-card');
    var videosPublishedToday = [];
    var videosPublishedYesterday = [];
    var videosPublishedThisWeek = [];
    for (var videoElIdx in videoEls) {
        var el = videoEls[videoElIdx];
        if (isElement(el) == true) {
            var base = PROVIDER_URLS['bitchute'];
            var videoLink = base + el.querySelector('a').getAttribute('href');
            var thumbUrl = el.querySelector('img').getAttribute('data-src');
            var videoTitle = el.querySelector('.video-card-title a').innerText;
            var channelTitle = el.querySelector('.video-card-channel a').innerText;
            var channelUrl = base + el.querySelector('.video-card-channel a').getAttribute('href');
            var videoDuration = el.querySelector('.video-duration').innerText;
            var videoPublishedOn = el.querySelector('.video-card-published').innerText;
            var videoViews = parseInt(el.querySelector('.video-views').innerText.trim());
            var video = {
                'videoLink': videoLink,
                'thumbUrl': thumbUrl,
                'videoTitle': videoTitle,
                'channelTitle': channelTitle,
                'channelUrl': channelUrl,
                'videoDuration': videoDuration,
                'videoViews': kFormatter(videoViews),
                'videoPublishedOn': videoPublishedOn,
                'provider': 'bitchute'
            }
            if (videoPublishedOn.includes('1 day,') === true) {
                videosPublishedYesterday.push(video);
            } else if (videoPublishedOn.includes('hours ago') && !videoPublishedOn.includes('day')) {
                videosPublishedToday.push(video);
            } else {
                videosPublishedThisWeek.push(video);
            }
        }
    }
    return {
        type: 'content',
        today: videosPublishedToday,
        yesterday: videosPublishedYesterday,
        thisWeek: videosPublishedThisWeek,
    }
}

var numDaysBetween = function(d1, d2) {
    var today = d2.getTime() / 1000
    console.log('today', today)
    var diff = Math.abs(d1 - (d2.getTime() / 1000));
    console.log('diff', diff)
    return diff / (60 * 60 * 24);
  };


  function timeAgo(time){
    var units = [
      { name: "second", limit: 60, in_seconds: 1 },
      { name: "minute", limit: 3600, in_seconds: 60 },
      { name: "hour", limit: 86400, in_seconds: 3600  },
      { name: "day", limit: 604800, in_seconds: 86400 },
      { name: "week", limit: 2629743, in_seconds: 604800  },
      { name: "month", limit: 31556926, in_seconds: 2629743 },
      { name: "year", limit: null, in_seconds: 31556926 }
    ];
    var diff = (new Date() - new Date(time*1000)) / 1000;
    if (diff < 5) return "now";

    var i = 0;
    while (unit = units[i++]) {
      if (diff < unit.limit || !unit.limit){
        var diff =  Math.floor(diff / unit.in_seconds);
        return diff + " " + unit.name + (diff>1 ? "s" : "") + " ago";
      }
    };
  }

  function secondsToTime(secs)
{
    var hours = Math.floor(secs / (60 * 60));

    var divisor_for_minutes = secs % (60 * 60);
    var minutes = Math.floor(divisor_for_minutes / 60);

    var divisor_for_seconds = divisor_for_minutes % 60;
    var seconds = Math.ceil(divisor_for_seconds);

    var obj = {
        "h": hours,
        "m": minutes,
        "s": seconds
    };
    return obj;
}

function parseVideosFromLbry(items) {
    console.log('parseVideosFromLbry');
    var videosPublishedToday = [];
    var videosPublishedYesterday = [];
    var videosPublishedThisWeek = [];
    for (var idx in items) {
        var item = items[idx];
        var videoLink = 'https://lbry.tv/' + item.signing_channel.normalized_name + '/' + item.value.normalized_name;
        var thumbUrl = item.value.thumbnail.url
        var videoTitle = item.value.title;
        var channelTitle =  item.signing_channel.value.title;
        var channelUrl = 'https://lbry.tv/' + item.signing_channel.normalized_name;
        var durationData = secondsToTime(item.value.video.duration);
        if (durationData.h) {
            var videoDuration = durationData.h + ':' + durationData.m + ':' + durationData.s;
        } else {
            var videoDuration = durationData.m + ':' + durationData.s;
        }
        var videoPublishedOn = timeAgo(item.meta.creation_timestamp);
        var videoViews = parseInt(0);
        var video = {
            'videoLink': videoLink,
            'thumbUrl': thumbUrl,
            'videoTitle': videoTitle,
            'channelTitle': channelTitle,
            'channelUrl': channelUrl,
            'videoDuration': videoDuration,
            'videoViews': 'unknown',
            'videoPublishedOn': videoPublishedOn,
            'provider': 'lbry'
        }
        if (videoPublishedOn.includes('1 day,') === true) {
            videosPublishedYesterday.push(video);
        } else if (videoPublishedOn.includes('hours ago') && !videoPublishedOn.includes('day')) {
            videosPublishedToday.push(video);
        } else {
            videosPublishedThisWeek.push(video);
        }
    }
    return {
        type: 'content',
        today: videosPublishedToday,
        yesterday: videosPublishedYesterday,
        thisWeek: videosPublishedThisWeek,
    }
}

function updateProviderLoginState() {
    console.log('updateProviderLoginState');
    PROVIDER_LOGGED_IN['bitchute'] = false;
    var cookieName = PROVIDER_LOGIN_STATE_COOKIE['bitchute'];
    var cookieUrl = PROVIDER_URLS['bitchute'];
    chrome.cookies.get({"url": cookieUrl, "name": cookieName}, function(cookie) {
        console.log(cookie);
        if (cookie != null && cookie.value.length > 0) {
            PROVIDER_LOGGED_IN['bitchute'] = true;
        }
    });


    PROVIDER_LOGGED_IN['lbry'] = false;
    var cookieName = PROVIDER_LOGIN_STATE_COOKIE['lbry'];
    var cookieUrl = PROVIDER_URLS['lbry'];
    chrome.cookies.get({"url": cookieUrl, "name": cookieName}, function(cookie) {
        console.log(cookie);
        if (cookie != null && cookie.value.length > 0) {
            LBRY_AUTH_TOKEN = cookie.value;
            PROVIDER_LOGGED_IN['lbry'] = true;
        }
    });
}

function loggedInToBitchute() {
    return PROVIDER_LOGGED_IN['bitchute'] === true;
}

function loggedInToLbry() {
    return PROVIDER_LOGGED_IN['lbry'] === true;
}

function getLbryAuthToken() {
    console.log('getLbryAuthToken');
    var cookieName = PROVIDER_LOGIN_STATE_COOKIE['lbry'];
    var cookieUrl = PROVIDER_URLS['lbry'];
    chrome.cookies.get({"url": cookieUrl, "name": cookieName}, function(cookie) {
        console.log(cookie);
        return cookie.value;
    });
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
        return wait(delay).then(() => fetchRetry(url, delay, triesLeft, fetchOptions));
    }
    return fetch(url, fetchOptions).catch(onError);
}

updateProviderLoginState();

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.type = 'UPDATE_THE_PAGE') {

        var allVideos = []
        if(loggedInToBitchute() === true) {
            console.log('BitChute logged in, getting content');
            var url = PROVIDER_URLS['bitchute'];
            fetchRetry(url, 0.2, 5, {
                method: 'GET',
                credentials: 'include'
            })
                .then(response => response.text())
                .then((data) => {
                    var videos = parseVideosFromBitchute(data);
                    allVideos.push(videos);
                    sendResponse(allVideos)
                }).catch((err) => {
                    console.log(err);
                });
        }

        if(loggedInToLbry() === true) {
            console.log('Lbry logged in, getting content');
            var url = PROVIDER_URLS['lbry'];
            console.log('token');
            console.log(LBRY_AUTH_TOKEN);
            var user_id = 1599832757025;
            var req = {"jsonrpc":"2.0","method":"claim_search","params":{"page_size":20,"page":1,"no_totals":true,"channel_ids":["c9da929d12afe6066acc89eb044b552f0d63782a"],"not_channel_ids":[],"not_tags":["porn","porno","nsfw","mature","xxx","sex","creampie","blowjob","handjob","vagina","boobs","big boobs","big dick","pussy","cumshot","anal","hard fucking","ass","fuck","hentai"],"order_by":["release_time"],"release_time":"<1599832740","fee_amount":">=0","include_purchase_receipt":true},"id":user_id};

            fetchRetry(url, 0.2, 5, {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(req),
                headers: {'x-lbry-auth-token': LBRY_AUTH_TOKEN}
            })
                .then(response => response.json())
                .then((data) => {
                    console.log(data.result);
                    var items = data.result.items;
                    console.log(items[0]);
                    var videos = parseVideosFromLbry(items);
                    allVideos.push(videos);
                    return sendResponse(allVideos)
                }).catch((err) => {
                    console.log(err);
                });
        }
        console.log('after');

        // return sendResponse(allVideos)
    }
    return true;
});

chrome.cookies.onChanged.addListener(function (cookies) {
    if (PROVIDER_DOMAINS.includes(cookies.cookie.domain) === true && cookies.cookie.name === 'sessionid') {
        updateProviderLoginState();
    }
});
