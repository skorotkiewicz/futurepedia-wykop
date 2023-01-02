import * as dotenv from "dotenv";
dotenv.config({ path: process.cwd() + "/.env" });
import fetch from "node-fetch";
import Database from "better-sqlite3";
import Wykop from "wykop-nodejs";

const db = new Database(process.cwd() + "/cache.db");

(async () => {
  await db.exec(`CREATE TABLE IF NOT EXISTS tools (
    id     INTEGER PRIMARY KEY,
    toolName TEXT
   );
   `);
})();

const Posts = async (data) => {
  let post = "";
  let postsCount = 0;
  let posts = [];
  const json = JSON.parse(data);
  const tools = json.props.pageProps.todayTools;

  for (let i = 0; i < tools.length; i++) {
    const tool = tools[i];
    const toolName = tool.toolName.trim();
    const row = db
      .prepare("SELECT * FROM tools WHERE toolName = ?")
      .get(toolName);
    if (!row) {
      const stmt = db.prepare("INSERT INTO tools (toolName) VALUES (?)");
      stmt.run(toolName);
      postsCount++;
      posts.push(tool);
    }
  }

  post += `Chciałabym Wam przedstawić ${
    postsCount > 1 ? "kilka niesamowitych nowych" : "nowe"
  } AI, które z pewnością Was ${
    postsCount > 1 ? "zainteresują" : "zainteresuje"
  }!`;

  for (let id = 0; id < posts.length; id++) {
    const tool = posts[id];
    const toolName = tool.toolName.trim();
    const websiteUrl = tool.websiteUrl.replace("?ref=futurepedia", " ");
    post += `${
      postsCount > 1
        ? id === 0
          ? "\n\nPierwsze z nich"
          : id !== 0 && id !== postsCount - 1
          ? "\n\nKolejne AI, o którym chciałabym Wam opowiedzieć"
          : id === postsCount - 1
          ? "\n\nOstatnie AI, o którym chciałabym Wam powiedzieć,"
          : ""
        : "\n\nJest"
    } to ${toolName}, ${
      tool.toolDescription
    } \nWięcej o ${toolName} możecie dowiedzieć się pod adresem: ${websiteUrl}\nLicencja: ${tool.features.join(
      ", "
    )}`;
  }

  post += `\n\nMam nadzieję, że ${
    postsCount > 1 ? "te nowe AI przykują" : "nowe AI przykuje"
  } Waszą uwagę tak samo jak mnie!

Pozdrawiam,
CheckURL

#futurepedia
`;

  if (postsCount !== 0) return post;
};

const getData = async () => {
  const response = await fetch("https://www.futurepedia.io/leaderboard");
  const html = await response.text();

  const regex = /<script[^>]*id="__NEXT_DATA__"[^>]*>([^<]*)<\/script>/;
  let found;

  if ((found = regex.exec(html)) !== null) {
    found = found[1];
  }

  const result = await Posts(found);
  result && postWykop(result);
};

const postWykop = (body) => {
  const API = new Wykop({
    appKey: process.env.APPKEY,
    appSecret: process.env.SECRET,
  });

  API.request({
    requestMethod: "POST",
    urlParams: ["Login", "Index"],
    postParams: {
      accountkey: process.env.ACCOUNTKEY,
    },
  })
    .then(() => {
      API.request({
        requestMethod: "POST",
        urlParams: ["Entries", "Add"],
        postParams: {
          body,
        },
      })
        .then((res) => console.log(res))
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

getData();
