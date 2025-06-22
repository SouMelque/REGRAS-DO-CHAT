import Component from "../tier-list"

export default function Page() {
  return <Component />
}
import Head from "next/head"

export const metadata = {
  title: "Sexta do Medo",
}

export function HeadTag() {
  return (
    <Head>
      <title>Sexta do Terror</title>
      <link rel="icon" type="image/png" href="/logo-sexta-terror.png" />
    </Head>
  )
}
