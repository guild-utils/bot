import Title from "../components/title";
import Layout from "../components/layout";
import HowToConfigureVoice from "../components/faqs/how-to-configure-voice";
import DoNotReadName from "../components/faqs/do-not-read-name";
import ConfigurationNotApplied from "../components/faqs/configuration-not-applied";
import HowIsItInherited from "../components/faqs/how-is-it-inherited";

const Component: React.FC = () => {
  return (
    <Layout>
      <Title>よくある質問</Title>
      <DoNotReadName></DoNotReadName>
      <HowToConfigureVoice></HowToConfigureVoice>
      <ConfigurationNotApplied></ConfigurationNotApplied>
      <HowIsItInherited></HowIsItInherited>
    </Layout>
  );
};
export default Component;
