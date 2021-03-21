# Guild Utils J [![Maintainability](https://api.codeclimate.com/v1/badges/7efee648848d0961d200/maintainability)](https://codeclimate.com/github/guild-utils/bot/maintainability)
ごく普通の読み上げbotです。

## How to run
kubernetesを使います。
```
# grpcの認証関係(ホントはkeyとかsecret使ったほうがいい気もする)
kubectl create configmap --from-file=../client-keys
kubectl create configmap --from-file=../server-keys

# mixerをdeploy
kubectl apply -f deploy-mixer.yaml

# discordのtokenとmongodbの設定
cd kubernetes
kubectl apply -f secret.yaml
# mongodbのstorageの永続化に関する設定
kubectl apply -f storage-database.yaml
# mongodbをdeploy
kubectl apply -f deploy-database.yaml

# botをすべてまとめてdeploy
kubectl apply -f deploy-bots.yaml
```
## ロードマップ

### v1
- 辞書のインポート、エクスポート。☑
- 読み上げ設定インポート、エクスポート。☑
- 読み上げ設定ガチャ。☑
- 読み上げ設定プリセット。(コマンド一つで声を変えれるように)
- DMでの音声生成。
- Embed Viewによる表示。☑
- CI☑
- 読み上げ時間の制限
## v2
- OpenJTalkを改造してjumanppを用いて喋るようにする。
- Web Dashboard
- スケジューリング機能のDSLを根本的に改善する(GoogleSpreadSheetを使い続けるかも要検討)

## ライセンス
htsvoice、OpenJTalk、HTS Engine API、Jumanpp、kuromoji-js、klasa-member-gatewayについてはそれぞれのライセンスにしたがいます。  
その他の他者の著作物についてもそのライセンスに従います。  
tignear(tig#2552)の制作部分はUnlicenseです。  

## 制作
プログラム: tignear(tig#2552)  
