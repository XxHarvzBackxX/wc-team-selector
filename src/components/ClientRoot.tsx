"use client";

import dynamic from "next/dynamic";

const DrawApp = dynamic(() => import("./DrawApp"), { ssr: false });

export default function ClientRoot() {
  return <DrawApp />;
}
