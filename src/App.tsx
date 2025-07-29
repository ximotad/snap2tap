import React from "react";
import { MediaCaptureScreen } from "./components/media-capture-screen";

function getParam(name: string) {
  if (typeof window === 'undefined') return '';
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || '';
}

const App = () => {
  const uuid = getParam('uuid');
  const user = getParam('user');

  return (
    <MediaCaptureScreen
      uuid={uuid}
      user={user}
      onNext={() => {
        // TODO: Connect this to Glide or your submit logic
      }}
    />
  );
};

export default App;
