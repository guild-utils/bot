import Layout from "../components/layout";
import Title from "../components/title";
import Commands from "../components/commands";
import Head from "next/head";
const Component: React.FC = () => {
  return (
    <Layout>
      <Title>コマンド</Title>
      <Head>
        <meta
          name="description"
          content="discord読み上げbot GuildUtilsJのコマンドの一覧です。"
        />
      </Head>
      <Commands></Commands>
    </Layout>
  );
};

export default Component;
