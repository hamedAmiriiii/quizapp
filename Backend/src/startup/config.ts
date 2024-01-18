export default () => {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("privateKey not provided");
  }
};
