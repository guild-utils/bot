import FAQ from "../faq";

const ConfigurationNotApplied: React.FC = () => {
  return (
    <FAQ question="設定が反映されない">
      このbotは設定は下流の設定が設定されない場合、上流の設定を継承するモデルを採用しています。
      <br />
      そのため上流の設定を変更しても最終的な結果に反映されない場合があります。
      <br />
      下流の設定も見直してみていただけると幸いです。
    </FAQ>
  );
};
export default ConfigurationNotApplied;
