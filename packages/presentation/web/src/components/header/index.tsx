import styled from "styled-components";
import tw from "tailwind.macro";
import Title from "./title";
import Link from "next/link";

const HeaderEntry = styled.a`
  ${tw`flex-wrap block md:inline-block  mt-1 md:mt-0 md:mr-4 text-yellow-500 hover:text-yellow-600 `}
`;
const Header = styled.header`
  ${tw`md:flex items-center flex-column md:flex-row justify-between bg-gray-900 text-xl py-2 px-8`}
`;
const EntryWrapper = styled.div`
  ${tw`md:flex md:m-0 m-2 items-center justify-center flex-wrap md:flex-grow text-base md:text-md`}
`;
const Component: React.FC = () => {
  return (
    <Header>
      <Title></Title>
      <EntryWrapper>
        <Link href="/commands" passHref>
          <HeaderEntry>コマンド</HeaderEntry>
        </Link>
        <Link href="/faqs" passHref>
          <HeaderEntry>よくある質問</HeaderEntry>
        </Link>
        <Link href="/invites" passHref>
          <HeaderEntry>サーバーに追加</HeaderEntry>
        </Link>
        <HeaderEntry href="https://discord.gg/xxkzCHU">
          サポートサーバー
        </HeaderEntry>
      </EntryWrapper>
    </Header>
  );
};
export default Component;
