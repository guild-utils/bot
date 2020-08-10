import styled from "styled-components";
import tw from "tailwind.macro";
import { ww } from "presentation_command-data-common";
import FAQ from "../faq";

const ConfigureDescKey = styled.span`
  &::after {
    content: ":";
  }
`;
const ConfigureDescElement = styled.div`
  ${tw``}
`;
type ConfigureDescProps = {
  name: string;
  children: React.ReactNode;
};
const ConfigureDesc: React.FC<ConfigureDescProps> = ({ name, children }) => {
  return (
    <ConfigureDescElement>
      <ConfigureDescKey>{name}</ConfigureDescKey>
      {children}
    </ConfigureDescElement>
  );
};
const VoiceKindList = styled.ul`
  ${tw`ml-2`}
`;
const VoiceKindEntry = styled.li`
  ${tw``}
`;
const HowToConfigureVoiceSettings: React.FC = () => {
  return (
    <FAQ question="声の設定の意味を知りたい">
      readName意外の設定はOpenJTalk由来です。
      <ConfigureDesc name="allpass">?</ConfigureDesc>
      <ConfigureDesc name="intone">イントネーションの設定です</ConfigureDesc>
      <ConfigureDesc name="speed">読み上げ速度の設定です。</ConfigureDesc>
      <ConfigureDesc name="threshold">?</ConfigureDesc>
      <ConfigureDesc name="tone">声の高さの設定です。</ConfigureDesc>
      <ConfigureDesc name="volume">
        声の大きさです。単位はdbです。(おそらくある日突然%に変わります)
      </ConfigureDesc>
      <ConfigureDesc name="kind">
        声の種類です。現在使用可能なものは以下の通りです。
        <VoiceKindList>
          {ww.VoiceKindArray.map((e) => (
            <VoiceKindEntry key={e}>{e}</VoiceKindEntry>
          ))}
        </VoiceKindList>
      </ConfigureDesc>
      <ConfigureDesc name="readName">
        メンションの読み上げや発言者の名前の読み上げに使用されます。
      </ConfigureDesc>
    </FAQ>
  );
};
export default HowToConfigureVoiceSettings;
