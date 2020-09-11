
var bitchuteVideoTmpl = `
<div class="inserted-video style-scope ytd-grid-video-renderer">

    <a id="thumbnail" class="yt-simple-endpoint inline-block style-scope ytd-thumbnail"
        aria-hidden="true" tabindex="-1" rel="null" href="{videoLink}" target="_blank">
        <img id="img" style="height:100%" class="style-scope yt-img-shadow" alt="" width="210" src="{thumbUrl}">

        <div id="overlays" class="style-scope ytd-thumbnail" style="display:block; position:relative">
            <span class="style-scope video-duration ytd-thumbnail-overlay-time-status-renderer">
                {videoDuration}
            </span>
            <span class="style-scope ytd-thumbnail-overlay-time-status-renderer bitchute">
            BitChute
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

function supplant (string, o) {
    return string.replace(/{([^{}]*)}/g,
        function (a, b) {
            var r = o[b];
            return typeof r === 'string' || typeof r === 'number' ? r : a;
        }
    );
};

function addBitchuteContent(externalSubscriptions) {
    var todayVideos = externalSubscriptions.today;
    var newHtml = '<div class="external-content">';
    for(var idx in todayVideos) {
        var videoHtml = supplant(bitchuteVideoTmpl, todayVideos[idx]);
        newHtml = newHtml + videoHtml;
    }
    newHtml = newHtml + '</div>';
    var div = document.createElement('div');
    div.innerHTML = newHtml.trim();
    var parent = document.getElementsByTagName('ytd-grid-renderer')[0];
    parent.prepend(div.firstChild);

    var yesterdayVideos = externalSubscriptions.yesterday;
    var newHtml = '<div class="external-content">';
    for(var idx in yesterdayVideos) {
        var videoHtml = supplant(bitchuteVideoTmpl, yesterdayVideos[idx]);
        newHtml = newHtml + videoHtml;
    }
    newHtml = newHtml + '</div>';
    var div = document.createElement('div');
    div.innerHTML = newHtml.trim();
    var parent = document.getElementsByTagName('ytd-grid-renderer')[1];
    parent.prepend(div.firstChild);

    var thisWeekVideos = externalSubscriptions.thisWeek;
    var newHtml = '<div class="external-content">';
    for(var idx in thisWeekVideos) {
        var videoHtml = supplant(bitchuteVideoTmpl, thisWeekVideos[idx]);
        newHtml = newHtml + videoHtml;
    }
    newHtml = newHtml + '</div>';
    var div = document.createElement('div');
    div.innerHTML = newHtml.trim();
    var parent = document.getElementsByTagName('ytd-grid-renderer')[2];
    parent.prepend(div.firstChild);
}

(function () {
    function addExternalSubscriptionVideos() {

        chrome.runtime.sendMessage({
            type: 'UPDATE_THE_PAGE'
        },
            function (externalSubscriptions) {
                console.log(externalSubscriptions)
                if(externalSubscriptions.type === 'bitchute_content') {
                    addBitchuteContent(externalSubscriptions);
                } else if (externalSubscriptions.type === null) {
                    alert('none');
                }
            });
    }
    addExternalSubscriptionVideos();
})();
