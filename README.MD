# Retention

Set the retention of this pipeline or release run.

## Pipelines

Pipeline runs works with retentionleases. The lease is set per run for a number of days but the input for this task is in number of months. After this period the run is deleted.

This also protects the pipeline for being deleted.

## Releases

Releases are retained with a retain indefinitely flag. The release will never be deleted.
When the option 'retainbuilds' is set to true, this also set the retention for the builds. Since builds work with the lease, the leasperiod is set to 30 years.

## YAML Snippet

```yaml
- task: Retention@1
  inputs:
    months: '36'
    retainbuilds: false
   env:
      SYSTEM_ACCESSTOKEN: $(System.AccessToken)
```

## System AccessToken

This task requires to provide the System Access Token. See [Microsoft's System.AccessToken explaination](https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=classic#systemaccesstoken) for more information.

## Arguments

| Name         | Applies to | Default value                     | Description                                                                        |
| ------------ | ---------- | --------------------------------- | ---------------------------------------------------------------------------------- |
| owner        | Pipelines  | $(System.TeamProject) - Retention | Set the owner of the retention lease.                                              |
| months       | Pipelines  | 36 months                         | Set the lease period in number of Months. After this amount, the lease is deleted. |
| retainbuilds | Release    | true                              | When set to true, this also retains the associated builds for 30 years             |
