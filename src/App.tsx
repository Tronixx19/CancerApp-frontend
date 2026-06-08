import { type Component, Show, createEffect } from 'solid-js';
import { Router, Route, useLocation, type RouteSectionProps } from "@solidjs/router";
import Login from "./pages/Login";
import Upload from "./pages/Upload";
import Settings from "./pages/Settings";
import Results from "./pages/Results";
import Sidebar from "./components/Sidebar"; 
import { isDarkMode, isLargeText } from "./store"; 

const AppContent = (props: RouteSectionProps) => {
  const location = useLocation();
  const isLoginScreen = () => location.pathname === "/";

  createEffect(() => {
    if (isDarkMode()) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (isLargeText()) {
      document.documentElement.classList.add("text-xl"); 
    } else {
      document.documentElement.classList.remove("text-xl");
    }
  });

  return (
    <>
      <Show when={!isLoginScreen()}>
        <Sidebar />
      </Show>
      {props.children}
    </>
  );
};

const App: Component = () => {
  return (
    <Router root={AppContent}>
      <Route path="/" component={Login} />
      <Route path="/upload" component={Upload} />
      <Route path="/settings" component={Settings} />
      <Route path="/results" component={Results} />
    </Router>
  );
};

export default App;