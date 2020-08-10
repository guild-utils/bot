import styled from "styled-components";
import tw from "tailwind.macro";

type Props = {
  key?: string;
  question: React.ReactNode;
  children: React.ReactNode;
};
const Frame = styled.details`
  ${tw`m-2`}
`;
const Question = styled.summary`
  ${tw`text-lg`}
`;
const Answer = styled.div`
  ${tw`m-2`}
`;
const Component: React.FC<Props> = ({ question, children }) => {
  return (
    <Frame>
      <Question>{question}</Question>
      <Answer>{children}</Answer>
    </Frame>
  );
};
export default Component;
