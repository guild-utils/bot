import styled from "styled-components";
import tw from "tailwind.macro";

const FirstView = styled.div`
  ${tw``}
`;
const Catchphrase = styled.div`
  ${tw`text-4xl`}
`;
const MoreInfo = styled.div`
  ${tw`text`}
`;

const Component = (): JSX.Element => (
  <FirstView>
    <Catchphrase>ちょっと便利な読み上げBot</Catchphrase>
    <MoreInfo>
      サーバーごとに読み上げの設定を変えたり、メンバーの設定を変えてあげたり。
      <br />
      読み上げのためにDiscordのニックネームとは別に名前を指定できたり。
      <br />
      ちょっと高度な辞書機能があったり。
      <br />
      他にも色々。
    </MoreInfo>
  </FirstView>
);
export default Component;
