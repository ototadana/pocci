PoCCi
=====

Docker コンテナを使った CIサービス構築の試作。

![Services](./services-gitlab.png)

[English](./README.md)

必須ソフトウェア
----------------
*   [Docker](https://www.docker.com/)
*   [Docker Compose](https://github.com/docker/compose/)

利用法
------
1.  このリポジトリをクローンする。

    ```bash
    git clone https://github.com/ototadana/pocci.git
    cd pocci
    ```

2.  ビルドを行う。

    ```bash
    cd bin
    bash ./build
    ```

3.  `generate-config-from-template` を実行して `config` ディレクトリを作成する。

    ```bash
    ./generate-config-from-template
    ```

4.  `config` ディレクトリに作成されたファイルを確認し、必要に応じて編集する。

    ```
    config/
      - code/               ... サンプルコード
      - nginx/              ... Nginx リバースプロキシ設定
      - docker-compose.yml  ... サービス構成 (Docker Compose 形式)
      - jenkins-slaves.yml  ... Jenkins スレーブノード (Docker Compose 形式)
      - setup.yml           ... ユーザー設定
    ```

5.  `create-service` を実行してサービスの作成と開始を行う。

    ```bash
    ./create-service
    ```

6.  `apply-user-settings` を実行してユーザー設定 (`setup.yml`) を適用する。

    ```bash
    ./apply-user-settings
    ```

7.  以下の URL にアクセスしてサービスを利用する。

    *   http://localhost/ ... GitLab / ALMinium (Redmine)
    *   http://localhost/jenkins ... Jenkins
    *   http://localhost/sonar ... SonarQube
    *   http://localhost/ldap ... phpLDAPadmin


利用者
------
### 管理者
サービス     | ユーザー名                 | パスワード
------------ | -------------------------- | --------
GitLab       | root                       | 5iveL!fe
ALMinium     | admin                      | admin
SonarQube    | admin                      | admin
phpLDAPadmin | cn=admin,dc=example,dc=com | admin

### 開発者
ユーザー名 | パスワード
---------- | --------
jenkinsci  | password
bouze      | password
