const {
  dateToRfc3339,
  getNewestCollectionItemDate,
  convertHtmlToAbsoluteUrls,
} = require("@11ty/eleventy-plugin-rss");

module.exports = function (eleventyConfig) {
  eleventyConfig.addFilter("dateToRfc3339", dateToRfc3339);
  eleventyConfig.addFilter("getNewestCollectionItemDate", getNewestCollectionItemDate);
  eleventyConfig.addFilter("htmlToAbsoluteUrls", convertHtmlToAbsoluteUrls);
  eleventyConfig.addPassthroughCopy("src/css");

  eleventyConfig.addFilter("readableDate", (date, lang) => {
    const locale = lang === "en" ? "en-US" : "pt-BR";
    return new Date(date).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("htmlDateString", (date) => {
    return new Date(date).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("readingTime", (content, lang) => {
    const words = content.replace(/<[^>]+>/g, "").trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return lang === "en" ? `${minutes} min read` : `${minutes} min de leitura`;
  });

  eleventyConfig.addCollection("postsPt", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").reverse();
  });

  eleventyConfig.addCollection("postsEn", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/en/posts/*.md").reverse();
  });

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").reverse();
  });

  eleventyConfig.addCollection("translationMap", function (collectionApi) {
    const map = {};
    collectionApi.getAll().forEach((item) => {
      if (item.data.translationKey) {
        const key = item.data.translationKey;
        const lang = item.data.lang || "pt";
        if (!map[key]) map[key] = {};
        map[key][lang] = item.url;
      }
    });
    return map;
  });

  return {
    pathPrefix: "/blog/",
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
