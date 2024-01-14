// https://eth-goerli.g.alchemy.com/v2/NGsl9Qas29s3wsXu4kwoHmWMdtAWl6Yb
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/NGsl9Qas29s3wsXu4kwoHmWMdtAWl6Yb",
      accounts: [
        "d87b42287aa0782ec7c75dacd93db07f6edd0e67a06367506dbe06efc5f00380",
      ],
    },
  },
};
