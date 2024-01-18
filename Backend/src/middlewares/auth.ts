import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send("Authentication Error");
  }
  try {
    jwt.verify(token, process.env.PRIVATE_KEY);
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};

export default verifyAuthToken;
