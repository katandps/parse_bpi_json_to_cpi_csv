"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P ? value : new P(function (resolve) {
                    resolve(value);
                }
            );
        }

        return new (P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) {
                    try {
                        step(generator.next(value));
                    } catch (e) {
                        reject(e);
                    }
                }

                function rejected(value) {
                    try {
                        step(generator["throw"](value));
                    } catch (e) {
                        reject(e);
                    }
                }

                function step(result) {
                    result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
                }

                step((generator = generator.apply(thisArg, _arguments || [])).next());
            }
        );
    }
;
var main = class Main {
        constructor() {
            this.mode = 0;
            this.getter = new getter();
            this.scraper = new scraper();
            this.result = [];
            this.scrapingView = `
  <div style="text-align:center;display:flex;justify-content:center;align-items:center;flex-direction:column;height:100vh;" id="bpim-loading-view">
    <div class="loader">Loading...</div>
    <h1 style="display:inherit !important;">Now loading...</h1>
    <style>.loader,.loader:after{border-radius:50%;width:10em;height:10em}.loader{margin:60px auto;font-size:10px;position:relative;text-indent:-9999em;border-top:1.1em solid rgba(0,0,0,.2);border-right:1.1em solid rgba(0,0,0,.2);border-bottom:1.1em solid rgba(0,0,0,.2);border-left:1.1em solid #000;-webkit-transform:translateZ(0);-ms-transform:translateZ(0);transform:translateZ(0);-webkit-animation:load8 1.1s infinite linear;animation:load8 1.1s infinite linear}@-webkit-keyframes load8{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes load8{0%{-webkit-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}</style>
  </div>`;
            this.scrapedView = `
  <div style="text-align:center;display:flex;justify-content:center;align-items:center;flex-direction:column;height:100vh;" id="bpim-completed-view">
    <div class="check icon"></div>
    <h1 style="display:inherit !important;margin-bottom:15px">Completed!</h1>
    <p>下記フォームの内容をコピーし、BPIManagerの取り込みページに貼り付けてください。</p>
    <p><a href="https://bpi.poyashi.me/data">取り込みページへ移動</a></p>
    <style>.check.icon{color:#000;margin-left:3px;margin-top:4px;margin-bottom:25px;width:60px;height:32px;border-bottom:solid 5px currentColor;border-left:solid 5px currentColor;-webkit-transform:rotate(-45deg);transform:rotate(-45deg)}</style>
  </div>`;
            this.wait = (msec) => new Promise((resolve, _reject) => setTimeout(resolve, msec));
        }

        exec() {
            return __awaiter(this, void 0, void 0, function* () {
                if (document.domain.indexOf("eagate.573.jp") === -1) {
                    return alert("対応外のページです。");
                }
                document.body.innerHTML = this.scrapingView;
                console.log("v0.0.1");
                for (let i = 0; i < 2; ++i) {
                    for (let j = 0; j < 8; ++j) {
                        this.getter.setDiff(i === 0 ? 10 : 11).setOffset(j);
                        const body = yield this.getter.get();
                        const b = this.scraper.setRawBody(body).exec();
                        this.result = this.result.concat(b);
                    }
                }
                var input = document.createElement("textarea");
                input.id = "bpimResult";
                input.value = JSON.stringify(this.result);
                input.style.width = "60%";
                input.style.maxHeight = "250px";
                input.style.margin = "10px 0";
                input.style.padding = "5px";
                input.style.border = "1px solid #ccc";
                input.rows = 6;
                input.readOnly = true;
                document.body.innerHTML = this.scrapedView;
                var completedView = document.getElementById("bpim-completed-view");
                if (completedView)
                    completedView.appendChild(input);
                var copyText = document.querySelector("#bpimResult");
                copyText.select();
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(JSON.stringify(this.result));
                }
                console.log(this.result);
            });
        }
    }
;
var getter = class Getter {
        constructor() {
            this.diff = 11;
            this.offset = 0;
        }

        setDiff(val) {
            this.diff = val;
            return this;
        }

        setOffset(val) {
            this.offset = (val) * 50;
            return this;
        }

        parseBlob(blob) {
            return new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        resolve(reader.result);
                    }
                    ;
                    reader.readAsText(blob, 'shift-jis');
                }
            );
        }

        get() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const res = yield fetch(`https://p.eagate.573.jp/game/2dx/27/djdata/music/difficulty.html?difficult=${this.diff}&style=0&disp=1&offset=${this.offset}`, {
                        method: "GET",
                        credentials: "same-origin",
                    });
                    if (!res.ok || res.status !== 200) {
                        throw new Error(`statuscode:${res.status}`);
                    }
                    const text = (yield this.parseBlob(yield res.blob()));
                    return text;
                } catch (e) {
                    console.log(e);
                    alert("error!");
                }
            });
        }
    }
;
var scraper = class Scraper {
        constructor() {
            this.rawBody = "";
        }

        setRawBody(input) {
            this.rawBody = input;
            return this;
        }

        exec() {
            this.getTable();
            return this.getEachSongs();
        }

        getTable() {
            const matcher = this.rawBody.match(/<div class="series-difficulty">.*?<div id="page-top">/);
            this.setRawBody((!matcher || matcher.length === 0) ? "" : matcher[0]);
            return this;
        }

        detectClearState(input) {
            try {
                const num = input.match(/clflg.*?\.gif/);
                if (!num) {
                    return 7;
                }
                const n = num[0].replace(/clflg|\.gif/g, "");
                return n === "0" ? 7 : Number(n) - 1;
            } catch (e) {
                return 7;
            }
        }

        getEachSongs() {
            if (!this.rawBody) {
                return [];
            }
            let res = [];
            const matcher = this.rawBody.match(/<tr>.*?<\/tr>/g);
            if (!matcher) {
                return [];
            }
            for (let key in matcher) {
                const eachSong = matcher[key];
                const _matcher = eachSong.match(/(<td>).*?(<\/td>)/g);
                const tableRemove = (input) => input.replace(/(<td>|<\/td>)/g, "");
                if (_matcher) {
                    const songName = tableRemove(_matcher[0]).match(/(\"music_win\">).*?(<\/a>)/);
                    if (songName) {
                        const score = tableRemove(_matcher[3]).split(/<br>/);
                        res.push({
                            "title": songName[0].replace(/\"music_win\">|<\/a>/g, ""),
                            "difficulty": tableRemove(_matcher[1]).toLowerCase(),
                            "clear": this.detectClearState(tableRemove(_matcher[4])),
                            "score": Number(score[0]),
                        });
                    }
                }
            }
            return res;
        }
    }
;
new main().exec();
