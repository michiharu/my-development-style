---
title: 'Astro を github-pages にデプロイしてみた'
description: 'Bun + Astro + Github Action で Github Pages にデプロイした手順について書きます。'
pubDate: '2023-09-18'
heroImage: '/blog-placeholder-1.jpg'
---

記念すべき最初の記事は、このサイトの作り方です。『鉄は熱いうちに打て』ということで忘れないうちに記事にしておきたいと思います。

使用している技術は次の通りです。

- Bun
  - 世界的ですもんね　乗るしかない　このビッグウェーブに
- Astro
  - Docusaurusよりも勢いを感じる
- GitHub Pages
  - 無料
- TypeScript
  - インターフェースが分かりやすいコードが好き
- VSCode
  - いつもの。Vim とか使いこなせないので。

リポジトリは[こちら](https://github.com/michiharu/my-way)です。
ちなみに Bun と Astro は初体験です。

## 環境構築

VSCodeはインストール済みとして進めます。

### Bun のインストール

私はmacOSなので[公式ページの方法](https://bun.sh/)でインストールしました。

```zsh
curl -fsSL https://bun.sh/install | bash
bun -v
1.0.2
```

### Bun + Astro でプロジェクトの作成

Bun側とAstro側にそれぞれ記事があります。

- [Bun: Build an app with Astro and Bun](https://bun.sh/guides/ecosystem/astro)
- [Astro: Use Bun with Astro](https://docs.astro.build/ja/recipes/bun/)

私はBun側の記事を参考に以下のコマンドを実行しました。

```bash
bun create astro
```

いくつか質問されますが、今回の記事で重要なのは以下の２つです。

- 初期テンプレート: ブログ
- TypeScriptを使う予定か: Yes

## Github Pagesへのデプロイ設定

ここからはVSCodeを開いて作業しました。

まずはブラウザー([http://localhost:4321](http://localhost:4321))で確認できるようにしておきます。

```bash
bun run dev
```

Github Pagesへのデプロイ設定には、次の２点がポイントです。

- GitHub Pagesはサブディレクトリへ配置される
- GitHub Pagesのページリンクは、末尾の`/`(trailing slash)が必須

### `astro.config.mjs`の編集

[公式ドキュメントはこちら](https://docs.astro.build/ja/guides/deploy/github/)です。

`michiharu`はGitHubのユーザーID、`my-way`はリポジトリ名に変更します。
適宜ご自身の環境に合わせて読み替えてください。

```diff
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://michiharu.github.io',
  base: '/my-way',
})
```

また trailing slash についてはそのままでも動きますが、
暗黙的な振る舞いはバグを生みやすいので`trailingSlash: 'always'`を設定しましょう。
設定しておけば「ローカルでは表示されていたのにデプロイしたら404」という不具合を防げます。

```diff
import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://astronaut.github.io',
  base: '/my-way',
+ trailingSlash: 'always',
})
```

### 各リンクの修正

GitHub Pagesにデプロイされるということは、サブディレクトリに配置されるということです。
そのためリンクはすべてサブディレクトリを含む必要があります。

`astro.config.mjs`の`base`は`import.meta.env.BASE_URL`から参照できるので、
次のような関数で`import.meta.env.BASE_URL`の参照を共通化しました。

````typescript
/**
 * ```typescript
 * url('/blog/') => '/my-way/blog/'
 * url('/image.png') => '/my-way/image.png'
 * ```
 */
export const url = (path: `/${string}` | undefined) => {
  if (path === undefined) return undefined;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
};
````

URLの修正ポイントはいくつもあるので、リンクをポチポチしながら修正が必要なところを探してください。

上記`url`関数を使用する修正例を２つ紹介します。

`Header.astro`の修正例

```diff
...
    <div class="internal-links">
-     <HeaderLink href="/">Home</HeaderLink>
-     <HeaderLink href="/blog">Blog</HeaderLink>
-     <HeaderLink href="/about">About</HeaderLink>
+     <HeaderLink href={url('/')}>Home</HeaderLink>
+     <HeaderLink href={url('/blog/')}>Blog</HeaderLink>
+     <HeaderLink href={url('/about/')}>About</HeaderLink>
    </div>
...
```

`BlogPost.astro`の修正例

```diff
...
import { url } from '../funcs';
...
- const { title, description, pubDate, updatedDate, heroImage } = Astro.props;
+ const { title, description, pubDate, updatedDate } = Astro.props;
+ const heroImage = url(Astro.props.heroImage);
...
```

またブラウザーのコンソールを開いていないと忘れがちなのが、CSSに記述されたフォントのリンクです。

以下、`global.css`の修正例です。スマートな書き方がわからなかったので直接デプロイ予定のレポジトリ名を含めています。

```diff
...
@font-face {
  font-family: 'Atkinson';
- src: url('/fonts/atkinson-regular.woff') format('woff');
+ src: url('/my-way/fonts/atkinson-regular.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'Atkinson';
- src: url('/fonts/atkinson-bold.woff') format('woff');
+ src: url('/my-way/fonts/atkinson-bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
...
```

### GitHub Actions の設定

[公式ドキュメント](https://docs.astro.build/ja/guides/deploy/github/)の`deploy.yml`を、
`.github/workflows/deploy.yml`に配置します。

```yml
name: Deploy to GitHub Pages

on:
  # Trigger the workflow every time you push to the `main` branch
  # Using a different branch name? Replace `main` with your branch’s name
  push:
    branches: [main]
  # Allows you to run this workflow manually from the Actions tab on GitHub.
  workflow_dispatch:

# Allow this job to clone the repo and create a page deployment
permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout your repository using git
        uses: actions/checkout@v3
      - name: Install, build, and upload your site
        uses: withastro/action@v0
        # with:
        # path: . # The root location of your Astro project inside the repository. (optional)
        # node-version: 20 # The specific version of Node that should be used to build your site. Defaults to 16. (optional)
        # package-manager: yarn # The Node package manager that should be used to install dependencies and build your site. Automatically detected based on your lockfile. (optional)

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v1
```

コメントアウトされている`with:`のオプションは使用しなくても、
`bun install`が実行され GitHub Pagesへデプロイされました。
