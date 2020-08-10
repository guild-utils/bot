import styled from "styled-components";
import tw from "tailwind.macro";
import { Fragment } from "react";
import { CommandData } from "../../adapter/command-data";
import * as Badges from "./badges";
import Usage from "./usage";
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
    <More>
      {command.more.split("\n").map((item, key) => {
        return (
          <Fragment key={key}>
            {item}
            <br />
          </Fragment>
        );
      })}
    </More>
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
