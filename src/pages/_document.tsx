import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang='en'>
        <Head>
            <link rel='alternate' href='https://demo.fingerprint.com' hrefLang='en'/>
            <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/simple-line-icons/2.4.1/css/simple-line-icons.min.css'/>
        </Head>
        <body>
        <Main/>
        <NextScript/>
        </body>
    </Html>
  );
}
