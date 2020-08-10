import Card from ".";
import invites from "../../invites";

export const Main: React.FC = () => (
  <Card src="/main-icon.png" inviteURL={invites.main} title="メインボット">
    このボット単体で一通り動作します。
    <br />
    また、共有される設定もこちらのBotを用いて行います。
  </Card>
);
export const Sub1: React.FC = () => (
  <Card src="/sub1-icon.png" inviteURL={invites.sub1} title="サブボット">
    動作にはメインボットが必要です。
    <br />
    複数チャンネルでの読み上げに使用されます。
  </Card>
);
