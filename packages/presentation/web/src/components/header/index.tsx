import styled from "styled-components";
import tw from "tailwind.macro";
import Link from "next/link";
import Title from "./title";
import { useState, useEffect } from "react";
const Wrapper = styled.div`
  ${tw`flex m-0 justify-between`}
`;

const HeaderEntry = styled.a`
  ${tw`flex-wrap block md:inline-block  mt-1 md:mt-0 md:mr-4 text-yellow-500 hover:text-yellow-600 `}
`;
const Header = styled.header`
  ${tw`md:flex items-center flex-column md:flex-row justify-between bg-gray-900 text-xl py-2 px-4`}
`;
const EntryWrapper = styled.div`
  ${tw`md:flex md:m-0 m-2 items-center justify-center flex-wrap md:flex-grow text-base md:text-md`}
`;
const Button = styled.button`
  ${tw`flex items-center inline px-3 py-2 border rounded text-yellow-600 border-yellow-600 hover:text-yellow-600 hover:border-yellow-500`}
`;
const Svg = styled.svg`
  ${tw`fill-current h-3 w-3`}
  transform:scale(2.0);
`;
const Menu = () => (
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
);
type ToggleButtonProps = {
  onClick: () => void;
};
const ToggleButton: React.FC<ToggleButtonProps> = (props) => (
  <Button onClick={props.onClick}>
    <Svg className="" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <title>Menu</title>
      <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
    </Svg>
  </Button>
);
const mediaQuery = "(min-width: 768px)";
function useMenuVisibility(): [{ button: boolean; menu: boolean }, () => void] {
  const [user, setUser] = useState(false);
  const [media, setMedia] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(mediaQuery);
    function set(e: boolean) {
      if (e) {
        setUser(false);
      }
      setMedia(e);
    }
    set(mql.matches);
    if (!mql.addListener) {
      return;
    }
    mql.addListener((e: MediaQueryListEvent) => {
      set(e.matches);
    });
  }, []);
  const button = media;
  const menu = media || user;
  const toggleVisibility = () => setUser((old) => !old);
  return [{ button, menu }, toggleVisibility];
}
const Component: React.FC = () => {
  const [
    { button: buttonVisibility, menu: menuVisibility },
    toggleVisibility,
  ] = useMenuVisibility();
  const menu = menuVisibility ? <Menu></Menu> : undefined;
  const button = buttonVisibility ? undefined : (
    <ToggleButton onClick={toggleVisibility}></ToggleButton>
  );
  return (
    <Header>
      <Wrapper>
        <Title></Title>
        {button}
      </Wrapper>
      {menu}
    </Header>
  );
};
export default Component;
