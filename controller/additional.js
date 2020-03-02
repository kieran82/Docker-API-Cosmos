const asyncRoute = require("route-async");
const request = require("request");
const rp = require("request-promise");
const sprintf = require("sprintf-js").sprintf;
const urlRequest = option => {
  return new Promise((resolve, reject) => {
    request.post(option, function(error, response, data) {
      if (error) reject(error);

      let content = JSON.parse(data);
      resolve(content);
    });
  });
};

const checkUserExistsroute = async (req, res) => {
  try {
    console.log("testing script results: " + req.params.id);
    let current_url = sprintf(
      "https://login.veri.fish/Api/public/v1/validate/exists/user/%s",
      req.params.id
    );
    let options = {
      uri: current_url,
      auth: {
        bearer: "2da17b15-1c5c-446c-b39e-1a8d7933f60a"
      }
    };

    rp(options)
      .then(function(body) {
        console.log("users checking result " + body);
        res.send(body);
      })
      .catch(function(err) {
        console.error("users checking result " + err);
        res.status(404).json({
          message: err
        });
      });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    console.error(e);
    res.status(404).json({
      message: e
    });
  }
};

const checkFipExistsroute = async (req, res) => {
  try {
    let opts = {
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      url: sprintf(
        "https://login.veri.fish/Api/public/v1/product/fip/exists/%s",
        req.params.id
      ),
      auth: {
        bearer: "2da17b15-1c5c-446c-b39e-1a8d7933f60a"
      }
    };

    urlRequest(opts)
      .then(function(body) {
        console.log("users checking result " + body);
        res.send(body);
      })
      .catch(function(err) {
        console.error(err);
        res.statusMessage = err;
        res.status(404).end();
      });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    console.error(e);
    res.status(404).json({
      message: e
    });
  }
};

const getBlockchainDetailsroute = async (req, res) => {
  try {
    let opts = {
      headers: {
        "content-type": "application/x-www-form-urlencoded"
      },
      url: sprintf(
        "https://login.veri.fish/Api/public/v1/request/details/blockchain/%s/%s",
        req.params.user_ref,
        req.params.key_ref
      ),
      auth: {
        bearer: "2da17b15-1c5c-446c-b39e-1a8d7933f60a"
      }
    };

    urlRequest(opts)
      .then(function(body) {
        console.log(
          "blockchain user reference " + req.params.user_ref + ", exists"
        );
        res.send(JSON.stringify(body));
      })
      .catch(function(err) {
        console.error(err);
        res.statusMessage = err;
        res.status(404).end();
      });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    console.error(e);
    res.status(404).json({
      message: e
    });
  }
};

exports.checkUserExists = asyncRoute(checkUserExistsroute);
exports.checkFipExists = asyncRoute(checkFipExistsroute);
exports.getBlockchainDetails = asyncRoute(getBlockchainDetailsroute);
