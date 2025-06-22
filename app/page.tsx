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
      <link rel="icon" type="image/png" href="/favicon.png" />
    </Head>
  )
}
import Component from "../tier-list"
import Head from "next/head"

export default function Page() {
  return (
    <>
      <Head>
        <title>Sexta do Terror</title>
        <link rel="icon" type="image/png" href="https://i.imgur.com/zJsZBDe.png" />
      </Head>
      <Component />
    </>
  )
}
