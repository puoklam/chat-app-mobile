import { FC } from "react";
import { ThemeProvider as TP } from "react-native-elements";

const theme = {
  Button: {
    buttonStyle: {
      backgroundColor: "#DA832D"
    },
    titleStyle: {
      // color: "#DA832D"
      color: "black"
    }
  }
};

const ThemeProvider: FC = ({ children }) => {
  return (
    <TP theme={theme}>
      {children}
    </TP>
  )
};

export default ThemeProvider;