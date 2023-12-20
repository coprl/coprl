module.exports = [
  {
    entry: ["./assets/js/app.js"],
    output: {
      filename: "../../../public/bundle.js",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader",
        },
      ],
    },
  },
  {
    entry: ["./assets/js/wc.js"],
    output: {
      filename: "../../../public/wc.js",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: "babel-loader",
        },
      ],
    },
  },
];
