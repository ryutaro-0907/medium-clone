import type { NextPage } from 'next'
import Head from 'next/head'
import Header from '../components/Header';

const Home: NextPage = () => {
  return (
    <div className="">
      <Head>
        <title>Medium Blog</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div>
        <h1 className='text-6xl font-serif'>
          Medium is place to write, read and connect
        </h1>
        <h2>

        </h2>
      </div>
      <div>

      </div>
    </div>
  )
}

export default Home
