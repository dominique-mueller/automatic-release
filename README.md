<div align="center">

# automatic-release

**Automates the release process for GitHub projects.**

[![npm version](https://img.shields.io/npm/v/automatic-release.svg?maxAge=3600&style=flat)](https://www.npmjs.com/package/automatic-release)
[![dependency status](https://img.shields.io/david/dominique-mueller/automatic-release.svg?maxAge=3600&style=flat)](https://david-dm.org/dominique-mueller/automatic-release)
[![travis ci build status](https://img.shields.io/travis/dominique-mueller/automatic-release/master.svg?maxAge=3600&style=flat)](https://travis-ci.org/dominique-mueller/automatic-release)
[![Codecov](https://img.shields.io/codecov/c/github/dominique-mueller/automatic-release.svg?maxAge=3600&style=flat)](https://codecov.io/gh/dominique-mueller/automatic-release)
[![Known Vulnerabilities](https://snyk.io/test/github/dominique-mueller/automatic-release/badge.svg)](https://snyk.io/test/github/dominique-mueller/automatic-release)
[![license](https://img.shields.io/npm/l/automatic-release.svg?maxAge=3600&style=flat)](https://github.com/dominique-mueller/automatic-release/LICENSE)

</div>

<br>

## What it does

WHY - HOW - WHAT

Long story short, **automatic release** is a NodeJS-based command line tool which makes the usually long and complex task of publishing new releases a "matter of one click".


 automates the release process for GitHub projects by:

- updating version numbers
- generating a changelog
- creating GitHub releases

When used in combination with the **Git Flow** branching model and a Continuous Integration platform such as **Travis CI**, releasing a library to NPM & GitHub gets as easy as merging the latest development state into the `master` branch.

TODO: Animated GIF

<br>

## How to install

To get **automatic-release** via **npm**, simply add it as a new dev-dependency to your `package.json` file and run `npm install`. Alternatively, run the following command:

``` bash
npm install automatic-release --save-dev
```

**Requirements**

- Make sure to at least use **NodeJS 7.6** (or higher). *This is required due to **automatic-release** using the async-await functionality internally. Earlier 7-ish versions of NodeJS (versions ranging from 7.0 to 7.5) can also be used - however, running **automatic-release** together with the `--harmony-async-await` flag is necessary then.*

- **automatic-release** expects a `package.json` and a `CHANGELOG.md` file at the project root level. Furthermore, the `package.json` file should at least define a name, a version, and a repository URL.

<br>

## How to use

### Following a Git Commit Convention

Internally, **automatic-release** analyzes the commit history in order to evaluate the next version as well as generate the changelog. To make this work, developers have to follow a specific convention when making commits. Such a convention often consists of a commit message (including the commit type, scope, and change message), a commit body (with further details), and a commit footer (describing breaking changes or listing issues this commit fixes).

As of now, this project expects the **Angular Commit Message Format** to be used. Read the full Angular commit message guidelines **[right here](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines)**. To give you a first impression, commits following this convention look similar to the following:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

> **Tip:** Not every commit *has* to follow this convention. Instead, it's probably better to squash commits of a Pull Request before merging, and then only name the PR merge commit after the naming convention.

### Using Git Flow

Also, following the **Git Flow** branching model is highly recommended. In short, **Git Flow** proposes a number of branch types, such as the *master* branch (containing the latest release), the *develop* branch (as the "master during development"), and multiple *feature & bugfix branches* (to enable developers to work in a parallel manner). Utilizing this concept allows us to simplify the overall release process significantly (amongst further advantages for the overall development workflow).

However, you are not forces to use all the branches **Git Flow** proposes - **automatic-release** expects at least the follwing branches to be used in their correct way:

- **master** branch, contains the latest release
- **develop** branch, the main development branch

> To get to know more about the **Git Flow** concept and what advantages it brings to the table, continue reading **[this article](http://nvie.com/posts/a-successful-git-branching-model/)**.

<br>

## Integration with Travis CI

### Step 1: Setup repository for Travis CI

First of all, setup Travis CI for your GitHub repository. This includes:

- having a Travis CI account connected to your GitHub account
- enabling the GitHub repository for Travis CI
- having a `.travis.yml` configuration file set up

> For further details on how to setup Travis CI, continue reading the official **[Getting Started](https://docs.travis-ci.com/user/getting-started/)** guide.

### Step 2: Add Environment Variables

Within Travis CI, add the following **Environment Variables** for your GitHub repository (in the *Settings* section):

- `GH_TOKEN`: This environment variable defines the **GitHub Access Token**, needed by **automatic-release** to push commits & tags to GitHub as well as create releases. To generate such a token, visit your **[Personal Access Tokens](https://github.com/settings/tokens)** page, and generate a new token with the *repo* scope being enabled.
- `NPM_TOKEN`: This environment variable contains the **NPM Authentication Token**, needed by Travis CI to deploy your library to the official public NPM registry. Getting this token is as simple as logging into your NPM account locally, and taking the `authToken` from your `.npmrc` file. More specific instructions can be found **[right here](http://blog.npmjs.org/post/118393368555/deploying-with-npm-private-modules)**.

### Step 3: Extend Travis CI configuration file

Now, extend your `.travis.yml` configuration file with the following steps (replacing the `<...>` parts with real data):

- Upfront, make sure the `master` branch is included in the `branches` block, so that a push to (merge from `develop` into) `master` actually triggers a release. For example:
	``` yml
	branches:
	  only:
	    - master # Used for publishing releases automatically
	    - develop
	```
- Then (at least for the release process) we have to make Travis CI clone the whole repository - instead just of the master branch. Reason is that **automatic-release** needs access to both the *master* and *develop* branches to finish up the release process. Travis CI, however, will only checkout specific commits / branches by default. To fix this, extend the `before_install` block:
	``` yml
	before_install:
	  - if [ "$TRAVIS_BRANCH" == "master" ]; then
          git clone "https://github.com/$TRAVIS_REPO_SLUG.git" "$TRAVIS_REPO_SLUG";
          cd "$TRAVIS_REPO_SLUG";
          git checkout -qf "$TRAVIS_COMMIT";
        fi
	```
	> Solution inspired by **[this discussion on StackOverflow](http://stackoverflow.com/questions/32580821/how-can-i-customize-override-the-git-clone-step-in-travis-ci)**.
- Now, we have to configure Git (and fix Git-related Travis CI issues), and then run the **automatic-release** process, by extending the `before_deploy` block:
	``` yml
	before_deploy:
	  - git config --global user.name "<GITHUB_USER_NAME>" # Replace!
	  - git config --global user.email "<GITHUB_USER_EMAIL>" # Replace!
	  - git config credential.helper "store --file=.git/credentials"
	  - echo "https://$GH_TOKEN:@github.com" > .git/credentials
	  - git checkout master
	  - npm run automatic-release # Here happens the magic
	```
	> To make `npm run automatic-release` work, you have to add `"automatic-release": "automatic-release"` to the `scripts` block in your `package.json` file.
- Finally, add your `deploy` block - in this case deploying directly to the public NPM registry:
	``` yml
	deploy:
	  provider: npm
	  email: <NPM_USER_EMAIL> # Replace!
	  api_key: "$NPM_TOKEN"
	  skip_cleanup: true
	  on:
	    branch: master
	    repo: <GITHUB_REPO_USER>/<GITHUB_REPO_NAME> # Replace!
	```

<br>

## Recommended additions

Besides this library, there are a lot of other tools out there related to automatic releases / deployments. The following are a few I can recommend, and which perfectly complement the **automatic-release** library.

- **[pkgfiles](https://github.com/timoxley/pkgfiles)** logs out a list of all the files to be published to npm, depending on the .npmignore / .gitignore settings. You can use it upfront to verify that the release will be complete. It's also quite nice to run it within the `after_deploy` block of the `.travis.yml` file, in which case it looks more like it lists the successfully published files.

<br>

## Idea Space

Right now, this tool is rather basic; there are lots of features & enhancements that would be nice to have, such as:

- Different types of logging output (e.g. minimal, compact, verbose, ...)
- Configurability (e.g. what process parts to execute, which settings to use, ...)
- Make it work with other services (e.g. BitBucket, GitLab, ...)

> You can't wait for one of those features, or have some new ideas?<br>Simply **[create an issue](https://github.com/dominique-mueller/automatic-release/issues/new)**. Also, contributions to this project are highly welcomed at all time!

<br>

## Creator

**Dominique Müller**

- E-Mail: **[dominique.m.mueller@gmail.com](mailto:dominique.m.mueller@gmail.com)**
- Website: **[www.devdom.io](https://www.devdom.io/)**
- Twitter: **[@itsdevdom](https://twitter.com/itsdevdom)**
