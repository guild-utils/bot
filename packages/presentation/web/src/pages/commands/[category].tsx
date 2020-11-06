import { useRouter } from "next/router";
import { categorys, mainOnlyCommands } from "../../adapter/category";
import DefaultErrorPage from "next/error";
import Layout from "../../components/layout";
import Title from "../../components/title";
import Head from "next/head";
import Command from "../../components/commands/simple";
import {
  Main as MBadge,
  Sub as SBadge,
} from "../../components/commands/badges/itself";
import { GetStaticPathsResult, GetStaticPropsResult } from "next";
export type Props = {
  children: typeof categorys[keyof typeof categorys];
  name: string;
  prefix: string;
};
import Navigation from "../../components/commands/navigation";

const Main: React.FC<Props> = ({
  name,
  prefix,
  children: { summary, value },
}) => {
  return (
    <Layout>
      <Head>
        <meta
          name="description"
          content={`discord読み上げbot GuildUtilsJの${name}カテゴリについて`}
        />
      </Head>
      <Navigation>{[["コマンド", "./"]]}</Navigation>
      <Title>{name}</Title>
      {summary}
      {Object.values(value).map((e) => {
        return (
          <Command
            category={name}
            key={e.name}
            prefix={prefix}
            badge={[
              <MBadge key="m"></MBadge>,
              ...(mainOnlyCommands.has(e.name)
                ? []
                : [<SBadge key="s"></SBadge>]),
            ]}
          >
            {e}
          </Command>
        );
      })}
    </Layout>
  );
};

const Component: React.FC = () => {
  const router = useRouter();
  const { category: categoryStr, prefix = "$" } = router.query;
  if (Array.isArray(categoryStr)) {
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
  return (
    <Main name={categoryStr} prefix={prefix}>
      {category}
    </Main>
  );
};

export default Component;
export function getStaticPaths(): GetStaticPathsResult {
  const paths = Object.keys(categorys).map((e) => ({
    params: { category: e },
  }));
  return { paths, fallback: false };
}
export function getStaticProps(): GetStaticPropsResult<unknown> {
  return {
    props: {},
  };
}
