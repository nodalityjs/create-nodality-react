import React, { useState, useRef, useEffect } from 'react';
import { Text, Wrapper } from 'nodality';

function Extracted(props) {
  let ref = useRef();

  useEffect(() => {
    let t = props.view;
    if (ref.current) {
      ref.current.appendChild(t.render());
    }
    return () => {
      if (ref.current) {
        ref.current.innerHTML = "";
      }
    };
  }, [props]);

  return <div ref={ref} />;
}

function Wrappera({ setIsNav }) {
  const [count, setCount] = useState(0);

  return (
    <Extracted
      view={
        new Wrapper()
          .set({ background: "orange" })
          .add([
            new Text(`Counter ${count}`).set({
              size: "S1",
              font: "Arial",
              onTap: () => {
                setCount(count + 1);
                if (setIsNav) setIsNav(false);
              },
            }),
          ])
      }
    />
  );
}

function App() {
  return (
    <div>
      <h1>Nodality React App</h1>
      <Wrappera />
    </div>
  );
}

export default App;
