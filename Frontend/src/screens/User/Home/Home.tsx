import { Container, List, TextTitle } from "@components";
import { useAuth } from "@hooks";
import { HomeGameTopTabOptions } from "@navigation/utils/options";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useGetAllGamesQuery } from "@state/api/game";
import React, { useEffect, useState } from "react";
import { Dimensions, RefreshControl } from "react-native";
import { Box, useToast } from 'native-base';
import GameCard from "../Components/GameCard";
import moment from "jalali-moment";
import { Button, Center, Spinner } from "native-base";

const HomeTopTab = createMaterialTopTabNavigator();
const AllGames = () => {
  const { data: games, isError, isLoading, refetch } = useGetAllGamesQuery(undefined);
  return (
    <List
    isPerformant
      estimatedItemSize={20}
      renderItem={({ item }) => <GameCard game={item} />}
      data={games?.slice(0 , 20)}
      isLoading={isLoading}
      isError={isError}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    />
  );
};



const MyGames = () => {
const toast = useToast();

  const { data: games, isError, isLoading } = useGetAllGamesQuery(undefined);
  const { user } = useAuth();
  let data=games?.filter((game) =>game.players.map((item) => item.user._id).includes(user._id))

  // data?.map((e) => {
  //       if (e.status == "before") {
  //   let timer = e.startTime - e.nowTime;
  //   const timeStart = setInterval(() => {
  //     if (timer > 0) {
  //       timer -= 3;
  //     } else {
  //       toast.show({
  //         render: () => {
  //           return <Box bg="emerald.500" px="2" py="1" rounded="sm" mb={5}>
  //                   عجله کن ، مسابقه شروع شد
  //                 </Box>;
  //         }
  //       })
  //       clearInterval(timeStart);
  //     }
  //   }, 3000)
  //   }
  // }
  // )


  return (
    <List
      isPerformant
      estimatedItemSize={50}
      renderItem={({ item }) => <GameCard game={item} />}
      data={data}
      isLoading={isLoading}
      isError={isError}
    />
  );

};

const Home = () => {
  const { data: games, isLoading } = useGetAllGamesQuery(undefined);
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (games) {
      setTime(games[0].nowTime);
    }
  }, [games]);

  // useEffect(() => {
  //   let Timer = setInterval(() => {
  //     setTime((prev) => prev + 1);
  //   }, 1000);

  //   () => {
  //     clearInterval(Timer);
  //   };
  // }, []);

  return (
    <Container>
      {/* <Center>
        {isLoading ? (
          <Spinner color="snow" size="sm" />
        ) : (
          <TextTitle>{moment.unix(time).format("H : mm : ss")}</TextTitle>
        )}
      </Center> */}
      <HomeTopTab.Navigator
        initialLayout={{ width: Dimensions.get("window").width }}
        initialRouteName="All"
        screenOptions={HomeGameTopTabOptions}
      >
        <HomeTopTab.Screen
          name="All"
          options={{ title: "همه مسابقه ها" }}
          component={AllGames}
        />
        <HomeTopTab.Screen
          options={{ title: "مسابقه های من" }}
          name="Mine"
          component={MyGames}
        />
      </HomeTopTab.Navigator>
    </Container>
  );
};

export default Home;
