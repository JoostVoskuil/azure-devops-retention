# Retention

Set the retention of this pipeline or release run.

## Pipelines

Pipeline runs works with retentionleases. The lease is set per run for a number of days but the input for this task is in number of months. After this period the run is deleted.

This also protects the pipeline for being deleted.

## Releases

Releases are retained with a retain indefinitely flag. The release will never be deleted.
When the option 'retainbuilds' is set to true, this also set the retention for the builds to indefinitely.

## YAML Snippet

```yaml
- task: Retention@1
```

## Arguments

| Name         | Applies to | Default value    | Description                                                                                                  |
| ------------ | ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| months       | Pipelines  | 0 (Indefinitely) | Set the lease period in number of Months. After this amount, the lease is deleted. Set to 0 for indefinitely |
| retainbuilds | Release    | true             | When set to true, this also retains the associated builds for indefinitely                                   |

## Permissions for Releases

When you get the following error message running a release pipeline:

'Error: VS402904: Access denied: User <UserId> does not have manage releases permission. Contact your release manager.'

Please set the 'Manage Releases' permission for this (or all release pipelines) for user '<teamproject> Build Service (foxholenl)'  to 'allow'
