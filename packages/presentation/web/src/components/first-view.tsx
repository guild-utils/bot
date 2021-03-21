import styled from "styled-components";
import tw from "tailwind.macro";

const FirstView = styled.div`
  ${tw``}
`;
const Catchphrase = styled.div`
  ${tw`text-3xl`}
`;
const MoreInfo = styled.div`
  ${tw`text`}
`;
const EOL = styled.div`
  ${tw`text-lg border-8 border-red-700 mb-4 rounded`}
`;
const EOLTitle = styled.div`
  ${tw`text-2xl text-center m-2 font-bold`}
`;
const Component = (): JSX.Element => (
  <FirstView>
    <EOL>
      <EOLTitle>重要なお知らせ</EOLTitle>
      読み上げbotも色々出てきたので4/1(木)から段階的にbotの運用を縮小し最終的に終了します。
      <br></br>
      (コードが良くなくて開発がしんどいのと規模の割に運用にお金がかかりすぎるのもあります)
      <br></br>
      ご利用いただきありがとうございました。<br></br><br></br>
      以下のようなスケジュールで進めさせていただきます。 <br></br>
      可及的速やかに:
      3体のbotのステータス及びwebサイトに運用を終了する旨記載し、コマンド実行時に警告が出るようにします。
      <br></br>
      4/1(木): @GuildUtilsJ-sub1 @GuildUtilsJ-sub2 の運用を終了。<br></br>
      4/8(木): @GuildUtilsJ の運用を終了。<br></br>
      4/15(木): サポートサーバーを削除。
    </EOL>
    <Catchphrase>ちょっと便利なdiscord読み上げBot</Catchphrase>

    <MoreInfo>
      3つのボイスチャンネルで読み上げが可能。
      <br />
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
