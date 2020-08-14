# gitlab-deployer change log

All notable changes to this project will be documented in this file.

Project versioning adheres to [Semantic Versioning](http://semver.org/).
Change log format is based on [Keep a Changelog](http://keepachangelog.com/).

## Next
### Features
- new aliases for pipeline & deploy
- increased pipeline lookout to 1000
- optimized pipeline status check

## 1.0.2 - 2020-05-15
### Features
- init: search for projects is now limited to user membership
### Fixes
- print message on success

## 1.0.1 - 2020-05-07
### Changed
- number of checked pipelines when searching for given ref
- pipelines now return actual status
- overall summery now return actual status
### Fixed
- trigger job api
- yargs help print now detects tty width
- various tty printing errors unfortunately this introduced high CPU usage (Ink library)

## 1.0.0 - 2020-03-22
### Features
- creates new tag across multiple projects
- awaiting completion of matching by git ref pipelines
- triggering manual jobs by projects and stages 
- wizard helpful for creating your first configuration file

