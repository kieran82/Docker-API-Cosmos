const asyncRoute = require("route-async");
const tools = require("../src/func");
const rp = require("request-promise");
const sprintf = require("sprintf-js").sprintf;
const checkUserExistsroute = async (req, res) => {
  try {
    console.log("testing script results: " + req.params.id);
    let options = {
      method: "POST",
      uri: "https://api.veri.fish/v1/checking/user_exists",
      auth: {
        bearer: "2da17b15-1c5c-446c-b39e-1a8d7933f60a"
      },
      form: {
        customer_id:  req.params.id
    },
    };

    rp(options)
      .then(function (body) {
        console.log("users checking result " + body);
        res.send(tools.responseFormat(body, "Success", true, 200));
      })
      .catch(function (err) {
        console.error("users checking result " + err);
        res.send(tools.responseFormat(null, err, false, 400));
      });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    console.error(e);
    res.send(tools.responseFormat(null, e, false, 400));
  }
};

const checkFipExistsroute = async (req, res) => {
  try {
    let opts = {
      method: "POST",
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

    rp(opts)
      .then(function (body) {
        console.log("users checking result " + body);
        res.send(tools.responseFormat(body, "Success", true, 200));
      })
      .catch(function (err) {
        console.error("users checking result " + err);
        res.send(tools.responseFormat(null, err, false, 400));
      });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    console.error(e);
    res.send(tools.responseFormat(null, e, false, 400));
  }
};

const getBlockchainDetailsroute = async (req, res) => {
  try {
    let opts = {
      method: "POST",
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

    rp(opts)
      .then(function (body) {
        console.log("users checking result " + body);
        res.send(tools.responseFormat(body, "Success", true, 200));
      })
      .catch(function (err) {
        console.error("users checking result " + err);
        res.send(tools.responseFormat(null, err, false, 400));
      });
  } catch (e) {
    //this will eventually be handled by your error handling middleware
    console.error(e);
    res.send(tools.responseFormat(null, e, false, 400));
  }
};

exports.checkUserExists = asyncRoute(checkUserExistsroute);
exports.checkFipExists = asyncRoute(checkFipExistsroute);
exports.getBlockchainDetails = asyncRoute(getBlockchainDetailsroute);