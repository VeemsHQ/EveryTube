

(function () {
    function notifyReady() {

        chrome.runtime.sendMessage({
            type: 'UPDATE_THE_PAGE'
        },
            function (response) {
                console.log(">>>>Got from backend: ", response);
                // if (response.type == 'HISTORY_DATA') {
                //     chrome.runtime.sendMessage({ message: "poke" })
                // }
                var contents = document.getElementById('contents');
                // console.log('contents');
                // console.log(contents);
                // contents.style.background = "blue";
                var parent = contents.querySelector("#child");
                console.log(parent);
                var newElement = `
                <div id="external-content" style="display:flex">

                <div id="" class="richard style-scope ytd-grid-video-renderer" style="margin-right: 4px;
            display: inline-block !important;
            width: 210px;
            margin-bottom: 24px;">

                    <a id="thumbnail" style="height:160px"class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" aria-hidden="true"
                        tabindex="-1" rel="null" href="https://bitchute.com/?videolink">
                        <img id="img" style="height:100%"class="style-scope yt-img-shadow" alt="" width="210"
                            src="https://i.ytimg.com/vi/-eG0ie7tJNg/hqdefault.jpg">


                        <div id="overlays" class="style-scope ytd-thumbnail" style="display:block; position:relative">
                            <span class="style-scope ytd-thumbnail-overlay-time-status-renderer" aria-label="11 minutes, 4 seconds"
                                style="position: absolute; bottom: 0; right: 0; height: 12px; margin: 4px; padding: 3px 4px; background: #000; letter-spacing: 0.5px; color: #fff;border-radius: 2px;">
                                22:29
                            </span>
                            <span class="style-scope ytd-thumbnail-overlay-time-status-renderer" aria-label="11 minutes, 4 seconds"
                                style="position: absolute; bottom: 0; left: 0;margin: 4px; padding: 3px 4px; background: #EF4137; letter-spacing: 0.5px; color: #fff;border-radius: 2px;">
                                BitChute
                            </span>
                        </div>

                    </a>
                    <div id="details" class="style-scope ytd-grid-video-renderer">
                        <div id="meta" class="style-scope ytd-grid-video-renderer">
                            <h3 class="style-scope ytd-grid-video-renderer">
                                <a id="video-title" class="yt-simple-endpoint style-scope ytd-grid-video-renderer"
                                    aria-label="Jason Blaha Q&amp;As September 6th 2020 Part 2 by Jason Blaha's Strength and Fitness 3 hours ago 11 minutes, 19 seconds 7474 views"
                                    title="Jason Blaha Q&amp;As September 6th 2020 Part 2"
                                    href="https://bitchute.com/?videolink">Wild
                                    Theories Emerge As Video Shows Strange Vehicles Near Murdered Trump Supporter, Its NOT
                                    Helpin..</a>
                            </h3>
                            <div id="metadata-container" class="grid style-scope ytd-grid-video-renderer" meta-block="">
                                <div id="metadata" class="style-scope ytd-grid-video-renderer">
                                    <div id="byline-container" class="style-scope ytd-grid-video-renderer">

                                        <div id="container" class="style-scope ytd-channel-name">
                                            <div id="text-container" class="style-scope ytd-channel-name">
                                                <div id="text" title="" class="style-scope ytd-channel-name complex-string"
                                                    ellipsis-truncate="" has-link-only_="">
                                                    <a class="yt-simple-endpoint style-scope yt-formatted-string" spellcheck="false"
                                                        href="/user/JuggernautFitnessTV" dir="auto">Tim Pool</a>
                                                </div>
                                            </div>
                                        </div>

                                        <span class="style-scope ytd-badge-supported-renderer"></span>
                                    </div>
                                    <dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer">
                                        <template is="dom-repeat"></template></dom-repeat>

                                </div>
                                <div id="metadata-line" class="style-scope ytd-grid-video-renderer">
                                    <span class="style-scope ytd-grid-video-renderer">7474 views</span>

                                    <span class="style-scope ytd-grid-video-renderer">3 hours ago</span>
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



                <div id="" class="richard style-scope ytd-grid-video-renderer" style="margin-right: 4px;
            display: inline-block !important;
            width: 210px;
            margin-bottom: 24px;">

                    <a id="thumbnail" style="height:160px"class="yt-simple-endpoint inline-block style-scope ytd-thumbnail" aria-hidden="true"
                        tabindex="-1" rel="null" href="https://bitchute.com/?videolink">
                        <img id="img" style="height:100%"class="style-scope yt-img-shadow" alt="" width="210"
                            src="https://i.vimeocdn.com/filter/overlay?src0=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F949646978_1280x960.webp&src1=https%3A%2F%2Ff.vimeocdn.com%2Fimages_v6%2Fshare%2Fplay_icon_overlay.png">


                        <div id="overlays" class="style-scope ytd-thumbnail" style="display:block; position:relative">
                            <span class="style-scope ytd-thumbnail-overlay-time-status-renderer" aria-label="11 minutes, 4 seconds"
                                style="position: absolute; bottom: 0; right: 0; height: 12px; margin: 4px; padding: 3px 4px; background: #000; letter-spacing: 0.5px; color: #fff;border-radius: 2px;">
                                10:18
                            </span>
                            <span class="style-scope ytd-thumbnail-overlay-time-status-renderer" aria-label="11 minutes, 4 seconds"
                                style="position: absolute; bottom: 0; left: 0;margin: 4px; padding: 3px 4px; background: rgb(19,147,205); letter-spacing: 0.5px; color: #fff;border-radius: 2px;">
                                Vimeo
                            </span>
                        </div>

                    </a>
                    <div id="details" class="style-scope ytd-grid-video-renderer">
                        <div id="meta" class="style-scope ytd-grid-video-renderer">
                            <h3 class="style-scope ytd-grid-video-renderer">
                                <a id="video-title" class="yt-simple-endpoint style-scope ytd-grid-video-renderer"
                                    aria-label="Jason Blaha Q&amp;As September 6th 2020 Part 2 by Jason Blaha's Strength and Fitness 3 hours ago 11 minutes, 19 seconds 7474 views"
                                    title="Jason Blaha Q&amp;As September 6th 2020 Part 2"
                                    href="https://bitchute.com/?videolink">Frasier the Sensuous Lion</a>
                            </h3>
                            <div id="metadata-container" class="grid style-scope ytd-grid-video-renderer" meta-block="">
                                <div id="metadata" class="style-scope ytd-grid-video-renderer">
                                    <div id="byline-container" class="style-scope ytd-grid-video-renderer">

                                        <div id="container" class="style-scope ytd-channel-name">
                                            <div id="text-container" class="style-scope ytd-channel-name">
                                                <div id="text" title="" class="style-scope ytd-channel-name complex-string"
                                                    ellipsis-truncate="" has-link-only_="">
                                                    <a class="yt-simple-endpoint style-scope yt-formatted-string" spellcheck="false"
                                                        href="/user/JuggernautFitnessTV" dir="auto">Popular Science</a>
                                                </div>
                                            </div>
                                        </div>

                                        <span class="style-scope ytd-badge-supported-renderer"></span>
                                    </div>
                                    <dom-repeat id="repeat" as="badge" class="style-scope ytd-badge-supported-renderer">
                                        <template is="dom-repeat"></template></dom-repeat>

                                </div>
                                <div id="metadata-line" class="style-scope ytd-grid-video-renderer">
                                    <span class="style-scope ytd-grid-video-renderer">7852 views</span>

                                    <span class="style-scope ytd-grid-video-renderer">3 hours ago</span>
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

            </div>

                `;
                // var newElement = `<div><p>Hello world</p></div>`;
                var div = document.createElement('div');
                div.innerHTML = newElement.trim();
                var parent = document.getElementsByTagName('ytd-grid-renderer')[0]
                var parent = document.getElementById('dismissable').querySelector('#contents')
                parent.prepend(div.firstChild);
            });
    }
    notifyReady();
})();
