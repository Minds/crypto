module.exports = {
  networks: {
    test: {
      host: "localhost",
      port: 9545,
      network_id: "*" // Match any network id,
    },
    development: {
      host: "localhost",
      port: 7545,
      network_id: "*" // Match any network id,
    },
    rinkeby: {
      host: "localhost", // Connect to geth on the specified
      port: 8545,
      from: "0xbcd663a8bd5b8207685cadce3203979aeb7fb725", // default address to use for any transaction Truffle makes during migrations
      network_id: 4,
      gas: 4612388 // Gas limit used for deploys
    }
  }
};
