import styled from "styled-components";
import tw from "tailwind.macro";
import { CommandData } from "../../adapter/command-data";
import * as Badges from "./badges";
import Usage from "./usage";
/* eslint-disable */
const HtmlToReactParser = require("html-to-react").Parser;
const { toHTML } = require("discord-markdown");
/* eslint-enable */
const Command = styled.details``;
const Name = styled.span`
  ${tw`text-lg`}
`;
const Headline = styled.summary`
  ${tw``}
`;
const Content = styled.div`
  ${tw`m-2`}
`;
const BadgeCollection = styled.span``;

const More = styled.div`
  ${tw``}
  overflow-wrap: break-word
`;
type Props = {
  key?: string;
  prefix: string;
  command: CommandData;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
const htmlToReactParser: any = new HtmlToReactParser();
const Component: React.FC<Props> = ({ command, prefix }) => {
  const badges = (command.receiver ?? ["main", "sub"]).map((e) => {
    switch (e) {
      case "main":
        return <Badges.Main key={e}></Badges.Main>;
      case "sub":
        return <Badges.Sub key={e}></Badges.Sub>;
    }
  });
  const more = command.more ? (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    <More>{htmlToReactParser.parse(toHTML(command.more))}</More>
  ) : undefined;
  return (
    <Command>
      <Headline>
        <BadgeCollection>{badges}</BadgeCollection>
        <Name>{command.name}</Name> {command.description}
      </Headline>
      <Content>
        <Usage
          prefix={prefix}
          usage={command.usage}
          names={[command.name, ...(command.aliases ?? [])]}
          usageDelim={command.usageDelim}
        />
        {more}
      </Content>
    </Command>
  );
};
export default Component;
