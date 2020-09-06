function isElement(o) {
    return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
            o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
}

function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num) * ((Math.abs(num) / 1000).toFixed(1)) + 'k' : Math.sign(num) * Math.abs(num)
}

function parseVideosBitchute(html_text) {
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
            var base = 'https://www.bitchute.com/';
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
        today: videosPublishedToday,
        yesterday: videosPublishedYesterday,
        thisWeek: videosPublishedThisWeek,
    }
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
        var url = 'https://www.bitchute.com/';
        fetchRetry(url, 0.2, 5, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.text())
            .then((data) => {
                var videos = parseVideosBitchute(data);
                return sendResponse(videos);
            }).catch((err) => {
                console.log(err);
            });
    }
    return true;
});
