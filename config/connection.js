const mongoose = require("mongoose");
const { CONNECTION_STRING_HOSTED } = require("../utilities/envUtils");

mongoose
  .connect(CONNECTION_STRING_HOSTED)
  .then((res) => console.log("MongoDB connected"))
  .catch((err) => console.log(err));
