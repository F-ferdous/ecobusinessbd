"use client";

import React from "react";
import { useRouter } from "next/navigation";

export default function DeprecatedMessagesRedirect() {
  const router = useRouter();
  React.useEffect(() => {
    router.replace("/user/dashboard/support/my-tickets");
  }, [router]);
  return null;
}
