import { useEffect, useState } from "react";

export default function PromiseBuilder({
  promise,
  builder = (snapshot) => null,
}) {
  const [view, setView] = useState(builder(null));

  useEffect(() => {
    promise
      .catch((e) => {
        setView(builder([false, e]));
      })
      .then((v) => {
        setView(builder([true, v]));
      });
  }, []);

  return view;
}
