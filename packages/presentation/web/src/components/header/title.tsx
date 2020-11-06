import styled from "styled-components";
import tw from "tailwind.macro";
import Icon from "../icon";
import Link from "next/link";
const Title = styled.a`
  ${tw`text-yellow-500 whitespace-no-wrap hover:text-yellow-600`}
`;
const IconWrapper = styled.span`
  ${tw`mr-2`}
`;
const Component = (): JSX.Element => (
  <Link href="/" passHref>
    <Title>
      <IconWrapper>
        <Icon src="/main-icon.webp" width="24" alt=""></Icon>
      </IconWrapper>
      GuildUtilsJ
    </Title>
  </Link>
);
export default Component;
