import styled from "styled-components";
import tw from "tailwind.macro";
import Head from "next/head";
import React from "react";
const Title = styled.h1`
  ${tw`text-2xl my-2 font-bold`}
`;
type Props = {
  children: string;
};
const Component: React.FC<Props> = ({ children }) => {
  return (
    <React.Fragment>
      <Head>
        <title>{children}</title>
      </Head>
      <Title>{children}</Title>
    </React.Fragment>
  );
};
export default Component;
