import { CommandSchema } from "@guild-utils/command-schema";
import Link from "next/link";
import styled from "styled-components";
import tw from "tailwind.macro";

export type Props = {
  children: CommandSchema;
  prefix: string;
  category: string;
  badge?: React.ReactNodeArray;
};
const Outer = styled.div``;
const NameElement = styled.a`
  ${tw`text-yellow-500 hover:text-yellow-600`}
`;
type NameProps = {
  category: string;
  name: string;
  display: string;
};
const Name: React.FC<NameProps> = ({ category, name, display }) => {
  return (
    <Link passHref href={`/commands/${category}/${name}`}>
      <NameElement>{display}</NameElement>
    </Link>
  );
};
const Summary = styled.div``;
const HeadArea = styled.div``;
const Component: React.FC<Props> = ({ category, children, prefix, badge }) => {
  return (
    <Outer>
      <HeadArea>
        <Name
          display={
            children.name +
            (children.options.alias
              ? "(" + children.options.alias.join(",") + ")"
              : "")
          }
          name={children.name}
          category={category}
        ></Name>{" "}
        {badge}
      </HeadArea>
      <Summary>
        {
          children.options.descriptionResolver("ja_JP", {
            defaultPrefix: prefix,
            environment: "web",
          }).summary
        }
      </Summary>
    </Outer>
  );
};
export default Component;
