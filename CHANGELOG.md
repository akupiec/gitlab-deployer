# gitlab-deployer change log

All notable changes to this project will be documented in this file.

Project versioning adheres to [Semantic Versioning](http://semver.org/).
Change log format is based on [Keep a Changelog](http://keepachangelog.com/).


## 1.3.2 - 2021-03-17
### Fixes
- fix merge problem occurring when triggered with targetRef as sha or tag

## 1.3.1 - 2020-11-24
### Fixes
- fix check pipeline with "manual" status

## 1.3.0 - 2020-10-29
### Features
- new command "areEquals"
- new branch release workflow specific command - batarang
- new command "merge"
- better error logging
- small improvements in --help
- extended config
### Braking changes
- require new config format
- positional arg [projects] is moved to option --projects (-p)

## 1.2.0 - 2020-09-07
### Features
- new aliases for job stage
- optional parameter 'project' now accept list of projects separated by comma
- show pipelink if something wasn't finished as expected
- pipe status 'failed' resolve now to ERROR instead WARN

## 1.1.0 - 2020-08-14
### Features
- new aliases for pipeline & deploy
- increased pipeline lookout to 1000
- new command to create branch
### Fixes
- optimized pipeline status check
- dummy await 15s delay for tag check status
- better pipeline searching
- warn when on check pipeline is not success

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

