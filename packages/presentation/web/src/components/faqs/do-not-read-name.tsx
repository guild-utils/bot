import FAQ from "../faq";

const DoNotReadName: React.FC = () => {
  return (
    <FAQ question="名前の読み上げを無効にしたい">
      サーバー単位で名前の読み上げを無効にする場合は
      <br />
      $conf set speech.readName false <br />
      を実行してください。
      <br />
      自分の名前を読まれなくしたい場合は
      <br />
      $memconf set speech.readName "" <br />
      を実行してください。
    </FAQ>
  );
};
export default DoNotReadName;
