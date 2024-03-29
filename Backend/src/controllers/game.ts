import { Request, Response } from "express";
import { Types } from "mongoose";
import { faker } from "@faker-js/faker/locale/fa";
import _, { random, round } from "lodash";
import moment from "jalali-moment";
import Game from "../models/Game";
import { IMAGES } from "../images";
import User from "../models/User";
import { createPassword } from "../utils/password";
import Question from "../models/Question";
import Avatar from "../models/Avatar";
import { generateAnswerString, isCorrect } from "../utils/generateAnswerString";

export const seedGames = async (req: Request, res: Response) => {
  await Game.remove();
  await User.remove();
  await Question.remove();
  await Avatar.remove();

  for (let i = 0; i < 20; i++) {
    const image = faker.image.avatar();
    await Avatar.create({
      url: image,
    });
  }

  const avatars = await Avatar.find();

  for (let i = 0; i < 200; i++) {
    await User.create({
      name: faker.name.fullName(),
      phone: faker.phone.number("0913#######"),
      point: _.random(0, 500),
      avatar: _.sample(avatars.map((item) => item._id)),
      username: "User " + (i + 1),
      password: await createPassword("123456789"),
    });
  }

  for (let i = 0; i < 200; i++) {
    await Question.create({
      body: faker.lorem.sentences(_.random(1, 3)),
      option1: faker.word.noun({ length: _.random(3, 8) }),
      option2: faker.word.noun({ length: _.random(3, 8) }),
      option3: faker.word.noun({ length: _.random(3, 8) }),
      option4: faker.word.noun({ length: _.random(3, 8) }),
      questionId: generateAnswerString(_.random(1, 4)),
    });
  }

  const users = await User.find();
  const questions = await Question.find();

  for (let i = 0; i < 15; i++) {
    const startTime = moment().unix() + random(500, 10000);
    const endTime = startTime + 60;

    const players = [];
    for (let j = _.random(1, 50); j < _.random(55, 200); j++) {
      players.push({ user: users[j]._id, point: 0, isUp: false });
    }

    const qs = [];
    for (let j = 0; j < 10; j++) {
      qs.push(questions[j + _.random(1, 150)]);
    }

    await Game.create({
      type: _.sample([50000, 100000, 200000, 500000]),
      startTime,
      endTime,
      image: _.sample(IMAGES),
      players,
      status: "before",
      questions: qs,
    });
  }

  res.status(200).json("done");
};

export const getAllGames = async (req: Request, res: Response) => {
  const games = await Game.find().populate("players.user");
  const currentGames = games
    .filter((game) => game.endTime > moment().unix())
    .map((game) => ({ ...game.toObject(), nowTime: moment().unix() }));

  res.status(200).json(currentGames);
};

export const getGame = async (req: Request, res: Response) => {
  const { id } = req.params;
  const game = await Game.findOne({ _id: id });
  res.status(200).json({ ...game.toObject(), nowTime: moment().unix() });
};

export const gamePlayerList = async (req: Request, res: Response) => {
  const { id } = req.params;
  const game = await Game.findOne({ _id: id });
  if (game.endTime > moment().unix() && game.players[0].rank == 0) {
    const sorted = game.players.sort((a, b) => b.point - a.point);
    const totalPrize = game.players.length * game.type;
    const first = sorted[0];
    const second = sorted[1];
    const third = sorted[2];

    if (game.players.length <= 4) {
      await User.findOneAndUpdate(
        { _id: first.user },
        { $inc: { coin: round(totalPrize * 0.8) } }
      );
      await Game.updateOne(
        { "players.user": first._id },
        {
          $set: {
            "players.$.rank": 1,
            "player.$.prize": round(totalPrize * 0.8),
          },
        }
      );
    } else if (game.players.length > 4 && game.players.length <= 8) {
      // 60% first , 20% second
      await User.findOneAndUpdate(
        { _id: first.user },
        { $inc: { coin: round(totalPrize * 0.6) } }
      );
      await User.findOneAndUpdate(
        { _id: second.user },
        { $inc: { coin: round(totalPrize * 0.2) } }
      );
      await Game.updateOne(
        { "players.user": first._id },
        {
          $set: {
            "players.$.rank": 1,
            "player.$.prize": round(totalPrize * 0.6),
          },
        }
      );
      await Game.updateOne(
        { "players.user": second._id },
        {
          $set: {
            "players.$.rank": 2,
            "player.$.prize": round(totalPrize * 0.2),
          },
        }
      );
    } else {
      // 50% first , 20% second , 10% third

      await User.findOneAndUpdate(
        { _id: first.user },
        { $inc: { coin: round(totalPrize * 0.5) } }
      );
      await User.findOneAndUpdate(
        { _id: second.user },
        { $inc: { coin: round(totalPrize * 0.2) } }
      );
      await User.findOneAndUpdate(
        { _id: third.user },
        { $inc: { coin: round(totalPrize * 0.1) } }
      );
      await Game.updateOne(
        { "players.user": first._id },
        {
          $set: {
            "players.$.rank": 1,
            "player.$.prize": round(totalPrize * 0.5),
          },
        }
      );
      await Game.updateOne(
        { "players.user": second._id },
        {
          $set: {
            "players.$.rank": 2,
            "player.$.prize": round(totalPrize * 0.2),
          },
        }
      );
      await Game.updateOne(
        { "players.user": third._id },
        {
          $set: {
            "players.$.rank": 3,
            "player.$.prize": round(totalPrize * 0.1),
          },
        }
      );
    }
  }

  const gameFinished = game.endTime < moment().unix()


  res.status(gameFinished ? 201 : 200).json(game.players)
};

