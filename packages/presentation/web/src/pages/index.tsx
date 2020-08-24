import Layout from "../components/layout";
import FirstView from "../components/first-view";
import Head from "next/head";

const Component: React.FC = () => (
  <Layout>
    <Head>
      <title>GuildUtilsJ</title>
      <meta
        name="description"
        content="discord読み上げbot GuildUtilsJは3つのボイスチャンネルで読み上げが可能で、他にも高度な辞書機能などを持っています。"
      />
    </Head>
    <FirstView></FirstView>
  </Layout>
);
export default Component;
