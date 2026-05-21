"use client";

import dynamic from "next/dynamic";

const AccountPageDynamic = dynamic(
  () => import("@/components/account/AccountPage"),
  { ssr: false }
);

export default function Page() {
  return <AccountPageDynamic />;
}
