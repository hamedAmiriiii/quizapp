import {
  Card,
  Column,
  ConfirmationModal,
  Image,
  Row,
  RowBetween,
  TextNormal,
  TextTitle,
  Touch,
} from "@components";
import {
  UserScreenNavigationProp,
  UserStackParamList,
} from "@navigation/utils/types";
import { useNavigation } from "@react-navigation/core";
import { GameInterface } from "@types";
import moment from "jalali-moment";
import {
  AlertDialog,
  Avatar,
  Box,
  Button,
  Center,
  Text,
  View,
} from "native-base";
import React, { useEffect, useRef, useState } from "react";
import AvatarGroup from "./PlayersAvatarGroup";
import PlayersAvatarGroup from "./PlayersAvatarGroup";
import { useAuth, useModal, useToast } from "@hooks";
import { useRegisterUserInGameMutation } from "@state/api/game";
import { useRefreshTokenMutation } from "@state/api/auth";
import { theme } from "@utils";


type Props = {
  game: GameInterface;
};

const QuizEntranceCard = ({ game }: Props) => {
  const { navigate } = useNavigation<UserScreenNavigationProp>();
  const [
    registerUser,
    {
      isLoading: registerloading,
      isError: registerError,
      isSuccess: registerSuccess,
      error,
    },
  ] = useRegisterUserInGameMutation();
  const { user, checkInitailAuth } = useAuth();
  const cancelRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const { showError } = useToast();

  const playerisInGame = game.players.map((player) => player.user._id).includes(user._id)

  function checkUserRegisteration() {
    if (playerisInGame) {
      navigate("Game", { gameId: game._id });
    } else {
      setIsOpen(true);
    }
  }

  useEffect(() => {
    if (registerSuccess) {
      setIsOpen(false);
      navigate("Game", { gameId: game._id });
    }
    if (registerError) {
      setIsOpen(false);
      //@ts-ignore
      showError(error.data.error);
    }
  }, [registerError, registerSuccess]);

  return (
    <>
      <Touch onPress={checkUserRegisteration}>
        <Card
        
          bgColor={
            playerisInGame
              ? theme.colors.info
              : undefined
          }
        >
          <RowBetween>
            <Image uri={game.image} size={80} radius={50} />
            <Column alignItems="center">
              <TextTitle>{`مسابقه ${game.type} تومانی`}</TextTitle>
              <PlayersAvatarGroup players={game.players} />
            </Column>
            <RowBetween h="full" w="1/6">
              <View h="full" w={1} borderRadius={10} background={playerisInGame ? "success" : 'secondary'} />
              <TextNormal>
                {moment.unix(game.startTime).format("H : mm")}
              </TextNormal>
            </RowBetween>
          </RowBetween>
        </Card>
      </Touch>

      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        _backdrop={{ backgroundColor: 'primary', opacity: 0.8 }}
      >
        <AlertDialog.Content backgroundColor="modal">
          {/* <AlertDialog.CloseButton /> */}
          <AlertDialog.Header
            backgroundColor="modal"
            alignItems="center"
            textAlign="center"
            py={2}
            px={5}
          >
            <RowBetween w='full'><Avatar
              size="sm"
              source={{
                uri: game.image,
              }}
            />
              <TextTitle>
                ثبت نام در مسابقه
              </TextTitle>

            </RowBetween>
          </AlertDialog.Header>
          <AlertDialog.Body backgroundColor="modal" alignItems="end">
            <Column space={2}>
            <RowBetween>
              <TextNormal color='warning'> {game.type.toLocaleString()} سکه</TextNormal>
              <TextNormal>ورودی مسابقه </TextNormal>
            </RowBetween>
            <RowBetween>
              <TextNormal color='warning'>{game.players.length} نفر</TextNormal>
              <TextNormal>شرکت کنندگان تا این لحظه </TextNormal>
            </RowBetween>
            <RowBetween>
              <TextNormal color='warning'>{`${Math.round(game.players.length * game.type * 0.7).toLocaleString()} سکه`}</TextNormal>
              <TextNormal>
                جایزه نفر اول
              </TextNormal>
            </RowBetween>
            </Column>
            
          </AlertDialog.Body>
          <AlertDialog.Footer backgroundColor="modal">
            <Button.Group space={2}>
              <Button
                variant="unstyled"
                w="1/2"
                backgroundColor="warning"
                onPress={() => setIsOpen(false)}
                ref={cancelRef}
              >
                انصراف
              </Button>
              <Button
                isLoading={registerloading}
                w="1/2"
                backgroundColor="success"
                onPress={() => {
                  registerUser({ gameId: game._id, userId: user._id });
                  // game.players.push({
                  //   _id: user._id,
                  //   isUp: false,
                  //   point: 0,
                  //   user: { _id: user._id },
                  // });
                }}
              >
                تایید
              </Button>
            </Button.Group>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};

export default QuizEntranceCard;
