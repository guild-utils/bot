import Head from "next/head";
import Title from "../components/title";
import Layout from "../components/layout";
import HowToConfigureVoice from "../components/faqs/how-to-configure-voice";
import DoNotReadName from "../components/faqs/do-not-read-name";
import ConfigurationNotApplied from "../components/faqs/configuration-not-applied";
import HowIsItInherited from "../components/faqs/how-is-it-inherited";
import CheckAppliedVoiceConfig from "../components/faqs/check-applied-voice-config";

const Component: React.FC = () => {
  return (
    <Layout>
      <Title>よくある質問</Title>
      <Head>
        <meta
          name="description"
          content="discord読み上げbot GuildUtilsJに関するよくある質問です。"
        />
      </Head>
      <DoNotReadName></DoNotReadName>
      <HowToConfigureVoice></HowToConfigureVoice>
      <ConfigurationNotApplied></ConfigurationNotApplied>
      <HowIsItInherited></HowIsItInherited>
      <CheckAppliedVoiceConfig></CheckAppliedVoiceConfig>
    </Layout>
  );
};
export default Component;
