var PROVIDER_URLS = {
    'bitchute': 'https://www.bitchute.com',
}
var PROVIDER_DOMAINS = [
    (new URL(PROVIDER_URLS['bitchute'])).host
];
var PROVIDER_LOGIN_STATE_COOKIE = {
    'bitchute': 'sessionid',
}
var PROVIDER_LOGGED_IN = {};

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
        type: 'bitchute_content',
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
        if (cookie) {
            PROVIDER_LOGGED_IN['bitchute'] = true;
        }
    });
}

function loggedInToBitchute() {
    return PROVIDER_LOGGED_IN['bitchute'] === true;
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


chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.type = 'UPDATE_THE_PAGE') {
        updateProviderLoginState();
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
                    return sendResponse(videos);
                }).catch((err) => {
                    console.log(err);
                });
        } else {
            console.log('No providers logged in, doing nothing');
        }
    }
    return true;
});

chrome.cookies.onChanged.addListener(function (cookies) {
    if (PROVIDER_DOMAINS.includes(cookies.cookie.domain) === true && cookies.cookie.name === 'sessionid') {
        updateProviderLoginState();
    }
});
