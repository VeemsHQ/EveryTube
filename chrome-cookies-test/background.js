
console.log("ok ");

function isElement(o){
    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
  );
  }

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    var __cfduid;
    var csrftoken;
    var sessionid;
    if (msg.type = 'UPDATE_THE_PAGE') {
        // chrome.cookies.getAll({ url: 'https://www.bitchute.com', name: "csrftoken" }, function (cookies) {
        //     csrftoken = cookies[0].value;
        // });
        // chrome.cookies.getAll({ url: 'https://www.bitchute.com', name: "__cfduid" }, function (cookies) {
        //     __cfduid = cookies[0].value;
        // });
        // chrome.cookies.getAll({ url: 'https://www.bitchute.com', name: "sessionid" }, function (cookies) {
        //     sessionid = cookies[0].value;
        // });
        sendResponse('replyyyyy');
        var url = 'https://www.bitchute.com/';
        var subs = []
        fetch(url, {
            method: 'GET',
            credentials: 'include'
        })
            .then(response => response.text())
            .then((data) => {
                var parser = new DOMParser();
                var htmlDoc = parser.parseFromString(data, 'text/html');
                var subs = htmlDoc.getElementById('listing-subscribed');
                var videoEls = subs.querySelectorAll('.video-card');
                var subs = []
                for (var videoEl in videoEls) {
                    var el = videoEls[videoEl];
                    if (isElement(el) == true) {
                        var videoLink = 'https://www.bitchute.com' + el.querySelector('a').getAttribute('href');
                        var thumbUrl = el.querySelector('img').getAttribute('data-src');
                        var videoTitle = el.querySelector('.video-card-title a').innerText;
                        var channelTitle = el.querySelector('.video-card-channel a').innerText;
                        var videoDuration = el.querySelector('.video-duration').innerText;
                        var videoViews = parseInt(el.querySelector('.video-views').innerText.trim());
                        var video = {
                            'videoLink': videoLink,
                            'thumbUrl': thumbUrl,
                            'videoTitle': videoTitle,
                            'channelTitle': channelTitle,
                            'videoDuration': videoDuration,
                            'videoViews': videoViews,
                        }
                        subs.push(video);
                    }
                }
                // debugger;
                console.log('>>');
                sendResponse('replyyyyy');
                // sendResponse({ message: subs });
            }).catch((err) => {
                console.log(err);
            });

        // xhr.open("GET", url, true);

        // xhr.onreadystatechange = function () {
        //     console.log(xhr);
        //     if (xhr.readyState == 4) {
        //         var parser = new DOMParser();
        //         var htmlDoc = parser.parseFromString(xhr.responseText, 'text/html');
        //         var subs = htmlDoc.getElementById('listing-subscribed');
        //         var videoEls = subs.querySelectorAll('video-card');;
        //         var subs = []
        //         for(var videoEl in videoEls) {
        //             var el = videoEls[videoEl];
        //             var videoLink = 'https://www.bitchute.com' + el.querySelector('a').getAttribute('href');
        //             var thumbUrl = el.querySelector('img').getAttribute('data-src');
        //             var videoTitle = el.querySelector('video-card-title');
        //             debugger;
        //         }
        //     }
        // }
        // xhr.send();
    }
});



document.addEventListener('DOMContentLoaded', function () {

});
