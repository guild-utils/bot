import styled from "styled-components";
import tw from "tailwind.macro";
import Icon from "../icon";
import Link from "next/link";
const Title = styled.a`
  ${tw`text-yellow-500 whitespace-no-wrap`}
`;
const IconWrapper = styled.span`
  ${tw`mr-2`}
`;
const Component = (): JSX.Element => (
  <Link href="/" passHref>
    <Title>
      <IconWrapper>
        <Icon src="/main-icon.png" width="24"></Icon>
      </IconWrapper>
      GuildUtilsJ
    </Title>
  </Link>
);
export default Component;
