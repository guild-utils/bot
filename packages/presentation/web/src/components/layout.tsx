import Header from "./header";
import styled from "styled-components";
import tw from "tailwind.macro";
const Layout = styled.div``;
const Inner = styled.div`
  ${tw`mx-auto mt-4`}
`;

type Props = {
  children: React.ReactNode;
};
const Component: React.FC<Props> = (props) => (
  <Layout>
    <Header />
    <Inner className="container">{props.children}</Inner>
  </Layout>
);

export default Component;
