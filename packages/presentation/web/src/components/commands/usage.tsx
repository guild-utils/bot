import styled from "styled-components";
import { Fragment } from "react";
function fullUsage(
  prefix: string,
  names: string[],
  usageString: string,
  usageDelim: string
): string {
  const deliminatedUsage =
    usageString !== "" ? ` ${usageString.split(" ").join(usageDelim)}` : "";
  const commands = names.length === 1 ? names[0] : `《${names.join("|")}》`;
  return `${prefix}${commands}${deliminatedUsage}`;
}
const Key = styled.span`
  user-select: none;
`;
const Value = styled.span``;
type Props = {
  prefix: string;
  names: string[];
  usage?: string;
  usageDelim: string;
};
const Component: React.FC<Props> = ({ prefix, names, usage, usageDelim }) => {
  return (
    <Fragment>
      <Key>使い方:</Key>
      <Value>{fullUsage(prefix, names, usage ?? "", usageDelim)}</Value>
    </Fragment>
  );
};
export default Component;
