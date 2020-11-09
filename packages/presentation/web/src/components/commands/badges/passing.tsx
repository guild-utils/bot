import styled from "styled-components";
import tw from "tailwind.macro";
const RequiredElement = styled.span`
  ${tw`text-sm shadow-lg bg-red-700 rounded m-1`}
  padding: 0.1rem
`;
const OptionalElement = styled.span`
  ${tw`text-sm shadow-lg bg-blue-700 rounded m-1`}
  padding: 0.1rem
`;
const VariableElement = styled.span`
  ${tw`text-sm shadow-lg bg-teal-700 rounded m-1`}
  padding: 0.1rem
`;

type Props = {
  key?: string;
};
export const Required: React.FC<Props> = () => {
  return <RequiredElement>Required</RequiredElement>;
};

export const Optional: React.FC<Props> = () => {
  return <OptionalElement>Optional</OptionalElement>;
};

export const Variable: React.FC<Props> = () => {
  return <VariableElement>Variable</VariableElement>;
};
