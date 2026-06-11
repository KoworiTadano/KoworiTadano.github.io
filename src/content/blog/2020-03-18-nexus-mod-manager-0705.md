---
title: "Nexus Mod Manager (0.70.5)でログインが出来ない場合"
description: "この記事は古い情報が記載されています。最新のアプリでは必要のない作業と考えられます。参考情報にとどめておいてください。 何かアップデートしたらログイン出来ないんですけど？ 　しばらくNMMを起動してい…"
published: 2020-03-18
tags: ["games"]
---

<p>この記事は古い情報が記載されています。最新のアプリでは必要のない作業と考えられます。参考情報にとどめておいてください。</p><h2>何かアップデートしたらログイン出来ないんですけど？</h2><p>　しばらくNMMを起動していなかったので全く気付かなかったのだが、NMMは開発終了になっていて、Nexus Modsサイトの情報を引っ張るようなアプリケーションを利用するにはNexus Mods APIってWEBAPIを使うことになっていたみたいです。</p><p>で、我らがNMMはコミュニティ版として版を重ねていて、今のところVersion0.70.5まで上がっていました。NMMを使い慣れていた私は更新をかけたのですが、”authentication failed due to netowork issues” とか言われてログイン出来ないんですよ。もう怒髪天ですよ。</p><h2>回避手順</h2><p>1. Nexus Modsサイトに行ってAPIキーを取得する</p><p>&nbsp; &nbsp; - Nexus Mods / My Nexus accountのAPIタブをクリック</p><p>&nbsp; &nbsp; - NEXUS MOD MANAGER 行の「REQUEST AN API KEY」をクリック</p><p>&nbsp; &nbsp; - 「Copy API Key」ボタンをクリックしてクリップボードに保存するか、手動で適当なところに保存する</p><p>2. %LOCALAPPDATA%\Black_Tree_Gaming\NexusClient.exe_&lt;何かの文字列&gt;\&lt;Version&gt; にある user.config を編集。これは普通のXMLなので適当にお作法に則って編集しておこう。</p><blockquote><h3>変更前</h3></blockquote><p>&nbsp; &nbsp; &nbsp; &nbsp; &lt;setting name="ApiKey" serializeAs="String"&gt;</p><p>&nbsp; &nbsp; &nbsp; &nbsp; &lt;value/&gt;</p><p>&nbsp; &nbsp; &nbsp; &nbsp; &lt;/setting&gt;</p><blockquote><h3>変更後</h3></blockquote><p>&nbsp; &nbsp; &nbsp; &nbsp; &lt;setting name="ApiKey" serializeAs="String"&gt;</p><p>&nbsp; &nbsp; &nbsp; &nbsp; &lt;value&gt;クリップボードに保存してあるAPIキーを張り付ける&lt;/value&gt;</p><p>&nbsp; &nbsp; &nbsp; &nbsp; &lt;/setting&gt;</p><p>これでログイン出来るようになると思うので、同じように怒髪天になっていた人は自己責任で試してほしい</p>
