import { FC } from "react";
import Chat from "../screens/Chat";
import Group from "../screens/Group";
import User from "../screens/User";
import Login from "../screens/Login";
import Register from "../screens/Register";
import useAuthStore from "../stores/auth";
import Profile from "../screens/Profile";
import NewGroup from "../screens/NewGroup";
import Home from "./Home";
import stack from "../navigation/stack";

const Routes: FC = ({ children }) => {
  const { loggedIn } = useAuthStore();
  
  return (
    <stack.Navigator id="stack">
      {loggedIn ? (
        <>
          <stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <stack.Screen name="Chat" component={Chat} />
          <stack.Screen name="Group" component={Group} />
          <stack.Screen name="User" component={User} />
          <stack.Screen name="Profile" component={Profile} />
          <stack.Screen name="NewGroup" component={NewGroup} />
        </>
      ) : (
        <>
          <stack.Screen name="Login" component={Login} />
          <stack.Screen name="Register" component={Register} />
        </>
      )}
    </stack.Navigator>
  )
};

export default Routes;

// v5: https://v5.reactrouter.com/web/example/auth-workflow
// v6: https://stackoverflow.com/questions/70724269/react-router-v6-route-composition-is-it-possible-to-render-a-custom-route