# Changelog

Also see **[GitHub releases](https://github.com/dominique-mueller/automatic-release/releases)**.

<br>

## [1.1.1](https://github.com/dominique-mueller/automatic-release/releases/tag/1.1.1) (2018-03-24)

### Bug Fixes

* **changelog:** Fix commit group order ([#88](https://github.com/dominique-mueller/automatic-release/issues/88)) ([425fdf2](https://github.com/dominique-mueller/automatic-release/commit/425fdf2))
* **changelog:** Ignore chore & build & ci commits ([#87](https://github.com/dominique-mueller/automatic-release/issues/87)) ([dc1360c](https://github.com/dominique-mueller/automatic-release/commit/dc1360c)), closes [#85](https://github.com/dominique-mueller/automatic-release/issues/85)

<br>

## [1.1.0](https://github.com/dominique-mueller/automatic-release/releases/tag/1.1.0) (2017-11-12)

### Features

* **bin:** Add binary execution file ([#27](https://github.com/dominique-mueller/automatic-release/issues/27)) ([c26c8e3](https://github.com/dominique-mueller/automatic-release/commit/c26c8e3))
* **collect-information:** Add information validation & correction ([#20](https://github.com/dominique-mueller/automatic-release/issues/20)) ([3ba67fb](https://github.com/dominique-mueller/automatic-release/commit/3ba67fb))
* **error-handling:** Add proper error handling ([#23](https://github.com/dominique-mueller/automatic-release/issues/23)) ([a74b41e](https://github.com/dominique-mueller/automatic-release/commit/a74b41e))
* **logging:** Add detailed logger ([#26](https://github.com/dominique-mueller/automatic-release/issues/26)) ([4b7076a](https://github.com/dominique-mueller/automatic-release/commit/4b7076a))

### Bug Fixes

* **version:** Fix first version releases ([#21](https://github.com/dominique-mueller/automatic-release/issues/21)) ([db41a40](https://github.com/dominique-mueller/automatic-release/commit/db41a40))

### Documentation

* **README:** Update README, update screenshot ([#51](https://github.com/dominique-mueller/automatic-release/issues/51)) ([a32fd4d](https://github.com/dominique-mueller/automatic-release/commit/a32fd4d))

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

### Documentation

* **readme:** Update documentation ([6c13de5](https://github.com/dominique-mueller/automatic-release/commit/6c13de5))

<br>

## [1.0.0](https://github.com/dominique-mueller/automatic-release/releases/tag/1.0.0) (2017-04-02)

**Initial release**
