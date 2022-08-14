const path = require("path");
const math = require("remark-math");
const katex = require("rehype-katex");

module.exports = {
  title: "柠檬果肉", // 网站标签名称
  // tagline:
  //   "帮助你提升前端开发技能，分享 HTML、CSS、JavaScript、React 和 Vue 等开发实战经验",
  titleDelimiter: "-",
  url: "https://qianwen.vercel.app",
  baseUrl: "/",
  favicon: "https://avatars.githubusercontent.com/u/43574409?s=400&u=f5973781cf424d7cf56d7ff289f132f11ff51718&v=4", // 网站图标
  organizationName: "ningmengguorou", // Usually your GitHub org/user name.
  projectName: "qianwen.vercel.app", // Usually your repo name.
  themeConfig: {
    // announcementBar: {
    //   id: "feature_release", // Any value that will identify this message.
    //   content: `更新<a href='/docs/videos/vue/vue-echarts-doughnut-chart'>《Vue 3.0 + ECharts 实现电影票房自定义环形图教程》配套文本</a>；上线小工具栏目，添加<a href='/docs/tools/glassmorphism-generator'>玻璃特效生成器小工具，点击查看</a>`,
    //   backgroundColor: "#fafbfc", // Defaults to `#fff`.
    //   textColor: "#091E42", // Defaults to `#000`.
    // },
    hideableSidebar: true,
    // docs:{
    //   sidebar:{
    //     hideable: true,
    //   }
    // },
    navbar: {
      title: "柠檬果肉",
      logo: {
        alt: "柠檬果肉",
        src: "https://avatars.githubusercontent.com/u/43574409?s=400&u=f5973781cf424d7cf56d7ff289f132f11ff51718&v=4",
        srcDark: "https://avatars.githubusercontent.com/u/43574409?s=400&u=f5973781cf424d7cf56d7ff289f132f11ff51718&v=4",
      },
      items: [{
          type: "localeDropdown",
          position: "left",
        },
         {
           to: "/",
           label: "首页",
           position: "right",
         },
        {
          to: "docs/all-intro",
          label: "专属学习笔记",
          position: "right",
        },
        {
          label: "小工具",
          position: "right",
          items: [{
              label: "简易的rap参数转ts格式工具",
              to: "https://jack-zhang-coming.github.io/rap-to-ts/",
            },
          ],
        },
      ],
    },
    algolia: {
      apiKey: "fabfb0e9997e101154ed85d64b7b6a3c",
      indexName: "ZXUQIANCN",
      appId: "LIJMO3C9C4",
      contextualSearch: true,
    },
    footer: {
      style: "dark",
      links: [{
          title: "学习",
          items: [{
              label: "w3school 在线教程",
              to: "https://www.w3school.com.cn/index.html",
            },
            {
              label: "JavaScript | MDN",
              to: "https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/random",
            },
            {
              label: "前端学习路线",
              to: "https://objtube.gitee.io/front-end-roadmap/#/",
            },
            {
              label: "使用 State Hook – React",
              to: "https://zh-hans.reactjs.org/docs/hooks-state.html#gatsby-focus-wrapper",
            },
          ],
        },
        {
          title: "社交媒体",
          items: [{
              label: "GitHub",
              href: "https://github.com/qiamw",
            },
            {
              label: "Bilibili 哔哩哔哩",
              href: "https://space.bilibili.com/318627253",
            },
          ],
        },
        {
          title: "友情链接",
          items: [],
        },
      ],
      copyright: `<p>Copyright © ${new Date().getFullYear()} ***** </p>
      <p><a href="http://beian.miit.gov.cn/" style="color: hsl(210deg, 100%, 80%)">冀ICP备*****</a></p>
      <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">
      <img alt="Creative Commons License" style="border-width:0" src="/img/creative-commons-license-icon.png" /></a>
      <br />本站所有内容遵循 <a rel="license" href="https://creativecommons.org/licenses/by-nc/4.0/deed.zh-Hans" 
      style="color: hsl(210deg, 100%, 80%)">CC BY-NC 4.0 协议</a>`,
    },
    prism: {
      theme: require("prism-react-renderer/themes/github"),
      darkTheme: require("prism-react-renderer/themes/oceanicNext"),
      defaultLanguage: "javascript",
    },
    // googleAnalytics: {
    //   trackingID: "UA-118572241-1",
    //   anonymizeIP: true, // Should IPs be anonymized?
    // },
    // gtag: {
    //   trackingID: "G-6PSESJX0BM",
    //   // Optional fields.
    //   anonymizeIP: true, // Should IPs be anonymized?
    // },
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: "https://github.com/qiamw/my-now-blog/blob/main",
          remarkPlugins: [math],
          rehypePlugins: [katex],
          showLastUpdateTime: true,
          // sidebar:{
          //   hideeble:{
              
          //   }
          // }
        },
        blog: {
          path: "./blog",
          routeBasePath: "/",
          blogSidebarTitle: "近期文章",
          remarkPlugins: [math],
          rehypePlugins: [katex],
          feedOptions: {
            type: "all",
            title: "柠檬果肉",
            copyright: `Copyright © ${new Date().getFullYear()}柠檬果肉<p><a href="http://beian.miit.gov.cn/">冀ICP备*****</a></p>`,
          },
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
        sitemap: {
          changefreq: "daily",
          priority: 0.5,
        },
      },
    ],
  ],
  // themes: ["@docusaurus/theme-live-codeblock"],
  plugins: [
    path.resolve(__dirname, "./src/plugin/plugin-baidu-analytics"),
    path.resolve(__dirname, "./src/plugin/plugin-baidu-push"),
    // "@docusaurus/plugin-ideal-image",
    path.resolve(__dirname, "./src/plugin/plugin-google-adsense"),
    path.resolve(__dirname, "./src/plugin/plugin-onesignal-push"),
    "docusaurus2-dotenv",
    [
      "@docusaurus/plugin-content-blog",
      {
        id: "lifestyle-blog",
        routeBasePath: "lifestyle",
        path: "./lifestyle",
        feedOptions: {
          type: "all",
          title: "柠檬果肉",
          copyright: `Copyright © ${new Date().getFullYear()} 柠檬果肉<p><a href="http://beian.miit.gov.cn/">冀ICP备*****</a></p>`,
        },
      },
    ],
    // [
    //   "@easyops-cn/docusaurus-search-local",
    //   {
    //     hashed: true,
    //     // indexPages: true,
    //     blogRouteBasePath: "/",
    //     language: ["en", "zh"],
    //   },
    // ],
  ],
  stylesheets: [{
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      type: "text/css",
    },
    {
      href: "/katex/katex.min.css",
      type: "text/css",
      integrity: "sha384-AfEj0r4/OFrOo5t7NnNe46zW/tFgW6x/bCJG8FqQCEo3+Aro6EYUG4+cU+KJWu/X",
      crossorigin: "anonymous",
    },
    {
      href: "https://fonts.font.im/css?family=Raleway:500,700&display=swap",
      type: "text/css",
      rel: "stylesheet",
    },
    // {
    //   href: "https://fonts.googleapis.com/css2?family=Fira+Code&display=swap",
    //   type: "text/css",
    //   rel: "stylesheet",
    // },
  ],
  i18n: {
    defaultLocale: "zh-CN",
    locales: ["zh-CN"],
    // locales: ["zh-CN", "en"],
    localeConfigs: {
      "zh-CN": {
        label: "中文",
      },
      en: {
        label: "English",
      },
    },
  },
};
