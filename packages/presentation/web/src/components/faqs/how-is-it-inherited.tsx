import FAQ from "../faq";
import styled from "styled-components";
import tw from "tailwind.macro";
const PriorityList = styled.ol`
  ${tw`ml-2`}
`;
const PriorityListEntry = styled.li`
  ${tw``}
`;
const HowIsItInherited: React.FC = () => {
  return (
    <FAQ question="どのように設定は継承されるの?">
      優先順位が高いものを上から列挙します。
      <PriorityList>
        <PriorityListEntry>memconf</PriorityListEntry>
        <PriorityListEntry>ニックネーム(readNameのみ)</PriorityListEntry>
        <PriorityListEntry>conf</PriorityListEntry>
        <PriorityListEntry>ユーザー名(readNameのみ)</PriorityListEntry>
        <PriorityListEntry>デフォルト値</PriorityListEntry>
      </PriorityList>
      つまり、memconfが最優先されるということです。
    </FAQ>
  );
};
export default HowIsItInherited;
