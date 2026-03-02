import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="de">
      <Head>
        {/* Viewport meta tag'i KALDIRILDI - _app.tsx'e taşınacak */}
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}