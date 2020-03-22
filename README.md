### GitLab Deployer

Small cli tool helpful in complex deployment processes
capable of handling multiple projects and deployment stages simultaneously.

#### Features:
- creates new tag across multiple projects
- awaiting completion of matching by git ref pipelines
- triggering manual jobs by projects and stages 
- wizard helpful for creating your first configuration file
 
### Usage

1. Download & install [node](https://nodejs.org/en/) 
1. Download newest's [release](https://github.com/akupiec/gitlab-deployer/releases)
1. Create your [gitlab personal api token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#creating-a-personal-access-token)
1. Create environment variable
`
set GIT_ACCESS_TOKEN=<your-api-token>
` 
1. Create the configuration file by fallowing creation wizard at `gitlab-deployer init`

Note: for more information check `gitlab-deployer --help` and `gitlab-deployer <command> --help`
