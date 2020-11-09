import Head from "next/head";
import Title from "../title";
import Link from "next/link";
import React from "react";
import styled from "styled-components";
import Layout from "../layout";
import tw from "tailwind.macro";
const NavigationElement = styled.div``;
const Navigation: React.FC<{ children: React.ReactNodeArray }> = ({
  children,
}) => {
  return (
    <NavigationElement>
      {children.flatMap((e, i, arr) => (arr.length - 1 === i ? [e] : [e, ">"]))}
    </NavigationElement>
  );
};
type Props = {
  children: [string, string?][];
};
const Component: React.FC<Props> = ({ children }) => {
  return (
    <Navigation>
      {children.map((e) => (
        <NavigationEntry name={e[0]} key={e[0]} href={e[1]}></NavigationEntry>
      ))}
    </Navigation>
  );
};
type EntryProps = {
  name: string;
  href?: string;
};
const NavEntryElementS = styled.span`
  ${tw``}
`;
const NavEntryElementA = styled.a`
  ${tw`text-yellow-500 hover:text-yellow-600`}
`;
export const NavigationEntry: React.FC<EntryProps> = ({ name, href }) => {
  if (!href) {
    return <NavEntryElementS>{name}</NavEntryElementS>;
  }
  return (
    <Link href={href} passHref>
      <NavEntryElementA>{name}</NavEntryElementA>
    </Link>
  );
};
export default Component;
