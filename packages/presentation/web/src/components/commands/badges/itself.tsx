import styled from "styled-components";
import tw from "tailwind.macro";
const MainBadge = styled.span`
  ${tw`text-sm shadow-lg bg-yellow-700 rounded m-1`}
  padding: 0.1rem
`;
const SubBadge = styled.span`
  ${tw`text-sm shadow-lg bg-green-700 rounded m-1`}
  padding: 0.1rem
`;
type Props = {
  key?: string;
};
export const Main: React.FC<Props> = () => {
  return <MainBadge>Main</MainBadge>;
};

export const Sub: React.FC<Props> = () => {
  return <SubBadge>Sub</SubBadge>;
};
