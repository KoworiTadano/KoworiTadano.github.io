---
title: "【悲報】SwitchbotHUBさん。仕事放棄の裏に悪い男の影？"
description: "なろう小説みたいなチャラ男が介入というわけでもなく 　そもそもオフライン状態というのが理解できていなくて、Bluetoothの届く範囲に機械はあって、それ以外にもWifiネットワークには接続できている…"
published: 2021-12-09
tags: []
---

<img src="https://blogger.googleusercontent.com/img/a/AVvXsEipVNo96-d7VzZN2zGaYYoJcy6MPoaIVqSk1aCETl2ANw515-O9hLmokdJ87dpkGLP0etGf1v4FCczmd_Zc1bOo0MVYFtrKPn7Rl5BB1MCyLohUIZsnzGW-GuHFDlAppBmjdwklB48YOOxWH2kNivrL5fe2S-BCkVig23NDzUf7lb0WkVqfNeul8LEY=w400-h266" alt="" loading="lazy"><h2>なろう小説みたいなチャラ男が介入というわけでもなく</h2><p>　そもそもオフライン状態というのが理解できていなくて、Bluetoothの届く範囲に機械はあって、それ以外にもWifiネットワークには接続できている、購入してそれほど時間が経っていない、筐体が熱を持っているでもなし、Switchbot HUBさんが急に仕事しなくなったのはハードウェアの問題じゃないんじゃね？と思って、Switchbotアプリから履歴を確認してみると内部エラー(190)が多発しているのが見えてきた。当然秒速でググるわけなんだけど先人の情報から、サービスのバックエンドで動いていたAWSの障害によるものじゃないか？という疑惑が出てきよった。</p><p>　あらためてAWSの情報を確認してみると、確かに大規模な障害が発生していたとのこと。SwitchbotのTwitterにも障害が発生していると報告が上がっていた。まじか。自分の使っている機器のバックエンドにどんなクラウドサービスが採用されているかなんてユーザーの立場ではクソ興味ないから完全にスルーしていた！</p><h2>現在の状態</h2><p>　SwitchbotのTwitterから障害復旧の報告が上がるのを待つ。それまで放置</p><h2>今回の教訓</h2><ol><li>後ろにいるサービスが死んだらIoT機器も死ぬ</li><li>シングルポイントだという前提で動こう</li><li>手動で運用する方法も考えておこう</li></ol>
