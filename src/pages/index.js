import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import App from '@/components/App'
import { getData } from '@/lib/getData'


export default function Home() {
  return (
    <>
    <Head>
        <title>Pri-AI Dashboard</title>
        <link rel="icon" href="favicon.ico" />
        <meta name="description" content="The Pri-AI dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex"/>
        
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
    <App/>
    </>
  )
}

