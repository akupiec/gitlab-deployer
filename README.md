### GitLab Deployer

Small cli tool helpful in complex deployment processes
capable of handling multiple projects and deployment stages simultaneously.

#### Features:
- creates new tag across multiple projects
- awaiting completion of matching by git ref pipelines
- triggering manual jobs by projects and stages 
- wizard helpful for creating your first configuration file
 
Note: for more information check build-in help
```
gitlab-deployer --help 
gitlab-deployer <command> --help
```
 
### Installation (by Node)

1. Download & install [node](https://nodejs.org/en/) 
1. Download newest's [release](https://github.com/akupiec/gitlab-deployer/releases)
1. Create your [gitlab personal api token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html#creating-a-personal-access-token)
1. Create environment variable
`
set GIT_ACCESS_TOKEN=<your-api-token>
` 
1. Create the configuration [example-config.yml](./example-config.yml) using as reference

