---
title: "【悲報】Switchbot hubさん放っておくとオフラインになって温度管理を放棄する"
description: "はじめに &nbsp;　Switchbot hubという各社の赤外線リモコンを学習してAlexaやらSiriやらGoogleHomeに送信したり出来る安価な製品がある。よくAmazonのセールで安くな…"
published: 2021-12-03
tags: ["misc"]
---

<img src="https://blogger.googleusercontent.com/img/a/AVvXsEhLjl_Lb5iilsHMPwbKBC24hQhcTZ13ARBR0vDoYyoM_iiuFNznse8HNaYosfKw2mvDUV3EJi0m7NYqMd-tUaT0dhk7yXDdJ8Q8ok3tKKmNTbJH7xwQfxqa59rKunALHBTr0xOvHGfTJXCqZnRrQDx08-wmjgjaKLDuUH5qLRUjNDQcORA8w9cWic43=s320" alt="" loading="lazy"><h2>はじめに</h2><p>&nbsp;　Switchbot hubという各社の赤外線リモコンを学習してAlexaやらSiriやらGoogleHomeに送信したり出来る安価な製品がある。よくAmazonのセールで安くなることが多くてゲットしやすい環境にあるこやつなのだ。<br />　温度センサーとエアコンを組み合わせて、XX度以下ならつける。XX度以上になったら消す。とかいい感じに調整が効くはずなのだが、実際には思うように動作してはくれない。アレクサに命令を出すはずのSwitchbotHUB自身が余裕でオフライン状態になるからだ。スマホのアプリを起動するとようやくオンラインになる始末。これはひどい。<br></p><h2>だったらどうする？</h2><p>　まず、<a href="https://dream-soft.mydns.jp/blog/developper/smarthome/2021/03/2932/">naka-kazzさんのサイト</a>を参考にRaspberry PiからAlexaをコントロールできるようにしておく。たまたまSwitchbotHUBからリモコンが届かない機器があったので、そいつに向かってリモコンを押す命令を出すダミーの定型アクションを作成。あとはRaspberry Piから1時間に１回程度でダミーの定型アクションをキックするcronを仕込めばOK。OK,だよな？</p><p>というわけで、現在テスト中ですw</p>
