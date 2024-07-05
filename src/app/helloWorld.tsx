"use client";

import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { UUID } from "crypto";

interface Client {
  id?: UUID;
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  path: string;
}

const generateRandomBytes = (length: number): Uint8Array => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return array;
};

export default function Greet() {
  const [clientToRender, setClientToRender] = useState<any>();
  const handleSubmit = () => {
    const privateKey = generateRandomBytes(32);
    return invoke("create_client")
      .then((result) => {
        setClientToRender(result);
        console.log("Response from invoke: ", result);
      })
      .catch(console.error);
  };

  // Necessary because we will have to use Greet as a component later.
  return (
    <div>
      <button
        className="bg-warning"
        onClick={() => {
          console.log("Hello world");
          handleSubmit();
        }}
      >
        Test
      </button>
    </div>
  );
}
