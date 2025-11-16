"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const api = process.env.NEXT_PUBLIC_API_URL;
    console.log("API URL =", api);

    fetch(`${api}/CheckUsernameExists?username=testuser`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          console.error("Backend returned an error:", text);
          return;
        }
        return res.json();
      })
      .then((data) => console.log("BACKEND CONNECTED:", data))
      .catch((err) => console.error("FETCH ERROR:", err));
  }, []);

  return <h1>Testing backend connection...</h1>;
}
