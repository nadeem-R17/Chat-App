import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MainLayout from "./pages/MainLayout";
import { useRecoilState } from "recoil";
import { userState } from "./atoms/userAtom";
import { useEffect } from "react";
import WelcomeScreen from "./pages/WelcomeScreen";

function App() {
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setUser(user);
    }
  }, [setUser]);

  return (
    <Router>
      <Routes>
        <Route path="/main" element={<MainLayout />} />
        <Route path='/' element={<WelcomeScreen />} />
        <Route path="*" element={<WelcomeScreen/>} />
      </Routes>
    </Router>
  );
}

export default App;
