import Layout from "../components/layout";
import Title from "../components/title";
import * as Cards from "../components/card/cards";
import styled from "styled-components";
import tw from "tailwind.macro";
import Head from "next/head";
const FlexConteiner = styled.div`
  ${tw`lg:flex`}
`;
const Component: React.FC = () => {
  return (
    <Layout>
      <Title>サーバーに追加</Title>
      <Head>
        <meta
          name="description"
          content="discord読み上げbot GuildUtilsJの招待リンクと各botの軽い説明です。"
        />
      </Head>
      <FlexConteiner>
        <Cards.Main></Cards.Main>
        <Cards.Sub1></Cards.Sub1>
        <Cards.Sub2></Cards.Sub2>
      </FlexConteiner>
    </Layout>
  );
};
export default Component;