export const startGame = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { playerId } = req.body;

  await Game.updateOne(
    { "players.user": playerId },
    { $set: { status: "in" } }
  );

  const game = await Game.findOne({ _id: id }).populate("questions");
  res.status(200).json(game.questions[0]);
};

export const answerQuestion = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { playerId, qId, answer } = req.body;
  

  const game = await Game.findOne({ _id: id }).populate("questions");
  const player = game.players.find(item => item.user._id == playerId)

  if (!answer) {
    if (game.endTime >= moment().unix()) {
      
      await Game.updateOne(
    
        { _id: id , "players.user": playerId },
        {
          $set: {
            "players.$.status": 'in',
          },
        }
      );

      res.status(200).json(game.questions[player.lastQIndex]);
    } else {
      
      await Game.updateOne(
        {_id: id, "players.user": playerId },
        {
          $set: {
            "players.$.status": 'done'
          },
        }
      );
      res.status(200).json('Done');
    }

  } else {
    

    if (game.endTime >= moment().unix()) {
      const currentQIndex = game.questions.findIndex((item) => item._id == qId);
      const nextQ = game.questions[currentQIndex + 1];
      const isItCorrect = await isCorrect(qId, answer);
      


      await Game.updateOne(
    
        { _id: id , "players.user": playerId },
        {
          $set: {
            "players.$.lastQIndex": currentQIndex + 1 
          },
        }
      );


      



      if (isItCorrect) {
        
        await Game.updateOne(
          { _id: id , "players.user": playerId },
          {
            $set: {
              "players.$.point": player.point + 5,
              "players.$.isUp": true
            },
          }
        );
      } else {
        await Game.updateOne(
          { _id: id , "players.user": playerId },
          {
            $set: { "players.$.isUp": false },
          }
        );
      }

      if (currentQIndex + 1 === game.questions.length) {
        await Game.updateOne(
          { _id: id , "players.user": playerId },
          {
            $set: {
              "players.$.status": 'done'
            },
          }
        );
        res.status(200).json('Done');
      } else {

        res.status(200).json(nextQ);
      }


    } else {
      res.status(400).json({ error: "زمان مسابقه به پایان رسیده است" });
    }
  }
};

export const changeGameStatus = async (req: Request, res: Response) => {
  const { gameId, status, playerId } = req.body;

  await Game.updateOne(
    { "players._id": playerId },
    {
      $set: { "players.$.status": status == "start" ? "in" : "done" },
    }
  );

  const game = await Game.findOneAndUpdate(
    { _id: gameId },
    {
      $set: { status },
    },
    { new: true }
  );

  res.status(200).json(game);
};

export const registerGame = async (req: Request, res: Response) => {
  const { userId, gameId } = req.body;

  const game = await Game.findOne({ _id: gameId });
  const user = await User.findOne({ _id: userId });



  if (user.coin >= game.type) {
    if (game.startTime > moment().unix()) {
      if (
        game.players
          .map((item) => item.user)
          .includes(userId as Types.ObjectId)
      ) {
        await Game.updateOne(
          { _id: gameId },
          {
            $pull: { "players.user": userId },
          },
          { new: true }
        );
        await User.updateOne(
          { _id: userId },
          {
            $inc: { coin: game.type },
          },
          { new: true }
        );
      } else {
        await Game.updateOne(
          { _id: gameId },
          {
            $push: {
              players: {
                user: userId,
                point: 0,
                isUp: false,
                rank: 0,
                prize: 0,
                status: "wait",
              },
            },
          },
          { new: true }
        );
        await User.updateOne(
          { _id: userId },
          {
            $inc: { coin: -game.type },
          },
          { new: true }
        );
      }

      res.status(200).json(game);
    } else {
      res.status(400).json({ error: "زمان ثبت نام گذشته است" });
    }
  } else {
    res.status(400).json({ error: "موجودی کافی نیست" });
  }
};
