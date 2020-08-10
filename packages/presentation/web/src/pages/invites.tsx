import Layout from "../components/layout";
import Title from "../components/title";
import * as Cards from "../components/card/cards";
import styled from "styled-components";
import tw from "tailwind.macro";
const FlexConteiner = styled.div`
  ${tw`lg:flex`}
`;
const Component: React.FC = () => {
  return (
    <Layout>
      <Title>サーバーに追加</Title>
      <FlexConteiner>
        <Cards.Main></Cards.Main>
        <Cards.Sub1></Cards.Sub1>
      </FlexConteiner>
    </Layout>
  );
};
export default Component;
