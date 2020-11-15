import Link from "next/link";
import styled from "styled-components";
import tw from "tailwind.macro";

const Outer = styled.div`
  ${tw``}
`;
const NameWrap = styled.div`
  ${tw`text-yellow-500 text-xl mb-2 hover:text-yellow-600`}
`;
const Name: React.FC<{ children: string }> = (ctx) => {
  return (
    <NameWrap>
      <Link href={`/commands/${ctx.children}`}>{ctx.children}</Link>
    </NameWrap>
  );
};
const Button = styled.a`
  ${tw`mb-1 inline-block bg-transparent hover:bg-yellow-700 text-yellow-600 font-semibold hover:text-gray-400 mx-1 py-1 px-2 border border-yellow-600 hover:border-transparent rounded`}
`;
const Summary = styled.div`
  ${tw``}
`;

const ChildCommand: React.FC<{ children: string; category: string }> = ({
  children,
  category,
}) => {
  return (
    <Link href={`/commands/${category}/${children}`} passHref>
      <Button>{children}</Button>
    </Link>
  );
};
const ChildCommandsElement = styled.div`
  ${tw`m-2 flex`}
`;
const ChildCommands: React.FC<{ children: string[]; category: string }> = ({
  children,
  category,
}) => {
  return (
    <ChildCommandsElement>
      {children.map((e) => (
        <ChildCommand category={category} key={e}>
          {e}
        </ChildCommand>
      ))}
    </ChildCommandsElement>
  );
};
export type Ctx = {
  name: string;
  summary: string;
  children?: string[];
};
const Component: React.FC<Ctx> = ({ name, summary, children }) => {
  return (
    <Outer>
      <Name>{name}</Name>
      <Summary>{summary}</Summary>
      <ChildCommands category={name}>{children}</ChildCommands>
    </Outer>
  );
};
export default Component;
