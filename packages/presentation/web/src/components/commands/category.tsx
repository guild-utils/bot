import styled from "styled-components";
import tw from "tailwind.macro";

const Category = styled.details`
  ${tw``}
`;
const Summary = styled.summary`
  ${tw`text-xl`}
`;
const Wrapper = styled.div`
  ${tw`ml-2`}
`;
type Props = {
  key?: string;
  children: React.ReactNode;
  name: string;
};
export const Component: React.FC<Props> = ({ children, name }) => {
  return (
    <Category>
      <Summary>{name}</Summary>
      <Wrapper>{children}</Wrapper>
    </Category>
  );
};
export default Component;
