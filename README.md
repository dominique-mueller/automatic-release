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

<br><br>

## What it does

Creating and managing projects on GitHub usually requires lots of time and effort. When developing libraries, in particular, the tasks
required for publishing new releases are often very long, complex, and error-prone.

Meet **automatic-release**, a NodeJS-based command line tool which makes new library releases "a matter of a single click", allowing
developers to focus on the important things - developing! **automatic-release** achieves that by automating the whole release process. This
includes

- incrementing version numbers,
- generating changelogs,
- creating Git tags,
- and creating GitHub releases.

> Once following the **Git Flow** branching model and the Angular **Git Commit Conventions** as well as using a Continuous Integration
> platform such as **Travis CI**, publishing a new library release to NPM & GitHub gets as simple as merging the latest `develop` state into
> the `master` branch.

![Automatic Release Preview](/docs/preview.png?raw=true)

<br><br>

## How to install

You can get **automatic-release** via **npm** by either adding it as a new devDependency to your `package.json` file and running
`npm install`, or running the following command:

``` bash
npm install automatic-release --save-dev
```

### Requirements

- **automatic-release** requires at least **NodeJS 7.6** (or higher). *Earlier 7.x versions of NodeJS (7.0 to 7.5) might also work when
executing **automatic-release** using the `--harmony-async-await` flag.*

- **automatic-release** expects a `package.json` and a `CHANGELOG.md` file at the project root. Further on, the `package.json` file should
at least contain a package name, a version, and a valid GitHub repository URL.

<br><br>

## How to use

### Following the (Angular) Git Commit Convention

Internally, **automatic-release** analyzes the commit history in order to evaluate version numbers and generate changelogs. To make this
work, developers must follow a specific convention when making commits. Such a commit convention usually describes the structure and naming
of the commit message (type, scope, message), the commit body (further details), and the commit footer (breaking changes, issues this commit
fixes).

As of now, **automatic-release** expects the **Angular Commit Message Format** to be used. For more details, read the full **[Angular Commit Message Guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#-commit-message-guidelines)**. In short, commits following this convention look like the following:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

> **Quick Tip:** I personally do not recommend forcing developers to follow this convention for every single commit, as this might lead to
less commits being made in general. Instead, it's probably better to squash commits when merging PRs, and then only name the PR merge commit
after the naming convention.

<br>

### Using Git Flow

Moreover, following the **Git Flow** branching model is highly recommended. To summarize, **Git Flow** proposes a number of branch types
such as the *master* branch (containing the latest release), the *develop* branch (as the "master during development"), and multiple
*feature & bugfix branches* (enabling developers to work in parallel). For more details, continue reading at
**[A successful Git branching model](http://nvie.com/posts/a-successful-git-branching-model/)**.

Utilizing this concept simplifies the release management significantly (amongst further advantages it has for the overall development
workflow). However, **automatic-release** does not require all the branches **Git Flow** proposes to exist. It only expects the following
two branches to exist and get used correctly:

- the **master** branch, containing the latest (published) release
- the **develop** branch as the main development branch

> **Quick Tip:** Makde the **develop** branch the project's *default branch* so that Pull Requests are always opened against **develop**
> and not **master**.

<br>

### Integration with Travis CI

#### Step 1: Setup repository for Travis CI

First of all, setup **Travis CI** for your GitHub repository by

- connecting your Travis CI account to your GitHub account,
- enabling the GitHub repository for Travis CI,
- and having a `.travis.yml` configuration file set up.

> For further details on how to setup Travis CI, continue reading the official
**[Travis CI - Getting Started](https://docs.travis-ci.com/user/getting-started/)** guide.

#### Step 2: Add environment variables

Within Travis CI, select your GitHub project, go to *More Options / Settings* and make sure the following **Environment Variables** are
defined:

`GH_TOKEN`: This environment variable defines the **GitHub Access Token**, enabling **automatic-release** to push commits and tags to GitHub
as well as create GitHub releases.
> To generate this token, visit your **[GitHub - Personal Access Tokens](https://github.com/settings/tokens)** page, click *Generate new
token*, select (at least) the *repo / public_repo* scope access and finish up by hitting *Generate token*.

`NPM_TOKEN`: This environment variable defines the **NPM Authentication Token**, needed by Travis CI to deploy your library to the public
NPM registry.

> Getting this token is as simple as logging into your NPM account locally and copying the `authToken` from your `.npmrc` file. A detailed
instruction can be found **[right here](http://blog.npmjs.org/post/118393368555/deploying-with-npm-private-modules)**.

`FORCE_COLOR`: This environment variable (forcefully) enables colorful logging output when set to `1`. If the **automatic-release** logging
output is black'n'white only this variable might help.

#### Step 3: Extend Travis CI configuration file

Finally, setup the automated release process by extending the `.travis.yml` configuration file. First, make sure bothh the `master` and
`develop` branches are included in the `branches` block. For example:
``` yml
branches:
  only:
    - master
    - develop
```

Next, add **automatic-release** to the `scripts` block of your `package.json` file to make it available to `npm run` commands:

``` json
{
  "scripts": {
    "automatic-release": "automatic-release"
  }
}
```

Then, define a new Travis CI job for releases containing (at least) the following commands (replace `<...>` with actual data):

``` yml
jobs:
  include:
    - stage: release
      before_install:
        # Clone the whole repository because we also need the develop branch for releasing
        - git clone "https://github.com/$TRAVIS_REPO_SLUG.git" "$TRAVIS_REPO_SLUG";
        - cd "$TRAVIS_REPO_SLUG";
        - git checkout -qf "$TRAVIS_COMMIT";
        #  Fix Travis CI issue of detached heads in git
        - git checkout master
      install:
        # ...
      script:
        # ...
      before_deploy:
        # Login to Git to be able to make commits (required by automatic-release)
        - git config --global user.name "<GITHUB-USER-NAME>"; # REPLACE!
        - git config --global user.email "<GITHUB-USER-EMAIL>"; # REPLACE!
        - git config credential.helper "store --file=.git/credentials";
        - echo "https://$GH_TOKEN:@github.com" > .git/credentials;
        # Run automatic-release
        - npm run automatic-release
      deploy:
        provider: npm
        email: <NPM_USER_EMAIL> # REPLACE!
        api_key: "$NPM_TOKEN"
        skip_cleanup: true
```

> If you plan to publish from a directory other than the root, don't forget to navigate into the folder in the `before_deploy` section.
> Also, you might need to copy the updated `package.json` and `CHANGELOG.md` file into your publish directory after running
> **automatic-release** yet before running the npm deploy.

Finally, use the release job defined above in your stages with the master branch condition:

``` yml
stages:
  - name: release
    if: branch = master
```

<br><br>

## Creator

**Dominique Müller**

- E-Mail: **[dominique.m.mueller@gmail.com](mailto:dominique.m.mueller@gmail.com)**
- Website: **[www.devdom.io](https://www.devdom.io/)**
- Twitter: **[@itsdevdom](https://twitter.com/itsdevdom)**
