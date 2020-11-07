import {
  ArgumentType,
  CommandSchema,
  OptionalValueArgumentOption,
  PostionalArgumentOption,
} from "@guild-utils/command-schema";
import { useRouter } from "next/router";
import {
  usageEntryFromSchema2,
  usageEntrysFromSchema,
} from "protocol_command-schema-core-bootstrap";
import styled from "styled-components";
import Layout from "../../../components/layout";
import DefaultErrorPage from "next/error";
import { categorys, mainOnlyCommands } from "../../../adapter/category";
import SimpleCommand from "../../../components/commands/simple";
import tw from "tailwind.macro";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
import {
  Optional,
  Required,
  Variable,
} from "../../../components/commands/badges/passing";
import * as Badges from "../../../components/commands/badges/itself";
import React from "react";
import Head from "next/head";
import Navigation from "../../../components/commands/navigation";

const Usage = styled.div`
  ${tw`m-2 bg-gray-700 rounded`}
`;
const Desc = styled.div``;
const UsageEntry = styled.div`
  ${tw`font-mono text-gray-400`}
`;
export type Props = {
  children: CommandSchema;
  prefix: string;
  category: string;
  root: CommandSchema;
};
const SubCommandsElement = styled.div``;
type SubCommandsProps = {
  children: CommandSchema;
  category: string;
  prefix: string;
};
const SubCommandsHead = styled.h2`
  ${tw`font-semibold`}
`;
const SubCommandsInner = styled.div`
  ${tw`m-2`}
`;
const SubCommands: React.FC<SubCommandsProps> = ({
  children,
  category,
  prefix,
}) => {
  return (
    <SubCommandsElement>
      <SubCommandsHead>サブコマンド</SubCommandsHead>
      <SubCommandsInner>
        {children.subCommands.map(([e]) => {
          return (
            <SimpleCommand
              key={category + "/" + children.name + "/" + e.name}
              prefix={prefix}
              category={category + "/" + children.name}
            >
              {e}
            </SimpleCommand>
          );
        })}
      </SubCommandsInner>
    </SubCommandsElement>
  );
};
const ArgumentsElement = styled.div``;
type ArgumentsProps = {
  children: CommandSchema;
  prefix: string;
};
const ArgumentsHead = styled.h2`
  ${tw`font-semibold`}
`;
const ArgumentsInner = styled.div`
  ${tw`m-2`}
`;
const ArgumentElement = styled.div`
  ${tw`my-1`}
`;
const ArgumentHead = styled.span``;
const ArgumentName = styled.h3`
  ${tw`inline-block font-semibold`}
`;
const ArgumentDesc = styled.div``;
const ArgumentTypeS = styled.span``;
const TitleElement = styled.h1`
  ${tw`text-2xl my-2 font-bold inline`}
`;
const Title: React.FC<{ children: string }> = ({ children }) => {
  return (
    <React.Fragment>
      <Head>
        <title>{children}</title>
      </Head>
      <TitleElement>{children}</TitleElement>
    </React.Fragment>
  );
};
function Argument(
  k: string,
  t: ArgumentType<symbol>,
  o: PostionalArgumentOption,
  prefix: string
): React.ReactNode {
  return (
    <ArgumentElement key={k}>
      <ArgumentHead>
        <ArgumentName>{k}</ArgumentName>:<ArgumentTypeS>{t.name}</ArgumentTypeS>{" "}
        {o.variable ? <Variable /> : undefined}
        {o.optional ? <Optional /> : <Required />}
      </ArgumentHead>
      <ArgumentDesc>
        {
          o.descriptionResolver("ja_JP", {
            defaultPrefix: prefix,
            environment: "web",
          }).summary
        }
      </ArgumentDesc>
    </ArgumentElement>
  );
}
const Arguments: React.FC<ArgumentsProps> = ({ children, prefix }) => {
  return (
    <ArgumentsElement>
      <ArgumentsHead>引数</ArgumentsHead>
      <ArgumentsInner>
        {children.positionalArgumentCollection.map((e) =>
          Argument(...e, prefix)
        )}
      </ArgumentsInner>
    </ArgumentsElement>
  );
};

