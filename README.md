# Guild Utils J
klasaで作られています。

## 機能
 - 読み上げ

## prefix
デフォルトのプレフィックスは$です。  
メンションでも動作します。  
また``[~] Guild Utils J``のようにニックネームを変更してやると~がprefixになります。  
ニックネームの変更イベントに反応しますのでbotがオフラインであった場合など変更が反映されない場合があります。  
その場合はお手数ですがコマンドで設定してやるか時間をおいてニックネームをもう一度設定してください。  
prefixを設定するコマンドは以下です。
```
$conf set prefix !
```

## 読み上げ
### 基本
以下のどちらかのコマンドで読み上げを開始します。
```
$start
$s
```
読み上げが開始されたあとに``$s``を別のテキストチャンネルで実行することでそのチャンネルも読み上げの対象に追加することができます。


チャンネル単位で読み上げを終了するには以下のコマンドを使用します。
```
$ec
```

以下のコマンドで読み上げを終了します。
```
$e
```

発言者の名前あるいはメンションを読み上げるときの読みの設定が可能です。
```
$gmconf set speech.readName ねこ
```
その他tone,volume,speed,kindが各ギルドで別個に設定できます。  
kindの一覧は以下のコマンドでご確認ください。
```
$help s
```
### 辞書
kuromoji.jsの辞書を少し変更してwを切り出せるようにしたものによって形態素解析し、形態素ごとに辞書に当てはまったものを置換する形で使用しています。  
kuromoji.jsとOpenJTalk内部のmecabで使用されている辞書が異なるため、読み上げ結果と読みの出力が異なる場合があります。  

```
$kuromoji 辞書に登録したい単語が載っている文章。
$aw 単語 たんご 名詞 一般 * *
```

形態素解析の前段と後段で単純置換が行なえます。
```
$awb キャラ名 「キャラ名」
$awa 単語 たんご
```

誤った読み上げに関する情報を募集しています。(どうにかして修正できるかもしれないので)

### jumanppコマンドについて
将来のバージョンで使用する予定のソフトウェアです。  
ちゃんと書けばこんなにマシになるんだと思うためにつけました。いまのところそれ以外の意味はありません。

## セルフホスト
```
git clone --depth 1 https://gitlab.com/guild-utils-j/guild-utils-j.git
cd guild-utils-j
docker run -d --net guj-net --name guj-db -e POSTGRES_PASSWORD=mysecretpassword -v dbdata:/var/lib/postgresql/data postgres-alpine
docker build -t guj .
docker stop guj||true
docker rm guj||true
docker run -d --name guj --net guj-net --env-file=.env guj
```
  
.env  
```
GUILD_UTILS_J_DISCORD_TOKEN=
GOOGLE_API_CREDENTIAL=
GUILD_UTILS_J_PROVIDER=postgresql
POSTGRES_DATABASE=postgres
POSTGRES_PASSWORD=mysecretpassword
POSTGRES_HOST=guj-net
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_MAX=30
POSTGRES_IDLE_TIMEOUT=1000
```

### 余計なものいらないので読み上げだけください!
```
git clone --depth 1 https://gitlab.com/guild-utils-j/guild-utils-j.git
cd guild-utils-j
docker run -d --net guj-net --name guj-db -e POSTGRES_PASSWORD=mysecretpassword -v dbdata:/var/lib/postgresql/data postgres-alpine
docker build -f WithoutJumanpp.Dockerfile -t guj .
docker stop guj||true
docker rm guj||true
docker run -d --name guj --net guj-net --env-file=.env guj
```

.env  
```
GUILD_UTILS_J_DISCORD_TOKEN=
GUILD_UTILS_J_PROVIDER=postgresql
POSTGRES_DATABASE=postgres
POSTGRES_PASSWORD=mysecretpassword
POSTGRES_HOST=guj-net
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_MAX=30
POSTGRES_IDLE_TIMEOUT=1000
```
### Windowsでネイティブに動かしたい。
頑張ってください。

### gitlab container registryのやつを使う。
```
docker pull registry.gitlab.com/guild-utils-j/guild-utils-j:latest
docker tag registry.gitlab.com/guild-utils-j/guild-utils-j:latest guj:latest
docker run -d --net guj-net --name guj-db -e POSTGRES_PASSWORD=mysecretpassword -v dbdata:/var/lib/postgresql/data postgres-alpine
docker stop guj||true
docker rm guj||true
docker run -d --name guj --net guj-net --env-file=.env guj:latest
```

.env  
```
GUILD_UTILS_J_DISCORD_TOKEN=
GUILD_UTILS_J_PROVIDER=postgresql
POSTGRES_DATABASE=postgres
POSTGRES_PASSWORD=mysecretpassword
POSTGRES_HOST=guj-net
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_MAX=30
POSTGRES_IDLE_TIMEOUT=1000
```
## ロードマップ

### v1
- N-APIを用いてHTS Engine APIからOpusをメモリ上に直接出力し、NodeJSからDiscordへ直接送信する。
- 複数のbotアカウントを用いて一サーバーの複数のVCで読み上げが可能になるようにする。
- 辞書のインポート、エクスポート。
- 読み上げ設定インポート、エクスポート。
- 読み上げ設定ガチャ。
- 読み上げ設定プリセット。(コマンド一つで声を変えれるように)
- DMでの音声生成。
- Embed Viewによる表示。
- スケジューリング機能のDSLを根本的に改善する(GoogleSpreadSheetを使い続けるかも要検討)
- CI
- 読み上げ時間の制限
## v2
- OpenJTalkを改造してjumanppを用いて喋るようにする。
- Web Dashboard

## ライセンス
htsvoice、OpenJTalk、HTS Engine API、Jumanpp、kuromoji-js、klasa-member-gatewayについてはそれぞれのライセンスにしたがいます。  
その他の他者の著作物についてもそのライセンスに従います。  
tignear(tig#2552)の制作部分はUnlicenseです。  
アイコンの利用は許可しません。  

## 制作
プログラム: tignear(tig#2552)  
アイコン: 匿名希望らしいので伏せておきます…