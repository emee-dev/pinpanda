"use client";

import { useState, useEffect } from "react";
import { getFingerprint } from "@thumbmarkjs/thumbmarkjs";

export function shortenNumber(hex: string, length = 6) {
  if (!hex) {
    return "";
  }

  if (hex.length <= 6) {
    return hex;
  }

  return hex.slice(0, length) + "..." + hex.slice(-length);
}

export const useFingerPrint = () => {
  const [fingerprint, setFingerprint] = useState("");

  useEffect(() => {
    getFingerprint()
      .then((result) => {
        setFingerprint(result);
      })
      .catch((error) => {
        console.error("Error getting fingerprint:", error);
      });
  }, []);

  return { fingerPrintId: fingerprint };
};
