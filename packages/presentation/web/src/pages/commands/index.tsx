import Category from "../../components/category/simple";
import { categorys } from "../../adapter/category";
import Head from "next/head";
import Layout from "../../components/layout";
import Title from "../../components/title";

const Component: React.FC = () => {
  return (
    <Layout>
      <Head>
        <meta
          name="description"
          content="discord読み上げbot GuildUtilsJのコマンドの一覧です。"
        />
      </Head>
      <Title>コマンド</Title>
      {Object.entries(categorys).map(([k, v]) => {
        return (
          <Category key={k} name={k} summary={v.summary}>
            {Object.values(v.value).map((e) => e.name)}
          </Category>
        );
      })}
    </Layout>
  );
};

export default Component;
