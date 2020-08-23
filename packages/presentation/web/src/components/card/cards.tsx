import Card from ".";
import invites from "../../invites";

export const Main: React.FC = () => (
  <Card src="/main-icon.webp" inviteURL={invites.main} title="メインボット">
    このボット単体で一通り動作します。
    <br />
    また、共有される設定もこちらのBotを用いて行います。
  </Card>
);
export const Sub1: React.FC = () => (
  <Card src="/sub1-icon.webp" inviteURL={invites.sub1} title="サブボット1">
    動作にはメインボットが必要です。
    <br />
    複数チャンネルでの読み上げに使用されます。
  </Card>
);
export const Sub2: React.FC = () => (
  <Card src="/sub2-icon.webp" inviteURL={invites.sub2} title="サブボット2">
    動作にはメインボットが必要です。
    <br />
    複数チャンネルでの読み上げに使用されます。
  </Card>
);
