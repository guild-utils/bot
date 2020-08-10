import Layout from "../components/layout";
import Title from "../components/title";
import Commands from "../components/commands";
const Component: React.FC = () => {
  return (
    <Layout>
      <Title>コマンド</Title>
      <Commands></Commands>
    </Layout>
  );
};

export default Component;
