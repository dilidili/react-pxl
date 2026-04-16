import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: {
    default: 'react-pxl',
    template: '%s – react-pxl',
  },
  description: 'React → Canvas. Declarative UI, pixel-perfect rendering.',
  openGraph: {
    title: 'react-pxl',
    description: 'React custom renderer targeting HTML Canvas instead of DOM',
    siteName: 'react-pxl',
  },
}

const navbar = (
  <Navbar
    logo={
      <span style={{ fontWeight: 800, fontSize: 18 }}>
        <span style={{ color: '#3b82f6' }}>react</span>
        <span style={{ color: '#94a3b8' }}>-</span>
        <span style={{ color: '#1e293b' }}>pxl</span>
      </span>
    }
    projectLink="https://github.com/dilidili/react-pxl"
  />
)

const footer = (
  <Footer>
    <span>MIT {new Date().getFullYear()} © react-pxl</span>
  </Footer>
)

export default async function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/dilidili/react-pxl/tree/master/docs"
          footer={footer}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          editLink="Edit this page on GitHub"
        >
          {children}
        </Layout>
      </body>
    </html>
  )
}