function Option(
  k: string,
  t: ArgumentType<symbol>,
  o: OptionalValueArgumentOption<unknown>,
  prefix: string
): React.ReactNode {
  return (
    <ArgumentElement key={k}>
      <ArgumentHead>
        <ArgumentName>{k}</ArgumentName>:<ArgumentTypeS>{t.name}</ArgumentTypeS>{" "}
      </ArgumentHead>
      <ArgumentDesc>
        {
          o.descriptionResolver("ja_JP", {
            defaultPrefix: prefix,
            environment: "web",
          }).summary
        }
      </ArgumentDesc>
    </ArgumentElement>
  );
}
const Options: React.FC<ArgumentsProps> = ({ children, prefix }) => {
  return (
    <ArgumentsElement>
      <ArgumentsHead>オプション</ArgumentsHead>
      <ArgumentsInner>
        {[...children.optionArgumentCollection].map(([k, v]) =>
          Option(k, ...v, prefix)
        )}
      </ArgumentsInner>
    </ArgumentsElement>
  );
};
const Main: React.FC<Props> = ({ root, children, prefix, category }) => {
  const resolved = children.options.descriptionResolver("ja_JP", {
    defaultPrefix: prefix,
    environment: "web",
  });
  const SubCommandsIfPresent = children.subCommands.length ? (
    <SubCommands category={category} prefix={prefix}>
      {children}
    </SubCommands>
  ) : undefined;
  const ArgumentsIfPresent = children.positionalArgumentCollection.length ? (
    <Arguments prefix={prefix}>{children}</Arguments>
  ) : undefined;
  const OptionsIfPresent = children.optionArgumentCollection.size ? (
    <Options prefix={prefix}>{children}</Options>
  ) : undefined;
  const BadgesInstance = (
    <React.Fragment>
      <Badges.Main></Badges.Main>
      {mainOnlyCommands.has(root.name) ? undefined : <Badges.Sub></Badges.Sub>}
    </React.Fragment>
  );
  return (
    <Layout>
      <Navigation>
        {[
          ["コマンド", "../".repeat(1 + (children === root ? 0 : 1))],
          [category, `/commands/${category}`],
          ...(children !== root
            ? ([[root.name, `../${category}/${root.name}`]] as [
                string,
                string
              ][])
            : ([] as [string, string][])),
        ]}
      </Navigation>
      <Title>
        {children.name +
          (children.options.alias
            ? "(" + children.options.alias.join(",") + ")"
            : "")}
      </Title>
      {BadgesInstance}
      <Desc>{resolved.description ?? resolved.summary}</Desc>
      <Usage>
        {root === children
          ? usageEntrysFromSchema(children, prefix).map((e, i) => (
              <UsageEntry key={i}>{e}</UsageEntry>
            ))
          : usageEntryFromSchema2(root, children, prefix)}
      </Usage>
      {SubCommandsIfPresent}
      {ArgumentsIfPresent}
      {OptionsIfPresent}
    </Layout>
  );
};

const Component: React.FC = () => {
  const router = useRouter();
  const {
    category: categoryStr,
    command: commandStr,
    prefix = "$",
  } = router.query;
  if (Array.isArray(categoryStr) || !Array.isArray(commandStr)) {
    return <DefaultErrorPage statusCode={500} />;
  }
  if (Array.isArray(prefix)) {
    return <DefaultErrorPage statusCode={400} />;
  }
  if (!(categoryStr in categorys)) {
    return <DefaultErrorPage statusCode={404} />;
  }
  const category = categorys[categoryStr as keyof typeof categorys];
  if (!category) {
    return <DefaultErrorPage statusCode={404} />;
  }
  const categoryValue = category.value as Record<
    string,
    CommandSchema | undefined
  >;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let schema: CommandSchema | undefined = categoryValue[commandStr.shift()];
  const rootSchema = schema;
  for (const k of commandStr) {
    schema = schema.subCommands.find(
      ([e]) => e.name === k || e.options.alias?.includes(k)
    )[0];
  }
  if (!schema) {
    return <DefaultErrorPage statusCode={404} />;
  }
  return (
    <Main prefix={prefix} category={categoryStr} root={rootSchema}>
      {schema}
    </Main>
  );
};
export default Component;
export function generatePathRecursive(
  schema: CommandSchema,
  base: string[]
): string[][] {
  return [
    ...schema.subCommands.flatMap(([e]) =>
      generatePathRecursive(e, [...base, schema.name])
    ),
    [...base, schema.name],
  ];
}
export function getStaticPaths(): GetStaticPathsResult {
  const paths = Object.entries(categorys).flatMap(([ck, cv]) => {
    return Object.values(cv.value).flatMap((e2) => {
      return generatePathRecursive(e2, []).map((e3) => {
        return {
          params: { category: ck, command: e3 },
        };
      });
    });
  });
  return { paths, fallback: false };
}
export function getStaticProps(): GetStaticPropsResult<unknown> {
  return {
    props: {},
  };
}
