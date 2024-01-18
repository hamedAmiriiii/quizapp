import { Container, Error, Loading } from "@components";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/core";
import { useGetGamePlayersQuery, useGetGameQuery } from "@state/api/game";
import { GameRouteProp } from "@navigation/utils/types";
import GamePended from "./Components/GamePended";
import GameStarted from "./Components/GameStarted";
import GameFinished from "./Components/GameFinished";

const Game = () => {
  const { params } = useRoute<GameRouteProp>();
  const { gameId: id } = params;
  const { data: game, isLoading, isError } = useGetGameQuery(id);
  const { data: players } = useGetGamePlayersQuery(id, {
    pollingInterval: 3000,
  });

  console.log(players)

  const [status, setStatus] = useState(game?.status);

  useEffect(() => {
    if (game) {
      setStatus(game.status);
      let remainingTime = 0;
      if (game.status === "before") {
        remainingTime = game.startTime - game.nowTime;
      }
      if (game.status === "start") {
        remainingTime = game.endTime - game.nowTime;
      }
      let Timer = setInterval(() => {
        if (remainingTime > 0) {
          remainingTime -= 1;
        } else {
          clearInterval(Timer);
          if (game.status === "before") {
            setStatus("start");
          }
          if (game.status === "start") {
            setStatus("after");
          }
        }
      }, 1000);
    }
  }, [game]);

  return isLoading ? (
    <Loading />
  ) : isError || !game ? (
    <Error />
  ) : (
    <Container>
      {status == "before" && <GamePended game={game} changeGameStatus={() => setStatus('start')} />}
      {status == "start" && players && (
        <GameStarted players={players} game={game} changeGameStatus={() => setStatus('after')} />
      )}
      {status == "after" && players &&  <GameFinished game={game}  players={players} />}
    </Container>
  );
};

export default Game;
