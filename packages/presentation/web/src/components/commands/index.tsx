import styled from "styled-components";
import tw from "tailwind.macro";
import Category from "./category";
import SubCategory from "./sub-category";
import Command from "./command";
import { CommandData, ja_JP } from "../../adapter/command-data";
const Direct = "Direct";
const Commands = styled.div`
  ${tw``}
`;

type CategoryProps = {
  [k in string | symbol]: CommandData[];
};
type AllData = { [k in string]: CategoryProps };
function build(): AllData {
  const obj: AllData = {};
  for (const command of ja_JP.All) {
    obj[command.category] = obj[command.category] ?? {};
    if (command.subCategory) {
      obj[command.category][command.subCategory] =
        obj[command.category][command.subCategory] ?? [];
      obj[command.category][command.subCategory].push(command);
    } else {
      obj[command.category][Direct] = obj[command.category][Direct] ?? [];
      obj[command.category][Direct].push(command);
    }
  }
  return obj;
}
function* subCategory(obj: CategoryProps) {
  for (const [name, commands] of Object.entries(obj)) {
    if (name === Direct) {
      const children = commands.map((e) => (
        <Command key={e.name} command={e} prefix="$"></Command>
      ));
      yield children;
      continue;
    }
    const children = commands.map((e) => (
      <Command key={e.name} command={e} prefix="$"></Command>
    ));
    yield (
      <SubCategory key={name} name={name}>
        {children}
      </SubCategory>
    );
  }
}
function* category(obj: AllData) {
  for (const [name, category] of Object.entries(obj)) {
    const children = [...subCategory(category)];
    yield (
      <Category key={name} name={name}>
        {children}
      </Category>
    );
  }
}
export const Component: React.FC = () => {
  return <Commands>{[...category(build())]}</Commands>;
};
export default Component;
