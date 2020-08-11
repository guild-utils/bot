import Icon from "../icon";
import styled from "styled-components";
import tw from "tailwind.macro";

type Props = {
  src: string;
  title: string;
  inviteURL: string;
  children: React.ReactNode;
};
const Wrapper = styled.div`
  ${tw`lg:flex lg:flex-col lg:justify-between bg-gray-700 max-w-sm rounded overflow-hidden shadow-lg p-2 m-2`}
`;
const IconWrapper = styled.div`
  ${tw`mr-2`}
`;
const Entry = styled.div`
  ${tw`m-2 lg:flex-grow`}
`;
const Title = styled.div`
  ${tw`flex text-xl`}
`;
const InviteButton = styled.button`
  ${tw`bg-transparent hover:bg-yellow-700 text-yellow-600 font-semibold hover:text-gray-400 py-2 px-4 border border-yellow-600 hover:border-transparent rounded`}
`;
const InviteButtonWrapper = styled.div`
  ${tw`flex justify-end`}
`;
const ContentWrapper = styled.div``;
const Component: React.FC<Props> = ({ src, children, title }) => {
  return (
    <Wrapper>
      <ContentWrapper>
        <Title>
          <IconWrapper>
            <Icon src={src} width="46"></Icon>
          </IconWrapper>
          {title}
        </Title>
        <Entry>{children}</Entry>
      </ContentWrapper>
      <InviteButtonWrapper>
        <InviteButton>追加</InviteButton>
      </InviteButtonWrapper>
    </Wrapper>
  );
};

export default Component;
