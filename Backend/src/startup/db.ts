import mongoose from "mongoose";

export default () => {
  mongoose.set("strictQuery", false);
  // mongoose.set("debug", true);
  mongoose
    .connect(
      "mongodb://root:K2gR22c2UHX5LwajoPYeJyl2@finn.iran.liara.ir:30960/my-app?authSource=admin"
    )
    
    .then(() => console.log("DB Connected"))
    .catch((err) => console.log(err));
};
