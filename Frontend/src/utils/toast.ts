import { theme } from "native-base";
import { Position, showMessage } from "react-native-flash-message";

export const showError = (title: string, position: Position = "top") => {
  showMessage({
    message: title,
    position,
    //@ts-ignore
    style: {
      backgroundColor: theme.colors.danger,
    },
    titleStyle: {
      fontFamily: "Yekan",
      color: theme.colors.white,
      fontSize: 16,
      marginTop: position === "top" ? 25 : 0,
    },
  });
};

export const showSuccess = (title: string, position: Position = "top") => {
  showMessage({
    message: title,
    position,
    //@ts-ignore
    style: {
      backgroundColor: theme.colors.success,
    },
    titleStyle: {
      fontFamily: "Yekan",
      color: theme.colors.white,
      fontSize: 16,
      marginTop: position === "top" ? 25 : 0,
    },
  });
};
