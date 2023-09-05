
import Header from "../components/Header";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import HomePageBody from "@/components/HomePageBody";

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Home</title>
        <meta name="description" content="Manage your balance in Aave and Compound" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <HomePageBody />
    </div>
  );
}
