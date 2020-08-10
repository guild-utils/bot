import styled from "styled-components";
import tw from "tailwind.macro";
type Props = {
  key?: string;
  children: React.ReactNode;
  name: string;
};
const SubCategory = styled.details`
  ${tw`text-base`}
`;
const Summary = styled.summary`
  ${tw`text-xl`}
`;
const Wrapper = styled.div`
  ${tw`ml-2`}
`;
export const Component: React.FC<Props> = ({ children, name }) => {
  return (
    <SubCategory>
      <Summary>{name}</Summary>
      <Wrapper>{children}</Wrapper>
    </SubCategory>
  );
};
export default Component;
