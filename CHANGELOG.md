# Changelog

Also see the **[release page](https://github.com/dominique-mueller/automatic-release/releases)**.

<br>

## [1.1.0](https://github.com/dominique-mueller/automatic-release/releases/tag/1.1.0) (2017-11-12)

### Bug Fixes

* **version:** Fix first version releases ([#21](https://github.com/dominique-mueller/automatic-release/issues/21)) ([db41a40](https://github.com/dominique-mueller/automatic-release/commit/db41a40))

### Chores

* **build:** Add copy task for changelog templates ([#24](https://github.com/dominique-mueller/automatic-release/issues/24)) ([40005b4](https://github.com/dominique-mueller/automatic-release/commit/40005b4))
* **build:** Update build process, update Travis CI configuration ([#22](https://github.com/dominique-mueller/automatic-release/issues/22)) ([8813dfe](https://github.com/dominique-mueller/automatic-release/commit/8813dfe))
* **build:** Update tsconfig, update NodeJS ([#52](https://github.com/dominique-mueller/automatic-release/issues/52)) ([f3e3c46](https://github.com/dominique-mueller/automatic-release/commit/f3e3c46))
* **ci:** Update NodeJS, improve Travis CI script performance ([#18](https://github.com/dominique-mueller/automatic-release/issues/18)) ([c5af992](https://github.com/dominique-mueller/automatic-release/commit/c5af992))
* **dependencies:** Update dependencies and devDependencies ([#42](https://github.com/dominique-mueller/automatic-release/issues/42)) ([7b8efbd](https://github.com/dominique-mueller/automatic-release/commit/7b8efbd))
* **dependencies:** Update dependencies, add package json lock file ([#17](https://github.com/dominique-mueller/automatic-release/issues/17)) ([2d962fa](https://github.com/dominique-mueller/automatic-release/commit/2d962fa))
* **dependencies:** Update simple-git and ts-jest ([#53](https://github.com/dominique-mueller/automatic-release/issues/53)) ([d0711c9](https://github.com/dominique-mueller/automatic-release/commit/d0711c9))
* **dependencies:** Upgrade dependencies, fix implementation & tests ([#48](https://github.com/dominique-mueller/automatic-release/issues/48)) ([af5cebd](https://github.com/dominique-mueller/automatic-release/commit/af5cebd))
* **travis:** Introduce Travis CI build stages & Codecov ([#45](https://github.com/dominique-mueller/automatic-release/issues/45)) ([016c956](https://github.com/dominique-mueller/automatic-release/commit/016c956))

### Documentation

* **README:** Update README, update screenshot ([#51](https://github.com/dominique-mueller/automatic-release/issues/51)) ([a32fd4d](https://github.com/dominique-mueller/automatic-release/commit/a32fd4d))

### Features

* **bin:** Add binary execution file ([#27](https://github.com/dominique-mueller/automatic-release/issues/27)) ([c26c8e3](https://github.com/dominique-mueller/automatic-release/commit/c26c8e3))
* **collect-information:** Add information validation & correction ([#20](https://github.com/dominique-mueller/automatic-release/issues/20)) ([3ba67fb](https://github.com/dominique-mueller/automatic-release/commit/3ba67fb))
* **error-handling:** Add proper error handling ([#23](https://github.com/dominique-mueller/automatic-release/issues/23)) ([a74b41e](https://github.com/dominique-mueller/automatic-release/commit/a74b41e))
* **logging:** Add detailed logger ([#26](https://github.com/dominique-mueller/automatic-release/issues/26)) ([4b7076a](https://github.com/dominique-mueller/automatic-release/commit/4b7076a))

### Refactoring

* Rewrite library in TypeScript ([#19](https://github.com/dominique-mueller/automatic-release/issues/19)) ([378f98f](https://github.com/dominique-mueller/automatic-release/commit/378f98f))
* Simplify async-await, remove correction, refactor tests ([#39](https://github.com/dominique-mueller/automatic-release/issues/39)) ([ecd194d](https://github.com/dominique-mueller/automatic-release/commit/ecd194d))
* **information:** Refactor information step test ([#33](https://github.com/dominique-mueller/automatic-release/issues/33)) ([528ed66](https://github.com/dominique-mueller/automatic-release/commit/528ed66))

### Tests

* Add first end-to-end test ([#37](https://github.com/dominique-mueller/automatic-release/issues/37)) ([8732a66](https://github.com/dominique-mueller/automatic-release/commit/8732a66))
* Force GitHub contribution recounting after test execution ([#44](https://github.com/dominique-mueller/automatic-release/issues/44)) ([fc62e9f](https://github.com/dominique-mueller/automatic-release/commit/fc62e9f))
* Refactor test utilities and shared test logic ([#38](https://github.com/dominique-mueller/automatic-release/issues/38)) ([91f95dd](https://github.com/dominique-mueller/automatic-release/commit/91f95dd))
* **e2e:** Extend e2e test to cover second release ([#41](https://github.com/dominique-mueller/automatic-release/issues/41)) ([b8e55b2](https://github.com/dominique-mueller/automatic-release/commit/b8e55b2))
* **errors:** Add test cases for error handling ([#43](https://github.com/dominique-mueller/automatic-release/issues/43)) ([05b3f87](https://github.com/dominique-mueller/automatic-release/commit/05b3f87))
* **information:** Add collect information unit tests ([#31](https://github.com/dominique-mueller/automatic-release/issues/31)) ([e7ae2e4](https://github.com/dominique-mueller/automatic-release/commit/e7ae2e4))
* **package-json, information:** Add package-json tests, extend information tests ([#34](https://github.com/dominique-mueller/automatic-release/issues/34)) ([5a07211](https://github.com/dominique-mueller/automatic-release/commit/5a07211))

<br>

## [1.0.5](https://github.com/dominique-mueller/automatic-release/releases/tag/1.0.5) (2017-04-14)

### Bug Fixes

* **github-release:** Fix error occuring while removing old github releases before creating new github releases ([#13](https://github.com/dominique-mueller/automatic-release/issues/13)) ([28efaf7](https://github.com/dominique-mueller/automatic-release/commit/28efaf7))

### Chores

* **travis:** Add Greenkeeper ([#12](https://github.com/dominique-mueller/automatic-release/issues/12)) ([7e08c13](https://github.com/dominique-mueller/automatic-release/commit/7e08c13))

<br>

## [1.0.4](https://github.com/dominique-mueller/automatic-release/releases/tag/1.0.4) (2017-04-08)

### Bug Fixes

* **github-release:** Clean all releases, then create all releases from scratch ([#11](https://github.com/dominique-mueller/automatic-release/issues/11)) ([12448ae](https://github.com/dominique-mueller/automatic-release/commit/12448ae))

<br>

## [1.0.3](https://github.com/dominique-mueller/automatic-release/releases/tag/1.0.3) (2017-04-08)

### Bug Fixes

* **changelog:** Update changelog content & design ([#10](https://github.com/dominique-mueller/automatic-release/issues/10)) ([9d59a87](https://github.com/dominique-mueller/automatic-release/commit/9d59a87))
* **github-release:** Fix github releaser to always create all releases ([fae31c3](https://github.com/dominique-mueller/automatic-release/commit/fae31c3))

<br>

## [1.0.2](https://github.com/dominique-mueller/automatic-release/releases/tag/1.0.2) (2017-04-06)

### Bug Fixes

* **changelog:** Fix changelog layout ([05124b7](https://github.com/dominique-mueller/automatic-release/commit/05124b7))

<br>

## [1.0.1](https://github.com/dominique-mueller/automatic-release/releases/tag/1.0.1) (2017-04-06)

### Bug Fixes

* **error:** Fix error handling, add empty CHANGELOG file ([886066f](https://github.com/dominique-mueller/automatic-release/commit/886066f))
* **error:** Fix error messages, add exit code ([81ce235](https://github.com/dominique-mueller/automatic-release/commit/81ce235))
* **prepare:** Fix broken preparing phase, refactor error handling ([452f19b](https://github.com/dominique-mueller/automatic-release/commit/452f19b))

### Chores

* **release:** Add automatic release process for library ([78832cd](https://github.com/dominique-mueller/automatic-release/commit/78832cd))

### Documentation

* **readme:** Update documentation ([6c13de5](https://github.com/dominique-mueller/automatic-release/commit/6c13de5))

<br>

## [1.0.0](https://github.com/dominique-mueller/automatic-release/releases/tag/1.0.0) (2017-04-02)

### Chores

* **travis:** Add Travis CI configuration ([fa956b2](https://github.com/dominique-mueller/automatic-release/commit/fa956b2))

### Features

* Add initial version ([d09f9d0](https://github.com/dominique-mueller/automatic-release/commit/d09f9d0))

<br>

---

<sup>*Changelog generated automatically by [automatic-release](https://github.com/dominique-mueller/automatic-release).*</sup>
