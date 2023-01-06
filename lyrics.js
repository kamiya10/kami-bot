const fetch = require("node-fetch").default;

const id = "3543";

(async () => {
  const res = await fetch("https://www.jpmarumaru.com/tw/api/json_JPSongTrack.asp", {
    headers: {
      accept         : "application/json",
      "content-type" : "application/x-www-form-urlencoded; charset=UTF-8",
      Referer        : `https://www.jpmarumaru.com/tw/JPSongPlay-${id}.html`,
    },
    body   : `SongPK=${id}`,
    method : "POST",
  }).catch(console.error);
  const data = await res.json();
  console.log(`​　**${data.Name}** - ${data.Singer}\n`);
  const LyricsYomi = data.LyricsYomi;
  const Translate_zh = data.Translate_zh;
  const kanji = [];
  const ruby = [];
  const second = [];
  const secondend = [];

  for (const i in LyricsYomi) {
    const matches = LyricsYomi[i].matchAll(/<ruby><rb>(.*?)<\/rb><rt>(.*?)<\/rt><\/ruby>/g);
    const rubyReplaceStr = [];
    kanji[i] = LyricsYomi[i];
    ruby[i] = LyricsYomi[i];
    second[i] = convertSecond(data.StartTime[i]);
    secondend[i] = convertSecond(data.EndTime[i]);

    for (const match of matches) {
      let space = "";

      if (match[2].length == 1 || match[1].length == match[2].length)
        space = "";
      else if (Math.abs(match[1].length - match[2].length) % 2)
        space = " ".repeat(Math.abs(match[1].length - match[2].length));
      else
        space = "　".repeat(Math.abs(match[1].length - match[2].length) / 2);

      rubyReplaceStr.push(match[2]);
      kanji[i] = kanji[i].replace(match[0], `${space}${match[1]}${space}`);
      ruby[i] = ruby[i].replace(match[0], `#${match[2]}#`);
    }

    if (rubyReplaceStr.length) {
      ruby[i] = ruby[i].split("#");
      for (const rubyI in ruby[i])
        if (!rubyReplaceStr.includes(ruby[i][rubyI]))
          ruby[i][rubyI] = ruby[i][rubyI].replace(/[ぁ-んァ-ン，。？！：；【】「」『』（）]/g, "　").replace(/\w,."':;!~-/g, " ");
    } else {
      ruby[i] = [""];
    }

    console.log(`${second[i]} -> ${secondend[i]}`);
    console.log(ruby[i].join("").trimEnd());
    console.log(kanji[i].trimEnd());
    console.log(`> ${Translate_zh[i]}`);
    console.log("");
  }
})();


function convertSecond(time) {
  const timearr = time.split(":"); ["04", "23"];

  let second = 0;
  for (let i = 0, n = timearr.length; i < n; i++)
    second += Number(timearr.pop()) * Math.pow(60, i);

  return ~~second;
}